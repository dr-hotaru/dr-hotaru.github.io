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
JSON.parse(fs.readFileSync(path.join(base, "data/achievements.json"), "utf8"));

const placeholderPattern = /\?{2,}|�/;
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

const context = {
  console,
  document: {
    querySelector: getElement,
    createElement: tag => new ElementMock(tag)
  },
  fetch: async url => ({
    json: async () => JSON.parse(fs.readFileSync(path.join(base, url), "utf8"))
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

console.log(`Faculty page validation passed: ${rows.children.length} rows rendered.`);
