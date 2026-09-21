/* ============================================================
   js/auth.js — 帳號驗證系統
   - 帳密登入 / 註冊
   - Google OAuth SSO
   - 忘記密碼（寄臨時密碼）
   - 登出
   - 密碼顯示切換
   ============================================================ */

// ── 密碼眼睛切換 ─────────────────────────────────────────────

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerText = '🙈';
  } else {
    input.type = 'password';
    btn.innerText = '👁️';
  }
}

// ── Google OAuth ─────────────────────────────────────────────

function initGoogleAuth() {
  setTimeout(() => {
    try {
      if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false
        });
        google.accounts.id.renderButton(
          document.getElementById("google-btn-container"),
          { theme: "outline", size: "large", shape: "pill", width: 280 }
        );
      }
    } catch (e) {}
  }, 200);
}

function decodeJwtResponse(t) {
  return JSON.parse(
    decodeURIComponent(
      atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        .split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    )
  );
}

function handleCredentialResponse(r) {
  document.getElementById('message').innerText = "驗證成功，進入控制中心...";
  const userInfo = decodeJwtResponse(r.credential);

  callGASAPI({ action: 'googleLogin', email: userInfo.email, name: userInfo.name || "User" }, (res) => {
    currentUser = (res && res.account) ? res.account : userInfo.email;
    localStorage.setItem('planit_user', currentUser);
    updateAvatarBadge();
    document.getElementById('login-view').classList.replace('view-active', 'view-hidden');
    document.getElementById('dashboard-view').classList.replace('view-hidden', 'view-active');
    fetchTasks();
  }, (err) => {
    document.getElementById('message').innerText = err;
  });
}

// ── 登入 / 註冊模式切換 ──────────────────────────────────────

function toggleMode() {
  isLoginMode = !isLoginMode;
  document.getElementById('form-title').innerText        = isLoginMode ? 'Planit' : '新建帳號';
  document.getElementById('action-btn').innerText        = isLoginMode ? '進入系統' : '註冊帳號';
  document.getElementById('email-field-group').classList.toggle('view-hidden', isLoginMode);
  document.getElementById('switch-mode-text').innerText  = isLoginMode ? '沒有帳號？點此新建帳號' : '已有帳號？返回登入';
  document.getElementById('forgot-pwd-btn').style.display = isLoginMode ? 'inline' : 'none';
  document.getElementById('message').innerText = '';
}

// ── 帳密登入 / 註冊提交 ──────────────────────────────────────

function submitManualForm() {
  const acc   = document.getElementById('account').value.trim();
  const pwd   = document.getElementById('password').value.trim();
  const email = document.getElementById('email').value.trim();
  const actionBtn = document.getElementById('action-btn');

  if (!acc || !pwd) { document.getElementById('message').innerText = "請輸入帳號與密碼！"; return; }
  if (!isLoginMode && !email) { document.getElementById('message').innerText = "註冊請填寫電子信箱！"; return; }

  document.getElementById('message').innerText = "連線驗證中...";
  actionBtn.disabled = true;
  actionBtn.classList.add('btn-disabled');

  callGASAPI(
    { action: isLoginMode ? 'login' : 'register', account: acc, password: pwd, email: email },
    (res) => {
      actionBtn.disabled = false;
      actionBtn.classList.remove('btn-disabled');
      if (!res) { document.getElementById('message').innerText = "伺服器未回傳有效狀態！"; return; }
      document.getElementById('message').innerText = res.msg || (res.success ? "成功" : "驗證失敗");

      if (res.success) {
        if (!isLoginMode) {
          setTimeout(toggleMode, 1500);
        } else {
          currentUser = String(res.account);
          localStorage.setItem('planit_user', currentUser);
          updateAvatarBadge();
          document.getElementById('login-view').classList.replace('view-active', 'view-hidden');
          document.getElementById('dashboard-view').classList.replace('view-hidden', 'view-active');
          fetchTasks();
        }
      }
    },
    (errMsg) => {
      actionBtn.disabled = false;
      actionBtn.classList.remove('btn-disabled');
      document.getElementById('message').innerText = errMsg;
    }
  );
}

// ── 登出 ─────────────────────────────────────────────────────

function logout() {
  localStorage.removeItem('planit_user');
  currentUser = ""; allTasksData = []; selectedDateFilter = null;
  document.getElementById('dashboard-view').classList.replace('view-active', 'view-hidden');
  document.getElementById('login-view').classList.replace('view-hidden', 'view-active');
  document.getElementById('account').value  = '';
  document.getElementById('password').value = '';
  document.getElementById('email').value    = '';
  document.getElementById('message').innerText = '';
  initGoogleAuth();
}

// ── 忘記密碼 ─────────────────────────────────────────────────

function openForgotPasswordModal() {
  openModal('forgot-modal');
  document.getElementById('forgot-email-input').value = "";
}
function closeForgotPasswordModal() { closeModal('forgot-modal'); }

function submitForgotPassword() {
  const email = document.getElementById('forgot-email-input').value.trim();
  if (!email) { alert("請填寫註冊信箱！"); return; }

  const btn = document.getElementById('forgot-submit-btn');
  btn.innerText = "發送中..."; btn.disabled = true;

  callGASAPI({ action: 'forgotPassword', email: email }, (res) => {
    btn.innerText = "發送臨時密碼"; btn.disabled = false;
    alert(res.msg || "信件已發送");
    if (res.success) closeForgotPasswordModal();
  }, (err) => {
    btn.innerText = "發送臨時密碼"; btn.disabled = false;
    alert(err);
  });
}
