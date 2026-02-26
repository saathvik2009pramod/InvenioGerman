// =========================================
// script.js — Deutsch Lernen Shared Logic
// =========================================

// ── Level persistence helpers ──
const DeutschApp = {
  getLevel() {
    return localStorage.getItem('deutschLevel') || 'A1';
  },
  setLevel(level) {
    localStorage.setItem('deutschLevel', level);
  },
  getScore() {
    return parseInt(localStorage.getItem('deutschScore')) || 0;
  },
  setScore(score) {
    localStorage.setItem('deutschScore', score);
  },
  getModuleProgress(level, moduleIndex) {
    const key = `progress_${level}_${moduleIndex}`;
    return localStorage.getItem(key) === 'complete';
  },
  setModuleComplete(level, moduleIndex) {
    const key = `progress_${level}_${moduleIndex}`;
    localStorage.setItem(key, 'complete');
  },
  resetProgress() {
    localStorage.clear();
  }
};

// ── Smooth page transitions ──
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

// Navigate with fade-out
function navigateTo(url) {
  document.body.style.opacity = '0';
  setTimeout(() => { window.location.href = url; }, 280);
}
