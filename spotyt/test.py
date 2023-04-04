from dotenv import load_dotenv
from pprint import pprint
from typing import List, Optional
from fastapi import FastAPI, Request, Query
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from jinja2 import Template
import uvicorn
from spotyt.services import spotify, youtube
from spotyt.services.spotify import TrackKeys
from requests_oauthlib import OAuth2Session
import os
from requests.auth import HTTPBasicAuth


load_dotenv()

import random
# Function that generates a random string of specified length
def generate_random_string(length):
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    return "".join(random.choice(chars) for i in range(length))

if __name__ == '__main___':
    # Credentials you get from registering a new application
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

    
    spotify = OAuth2Session(client_id, scope=scope, redirect_uri=redirect_uri)

    # Redirect user to Spotify for authorization
    authorization_url, state = spotify.authorization_url(authorization_base_url)
    print('Please go here and authorize: ', authorization_url)

    # Get the authorization verifier code from the callback url
    redirect_response = input('\n\nPaste the full redirect URL here: ')
    redirect_response = redirect_response.replace('http', 'https')
    

    auth = HTTPBasicAuth(client_id, client_secret)

    # Fetch the access token
    spotify.fetch_token(token_url, auth=auth, authorization_response=redirect_response)

    # print(token)

    # Fetch a protected resource, i.e. user profile
    r = spotify.get('https://api.spotify.com/v1/me')
    print(r.content)
    r = spotify.get('https://api.spotify.com/v1/me/player/currently-playing')
    try:
        pprint(r.json())
    except Exception as e:
        print(e)
        print(r.content)
