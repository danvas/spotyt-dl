from enum import Enum
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
import functools
from contextlib import contextmanager
import html
from pydantic import BaseModel, validator
from typing import List
from urllib.parse import urlparse

class TrackKeys(str, Enum):
    id = 'id'
    artist = 'artist'
    name = 'name'
    album = 'album'
    album_img_url = 'album_img_url'
    preview_url = 'preview_url'
    duration = 'duration'

class Track(BaseModel):
    id: str
    artist: str
    name: str
    album: str
    album_img_url: str
    preview_url: str
    duration: float

    @validator('album_img_url', 'preview_url')
    def url_validator(x):
        try:
            result = urlparse(x)
            return all([result.scheme, result.netloc])
        except:
            return False

class Playlist(BaseModel):
    name: str
    description: str | None = None
    playlist_id: str
    tracks: List[Track]

    @validator('playlist_id')
    def playlist_id_alphanumeric(cls, val):
        assert val.isalnum(), 'must be alphanumeric'
        return val

@functools.cache # TODO: Check if this is improving performance at all.
def get_spotify_client(scope="user-library-read"):
    return Spotify(auth_manager=SpotifyOAuth(scope=scope))

@contextmanager # TODO: Singleton pattern for client
def spotify_client(scope="user-library-read"):
    yield get_spotify_client(scope)

def build_results(tracks, album=None, filter=[]) -> List[Track]:
    results = []
    for track in tracks:
        if 'track' in track:
            track = track['track']
        if not track or track['duration_ms'] == 0:
            continue
        album_name = album if album else track['album']['name']
        track = {
            'id': track['id'],
            'artist': ' '.join([artist['name'] for artist in track['artists']]),
            'name': track['name'],
            'album': album_name,
            'album_img_url': track['album']['images'][0]['url'],
            'preview_url': track['preview_url'],
            'duration': track['duration_ms']/1000
        }
        if filter:
            track = {k: v for k, v in track.items() if k in filter}

        results.append(track)

    return results

def get_playlist(id):
    with spotify_client() as sp:
        return sp.playlist(id)

def get_playlists(user: str):
    """Get spo
        user: profile information about the current user.
    """
    with spotify_client() as sp:
        user = sp.current_user()
        playlists = sp.current_user_playlists()['items']
        return [pl for pl in playlists if pl['owner']['id'] == user['id']]

def get_playlist_tracks(playlist_id, filter=[]) -> Playlist:
    results = {}
    with spotify_client() as sp:
        sp = get_spotify_client()
        results = sp.playlist(playlist_id)

    name = results['name']
    total = int(results['tracks']['total'])
    tracks = build_results(results['tracks']['items'], filter=filter)
    count = len(tracks)
    print(f"Spotify tracks: {count}/{total}")

    while count < total:
        more_tracks = sp.playlist_items(playlist_id, offset=count, limit=100)
        tracks += build_results(more_tracks['items'], filter=filter)
        count = count + 100
        print(f"Spotify tracks: {len(tracks)}/{total}")

    return {'playlist_id': playlist_id, 'tracks': tracks, 'name': name, 'description': html.unescape(results['description'])}

