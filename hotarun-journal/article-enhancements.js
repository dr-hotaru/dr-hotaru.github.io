(() => {
  const article = document.querySelector(".article");
  if (!article) return;

  const pageUrl = window.location.href.split("#")[0];
  const title = document.querySelector("h1")?.textContent?.trim() || document.title;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(`${title} | ほたるんジャーナル`);

  const share = document.createElement("section");
  share.className = "share-panel";
  share.innerHTML = `
    <h2>この記事を共有</h2>
    <div class="share-buttons">
      <a class="x" href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" target="_blank" rel="noopener">Xで共有</a>
      <a class="facebook" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener">Facebook</a>
      <a class="line" href="https://social-plugins.line.me/lineit/share?url=${encodedUrl}" target="_blank" rel="noopener">LINE</a>
      <a href="mailto:?subject=${encodedTitle}&body=${encodedUrl}">メール</a>
      <button type="button" data-copy-link>リンクコピー</button>
    </div>
  `;

  const affiliate = document.createElement("section");
  affiliate.className = "affiliate-panel";
  affiliate.setAttribute("aria-label", "関連する楽天商品");
  affiliate.innerHTML = `
    <h2>論文読みの作業環境に</h2>
    <p class="affiliate-note">広告：楽天アフィリエイトリンクを含みます。価格や在庫はリンク先でご確認ください。</p>
    <div class="affiliate-grid">
      <a class="affiliate-card" href="https://hb.afl.rakuten.co.jp/ichiba/535510e3.60d3c6ea.535510e4.95969934/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fwayetto%2Fwtps0006%2F&link_type=picttext" target="_blank" rel="nofollow sponsored noopener">
        <img src="https://hbb.afl.rakuten.co.jp/hgb/535510e3.60d3c6ea.535510e4.95969934/?me_id=1411950&item_id=10000152&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fwayetto%2Fcabinet%2Fcompass1732621760.jpg%3F_ex%3D160x160&s=160x160&t=picttext" alt="ノートパソコンスタンド">
        <span><strong>ノートPCスタンド</strong><span>論文読みの姿勢改善に。</span></span>
      </a>
      <a class="affiliate-card" href="https://hb.afl.rakuten.co.jp/ichiba/53552f26.a0509b6c.53552f27.f6a963b8/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fartpiece%2Ftd-1%2F&link_type=picttext" target="_blank" rel="nofollow sponsored noopener">
        <img src="https://hbb.afl.rakuten.co.jp/hgb/53552f26.a0509b6c.53552f27.f6a963b8/?me_id=1367312&item_id=10000693&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fartpiece%2Fcabinet%2Fss202603%2Fimgrc0149642097.jpg%3F_ex%3D160x160&s=160x160&t=picttext" alt="LEDデスクライト">
        <span><strong>LEDデスクライト</strong><span>夜の読解・執筆環境に。</span></span>
      </a>
      <a class="affiliate-card" href="https://hb.afl.rakuten.co.jp/ichiba/535525e3.06ca925e.535525e4.62770fd7/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsanwadirect%2F100-lac006%2F&link_type=picttext" target="_blank" rel="nofollow sponsored noopener">
        <img src="https://hbb.afl.rakuten.co.jp/hgb/535525e3.06ca925e.535525e4.62770fd7/?me_id=1195715&item_id=10105119&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fsanwadirect%2Fcabinet%2F1%2F100-lac006.jpg%3F_ex%3D160x160&s=160x160&t=picttext" alt="モニターアーム">
        <span><strong>モニターアーム</strong><span>PDFとメモの並列表示に。</span></span>
      </a>
    </div>
  `;

  article.append(share, affiliate);

  document.querySelector("[data-copy-link]")?.addEventListener("click", async event => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      event.currentTarget.textContent = "コピー済み";
    } catch {
      event.currentTarget.textContent = "URLをコピーしてください";
    }
  });
})();
