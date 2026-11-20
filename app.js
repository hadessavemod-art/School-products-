// Main Application Controller (Tabbed Navigation + Scrollable Class Picker + Holidays + Search + Menu)
(function () {
  const VALID_TABS = ["home", "schedule", "teachers", "map", "bells", "food", "grades"];
  const GRADES = [
    { grade: "5", label: "5 класс", classes: ["5А", "5Б", "5В"] },
    { grade: "6", label: "6 класс", classes: ["6А", "6Б", "6В"] },
    { grade: "7", label: "7 класс", classes: ["7А", "7Б", "7В", "7Г"] },
    { grade: "8", label: "8 класс", classes: ["8А", "8Б", "8В", "8Г"] },
    { grade: "9", label: "9 класс", classes: ["9А", "9Б", "9В", "9Г"] },
    { grade: "10", label: "10 класс", classes: ["10А"] },
    { grade: "11", label: "11 класс", classes: ["11А"] }
  ];

  const state = {
    activeTab: "home",
    search: "",
    cat: "all",
    floorFilter: "all",
    highlightedPersonId: null,
    activeMenuDay: "mon",
    activeSchedDay: "mon",
    selectedClass: null,
    pickerGradeIndex: 2 // Default focus on 7th grade
  };

  // Tab Switching
  function switchTab(tabId, skipScroll) {
    const target = VALID_TABS.includes(tabId) ? tabId : "home";
    state.activeTab = target;

    document.querySelectorAll(".tab-panel").forEach(panel => {
      const match = panel.id === `tab-${target}`;
      panel.classList.toggle("hidden", !match);
      panel.classList.toggle("is-active", match);
    });

    document.querySelectorAll("[data-tab-target]").forEach(btn => {
      if (btn.classList.contains("nav-link") || btn.classList.contains("mobile-link")) {
        btn.classList.toggle("is-active", btn.dataset.tabTarget === target);
      }
    });

    const drawer = document.getElementById("mobile-menu");
    const menuBtn = document.getElementById("mobile-menu-btn");
    if (drawer && !drawer.classList.contains("hidden")) {
      drawer.classList.add("hidden");
      if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    }

    if (!skipScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  window.switchSchoolTab = switchTab;

  function initTabs() {
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-tab-target]");
      if (!trigger) return;
      switchTab(trigger.dataset.tabTarget);
    });
  }

  // Theme Toggle (Dark & White Monochrome)
  function initTheme() {
    const toggleBtn = document.getElementById("theme-toggle");
    const labelEl = document.getElementById("theme-label");

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      if (labelEl) {
        labelEl.textContent = theme === "dark" ? "Светлая" : "Тёмная";
      }
      try {
        localStorage.setItem("s60_theme_mode", theme);
      } catch (e) {}
    }

    let saved = "dark";
    try {
      const s = localStorage.getItem("s60_theme_mode");
      if (s === "light" || s === "dark") saved = s;
    } catch (e) {}
    applyTheme(saved);

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme");
        applyTheme(cur === "dark" ? "light" : "dark");
      });
    }
  }

  // Mobile Menu
  function initMobileMenu() {
    const btn = document.getElementById("mobile-menu-btn");
    const drawer = document.getElementById("mobile-menu");
    if (!btn || !drawer) return;

    btn.addEventListener("click", () => {
      const isHidden = drawer.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", String(!isHidden));
    });
  }

  // Holidays Modal
  function initHolidaysModal() {
    const badgeBtn = document.getElementById("holiday-badge-btn");
    const modal = document.getElementById("holidays-modal");
    const closeBtn = document.getElementById("holidays-modal-close");
    const listEl = document.getElementById("holidays-list");
    if (!badgeBtn || !modal || !listEl) return;

    const quarters = window.SCHOOL_DATA.quarters || [];
    listEl.innerHTML = quarters.map(q => `
      <div class="quarter-row">
        <div class="quarter-name">${q.name}</div>
        <div class="quarter-dates mono-cell">${q.label}</div>
      </div>
    `).join("");

    badgeBtn.addEventListener("click", () => modal.classList.remove("hidden"));
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  }

  // Scrollable Class Picker & Personal Schedule
  function selectClass(clsName) {
    state.selectedClass = clsName;
    if (clsName) {
      const gIdx = GRADES.findIndex(g => g.classes.includes(clsName));
      if (gIdx !== -1) state.pickerGradeIndex = gIdx;
    }
    try {
      if (clsName) localStorage.setItem("s60_selected_class", clsName);
      else localStorage.removeItem("s60_selected_class");
    } catch (e) {}

    const headerLabel = document.getElementById("header-class-label");
    if (headerLabel) {
      headerLabel.textContent = clsName ? `Класс: ${clsName}` : "Класс";
    }

    renderScrollableClassPicker();
    renderMySchedule();
    window.SchoolBells.update();
  }

  function renderScrollableClassPicker() {
    const track = document.getElementById("grade-track");
    const lettersWrap = document.getElementById("letter-btns");
    if (!track || !lettersWrap) return;

    track.innerHTML = GRADES.map((g, idx) => `
      <button type="button" data-grade-idx="${idx}" class="grade-pill ${idx === state.pickerGradeIndex ? "is-active" : ""}">
        ${g.label}
      </button>
    `).join("");

    const activeBtn = track.querySelector(".grade-pill.is-active");
    if (activeBtn && typeof activeBtn.scrollIntoView === "function") {
      activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    const activeGrade = GRADES[state.pickerGradeIndex] || GRADES[0];
    lettersWrap.innerHTML = activeGrade.classes.map(cls => {
      const letter = cls.replace(activeGrade.grade, "");
      return `
        <button type="button" data-pick-class="${cls}" class="letter-pick-btn ${state.selectedClass === cls ? "is-selected" : ""}">
          <span class="letter-big">${letter}</span>
          <span class="letter-sub">${cls}</span>
        </button>
      `;
    }).join("");
  }

  function renderMySchedule() {
    const bodyEl = document.getElementById("my-schedule-body");
    const metaEl = document.getElementById("my-schedule-meta");
    if (!bodyEl) return;

    document.querySelectorAll(".sched-day-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.day === state.activeSchedDay);
    });

    if (!state.selectedClass || !window.SCHOOL_SCHEDULES[state.selectedClass]) {
      if (metaEl) {
        metaEl.textContent = "Выберите свой класс, чтобы видеть уроки на сегодня, кабинеты и обратный отсчёт до звонка.";
      }
      bodyEl.innerHTML = `
        <div class="schedule-empty-box">
          <div class="empty-state-title">Класс пока не выбран</div>
          <div class="empty-state-sub">Нажмите кнопку ниже, чтобы выбрать свой класс (5А–11А).</div>
          <button type="button" id="inline-pick-class-btn" class="btn-primary btn-sm">Выбрать класс</button>
        </div>
      `;
      const inlineBtn = document.getElementById("inline-pick-class-btn");
      if (inlineBtn) {
        inlineBtn.addEventListener("click", () => {
          document.getElementById("class-modal").classList.remove("hidden");
        });
      }
      return;
    }

    const clsData = window.SCHOOL_SCHEDULES[state.selectedClass];
    if (metaEl) {
      metaEl.textContent = `Класс ${state.selectedClass} · Классный руководитель: ${clsData.homeroom} (каб. ${clsData.room})`;
    }

    const lessonsMap = clsData.days[state.activeSchedDay] || {};
    const bells = window.SCHOOL_DATA.bells;
    const rowsHtml = bells.map(b => {
      const pair = lessonsMap[b.num];
      if (!pair) return "";
      const [subj, room] = pair;
      const roomCell = room
        ? `<button type="button" data-room="${room}" class="room-jump-btn">${room}</button>`
        : `<span class="room-pending">—</span>`;
      return `
        <tr>
          <td class="mono-cell"><strong>${b.num}</strong></td>
          <td class="mono-cell">${b.start} – ${b.end}</td>
          <td><strong>${subj}</strong></td>
          <td>${roomCell}</td>
        </tr>
      `;
    }).filter(Boolean).join("");

    bodyEl.innerHTML = `
      <table class="bells-table">
        <thead>
          <tr>
            <th>Урок</th>
            <th>Время</th>
            <th>Предмет</th>
            <th>Кабинет</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
  }

  function initClassPicker() {
    const modal = document.getElementById("class-modal");
    const openBtn = document.getElementById("open-class-modal-btn");
    const changeBtn = document.getElementById("change-class-btn");
    const closeBtn = document.getElementById("class-modal-close");
    const skipBtn = document.getElementById("class-modal-skip");
    const gradeTrack = document.getElementById("grade-track");
    const prevBtn = document.getElementById("grade-prev-btn");
    const nextBtn = document.getElementById("grade-next-btn");
    const lettersWrap = document.getElementById("letter-btns");
    const dayTabs = document.getElementById("schedule-day-tabs");
    const schedBody = document.getElementById("my-schedule-body");

    const nowInfo = window.SchoolBells.getNovokuznetskNow();
    if (["mon", "tue", "wed", "thu", "fri"].includes(nowInfo.dayKey)) {
      state.activeSchedDay = nowInfo.dayKey;
      state.activeMenuDay = nowInfo.dayKey;
    }

    let savedClass = null;
    try {
      const s = localStorage.getItem("s60_selected_class");
      if (s && window.SCHOOL_SCHEDULES && window.SCHOOL_SCHEDULES[s]) savedClass = s;
    } catch (e) {}

    renderScrollableClassPicker();
    if (savedClass) {
      selectClass(savedClass);
    } else if (modal) {
      renderMySchedule();
      modal.classList.remove("hidden");
    }

    const openModal = () => {
      renderScrollableClassPicker();
      if (modal) modal.classList.remove("hidden");
    };
    const closeModal = () => modal && modal.classList.add("hidden");

    if (openBtn) openBtn.addEventListener("click", openModal);
    if (changeBtn) changeBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (skipBtn) skipBtn.addEventListener("click", closeModal);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (gradeTrack) {
      gradeTrack.addEventListener("click", (e) => {
        const pill = e.target.closest("[data-grade-idx]");
        if (!pill) return;
        state.pickerGradeIndex = Number(pill.dataset.gradeIdx);
        renderScrollableClassPicker();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        state.pickerGradeIndex = (state.pickerGradeIndex - 1 + GRADES.length) % GRADES.length;
        renderScrollableClassPicker();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        state.pickerGradeIndex = (state.pickerGradeIndex + 1) % GRADES.length;
        renderScrollableClassPicker();
      });
    }

    if (lettersWrap) {
      lettersWrap.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-pick-class]");
        if (!btn) return;
        selectClass(btn.dataset.pickClass);
        closeModal();
      });
    }

    if (dayTabs) {
      dayTabs.addEventListener("click", (e) => {
        const btn = e.target.closest(".sched-day-tab");
        if (!btn) return;
        state.activeSchedDay = btn.dataset.day;
        renderMySchedule();
      });
    }

    if (schedBody) {
      schedBody.addEventListener("click", (e) => {
        const btn = e.target.closest(".room-jump-btn");
        if (btn) window.SchoolMap.goToRoom(btn.dataset.room);
      });
    }
  }

  // Directory Rendering
  function renderTeachers() {
    const grid = document.getElementById("teachers-grid");
    const statusPill = document.getElementById("active-filter-pill");
    const statusText = document.getElementById("active-filter-text");
    if (!grid) return;

    const rawQ = state.search.trim().toLowerCase();
    const fixedQ = window.SchoolSearch.fixLayout(rawQ);
    const staff = window.SCHOOL_DATA.staff;

    const filtered = staff.filter(person => {
      const matchCat = state.cat === "all" || person.cat === state.cat;
      const matchFloor = state.floorFilter === "all" || person.floor === state.floorFilter;

      let matchSearch = true;
      if (rawQ) {
        const hay = `${person.name} ${person.role} ${person.rooms.join(" ")}`.toLowerCase();
        matchSearch = hay.includes(rawQ) || hay.includes(fixedQ);
      }
      return matchCat && matchFloor && matchSearch;
    });

    if (statusPill && statusText) {
      const hasActiveFilter = Boolean(rawQ) || state.cat !== "all" || state.floorFilter !== "all";
      statusPill.classList.toggle("hidden", !hasActiveFilter);
      if (hasActiveFilter) {
        statusText.textContent = rawQ ? `Запрос: «${state.search.trim()}»` : "Активен фильтр";
      }
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title">Ничего не найдено</div>
          <div class="empty-state-sub">Попробуйте выбрать подсказку из списка или сбросить фильтры.</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const initials = p.name.split(" ").slice(0, 2).map(w => w[0]).join("");
      const isHighlighted = state.highlightedPersonId === p.id;
      const roomButtons = p.rooms.length
        ? p.rooms.map(r => `<button type="button" data-room="${r}" class="room-jump-btn">${r}</button>`).join("")
        : `<span class="room-pending">Кабинет уточняется</span>`;

      return `
        <article class="teacher-card ${isHighlighted ? "is-highlighted" : ""}" data-person-id="${p.id}">
          <div class="teacher-top">
            <div class="teacher-avatar">${initials}</div>
            <div>
              <h3 class="teacher-name">${p.name}</h3>
              <p class="teacher-role">${p.role}</p>
            </div>
          </div>
          <div class="teacher-bottom">
            <div class="room-pills">${roomButtons}</div>
            <span class="floor-caption">${p.floor === "none" ? "—" : p.floor + " этаж"}</span>
          </div>
        </article>
      `;
    }).join("");
  }

  function updateCatChips() {
    document.querySelectorAll(".cat-chip").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.cat === state.cat);
    });
  }

  function handlePredictiveSelect(item, openTeachersTab) {
    const heroInput = document.getElementById("hero-search-input");
    const dirInput = document.getElementById("teacher-search");

    if (item.kind === "room") {
      window.SchoolMap.goToRoom(item.roomId);
      return;
    }

    state.cat = "all";
    state.floorFilter = "all";
    const floorSelect = document.getElementById("floor-filter");
    if (floorSelect) floorSelect.value = "all";
    updateCatChips();

    if (item.kind === "person") {
      state.search = item.title;
      state.highlightedPersonId = item.id;
      if (heroInput) heroInput.value = item.title;
      if (dirInput) dirInput.value = item.title;
    } else if (item.kind === "subject") {
      state.search = item.filterQuery;
      state.highlightedPersonId = null;
      if (heroInput) heroInput.value = item.title;
      if (dirInput) dirInput.value = item.filterQuery;
    }

    renderTeachers();
    if (openTeachersTab) {
      switchTab("teachers");
    }
  }

  function initDirectory() {
    const grid = document.getElementById("teachers-grid");
    const dirInput = document.getElementById("teacher-search");
    const heroInput = document.getElementById("hero-search-input");
    const floorSelect = document.getElementById("floor-filter");
    const resetBtn = document.getElementById("reset-filters-btn");
    const chipsWrap = document.getElementById("category-chips");

    if (grid) {
      grid.addEventListener("click", (e) => {
        const btn = e.target.closest(".room-jump-btn");
        if (btn) window.SchoolMap.goToRoom(btn.dataset.room);
      });
    }

    if (floorSelect) {
      floorSelect.addEventListener("change", (e) => {
        state.floorFilter = e.target.value;
        state.highlightedPersonId = null;
        renderTeachers();
      });
    }

    if (chipsWrap) {
      chipsWrap.addEventListener("click", (e) => {
        const btn = e.target.closest(".cat-chip");
        if (!btn) return;
        state.cat = btn.dataset.cat;
        state.highlightedPersonId = null;
        updateCatChips();
        renderTeachers();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        state.search = "";
        state.cat = "all";
        state.floorFilter = "all";
        state.highlightedPersonId = null;
        if (dirInput) dirInput.value = "";
        if (heroInput) heroInput.value = "";
        if (floorSelect) floorSelect.value = "all";
        updateCatChips();
        renderTeachers();
      });
    }

    if (heroInput) {
      window.SchoolSearch.attachPredictiveInput({
        inputEl: heroInput,
        dropdownEl: document.getElementById("hero-suggest"),
        clearBtn: document.getElementById("hero-clear-btn"),
        onSelect: (item) => handlePredictiveSelect(item, true),
        onInputChange: (val) => {
          state.search = val;
          state.highlightedPersonId = null;
          if (dirInput) dirInput.value = val;
        }
      });

      const heroBtn = document.getElementById("hero-search-btn");
      const runHero = () => {
        state.search = heroInput.value;
        state.highlightedPersonId = null;
        if (dirInput) dirInput.value = state.search;
        state.cat = "all";
        state.floorFilter = "all";
        if (floorSelect) floorSelect.value = "all";
        updateCatChips();
        renderTeachers();
        switchTab("teachers");
      };
      if (heroBtn) heroBtn.addEventListener("click", runHero);
      heroInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const hasActive = document.querySelector("#hero-suggest .suggest-item.is-active");
          if (!hasActive) runHero();
        }
      });
    }

    if (dirInput) {
      window.SchoolSearch.attachPredictiveInput({
        inputEl: dirInput,
        dropdownEl: document.getElementById("dir-suggest"),
        clearBtn: document.getElementById("dir-clear-btn"),
        onSelect: (item) => handlePredictiveSelect(item, false),
        onInputChange: (val) => {
          state.search = val;
          state.highlightedPersonId = null;
          if (heroInput) heroInput.value = val;
          renderTeachers();
        }
      });
    }

    renderTeachers();
  }

  // Daily School Food Menu
  function renderMenu() {
    const contentEl = document.getElementById("menu-content");
    if (!contentEl) return;
    const dayData = window.SCHOOL_DATA.menu[state.activeMenuDay];
    if (!dayData) return;

    document.querySelectorAll(".menu-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.day === state.activeMenuDay);
    });

    const renderList = items => items.map(item => `
      <li>
        <span>${item.dish}</span>
        <span class="menu-portion">${item.portion}</span>
      </li>
    `).join("");

    contentEl.innerHTML = `
      <div class="menu-card">
        <div class="menu-card-head">
          <h3 class="menu-card-title">Завтрак</h3>
          <span class="mono-tag">1-я смена</span>
        </div>
        <ul class="menu-list">${renderList(dayData.breakfast)}</ul>
      </div>
      <div class="menu-card">
        <div class="menu-card-head">
          <h3 class="menu-card-title">Обед</h3>
          <span class="mono-tag">Горячее питание</span>
        </div>
        <ul class="menu-list">${renderList(dayData.lunch)}</ul>
      </div>
      <div class="menu-note">
        <span>Ежедневные утверждённые меню публикуются в таблицах Excel на официальном сайте школы.</span>
        <a href="https://shkola60-kuz.kemobl.ru/food/" target="_blank" rel="noopener noreferrer">Открыть раздел «Питание» →</a>
      </div>
    `;
  }

  function initMenu() {
    const tabsWrap = document.getElementById("menu-days-tabs");
    if (!tabsWrap) return;

    tabsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".menu-tab");
      if (!btn) return;
      state.activeMenuDay = btn.dataset.day;
      renderMenu();
    });

    renderMenu();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initMobileMenu();
    initTabs();
    initHolidaysModal();
    window.SchoolMap.init();
    window.SchoolBells.init(() => state.selectedClass);
    initClassPicker();
    initDirectory();
    initMenu();
    if (window.SchoolGrades) window.SchoolGrades.init();
    switchTab("home", true);
  });
})();
