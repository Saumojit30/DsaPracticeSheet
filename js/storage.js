/**
 * Universal Storage Adapter
 * Automatically works in both standard Web App (localStorage)
 * and Chrome Extension (chrome.storage.local) environments.
 */
class ProgressStorage {
  constructor() {
    this.isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    this.STORAGE_KEY = 'dsa_bootcamp_progress_v1';
    this.initialState = {
      completed: {},    // { [problemId]: { completed: true, timestamp: 1234567890 } }
      bookmarks: {},    // { [problemId]: true }
      notes: {},        // { [problemId]: { text: "", solutionUrl: "", updatedAt: 1234567890 } }
      watchedLectures: {}, // { [catId]: true }
      theme: 'dark',
      streak: {
        lastSolvedDate: null,
        currentStreak: 0,
        history: [] // array of YYYY-MM-DD
      }
    };
    this._cache = null;
  }

  async init() {
    if (this._cache) return this._cache;
    
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.get([this.STORAGE_KEY], (res) => {
          this._cache = res[this.STORAGE_KEY] || { ...this.initialState };
          resolve(this._cache);
        });
      });
    } else {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        this._cache = raw ? JSON.parse(raw) : { ...this.initialState };
      } catch (e) {
        console.error('Failed to load from localStorage:', e);
        this._cache = { ...this.initialState };
      }
      return this._cache;
    }
  }

  async _save() {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [this.STORAGE_KEY]: this._cache }, resolve);
      });
    } else {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._cache));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
  }

  async isCompleted(problemId) {
    await this.init();
    return !!(this._cache.completed && this._cache.completed[problemId]?.completed);
  }

  async toggleCompleted(problemId) {
    await this.init();
    if (!this._cache.completed) this._cache.completed = {};
    
    const currentState = !!this._cache.completed[problemId]?.completed;
    const newState = !currentState;
    
    const today = new Date().toISOString().split('T')[0];

    if (newState) {
      this._cache.completed[problemId] = {
        completed: true,
        timestamp: Date.now(),
        date: today
      };
      this._updateStreak(today);
    } else {
      delete this._cache.completed[problemId];
    }

    await this._save();
    return newState;
  }

  _updateStreak(today) {
    if (!this._cache.streak) {
      this._cache.streak = { lastSolvedDate: null, currentStreak: 0, history: [] };
    }
    const streak = this._cache.streak;
    if (!streak.history.includes(today)) {
      streak.history.push(today);
    }

    if (streak.lastSolvedDate === today) {
      return; // Already counted today
    }

    if (!streak.lastSolvedDate) {
      streak.currentStreak = 1;
      streak.lastSolvedDate = today;
      return;
    }

    const lastDate = new Date(streak.lastSolvedDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak.currentStreak += 1;
    } else if (diffDays > 1) {
      streak.currentStreak = 1;
    }
    streak.lastSolvedDate = today;
  }

  async isLectureWatched(catId) {
    await this.init();
    return !!(this._cache.watchedLectures && this._cache.watchedLectures[catId]);
  }

  async toggleWatchedLecture(catId) {
    await this.init();
    if (!this._cache.watchedLectures) this._cache.watchedLectures = {};
    const newState = !this._cache.watchedLectures[catId];
    if (newState) {
      this._cache.watchedLectures[catId] = true;
    } else {
      delete this._cache.watchedLectures[catId];
    }
    await this._save();
    return newState;
  }

  async isBookmarked(problemId) {
    await this.init();
    return !!(this._cache.bookmarks && this._cache.bookmarks[problemId]);
  }

  async toggleBookmark(problemId) {
    await this.init();
    if (!this._cache.bookmarks) this._cache.bookmarks = {};
    const newState = !this._cache.bookmarks[problemId];
    
    if (newState) {
      this._cache.bookmarks[problemId] = true;
    } else {
      delete this._cache.bookmarks[problemId];
    }

    await this._save();
    return newState;
  }

  async getNote(problemId) {
    await this.init();
    return this._cache.notes?.[problemId] || { text: '', solutionUrl: '' };
  }

  async saveNote(problemId, text, solutionUrl) {
    await this.init();
    if (!this._cache.notes) this._cache.notes = {};
    this._cache.notes[problemId] = {
      text: text.trim(),
      solutionUrl: solutionUrl.trim(),
      updatedAt: Date.now()
    };
    await this._save();
  }

  async getTheme() {
    await this.init();
    return this._cache.theme || 'dark';
  }

  async setTheme(theme) {
    await this.init();
    this._cache.theme = theme;
    await this._save();
  }

  async getAllData() {
    await this.init();
    return this._cache;
  }

  async importData(importedJson) {
    try {
      const data = typeof importedJson === 'string' ? JSON.parse(importedJson) : importedJson;
      if (!data.completed && !data.bookmarks && !data.notes) {
        throw new Error('Invalid format: missing tracking fields.');
      }
      this._cache = {
        completed: data.completed || {},
        bookmarks: data.bookmarks || {},
        notes: data.notes || {},
        theme: data.theme || 'dark',
        streak: data.streak || { lastSolvedDate: null, currentStreak: 0, history: [] }
      };
      await this._save();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async resetAll() {
    this._cache = {
      completed: {},
      bookmarks: {},
      notes: {},
      theme: 'dark',
      streak: { lastSolvedDate: null, currentStreak: 0, history: [] }
    };
    await this._save();
  }
}

window.progressStorage = new ProgressStorage();
