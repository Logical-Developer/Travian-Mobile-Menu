// ==UserScript==
// @name         Travian Mobile Menu
// @namespace    github.com/Logical-Developer/Travian-Mobile-Menu / ...
// @version      1.0.0
// @description  Mobile menu with village list, resources and quick shortcuts for Travian
// @author       Logical-Developer
// @match        https://*.travian.com/*
// @match        https://*.traviantop.com/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/Logical-Developer/Travian-Mobile-Menu/main/Travian-Mobile-Menu.user.js
// @downloadURL  https://raw.githubusercontent.com/Logical-Developer/Travian-Mobile-Menu/main/Travian-Mobile-Menu.user.js
// @homepageURL  https://github.com/Logical-Developer/Travian-Mobile-Menu
// @supportURL   https://github.com/Logical-Developer/Travian-Mobile-Menu/issues
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const CFG = {
    STORAGE: "travian_master_storage",
    SCRIPT_ID: "TravianMobileMenu",
    SCRIPT_VERSION: "1.0.0",
    TICK_IDLE_MS: 2500,
    TICK_HIDDEN_MS: 10000,
    UI_STATE_KEY: "travian_builder_ui_v1",
    MINIMIZED_BOTTOM_PX: 200,
    PANEL_MAX_VH: 50,
  };

  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const nowTick = () => Date.now();

  function setTextIfChanged(el, t) {
    if (el && el.textContent !== t) el.textContent = t;
  }
  function setHTMLIfChanged(el, h) {
    if (el && el._cqLastHTML !== h) {
      el._cqLastHTML = h;
      el.innerHTML = h;
    }
  }
  function setClassIfChanged(el, c, on) {
    if (el && el.classList.contains(c) !== on) el.classList.toggle(c, on);
  }
  function escapeHtml(s) {
    return String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  function formatNumber(n) {
    if (n === undefined || n === null || isNaN(n)) return "—";
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* ═══ Detection ═══ */
  function isMobileView() {
    return (
      document.body.classList.contains("mobileForced") ||
      document.body.classList.contains("mobileOptimized") ||
      window.matchMedia("(max-width: 768px)").matches
    );
  }
  function isHubPage() {
    return (
      /dorf1\.php/.test(location.pathname) ||
      /dorf2\.php/.test(location.pathname)
    );
  }
  function isMarketSendPage() {
    if (!/build\.php/.test(location.pathname)) return false;
    const u = new URL(location.href);
    return (
      u.searchParams.get("gid") === "17" && u.searchParams.get("t") === "5"
    );
  }

  /* ═══ Storage ═══ */
  function _readRaw() {
    try {
      const s = JSON.parse(localStorage.getItem(CFG.STORAGE) || "null");
      return s && typeof s === "object" ? s : {};
    } catch {
      return {};
    }
  }
  function _writeRaw(s) {
    try {
      localStorage.setItem(CFG.STORAGE, JSON.stringify(s));
    } catch {}
  }
  function ensureStorage() {
    const s = _readRaw();
    if (!s.mobileMenu || typeof s.mobileMenu !== "object") {
      s.mobileMenu = { villages: {}, lastScan: 0 };
      _writeRaw(s);
    }
    return s.mobileMenu;
  }
  function getVillageCache() {
    return ensureStorage().villages || {};
  }
  function saveVillageCache(v) {
    const s = _readRaw();
    if (!s.mobileMenu) s.mobileMenu = { villages: {}, lastScan: 0 };
    s.mobileMenu.villages = v;
    s.mobileMenu.lastScan = nowTick();
    _writeRaw(s);
  }
  function cacheVillage(vid, data) {
    if (!vid) return;
    const cache = getVillageCache();
    cache[String(vid)] = {
      ...(cache[String(vid)] || {}),
      ...data,
      ts: nowTick(),
    };
    saveVillageCache(cache);
  }

  /* ═══ Village ID ═══ */
  function getVillageId() {
    const q = new URL(location.href).searchParams.get("newdid");
    if (q && /^\d+$/.test(q)) return q;
    const inp = document.querySelector("#villageName input[data-did]");
    if (inp && inp.dataset.did) return inp.dataset.did;
    const el = document.querySelector(
      "#sidebarBoxVillageList .listEntry.active[data-did]",
    );
    if (el) return el.getAttribute("data-did");
    return null;
  }

  /* ═══ PRIMARY: Read from React viewData (accurate, no parsing) ═══ */
  function readVillagesFromReactData() {
    try {
      const scripts = document.querySelectorAll("script");
      for (const s of scripts) {
        const txt = s.textContent;
        if (!txt || !txt.includes("VillageBoxes.render")) continue;
        const m = txt.match(
          /viewData:\s*(\{[\s\S]*?\})\s*,\s*knowledgeBaseLinkPlus/,
        );
        if (!m) continue;
        try {
          const data = JSON.parse(m[1]);
          const list = data?.ownPlayer?.villageList;
          if (Array.isArray(list) && list.length) {
            return list.map((v) => ({
              vid: String(v.id),
              name: String(v.name || "").trim(),
              x: Number(v.x),
              y: Number(v.y),
            }));
          }
        } catch (e) {
          console.warn("[TMM] viewData JSON parse fail:", e.message);
        }
      }
    } catch (e) {
      console.warn("[TMM] react read error:", e.message);
    }
    return null;
  }

  /* ═══ FALLBACK: Parse DOM (handles U+2212 minus and other variants) ═══ */
  function parseCoord(text) {
    if (text === undefined || text === null) return null;
    let t = String(text);
    // Remove directional marks & invisibles
    t = t.replace(/[\u202A-\u202E\u2066-\u2069\u200E\u200F\uFEFF]/g, "");
    // Normalize all minus-like chars to ASCII hyphen
    t = t.replace(/\u2212/g, "-");
    t = t.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, "-");
    t = t.replace(/[\uFE58\uFE63\uFF0D]/g, "-");
    // Keep only digits and hyphen
    t = t.replace(/[^\d-]/g, "");
    if (!t || t === "-" || !/^-?\d+$/.test(t)) return null;
    const n = parseInt(t, 10);
    return isNaN(n) ? null : n;
  }

  function readVillagesFromDom() {
    const out = [];
    document.querySelectorAll(".listEntry[data-did]").forEach((el) => {
      const vid = el.getAttribute("data-did");
      if (!vid) return;
      const nameEl = el.querySelector(".name");
      let name = nameEl ? nameEl.textContent : "";
      name = name
        .replace(/[\u202A-\u202E\u2066-\u2069\u200E\u200F\uFEFF]/g, "")
        .trim();
      if (!name) return;
      const xEl = el.querySelector(".coordinateX");
      const yEl = el.querySelector(".coordinateY");
      out.push({
        vid,
        name,
        x: parseCoord(xEl ? xEl.textContent : null),
        y: parseCoord(yEl ? yEl.textContent : null),
      });
    });
    if (!out.length) {
      const inp = document.querySelector("#villageName input[data-did]");
      if (inp && inp.dataset.did) {
        let name = (inp.value || "")
          .replace(/[\u202A-\u202E\u2066-\u2069\u200E\u200F\uFEFF]/g, "")
          .trim();
        if (name) {
          const box = inp.closest("#sidebarBoxActiveVillage") || document;
          const xEl = box.querySelector(".coordinateX");
          const yEl = box.querySelector(".coordinateY");
          out.push({
            vid: inp.dataset.did,
            name,
            x: parseCoord(xEl ? xEl.textContent : null),
            y: parseCoord(yEl ? yEl.textContent : null),
          });
        }
      }
    }
    return out;
  }

  function readVillages() {
    const fromReact = readVillagesFromReactData();
    if (fromReact && fromReact.length) return fromReact;
    return readVillagesFromDom();
  }

  function updateVillageCache() {
    const villages = readVillages();
    if (!villages.length) return;
    const cache = getVillageCache();
    let changed = false;
    villages.forEach((v) => {
      const cur = cache[v.vid] || {};
      const newName = v.name || cur.name;
      const newX = typeof v.x === "number" && !isNaN(v.x) ? v.x : cur.x;
      const newY = typeof v.y === "number" && !isNaN(v.y) ? v.y : cur.y;
      if (cur.name !== newName || cur.x !== newX || cur.y !== newY) {
        cache[v.vid] = {
          ...cur,
          name: newName,
          x: newX,
          y: newY,
          ts: nowTick(),
        };
        changed = true;
      }
    });
    if (changed) saveVillageCache(cache);
  }

  /* ═══ Resources ═══ */
  function readCurrentResources() {
    try {
      if (typeof window.resources === "object" && window.resources.storage) {
        const st = window.resources.storage || {};
        const max = window.resources.maxStorage || {};
        return {
          wood: st.l1,
          clay: st.l2,
          iron: st.l3,
          crop: st.l4,
          maxWood: max.l1,
          maxClay: max.l2,
          maxIron: max.l3,
          maxCrop: max.l4,
        };
      }
    } catch {}
    const getNum = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return undefined;
      const t = (el.textContent || "")
        .replace(/[\u202A-\u202E\u2066-\u2069\u200E\u200F\uFEFF]/g, "")
        .replace(/[^\d]/g, "");
      return t ? parseInt(t, 10) : undefined;
    };
    return {
      wood: getNum("#l1"),
      clay: getNum("#l2"),
      iron: getNum("#l3"),
      crop: getNum("#l4"),
      maxWood: getNum("#stockBar .warehouse .capacity .value"),
      maxClay: getNum("#stockBar .warehouse .capacity .value"),
      maxIron: getNum("#stockBar .warehouse .capacity .value"),
      maxCrop: getNum("#stockBar .granary .capacity .value"),
    };
  }

  function cacheCurrentVillageResources() {
    const vid = getVillageId();
    if (!vid) return;
    const r = readCurrentResources();
    if (r.wood === undefined && r.clay === undefined) return;
    cacheVillage(vid, {
      res: {
        wood: r.wood,
        clay: r.clay,
        iron: r.iron,
        crop: r.crop,
        maxWood: r.maxWood,
        maxClay: r.maxClay,
        maxIron: r.maxIron,
        maxCrop: r.maxCrop,
      },
    });
  }

  /* ═══ Navigation ═══ */
  function navigateTo(url) {
    window.location.href = url;
  }

  function goToRallyPoint() {
    const vid = getVillageId();
    const url = vid
      ? `/build.php?newdid=${vid}&gid=16&tt=1`
      : `/build.php?gid=16&tt=1`;
    navigateTo(url);
  }
  function goToMarketplace() {
    const vid = getVillageId();
    const url = vid
      ? `/build.php?newdid=${vid}&id=20&gid=17&t=5`
      : `/build.php?id=20&gid=17&t=5`;
    navigateTo(url);
  }
  function goToVillage(vid) {
    if (!vid) return;
    const u = new URL(location.href);
    u.searchParams.set("newdid", vid);
    navigateTo(u.pathname + "?" + u.searchParams.toString());
  }

  /* ═══ Send resources ═══ */
  const SEND_TARGET_KEY = "travian_mm_sendTarget";

  function requestSendResources(vid) {
    const v = getVillageCache()[String(vid)];
    if (!v) return;
    const x = v.x,
      y = v.y;
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      isNaN(x) ||
      isNaN(y)
    ) {
      flashStatus("⚠ No coordinates for this village");
      return;
    }
    const target = { x, y, vid: String(vid), name: v.name };

    if (isMarketSendPage()) {
      fillMarketForm(target.x, target.y);
      flashStatus(`📤 Target: ${v.name} (${x}|${y})`);
      return;
    }
    try {
      sessionStorage.setItem(SEND_TARGET_KEY, JSON.stringify(target));
    } catch {}
    goToMarketplace();
  }

  function fillMarketForm(x, y) {
    const setVal = (el, val) => {
      if (!el) return false;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      setter.call(el, String(val));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    };
    const tryFill = () => {
      const xIn = document.querySelector('input[name="x"]');
      const yIn = document.querySelector('input[name="y"]');
      if (!xIn || !yIn) return false;
      setVal(xIn, x);
      setVal(yIn, y);
      xIn.dispatchEvent(new Event("blur", { bubbles: true }));
      yIn.dispatchEvent(new Event("blur", { bubbles: true }));
      return true;
    };
    if (!tryFill()) {
      let tries = 0;
      const iv = setInterval(() => {
        tries++;
        if (tryFill() || tries > 30) clearInterval(iv);
      }, 200);
    }
  }

  function consumeSendTarget() {
    if (!isMarketSendPage()) return;
    try {
      const raw = sessionStorage.getItem(SEND_TARGET_KEY);
      if (!raw) return;
      sessionStorage.removeItem(SEND_TARGET_KEY);
      const t = JSON.parse(raw);
      if (t && typeof t.x === "number" && typeof t.y === "number") {
        fillMarketForm(t.x, t.y);
        flashStatus(`📤 Target: ${t.name} (${t.x}|${t.y})`);
      }
    } catch {}
  }

  /* ═══ UI State ═══ */
  function getMinimized() {
    try {
      const s = JSON.parse(localStorage.getItem(CFG.UI_STATE_KEY) || "{}");
      return s.minimized === true;
    } catch {
      return false;
    }
  }
  function setMinimized(v) {
    try {
      const s = JSON.parse(localStorage.getItem(CFG.UI_STATE_KEY) || "{}");
      s.minimized = !!v;
      localStorage.setItem(CFG.UI_STATE_KEY, JSON.stringify(s));
    } catch {}
    applyMinimizedClass();
    const f = document.getElementById("cqFloat");
    if (f) positionFloating(f);
  }

  function getPanelBottomOffset() {
    const bl =
      document.querySelector(".villageInfoWrapper .buildingList") ||
      document.querySelector(".buildingList");
    if (bl) {
      const r = bl.getBoundingClientRect();
      if (
        r.height > 20 &&
        r.width > 100 &&
        r.bottom > 0 &&
        r.top < window.innerHeight
      ) {
        const offset = window.innerHeight - r.top;
        if (offset > 40 && offset < window.innerHeight * 0.85) {
          return Math.round(offset + 6);
        }
      }
    }
    const nav =
      document.getElementById("mobileMenu") ||
      document.getElementById("header");
    if (nav) {
      const st = getComputedStyle(nav);
      const r = nav.getBoundingClientRect();
      if (
        (st.position === "fixed" || st.position === "sticky") &&
        r.height > 20 &&
        r.height < 200
      ) {
        return Math.round(r.height + 8);
      }
    }
    return 70;
  }

  /* ═══ Styles ═══ */
  function injectStyles() {
    if (document.getElementById("cqStyle")) return;
    const s = document.createElement("style");
    s.id = "cqStyle";
    s.textContent = `
      #cqFloat {
        position: fixed !important; z-index: 2147483600;
        background: linear-gradient(180deg, #fdf5e0 0%, #ecd9b0 100%) !important;
        border: 2px solid #7a5c30 !important; border-radius: 10px !important;
        box-shadow: 0 4px 15px rgba(0,0,0,.5), inset 0 1px 0 #fffaf0 !important;
        overflow: hidden; display: none;
        font-family: Verdana, Arial, sans-serif; font-size: 13px;
        color: #3a2410; padding: 0; direction: ltr; text-align: left;
      }
      #cqFloat.show { display: flex !important; flex-direction: column; }
      #cqFloat.cq-minimized {
        left: 6px !important; right: auto !important;
        width: auto !important; max-width: 200px !important;
        max-height: none !important; border-radius: 20px !important;
      }
      #cqFloat.cq-minimized .cq-body,
      #cqFloat.cq-minimized .cq-shortcuts,
      #cqFloat.cq-minimized #cqStatus { display: none !important; }
      #cqFloat.cq-minimized .cq-head {
        border-bottom: none !important;
        border-radius: 20px !important;
        padding: 8px 14px !important;
      }
      .cq-head {
        background: linear-gradient(180deg, #d9bf8a 0%, #b89b62 100%) !important;
        color: #2a1a08 !important; font-weight: bold !important;
        padding: 10px 12px !important;
        border-bottom: 1px solid #7a5c30 !important;
        text-shadow: 0 1px 0 rgba(255,255,255,.5);
        display: flex !important; justify-content: space-between; align-items: center;
        font-size: 14px; flex-shrink: 0;
      }
      .cq-head-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
      .cq-title { font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .cq-min-toggle {
        cursor: pointer; user-select: none;
        display: inline-flex; align-items: center; justify-content: center;
        width: 28px; height: 28px; line-height: 1;
        border-radius: 4px; font-size: 15px; font-weight: bold;
        background: rgba(255,255,255,.35); color: #4a2a08;
        border: 1px solid rgba(122,92,48,.4); flex-shrink: 0;
      }
      .cq-shortcuts {
        display: flex; gap: 8px; padding: 10px 12px;
        background: rgba(255,255,255,.35);
        border-bottom: 1px solid rgba(122,92,48,.25); flex-shrink: 0;
      }
      .cq-sc-btn {
        flex: 1; padding: 12px 8px; font-size: 13px; font-weight: bold;
        font-family: Verdana, Arial, sans-serif; cursor: pointer;
        background: linear-gradient(180deg, #7bc554 0%, #4a8c28 100%);
        color: #fff; border: 1px solid #3a6a18; border-radius: 8px;
        text-shadow: 0 1px 1px rgba(0,0,0,.3);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.35);
        touch-action: manipulation;
        display: flex; align-items: center; justify-content: center;
        gap: 6px; min-height: 46px;
      }
      .cq-sc-btn:active { transform: translateY(1px); }
      .cq-sc-btn.cq-sc-gold {
        background: linear-gradient(180deg, #ffc040 0%, #cc8820 100%);
        border-color: #996010; color: #3a2000;
      }
      .cq-body {
        overflow-y: auto; overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        flex: 1 1 auto; min-height: 0; overscroll-behavior: contain;
      }
      .cq-body::-webkit-scrollbar { width: 6px; }
      .cq-body::-webkit-scrollbar-thumb { background: rgba(122,92,48,.5); border-radius: 3px; }
      .cq-village-list { display: flex; flex-direction: column; }
      .cq-village-row {
        display: flex; align-items: center; gap: 6px;
        padding: 6px 8px;
        border-bottom: 1px solid rgba(122,92,48,.18);
        background: rgba(255,255,255,.15);
        min-height: 48px;
      }
      .cq-village-row:last-child { border-bottom: none; }
      .cq-village-row.cq-vrow-cur {
        background: linear-gradient(90deg, rgba(120,200,80,.20) 0%, rgba(120,200,80,.05) 100%);
        border-left: 4px solid #4a8c28;
      }
      .cq-vname-wrap {
        flex: 1 1 auto; min-width: 0;
        display: flex; flex-direction: column; gap: 2px;
      }
      .cq-vname {
        font-weight: bold; font-size: 13px; color: #4a2a08;
        cursor: pointer; user-select: none;
        padding: 2px 4px; border-radius: 4px;
        background: transparent; border: none;
        text-align: left; font-family: inherit;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        max-width: 100%;
      }
      .cq-vname:hover { background: rgba(255,255,255,.4); }
      .cq-village-row.cq-vrow-cur .cq-vname { color: #1a5a10; }
      .cq-vres {
        display: flex; gap: 3px; flex-wrap: nowrap;
        font-size: 10px; font-family: 'Courier New', monospace;
        font-weight: bold; color: #2a1a08; overflow: hidden;
      }
      .cq-vres-item {
        display: inline-flex; align-items: center; gap: 1px;
        background: rgba(255,255,255,.4);
        padding: 1px 4px; border-radius: 3px;
        white-space: nowrap; flex-shrink: 0;
      }
      .cq-vres-item .cq-ico { font-size: 10px; }
      .cq-vres-item.cq-res-warn {
        color: #a02020; background: rgba(255,220,120,.65);
      }
      .cq-vres-item.cq-res-full {
        color: #fff; background: rgba(200,60,40,.85);
        animation: cqPulse 1s ease-in-out infinite;
      }
      @keyframes cqPulse {
        0%,100% { opacity: 1; }
        50%     { opacity: 0.55; }
      }
      .cq-vres-cap {
        font-size: 8px; color: #6a4a20;
        margin-left: 1px; opacity: .85;
      }
      .cq-vres-item.cq-res-full .cq-vres-cap { color: #fff; opacity: .9; }
      .cq-vact {
        display: flex; gap: 4px; flex-shrink: 0; align-items: center;
      }
      .cq-vbtn-icon {
        width: 38px; height: 38px; font-size: 16px; font-weight: bold;
        cursor: pointer; border-radius: 6px;
        border: 1px solid #b09878;
        background: linear-gradient(180deg, #e0d4b8 0%, #c8b898 100%);
        color: #5a3a10;
        display: flex; align-items: center; justify-content: center;
        touch-action: manipulation; padding: 0; flex-shrink: 0;
      }
      .cq-vbtn-icon:active { transform: translateY(1px); filter: brightness(1.1); }
      .cq-vbtn-icon.cq-send {
        background: linear-gradient(180deg, #6ba844 0%, #4a8228 100%);
        color: #fff; border-color: #3a6a18;
      }
      .cq-vbtn-icon.cq-go {
        background: linear-gradient(180deg, #6a9ee8 0%, #3060b0 100%);
        color: #fff; border-color: #204080;
      }
      #cqStatus {
        color: #1a6a10 !important; font-size: 11px;
        padding: 5px 12px; font-weight: bold;
        text-align: center; min-height: 16px;
        background: rgba(255,255,255,.25);
        border-top: 1px solid rgba(122,92,48,.20);
        flex-shrink: 0;
      }
      .cq-empty {
        padding: 20px; text-align: center;
        color: #8a7050; font-style: italic; font-size: 12px;
      }
    `;
    document.head.appendChild(s);
  }

  function boxHTML() {
    return `
      <div class="cq-head">
        <span class="cq-head-left">
          <span class="cq-min-toggle cq-min" title="Minimize">—</span>
          <span class="cq-title">📱 Travian Mobile Menu</span>
        </span>
      </div>
      <div class="cq-shortcuts">
        <button type="button" class="cq-sc-btn cq-sc-gold" data-shortcut="market">
          <span>🏪</span><span>Market</span>
        </button>
        <button type="button" class="cq-sc-btn" data-shortcut="rally">
          <span>⚔️</span><span>Rally</span>
        </button>
      </div>
      <div class="cq-body">
        <div class="cq-village-list cqVillageList"></div>
      </div>
      <div id="cqStatus"></div>
    `;
  }

  function attachHandlers(box) {
    const minBtn = box.querySelector(".cq-min");
    if (minBtn && !minBtn._bound) {
      minBtn._bound = true;
      minBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMinimized(!getMinimized());
      });
    }
    const marketBtn = box.querySelector('[data-shortcut="market"]');
    if (marketBtn && !marketBtn._bound) {
      marketBtn._bound = true;
      marketBtn.addEventListener("click", (e) => {
        e.preventDefault();
        goToMarketplace();
      });
    }
    const rallyBtn = box.querySelector('[data-shortcut="rally"]');
    if (rallyBtn && !rallyBtn._bound) {
      rallyBtn._bound = true;
      rallyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        goToRallyPoint();
      });
    }
    applyMinimizedClass();
  }

  function applyMinimizedClass() {
    const on = getMinimized();
    const el = document.getElementById("cqFloat");
    if (el) setClassIfChanged(el, "cq-minimized", on);
    document.querySelectorAll(".cq-min-toggle").forEach((b) => {
      setTextIfChanged(b, on ? "▢" : "—");
      b.title = on ? "Expand" : "Minimize";
    });
  }

  function flashStatus(msg) {
    const s = document.getElementById("cqStatus");
    if (!s) return;
    setTextIfChanged(s, msg);
    clearTimeout(s._t);
    s._t = setTimeout(() => {
      if (s.textContent !== "") s.textContent = "";
    }, 3500);
  }

  function renderVillages() {
    const curVid = getVillageId();
    const cache = getVillageCache();
    const domOrder = readVillages().map((v) => v.vid);
    const order = [...domOrder];
    Object.keys(cache).forEach((vid) => {
      if (!order.includes(vid)) order.push(vid);
    });

    if (!order.length) {
      $$(".cqVillageList").forEach((list) =>
        setHTMLIfChanged(list, '<div class="cq-empty">No villages yet</div>'),
      );
      return;
    }

    const html = order
      .map((vid) => {
        const v = cache[vid] || {};
        const name = v.name || "V#" + String(vid).slice(-3);
        const isCur = String(vid) === String(curVid);
        const r = v.res || {};
        const x = v.x,
          y = v.y;
        const coords =
          typeof x === "number" && typeof y === "number" ? ` (${x}|${y})` : "";

        const cell = (key, max, ico) => {
          const val = r[key];
          const cap = r[max];
          if (val === undefined || val === null) {
            return `<span class="cq-vres-item"><span class="cq-ico">${ico}</span>—</span>`;
          }
          let cls = "cq-vres-item";
          if (cap && cap > 0) {
            const pct = val / cap;
            if (pct >= 0.98) cls += " cq-res-full";
            else if (pct >= 0.9) cls += " cq-res-warn";
          }
          const capTxt =
            cap && cap > 0
              ? `<span class="cq-vres-cap">/${formatNumber(cap)}</span>`
              : "";
          return `<span class="${cls}"><span class="cq-ico">${ico}</span>${formatNumber(val)}${capTxt}</span>`;
        };

        return `
        <div class="cq-village-row ${isCur ? "cq-vrow-cur" : ""}" data-vid="${vid}">
          <div class="cq-vname-wrap">
            <button type="button" class="cq-vname" data-vid="${vid}" title="${escapeHtml(name)}${coords}">
              ${escapeHtml(name)}${coords}
            </button>
            <div class="cq-vres">
              ${cell("wood", "maxWood", "🪵")}
              ${cell("clay", "maxClay", "🧱")}
              ${cell("iron", "maxIron", "⛓")}
              ${cell("crop", "maxCrop", "🌾")}
            </div>
          </div>
          <div class="cq-vact">
            <button type="button" class="cq-vbtn-icon cq-send" data-send="${vid}" title="Send resources to ${escapeHtml(name)}">📤</button>
            <button type="button" class="cq-vbtn-icon cq-go" data-go="${vid}" title="Go to ${escapeHtml(name)}">🏠</button>
          </div>
        </div>`;
      })
      .join("");

    $$(".cqVillageList").forEach((list) => setHTMLIfChanged(list, html));

    document.querySelectorAll(".cq-vname").forEach((btn) => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        goToVillage(btn.dataset.vid);
      });
    });
    document.querySelectorAll("[data-go]").forEach((btn) => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        goToVillage(btn.dataset.go);
      });
    });
    document.querySelectorAll("[data-send]").forEach((btn) => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        requestSendResources(btn.dataset.send);
      });
    });
  }

  function ensureFloating() {
    let f = document.getElementById("cqFloat");
    if (f) return f;
    f = document.createElement("div");
    f.id = "cqFloat";
    f.innerHTML = boxHTML();
    document.body.appendChild(f);
    attachHandlers(f);
    applyMinimizedClass();
    return f;
  }

  function positionFloating(f) {
    if (getMinimized()) {
      f.style.top = "auto";
      f.style.left = "6px";
      f.style.right = "auto";
      f.style.bottom = CFG.MINIMIZED_BOTTOM_PX + "px";
      f.style.maxWidth = "200px";
      f.style.maxHeight = "none";
      f.classList.add("cq-mobile");
      return;
    }
    f.style.top = "auto";
    f.style.left = "6px";
    f.style.right = "6px";
    f.style.maxWidth = "none";
    f.style.maxHeight = CFG.PANEL_MAX_VH + "vh";
    const bottomPx = getPanelBottomOffset();
    f.style.bottom = bottomPx + "px";
    f.classList.add("cq-mobile");
  }

  function updateVisibility() {
    const mobile = isMobileView();
    const show = mobile && (isHubPage() || isMarketSendPage());
    let f = document.getElementById("cqFloat");
    if (!show) {
      if (f) f.classList.remove("show");
      return;
    }
    f = ensureFloating();
    positionFloating(f);
    setClassIfChanged(f, "show", true);
  }

  function tick() {
    try {
      updateVillageCache();
      cacheCurrentVillageResources();
      renderVillages();
      consumeSendTarget();
      if (isMobileView()) {
        const f = document.getElementById("cqFloat");
        if (f && f.classList.contains("show")) positionFloating(f);
      }
    } catch (e) {
      console.warn("[TMM] tick error:", e);
    }
    setTimeout(tick, document.hidden ? CFG.TICK_HIDDEN_MS : CFG.TICK_IDLE_MS);
  }

  function init() {
    console.log(`[TMM] init v${CFG.SCRIPT_VERSION} → ${location.pathname}`);
    injectStyles();
    ensureStorage();
    updateVisibility();
    updateVillageCache();
    const v = readVillages();
    console.log("[TMM] villages read:", v);
    tick();

    setInterval(() => {
      try {
        updateVisibility();
      } catch {}
    }, 2000);
    window.addEventListener("resize", () => {
      try {
        updateVisibility();
      } catch {}
    });
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        try {
          updateVisibility();
        } catch {}
      }, 300);
    });
    window.addEventListener(
      "scroll",
      () => {
        if (isMobileView()) {
          const f = document.getElementById("cqFloat");
          if (f && f.classList.contains("show")) positionFloating(f);
        }
      },
      { passive: true },
    );
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden)
        setTimeout(() => {
          updateVisibility();
        }, 200);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
