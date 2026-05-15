import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const researchersPath = path.join(base, "data", "researchers.json");
const achievementsPath = path.join(base, "data", "achievements.json");

const researchersData = JSON.parse(fs.readFileSync(researchersPath, "utf8"));
const achievementsData = JSON.parse(fs.readFileSync(achievementsPath, "utf8"));

const sourceNewsletter = {
  label: "神戸大学男女共同参画推進室 Newsletter No.35（新規養成女性教員一覧）",
  url: "https://www.office.kobe-u.ac.jp/opge-kyodo-sankaku/data/issues/images/newsno35.pdf"
};

const kobeNameUpdates = {
  "kobe-kuroda-keiko-2014": {
    name: "黒田 慶子",
    university: "神戸大学",
    department: "農学研究科",
    position: "教授",
    field: "森林病理学 / 樹木組織学",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-chatani-eri-2014": {
    name: "茶谷 絵理",
    university: "神戸大学",
    department: "理学研究科",
    position: "准教授",
    field: "タンパク質分子凝集 / アミロイド線維",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-aihara-shoko-2014": {
    name: "藍原 祥子",
    university: "神戸大学",
    department: "農学研究科",
    position: "助教",
    field: "食品科学 / 味覚・摂食行動",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-matsuo-eiko-2014": {
    name: "松尾 栄子",
    university: "神戸大学",
    department: "農学研究科",
    position: "助教",
    field: "ウイルス学 / 病原体-宿主相互作用",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-yamada-kaori-2014": {
    name: "山田 香織",
    university: "神戸大学",
    department: "自然科学系先端融合研究環",
    position: "助教",
    field: "デザイン工学 / 感性設計",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-enami-naoko-2014": {
    name: "榎並 直子",
    university: "神戸大学",
    department: "自然科学系先端融合研究環",
    position: "助教",
    field: "知覚情報処理 / パターン認識",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-suzuki-chika-2014": {
    name: "鈴木 千賀",
    university: "神戸大学",
    department: "自然科学系先端融合研究環",
    position: "助教",
    field: "閉鎖性水域の環境保全 / 藻類バイオマス",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-hongo-chizuru-2014": {
    name: "本郷 千鶴",
    university: "神戸大学",
    department: "自然科学系先端融合研究環",
    position: "助教",
    field: "高分子材料 / 生分解性ポリエステル",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-yoshida-yasuko-2014": {
    name: "吉田 康子",
    university: "神戸大学",
    department: "農学研究科",
    position: "助教",
    field: "植物遺伝資源 / 保全遺伝学",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-matsumoto-fumiko-2014": {
    name: "松本 文子",
    university: "神戸大学",
    department: "自然科学系先端融合研究環",
    position: "助教",
    field: "地域計画 / 地域環境工学",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-sato-harumi-2014": {
    name: "佐藤 春実",
    university: "神戸大学",
    department: "人間発達環境学研究科",
    position: "准教授",
    field: "高分子材料 / 振動分光",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-aoki-kana-2014": {
    name: "青木 画奈",
    university: "神戸大学",
    department: "自然科学系先端融合研究環",
    position: "助教",
    field: "光学素子 / 微細構造形成技術",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-ito-mai-2014": {
    name: "伊藤 麻衣",
    university: "神戸大学",
    department: "自然科学系先端融合研究環",
    position: "助教",
    field: "建築構造 / 耐震補強",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-shimizu-shima-2014": {
    name: "清水 志真",
    university: "神戸大学",
    department: "自然科学系先端融合研究環",
    position: "助教",
    field: "素粒子物理 / ATLAS実験",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-yamaguchi-aika-2014": {
    name: "山口 愛果",
    university: "神戸大学",
    department: "自然科学系先端融合研究環",
    position: "助教",
    field: "渦鞭毛藻類 / 系統分類学",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-oshita-yuko-2014": {
    name: "尾下 優子",
    university: "神戸大学",
    department: "海事科学研究科",
    position: "助教",
    field: "産業構造 / ライフサイクル評価",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-ono-tomoko-2014": {
    name: "大野 朋子",
    university: "神戸大学",
    department: "人間発達環境学研究科",
    position: "准教授",
    field: "地域社会における森林生態系の保全手法",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-sakura-midori-2014": {
    name: "佐倉 緑",
    university: "神戸大学",
    department: "理学研究科",
    position: "講師",
    field: "昆虫神経行動学",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-yasui-minami-2014": {
    name: "保井 みなみ",
    university: "神戸大学",
    department: "理学研究科",
    position: "助教",
    field: "惑星科学 / 衝突クレーター形成",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-chuma-izumi-2014": {
    name: "中馬 いづみ",
    university: "神戸大学",
    department: "自然科学系先端融合研究環",
    position: "助教",
    field: "植物病理学 / いもち病菌",
    callType: "女性研究者養成システム改革加速事業"
  },
  "kobe-hidema-ruri-2014": {
    name: "日出間 るり",
    university: "神戸大学",
    department: "自然科学系先端融合研究環",
    position: "助教",
    field: "複雑流体 / レオロジー",
    callType: "女性研究者養成システム改革加速事業"
  }
};

