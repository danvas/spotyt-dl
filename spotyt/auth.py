from authlib.integrations.starlette_client import OAuth, OAuthError
from dotenv import load_dotenv
from pprint import pprint
import logging
import os
import sys

# OAuth endpoints given in the Spotify API documentation
# https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
# https://developer.spotify.com/documentation/general/guides/authorization/scopes/
SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"

load_dotenv()

log = logging.getLogger('authlib')
log.addHandler(logging.StreamHandler(sys.stdout))
log.setLevel(logging.DEBUG)

spotify_client_id = os.getenv('SPOTIFY_CLIENT_ID')
spotify_redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI')
spotify_scope = ["user-read-email", "playlist-read-collaborative", "user-read-currently-playing"]
spotify_client_kwargs = {
        "scope": " ".join(spotify_scope),
        "code_challenge_method": "S256"
}

oauth = OAuth()

oauth.register(
    name='spotify',
    client_id = spotify_client_id,
    redirect_uri=spotify_redirect_uri, # TODO: Does this go in spotify_client_kwargs instead?
    client_kwargs = spotify_client_kwargs,
    api_base_url = 'https://api.spotify.com/v1/',
    access_token_url = SPOTIFY_TOKEN_ENDPOINT,
    authorize_url = SPOTIFY_AUTHORIZE_ENDPOINT,
)
