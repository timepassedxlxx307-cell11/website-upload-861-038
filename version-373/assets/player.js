(function () {
  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById('movieVideo');
    var cover = document.getElementById('playCover');
    var hlsInstance = null;

    if (!video || !sourceUrl) {
      return;
    }

    function bindVideo() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== sourceUrl) {
          video.src = sourceUrl;
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60
          });
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
        }
        return;
      }

      if (video.src !== sourceUrl) {
        video.src = sourceUrl;
      }
    }

    function start() {
      bindVideo();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    bindVideo();

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  };
}());
