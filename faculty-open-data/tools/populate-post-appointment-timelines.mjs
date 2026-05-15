import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const researchersPath = path.join(base, "data", "researchers.json");
const achievementsPath = path.join(base, "data", "achievements.json");
const researchersData = JSON.parse(fs.readFileSync(researchersPath, "utf8"));
const achievementsData = JSON.parse(fs.readFileSync(achievementsPath, "utf8"));
const achievementsById = new Map((achievementsData.items || []).map(item => [item.researcherId, item]));

const DATA_VERSION = "2026-05-16";
const CURRENT_YEAR = 2026;

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

const manualTimelines = {
  "kyoto-fserc-kawamura-mariko-2023": {
    source: "京都大学KDB",
    sourceUrl: "https://kdb.iimc.kyoto-u.ac.jp/profile/ja.2451ccaa09c40750.html",
    note: "京都大学KDBの論文リストを採用日以降で年別集計。既存の主著・共著判定を保持。",
    points: [
      { year: 2024, leadAuthor: 0, coauthored: 0 },
      { year: 2025, leadAuthor: 0, coauthored: 1 },
      { year: 2026, leadAuthor: 0, coauthored: 0 }
    ]
  },
  "kyoto-fserc-zhang-manqing-2022": {
    source: "京都大学KDB",
    sourceUrl: "https://kdb.iimc.kyoto-u.ac.jp/profile/ja.c45dfc2076126539.html",
    note: "京都大学KDBの論文リストを採用日以降で年別集計。既存の主著・共著判定を保持。",
    points: [
      { year: 2023, leadAuthor: 2, coauthored: 0 },
      { year: 2024, leadAuthor: 1, coauthored: 0 },
      { year: 2025, leadAuthor: 1, coauthored: 0 },
      { year: 2026, leadAuthor: 0, coauthored: 0 }
    ]
  },
  "hiroshima-okita-miki-2011": {
    source: "KAKEN",
    sourceUrl: "https://nrid.nii.ac.jp/ja/nrid/1000030611842/",
    note: "KAKEN研究成果のうち雑誌論文として確認できる2015年・2018年の2件を、着任後共著論文として年別集計。",
    points: [
      { year: 2011, leadAuthor: 0, coauthored: 0 },
      { year: 2012, leadAuthor: 0, coauthored: 0 },
      { year: 2013, leadAuthor: 0, coauthored: 0 },
      { year: 2014, leadAuthor: 0, coauthored: 0 },
      { year: 2015, leadAuthor: 0, coauthored: 1 },
      { year: 2016, leadAuthor: 0, coauthored: 0 },
      { year: 2017, leadAuthor: 0, coauthored: 0 },
      { year: 2018, leadAuthor: 0, coauthored: 1 },
      { year: 2019, leadAuthor: 0, coauthored: 0 },
      { year: 2020, leadAuthor: 0, coauthored: 0 },
      { year: 2021, leadAuthor: 0, coauthored: 0 },
      { year: 2022, leadAuthor: 0, coauthored: 0 },
      { year: 2023, leadAuthor: 0, coauthored: 0 },
      { year: 2024, leadAuthor: 0, coauthored: 0 },
      { year: 2025, leadAuthor: 0, coauthored: 0 },
      { year: 2026, leadAuthor: 0, coauthored: 0 }
    ]
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
  const links = [
    { url: researcher.baselinePublications?.sourceUrl },
    ...(researcher.sources || []),
    ...(achievement?.externalLinks || [])
  ];
  for (const link of links) {
    const permalink = extractResearchmapPermalink(link.url);
    if (permalink) return permalink;
  }
  return null;
}

function appointmentStartDate(item) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(item.appointmentDate || "")) {
    return item.appointmentDate;
  }
  if (Number.isFinite(item.appointmentYear)) {
    return `${item.appointmentYear}-04-01`;
  }
  if (Number.isFinite(item.fiscalYear)) {
    return `${item.fiscalYear + 1}-04-01`;
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

function yearFromPublicationDate(value) {
  const sortable = publicationSortDate(value);
  return Number(sortable.slice(0, 4));
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[.,・･'’`´\-\s]/g, "");
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
    variants.add(`${familyEn}, ${givenEn}`);
    variants.add(`${familyEn} ${givenEn}`);
  }
  return [...variants].map(normalizeName).filter(Boolean);
}

function firstAuthorNames(paper) {
  const authors = paper.authors || {};
  return Object.values(authors)
    .filter(Array.isArray)
    .map(list => list[0]?.name || list[0])
    .filter(Boolean);
}

function isOwnerLead(paper) {
  const roles = Array.isArray(paper.published_paper_owner_roles) ? paper.published_paper_owner_roles : [];
  return roles.some(role => ["lead", "first", "corresponding", "last"].includes(String(role)));
}

function isFirstAuthor(paper, variants) {
  return firstAuthorNames(paper).some(name => variants.includes(normalizeName(name)));
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
      await delay(250);
      return response.json();
    } catch (error) {
      lastError = error;
      await delay(800 * attempt);
    }
  }
  throw lastError;
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

