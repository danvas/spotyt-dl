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
  console.log('ytplayer ready.')
}


// 5. The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  // const player = event.target;
  const playerState = event.target.getPlayerState();
  const state = store.getState()
  const videoData = event.target.getVideoData();
  if (videoData.title && playerState !== YT.PlayerState.BUFFERING) {
    if (!videoData.isPlayable) {
      console.warn('Video is not playable!', { videoData })
    }

    const duration = event.target.playerInfo?.duration;
    if (duration) {
      videoData.duration = duration;
    }

    // console.log('STATE!!!', { ytstate: YT.PlayerState, duration, playerState, player: event.target })
    store.dispatch(setSelectedVideoData(videoData))
  }
  // console.log('yt_iframe_api.js onPlayerStateChange!!', { ytplayer, videoData })
}

function isPlayerPlaying() {
  console.log({ ytplayer })
  try {
    return ytplayer.getPlayerState() === YT.PlayerState.PLAYING;
  } catch (e) {
    console.warn('Error:', e);
    return false;
  }
}


const getPlayerDataWithTimeout = async () => {
  let intervalId;
  const interval = new Promise((resolve, _) => {
    intervalId = setInterval(() => {
      let videoData = ytplayer.getVideoData();
      if (videoData?.title) {
        clearInterval(intervalId);
        if (!videoData.duration) {
          videoData = { ...videoData, duration: ytplayer.playerInfo?.duration || 1 };
        }
        const playing = ytplayer.getPlayerState() === YT.PlayerState.PLAYING
        return resolve({ playing, videoData })
      }
    }, 50);
  })

  const timeout = new Promise((_, reject) => {
    const delay = 3000;
    setTimeout(() => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      return reject(Error(`getPlayerVideoDataWithTimeout timed out after ${delay}ms.`))
    }, delay);
  });

  return Promise.race([interval, timeout])
};
