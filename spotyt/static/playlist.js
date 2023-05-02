'use strict';

const { useEffect, useState, useRef } = React;
const { useDispatch } = ReactRedux;

const arraysEqual = (a, b) => a.length === b.length && a.every((item, index) => item === b[index]);

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

function usePlayerState() {
  const initState = {
    videoData: {},
    buffering: false,
    playing: false,
    trackId: null,
  }
  const [playerState, setPlayerState] = useState(initState);

  useEffect(() => {
    const handleState = ({ detail }) => {
      setPlayerState({ ...detail });
    }

    window.addEventListener(YTPLAYEREVENT, handleState);

    return () => {
      setPlayerState(initState);
      window.removeEventListener(YTPLAYEREVENT, handleState);
    };
  }, []);

  return playerState;
}

function usePlayerError() {
  const initState = {}
  const [playerError, setPlayerError] = useState(initState);
  useEffect(() => {
    function handleError({ detail }) {
      setPlayerError(detail);
    }
    window.addEventListener(YTPLAYERERROR, handleError);

    return () => {
      setPlayerError({});
      window.removeEventListener(YTPLAYERERROR, handleError);
    };
  }, []);
  return playerError;
}


const searchVideoIds = async (trackId) => {
  const index = getTrackStateIndexById(trackId);
  const track = getTracksState()[index];
  const { name, artist, duration, album } = track;
  const data = await searchYoutubeVideos(trackId, name, artist, duration, album)
    .catch((error) => {
      console.error('Error:', error);
    })
  return data.payload;
}

const getVideoIds = async (trackId) => {
  let videoIds = getVideoIdsByTrack(trackId);
  if (videoIds == null) {
    console.log(`Searching videoIds for track ${trackId}`)
    videoIds = await searchVideoIds(trackId);
  }
  return videoIds;
}

