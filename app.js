// ai& Pricing Calculator — UI logic
(function () {
  "use strict";

  const state = {
    unit: "tokens",      // tokens | words | chars
    sort: "quality",     // quality | popularity | price | cost
    inputTokens: 2_000,
    outputTokens: 500,
    callsPerMonth: 10_000,
    selectedId: "deepseek-ai/deepseek-v4-flash",
  };

  // ---------- unit conversion ----------
  // Fields display words/chars when those units are selected; state always stores tokens.
  function tokensToDisplay(tokens) {
    if (state.unit === "words") return tokens * WORDS_PER_TOKEN;
    if (state.unit === "chars") return tokens * CHARS_PER_TOKEN;
    return tokens;
  }

  function displayToTokens(value) {
    if (state.unit === "words") return value / WORDS_PER_TOKEN;
    if (state.unit === "chars") return value / CHARS_PER_TOKEN;
    return value;
  }

  // ---------- cost ----------
  function costPerCall(model) {
    return (
      (state.inputTokens / 1e6) * model.inputPer1M +
      (state.outputTokens / 1e6) * model.outputPer1M
    );
  }

  function monthlyCost(model) {
    return costPerCall(model) * state.callsPerMonth;
  }

  // ---------- sorting ----------
  function sortedModels() {
    const arr = MODELS.slice();
    const cmp = {
      quality: (a, b) => (b.quality ?? -1) - (a.quality ?? -1),
      popularity: (a, b) => (a.popularity ?? Infinity) - (b.popularity ?? Infinity),
      price: (a, b) => a.inputPer1M + a.outputPer1M - (b.inputPer1M + b.outputPer1M),
      cost: (a, b) => monthlyCost(a) - monthlyCost(b),
    }[state.sort];
    return arr.sort(cmp);
  }

  // ---------- formatting ----------
  const fmtMoney = (n) =>
    n === 0
      ? "Free"
      : n < 0.01
        ? "$" + n.toFixed(4)
        : "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtPrice = (n) => (n === 0 ? "Free" : "$" + n.toFixed(2));

  const fmtContext = (n) => (n >= 1e6 ? (n / 1e6).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "M" : Math.round(n / 1000) + "K");

  const fmtInt = (n) => Math.round(n).toLocaleString("en-US");

  // ---------- results grid ----------
  const resultsEl = document.getElementById("results");

  function render() {
    resultsEl.innerHTML = "";
    for (const m of sortedModels()) {
      const card = document.createElement("article");
      card.className = "card" + (m.id === state.selectedId ? " selected" : "");
      card.innerHTML = `
        <div class="card-head">
          <span class="model-id">${m.id}</span>
          <span class="provider">${m.provider}</span>
        </div>
        <div class="stats">
          <div class="stat">
            <span class="stat-label">Context</span>
            <span class="stat-value">${fmtContext(m.context)}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Quality</span>
            <span class="stat-value">${m.quality ?? '<span class="dash">—</span>'}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Popularity</span>
            <span class="stat-value">${m.popularity != null ? "#" + m.popularity : '<span class="dash">—</span>'}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Per 1M Tokens</span>
            <span class="stat-value">In: ${fmtPrice(m.inputPer1M)}<br/>Out: ${fmtPrice(m.outputPer1M)}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Monthly Cost</span>
            <span class="stat-value cost">${fmtMoney(monthlyCost(m))}</span>
          </div>
        </div>
        <div class="caps">${m.capabilities.map((c) => `<span class="cap">${c}</span>`).join("")}</div>
      `;
      card.addEventListener("click", () => selectModel(m.id));
      resultsEl.appendChild(card);
    }
  }

  // ---------- model picker + detail panel ----------
  const selectEl = document.getElementById("modelSelect");
  const detailEl = document.getElementById("modelDetail");

  function buildSelect() {
    for (const m of MODELS) {
      const opt = document.createElement("option");
      opt.value = m.id;
      const price =
        m.inputPer1M === 0 && m.outputPer1M === 0
          ? "Free"
          : `${fmtPrice(m.inputPer1M)} in / ${fmtPrice(m.outputPer1M)} out per 1M`;
      opt.textContent = `${m.id} — ${price}`;
      selectEl.appendChild(opt);
    }
    selectEl.value = state.selectedId;
  }

  function selectModel(id) {
    state.selectedId = id;
    selectEl.value = id;
    update();
  }

  function renderDetail() {
    const m = MODELS.find((x) => x.id === state.selectedId);
    if (!m) return;
    detailEl.innerHTML = `
      <div class="detail-head">
        <div>
          <span class="model-id">${m.id}</span>
          <span class="provider">${m.provider}</span>
        </div>
        <div class="detail-cost">
          <span class="stat-label">Your monthly cost</span>
          <span class="stat-value cost">${fmtMoney(monthlyCost(m))}</span>
        </div>
      </div>
      <p class="description">${m.description}</p>
      <div class="detail-stats">
        <span><strong>Context:</strong> ${fmtContext(m.context)}</span>
        <span><strong>Quality:</strong> ${m.quality ?? "—"}${m.quality ? " (Theozard)" : ""}</span>
        <span><strong>Popularity:</strong> ${m.popularity != null ? "#" + m.popularity + " (OpenRouter)" : "—"}</span>
        <span><strong>Price:</strong> ${m.inputPer1M === 0 && m.outputPer1M === 0 ? "Free" : `${fmtPrice(m.inputPer1M)} in / ${fmtPrice(m.outputPer1M)} out per 1M`}</span>
      </div>
      <div class="detail-cols">
        <div>
          <h3>Specialties</h3>
          <ul class="good">${m.specialties.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
        <div>
          <h3>Limitations</h3>
          <ul class="bad">${m.limitations.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
      </div>
    `;
  }

  selectEl.addEventListener("change", () => selectModel(selectEl.value));

  function update() {
    render();
    renderDetail();
  }

  // ---------- inputs ----------
  const inputEl = document.getElementById("inputTokens");
  const outputEl = document.getElementById("outputTokens");
  const callsEl = document.getElementById("callsPerMonth");
  const inputLabel = document.getElementById("inputLabel");
  const outputLabel = document.getElementById("outputLabel");

  const UNIT_WORDS = { tokens: "Tokens", words: "Words", chars: "Characters" };

  function refreshFieldValues() {
    inputEl.value = fmtInt(tokensToDisplay(state.inputTokens));
    outputEl.value = fmtInt(tokensToDisplay(state.outputTokens));
    callsEl.value = state.callsPerMonth;
    inputLabel.innerHTML = `Input ${UNIT_WORDS[state.unit]} <em>(per call)</em>`;
    outputLabel.innerHTML = `Output ${UNIT_WORDS[state.unit]} <em>(per call)</em>`;
  }

  inputEl.addEventListener("input", () => {
    state.inputTokens = Math.max(0, displayToTokens(Number(inputEl.value) || 0));
    update();
  });
  outputEl.addEventListener("input", () => {
    state.outputTokens = Math.max(0, displayToTokens(Number(outputEl.value) || 0));
    update();
  });
  callsEl.addEventListener("input", () => {
    state.callsPerMonth = Math.max(0, Number(callsEl.value) || 0);
    update();
  });

  // ---------- segmented toggles ----------
  function wireToggle(containerId, key, onChange) {
    const container = document.getElementById(containerId);
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".seg");
      if (!btn) return;
      container.querySelectorAll(".seg").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state[key] = btn.dataset.unit || btn.dataset.sort;
      onChange && onChange();
    });
  }

  wireToggle("unitToggle", "unit", refreshFieldValues);
  wireToggle("sortToggle", "sort", render);

  // ---------- presets ----------
  const presetWrap = document.getElementById("presetButtons");
  for (const [key, p] of Object.entries(PRESETS)) {
    const btn = document.createElement("button");
    btn.className = "preset";
    btn.textContent = p.label;
    btn.addEventListener("click", () => {
      state.unit = "tokens";
      document.querySelectorAll('#unitToggle .seg').forEach((b) => b.classList.toggle("active", b.dataset.unit === "tokens"));
      state.inputTokens = p.inputTokens;
      state.outputTokens = p.outputTokens;
      state.callsPerMonth = p.callsPerMonth;
      refreshFieldValues();
      update();
    });
    presetWrap.appendChild(btn);
  }

  // ---------- init ----------
  buildSelect();
  refreshFieldValues();
  update();
})();
