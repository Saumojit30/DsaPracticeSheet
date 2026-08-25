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

## 🚀 How to Use as a Web App

### Option A: Open directly in your browser
Simply double-click [`index.html`](file:///f:/Antigravity/browserExtension/TrackProgress/index.html) or open it in Chrome, Edge, Brave, or Firefox.

### Option B: Run via a local static server
```bash
# Using Python
python -m http.server 3000

# Or using Node.js
npx serve .
```
Then navigate to `http://localhost:3000`.

### Option C: Host 100% Free on GitHub Pages or Vercel
Push this repository to GitHub and enable **GitHub Pages** (from `main` branch root), or drag-and-drop the folder to **Vercel** or **Netlify**.

---

## 🧩 How to Use as a Chrome Extension

1. Open Google Chrome (or any Chromium browser like Brave/Edge).
2. Go to `chrome://extensions` in the address bar.
3. Enable **Developer mode** (toggle at top right).
4. Click **Load unpacked** and select this directory (`f:\Antigravity\browserExtension\TrackProgress`).
5. Click the extension icon in your Chrome toolbar — it will slide out as a **Side Panel** right next to GitHub, LeetCode, or your code editor!

---

## 📁 Project Structure

```
TrackProgress/
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── background.js             # Service worker enabling Chrome Side Panel
├── index.html                # Main tracker dashboard UI
├── css/
│   └── styles.css            # Responsive dark/light styling
├── js/
│   ├── storage.js            # Universal storage adapter (Web & Extension)
│   └── app.js                # Search, filtering, stats, and modal logic
├── data/
│   ├── assignments.json      # Structured dataset of all 614 problems
│   └── assignments.js        # Window dataset for zero-CORS local viewing
├── lib/
│   └── feather.min.js        # Self-contained icon library (offline ready)
├── icons/                    # Extension icons (16px, 48px, 128px)
└── scripts/
    ├── fetch_assignments.js  # Scraper script to re-sync with upstream repo
    └── generate_icons.py     # Clean icon generator
```
