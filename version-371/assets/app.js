(function () {
  var ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  };

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
        document.body.classList.toggle("nav-open", mobileNav.classList.contains("is-open"));
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = value ? target + "?q=" + encodeURIComponent(value) : target;
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (slides.length > 1) {
      var current = 0;
      var showSlide = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
          slide.setAttribute("aria-hidden", slideIndex === current ? "false" : "true");
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });

      showSlide(0);
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var panel = document.querySelector("[data-card-filter]");

    if (panel) {
      var filterInput = panel.querySelector("[data-filter-input]");
      var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-chip]"));
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var empty = document.querySelector("[data-empty-result]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (filterInput && query) {
        filterInput.value = query;
      }

      var normalize = function (value) {
        return (value || "").toString().trim().toLowerCase();
      };

      var updateCards = function () {
        var keyword = normalize(filterInput ? filterInput.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var content = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.textContent
          ].join(" ").toLowerCase();
          var matched = keyword === "" || content.indexOf(keyword) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };

      if (filterInput) {
        filterInput.addEventListener("input", updateCards);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          if (filterInput) {
            filterInput.value = chip.getAttribute("data-filter-chip") || "";
            updateCards();
          }
        });
      });

      updateCards();
    }

    var video = document.querySelector("[data-player]");
    var playerButton = document.querySelector("[data-player-button]");
    var hlsInstance = null;
    var streamLoaded = false;

    if (video && playerButton) {
      var stream = video.getAttribute("data-stream");
      var startVideo = function () {
        if (!stream) {
          return;
        }

        if (!streamLoaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          } else {
            video.src = stream;
          }
          streamLoaded = true;
        }

        playerButton.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      };

      playerButton.addEventListener("click", startVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          startVideo();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