const kobeMetrics = {
  "kobe-kuroda-keiko-2014": { total: 123, source: "researchmap", label: "researchmap 黒田慶子", url: "https://researchmap.jp/Kuroda_Keiko" },
  "kobe-chatani-eri-2014": { total: 74, source: "J-GLOBAL / researchmap", label: "J-GLOBAL 茶谷絵理", url: "https://jglobal.jst.go.jp/detail?JGLOBAL_ID=200901013677184658" },
  "kobe-aihara-shoko-2014": { total: 14, source: "J-GLOBAL / researchmap", label: "J-GLOBAL 藍原祥子", url: "https://jglobal.jst.go.jp/detail?JGLOBAL_ID=201301013192498738" },
  "kobe-matsuo-eiko-2014": { total: 25, source: "researchmap", label: "researchmap 松尾栄子", url: "https://researchmap.jp/7000004081" },
  "kobe-yamada-kaori-2014": { total: 29, source: "researchmap", label: "researchmap 山田香織", url: "https://researchmap.jp/7000004132/" },
  "kobe-enami-naoko-2014": { total: 51, source: "researchmap", label: "researchmap 榎並直子", url: "https://researchmap.jp/naokoenami" },
  "kobe-suzuki-chika-2014": { total: 71, source: "researchmap", label: "researchmap 鈴木千賀", url: "https://researchmap.jp/professorsuzuki" },
  "kobe-hongo-chizuru-2014": { total: 6, source: "researchmap", label: "researchmap 本郷千鶴", url: "https://researchmap.jp/read0071826" },
  "kobe-yoshida-yasuko-2014": { total: 16, source: "researchmap", label: "researchmap 吉田康子", url: "https://researchmap.jp/7000004082" },
  "kobe-matsumoto-fumiko-2014": { total: 15, source: "J-GLOBAL / researchmap", label: "J-GLOBAL 松本文子", url: "https://jglobal.jst.go.jp/detail?JGLOBAL_ID=201301060209706230" },
  "kobe-sato-harumi-2014": { total: 173, source: "J-GLOBAL / researchmap", label: "J-GLOBAL 佐藤春実", url: "https://jglobal.jst.go.jp/public/201201019614672052" },
  "kobe-aoki-kana-2014": { total: 2, source: "researchmap", label: "researchmap 青木画奈", url: "https://researchmap.jp/7000003848" },
  "kobe-ito-mai-2014": { total: 22, source: "researchmap", label: "researchmap 伊藤麻衣", url: "https://researchmap.jp/7000004139" },
  "kobe-shimizu-shima-2014": { total: 250, source: "researchmap", label: "researchmap 清水志真", url: "https://researchmap.jp/7000005694" },
  "kobe-yamaguchi-aika-2014": { total: 37, source: "J-GLOBAL / researchmap", label: "J-GLOBAL 山口愛果", url: "https://jglobal.jst.go.jp/public/201301038414688266" },
  "kobe-oshita-yuko-2014": { total: 17, source: "J-GLOBAL / researchmap", label: "J-GLOBAL 尾下優子", url: "https://jglobal.jst.go.jp/detail?JGLOBAL_ID=201301097461016019" },
  "kobe-ono-tomoko-2014": { total: 24, source: "researchmap", label: "researchmap 大野朋子", url: "https://researchmap.jp/read0136644" },
  "kobe-sakura-midori-2014": { total: 34, source: "researchmap", label: "researchmap 佐倉緑", url: "https://researchmap.jp/7000004009" },
  "kobe-yasui-minami-2014": { total: 66, source: "J-GLOBAL / researchmap", label: "J-GLOBAL 保井みなみ", url: "https://jglobal.jst.go.jp/public/201301061434874548" },
  "kobe-chuma-izumi-2014": { total: 42, source: "researchmap", label: "researchmap 中馬いづみ", url: "https://researchmap.jp/IzumiChuma" },
  "kobe-hidema-ruri-2014": { total: 204, source: "researchmap", label: "researchmap 日出間るり", url: "https://researchmap.jp/ruri_hidema" }
};

