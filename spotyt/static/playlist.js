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


const PlaybackButton = ({ playing, loading, onClick, hidden }) => {
  const playpause = playing ? 'pause' : 'play';
  return (
    <button
      onClick={onClick}
      type="button"
      className="btn btn-danger"
      hidden={hidden}
      disabled={loading}
    >
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
        if (!data.payload.length) {
          console.log({ name, artist, datapayload: data.payload })
        }
        const videoId = data.payload[0];
        dispatch(setSelectedVideoIdByTrack({ trackId: id, videoId }))
        setSelectedVideoId(videoId);
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

  const onDownloadTrack = async (e) => {
    const fileName = videos[selectedVideoId]?.title || "";
    const url = getDownloadAudioUrl({
      fileName,
      videoId: selectedVideoId,
      extensions: ["m4a"]
    });

    window.open(url, '_blank');
  }

  const DropdownItems = () => {
    if (loading) { return; }
    if (videoIds.length === 0) {
      return (
        <small className="text-danger-emphasis bg-danger-subtle border border-danger-subtle p-2 rounded">
          ٩◔̯◔۶ Download unavailable
        </small>
      )
    }

    return (
      <ul className="dropdown-menu">
        {videoIds.map((videoId) => {
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
        })}
      </ul>
    )
  }

  return (
    <div className="d-flex">
      <div className="btn-group w-100">
        <PlaybackButton playing={isPlaying} loading={loading} hidden={!loading && videoIds.length === 0} onClick={onClickPlayback} />

        <button
          type="button"
          className="btn btn-outline-primary dropdown-toggle text-truncate"
          data-bs-toggle="dropdown"
          hidden={!loading && videoIds.length === 0}
          disabled={loading}
        >
          <small>
            {loading ? "Searching..." : videos[selectedVideoId]?.title || selectedVideoId}
          </small>
        </button>

        <DropdownItems />
      </div >
      <div className="align-self-center ps-2" hidden={videoIds.length === 0}>
        <button disabled={loading || videoIds === 0} type="button" className="btn btn-success" onClick={onDownloadTrack}>
          <i className="bi bi-download"></i>
        </button>
      </div>
    </div>
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
  return (
    <div className="card w-100 position-relative">
      <div className="position-absolute top-0 start-100 translate-middle">
        <button type="button" className="btn btn-link" onClick={onRemoveTrack} disabled={!onRemoveTrack}><i className="bi bi-x-circle-fill fs-4 text-secondary"></i></button>
      </div>
      <div className="card-body">
        <div className="d-flex flex-row">
          <div className="pe-2">
            <img src={track.album_img_url} style={{ width: "6vh" }} className="" alt={track.album_img_url} />
          </div>

          <div className="flex-grow-1">
            <div className="card-title h5">
              {track.artist}
            </div>
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
              <span className="ps-2">{track.name} ({track.duration ? toMinutesAndSeconds(track.duration) : track.duration})</span>
            </p>

          </div>
          <div className="pe-2 align-self-center">
            <VideoSelector {...track} progressCallback={progressCallback} currentVideo={currentVideo} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Playlist({ playlistId }) {
  const [user, setUser] = useState({});
  const [playlist, setPlaylist] = useState({});
  const [currentError, setCurrentError] = useState(null);
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
      .then((data) => {
        setPlaylist(data.payload);
        setUser(data.payload.owner);
        dispatch(setTracks(data.payload.tracks));
      })
      .catch((errorData) => {
        errorData.then(setCurrentError)
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
    console.log('Downloading: ', ids)
    const url = getDownloadUrl({
      playlistName: playlist?.name,
      videoIds: ids,
      extensions: ["m4a"]
    });
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

  if (currentError) {
    console.error("Error thrown:", { ...currentError })
    let actionEl = <span> <a href="/">Home</a></span>
    if (currentError.code === 511) {
      actionEl = (
        <p><span><a href="/login">Log in</a> to view this playlist.</span></p>
      )
    } else {
      actionEl = (
        <p>
          Oops! {currentError.detail}: {JSON.stringify(currentError.path_params)}
          <br />
          <a href="/">Home</a>
        </p>
      )
    }
    return (
      <div className="pt-4 container">
        <p className="display-6">{currentError.message}</p>
        {actionEl}
      </div>
    )
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
              <div><i className="bi bi-download"></i><span> Download All</span></div>
            }
          </button>
        </div>
      </div>

      <div className="p-2">{currentVideoTitle}</div>

      <div className="d-flex flex-wrap gap-3">
        {tracks.map((track) =>
          <TrackCard
            key={track.id}
            onRemoveTrack={inProgress ? null : () => removeTrack(track.id)}
            track={track}
            progressCallback={onVideoIdsCount}
            currentVideo={currentVideo}
          />)}
      </div>
    </div>
  )
}
