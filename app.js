const page = document.body.dataset.page;

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function googleMapsSearchLink(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function googleMapsDirectionsLink(spots) {
  if (!spots.length) return "https://www.google.com/maps";
  const origin = spots[0].googleQuery;
  const destination = spots[spots.length - 1].googleQuery;
  const waypoints = spots.slice(1, -1).map((spot) => spot.googleQuery).join("|");
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  url.searchParams.set("travelmode", "walking");
  if (waypoints) url.searchParams.set("waypoints", waypoints);
  return url.toString();
}

function statusClass(status) {
  if (status === "已购") return "status-done";
  if (status === "待购") return "status-pending";
  return "status-optional";
}

function createNav() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;

  const brand = el("a", "brand");
  brand.href = "./index.html";
  brand.innerHTML = '<span class="brand-mark">ITA</span><div><p class="eyebrow">Solo Trip Guide</p><h1>Italy Trip 2026</h1></div>';

  const row = el("div", "nav-row");
  tripData.modules.forEach((module) => {
    const link = el("a", "button ghost small", module.title);
    link.href = module.href;
    if (
      (page === "overview" && module.href.includes("overview")) ||
      (page === "itinerary" && module.href.includes("itinerary")) ||
      (page === "food" && module.href.includes("food")) ||
      (page === "safety" && module.href.includes("safety")) ||
      (page === "booking" && module.href.includes("booking")) ||
      (page === "jojo" && module.href.includes("jojo"))
    ) {
      link.classList.add("active");
    }
    row.append(link);
  });

  nav.append(brand, row);
}

function createStackItem(title, lines, link) {
  const item = el("div", "stack-item");
  const head = el(link ? "a" : "h4", null, title);
  if (link) {
    head.href = link;
    head.target = "_blank";
    head.rel = "noreferrer";
  }
  item.append(head);
  lines.forEach((line) => item.append(el("p", "muted", line)));
  return item;
}

function renderSummary() {
  const panel = document.getElementById("summary-panel");
  if (!panel) return;

  const { trip } = tripData;
  panel.append(
    el("p", "eyebrow", "Trip Snapshot"),
    el("h3", null, trip.subtitle),
    el("p", "muted", trip.traveler),
    el("p", null, `出发：${trip.outbound}`),
    el("p", null, `回程：${trip.inbound}`),
    el("p", "muted", trip.version),
  );
}

function renderRouteOverview(rootId = "route-overview") {
  const root = document.getElementById(rootId);
  if (!root) return;
  tripData.trip.route.forEach((city, index) => {
    const chip = el("div", "route-chip");
    chip.append(
      el("span", null, `${index + 1}. ${city}`),
      el("span", "muted", index === 0 ? "Start" : index === tripData.trip.route.length - 1 ? "Finish" : "Transit"),
    );
    root.append(chip);
  });
}

function renderStays(rootId = "stays-list") {
  const root = document.getElementById(rootId);
  if (!root) return;
  tripData.stays.forEach((stay) => {
    const item = createStackItem(
      `${stay.city} · ${stay.type}`,
      [stay.address, stay.dates, stay.note || "点击标题可在手机上直接打开地图。"],
      googleMapsSearchLink(stay.googleQuery),
    );
    root.append(item);
  });
}

function renderTickets(rootId = "transport-list") {
  const root = document.getElementById(rootId);
  if (!root) return;
  tripData.tickets.forEach((ticket) => {
    root.append(createStackItem(`${ticket.date} · ${ticket.label}`, [ticket.route, ticket.note]));
  });
}

function renderModules() {
  const grid = document.getElementById("module-grid");
  const heroActions = document.getElementById("hero-actions");
  if (heroActions) {
    ["./overview.html", "./itinerary.html", "./food.html", "./safety.html", "./booking.html", "./jojo.html"].forEach((href, index) => {
      const mod = tripData.modules[index];
      const link = el("a", index < 2 ? "button" : "button secondary", mod.title);
      link.href = href;
      heroActions.append(link);
    });
  }
  if (!grid) return;
  tripData.modules.forEach((module) => {
    const card = el("a", "module-card");
    card.href = module.href;
    card.append(el("p", "eyebrow", "Module"), el("h3", null, module.title), el("p", "muted", module.description));
    grid.append(card);
  });
}

