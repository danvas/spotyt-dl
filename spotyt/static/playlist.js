'use strict';

const { useEffect, useState, useRef } = React;
const VIDEO_IDS = [
  '-komkjack6c',
  'EpIu4-mSdjc',
  'GhCOqj4Pyb8',
  'MuNMsfFkI_M',
  'SD2uoFC7aEQ',
  'dUZvBkxTrnk',
  'VHexTTOdpXE']

function loadVideoPlayer(videoId) {
  console.log("loadVideoPlayer JS!!", { videoId })
  // loadingVideo = { trackId, videoId };
  ytplayer.stopVideo();
  ytplayer.clearVideo();
  ytplayer.loadVideoById(videoId); // TODO: Load or cue? Cue won't start video automatically
}

const Spinner = ({ label, classList = [], style = {} }) => {
  let className = 'spinner-border';
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


const PlaybackButton = (props) => {
  const [playing, setPlaying] = useState(false);

  console.log("PlaybackButton.props=", { ...props })
  useEffect(() => {
    console.log("useEffect!!", { ...props })
  }, [props.playing]);

  const playpause = playing ? 'pause' : 'play';
  return (
    <button type="button" className="btn btn-danger" disabled={false}>
      <i className={`bi bi-${playpause}-circle`}></i>
    </button>
  )
}

function VideoSelector(props) {
  console.log("VideoSelector!!", { ...props })
  const [loading, setLoading] = useState(false);
  const [video_ids, setVideoIds] = useState(VIDEO_IDS);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(VIDEO_IDS[0]);
  const [selectAria, setSelectAria] = useState(false);

  useEffect(() => {
    console.log("VideoSelector.useEffect!!", { ...props })
  }, [props.playing]);

  const onClickVideoItem = (e) => {
    console.log({ e: e.target.id });
    setCurrentVideo(e.target.id);
    loadVideoPlayer(e.target.id);
  }

  return (
    <div className="btn-group">
      <PlaybackButton playing={false} loading={loading} />
      <button
        type="button"
        className="btn btn-outline-primary dropdown-toggle"
        data-bs-toggle="dropdown"
      >
        {loading ?
          <Spinner classList={['spinner-border-sm',]} label='Searching...' /> :
          <span className="d-inline-block text-truncate" style={{ maxWidth: "90px" }}>
            {currentVideo || ''}
          </span>
        }
      </button>
      <ul className="dropdown-menu">
        {loading ?
          null
          :
          video_ids.map((video_id) => {
            return (
              <li key={video_id}>
                <a id={video_id} className="dropdown-item" href="#" onClick={onClickVideoItem}>
                  {video_id}
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
          <span> {track.name}</span>
        </p>
      </div>
      <VideoSelector />
    </div>

  )
}

function Playlist({ playlistId }) {
  const [playlist, setPlaylist] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('fetching playlist', playlistId)
    setLoading(true);

    fetch(`/api/playlist/${playlistId}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setPlaylist(data.payload);
      })
      .catch((error) => { console.error(error) })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {loading ? <Spinner label="Loading..." /> : <h1> {playlist?.name}</h1>}
      <button onClick={downloadTracks} type="button" className="btn btn-primary btn-lg"><span><i
        className="bi bi-download"></i></span></button>
      <div className="d-flex flex-wrap">
        {playlist.tracks?.map((track) => <TrackCard key={track.id} track={track} />)}
      </div>
    </>
  )
}

const plContainer = document.getElementById('spyt-playlist');
const playlistId = plContainer.dataset?.playlistId;
const plRoot = ReactDOM.createRoot(plContainer);
plRoot.render(React.createElement(Playlist, { playlistId }));