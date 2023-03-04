'use strict';

async function getPlaylist(id) {
  console.log("getlist!!")
  return fetch(`/playlist/${id}`)
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}