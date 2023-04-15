'use strict';

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var ytplayer;
const [playerWidth, playerHeight] = ['360', '360'];
function onYouTubeIframeAPIReady() {
  // const [video] = getSelectedYoutubeVideos();
  // currentTrack = { ...video };
  ytplayer = new YT.Player("yt-player", {
    width: playerWidth,
    height: playerHeight,
    videoId: '', // 'SD2uoFC7aEQ',
    playerVars: {
      'playsinline': 1,
      'controls': 1, // Hide player controls
      'disablekb': 1, // Disable keyboard controls
      'iv_load_policy': 3, // Hide video annotations
      'origin': 'https://spotyt-7eu3w6kloq-wl.a.run.app', // FIXME: Set this during build.
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  })
}
// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  console.log('ytplayer ready.')
}


// 5. The API calls this function when the player's state changes.
function onPlayerStateChange({ data, target }) {
  const videoData = target.getVideoData();
  if (videoData.title && (data !== YT.PlayerState.BUFFERING)) {
    if (!videoData.isPlayable) {
      console.warn('Video is not playable!', { videoData })
    }

    const duration = target.playerInfo?.duration;
    if (duration) {
      videoData.duration = duration;
    }

    const index = target.getPlaylistIndex();
    const { id } = getTrackStateByIndex(index);
    if (id !== getCurrentTrackIdState()) {
      store.dispatch(setCurrentTrackId(id));
    }
    const detail = {
      videoData,
      index,
      buffering: data === YT.PlayerState.BUFFERING,
      playing: data === YT.PlayerState.PLAYING,
    }
    const playingevent = new CustomEvent(YTPLAYEREVENT, { detail });
    window.dispatchEvent(playingevent);
  }
}

