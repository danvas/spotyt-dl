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

function VideoSelector({ id, name, artist, duration, album, progressCallback }) {
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
          // console.log('!!! getPlayerDataWithTimeout', { playing, currentVideoId, videoData })
          setVideos({ ...videos, [videoData.video_id]: videoData })
        }
      })
      .catch((err) => { console.warn({ err }) })
  }

  useEffect(() => {
    setLoading(true);
    searchYoutubeVideos(name, artist, duration, album)
      .then(response => response.json())
      .then(data => {
        setVideoIds(data.payload);
        dispatch(setSelectedVideoIds({ trackId: id, videoId: data.payload[0] }))
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
        progressCallback();
      });
  }, []);

  useEffect(() => {
    const { playlist } = store.getState();
    if (currentVideoId) {
      if (id !== playlist.currentTrackId) {
        dispatch(setCurrentTrackId(id))
      }
      dispatch(setSelectedVideoIds({ trackId: id, videoId: currentVideoId }))
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

  // FIXME: PlaybackButton width should be fixed
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


function TrackCard({ track, progressCallback, onRemoveTrack }) {
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
  // TODO: Finish onRemoveTrack functionality
  return (
    <div className="card" style={{ width: "12rem", margin: "5px" }}>
      {/* <div className="position-relative">
        <button onClick={onRemoveTrack} type="button" className=" btn-close position-absolute top-0 end-0" aria-label="Close"></button>
      </div> */}
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
          <span> {track.name} ({track.duration ? toMinutesAndSeconds(track.duration) : track.duration})</span>
        </p>
      </div>
      <VideoSelector {...track} progressCallback={progressCallback} />
    </div>

  )
}

function Playlist({ playlistId }) {
  const [user, setUser] = useState({});
  const [playlist, setPlaylist] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch()

  useEffect(() => {
    console.log('fetching playlist', playlistId)
    setLoading(true);

    getCurrentUser().then(setUser);

    fetchPlaylist(playlistId)
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
    const state = store.getState();
    console.log('downloading tracks:', state.playlist.selectedVideoIds)
  }

  const skipForward = () => {
    console.log('skip forward')
  }

  const skipBackward = () => {
    console.log('skip backward')
  }

  const removeTrack = (id) => {
    console.log('removing track!', { id, playlist })
    const updatedTracks = playlist.tracks.filter((track) => track.id !== id);
    setPlaylist({ ...playlist, tracks: updatedTracks });
  }

  const toggleVideo = () => {
    const { width, height } = ytplayer.getSize();
    console.log({ width, height, ytplayer, hidden: ytplayer.h.hidden })
    if (width === 0) {
      ytplayer.setSize(640, 360);
      return
    }
    // ytplayer.setSize(0, 0);
    if (ytplayer.h.hidden) {
      ytplayer.h.hidden = false;
    } else {
      ytplayer.h.hidden = true;
    }
  }

  const getSelectedVideoIdsLength = () => {
    const state = store.getState();
    const count = state.playlist.selectedVideoIds.length;
    setProgress(count);
  }

  const tracks = playlist.tracks?.slice(0, 3) || [];
  const inProgress = progress === 0 || progress < tracks.length

  return (
    <div className="pt-4 container">
      <a className="h4 text-primary text-decoration-none" href={`/${user.id}`}>{user.display_name}</a>
      {loading ? <Spinner type="grow" label="Loading..." /> : <h1 className="display-5"> {playlist?.name}</h1>}
      <div className="d-flex flex-row">
        <div className="p-2 align-self-center">
          <div className="btn-group" role="group" aria-label="Playback Controller">
            <button type="button" className="btn btn-outline-primary" disabled={!progress}><i className="bi bi-skip-backward"></i></button>
            <button type="button" className="btn btn-outline-primary" disabled={!progress}><i className="bi bi-play"></i></button>
            <button type="button" onClick={skipForward} className="btn btn-outline-primary" disabled={progress < 2}><i className="bi bi-skip-forward"></i></button>
          </div>
        </div>
        <div className="p-2 align-self-center flex-fill">
          {
            inProgress ?
              <div className="progress" role="progressbar" aria-label="Tracks found" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                <div className="progress-bar" style={{ width: `${progress / tracks.length * 100}%` }}>{progress} of {tracks.length} tracks found</div>
              </div>
              :
              null
          }
        </div>
        <div className="p-2">
          <button onClick={downloadVideos} type="button" className={`btn btn-${inProgress ? 'primary' : 'success'} rounded-pill`}>
            {inProgress ?
              <Spinner classList={['spinner-border-sm']} label=" Searching..." />
              :
              <div><i className="bi bi-download"></i><span> Download </span></div>
            }
          </button>
        </div>
      </div>
      <div className="d-flex flex-wrap">
        {tracks.map((track) =>
          <TrackCard
            key={track.id}
            onRemoveTrack={() => removeTrack(track.id)}
            track={track}
            progressCallback={getSelectedVideoIdsLength}
          />)}
      </div>
    </div>
  )
}
