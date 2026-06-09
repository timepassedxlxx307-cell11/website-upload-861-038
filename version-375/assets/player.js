function setupMoviePlayer(sourceUrl) {
  var video = document.getElementById("movieVideo");
  var button = document.getElementById("playButton");
  var player = document.getElementById("playerBox");
  var hlsInstance = null;
  var loaded = false;

  if (!video || !sourceUrl) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function hideButton() {
    if (button) {
      button.classList.add("is-hidden");
    }
  }

  function showButton() {
    if (button) {
      button.classList.remove("is-hidden");
    }
  }

  function startPlayback() {
    loadSource();
    hideButton();
    video.controls = true;
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        showButton();
      });
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      startPlayback();
    });
  }

  if (player) {
    player.addEventListener("click", function (event) {
      if (event.target === player) {
        startPlayback();
      }
    });
  }

  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", hideButton);
  video.addEventListener("pause", function () {
    if (video.currentTime === 0) {
      showButton();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
