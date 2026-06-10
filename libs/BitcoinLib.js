// ============================================================
// BitcoinLib.js — Bitcoin Payment System (Duktape safe)
// BBDemoStoreBot2026 | Bots.Business
// ============================================================
// النهج: Address Pool
// - العناوين تُولَّد مسبقاً خارج BB بـ Python/Node
// - تُحمَّل في البوت عبر /setup_btc_pool
// - كل مستخدم يحصل على عنوان فريد من الـ pool
// - التحقق مباشرة من blockstream.info
// ============================================================

libPrefix = "BTC_";

// ─── Pool Management ─────────────────────────────────────────

// إسناد عنوان من الـ pool للمستخدم
function assignAddress(userId) {
  userId = String(userId);

  // هل لدى المستخدم عنوان بالفعل؟
  var existing = Bot.getProperty(libPrefix + "addr_" + userId);
  if (existing) return { address: existing, isNew: false };

  // جلب الـ pool counter
  var nextIdx = parseInt(Bot.getProperty(libPrefix + "pool_next") || "0");
  var poolSize = parseInt(Bot.getProperty(libPrefix + "pool_size") || "0");

  if (poolSize === 0 || nextIdx >= poolSize) {
    return null; // الـ pool فارغ
  }

  // جلب العنوان
  var address = Bot.getProperty(libPrefix + "pool_" + nextIdx);
  if (!address) return null;

  // إسناد وتقديم الـ counter
  Bot.setProperty(libPrefix + "addr_" + userId,  address,        "string");
  Bot.setProperty(libPrefix + "idx_"  + userId,  String(nextIdx),"string");
  Bot.setProperty(libPrefix + "pool_next", String(nextIdx + 1),  "string");

  return { address: address, index: nextIdx, isNew: true };
}

// عرض عنوان المستخدم (بدون إسناد جديد)
function getAddress(userId) {
  userId = String(userId);
  return Bot.getProperty(libPrefix + "addr_" + userId) || null;
}

// إحصاء الـ pool
function getPoolStats() {
  var total = parseInt(Bot.getProperty(libPrefix + "pool_size") || "0");
  var used  = parseInt(Bot.getProperty(libPrefix + "pool_next") || "0");
  return { total: total, used: used, remaining: total - used };
}

// تحميل الـ pool — يُستدعى من /setup_btc_pool
// يستقبل JSON: {"addresses":["addr1","addr2",...]}
function loadPool(addressesJson) {
  var addresses;
  try { addresses = JSON.parse(addressesJson); } catch(e) { return false; }
  if (!Array.isArray(addresses) || addresses.length === 0) return false;

  var start = parseInt(Bot.getProperty(libPrefix + "pool_size") || "0");
  for (var i = 0; i < addresses.length; i++) {
    Bot.setProperty(libPrefix + "pool_" + (start + i), addresses[i], "string");
  }
  Bot.setProperty(libPrefix + "pool_size", String(start + addresses.length), "string");
  return addresses.length;
}

// ─── Blockchain Verification (blockstream.info) ──────────────

function checkPayment(opts) {
  // opts: { address, expectedBTC, onPaid, onPending, onNotFound }
  var meta = JSON.stringify({
    exp:       opts.expectedBTC || 0,
    addr:      opts.address,
    onPaid:    opts.onPaid     || "",
    onPending: opts.onPending  || "",
    onNone:    opts.onNotFound || ""
  });

  HTTP.get({
    url:     "https://blockstream.info/api/address/" + opts.address,
    success: libPrefix + "onChk " + meta,
    error:   libPrefix + "onChkErr " + meta
  });
}

function _onChk() {
  var meta = {};
  try { meta = JSON.parse(options.success_data); } catch(e) { return; }

  var body = {};
  try { body = JSON.parse(request.body); } catch(e) {
    if (meta.onNone) { options.result = { address: meta.addr, net_btc: 0, pending_btc: 0 }; Bot.runCommand(meta.onNone); }
    return;
  }

  var cs = body.chain_stats   || {};
  var ms = body.mempool_stats || {};

  var confSat  = parseInt(cs.funded_txo_sum || 0);
  var spentSat = parseInt(cs.spent_txo_sum  || 0);
  var pendSat  = parseInt(ms.funded_txo_sum || 0);

  var netBTC  = (confSat - spentSat) / 100000000;
  var pendBTC = pendSat  / 100000000;
  var exp     = parseFloat(meta.exp || 0);

  options.result = {
    address:     meta.addr,
    net_btc:     netBTC,
    pending_btc: pendBTC,
    expected_btc: exp,
    conf_sat:    confSat - spentSat
  };

  if (exp > 0 && netBTC >= exp - 0.000000009) {
    if (meta.onPaid)    Bot.runCommand(meta.onPaid);
  } else if (pendBTC > 0) {
    if (meta.onPending) Bot.runCommand(meta.onPending);
  } else {
    if (meta.onNone)    Bot.runCommand(meta.onNone);
  }
}

function _onChkErr() {
  var meta = {};
  try { meta = JSON.parse(options.success_data); } catch(e) { return; }
  options.result = { address: meta.addr, net_btc: 0, pending_btc: 0, error: true };
  if (meta.onNone) Bot.runCommand(meta.onNone);
}

// ─── Get TX List ─────────────────────────────────────────────
function getTxHistory(address, onSuccess) {
  HTTP.get({
    url:     "https://blockstream.info/api/address/" + address + "/txs",
    success: libPrefix + "onTxHist " + onSuccess
  });
}

function _onTxHist() {
  var cmd = options.success_data || "";
  var txs = [];
  try { txs = JSON.parse(request.body); } catch(e) {}
  options.result = { txs: txs, count: txs.length };
  if (cmd) Bot.runCommand(cmd);
}

// ─── Publish ─────────────────────────────────────────────────
publish({
  assignAddress: assignAddress,
  getAddress:    getAddress,
  getPoolStats:  getPoolStats,
  loadPool:      loadPool,
  checkPayment:  checkPayment,
  getTxHistory:  getTxHistory
});

on(libPrefix + "onChk",     _onChk);
on(libPrefix + "onChkErr",  _onChkErr);
on(libPrefix + "onTxHist",  _onTxHist);
