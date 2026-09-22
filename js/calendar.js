/* ============================================================
   js/calendar.js — 月曆渲染 & 日期篩選
   - renderCalendar()：繪製月曆格子與任務點
   - renderUpcomingPanel()：右欄「即將到來」預告
   - changeMonth()：上下月切換
   - jumpToToday()：跳回今日
   ============================================================ */

function renderCalendar() {
  const titleEl = document.getElementById('cal-month-title');
  const gridEl  = document.getElementById('cal-days-grid');
  gridEl.innerHTML = '';

  titleEl.innerText = `${currentCalendarYear}年 ${currentCalendarMonth + 1}月`;

  const firstDayIndex = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
  const startDay  = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 週一為首欄
  const totalDays = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();

  const todayStr   = getLocalDateString();
  const activeTasks = allTasksData.filter(t => t.status !== 'completed');

  // 空白格（月初前的空位）
  for (let i = 0; i < startDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    gridEl.appendChild(el);
  }

  // 日期格
  for (let day = 1; day <= totalDays; day++) {
    const mStr    = String(currentCalendarMonth + 1).padStart(2, '0');
    const dStr    = String(day).padStart(2, '0');
    const dateStr = `${currentCalendarYear}-${mStr}-${dStr}`;
    const isToday = dateStr === todayStr;

    // 當天有任務時顯示小點
    const tasksOnDay = activeTasks.filter(t => t.dueDate === dateStr);
    let dotsHtml = '';
    tasksOnDay.forEach(t => {
      const isUrgent = t.priority === '🔴 緊急' || t.dueDate <= todayStr;
      dotsHtml += `<div class="cal-dot ${isUrgent ? 'urgent' : ''}"></div>`;
    });

    const cell = document.createElement('div');
    cell.className = [
      'cal-day',
      isToday ? 'today' : '',
      selectedDateFilter === dateStr ? 'active-filter' : ''
    ].join(' ').trim();
    cell.innerHTML = `<div>${day}</div><div class="cal-dot-container">${dotsHtml}</div>`;

    // 點擊日期：切換篩選（再點一次取消篩選）
    cell.onclick = () => {
      selectedDateFilter = (selectedDateFilter === dateStr) ? null : dateStr;
      renderCalendar();
      renderTasks();
    };

    gridEl.appendChild(cell);
  }
}

function renderUpcomingPanel() {
  const todayStr = getLocalDateString();

  // ── 1. 計算今日完成事項與待辦概況 (例如 5/8) ────────────────────
  // ── 1. 計算今日完成事項與待辦概況 (方案 B：聚焦今日截止與每日固定任務) ──
  const todayDueTasks = allTasksData.filter(t => {
    if (t.dueDate === todayStr) return true;
    if (t.tag && (t.tag.includes('每日固定任務') || t.tag.includes('例行重複'))) return true;
    return false;
  });

  let completedCount = 0;
  let totalCount = 0;

  if (todayDueTasks.length > 0) {
    // 今日有指定到期日或每日固定任務
    completedCount = todayDueTasks.filter(t => t.status === 'completed').length;
    totalCount = todayDueTasks.length;
  } else {
    // 若今日無特定到期日與固定任務，以全體任務統計
    completedCount = allTasksData.filter(t => t.status === 'completed').length;
    totalCount = allTasksData.length;
  }

  const badgeEl = document.getElementById('today-stats-badge');
  const descEl  = document.getElementById('today-stats-desc');
  const progEl  = document.getElementById('today-stats-progress');

  if (badgeEl && descEl && progEl) {
    badgeEl.innerText = `(${completedCount}/${totalCount})`;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    descEl.innerText = `已完成 ${completedCount} 項 / 共 ${totalCount} 項待辦 (${pct}%)`;
    progEl.style.width = `${pct}%`;
  }

  // ── 2. 渲染即將到來清單 ──────────────────────────────────────
  const panel = document.getElementById('upcoming-list');
  if (!panel) return;
  panel.innerHTML = '';

  const activeTasks = allTasksData
    .filter(t => t.status !== 'completed' && t.dueDate && t.dueDate >= todayStr)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  if (activeTasks.length === 0) {
    panel.innerHTML = `<div style="text-align:center; color:var(--text-mid); padding:12px; font-size:0.8rem;">近期沒有待辦期限</div>`;
    return;
  }

  activeTasks.slice(0, 8).forEach(task => {
    const item = document.createElement('div');
    item.className = 'upcoming-item';
    item.innerHTML = `
      <div style="font-weight:700; margin-bottom:2px;">📌 ${task.title}</div>
      <div style="font-size:0.75rem; color:var(--text-mid); display:flex; justify-content:space-between;">
        <span>${task.tag}</span>
        <span style="color:#E63946; font-weight:700;">${task.dueDate}</span>
      </div>`;
    item.onclick = () => openTaskDetail(task.id);
    panel.appendChild(item);
  });
}

function changeMonth(direction) {
  currentCalendarMonth += direction;
  if (currentCalendarMonth > 11) { currentCalendarMonth = 0; currentCalendarYear++; }
  else if (currentCalendarMonth < 0) { currentCalendarMonth = 11; currentCalendarYear--; }
  renderCalendar();
}

function jumpToToday() {
  const today = new Date();
  currentCalendarYear  = today.getFullYear();
  currentCalendarMonth = today.getMonth();
  selectedDateFilter   = getLocalDateString(today);
  renderCalendar();
  renderTasks();
}
