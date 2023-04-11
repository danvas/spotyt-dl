from __future__ import unicode_literals
import logging
import sys
import youtube_dl
from functools import lru_cache
import zipfile
from io import BytesIO
from fastapi.responses import StreamingResponse
from typing import Any
from urllib.request import urlopen

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.DEBUG)

### TODO: Patch this issue in build: https://github.com/yt-dlp/yt-dlp/issues/6247#issuecomment-1433096554

class DownloadLogger():
    def debug(self, msg):
        pass

    def warning(self, msg):
        pass

    def error(self, msg):
        print(msg)

from pprint import pprint
def display_progress(d):
    if d['status'] == 'downloading':
      try:
        percent = d['downloaded_bytes'] / d['total_bytes'] * 100
        print(f'{int(percent)}%', end=' ', flush=True)
      except:
        pass
    if d['status'] == 'finished':
        print('Done downloading.')


def download_videos(urls):
    ydl_opts = {
        'verbose': True,
        'outtmpl': '%(title)s.%(ext)s',
        'format': 'bestaudio',
        # 'postprocessors': [{
        #     'key': 'FFmpegExtractAudio',
        #     'preferredcodec': 'mp3',
        #     'preferredquality': '192',
        # }],
        'logger': DownloadLogger(),
        'progress_hooks': [display_progress],
    }

    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download(urls)

@lru_cache()
def extract_youtube_info(url):
    ydl = youtube_dl.YoutubeDL()
    info = ydl.extract_info(url, download=False)
    return info


def zip_audio_files(infos: list[Any]) -> BytesIO:
    """
    returns: zip archive
    """
    buffer = BytesIO()

    with zipfile.ZipFile(buffer, 'w') as zip_archive:
        for info in infos:
            format = info["formats"][0]
            url = format["url"]
            fext = format["ext"]
            id = info["id"]
            title = info["title"]
            filename = f"{id}/{title}.{fext}"

            with urlopen(url) as response:
                zipinfo = zipfile.ZipInfo(filename)
                zip_archive.writestr(zipinfo, response.read())

    return buffer

def create_zip_demo():
    """
    returns: zip archive
    """
    url = "https://rr1---sn-0opoxu-28ge.googlevideo.com/videoplayback?expire=1681272031&ei=f9g1ZODVCsnqigTY6pmoBg&ip=189.177.246.89&id=o-AAgWXIPbpi3jyzIulz3Gt60eBlmqyXDqbnlcIdZlARyN&itag=140&source=youtube&requiressl=yes&mh=qn&mm=31%2C29&mn=sn-0opoxu-28ge%2Csn-9gv7lns7&ms=au%2Crdu&mv=m&mvi=1&pl=23&initcwndbps=698750&vprv=1&mime=audio%2Fmp4&ns=aFVagXj1UgrUv1B66xk3u3kM&gir=yes&clen=31948&dur=1.927&lmt=1619693981358147&mt=1681250203&fvip=1&keepalive=yes&fexp=24007246&c=WEB&txp=5311222&n=NKAkLO9VoFvxdj4p6jo&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&sig=AOq0QJ8wRAIgBgONpyiQMheQVHbl68v5Qki_2F-6-eMK4_wKzDNEwP4CIALxUUHmJI-dfNg7PjE5yTQmDGODES3BqWKsNrIVo1Y-&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgNkHkN5a1PKpi9sXB4nEaTJ_HB0uChZWHwbKl8-lxb5oCIQDPDAl6B-tyCa4wLXZAlfUBmuI82RS4qbuVn3cy-2vDiw%3D%3D"
    stream = BytesIO()

    with zipfile.ZipFile(stream, 'w') as zip_archive:
        # Create three files on zip archive
        with zip_archive.open('somefile1.json', 'w') as file1:
            file1.write(b'{"a": 1}')
        
        with zip_archive.open('somefile2.txt', 'w') as file2:
            file2.write(b'this is file 2!')

        with zip_archive.open('nesteddir/somefile3.py', 'w') as file3:
            file3.write(b'import os')
        
        with urlopen(url) as response:
            cont = b'root-config-content...'
            audio_bytes = response.read()
            file3 = zipfile.ZipInfo('somefile4.m4a')
            zip_archive.writestr(file3, audio_bytes)


    return stream


def do_zipfile_example(name):
    zip_io = create_zip_demo()

    return StreamingResponse(
        iter([zip_io.getvalue()]), 
        media_type="application/x-zip-compressed", 
        headers = { "Content-Disposition": f"attachment; filename={name}.zip"}
    )

def extract_audio_info(video_id: str, extensions: list = []):
    info = extract_youtube_info(f"https://www.youtube.com/watch?v={video_id}")
    # Only interested in audio-only formats:
    audio_formats = [f_ for f_ in info["formats"] if "audio only" in f_["format"]]
    available_formats = set([f['ext'] for f in audio_formats])
    
    audio_formats = sorted(audio_formats, key=lambda f_: f_["abr"], reverse=True)
    if extensions:
        if set(extensions).isdisjoint(available_formats):
            msg = (f"Given `extensions` {extensions} unavailable. Extensions available "
                   f"for video '{video_id}': {list(available_formats)}")
            raise ValueError(msg)
        audio_formats = [f_ for f_ in audio_formats if f_["ext"] in extensions]

    info["formats"] = audio_formats
    return info


def extract_audio_infos(video_ids: list[str], extensions: list = []):
    info = lambda v: extract_audio_info(v, extensions=extensions)
    return [info(v) for v in video_ids]


if __name__ == '__main__':
    v = ["_HDrhdCnnsU", "DottejhxlGc", "ZBtqfctY-1Y"]
    info = extract_audio_infos(v[:1], extensions=["m4a"])
