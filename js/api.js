/* ============================================================
   js/api.js — GAS 通訊層
   唯一職責：封裝所有對 Google Apps Script 的 fetch 請求
   ============================================================ */

/**
 * 呼叫 Google Apps Script Web App API
 * @param {Object} payload  - 要傳送的 JSON Payload
 * @param {Function} callback  - 成功回調 (data) => {}
 * @param {Function} onError   - 失敗回調 (errorMsg) => {}
 */
function callGASAPI(payload, callback, onError) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  fetch(GAS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    signal: controller.signal
  })
  .then(res => {
    clearTimeout(timeoutId);
    return res.json();
  })
  .then(data => {
    if (callback) callback(data);
  })
  .catch(err => {
    clearTimeout(timeoutId);
    console.error("API 連線異常:", err);
    const errorMsg = err.name === 'AbortError'
      ? "連線逾時，請檢查網路或 GAS 權限"
      : "無法連線至雲端服務";
    if (onError) onError(errorMsg);
  });
}