function emptyTimeline(startYear) {
  const points = [];
  for (let year = startYear; year <= CURRENT_YEAR; year += 1) {
    points.push({ year, leadAuthor: 0, coauthored: 0 });
  }
  return points;
}

function upsertTimelineSource(researcher, label, url) {
  if (!url) return;
  researcher.sources = [
    ...(researcher.sources || []),
    { label, url }
  ].filter((source, index, sources) => sources.findIndex(other => other.url === source.url) === index);
}

function updateAchievementTimelineNote(researcher, note) {
  const achievement = achievementsById.get(researcher.id);
  if (!achievement) return;
  achievement.timelineNote = note;
}

const report = [];

for (const researcher of researchersData.researchers || []) {
  if (researcher.verificationStatus !== "verified") continue;

  const manual = manualTimelines[researcher.id];
  if (manual) {
    researcher.publicationTimeline = manual.points;
    researcher.timelineSource = {
      source: manual.source,
      sourceUrl: manual.sourceUrl,
      note: manual.note,
      updatedAt: DATA_VERSION
    };
    upsertTimelineSource(researcher, manual.source, manual.sourceUrl);
    updateAchievementTimelineNote(researcher, manual.note);
    report.push({ id: researcher.id, name: researcher.name, source: manual.source, points: manual.points.length });
    continue;
  }

  const achievement = achievementsById.get(researcher.id);
  const permalink = getResearchmapPermalink(researcher, achievement);

  if (!permalink) {
    if (Array.isArray(researcher.publicationTimeline) && researcher.publicationTimeline.length) {
      researcher.timelineSource = {
        source: "既存集計",
        note: "年別公開論文リストを機械取得できないため、既存の着任後推移集計を保持。",
        updatedAt: DATA_VERSION
      };
      report.push({ id: researcher.id, name: researcher.name, source: "kept existing timeline", points: researcher.publicationTimeline.length });
      continue;
    }
    const startYear = Number(researcher.appointmentYear || researcher.fiscalYear || CURRENT_YEAR);
    researcher.publicationTimeline = emptyTimeline(startYear);
    researcher.timelineSource = {
      source: "公開DB未連携",
      note: "年別公開論文リストを機械取得できないため、着任後推移は0件として表示し、追加確認対象とする。",
      updatedAt: DATA_VERSION
    };
    report.push({ id: researcher.id, name: researcher.name, source: "no permalink", points: researcher.publicationTimeline.length });
    continue;
  }

  const startDate = appointmentStartDate(researcher);
  const startYear = Number(startDate.slice(0, 4));
  const sourceUrl = `https://researchmap.jp/${permalink}/published_papers`;

  try {
    const profile = await fetchResearchmapProfile(permalink);
    const variants = nameVariants(profile, researcher.name);
    const papers = await fetchPublishedPapers(permalink);
    const timeline = emptyTimeline(startYear);
    const byYear = new Map(timeline.map(point => [point.year, point]));

    for (const paper of papers) {
      const publicationDate = publicationSortDate(paper.publication_date);
      const year = yearFromPublicationDate(paper.publication_date);
      if (!Number.isFinite(year) || year < startYear || year > CURRENT_YEAR || publicationDate < startDate) continue;
      const point = byYear.get(year);
      if (!point) continue;
      if (isOwnerLead(paper) || isFirstAuthor(paper, variants)) {
        point.leadAuthor += 1;
      } else {
        point.coauthored += 1;
      }
    }

    researcher.publicationTimeline = timeline;
    researcher.timelineSource = {
      source: "researchmap API",
      sourceUrl,
      startDate,
      note: `着任日 ${startDate} 以降のresearchmap published_papersを年別に集計。著者順・登録ロールで主著/共著を分離。`,
      updatedAt: DATA_VERSION
    };
    upsertTimelineSource(researcher, "researchmap API（着任後推移）", sourceUrl);
    updateAchievementTimelineNote(researcher, researcher.timelineSource.note);
    report.push({ id: researcher.id, name: researcher.name, source: "researchmap API", startDate, points: timeline.length });
  } catch (error) {
    const timeline = emptyTimeline(startYear);
    researcher.publicationTimeline = timeline;
    researcher.timelineSource = {
      source: "researchmap API取得失敗",
      sourceUrl,
      startDate,
      note: `researchmap API取得失敗のため、着任後推移は0件として表示し、追加確認対象とする。原因: ${error.message}`,
      updatedAt: DATA_VERSION
    };
    upsertTimelineSource(researcher, "researchmap API（着任後推移）", sourceUrl);
    report.push({ id: researcher.id, name: researcher.name, source: "fallback zero", error: error.message, points: timeline.length });
  }
}

researchersData.policy = researchersData.policy || {};
researchersData.policy.lastTimelineFix = "2026-05-16: Added post-appointment yearly lead/coauthor publication timelines for every verified researcher. Timelines are derived from researchmap API where available; KAKEN is used for the one record without researchmap papers.";
researchersData.updatedAt = DATA_VERSION;
achievementsData.updatedAt = DATA_VERSION;

fs.writeFileSync(researchersPath, `${JSON.stringify(researchersData, null, 2)}\n`, "utf8");
fs.writeFileSync(achievementsPath, `${JSON.stringify(achievementsData, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