function renderBookingSummary() {
  const root = document.getElementById("booking-summary");
  if (!root) return;
  const counts = { 已购: 0, 待购: 0, 可选: 0 };
  tripData.bookings.forEach((booking) => {
    counts[booking.status] += 1;
  });
  Object.entries(counts).forEach(([label, count]) => {
    const item = el("div", "stack-item");
    const status = el("span", `status-chip ${statusClass(label)}`, `${label} ${count} 项`);
    item.append(status);
    if (label === "待购") {
      item.append(el("p", "muted", "优先补齐乌菲兹和机场大巴。"));
    } else if (label === "可选") {
      item.append(el("p", "muted", "视体力和兴趣决定即可。"));
    } else {
      item.append(el("p", "muted", "核心交通和主要跟团票已就位。"));
    }
    root.append(item);
  });
}

function renderSchedule() {
  const root = document.getElementById("schedule-list");
  if (!root) return;
  tripData.schedule.forEach((day) => {
    root.append(createStackItem(day.date, [`${day.place} · ${day.theme}`]));
  });
}

function renderBudget() {
  const root = document.getElementById("budget-list");
  if (!root) return;
  tripData.budget.forEach((entry) => {
    const card = el("article", "tip-card");
    card.append(el("h3", null, entry.title), el("p", null, entry.amount), el("p", "muted", entry.note));
    root.append(card);
  });
}

function createListBlock(title, items) {
  const block = el("section", "meta-block");
  block.append(el("h4", null, title));
  const list = el("ul");
  items.forEach((item) => list.append(el("li", null, item)));
  block.append(list);
  return block;
}

function buildMap(mapNode, spots, options = {}) {
  if (typeof L === "undefined") return;
  const map = L.map(mapNode, {
    scrollWheelZoom: false,
    zoomControl: !window.matchMedia("(max-width: 760px)").matches,
  }).setView(options.center || spots[0].coords, options.zoom || 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const latLngs = spots.map((spot) => spot.coords);
  spots.forEach((spot, index) => {
    const extra = options.extraIndexes?.has(index) || false;
    const icon = L.divIcon({
      className: "ordered-marker",
      html: `<div class="marker-pin${extra ? " extra" : ""}">${index + 1}</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
    L.marker(spot.coords, { icon })
      .addTo(map)
      .bindPopup(
        `<strong>${index + 1}. ${spot.label || spot.spot}</strong><br>${spot.note}<br><a href="${googleMapsSearchLink(
          spot.googleQuery,
        )}" target="_blank" rel="noreferrer">打开 Google Maps</a>`,
      );
  });

  if (latLngs.length > 1) {
    L.polyline(latLngs, {
      color: options.lineColor || "#C88A65",
      weight: 4,
      opacity: 0.75,
      dashArray: options.dashArray || null,
    }).addTo(map);
    map.fitBounds(latLngs, { padding: [24, 24] });
  }
}

function lazyInitMap(node, callback) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      });
    },
    { rootMargin: "120px" },
  );
  observer.observe(node);
}

function renderDayNav() {
  const nav = document.getElementById("day-nav");
  if (!nav) return;
  tripData.days.forEach((day) => {
    const link = el("a", null, `${day.short} · ${day.city}`);
    link.href = `#${day.id}`;
    nav.append(link);
  });
}

function renderDays() {
  const root = document.getElementById("day-sections");
  if (!root) return;

  tripData.days.forEach((day) => {
    const article = el("article", "day-card");
    article.id = day.id;
    article.append(el("h3", null, day.title), el("p", "day-subtitle", `${day.city} · ${day.theme}`), el("p", "muted", day.alert));

    const layout = el("div", "day-layout");
    const meta = el("div", "day-meta");
    meta.append(createListBlock("交通安排", day.transport));
    if (day.timing) meta.append(createListBlock("关键时间节点", day.timing));
    meta.append(
      createListBlock("行程建议", day.plan),
      createListBlock("当天亮点", day.highlights),
      createListBlock("当天 Tips", day.tips),
    );

    const foodTags = el("div", "tag-row");
    day.food.forEach((food) => foodTags.append(el("span", "tag", food)));
    meta.append(foodTags);

    const aside = el("aside", "map-panel");
    aside.append(el("h4", null, "地图顺序"));
    const mapNode = el("div", "map");
    aside.append(mapNode);

    const routeLink = el("a", "map-link list-card", `在 Google Maps 中打开 ${day.city} 当天步行路线`);
    routeLink.href = googleMapsDirectionsLink(day.spots);
    routeLink.target = "_blank";
    routeLink.rel = "noreferrer";

    const order = el("div", "spot-order");
    day.spots.forEach((spot) => {
      const item = el("a", "spot-item");
      item.href = googleMapsSearchLink(spot.googleQuery);
      item.target = "_blank";
      item.rel = "noreferrer";
      item.append(el("span", "spot-index", String(spot.order)));
      const text = el("div");
      text.append(el("strong", null, spot.label), el("p", "muted", spot.note));
      item.append(text);
      order.append(item);
    });

    aside.append(routeLink, order);
    layout.append(meta, aside);
    article.append(layout);
    root.append(article);

    lazyInitMap(mapNode, () => buildMap(mapNode, day.spots, { center: day.mapCenter, zoom: day.mapZoom }));
  });
}

