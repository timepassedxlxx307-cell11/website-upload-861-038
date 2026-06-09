(function () {
  function getElements() {
    return {
      video: document.querySelector('.movie-video'),
      cover: document.querySelector('.player-cover')
    };
  }

  function attach(video, source) {
    if (video.dataset.ready === '1') {
      return;
    }
    video.dataset.ready = '1';
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = source;
  }

  window.initMoviePlayer = function (source) {
    var elements = getElements();
    var video = elements.video;
    var cover = elements.cover;
    if (!video || !cover || !source) {
      return;
    }

    function start() {
      attach(video, source);
      cover.classList.add('is-hidden');
      var playing = video.play();
      if (playing && typeof playing.catch === 'function') {
        playing.catch(function () {
          cover.classList.remove('is-hidden');
        });
      }
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
  };
})();
