'use strict';

function fetchPlaylist(id) {
  return fetch(`/api/playlist/${id}`);
}


function searchYoutubeVideos(name, artist, duration, album) {
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