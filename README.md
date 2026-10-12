# 📱 Travian Mobile Menu

> A mobile-friendly floating menu for Travian with village list, resources, production, construction timers, celebration timers, and quick shortcuts.

[![Version](https://img.shields.io/badge/version-1.4.0-blue.svg)](https://github.com/Logical-Developer/Travian-Mobile-Menu)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Userscript](https://img.shields.io/badge/userscript-Tampermonkey-orange.svg)](https://www.tampermonkey.net/)

---

## ✨ Features

### 🏘️ Village List
- All your villages in one compact floating panel
- Current village highlighted with green border
- Village name + coordinates
- Click village name to **switch village** (without leaving current page)
- Click 🏠 to go to village's `dorf1.php`

### 📦 Resources
- Live wood / clay / iron / crop values per village
- Capacity display (`current/max`)
- Color warnings:
  - 🟡 **Yellow** when ≥ 90% full
  - 🔴 **Red blinking** when ≥ 98% full
- **Free crop** badge (green if positive, red blinking if negative)

### ⏱️ Construction Timer
- 🔨 countdown per village (e.g. `🔨 1h:23m`)
- `Done` badge when finished
- Browser notification (🔔) when a building finishes
- Web Audio beep + title blink

### 🎉 Celebration Timer
- ♫ music note per village
- Black ♫ + countdown when a celebration is running
- Red blinking ♫ when no celebration or no data
- Data read from the Town Hall page (`build.php?...&gid=24`)

### 📈 Production Box (right sidebar)
- A Travian-styled sidebar box reusing the village-list box design (`sidebarBox` + `boxTitle`)
- Added to the right sidebar (`#sidebarAfterContent`) on every page, so it appears in **all villages**
- Shows the **current village's** production per hour with Travian's own resource icons (`<i class="r1..r4">`)
- Negative values in red; collapse state persisted in `localStorage`

### 🚀 Quick Shortcuts
| Icon | Action |
|------|--------|
| 🏛️ Market | Open marketplace send-resources page |
| ⚔️ Rally | Open rally point |
| 🗡️ Barracks | Open barracks |
| 🐎 Stable | Open stable |

### 📤 Send Resources
- Click 🏪 on any village row
- Auto-navigates to market and **auto-fills target coordinates**
- Works with Travian's React form

### 🔔 Notifications
- Toggle on/off with 🔔 / 🔕 button
- Requests browser notification permission on first enable
- Click notification to jump to the finished village

### 🗜️ Minimize
- Click `—` to minimize to a compact pill
- Click `▢` to expand
- State persisted in `localStorage`

---

## 📥 Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Edge, Safari, Firefox)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox)
2. Click the install link below:

   **[⬇️ Install Travian Mobile Menu](https://raw.githubusercontent.com/Logical-Developer/Travian-Mobile-Menu/main/Travian-Mobile-Menu.user.js)**

3. Confirm installation in your userscript manager.
4. Open Travian on your phone or resize your browser to < 768px.

---

## 🎮 Usage

| Action | How |
|--------|-----|
| Show menu | Automatically appears on `dorf1.php` / `dorf2.php` / market send page |
| Switch village | Tap village name |
| Go to village | Tap 🏠 |
| Send resources | Tap 🏪 |
| Minimize | Tap `—` in header |
| Expand | Tap `▢` in header |
| Toggle notifications | Tap 🔔 / 🔕 |
| Quick shortcuts | Tap Market / Rally / Barracks / Stable |
| Toggle production box | Tap its header/title in the right sidebar |

---

## 🛠️ Development

### Versioning
This project follows **Semantic Versioning**:
- `MAJOR.MINOR.PATCH`
- Current: `1.4.0`

When modifying:
1. Bump `@version` in userscript header
2. Bump `CFG.SCRIPT_VERSION` in code
3. Copy current version to `Backup/Travian Mobile Menu-<VERSION>.user.js.txt`
4. Commit with conventional message

### Local Testing
1. Open Tampermonkey dashboard
2. Create new script → paste contents of `Travian-Mobile-Menu.user.js`
3. Save (Ctrl+S)
4. Reload Travian with mobile emulation (DevTools → Ctrl+Shift+M)

### Project Structure
```
/
├── Travian-Mobile-Menu.user.js    # Main userscript
├── README.md                       # This file
├── LICENSE                         # MIT
├── .clinerules                     # Cline AI rules
├── .gitignore
├── Backup/                         # Old versions (not in git)
└── Private-Document/               # DOM dumps & notes (not in git)
    └── Travian-Dom/
        ├── Dorf1 - Dom.txt
        └── Town Hall - Dom.txt
```

---

## 🧩 Compatibility

| Platform | Status |
|----------|--------|
| Travian Legends (legends.travian.com) | ✅ Tested |
| Travian International (*.travian.com) | ✅ Tested |
| Travian Top (*.traviantop.com) | ✅ Tested |
| Chrome (desktop & mobile) | ✅ |
| Firefox (desktop & mobile) | ✅ |
| Safari (iOS) | ⚠️ Not tested |
| Tampermonkey | ✅ |
| Violentmonkey | ✅ |

---

## 🐛 Known Issues
- Notifications require HTTPS and user permission.
- Market auto-fill may fail if Travian changes form structure.
- Celebration timer needs one visit to each village's Town Hall page (`build.php?...&gid=24`) to be cached.

---

## 🗺️ Roadmap

- [x] v1.2.0 — Base floating menu with village list
- [x] v1.3.1 — Construction timers, notifications, production badge, send resources
- [x] v1.4.0 — Production box in the right sidebar + Celebration timer (♫)
- [ ] v1.5.0 — Troop movements panel
- [ ] v1.6.0 — Farm list quick access
- [ ] v2.0.0 — Full UI redesign

---

## 📄 License

MIT © [Logical-Developer](https://github.com/Logical-Developer)

---

## 🙏 Credits
- Icons: Travian official SVG sprites
- Built with ❤️ for the Travian mobile community
