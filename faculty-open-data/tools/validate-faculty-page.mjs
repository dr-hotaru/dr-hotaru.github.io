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

for (const file of ["data/researchers.json", "data/achievements.json"]) {
  JSON.parse(fs.readFileSync(path.join(base, file), "utf8"));
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
const hasFailure = failureText.includes("失敗") || failureText.includes("螟ｱ謨");

if (hasFailure || rows.children.length === 0) {
  throw new Error("Faculty page render validation failed before publish.");
}

console.log(`Faculty page validation passed: ${rows.children.length} rows rendered.`);
