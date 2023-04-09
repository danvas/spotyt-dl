from authlib.integrations.starlette_client import OAuth
from authlib.oauth2.rfc6749 import OAuth2Token
from fastapi import Request, HTTPException
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

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.DEBUG)

spotify_client_id = os.getenv('SPOTIFY_CLIENT_ID')
spotify_redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI')
spotify_scope = [
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-read-currently-playing"
]
spotify_client_kwargs = {
    "redirect_uri": spotify_redirect_uri,
    "scope": " ".join(spotify_scope),
    "code_challenge_method": "S256"
}

async def fetch_spotify_token(request: Request):
    if not request.session:
        logger.debug(f"No session found in request: query_params={request.query_params} headers={request.headers} state={request.state} url={request.url}")
        raise HTTPException(status_code=511, detail="No session found in request. Log in first.")
    
    auth_token = request.session.get("auth_token")
    if not auth_token:
        raise HTTPException(status_code=500, detail="No authorization token in session.")
    token = OAuth2Token(auth_token)
    return token

oauth = OAuth()

oauth.register(
    name='spotify',
    client_id = spotify_client_id,
    client_kwargs = spotify_client_kwargs,
    authorize_params= {"grant_type": "authorization_code"},
    api_base_url = "https://api.spotify.com/v1/",
    access_token_url = SPOTIFY_TOKEN_ENDPOINT,
    authorize_url = SPOTIFY_AUTHORIZE_ENDPOINT,
    fetch_token=fetch_spotify_token,
)
