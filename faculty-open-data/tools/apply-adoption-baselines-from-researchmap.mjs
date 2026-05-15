import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const researchersPath = path.join(base, "data", "researchers.json");
const achievementsPath = path.join(base, "data", "achievements.json");

const researchersData = JSON.parse(fs.readFileSync(researchersPath, "utf8"));
const achievementsData = JSON.parse(fs.readFileSync(achievementsPath, "utf8"));
const achievementsById = new Map((achievementsData.items || []).map(item => [item.researcherId, item]));

const researchmapOverrides = {
  "kobe-chatani-eri-2014": "eri_chatani",
  "kobe-aihara-shoko-2014": "AiharaYoshiko",
  "kobe-matsumoto-fumiko-2014": "7000004137",
  "kobe-sato-harumi-2014": "polymer",
  "kobe-yamaguchi-aika-2014": "7000005742",
  "kobe-oshita-yuko-2014": "7000005665",
  "kobe-yasui-minami-2014": "south_y",
  "hiroshima-ogawa-yuko-2011": "_ogawa",
  "hiroshima-kanna-machi-2011": "read0148797",
  "tohoku-ifs-yakeno-aiko-2022": "aikoyakeno"
};

const preserveBaselineIds = new Set([
  "kyoto-fserc-kawamura-mariko-2023",
  "kyoto-fserc-zhang-manqing-2022",
  "tohoku-eng-ono-madoka-2023",
  "tohoku-eng-xu-chaonan-2023",
  "tohoku-eng-kubota-aya-2023",
  "nagoya-gender-saegusa-mayumi-2023",
  "tohoku-ifs-yakeno-aiko-2022"
]);

const manualBaselines = {
  "hiroshima-okita-miki-2011": {
    leadAuthor: 0,
    coauthored: 5,
    source: "KAKEN",
    sourceUrl: "https://nrid.nii.ac.jp/ja/nrid/1000030611842/",
    note: "researchmap公開ページを確認できないため、KAKEN研究成果5件を共著側の公開DB確認数として表示。"
  }
};

function extractResearchmapPermalink(url) {
  if (!url || !url.includes("researchmap.jp/")) return null;
  const parsed = new URL(url);
  return parsed.pathname
    .split("/")
    .filter(Boolean)
    .find(segment => !["published_papers", "research_experience", "teaching_experience"].includes(segment)) || null;
}

function getResearchmapPermalink(researcher, achievement) {
  if (researchmapOverrides[researcher.id]) return researchmapOverrides[researcher.id];
  const links = [...(researcher.sources || []), ...(achievement?.externalLinks || [])];
  for (const link of links) {
    const permalink = extractResearchmapPermalink(link.url);
    if (permalink) return permalink;
  }
  return null;
}

function fiscalCutoffDate(item) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(item.appointmentDate || "")) {
    return item.appointmentDate;
  }
  if (Number.isFinite(item.appointmentYear)) {
    return `${item.appointmentYear}-03-31`;
  }
  if (Number.isFinite(item.fiscalYear)) {
    return `${item.fiscalYear}-03-31`;
  }
  return "9999-12-31";
}

