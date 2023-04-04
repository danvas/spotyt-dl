from authlib.common.security import generate_token
from authlib.integrations.requests_client import OAuth2Session
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

def _spotify_auth_pkce_flow():
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI')
    scope = ["user-read-email", "playlist-read-collaborative", "user-read-currently-playing"]
    
    spotify = OAuth2Session(
        client_id,
        redirect_uri=redirect_uri,
        scope=scope,
        code_challenge_method="S256"
    )

    code_verifier = generate_token(128)
    authorization_url, _ = spotify.create_authorization_url(
        SPOTIFY_AUTHORIZE_ENDPOINT,
        code_verifier=code_verifier
    )

    print('Please go here and authorize: ', authorization_url)
    redirect_response = input('\n\nPaste the full redirect URL here: ')

    token = spotify.fetch_token(
        SPOTIFY_TOKEN_ENDPOINT,
        authorization_response=redirect_response,
        code_verifier=code_verifier,
    )
    pprint(token)

        # Fetch a protected resource, i.e. user profile
    r = spotify.get('https://api.spotify.com/v1/me')
    pprint(r.json())
    r = spotify.get('https://api.spotify.com/v1/me/player/currently-playing')
    try:
        pprint(r.json())
    except Exception as e:
        print(e)
        print(r.content)

if __name__ == "__main__":
    _spotify_auth_pkce_flow()
