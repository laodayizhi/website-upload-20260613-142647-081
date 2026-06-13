(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var opened = mobilePanel.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeSlide);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        showSlide(0);
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterCategory = document.querySelector('[data-filter-category]');
    var filterRegion = document.querySelector('[data-filter-region]');
    var filterType = document.querySelector('[data-filter-type]');
    var items = Array.prototype.slice.call(document.querySelectorAll('.searchable-item'));
    var emptyState = document.querySelector('[data-empty-state]');

    function params() {
        var query = new URLSearchParams(window.location.search);
        return query.get('q') || '';
    }

    function applyFilters() {
        if (!items.length) {
            return;
        }

        var text = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var category = filterCategory ? filterCategory.value : '';
        var region = filterRegion ? filterRegion.value : '';
        var type = filterType ? filterType.value : '';
        var shown = 0;

        items.forEach(function (item) {
            var haystack = (item.getAttribute('data-title') || '').toLowerCase();
            var itemCategory = item.getAttribute('data-category') || '';
            var itemRegion = item.getAttribute('data-region') || '';
            var itemType = item.getAttribute('data-type') || '';
            var matched = true;

            if (text && haystack.indexOf(text) === -1) {
                matched = false;
            }
            if (category && itemCategory !== category) {
                matched = false;
            }
            if (region && itemRegion !== region) {
                matched = false;
            }
            if (type && itemType !== type) {
                matched = false;
            }

            item.classList.toggle('hidden-by-filter', !matched);
            if (matched) {
                shown += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('show', shown === 0);
        }
    }

    if (filterInput) {
        var queryValue = params();
        if (queryValue) {
            filterInput.value = queryValue;
        }
        filterInput.addEventListener('input', applyFilters);
    }
    [filterCategory, filterRegion, filterType].forEach(function (select) {
        if (select) {
            select.addEventListener('change', applyFilters);
        }
    });
    applyFilters();

    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-overlay');

    if (video && overlay && typeof playerStreamUrl !== 'undefined') {
        var attached = false;
        var hlsInstance = null;

        function attachStream() {
            if (attached) {
                return Promise.resolve();
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playerStreamUrl;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hlsInstance.loadSource(playerStreamUrl);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function () {
                        resolve();
                    });
                });
            }

            video.src = playerStreamUrl;
            return Promise.resolve();
        }

        function startPlayback() {
            overlay.classList.add('is-hidden');
            attachStream().then(function () {
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            });
        }

        overlay.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
}());
