class DailyProgressTracker {
  constructor() {
    this.data = this.loadData();
    this.activitiesByPeriod = this.data.activitiesByPeriod || this.getDefaultActivitiesByPeriod();
    this.currentDate = new Date().toISOString().split("T")[0];
    this.currentPeriod = 'daily';
    this.init();
  }

  getDefaultActivitiesByPeriod() {
    return {
      daily: {
        work: {
          name: "Work",
          icon: "💼",
          color: "#00695c",
          target: 8,
          unit: "hours",
          unitShort: "h",
          completionType: "time",
        },
        exercise: {
          name: "Exercise",
          icon: "💪",
          color: "#2e7d32",
          target: 60,
          unit: "minutes",
          unitShort: "min",
          completionType: "time",
        },
        reading: {
          name: "Reading",
          icon: "📚",
          color: "#1565c0",
          target: 30,
          unit: "minutes",
          unitShort: "min",
          completionType: "time",
        },
        meditation: {
          name: "Meditation",
          icon: "🧘",
          color: "#7b1fa2",
          target: 20,
          unit: "minutes",
          unitShort: "min",
          completionType: "time",
        },
      },
      weekly: {
        meal_prep: {
          name: "Meal Prep",
          icon: "🍱",
          color: "#f57c00",
          target: 3,
          unit: "sessions",
          unitShort: "sessions",
          completionType: "count",
        },
        deep_work: {
          name: "Deep Work Sessions",
          icon: "🎯",
          color: "#5e35b1",
          target: 5,
          unit: "sessions",
          unitShort: "sessions",
          completionType: "count",
        },
        social_time: {
          name: "Social Activities",
          icon: "👥",
          color: "#e91e63",
          target: 2,
          unit: "activities",
          unitShort: "activities",
          completionType: "count",
        },
      },
      monthly: {
        skill_learning: {
          name: "Learn New Skill",
          icon: "🎓",
          color: "#1976d2",
          target: 1,
          unit: "skills",
          unitShort: "skills",
          completionType: "count",
        },
        deep_clean: {
          name: "Deep Clean House",
          icon: "🧹",
          color: "#388e3c",
          target: 1,
          unit: "sessions",
          unitShort: "sessions",
          completionType: "count",
        },
        financial_review: {
          name: "Financial Review",
          icon: "💰",
          color: "#fbc02d",
          target: 1,
          unit: "reviews",
          unitShort: "reviews",
          completionType: "count",
        },
      },
      yearly: {
        major_goal: {
          name: "Complete Major Goal",
          icon: "🏆",
          color: "#ff5722",
          target: 1,
          unit: "goals",
          unitShort: "goals",
          completionType: "count",
        },
        travel: {
          name: "Travel Adventures",
          icon: "✈️",
          color: "#00acc1",
          target: 2,
          unit: "trips",
          unitShort: "trips",
          completionType: "count",
        },
        career_milestone: {
          name: "Career Milestone",
          icon: "📈",
          color: "#8bc34a",
          target: 1,
          unit: "milestones",
          unitShort: "milestones",
          completionType: "count",
        },
      }
    };
  }

  get activities() {
    return this.activitiesByPeriod[this.currentPeriod] || {};
  }

  init() {
    this.currentDate = new Date().toISOString().split("T")[0]; // Default to today
    this.currentPeriod = this.data.currentPeriod || 'daily'; // Load saved period or default to daily view
    this.updateCurrentDate();
    this.setupDatePicker();
    this.setupTimePeriodTabs();
    this.renderActivities();
    this.setupEventListeners();
    this.loadSelectedDateData();
    this.updateAllProgress();
    this.updateStreakInfo();
  }

  renderActivities() {
    const activitiesGrid = document.querySelector(".activities-grid");
    activitiesGrid.innerHTML = "";

    // Get ordered activity IDs from localStorage or use default order
    const activityOrder = this.getActivityOrder();
    
    // Render activities in the stored order
    activityOrder.forEach((id) => {
      if (this.activities[id]) {
        const activityCard = this.createActivityCard(id, this.activities[id]);
        activitiesGrid.appendChild(activityCard);
      }
    });
    
    // Setup layout controls and drag/drop after rendering
    setTimeout(() => {
      this.setupActivityLayoutControls();
      this.setupActivitySettings();
      this.setupDragAndDrop();
      this.setupMobileSwipeNavigation();
    }, 100);
  }

  createActivityCard(id, activity) {
    const card = document.createElement("div");
    card.className = "activity-card";
    card.setAttribute("data-category", id);

    const activityColor = activity.color || "#00695c";

    // Ensure color is accessible against dark background
    const accessibleColor = this.ensureAccessibleColor(activityColor);

    // Add custom color as data attribute and apply colored theme
    card.setAttribute("data-color", accessibleColor);

    // Apply colored border (left accent + subtle all-around)
    const colorRGB = this.hexToRgb(accessibleColor);
    card.style.border = `1px solid rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, 0.3)`;
    card.style.borderLeft = `4px solid ${accessibleColor}`;

    // Apply colored glow shadow
    card.style.boxShadow = `
      0 8px 32px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, 0.15),
      0 4px 24px rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, 0.2)
    `;

    // Set CSS custom properties for colored overlays
    card.style.setProperty(
      "--card-overlay",
      `rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, 0.08)`
    );
    card.style.setProperty("--title-accent", accessibleColor);

    card.innerHTML = `
      <div class="activity-header">
        <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
        <div class="activity-main">
          <div class="activity-icon" style="background: linear-gradient(135deg, ${accessibleColor}, ${this.lightenColor(
      accessibleColor,
      20
    )});">${activity.icon}</div>
          <div class="activity-title">
            <h2>${activity.name}</h2>
            <div class="activity-progress-inline">
              <span id="${id}Remaining">${this.getProgressText(activity)}</span>
            </div>
          </div>
        </div>
        <div class="completion-badge" id="${id}Badge" style="background: ${accessibleColor};">✓</div>
      </div>
      <div class="activity-content">
        <div class="activity-inputs">
          ${this.renderActivityInputs(id, activity)}
        </div>
        <div class="progress-bar">
          <div class="progress-fill" id="${id}Progress" style="background: linear-gradient(90deg, ${accessibleColor}, ${this.lightenColor(
      accessibleColor,
      30
    )});"></div>
        </div>
        <div class="progress-percentage">
          <span id="${id}Percentage" style="color: ${accessibleColor}; font-weight: 600;">0%</span>
        </div>
        <div class="notes-section">
          <textarea id="${id}Notes" placeholder="Notes (optional)"></textarea>
        </div>
        <div class="activity-bottom-controls">
          <button class="quick-complete-activity-btn" data-activity-id="${id}" title="Quick Complete">
            ✓ Complete Goal
          </button>
        </div>
      </div>
    `;

    // Set CSS custom property for button color
    card.style.setProperty('--activity-button-color', accessibleColor);

    return card;
  }

