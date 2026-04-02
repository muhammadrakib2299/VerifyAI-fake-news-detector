/**
 * VerifyAI Content Script
 *
 * Adds a floating "Verify" button to article pages.
 * When clicked, sends the page URL to the VerifyAI API and shows a quick verdict.
 */

const API_BASE = "http://localhost:8000";
const FRONTEND_BASE = "http://localhost:3000";

// Only inject on article-like pages
function isArticlePage() {
  const articleEl = document.querySelector(
    "article, [role='article'], .article-body, .post-content, .entry-content"
  );
  const ogType = document
    .querySelector('meta[property="og:type"]')
    ?.getAttribute("content");
  const hasLongText =
    document.body.innerText.split(/\s+/).length > 200;

  return !!articleEl || ogType === "article" || hasLongText;
}

if (!isArticlePage()) {
  // Not an article page, skip injection
} else {
  injectVerifyButton();
}

function injectVerifyButton() {
  // Create floating button
  const btn = document.createElement("div");
  btn.id = "verifyai-fab";
  btn.innerHTML = `
    <div id="verifyai-fab-btn" title="Analyze with VerifyAI">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect width="20" height="20" rx="4" fill="white"/>
        <text x="10" y="14.5" text-anchor="middle" fill="#171717" font-family="system-ui" font-weight="bold" font-size="13">V</text>
      </svg>
      <span>Verify</span>
    </div>
    <div id="verifyai-result" class="verifyai-hidden"></div>
  `;
  document.body.appendChild(btn);

  const fabBtn = document.getElementById("verifyai-fab-btn");
  const resultPanel = document.getElementById("verifyai-result");

  fabBtn.addEventListener("click", async () => {
    // Already showing results? Toggle off
    if (!resultPanel.classList.contains("verifyai-hidden")) {
      resultPanel.classList.add("verifyai-hidden");
      return;
    }

    // Show loading state
    resultPanel.classList.remove("verifyai-hidden");
    resultPanel.innerHTML = `
      <div class="verifyai-loading">
        <div class="verifyai-spinner"></div>
        <span>Analyzing...</span>
      </div>
    `;

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: window.location.href,
          input_type: "url",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      showInlineResult(data, resultPanel);
    } catch (err) {
      resultPanel.innerHTML = `
        <div class="verifyai-error">
          <strong>Analysis failed</strong>
          <p>${err.message}</p>
        </div>
      `;
    }
  });
}

function showInlineResult(data, panel) {
  const verdictClass = data.verdict.toLowerCase();
  const confidence = Math.round(data.confidence * 100);

  panel.innerHTML = `
    <div class="verifyai-verdict verifyai-${verdictClass}">
      <strong>${data.verdict}</strong>
      <span>${data.final_score.toFixed(1)}/100</span>
    </div>
    <div class="verifyai-meta">
      Confidence: ${confidence}% | Model: ${data.model_used}
    </div>
    <div class="verifyai-bars">
      ${scoreBar("AI Classification", data.classification.fake_probability)}
      ${scoreBar("Sensationalism", data.sentiment.sentiment_score)}
      ${scoreBar("Source Credibility", data.credibility.credibility_score)}
      ${scoreBar("Fact Check", data.fact_check.fact_check_score)}
    </div>
    ${data.explainability?.explanation ? `<p class="verifyai-explanation">${data.explainability.explanation}</p>` : ""}
    <a class="verifyai-link" href="${FRONTEND_BASE}/results/${data.id}" target="_blank">
      View Full Report &rarr;
    </a>
  `;
}

function scoreBar(label, value) {
  const pct = Math.round(value * 100);
  const color = pct > 65 ? "#ef4444" : pct > 30 ? "#f59e0b" : "#22c55e";
  return `
    <div class="verifyai-bar-row">
      <span class="verifyai-bar-label">${label}</span>
      <div class="verifyai-bar-track">
        <div class="verifyai-bar-fill" style="width:${pct}%;background:${color}"></div>
      </div>
      <span class="verifyai-bar-val">${pct}%</span>
    </div>
  `;
}
