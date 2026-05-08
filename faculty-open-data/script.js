const state = {
  researchers: [],
  candidateCalls: [],
  callStatistics: {},
  filtered: [],
  selectedId: null
};

const els = {
  year: document.querySelector("#yearFilter"),
  field: document.querySelector("#fieldFilter"),
  university: document.querySelector("#universityFilter"),
  keyword: document.querySelector("#keywordFilter"),
  rows: document.querySelector("#researcherRows"),
  total: document.querySelector("#totalCount"),
  fy2023Calls: document.querySelector("#fy2023CallCount"),
  universities: document.querySelector("#universityCount"),
  candidates: document.querySelector("#candidateCount"),
  candidateCalls: document.querySelector("#candidateCalls"),
  detailName: document.querySelector("#detailName"),
  detailMeta: document.querySelector("#detailMeta"),
  achievements: document.querySelector("#achievementPanel"),
  sources: document.querySelector("#sourceLinks"),
  chart: document.querySelector("#publicationChart")
};

async function loadData() {
  const [response, achievementsResponse] = await Promise.all([
    fetch("data/researchers.json", { cache: "no-store" }),
    fetch("data/achievements.json", { cache: "no-store" })
  ]);
  const data = await response.json();
  const achievementsData = await achievementsResponse.json();
  const achievementsById = new Map((achievementsData.items || []).map(item => [item.researcherId, item]));
  state.researchers = data.researchers.filter(item => item.verificationStatus === "verified");
  state.researchers.forEach(item => {
    item.achievements = achievementsById.get(item.id) || null;
  });
  state.candidateCalls = data.candidateCalls || [];
  state.callStatistics = data.callStatistics || {};
  state.filtered = [...state.researchers];
  populateFilters();
  render();
}

function populateFilters() {
  fillSelect(els.year, uniqueValues(state.researchers.map(item => item.fiscalYear)).sort((a, b) => b - a));
  fillSelect(els.field, uniqueValues(state.researchers.map(item => item.field)).sort());
  fillSelect(els.university, uniqueValues(state.researchers.map(item => item.university)).sort());
}

