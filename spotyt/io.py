from __future__ import unicode_literals
import aiohttp
import asyncio
import logging
import sys
import youtube_dl
from datetime import datetime
from functools import lru_cache
import zipfile
from zipfile import ZIP_STORED, ZIP_BZIP2
from io import RawIOBase
from typing import Any, Iterator
from urllib.request import urlopen
from pprint import pprint
from pathlib import Path
from spotyt.models import VideoInfo
from urllib.parse import urlparse, parse_qs

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler(sys.stdout))
logger.setLevel(logging.DEBUG)

### TODO: Patch this issue in build: https://github.com/yt-dlp/yt-dlp/issues/6247#issuecomment-1433096554
class StreamBytesIO(RawIOBase):
    """
    https://replit.com/@IvanErgunov/zipfilegeneratorcompressed#main.py
    """
    def __init__(self):
        self._buffer = b''

    def writable(self):
        return True

    def write(self, b):
        if self.closed:
            raise ValueError('Stream was closed')
        self._buffer += b
        return len(b)

    def get(self):
        chunk = self._buffer
        self._buffer = b''
        return chunk

def get_filename_from_id(url):
    parsed_url = urlparse(url)
    name = parse_qs(parsed_url.query).get("id", ['none'])[0]
    _, ext = parse_qs(parsed_url.query).get("mime", ['audio/mp4'])[0].split("/")

    return f"{name[-9:]}.{ext}"

def get_props(exinfo):
    format = exinfo["formats"][-1]
    return {
        "url": format["url"],
        "ext": format["ext"],
        "video_id": exinfo["id"],
        "title": exinfo["title"],
    }


async def download_exinfo(session, exinfo):
    props = get_props(exinfo)
    url = props["url"]
    vid = props["video_id"]
    title = props["title"]
    try:
        async with session.get(url) as response:
            return props, await response.read()
    except Exception as e:
        print(f"Error: {e} '{title}' (video_id: {vid})")
        return props, None
    
async def generate_zip(stream, exinfos):
    with zipfile.ZipFile(stream, 'w') as zipf:
        async with aiohttp.ClientSession() as session:
    
            tasks = [download_exinfo(session, xnf) for xnf in exinfos]
            responses = await asyncio.gather(*tasks)
            
            for props, data in responses:
                title = props["title"].replace("/", "_")
                # filename = f"{props['video_id']}/{title}.{props['ext']}"
                filename = f"{title}.{props['ext']}"
                if not data:
                    print(f"skipping: {filename}")
                    continue
                print("writing:", filename)
                zipf.writestr(filename, data)

    stream.seek(0)


@lru_cache()
def extract_youtube_info(url):
    ydl = youtube_dl.YoutubeDL()
    ydl.cache.remove()
    info = ydl.extract_info(url, download=False)
    return info


def zip_audio_files(
    exinfos: list[VideoInfo],
    stream: StreamBytesIO,
    filestem: str,
    progress_hook: Any = None,
) -> Iterator[bytes]:
    """Generator of bytes to be streamed as a zip to client.
    """
    with zipfile.ZipFile(stream, mode='w', compression=ZIP_STORED) as zf:
        for (count, exinfo) in enumerate(exinfos, 1):
            format = exinfo["formats"][-1] # TODO: Use format selected by user?
            url = format["url"]
            ext = format["ext"]
            artist = exinfo["id"] # TODO: Inject artist name in info before passing value. Use 'id' for now.
            title = exinfo["title"]
            filename = f"{filestem}/{artist}/{title}.{ext}"
            date_time = tuple(datetime.now().timetuple())[:6]
            z_info = zipfile.ZipInfo(filename, date_time=date_time)
            z_info.compress_type = ZIP_STORED
            size = 0
            CHUNK_SIZE = 1024 * 32
            try:
                with urlopen(url) as response, zf.open(z_info, mode='w') as dest:
                    while chunk := response.read(CHUNK_SIZE):
                        dest.write(chunk)
                        size += len(chunk)
                        if progress_hook:
                            progress_hook({
                                "downloaded_bytes": size,
                                "total_bytes": format["filesize"],
                                "extracted_info": exinfo,
                                "num_files": len(exinfos),
                                "count": count,
                            })
                        yield stream.get()
            except Exception as e:
                logger.error(f"Error while streaming file {filename}: {e}")
                continue
    yield stream.get()


def extract_audio_info(video_id: str, extensions: list = []) -> VideoInfo:
    info = extract_youtube_info(f"https://www.youtube.com/watch?v={video_id}")
    # Interested in audio-only formats:
    audio_formats = [f_ for f_ in info["formats"] if "audio only" in f_["format"]]
    available_formats = set([f['ext'] for f in audio_formats])
    
    if extensions:
        if set(extensions).isdisjoint(available_formats):
            msg = (f"Given `extensions` {extensions} unavailable. Extensions available "
                   f"for video '{video_id}': {list(available_formats)}")
            raise ValueError(msg)
        audio_formats = [f_ for f_ in audio_formats if f_["ext"] in extensions]

    info["formats"] = audio_formats
    return info


def extract_audio_infos(video_ids: list[str], extensions: list[str] = []) -> list[VideoInfo]:
    exinfo = lambda v: extract_audio_info(v, extensions=extensions)
    return [exinfo(v) for v in video_ids]


def demo_zip_audio_files(info, basename):
    format = info["formats"][0]
    filesize = format["filesize"]
    url = format["url"]
    fext = format["ext"]
    id = info["id"]
    title = info["title"]
    filename = f"{basename}/{id}/{title}.{fext}"
    print(f"{filename} ({filesize / 1000000:.2f}MB)")
    basepath = Path("/Users/danvas/Downloads")
    
    stream = StreamBytesIO()
    with open(basepath / "test_compressed.zip", "wb") as f:
        for i in zip_audio_files(url, filename, stream):
            f.write(i)
    stream.close()

def stream_file(url):
    with urlopen(url) as response:
        CHUNK_SIZE = 2048 * 32
        while chunk := response.read(CHUNK_SIZE):
        # while chunk := response.read():
            yield chunk

if __name__ == '__main__':
    v = [
        "_HDrhdCnnsU",
        "DottejhxlGc",
        "ZBtqfctY-1Y", # 3 second video of honking
    ]
    i = 1
    info = extract_audio_infos(v[i:i+1], extensions=["m4a"])[0]
    pprint(info)
    basename = v[i]

    demo_zip_audio_files(info, basename)