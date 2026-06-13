(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');
  var search = document.querySelector('.nav-search');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      if (search) {
        search.classList.toggle('is-open');
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === active);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5000);
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var genre = panel.querySelector('[data-filter-genre]');
    var scope = document.querySelector('[data-filter-scope]') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-state]');

    if (input && query) {
      input.value = query;
    }

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedGenre = genre ? genre.value.toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.year || '',
          card.dataset.genre || '',
          card.dataset.tags || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || (card.dataset.year || '').indexOf(selectedYear) !== -1;
        var matchGenre = !selectedGenre || (card.dataset.genre || '').toLowerCase().indexOf(selectedGenre) !== -1 || (card.dataset.tags || '').toLowerCase().indexOf(selectedGenre) !== -1;
        var match = matchKeyword && matchYear && matchGenre;
        card.classList.toggle('is-hidden', !match);
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    if (year) {
      year.addEventListener('change', applyFilters);
    }
    if (genre) {
      genre.addEventListener('change', applyFilters);
    }
    applyFilters();
  });
})();
