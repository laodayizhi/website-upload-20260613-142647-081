(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    let current = 0;

    const activate = (index) => {
      current = index;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = Number(dot.getAttribute('data-slide')) || 0;
        activate(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(() => {
        activate((current + 1) % slides.length);
      }, 5600);
    }
  }

  const filterForm = document.querySelector('[data-filter-form]');
  const filterInput = document.querySelector('[data-filter-input]');
  const filterGrid = document.querySelector('[data-filter-grid]');

  if (filterForm && filterInput && filterGrid) {
    const cards = Array.from(filterGrid.querySelectorAll('[data-movie-card]'));

    const runFilter = () => {
      const query = filterInput.value.trim().toLowerCase();
      cards.forEach((card) => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const meta = (card.getAttribute('data-meta') || '').toLowerCase();
        const year = (card.getAttribute('data-year') || '').toLowerCase();
        const matched = !query || title.includes(query) || meta.includes(query) || year.includes(query);
        card.classList.toggle('is-hidden', !matched);
      });
    };

    filterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      runFilter();
    });

    filterInput.addEventListener('input', runFilter);
  }

  const searchForm = document.querySelector('[data-search-form]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchChips = Array.from(document.querySelectorAll('[data-search-chip]'));

  if (searchForm && searchInput && searchResults && Array.isArray(window.searchIndex)) {
    let chipValue = '';

    const createCard = (movie) => {
      return `
        <article class="movie-card compact-card">
          <a href="${movie.url}" class="poster-link" aria-label="观看${escapeHtml(movie.title)}">
            <span class="poster-wrap">
              <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
              <span class="poster-mask"><span>播放</span></span>
              <span class="badge year-badge">${escapeHtml(movie.year)}</span>
              <span class="badge hot-badge">${escapeHtml(movie.heat)}</span>
            </span>
            <strong>${escapeHtml(movie.title)}</strong>
            <em>${escapeHtml(movie.genre)}</em>
            <small>${escapeHtml(movie.region)} · ${escapeHtml(movie.type)}</small>
            <p>${escapeHtml(movie.oneLine)}</p>
          </a>
        </article>`;
    };

    const render = () => {
      const query = searchInput.value.trim().toLowerCase();
      const results = window.searchIndex.filter((movie) => {
        const text = `${movie.title} ${movie.genre} ${movie.region} ${movie.type} ${movie.year} ${movie.tags} ${movie.oneLine}`.toLowerCase();
        const queryMatched = !query || text.includes(query);
        const chipMatched = !chipValue || text.includes(chipValue.toLowerCase());
        return queryMatched && chipMatched;
      }).slice(0, 96);

      searchResults.innerHTML = results.map(createCard).join('');
    };

    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      render();
    });

    searchInput.addEventListener('input', render);

    searchChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chipValue = chip.getAttribute('data-search-chip') || '';
        searchChips.forEach((item) => item.classList.toggle('active', item === chip));
        render();
      });
    });

    if (searchChips[0]) {
      searchChips[0].classList.add('active');
    }

    render();
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