const needsMetricVerification = new Set(
  Object.keys(kobeNameUpdates).filter(id => !kobeMetrics[id])
);

const attachedRows = [
  {
    id: "tohoku-eng-ono-madoka-2023",
    name: "小野 円佳",
    fiscalYear: 2023,
    field: "応用物理学 / ガラス・光機能材料",
    university: "東北大学",
    department: "工学研究科 応用物理学専攻",
    position: "教授",
    appointmentYear: 2023,
    appointmentDate: "2023-04-01",
    callType: "東北大学工学研究科DEI推進公募",
    baselinePublications: { leadAuthor: 15, coauthored: 45 },
    sourceMetricNote: "添付画像の採用時集計値（約15報 / 約45報）を採用。KAKEN・researchmap等で氏名、所属、研究者情報を確認。",
    sources: [
      { label: "東北大学工学研究科DEI推進プロジェクト：女性教授3名着任", url: "https://dei.eng.tohoku.ac.jp/news/detail---id-220.html" },
      { label: "KAKEN 小野円佳", url: "https://nrid.nii.ac.jp/ja/nrid/1000020865224/" },
      { label: "researchmap 小野円佳", url: "https://researchmap.jp/MO-Hokudai" }
    ]
  },
  {
    id: "tohoku-eng-xu-chaonan-2023",
    name: "徐 超男",
    fiscalYear: 2023,
    field: "材料システム工学 / 応力発光材料",
    university: "東北大学",
    department: "工学研究科 材料システム工学専攻",
    position: "教授",
    appointmentYear: 2023,
    appointmentDate: "2023-04-01",
    callType: "東北大学工学研究科DEI推進公募",
    baselinePublications: { leadAuthor: 60, coauthored: 180 },
    sourceMetricNote: "添付画像の採用時集計値（約60報 / 約180報以上）を採用。東北大学教員プロフィール・researchmapで氏名、所属、研究者情報を確認。",
    sources: [
      { label: "東北大学工学研究科DEI推進プロジェクト：女性教授3名着任", url: "https://dei.eng.tohoku.ac.jp/news/detail---id-220.html" },
      { label: "東北大学 工学研究科 教員プロフィール 徐超男", url: "https://www.eng.tohoku.ac.jp/research/researchers/v-%2C-id%2C2b5fcc66-eabb-4442-af81-b84930d0bacd.html" },
      { label: "researchmap 徐超男", url: "https://researchmap.jp/read0081648" }
    ]
  },
  {
    id: "tohoku-eng-kubota-aya-2023",
    name: "窪田 亜矢",
    fiscalYear: 2023,
    field: "都市計画 / 都市・建築デザイン",
    university: "東北大学",
    department: "工学研究科 都市・建築学専攻",
    position: "教授",
    appointmentYear: 2023,
    appointmentDate: "2023-04-01",
    callType: "東北大学工学研究科DEI推進公募",
    baselinePublications: { leadAuthor: 25, coauthored: 40 },
    sourceMetricNote: "添付画像の採用時集計値（約25報 / 約40報）を採用。researchmapで氏名、所属、研究者情報を確認。",
    sources: [
      { label: "東北大学工学研究科DEI推進プロジェクト：女性教授3名着任", url: "https://dei.eng.tohoku.ac.jp/news/detail---id-220.html" },
      { label: "researchmap 窪田亜矢", url: "https://researchmap.jp/ayakubota?lang=ja" }
    ]
  },
  {
    id: "nagoya-gender-saegusa-mayumi-2023",
    name: "三枝 麻由美",
    fiscalYear: 2023,
    field: "社会学 / ジェンダー平等",
    university: "名古屋大学",
    department: "ジェンダーダイバーシティセンター",
    position: "准教授",
    appointmentYear: 2023,
    appointmentDate: "研究者総覧で2022年4月から現職確認",
    callType: "名古屋大学研究者総覧確認",
    baselinePublications: { leadAuthor: 10, coauthored: 15 },
    sourceMetricNote: "添付画像の採用時集計値（約10報 / 約15報）を採用。名古屋大学研究者総覧・researchmapで氏名、所属、論文11件等を確認。",
    sources: [
      { label: "名古屋大学 研究者詳細 三枝麻由美", url: "https://profs.provost.nagoya-u.ac.jp/html/100005828_ja.html" },
      { label: "researchmap 三枝麻由美", url: "https://researchmap.jp/read0156761" },
      { label: "J-GLOBAL 三枝麻由美", url: "https://jglobal.jst.go.jp/detail?JGLOBAL_ID=201101057420760165" }
    ]
  },
  {
    id: "tohoku-ifs-yakeno-aiko-2022",
    name: "焼野 藍子",
    fiscalYear: 2022,
    field: "航空宇宙流体工学 / 流体シミュレーション",
    university: "東北大学",
    department: "流体科学研究所 航空宇宙流体工学研究分野",
    position: "助教",
    appointmentYear: 2022,
    appointmentDate: "東北大学 女性研究者活躍の軌跡で助教として確認",
    callType: "東北大学「女性研究者活躍の軌跡」",
    baselinePublications: { leadAuthor: 10, coauthored: 20 },
    sourceMetricNote: "添付画像の採用時集計値（約10報 / 約20報）を採用。東北大学産学連携機構・研究者紹介等で氏名、所属、職位を確認。",
    sources: [
      { label: "東北大学 産学連携機構 研究者紹介 焼野藍子", url: "https://www.rpip.tohoku.ac.jp/jp/pr/spotlight/detail---id-897.html" },
      { label: "東北大学 研究者紹介 焼野藍子", url: "https://www.r-info.tohoku.ac.jp/ja/96b1205bf6c4835998983d85a12d647a.html" },
      { label: "CiNii Research 焼野藍子", url: "https://cir.nii.ac.jp/crid/1581698604396677761" }
    ]
  }
];

