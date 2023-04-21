import uvicorn
import json
import logging
import sys
import time
from authlib.common.security import generate_token
from pydantic import BaseModel
from typing import List, Optional
from functools import lru_cache
from fastapi import FastAPI, Request, Query, BackgroundTasks
from fastapi.logger import logger
from fastapi.exception_handlers import http_exception_handler
from fastapi.responses import (
    Response,
    RedirectResponse,
    HTMLResponse,
    JSONResponse, 
    StreamingResponse,
)
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from httpx import HTTPStatusError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware
from spotyt import io as spio
from spotyt.auth import oauth, spotify_redirect_uri
from spotyt.config import Settings, RuntimeMode
from spotyt.services import spotify, youtube
from spotyt.models import TrackKeys

logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.DEBUG)

app = FastAPI()
app.add_middleware(
    SessionMiddleware, 
    secret_key=generate_token(16),
    session_cookie="spotyt_session"
)

app.mount(
    "/static",
    StaticFiles(directory="spotyt/static", check_dir=True),
    name="static"
)

templates = Jinja2Templates(directory="spotyt/templates")

@lru_cache()
def get_settings():
    return Settings()

async def playlists_user_exception_handler(request: Request, context: dict) -> Response | None:
    """Return TemplateResponse for playlists_user route exceptions because we're not
    handling this on client side. Temporary solution until we refactor root renderer.
    FIXME: Remove this handler and handle playlists_user exceptions on client side 
    after refactoring root renderer in store.js.
    """
    user_id = request.path_params.get("user_id")
    if user_id:
        playlists_url = request.url_for("playlists_user", user_id=user_id)
        if request.url == playlists_url:
            context["request"] = request
            return templates.TemplateResponse("error.html", context)

@app.exception_handler(HTTPStatusError)
async def requests_error_handler(request: Request, exc: HTTPStatusError) -> Response:
    logger.debug(f"requests_error_handler: exc={repr(exc)}")
    content = json.loads(exc.response.text).get("error", {})
    content = {
        "status_code": content.get("status", exc.response.status_code),
        "detail": content.get("message", repr(exc)),
        "path_params": request.path_params,
    }
    html_response = await playlists_user_exception_handler(request, content)
    headers = getattr(exc, "headers", None)

    return html_response or JSONResponse(content, status_code=exc.response.status_code, headers=headers)

@app.exception_handler(StarletteHTTPException)
async def requests_exception_handler(request: Request, exc: StarletteHTTPException) -> Response:
    logger.debug(f"requests_exception_handler: exc={repr(exc)}")
    content = {
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path_params": request.path_params,
    }
    html_response = await playlists_user_exception_handler(request, content)
    headers = getattr(exc, "headers", None)

    return html_response or JSONResponse(content, status_code=exc.status_code, headers=headers)

# @app.get('/favicon.ico', include_in_schema=False)
# async def favicon():
#     return FileResponse("favicon.ico")

@app.get('/')
async def homepage(request: Request):
    user = request.session.get("user")
    user_id = user.get("id") if user else None
    if user_id:
        html = (
            f'<pre>{user_id}</pre>'
            f'<div><a href="/playlists/{user_id}">my playlists</a></div>'
            '<a href="/logout">logout</a>'
        )
        return HTMLResponse(html)
    return HTMLResponse('<a href="/login">login</a>')

@app.get("/viewsession")
async def view_session(request: Request) -> JSONResponse:
    return request.session

@app.get("/api/playlist/{playlist_id}")
async def get_playlist_tracks(
    request: Request,
    playlist_id: str,
    fkey: Optional[List[TrackKeys]] = Query(default=None)
):
    """Get a Spotify playlist owned by a Spotify user.
    """
    start = time.time()
    playlist_payload = await spotify.get_playlist_tracks(request, playlist_id, filter=fkey)
    end = time.time()
    num_tracks = len(playlist_payload['tracks'])

    return {
        "payload": playlist_payload,
        "numTracks": num_tracks,
        "filterKeys": fkey,
        "timeElapsedSeconds": end - start,
    }

class SearchFields(BaseModel):
    name: str
    artist: str

@app.get('/html/test')
async def html_test():
    html = (
        f'<pre>useridhere</pre>'
        f'<div><a href="/playlists/useridhere">my playlists</a></div>'
        '<a href="/logout">logout</a>'
    )
    return HTMLResponse(html)

@app.get("/api/test")
async def search_youtube_videos_test():
    """Find YouTube videos for a given track.
    """
    start = time.time()
    result = youtube.search_videos("a flower for all seasons", "Pisces", "A lovely sight", 169.9)
    end = time.time()
    
    return {
        "payload": result,
        "timeElapsedSeconds": end - start,
    }

