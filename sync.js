// Site-wide sync for dwine1.xyz. Sign in once with a 6 to 8 digit PIN and every page that lists localStorage keys
// in its script tag (data-keys="a b") keeps those keys the same on every browser and device signed in with that PIN.
//
// How it works: the PIN goes through PBKDF2 into a secret seed and an AES-GCM key, which stay in this browser.
// Each synced key is stored online under its own vault id (SHA-256 of seed + key name), encrypted before it leaves
// the browser, using the same Supabase functions as Calender 1 (calender1_get / calender1_put). The server only
// ever sees vault ids and scrambled text. The key below is the public "publishable" key; never put a secret key here.
//
// Pages need no sync code of their own: writes to a listed key are noticed automatically, and when newer data
// arrives from another device this script updates localStorage and fires a "storage" event for that key, so a page
// that listens for "storage" (as it would for another tab) redraws itself.
(function () {
  "use strict";
  if (window.DwineSync) return;
  const URL_ = "https://mxzymqxbaoopwtwheyur.supabase.co";
  const KEY_ = "sb_publishable_S2tMEu7IVn-t9fqszeK76w_Gop4imSm";
  const CREDS = "dwine1.sync", ALL_KEYS = "dwine1.sync.keys";
  const dirtyK = k => "dwine1.sync.dirty." + k, seenK = k => "dwine1.sync.seen." + k;

  const me = document.currentScript;
  const keys = ((me && me.dataset.keys) || "").split(/\s+/).filter(Boolean);
  let store = null;
  try { store = window.localStorage; } catch (e) {}
  if (!store) return;
  const rawSet = Storage.prototype.setItem, rawRemove = Storage.prototype.removeItem;
  const ls = {
    get: k => { try { return store.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { rawSet.call(store, k, v); } catch (e) {} },
    del: k => { try { rawRemove.call(store, k); } catch (e) {} },
  };

  // Remember every key any page has asked to sync, so "remove data from this browser" can clear them all.
  (function () {
    let all = [];
    try { all = JSON.parse(ls.get(ALL_KEYS)) || []; } catch (e) {}
    const merged = [...new Set(all.concat(keys))];
    if (merged.length !== all.length) ls.set(ALL_KEYS, JSON.stringify(merged));
  })();

  let creds = null;
  try { creds = JSON.parse(ls.get(CREDS)); } catch (e) {}
  if (!creds || !creds.seed || !creds.key) creds = null;

  // --- crypto ---------------------------------------------------------------
  const enc = new TextEncoder();
  const b64 = buf => { let s = ""; new Uint8Array(buf).forEach(b => { s += String.fromCharCode(b); }); return btoa(s); };
  const unb64 = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));
  const hex = buf => [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, "0")).join("");
  async function derive(pin) {
    const base = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode("dwine1.xyz/site-sync/v1"), iterations: 300000 }, base, 512);
    return { seed: hex(bits.slice(0, 32)), key: b64(bits.slice(32)) };
  }
  const vaultId = async k => hex(await crypto.subtle.digest("SHA-256", enc.encode(creds.seed + ":" + k)));
  const aesKey = () => crypto.subtle.importKey("raw", unb64(creds.key), "AES-GCM", false, ["encrypt", "decrypt"]);
  async function encrypt(obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(), enc.encode(JSON.stringify(obj)));
    return b64(iv) + "." + b64(ct);
  }
  async function decrypt(str) {
    const [iv, ct] = str.split(".");
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, await aesKey(), unb64(ct));
    return JSON.parse(new TextDecoder().decode(pt));
  }
  async function rpc(fn, body) {
    const r = await fetch(`${URL_}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: KEY_, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`${fn} ${r.status}`);
    return r.json();
  }

  // --- merging --------------------------------------------------------------
  // Lists of items with ids (notes, watchlist) are combined item by item, keeping the newer edit of each.
  // Anything else (settings) takes the local copy when `preferLocal`, else the online copy.
  function merge(localStr, cloudStr, preferLocal) {
    if (localStr == null) return cloudStr;
    if (cloudStr == null) return localStr;
    try {
      const a = JSON.parse(localStr), b = JSON.parse(cloudStr);
      const listOfIds = x => Array.isArray(x) && x.every(i => i && typeof i === "object" && i.id != null);
      if (listOfIds(a) && listOfIds(b)) {
        const byId = new Map(b.map(i => [String(i.id), i]));
        a.forEach(i => {
          const o = byId.get(String(i.id));
          if (!o || (Number(i.updated) || 0) >= (Number(o.updated) || 0)) byId.set(String(i.id), i);
        });
        return JSON.stringify([...byId.values()]);
      }
    } catch (e) {}
    return preferLocal ? localStr : cloudStr;
  }

  // Put a value into localStorage without counting it as a local edit, and tell the page.
  function apply(k, value) {
    const old = ls.get(k);
    if (old === value) return;
    if (value == null) ls.del(k); else ls.set(k, value);
    try { window.dispatchEvent(new StorageEvent("storage", { key: k, oldValue: old, newValue: value, storageArea: store, url: location.href })); } catch (e) {}
  }

  // --- notice local edits ---------------------------------------------------
  const timers = {};
  let edits = 0;
  function touched(k) {
    edits++;
    ls.set(dirtyK(k), "1");
    if (!creds) return;
    say("saving");
    clearTimeout(timers[k]); timers[k] = setTimeout(() => sync(k), 800);
  }
  Storage.prototype.setItem = function (k, v) {
    const watched = this === store && keys.includes(k) && rawGet(k) !== String(v);
    rawSet.call(this, k, v);
    if (watched) touched(k);
  };
  Storage.prototype.removeItem = function (k) {
    const watched = this === store && keys.includes(k) && rawGet(k) !== null;
    rawRemove.call(this, k);
    if (watched) touched(k);
  };
  function rawGet(k) { try { return store.getItem(k); } catch (e) { return null; } }

  // --- the sync itself ------------------------------------------------------
  // One round for key k: fetch the online copy, combine it with local edits if there are any, save back if needed.
  const running = {};
  async function sync(k) {
    if (!creds) return;
    if (running[k]) { running[k].again = true; return running[k].p; }
    const job = { again: false };
    running[k] = job;
    job.p = (async () => {
      try {
        do {
          job.again = false;
          await syncOnce(k);
        } while (job.again && creds);
        state = "ok";
      } catch (e) { state = "offline"; }
      delete running[k];
      say();
    })();
    return job.p;
  }
  async function syncOnce(k) {
    const id = await vaultId(k);
    const rows = await rpc("calender1_get", { p_id: id });
    const row = rows && rows[0];
    const seen = ls.get(seenK(k)), dirty = !!ls.get(dirtyK(k)), local = ls.get(k);
    let cloud, cloudChanged = false;
    if (row) {
      cloud = (await decrypt(row.data)).value;
      if (cloud === undefined) cloud = null;
      cloudChanged = String(row.updated_at) !== seen;
    }
    if (!dirty && seen != null) {
      // Nothing changed here: just take the online copy if it is newer.
      if (row) { if (cloudChanged) apply(k, cloud); ls.set(seenK(k), String(row.updated_at)); return; }
      if (local == null) return;
    }
    if (local == null && !dirty) {
      if (row) { apply(k, cloud); ls.set(seenK(k), String(row.updated_at)); }
      return;
    }
    // Local data to send. If someone else saved since we last looked, combine both. The first time this browser
    // syncs a key, lists are combined and settings come from online; after that, edits made here win.
    const startEdits = edits;
    let value = local;
    if (row && (cloudChanged || seen == null)) {
      value = merge(local, cloud, seen != null);
      if (value !== local) apply(k, value);
    }
    if (row && value === cloud) { ls.set(seenK(k), String(row.updated_at)); ls.del(dirtyK(k)); return; }
    const t = await rpc("calender1_put", { p_id: id, p_data: await encrypt({ v: 1, value }) });
    ls.set(seenK(k), String(t));
    // Only call it clean if nothing was typed while saving; otherwise sync() goes round again.
    if (edits === startEdits || ls.get(k) === value) ls.del(dirtyK(k));
    else if (running[k]) running[k].again = true;
  }
  const syncAll = () => Promise.all(keys.map(sync));

  // --- badge and sign-in panel ----------------------------------------------
  let state = creds ? "ok" : "off", host, root;
  function say(s) {
    if (s) state = s;
    if (!root) return;
    const busy = Object.keys(running).length > 0;
    const shown = !creds ? "off" : state === "saving" || busy ? "saving" : state;
    const text = {
      off: "Sign in to sync",
      saving: "Syncing…",
      ok: keys.length ? "Synced" : "Signed in",
      offline: "Not synced (offline?)",
    }[shown];
    const b = root.getElementById("badge");
    b.querySelector(".t").textContent = text;
    b.className = "badge " + shown;
    b.title = creds ? "Synced with your PIN. Click to sign out." : "Sign in with your PIN to keep this page the same on all your devices.";
  }

  function build() {
    host = document.createElement("div");
    host.id = "dwine1-sync";
    root = host.attachShadow({ mode: "open" });
    root.innerHTML = `
<style>
  :host { all: initial; }
  * { box-sizing: border-box; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
  .badge { position: fixed; z-index: 2147483000; left: max(12px, env(safe-area-inset-left)); bottom: max(12px, env(safe-area-inset-bottom));
    display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; cursor: pointer;
    font-size: 12.5px; line-height: 1; border: 1px solid #d3dae2; background: #ffffffe8; color: #16202b;
    box-shadow: 0 2px 10px rgba(0,0,0,.12); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
  .badge:hover { border-color: #2b4fd8; }
  .badge:focus-visible { outline: 2px solid #2b4fd8; outline-offset: 2px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #9aa5b1; }
  .ok .dot { background: #1f9d55; } .saving .dot { background: #d9a400; } .offline .dot { background: #d23c3c; }
  .off { color: #2b4fd8; }
  .scrim { position: fixed; inset: 0; z-index: 2147483001; background: rgba(10,15,20,.45); display: grid; place-items: center; padding: 16px; }
  .scrim[hidden] { display: none; }
  .panel { width: min(360px, 100%); background: #fff; color: #16202b; border-radius: 14px; padding: 20px; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
  h2 { margin: 0 0 6px; font-size: 18px; }
  p { margin: 0 0 14px; font-size: 14px; line-height: 1.45; color: #4b5866; }
  input { width: 100%; font-size: 20px; letter-spacing: .3em; text-align: center; padding: 10px; border: 1px solid #c5ced8; border-radius: 8px; background: #fff; color: inherit; }
  input:focus { outline: 2px solid #2b4fd8; border-color: transparent; }
  .err { min-height: 18px; color: #c62828; font-size: 13px; margin: 6px 0 4px; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; margin-top: 8px; }
  button.b { font-size: 14px; padding: 9px 14px; border-radius: 8px; border: 1px solid #c5ced8; background: #fff; color: inherit; cursor: pointer; }
  button.primary { background: #2b4fd8; border-color: #2b4fd8; color: #fff; }
  button.danger { color: #c62828; }
  button.b:disabled { opacity: .6; cursor: default; }
  @media (prefers-color-scheme: dark) {
    .badge { background: #161d25e8; color: #e6ebf1; border-color: #27313c; }
    .off { color: #8ea6ff; }
    .panel, input, button.b { background: #161d25; color: #e6ebf1; border-color: #33404d; }
    p { color: #a3afbc; }
    button.primary { background: #4a6cf0; border-color: #4a6cf0; color: #fff; }
    button.danger { color: #ff8a80; } .err { color: #ff8a80; }
  }
</style>
<button class="badge off" id="badge" type="button"><span class="dot"></span><span class="t"></span></button>
<div class="scrim" id="scrim" hidden>
  <form class="panel" id="in" hidden>
    <h2>Sync dwine1.xyz</h2>
    <p>Enter a 6 to 8 digit PIN. Use the same PIN on every browser, computer, iPad or phone and your pages show the same data. New PIN? It starts a fresh sync with what is on this device.</p>
    <input id="pin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="8" aria-label="PIN">
    <div class="err" id="err" role="alert"></div>
    <div class="row"><button class="b" type="button" data-close>Cancel</button><button class="b primary" id="go" type="submit">Sign in</button></div>
  </form>
  <div class="panel" id="out" hidden>
    <h2>Synced</h2>
    <p>This browser is signed in, so changes here appear on your other devices and theirs appear here. Signing out stops syncing; your data stays online for when you sign in again.</p>
    <div class="row">
      <button class="b danger" type="button" id="wipe">Sign out and clear this browser</button>
      <button class="b" type="button" id="signout">Sign out</button>
      <button class="b primary" type="button" data-close>Done</button>
    </div>
  </div>
</div>`;
    const $ = id => root.getElementById(id);
    const scrim = $("scrim"), form = $("in"), out = $("out"), pin = $("pin"), err = $("err"), go = $("go");
    const close = () => { scrim.hidden = true; };
    $("badge").addEventListener("click", () => {
      scrim.hidden = false;
      form.hidden = !!creds; out.hidden = !creds;
      err.textContent = ""; pin.value = "";
      if (!creds) setTimeout(() => pin.focus(), 0);
    });
    root.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", close));
    scrim.addEventListener("click", e => { if (e.target === scrim) close(); });
    root.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const p = pin.value.trim();
      if (!/^\d{6,8}$/.test(p)) { err.textContent = "Use 6 to 8 digits."; return; }
      go.disabled = true; err.textContent = "Signing in…";
      await api.login(p);
      go.disabled = false;
      if (state === "offline") err.textContent = "Signed in, but couldn't reach the server. It will retry.";
      else close();
    });
    $("signout").addEventListener("click", () => { api.logout(false); close(); });
    $("wipe").addEventListener("click", () => {
      if (!confirm("Sign out and remove your synced data from this browser? It stays online and comes back when you sign in again.")) return;
      api.logout(true); location.reload();
    });
    document.body.appendChild(host);
    say();
  }

  const api = {
    keys,
    signedIn: () => !!creds,
    async login(pin) {
      if (!/^\d{6,8}$/.test(String(pin))) return false;
      say("saving");
      const c = await derive(String(pin));
      if (creds && creds.seed === c.seed) { await syncAll(); return true; }
      // A different account than before (or the first sign-in here): merge what is on this device into it.
      let all = [];
      try { all = JSON.parse(ls.get(ALL_KEYS)) || []; } catch (e) {}
      all.forEach(k => ls.del(seenK(k)));
      creds = c;
      ls.set(CREDS, JSON.stringify(c));
      await syncAll();
      say();
      return true;
    },
    logout(wipe) {
      let all = [];
      try { all = JSON.parse(ls.get(ALL_KEYS)) || []; } catch (e) {}
      all.forEach(k => { ls.del(seenK(k)); ls.del(dirtyK(k)); if (wipe) ls.del(k); });
      creds = null; ls.del(CREDS);
      say("off");
    },
    sync: syncAll,
  };
  window.DwineSync = api;

  if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
  if (creds) syncAll();
  // Pick up changes from other devices when coming back to the page, and every 30 seconds while it is open.
  document.addEventListener("visibilitychange", () => { if (!document.hidden && creds) syncAll(); });
  setInterval(() => { if (!document.hidden && creds) syncAll(); }, 30000);
  // Another tab on this device signed in or out.
  window.addEventListener("storage", e => {
    if (e.key !== CREDS || e.storageArea !== store) return;
    const had = !!creds;
    try { creds = JSON.parse(e.newValue); } catch (err) { creds = null; }
    say(creds ? "ok" : "off");
    if (creds && !had) syncAll();
  });
})();
