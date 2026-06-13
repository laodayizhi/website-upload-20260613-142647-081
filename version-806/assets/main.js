(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normal(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = one('[data-menu-toggle]');
    var menu = one('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    all('[data-hero]').forEach(function (hero) {
      var slides = all('[data-hero-slide]', hero);
      var dots = all('[data-hero-dot]', hero);
      var prev = one('[data-hero-prev]', hero);
      var next = one('[data-hero-next]', hero);
      var current = 0;
      var timer = null;

      if (!slides.length) {
        return;
      }

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5600);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function initFilters() {
    all('[data-filter-scope]').forEach(function (scope) {
      var input = one('[data-filter-input]', scope);
      var year = one('[data-filter-year]', scope);
      var region = one('[data-filter-region]', scope);
      var type = one('[data-filter-type]', scope);
      var reset = one('[data-filter-reset]', scope);
      var cards = all('[data-card]', scope);
      var empty = one('[data-empty-state]', scope);
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function apply() {
        var query = normal(input && input.value);
        var yearValue = normal(year && year.value);
        var regionValue = normal(region && region.value);
        var typeValue = normal(type && type.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normal([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var ok = true;

          if (query && text.indexOf(query) === -1) {
            ok = false;
          }

          if (yearValue && normal(card.getAttribute('data-year')) !== yearValue) {
            ok = false;
          }

          if (regionValue && normal(card.getAttribute('data-region')) !== regionValue) {
            ok = false;
          }

          if (typeValue && normal(card.getAttribute('data-type')) !== typeValue) {
            ok = false;
          }

          card.style.display = ok ? '' : 'none';

          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, year, region, type].forEach(function (field) {
        if (field) {
          field.addEventListener('input', apply);
          field.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (year) {
            year.value = '';
          }
          if (region) {
            region.value = '';
          }
          if (type) {
            type.value = '';
          }
          apply();
        });
      }

      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
