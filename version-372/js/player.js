(function() {
  window.initMoviePlayer = function(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var source = config.url;
    var loaded = false;
    var hls = null;

    if (!video || !button || !source) {
      return;
    }

    function bindSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      bindSource();
      button.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function() {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", function() {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function() {
      button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function() {
      button.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