function VideoSelector({ id, name, artist }) {
  const [isSearching, setIsSearching] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoIds, setVideoIds] = useState(null); // TODO: Remove this local state and use store state (via useSelector) or fetchVideoIds function defined below
  const [isActiveTrack, setIsActiveTrack] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [title, setTitle] = useState(name);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const playerError = usePlayerError();
  const playerState = usePlayerState();
  const dispatch = useDispatch();
  const [externalVideoIds, setExternalVideoIds] = useState([]);

  const fetchVideoIds = async () => {
    setIsSearching(true);
    const videoIds_ = await getVideoIds(id) || [];
    setIsSearching(false);
    return videoIds_;
  }

  useEffect(() => {
    // Ignore errors that are not 101 or 150.
    const active = playerError.trackId === id;
    setIsActiveTrack(active);
    if (!active) {
      return;
    }

    console.warn({ ...playerError })
    if (playerError.error && [2, 5].includes(playerError.error)) {
      return;
    }

    const handleError = async () => {
      if (YTPLAYERERROR_CODES.includes(playerError.error)) {
        const videoIds_ = await fetchVideoIds();
        setVideoIds(videoIds_);
        if (videoIds_.length === 0) {
          setIsUnavailable(true);
        }
        if (videoIds_?.includes(playerError.videoId)) {
          if (!externalVideoIds.includes(playerError.videoId)) {
            setExternalVideoIds([...externalVideoIds, playerError.videoId]);
          }
        }
        setSelectedVideoId(playerError.videoId);
      }
    };

    handleError();
  }, [playerError]);

  useEffect(() => {
    setIsActiveTrack(playerState.trackId === id);
    if (playerState.trackId === id) {
      fetchVideoIds().then(setVideoIds);
      if (setSelectedVideoId !== playerState.videoData.video_id) {
        setSelectedVideoId(playerState.videoData.video_id);
      }
      setIsPlaying(playerState.playing);
      setIsBuffering(playerState.buffering);
      const seconds = playerState.videoData?.duration;
      const title = playerState.videoData?.title || name;
      const title_duration = seconds ? `${title} (${toMinutesAndSeconds(seconds)})` : title;
      setTitle(title_duration);
    } else {
      setIsPlaying(false);
      setIsBuffering(false);
    }
  }, [playerState]);

  const onClickPlayback = async () => {
    if (isActiveTrack) {
      isPlaying ? ytplayer.pauseVideo() : ytplayer.playVideo();
      return;
    }
    dispatch(setCurrentTrackId(id));
    let videoId = selectedVideoId;
    if (!videoIds) {
      const videoIds_ = await fetchVideoIds(id) || [];
      setVideoIds(videoIds_);
      if (videoIds_.length === 0) {
        setIsUnavailable(true);
        console.error("No videoId found for trackId", id);
        const detail = {
          error: 99,
          message: `No videos found for track ${id}`,
          videoId,
          trackId: id,
        }
        const ytplayerEvent = new CustomEvent(YTPLAYERERROR, { detail });
        window.dispatchEvent(ytplayerEvent);

      } else {
        [videoId] = videoIds_;
        dispatch(setSelectedVideoIdByTrack({ trackId: id, videoId }))
      }
    }
    ytplayer.loadVideoById(videoId);
  }

  useEffect(() => {
    if (!!videoIds) {
      dispatch(setVideoIdsByTrack({ trackId: id, videoIds }));
    }
  }, [videoIds]);

  const onRotateVideoIds = async () => {
    setIsBuffering(true);
    dispatch(setCurrentTrackId(id));
    let videoIds_ = videoIds;
    if (!videoIds_) {
      setIsSearching(true);
      videoIds_ = await getVideoIds(id);
      setIsSearching(false);
      setVideoIds(videoIds_);
    }
    const index = videoIds_.indexOf(selectedVideoId);
    const nextIndex = (index + 1) % videoIds_.length;
    const nextVideoId = videoIds_[nextIndex];
    dispatch(setSelectedVideoIdByTrack({ trackId: id, videoId: nextVideoId }))
    setSelectedVideoId(nextVideoId);
    ytplayer.loadVideoById(nextVideoId);
  }

  const onDownloadTrack = async (e) => {
    const fileName = `${artist} - ${name}` || "";
    const url = getDownloadAudioUrl({
      fileName,
      videoId: selectedVideoId,
      extensions: ["m4a"]
    });

    window.open(url, '_blank');
  }

  const TrackTitle = () => {
    if (isUnavailable) {
      return (
        <span className="text-danger-emphasis bg-danger-subtle border border-danger-subtle rounded p-2">
          ٩◔̯◔۶ Download unavailable
        </span>
      )
    }
    return (
      <span className="">
        {isSearching ? "Searching..." : (isBuffering ? "Loading..." : title)}
      </span>
    )
  }

  const videoIdsNotSet = !getVideoIdsByTrack(id)?.length;
  return (
    <div>
      <div className={`d-flex border rounded-3 align-items-center ${isPlaying ? 'bg-color-playing' : ''}`}>
        {!externalVideoIds.includes(selectedVideoId) &&
          <div className="">
            <button
              onClick={onClickPlayback}
              type="button"
              className="btn btn-danger btn-lg"
              disabled={isSearching}
              hidden={isUnavailable}
            >
              {isSearching || isBuffering ? <Spinner classList={['spinner-border-sm',]} /> : <i className={`bi bi-${isPlaying ? 'pause' : 'play'}-circle`}></i>}
            </button>
          </div>
        }
        <a hidden={isUnavailable || videoIdsNotSet} type="button" className="btn fs-4 text-warning btn-link" onClick={onRotateVideoIds}>
          <i className="bi bi-arrow-repeat"></i>
        </a>
        <div className={`text-truncate ${!isActiveTrack ? 'ps-2' : null} ${isPlaying ? 'bg-color-playing' : null}`}>
          <TrackTitle />
        </div>
        <div className="align-self-center ms-auto ps-2" hidden={false}>
          <button hidden={isUnavailable} disabled={isSearching || videoIdsNotSet} type="button" className="btn btn-success btn-lg" onClick={onDownloadTrack}>
            <i className="bi bi-download"></i>
          </button>
        </div>
      </div >
      {externalVideoIds.includes(selectedVideoId) && <div className="text-left">
        <a className="text-left text-decoration-none text-danger" style={{ fontSize: "0.9em" }}
          href={`https://www.youtube.com/watch?v=${selectedVideoId}`} target="_blank">
          Playback unavailable! Click here to listen on Youtube <i className="bi bi-box-arrow-up-right"></i>
        </a>
      </div>}
    </div>
  );
}


