const toggle = document.querySelector("[data-menu-toggle]");
const panel = document.querySelector("[data-mobile-panel]");

if (toggle && panel) {
  toggle.addEventListener("click", function() {
    panel.classList.toggle("is-open");
  });
}

const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
let heroIndex = 0;

function showHero(index) {
  if (!slides.length) {
    return;
  }

  heroIndex = (index + slides.length) % slides.length;

  slides.forEach(function(slide, current) {
    slide.classList.toggle("is-active", current === heroIndex);
  });

  dots.forEach(function(dot, current) {
    dot.classList.toggle("is-active", current === heroIndex);
  });
}

dots.forEach(function(dot, index) {
  dot.addEventListener("click", function() {
    showHero(index);
  });
});

if (slides.length > 1) {
  setInterval(function() {
    showHero(heroIndex + 1);
  }, 5600);
}

const filterPanel = document.querySelector("[data-filter-panel]");

if (filterPanel) {
  const textInput = document.querySelector("[data-filter-text]");
  const categoryInput = document.querySelector("[data-filter-category]");
  const yearInput = document.querySelector("[data-filter-year]");
  const typeInput = document.querySelector("[data-filter-type]");
  const cards = Array.from(document.querySelectorAll("[data-filter-list] .movie-card"));
  const count = document.querySelector("[data-filter-count]");

  function applyFilters() {
    const keyword = (textInput.value || "").trim().toLowerCase();
    const category = categoryInput.value;
    const year = yearInput.value;
    const type = typeInput.value;
    let visible = 0;

    cards.forEach(function(card) {
      const title = (card.dataset.title || "").toLowerCase();
      const region = (card.dataset.region || "").toLowerCase();
      const itemCategory = card.dataset.category || "";
      const itemYear = card.dataset.year || "";
      const itemType = card.dataset.type || "";
      const textMatch = !keyword || title.includes(keyword) || region.includes(keyword) || card.innerText.toLowerCase().includes(keyword);
      const categoryMatch = category === "all" || itemCategory === category;
      const yearMatch = year === "all" || itemYear === year;
      const typeMatch = type === "all" || itemType.includes(type);
      const show = textMatch && categoryMatch && yearMatch && typeMatch;

      card.classList.toggle("is-filter-hidden", !show);

      if (show) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = visible + " 部影片";
    }
  }

  [textInput, categoryInput, yearInput, typeInput].forEach(function(input) {
    input.addEventListener("input", applyFilters);
    input.addEventListener("change", applyFilters);
  });
}
