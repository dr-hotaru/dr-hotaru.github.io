import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

class ElementMock {
  constructor(selector) {
    this.selector = selector;
    this.children = [];
    this.value = "";
    this.textContent = "";
    this.innerHTML = "";
    this.className = "";
    this.style = {};
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  addEventListener() {}

  getContext() {
    return {
      clearRect() {},
      fillRect() {},
      fillText() {},
      beginPath() {},
      moveTo() {},
      lineTo() {},
      stroke() {},
      arc() {},
      fill() {},
      set fillStyle(_value) {},
      set font(_value) {},
      set lineWidth(_value) {},
      set strokeStyle(_value) {}
    };
  }
}

const elements = new Map();
const getElement = selector => {
  if (!elements.has(selector)) {
    elements.set(selector, new ElementMock(selector));
  }
  return elements.get(selector);
};

const data = JSON.parse(fs.readFileSync(path.join(base, "data/researchers.json"), "utf8"));
const achievementsData = JSON.parse(fs.readFileSync(path.join(base, "data/achievements.json"), "utf8"));
const achievementsByResearcher = new Map(
  (achievementsData.items || []).map(item => [item.researcherId, item])
);

const placeholderPattern = /\?{2,}|\uFFFD/;
const hasPlaceholderText = value => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return placeholderPattern.test(value);
  if (Array.isArray(value)) return value.some(hasPlaceholderText);
  if (typeof value === "object") return Object.values(value).some(hasPlaceholderText);
  return false;
};

const badVerified = (data.researchers || []).filter(item =>
  item.verificationStatus === "verified" && hasPlaceholderText(item)
);

if (badVerified.length) {
  throw new Error(`Verified faculty data contains placeholder text: ${badVerified.map(item => item.id).join(", ")}`);
}

const romanizedVerified = (data.researchers || []).filter(item =>
  item.verificationStatus === "verified" && /^[A-Za-z][A-Za-z\s.'-]+$/.test(item.name || "")
);

if (romanizedVerified.length) {
  throw new Error(`Verified faculty data contains romanized names: ${romanizedVerified.map(item => item.id).join(", ")}`);
}

const hasBaselineMetrics = item => {
  const baseline = item.baselinePublications || {};
  return Number.isFinite(baseline.leadAuthor) && Number.isFinite(baseline.coauthored);
};

const uncountedVerified = (data.researchers || []).filter(item =>
  item.verificationStatus === "verified" && !hasBaselineMetrics(item)
);

if (uncountedVerified.length) {
  throw new Error(`Verified faculty data is missing split baseline publication metrics: ${uncountedVerified.map(item => item.id).join(", ")}`);
}

const missingBaselineSource = (data.researchers || []).filter(item =>
  item.verificationStatus === "verified" && !item.baselinePublications?.source
);

if (missingBaselineSource.length) {
  throw new Error(`Verified faculty data is missing baseline achievement source: ${missingBaselineSource.map(item => item.id).join(", ")}`);
}

const missingTimeline = (data.researchers || []).filter(item =>
  item.verificationStatus === "verified" && (
    !Array.isArray(item.publicationTimeline) || item.publicationTimeline.length === 0
  )
);

if (missingTimeline.length) {
  throw new Error(`Verified faculty data is missing post-appointment publication timeline: ${missingTimeline.map(item => item.id).join(", ")}`);
}

const invalidTimeline = (data.researchers || []).filter(item =>
  item.verificationStatus === "verified" && item.publicationTimeline.some(point =>
    !Number.isFinite(point.year) || !Number.isFinite(point.leadAuthor) || !Number.isFinite(point.coauthored)
  )
);

if (invalidTimeline.length) {
  throw new Error(`Verified faculty data has invalid post-appointment timeline values: ${invalidTimeline.map(item => item.id).join(", ")}`);
}

const context = {
  console,
  document: {
    querySelector: getElement,
    createElement: tag => new ElementMock(tag)
  },
  fetch: async url => ({
    json: async () => {
      const cleanUrl = String(url).split("?")[0];
      return JSON.parse(fs.readFileSync(path.join(base, cleanUrl), "utf8"));
    }
  }),
  Map,
  Set,
  Math,
  Promise,
  String,
  Number,
  Array
};

vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(base, "script.js"), "utf8"),
  context,
  { filename: "faculty-open-data/script.js" }
);

await new Promise(resolve => setTimeout(resolve, 0));

const rows = getElement("#researcherRows");
const failureText = String(rows.innerHTML || "");
const hasFailure = failureText.includes("失敗");

if (hasFailure || rows.children.length === 0) {
  throw new Error("Faculty page render validation failed before publish.");
}

const extractCells = html => [...String(html).matchAll(/<td(?:\s[^>]*)?>([\s\S]*?)<\/td>/g)]
  .map(match => match[1].replace(/<[^>]+>/g, "").trim());

const malformedRows = rows.children
  .map(row => extractCells(row.innerHTML))
  .filter(cells => cells.length !== 8 || !/^\d+$/.test(cells[5]) || !/^\d+$/.test(cells[6]));

if (malformedRows.length) {
  throw new Error("Faculty table rows must render 8 cells with numeric lead/coauthor columns.");
}

const sourceLeakPattern = /researchmap|KAKEN|J-GLOBAL|KDB|公開DB|API/i;
const sourceLeaks = rows.children
  .map(row => extractCells(row.innerHTML))
  .filter(cells => sourceLeakPattern.test(cells[5]) || sourceLeakPattern.test(cells[6]));

if (sourceLeaks.length) {
  throw new Error("Achievement source text leaked into lead/coauthor columns.");
}

console.log(`Faculty page validation passed: ${rows.children.length} rows rendered.`);
