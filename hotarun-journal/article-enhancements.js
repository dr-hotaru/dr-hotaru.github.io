(() => {
  const SITE_NAME = "ほたるんジャーナル";
  const DESKGEAR_URL = "https://dr-hotaru.github.io/deskgear-rank/";
  const AFFILIATE_HUB_URL = "https://dr-hotaru.github.io/affiliate-hub.html";

  const tools = [
    {
      title: "ノートPCスタンド",
      body: "論文読み、データ整理、長時間執筆の姿勢改善に。",
      img: "https://hbb.afl.rakuten.co.jp/hgb/535510e3.60d3c6ea.535510e4.95969934/?me_id=1411950&item_id=10000152&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fwayetto%2Fcabinet%2Fcompass1732621760.jpg%3F_ex%3D160x160&s=160x160&t=picttext",
      href: "https://hb.afl.rakuten.co.jp/ichiba/535510e3.60d3c6ea.535510e4.95969934/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fwayetto%2Fwtps0006%2F&link_type=picttext"
    },
    {
      title: "LEDデスクライト",
      body: "夜の読解、図表確認、原稿チェックをしやすく。",
      img: "https://hbb.afl.rakuten.co.jp/hgb/53552f26.a0509b6c.53552f27.f6a963b8/?me_id=1367312&item_id=10000693&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fartpiece%2Fcabinet%2Fss202603%2Fimgrc0149642097.jpg%3F_ex%3D160x160&s=160x160&t=picttext",
      href: "https://hb.afl.rakuten.co.jp/ichiba/53552f26.a0509b6c.53552f27.f6a963b8/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fartpiece%2Ftd-1%2F&link_type=picttext"
    },
    {
      title: "モニターアーム",
      body: "PDF、メモ、解析画面を並べる研究デスク向け。",
      img: "https://hbb.afl.rakuten.co.jp/hgb/535525e3.06ca925e.535525e4.62770fd7/?me_id=1195715&item_id=10105119&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fsanwadirect%2Fcabinet%2F1%2F100-lac006.jpg%3F_ex%3D160x160&s=160x160&t=picttext",
      href: "https://hb.afl.rakuten.co.jp/ichiba/535525e3.06ca925e.535525e4.62770fd7/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsanwadirect%2F100-lac006%2F&link_type=picttext"
    }
  ];

  function loadThumbnails() {
    return new Promise(resolve => {
      if (window.HotarunThumbnails) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "../thumbnail-replacements.js";
      script.onload = resolve;
      script.onerror = resolve;
      document.body.appendChild(script);
    });
  }

  function extractDoi(article) {
    const doiLink = [...article.querySelectorAll(".source a[href*='doi.org/']")][0];
    if (!doiLink) return "";
    try {
      const url = new URL(doiLink.href);
      return decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    } catch {
      return doiLink.href.split("doi.org/")[1] || "";
    }
  }

  function paperTitle(article) {
    const sourceLink = article.querySelector(".source a");
    return sourceLink?.textContent?.trim() || "";
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

  async function fetchAuthors(doi, target) {
    try {
      const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
      if (!response.ok) throw new Error("Crossref request failed");
      const data = await response.json();
      const authors = (data.message?.author || [])
        .map(author => [author.given, author.family].filter(Boolean).join(" "))
        .filter(Boolean);
      target.textContent = authors.length ? authors.join(", ") : "元論文ページで確認";
    } catch {
      target.textContent = "元論文ページで確認";
    }
  }

  function renderPaperInfo(article, h1) {
    if (article.querySelector(".paper-info")) return;
    const title = paperTitle(article);
    const doi = extractDoi(article);
    if (!title && !doi) return;

    const info = document.createElement("section");
    info.className = "paper-info";
    info.innerHTML = `
      <h2>元論文</h2>
      <dl>
        <div>
          <dt>論文タイトル</dt>
          <dd>${escapeHtml(title || "元論文ページで確認")}</dd>
        </div>
        <div>
          <dt>著者一覧</dt>
          <dd data-paper-authors>${doi ? "取得中..." : "元論文ページで確認"}</dd>
        </div>
      </dl>
    `;
    const lead = article.querySelector(".lead");
    if (lead) lead.insertAdjacentElement("beforebegin", info);
    else h1.insertAdjacentElement("afterend", info);

    if (doi) fetchAuthors(doi, info.querySelector("[data-paper-authors]"));
  }

  function renderSharePanel(pageUrl, title) {
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(`${title} | ${SITE_NAME}`);
    const share = document.createElement("section");
    share.className = "share-panel";
    share.innerHTML = `
      <h2>この記事を共有</h2>
      <div class="share-buttons">
        <a class="x" href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" target="_blank" rel="noopener">Xで共有</a>
        <a class="facebook" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener">Facebook</a>
        <a class="line" href="https://social-plugins.line.me/lineit/share?url=${encodedUrl}" target="_blank" rel="noopener">LINE</a>
        <a href="mailto:?subject=${encodedTitle}&body=${encodedUrl}">メール</a>
        <button type="button" data-copy-link>リンクをコピー</button>
      </div>
    `;
    share.querySelector("[data-copy-link]")?.addEventListener("click", async event => {
      try {
        await navigator.clipboard.writeText(pageUrl);
        event.currentTarget.textContent = "コピー済み";
      } catch {
        event.currentTarget.textContent = "URLをコピーしてください";
      }
    });
    return share;
  }

  function renderAffiliatePanel() {
    const cards = tools.map(item => `
      <a class="affiliate-card" href="${item.href}" target="_blank" rel="nofollow sponsored noopener">
        <img src="${item.img}" alt="${escapeHtml(item.title)}">
        <span><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></span>
      </a>
    `).join("");

    const affiliate = document.createElement("section");
    affiliate.className = "affiliate-panel";
    affiliate.setAttribute("aria-label", "関連する楽天商品");
    affiliate.innerHTML = `
      <h2>研究・執筆の作業環境を整える</h2>
      <p class="affiliate-note">広告：楽天アフィリエイトリンクを含みます。価格、送料、在庫はリンク先でご確認ください。</p>
      <div class="affiliate-grid">${cards}</div>
      <div class="affiliate-actions">
        <a href="${DESKGEAR_URL}">DeskGearで比較する</a>
        <a href="${AFFILIATE_HUB_URL}">用途別おすすめを見る</a>
      </div>
    `;
    return affiliate;
  }

  const article = document.querySelector(".article");
  if (!article) return;

  const pageUrl = window.location.href.split("#")[0];
  const title = document.querySelector("h1")?.textContent?.trim() || document.title;
  const h1 = article.querySelector("h1");
  const label = article.querySelector(".label")?.textContent?.trim() || "Science";

  loadThumbnails().then(() => {
    const hero = article.querySelector(".article-hero");
    if (!hero || !window.HotarunThumbnails) return;
    const replacement = window.HotarunThumbnails.resolve(hero);
    hero.src = replacement.src;
    hero.onerror = () => {
      hero.onerror = null;
      hero.src = replacement.fallbackSrc;
      hero.dataset.credit = replacement.fallbackCredit;
    };
    hero.dataset.credit = replacement.credit;
  });

  if (h1 && !article.querySelector(".article-meta")) {
    const meta = document.createElement("div");
    meta.className = "article-meta";
    meta.innerHTML = `
      <span>${escapeHtml(label)}</span>
      <span>蒼樹羽ほたる</span>
      <time datetime="2026-05-08">2026.05.08</time>
    `;
    h1.insertAdjacentElement("afterend", meta);
  }

  if (h1) renderPaperInfo(article, h1);
  if (!article.querySelector(".share-panel")) article.appendChild(renderSharePanel(pageUrl, title));
  if (!article.querySelector(".affiliate-panel")) article.appendChild(renderAffiliatePanel());
})();
