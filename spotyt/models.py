from enum import Enum
from pydantic import BaseModel, validator
from typing import Any
from urllib.parse import urlparse


class TrackKeys(str, Enum):
    id = 'id'
    artist = 'artist'
    name = 'name'
    album = 'album'
    album_img_url = 'album_img_url'
    preview_url = 'preview_url'
    duration = 'duration'


class Track(BaseModel):
    id: str
    artist: str
    name: str
    album: str
    album_img_url: str | None = None
    preview_url: str | None = None
    duration: float

    @validator('album_img_url', 'preview_url')
    def url_validator(x):
        try:
            result = urlparse(x)
            return all([result.scheme, result.netloc])
        except:
            return False


class Playlist(BaseModel):
    name: str
    description: str | None = None
    playlist_id: str
    tracks: list[Track]

    @validator('playlist_id')
    def playlist_id_alphanumeric(cls, val):
        assert val.isalnum(), 'must be alphanumeric'
        return val


class VideoFormat(BaseModel):
    abr: float
    acodec: str # 'opus'
    asr: int # 48000
    container: str # 'webm_dash'
    downloader_options: dict
    ext: str # 'webm'
    filesize: int
    format: str # '249 - audio only (tiny)'
    format_id: str # '249'
    format_note: str # 'tiny'
    fps: float # None
    height: int # None
    http_headers: dict
    protocol: str # 'https'
    quality: int
    tbr: float
    url: str
    vcodec: str # 'none'
    width: int


class VideoInfo(BaseModel):
    abr: float # 132.633
    acodec: str # 'mp4a.40.2'
    age_limit: int # 0
    average_rating: str # None
    categories: str # ['People & Blogs']
    channel: str # 'All-in-One Channel'
    channel_id: str # 'UCfIsCCPBTabkVKDIArsv8lg'
    channel_url: str # 'https://www.youtube.com/channel/UCfIsCCPBTabkVKDIArsv8lg'
    description: str # ''
    display_id: str # 'ZBtqfctY-1Y'
    duration: int # 2
    ext: str # 'webm'
    extractor: str # 'youtube'
    extractor_key: str # 'Youtube'
    format: str # '247 - 1280x720 (720p)+140 - audio only (tiny)'
    format_id: str # '247+140'
    formats: str # []
    fps: int # 30
    height: int # 720
    id: str # 'ZBtqfctY-1Y'
    is_live: Any # None
    playlist: str # None
    playlist_index: str # None
    requested_formats: list[VideoFormat]
    requested_subtitles: str # None
    resolution: str # None
    stretched_ratio: str # None
    tags: str # []
    thumbnail: str # 'https://i.ytimg.com/vi_webp/ZBtqfctY-1Y/maxresdefault.webp'
    thumbnails: list[dict]
    title: str # 'Honk | Sound Effects (No Copyright)'
    upload_date: str # '20190413'
    uploader: str # 'All-in-One Channel'
    uploader_id: str # '@AllinOneChannelCompany'
    uploader_url: str # 'http://www.youtube.com/@AllinOneChannelCompany'
    vbr: float # 304.973
    vcodec: str # 'vp9'
    view_count: int # 407241
    webpage_url: str # 'https://www.youtube.com/watch?v=ZBtqfctY-1Y'
    webpage_url_basename: str # 'watch'
    width: int # 1280