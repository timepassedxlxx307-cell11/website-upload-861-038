(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function start() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });
      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }
      show(0);
      start();
    }

    var panel = document.querySelector('[data-search-panel]');
    var results = document.querySelector('[data-search-results]');
    if (panel && results) {
      var input = panel.querySelector('[data-search-input]');
      var type = panel.querySelector('[data-type-filter]');
      var year = panel.querySelector('[data-year-filter]');
      var cards = Array.prototype.slice.call(results.querySelectorAll('.search-card'));

      function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
      }

      function filterCards() {
        var query = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-keywords')
          ].join(' '));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (typeValue && normalize(card.getAttribute('data-type')).indexOf(typeValue) === -1 && haystack.indexOf(typeValue) === -1) {
            ok = false;
          }
          if (yearValue && normalize(card.getAttribute('data-year')).indexOf(yearValue) === -1) {
            ok = false;
          }
          card.classList.toggle('is-filtered-out', !ok);
        });
      }

      [input, type, year].forEach(function (el) {
        if (el) {
          el.addEventListener('input', filterCards);
          el.addEventListener('change', filterCards);
        }
      });
      filterCards();
    }
  });
})();
