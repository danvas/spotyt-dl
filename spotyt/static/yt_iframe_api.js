'use strict';

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var ytplayer;
const [playerWidth, playerHeight] = ['0', '0'];
function onYouTubeIframeAPIReady() {
  ytplayer = new YT.Player("yt-player", {
    width: playerWidth,
    height: playerHeight,
    videoId: '', // 'SD2uoFC7aEQ',
    playerVars: {
      'playsinline': 1,
      'controls': 1, // Hide player controls
      'disablekb': 1, // Disable keyboard controls
      'iv_load_policy': 3, // Hide video annotations
      'origin': 'https://spotyt.nielvas.co', // FIXME: Set this during build.
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onError,
    }
  })
}
// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  const selectedVideoIds = getSelectedVideoIdsState();
  console.log('ytplayer ready.', { selectedVideoIds })
  if (selectedVideoIds.length > 0) {
    ytplayer.cueVideoById(selectedVideoIds[0]);
  }

}

// 5. The API calls this function when the player's state changes.
function onError({ data, target }) {
  // console.warn('ytplayer onError!')
  let errorMsg = "Unknown error";
  if (data === 101 || data === 150) {
    errorMsg = "The owner of the requested video does not allow it to be played in embedded players."
  }
  if (data === 100) {
    errorMsg = "The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private."
  }
  if (data === 2) {
    errorMsg = "The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks."
  }
  if (data === 5) {
    errorMsg = "The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred."
  }
  const videoId = target.getVideoData()?.video_id;
  const trackId = getCurrentTrackIdState();
  const detail = {
    error: data || null,
    message: errorMsg,
    videoId,
    trackId,
  }
  // console.warn({ detail, videoId, target })
  const ytplayerEvent = new CustomEvent(YTPLAYERERROR, { detail });

  window.dispatchEvent(ytplayerEvent);
}

function onPlayerStateChange({ data, target }) {
  const videoData = target.getVideoData();
  if (videoData.title) {
    if (!videoData.isPlayable) {
      console.warn('Video is not playable!', { videoData })
    }

    const duration = target.playerInfo?.duration;
    if (duration) {
      videoData.duration = duration;
    }

    const trackId = getCurrentTrackIdState();
    const detail = {
      videoData,
      buffering: data === YT.PlayerState.BUFFERING,
      playing: data === YT.PlayerState.PLAYING,
      trackId,
    }
    // console.log("onPlayerStateChange! ", { ...detail })
    const playingevent = new CustomEvent(YTPLAYEREVENT, { detail });
    window.dispatchEvent(playingevent);
  }
}

