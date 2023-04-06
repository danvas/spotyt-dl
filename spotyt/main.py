import uvicorn
import logging
import sys
import time
from authlib.common.security import generate_token
from dotenv import load_dotenv
from pprint import pprint
from pydantic import BaseModel
from typing import List, Optional
from functools import lru_cache
from fastapi import FastAPI, Request, Query
from fastapi.logger import logger
from fastapi.exception_handlers import http_exception_handler
from fastapi.responses import RedirectResponse, HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware
from spotyt.services import spotify, youtube
from spotyt.services.spotify import TrackKeys
from spotyt.config import Settings, RuntimeMode
from spotyt.auth import oauth, spotify_redirect_uri

logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.DEBUG)

load_dotenv()

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=generate_token(16))

@app.exception_handler(StarletteHTTPException)
async def requests_http_exception_handler(request, exc):
    return await http_exception_handler(request, exc)

@lru_cache()
def get_settings():
    return Settings()


app.mount(
    "/static",
    StaticFiles(directory="spotyt/static", check_dir=True),
    name="static"
)

templates = Jinja2Templates(directory="spotyt/templates")

@app.get('/')
async def homepage(request: Request):
    user = request.session.get("user")
    user_id = user.get("id") if user else None
    if user_id:
        html = (
            f'<pre>{user_id}</pre>'
            '<a href="/logout">logout</a>'
        )
        return HTMLResponse(html)
    return HTMLResponse('<a href="/login">login</a>')

@app.get("/api/testing")
async def testing(request: Request):
    from pprint import pprint
    auth_token = request.session.get("auth_token")
    print(type(oauth.spotify))
    pprint(dir(oauth.spotify))
    return {}

@app.get("/viewsession")
async def view_session(request: Request) -> JSONResponse:
    return request.session

@app.get("/api/playlist/{playlist_id}/")
def get_playlist_tracks(
    playlist_id: str,
    fkey: Optional[List[TrackKeys]] = Query(default=None)
):
    """Get a Spotify playlist owned by a Spotify user.
    """
    start = time.time()
    playlist_payload = spotify.get_playlist_tracks(playlist_id, filter=fkey)
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
    response = await oauth.spotify.get("me/player/currently-playing", request=request)
    if response.status_code == 204:
        return {"artist_name": None, "song_name": None}
    
    current_song = response.json()
    artist_name = current_song['item']['artists'][0]['name']
    song_name = current_song['item']['name']

    return {"artist_name": artist_name, "song_name": song_name}

@app.get("/api/me")
async def get_current_user():
    return spotify.get_current_user()

@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    return spotify.get_user(user_id)

@app.get("/playlists/{user_id}", response_class=HTMLResponse)
async def playlists_user(request: Request, user_id: str):
    user_playlists = spotify.get_playlists(user_id)
    context = {
      "request": request,
      "user": user_playlists.get("user"),
      "playlists": user_playlists["playlists"].get('items', []),
    }

    if not context['playlists']:
        return FileResponse("404.html")
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

    return RedirectResponse("/api/current_song")

@app.get('/logout')
async def logout(request: Request):
    try:
        request.session.pop("user", None)
        request.session.pop("auth_token", None)
    except Exception as e:
        print(e)
    return RedirectResponse(url='/')


if __name__ == '__main__':
    settings = get_settings()
    kwargs = {
        "reload": settings.mode == RuntimeMode.development,
        "port": 80,
        "host": "0.0.0.0",
    }
    pprint({"settings": settings, "kwargs": kwargs})
    uvicorn.run("spotyt.main:app", **kwargs)