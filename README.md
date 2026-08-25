# ⚡ Kunal Kushwaha DSA Bootcamp Assignment Tracker

A modern, responsive tracker to monitor and solve all **614+ questions across 18 assignment modules** from Kunal Kushwaha's official [DSA-Bootcamp-Java](https://github.com/kunal-kushwaha/DSA-Bootcamp-Java/tree/main/assignments) repository.

Works seamlessly as both a **standalone Web App** and a **Chrome Extension (Side Panel & Popup)**.

---

## 🌟 Key Features

- 📊 **Comprehensive Progress Dashboard**: Real-time stats, circular metrics, difficulty breakdown (Easy / Medium / Hard), and daily streak tracker.
- 🎯 **All 18 Assignment Modules**: Flow of Program, Conditionals, Arrays, Searching, Sorting, Strings, Recursion, Bitwise, OOP, Linked List, Stack/Queue, Trees, and more.
- 🔗 **Direct Platform Links**: Instant 1-click links to LeetCode, GeeksforGeeks, HackerRank, CodeStudio, and YouTube lectures.
- 📝 **Notes & Solution Links**: Save your approaches, time complexities, and GitHub solution URLs per problem.
- 🔍 **Instant Search & Filters**: Search any problem keyword or filter by *Incomplete*, *Completed*, *Starred*, *Easy*, *Medium*, or *Hard*.
- 💾 **Universal Persistence**:
  - Automatically saves progress to `localStorage` (Web App) or `chrome.storage` (Extension).
  - **Export / Import JSON** backup to sync your progress between your laptop, phone, or work machine.
- 🌓 **Dark & Light Mode**: Clean, distraction-free UI.

---

## 🚀 How to Run the Web App

You have multiple zero-setup ways to run the tracker locally:

### Option 1: Run with Node.js (Recommended)
This repository includes a lightweight, **zero-dependency** native Node server (`server.js` using Node's built-in `http` module):
```bash
npm start
# or directly:
node server.js
```
Then visit: `http://localhost:3000`

### Option 2: Run with Python
If you prefer Python's built-in server without Node:
```bash
python -m http.server 3000
```
Then visit: `http://localhost:3000`

### Option 3: Open Directly in Browser
You can also directly double-click [`index.html`](file:///f:/Antigravity/browserExtension/TrackProgress/index.html) in any web browser with no server required.

### Option 4: Host 100% Free on GitHub Pages or Vercel
Push this repository to GitHub and enable **GitHub Pages** (from `main` branch root), or deploy to **Vercel** / **Netlify**.

---

## 🧩 How to Use as a Chrome Extension

1. Open Google Chrome (or any Chromium browser like Brave / Edge).
2. Go to `chrome://extensions` in the address bar.
3. Enable **Developer mode** (toggle at top right).
4. Click **Load unpacked** and select this directory (`TrackProgress`).
5. Click the extension icon in your Chrome toolbar — it will slide out as a **Side Panel** right next to GitHub, LeetCode, or your code editor!

---

## 📁 Project Structure & Explanations

```
TrackProgress/
├── server.js                 # Lightweight native Node.js HTTP server (zero dependencies)
├── package.json              # NPM scripts ("npm start" to run server, "npm run sync" to refresh data)
├── manifest.json             # Chrome Extension Manifest V3 configuration
├── background.js            # Service worker enabling Chrome Side Panel
├── index.html               # Main tracker dashboard UI
├── css/
│   └── styles.css           # Responsive dark/light styling
├── js/
│   ├── storage.js           # Universal storage adapter (Web & Extension)
│   └── app.js               # Search, filtering, stats, and modal logic
├── data/
│   ├── assignments.json     # Structured dataset of all 614 problems
│   └── assignments.js       # Window dataset for zero-CORS local viewing
├── lib/
│   └── feather.min.js       # Self-contained icon library (offline ready)
├── icons/                   # Extension icons (16px, 48px, 128px)
└── scripts/
    ├── fetch_assignments.js # Scraper script to re-sync with upstream repo
    └── generate_icons.py    # PNG icon generator
```

### Why `server.js` and `package.json` are included:
- **`server.js`** provides a native, self-contained way to run the web app with Node.js on port 3000 without requiring third-party npm packages.
- **`package.json`** provides convenient command shortcuts (`npm start` to run the server, and `npm run sync` to re-fetch the latest assignments if the upstream GitHub repo ever updates).
