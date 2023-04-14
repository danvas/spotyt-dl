'use strict';

function fetchPlaylist(id) {
  return fetch(`/api/playlist/${id}`);
}

function getCurrentUser() {
  return fetch("/api/me")
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}


function getDownloadUrl({ playlistName, videoIds, extensions }) {
  const params = new URLSearchParams();
  videoIds.forEach(vid => params.append("v", vid));
  extensions.forEach(ext => params.append("ext", ext));
  params.append("fname", playlistName);
  return `${window.location.origin}/download?${params.toString()}`;
}


function searchYoutubeVideos(name, artist, duration, album) {
  // TODO: Stop searching when user escapes loading browser
  const params = new URLSearchParams()
  if (duration) {
    params.set('duration', duration)
  }
  if (album) {
    params.set('album', album)
  }
  const url = `/api/search/?${params.toString()}}`
  const body = JSON.stringify({ name, artist })
  const options = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body
  }
  return fetch(url, options)
}