
'use strict';

const { useEffect, useState } = React;

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

const Spinner = ({ label }) => {
  return (
    <>
      <div className="spinner-border spinner-border-sm" role="status" >
        <span className="visually-hidden">Loading...</span>
      </div>
      <span> {label}</span>
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
          <Spinner label='Searching...' /> :
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

const rootNode = document.getElementById('spyt-video-selector');
const root = ReactDOM.createRoot(rootNode);
root.render(React.createElement(VideoSelector));