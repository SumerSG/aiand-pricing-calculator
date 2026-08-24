// ai& Pricing Calculator — UI logic
(function () {
  "use strict";

  const MAX_SLOTS = 2;

  const state = {
    unit: "tokens",      // tokens | words | chars
    sort: "quality",     // quality | popularity | price | cost
    inputTokens: 2_000,
    outputTokens: 500,
    callsPerMonth: 10_000,
    slots: ["deepseek-ai/deepseek-v4-flash"],
    activePreset: null,
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

  // ---------- results grid ----------
  const resultsEl = document.getElementById("results");

  function render() {
    resultsEl.innerHTML = "";
    for (const m of sortedModels()) {
      const card = document.createElement("article");
      card.className = "card" + (state.slots.includes(m.id) ? " selected" : "");
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
      card.addEventListener("click", () => {
        state.slots[0] = m.id;
        update();
      });
      resultsEl.appendChild(card);
    }
  }

  // ---------- model picker slots + detail panels ----------
  const pickerSlotsEl = document.getElementById("pickerSlots");

  // Dropdown options show only the model name; prices live in the detail panel.
  function optionLabel(m) {
    return m.id;
  }

  function detailHTML(m) {
    return `
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

  function renderSlots() {
    pickerSlotsEl.innerHTML = "";
    pickerSlotsEl.classList.toggle("two", state.slots.length > 1);

    state.slots.forEach((id, i) => {
      const m = MODELS.find((x) => x.id === id);
      if (!m) return;

      const slot = document.createElement("div");
      slot.className = "slot";

      // controls row: dropdown + add/remove
      const controls = document.createElement("div");
      controls.className = "slot-controls";

      const select = document.createElement("select");
      select.setAttribute("aria-label", "Model");
      for (const mod of MODELS) {
        const opt = document.createElement("option");
        opt.value = mod.id;
        opt.textContent = optionLabel(mod);
        select.appendChild(opt);
      }
      select.value = id;
      select.addEventListener("change", () => {
        state.slots[i] = select.value;
        update();
      });
      controls.appendChild(select);

      if (i === 0 && state.slots.length < MAX_SLOTS) {
        const add = document.createElement("button");
        add.className = "slot-btn add-model";
        add.textContent = "+ Add model";
        add.addEventListener("click", () => {
          // default the new slot to a model that isn't already shown
          const next = MODELS.find((x) => !state.slots.includes(x.id));
          if (next) state.slots.push(next.id);
          update();
        });
        controls.appendChild(add);
      }

      if (i > 0) {
        const rm = document.createElement("button");
        rm.className = "slot-btn remove-model";
        rm.textContent = "×";
        rm.setAttribute("aria-label", "Remove model");
        rm.addEventListener("click", () => {
          state.slots.splice(i, 1);
          update();
        });
        controls.appendChild(rm);
      }

      slot.appendChild(controls);

      const detail = document.createElement("article");
      detail.className = "model-detail";
      detail.innerHTML = detailHTML(m);
      slot.appendChild(detail);

      pickerSlotsEl.appendChild(slot);
    });
  }

  function update() {
    render();
    renderSlots();
  }

  // ---------- inputs ----------
  const inputEl = document.getElementById("inputTokens");
  const outputEl = document.getElementById("outputTokens");
  const callsEl = document.getElementById("callsPerMonth");
  const inputLabel = document.getElementById("inputLabel");
  const outputLabel = document.getElementById("outputLabel");

  const UNIT_WORDS = { tokens: "Tokens", words: "Words", chars: "Characters" };

  function refreshFieldValues() {
    // number inputs reject locale-formatted strings ("2,000") — use plain digits
    inputEl.value = String(Math.round(tokensToDisplay(state.inputTokens)));
    outputEl.value = String(Math.round(tokensToDisplay(state.outputTokens)));
    callsEl.value = String(state.callsPerMonth);
    inputLabel.innerHTML = `Input ${UNIT_WORDS[state.unit]} <em>(per call)</em>`;
    outputLabel.innerHTML = `Output ${UNIT_WORDS[state.unit]} <em>(per call)</em>`;
  }

  // Editing inputs manually detaches the active preset and its sample download
  function clearPreset() {
    if (!state.activePreset) return;
    state.activePreset = null;
    presetWrap.querySelectorAll(".preset").forEach((b) => b.classList.remove("active"));
    renderSampleButton();
  }

  inputEl.addEventListener("input", () => {
    state.inputTokens = Math.max(0, displayToTokens(Number(inputEl.value) || 0));
    clearPreset();
    update();
  });
  outputEl.addEventListener("input", () => {
    state.outputTokens = Math.max(0, displayToTokens(Number(outputEl.value) || 0));
    clearPreset();
    update();
  });
  callsEl.addEventListener("input", () => {
    state.callsPerMonth = Math.max(0, Number(callsEl.value) || 0);
    clearPreset();
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

  // ---------- presets + sample download ----------
  const presetWrap = document.getElementById("presetButtons");
  const sampleWrap = document.getElementById("sampleDownload");

  function fileExt(name) {
    return name.slice(name.lastIndexOf(".") + 1);
  }

  function renderSampleButton() {
    sampleWrap.innerHTML = "";
    const p = state.activePreset ? PRESETS[state.activePreset] : null;

    if (p && p.sample) {
      const a = document.createElement("a");
      a.className = "sample-btn";
      a.href = `samples/${p.sample}`;
      a.setAttribute("download", p.sample);
      a.textContent = `↓ Download sample (.${fileExt(p.sample)})`;
      sampleWrap.appendChild(a);

      const note = document.createElement("span");
      note.className = "sample-note";
      note.textContent = `Example output for the "${p.label}" preset`;
      sampleWrap.appendChild(note);
    } else {
      const hint = document.createElement("span");
      hint.className = "sample-note";
      hint.textContent = "Pick a quick example above to download a sample output.";
      sampleWrap.appendChild(hint);
    }

    const all = document.createElement("a");
    all.className = "sample-all";
    all.href = "samples/all-samples.zip";
    all.setAttribute("download", "all-samples.zip");
    all.textContent = "All samples (.zip)";
    sampleWrap.appendChild(all);
  }

  for (const [key, p] of Object.entries(PRESETS)) {
    const btn = document.createElement("button");
    btn.className = "preset";
    btn.textContent = p.label;
    btn.addEventListener("click", () => {
      state.unit = "tokens";
      document.querySelectorAll('#unitToggle .seg').forEach((b) => b.classList.toggle("active", b.dataset.unit === "tokens"));
      state.activePreset = key;
      presetWrap.querySelectorAll(".preset").forEach((b) => b.classList.toggle("active", b === btn));
      state.inputTokens = p.inputTokens;
      state.outputTokens = p.outputTokens;
      state.callsPerMonth = p.callsPerMonth;
      refreshFieldValues();
      renderSampleButton();
      update();
    });
    presetWrap.appendChild(btn);
  }

  // ---------- theme toggle ----------
  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // ---------- init ----------
  refreshFieldValues();
  renderSampleButton();
  update();
})();
