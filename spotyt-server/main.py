from dotenv import load_dotenv
from pprint import pprint
from typing import List, Optional
from fastapi import FastAPI, Request, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from utils import spotify, youtube
from utils.spotify import TrackKeys

import time

load_dotenv()

app = FastAPI()

templates = Jinja2Templates(directory="templates")

ptracks = [{"id":"6k8oac03vALHfrb9tPuOc7","artist":"Silvia Tarozzi Deborah Walker","name":"Pietà l‘è morta"},{"id":"5gJw9DpcnYywIIVGYSb4Y5","artist":"Weyes Blood","name":"God Turn Me Into a Flower"},{"id":"3s3vybdkzM8sHztxIEQcYr","artist":"Mount Eerie","name":"Moon, I Already Know"},{"id":"1yErlfGE8brAL5ZTo7maBU","artist":"Mooreiy","name":"Beloved"},{"id":"3bgH7ay0vCi8pqaFq4H9UY","artist":"Early Fern Joseph Shabason","name":"Softly Brushed By Wind"},{"id":"7uECCWx2tz4T102b2QBS0p","artist":"Yves Tumor","name":"Echolalia"},{"id":"5MEfxTan4X3PmkETXxOG6e","artist":"Maraschino","name":"Angelface"},{"id":"1lUT9ZnrWDVbLdnPyzjYIq","artist":"Fox the Fox","name":"Flirting And Showing"},{"id":"79G1B6sFPHiA1xh4OGWtOz","artist":"Robert Sandrini","name":"Occhi Su Di Me"},{"id":"1Ixa4ZLNWbaMsb6vLnzBKV","artist":"Scribble","name":"Mother of Pearl"},{"id":"7J46lkQn2onLYyg4PtJEJk","artist":"Marlene Ribeiro","name":"You Do It"},{"id":"3mbdc8LQR0tCPdV0d3sruO","artist":"Pablo's Eye","name":"La Pedrera"},{"id":"4dL0IByCuNLmydwMRFokIM","artist":"Discovery Zone","name":"Fall Apart"},{"id":"7hFfYDQIaMlwfMqi6mOCtv","artist":"Clive Stevens & Brainchild","name":"Mystery Man"},{"id":"2gDXrWHc7ovpvAauol3PjZ","artist":"International Music System","name":"Vanity Rap - 116 Bpm"},{"id":"1ihoAOte7bTCUbvWxBR3fk","artist":"The Durutti Column","name":"Spasmic Fairy"}]

@app.get("/playlist/{playlist_id}/")
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

@app.get("/search/{playlist_id}/")
async def search_youtube_tracks(playlist_id: str):
    """Get a Spotify playlist owned by a Spotify user.
    """
    playlist_payload = spotify.get_playlist_tracks(playlist_id)
    start = time.time()
    video_ids = await youtube.search_videos(playlist_payload['tracks'])
    end = time.time()
    
    return {
        "payload": video_ids,
        "timeElapsedSeconds": end - start
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

@app.get("/download-playlist/{playlist_id}", response_class=HTMLResponse)
def download_playlist(request: Request, playlist_id: str):
    playlist_items = spotify.get_playlist_tracks(playlist_id)
    start = time.time()
    video_ids = youtube.search_videos(playlist_items['tracks'])
    end = time.time()
    print(f"!!Time taken search_songs: {end - start:.3f} s")
    pprint(video_ids)
    context = {
      "request": request,
      "playlist": playlist_items,
      "video_ids": video_ids,
    }
    return templates.TemplateResponse("playlist.html", context)