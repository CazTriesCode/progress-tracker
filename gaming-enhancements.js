/* ============================================
   GAMING ENHANCEMENTS - ACHIEVEMENT SYSTEM
   Progressive Tracker Gaming Edition
   ============================================ */

(function () {
  "use strict";

  // Achievement definitions
  const achievements = {
    firstGoal: {
      id: "firstGoal",
      title: "First Victory!",
      description: "Complete your first goal",
      icon: "🎯",
      unlocked: false,
    },
    perfectDay: {
      id: "perfectDay",
      title: "Perfect Day",
      description: "Complete all goals in a day",
      icon: "⭐",
      unlocked: false,
    },
    weekStreak: {
      id: "weekStreak",
      title: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      unlocked: false,
    },
    monthStreak: {
      id: "monthStreak",
      title: "Monthly Champion",
      description: "Maintain a 30-day streak",
      icon: "👑",
      unlocked: false,
    },
    overachiever: {
      id: "overachiever",
      title: "Overachiever",
      description: "Complete 150% of your daily target",
      icon: "💪",
      unlocked: false,
    },
    dedication: {
      id: "dedication",
      title: "Dedication",
      description: "Log progress for 100 days",
      icon: "🏆",
      unlocked: false,
    },
  };

  // Load achievement state from localStorage
  function loadAchievements() {
    const saved = localStorage.getItem("gamingAchievements");
    if (saved) {
      const savedAchievements = JSON.parse(saved);
      Object.keys(savedAchievements).forEach((key) => {
        if (achievements[key]) {
          achievements[key].unlocked = savedAchievements[key].unlocked;
        }
      });
    }
  }

  // Save achievement state
  function saveAchievements() {
    localStorage.setItem("gamingAchievements", JSON.stringify(achievements));
  }

  // Show achievement popup
  function showAchievement(achievement) {
    // Check if already unlocked
    if (achievement.unlocked) return;

    // Mark as unlocked
    achievement.unlocked = true;
    saveAchievements();

    // Create popup element
    const popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-title">${achievement.title}</div>
      <div class="achievement-description">${achievement.description}</div>
    `;

    // Add to document
    document.body.appendChild(popup);

    // Create particles
    createParticles(popup);

    // Play achievement sound (if available)
    playAchievementSound();

    // Remove after animation
    setTimeout(() => {
      popup.style.animation = "achievementPop 0.4s ease-out reverse";
      setTimeout(() => popup.remove(), 400);
    }, 4000);
  }

  // Create celebration particles
  function createParticles(sourceElement) {
    const rect = sourceElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = centerX + "px";
      particle.style.top = centerY + "px";

      // Random color
      const colors = ["#00f0ff", "#b537f2", "#ffd700", "#00ff88"];
      particle.style.background =
        colors[Math.floor(Math.random() * colors.length)];

      // Random direction
      const angle = (Math.PI * 2 * i) / 30;
      const velocity = 50 + Math.random() * 100;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      particle.style.setProperty("--tx", tx + "px");
      particle.style.setProperty("--ty", ty + "px");

      document.body.appendChild(particle);

      // Remove after animation
      setTimeout(() => particle.remove(), 2000);
    }
  }

  // Play achievement sound
  function playAchievementSound() {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 523.25; // C5
      oscillator.type = "square";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Audio not supported or blocked
      console.log("Achievement sound not available");
    }
  }

  // Check achievements
  function checkAchievements(data) {
    if (!data) return;

    // First Goal
    if (!achievements.firstGoal.unlocked) {
      const hasCompletedGoal = Object.values(data.dailyData || {}).some(
        (dayData) => {
          return Object.values(dayData.activities || {}).some(
            (activity) => activity.actual >= activity.target
          );
        }
      );
      if (hasCompletedGoal) {
        showAchievement(achievements.firstGoal);
      }
    }

    // Perfect Day
    if (!achievements.perfectDay.unlocked) {
      const today = new Date().toISOString().split("T")[0];
      const todayData = data.dailyData?.[today];
      if (todayData && todayData.activities) {
        const allCompleted = Object.values(todayData.activities).every(
          (activity) => activity.actual >= activity.target
        );
        const hasActivities = Object.keys(todayData.activities).length > 0;
        if (allCompleted && hasActivities) {
          showAchievement(achievements.perfectDay);
        }
      }
    }

    // Week Streak
    if (!achievements.weekStreak.unlocked && (data.streak || 0) >= 7) {
      showAchievement(achievements.weekStreak);
    }

    // Month Streak
    if (!achievements.monthStreak.unlocked && (data.streak || 0) >= 30) {
      showAchievement(achievements.monthStreak);
    }

    // Overachiever
    if (!achievements.overachiever.unlocked) {
      const today = new Date().toISOString().split("T")[0];
      const todayData = data.dailyData?.[today];
      if (todayData && todayData.activities) {
        const hasOverachieved = Object.values(todayData.activities).some(
          (activity) => activity.actual >= activity.target * 1.5
        );
        if (hasOverachieved) {
          showAchievement(achievements.overachiever);
        }
      }
    }

    // Dedication
    if (!achievements.dedication.unlocked) {
      const totalDays = Object.keys(data.dailyData || {}).length;
      if (totalDays >= 100) {
        showAchievement(achievements.dedication);
      }
    }
  }

  // Enhanced completion animation
  function enhanceCompletionBadges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.classList && node.classList.contains("completed")) {
            // Add power-up effect to parent card
            const card = node.closest(".activity-card");
            if (card) {
              card.classList.add("power-up");
              setTimeout(() => card.classList.remove("power-up"), 600);
            }

            // Create mini celebration
            createMiniCelebration(node);
          }
        });

        mutation.target.classList &&
          mutation.target.classList.forEach((className) => {
            if (
              className === "completed" &&
              mutation.attributeName === "class"
            ) {
              const card = mutation.target.closest(".activity-card");
              if (card && !card.classList.contains("power-up")) {
                card.classList.add("power-up");
                setTimeout(() => card.classList.remove("power-up"), 600);
                createMiniCelebration(mutation.target);
              }
            }
          });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  // Mini celebration for goal completion
  function createMiniCelebration(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 10; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = centerX + "px";
      particle.style.top = centerY + "px";
      particle.style.width = "6px";
      particle.style.height = "6px";

      const colors = ["#ffd700", "#ffed4e", "#ffa500"];
      particle.style.background =
        colors[Math.floor(Math.random() * colors.length)];

      const angle = (Math.PI * 2 * i) / 10;
      const velocity = 30 + Math.random() * 50;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 50; // Bias upward

      particle.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
      particle.style.animation = "particles 1s ease-out forwards";

      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 1000);
    }
  }

  // Show combo counter
  function showComboCounter(count) {
    const existing = document.querySelector(".combo-counter");
    if (existing) existing.remove();

    const combo = document.createElement("div");
    combo.className = "combo-counter";
    combo.textContent = `${count}X COMBO!`;
    document.body.appendChild(combo);

    setTimeout(() => combo.remove(), 1000);
  }

  // Track consecutive completions
  let consecutiveCompletions = 0;
  let lastCompletionTime = 0;

  function trackConsecutiveCompletions() {
    const badges = document.querySelectorAll(".completion-badge");
    badges.forEach((badge) => {
      badge.addEventListener("transitionend", function (e) {
        if (
          this.classList.contains("completed") &&
          e.propertyName === "transform"
        ) {
          const now = Date.now();
          if (now - lastCompletionTime < 5000) {
            // Within 5 seconds
            consecutiveCompletions++;
            if (consecutiveCompletions >= 2) {
              showComboCounter(consecutiveCompletions);
            }
          } else {
            consecutiveCompletions = 1;
          }
          lastCompletionTime = now;
        }
      });
    });
  }

  // Enhanced progress bar animations
  function enhanceProgressBars() {
    const progressBars = document.querySelectorAll(".progress-fill");
    progressBars.forEach((bar) => {
      const observer = new MutationObserver(() => {
        const width = parseFloat(bar.style.width || "0");
        if (width >= 100) {
          bar.style.animation = "glowPulse 1s ease-in-out 3";
        }
      });
      observer.observe(bar, { attributes: true, attributeFilter: ["style"] });
    });
  }

  // Streak fire effect enhancement
  function enhanceStreakDisplay() {
    const streakNumbers = document.querySelectorAll(".streak-number");
    streakNumbers.forEach((number) => {
      const value = parseInt(number.textContent);
      if (value >= 7) {
        number.style.animation =
          "streakFire 2s ease-in-out infinite, numberPulse 2s ease-in-out infinite";
      }
      if (value >= 30) {
        number.style.animation =
          "streakFire 1.5s ease-in-out infinite, numberPulse 1.5s ease-in-out infinite, levelUp 2s ease-in-out infinite";
      }
    });
  }

  // Initialize gaming enhancements
  function init() {
    // Load saved achievements
    loadAchievements();

    // Set up observers and enhancements
    enhanceCompletionBadges();
    trackConsecutiveCompletions();
    enhanceProgressBars();

    // Check achievements on load
    try {
      const savedData = localStorage.getItem("dailyProgressData");
      if (savedData) {
        checkAchievements(JSON.parse(savedData));
      }
    } catch (e) {
      console.log("Could not load achievement data");
    }

    // Check achievements periodically
    setInterval(() => {
      try {
        const savedData = localStorage.getItem("dailyProgressData");
        if (savedData) {
          checkAchievements(JSON.parse(savedData));
        }
      } catch (e) {
        // Silent fail
      }
      enhanceStreakDisplay();
    }, 5000);

    // Enhance streak display on load
    setTimeout(enhanceStreakDisplay, 1000);

    console.log("🎮 Gaming enhancements activated!");
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose checkAchievements for external use
  window.gamingEnhancements = {
    checkAchievements,
    showAchievement,
    createParticles,
    showComboCounter,
  };
})();
