'use strict';

function fetchPlaylist(id) {
  return fetch(`/api/playlist/${id}`)
    .then((response) => {
      const data = response.json();
      const error_code = Math.floor(response.status / 100) * 100;
      if ([400, 500].includes(error_code)) {
        throw data;
      }
      return data;
    })
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
  extensions?.forEach(ext => params.append("ext", ext));
  params.append("fname", playlistName);
  return `${window.location.origin}/download?${params.toString()}`;
}

function getDownloadAudioUrl({ fileName, videoId, extensions }) {
  const params = new URLSearchParams();
  extensions?.forEach(ext => params.append("ext", ext));
  if (fileName) {
    params.append("fname", fileName);
  }
  return `${window.location.origin}/download-audio/${videoId}?${params.toString()}`;
}

function getExtractInfos({ videoIds, extensions }) {
  const params = new URLSearchParams();
  videoIds.forEach(vid => params.append("v", vid));
  extensions?.forEach(ext => params.append("ext", ext));
  const url = `/api/extractinfo?${params.toString()}`;
  return fetch(url).then((response) => response.json());
}

function downloadPlaylist({ playlistName, videoIds, extensions }) {
  const downloadUrl = getDownloadUrl({ playlistName, videoIds, extensions });

  fetch(downloadUrl)
    .then((response) => response.blob())
    .then((blob) => {
      // Create blob link to download
      return window.URL.createObjectURL(
        new Blob([blob]),
      );
    });
}


async function fetchObjectUrl(url) {
  const options = { mode: "no-cors", headers: { "Access-Control-Allow-Origin": origin } };
  const blob = await fetch(url, options)
    .then((response) => response.blob());
  const objectUrl = window.URL.createObjectURL(blob);
  console.log({ url, objectUrl, blob })
  return objectUrl;
}


function fetchAudioObjectUrl(downloadUrl, videoData, ref) {
  fetch(downloadUrl, { headers: { "Access-Control-Allow-Origin": origin } })
    .then(response => response.blob())
    .then(blob => {
      console.log({ blob })
      const url = window.URL.createObjectURL(blob);
      ref.current.href = url;
      console.log({ urlblob: ref.current.href })
      const videoData = videos[selectedVideoId];
      const duration = toMinutesAndSeconds(videoData?.duration || 0)
      const title = videoData ? `${videoData.title} (${duration})` : selectedVideoId;
      const fileName = `${title}.m4a`;

      ref.current.download = fileName;
      ref.current.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error({ err });
    });
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