function renderFood() {
  const grid = document.getElementById("food-grid");
  if (grid) {
    tripData.foodGuide.forEach((section) => {
      const card = el("article", "tip-card");
      card.append(el("h3", null, section.city));
      const list = el("ul");
      section.items.forEach((item) => list.append(el("li", null, `${item.name}：${item.note}`)));
      card.append(list);
      grid.append(card);
    });
  }

  const tips = document.getElementById("food-tips");
  if (tips) {
    tripData.foodTips.forEach((tip) => tips.append(el("p", "muted", tip)));
  }
}

function renderSafety() {
  const grid = document.getElementById("safety-grid");
  if (!grid) return;
  tripData.safetyGuide.forEach((section) => {
    const card = el("article", "tip-card");
    card.append(el("h3", null, section.title));
    const list = el("ul");
    section.items.forEach((item) => list.append(el("li", null, item)));
    card.append(list);
    grid.append(card);
  });
}

function renderBookings() {
  const grid = document.getElementById("booking-grid");
  if (!grid) return;

  ["已购", "待购", "可选"].forEach((status) => {
    const card = el("article", "tip-card");
    card.append(el("h3", null, status));
    const list = el("div", "stack-list");
    tripData.bookings
      .filter((entry) => entry.status === status)
      .forEach((entry) => {
        const item = el("div", "stack-item");
        item.append(el("p", null, `${entry.item} · ${entry.date}`), el("p", "muted", entry.note));
        list.append(item);
      });
    card.append(list);
    grid.append(card);
  });
}

function renderJojoCards(rootId, items, label) {
  const root = document.getElementById(rootId);
  if (!root) return;
  items.forEach((item) => {
    const card = el("article", "tip-card");
    card.append(el("p", "eyebrow", item.city), el("h3", null, item.spot), el("p", null, item.scene), el("p", "muted", `${label}：${item.note}`));
    const link = el("a", "button ghost small", "打开地图");
    link.href = googleMapsSearchLink(item.googleQuery);
    link.target = "_blank";
    link.rel = "noreferrer";
    card.append(link);
    root.append(card);
  });
}

function renderJojoMap() {
  const node = document.getElementById("jojo-map");
  if (!node || typeof L === "undefined") return;
  const all = [...tripData.jojo.included, ...tripData.jojo.extra];
  const extraSet = new Set(tripData.jojo.extra.map((_, index) => index + tripData.jojo.included.length));
  lazyInitMap(node, () =>
    buildMap(
      node,
      all.map((item) => ({
        label: item.spot,
        note: `${item.city} · ${item.scene}`,
        coords: item.coords,
        googleQuery: item.googleQuery,
      })),
      { center: [43.3, 12.0], zoom: 6, extraIndexes: extraSet, lineColor: "#C88A65" },
    ),
  );
}

function initHome() {
  renderSummary();
  renderModules();
  renderRouteOverview();
  renderStays();
  renderBookingSummary();
}

function initOverview() {
  renderRouteOverview();
  renderStays();
  renderTickets();
  renderSchedule();
  renderBudget();
}

function initItinerary() {
  renderDayNav();
  renderDays();
}

function initFood() {
  renderFood();
}

function initSafety() {
  renderSafety();
}

function initBooking() {
  renderBookings();
}

function initJojo() {
  renderJojoMap();
  renderJojoCards("jojo-included", tripData.jojo.included, "安排");
  renderJojoCards("jojo-extra", tripData.jojo.extra, "状态");
}

createNav();

if (page === "home") initHome();
if (page === "overview") initOverview();
if (page === "itinerary") initItinerary();
if (page === "food") initFood();
if (page === "safety") initSafety();
if (page === "booking") initBooking();
if (page === "jojo") initJojo();
