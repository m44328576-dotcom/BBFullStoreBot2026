// ============================================================
// PointsLib.js — نظام النقاط والمكافآت
// BBDemoStoreBot2026 | Bots.Business
// ============================================================

libPrefix = "PL_";

// ─── إعدادات قابلة للتخصيص من /setup ────────────────────────
function _cfg(key, def) {
  let v = Bot.getProperty("pts_" + key);
  return (v !== null && v !== undefined && v !== "") ? parseFloat(v) : def;
}
function pointsPerBTC()    { return _cfg("per_btc",    1000); }  // 1000 نقطة لكل BTC مشحون
function pointsPerRef()    { return _cfg("per_ref",    500);  }  // 500 نقطة لكل إحالة
function pointsPerSend()   { return _cfg("per_send",   10);   }  // 10 نقاط لكل إرسال
function satoshiPerPoint() { return _cfg("satoshi_pt", 10);   }  // ساتوشي لكل نقطة عند الاستبدال
function minRedeem()       { return Math.floor(_cfg("min_redeem", 100)); }

// ─── مفاتيح Storage ──────────────────────────────────────────
function _k(tid, s) { return libPrefix + "u" + tid + "_" + s; }

// ─── قراءة ───────────────────────────────────────────────────
function getPoints(tid) {
  return Math.floor(parseFloat(Bot.getProperty(_k(tid, "pts")) || 0));
}
function getTotalEarned(tid) {
  return Math.floor(parseFloat(Bot.getProperty(_k(tid, "earned")) || 0));
}
function getTotalRedeemed(tid) {
  return Math.floor(parseFloat(Bot.getProperty(_k(tid, "redeemed")) || 0));
}
function getLog(tid) {
  let raw = Bot.getProperty(_k(tid, "log"));
  try { return raw ? JSON.parse(raw) : []; } catch(e) { return []; }
}

// ─── إضافة نقاط ──────────────────────────────────────────────
function addPoints(tid, pts, reason) {
  pts = Math.floor(pts);
  if (pts <= 0) { return getPoints(tid); }
  let cur  = getPoints(tid);
  let earn = getTotalEarned(tid);
  Bot.setProperty(_k(tid, "pts"),    cur  + pts, "integer");
  Bot.setProperty(_k(tid, "earned"), earn + pts, "integer");
  _log(tid, pts, reason || "credit");
  return cur + pts;
}

// ─── خصم نقاط ────────────────────────────────────────────────
function deductPoints(tid, pts) {
  pts = Math.floor(pts);
  let cur = getPoints(tid);
  if (cur < pts) { return false; }
  Bot.setProperty(_k(tid, "pts"),      cur - pts, "integer");
  Bot.setProperty(_k(tid, "redeemed"), getTotalRedeemed(tid) + pts, "integer");
  return true;
}

// ─── حساب نقاط الشحن ─────────────────────────────────────────
function calcDepositPoints(btcAmount) {
  return Math.floor(btcAmount * pointsPerBTC());
}

// ─── استبدال النقاط بـ BTC ───────────────────────────────────
function redeemPoints(tid, pts) {
  pts = Math.floor(pts);
  let min = minRedeem();
  if (pts < min) {
    return { ok: false, error: "الحد الأدنى للاستبدال: `" + min + "` نقطة." };
  }
  if (!deductPoints(tid, pts)) {
    return { ok: false, error: "نقاطك غير كافية. لديك: `" + getPoints(tid) + "` نقطة." };
  }
  let satoshi = pts * satoshiPerPoint();
  let btc = parseFloat((satoshi / 100000000).toFixed(8));
  _log(tid, -pts, "redeem");
  return { ok: true, btc: btc, satoshi: satoshi, pts: pts };
}

// ─── سجل داخلي ───────────────────────────────────────────────
function _log(tid, pts, reason) {
  let raw = Bot.getProperty(_k(tid, "log"));
  let log = [];
  try { log = raw ? JSON.parse(raw) : []; } catch(e) { log = []; }
  let d = new Date();
  log.push({
    pts: pts,
    reason: reason,
    date: d.getFullYear() + "/" +
      String(d.getMonth()+1).padStart(2,"0") + "/" +
      String(d.getDate()).padStart(2,"0") + " " +
      String(d.getHours()).padStart(2,"0") + ":" +
      String(d.getMinutes()).padStart(2,"0")
  });
  if (log.length > 60) { log = log.slice(-60); }
  Bot.setProperty(_k(tid, "log"), JSON.stringify(log), "string");
}

// ─── نشر ─────────────────────────────────────────────────────
publish({
  getPoints:         getPoints,
  getTotalEarned:    getTotalEarned,
  getTotalRedeemed:  getTotalRedeemed,
  addPoints:         addPoints,
  deductPoints:      deductPoints,
  calcDepositPoints: calcDepositPoints,
  redeemPoints:      redeemPoints,
  getLog:            getLog,
  pointsPerBTC:      pointsPerBTC,
  pointsPerRef:      pointsPerRef,
  pointsPerSend:     pointsPerSend,
  satoshiPerPoint:   satoshiPerPoint,
  minRedeem:         minRedeem
});
