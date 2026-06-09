(function() {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var links = document.querySelector('[data-nav-links]');

  function onScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  if (toggle && links) {
    toggle.addEventListener('click', function() {
      links.classList.toggle('is-open');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        window.clearInterval(timer);
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  var input = document.querySelector('[data-search-input]');
  var category = document.querySelector('[data-filter-category]');
  var region = document.querySelector('[data-filter-region]');
  var year = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var empty = document.querySelector('[data-empty-state]');

  function valueOf(element) {
    return element ? String(element.value || '').trim().toLowerCase() : '';
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var q = valueOf(input);
    var c = valueOf(category);
    var r = valueOf(region);
    var y = valueOf(year);
    var visible = 0;

    cards.forEach(function(card) {
      var text = String(card.getAttribute('data-search') || '').toLowerCase();
      var cardCategory = String(card.getAttribute('data-category') || '').toLowerCase();
      var cardRegion = String(card.getAttribute('data-region') || '').toLowerCase();
      var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
      var ok = true;

      if (q && text.indexOf(q) === -1) {
        ok = false;
      }
      if (c && cardCategory !== c) {
        ok = false;
      }
      if (r && cardRegion.indexOf(r) === -1) {
        ok = false;
      }
      if (y && cardYear.indexOf(y) === -1) {
        ok = false;
      }

      card.hidden = !ok;
      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  [input, category, region, year].forEach(function(element) {
    if (element) {
      element.addEventListener('input', applyFilters);
      element.addEventListener('change', applyFilters);
    }
  });
})();