function upsertAchievement(researcherId, summary, metric, links) {
  const items = achievementsData.items || (achievementsData.items = []);
  let item = items.find(entry => entry.researcherId === researcherId);
  if (!item) {
    item = { researcherId, summary: "", externalLinks: [], publications: [] };
    items.push(item);
  }
  item.summary = summary;
  item.externalLinks = links;
  item.publications = item.publications || [];
  item.metrics = metric;
}

for (const researcher of researchersData.researchers) {
  const update = kobeNameUpdates[researcher.id];
  if (!update) continue;
  Object.assign(researcher, update);
  researcher.sources = [
    sourceNewsletter,
    ...(researcher.sources || []).filter(source => source.url !== sourceNewsletter.url)
  ];
  researcher.evidenceNote = `神戸大学男女共同参画推進室 Newsletter No.35 の新規養成女性教員一覧に、${update.name}氏、${update.department}、${update.position}として掲載。氏名は同PDFの日本語表記に修正。`;
  if (needsMetricVerification.has(researcher.id)) {
    researcher.verificationStatus = "pendingMetricVerification";
    researcher.metricVerificationNote = "氏名・採用情報は確認済み。論文数は同姓同名分離とresearchmap/J-GLOBAL/Google Scholar照合後に公開対象へ戻す。";
  }
}

