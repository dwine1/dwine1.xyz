// Runs on an Amazon "Your Orders" page (amazon.com.tr, amazon.com, ...) as a bookmarklet.
// It reads every order for the years you pick, then sends names, photo links, dates and order numbers
// to dwine1.xyz/projects/things-i-own, which shows them for review before anything is added.
// The list travels in the link's #fragment, which browsers never send to any server.
// Nothing is sent anywhere else. The Things I own page builds the bookmark link from this file.
(async () => {
  const TARGET = "https://dwine1.xyz/projects/things-i-own/index.html";
  if (!/(^|\.)amazon\.[a-z.]+$/.test(location.hostname)) { alert("Open your Amazon orders page first (Hesabım → Siparişlerim), then tap this bookmark again."); return; }
  const TR = location.hostname.endsWith(".tr");
  const say = makeBox();

  // Every year Amazon offers in its menu (or back to 2010), every page of each year.
  const now = new Date().getFullYear();
  const offered = [...document.querySelectorAll('option[value^="year-"], a[href*="timeFilter=year-"]')]
    .map(e => +((e.value || e.getAttribute("href") || "").match(/year-(\d{4})/) || [])[1]).filter(Boolean);
  const years = [...new Set([...offered, ...Array.from({ length: now - 2009 }, (_, i) => now - i)])].sort((a, b) => b - a);

  // A small window on Amazon that can walk through the order pages like you would. Opened right away,
  // while the tap still counts, so the popup blocker lets it through; only used if reading pages directly fails.
  let pop = null;
  try { pop = window.open("about:blank", "dwine1-amazon-pages", "width=480,height=640,left=40,top=40"); } catch (e) {}
  const items = [], seen = new Set(), log = [];
  const here = orderCards(document);
  here.forEach(readOrder);
  log.push(`here:${here.length}/${items.length}`);
  const path = /order-history|your-orders/.test(location.pathname) ? location.pathname : "/gp/css/order-history";
  let fetchWorks = false, popWorks = null;
  for (const y of years) {
    let yearCards = 0;
    for (let start = 0; start < 1000; start += 10) {
      say(`${TR ? "Okunuyor" : "Reading"} ${y}… ${items.length} ${TR ? "ürün" : "items"}`);
      const u = new URL(path, location.origin);
      u.searchParams.set("timeFilter", "year-" + y);
      u.searchParams.set("startIndex", String(start));
      let doc = null, cards = [];
      try {
        const r = await fetch(u, { credentials: "include" });
        doc = new DOMParser().parseFromString(await r.text(), "text/html");
        cards = orderCards(doc);
      } catch (e) {}
      if (start === 0 && log.length < 4) log.push(`f${y}:${doc ? (doc.title || "").slice(0, 25) + "/" + doc.querySelectorAll('a[href*="/dp/"],a[href*="/gp/product/"]').length : "x"}`);
      if (cards.length) { if (!fetchWorks) { try { pop && pop.close(); } catch (e) {} } fetchWorks = true; }
      // Nothing in the raw page: open it in the small window, let it run its own scripts, and read that.
      else if (!fetchWorks && popWorks !== false) {
        doc = await viaWindow(u);
        cards = doc ? orderCards(doc) : [];
        if (popWorks === null) popWorks = !!doc;
      }
      yearCards += cards.length;
      if (start === 0) log.push(`${y}:${cards.length}`);
      cards.forEach(readOrder);
      const next = doc && doc.querySelector(".a-pagination .a-last:not(.a-disabled) a");
      if (!next && cards.length < 10) break;
      if (!cards.length) break;
      await new Promise(r => setTimeout(r, 300));
    }
    // Years before the oldest one with orders are empty; stop after three empty years in a row below it.
    if (!yearCards && y < now - 2 && !offered.includes(y) && log.slice(-3).every(l => /:0$/.test(l))) break;
  }
  try { pop && pop.close(); } catch (e) {}
  log.push(pop ? `w:${popWorks}` : "w:blocked");

  async function viaWindow(u) {
    if (!pop || pop.closed) return null;
    let old = null, settled = 0;
    try { old = pop.document; pop.location.href = u.href; } catch (e) { return null; }
    // Wait for the new page, then until orders show up on it (or it has sat loaded for ~2.5 s).
    for (let t = 0; t < 70; t++) {
      await new Promise(r => setTimeout(r, 300));
      let d;
      try { d = pop.document; } catch (e) { continue; }
      if (!d || d === old || d.readyState === "loading") continue;
      if (orderCards(d).length) return d;
      if (d.readyState === "complete" && ++settled > 8) return d;
    }
    return null;
  }

  if (!items.length) {
    say((TR ? "Sipariş bulunamadı. Bu mesajın ekran görüntüsünü Claude'a gönderin. " : "No orders found. Send Claude a screenshot of this message. ") +
      `[${location.pathname} · ${document.querySelectorAll('a[href*="/dp/"],a[href*="/gp/product/"]').length} · ${log.join(" | ")}]`, true);
    return;
  }
  // Amazon cuts the link between its tabs and other sites, so hand the list over in a link the user taps.
  const payload = { app: "dwine1-amazon-import", version: 1, site: location.hostname, items };
  const json = JSON.stringify(payload);
  let href = "";
  try {
    const z = await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer();
    let bin = ""; const u8 = new Uint8Array(z);
    for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    const b64 = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    if (b64.length < 1500000) href = TARGET + "#amz=" + b64;
  } catch (e) {}
  const file = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  say(`${items.length} ${TR ? "ürün bulundu" : "items found"} (${log.filter(l => /^\d{4}:[1-9]/.test(l)).map(l => l.split(":")[0]).join(", ")}). [${log.slice(0, 12).join(" ")}]`, true, [
    href && [TR ? "Things I own'da aç" : "Open in Things I own", href, "_blank"],
    [TR ? "Dosya olarak indir" : "Download as file", file, "", "amazon-orders.json"],
  ]);

  function orderCards(doc) {
    const sel = [".order-card", ".js-order-card", "#ordersContainer > .order", ".your-orders-content-container .order"];
    for (const s of sel) { const c = [...doc.querySelectorAll(s)]; if (c.length) return c; }
    // Layout we don't know: for each product link, the smallest box around it that also shows an order number is its order.
    const found = new Set();
    for (const a of doc.querySelectorAll('a[href*="/dp/"], a[href*="/gp/product/"]')) {
      for (let n = a.parentElement; n && n !== doc.body; n = n.parentElement) {
        const ids = n.textContent.match(/\b\d{3}-\d{7}-\d{7}\b/g);
        if (ids) { if (new Set(ids).size === 1) found.add(n); break; }
      }
    }
    return [...found].filter(n => ![...found].some(o => o !== n && o.contains(n)));
  }
  function readOrder(card) {
    const text = card.textContent.replace(/\s+/g, " ");
    const head = card.querySelector(".order-header, .order-info, .a-box-group > .a-box:first-child") || card;
    const htext = head.textContent.replace(/\s+/g, " ");
    const orderId = (text.match(/\b(\d{3}-\d{7}-\d{7})\b/) || [])[1] || "";
    const date = parseDate(htext) || parseDate(text);
    const total = parseMoney(htext);
    const byAsin = new Map();
    for (const a of card.querySelectorAll('a[href*="/dp/"], a[href*="/gp/product/"]')) {
      const asin = (a.getAttribute("href").match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/) || [])[1];
      if (!asin) continue;
      const it = byAsin.get(asin) || { asin, name: "", image: "" };
      const img = a.querySelector("img");
      if (img) {
        it.image = it.image || bigImage(img.getAttribute("data-a-hires") || img.getAttribute("src") || "");
        if (!it.name) it.name = (img.getAttribute("alt") || "").trim();
      }
      const t = a.textContent.replace(/\s+/g, " ").trim();
      if (t.length > it.name.length && !/^(Buy it again|Tekrar satın al|View your item|Ürününüzü görüntüleyin)/i.test(t)) it.name = t;
      byAsin.set(asin, it);
    }
    const list = [...byAsin.values()].filter(i => i.name);
    for (const i of list) {
      const key = orderId + ":" + i.asin;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ orderId, asin: i.asin, name: i.name.slice(0, 200), image: i.image, date,
        link: `${location.origin}/dp/${i.asin}`, price: list.length === 1 && total ? total.value : "", currency: total ? total.currency : "" });
    }
  }
  // Amazon image links carry size codes like ._SS142_. or ._AC_UL160_.; drop them for the full-size photo.
  function bigImage(src) {
    if (!/^https:\/\/[^/]*(media-amazon|ssl-images-amazon|images-amazon)\.com\//.test(src)) return "";
    return src.replace(/\._[^/]*_\.(jpe?g|png|webp)$/i, ".$1");
  }
  function parseDate(s) {
    const tr = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];
    const en = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const pad = n => String(n).padStart(2, "0");
    let m = s.match(/(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(\d{4})/);
    if (m) {
      const w = m[2].toLocaleLowerCase("tr");
      let k = tr.indexOf(w); if (k < 0) k = en.indexOf(m[2].toLowerCase());
      if (k >= 0) return `${m[3]}-${pad(k + 1)}-${pad(m[1])}`;
    }
    m = s.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
    if (m && en.indexOf(m[1].toLowerCase()) >= 0) return `${m[3]}-${pad(en.indexOf(m[1].toLowerCase()) + 1)}-${pad(m[2])}`;
    m = s.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/);
    if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
    return "";
  }
  function parseMoney(s) {
    let m = s.match(/(?:₺|TL)\s*([\d.]+,\d{2})/) || s.match(/([\d.]+,\d{2})\s*(?:TL|₺)/);
    if (m) return { value: m[1].replace(/\./g, "").replace(",", "."), currency: "TRY" };
    m = s.match(/\$\s*([\d,]+\.\d{2})/);
    if (m) return { value: m[1].replace(/,/g, ""), currency: "USD" };
    m = s.match(/€\s*([\d.]+,\d{2})/);
    if (m) return { value: m[1].replace(/\./g, "").replace(",", "."), currency: "EUR" };
    return null;
  }
  function makeBox() {
    const box = document.createElement("div");
    box.style.cssText = "position:fixed;z-index:2147483647;left:50%;top:16px;transform:translateX(-50%);background:#16202b;color:#fff;font:15px/1.4 system-ui,sans-serif;padding:12px 16px;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.35);max-width:calc(100% - 32px)";
    document.body.append(box);
    const f = (msg, end, links) => {
      box.textContent = "Things I own · " + msg;
      for (const l of links || []) {
        if (!l) continue;
        const a = document.createElement("a");
        a.textContent = l[0]; a.href = l[1];
        if (l[2]) { a.target = l[2]; a.rel = "noopener"; }
        if (l[3]) a.download = l[3];
        a.style.cssText = "margin-left:12px;color:#16202b;background:#ffb74d;font-weight:700;padding:3px 10px;border-radius:6px;text-decoration:none;display:inline-block";
        box.append(a);
      }
      if (end) { const b = document.createElement("button"); b.textContent = "OK"; b.style.cssText = "margin-left:12px;font:inherit;padding:2px 10px;border-radius:6px;border:0;cursor:pointer"; b.onclick = () => box.remove(); box.append(b); }
    };
    f.close = () => box.remove();
    return f;
  }
})();
