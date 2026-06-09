(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector(".mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    var searchInput = document.querySelector("[data-search-box]");
    if (searchInput) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      var empty = document.querySelector(".search-empty");
      var filterCards = function () {
        var value = searchInput.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var matched = !value || haystack.indexOf(value) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      searchInput.addEventListener("input", filterCards);
      document.querySelectorAll("[data-search-term]").forEach(function (button) {
        button.addEventListener("click", function () {
          searchInput.value = button.getAttribute("data-search-term") || "";
          filterCards();
          searchInput.focus();
        });
      });
    }

    var video = document.getElementById("movie-player");
    if (video) {
      var src = video.getAttribute("data-video") || "";
      var shell = video.closest(".player-shell");
      var overlay = document.querySelector("[data-player-toggle]");
      var setState = function () {
        if (shell) {
          shell.classList.toggle("is-playing", !video.paused && !video.ended);
        }
      };
      if (src) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }
      var playToggle = function () {
        if (video.paused) {
          var action = video.play();
          if (action && typeof action.catch === "function") {
            action.catch(function () {});
          }
        } else {
          video.pause();
        }
      };
      if (overlay) {
        overlay.addEventListener("click", playToggle);
      }
      video.addEventListener("click", function (event) {
        if (event.target === video) {
          playToggle();
        }
      });
      video.addEventListener("play", setState);
      video.addEventListener("pause", setState);
      video.addEventListener("ended", setState);
      setState();
    }
  });
})();
