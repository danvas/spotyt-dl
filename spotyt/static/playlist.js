'use strict';

const { useEffect, useState, useRef } = React;
const { useDispatch } = ReactRedux;

function loadVideoPlayer(videoId) {
  ytplayer.stopVideo();
  ytplayer.clearVideo();
  ytplayer.loadVideoById(videoId); // TODO: Load or cue? Cue won't start video automatically
}

const Spinner = ({ label, type = 'border', classList = [], style = {} }) => {
  let className = `spinner-${type}`;
  classList.forEach((c) => {
    className += ` ${c}`;
  });

  return (
    <>
      <div className={className} role="status" style={style}>
        <span className="visually-hidden">Loading...</span>
      </div>
      {label ? <span> {label}</span> : null}
    </>
  )
}


const PlaybackButton = ({ playing, loading, togglePlayback }) => {
  const playpause = playing ? 'pause' : 'play';
  return (
    <button
      onClick={togglePlayback}
      type="button" className="btn btn-danger" disabled={false}>
      {loading ? <Spinner classList={['spinner-border-sm',]} /> : <i className={`bi bi-${playpause}-circle`}></i>}
    </button>
  )
}

function VideoSelector({ id, name, artist, duration, album }) {
  const [loading, setLoading] = useState(false);
  const [videoIds, setVideoIds] = useState([]);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [videos, setVideos] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const dispatch = useDispatch();

  const updateVideosPlayingState = () => {
    getPlayerDataWithTimeout()
      .then(({ playing, videoData }) => {
        setIsPlaying(playing);
        if (!(videoData.video_id in videos)) {
          // console.log('!!! getPlayerDataWithTimeout', { playing, currentVideoId, data })
          setVideos({ ...videos, [videoData.video_id]: videoData })
        }
      })
      .catch((err) => { console.warn({ err }) })
  }

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams()
    if (duration) {
      params.set('duration', duration)
    }
    if (album) {
      params.set('album', album)
    }
    const url = `/api/search/?${params.toString()}}`
    const body = JSON.stringify({ name, artist })
    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body
    }
    fetch(url, options)
      .then(response => response.json())
      .then(data => {
        setVideoIds(data.payload);
        const { playlist } = store.getState();
        if (currentVideoId === null && id === playlist.currentTrackId) {
          setCurrentVideoId(data.payload[0]);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const { playlist } = store.getState();
    if (currentVideoId) {
      if (id !== playlist.currentTrackId) {
        dispatch(setCurrentTrackId(id))
      }
      loadVideoPlayer(currentVideoId);
      updateVideosPlayingState();
    }
  }, [currentVideoId]);

  const onClickVideoItem = (e) => {
    setCurrentVideoId(e.target.id);
  }

  const toggleVideoPlayback = () => {
    // FIXME: Load new video clicked on different track!
    if (isPlaying) {
      setIsPlaying(false);
      ytplayer.pauseVideo();
    } else {
      ytplayer.playVideo();
      setIsPlaying(true);
    }
  }

  return (
    <div className="btn-group">
      <PlaybackButton playing={isPlaying} loading={loading} togglePlayback={toggleVideoPlayback} />
      <button
        type="button"
        className="btn btn-outline-primary dropdown-toggle"
        data-bs-toggle="dropdown"
      >
        <span className="d-inline-block text-truncate" style={{ maxWidth: "90px" }}>
          {loading ? "Searching..." : videos[currentVideoId]?.title || videoIds[0]}
        </span>
      </button>
      <ul className="dropdown-menu">
        {loading ?
          null
          :
          videoIds.map((videoId) => {
            const videoData = videos[videoId];
            const duration = toMinutesAndSeconds(videoData?.duration || 0)
            const title = videoData ? `${videoData.title} (${duration})` : videoId
            return (
              <li key={videoId}>
                <a id={videoId} className="dropdown-item" href="#" onClick={onClickVideoItem}>
                  {title}
                </a>
              </li>
            );
          }
          )
        }
      </ul>
    </div >
  );
}


function TrackCard({ track }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePreviewTrack = () => {
    const audio = audioRef.current;
    if (audio.paused) {
      audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  const playPause = playing ? 'pause' : 'play';
  return (
    <div className="card" style={{ width: "12rem", margin: "5px" }}>
      <img src={track.album_img_url} className="card-img-top" alt={track.album_img_url} />

      <div className="card-body">
        <h5 className="card-title">{track.artist}</h5>
        <p className="card-text">
          {!track.preview_url ?
            <span><i className="bi bi-dash-circle"></i></span>
            :
            <>
              <audio ref={audioRef} src={track.preview_url ? track.preview_url : null}></audio>
              <span style={{ cursor: "pointer" }} onClick={togglePreviewTrack}>
                <i className={`bi bi-${playPause}-circle`}></i>
              </span>
            </>
          }
          <span> {track.name} ({toMinutesAndSeconds(track.duration)})</span>
        </p>
      </div>
      <VideoSelector {...track} />
    </div>

  )
}

function Playlist({ playlistId }) {
  const [playlist, setPlaylist] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()

  useEffect(() => {
    console.log('fetching playlist', playlistId)
    setLoading(true);

    fetch(`/api/playlist/${playlistId}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setPlaylist(data.payload);
        dispatch(setTracks(data.payload.tracks));
        dispatch(setCurrentTrackId(data.payload.tracks[0].id));
      })
      .catch((error) => { console.error(error) })
      .finally(() => setLoading(false));
  }, []);

  const downloadVideos = () => {
    console.log('downloading tracks', playlist.tracks)
  }

  return (
    <>
      {loading ? <Spinner type="grow" label="Loading..." /> : <h1> {playlist?.name}</h1>}
      <button onClick={downloadVideos} type="button" className="btn btn-primary btn-lg"><span><i
        className="bi bi-download"></i></span></button>
      <div className="d-flex flex-wrap">
        {playlist.tracks?.map((track) =>
          <TrackCard
            key={track.id}
            track={track}
          />)}
      </div>
    </>
  )
}