function TrackCard({ track, onRemoveTrack }) {
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
        <div className="vstack gap-3">
          <div className="d-flex flex-row">
            <div className="pe-3">
              <img src={track.album_img_url} style={{ width: "12vh" }} className="" alt={track.album_img_url} />
            </div>

            <div className="">
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
                <span className="ps-1">{track.name} ({track.duration ? toMinutesAndSeconds(track.duration) : track.duration})</span>
              </p>

            </div>

          </div>
          <div className="w-100">
            <VideoSelector {...track} />
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
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({});
  const [currentVideoTitle, setCurrentVideoTitle] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [unavailableTracks, setUnavailableTracks] = useState([]);
  const [downloadAll, setDownloadAll] = useState(false);
  const dispatch = useDispatch()
  const playerState = usePlayerState();
  const playerError = usePlayerError();

  const onChangeSwitch = (event) => {
    setDownloadAll(event.target.checked);
  }

  const updateProgress = () => {
    setProgress(getSelectedVideoIds()?.length || 0);
  }

  useEffect(() => {
    if (playerError.error) {
      setSelectedVideoId(playerState.videoId);
      const index = getTrackStateIndexById(playerError.trackId);
      const { name, artist } = getTrackStateByIndex(index);
      setCurrentVideoTitle(`${artist} - ${name}`);
      setCurrentIndex(index);
      setSelectedVideoId(playerError.videoId);
      if (playerError.error === 99) {
        if (!unavailableTracks.includes(playerError.trackId)) {
          setUnavailableTracks([...unavailableTracks, playerError.trackId]);
        }
      }
    }
  }, [playerError]);

  useEffect(() => {
    setPlaying(playerState.playing);
    setCurrentVideo(playerState.videoData);
    const { title, duration } = playerState.videoData;
    setIsBuffering(playerState.buffering);
    const index = getTrackStateIndexById(playerState.trackId);
    let videoTitle = title || '';
    videoTitle += duration ? ` (${toMinutesAndSeconds(duration)})` : '';
    setCurrentVideoTitle(videoTitle);
    setCurrentIndex(index);
    setSelectedVideoId(playerState.videoData.video_id);
  }, [playerState]);

  useEffect(() => {
    console.log('fetching playlist', playlistId)
    setIsLoading(true);

    fetchPlaylist(playlistId)
      .then((data) => {
        setPlaylist(data.payload);
        setUser(data.payload.owner);
        dispatch(setTracks(data.payload.tracks));
        dispatch(setCurrentTrackId(data.payload.tracks[0].id));
        return data.payload.tracks;
      })
      .then((tracks) => {
        const { id } = tracks[currentIndex];
        setIsSearching(true);
        getVideoIds(id)
          .then((videoIds) => {
            const [videoId] = videoIds;
            dispatch(setVideoIdsByTrack({ trackId: id, videoIds }));
            dispatch(setSelectedVideoIdByTrack({ trackId: id, videoId }))
            setSelectedVideoId(videoId);
            if (videoId) {
              setProgress(progress + 1)
            }
            if (!playerState.videoData?.video_id) {
              ytplayer.cueVideoById(videoId);
            }
          })
      })
      .catch((errorData) => {
        console.log('errorData', { errorData })
        errorData.then(error => {
          console.error('error', error)
          setCurrentError(error);
        })
      })
      .finally(() => {
        setIsLoading(false);
        setIsSearching(false);
        getSelectedVideoIds()
      });
  }, []);

  const getAllVideoIds = async () => {
    const selectedVideoIds = [...getSelectedVideoIdsState()];
    const videoIdPromises = [];
    const tracks = getTracksState();
    let count = progress;
    console.log("getAllVideoIds....")
    tracks.forEach((track, index) => {
      const videoId = selectedVideoIds[index];
      if (videoId != null) {
        videoIdPromises.push(Promise.resolve(videoId));
      } else {
        const { id, name, artist, duration, album } = track;
        videoIdPromises.push(
          searchYoutubeVideos(id, name, artist, duration, album)
            .then((data) => {
              const videoIds = data.payload;
              const [videoId] = videoIds;
              if (videoId) {
                dispatch(setSelectedVideoIdByTrack({ trackId: id, videoId }));
                dispatch(setVideoIdsByTrack({ trackId: id, videoIds }));
                count += 1;
                setProgress(count);
              } else {
                console.warn(`No videos found for '${track?.artist} - ${track?.name}' (ID ${trackId}). Skipping this track in downloads.`);
              }
              return videoId;
            })
        );
      }
    });
    setIsSearching(true);
    setCurrentVideoTitle("");
    const vids = await Promise.all(videoIdPromises);
    setIsSearching(false);
    return vids.filter(id => !!id);
  }

  const downloadTracks = async () => {
    updateProgress();
    let ids = getSelectedVideoIds();
    if (downloadAll) {
      ids = await getAllVideoIds();
    }
    console.log("Downloading...", { videoIds: ids })
    const url = getDownloadUrl({
      playlistName: playlist?.name,
      videoIds: ids,
      extensions: ["m4a"]
    });
    window.open(url, '_blank');
    console.log({ url, playerState });
    const { title } = playerState.videoData?.title || "";
    setCurrentIndex(getTrackStateIndexById(playerState.trackId));
    setCurrentVideoTitle(title);  // FIXME: Setting empty title?
  }

  const skipTrack = async (direction) => {
    // Get the next trackId
    const tracks = getTracksState();
    const nextIndex = (currentIndex + direction) % tracks.length;
    const { id, name, artist } = tracks[nextIndex];
    if (!id) throw new Error('No next track found');
    setCurrentVideoTitle(`${artist} - ${name}`);
    const trackId = id;
    let videoIds;
    let videoId = getSelectedVideoIdsState[nextIndex]
    if (!videoId) {
      setIsSearching(true);
      videoIds = await getVideoIds(trackId);
      setIsSearching(false);
      [videoId] = videoIds;
      dispatch(setVideoIdsByTrack({ trackId, videoIds }))
      dispatch(setSelectedVideoIdByTrack({ trackId, videoId }))
    }
    setCurrentIndex(nextIndex);
    dispatch(setCurrentTrackId(trackId));
    setSelectedVideoId(videoId);
    if (!videoId) {
      console.error("No videoId found for trackId", trackId);
      const detail = {
        error: 99,
        message: `No videos found for track ${trackId}`,
        videoId,
        trackId,
      }
      const ytplayerEvent = new CustomEvent(YTPLAYERERROR, { detail });
      window.dispatchEvent(ytplayerEvent);
      return;
    }
    updateProgress();
    ytplayer.loadVideoById(videoId);
  }

  const skipForward = async () => {
    await skipTrack(1);
  }

  const skipBackward = async () => {
    await skipTrack(-1);
  }

  const removeTrack = async (id) => {
    console.log('Removing track!', { currentTrackId: getCurrentTrackIdState(), id, currentVideo })

    if (getCurrentTrackIdState() === id) {
      ytplayer.pauseVideo();
      await skipTrack(1);
    }
    const updatedTracks = playlist.tracks.filter((track) => track.id !== id);
    setPlaylist({ ...playlist, tracks: updatedTracks });
    dispatch(removeTrackAndVideoIds({ trackId: id }));
    updateProgress();
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
  const PlaybackIcon = () => {
    // console.log({ playerState, playing, isBuffering, isSearching })
    if (isBuffering) {
      return <Spinner classList={["spinner-border-sm"]} />
    }
    if (isSearching) {
      return <Spinner type="grow" classList={["spinner-grow-sm"]} />
    }
    return (
      <i className={`bi bi-${playing ? 'pause' : 'play'}-fill`}></i>
    )
  }
  if (isLoading) {
    return (
      <Spinner type="grow" label="Loading..." />
    )
  }
  const TrackTitle = () => {
    if (isSearching) {
      return <span>Searching <em>{currentVideoTitle}</em>...</span>
    }
    const prefix = progress > 0 ? `${currentIndex + 1}. ` : "";
    return <span>{prefix}{currentVideoTitle}</span>
  }

  return (
    <div>
      <div hidden={!downloadAll || getSelectedVideoIds().length === tracks.length} className="progress rounded-0" role="progressbar" aria-label="Tracks found" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
        <div className={`progress-bar bg-primary ${isSearching ? "progress-bar-striped progress-bar-animated" : null} ps-2 overflow-visible`} style={{ width: `${getSelectedVideoIds().length / tracks.length * 100}%` }}>{getSelectedVideoIds().length} of {tracks.length} tracks ready to download</div>
      </div>
      <div className="pt-4 container">
        <a className="h4 text-primary text-decoration-none" href={`/playlists/${user.id}`}>{user.display_name}</a>
        <h1 className="display-5"> {playlist?.name}</h1>
        <div className="d-flex justify-content-between">
          <div className=" align-self-center">
            <div className="btn-group" role="group" aria-label="Playback Controller">
              <button type="button" className="btn btn-outline-primary btn-lg" onClick={skipBackward} disabled={!currentIndex}><i className="bi bi-skip-backward"></i></button>
              {!isSearching && selectedVideoId && playerError?.videoId === selectedVideoId ?
                <a className="btn btn-outline-primary btn-lg" style={{ fontSize: "1em" }}
                  href={`https://www.youtube.com/watch?v=${playerError.videoId}`} target="_blank">
                  <i className="bi bi-box-arrow-up-right"></i>
                </a>
                :
                <button type="button" className={`btn btn-outline-primary btn-lg${playing ? ' bg-color-playing' : ''}`} onClick={togglePlayback} disabled={isBuffering}><PlaybackIcon /></button>
              }
              <button type="button" className="btn btn-outline-primary btn-lg" onClick={skipForward} disabled={currentIndex === tracks.length - 1}><i className="bi bi-skip-forward"></i></button>
            </div>
          </div>
          <div className="ms-auto">
            <button
              disabled={progress === 0}
              onClick={downloadTracks}
              type="button"
              className={`btn btn-${inProgress ? 'success' : 'primary'} rounded-pill ps-2`}
              style={{ marginTop: "30px" }}
            >
              {isSearching ?
                <span><Spinner type="grow" classList={['spinner-grow-sm',]} /> Searching...</span>
                :
                <span><i className="bi bi-download"></i> Download {downloadAll ? "All " : `${progress} of ${tracks.length}`}</span>
              }
            </button>
            <div hidden={tracks.length === getSelectedVideoIds().length} className="form-check form-switch form-check-reverse form-check-input-checked-success pt-1 ms-2">
              <input onChange={onChangeSwitch} className="form-check-input" type="checkbox" role="switch" id="dlCheckboxSwitch" />
              <label className="form-check-label text-muted" style={{ fontSize: "0.85rem", paddingTop: "3px" }} htmlFor="dlCheckboxSwitch">{downloadAll ? `Entire` : `Partial`} playlist</label>
            </div>

          </div>
        </div>
        <div className={`py-4 lead ${isSearching ? "text-muted" : null}`}>
          <TrackTitle />
          <span className="ps-2">{!isLoading && !isSearching && unavailableTracks.includes(getCurrentTrackIdState()) && <button className="btn btn-outline-danger" type="button" onClick={() => removeTrack(getCurrentTrackIdState())}>٩◔̯◔۶ Unavailable for download! Click to remove <i className="bi bi-x-circle-fill"></i></button>}</span>
        </div>
        <div className="d-flex flex-wrap gap-3">
          {tracks.map((track) =>
            <TrackCard
              key={track.id + track.name}
              onRemoveTrack={() => removeTrack(track.id)}
              track={track}
            />)}
        </div>
      </div>
    </div>
  )
}
