(function () {
    const selectAll = (selector, context = document) => Array.from(context.querySelectorAll(selector));

    function setupMobileMenu() {
        const button = document.querySelector('[data-menu-toggle]');
        const panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', () => {
            panel.classList.toggle('is-open');
        });
    }

    function setupSearchForms() {
        selectAll('[data-search-form]').forEach((form) => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const input = form.querySelector('input[name="q"]');
                const query = input ? input.value.trim() : '';
                const root = form.getAttribute('data-root') || './';
                const target = `${root}search.html${query ? `?q=${encodeURIComponent(query)}` : ''}`;
                window.location.href = target;
            });
        });
    }

    function setupHeroCarousel() {
        const carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        const slides = selectAll('.hero-slide', carousel);
        const dots = selectAll('[data-hero-dot]', carousel);
        if (!slides.length) {
            return;
        }
        let index = 0;
        let timer = null;
        const show = (next) => {
            index = (next + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };
        const start = () => {
            stop();
            timer = window.setInterval(() => show(index + 1), 5600);
        };
        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };
        dots.forEach((dot, dotIndex) => {
            dot.addEventListener('click', () => {
                show(dotIndex);
                start();
            });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilterAndSort() {
        const bar = document.querySelector('[data-filter-bar]');
        const grid = document.querySelector('[data-movie-grid]');
        if (!bar || !grid) {
            return;
        }
        const cards = selectAll('.movie-card', grid);
        const chips = selectAll('[data-filter-value]', bar);
        const sorter = bar.querySelector('[data-sort-select]');
        let active = 'all';
        const applyFilter = () => {
            cards.forEach((card) => {
                const tags = (card.getAttribute('data-tags') || '').toLowerCase();
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                const match = active === 'all' || tags.includes(active.toLowerCase()) || title.includes(active.toLowerCase());
                card.classList.toggle('hidden-by-filter', !match);
            });
        };
        const applySort = () => {
            if (!sorter) {
                return;
            }
            const value = sorter.value;
            const sorted = cards.slice();
            if (value !== 'default') {
                sorted.sort((a, b) => Number(b.dataset[value] || 0) - Number(a.dataset[value] || 0));
            } else {
                sorted.sort((a, b) => cards.indexOf(a) - cards.indexOf(b));
            }
            sorted.forEach((card) => grid.appendChild(card));
        };
        chips.forEach((chip) => {
            chip.addEventListener('click', () => {
                active = chip.getAttribute('data-filter-value') || 'all';
                chips.forEach((item) => item.classList.toggle('active', item === chip));
                applyFilter();
            });
        });
        if (sorter) {
            sorter.addEventListener('change', () => {
                applySort();
                applyFilter();
            });
        }
    }

    function setupSearchPage() {
        const page = document.querySelector('[data-search-page]');
        if (!page || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        const input = page.querySelector('[data-search-input]');
        const form = page.querySelector('[data-search-inner-form]');
        const grid = page.querySelector('[data-search-results]');
        const empty = page.querySelector('[data-search-empty]');
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }
        const render = (query) => {
            const normalized = query.trim().toLowerCase();
            grid.innerHTML = '';
            if (!normalized) {
                empty.style.display = 'block';
                empty.textContent = '输入片名、地区、年份、类型或标签即可快速筛选内容。';
                return;
            }
            const keywords = normalized.split(/\s+/).filter(Boolean);
            const results = window.MOVIE_SEARCH_INDEX.filter((item) => {
                const haystack = item.search.toLowerCase();
                return keywords.every((word) => haystack.includes(word));
            }).slice(0, 120);
            if (!results.length) {
                empty.style.display = 'block';
                empty.textContent = '暂未找到匹配结果，可以尝试更短的关键词。';
                return;
            }
            empty.style.display = 'none';
            const html = results.map((item) => {
                return `
                    <article class="movie-card">
                        <a class="movie-card-link" href="${item.url}">
                            <div class="card-poster poster-bg" style="--poster: url('${item.image}');">
                                <div class="card-badges">
                                    <span>${item.year}</span>
                                    <span>${item.type}</span>
                                </div>
                                <span class="play-mark">▶</span>
                            </div>
                            <div class="card-body">
                                <div class="card-meta">
                                    <span>${item.region}</span>
                                    <span>${item.category}</span>
                                </div>
                                <h3>${item.title}</h3>
                                <p>${item.oneLine}</p>
                                <div class="card-foot">
                                    <span>${item.genre}</span>
                                    <span>评分 ${item.rating}</span>
                                </div>
                            </div>
                        </a>
                    </article>
                `;
            }).join('');
            grid.innerHTML = html;
        };
        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const value = input ? input.value.trim() : '';
                const target = value ? `search.html?q=${encodeURIComponent(value)}` : 'search.html';
                window.history.replaceState(null, '', target);
                render(value);
            });
        }
        render(initial);
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupMobileMenu();
        setupSearchForms();
        setupHeroCarousel();
        setupFilterAndSort();
        setupSearchPage();
    });
})();
