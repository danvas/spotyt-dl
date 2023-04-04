from dotenv import load_dotenv
from pprint import pprint
from pydantic import BaseModel
from typing import List, Optional
from functools import lru_cache
from fastapi import FastAPI, Request, Query, logger
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
from spotyt.services import spotify, youtube
from spotyt.services.spotify import TrackKeys
from spotyt.config import Settings, RuntimeMode
from spotyt import auth
from authlib.integrations.requests_client import OAuth2Session
import requests
import time
from fastapi.responses import RedirectResponse
import os 

from starlette.middleware.sessions import SessionMiddleware
# from starlette.requests import Request
# from starlette.responses import JSONResponse

load_dotenv()

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=auth.generate_random_string(16))

client_id = os.getenv('SPOTIPY_CLIENT_ID')
client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
redirect_uri = os.getenv('SPOTIPY_REDIRECT_URI')
pprint({"client_id": client_id, "client_secret": client_secret, "redirect_uri": redirect_uri})
# OAuth endpoints given in the Spotify API documentation
# https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
authorization_base_url = "https://accounts.spotify.com/authorize"
token_url = "https://accounts.spotify.com/api/token"
# https://developer.spotify.com/documentation/general/guides/authorization/scopes/
scope = ["user-read-email", "playlist-read-collaborative", "user-read-currently-playing"]


client_id = os.getenv('SPOTIFY_CLIENT_ID')
redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI')
scope = ["user-read-email", "playlist-read-collaborative", "user-read-currently-playing"]
spotify = OAuth2Session(
    client_id,
    redirect_uri=redirect_uri,
    scope=scope,
    code_challenge_method="S256"
)

@lru_cache()
def get_settings():
    return Settings()


app.mount(
    "/static",
    StaticFiles(directory="spotyt/static", check_dir=True),
    name="static"
)

templates = Jinja2Templates(directory="spotyt/templates")

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



def get_headers(token):
    return {"Authorization": "Bearer " + token}

@app.get("/login")
async def login(request: Request):
    print('login accessed')


    code_verifier = auth.generate_random_string(128)
    request.session.update({"code_verifier": code_verifier})
    authorization_url, state = spotify.create_authorization_url(
        auth.SPOTIFY_AUTHORIZE_ENDPOINT,
        code_verifier=code_verifier
    )
    return RedirectResponse(authorization_url)

# Your redirect URI's path
# http://localhost:3000/callback?code=AQDTZDK66wl...se8A1YTe&state=kt4H....963Nd
@app.get("/callback2")
def callback(code: str):
    # get access token
    resp = requests.post(token_url,
        auth=(client_id, client_secret),
        data={
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri
        })
    access_token = resp.json()['access_token']
    if not access_token:
        return {"error":'No access token available'}
    # get current playing
    headers = get_headers(access_token)
    result1 = requests.get(url='https://api.spotify.com/v1/me/player/currently-playing', headers=headers)
    current_song = result1.json()
    result2 = requests.get(url='https://api.spotify.com/v1/me')
    me = result2.json()
    return {"current_song": current_song, "me": me}

@app.get("/callback")
def callback(request: Request, code: str):
    code_verifier = request.session.get("code_verifier")
    if not code_verifier:
        raise Exception("code_verifier not found")
    print(f"!!! authorization reqponse: {request.url}")
    auth_token = spotify.fetch_token(
        auth.SPOTIFY_TOKEN_ENDPOINT,
        authorization_response=str(request.url),
        code_verifier=code_verifier,
    )
    pprint(auth_token)
    request.session.update({"auth_token": auth_token})
        # Fetch a protected resource, i.e. user profile
    r = spotify.get('https://api.spotify.com/v1/me')
    me = r.json()
    r = spotify.get('https://api.spotify.com/v1/me/player/currently-playing')
    try:
        current_song = r.json()
        artist_name = current_song['item']['artists'][0]['name']
        song_name = current_song['item']['name']
    except Exception as e:
        print(e)
        current_song = r.content
        song_name = ""
        artist_name = ""
    return {"artist_name": artist_name, "song_name": song_name, "me": me}

if __name__ == '__main__':
    settings = get_settings()
    kwargs = {
        "reload": settings.mode == RuntimeMode.development,
        "port": 80,
        "host": "0.0.0.0",
    }
    pprint({"settings": settings, "kwargs": kwargs})
    uvicorn.run("spotyt.main:app", **kwargs)