import html
from typing import List, Optional
from spotyt.auth import oauth
from fastapi import Request
from spotyt.models import Track, Playlist

# TODO: Add async-supported caching
async def fetch_user(id: Optional[str] = None, request: Optional[Request] = None):
    """
    Fetches a user's profile from Spotify.
    Must provide either the user's `id` or a `request` containing a `user_id` path parameter.
    """
    assert id or request, "Calling `fetch_user` requires either user's `id` or `request` containing a `user_id` path parameter."
    user_id = id or request.path_params.get("user_id")
    user = request.session.get("user", {})
    current_user_id = user.get("id")
    if current_user_id != user_id:
        response = await oauth.spotify.get(f"/v1/users/{user_id}", request=request)
        response.raise_for_status()
        user = response.json()

    return user

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

async def get_playlists(request: Request, user_id: str):
    """Get user's playlists.

        user_id: user's spotify ID
    """
    params = {"limit": 50, "offset": 0} # TODO: Add support for pagination
    response = await oauth.spotify.get(
        f"/v1/users/{user_id}/playlists",
        request=request,
        params=params
    )
    response.raise_for_status()
    playlists = response.json()
    playlist_items = [pl for pl in playlists['items'] if pl['owner']['id'] == user_id]
    return playlist_items


def playlist(self, playlist_id, fields=None, market=None, additional_types=("track",)):
    """ Gets playlist by id.

        Parameters:
            - playlist - the id of the playlist
            - fields - which fields to return
            - market - An ISO 3166-1 alpha-2 country code or the
                        string from_token.
            - additional_types - list of item types to return.
                                    valid types are: track and episode
    """
    pass

async def playlist_items(
    request: Request,
    playlist_id,
    fields=None,
    limit=100,
    offset=0,
    market=None,
    additional_types=("track", "episode"),
):
    """ Get full details of the tracks and episodes of a playlist.

        Parameters:
            - playlist_id - the playlist ID, URI or URL
            # TODO: Add support for fields, limit, offset, market, additional_types?
            - fields - which fields to return
            - limit - the maximum number of tracks to return
            - offset - the index of the first track to return
            - market - an ISO 3166-1 alpha-2 country code.
            - additional_types - list of item types to return.
                                    valid types are: track and episode
    """
    response = await oauth.spotify.get(f"/v1/playlists/{playlist_id}/tracks", request=request)
    response.raise_for_status()
    return response.json()

    
async def get_playlist_tracks(request: Request, playlist_id, filter=[]) -> Playlist:
    response = await oauth.spotify.get(f"/v1/playlists/{playlist_id}", request=request)
    response.raise_for_status()
    results = response.json()
    user = results["owner"]
    name = results['name']
    total = int(results['tracks']['total'])
    tracks = build_results(results['tracks']['items'], filter=filter)
    count = len(tracks)
    print(f"Spotify tracks: {count}/{total}")

    while count < total:
        more_tracks = await playlist_items(request, playlist_id) #, offset=count, limit=100)
        tracks += build_results(more_tracks['items'], filter=filter)
        count = count + 100
        print(f"Spotify tracks: {len(tracks)}/{total}")

    return {'owner': user, 'id': playlist_id, 'tracks': tracks, 'name': name, 'description': html.unescape(results['description'])}

