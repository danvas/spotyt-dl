'use strict';

function PlayButton() {
  const [liked, setLiked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const logPlaylist = async () => {
    setLoading(true);
    const playlist = await fetchPlaylist('3vfyDFE0rKWu12ahLW0aiP').catch(err => err);
    console.log({ playlist });
    setLoading(false);
  }

  if (liked) {
    return <h1>You liked this!</h1>;
  }

  const Icon = () => {
    if (loading) {
      return (
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      );
    }
    return <i id="main-playback-icon" className="bi bi-play-circle"></i>;
  }

  return (
    <div
      className="pe-1"
      databstoggle="tooltip"
      databsplacement="top"
      databscustomclass="custom-tooltip"
      databstitle="Playback Youtube audio"
    >
      <span
        className="btn btn-danger yt-playback-button"
        style={{ cursor: "pointer" }}
        onClick={() => logPlaylist()}>
        <Icon />
      </span>
    </div>
  );
}

// const rootNode = document.getElementById('homepage-root');
// const root = ReactDOM.createRoot(rootNode);
// root.render(React.createElement(PlayButton));
