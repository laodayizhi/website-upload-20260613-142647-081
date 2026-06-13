(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        mobile.classList.toggle("is-open");
      });
    }
  }

  function initSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
        }
      });
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function initCategoryFilter() {
    var input = document.querySelector(".category-search");
    var select = document.querySelector(".category-select");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".category-movie-grid .movie-card"));
    var empty = document.querySelector(".empty-state");
    if (!cards.length) {
      return;
    }

    function applyFilter() {
      var query = normalize(input ? input.value : "");
      var year = select ? select.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var content = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matchText = !query || content.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var matched = matchText && matchYear;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (select) {
      select.addEventListener("change", applyFilter);
    }
  }

  function cardTemplate(item) {
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-wrap\" href=\"./" + escapeHtml(item.file) + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">",
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-play\">▶</span>",
      "<span class=\"poster-badge\">" + escapeHtml(item.duration) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-meta-line\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.type) + "</span></div>",
      "<h2><a href=\"./" + escapeHtml(item.file) + "\">" + escapeHtml(item.title) + "</a></h2>",
      "<p>" + escapeHtml(item.oneLine) + "</p>",
      "<div class=\"card-tags\"><span>" + escapeHtml(item.genre) + "</span><span>" + escapeHtml(item.category) + "</span></div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var input = document.getElementById("site-search-input");
    var empty = document.getElementById("search-empty");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }

    function render(value) {
      var q = normalize(value);
      var data = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        if (!q) {
          return true;
        }
        return normalize(item.title + " " + item.region + " " + item.year + " " + item.genre + " " + item.tags + " " + item.category).indexOf(q) !== -1;
      }).slice(0, 80);
      results.innerHTML = data.map(cardTemplate).join("");
      if (empty) {
        empty.hidden = data.length !== 0;
      }
    }

    render(query);
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
  }

  ready(function () {
    initNavigation();
    initSearchForms();
    initHero();
    initCategoryFilter();
    initSearchPage();
  });
})();
