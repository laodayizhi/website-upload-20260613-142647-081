(function () {
  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var searchToggle = document.querySelector('[data-search-toggle]');
  var headerSearch = document.querySelector('[data-header-search]');

  if (searchToggle && headerSearch) {
    searchToggle.addEventListener('click', function () {
      headerSearch.classList.toggle('is-open');
      var input = headerSearch.querySelector('input');
      if (headerSearch.classList.contains('is-open') && input) {
        input.focus();
      }
    });
  }

  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var clearButton = document.querySelector('[data-filter-clear]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function applyFilter(value) {
    var keyword = (value || '').trim().toLowerCase();
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-meta') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      card.classList.toggle('is-filter-hidden', keyword && text.indexOf(keyword) === -1);
    });
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    filterInput.value = query;
    applyFilter(query);

    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }

  if (clearButton && filterInput) {
    clearButton.addEventListener('click', function () {
      filterInput.value = '';
      applyFilter('');
      filterInput.focus();
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));

  function attachPlayer(video) {
    if (video.dataset.ready === '1') {
      return;
    }

    var streamUrl = video.getAttribute('data-stream');

    if (!streamUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    video.dataset.ready = '1';
  }

  players.forEach(function (video) {
    var playerCard = video.closest('.player-card');
    var startButton = playerCard ? playerCard.querySelector('.player-start') : null;

    if (startButton) {
      startButton.addEventListener('click', function () {
        attachPlayer(video);
        var playAction = video.play();
        if (playAction && typeof playAction.catch === 'function') {
          playAction.catch(function () {});
        }
        startButton.classList.add('is-hidden');
      });
    }

    video.addEventListener('play', function () {
      attachPlayer(video);
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('click', function () {
      attachPlayer(video);
    });
  });
})();