function publicationSortDate(value) {
  if (!value || typeof value !== "string") return "9999-12-31";
  const date = value.trim();
  if (/^\d{4}$/.test(date)) return `${date}-12-31`;
  if (/^\d{4}-\d{2}$/.test(date)) {
    const [year, month] = date.split("-").map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  return "9999-12-31";
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[.,・･'’`´\-\s]/g, "");
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function authorNames(paper) {
  const authors = paper.authors || {};
  const lists = Object.values(authors).filter(Array.isArray);
  if (!lists.length) return [];
  return lists.flat().map(author => author.name || author).filter(Boolean);
}

function firstAuthorNames(paper) {
  const authors = paper.authors || {};
  const lists = Object.values(authors).filter(Array.isArray);
  return lists.map(list => list[0]?.name || list[0]).filter(Boolean);
}

function nameVariants(profile, researcherName) {
  const variants = new Set([researcherName]);
  const familyJa = profile.family_name?.ja;
  const givenJa = profile.given_name?.ja;
  const familyEn = profile.family_name?.en;
  const givenEn = profile.given_name?.en;
  if (familyJa && givenJa) {
    variants.add(`${familyJa}${givenJa}`);
    variants.add(`${familyJa} ${givenJa}`);
  }
  if (familyEn && givenEn) {
    variants.add(`${givenEn} ${familyEn}`);
    variants.add(`${familyEn} ${givenEn}`);
    variants.add(`${familyEn}, ${givenEn}`);
  }
  return [...variants].map(normalizeName).filter(Boolean);
}

function isOwnerLead(paper) {
  const roles = asArray(paper.published_paper_owner_roles);
  return roles.some(role => ["lead", "first", "corresponding", "last"].includes(String(role)));
}

function isFirstAuthor(paper, variants) {
  return firstAuthorNames(paper).some(name => variants.includes(normalizeName(name)));
}

async function fetchJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}: ${url}`);
      }
      await delay(250);
      return response.json();
    } catch (error) {
      lastError = error;
      await delay(800 * attempt);
    }
  }
  throw lastError;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchResearchmapProfile(permalink) {
  return fetchJson(`https://api.researchmap.jp/${encodeURIComponent(permalink)}?format=json`);
}

async function fetchPublishedPapers(permalink) {
  const firstPage = await fetchJson(`https://api.researchmap.jp/${encodeURIComponent(permalink)}/published_papers?limit=100`);
  const items = [...(firstPage.items || [])];
  const total = firstPage.total_items || items.length;
  for (let start = 101; start <= total; start += 100) {
    const page = await fetchJson(`https://api.researchmap.jp/${encodeURIComponent(permalink)}/published_papers?start=${start}&limit=100`);
    items.push(...(page.items || []));
  }
  return items;
}

function upsertAchievementMetrics(researcher, sourceLabel, sourceUrl, baseline, cutoff) {
  const item = achievementsById.get(researcher.id);
  if (!item) return;
  item.metrics = {
    ...(item.metrics || {}),
    outputLabel: "採択時論文",
    totalOutputs: baseline.leadAuthor + baseline.coauthored,
    baselineLeadAuthor: baseline.leadAuthor,
    baselineCoauthored: baseline.coauthored,
    baselineCutoff: cutoff,
    source: sourceLabel,
    note: "採択時点までのresearchmap published_papersを著者順と登録ロールで主著・共著に分けて集計。"
  };
  item.externalLinks = [
    { label: sourceLabel, url: sourceUrl },
    ...(item.externalLinks || [])
  ].filter((link, index, links) => links.findIndex(other => other.url === link.url) === index);
}

function applyBaseline(researcher, baseline) {
  researcher.baselinePublications = {
    leadAuthor: baseline.leadAuthor,
    coauthored: baseline.coauthored,
    source: baseline.source,
    sourceUrl: baseline.sourceUrl,
    note: baseline.note
  };
  researcher.metricVerificationNote = baseline.note;
  researcher.sources = [
    ...(researcher.sources || []),
    { label: baseline.source, url: baseline.sourceUrl }
  ].filter((link, index, links) => links.findIndex(other => other.url === link.url) === index);
}

const report = [];

for (const researcher of researchersData.researchers || []) {
  if (researcher.verificationStatus !== "verified") continue;

  if (preserveBaselineIds.has(researcher.id)) {
    const baseline = researcher.baselinePublications || {};
    if (Number.isFinite(baseline.leadAuthor) || Number.isFinite(baseline.coauthored)) {
      baseline.source ||= researcher.id.startsWith("kyoto-") ? "京都大学KDB" : "添付画像 + 公開DB確認";
      baseline.sourceUrl ||= researcher.sources?.find(source => source.url)?.url || "";
      baseline.note ||= "採択時の主著・共著数として既存の一次資料由来カウントを保持。";
    }
    continue;
  }

  const manual = manualBaselines[researcher.id];
  if (manual) {
    applyBaseline(researcher, manual);
    upsertAchievementMetrics(researcher, manual.source, manual.sourceUrl, manual, fiscalCutoffDate(researcher));
    report.push({ id: researcher.id, name: researcher.name, source: manual.source, lead: manual.leadAuthor, co: manual.coauthored });
    continue;
  }

  const achievement = achievementsById.get(researcher.id);
  const permalink = getResearchmapPermalink(researcher, achievement);
  if (!permalink) {
    const fallbackTotal = achievement?.metrics?.totalOutputs;
    if (Number.isFinite(fallbackTotal)) {
      const source = achievement.metrics.source || "公開DB";
      const sourceUrl = achievement.externalLinks?.find(link => link.url)?.url || researcher.sources?.find(link => link.url)?.url || "";
      const note = "researchmap APIの論文リストを特定できないため、既存の公開DB総論文数を共著側に退避して表示。";
      applyBaseline(researcher, { leadAuthor: 0, coauthored: fallbackTotal, source, sourceUrl, note });
      report.push({ id: researcher.id, name: researcher.name, source, lead: 0, co: fallbackTotal, fallback: true });
    } else {
      report.push({ id: researcher.id, name: researcher.name, error: "no researchmap permalink" });
    }
    continue;
  }

  try {
    const cutoff = fiscalCutoffDate(researcher);
    const profile = await fetchResearchmapProfile(permalink);
    const variants = nameVariants(profile, researcher.name);
    const papers = await fetchPublishedPapers(permalink);
    const adopted = papers.filter(paper => publicationSortDate(paper.publication_date) <= cutoff);
    const leadAuthor = adopted.filter(paper => isOwnerLead(paper) || isFirstAuthor(paper, variants)).length;
    const coauthored = Math.max(0, adopted.length - leadAuthor);
    const sourceUrl = `https://researchmap.jp/${permalink}/published_papers`;
    const source = "researchmap API";
    const note = `採択時カットオフ ${cutoff} までのresearchmap published_papers ${adopted.length}件を、著者順・登録ロールで主著${leadAuthor}件、共著${coauthored}件に分離。`;

    applyBaseline(researcher, { leadAuthor, coauthored, source, sourceUrl, note });
    upsertAchievementMetrics(researcher, source, sourceUrl, { leadAuthor, coauthored }, cutoff);
    report.push({ id: researcher.id, name: researcher.name, permalink, cutoff, lead: leadAuthor, co: coauthored, total: adopted.length });
  } catch (error) {
    const fallbackTotal = achievement?.metrics?.totalOutputs;
    if (Number.isFinite(fallbackTotal)) {
      const source = achievement.metrics.source || "公開DB";
      const sourceUrl = achievement.externalLinks?.find(link => link.url)?.url || `https://researchmap.jp/${permalink}/published_papers`;
      const note = `researchmap API取得失敗のため、既存の公開DB総論文数${fallbackTotal}件を共著側に退避して表示。原因: ${error.message}`;
      applyBaseline(researcher, { leadAuthor: 0, coauthored: fallbackTotal, source, sourceUrl, note });
      report.push({ id: researcher.id, name: researcher.name, permalink, source, lead: 0, co: fallbackTotal, fallback: true, error: error.message });
    } else {
      report.push({ id: researcher.id, name: researcher.name, permalink, error: error.message });
    }
  }
}

researchersData.policy = researchersData.policy || {};
researchersData.policy.lastBaselineSplitFix = "2026-05-15: Adoption-time lead/coauthor counts were split from researchmap API published_papers where available, with achievement source moved into a separate table column.";
researchersData.updatedAt = "2026-05-15";
achievementsData.updatedAt = "2026-05-15";

fs.writeFileSync(researchersPath, `${JSON.stringify(researchersData, null, 2)}\n`, "utf8");
fs.writeFileSync(achievementsPath, `${JSON.stringify(achievementsData, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
