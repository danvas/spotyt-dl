const { configureStore, createSlice } = RTK;
const { Provider } = ReactRedux;
const playlistInitialState = {
  tracks: [],
  currentTrackId: "",
  selectedVideoIds: [],
  videoIds: [],
};

const playlistSlice = createSlice({
  name: 'playlist',
  initialState: playlistInitialState,
  reducers: {
    setTracks: (state, action) => {
      state.tracks = action.payload
    },
    setCurrentTrackId: (state, action) => {
      state.currentTrackId = action.payload
    },
    setSelectedVideoIdByTrack: (state, action) => {
      const { trackId, videoId } = action.payload;
      const idx = state.tracks.findIndex(({ id }) => id === trackId);
      state.selectedVideoIds[idx] = videoId;
    },
    setVideoIdsByTrack: (state, action) => {
      const { trackId, videoIds } = action.payload;
      const idx = state.tracks.findIndex(({ id }) => id === trackId);
      state.videoIds[idx] = videoIds;
    },
    setSelectedVideoIds: (state, action) => {
      state.selectedVideoIds = action.payload;
    },
    removeTrackAndVideoIds: (state, action) => {
      const { trackId } = action.payload;
      const index = state.tracks.findIndex((track) => track.id === trackId);
      state.tracks = state.tracks.filter((track) => track.id !== trackId);
      const hasVideoIds = !!state.selectedVideoIds[index];
      if (hasVideoIds) {
        state.selectedVideoIds = state.selectedVideoIds.splice(index, 1);
        state.videoIds = state.videoIds.splice(index, 1);
      }
    },
  },
});

const {
  setVideoIdsByTrack,
  setSelectedVideoIds,
  setSelectedVideoIdByTrack,
  setCurrentTrackId,
  setTracks,
  removeTrackAndVideoIds,
} = playlistSlice.actions;

const store = configureStore({
  devTools: true,
  reducer: { playlist: playlistSlice.reducer },
});

// Convenience functions
const getPlaylistState = () => store.getState().playlist;
const getTracksState = () => store.getState().playlist?.tracks || [];
const getTrackStateByIndex = (index) => getTracksState()[index] || {};
const getTrackStateIndexById = (trackId) => getTracksState().findIndex((track) => track.id === trackId);
const getCurrentTrackIdState = () => store.getState().playlist?.currentTrackId;
const getSelectedVideoIdsState = () => store.getState().playlist?.selectedVideoIds;
const getSelectedVideoIds = () => store.getState().playlist?.selectedVideoIds.filter((id) => !!id);
const getVideoIdsState = () => store.getState().playlist?.videoIds;
const getVideoIdsByTrack = (trackId) => getVideoIdsState()[getTrackStateIndexById(trackId)]

const playlistRootElement = document.getElementById("playlist-root");
const playlistId = playlistRootElement.dataset?.playlistId;
const root = ReactDOM.createRoot(playlistRootElement);

// FIXME: Make home page the root of the app and handle 5xx errors on client side.
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Playlist playlistId={playlistId} />
    </Provider>
  </React.StrictMode>
);