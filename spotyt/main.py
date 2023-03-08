from dotenv import load_dotenv
from pprint import pprint
from pydantic import BaseModel
from typing import List, Optional
from fastapi import FastAPI, Request, Query
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
from spotyt.services import spotify, youtube
from spotyt.services.spotify import TrackKeys

import time

load_dotenv()

app = FastAPI()
app.mount(
    "/static",
    StaticFiles(directory="spotyt/static", check_dir=True),
    name="static"
)

templates = Jinja2Templates(directory="spotyt/templates")



ptracks = [{"id":"6k8oac03vALHfrb9tPuOc7","artist":"Silvia Tarozzi Deborah Walker","name":"Pietà l‘è morta"},{"id":"5gJw9DpcnYywIIVGYSb4Y5","artist":"Weyes Blood","name":"God Turn Me Into a Flower"},{"id":"3s3vybdkzM8sHztxIEQcYr","artist":"Mount Eerie","name":"Moon, I Already Know"},{"id":"1yErlfGE8brAL5ZTo7maBU","artist":"Mooreiy","name":"Beloved"},{"id":"3bgH7ay0vCi8pqaFq4H9UY","artist":"Early Fern Joseph Shabason","name":"Softly Brushed By Wind"},{"id":"7uECCWx2tz4T102b2QBS0p","artist":"Yves Tumor","name":"Echolalia"},{"id":"5MEfxTan4X3PmkETXxOG6e","artist":"Maraschino","name":"Angelface"},{"id":"1lUT9ZnrWDVbLdnPyzjYIq","artist":"Fox the Fox","name":"Flirting And Showing"},{"id":"79G1B6sFPHiA1xh4OGWtOz","artist":"Robert Sandrini","name":"Occhi Su Di Me"},{"id":"1Ixa4ZLNWbaMsb6vLnzBKV","artist":"Scribble","name":"Mother of Pearl"},{"id":"7J46lkQn2onLYyg4PtJEJk","artist":"Marlene Ribeiro","name":"You Do It"},{"id":"3mbdc8LQR0tCPdV0d3sruO","artist":"Pablo's Eye","name":"La Pedrera"},{"id":"4dL0IByCuNLmydwMRFokIM","artist":"Discovery Zone","name":"Fall Apart"},{"id":"7hFfYDQIaMlwfMqi6mOCtv","artist":"Clive Stevens & Brainchild","name":"Mystery Man"},{"id":"2gDXrWHc7ovpvAauol3PjZ","artist":"International Music System","name":"Vanity Rap - 116 Bpm"},{"id":"1ihoAOte7bTCUbvWxBR3fk","artist":"The Durutti Column","name":"Spasmic Fairy"}]

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

    # video_ids = youtube.search_videos(playlist_payload['tracks'])
    
    return {
        "payload": result,
        "timeElapsedSeconds": end - start,
    }

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

    kwargs = {"reload": True}
    uvicorn.run("spotyt.main:app", **kwargs)