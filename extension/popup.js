const API_BASE = "http://localhost:8000";

// DOM Elements
const inputSection = document.getElementById("input-section");
const loadingSection = document.getElementById("loading-section");
const resultsSection = document.getElementById("results-section");
const errorSection = document.getElementById("error-section");

const tabs = document.querySelectorAll(".tab");
const textInput = document.getElementById("text-input");
const pageInfo = document.getElementById("page-info");
const contentInput = document.getElementById("content-input");
const currentUrl = document.getElementById("current-url");
const analyzeBtn = document.getElementById("analyze-btn");
const backBtn = document.getElementById("back-btn");
const retryBtn = document.getElementById("retry-btn");

let activeTab = "page";

// Tab switching
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    activeTab = tab.dataset.type;

    if (activeTab === "text") {
      textInput.classList.remove("hidden");
      pageInfo.classList.add("hidden");
    } else {
      textInput.classList.add("hidden");
      pageInfo.classList.remove("hidden");
    }
  });
});

// Get current tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.url) {
    currentUrl.textContent = tabs[0].url;
  } else {
    currentUrl.textContent = "Unable to detect page URL";
  }
});

// Analyze
analyzeBtn.addEventListener("click", async () => {
  let content, inputType;

  if (activeTab === "page") {
    content = currentUrl.textContent;
    inputType = "url";
    if (!content || content.startsWith("Unable") || content.startsWith("Loading")) {
      showError("No valid page URL detected.");
      return;
    }
  } else {
    content = contentInput.value.trim();
    inputType = "text";
    if (!content || content.length < 10) {
      showError("Please enter at least 10 characters.");
      return;
    }
  }

  showSection("loading");

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, input_type: inputType }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    showResults(data);
  } catch (err) {
    showError(err.message || "Failed to connect to VerifyAI server.");
  }
});

backBtn.addEventListener("click", () => showSection("input"));
retryBtn.addEventListener("click", () => showSection("input"));

function showSection(name) {
  inputSection.classList.add("hidden");
  loadingSection.classList.add("hidden");
  resultsSection.classList.add("hidden");
  errorSection.classList.add("hidden");

  if (name === "input") inputSection.classList.remove("hidden");
  if (name === "loading") loadingSection.classList.remove("hidden");
  if (name === "results") resultsSection.classList.remove("hidden");
  if (name === "error") errorSection.classList.remove("hidden");
}

function showError(msg) {
  document.getElementById("error-message").textContent = msg;
  showSection("error");
}

function showResults(data) {
  const card = document.getElementById("verdict-card");
  card.className = "verdict-card " + data.verdict.toLowerCase();

  document.getElementById("verdict-text").textContent = data.verdict;
  document.getElementById("verdict-score").textContent =
    `Score: ${data.final_score.toFixed(1)}/100 | Confidence: ${Math.round(data.confidence * 100)}%`;

  // Score bars
  setBar("classification", data.classification.fake_probability);
  setBar("sentiment", data.sentiment.sentiment_score);
  setBar("credibility", data.credibility.credibility_score);
  setBar("factcheck", data.fact_check.fact_check_score);

  // Explanation
  const explanationEl = document.getElementById("explanation-text");
  if (data.explainability?.explanation) {
    explanationEl.textContent = data.explainability.explanation;
    explanationEl.classList.remove("hidden");
  } else {
    explanationEl.classList.add("hidden");
  }

  // Full report link
  document.getElementById("full-results-link").href =
    `http://localhost:3000/results/${data.id}`;

  showSection("results");
}

function setBar(name, value) {
  const pct = Math.round(value * 100);
  const bar = document.getElementById(`bar-${name}`);
  const val = document.getElementById(`val-${name}`);

  bar.style.width = `${pct}%`;
  bar.className = "score-bar " + (pct > 65 ? "high" : pct > 30 ? "mid" : "low");
  val.textContent = `${pct}%`;
}
