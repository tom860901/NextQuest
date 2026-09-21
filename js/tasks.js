/* ============================================================
   js/tasks.js — 任務 CRUD 全部操作
   - 新增任務 Modal
   - 任務詳情 Modal（含子任務 Checklist）
   - 儲存編輯、完成、Rollover（移到明天）
   - 已完成區（Archive）
   - 刪除確認 Modal
   - AI 拆解子任務
   ============================================================ */

// ── 通用選項工具 ─────────────────────────────────────────────

/** Tag / Priority 按鈕互斥選取 */
function selectOpt(groupClass, btn) {
  document.querySelectorAll(groupClass).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ── 子任務輸入 ───────────────────────────────────────────────

function addManualSubtaskInput(defaultText = "") {
  const container = document.getElementById('manual-subtasks-container');
  const row = document.createElement('div');
  row.className = 'subtask-input-row';
  row.innerHTML = `<input type="text" placeholder="步驟描述..." value="${defaultText}">
    <button class="add-step-btn" onclick="this.parentElement.remove()" style="border:none">❌</button>`;
  container.appendChild(row);
  if (!defaultText) row.querySelector('input').focus();
}

// ── AI 智慧語意拆解引擎（方案 A：精準主題自適應）───────────────

function generateSmartDecomposition(title) {
  const lower = title.toLowerCase();

  // 1. 餐飲社交
  if (/聚餐|吃飯|聚會|約會|派對|晚餐|午餐|早餐|下午茶|咖啡|烤肉|火鍋|酒吧|喝酒|慶生|生日|唱歌|ktv|飯局|朋友/.test(lower)) {
    return [
      "確認出席好友名單、時間與預算偏好",
      "搜尋熱門餐廳口袋名單並完成提前訂位",
      "發布集合地點、交通路線與活動提醒",
      "準時赴約、現場歡聚與會後結帳分帳"
    ];
  }

  // 2. 旅遊出行
  if (/旅遊|旅行|出國|日本|度假|自由行|機票|住宿|飯店|露營|爬山|健行|環島|自駕|景點|遊記|首爾|泰國|行程/.test(lower)) {
    return [
      "確認同行夥伴、預算規劃與機票住宿預訂",
      "規劃每日交通路線、景點行程與預購門票",
      "整理行李打包清單、外幣兌換與網卡 (eSIM)",
      "確認出發前天氣資訊、交通時刻與行前檢查"
    ];
  }

  // 3. 課業學習 / 考試 / 證照
  if (/考試|期末|期中|讀書|複習|檢定|證照|托福|多益|英文|數學|背單字|作業|論文|學習|研讀|上課/.test(lower)) {
    return [
      "盤點考試與學習範圍，劃定重點章節權重",
      "制定每日複習時間表並整理核心觀念筆記",
      "刷歷年考古題進行實戰演練並確實訂正錯題",
      "考前衝刺模擬測驗並調整規律作息狀態"
    ];
  }

  // 4. 工作產出 / 簡報 / 會議 / 報告
  if (/簡報|報告|週報|開會|會議|提案|專案|企劃|發表|ppt|投影片|展示|demo|進度/.test(lower)) {
    return [
      "梳理主題核心論點、目標結論與受眾需求",
      "蒐集關鍵佐證數據、案例分析與視覺素材",
      "排版投影片邏輯架構並完成初步草稿",
      "進行多次演練彩排控制時間，微調修正細節"
    ];
  }

  // 5. 健康運動 / 減重 / 健身
  if (/運動|健身|減肥|減重|減脂|跑步|重訓|瑜珈|游泳|慢跑|深蹲|有氧|菜單/.test(lower)) {
    return [
      "設定本階段訓練目標與體態數據指標",
      "規劃每週運動頻率與各部位訓練課表",
      "搭配高蛋白均衡飲食計畫並確保充足飲水",
      "定時記錄運動成效並根據身體反饋微調強度"
    ];
  }

  // 6. 購物 / 採買 / 消費
  if (/買|購物|採買|超市|補貨|手機|電腦|筆電|相機|衣服|球鞋|特價|週年慶|訂購/.test(lower)) {
    return [
      "列出採買需求規格清單與設定預算上限",
      "比較各大平台規格、真實評價與促銷優惠",
      "前往實體門市體驗或線上平台完成下單",
      "到貨開箱檢驗商品完整性與登錄保固配件"
    ];
  }

  // 7. 求職面試 / 職涯
  if (/面試|求職|找工作|履歷|自傳|作品集|轉職|投履歷|offer|應徵/.test(lower)) {
    return [
      "深入研究目標企業文化、職務需求與市場定位",
      "量身客製化履歷內容、作品集展示與自傳亮點",
      "整理經典面試題庫並進行模擬錄音演練回答",
      "準備提問問題清單並提早規劃當日著裝與路線"
    ];
  }

  // 8. 居家整理 / 搬家 / 大掃除
  if (/搬家|打掃|掃除|整理|房間|收納|斷捨離|清潔|大掃除|整理房間/.test(lower)) {
    return [
      "劃分清理區域並備妥紙箱、標籤與清潔工具",
      "進行斷捨離篩選，分類保留、丟棄與二手贈送",
      "逐區進行深層清潔、除塵並重新規劃動線收納",
      "確認大型垃圾清運預約與日常整潔維護規則"
    ];
  }

  // 9. 程式開發 / 架站 / 技術
  if (/開發|寫程式|code|程式|bug|網站|app|api|重構|git|部署|系統/.test(lower)) {
    return [
      "釐清使用者需求規格並完成系統資料流設計",
      "建立模組化開發環境，撰寫核心功能與單元測試",
      "進行全系統邊界測試、修復 Bug 並重構優化代碼",
      "完成正式環境部署並設定日誌監控運行狀態"
    ];
  }

  // 10. 動態自適應組合（萬用動態生成）
  return [
    `明確「${title}」的具體目標與核心驗收標準`,
    `盤點「${title}」所需的時間、工具與先備資源`,
    `依序排定先後順序並著手執行核心環節`,
    `檢視最終產出品質、確認收尾並總結覆盤`
  ];
}

function triggerAIDecompose() {
  const titleInput = document.getElementById('new-task-input');
  const title = titleInput.value.trim();
  if (!title) { alert("請先輸入上方目標名稱！"); titleInput.focus(); return; }

  const aiBtn = document.getElementById('ai-decompose-btn');
  const originalText = aiBtn.innerHTML;
  aiBtn.innerHTML = "🧠 思考中...";
  aiBtn.disabled = true;

  // 模擬真實 AI 思考微動畫（450ms 後生成主題拆解，體驗流暢真實）
  setTimeout(() => {
    aiBtn.innerHTML = originalText;
    aiBtn.disabled = false;

    const steps = generateSmartDecomposition(title);
    const container = document.getElementById('manual-subtasks-container');
    container.innerHTML = "";
    steps.forEach(stepText => addManualSubtaskInput(stepText));
  }, 450);
}

// ── 新增任務 Modal ───────────────────────────────────────────

function openTaskModal() {
  openModal('task-modal');
  document.getElementById('manual-subtasks-container').innerHTML = '';
  document.getElementById('new-task-input').value = "";
  document.getElementById('new-task-duedate').value = getLocalDateString();
}
function closeTaskModal() { closeModal('task-modal'); }

let isAddingTaskInProgress = false;

function confirmAddTask() {
  if (isAddingTaskInProgress) return;

  const input = document.getElementById('new-task-input');
  const title = input.value.trim();
  if (!title) { input.focus(); return; }

  const tag     = document.querySelector('.tag-btn.active').getAttribute('data-val');
  const pri     = document.querySelector('.pri-btn.active').getAttribute('data-val');
  const dueDate = document.getElementById('new-task-duedate').value;

  let subTasks = [];
  document.querySelectorAll('#manual-subtasks-container input').forEach(inp => {
    if (inp.value.trim()) subTasks.push({ step: inp.value.trim(), done: false });
  });

  const autoWidth = ((dueDate && dueDate.trim() !== "") || subTasks.length > 0) ? 2 : 1;

  isAddingTaskInProgress = true;
  closeTaskModal();
  input.value = ""; // 立刻清空，防止殘留

  callGASAPI({
    action: 'addTask', account: currentUser, title, tag, priority: pri,
    subTasks: JSON.stringify(subTasks), dueDate
  }, (res) => {
    isAddingTaskInProgress = false;
    if (res && res.success) {
      res.task.w = autoWidth;
      if (!allTasksData.some(t => t.id === res.task.id)) {
        allTasksData.push(res.task);
      }
      renderCalendar();
      renderUpcomingPanel();
      renderTasks();
    }
  }, (err) => {
    isAddingTaskInProgress = false;
    console.error("新增任務異常:", err);
  });
}

// ── 任務詳情 Modal ───────────────────────────────────────────

function openTaskDetail(taskId) {
  const task = allTasksData.find(t => t.id === taskId);
  if (!task) return;
  currentDetailTaskId = taskId;

  document.getElementById('edit-task-title').value    = task.title;
  document.getElementById('edit-task-duedate').value  = task.dueDate || '';
  document.getElementById('edit-task-priority').value = task.priority || '🟡 一般';

  let subTasksArr = [];
  try { subTasksArr = JSON.parse(task.subTasks); } catch (e) {}

  const listContainer = document.getElementById('detail-checklist');
  listContainer.innerHTML = '';

  if (subTasksArr.length === 0) {
    listContainer.innerHTML = `<div style="text-align:center; color:var(--text-mid); padding:10px; font-size:0.85rem;">一般任務，可直接標記完成或修改內容。</div>`;
    document.getElementById('detail-progress-text').innerText = '';
  } else {
    renderChecklist(subTasksArr);
  }

  updateCompleteButtonState(subTasksArr);
  openModal('detail-modal');
}

function renderChecklist(subTasksArr) {
  const listContainer = document.getElementById('detail-checklist');
  listContainer.innerHTML = '';
  let doneCount = 0;

  subTasksArr.forEach(st => {
    if (st.done) doneCount++;
    const item = document.createElement('div');
    item.className = `check-item ${st.done ? 'done' : ''}`;
    item.innerHTML = `<div class="checkbox-circle">✔</div><div style="font-weight:600; font-size:0.9rem;">${st.step}</div>`;

    item.onclick = () => {
      st.done = !st.done;
      const idx = allTasksData.findIndex(t => t.id === currentDetailTaskId);
      allTasksData[idx].subTasks = JSON.stringify(subTasksArr);
      renderChecklist(subTasksArr);
      updateCompleteButtonState(subTasksArr);
      callGASAPI({ action: 'updateTask', taskId: currentDetailTaskId, subTasks: JSON.stringify(subTasksArr) }, () => {});
    };
    listContainer.appendChild(item);
  });

  const prog = Math.round((doneCount / subTasksArr.length) * 100);
  document.getElementById('detail-progress-text').innerText = `目前進度：${prog}%`;
}

function updateCompleteButtonState(subTasksArr) {
  const btn = document.getElementById('detail-complete-btn');
  if (!subTasksArr || subTasksArr.length === 0) {
    btn.classList.remove('btn-disabled');
    return;
  }
  btn.classList.toggle('btn-disabled', subTasksArr.some(st => !st.done));
}

// ── 儲存編輯 ────────────────────────────────────────────────

function saveTaskEdits() {
  if (!currentDetailTaskId) return;
  const idx = allTasksData.findIndex(t => t.id === currentDetailTaskId);
  if (idx === -1) return;

  const newTitle    = document.getElementById('edit-task-title').value.trim();
  const newDueDate  = document.getElementById('edit-task-duedate').value;
  const newPriority = document.getElementById('edit-task-priority').value;

  if (!newTitle) { alert("任務名稱不能為空！"); return; }

  allTasksData[idx].title    = newTitle;
  allTasksData[idx].dueDate  = newDueDate;
  allTasksData[idx].priority = newPriority;

  callGASAPI({
    action: 'updateTaskDetails', taskId: currentDetailTaskId,
    title: newTitle, dueDate: newDueDate, priority: newPriority
  }, () => {});

  alert("✨ 任務修改已儲存！");
  closeDetailModal();
}

function closeDetailModal() {
  closeModal('detail-modal');
  currentDetailTaskId = null;
  renderCalendar();
  renderUpcomingPanel();
  renderTasks();
}

// ── 完成任務 ────────────────────────────────────────────────

function markTaskCompleted() {
  if (!currentDetailTaskId) return;
  const task = allTasksData.find(t => t.id === currentDetailTaskId);
  if (!task) return;

  let subTasksArr = [];
  try { subTasksArr = JSON.parse(task.subTasks); } catch (e) {}
  if (subTasksArr.length > 0 && subTasksArr.some(st => !st.done)) {
    alert("⚠️ 還有子任務尚未完成，請先完成所有步驟！");
    return;
  }

  const idx = allTasksData.findIndex(t => t.id === currentDetailTaskId);
  allTasksData[idx].status = 'completed';
  callGASAPI({ action: 'updateTaskStatus', taskId: currentDetailTaskId, status: 'completed' }, () => {});
  closeDetailModal();
}

// ── Rollover：移到明天 ───────────────────────────────────────

function rolloverTaskToTomorrow() {
  if (!currentDetailTaskId) return;
  const idx = allTasksData.findIndex(t => t.id === currentDetailTaskId);
  if (idx === -1) return;

  const currentTask = allTasksData[idx];
  let nextDateStr = "";

  if (currentTask.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(currentTask.dueDate)) {
    const [y, m, d] = currentTask.dueDate.split('-').map(Number);
    nextDateStr = getLocalDateString(new Date(y, m - 1, d + 1));
  } else {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    nextDateStr = getLocalDateString(tomorrow);
  }

  allTasksData[idx].dueDate  = nextDateStr;
  allTasksData[idx].priority = '🔴 緊急';

  closeDetailModal();

  callGASAPI({ action: 'rolloverTask', taskId: currentDetailTaskId, tomorrowDate: nextDateStr },
    () => {}, (err) => console.error("順延同步異常:", err));
}

// ── 已完成區（Archive）──────────────────────────────────────

function openArchiveModal() {
  const archiveList = document.getElementById('archive-list');
  archiveList.innerHTML = '';
  const completedTasks = allTasksData.filter(t => t.status === 'completed');

  if (completedTasks.length === 0) {
    archiveList.innerHTML = `<div style="text-align:center; color:var(--text-mid); padding:20px;">目前沒有已完成的任務</div>`;
  } else {
    completedTasks.forEach(task => {
      const item = document.createElement('div');
      item.className = 'archive-item';
      item.innerHTML = `
        <div>
          <div style="font-weight:700; font-size:0.95rem;">✅ ${task.title}</div>
          <div style="font-size:0.75rem; color:var(--text-mid);">${task.tag} | 期限: ${task.dueDate || '常駐'}</div>
        </div>
        <button class="btn-main btn-secondary" onclick="restoreTask('${task.id}')">復原</button>`;
      archiveList.appendChild(item);
    });
  }
  openModal('archive-modal');
}
function closeArchiveModal() { closeModal('archive-modal'); }

function restoreTask(taskId) {
  const idx = allTasksData.findIndex(t => t.id === taskId);
  if (idx === -1) return;
  allTasksData[idx].status = 'active';
  callGASAPI({ action: 'updateTaskStatus', taskId, status: 'active' }, () => {});
  closeArchiveModal();
  renderCalendar();
  renderUpcomingPanel();
  renderTasks();
}

// ── 刪除確認 Modal ───────────────────────────────────────────

function openDeleteModal(taskId) {
  if (navigator.vibrate) navigator.vibrate(50);
  targetElementToDelete = taskId;
  openModal('delete-modal');
}
function closeDeleteModal() {
  closeModal('delete-modal');
  targetElementToDelete = null;
}

function confirmDeleteTask() {
  if (!targetElementToDelete) return;
  const taskId = targetElementToDelete;
  closeDeleteModal();
  allTasksData = allTasksData.filter(t => t.id !== taskId);
  renderCalendar();
  renderUpcomingPanel();
  renderTasks();
  callGASAPI({ action: 'deleteTask', taskId }, () => {});
}
