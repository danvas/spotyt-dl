from dotenv import load_dotenv
from pprint import pprint
from pydantic import BaseModel
from typing import List, Optional
from functools import lru_cache
from fastapi import FastAPI, Request, Query
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
from spotyt.services import spotify, youtube
from spotyt.services.spotify import TrackKeys
from spotyt.config import Settings, RuntimeMode

import time

load_dotenv()

app = FastAPI()

@lru_cache()
def get_settings():
    return Settings()

app.mount(
    "/static",
    StaticFiles(directory="spotyt/static", check_dir=True),
    name="static"
)

templates = Jinja2Templates(directory="spotyt/templates")

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

@app.get("/{user_id}", response_class=HTMLResponse)
async def read_item(request: Request, user_id: str):
    playlists = spotify.get_playlists(user_id)
    context = {
      "request": request,
      "user_id": user_id,
      "playlists": playlists
    }
    return templates.TemplateResponse("user.html", context)

@app.get("/playlist/{playlist_id}", response_class=HTMLResponse)
def download_playlist(request: Request, playlist_id: str):
    context = {
      "request": request,
      "playlistId": playlist_id,
    }

    return templates.TemplateResponse("playlist.html", context)


@app.get("/", response_class=HTMLResponse)
async def read_public_note(request: Request):
    # return FileResponse("./404.html")
    context = {
        "request": request,
        "foobar": "foobar injected!",
        }
    return templates.TemplateResponse("index.html", context)

if __name__ == '__main__':
    settings = get_settings()
    kwargs = {
        "reload": settings.mode == RuntimeMode.development,
        "port": 80,
        "host": "0.0.0.0",
    }
    pprint({"settings": settings, "kwargs": kwargs})
    uvicorn.run("spotyt.main:app", **kwargs)