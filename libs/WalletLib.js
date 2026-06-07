// ============================================================
// WalletLib.js — نظام المحفظة الإلكترونية الداخلية
// BBDemoStoreBot2026 | Bots.Business
// ============================================================
// ملاحظة: في Bots.Business، Bot.setProperty/getProperty
// تعمل في سياق المستخدم الحالي فقط.
// لتخزين بيانات مستخدم آخر نستخدم مفتاحاً يشمل telegramid.

libPrefix = "WL_";

function _now() {
  let d = new Date();
  return d.getFullYear() + "/" +
    String(d.getMonth() + 1).padStart(2, "0") + "/" +
    String(d.getDate()).padStart(2, "0") + " " +
    String(d.getHours()).padStart(2, "0") + ":" +
    String(d.getMinutes()).padStart(2, "0");
}

// ─── الرصيد ─────────────────────────────────────────────────
// نخزّن رصيد كل مستخدم بمفتاح عالمي يشمل ID
function _balKey(tid) { return libPrefix + "bal_" + tid; }
function _histKey(tid) { return libPrefix + "hist_" + tid; }

function getBalance(tid) {
  return parseFloat(Bot.getProperty(_balKey(tid)) || 0);
}

function setBalance(tid, amount) {
  Bot.setProperty(_balKey(tid), amount, "float");
}

function addBalance(tid, amount) {
  let cur = getBalance(tid);
  let next = parseFloat((cur + amount).toFixed(8));
  setBalance(tid, next);
  return next;
}

function deductBalance(tid, amount) {
  let cur = getBalance(tid);
  if (cur < amount - 0.000000001) { return false; }
  let next = parseFloat((cur - amount).toFixed(8));
  if (next < 0) { next = 0; }
  setBalance(tid, next);
  return true;
}

// ─── سجل المعاملات ───────────────────────────────────────────
function getTxHistory(tid) {
  let raw = Bot.getProperty(_histKey(tid));
  try { return raw ? JSON.parse(raw) : []; } catch(e) { return []; }
}

function addTx(tid, tx) {
  let hist = getTxHistory(tid);
  tx.date = _now();
  hist.push(tx);
  if (hist.length > 100) { hist = hist.slice(-100); }
  Bot.setProperty(_histKey(tid), JSON.stringify(hist), "string");
}

// ─── الإرسال الداخلي ─────────────────────────────────────────
function send(fromId, toId, amount, note) {
  fromId = String(fromId);
  toId   = String(toId);

  if (fromId === toId) {
    return { ok: false, error: "❌ لا يمكنك الإرسال لنفسك." };
  }
  if (isNaN(amount) || amount <= 0) {
    return { ok: false, error: "❌ المبلغ غير صالح." };
  }

  let minSend = parseFloat(Bot.getProperty("min_send_btc") || 0.000001);
  if (amount < minSend) {
    return { ok: false, error: "❌ الحد الأدنى للإرسال: `" + minSend + " BTC`" };
  }

  // رسوم الإرسال (افتراضي 0%)
  let feeRate = parseFloat(Bot.getProperty("send_fee_rate") || 0);
  let feeAmt  = parseFloat((amount * feeRate).toFixed(8));
  let netAmt  = parseFloat((amount - feeAmt).toFixed(8));

  if (!deductBalance(fromId, amount)) {
    return {
      ok: false,
      error: "❌ رصيد غير كافٍ.\nرصيدك: `" + getBalance(fromId).toFixed(8) + " BTC`"
    };
  }

  addBalance(toId, netAmt);

  addTx(fromId, { type: "send",    amount: -amount, fee: feeAmt, to: toId,   note: note || "" });
  addTx(toId,   { type: "receive", amount: netAmt,  fee: 0,      from: fromId, note: note || "" });

  // الرسوم تذهب لحساب المسؤول
  if (feeAmt > 0) {
    let adminId = Bot.getProperty("admin_telegram_id");
    if (adminId) { addBalance(String(adminId), feeAmt); }
  }

  return { ok: true, net: netAmt, fee: feeAmt };
}

// ─── نشر ─────────────────────────────────────────────────────
publish({
  getBalance:    getBalance,
  setBalance:    setBalance,
  addBalance:    addBalance,
  deductBalance: deductBalance,
  getTxHistory:  getTxHistory,
  addTx:         addTx,
  send:          send,
  now:           _now
});
