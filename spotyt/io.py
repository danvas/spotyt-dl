from __future__ import unicode_literals
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
    """
        File "/Users/danvas/Dev/spotyt-dl/.venv/lib/python3.10/site-packages/starlette/responses.py", line 73, in init_headers
        raw_headers = [
        File "/Users/danvas/Dev/spotyt-dl/.venv/lib/python3.10/site-packages/starlette/responses.py", line 74, in <listcomp>
            (k.lower().encode("latin-1"), v.encode("latin-1"))
        UnicodeEncodeError: 'latin-1' codec can't encode character '\u2728' in position 21: ordinal not in range(256)
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
        for i in zip_audio_files(url, filename, stream, compression=ZIP_BZIP2):
            f.write(i)
    stream.close()


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