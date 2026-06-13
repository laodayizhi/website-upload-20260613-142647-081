(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-nav-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var reset = scope.querySelector("[data-filter-reset]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
            var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]"));

            function apply(value) {
                var keyword = String(value || "").trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    card.classList.toggle("is-hidden", keyword && haystack.indexOf(keyword) === -1);
                });
            }

            if (input) {
                input.addEventListener("input", function () {
                    apply(input.value);
                });
            }

            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    apply("");
                });
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    var value = chip.getAttribute("data-filter-chip") || "";
                    if (input) {
                        input.value = value;
                    }
                    apply(value);
                });
            });
        });
    }

    function createResultCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<article class="movie-card">" +
                "<a href="" + escapeAttr(item.url) + "">" +
                    "<figure class="poster-frame">" +
                        "<img class="movie-cover" src="" + escapeAttr(item.cover) + "" alt="" + escapeAttr(item.title) + "" loading="lazy">" +
                        "<span class="play-badge">▶</span>" +
                        "<span class="duration-badge">" + escapeHtml(item.duration || "") + "</span>" +
                    "</figure>" +
                    "<div class="card-content">" +
                        "<p class="card-meta">" + escapeHtml(item.year || "") + " · " + escapeHtml(item.region || "") + " · " + escapeHtml(item.category || "") + "</p>" +
                        "<h3>" + escapeHtml(item.title || "") + "</h3>" +
                        "<p>" + escapeHtml(item.description || "") + "</p>" +
                        "<div class="tag-row">" + tags + "</div>" +
                    "</div>" +
                "</a>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, "&#96;");
    }

    function initSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var title = document.querySelector("[data-search-title]");
        var input = document.getElementById("searchInput");
        if (!results || !title || !window.SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }
        if (!query) {
            title.textContent = "请输入关键词开始搜索";
            results.innerHTML = "";
            return;
        }
        var lowered = query.toLowerCase();
        var matched = window.SEARCH_DATA.filter(function (item) {
            return [
                item.title,
                item.description,
                item.region,
                item.year,
                item.genre,
                item.category,
                (item.tags || []).join(" ")
            ].join(" ").toLowerCase().indexOf(lowered) !== -1;
        });
        title.textContent = "搜索结果：" + query;
        results.innerHTML = matched.map(createResultCard).join("");
    }

    window.setupMoviePlayer = function (streamUrl) {
        var video = document.querySelector("[data-player-video]");
        var button = document.querySelector("[data-player-button]");
        var status = document.querySelector("[data-player-status]");
        if (!video || !button || !streamUrl) {
            return;
        }
        var attached = false;

        function setStatus(text) {
            if (status) {
                status.textContent = text || "";
            }
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("播放暂时中断，请刷新页面重试");
                    }
                });
            } else {
                video.src = streamUrl;
            }
        }

        function start() {
            attach();
            button.classList.add("is-hidden");
            video.controls = true;
            var playAction = video.play();
            if (playAction && typeof playAction.catch === "function") {
                playAction.catch(function () {
                    button.classList.remove("is-hidden");
                    setStatus("点击画面继续播放");
                });
            }
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
            setStatus("");
        });
        attach();
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initSearchPage();
    });
}());
