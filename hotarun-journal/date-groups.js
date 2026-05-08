(function () {
  const containers = [...document.querySelectorAll(".post-grid, .timeline")];
  if (!containers.length) return;

  const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  });

  function cardLink(card) {
    if (card.matches("a[href]")) return card;
    return card.querySelector("a[href]");
  }

  function normalizeHref(href) {
    return new URL(href, window.location.href).href;
  }

  async function articleDate(card) {
    const inlineTime = card.querySelector("time[datetime]");
    if (inlineTime) return inlineTime.getAttribute("datetime");

    const link = cardLink(card);
    if (!link) return "";

    try {
      const response = await fetch(normalizeHref(link.getAttribute("href")), { cache: "no-store" });
      if (!response.ok) return "";
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.querySelector("time[datetime]")?.getAttribute("datetime") || "";
    } catch (_error) {
      return "";
    }
  }

  function labelFor(dateText) {
    if (!dateText) return "日付未設定";
    const date = new Date(`${dateText}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateText;
    return dateFormatter.format(date);
  }

  function sortKey(item) {
    return item.date || "0000-00-00";
  }

  async function groupContainer(container) {
    if (container.dataset.groupedByDate === "true") return;
    const cards = [...container.children].filter(child =>
      child.classList.contains("post-card") || child.classList.contains("timeline-item")
    );
    if (cards.length < 2) return;

    const items = await Promise.all(cards.map(async card => ({
      card,
      date: await articleDate(card)
    })));

    items.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
    container.innerHTML = "";
    container.dataset.groupedByDate = "true";
    container.classList.add("date-timeline");

    let currentDate = null;
    let currentList = null;

    for (const item of items) {
      if (item.date !== currentDate) {
        currentDate = item.date;
        const group = document.createElement("section");
        group.className = "date-group";
        group.innerHTML = `<h2>${labelFor(item.date)}</h2><div class="date-group-list"></div>`;
        container.appendChild(group);
        currentList = group.querySelector(".date-group-list");
      }
      currentList.appendChild(item.card);
    }
  }

  containers.forEach(container => {
    groupContainer(container).catch(error => {
      console.warn("Could not group articles by date", error);
    });
  });
})();
