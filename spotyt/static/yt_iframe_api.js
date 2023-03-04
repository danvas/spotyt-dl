'use strict';

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var ytplayer;
function onYouTubeIframeAPIReady() {
  // const [video] = getSelectedYoutubeVideos();
  // currentTrack = { ...video };
  ytplayer = new YT.Player("yt-player", {
    width: '100%',
    height: '500',
    videoId: '', // 'SD2uoFC7aEQ',
    playerVars: {
      'playsinline': 1,
      'controls': 0, // Hide player controls
      'disablekb': 1, // Disable keyboard controls
      'iv_load_policy': 3, // Hide video annotations
      'origin': 'http://127.0.0.1:8000',
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  })
}
// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  console.log('js onPlayerReady!!')
}

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
// const [video] = getSelectedYoutubeVideos();
// currentTrack = { ...video };

// 5. The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  // const player = event.target;
  const videoData = ytplayer.getVideoData();
  const [selectedVideo] = getSelectedYoutubeVideos()
    .filter(v => v.video_id === videoData.video_id);

  if (!selectedVideo) {
    currentTrack = null;
    return;
  }

  const stopped = isStopped(ytplayer);
  setVideoPlaybackIcon(selectedVideo.track_id, stopped)

  // Update playback icon of former track and update `currentTrack`
  if (currentTrack && (currentTrack?.track_id !== selectedVideo.track_id)) {
    setVideoPlaybackIcon(currentTrack?.track_id, true);
  }
  currentTrack = { ...selectedVideo };

  // Update video_item's text
  const id = toYtVideoItemId(currentTrack.track_id, currentTrack.video_id);
  const videoItemEl = document.getElementById(id);
  const text = videoItemEl.innerText.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
  const doUpdate = (videoData.title.length > 0) && (text !== videoData.title);
  if (doUpdate) {
    const duration = ytplayer.getDuration();
    const durationText = toMinutesAndSeconds(duration);
    videoItemEl.innerText = `${videoData.title} (${durationText})`;
  }
}