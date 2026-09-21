/* ============================================================
   js/ui.js — 通用 UI 工具
   - Modal 開關（通用 + 個別）
   - 3D Tilt 視差效果
   - 主題切換（☾ / ☀）
   - Esc 鍵關閉所有 Modal
   ============================================================ */

// ── Modal 工具 ───────────────────────────────────────────────

/**
 * 點擊 Modal 遮罩背景時關閉（需綁在 modal-overlay 的 onclick）
 * HTML 用法：onclick="handleModalOverlayClick(event, 'task-modal')"
 */
function handleModalOverlayClick(e, modalId) {
  if (e.target.id === modalId) closeModal(modalId);
}

/** 通用開啟 Modal */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('view-hidden'); m.classList.add('view-active'); }
}

/** 通用關閉 Modal */
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('view-active'); m.classList.add('view-hidden'); }
}

// ── 具名 Modal 快捷函式（供 HTML onclick 直接呼叫）────────────
// 說明 Modal
function openGuideModal()  { openModal('guide-modal'); }
function closeGuideModal() { closeModal('guide-modal'); }

// Esc 鍵一鍵關閉所有開啟中的 Modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.view-active').forEach(m => {
      m.classList.remove('view-active');
      m.classList.add('view-hidden');
    });
  }
});

// ── 主題切換 ─────────────────────────────────────────────────

document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    document.querySelectorAll('.theme-toggle-btn').forEach(b => {
      b.innerText = isDark ? '☀' : '☾';
    });
  });
});

// ── 3D Tilt 視差效果 ─────────────────────────────────────────

/**
 * 初始化全視窗 mousemove 跟隨的 2.5D 視差傾角
 * 修復版：tilt 套在各 .window-shell 元素上，不影響 fixed modal 層
 */
function initGlobalTilt() {
  const dashView = document.getElementById('dashboard-view');

  document.addEventListener('mousemove', (e) => {
    // 有 modal 開啟時暫停 tilt，避免點擊座標偏移
    if (document.querySelector('.modal-overlay.view-active')) return;
    if (!dashView || !dashView.classList.contains('view-active')) return;

    const xOffset = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const yOffset = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    const tiltX = -yOffset * 2.5;
    const tiltY =  xOffset * 2.5;

    dashView.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });

  document.addEventListener('mouseleave', () => {
    if (!dashView) return;
    dashView.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
  });
}
