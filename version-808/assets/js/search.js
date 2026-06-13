const form = document.querySelector("[data-search-form]");
const input = document.querySelector("[data-search-input]");
const results = document.querySelector("[data-search-results]");
const count = document.querySelector("[data-search-count]");
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q") || "";

function movieCard(item) {
  return `
<article class="movie-card">
  <a class="movie-poster" href="${item.url}">
    <img src="${item.cover}" alt="${item.title}" loading="lazy">
    <span class="poster-shade"></span>
    <span class="play-mark">▶</span>
    <span class="card-category">${item.category}</span>
  </a>
  <div class="movie-card-body">
    <h3><a href="${item.url}">${item.title}</a></h3>
    <p>${item.oneLine}</p>
    <div class="movie-meta">
      <span>${item.year}</span>
      <span>${item.region}</span>
      <span>${item.type}</span>
    </div>
  </div>
</article>`;
}

function render(query) {
  const keyword = (query || "").trim().toLowerCase();

  if (!keyword) {
    results.innerHTML = '<div class="empty-result">请输入关键词后查看匹配影片。</div>';
    count.textContent = "请输入关键词";
    return;
  }

  const matched = window.SEARCH_MOVIES.filter(function(item) {
    return item.keywords.toLowerCase().includes(keyword);
  }).slice(0, 120);

  if (!matched.length) {
    results.innerHTML = '<div class="empty-result">未找到匹配影片，请更换关键词。</div>';
    count.textContent = "0 部影片";
    return;
  }

  results.innerHTML = matched.map(movieCard).join("");
  count.textContent = matched.length + " 部影片";
}

if (input) {
  input.value = initialQuery;
}

if (form) {
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const query = input.value || "";
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.replaceState(null, "", url.toString());
    render(query);
  });
}

render(initialQuery);
