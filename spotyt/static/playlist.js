'use strict';

const { useEffect, useState, useRef } = React;
const { useDispatch } = ReactRedux;

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


const PlaybackButton = ({ playing, loading, onClick }) => {
  const playpause = playing ? 'pause' : 'play';
  return (
    <button
      onClick={onClick}
      type="button" className="btn btn-danger" disabled={false}>
      {loading ? <Spinner classList={['spinner-border-sm',]} /> : <i className={`bi bi-${playpause}-circle`}></i>}
    </button>
  )
}

function VideoSelector({ id, name, artist, duration, album, progressCallback, currentVideo }) {
  const [loading, setLoading] = useState(false);
  const [videoIds, setVideoIds] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [videos, setVideos] = useState({});
  // TODO: Finish local isPlaying state!
  const [isPlaying, setIsPlaying] = useState(false);
  const dispatch = useDispatch();

  const playerEventHandler = ({ detail }) => {
    const trackId = getTrackStateByIndex(detail.index).id;
    if (trackId === id) {
      setIsPlaying(detail.playing);
    } else {
      setIsPlaying(false);
    }
  }

  useEffect(() => {
    window.addEventListener(YTPLAYEREVENT, playerEventHandler);

    return () => {
      window.removeEventListener(YTPLAYEREVENT, playerEventHandler);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    // TODO: Stop searching when user escapes loading browser
    searchYoutubeVideos(name, artist, duration, album)
      .then(response => response.json())
      .then(data => {
        setVideoIds(data.payload);
        dispatch(setSelectedVideoIdByTrack({ trackId: id, videoId: data.payload[0] }))
        setSelectedVideoId(data.payload[0]);
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
    if (selectedVideoId) {
      dispatch(setSelectedVideoIdByTrack({ trackId: id, videoId: selectedVideoId }))
      if (id === getCurrentTrackIdState()) {
        const selectedVideoIds = getSelectedVideoIdsState()
        const index = getTrackStateIndexById(id);
        ytplayer.loadPlaylist(selectedVideoIds, index);
      }
    }
  }, [selectedVideoId]);

  useEffect(() => {
    setVideos({ ...videos, [currentVideo.video_id]: currentVideo });
    if (currentVideo.video_id in videoIds) {
      setSelectedVideoId(currentVideo.video_id);
    }
  }, [currentVideo.video_id]);

  const onClickPlayback = () => {
    const index = getTrackStateIndexById(id);
    if (id !== getCurrentTrackIdState()) {
      dispatch(setCurrentTrackId(id));
      ytplayer.playVideoAt(index);
    }
    isPlaying ? ytplayer.pauseVideo() : ytplayer.playVideo();
  }

  const onClickVideoItem = (videoId) => {
    dispatch(setCurrentTrackId(id));
    setSelectedVideoId(videoId);
  }

  return (
    <div className="btn-group p-2">
      <PlaybackButton playing={isPlaying} loading={loading} onClick={onClickPlayback} />
      <button
        type="button"
        className="btn btn-outline-primary dropdown-toggle text-truncate"
        data-bs-toggle="dropdown"
      >
        <small>
          {loading ? "Searching..." : videos[selectedVideoId]?.title || selectedVideoId || videoIds[0]}
        </small>
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
              <div key={videoId}>
                <li>
                  <a id={videoId} className="dropdown-item text-wrap" href="#" onClick={() => onClickVideoItem(videoId)}>
                    {title}
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
              </div>
            );
          }
          )
        }
      </ul>
    </div >
  );
}


function TrackCard({ track, progressCallback, onRemoveTrack, currentVideo }) {
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
      {onRemoveTrack && <div className="position-relative">
        <button onClick={onRemoveTrack} type="button" className=" btn-close position-absolute top-0 end-0" aria-label="Close"></button>
      </div>}
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
      <VideoSelector {...track} progressCallback={progressCallback} currentVideo={currentVideo} />
    </div>

  )
}

