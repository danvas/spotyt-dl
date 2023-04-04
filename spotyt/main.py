import uvicorn
import os 
import time
from authlib.common.security import generate_token
from authlib.integrations.starlette_client import OAuth, OAuthError
from dotenv import load_dotenv
from pprint import pprint
from pydantic import BaseModel
from typing import List, Optional
from functools import lru_cache
from fastapi import FastAPI, Request, Query, logger
from fastapi.responses import RedirectResponse, HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from spotyt.services import spotify, youtube
from spotyt.services.spotify import TrackKeys
from spotyt.config import Settings, RuntimeMode
from spotyt import auth

load_dotenv()

client_id = os.getenv('SPOTIPY_CLIENT_ID')
client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
redirect_uri = os.getenv('SPOTIPY_REDIRECT_URI')
scope = ["user-read-email", "playlist-read-collaborative", "user-read-currently-playing"]
spotify_client_kwargs = {
        "scope": " ".join(scope),
        "redirect_uri": redirect_uri,
        "code_challenge_method": "S256"
}
oauth = OAuth()
oauth.register(
    name='spotify',
    client_id = client_id,
    client_kwargs = spotify_client_kwargs,
    api_base_url='https://api.spotify.com/v1/',
    access_token_url=auth.SPOTIFY_TOKEN_ENDPOINT,
    authorize_url=auth.SPOTIFY_AUTHORIZE_ENDPOINT,
)

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=auth.generate_random_string(16))


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

@app.get("/viewsession")
async def view_session(request: Request) -> JSONResponse:
    return {"session": request.session}

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
    auth_token = request.session.get("auth_token") # TODO: Get OAuth2Token from oauth.spotify client instead!
    response = await oauth.spotify.get("me/player/currently-playing", token=auth_token)
    try:
        current_song = response.json()
        artist_name = current_song['item']['artists'][0]['name']
        song_name = current_song['item']['name']
    except Exception as e:
        print(e)
        current_song = response.content
        song_name = ""
        artist_name = ""
        return {"error": e}
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
    request.session.update({"code_verifier": code_verifier}) # TODO: Define model for session
    auth_state = await oauth.spotify.create_authorization_url(
        redirect_uri,
        code_verifier=code_verifier
    )

    return RedirectResponse(auth_state["url"])

@app.get("/callback")
async def callback(request: Request, code: str):
    code_verifier = request.session.get("code_verifier")
    if not code_verifier:
        raise Exception("code_verifier not found")
    auth_token = await oauth.spotify.fetch_access_token(
        authorization_response=str(request.url),
        code_verifier=code_verifier,
    )
    request.session.update({"auth_token": auth_token})
    print(f"type(auth_token) = {type(auth_token)}")
    pprint(dir(auth_token))
    # Fetch a protected resource, i.e. user profile
    r = await oauth.spotify.get("me", token=auth_token)
    current_user = r.json()
    request.session.update({"user": current_user})

    return RedirectResponse("/api/current_song")

@app.get('/logout')
async def logout(request):
    request.session.pop("user", None)
    request.session.pop("code_verifier", None)
    request.session.pop("auth_token", None)
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