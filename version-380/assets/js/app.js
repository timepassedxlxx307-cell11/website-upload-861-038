(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initCatalogFilter() {
        var searchInput = document.querySelector('[data-catalog-search]') || document.querySelector('[data-page-search]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-category-filter], [data-local-filter]'));
        var activeCategory = 'all';

        if (!cards.length) {
            return;
        }

        function applyQueryFromUrl() {
            if (!searchInput) {
                return;
            }
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query) {
                searchInput.value = query;
            }
        }

        function filterCards() {
            var keyword = normalize(searchInput ? searchInput.value : '');
            var year = yearSelect ? yearSelect.value : '';
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                var categoryText = ' ' + normalize(card.dataset.category) + ' ';
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !year || card.dataset.year === year;
                var matchCategory = activeCategory === 'all' || categoryText.indexOf(' ' + activeCategory + ' ') !== -1;
                card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchCategory));
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeCategory = button.dataset.categoryFilter || button.dataset.localFilter || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                filterCards();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', filterCards);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }
        applyQueryFromUrl();
        filterCards();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (shell) {
            var video = shell.querySelector('[data-video]');
            var button = shell.querySelector('[data-play-button]');
            var message = shell.querySelector('[data-player-message]');
            var source = shell.dataset.source;
            var attached = false;
            var hls = null;

            if (!video || !button || !source) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function attachSource() {
                if (attached) {
                    return Promise.resolve();
                }
                attached = true;
                setMessage('');

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放源加载遇到问题，请刷新页面后重试。');
                        }
                    });
                    return new Promise(function (resolve) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            resolve();
                        });
                    });
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return new Promise(function (resolve) {
                        video.addEventListener('loadedmetadata', resolve, { once: true });
                    });
                }

                video.src = source;
                return Promise.resolve();
            }

            function play() {
                shell.classList.add('is-playing');
                attachSource().then(function () {
                    return video.play();
                }).catch(function () {
                    shell.classList.remove('is-playing');
                    setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                });
            }

            button.addEventListener('click', play);
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initCatalogFilter();
        initPlayers();
    });
}());