for (const [id, metric] of Object.entries(kobeMetrics)) {
  const researcher = researchersData.researchers.find(entry => entry.id === id);
  if (!researcher) continue;
  researcher.verificationStatus = "verified";
  researcher.baselinePublications = { leadAuthor: null, coauthored: null };
  researcher.metricVerificationNote = "採用時点の主著/共著分離ではなく、公開DB上の総論文数として表示。";
  researcher.sources = [
    ...(researcher.sources || []),
    { label: metric.label, url: metric.url }
  ].filter((source, index, array) => array.findIndex(other => other.url === source.url) === index);
  upsertAchievement(
    id,
    `${metric.source}で論文${metric.total}件を確認。採用時点の主著/共著分類ではなく、公開DB上の総論文数として表示。`,
    {
      outputLabel: "総論文",
      totalOutputs: metric.total,
      source: metric.source,
      timeline: [{ year: 2026, total: metric.total }],
      note: "公開DBで確認できる総数。採用時点の筆頭著者・共著者分類ではない。"
    },
    [{ label: metric.label, url: metric.url }]
  );
}

for (const row of attachedRows) {
  const existing = researchersData.researchers.find(entry => entry.id === row.id);
  const record = {
    ...row,
    verificationStatus: "verified",
    evidenceNote: `${row.sources[0].label}等で氏名・所属・職位を確認。採用時論文数は添付画像の主著/共著目安を反映し、Google Scholar・researchmap・KAKEN・J-GLOBAL等で追跡できるよう根拠URLを付与。`,
    publicationTimeline: []
  };
  if (existing) {
    Object.assign(existing, record);
  } else {
    researchersData.researchers.push(record);
  }
  upsertAchievement(
    row.id,
    row.sourceMetricNote,
    {
      outputLabel: "採用時論文",
      totalOutputs: row.baselinePublications.leadAuthor + row.baselinePublications.coauthored,
      source: "添付画像 + 公開DB確認",
      timeline: [{ year: row.fiscalYear, total: row.baselinePublications.leadAuthor + row.baselinePublications.coauthored }],
      note: "主著/共著は添付画像の概算値。DBごとに収録範囲が異なるため継続確認対象。"
    },
    row.sources
  );
}

researchersData.policy = researchersData.policy || {};
researchersData.policy.lastDataQualityFix = "2026-05-15: Replaced romanized Japanese names with Japanese public-record forms, added the five attached-image records, and attached public-source publication metrics for every verified public record.";
researchersData.policy.nameDisplayPolicy = "Japanese researchers must be displayed in Japanese public-record form. Romanized names are not used for verified Japanese records.";
researchersData.updatedAt = "2026-05-15";
achievementsData.updatedAt = "2026-05-15";

fs.writeFileSync(researchersPath, `${JSON.stringify(researchersData, null, 2)}\n`, "utf8");
fs.writeFileSync(achievementsPath, `${JSON.stringify(achievementsData, null, 2)}\n`, "utf8");
