(function() {
  function setupPlayer(streamUrl) {
    var video = document.getElementById('moviePlayer');
    var button = document.querySelector('[data-play-button]');
    var loaded = false;
    var hls = null;

    if (!video || !button || !streamUrl) {
      return;
    }

    function loadStream() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function begin() {
      loadStream();
      button.classList.add('is-hidden');
      video.controls = true;
      var playCall = video.play();
      if (playCall && playCall.catch) {
        playCall.catch(function() {});
      }
    }

    button.addEventListener('click', begin);
    video.addEventListener('click', function() {
      if (video.paused) {
        begin();
      }
    });
    video.addEventListener('play', function() {
      button.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.setupPlayer = setupPlayer;
})();
