from dotenv import load_dotenv
from pprint import pprint
from typing import List, Optional
from fastapi import FastAPI, Request, Query
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from jinja2 import Template
import uvicorn
from services import spotify, youtube
from services.spotify import TrackKeys



if __name__ == '__main__':
    files = StaticFiles(directory="spotyt/static", check_dir=True)
    print(files.all_directories)
