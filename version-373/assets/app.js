(function () {
  var header = document.getElementById('siteHeader');
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');

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

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var heroBgs = Array.prototype.slice.call(document.querySelectorAll('.hero-bg'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;
  var timer = null;

  function setSlide(index) {
    if (!heroSlides.length) {
      return;
    }
    activeSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    heroBgs.forEach(function (bg, bgIndex) {
      bg.classList.toggle('is-active', bgIndex === activeSlide);
    });
    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startHero() {
    if (!heroSlides.length) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      setSlide(activeSlide + 1);
    }, 5200);
  }

  heroDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      setSlide(Number(dot.getAttribute('data-slide') || 0));
      startHero();
    });
  });
  startHero();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
  searchInputs.forEach(function (input) {
    var scope = input.closest('.section') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('.empty-state');
    var chips = Array.prototype.slice.call(scope.querySelectorAll('.filter-chip'));
    var activeFilter = 'all';

    function applyFilter() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.innerText
        ].join(' ').toLowerCase();
        var filterMatched = activeFilter === 'all' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        var keywordMatched = keyword === '' || haystack.indexOf(keyword) !== -1;
        var show = filterMatched && keywordMatched;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener('input', applyFilter);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (node) {
          node.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        applyFilter();
      });
    });
  });
}());
