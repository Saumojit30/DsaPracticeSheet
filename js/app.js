/**
 * DSA Tracker Core Application Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  const storage = window.progressStorage;
  let assignments = window.ASSIGNMENTS_DATA || [];
  let currentActiveFilter = 'all';
  let searchQuery = '';
  let selectedTopicId = 'all';
  let allExpanded = false;
  let activeProblemForNotes = null;

  // Cache DOM Elements
  const topicsContainer = document.getElementById('topicsContainer');
  const searchInput = document.getElementById('searchInput');
  const topicFilterSelect = document.getElementById('topicFilterSelect');
  const filterChips = document.querySelectorAll('.chip');
  const btnToggleAllAccordions = document.getElementById('btnToggleAllAccordions');
  const themeToggle = document.getElementById('themeToggle');
  const btnResetAll = document.getElementById('btnResetAll');

  // Stats elements
  const statTotalSolved = document.getElementById('statTotalSolved');
  const statTotalPct = document.getElementById('statTotalPct');
  const statEasySolved = document.getElementById('statEasySolved');
  const statEasySub = document.getElementById('statEasySub');
  const statMediumSolved = document.getElementById('statMediumSolved');
  const statMediumSub = document.getElementById('statMediumSub');
  const statHardSolved = document.getElementById('statHardSolved');
  const statHardSub = document.getElementById('statHardSub');
  const statStreak = document.getElementById('statStreak');
  const barOverallPct = document.getElementById('barOverallPct');
  const barFillEasy = document.getElementById('barFillEasy');
  const barFillMedium = document.getElementById('barFillMedium');
  const barFillHard = document.getElementById('barFillHard');
  const legEasy = document.getElementById('legEasy');
  const legMedium = document.getElementById('legMedium');
  const legHard = document.getElementById('legHard');

  // Modal elements
  const notesModal = document.getElementById('notesModal');
  const notesModalTitle = document.getElementById('notesModalTitle');
  const inputSolutionUrl = document.getElementById('inputSolutionUrl');
  const textareaNotes = document.getElementById('textareaNotes');
  const btnCloseNotesModal = document.getElementById('btnCloseNotesModal');
  const btnCancelNote = document.getElementById('btnCancelNote');
  const btnSaveNote = document.getElementById('btnSaveNote');

  const exportModal = document.getElementById('exportModal');
  const btnOpenExport = document.getElementById('btnOpenExport');
  const btnCloseExportModal = document.getElementById('btnCloseExportModal');
  const btnDownloadJson = document.getElementById('btnDownloadJson');
  const btnCopyJson = document.getElementById('btnCopyJson');
  const btnRestoreJson = document.getElementById('btnRestoreJson');
  const textareaJsonBackup = document.getElementById('textareaJsonBackup');

  // Initialize Storage & Theme
  await storage.init();
  const currentTheme = await storage.getTheme();
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  // Initialize Topic Filter Options
  assignments.forEach((category, idx) => {
    const opt = document.createElement('option');
    opt.value = category.id;
    opt.textContent = `${String(idx + 1).padStart(2, '0')}. ${category.title} (${category.problems.length})`;
    topicFilterSelect.appendChild(opt);
  });

  // Render Everything
  await renderApp();

  // -------------------------------------------------------------
  // RENDER APP & CALCULATE STATS
  // -------------------------------------------------------------
  async function renderApp() {
    const data = await storage.getAllData();
    const completedMap = data.completed || {};
    const bookmarkMap = data.bookmarks || {};
    const notesMap = data.notes || {};

    let totalProblems = 0;
    let totalSolved = 0;
    let easyTotal = 0;
    let easySolved = 0;
    let mediumTotal = 0;
    let mediumSolved = 0;
    let hardTotal = 0;
    let hardSolved = 0;

    // Calculate totals
    assignments.forEach(cat => {
      cat.problems.forEach(prob => {
        totalProblems++;
        const isDone = !!completedMap[prob.id]?.completed;
        if (isDone) totalSolved++;

        const diff = (prob.difficulty || 'Easy').toLowerCase();
        if (diff === 'easy') {
          easyTotal++;
          if (isDone) easySolved++;
        } else if (diff === 'medium') {
          mediumTotal++;
          if (isDone) mediumSolved++;
        } else if (diff === 'hard') {
          hardTotal++;
          if (isDone) hardSolved++;
        }
      });
    });

    // Update Stats Card UI
    const overallPct = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
    statTotalSolved.textContent = `${totalSolved} / ${totalProblems}`;
    statTotalPct.textContent = `${overallPct}% Complete`;
    barOverallPct.textContent = `${overallPct}%`;

    statEasySolved.textContent = easySolved;
    statEasySub.textContent = `${easySolved} of ${easyTotal}`;
    legEasy.textContent = `${easySolved}/${easyTotal}`;

    statMediumSolved.textContent = mediumSolved;
    statMediumSub.textContent = `${mediumSolved} of ${mediumTotal}`;
    legMedium.textContent = `${mediumSolved}/${mediumTotal}`;

    statHardSolved.textContent = hardSolved;
    statHardSub.textContent = `${hardSolved} of ${hardTotal}`;
    legHard.textContent = `${hardSolved}/${hardTotal}`;

    const streakVal = data.streak?.currentStreak || 0;
    statStreak.textContent = `${streakVal} ${streakVal === 1 ? 'Day' : 'Days'}`;

    // Update Progress Bar
    if (totalProblems > 0) {
      const easyPct = (easySolved / totalProblems) * 100;
      const medPct = (mediumSolved / totalProblems) * 100;
      const hardPct = (hardSolved / totalProblems) * 100;
      barFillEasy.style.width = `${easyPct}%`;
      barFillMedium.style.width = `${medPct}%`;
      barFillHard.style.width = `${hardPct}%`;
    }

    // Render Topic Accordions
    renderTopicsList(completedMap, bookmarkMap, notesMap);

    // Refresh feather icons
    if (window.feather) {
      feather.replace();
    }
  }

  function renderTopicsList(completedMap, bookmarkMap, notesMap) {
    topicsContainer.innerHTML = '';

    let matchedAny = false;

    assignments.forEach((category, idx) => {
      // Check Topic filter
      if (selectedTopicId !== 'all' && category.id !== selectedTopicId) {
        return;
      }

      // Filter category problems based on filter & search
      const filteredProblems = category.problems.filter(prob => {
        const isDone = !!completedMap[prob.id]?.completed;
        const isStarred = !!bookmarkMap[prob.id];
        const diff = (prob.difficulty || 'Easy').toLowerCase();

        // Check filter chip
        if (currentActiveFilter === 'incomplete' && isDone) return false;
        if (currentActiveFilter === 'completed' && !isDone) return false;
        if (currentActiveFilter === 'starred' && !isStarred) return false;
        if (currentActiveFilter === 'easy' && diff !== 'easy') return false;
        if (currentActiveFilter === 'medium' && diff !== 'medium') return false;
        if (currentActiveFilter === 'hard' && diff !== 'hard') return false;

        // Check search query
        if (searchQuery) {
          const matchTitle = prob.title.toLowerCase().includes(searchQuery);
          const matchPlatform = prob.platform.toLowerCase().includes(searchQuery);
          const matchCat = category.title.toLowerCase().includes(searchQuery);
          if (!matchTitle && !matchPlatform && !matchCat) return false;
        }

        return true;
      });

      // Skip empty categories if searching/filtering
      if ((searchQuery || currentActiveFilter !== 'all' || selectedTopicId !== 'all') && filteredProblems.length === 0) {
        return;
      }

      matchedAny = true;

      // Calculate Topic Progress
      const catTotal = category.problems.length;
      const catSolved = category.problems.filter(p => !!completedMap[p.id]?.completed).length;
      const catPct = catTotal > 0 ? Math.round((catSolved / catTotal) * 100) : 0;

      // Create Accordion Card
      const topicCard = document.createElement('div');
      topicCard.className = `topic-card ${allExpanded || searchQuery ? 'open' : ''}`;
      topicCard.id = `card-${category.id}`;

      // Header
      const header = document.createElement('div');
      header.className = 'topic-header';
      header.innerHTML = `
        <div class="topic-title-wrap">
          <span class="topic-badge">#${String(idx + 1).padStart(2, '0')}</span>
          <span class="topic-name">${category.title}</span>
        </div>
        <div class="topic-actions">
          ${category.videoLink ? `
            <a href="${category.videoLink}" target="_blank" rel="noopener noreferrer" class="topic-video-btn" onclick="event.stopPropagation()">
              <i data-feather="youtube" style="width: 14px; height: 14px;"></i> Lecture
            </a>` : ''}
          <div class="topic-progress-text">${catSolved}/${catTotal} (${catPct}%)</div>
          <div class="topic-progress-mini">
            <div class="topic-progress-mini-fill" style="width: ${catPct}%;"></div>
          </div>
          <i data-feather="chevron-down" class="topic-chevron"></i>
        </div>
      `;

      header.addEventListener('click', () => {
        topicCard.classList.toggle('open');
      });

      // Body (Problem rows)
      const body = document.createElement('div');
      body.className = 'topic-body';

      if (filteredProblems.length === 0) {
        body.innerHTML = `
          <div class="empty-state">
            <p>No questions match your current filter in this topic.</p>
          </div>
        `;
      } else {
        filteredProblems.forEach(prob => {
          const isDone = !!completedMap[prob.id]?.completed;
          const isStarred = !!bookmarkMap[prob.id];
          const hasNote = !!notesMap[prob.id]?.text || !!notesMap[prob.id]?.solutionUrl;
          const diffClass = (prob.difficulty || 'easy').toLowerCase();

          const row = document.createElement('div');
          row.className = `problem-row ${isDone ? 'completed' : ''}`;
          row.id = `row-${prob.id}`;

          row.innerHTML = `
            <div class="problem-left">
              <div class="custom-checkbox ${isDone ? 'checked' : ''}" data-id="${prob.id}" title="${isDone ? 'Mark Incomplete' : 'Mark Completed'}">
                ${isDone ? '<i data-feather="check" style="width: 14px; height: 14px;"></i>' : ''}
              </div>
              ${prob.url ? `
                <a href="${prob.url}" target="_blank" rel="noopener noreferrer" class="problem-title-link" title="Open problem on ${prob.platform}">
                  <span>${prob.title}</span>
                  <i data-feather="external-link" class="external-icon" style="width: 12px; height: 12px;"></i>
                </a>
              ` : `
                <span class="problem-title-link" style="cursor: default;">
                  <span>${prob.title}</span>
                </span>
              `}
            </div>
            <div class="problem-right">
              <span class="badge-diff ${diffClass}">${prob.difficulty || 'Easy'}</span>
              <span class="badge-platform">${prob.platform}</span>
              <button class="btn-star ${isStarred ? 'starred' : ''}" data-id="${prob.id}" title="${isStarred ? 'Remove Star' : 'Star for Revision'}">
                <i data-feather="star" style="width: 16px; height: 16px; ${isStarred ? 'fill: var(--star-color);' : ''}"></i>
              </button>
              <button class="btn-note ${hasNote ? 'has-note' : ''}" data-id="${prob.id}" title="Personal Notes & Solution Link">
                <i data-feather="file-text" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
          `;

          // Checkbox toggle
          const checkbox = row.querySelector('.custom-checkbox');
          checkbox.addEventListener('click', async (e) => {
            e.stopPropagation();
            await storage.toggleCompleted(prob.id);
            await renderApp();
          });

          // Star toggle
          const starBtn = row.querySelector('.btn-star');
          starBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await storage.toggleBookmark(prob.id);
            await renderApp();
          });

          // Notes button
          const noteBtn = row.querySelector('.btn-note');
          noteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            openNotesModal(prob);
          });

          body.appendChild(row);
        });
      }

      topicCard.appendChild(header);
      topicCard.appendChild(body);
      topicsContainer.appendChild(topicCard);
    });

    if (!matchedAny) {
      topicsContainer.innerHTML = `
        <div class="empty-state">
          <i data-feather="search" style="width: 48px; height: 48px; opacity: 0.4; margin-bottom: 0.5rem;"></i>
          <h3>No matching problems found</h3>
          <p>Try searching for a different keyword or resetting your filters.</p>
        </div>
      `;
    }
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS & FILTER CONTROLLERS
  // -------------------------------------------------------------

  // Search input
  let searchDebounce;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderApp();
    }, 200);
  });

  // Topic filter select
  topicFilterSelect.addEventListener('change', (e) => {
    selectedTopicId = e.target.value;
    renderApp();
  });

  // Filter chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentActiveFilter = chip.getAttribute('data-filter');
      renderApp();
    });
  });

  // Expand / Collapse all
  btnToggleAllAccordions.addEventListener('click', () => {
    allExpanded = !allExpanded;
    btnToggleAllAccordions.textContent = allExpanded ? 'Collapse All' : 'Expand All';
    document.querySelectorAll('.topic-card').forEach(card => {
      if (allExpanded) card.classList.add('open');
      else card.classList.remove('open');
    });
  });

  // Theme toggle
  themeToggle.addEventListener('click', async () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    await storage.setTheme(next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    themeToggle.innerHTML = theme === 'dark' 
      ? '<i data-feather="sun"></i>' 
      : '<i data-feather="moon"></i>';
    if (window.feather) feather.replace();
  }

  // Reset all
  btnResetAll.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all solved problems and progress? This cannot be undone.')) {
      await storage.resetAll();
      await renderApp();
    }
  });

  // -------------------------------------------------------------
  // NOTES & SOLUTION MODAL
  // -------------------------------------------------------------
  async function openNotesModal(prob) {
    activeProblemForNotes = prob;
    notesModalTitle.textContent = `Notes: ${prob.title}`;
    const noteData = await storage.getNote(prob.id);
    inputSolutionUrl.value = noteData.solutionUrl || '';
    textareaNotes.value = noteData.text || '';
    notesModal.classList.add('open');
  }

  function closeNotesModal() {
    notesModal.classList.remove('open');
    activeProblemForNotes = null;
  }

  btnCloseNotesModal.addEventListener('click', closeNotesModal);
  btnCancelNote.addEventListener('click', closeNotesModal);

  btnSaveNote.addEventListener('click', async () => {
    if (activeProblemForNotes) {
      await storage.saveNote(
        activeProblemForNotes.id,
        textareaNotes.value,
        inputSolutionUrl.value
      );
      closeNotesModal();
      await renderApp();
    }
  });

  // -------------------------------------------------------------
  // BACKUP & RESTORE MODAL
  // -------------------------------------------------------------
  btnOpenExport.addEventListener('click', async () => {
    const data = await storage.getAllData();
    textareaJsonBackup.value = JSON.stringify(data, null, 2);
    exportModal.classList.add('open');
  });

  btnCloseExportModal.addEventListener('click', () => {
    exportModal.classList.remove('open');
  });

  btnCopyJson.addEventListener('click', () => {
    textareaJsonBackup.select();
    navigator.clipboard.writeText(textareaJsonBackup.value);
    btnCopyJson.textContent = 'Copied!';
    setTimeout(() => { btnCopyJson.textContent = 'Copy to Clipboard'; }, 2000);
  });

  btnDownloadJson.addEventListener('click', async () => {
    const data = await storage.getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa_progress_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  btnRestoreJson.addEventListener('click', async () => {
    const text = textareaJsonBackup.value.trim();
    if (!text) {
      alert('Please paste valid JSON data.');
      return;
    }
    const result = await storage.importData(text);
    if (result.success) {
      alert('Progress imported successfully!');
      exportModal.classList.remove('open');
      await renderApp();
    } else {
      alert(`Import error: ${result.error}`);
    }
  });

  // Close modals on overlay click
  window.addEventListener('click', (e) => {
    if (e.target === notesModal) closeNotesModal();
    if (e.target === exportModal) exportModal.classList.remove('open');
  });
});