function Playlist({ playlistId }) {
  const [user, setUser] = useState({});
  const [playlist, setPlaylist] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch()

  const playerEventHandler = ({ detail }) => {
    setPlaying(detail.playing);
    setCurrentIndex(detail.index);
    setCurrentVideo(detail.videoData);
    setIsBuffering(detail.buffering);
  }

  useEffect(() => {
    window.addEventListener(YTPLAYEREVENT, playerEventHandler);

    // cleanup this component
    return () => {
      window.removeEventListener(YTPLAYEREVENT, playerEventHandler);
    };
  }, []);

  useEffect(() => {
    console.log('fetching playlist', playlistId)
    setLoading(true);

    fetchPlaylist(playlistId)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setPlaylist(data.payload);
        setUser(data.payload.owner);
        dispatch(setTracks(data.payload.tracks));
      })
      .catch((error) => {
        console.error(error);
        // TODO: redirect to login page
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const { selectedVideoIds } = getPlaylistState();
    if (selectedVideoIds?.length === 1) {
      console.log('cueing first video!!')
      ytplayer.cuePlaylist(selectedVideoIds);
    }

    if (!!progress && progress === tracks.length) {
      const startPlay = playing;
      console.log('progress complete!')
      ytplayer.cuePlaylist(selectedVideoIds)
      if (startPlay) {
        ytplayer.playVideoAt(currentIndex);
      }
    }
  }, [progress])

  const downloadSelectedTracks = () => {
    const ids = getSelectedVideoIdsState();
    const url = getDownloadUrl({
      playlistName: playlist?.name,
      videoIds: ids,
      extensions: ["m4a"]
    });
    console.log('Downloading in url: ', url)
    window.open(url, '_blank');
  }

  const skipForward = () => {
    ytplayer.nextVideo();

  }

  const skipBackward = () => {
    ytplayer.previousVideo();
  }

  const removeTrack = (id) => {
    const index = getTrackStateIndexById(id);
    const selectedVideoIds = getSelectedVideoIdsState();
    const updatedVideoIds = selectedVideoIds.filter((_, idx) => index !== idx);
    console.log('Removing track!', { updatedVideoIds, playing, index, id, currentVideo })
    dispatch(setSelectedVideoIds(updatedVideoIds));
    const updatedTracks = playlist.tracks.filter((track) => track.id !== id);
    setPlaylist({ ...playlist, tracks: updatedTracks });
    dispatch(setTracks(updatedTracks));
    let idx = updatedVideoIds.indexOf(currentVideo.video_id);
    idx = idx === -1 ? index : idx;
    console.log({ idx, playing })
    if (playing) {
      ytplayer.loadPlaylist(updatedVideoIds, idx);
    } else {
      ytplayer.cuePlaylist(updatedVideoIds, idx);
    }
  }

  const onVideoIdsCount = () => {
    const count = getSelectedVideoIdsState().length;
    setProgress(count);
  }

  const togglePlayback = () => {
    playing ? ytplayer.pauseVideo() : ytplayer.playVideo();
  }

  const tracks = playlist.tracks || [];
  const inProgress = progress === 0 || progress < tracks.length
  let currentVideoTitle = currentVideo.title ? `${currentIndex + 1}. ` : '';
  currentVideoTitle += currentVideo.title || '';
  currentVideoTitle += currentVideo.duration ? ` (${toMinutesAndSeconds(currentVideo.duration)})` : '';
  return (
    <div className="pt-4 container">
      <a className="h4 text-primary text-decoration-none" href={`/playlists/${user.id}`}>{user.display_name}</a>
      {loading ? <Spinner type="grow" label="Loading..." /> : <h1 className="display-5"> {playlist?.name}</h1>}
      <div className="d-flex flex-row">
        <div className="p-2 align-self-center">
          <div className="btn-group" role="group" aria-label="Playback Controller">
            <button type="button" className="btn btn-outline-primary btn-lg" onClick={skipBackward} disabled={!progress || !currentIndex}><i className="bi bi-skip-backward"></i></button>
            <button type="button" className="btn btn-outline-primary btn-lg" onClick={togglePlayback} disabled={!progress || isBuffering}><i className={`bi bi-${playing ? 'pause' : 'play'}-fill`}></i></button>
            <button type="button" className="btn btn-outline-primary btn-lg" onClick={skipForward} disabled={progress < 2 || currentIndex === tracks.length - 1}><i className="bi bi-skip-forward"></i></button>
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
          <button onClick={downloadSelectedTracks} type="button" className={`btn btn-${inProgress ? 'primary' : 'success'} rounded-pill`}>
            {inProgress ?
              <Spinner classList={['spinner-border-sm']} label=" Searching..." />
              :
              <div><i className="bi bi-download"></i><span> Download </span></div>
            }
          </button>
        </div>
      </div>

      <div className="p-2">{currentVideoTitle}</div>

      <div className="d-flex flex-wrap">
        {tracks.map((track) =>
          <TrackCard
            key={track.id}
            onRemoveTrack={!inProgress && (() => removeTrack(track.id))}
            track={track}
            progressCallback={onVideoIdsCount}
            currentVideo={currentVideo}
          />)}
      </div>
    </div>
  )
}
