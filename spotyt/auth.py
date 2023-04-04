"""
def generate_code_challenge(code_verifier):
    code_verifier_bytes = code_verifier.encode("utf-8")
    code_challenge_bytes = hashlib.sha256(code_verifier_bytes).digest()
    code_challenge = base64.urlsafe_b64encode(code_challenge_bytes).decode("utf-8")
    return code_challenge.replace("=", "")

def generate_spotify_authorize_url(
    client_id: str,
    scope: List[str],
    redirect_uri: str,
):
    code_verifier = generate_random_string(128)
    # Store in localStorage
    code_challenge = generate_code_challenge(code_verifier)
    query_params = {
        "response_type": "code",
        "client_id": client_id,
        "scope": " ".join(scope),
        "redirect_uri": redirect_uri,
        "state": code_verifier,
        "code_challenge_method": "S256",
        "code_challenge": code_challenge
    }
    return "https://accounts.spotify.com/authorize?" + urllib.parse.urlencode(query_params)

class SpotifyOAuthSession(OAuth2Session):
    def __init__(self, client_id: str, redirect_uri: str, scope: List[str]):
        super().__init__(
            client_id,
            redirect_uri=redirect_uri,
            scope=scope,
            code_challenge_method="S256"
        )
        self.code_verifier = generate_random_string(128)

    def create_authorization_url(self, SPOTIFY_AUTHORIZE_ENDPOINT):
        authorization_url, state = super().create_authorization_url(
            SPOTIFY_AUTHORIZE_ENDPOINT,
            code_verifier=self.code_verifier
        )
        return authorization_url

    def fetch_token(self, token_endpoint, authorization_response, **kwargs):
        return super().fetch_token(
            token_endpoint,
            authorization_response=authorization_response,
            code_verifier=self.code_verifier,
            **kwargs
        )
"""

from urllib.parse import urlparse
from urllib.parse import parse_qs
import logging
import sys
from authlib.integrations.requests_client import OAuth2Session, OAuth2Auth
from dotenv import load_dotenv
import os
import random
from typing import List

# OAuth endpoints given in the Spotify API documentation
# https://developer.spotify.com/documentation/general/guides/authorization/code-flow/
# https://developer.spotify.com/documentation/general/guides/authorization/scopes/
SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token"

load_dotenv()

log = logging.getLogger('authlib')
log.addHandler(logging.StreamHandler(sys.stdout))
log.setLevel(logging.DEBUG)
code_verifier = None


def generate_random_string(length: int):
    """
    Generate a random string of specified `length`.
    """
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    return "".join(random.choice(chars) for _ in range(length))


def create_authorization_url(client):
    # Redirect user to Spotify for authorization
    global code_verifier
    code_verifier = generate_random_string(128)
    return client.create_authorization_url(
        SPOTIFY_AUTHORIZE_ENDPOINT,
        code_verifier=code_verifier
    )


def parse_query(url, somekey):
    parsed_url = urlparse(url)
    captured_value = parse_qs(parsed_url.query)[somekey][0]
    return captured_value


def try_spotify_auth_pkce_flow(exit_on_authentication=False):
    from pprint import pprint
    client_id = os.getenv('SPOTIFY_CLIENT_ID')
    redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI')
    scope = ["user-read-email", "playlist-read-collaborative", "user-read-currently-playing"]
    spotify = OAuth2Session(
        client_id,
        redirect_uri=redirect_uri,
        scope=scope,
        code_challenge_method="S256"
    )
    authorization_url, state = create_authorization_url(spotify)
    print(f"state        : {state}")
    print(f"code_verifier: {code_verifier}")
    print('Please go here and authorize: ', authorization_url)
    redirect_response = input('\n\nPaste the full redirect URL here: ')
    # redirect_response = redirect_response.replace('http', 'https')
    if exit_on_authentication:
        return


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
    try_spotify_auth_pkce_flow(True)