@app.post("/api/search/")
async def search_youtube_videos(
    fields: SearchFields,
    album: Optional[str] = Query(default=None),
    duration: Optional[float] = Query(default=None),
):
    """Find YouTube videos for a given track.
    """
    start = time.time()
    result = youtube.search_videos(fields.name, fields.artist, album, duration)
    end = time.time()
    
    return {
        "payload": result,
        "timeElapsedSeconds": end - start,
    }

@app.get("/api/current_song")
async def get_current_song(request: Request):
    # TODO: Investigate refreshing token
    response = await oauth.spotify.get("/v1/me/player/currently-playing", request=request)
    if response.status_code == 204:
        return {"artist_name": None, "song_name": None}
    
    current_song = response.json()
    artist_name = current_song['item']['artists'][0]['name']
    song_name = current_song['item']['name']

    return {"artist_name": artist_name, "song_name": song_name}

@app.get("/api/users/{user_id}")
async def get_user(request: Request, user_id: str):
    response = await oauth.spotify.get(f"users/{user_id}", request=request)
    response.raise_for_status()
    return response.json()

@app.get("/playlists/{user_id}", response_class=HTMLResponse)
async def playlists_user(request: Request, user_id: str):
    user = await spotify.fetch_user(request=request)
    playlist_items = await spotify.get_playlists(request, user_id)
    context = {
        "request": request,
        "user_id": user.get("id"),
        "playlists": playlist_items,
    }
    return templates.TemplateResponse("user.html", context)

@app.get("/playlist/{playlist_id}", response_class=HTMLResponse)
def download_playlist(request: Request, playlist_id: str):

    context = {
      "request": request,
      "playlistId": playlist_id,
    }

    return templates.TemplateResponse("playlist.html", context)

@app.get("/login")
async def login(request: Request):
    code_verifier = generate_token(128)
    auth_redirect = await oauth.spotify.authorize_redirect(request, spotify_redirect_uri, code_verifier=code_verifier)
    return auth_redirect

@app.get("/authorize")
async def authorize(request: Request):
    token = await oauth.spotify.authorize_access_token(request)
    request.session.update({"auth_token": token})
    # Fetch a protected resource, i.e. user profile
    r = await oauth.spotify.get("me", token=token)
    r.raise_for_status()
    current_user = r.json()
    request.session.update({"user": current_user})

    return RedirectResponse(f"/playlists/{current_user.get('id')}")

@app.get('/logout')
async def logout(request: Request):
    try:
        request.session.pop("user", None)
        request.session.pop("auth_token", None)
    except Exception as e:
        print(e)
    return RedirectResponse(url='/')

@app.get("/api/yt/info")
async def youtube_info(
    v: list[str] = Query(default=None),
    ext: Optional[list[str]] = Query(default=[])
):
    infos = spio.extract_audio_infos(v, extensions=ext)
    return {"data": infos}


@app.get("/download", response_class=StreamingResponse)
async def youtube_download(
    background_tasks: BackgroundTasks,
    v: list[str] = Query(default=None),
    ext: Optional[list[str]] = Query(default=[]),
    fname: Optional[str] = Query(default="spotyt-download"),
):
    try:
        exinfos = spio.extract_audio_infos(v, extensions=ext)
    except Exception as e:
        print(e)
        # TODO: Investigate dependency injection using Depends 
        # to handle `extensions` validation
        return JSONResponse({"error": str(e)}, status_code=500)

    # TODO: Realtime progress using WebSockets:
    # https://stribny.name/blog/2020/07/real-time-data-streaming-using-fastapi-and-websockets/
    def progress_hook(progress):
        size = progress["downloaded_bytes"]
        total = progress["total_bytes"]
        info = progress["extracted_info"]
        count = progress["count"]
        num_files = progress["num_files"]
        logger.debug(f"'{info.get('id')}' progress ({count}/{num_files}): {size / total * 100:.1f} % ({size / 1000000:.2f}MB)")
    
    stream = spio.StreamBytesIO()
    def on_stream_completed():
        stream.close()
        logger.debug("Download complete.")

    background_tasks.add_task(on_stream_completed)

    fname = fname.encode("unicode-escape").decode("utf-8") # Sanitize unicode
    iter_zip = spio.zip_audio_files(exinfos, stream, fname, progress_hook=None)
    headers = {"Content-Disposition": f"attachment; filename={fname}.zip"}
    return StreamingResponse(
        iter_zip, 
        media_type = "application/x-zip-compressed", 
        headers = headers
    )


if __name__ == '__main__':
    settings = get_settings()
    kwargs = {
        "reload": settings.mode == RuntimeMode.development,
        "port": settings.port,
        "host": settings.host,
    }
    print(kwargs)
    uvicorn.run("spotyt.main:app", **kwargs)