  updateCurrentDate() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    document.getElementById(
      "currentDate"
    ).textContent = `Today: ${now.toLocaleDateString("en-US", options)}`;
  }

  setupDatePicker() {
    const datePicker = document.getElementById("datePicker");
    const todayBtn = document.getElementById("todayBtn");

    // Set default date to today
    datePicker.value = this.currentDate;

    // Date picker change handler
    datePicker.addEventListener("change", (e) => {
      this.currentDate = e.target.value;
      this.loadSelectedDateData();
      this.updateAllProgress();
      this.updateDateDisplay();
    });

    // Today button handler
    todayBtn.addEventListener("click", () => {
      const today = new Date().toISOString().split("T")[0];
      this.currentDate = today;
      datePicker.value = today;
      this.loadSelectedDateData();
      this.updateAllProgress();
      this.updateDateDisplay();
    });
  }

  updateDateDisplay() {
    const selectedDate = new Date(this.currentDate + "T12:00:00");
    const today = new Date().toISOString().split("T")[0];

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const dateText = selectedDate.toLocaleDateString("en-US", options);

    // Update header date if element exists
    const currentDateEl = document.getElementById("currentDate");
    if (currentDateEl) {
      if (this.currentDate === today) {
        currentDateEl.textContent = `Today: ${dateText}`;
      } else {
        currentDateEl.textContent = `Selected: ${dateText}`;
      }
    }

    // Date display updates are now handled by external date controls only

    // Update progress select date button
    const selectDateEl = document.querySelector(".progress-select-date");
    if (selectDateEl) {
      const buttonDate = selectedDate.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
      selectDateEl.textContent = buttonDate;
    }
  }

  setupEventListeners() {
    // Use event delegation for dynamic activities
    document.addEventListener("input", (e) => {
      const input = e.target;
      if (
        input.id &&
        (input.id.includes("Target") ||
          input.id.includes("Actual") ||
          input.id.includes("Notes"))
      ) {
        const activityId = input.id.replace(/Target|Actual|Notes/, "");
        if (this.activities[activityId]) {
          if (input.id.includes("Target") || input.id.includes("Actual")) {
            this.updateProgress(activityId);
            this.updateOverallProgress();
          }
          this.autoSave();
        }
      }
    });

    // Event delegation for quick complete buttons
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("quick-complete-activity-btn")) {
        const activityId = e.target.getAttribute("data-activity-id");
        if (activityId) {
          console.log("Quick complete button clicked for:", activityId);
          this.quickCompleteGoal(activityId);
        }
      }
    });

    // Button listeners
    document.getElementById("saveProgress").addEventListener("click", () => {
      this.saveProgress();
      this.showToast("Progress saved successfully!");
    });

    const addNewGoalBtn = document.getElementById("addNewGoal");
    if (addNewGoalBtn) {
      addNewGoalBtn.addEventListener("click", () => {
        console.log("Add New Goal button clicked");
        try {
          this.showAddGoalPage();
        } catch (error) {
          console.error("Error showing add goal page:", error);
        }
      });
    } else {
      console.error("Add New Goal button not found!");
    }

    document.getElementById("viewHistory").addEventListener("click", () => {
      this.showHistoryPage();
    });

    document.getElementById("backToTracker").addEventListener("click", () => {
      this.showTrackerPage();
    });

    // Goal page navigation listeners
    document.getElementById("backFromAddGoal").addEventListener("click", () => {
      this.showTrackerPage();
    });

    document
      .getElementById("backFromEditGoal")
      .addEventListener("click", () => {
        this.showTrackerPage();
      });

    document
      .getElementById("cancelPageAddGoal")
      .addEventListener("click", () => {
        this.showTrackerPage();
      });

    // Bottom navigation listeners (check if elements exist since nav may be hidden)
    const navHome = document.getElementById("navHome");
    const navStats = document.getElementById("navStats");
    const navAddGoal = document.getElementById("navAddGoal");
    
    if (navHome) {
      navHome.addEventListener("click", () => {
        this.showTrackerPage();
        this.updateNavigation("navHome");
      });
    }

    if (navStats) {
      navStats.addEventListener("click", () => {
        this.showHistoryPage();
        this.updateNavigation("navStats");
      });
    }

    if (navAddGoal) {
      navAddGoal.addEventListener("click", () => {
        this.showAddGoalPage();
        this.updateNavigation("navAddGoal");
      });
    }

    document
      .getElementById("cancelPageEditGoal")
      .addEventListener("click", () => {
        this.showTrackerPage();
      });

    document.getElementById("savePageNewGoal").addEventListener("click", () => {
      this.createNewGoalFromPage();
    });

    document
      .getElementById("savePageEditGoal")
      .addEventListener("click", () => {
        this.saveEditedGoalFromPage();
      });

    document
      .getElementById("closeCustomizeModal")
      .addEventListener("click", () => {
        this.hideCustomizeModal();
      });

    // Add Goal Modal listeners
    document
      .getElementById("closeAddGoalModal")
      .addEventListener("click", () => {
        this.hideAddGoalModal();
      });

    document.getElementById("cancelAddGoal").addEventListener("click", () => {
      this.hideAddGoalModal();
    });

    document.getElementById("saveNewGoal").addEventListener("click", () => {
      console.log("Add Goal button clicked");
      this.createNewGoal();
    });

    // Edit Goal Modal listeners
    document
      .getElementById("closeEditGoalModal")
      .addEventListener("click", () => {
        this.hideEditGoalModal();
      });

    document.getElementById("cancelEditGoal").addEventListener("click", () => {
      this.hideEditGoalModal();
    });

    document.getElementById("saveEditGoal").addEventListener("click", () => {
      this.saveEditedGoal();
    });

    // Completion type change listeners
    document
      .getElementById("goalCompletionType")
      .addEventListener("change", (e) => {
        this.updateGoalFormFields(e.target.value, false);
      });

    document
      .getElementById("editGoalCompletionType")
      .addEventListener("change", (e) => {
        this.updateGoalFormFields(e.target.value, true);
      });

    // Unit selection change listeners
    document.getElementById("goalUnit").addEventListener("change", (e) => {
      this.toggleCustomUnit(e.target.value, false);
    });

    document.getElementById("editGoalUnit").addEventListener("change", (e) => {
      this.toggleCustomUnit(e.target.value, true);
    });

    // Page completion type and unit change listeners
    document
      .getElementById("goalPageCompletionType")
      .addEventListener("change", (e) => {
        this.updateGoalFormFields(e.target.value, false, true);
      });

    document
      .getElementById("editGoalPageCompletionType")
      .addEventListener("change", (e) => {
        this.updateGoalFormFields(e.target.value, true, true);
      });

    document.getElementById("goalPageUnit").addEventListener("change", (e) => {
      this.toggleCustomUnit(e.target.value, false, true);
    });

    document
      .getElementById("editGoalPageUnit")
      .addEventListener("change", (e) => {
        this.toggleCustomUnit(e.target.value, true, true);
      });

    // Tab navigation listeners (using event delegation)
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("tab-btn")) {
        const tabName = e.target.getAttribute("data-tab");
        this.switchTab(tabName);
      }

      if (e.target.classList.contains("edit-log-btn")) {
        const date = e.target.getAttribute("data-date");
        const activityId = e.target.getAttribute("data-activity");
        this.editDailyLog(date, activityId);
      }
    });

    // Close modals when clicking outside
    window.addEventListener("click", (event) => {
      const customizeModal = document.getElementById("customizeModal");
      const addGoalModal = document.getElementById("addGoalModal");
      const editGoalModal = document.getElementById("editGoalModal");

      if (event.target === customizeModal) {
        this.hideCustomizeModal();
      }
      if (event.target === addGoalModal) {
        this.hideAddGoalModal();
      }
      if (event.target === editGoalModal) {
        this.hideEditGoalModal();
      }
    });
  }

  loadData() {
    const stored = localStorage.getItem("dailyProgressTracker");
    return stored
      ? JSON.parse(stored)
      : {
          dailyData: {},
          streak: 0,
          lastCompletedDate: null,
        };
  }

  saveData() {
    this.data = {
      ...this.data,
      activitiesByPeriod: this.activitiesByPeriod,
      currentPeriod: this.currentPeriod
    };
    localStorage.setItem("dailyProgressTracker", JSON.stringify(this.data));
  }

  getTodayKey() {
    return new Date().toISOString().split("T")[0];
  }

  loadSelectedDateData() {
    const selectedDateData = this.data.dailyData[this.currentDate];

    if (selectedDateData) {
      Object.keys(this.activities).forEach((activityId) => {
        const targetEl = document.getElementById(`${activityId}Target`);
        const actualEl = document.getElementById(`${activityId}Actual`);
        const notesEl = document.getElementById(`${activityId}Notes`);

        if (targetEl)
          targetEl.value =
            selectedDateData[activityId]?.target ||
            this.activities[activityId].target;
        if (actualEl)
          actualEl.value = selectedDateData[activityId]?.actual || 0;
        if (notesEl) notesEl.value = selectedDateData[activityId]?.notes || "";
      });
    } else {
      // Set default values for new day
      Object.keys(this.activities).forEach((activityId) => {
        const targetEl = document.getElementById(`${activityId}Target`);
        const actualEl = document.getElementById(`${activityId}Actual`);
        const notesEl = document.getElementById(`${activityId}Notes`);

        if (targetEl) targetEl.value = this.activities[activityId].target;
        if (actualEl) actualEl.value = 0;
        if (notesEl) notesEl.value = "";
      });
    }
  }

  getDefaultTarget(category) {
    const defaults = {
      work: 8,
      exercise: 60,
      reading: 30,
      meditation: 20,
    };
    return defaults[category] || 0;
  }

  updateProgress(activityId) {
    const activity = this.activities[activityId];
    if (!activity) return false;

    const completionType = activity.completionType || "time";
    let percentage, isCompleted, remainingText;

    if (completionType === "binary") {
      const actual =
        document.getElementById(`${activityId}Actual`)?.value === "1";
      percentage = actual ? 100 : 0;
      isCompleted = actual;
      remainingText = actual ? "Completed!" : "Not completed";
    } else {
      const target =
        parseFloat(document.getElementById(`${activityId}Target`)?.value) || 0;
      const actual =
        parseFloat(document.getElementById(`${activityId}Actual`)?.value) || 0;

      if (completionType === "percentage") {
        percentage = actual;
        isCompleted = actual >= target;
        remainingText =
          actual >= target ? "Target reached!" : `${target - actual}% to go`;
      } else {
        // time or quantity
        percentage = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
        isCompleted = percentage >= 100;
        const remaining = Math.max(target - actual, 0);
        remainingText =
          remaining > 0
            ? `${remaining}${activity.unitShort} remaining`
            : "Completed!";
      }
    }

    // Update progress bar
    const progressBar = document.getElementById(`${activityId}Progress`);
    if (progressBar) progressBar.style.width = `${Math.min(percentage, 100)}%`;

    // Update percentage display
    const percentageEl = document.getElementById(`${activityId}Percentage`);
    if (percentageEl)
      percentageEl.textContent = `${Math.round(Math.min(percentage, 100))}%`;

    // Update remaining display
    const remainingEl = document.getElementById(`${activityId}Remaining`);
    if (remainingEl) remainingEl.textContent = remainingText;

    // Update completion badge
    const badge = document.getElementById(`${activityId}Badge`);
    if (badge) badge.classList.toggle("completed", isCompleted);

    // Update card appearance
    const card = document.querySelector(`[data-category="${activityId}"]`);
    if (card) card.classList.toggle("completed", isCompleted);

    return isCompleted;
  }

  updateAllProgress() {
    Object.keys(this.activities).forEach((activityId) => {
      this.updateProgress(activityId);
    });
    this.updateOverallProgress();
  }

  updateOverallProgress() {
    const activityIds = Object.keys(this.activities);
    const completedCount = activityIds.filter((activityId) => {
      const target =
        parseFloat(document.getElementById(`${activityId}Target`)?.value) || 0;
      const actual =
        parseFloat(document.getElementById(`${activityId}Actual`)?.value) || 0;
      return target > 0 && actual >= target;
    }).length;

    const totalActivities = activityIds.length;
    const overallPercentage = (completedCount / totalActivities) * 100;

    // Update circular progress
    const circle = document.getElementById("progressCircle");
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (overallPercentage / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Update percentage text
    document.getElementById("progressPercentage").textContent = `${Math.round(
      overallPercentage
    )}%`;
    document.getElementById("completedToday").textContent = completedCount;
  }

  updateStreakInfo() {
    document.getElementById("totalStreak").textContent = this.data.streak || 0;
  }

  autoSave() {
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveCurrentData();
    }, 1000);
  }

  saveCurrentData() {
    const selectedDate = this.currentDate;

    if (!this.data.dailyData[selectedDate]) {
      this.data.dailyData[selectedDate] = {};
    }

    Object.keys(this.activities).forEach((activityId) => {
      const targetEl = document.getElementById(`${activityId}Target`);
      const actualEl = document.getElementById(`${activityId}Actual`);
      const notesEl = document.getElementById(`${activityId}Notes`);

      this.data.dailyData[selectedDate][activityId] = {
        target: parseFloat(targetEl?.value) || 0,
        actual: parseFloat(actualEl?.value) || 0,
        notes: notesEl?.value || "",
      };
    });

    this.data.dailyData[selectedDate].date = new Date().toISOString();
    this.saveData();
  }

  saveProgress() {
    this.saveCurrentData();
    this.updateStreak();
    this.updateStreakInfo();
  }

  updateStreak() {
    const today = this.getTodayKey();
    const todayData = this.data.dailyData[today];

    if (!todayData) return;

    // Check if all activities are completed
    const allCompleted = Object.keys(this.activities).every((activityId) => {
      const activityData = todayData[activityId];
      return (
        activityData &&
        activityData.target > 0 &&
        activityData.actual >= activityData.target
      );
    });

    if (allCompleted) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split("T")[0];

      if (
        this.data.lastCompletedDate === yesterdayKey ||
        this.data.streak === 0
      ) {
        this.data.streak = (this.data.streak || 0) + 1;
      } else if (this.data.lastCompletedDate !== today) {
        this.data.streak = 1;
      }

      this.data.lastCompletedDate = today;
    }

    this.saveData();
  }

  resetDay() {
    Object.keys(this.activities).forEach((activityId) => {
      const actualInput = document.getElementById(`${activityId}Actual`);
      const notesInput = document.getElementById(`${activityId}Notes`);
      if (actualInput) actualInput.value = 0;
      if (notesInput) notesInput.value = "";
    });

    this.updateAllProgress();
    this.saveCurrentData();
  }

  showHistoryPage() {
    const content = document.getElementById("historyContent");
    content.innerHTML = this.generateHistoryHTML();

    document.getElementById("trackerPage").style.display = "none";
    document.getElementById("historyPage").style.display = "block";
    
    // Set up layout controls after content is loaded
    this.setupGoalLayoutControls();
  }

  showTrackerPage() {
    document.getElementById("historyPage").style.display = "none";
    document.getElementById("trackerPage").style.display = "block";
  }

  generateHistoryHTML() {
    const sortedDates = Object.keys(this.data.dailyData).sort().reverse();

    if (sortedDates.length === 0) {
      return '<p style="text-align: center; color: #6b7280; padding: 40px;">No history available yet. Start tracking your progress!</p>';
    }

    const stats = this.calculateOverallStats(sortedDates);
    const individualStats = this.calculateIndividualStats(sortedDates);

    return `
      <div class="history-dashboard">
        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button class="tab-btn active" data-tab="overview">📊 Overview</button>
          <button class="tab-btn" data-tab="goals">🎯 Goals</button>
          <button class="tab-btn" data-tab="achievements">🏅 Achievements</button>
          <button class="tab-btn" data-tab="trends">📈 Trends</button>
          <button class="tab-btn" data-tab="daily-logs">📅 Daily Logs</button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <div class="tab-pane active" id="overview">
            ${this.generateOverallStatsHTML(stats)}
          </div>
          
          <div class="tab-pane" id="goals">
            ${this.generateIndividualGoalsHTML(individualStats)}
          </div>
          
          <div class="tab-pane" id="achievements">
            ${this.generateAchievementsHTML(stats)}
          </div>
          
          <div class="tab-pane" id="trends">
            ${this.generateProgressTrendsHTML(sortedDates)}
          </div>
          
          <div class="tab-pane" id="daily-logs">
            ${this.generateDailyLogsHTML(sortedDates)}
          </div>
        </div>
      </div>
    `;
  }

  calculateOverallStats(dates) {
    const totalDays = dates.length;
    const last7Days = dates.slice(0, 7);
    const last30Days = dates.slice(0, 30);

    let perfectDays = 0;
    let totalCompletionRate = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    dates.forEach((date, index) => {
      const dayData = this.data.dailyData[date];
      const goalCount = Object.keys(this.activities).length;
      let completedGoals = 0;

      Object.entries(this.activities).forEach(([activityId, activity]) => {
        const activityData = dayData[activityId] || { target: 0, actual: 0 };
        if (
          activityData.target > 0 &&
          activityData.actual >= activityData.target
        ) {
          completedGoals++;
        }
      });

      const dayCompletion =
        goalCount > 0 ? (completedGoals / goalCount) * 100 : 0;
      totalCompletionRate += dayCompletion;

      if (completedGoals === goalCount && goalCount > 0) {
        perfectDays++;
        tempStreak++;
        if (index === 0) currentStreak = tempStreak;
      } else {
        if (index === 0) currentStreak = 0;
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    });

    longestStreak = Math.max(longestStreak, tempStreak);
    const avgCompletion = totalDays > 0 ? totalCompletionRate / totalDays : 0;

    // Calculate weekly trend
    const weeklyTrend = this.calculateTrend(last7Days);

    return {
      totalDays,
      perfectDays,
      avgCompletion,
      currentStreak,
      longestStreak,
      weeklyTrend,
      last7DaysAvg: this.calculatePeriodAverage(last7Days),
      last30DaysAvg: this.calculatePeriodAverage(last30Days),
    };
  }

  calculateIndividualStats(dates) {
    const stats = {};

    Object.entries(this.activities).forEach(([activityId, activity]) => {
      let totalSessions = 0;
      let totalTime = 0;
      let perfectDays = 0;
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let bestDay = { date: null, value: 0 };

      dates.forEach((date, index) => {
        const dayData = this.data.dailyData[date];
        const activityData = dayData[activityId] || { target: 0, actual: 0 };

        if (activityData.actual > 0) {
          totalSessions++;
          totalTime += activityData.actual;

          if (activityData.actual > bestDay.value) {
            bestDay = { date, value: activityData.actual };
          }
        }

        const isCompleted =
          activityData.target > 0 && activityData.actual >= activityData.target;
        if (isCompleted) {
          perfectDays++;
          tempStreak++;
          if (index === 0) currentStreak = tempStreak;
        } else {
          if (index === 0) currentStreak = 0;
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      });

      longestStreak = Math.max(longestStreak, tempStreak);
      const avgPerDay = totalSessions > 0 ? totalTime / totalSessions : 0;
      const completionRate =
        dates.length > 0 ? (perfectDays / dates.length) * 100 : 0;

      stats[activityId] = {
        name: activity.name,
        icon: activity.icon,
        color: activity.color || "#00695c",
        unit: activity.unitShort,
        totalSessions,
        totalTime,
        avgPerDay,
        perfectDays,
        currentStreak,
        longestStreak,
        completionRate,
        bestDay,
        trend: this.calculateActivityTrend(dates.slice(0, 7), activityId),
      };
    });

    return stats;
  }

  calculateTrend(recentDates) {
    if (recentDates.length < 2) return 0;

    const first = this.calculatePeriodAverage(recentDates.slice(-3));
    const recent = this.calculatePeriodAverage(recentDates.slice(0, 3));

    return recent - first;
  }

  calculatePeriodAverage(dates) {
    if (dates.length === 0) return 0;

    let totalCompletion = 0;
    dates.forEach((date) => {
      const dayData = this.data.dailyData[date];
      const goalCount = Object.keys(this.activities).length;
      let completedGoals = 0;

      Object.entries(this.activities).forEach(([activityId, activity]) => {
        const activityData = dayData[activityId] || { target: 0, actual: 0 };
        if (
          activityData.target > 0 &&
          activityData.actual >= activityData.target
        ) {
          completedGoals++;
        }
      });

      totalCompletion += goalCount > 0 ? (completedGoals / goalCount) * 100 : 0;
    });

    return totalCompletion / dates.length;
  }

  calculateActivityTrend(recentDates, activityId) {
    if (recentDates.length < 2) return 0;

    const activity = this.activities[activityId];
    if (!activity) return 0;

    let recent = 0,
      older = 0;
    recentDates.slice(0, 3).forEach((date) => {
      const dayData = this.data.dailyData[date];
      const activityData = dayData[activityId] || { target: 0, actual: 0 };
      recent += activityData.actual;
    });

    recentDates.slice(-3).forEach((date) => {
      const dayData = this.data.dailyData[date];
      const activityData = dayData[activityId] || { target: 0, actual: 0 };
      older += activityData.actual;
    });

    return recent / 3 - older / 3;
  }

  calculateDayCompletion(dayData) {
    const goalCount = Object.keys(this.activities).length;
    if (goalCount === 0) return 0;

    let completedGoals = 0;

    Object.entries(this.activities).forEach(([activityId, activity]) => {
      const activityData = dayData[activityId] || { target: 0, actual: 0 };
      if (
        activityData.target > 0 &&
        activityData.actual >= activityData.target
      ) {
        completedGoals++;
      }
    });

    return (completedGoals / goalCount) * 100;
  }

  generateOverallStatsHTML(stats) {
    const trendIcon =
      stats.weeklyTrend > 5 ? "📈" : stats.weeklyTrend < -5 ? "📉" : "➡️";
    const trendColor =
      stats.weeklyTrend > 5
        ? "#2e7d32"
        : stats.weeklyTrend < -5
        ? "#d32f2f"
        : "#666";

    return `
      <div class="stats-section">
        <h2 class="section-title">🏆 Overall Performance</h2>
        <div class="stats-grid">
          <div class="stat-card featured">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-value">${Math.round(stats.avgCompletion)}%</div>
              <div class="stat-label">Average Completion</div>
              <div class="stat-trend" style="color: ${trendColor}">
                ${trendIcon} ${stats.weeklyTrend > 0 ? "+" : ""}${Math.round(
      stats.weeklyTrend
    )}% this week
              </div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-value">${stats.currentStreak}</div>
              <div class="stat-label">Current Streak</div>
              <div class="stat-secondary">Best: ${
                stats.longestStreak
              } days</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-value">${stats.perfectDays}</div>
              <div class="stat-label">Perfect Days</div>
              <div class="stat-secondary">${Math.round(
                (stats.perfectDays / stats.totalDays) * 100
              )}% success rate</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <div class="stat-value">${stats.totalDays}</div>
              <div class="stat-label">Days Tracked</div>
              <div class="stat-secondary">7-day avg: ${Math.round(
                stats.last7DaysAvg
              )}%</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  generateIndividualGoalsHTML(individualStats) {
    const goalCards = Object.entries(individualStats)
      .map(([activityId, stats]) => {
        const trendIcon =
          stats.trend > 0 ? "📈" : stats.trend < 0 ? "📉" : "➡️";
        const trendColor =
          stats.trend > 0 ? "#2e7d32" : stats.trend < 0 ? "#d32f2f" : "#666";
        const activityColor = stats.color || "#00695c";

        return `
        <div class="goal-card" style="border-left: 4px solid ${activityColor};" data-activity-id="${activityId}">
          <div class="goal-header">
            <div class="goal-main">
              <div class="goal-icon" style="background: ${this.lightenColor(
                activityColor,
                80
              )}; color: ${activityColor};">${stats.icon}</div>
              <div class="goal-info">
                <h3>${stats.name}</h3>
                <div class="goal-completion">${Math.round(
                  stats.completionRate
                )}% completion</div>
              </div>
            </div>
            <div class="goal-actions">
              <button class="quick-complete-btn" onclick="tracker.quickCompleteGoal('${activityId}')" style="background: ${activityColor};">
                ✓
              </button>
              <div class="goal-trend" style="color: ${trendColor}" title="Trend: ${stats.trend > 0 ? 'Improving' : stats.trend < 0 ? 'Declining' : 'Stable'}">${trendIcon}</div>
            </div>
          </div>
          
          <div class="goal-stats">
            <div class="goal-stat-primary">
              <span class="goal-stat-value" style="color: ${activityColor};">${Math.round(
                stats.avgPerDay
              )}</span>
              <span class="goal-stat-label">Avg/Day ${stats.unit}</span>
            </div>
            <div class="goal-stat-secondary">
              <div class="goal-stat-item">
                <span class="goal-stat-value" style="color: ${activityColor};">${
          stats.totalSessions
        }</span>
                <span class="goal-stat-label">Sessions</span>
              </div>
              <div class="goal-stat-item">
                <span class="goal-stat-value" style="color: ${activityColor};">${
          stats.currentStreak
        }</span>
                <span class="goal-stat-label">Streak</span>
              </div>
            </div>
          </div>
          
          ${
            stats.bestDay.date
              ? `
            <div class="goal-achievement">
              🏅 Best: ${Math.round(stats.bestDay.value)}${stats.unit} on ${new Date(stats.bestDay.date).toLocaleDateString()}
            </div>
          `
              : ""
          }
        </div>
      `;
      })
      .join("");

    return `
      <div class="stats-section">
        <div class="section-header-with-controls">
          <h2 class="section-title">🎯 Individual Goal Performance</h2>
          <div class="layout-controls">
            <label for="goalLayoutSelect">Layout:</label>
            <select id="goalLayoutSelect" class="layout-selector">
              <option value="grid">Grid</option>
              <option value="list">List</option>
              <option value="compact">Compact</option>
              <option value="masonry">Masonry</option>
            </select>
            <button id="customizeGoalLayout" class="layout-btn" title="Customize Layout">⚙️</button>
          </div>
        </div>
        <div class="goals-grid" id="goalsContainer">
          ${goalCards}
        </div>
      </div>
    `;
  }

  generateAchievementsHTML(stats) {
    const achievements = [];

    // Check for various achievements
    if (stats.currentStreak >= 7)
      achievements.push({
        icon: "🔥",
        title: "Week Warrior",
        desc: "7+ day streak",
      });
    if (stats.currentStreak >= 30)
      achievements.push({
        icon: "🚀",
        title: "Monthly Master",
        desc: "30+ day streak",
      });
    if (stats.perfectDays >= 10)
      achievements.push({
        icon: "⭐",
        title: "Perfect Ten",
        desc: "10+ perfect days",
      });
    if (stats.avgCompletion >= 80)
      achievements.push({
        icon: "🏆",
        title: "High Achiever",
        desc: "80%+ average",
      });
    if (stats.avgCompletion >= 95)
      achievements.push({
        icon: "💎",
        title: "Perfectionist",
        desc: "95%+ average",
      });
    if (stats.totalDays >= 30)
      achievements.push({
        icon: "📅",
        title: "Consistent Tracker",
        desc: "30+ days logged",
      });
    if (stats.weeklyTrend > 10)
      achievements.push({
        icon: "📈",
        title: "Trending Up",
        desc: "Great weekly improvement",
      });

    if (achievements.length === 0) {
      achievements.push({
        icon: "🌱",
        title: "Getting Started",
        desc: "Keep tracking to unlock achievements!",
      });
    }

    const achievementCards = achievements
      .map(
        (achievement) => `
      <div class="achievement-card">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
          <div class="achievement-title">${achievement.title}</div>
          <div class="achievement-desc">${achievement.desc}</div>
        </div>
      </div>
    `
      )
      .join("");

    return `
      <div class="stats-section">
        <h2 class="section-title">🏅 Achievements</h2>
        <div class="achievements-grid">
          ${achievementCards}
        </div>
      </div>
    `;
  }

  generateProgressTrendsHTML(dates) {
    const last7Days = dates.slice(0, 7).reverse();
    const trendBars = last7Days
      .map((date) => {
        const dayData = this.data.dailyData[date];
        const goalCount = Object.keys(this.activities).length;
        let completedGoals = 0;

        Object.entries(this.activities).forEach(([activityId, activity]) => {
          const activityData = dayData[activityId] || { target: 0, actual: 0 };
          if (
            activityData.target > 0 &&
            activityData.actual >= activityData.target
          ) {
            completedGoals++;
          }
        });

        const percentage =
          goalCount > 0 ? (completedGoals / goalCount) * 100 : 0;
        const dayName = new Date(date).toLocaleDateString("en-US", {
          weekday: "short",
        });

        return `
        <div class="trend-bar">
          <div class="trend-bar-fill" style="height: ${percentage}%"></div>
          <div class="trend-bar-label">${dayName}</div>
          <div class="trend-bar-value">${Math.round(percentage)}%</div>
        </div>
      `;
      })
      .join("");

    return `
      <div class="stats-section">
        <h2 class="section-title">📊 7-Day Trend</h2>
        <div class="trend-chart">
          ${trendBars}
        </div>
      </div>
    `;
  }

  generateRecentHistoryHTML(recentDates) {
    const historyItems = recentDates
      .map((date) => {
        const dayData = this.data.dailyData[date];
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        });

        const stats = Object.entries(this.activities)
          .map(([activityId, activity]) => {
            const activityData = dayData[activityId] || {
              target: 0,
              actual: 0,
            };
            const percentage =
              activityData.target > 0
                ? Math.min(
                    (activityData.actual / activityData.target) * 100,
                    100
                  )
                : 0;
            const isCompleted = percentage >= 100;
            const activityColor = activity.color || "#00695c";

            return `
            <div class="mini-stat ${isCompleted ? "completed" : ""}" 
                 style="border-color: ${activityColor}; ${
              isCompleted
                ? `background: ${this.lightenColor(
                    activityColor,
                    85
                  )}; border-color: ${activityColor};`
                : `background: ${this.lightenColor(activityColor, 95)};`
            }">
              <span class="mini-stat-icon">${activity.icon}</span>
              <span class="mini-stat-value" style="color: ${
                isCompleted ? activityColor : "#6b7280"
              };">${Math.round(percentage)}%</span>
            </div>
          `;
          })
          .join("");

        return `
        <div class="history-item-modern">
          <div class="history-date-modern">${formattedDate}</div>
          <div class="history-stats-modern">${stats}</div>
        </div>
      `;
      })
      .join("");

    return `
      <div class="stats-section">
        <h2 class="section-title">📈 Recent History</h2>
        <div class="recent-history">
          ${historyItems}
        </div>
      </div>
    `;
  }

  generateDailyLogsHTML(sortedDates) {
    if (sortedDates.length === 0) {
      return '<p style="text-align: center; color: #6b7280; padding: 40px;">No daily logs available yet.</p>';
    }

    const dailyLogs = sortedDates
      .map((date) => {
        const dayData = this.data.dailyData[date];
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const activities = Object.entries(this.activities)
          .map(([activityId, activity]) => {
            const activityData = dayData[activityId] || {
              target: 0,
              actual: 0,
              notes: "",
            };
            const percentage =
              activityData.target > 0
                ? Math.min(
                    (activityData.actual / activityData.target) * 100,
                    100
                  )
                : 0;
            const isCompleted = percentage >= 100;
            const activityColor = activity.color || "#00695c";

            return `
              <div class="daily-log-activity ${isCompleted ? "completed" : ""}" 
                   style="border-left: 4px solid ${activityColor}; ${
              isCompleted
                ? `background: ${this.lightenColor(activityColor, 90)};`
                : ""
            }">
                <div class="activity-summary">
                  <div class="activity-info">
                    <span class="activity-icon" style="background: ${this.lightenColor(
                      activityColor,
                      80
                    )}; color: ${activityColor};">${activity.icon}</span>
                    <span class="activity-name">${activity.name}</span>
                  </div>
                  <div class="activity-values">
                    <span class="actual-value" style="color: ${activityColor};">${
              activityData.actual || 0
            }</span>
                    <span class="target-divider">/</span>
                    <span class="target-value">${activityData.target || 0} ${
              activity.unitShort
            }</span>
                    <span class="percentage">(${Math.round(percentage)}%)</span>
                  </div>
                  <button class="edit-log-btn" data-date="${date}" data-activity="${activityId}" 
                          style="border-color: ${activityColor}; color: ${activityColor};">
                    ✏️ Edit
                  </button>
                </div>
                ${
                  activityData.notes
                    ? `
                  <div class="activity-notes">
                    <span class="notes-label">Notes:</span>
                    <span class="notes-text">${activityData.notes}</span>
                  </div>
                `
                    : ""
                }
              </div>
            `;
          })
          .join("");

        const dailyCompletion = this.calculateDayCompletion(dayData);

        return `
          <div class="daily-log-card">
            <div class="daily-log-header">
              <h3 class="daily-log-date">${formattedDate}</h3>
              <div class="daily-log-completion">
                <span class="completion-percentage">${Math.round(
                  dailyCompletion
                )}%</span>
                <span class="completion-label">completed</span>
              </div>
            </div>
            <div class="daily-log-activities">
              ${activities}
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="stats-section">
        <h2 class="section-title">📅 Daily Activity Logs</h2>
        <div class="daily-logs-container">
          ${dailyLogs}
        </div>
      </div>
    `;
  }

  showToast(message, isError = false) {
    // Remove existing toast
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement("div");
    toast.className = `toast ${isError ? "error" : ""}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add("show"), 100);

    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Page Navigation Methods
  showAddGoalPage() {
    console.log("showAddGoalPage called");

    // Hide all pages
    document.querySelectorAll(".page").forEach((page) => {
      page.style.display = "none";
    });

    // Show add goal page
    const addGoalPage = document.getElementById("addGoalPage");
    if (!addGoalPage) {
      console.error("Add goal page not found!");
      return;
    }

    addGoalPage.style.display = "block";

    // Initialize form
    this.populateGoalPageEmojiGrid(false);
    this.populateGoalPageColorGrid(false);

    // Initialize form fields
    const defaultCompletionType =
      document.getElementById("goalPageCompletionType").value || "time";
    this.updateGoalFormFields(defaultCompletionType, false, true);

    console.log("Add goal page should now be visible");
  }

  showEditGoalPage(activityId) {
    console.log("showEditGoalPage called with activityId:", activityId);

    const activity = this.activities[activityId];
    if (!activity) {
      console.error("Activity not found:", activityId);
      return;
    }

    // Store the activity ID for saving
    this.editingActivityId = activityId;

    // Hide all pages
    document.querySelectorAll(".page").forEach((page) => {
      page.style.display = "none";
    });

    // Show edit goal page
    const editGoalPage = document.getElementById("editGoalPage");
    if (!editGoalPage) {
      console.error("Edit goal page not found!");
      return;
    }

    editGoalPage.style.display = "block";

    // Pre-fill form
    document.getElementById("editGoalPageName").value = activity.name;
    document.getElementById("editGoalPageTarget").value = activity.target;
    document.getElementById("editGoalPageCompletionType").value =
      activity.completionType || "time";
    document.getElementById("editGoalPageSelectedEmoji").value = activity.icon;
    document.getElementById("editGoalPageSelectedColor").value =
      activity.color || "#00695c";

    // Handle unit selection
    const isCustomUnit = ![
      "minutes",
      "hours",
      "pages",
      "exercises",
      "glasses",
      "reps",
      "items",
      "times",
      "chapters",
      "sessions",
    ].includes(activity.unit);

    if (isCustomUnit) {
      document.getElementById("editGoalPageUnit").value = "custom";
      document.getElementById("editGoalPageCustomUnit").value = activity.unit;
    } else {
      document.getElementById("editGoalPageUnit").value = activity.unit;
    }

    // Initialize form
    this.populateGoalPageEmojiGrid(true);
    this.populateGoalPageColorGrid(true);
    this.updateGoalPageSelectedEmoji(activity.icon, true);
    this.updateGoalPageSelectedColor(activity.color || "#00695c", true);

    // Update form fields
    this.updateGoalFormFields(activity.completionType || "time", true, true);
    this.toggleCustomUnit(isCustomUnit ? "custom" : activity.unit, true, true);

    console.log("Edit goal page should now be visible");
  }

  showTrackerPage() {
    // Hide all pages
    document.querySelectorAll(".page").forEach((page) => {
      page.style.display = "none";
    });

    // Show tracker page
    document.getElementById("trackerPage").style.display = "block";
  }

  // Page helper methods
  populateGoalPageEmojiGrid(isEdit = false) {
    const prefix = isEdit ? "editGoalPage" : "goalPage";
    const grid = document.getElementById(`${prefix}EmojiGrid`);
    grid.innerHTML = "";

    const emojis = [
      // Achievement & Goals
      "⭐",
      "🎯",
      "🏆",
      "🥇",
      "🎖️",
      "🏅",
      "🎗️",
      "👑",
      "💎",
      "�",

      // Health & Fitness
      "💪",
      "🏃",
      "🚴",
      "🏋️",
      "🤸",
      "🧘",
      "🏊",
      "⛹️",
      "🤾",
      "🏃‍♀️",

      // Learning & Work
      "📚",
      "📖",
      "📝",
      "💼",
      "🧠",
      "🎓",
      "📊",
      "💻",
      "⌨️",
      "🖊️",

      // Creative Arts
      "🎨",
      "🎭",
      "🎪",
      "🎬",
      "📷",
      "🎵",
      "🎸",
      "🎹",
      "🎤",
      "�️",

      // Health & Wellness
      "�",
      "🥗",
      "🥑",
      "💧",
      "🛌",
      "🌱",
      "🌿",
      "🧴",
      "💊",
      "🩺",

      // Nature & Environment
      "🌳",
      "🌸",
      "�",
      "🌻",
      "🌼",
      "🌷",
      "🌹",
      "🍃",
      "�",
      "🦋",

      // Food & Cooking
      "🍳",
      "�‍🍳",
      "🥘",
      "🍲",
      "🥖",
      "🧁",
      "☕",
      "🫖",
      "�️",
      "🥄",

      // Technology & Innovation
      "�",
      "🔬",
      "🧪",
      "🔭",
      "⚙️",
      "🔧",
      "🔨",
      "⚡",
      "🔥",
      "🌐",

      // Social & Relationships
      "👥",
      "💬",
      "📞",
      "💌",
      "👨‍👩‍👧‍👦",
      "🤝",
      "❤️",
      "💕",
      "🫂",
      "👪",

      // Travel & Adventure
      "✈️",
      "�️",
      "🧳",
      "🏔️",
      "🏖️",
      "🌍",
      "🚗",
      "🚲",
      "⛺",
      "�",

      // Money & Finance
      "💰",
      "💳",
      "📈",
      "💲",
      "🏦",
      "📊",
      "💸",
      "�",
      "📉",
      "💹",

      // Time & Productivity
      "⏰",
      "⏱️",
      "📅",
      "🗓️",
      "⏳",
      "🔔",
      "📌",
      "✅",
      "📋",
      "✨",
    ];

    emojis.forEach((emoji) => {
      const emojiDiv = document.createElement("div");
      emojiDiv.className = "emoji-option";
      emojiDiv.textContent = emoji;
      emojiDiv.addEventListener("click", () =>
        this.selectGoalPageEmoji(emoji, isEdit)
      );
      grid.appendChild(emojiDiv);
    });
  }

  populateGoalPageColorGrid(isEdit = false) {
    const prefix = isEdit ? "editGoalPage" : "goalPage";

    // Basic colors - popular and commonly used
    const basicColors = [
      "#00695c",
      "#2e7d32",
      "#1565c0",
      "#7b1fa2",
      "#c62828",
      "#f57c00",
      "#558b2f",
      "#0277bd",
      "#5e35b1",
      "#d84315",
      "#6d4c41",
      "#455a64",
      "#8e24aa",
      "#00acc1",
      "#43a047",
      "#fb8c00",
      "#3949ab",
      "#e53935",
      "#00796b",
      "#388e3c",
      "#1976d2",
      "#512da8",
      "#d32f2f",
      "#ef6c00",
    ];

    // Advanced colors - full spectrum organized by hue
    const advancedColors = [
      // Reds
      "#ffebee",
      "#ffcdd2",
      "#ef9a9a",
      "#e57373",
      "#ef5350",
      "#f44336",
      "#e53935",
      "#d32f2f",
      "#c62828",
      "#b71c1c",

      // Pinks
      "#fce4ec",
      "#f8bbd9",
      "#f48fb1",
      "#f06292",
      "#ec407a",
      "#e91e63",
      "#d81b60",
      "#c2185b",
      "#ad1457",
      "#880e4f",

      // Purples
      "#f3e5f5",
      "#e1bee7",
      "#ce93d8",
      "#ba68c8",
      "#ab47bc",
      "#9c27b0",
      "#8e24aa",
      "#7b1fa2",
      "#6a1b9a",
      "#4a148c",

      // Deep Purples
      "#ede7f6",
      "#d1c4e9",
      "#b39ddb",
      "#9575cd",
      "#7e57c2",
      "#673ab7",
      "#5e35b1",
      "#512da8",
      "#4527a0",
      "#311b92",

      // Indigo
      "#e8eaf6",
      "#c5cae9",
      "#9fa8da",
      "#7986cb",
      "#5c6bc0",
      "#3f51b5",
      "#3949ab",
      "#303f9f",
      "#283593",
      "#1a237e",

      // Blues
      "#e3f2fd",
      "#bbdefb",
      "#90caf9",
      "#64b5f6",
      "#42a5f5",
      "#2196f3",
      "#1e88e5",
      "#1976d2",
      "#1565c0",
      "#0d47a1",

      // Light Blues
      "#e1f5fe",
      "#b3e5fc",
      "#81d4fa",
      "#4fc3f7",
      "#29b6f6",
      "#03a9f4",
      "#039be5",
      "#0288d1",
      "#0277bd",
      "#01579b",

      // Cyans
      "#e0f2f1",
      "#b2dfdb",
      "#80cbc4",
      "#4db6ac",
      "#26a69a",
      "#009688",
      "#00897b",
      "#00796b",
      "#00695c",
      "#004d40",

      // Teals
      "#e0f7fa",
      "#b2ebf2",
      "#80deea",
      "#4dd0e1",
      "#26c6da",
      "#00bcd4",
      "#00acc1",
      "#0097a7",
      "#00838f",
      "#006064",

      // Greens
      "#e8f5e8",
      "#c8e6c9",
      "#a5d6a7",
      "#81c784",
      "#66bb6a",
      "#4caf50",
      "#43a047",
      "#388e3c",
      "#2e7d32",
      "#1b5e20",

      // Light Greens
      "#f1f8e9",
      "#dcedc8",
      "#c5e1a5",
      "#aed581",
      "#9ccc65",
      "#8bc34a",
      "#7cb342",
      "#689f38",
      "#558b2f",
      "#33691e",

      // Yellows
      "#fffde7",
      "#fff9c4",
      "#fff59d",
      "#fff176",
      "#ffee58",
      "#ffeb3b",
      "#fdd835",
      "#f9a825",
      "#f57f17",
      "#ff6f00",

      // Oranges
      "#fff3e0",
      "#ffe0b2",
      "#ffcc80",
      "#ffb74d",
      "#ffa726",
      "#ff9800",
      "#fb8c00",
      "#f57c00",
      "#ef6c00",
      "#e65100",

      // Deep Oranges
      "#fbe9e7",
      "#ffccbc",
      "#ffab91",
      "#ff8a65",
      "#ff7043",
      "#ff5722",
      "#f4511e",
      "#e64a19",
      "#d84315",
      "#bf360c",

      // Browns
      "#efebe9",
      "#d7ccc8",
      "#bcaaa4",
      "#a1887f",
      "#8d6e63",
      "#795548",
      "#6d4c41",
      "#5d4037",
      "#4e342e",
      "#3e2723",

      // Grays
      "#fafafa",
      "#f5f5f5",
      "#eeeeee",
      "#e0e0e0",
      "#bdbdbd",
      "#9e9e9e",
      "#757575",
      "#616161",
      "#424242",
      "#212121",
    ];

    // Populate basic colors
    const basicGrid = document.getElementById(`${prefix}BasicColorGrid`);
    basicGrid.innerHTML = "";
    basicColors.forEach((color) => {
      const colorDiv = document.createElement("div");
      colorDiv.className = "color-option";
      colorDiv.style.backgroundColor = color;
      colorDiv.dataset.color = color;
      colorDiv.addEventListener("click", () =>
        this.selectGoalPageColor(color, isEdit)
      );
      basicGrid.appendChild(colorDiv);
    });

    // Populate advanced colors
    const advancedGrid = document.getElementById(`${prefix}AdvancedColorGrid`);
    advancedGrid.innerHTML = "";
    advancedColors.forEach((color) => {
      const colorDiv = document.createElement("div");
      colorDiv.className = "color-option";
      colorDiv.style.backgroundColor = color;
      colorDiv.dataset.color = color;
      colorDiv.addEventListener("click", () =>
        this.selectGoalPageColor(color, isEdit)
      );
      advancedGrid.appendChild(colorDiv);
    });

    // Setup toggle button
    const toggleBtn = document.getElementById(`${prefix}ToggleAdvanced`);
    const advancedSection = document.getElementById(`${prefix}AdvancedSection`);

    toggleBtn.addEventListener("click", () => {
      const isHidden = advancedSection.style.display === "none";
      advancedSection.style.display = isHidden ? "block" : "none";
      toggleBtn.textContent = isHidden
        ? "Show Fewer Colors"
        : "Show More Colors";
    });

    // Setup custom color picker
    const customColorPicker = document.getElementById(`${prefix}CustomColor`);
    customColorPicker.addEventListener("change", (e) => {
      this.selectGoalPageColor(e.target.value, isEdit);
    });
  }

  selectGoalPageEmoji(emoji, isEdit = false) {
    const prefix = isEdit ? "editGoalPage" : "goalPage";
    document.getElementById(`${prefix}SelectedEmoji`).value = emoji;
    this.updateGoalPageSelectedEmoji(emoji, isEdit);
  }

  selectGoalPageColor(color, isEdit = false) {
    const prefix = isEdit ? "editGoalPage" : "goalPage";
    document.getElementById(`${prefix}SelectedColor`).value = color;
    this.updateGoalPageSelectedColor(color, isEdit);
  }

  updateGoalPageSelectedEmoji(emoji, isEdit = false) {
    const prefix = isEdit ? "editGoalPage" : "goalPage";
    const grid = document.getElementById(`${prefix}EmojiGrid`);
    grid.querySelectorAll(".emoji-option").forEach((option) => {
      option.classList.remove("selected");
      if (option.textContent === emoji) {
        option.classList.add("selected");
      }
    });
  }

  updateGoalPageSelectedColor(color, isEdit = false) {
    const prefix = isEdit ? "editGoalPage" : "goalPage";

    // Update selection in both basic and advanced grids
    const basicGrid = document.getElementById(`${prefix}BasicColorGrid`);
    const advancedGrid = document.getElementById(`${prefix}AdvancedColorGrid`);
    const customColorPicker = document.getElementById(`${prefix}CustomColor`);

    // Clear all selections
    [basicGrid, advancedGrid].forEach((grid) => {
      if (grid) {
        grid.querySelectorAll(".color-option").forEach((option) => {
          option.classList.remove("selected");
          if (option.dataset.color === color) {
            option.classList.add("selected");
          }
        });
      }
    });

    // Update custom color picker
    if (customColorPicker) {
      customColorPicker.value = color;
    }
  }

  // Goal creation and editing from pages
  createNewGoalFromPage() {
    console.log("createNewGoalFromPage started");

    const name = document.getElementById("goalPageName").value.trim();
    const icon = document.getElementById("goalPageSelectedEmoji").value;
    const color = document.getElementById("goalPageSelectedColor").value;
    const target = parseInt(document.getElementById("goalPageTarget").value);
    let unit = document.getElementById("goalPageUnit").value;
    const completionType = document.getElementById(
      "goalPageCompletionType"
    ).value;

    // Handle custom unit
    if (unit === "custom") {
      const customUnit = document
        .getElementById("goalPageCustomUnit")
        .value.trim();
      if (!customUnit) {
        this.showToast("Please enter a custom unit!", true);
        return;
      }
      unit = customUnit.toLowerCase();
    }

    if (!name) {
      this.showToast("Please enter a goal name!", true);
      return;
    }

    if (!target || target <= 0) {
      this.showToast("Please enter a valid target number!", true);
      return;
    }

    // Create new activity
    const newId = "activity_" + Date.now();
    this.activities[newId] = {
      name: name,
      icon: icon,
      color: color,
      target: target,
      unit: unit,
      unitShort: this.getShortUnit(unit, completionType),
      completionType: completionType,
    };

    this.data.activities = this.activities;
    this.saveData();
    this.renderActivities();
    this.showToast("Goal added successfully!");
    this.showTrackerPage();
  }

  saveEditedGoalFromPage() {
    console.log("saveEditedGoalFromPage called");

    if (!this.editingActivityId) {
      this.showToast("Error: No goal selected for editing!", true);
      return;
    }

    const name = document.getElementById("editGoalPageName").value.trim();
    const icon = document.getElementById("editGoalPageSelectedEmoji").value;
    const color = document.getElementById("editGoalPageSelectedColor").value;
    const target = parseInt(
      document.getElementById("editGoalPageTarget").value
    );
    let unit = document.getElementById("editGoalPageUnit").value;
    const completionType = document.getElementById(
      "editGoalPageCompletionType"
    ).value;

    // Handle custom unit
    if (unit === "custom") {
      const customUnit = document
        .getElementById("editGoalPageCustomUnit")
        .value.trim();
      if (!customUnit) {
        this.showToast("Please enter a custom unit!", true);
        return;
      }
      unit = customUnit.toLowerCase();
    }

    if (!name) {
      this.showToast("Please enter a goal name!", true);
      return;
    }

    if (!target || target <= 0) {
      this.showToast("Please enter a valid target number!", true);
      return;
    }

    // Update the activity
    const oldActivity = this.activities[this.editingActivityId];
    this.activities[this.editingActivityId] = {
      ...oldActivity,
      name: name,
      icon: icon,
      color: color,
      target: target,
      unit: unit,
      unitShort: this.getShortUnit(unit, completionType),
      completionType: completionType,
    };

    this.data.activities = this.activities;
    this.saveData();
    this.renderActivities();
    this.loadSelectedDateData();
    this.updateAllProgress();
    this.showToast("Goal updated successfully!");
    this.showTrackerPage();
    this.editingActivityId = null;
  }

  showAddGoalModal() {
    console.log("showAddGoalModal called");

    const modal = document.getElementById("addGoalModal");
    if (!modal) {
      console.error("Add goal modal not found!");
      return;
    }

    this.populateEmojiGrid();
    this.populateColorGrid();

    // Initialize form fields based on default completion type
    const completionTypeSelect = document.getElementById("goalCompletionType");
    if (!completionTypeSelect) {
      console.error("Completion type select not found!");
      return;
    }

    const defaultCompletionType = completionTypeSelect.value || "time";
    console.log("Default completion type:", defaultCompletionType);

    this.updateGoalFormFields(defaultCompletionType, false);

    modal.style.display = "block";
    console.log("Modal should now be visible");
  }

  hideAddGoalModal() {
    console.log("hideAddGoalModal called");

    const modal = document.getElementById("addGoalModal");
    console.log("Modal element found:", modal ? "yes" : "no");

    if (modal) {
      modal.style.display = "none";
      console.log("Modal display set to none");
    }

    const form = document.getElementById("addGoalForm");
    if (form) {
      form.reset();
      console.log("Form reset");
    }

    const selectedEmoji = document.getElementById("selectedEmoji");
    if (selectedEmoji) {
      selectedEmoji.value = "⭐";
      console.log("Selected emoji reset");
    }

    const selectedColor = document.getElementById("selectedColor");
    if (selectedColor) {
      selectedColor.value = "#00695c";
      console.log("Selected color reset");
    }

    this.updateSelectedEmoji("⭐");
    this.updateSelectedColor("#00695c");
    console.log("hideAddGoalModal completed");
  }

  populateEmojiGrid() {
    const emojiGrid = document.getElementById("emojiGrid");
    const emojis = [
      "⭐",
      "💼",
      "💪",
      "📚",
      "🧘",
      "🏃",
      "🎯",
      "💻",
      "🎨",
      "🎵",
      "🍳",
      "🌱",
      "📝",
      "🎮",
      "📷",
      "🎬",
      "🏋️",
      "🚴",
      "🏊",
      "⚽",
      "🏀",
      "🎾",
      "🎸",
      "🎹",
      "🥁",
      "🎤",
      "📖",
      "✍️",
      "💡",
      "🌟",
      "🔥",
      "⚡",
      "🌈",
      "🦋",
      "🌸",
      "🍀",
      "🌙",
      "☀️",
      "❤️",
      "🧠",
      "📱",
      "🎪",
      "🏆",
      "🎓",
      "🎭",
      "🧩",
      "🎲",
      "🎺",
      "🥳",
      "✨",
    ];

    emojiGrid.innerHTML = emojis
      .map(
        (emoji) =>
          `<div class="emoji-option" data-emoji="${emoji}">${emoji}</div>`
      )
      .join("");

    // Set default selection
    this.updateSelectedEmoji("⭐");

    // Add click event delegation for emoji selection
    emojiGrid.onclick = (e) => {
      if (e.target.classList.contains("emoji-option")) {
        this.selectEmoji(e.target.dataset.emoji);
      }
    };
  }

  selectEmoji(emoji) {
    document.getElementById("selectedEmoji").value = emoji;
    this.updateSelectedEmoji(emoji);
  }

  updateSelectedEmoji(emoji) {
    document.querySelectorAll(".emoji-option").forEach((option) => {
      option.classList.remove("selected");
      if (option.dataset.emoji === emoji) {
        option.classList.add("selected");
      }
    });
  }

  populateColorGrid() {
    const colorGrid = document.getElementById("colorPickerGrid");
    const colors = [
      "#00695c", // Teal (default)
      "#2e7d32", // Green
      "#1565c0", // Blue
      "#7b1fa2", // Purple
      "#c62828", // Red
      "#ef6c00", // Orange
      "#f57f17", // Yellow
      "#ad1457", // Pink
      "#5d4037", // Brown
      "#424242", // Gray
      "#37474f", // Blue Gray
      "#1b5e20", // Dark Green
      "#0d47a1", // Dark Blue
      "#4a148c", // Dark Purple
      "#b71c1c", // Dark Red
      "#e65100", // Dark Orange
      "#f57c00", // Amber
      "#880e4f", // Dark Pink
    ];

    colorGrid.innerHTML = colors
      .map(
        (color) =>
          `<div class="color-option" data-color="${color}" style="background-color: ${color}"></div>`
      )
      .join("");

    // Set default selection
    this.updateSelectedColor("#00695c");

    // Add click event delegation for color selection
    colorGrid.onclick = (e) => {
      if (e.target.classList.contains("color-option")) {
        this.selectColor(e.target.dataset.color);
      }
    };
  }

  selectColor(color) {
    document.getElementById("selectedColor").value = color;
    this.updateSelectedColor(color);
  }

  updateSelectedColor(color) {
    document.querySelectorAll(".color-option").forEach((option) => {
      option.classList.remove("selected");
      if (option.dataset.color === color) {
        option.classList.add("selected");
      }
    });
  }

  setupAddGoalListeners() {
    // This method is now only called to populate emoji grid
    // Event listeners are set up in main setupEventListeners method
  }

  updateGoalFormFields(completionType, isEdit = false, isPage = false) {
    console.log(
      "updateGoalFormFields called with:",
      completionType,
      isEdit,
      isPage
    );

    const prefix = isEdit ? "edit" : "";
    const suffix = isPage ? "Page" : "";
    const targetInput = document.getElementById(`${prefix}Goal${suffix}Target`);
    const targetLabel = document.getElementById(
      `${prefix}Goal${suffix}TargetLabel`
    );
    const unitGroup = document.getElementById(
      `${prefix}Goal${suffix}UnitGroup`
    );
    const unitSelect = document.getElementById(`${prefix}Goal${suffix}Unit`);
    
    console.log("Elements found:", {
      targetInput: !!targetInput,
      targetLabel: !!targetLabel,
      unitGroup: !!unitGroup,
      unitSelect: !!unitSelect,
      expectedPrefix: `${prefix}Goal${suffix}`,
    });

    if (!targetInput || !targetLabel || !unitGroup || !unitSelect) {
      console.error("Missing required elements for form update");
      // If isPage is true, try again after a short delay to allow DOM to update
      if (isPage) {
        setTimeout(() => {
          this.updateGoalFormFields(completionType, isEdit, isPage);
        }, 100);
      }
      return;
    }

    // Clear existing options
    unitSelect.innerHTML = "";

    switch (completionType) {
      case "time":
        targetLabel.textContent = "Daily Target:";
        targetInput.type = "number";
        targetInput.min = "1";
        targetInput.max = "480";
        targetInput.step = "1";
        targetInput.value = "30";
        unitGroup.style.display = "block";
        unitSelect.innerHTML = `
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
        `;
        break;

      case "quantity":
        targetLabel.textContent = "Daily Target:";
        targetInput.type = "number";
        targetInput.min = "1";
        targetInput.max = "999";
        targetInput.step = "1";
        targetInput.value = "10";
        unitGroup.style.display = "block";
        unitSelect.innerHTML = `
          <option value="pages">Pages</option>
          <option value="exercises">Exercises</option>
          <option value="glasses">Glasses (water)</option>
          <option value="reps">Reps</option>
          <option value="items">Items</option>
          <option value="times">Times</option>
          <option value="chapters">Chapters</option>
          <option value="sessions">Sessions</option>
          <option value="custom">Custom (write your own)</option>
        `;
        break;

      case "binary":
        targetLabel.textContent = "Goal (will show as Done/Not Done):";
        targetInput.type = "hidden";
        targetInput.value = "1";
        unitGroup.style.display = "none";
        break;

      case "percentage":
        targetLabel.textContent = "Target Percentage:";
        targetInput.type = "number";
        targetInput.min = "1";
        targetInput.max = "100";
        targetInput.step = "1";
        targetInput.value = "100";
        unitGroup.style.display = "none";
        break;
    }

    // Reset custom unit visibility when switching completion types
    this.toggleCustomUnit(unitSelect.value, isEdit, isPage);
  }

  toggleCustomUnit(selectedUnit, isEdit = false, isPage = false) {
    const prefix = isEdit ? "edit" : "";
    const suffix = isPage ? "Page" : "";
    const customGroup = document.getElementById(
      `${prefix}Goal${suffix}CustomUnitGroup`
    );
    const customInput = document.getElementById(
      `${prefix}Goal${suffix}CustomUnit`
    );

    if (selectedUnit === "custom") {
      customGroup.style.display = "block";
      customInput.focus();
    } else {
      customGroup.style.display = "none";
      customInput.value = "";
    }
  }

  getShortUnit(unit, completionType) {
    const unitShorts = {
      // Time units
      minutes: "min",
      hours: "h",
      // Quantity units
      pages: "pg",
      exercises: "ex",
      glasses: "gl",
      reps: "reps",
      items: "items",
      times: "x",
      chapters: "ch",
      sessions: "sess",
    };

    if (completionType === "binary") return "";
    if (completionType === "percentage") return "%";

    // For custom units, create a short version
    if (unitShorts[unit]) {
      return unitShorts[unit];
    } else {
      // Custom unit - try to create a reasonable short version
      if (unit.length <= 3) return unit;
      return unit.slice(0, 3);
    }
  }

  renderActivityInputs(id, activity) {
    const completionType = activity.completionType || "time"; // Default to time for backward compatibility

    switch (completionType) {
      case "time":
        return `
          <div class="time-input-group">
            <label for="${id}Target">Daily Target (${activity.unit}):</label>
            <input type="number" id="${id}Target" min="0" max="480" step="${
          activity.unit === "hours" ? "0.5" : "5"
        }" value="${activity.target}" />
          </div>
          <div class="time-input-group">
            <label for="${id}Actual">${
          activity.unit === "hours" ? "Hours" : "Minutes"
        } Completed:</label>
            <input type="number" id="${id}Actual" min="0" max="480" step="${
          activity.unit === "hours" ? "0.5" : "5"
        }" value="0" />
          </div>
        `;

      case "quantity":
        return `
          <div class="time-input-group">
            <label for="${id}Target">Daily Target (${activity.unit}):</label>
            <input type="number" id="${id}Target" min="0" max="999" step="1" value="${
          activity.target
        }" />
          </div>
          <div class="time-input-group">
            <label for="${id}Actual">${
          activity.unit.charAt(0).toUpperCase() + activity.unit.slice(1)
        } Completed:</label>
            <input type="number" id="${id}Actual" min="0" max="999" step="1" value="0" />
          </div>
        `;

      case "binary":
        return `
          <div class="time-input-group">
            <label for="${id}Target">Goal:</label>
            <input type="text" id="${id}Target" value="${activity.name}" readonly />
          </div>
          <div class="time-input-group">
            <label for="${id}Actual">Status:</label>
            <select id="${id}Actual" class="binary-select">
              <option value="0">Not Done</option>
              <option value="1">Done</option>
            </select>
          </div>
        `;

      case "percentage":
        return `
          <div class="time-input-group">
            <label for="${id}Target">Target:</label>
            <input type="number" id="${id}Target" min="1" max="100" step="1" value="${activity.target}" readonly />
            <span class="unit-label">%</span>
          </div>
          <div class="time-input-group">
            <label for="${id}Actual">Progress:</label>
            <input type="number" id="${id}Actual" min="0" max="100" step="1" value="0" />
            <span class="unit-label">%</span>
          </div>
        `;

      default:
        return this.renderActivityInputs(id, {
          ...activity,
          completionType: "time",
        });
    }
  }

  getProgressText(activity) {
    const completionType = activity.completionType || "time";

    switch (completionType) {
      case "binary":
        return "Not completed";
      case "percentage":
        return `${activity.target}% target`;
      default:
        return `${activity.target}${activity.unitShort} remaining`;
    }
  }

  createNewGoal() {
    console.log("createNewGoal started");

    const name = document.getElementById("goalName").value.trim();
    const icon = document.getElementById("selectedEmoji").value;
    const color = document.getElementById("selectedColor").value;
    const target = parseInt(document.getElementById("goalTarget").value);
    let unit = document.getElementById("goalUnit").value;
    const completionType = document.getElementById("goalCompletionType").value;

    // Handle custom unit
    if (unit === "custom") {
      const customUnit = document.getElementById("customUnit").value.trim();
      if (!customUnit) {
        this.showToast("Please enter a custom unit!", true);
        return;
      }
      unit = customUnit.toLowerCase();
    }

    if (!name) {
      this.showToast("Please enter a goal name!", true);
      return;
    }

    if (!target || target <= 0) {
      this.showToast("Please enter a valid target number!", true);
      return;
    }

    // Hide modal FIRST before doing anything else
    console.log("Hiding modal immediately");
    this.hideAddGoalModal();

    // Then do the data operations
    const newId = "activity_" + Date.now();
    this.activities[newId] = {
      name: name,
      icon: icon,
      color: color,
      target: target,
      unit: unit,
      unitShort: this.getShortUnit(unit, completionType),
      completionType: completionType,
    };

    this.data.activities = this.activities;
    this.saveData();
    this.renderActivities();
    this.loadSelectedDateData();
    this.updateAllProgress();

    this.showToast(`"${name}" goal added successfully!`);
    console.log("createNewGoal completed");
  }

  showEditGoalModal(activityId) {
    console.log("showEditGoalModal called with activityId:", activityId);

    const activity = this.activities[activityId];
    if (!activity) {
      console.error("Activity not found:", activityId);
      return;
    }

    console.log("Found activity:", activity);

    // Store the current activity ID for saving later
    this.editingActivityId = activityId;
    console.log("Set editingActivityId to:", this.editingActivityId);

    // Pre-fill the form with current values
    document.getElementById("editGoalName").value = activity.name;
    document.getElementById("editGoalTarget").value = activity.target;
    document.getElementById("editGoalCompletionType").value =
      activity.completionType || "time";
    document.getElementById("editSelectedEmoji").value = activity.icon;
    document.getElementById("editSelectedColor").value =
      activity.color || "#00695c";

    // Handle unit selection (including custom units)
    const isCustomUnit = ![
      "minutes",
      "hours",
      "pages",
      "exercises",
      "glasses",
      "reps",
      "items",
      "times",
      "chapters",
      "sessions",
    ].includes(activity.unit);

    if (isCustomUnit) {
      document.getElementById("editGoalUnit").value = "custom";
      document.getElementById("editCustomUnit").value = activity.unit;
    } else {
      document.getElementById("editGoalUnit").value = activity.unit;
    }

    // Update form fields based on completion type
    this.updateGoalFormFields(activity.completionType || "time", true);

    // Show/hide custom unit field if needed
    this.toggleCustomUnit(isCustomUnit ? "custom" : activity.unit, true);

    // Populate emoji and color grids and set selections
    this.populateEditEmojiGrid();
    this.populateEditColorGrid();
    this.updateEditSelectedEmoji(activity.icon);
    this.updateEditSelectedColor(activity.color || "#00695c");

    // Show the modal
    document.getElementById("editGoalModal").style.display = "block";
    console.log("Edit modal should now be visible");
  }

  hideEditGoalModal() {
    document.getElementById("editGoalModal").style.display = "none";
    document.getElementById("editGoalForm").reset();
    document.getElementById("editSelectedEmoji").value = "⭐";
    document.getElementById("editSelectedColor").value = "#00695c";
    this.updateEditSelectedEmoji("⭐");
    this.updateEditSelectedColor("#00695c");
    this.editingActivityId = null;
  }

  populateEditEmojiGrid() {
    const emojiGrid = document.getElementById("editEmojiGrid");
    const emojis = [
      "⭐",
      "💼",
      "💪",
      "📚",
      "🧘",
      "🏃",
      "🎯",
      "💻",
      "🎨",
      "🎵",
      "🍳",
      "🌱",
      "📝",
      "🎮",
      "📷",
      "🎬",
      "🏋️",
      "🚴",
      "🏊",
      "⚽",
      "🏀",
      "🎾",
      "🎸",
      "🎹",
      "🥁",
      "🎤",
      "📖",
      "✍️",
      "💡",
      "🌟",
      "🔥",
      "⚡",
      "🌈",
      "🦋",
      "🌸",
      "🍀",
      "🌙",
      "☀️",
      "❤️",
      "🧠",
      "📱",
      "🎪",
      "🏆",
      "🎓",
      "🎭",
      "🧩",
      "🎲",
      "🎺",
      "🥳",
      "✨",
    ];

    emojiGrid.innerHTML = emojis
      .map(
        (emoji) =>
          `<div class="emoji-option" data-emoji="${emoji}">${emoji}</div>`
      )
      .join("");

    // Add click event delegation for emoji selection
    emojiGrid.onclick = (e) => {
      if (e.target.classList.contains("emoji-option")) {
        this.selectEditEmoji(e.target.dataset.emoji);
      }
    };
  }

  selectEditEmoji(emoji) {
    document.getElementById("editSelectedEmoji").value = emoji;
    this.updateEditSelectedEmoji(emoji);
  }

  updateEditSelectedEmoji(emoji) {
    document
      .querySelectorAll("#editEmojiGrid .emoji-option")
      .forEach((option) => {
        option.classList.remove("selected");
        if (option.dataset.emoji === emoji) {
          option.classList.add("selected");
        }
      });
  }

  populateEditColorGrid() {
    const colorGrid = document.getElementById("editColorPickerGrid");
    const colors = [
      "#00695c",
      "#2e7d32",
      "#1565c0",
      "#7b1fa2",
      "#c62828",
      "#ef6c00",
      "#f57f17",
      "#ad1457",
      "#5d4037",
      "#424242",
      "#37474f",
      "#1b5e20",
      "#0d47a1",
      "#4a148c",
      "#b71c1c",
      "#e65100",
      "#f57c00",
      "#880e4f",
    ];

    colorGrid.innerHTML = colors
      .map(
        (color) =>
          `<div class="color-option" data-color="${color}" style="background-color: ${color}"></div>`
      )
      .join("");

    // Add click event delegation for color selection
    colorGrid.onclick = (e) => {
      if (e.target.classList.contains("color-option")) {
        this.selectEditColor(e.target.dataset.color);
      }
    };
  }

  selectEditColor(color) {
    document.getElementById("editSelectedColor").value = color;
    this.updateEditSelectedColor(color);
  }

  updateEditSelectedColor(color) {
    document
      .querySelectorAll("#editColorPickerGrid .color-option")
      .forEach((option) => {
        option.classList.remove("selected");
        if (option.dataset.color === color) {
          option.classList.add("selected");
        }
      });
  }

  saveEditedGoal() {
    console.log(
      "saveEditedGoal called, editingActivityId:",
      this.editingActivityId
    );

    if (!this.editingActivityId) {
      console.error("No editingActivityId found!");
      this.showToast("Error: No goal selected for editing!", true);
      return;
    }

    const name = document.getElementById("editGoalName").value.trim();
    const icon = document.getElementById("editSelectedEmoji").value;
    const color = document.getElementById("editSelectedColor").value;
    const target = parseInt(document.getElementById("editGoalTarget").value);
    let unit = document.getElementById("editGoalUnit").value;
    const completionType = document.getElementById(
      "editGoalCompletionType"
    ).value;

    // Handle custom unit
    if (unit === "custom") {
      const customUnit = document.getElementById("editCustomUnit").value.trim();
      if (!customUnit) {
        this.showToast("Please enter a custom unit!", true);
        return;
      }
      unit = customUnit.toLowerCase();
    }

    console.log("Edit form values:", { name, icon, color, target, unit });
    console.log("Existing activity:", this.activities[this.editingActivityId]);

    if (!name) {
      this.showToast("Please enter a goal name!", true);
      return;
    }

    if (!target || target <= 0) {
      this.showToast("Please enter a valid target number!", true);
      return;
    }

    // Update the activity FIRST (don't create new one)
    const oldActivity = this.activities[this.editingActivityId];
    this.activities[this.editingActivityId] = {
      ...oldActivity,
      name: name,
      icon: icon,
      color: color,
      target: target,
      unit: unit,
      unitShort: this.getShortUnit(unit, completionType),
      completionType: completionType,
    };

    console.log("Updated activity:", this.activities[this.editingActivityId]);

    // Save and update
    this.data.activities = this.activities;
    this.saveData();
    this.renderActivities();
    this.loadSelectedDateData();
    this.updateAllProgress();

    // Hide modal AFTER saving
    this.hideEditGoalModal();

    this.showToast(`"${name}" goal updated successfully!`);
  }

  editActivity(id) {
    console.log("editActivity called with id:", id);
    this.showEditGoalPage(id);
  }

  removeActivity(id) {
    console.log("removeActivity called with id:", id);
    const activity = this.activities[id];
    if (!activity) {
      console.log("Activity not found:", id);
      return;
    }

    if (Object.keys(this.activities).length <= 1) {
      this.showToast("You must have at least one activity!", true);
      return;
    }

    if (
      confirm(
        `Are you sure you want to remove "${activity.name}"? This will delete all associated data.`
      )
    ) {
      delete this.activities[id];

      // Also remove from all saved dates
      Object.keys(this.data.dailyData || {}).forEach((date) => {
        if (this.data.dailyData[date] && this.data.dailyData[date][id]) {
          delete this.data.dailyData[date][id];
        }
      });

      this.data.activities = this.activities;
      this.saveData();
      this.renderActivities();
      // Don't call setupEventListeners again - it's already set up with event delegation
      this.loadSelectedDateData();
      this.updateAllProgress();
      this.showToast(`"${activity.name}" activity removed successfully!`);
    }
  }

  showCustomizeModal() {
    const modal = document.getElementById("customizeModal");
    this.renderActivitiesConfig();
    this.setupCustomizeListeners();
    modal.style.display = "block";
  }

  hideCustomizeModal() {
    document.getElementById("customizeModal").style.display = "none";
  }

  renderActivitiesConfig() {
    const container = document.getElementById("activitiesList");
    container.innerHTML = "";

    Object.entries(this.activities).forEach(([id, activity]) => {
      const configElement = this.createActivityConfig(id, activity);
      container.appendChild(configElement);
    });
  }

  createActivityConfig(id, activity) {
    const div = document.createElement("div");
    div.className = "activity-config";
    div.innerHTML = `
      <div class="activity-config-header">
        <span class="activity-config-title">${activity.name}</span>
        <button class="remove-activity-btn" data-activity="${id}" title="Delete Activity"></button>
      </div>
      <div class="config-row">
        <div class="config-field">
          <label>Activity Name</label>
          <input type="text" id="config-name-${id}" value="${activity.name}">
        </div>
        <div class="config-field">
          <label>Icon</label>
          <select id="config-icon-${id}">
            ${this.getEmojiOptions(activity.icon)}
          </select>
        </div>
      </div>
      <div class="config-row">
        <div class="config-field">
          <label>Default Target</label>
          <input type="number" id="config-target-${id}" value="${
      activity.target
    }" min="1" max="24">
        </div>
        <div class="config-field">
          <label>Unit</label>
          <select id="config-unit-${id}">
            <option value="minutes" ${
              activity.unit === "minutes" ? "selected" : ""
            }>Minutes</option>
            <option value="hours" ${
              activity.unit === "hours" ? "selected" : ""
            }>Hours</option>
          </select>
        </div>
      </div>
    `;
    return div;
  }

  getEmojiOptions(selectedIcon) {
    const emojis = [
      "💼",
      "💪",
      "📚",
      "🧘",
      "⭐",
      "🎯",
      "🏃",
      "💻",
      "🎵",
      "🎨",
      "🍎",
      "💤",
      "📱",
      "🧠",
      "❤️",
      "🌟",
      "⚡",
      "🔥",
      "🌱",
      "🎪",
      "🏆",
      "🎓",
      "✍️",
      "🎸",
      "🏋️",
      "🚴",
      "🍳",
      "📖",
      "🎭",
      "💡",
      "🌈",
      "🦋",
      "🌸",
      "🍀",
      "🌙",
      "☀️",
      "⚽",
      "🏀",
      "🎾",
      "🏊",
      "🧩",
      "🎯",
      "🎲",
      "🎮",
      "📷",
      "🎬",
      "🎤",
      "🎺",
      "🥁",
      "🎹",
    ];

    return emojis
      .map(
        (emoji) =>
          `<option value="${emoji}" ${
            emoji === selectedIcon ? "selected" : ""
          }>${emoji} ${this.getEmojiName(emoji)}</option>`
      )
      .join("");
  }

  getEmojiName(emoji) {
    const names = {
      "💼": "Work",
      "💪": "Exercise",
      "📚": "Reading",
      "🧘": "Meditation",
      "⭐": "Goal",
      "🎯": "Target",
      "🏃": "Running",
      "💻": "Coding",
      "🎵": "Music",
      "🎨": "Art",
      "🍎": "Health",
      "💤": "Sleep",
      "📱": "Digital",
      "🧠": "Learning",
      "❤️": "Wellness",
      "🌟": "Achievement",
      "⚡": "Energy",
      "🔥": "Motivation",
      "🌱": "Growth",
      "🎪": "Fun",
      "🏆": "Success",
      "🎓": "Study",
      "✍️": "Writing",
      "🎸": "Guitar",
      "🏋️": "Strength",
      "🚴": "Cycling",
      "🍳": "Cooking",
      "📖": "Book",
      "🎭": "Theatre",
      "💡": "Ideas",
      "🌈": "Creative",
      "🦋": "Transform",
      "🌸": "Beauty",
      "🍀": "Luck",
      "🌙": "Evening",
      "☀️": "Morning",
      "⚽": "Soccer",
      "🏀": "Basketball",
      "🎾": "Tennis",
      "🏊": "Swimming",
      "🧩": "Puzzle",
      "🎲": "Games",
      "🎮": "Gaming",
      "📷": "Photo",
      "🎬": "Video",
      "🎤": "Singing",
      "🎺": "Trumpet",
      "🥁": "Drums",
      "🎹": "Piano",
    };
    return names[emoji] || "Custom";
  }

  setupCustomizeListeners() {
    // Add activity button
    document.getElementById("addActivityBtn").onclick = () => {
      const newId = "activity_" + Date.now();
      this.activities[newId] = {
        name: "New Activity",
        icon: "⭐",
        target: 30,
        unit: "minutes",
        unitShort: "min",
      };
      this.renderActivitiesConfig();
    };

    // Save customization
    document.getElementById("saveCustomization").onclick = () => {
      this.saveCustomization();
    };

    // Reset to defaults
    document.getElementById("resetToDefaults").onclick = () => {
      if (
        confirm(
          "Are you sure you want to reset to default activities? This will remove all custom activities."
        )
      ) {
        this.activities = this.getDefaultActivities();
        this.data.activities = this.activities;
        this.saveData();
        this.renderActivities();
        this.renderActivitiesConfig();
        this.showToast("Reset to default activities!");
      }
    };

    // Remove activity buttons
    document.querySelectorAll(".remove-activity-btn").forEach((btn) => {
      btn.onclick = () => {
        const activityId = btn.dataset.activity;
        if (Object.keys(this.activities).length > 1) {
          delete this.activities[activityId];
          this.renderActivitiesConfig();
        } else {
          this.showToast("You must have at least one activity!", true);
        }
      };
    });
  }

  saveCustomization() {
    Object.keys(this.activities).forEach((id) => {
      const nameEl = document.getElementById(`config-name-${id}`);
      const iconEl = document.getElementById(`config-icon-${id}`);
      const targetEl = document.getElementById(`config-target-${id}`);
      const unitEl = document.getElementById(`config-unit-${id}`);

      if (nameEl && iconEl && targetEl && unitEl) {
        this.activities[id].name = nameEl.value || "Unnamed Activity";
        this.activities[id].icon = iconEl.value || "⭐";
        this.activities[id].target = parseInt(targetEl.value) || 30;
        this.activities[id].unit = unitEl.value;
        this.activities[id].unitShort = unitEl.value === "hours" ? "h" : "min";
      }
    });

    this.data.activities = this.activities;
    this.saveData();
    this.renderActivities();
    this.setupEventListeners();
    this.loadSelectedDateData();
    this.updateAllProgress();
    this.hideCustomizeModal();
    this.showToast("Activities customized successfully!");
  }

  switchTab(tabName) {
    // Remove active class from all tabs and panes
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.classList.remove("active");
    });

    // Add active class to clicked tab and corresponding pane
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
    document.getElementById(tabName).classList.add("active");
  }

  editDailyLog(date, activityId) {
    const activity = this.activities[activityId];
    const dayData = this.data.dailyData[date] || {};
    const activityData = dayData[activityId] || {
      target: 0,
      actual: 0,
      notes: "",
    };

    const modal = document.createElement("div");
    modal.className = "modal edit-log-modal";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit ${activity.name} - ${new Date(
      date
    ).toLocaleDateString()}</h3>
          <span class="close edit-log-close">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="editLogTarget">Target (${activity.unit}):</label>
            <input type="number" id="editLogTarget" value="${
              activityData.target || 0
            }" min="0" step="0.1">
          </div>
          <div class="form-group">
            <label for="editLogActual">Actual (${activity.unit}):</label>
            <input type="number" id="editLogActual" value="${
              activityData.actual || 0
            }" min="0" step="0.1">
          </div>
          <div class="form-group">
            <label for="editLogNotes">Notes:</label>
            <textarea id="editLogNotes" rows="3" placeholder="Add any notes...">${
              activityData.notes || ""
            }</textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary cancel-edit-log">Cancel</button>
            <button type="button" class="btn btn-primary save-edit-log">Save Changes</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = "block";

    // Event listeners for the modal
    modal.querySelector(".edit-log-close").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    modal.querySelector(".cancel-edit-log").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    modal.querySelector(".save-edit-log").addEventListener("click", () => {
      const newTarget =
        parseFloat(document.getElementById("editLogTarget").value) || 0;
      const newActual =
        parseFloat(document.getElementById("editLogActual").value) || 0;
      const newNotes = document.getElementById("editLogNotes").value.trim();

      // Update the data
      if (!this.data.dailyData[date]) {
        this.data.dailyData[date] = {};
      }
      if (!this.data.dailyData[date][activityId]) {
        this.data.dailyData[date][activityId] = {};
      }

      this.data.dailyData[date][activityId] = {
        target: newTarget,
        actual: newActual,
        notes: newNotes,
      };

      this.saveData();
      this.showToast(`${activity.name} log updated successfully!`);

      // Refresh the history page
      this.showHistoryPage();

      // Switch back to daily logs tab
      setTimeout(() => {
        this.switchTab("daily-logs");
      }, 100);

      document.body.removeChild(modal);
    });

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  lightenColor(hex, percent) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Lighten each component
    const lighten = (c) => Math.round(c + (255 - c) * (percent / 100));

    const newR = lighten(r);
    const newG = lighten(g);
    const newB = lighten(b);

    // Convert back to hex
    const toHex = (c) => c.toString(16).padStart(2, "0");
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  }

  hexToRgb(hex) {
    // Convert hex to RGB object
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  // Calculate relative luminance for WCAG contrast
  getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // Calculate contrast ratio between two colors
  getContrastRatio(rgb1, rgb2) {
    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Ensure color meets WCAG AA standards against dark background
  ensureAccessibleColor(hex) {
    const darkBg = { r: 26, g: 29, b: 46 }; // Our dark background color
    const color = this.hexToRgb(hex);
    const contrast = this.getContrastRatio(color, darkBg);

    // WCAG AA requires 3:1 for large text and UI components
    if (contrast >= 3) {
      return hex; // Color is already accessible
    }

    // Lighten the color until it meets accessibility standards
    let lightened = hex;
    let attempts = 0;
    while (attempts < 50) {
      lightened = this.lightenColor(lightened, 5);
      const newColor = this.hexToRgb(lightened);
      const newContrast = this.getContrastRatio(newColor, darkBg);
      if (newContrast >= 3) {
        return lightened;
      }
      attempts++;
    }

    return lightened; // Return best attempt
  }

  updateNavigation(activeNavId) {
    // Remove active class from all nav items (if they exist)
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.classList.remove("active");
    });

    // Add active class to current nav item (if it exists)
    const activeNav = document.getElementById(activeNavId);
    if (activeNav) {
      activeNav.classList.add("active");
    }
  }

  quickCompleteGoal(activityId) {
    // Check if the activity exists
    if (!this.activities[activityId]) {
      console.error("Activity not found:", activityId);
      return;
    }

    // Get the target value for this activity
    const targetValue = this.activities[activityId].target;
    
    // Find the actual input field and set it to the target value
    const actualEl = document.getElementById(`${activityId}Actual`);
    if (actualEl) {
      actualEl.value = targetValue;
      
      // Trigger auto-save to persist the data
      this.autoSave();
      
      // Update the progress display for this specific activity
      this.updateProgress(activityId);
      
      // Show a brief success message
      this.showQuickCompleteMessage(this.activities[activityId].name);
    } else {
      console.error("Could not find input field for activity:", activityId);
    }
  }

  showQuickCompleteMessage(activityName) {
    // Create a temporary success message
    const message = document.createElement('div');
    message.className = 'quick-complete-message';
    message.textContent = `✓ ${activityName} completed!`;
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      z-index: 10000;
      font-family: 'Orbitron', monospace;
      font-weight: 600;
      animation: slideInRight 0.3s ease-out forwards;
    `;
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#quickCompleteStyles')) {
      const style = document.createElement('style');
      style.id = 'quickCompleteStyles';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(message);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
      message.style.animation = 'slideOutRight 0.3s ease-in forwards';
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 300);
    }, 3000);
  }

  setupGoalLayoutControls() {
    const layoutSelect = document.getElementById('goalLayoutSelect');
    const customizeBtn = document.getElementById('customizeGoalLayout');
    const goalsContainer = document.getElementById('goalsContainer');
    
    if (!layoutSelect || !goalsContainer) return;
    
    // Load saved layout preference
    const savedLayout = localStorage.getItem('goalCardLayout') || 'grid';
    layoutSelect.value = savedLayout;
    this.applyGoalLayout(savedLayout);
    
    // Layout selector change event
    layoutSelect.addEventListener('change', (e) => {
      const selectedLayout = e.target.value;
      this.applyGoalLayout(selectedLayout);
      localStorage.setItem('goalCardLayout', selectedLayout);
    });
    
    // Customize button (future feature for advanced customization)
    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => {
        this.showLayoutCustomizationModal();
      });
    }
  }

  setupActivityLayoutControls() {
    const layoutSelect = document.getElementById('activityLayoutSelect');
    const customizeBtn = document.getElementById('customizeActivityLayout');
    const activitiesContainer = document.getElementById('activitiesContainer');
    
    if (!layoutSelect || !activitiesContainer) return;
    
    // Load saved layout preference
    const savedLayout = localStorage.getItem('activityCardLayout') || 'grid';
    layoutSelect.value = savedLayout;
    this.applyActivityLayout(savedLayout);
    
    // Layout selector change event
    layoutSelect.addEventListener('change', (e) => {
      const selectedLayout = e.target.value;
      this.applyActivityLayout(selectedLayout);
      localStorage.setItem('activityCardLayout', selectedLayout);
    });
    
    // Customize button
    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => {
        this.showActivityLayoutCustomizationModal();
      });
    }
  }

  applyGoalLayout(layoutType) {
    const goalsContainer = document.getElementById('goalsContainer');
    if (!goalsContainer) return;
    
    // Remove all layout classes
    goalsContainer.className = goalsContainer.className.replace(/layout-\w+/g, '');
    
    // Apply new layout class
    goalsContainer.classList.add(`layout-${layoutType}`);
    
    // Apply specific layout styles
    switch(layoutType) {
      case 'grid':
        goalsContainer.style.display = 'grid';
        goalsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(350px, 1fr))';
        goalsContainer.style.gap = '1rem';
        break;
      case 'list':
        goalsContainer.style.display = 'flex';
        goalsContainer.style.flexDirection = 'column';
        goalsContainer.style.gap = '0.75rem';
        break;
      case 'compact':
        goalsContainer.style.display = 'grid';
        goalsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
        goalsContainer.style.gap = '0.5rem';
        break;
      case 'masonry':
        goalsContainer.style.display = 'grid';
        goalsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
        goalsContainer.style.gap = '1rem';
        goalsContainer.style.gridAutoRows = 'masonry';
        break;
    }
    
    // Update card styles based on layout
    this.updateGoalCardStyles(layoutType);
  }

  applyActivityLayout(layoutType) {
    const activitiesContainer = document.getElementById('activitiesContainer');
    if (!activitiesContainer) return;
    
    // Remove all layout classes
    activitiesContainer.className = activitiesContainer.className.replace(/layout-\w+/g, '');
    
    // Apply new layout class
    activitiesContainer.classList.add(`layout-${layoutType}`);
    
    // Apply specific layout styles
    switch(layoutType) {
      case 'grid':
        activitiesContainer.style.display = 'grid';
        activitiesContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
        activitiesContainer.style.gap = '1.5rem';
        break;
      case 'list':
        activitiesContainer.style.display = 'flex';
        activitiesContainer.style.flexDirection = 'column';
        activitiesContainer.style.gap = '1rem';
        break;
      case 'compact':
        activitiesContainer.style.display = 'grid';
        activitiesContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
        activitiesContainer.style.gap = '1rem';
        break;
    }
    
    // Update card styles based on layout
    this.updateActivityCardStyles(layoutType);
  }

  updateGoalCardStyles(layoutType) {
    const goalCards = document.querySelectorAll('.goal-card');
    
    goalCards.forEach(card => {
      // Remove previous layout styles
      card.classList.remove('card-grid', 'card-list', 'card-compact', 'card-masonry');
      
      // Add new layout style
      card.classList.add(`card-${layoutType}`);
      
      switch(layoutType) {
        case 'list':
          card.style.display = 'flex';
          card.style.alignItems = 'center';
          card.style.padding = '1rem 1.5rem';
          break;
        case 'compact':
          card.style.padding = '1rem';
          card.style.fontSize = '0.9rem';
          break;
        case 'masonry':
          card.style.breakInside = 'avoid';
          card.style.pageBreakInside = 'avoid';
          break;
        default: // grid
          card.style.display = 'block';
          card.style.padding = '2rem';
          card.style.fontSize = '';
      }
    });
  }

  updateActivityCardStyles(layoutType) {
    const activityCards = document.querySelectorAll('.activity-card');
    
    activityCards.forEach(card => {
      // Remove previous layout styles
      card.classList.remove('activity-grid', 'activity-list', 'activity-compact');
      
      // Add new layout style
      card.classList.add(`activity-${layoutType}`);
      
      switch(layoutType) {
        case 'list':
          card.style.display = 'flex';
          card.style.flexDirection = 'row';
          card.style.alignItems = 'stretch';
          card.style.padding = '1rem';
          break;
        case 'compact':
          card.style.padding = '1rem';
          card.style.fontSize = '0.9rem';
          break;
        default: // grid
          card.style.display = 'block';
          card.style.padding = '1.5rem';
          card.style.fontSize = '';
      }
    });
  }

  showLayoutCustomizationModal() {
    // Create modal for advanced layout customization
    const modal = document.createElement('div');
    modal.className = 'layout-modal-overlay';
    modal.innerHTML = `
      <div class="layout-modal">
        <div class="layout-modal-header">
          <h3>Customize Goal Layout</h3>
          <button class="close-layout-modal">×</button>
        </div>
        <div class="layout-modal-body">
          <div class="layout-option">
            <label>Columns per row:</label>
            <input type="range" id="columnsRange" min="1" max="4" value="2">
            <span id="columnsValue">2</span>
          </div>
          <div class="layout-option">
            <label>Card spacing:</label>
            <input type="range" id="spacingRange" min="0.25" max="2" step="0.25" value="1">
            <span id="spacingValue">1rem</span>
          </div>
          <div class="layout-option">
            <label>Card size:</label>
            <select id="cardSizeSelect">
              <option value="small">Small</option>
              <option value="medium" selected>Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div class="layout-preview">
            <h4>Preview:</h4>
            <div id="layoutPreview" class="preview-container">
              <div class="preview-card">Goal 1</div>
              <div class="preview-card">Goal 2</div>
              <div class="preview-card">Goal 3</div>
            </div>
          </div>
        </div>
        <div class="layout-modal-footer">
          <button class="apply-layout-btn">Apply Layout</button>
          <button class="cancel-layout-btn">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupLayoutModalEvents(modal);
  }

  showActivityLayoutCustomizationModal() {
    // Simple modal for activity layout customization
    const modal = document.createElement('div');
    modal.className = 'layout-modal-overlay';
    modal.innerHTML = `
      <div class="layout-modal">
        <div class="layout-modal-header">
          <h3>Customize Activity Layout</h3>
          <button class="close-layout-modal">×</button>
        </div>
        <div class="layout-modal-body">
          <div class="layout-option">
            <label>Columns per row:</label>
            <input type="range" id="activityColumnsRange" min="1" max="3" value="2">
            <span id="activityColumnsValue">2</span>
          </div>
          <div class="layout-option">
            <label>Card spacing:</label>
            <input type="range" id="activitySpacingRange" min="0.5" max="2" step="0.25" value="1.5">
            <span id="activitySpacingValue">1.5rem</span>
          </div>
        </div>
        <div class="layout-modal-footer">
          <button class="apply-activity-layout-btn">Apply Layout</button>
          <button class="cancel-layout-btn">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupActivityLayoutModalEvents(modal);
  }

  setupLayoutModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-layout-modal');
    const cancelBtn = modal.querySelector('.cancel-layout-btn');
    const applyBtn = modal.querySelector('.apply-layout-btn');
    const columnsRange = modal.querySelector('#columnsRange');
    const spacingRange = modal.querySelector('#spacingRange');
    
    // Close modal events
    [closeBtn, cancelBtn].forEach(btn => {
      btn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    });
    
    // Preview updates
    columnsRange.addEventListener('input', this.updateLayoutPreview.bind(this, modal));
    spacingRange.addEventListener('input', this.updateLayoutPreview.bind(this, modal));
    
    // Apply custom layout
    applyBtn.addEventListener('click', () => {
      this.applyCustomLayout(modal);
      document.body.removeChild(modal);
    });
    
    // Initial preview
    this.updateLayoutPreview(modal);
  }

  setupActivityLayoutModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-layout-modal');
    const cancelBtn = modal.querySelector('.cancel-layout-btn');
    const applyBtn = modal.querySelector('.apply-activity-layout-btn');
    const columnsRange = modal.querySelector('#activityColumnsRange');
    const spacingRange = modal.querySelector('#activitySpacingRange');
    
    // Close modal events
    [closeBtn, cancelBtn].forEach(btn => {
      btn.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    });
    
    // Preview updates
    columnsRange.addEventListener('input', () => {
      modal.querySelector('#activityColumnsValue').textContent = columnsRange.value;
    });
    spacingRange.addEventListener('input', () => {
      modal.querySelector('#activitySpacingValue').textContent = `${spacingRange.value}rem`;
    });
    
    // Apply custom layout
    applyBtn.addEventListener('click', () => {
      this.applyCustomActivityLayout(modal);
      document.body.removeChild(modal);
    });
  }

  updateLayoutPreview(modal) {
    const preview = modal.querySelector('#layoutPreview');
    const columns = modal.querySelector('#columnsRange').value;
    const spacing = modal.querySelector('#spacingRange').value;
    
    modal.querySelector('#columnsValue').textContent = columns;
    modal.querySelector('#spacingValue').textContent = `${spacing}rem`;
    
    preview.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    preview.style.gap = `${spacing}rem`;
  }

  applyCustomLayout(modal) {
    const goalsContainer = document.getElementById('goalsContainer');
    const columns = modal.querySelector('#columnsRange').value;
    const spacing = modal.querySelector('#spacingRange').value;
    const cardSize = modal.querySelector('#cardSizeSelect').value;
    
    if (!goalsContainer) return;
    
    goalsContainer.classList.add('layout-custom');
    goalsContainer.style.display = 'grid';
    goalsContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    goalsContainer.style.gap = `${spacing}rem`;
    
    // Apply card size
    const goalCards = document.querySelectorAll('.goal-card');
    goalCards.forEach(card => {
      card.classList.add(`card-${cardSize}`);
    });
    
    // Save custom settings
    localStorage.setItem('goalCardLayout', 'custom');
    localStorage.setItem('customLayoutSettings', JSON.stringify({
      columns,
      spacing,
      cardSize
    }));
  }

  applyCustomActivityLayout(modal) {
    const activitiesContainer = document.getElementById('activitiesContainer');
    const columns = modal.querySelector('#activityColumnsRange').value;
    const spacing = modal.querySelector('#activitySpacingRange').value;
    
    if (!activitiesContainer) return;
    
    activitiesContainer.classList.add('layout-custom');
    activitiesContainer.style.display = 'grid';
    activitiesContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    activitiesContainer.style.gap = `${spacing}rem`;
    
    // Save custom settings
    localStorage.setItem('activityCardLayout', 'custom');
    localStorage.setItem('customActivityLayoutSettings', JSON.stringify({
      columns,
      spacing
    }));
  }

  setupActivitySettings() {
    const settingsBtn = document.getElementById('activitySettings');
    const modal = document.getElementById('activitySettingsModal');
    const closeBtn = document.getElementById('closeActivitySettingsModal');

    if (!settingsBtn || !modal || !closeBtn) return;

    // Open settings modal
    settingsBtn.addEventListener('click', () => {
      this.showActivitySettingsModal();
    });

    // Close modal events
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  showActivitySettingsModal() {
    const modal = document.getElementById('activitySettingsModal');
    const settingsList = document.getElementById('activitySettingsList');
    
    if (!modal || !settingsList) return;

    // Clear existing content
    settingsList.innerHTML = '';

    // Get all activities
    const allActivities = {...this.defaultActivities, ...this.customActivities};

    // Create activity items with edit/delete options
    Object.entries(allActivities).forEach(([id, activity]) => {
      const activityItem = document.createElement('div');
      activityItem.className = 'settings-activity-item';
      activityItem.innerHTML = `
        <div class="settings-activity-info">
          <span class="settings-activity-icon">${activity.icon}</span>
          <span class="settings-activity-name">${activity.name}</span>
          <span class="settings-activity-type">${activity.completionType}</span>
        </div>
        <div class="settings-activity-actions">
          <button class="btn-settings-edit" data-activity-id="${id}" title="Edit Activity">✏️ Edit</button>
          <button class="btn-settings-delete" data-activity-id="${id}" title="Delete Activity">🗑️ Delete</button>
        </div>
      `;
      settingsList.appendChild(activityItem);
    });

    // Add event listeners for edit and delete buttons
    settingsList.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-settings-edit')) {
        const activityId = e.target.getAttribute('data-activity-id');
        modal.style.display = 'none';
        this.editActivity(activityId);
      } else if (e.target.classList.contains('btn-settings-delete')) {
        const activityId = e.target.getAttribute('data-activity-id');
        this.deleteActivityFromSettings(activityId);
      }
    });

    // Show modal
    modal.style.display = 'block';
  }

  deleteActivityFromSettings(activityId) {
    const activity = this.defaultActivities[activityId] || this.customActivities[activityId];
    if (!activity) return;

    const confirmDelete = confirm(`Are you sure you want to delete "${activity.name}"? This will remove it from all dates and cannot be undone.`);
    
    if (confirmDelete) {
      // Remove from custom activities if it exists there
      if (this.customActivities[activityId]) {
        delete this.customActivities[activityId];
        localStorage.setItem('customActivities', JSON.stringify(this.customActivities));
      }

      // Remove from all saved progress data
      const allData = JSON.parse(localStorage.getItem('progressData') || '{}');
      Object.keys(allData).forEach(dateKey => {
        if (allData[dateKey].activities && allData[dateKey].activities[activityId]) {
          delete allData[dateKey].activities[activityId];
        }
      });
      localStorage.setItem('progressData', JSON.stringify(allData));

      // Refresh the UI
      this.renderActivities();
      this.showActivitySettingsModal(); // Refresh the modal
      this.showToast(`"${activity.name}" has been deleted successfully.`);
    }
  }

  // Time Period Tab Methods
  setupTimePeriodTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sectionTitle = document.getElementById('sectionTitle');
    
    // Set the active tab based on current period
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeTab = document.querySelector(`[data-period="${this.currentPeriod}"]`);
    if (activeTab) {
      activeTab.classList.add('active');
    }
    
    // Update section title
    const titles = {
      daily: '📋 Daily Activities',
      weekly: '📅 Weekly Goals',
      monthly: '🗓️ Monthly Objectives',
      yearly: '📊 Yearly Targets'
    };
    sectionTitle.textContent = titles[this.currentPeriod];
    
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const period = e.target.getAttribute('data-period');
        this.switchTimePeriod(period);
      });
    });
  }

  switchTimePeriod(period) {
    this.currentPeriod = period;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-period="${period}"]`).classList.add('active');
    
    // Update section title
    const sectionTitle = document.getElementById('sectionTitle');
    const titles = {
      daily: '📋 Daily Activities',
      weekly: '📅 Weekly Goals',
      monthly: '🗓️ Monthly Objectives',
      yearly: '📊 Yearly Targets'
    };
    sectionTitle.textContent = titles[period];
    
    // Re-render activities for the new period
    this.renderActivities();
    this.loadSelectedDateData();
    this.updateAllProgress();
    
    // Save the current period preference
    this.saveData();
    
    // Show toast notification
    this.showToast(`Switched to ${period.charAt(0).toUpperCase() + period.slice(1)} view`);
  }

  // Drag and Drop Methods
  getActivityOrder() {
    const savedOrder = localStorage.getItem(`activityOrder_${this.currentPeriod}`);
    if (savedOrder) {
      try {
        return JSON.parse(savedOrder);
      } catch (e) {
        console.warn('Invalid activity order in localStorage:', e);
      }
    }
    // Return default order if no saved order exists
    return Object.keys(this.activities);
  }

  saveActivityOrder(order) {
    localStorage.setItem(`activityOrder_${this.currentPeriod}`, JSON.stringify(order));
  }

  setupDragAndDrop() {
    const activitiesGrid = document.querySelector('.activities-grid');
    if (!activitiesGrid) return;

    const activityCards = activitiesGrid.querySelectorAll('.activity-card');
    
    activityCards.forEach(card => {
      card.draggable = true;
      card.addEventListener('dragstart', this.handleDragStart.bind(this));
      card.addEventListener('dragover', this.handleDragOver.bind(this));
      card.addEventListener('drop', this.handleDrop.bind(this));
      card.addEventListener('dragend', this.handleDragEnd.bind(this));
      card.addEventListener('dragenter', this.handleDragEnter.bind(this));
      card.addEventListener('dragleave', this.handleDragLeave.bind(this));
    });
  }

  handleDragStart(e) {
    const card = e.target.closest('.activity-card');
    if (!card) return;

    card.classList.add('dragging');
    document.querySelector('.activities-grid').classList.add('dragging');
    
    // Store the dragged element's data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', card.outerHTML);
    e.dataTransfer.setData('text/plain', card.getAttribute('data-category'));
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  handleDragEnter(e) {
    e.preventDefault();
    const card = e.target.closest('.activity-card');
    if (card && !card.classList.contains('dragging')) {
      card.classList.add('drag-over');
    }
  }

  handleDragLeave(e) {
    const card = e.target.closest('.activity-card');
    if (card && !card.contains(e.relatedTarget)) {
      card.classList.remove('drag-over');
    }
  }

  handleDrop(e) {
    e.preventDefault();
    
    const draggedId = e.dataTransfer.getData('text/plain');
    const targetCard = e.target.closest('.activity-card');
    const activitiesGrid = document.querySelector('.activities-grid');
    
    if (!targetCard || !draggedId) return;
    
    const targetId = targetCard.getAttribute('data-category');
    if (draggedId === targetId) return;

    // Get current order
    const currentOrder = Array.from(activitiesGrid.children).map(card => 
      card.getAttribute('data-category')
    );

    // Calculate new order
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged item from its current position
      currentOrder.splice(draggedIndex, 1);
      
      // Insert at new position
      const insertIndex = draggedIndex < targetIndex ? targetIndex : targetIndex + 1;
      currentOrder.splice(insertIndex, 0, draggedId);
      
      // Save new order and re-render
      this.saveActivityOrder(currentOrder);
      this.renderActivities();
      
      // Show feedback
      this.showToast('Activity order updated!');
    }
  }

  handleDragEnd(e) {
    // Clean up drag classes
    document.querySelectorAll('.activity-card').forEach(card => {
      card.classList.remove('dragging', 'drag-over');
    });
    
    const activitiesGrid = document.querySelector('.activities-grid');
    if (activitiesGrid) {
      activitiesGrid.classList.remove('dragging');
    }
  }

  // Mobile Swipe Navigation Methods
  setupMobileSwipeNavigation() {
    // Only enable on mobile devices
    if (window.innerWidth > 768) return;

    const activitiesGrid = document.querySelector('.activities-grid');
    const swipeIndicators = document.getElementById('swipeIndicators');
    const swipeHint = document.getElementById('swipeHint');
    
    if (!activitiesGrid) return;

    // Show mobile-specific elements
    if (swipeIndicators) swipeIndicators.style.display = 'flex';
    if (swipeHint) swipeHint.style.display = 'block';

    // Create indicator dots
    this.createSwipeIndicators();

    // Add scroll listener for updating active dot
    activitiesGrid.addEventListener('scroll', this.handleSwipeScroll.bind(this));

    // Add keyboard navigation for accessibility
    activitiesGrid.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIndex = this.getCurrentCardIndex();
        const targetIndex = e.key === 'ArrowLeft' ? 
          Math.max(0, currentIndex - 1) : 
          Math.min(this.getCardCount() - 1, currentIndex + 1);
        this.scrollToCard(targetIndex);
      }
    });

    // Make the grid focusable for keyboard navigation
    activitiesGrid.setAttribute('tabindex', '0');

    // Add touch listeners for better scroll behavior
    let isScrolling = false;
    activitiesGrid.addEventListener('scroll', () => {
      isScrolling = true;
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        isScrolling = false;
        this.snapToCard();
      }, 150);
    });

    // Resize listener to toggle mobile features
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        if (swipeIndicators) swipeIndicators.style.display = 'none';
        if (swipeHint) swipeHint.style.display = 'none';
      } else {
        if (swipeIndicators) swipeIndicators.style.display = 'flex';
        if (swipeHint) swipeHint.style.display = 'block';
        this.createSwipeIndicators();
      }
    });
  }

  createSwipeIndicators() {
    const swipeIndicators = document.getElementById('swipeIndicators');
    const activityCards = document.querySelectorAll('.activity-card');
    
    if (!swipeIndicators || !activityCards.length) return;

    swipeIndicators.innerHTML = '';
    
    activityCards.forEach((card, index) => {
      const dot = document.createElement('div');
      dot.className = 'swipe-dot';
      if (index === 0) dot.classList.add('active');
      
      dot.addEventListener('click', () => {
        this.scrollToCard(index);
      });
      
      swipeIndicators.appendChild(dot);
    });
  }

  handleSwipeScroll() {
    const activitiesGrid = document.querySelector('.activities-grid');
    const dots = document.querySelectorAll('.swipe-dot');
    const cards = document.querySelectorAll('.activity-card');
    
    if (!activitiesGrid || !dots.length || !cards.length) return;

    const scrollLeft = activitiesGrid.scrollLeft;
    const cardWidth = cards[0].offsetWidth + 16; // Include gap
    const activeIndex = Math.round(scrollLeft / cardWidth);

    // Update active dot
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  }

  scrollToCard(index) {
    const activitiesGrid = document.querySelector('.activities-grid');
    const cards = document.querySelectorAll('.activity-card');
    
    if (!activitiesGrid || !cards[index]) return;

    const cardWidth = cards[0].offsetWidth + 16; // Include gap
    const scrollLeft = index * cardWidth;
    
    activitiesGrid.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  }

  snapToCard() {
    const activitiesGrid = document.querySelector('.activities-grid');
    const cards = document.querySelectorAll('.activity-card');
    
    if (!activitiesGrid || !cards.length) return;

    const scrollLeft = activitiesGrid.scrollLeft;
    const cardWidth = cards[0].offsetWidth + 16; // Include gap
    const nearestIndex = Math.round(scrollLeft / cardWidth);
    
    this.scrollToCard(nearestIndex);
  }

  getCurrentCardIndex() {
    const activitiesGrid = document.querySelector('.activities-grid');
    const cards = document.querySelectorAll('.activity-card');
    
    if (!activitiesGrid || !cards.length) return 0;

    const scrollLeft = activitiesGrid.scrollLeft;
    const cardWidth = cards[0].offsetWidth + 16; // Include gap
    return Math.round(scrollLeft / cardWidth);
  }

  getCardCount() {
    return document.querySelectorAll('.activity-card').length;
  }
}

// Global tracker instance
let tracker;

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  tracker = new DailyProgressTracker();
});
