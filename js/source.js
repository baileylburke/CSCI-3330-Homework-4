// *********************************************************************
// Homework 4 Public APIs
// *********************************************************************

function formatYearFromStr(dateString) {
  return dateString.split('-')[0];
}

function formatPercentage(value) {
  return `${(value * 100).toFixed(2)}%`;
}

const DEFAULT_GAME_ID = "1273796";
const NEWS_FALLBACK_ID = "1261640";
const API_BASE = "https://api.gamebrain.co/v1/games/";
const newsCards = document.querySelectorAll(".news-card");
const gameCards = document.querySelectorAll(".game-card");
const sectionTitles = document.querySelectorAll(".section-header h2");
const reloadButton = document.querySelector(".more-button");
let sessionApiKey = "";
let loading = false;

function readSetting(name) {
  try {
    return localStorage.getItem(name) || "";
  } catch {
    return "";
  }
}

function setImage(image, url, description) {
  image.alt = description;
  image.style.visibility = "hidden";
  image.onload = () => { image.style.visibility = "visible"; };
  image.onerror = () => { image.style.visibility = "hidden"; };
  image.removeAttribute("src");
  if (typeof url === "string" && url.startsWith("https://")) {
    image.src = url;
  }
}

async function request(path, apiKey) {
  const response = await fetch(API_BASE + path, {
    headers: { "x-api-key": apiKey },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      sessionApiKey = "";
      throw new Error("API key rejected. Use Reload game to try again.");
    }
    if (response.status === 429) {
      throw new Error("API limit reached. Please try again later.");
    }
    throw new Error("GameBrain request failed (HTTP " + response.status + ").");
  }
  return response.json();
}

function renderGame(game) {
  document.querySelector("#game-name").textContent = game.name || "Untitled game";
  document.querySelector(".game-genre").textContent = game.genre || "Genre unavailable";
  const year = game.release_date ? formatYearFromStr(game.release_date) : "Year unavailable";
  document.querySelector(".game-meta").textContent =
    (game.developer || "Developer unavailable") + " • " + year;
  setImage(document.querySelector(".game-image img"), game.image, game.name + " artwork");
}

function renderNews(items, usedFallback) {
  const news = Array.isArray(items) ? items.slice(0, 3) : [];
  sectionTitles[0].textContent = news.length
    ? (usedFallback ? "Game News (documentation example)" : "Game News")
    : "Game News: no articles available";
  newsCards.forEach((card, index) => {
    const article = news[index];
    card.style.display = article ? "" : "none";
    if (!article) return;
    card.querySelector("h3").textContent = article.title || "Untitled article";
    card.querySelector(".news-published").textContent =
      article.published ? "Published " + article.published : "Publication date unavailable";
    setImage(card.querySelector("img"), article.image, article.title || "Game news");
  });
}

function renderSimilar(items) {
  const games = Array.isArray(items) ? items.slice(0, 4) : [];
  sectionTitles[1].textContent = games.length ? "Similar Games" : "Similar Games: no results";
  gameCards.forEach((card, index) => {
    const game = games[index];
    card.style.display = game ? "" : "none";
    if (!game) return;
    card.querySelector("h3").textContent = game.name || "Untitled game";
    const fields = card.querySelectorAll(".game-card-meta span");
    fields[0].textContent = Number.isFinite(game.year) ? Math.trunc(game.year) : "Year unavailable";
    fields[1].textContent = Number.isFinite(game.rating?.mean)
      ? formatPercentage(game.rating.mean) : "Not rated";
    setImage(card.querySelector("img"), game.screenshots?.[0] || game.image,
      (game.name || "Similar game") + " screenshot");
  });
}

async function loadNews(gameID, apiKey) {
  let data = await request(gameID + "/news?limit=3", apiKey);
  let usedFallback = false;
  if ((!Array.isArray(data.news) || data.news.length === 0) && gameID !== NEWS_FALLBACK_ID) {
    data = await request(NEWS_FALLBACK_ID + "/news?limit=3", apiKey);
    usedFallback = true;
  }
  renderNews(data.news, usedFallback);
}

async function load() {
  if (loading) return;
  loading = true;
  reloadButton.disabled = true;
  newsCards.forEach(card => { card.style.display = "none"; });
  gameCards.forEach(card => { card.style.display = "none"; });
  document.querySelector("#game-name").textContent = "Loading game";
  document.querySelector(".game-genre").textContent = "";
  document.querySelector(".game-meta").textContent = "Connecting to GameBrain";
  setImage(document.querySelector(".game-image img"), "", "Game artwork");
  sectionTitles[0].textContent = "Game News";
  sectionTitles[1].textContent = "Similar Games";

  try {
    const gameID = readSetting("game_id").trim() || DEFAULT_GAME_ID;
    if (!/^\d+$/.test(gameID)) throw new Error("The game ID must contain only digits.");
    const apiKey = sessionApiKey || readSetting("api_key").trim()
      || (window.prompt("Enter your GameBrain API key. It will be kept only for this page session.") || "").trim();
    if (!apiKey) throw new Error("Use Reload game to enter your GameBrain API key.");
    sessionApiKey = apiKey;
    const game = await request(gameID, apiKey);
    if (!game || typeof game.name !== "string") throw new Error("GameBrain returned no game details.");
    renderGame(game);
    await Promise.all([
      loadNews(gameID, apiKey).catch(error => {
        sectionTitles[0].textContent = "Game News unavailable";
        sectionTitles[0].title = error.message;
      }),
      request(gameID + "/similar?limit=4", apiKey).then(data => renderSimilar(data.results)).catch(error => {
        sectionTitles[1].textContent = "Similar Games unavailable";
        sectionTitles[1].title = error.message;
      })
    ]);
  } catch (error) {
    document.querySelector("#game-name").textContent = "Game unavailable";
    document.querySelector(".game-meta").textContent =
      error.name === "TimeoutError" ? "Request timed out. Use Reload game to retry."
      : error instanceof TypeError ? "Unable to connect to GameBrain. Check your connection and retry."
      : error.message;
  } finally {
    loading = false;
    reloadButton.disabled = false;
  }
}

reloadButton.textContent = "Reload game";
reloadButton.style.width = "auto";
reloadButton.setAttribute("aria-label", "Reload game");
reloadButton.addEventListener("click", load);
load();
