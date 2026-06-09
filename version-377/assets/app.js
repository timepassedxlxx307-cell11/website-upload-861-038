(function () {
  var header = document.querySelector('[data-header]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function setupLocalFilter() {
    var input = document.querySelector('[data-local-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-filter-empty]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    if (!cards.length || (!input && !selects.length)) {
      return;
    }
    function match(card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
      var keyword = input ? input.value.trim().toLowerCase() : '';
      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      for (var i = 0; i < selects.length; i += 1) {
        var value = selects[i].value;
        if (!value) {
          continue;
        }
        if (selects[i].getAttribute('data-filter-select') === 'year' && (card.getAttribute('data-year') || '') !== value) {
          return false;
        }
        if (selects[i].getAttribute('data-filter-select') === 'kind') {
          var genre = (card.getAttribute('data-genre') || '') + ' ' + (card.getAttribute('data-tags') || '') + ' ' + (card.getAttribute('data-title') || '');
          if (genre.indexOf(value) === -1 && text.indexOf(value.toLowerCase()) === -1) {
            return false;
          }
        }
      }
      return true;
    }
    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.classList.toggle('is-filter-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
  }

  function setupPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-layer');
      if (!video) {
        return;
      }
      var src = video.getAttribute('data-src');
      var started = false;
      var hlsInstance = null;
      function start() {
        if (!src) {
          return;
        }
        if (button) {
          button.classList.add('is-hidden');
        }
        if (!started) {
          started = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.play().catch(function () {});
            return;
          }
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            return;
          }
          video.src = src;
        }
        video.play().catch(function () {});
      }
      if (button) {
        button.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var form = document.querySelector('[data-search-form]');
    if (!results || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var input = form ? form.querySelector('input[name="q"]') : null;
    if (input) {
      input.value = initialQuery;
    }
    function card(item) {
      return [
        '<article class="movie-card" data-movie-card>',
        '<a class="poster-link" href="' + escapeHtml(item.url) + '">',
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="poster-play">▶</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<div class="movie-meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
        '<p>' + escapeHtml(item.line) + '</p>',
        '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>',
        '<div class="card-foot"><span>评分 ' + escapeHtml(item.rating) + '</span><span>' + escapeHtml(item.duration) + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }
    function run(query) {
      var q = String(query || '').trim().toLowerCase();
      if (!q) {
        if (title) {
          title.textContent = '推荐影片';
        }
        return;
      }
      var list = window.SEARCH_DATA.filter(function (item) {
        return item.search.indexOf(q) !== -1;
      }).slice(0, 96);
      if (title) {
        title.textContent = list.length ? '匹配影片' : '暂无匹配影片';
      }
      results.innerHTML = list.length ? list.map(card).join('') : '<p class="filter-empty">暂无匹配影片</p>';
    }
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value : '';
        var url = new URL(window.location.href);
        if (query.trim()) {
          url.searchParams.set('q', query.trim());
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url.toString());
        run(query);
      });
    }
    run(initialQuery);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupLocalFilter();
    setupPlayer();
    setupSearchPage();
  });
})();
