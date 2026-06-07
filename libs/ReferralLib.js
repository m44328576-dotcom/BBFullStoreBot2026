// ============================================================
// ReferralLib.js — نظام الإحالة والعمولة المتقدم
// BBDemoStoreBot2026 | Bots.Business
// ============================================================
// مستويان: L1 (5%) + L2 (2%) — عمولة مدى الحياة على كل شحن
// مكافأة فورية لكل إحالة جديدة

libPrefix = "RL_";

// ─── إعدادات ─────────────────────────────────────────────────
function _cfg(key, def) {
  let v = Bot.getProperty("ref_" + key);
  return (v !== null && v !== undefined && v !== "") ? parseFloat(v) : def;
}
function commRate_L1()  { return _cfg("comm_l1", 0.05);   }  // 5%
function commRate_L2()  { return _cfg("comm_l2", 0.02);   }  // 2%
function bonusPerRef()  { return _cfg("bonus",   0.0001); }  // 0.0001 BTC مكافأة فورية

// ─── مفاتيح ──────────────────────────────────────────────────
function _k(tid, s) { return libPrefix + "u" + tid + "_" + s; }

function _now() {
  let d = new Date();
  return d.getFullYear() + "/" +
    String(d.getMonth()+1).padStart(2,"0") + "/" +
    String(d.getDate()).padStart(2,"0") + " " +
    String(d.getHours()).padStart(2,"0") + ":" +
    String(d.getMinutes()).padStart(2,"0");
}

// ─── ربط الإحالة ─────────────────────────────────────────────
// referrerId: من أحال | newUserId: المستخدم الجديد
function linkReferral(referrerId, newUserId) {
  referrerId = String(referrerId);
  newUserId  = String(newUserId);

  if (referrerId === newUserId) {
    return { ok: false, error: "لا يمكنك إحالة نفسك." };
  }

  // هل تم ربط هذا المستخدم مسبقاً؟
  let existing = Bot.getProperty(_k(newUserId, "refBy"));
  if (existing) {
    return { ok: false, alreadyLinked: true };
  }

  // احفظ من أحاله
  Bot.setProperty(_k(newUserId, "refBy"), referrerId, "string");

  // أضفه لقائمة L1 للمُحيل
  let l1 = _getList(referrerId, "L1");
  if (l1.indexOf(newUserId) === -1) {
    l1.push(newUserId);
    Bot.setProperty(_k(referrerId, "L1"), JSON.stringify(l1), "string");
  }

  // عداد الإجمالي
  let total = parseInt(Bot.getProperty(_k(referrerId, "total")) || 0);
  Bot.setProperty(_k(referrerId, "total"), total + 1, "integer");

  // L2: من أحال المُحيل؟
  let grandRef = Bot.getProperty(_k(referrerId, "refBy"));
  if (grandRef) {
    let l2 = _getList(grandRef, "L2");
    if (l2.indexOf(newUserId) === -1) {
      l2.push(newUserId);
      Bot.setProperty(_k(grandRef, "L2"), JSON.stringify(l2), "string");
    }
  }

  return { ok: true, grandRef: grandRef || null };
}

// ─── قوائم الإحالات ──────────────────────────────────────────
function _getList(tid, level) {
  let raw = Bot.getProperty(_k(tid, level));
  try { return raw ? JSON.parse(raw) : []; } catch(e) { return []; }
}
function getReferrals_L1(tid)    { return _getList(tid, "L1"); }
function getReferrals_L2(tid)    { return _getList(tid, "L2"); }
function getReferredBy(tid)      { return Bot.getProperty(_k(tid, "refBy")) || null; }
function getTotalReferrals(tid)  { return parseInt(Bot.getProperty(_k(tid, "total")) || 0); }
function getTotalEarned(tid)     { return parseFloat(Bot.getProperty(_k(tid, "earned")) || 0); }
function getPendingComm(tid)     { return parseFloat(Bot.getProperty(_k(tid, "pending")) || 0); }

// ─── إضافة للعمولة المتراكمة ─────────────────────────────────
function _addEarned(tid, amount) {
  let cur = getTotalEarned(tid);
  Bot.setProperty(_k(tid, "earned"), parseFloat((cur + amount).toFixed(8)), "float");
}

// ─── توزيع العمولات عند الشحن ────────────────────────────────
// يُعيد مصفوفة: [{ id, level, amount }, ...]
function distributeCommission(depositerId, depositAmount) {
  depositerId = String(depositerId);
  let result  = [];

  // L1: المُحيل المباشر
  let refL1 = Bot.getProperty(_k(depositerId, "refBy"));
  if (refL1) {
    let c1 = parseFloat((depositAmount * commRate_L1()).toFixed(8));
    if (c1 >= 0.00000001) {
      result.push({ id: refL1, level: 1, amount: c1 });
      _addEarned(refL1, c1);
      _logComm(refL1, c1, 1, depositerId);
    }

    // L2: جد المُحيل
    let refL2 = Bot.getProperty(_k(refL1, "refBy"));
    if (refL2) {
      let c2 = parseFloat((depositAmount * commRate_L2()).toFixed(8));
      if (c2 >= 0.00000001) {
        result.push({ id: refL2, level: 2, amount: c2 });
        _addEarned(refL2, c2);
        _logComm(refL2, c2, 2, depositerId);
      }
    }
  }

  return result;
}

// ─── سجل العمولات ────────────────────────────────────────────
function _logComm(earnerId, amount, level, fromId) {
  let raw = Bot.getProperty(_k(earnerId, "commLog"));
  let log = [];
  try { log = raw ? JSON.parse(raw) : []; } catch(e) { log = []; }
  log.push({ amount: amount, level: level, from: fromId, date: _now() });
  if (log.length > 100) { log = log.slice(-100); }
  Bot.setProperty(_k(earnerId, "commLog"), JSON.stringify(log), "string");
}
function getCommissionLog(tid) {
  let raw = Bot.getProperty(_k(tid, "commLog"));
  try { return raw ? JSON.parse(raw) : []; } catch(e) { return []; }
}

// ─── رمز الإحالة ─────────────────────────────────────────────
function getRefCode(tid) { return "ref" + String(tid); }

// ─── نشر ─────────────────────────────────────────────────────
publish({
  linkReferral:         linkReferral,
  getReferrals_L1:      getReferrals_L1,
  getReferrals_L2:      getReferrals_L2,
  getReferredBy:        getReferredBy,
  getTotalReferrals:    getTotalReferrals,
  getTotalEarned:       getTotalEarned,
  distributeCommission: distributeCommission,
  getReferralBonus:     bonusPerRef,
  getCommissionLog:     getCommissionLog,
  getRefCode:           getRefCode,
  commRate_L1:          commRate_L1,
  commRate_L2:          commRate_L2
});
