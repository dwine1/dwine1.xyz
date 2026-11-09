/* dwine1.xyz: "Move to top" button at the end of every page.
   Load with <script src="…/top.js?v=1" defer></script>. Uses each page's own
   colour variables (--accent, --line, --fg, --surface/--card, --body) so it matches. */
(function () {
  if (document.getElementById("dwine1-top")) return;
  var css = document.createElement("style");
  css.textContent =
    ".dwine1-top-wrap{display:flex;justify-content:center;padding:28px 16px calc(64px + env(safe-area-inset-bottom));clear:both}" +
    ".dwine1-top{font:inherit;font-family:var(--body,inherit);font-size:.95rem;font-weight:600;display:inline-flex;align-items:center;gap:.45em;" +
    "padding:.6em 1.15em;border-radius:999px;cursor:pointer;color:var(--accent,#2b4fd8);" +
    "background:var(--surface,var(--card,#fff));border:1px solid var(--line,#d3dae2);" +
    "box-shadow:0 1px 2px rgba(15,20,26,.06);transition:border-color .15s,background .15s,color .15s}" +
    ".dwine1-top:hover{border-color:var(--accent,#2b4fd8);background:var(--accent,#2b4fd8);color:#fff}" +
    ".dwine1-top:focus-visible{outline:2px solid var(--accent,#2b4fd8);outline-offset:2px}" +
    ".dwine1-top svg{width:1em;height:1em}" +
    "h1[data-dwine1-top]:focus{outline:none}" +
    "@media print{.dwine1-top-wrap{display:none}}";
  document.head.appendChild(css);

  var wrap = document.createElement("div");
  wrap.className = "dwine1-top-wrap";
  wrap.innerHTML =
    '<button type="button" class="dwine1-top" id="dwine1-top">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>' +
    "Move to top</button>";
  document.body.appendChild(wrap);

  wrap.firstChild.addEventListener("click", function () {
    var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: still ? "auto" : "smooth" });
    // Move keyboard focus to the start of the page too, without a second jump.
    var first = document.querySelector("h1") || document.body;
    if (first !== document.body && !first.hasAttribute("tabindex")) { first.setAttribute("tabindex", "-1"); first.setAttribute("data-dwine1-top", ""); }
    try { first.focus({ preventScroll: true }); } catch (e) {}
  });
})();
