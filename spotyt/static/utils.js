'use strict';

async function getPlaylist(id) {
  return fetch(`/playlist/${id}`)
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}

function toMinutesAndSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = parseInt(totalSeconds % 60);
  return `${minutes}m${seconds}s`;
}

function getSelectedVideoData() {
  const { playlist } = store.getState();
  const { currentTrackId, tracks } = playlist;
  const selectedTrack = tracks.find((track) => track.id === currentTrackId);
  return selectedTrack.videoData;
}