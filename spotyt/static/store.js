const { configureStore, createSlice } = RTK;
const { Provider } = ReactRedux;
const playlistInitialState = { tracks: [], currentTrackId: "", selectedVideoIds: [] };
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
    setSelectedVideoData: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers.
      state.tracks.forEach((track) => {
        if (track.id === state.currentTrackId) {
          track.videoData = action.payload;
        }
      });
    },
    setSelectedVideoIds: (state, action) => {
      const { trackId, videoId } = action.payload;
      const idx = state.tracks.findIndex(({ id }) => id === trackId);
      if (state.selectedVideoIds[idx] !== videoId) {
        state.selectedVideoIds[idx] = videoId;
      }
    },
  }
});

const {
  setSelectedVideoIds,
  setSelectedVideoData,
  setCurrentTrackId,
  setTracks
} = playlistSlice.actions;

const store = configureStore({
  devTools: true,
  reducer: { playlist: playlistSlice.reducer },
});

const playlistRootElement = document.getElementById("playlist-root");
const playlistId = playlistRootElement.dataset?.playlistId;
const root = ReactDOM.createRoot(playlistRootElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Playlist playlistId={playlistId} />
    </Provider>
  </React.StrictMode>
);