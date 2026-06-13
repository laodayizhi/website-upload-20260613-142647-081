(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
        areas.forEach(function (area) {
            var input = area.querySelector("[data-search-input]");
            var root = area.parentElement || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
            var yearButtons = Array.prototype.slice.call(area.querySelectorAll("[data-filter-year]"));
            var categoryButtons = Array.prototype.slice.call(area.querySelectorAll("[data-filter-category]"));
            var currentYear = "";
            var currentCategory = "";

            function normalize(value) {
                return (value || "").toString().toLowerCase().trim();
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre")
                    ].join(" "));
                    var yearMatched = !currentYear || card.getAttribute("data-year") === currentYear;
                    var categoryMatched = !currentCategory || card.getAttribute("data-category") === currentCategory;
                    var textMatched = !query || text.indexOf(query) !== -1;
                    card.classList.toggle("is-hidden", !(yearMatched && categoryMatched && textMatched));
                });
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var initialQuery = params.get("q");
                if (initialQuery) {
                    input.value = initialQuery;
                }
                input.addEventListener("input", apply);
            }

            yearButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    currentYear = button.getAttribute("data-filter-year") || "";
                    yearButtons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });

            categoryButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    currentCategory = button.getAttribute("data-filter-category") || "";
                    categoryButtons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector("[data-play-button]");
            var src = box.getAttribute("data-player-src");
            var initialized = false;
            var hlsInstance = null;

            function attach() {
                if (initialized || !video || !src) {
                    return;
                }
                initialized = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else {
                    video.src = src;
                }
            }

            function play() {
                attach();
                if (button) {
                    button.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }

            if (video) {
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                });
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
            }

            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