function fillSelect(select, values) {
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function applyFilters() {
  const keyword = els.keyword.value.trim().toLowerCase();
  state.filtered = state.researchers.filter(item => {
    const yearOk = els.year.value === "all" || String(item.fiscalYear) === els.year.value;
    const fieldOk = els.field.value === "all" || item.field === els.field.value;
    const universityOk = els.university.value === "all" || item.university === els.university.value;
    const keywordText = [
      item.name,
      item.university,
      item.department,
      item.field,
      item.evidenceNote
    ].join(" ").toLowerCase();
    return yearOk && fieldOk && universityOk && (!keyword || keywordText.includes(keyword));
  });
  render();
}

function render() {
  renderSummary();
  renderRows();
  renderCandidateCalls();
  const selected = state.filtered.find(item => item.id === state.selectedId) || state.filtered[0];
  renderDetail(selected);
}

function renderSummary() {
  els.total.textContent = state.filtered.length;
  els.fy2023Calls.textContent = state.callStatistics.fy2023WomenOnlyCalls || 0;
  els.universities.textContent = uniqueValues([
    ...state.researchers.map(item => item.university),
    ...state.candidateCalls.map(item => item.university)
  ]).length;
  els.candidates.textContent = state.candidateCalls.length;
}

function renderRows() {
  els.rows.innerHTML = "";
  if (!state.filtered.length) {
    const row = document.createElement("tr");
    row.className = "empty-row";
    row.innerHTML = '<td colspan="7">確認済みデータはまだ登録されていません。公式発表で採用者と公募種別を確認できたものから追加します。</td>';
    els.rows.appendChild(row);
    return;
  }

  state.filtered.forEach(item => {
    const row = document.createElement("tr");
    row.className = item.id === state.selectedId ? "is-active" : "";
    row.innerHTML = `
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.fiscalYear)}</td>
      <td>${escapeHtml(item.university)}</td>
      <td>${escapeHtml(item.department)}</td>
      <td>${escapeHtml(item.field)}</td>
      <td>${formatBaselineCount(item, "leadAuthor")}</td>
      <td>${formatBaselineCount(item, "coauthored")}</td>
    `;
    row.addEventListener("click", () => {
      state.selectedId = item.id;
      render();
    });
    els.rows.appendChild(row);
  });
}

function renderCandidateCalls() {
  els.candidateCalls.innerHTML = "";
  state.candidateCalls.forEach(item => {
    const card = document.createElement("article");
    card.className = "candidate-card";
    card.innerHTML = `
      <div class="candidate-topline">
        <span>${escapeHtml(item.fiscalYear)}年度</span>
        <span>${escapeHtml(item.statusLabel)}</span>
      </div>
      <h3>${escapeHtml(item.candidateName || item.university)}</h3>
      ${item.candidateName ? `<p class="candidate-name-meta">${escapeHtml(item.university)}</p>` : ""}
      <p>${escapeHtml(item.department)}</p>
      <dl>
        <div><dt>職位</dt><dd>${escapeHtml(item.position)}</dd></div>
        <div><dt>分野</dt><dd>${escapeHtml(item.field)}</dd></div>
        <div><dt>採用予定</dt><dd>${escapeHtml(item.appointmentDate)}</dd></div>
      </dl>
      <p class="candidate-note">${escapeHtml(item.note)}</p>
      ${renderCandidateSources(item)}
    `;
    els.candidateCalls.appendChild(card);
  });
}

function renderCandidateSources(item) {
  const sources = item.sources || (item.source ? [item.source] : []);
  return sources.map(source => `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label || "根拠を見る")}</a>`).join("");
}

function renderDetail(item) {
  if (!item) {
    els.detailName.textContent = "データを選択";
    els.detailMeta.textContent = "確認済みデータが追加されると、ここに採用後の論文数推移を表示します。";
    els.achievements.innerHTML = "";
    els.sources.innerHTML = "";
    drawChart(null);
    return;
  }

  els.detailName.textContent = item.name;
  els.detailMeta.textContent = `${item.fiscalYear}年度 / ${item.university} / ${item.department} / ${item.field}`;
  renderAchievements(item);
  els.sources.innerHTML = item.sources.map(source => `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a>`).join("");
  drawChart(item);
}

function renderAchievements(item) {
  const achievements = item.achievements || {};
  const publications = achievements.publications || [];
  const externalLinks = achievements.externalLinks || [];
  const metrics = achievements.metrics
    ? `<p class="achievement-metrics"><strong>公開DB集計:</strong> ${escapeHtml(getMetricLabel(achievements.metrics))} ${escapeHtml(getMetricTotal(achievements.metrics))}件 / ${escapeHtml(getMetricSource(achievements.metrics))}</p>`
    : "";
  const paperItems = publications.length
    ? publications.map(pub => `
        <li>
          <span>${escapeHtml(pub.year || "年不明")}</span>
          <strong>${escapeHtml(pub.title)}</strong>
          <em>${escapeHtml(pub.venue || "")}${pub.role ? ` / ${escapeHtml(pub.role)}` : ""}</em>
        </li>
      `).join("")
    : '<li class="achievement-empty">ページ内の全件転記は照合作業中です。下の外部DBで全業績を確認できます。</li>';

  const linkItems = externalLinks.length
    ? externalLinks.map(link => `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`).join("")
    : "";

  els.achievements.innerHTML = `
    <section>
      ${metrics}
      <h3>業績</h3>
      <p>${escapeHtml(achievements.summary || "業績情報は確認中です。")}</p>
      <ul class="achievement-list">${paperItems}</ul>
      <div class="achievement-links">${linkItems}</div>
    </section>
  `;
}

function drawChart(item) {
  const ctx = els.chart.getContext("2d");
  const width = els.chart.width;
  const height = els.chart.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#080d14";
  ctx.fillRect(0, 0, width, height);

  if (!item || !item.publicationTimeline?.length) {
    if (item?.achievements?.metrics) {
      drawMetricsSummary(ctx, item.achievements.metrics, width, height);
      return;
    }
    ctx.fillStyle = "#9fb0c3";
    ctx.font = "20px Segoe UI";
    ctx.fillText("確認済みデータの追加待ちです", 32, 70);
    return;
  }

  const padding = 52;
  const points = item.publicationTimeline;
  const maxValue = Math.max(1, ...points.flatMap(point => [point.leadAuthor, point.coauthored]));
  drawAxis(ctx, width, height, padding, maxValue);
  drawSeries(ctx, points, "leadAuthor", "#6ff3e6", width, height, padding, maxValue);
  drawSeries(ctx, points, "coauthored", "#ffd166", width, height, padding, maxValue);
  drawLegend(ctx);
}

function drawMetricsSummary(ctx, metrics, width, height) {
  const total = getMetricTotal(metrics);
  const label = getMetricLabel(metrics);
  const source = getMetricSource(metrics);
  ctx.fillStyle = "#9fb0c3";
  ctx.font = "18px Segoe UI";
  ctx.fillText("公開DB集計", 32, 58);
  ctx.fillStyle = "#6ff3e6";
  ctx.font = "34px Segoe UI";
  ctx.fillText(`${label} ${total}件`, 32, 112);
  ctx.fillStyle = "#ffd166";
  ctx.font = "18px Segoe UI";
  ctx.fillText(source, 32, 150);
  ctx.fillStyle = "#9fb0c3";
  ctx.font = "14px Segoe UI";
  ctx.fillText("採択時点の筆頭/共著分類ではなく、公開DBに表示される確認済み総数です。", 32, height - 44);
}

function drawAxis(ctx, width, height, padding, maxValue) {
  ctx.strokeStyle = "rgba(255,255,255,.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  ctx.fillStyle = "#9fb0c3";
  ctx.font = "14px Segoe UI";
  ctx.fillText(`0`, 24, height - padding + 5);
  ctx.fillText(`${maxValue}`, 20, padding + 5);
}

function drawSeries(ctx, points, key, color, width, height, padding, maxValue) {
  const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = padding + xStep * index;
    const y = height - padding - (point[key] / maxValue) * (height - padding * 2);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  points.forEach((point, index) => {
    const x = padding + xStep * index;
    const y = height - padding - (point[key] / maxValue) * (height - padding * 2);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9fb0c3";
    ctx.font = "12px Segoe UI";
    ctx.fillText(point.year, x - 16, height - 22);
    ctx.fillStyle = color;
  });
}

function drawLegend(ctx) {
  ctx.font = "14px Segoe UI";
  ctx.fillStyle = "#6ff3e6";
  ctx.fillText("主著論文", 52, 28);
  ctx.fillStyle = "#ffd166";
  ctx.fillText("共著論文", 142, 28);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatCount(value) {
  return value === null || value === undefined ? "未集計" : escapeHtml(value);
}

function formatBaselineCount(item, key) {
  const value = item.baselinePublications?.[key];
  if (value !== null && value !== undefined) {
    return escapeHtml(value);
  }
  const metrics = item.achievements?.metrics;
  if (!metrics) {
    return "未集計";
  }
  if (key === "leadAuthor") {
    return `${escapeHtml(getMetricLabel(metrics))} ${escapeHtml(getMetricTotal(metrics))}`;
  }
  return escapeHtml(getMetricSource(metrics));
}

function getMetricTotal(metrics) {
  return metrics.totalOutputs ?? metrics.totalPublications ?? metrics.primary ?? "未集計";
}

function getMetricLabel(metrics) {
  return metrics.outputLabel || "総論文";
}

function getMetricSource(metrics) {
  return metrics.source || metrics.secondary || "公開DB";
}

[els.year, els.field, els.university, els.keyword].forEach(input => {
  input.addEventListener("input", applyFilters);
});

loadData().catch(error => {
  console.error(error);
  els.rows.innerHTML = '<tr class="empty-row"><td colspan="7">データの読み込みに失敗しました。</td></tr>';
});
