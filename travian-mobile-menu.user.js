// ==UserScript==
// @name         Travian Mobile Menu
// @namespace    github.com/Logical-Developer/Travian-Mobile-Menu
// @version      1.2.0
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
    SCRIPT_VERSION: "1.2.0",
    TICK_IDLE_MS: 2500,
    TICK_HIDDEN_MS: 10000,
    UI_STATE_KEY: "travian_builder_ui_v1",
    MINIMIZED_BOTTOM_PX: 200,
    PANEL_MAX_VH: 50,
  };

  /* ═══ SVG icons for shortcuts ═══ */
  const ICONS = {
    rally:
      "M149.6 85.8h20.7v150.5l-70.6-39.6-71.1 39.6V85.8h21.2v115.5l50.1-31.4 49.7 31.4V85.8Zm-13.1.7h-74v88.9L99.6 151l36.8 24.4V86.5Zm50.3-35.2c-3.5 0-6.6 1.4-8.8 3.7H21.1C14 47.2-.4 52.8 0 63.6c-.4 10.8 14 16.5 21.1 8.6H178c17.9 15.1 32.2-18.6 8.8-20.9ZM87.4 219.8V250h24v-30.2c-14-3.7-10.1-3.7-24 0ZM96.6 39c7.6 2.7 19.5-5 22-8.5 1.6-2 1.7-4.8.2-6.7L100.6-.1h-.2L81.9 23.8c-4 7.5 5.6 11.9 14.7 15.2Z",
    market:
      "M23.5 108.2c-1.7.5-8.5-.3-5.1-7.2-1-3.6 1.2-6.6 4.3-6.1 1.4-6 1.1-10.5 11.5-9.1.8-2.2 8.9-4.3 13.9-.3h2.4c-.8-1-14.3-22.6-24.1-17-2.6 4.2-5.3.1-8.8-.4 0 0-1.1 10.7-7.7 5.2-9.2.9-14.2-4.4-5-10.7 0 0-2.8-7.9 6.7-5.6.5-12.1 4.5-17.9 16.8-11.8 7.4-13.8 46.5 28.9 49.9 31.2-3.4-5.4-18.4-30.6-27.4-34.1-3.9-1-17.4-4.1-10.6-10.7-1.4-1.7-1.4-3.1 1.1-2.6 2.5.4 5.1 3.1 5.1 3.1l13.3 8.3-9.7-12.9s-3.5-1.5-4.5-1.9c-1-.4-1.6-3.9 2.4-4.5 4-.6 10.8 2.2 10.8 2.2s-3.9-6.7-4.5-6.7-4.5-5.3 2-5.5c-.9-14.7 11.4 3 11.4 3.6 0 0-1.6-9.2.8-11.4C77.6-8.4 85 14.3 86 18.8c4.7 3 5.7 10.9 6.3 14.9l5.3 8.1-2.8-15.5c-8.4-14.6-6.4-36 12.1-15.1.3-6.3 6.6-4.4 8.6-1.2l2.8 8.9s1.8-8.5 4.3-9.8 4.9-.8 5.3 3.3c4.5-2 7.3-2.2 8.7 1.2 14.1 6.3.6 18.2-2.5 26.9-.8 1.8-3.3 12.4-3.3 12.4L146 35.7s-.8-6.3 7.5-5.3c3.1-5.3 8.1-13.8 15.3-7.9 6.5-3.3 12.8-5.3 14.8 1.4 7.1.4 12.2.2 12.4 10.4 7.1 8.3 6.1 16-3 11.2-3.1 2-5.3 1.8-6.7-.8-1.8 4.5-8.5 12.8-13.4 5.5-2 1.4-27.5 17.3-31.1 35.1 15.9-14.2 27.9-28.3 41.4-25.9 7.3-4.2 11.2-6.7 16.5-1.2 4.3-.2 5.9 4.1 5.7 5.9 5.9-1 10.4-1 10.8 4.1.8 8.6-1.3 17.2-7.7 9.8 0 0-7.9 4.5-9.2-2.8-4.7 3.1-11.4 6.3-14.6 1.6-2.6 1.8-8.1 6.1-11 12.6-26.8 7.5-105.6 30.9-105.6 30.9l-5.6-5s-4.2 8-9.9 0c-1.7 0-3.8 0-5.1 3.2-12.9.9.6-12.3 4.2-11 0 0-1.8-4.3 4.7-4.2-12-13.9-24.7-2.2-32.9 4.9Zm151.6 5.7c7.6-1.3 35.5 21.8 42 25.1l10.8-2.5c-14.6-7.6-24.2-35.1-17.3-49.7-13.9 3.6-97.8 25.5-98.4 25.7l39.8 11.4v13.8h6.1c-1.5-11.5 4.5-23.7 16.9-23.7ZM37.2 138.2l86.6 25.3c-.2-4.4-.1-21.4-.1-26.1h20.5v-8.2l-42.9-9.1s-63.1 18.1-64 18.1Zm-7.9 11v29.9c10.9 4 70.7 27.2 80.6 29.6l13.8-10.1v-28.9s-88.1-25.4-90.2-26.8l-4.2 6.4Zm194.4-66.9c-19.3 6.8-1.1 56.8 18.1 49.6 19.2-6.9 1-56.7-18.1-49.6Zm-1.1 81.8c-7.1-4.8-16.3-11.2-23.5-15.9-22.2-13.6-27.1-26.6-25.7 9.5h-28.6v32h28.6v18.8c0 3.6 3.4 5.8 6.1 4 12.7-8.6 38.4-26.1 51.2-34.7 6.7-5.6-4.4-10.9-8.2-13.6Z",
    barracks:
      "m138.6 172.6 3.8 3.2s-12.3 8.4-20.5 7c-8.1-1.5-16.2-23-16.2-23.3-.5-7.8-7-13.8-14.8-13.8s-14.8 6.6-14.8 14.8 1.1 6.5 3 9c2.6 3.5 6.7 5.7 11.3 5.9-34.5 25.8-75.6 24.7-75.6 24.7l28.4-65.6 8.8 5.2 30-25.1-18.8-13.9s-14.8 2.7-28.2 12.4c-2.1 4.8-9.6 27.4-9.6 27.4L12 146.9l11-40.6 1.6-5.9c7-20.9 26.7-36.1 50-36.1s52.7 23.6 52.7 52.7-.8 11.3-2.6 16.4c-1.6 11.4-1.5 29.8 13.9 39.2Zm18-63.1 27.3-3.4c-2-19.5-8.2-37.8-18-53.6l-36.8 14.9 28.3-27C146.1 26.5 131.8 15.3 115 8.3L94.5 42.5l8-38.6c-.6-.2-1.3-.4-1.9-.5C87.5 0 74.2-.8 61.4.8l4.2 30.8L51 2.5c-16.9-.4-33.3 4.2-51 9l39.3 45.1c10.4-1.4 35-10.3 45.6-7.6 46.3 12.1 64.7 54.6 54.1 105.1 13.7 11.7 0 0 31.2 31.5 8.8-26.3 4.8-11.8 10-31.5 2.8-11 4.3-22 4.4-32.8l-28-11.7Z",
    stable:
      "M218.3 128.8c7.5 2.5 13.7 6.2 18.7 10-12.5-19.8-38.6-60.7-65-68.7 3.7 0 17.5-1.2 20 0-11.2-6.2-13.7-11.2-70-31.2q-8.7-2.5-18.7-6.2C102.2 28 86.5-2.1 69.7.1c1.6 5.7 3 37.8 3.7 41.2 0 0-1.2 0-2.5 1.2-4.6-.8-22.1-12.5-26.2-15 0 0 1.2 23.7 10 31.2-5 5-8.7 10-11.2 8.7-17.6 6.4-11.1 19.4-11.2 32.5-8.9 17.5-13.7 40.2-25 56.2-8.2 2.3-10 13.8-2.5 18.7 2.7 14.1 15 22.5 28.7 21.2 11.2-1.2 18.7-10 21.2-21.2 40.4-10.2 83.1-45.4 35-73.7 79.9 8.7-5 136.2-6.2 141.2 17.5 10 28.7 8.7 63.7 3.7 18.7-7.5 45-30 60-37.5 10.9-24.1 21.2-53.4 11.2-79.9Zm-158.6-30c-2.5 1.2-5 2.5-6.2 2.5-6.2 0-10 3.7-10-1.2s2.5-17.5 8.7-17.5c14.4-2.2 18.5 6.7 7.5 16.2Zm139.9 102.4c-6.2-94.9-81.2-138.7-86.2-141.2 6.2 1.2 103.7 28.7 86.2 141.2Z",
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

  /* ═══ Format countdown: 1h:20m | 5m:20s | 30s ═══ */
  function formatCountdown(ms) {
    if (!ms || ms <= 0) return "";
    const totalSec = Math.ceil(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h:${String(m).padStart(2, "0")}m`;
    if (m > 0) return `${m}m:${String(s).padStart(2, "0")}s`;
    return `${s}s`;
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

  /* ═══ PRIMARY: React viewData ═══ */
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

  /* ═══ FALLBACK: DOM parse ═══ */
  function parseCoord(text) {
    if (text === undefined || text === null) return null;
    let t = String(text);
    t = t.replace(/[\u202A-\u202E\u2066-\u2069\u200E\u200F\uFEFF]/g, "");
    t = t.replace(/\u2212/g, "-");
    t = t.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, "-");
    t = t.replace(/[\uFE58\uFE63\uFF0D]/g, "-");
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

  /* ═══ Resources + Free crop ═══ */
  function readCurrentResources() {
    try {
      if (typeof window.resources === "object" && window.resources.storage) {
        const st = window.resources.storage || {};
        const max = window.resources.maxStorage || {};
        const prod = window.resources.production || {};
        return {
          wood: st.l1,
          clay: st.l2,
          iron: st.l3,
          crop: st.l4,
          maxWood: max.l1,
          maxClay: max.l2,
          maxIron: max.l3,
          maxCrop: max.l4,
          freeCrop: prod.l5,
        };
      }
    } catch {}
    const getNum = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return undefined;
      const t = (el.textContent || "")
        .replace(/[\u202A-\u202E\u2066-\u2069\u200E\u200F\uFEFF]/g, "")
        .replace(/[^\d-]/g, "");
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
      freeCrop: getNum("#stockBarFreeCrop"),
    };
  }

  /* ═══ Construction timer: read from .buildingList ═══ */
  function readCurrentConstruction() {
    const timerEl = document.querySelector(
      ".buildingList .buildDuration .timer[value]," +
        ".buildingList .buildDuration .timer[data-value]",
    );
    if (!timerEl) return null;
    const raw =
      timerEl.getAttribute("value") || timerEl.getAttribute("data-value");
    const sec = parseInt(raw, 10);
    if (isNaN(sec) || sec <= 0) return null;
    let name = null,
      level = null;
    const li = timerEl.closest("li");
    if (li) {
      const lvlEl = li.querySelector(".lvl, .level");
      if (lvlEl) {
        const m = (lvlEl.textContent || "").match(/(\d+)/);
        if (m) level = parseInt(m[1], 10) || null;
      }
      const nameEl = li.querySelector(".name");
      if (nameEl) {
        const clone = nameEl.cloneNode(true);
        const lvl = clone.querySelector(".lvl, .level");
        if (lvl) lvl.remove();
        name = clone.textContent.replace(/\s+/g, " ").trim() || null;
      }
    }
    return { remainingSec: sec, name, level };
  }

  function cacheCurrentVillageResources() {
    const vid = getVillageId();
    if (!vid) return;

    const r = readCurrentResources();
    if (r.wood !== undefined || r.clay !== undefined) {
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
          freeCrop: r.freeCrop,
        },
      });
    }

    // Cache construction endsAt
    const c = readCurrentConstruction();
    if (c && c.remainingSec > 0) {
      const endsAt = nowTick() + c.remainingSec * 1000;
      const cache = getVillageCache();
      const cur = cache[String(vid)] || {};
      // Only update if changed by more than 5 seconds to avoid useless writes
      const prev = cur.buildEndsAt || 0;
      if (Math.abs(prev - endsAt) > 5000) {
        cache[String(vid)] = {
          ...cur,
          buildEndsAt: endsAt,
          buildName: c.name || cur.buildName,
          buildLevel: c.level || cur.buildLevel,
          ts: nowTick(),
        };
        saveVillageCache(cache);
      }
    }
  }

  /* ═══ Navigation ═══ */
  function navigateTo(url) {
    window.location.href = url;
  }

  function goToBuilding(gid, extra) {
    const vid = getVillageId();
    const parts = [];
    if (vid) parts.push(`newdid=${vid}`);
    parts.push(`gid=${gid}`);
    if (extra) parts.push(extra);
    navigateTo("/build.php?" + parts.join("&"));
  }
  function goToRallyPoint() {
    goToBuilding(16, "tt=1");
  }
  function goToMarketplace() {
    goToBuilding(17, "t=5");
  }
  function goToBarracks() {
    goToBuilding(19);
  }
  function goToStable() {
    goToBuilding(20);
  }

  /* ═══ Home → dorf1 of that village ═══ */
  function goToVillageDorf1(vid) {
    if (!vid) return;
    navigateTo(`/dorf1.php?newdid=${vid}`);
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

  /* ═══ ★ Fixed: fill + force React to see the value ═══ */
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

      // Focus x and set
      xIn.focus();
      setVal(xIn, x);

      // Simulate Tab: focus y which blurs x → triggers React onChange validation
      yIn.focus();
      setVal(yIn, y);

      // Real blur on y (fires React's onBlur)
      yIn.blur();

      // Additional keyboard Tab events for React listeners
      try {
        const tabEv = () =>
          new KeyboardEvent("keydown", {
            key: "Tab",
            code: "Tab",
            keyCode: 9,
            which: 9,
            bubbles: true,
            cancelable: true,
          });
        const tabEvUp = () =>
          new KeyboardEvent("keyup", {
            key: "Tab",
            code: "Tab",
            keyCode: 9,
            which: 9,
            bubbles: true,
            cancelable: true,
          });
        xIn.dispatchEvent(tabEv());
        xIn.dispatchEvent(tabEvUp());
        yIn.dispatchEvent(tabEv());
        yIn.dispatchEvent(tabEvUp());
      } catch {}

      // Also fire blur event explicitly (belt + suspenders)
      try {
        xIn.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
        yIn.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
      } catch {}

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
        // Small delay to let React render the form
        setTimeout(() => {
          fillMarketForm(t.x, t.y);
          flashStatus(`📤 Target: ${t.name} (${t.x}|${t.y})`);
        }, 400);
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
        if (offset > 40 && offset < window.innerHeight * 0.85)
          return Math.round(offset + 6);
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
        width: auto !important; max-width: 220px !important;
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
      .cq-version { font-size: 10px; font-weight: normal; opacity: 0.65; margin-left: 2px; }
      .cq-min-toggle {
        cursor: pointer; user-select: none;
        display: inline-flex; align-items: center; justify-content: center;
        width: 28px; height: 28px; line-height: 1;
        border-radius: 4px; font-size: 15px; font-weight: bold;
        background: rgba(255,255,255,.35); color: #4a2a08;
        border: 1px solid rgba(122,92,48,.4); flex-shrink: 0;
      }

      .cq-shortcuts {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        padding: 8px 10px;
        background: rgba(255,255,255,.35);
        border-bottom: 1px solid rgba(122,92,48,.25);
        flex-shrink: 0;
      }
      .cq-sc-btn {
        padding: 6px 2px;
        font-size: 10px; font-weight: bold;
        font-family: Verdana, Arial, sans-serif;
        cursor: pointer;
        background: linear-gradient(180deg, #7bc554 0%, #4a8c28 100%);
        color: #fff; border: 1px solid #3a6a18; border-radius: 6px;
        text-shadow: 0 1px 1px rgba(0,0,0,.3);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.35);
        touch-action: manipulation;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 3px; min-height: 54px; min-width: 0;
      }
      .cq-sc-btn:active { transform: translateY(1px); filter: brightness(1.1); }
      .cq-sc-icon { width: 24px; height: 24px; fill: currentColor; flex-shrink: 0; }
      .cq-sc-label {
        font-size: 10px; line-height: 1;
        white-space: nowrap; overflow: hidden;
        text-overflow: ellipsis; max-width: 100%;
      }
      .cq-sc-btn.cq-sc-gold {
        background: linear-gradient(180deg, #ffc040 0%, #cc8820 100%);
        border-color: #996010; color: #3a2000;
      }
      .cq-sc-btn.cq-sc-red {
        background: linear-gradient(180deg, #e07050 0%, #a83020 100%);
        border-color: #802010; color: #fff;
      }
      .cq-sc-btn.cq-sc-blue {
        background: linear-gradient(180deg, #6a9ee8 0%, #3060b0 100%);
        border-color: #204080; color: #fff;
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
        display: flex; align-items: center; gap: 8px;
        padding: 8px 10px;
        border-bottom: 1px solid rgba(122,92,48,.18);
        background: rgba(255,255,255,.15);
        min-height: 60px;
      }
      .cq-village-row:last-child { border-bottom: none; }
      .cq-village-row.cq-vrow-cur {
        background: linear-gradient(90deg, rgba(120,200,80,.20) 0%, rgba(120,200,80,.05) 100%);
        border-left: 4px solid #4a8c28;
      }
      .cq-vname-wrap {
        flex: 1 1 auto; min-width: 0;
        display: flex; flex-direction: column; gap: 3px;
      }
      .cq-vname {
        font-weight: bold; font-size: 13px; color: #4a2a08;
        cursor: pointer; user-select: none;
        padding: 2px 4px; border-radius: 4px;
        background: transparent; border: none;
        text-align: left; font-family: inherit;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        max-width: 100%;
        display: flex; align-items: center; gap: 6px;
      }
      .cq-vname:hover { background: rgba(255,255,255,.4); }
      .cq-village-row.cq-vrow-cur .cq-vname { color: #1a5a10; }
      .cq-vname-text {
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        flex: 1 1 auto; min-width: 0;
      }

      /* Construction timer */
      .cq-ctimer {
        font-size: 10px;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        color: #8a4a00;
        background: rgba(255,220,120,.65);
        padding: 1px 5px;
        border-radius: 3px;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .cq-ctimer.cq-ctimer-done {
        color: #fff;
        background: #4a8c28;
      }

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

      /* Free crop badge */
      .cq-vfree {
        font-weight: bold; font-size: 9px;
        padding: 0 3px; border-radius: 2px;
        margin-left: 3px;
      }
      .cq-vfree.pos { color: #1a6a10; background: rgba(120,200,80,.35); }
      .cq-vfree.neg {
        color: #fff; background: #c0392b;
        animation: cqPulse 1s ease-in-out infinite;
      }

      /* Row action buttons */
      .cq-vact {
        display: flex; gap: 6px; flex-shrink: 0; align-items: center;
      }
      .cq-vbtn-icon {
        width: 50px;
        height: 48px;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        border-radius: 7px;
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

  /* ═══ Panel HTML ═══ */
  function svgIcon(name, viewBox) {
    return `<svg class="cq-sc-icon" viewBox="${viewBox}"><path d="${ICONS[name]}"/></svg>`;
  }

  function boxHTML() {
    return `
      <div class="cq-head">
        <span class="cq-head-left">
          <span class="cq-min-toggle cq-min" title="Minimize">—</span>
          <span class="cq-title">📱 Travian Mobile Menu <span class="cq-version">(v${CFG.SCRIPT_VERSION})</span></span>
        </span>
      </div>
      <div class="cq-shortcuts">
        <button type="button" class="cq-sc-btn cq-sc-gold" data-shortcut="market" title="Marketplace">
          ${svgIcon("market", "0 0 250 213")}
          <span class="cq-sc-label">Market</span>
        </button>
        <button type="button" class="cq-sc-btn cq-sc-red" data-shortcut="rally" title="Rally Point">
          ${svgIcon("rally", "0 0 199 250")}
          <span class="cq-sc-label">Rally</span>
        </button>
        <button type="button" class="cq-sc-btn cq-sc-blue" data-shortcut="barracks" title="Barracks">
          ${svgIcon("barracks", "0 0 184.6 200")}
          <span class="cq-sc-label">Barracks</span>
        </button>
        <button type="button" class="cq-sc-btn" data-shortcut="stable" title="Stable">
          ${svgIcon("stable", "0 0 237.1 250")}
          <span class="cq-sc-label">Stable</span>
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
    const handlers = {
      market: goToMarketplace,
      rally: goToRallyPoint,
      barracks: goToBarracks,
      stable: goToStable,
    };
    Object.keys(handlers).forEach((key) => {
      const btn = box.querySelector(`[data-shortcut="${key}"]`);
      if (btn && !btn._bound) {
        btn._bound = true;
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          handlers[key]();
        });
      }
    });
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

    const now = nowTick();

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

        // ─── Construction timer ───
        let ctimer = "";
        if (v.buildEndsAt) {
          const remain = v.buildEndsAt - now;
          if (remain > 0) {
            ctimer = `<span class="cq-ctimer" title="${escapeHtml(v.buildName || "Building")} L${v.buildLevel || "?"}">🔨 ${formatCountdown(remain)}</span>`;
          } else {
            ctimer = `<span class="cq-ctimer cq-ctimer-done" title="Done">✓ Done</span>`;
          }
        }

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

          // Free crop badge on crop cell
          let freeBadge = "";
          if (key === "crop") {
            const fc = r.freeCrop;
            if (typeof fc === "number" && !isNaN(fc)) {
              const isNeg = fc < 0;
              freeBadge = `<span class="cq-vfree ${isNeg ? "neg" : "pos"}">${fc > 0 ? "+" : ""}${fc}</span>`;
            }
          }
          return `<span class="${cls}"><span class="cq-ico">${ico}</span>${formatNumber(val)}${capTxt}${freeBadge}</span>`;
        };

        return `
        <div class="cq-village-row ${isCur ? "cq-vrow-cur" : ""}" data-vid="${vid}">
          <div class="cq-vname-wrap">
            <button type="button" class="cq-vname" data-vid="${vid}" title="${escapeHtml(name)}${coords}">
              <span class="cq-vname-text">${escapeHtml(name)}${coords}</span>
              ${ctimer}
            </button>
            <div class="cq-vres">
              ${cell("wood", "maxWood", "🪵")}
              ${cell("clay", "maxClay", "🧱")}
              ${cell("iron", "maxIron", "⛓")}
              ${cell("crop", "maxCrop", "🌾")}
            </div>
          </div>
          <div class="cq-vact">
            <button type="button" class="cq-vbtn-icon cq-send" data-send="${vid}" title="Send resources to ${escapeHtml(name)}">🏪</button>
            <button type="button" class="cq-vbtn-icon cq-go" data-go="${vid}" title="Go to ${escapeHtml(name)} (dorf1)">🏠</button>
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
        goToVillageDorf1(btn.dataset.vid);
      });
    });
    document.querySelectorAll("[data-go]").forEach((btn) => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        goToVillageDorf1(btn.dataset.go);
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
      f.style.maxWidth = "220px";
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
