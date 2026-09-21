/* ============================================================
   js/app.js — 全域狀態 + 進入點
   - 所有模組共用的狀態變數
   - window.onload 啟動流程
   - fetchTasks、getLocalDateString、updateAvatarBadge 等核心工具
   ============================================================ */

// ── 全域狀態 ────────────────────────────────────────────────
var isLoginMode        = true;   // 登入/註冊模式切換
var currentUser        = "";     // 目前登入帳號
var targetElementToDelete = null; // 長按刪除暫存的 task id
var allTasksData       = [];     // 本地任務快取陣列
var currentDetailTaskId = null;  // 目前開啟詳情的 task id
var selectedDateFilter = null;   // 月曆篩選的日期字串 'YYYY-MM-DD'
var currentCalendarYear  = new Date().getFullYear();
var currentCalendarMonth = new Date().getMonth();
var globalRenderGrid   = null;   // grid.js 暴露的重繪函式（供 resize 使用）

// ── 工具函式 ────────────────────────────────────────────────

/**
 * 取得本地日期字串 'YYYY-MM-DD'（不受時區影響）
 * @param {Date} dateObj
 */
function getLocalDateString(dateObj = new Date()) {
  const year  = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day   = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 更新右上角頭像顯示首字 */
function updateAvatarBadge() {
  const badge = document.getElementById('user-avatar-badge');
  if (currentUser && badge) {
    badge.innerText = currentUser.charAt(0).toUpperCase();
  }
}

/** 從 GAS 拉取任務並刷新所有 UI */
function fetchTasks() {
  callGASAPI({ action: 'getTasks', account: currentUser }, (data) => {
    allTasksData = Array.isArray(data) ? data : [];
    renderCalendar();
    renderUpcomingPanel();
    renderTasks();
  }, () => {
    document.getElementById('grid-container').innerHTML =
      `<div style="text-align:center; padding:40px; color:#E63946;">任務載入失敗，請重新整理頁面。</div>`;
  });
}

// ── 進入點 ──────────────────────────────────────────────────
window.onload = function () {
  initGoogleAuth();
  initGlobalTilt();

  const savedUser = localStorage.getItem('planit_user');
  if (savedUser) {
    currentUser = savedUser;
    const loginEl = document.getElementById('login-view');
    const dashEl = document.getElementById('dashboard-view');
    if (loginEl) loginEl.classList.replace('view-active', 'view-hidden');
    if (dashEl) dashEl.classList.replace('view-hidden', 'view-active');
    updateAvatarBadge();
    if (loginEl || dashEl) fetchTasks();
  }
};

// 視窗縮放時重新排列卡片矩陣（防抖與寬度改變保護，杜絕迴圈抖動）
let lastWindowInnerWidth = window.innerWidth;
let gridResizeTimer = null;
window.addEventListener('resize', () => {
  if (window.innerWidth !== lastWindowInnerWidth) {
    lastWindowInnerWidth = window.innerWidth;
    clearTimeout(gridResizeTimer);
    gridResizeTimer = setTimeout(() => {
      if (globalRenderGrid) globalRenderGrid();
    }, 80);
  }
});
