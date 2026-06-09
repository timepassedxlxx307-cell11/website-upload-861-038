(function () {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  function setHeaderState() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;
    let timer = null;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    startTimer();
  }

  const grid = document.querySelector("[data-card-grid]");
  const searchInput = document.querySelector("[data-search-input]");
  const searchForm = document.querySelector("[data-search-form]");
  let activeChannel = "";
  let activeType = "";

  function applyQueryFromUrl() {
    if (!searchInput) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      searchInput.value = q;
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function filterCards() {
    if (!grid) {
      return;
    }
    const q = normalize(searchInput ? searchInput.value : "");
    const cards = Array.from(grid.children);
    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.channel,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(" "));
      const matchesText = !q || haystack.indexOf(q) !== -1;
      const matchesChannel = !activeChannel || card.dataset.channel === activeChannel;
      const matchesType = !activeType || card.dataset.type === activeType;
      card.classList.toggle("is-filtered-out", !(matchesText && matchesChannel && matchesType));
    });
  }

  applyQueryFromUrl();

  if (searchInput) {
    searchInput.addEventListener("input", filterCards);
  }

  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      filterCards();
    });
  }

  document.querySelectorAll("[data-filter-channel]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeChannel = button.dataset.filterChannel || "";
      document.querySelectorAll("[data-filter-channel]").forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      document.querySelectorAll("[data-filter-all]").forEach(function (item) {
        item.classList.remove("is-active");
      });
      filterCards();
    });
  });

  document.querySelectorAll("[data-filter-all]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeChannel = "";
      document.querySelectorAll("[data-filter-channel]").forEach(function (item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");
      filterCards();
    });
  });

  document.querySelectorAll("[data-filter-type]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeType = button.dataset.filterType || "";
      document.querySelectorAll("[data-filter-type]").forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      document.querySelectorAll("[data-type-all]").forEach(function (item) {
        item.classList.remove("is-active");
      });
      filterCards();
    });
  });

  document.querySelectorAll("[data-type-all]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeType = "";
      document.querySelectorAll("[data-filter-type]").forEach(function (item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");
      filterCards();
    });
  });

  filterCards();
})();
