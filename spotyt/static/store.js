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
      if (state.selectedVideoIds[idx] !== videoId) {
        state.selectedVideoIds[idx] = videoId;
      }
    },
    setVideoIdsByTrack: (state, action) => {
      const { trackId, videoIds } = action.payload;
      const idx = state.tracks.findIndex(({ id }) => id === trackId);
      state.videoIds[idx] = videoIds;
    },
    setSelectedVideoIds: (state, action) => {
      state.selectedVideoIds = action.payload;
    },
  }
});

const {
  setVideoIdsByTrack,
  setSelectedVideoIds,
  setSelectedVideoIdByTrack,
  setCurrentTrackId,
  setTracks
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