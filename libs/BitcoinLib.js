// ============================================================
// BitcoinLib.js — HD Wallet + Blockchain Verification
// BBDemoStoreBot2026 | Bots.Business
// ============================================================
// لا يحتاج CoinPayments أو أي وسيط مدفوع
// يستخدم:
//   - CryptoJS (مدمج في BB) للعمليات الرياضية
//   - secp256k1 مكتوبة يدوياً في JS
//   - blockstream.info API للتحقق (مجاني)
// ============================================================

libPrefix = "BTC_";

// ─── secp256k1 Constants ─────────────────────────────────────
var _P  = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F");
var _N  = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
var _Gx = BigInt("0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798");
var _Gy = BigInt("0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8");

// ─── BigInt Modular Inverse ───────────────────────────────────
function _modinv(a, m) {
  var [old_r, r] = [a, m];
  var [old_s, s] = [BigInt(1), BigInt(0)];
  while (r !== BigInt(0)) {
    var q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return ((old_s % m) + m) % m;
}

// ─── secp256k1 Point Operations ──────────────────────────────
function _pointAdd(P1, P2) {
  if (P1 === null) return P2;
  if (P2 === null) return P1;
  var x1=P1[0], y1=P1[1], x2=P2[0], y2=P2[1];
  var lam;
  if (x1 === x2) {
    if (y1 !== y2) return null;
    lam = (BigInt(3) * x1 * x1 * _modinv(BigInt(2) * y1, _P)) % _P;
  } else {
    lam = ((y2 - y1) * _modinv(x2 - x1, _P)) % _P;
  }
  lam = ((lam % _P) + _P) % _P;
  var x3 = ((lam * lam - x1 - x2) % _P + _P) % _P;
  var y3 = ((lam * (x1 - x3) - y1) % _P + _P) % _P;
  return [x3, y3];
}

function _pointMul(k, pt) {
  var result = null;
  var addend = pt;
  while (k > BigInt(0)) {
    if (k & BigInt(1)) result = _pointAdd(result, addend);
    addend = _pointAdd(addend, addend);
    k >>= BigInt(1);
  }
  return result;
}

function _decompress(bytes) {
  // bytes: Array of ints [prefix, x0..x31]
  var x = BigInt(0);
  for (var i = 1; i < 33; i++) x = (x << BigInt(8)) | BigInt(bytes[i]);
  var y2 = ((x*x*x + BigInt(7)) % _P + _P) % _P;
  var y  = _modpow(y2, (_P + BigInt(1)) / BigInt(4), _P);
  if ((Number(y & BigInt(1))) !== (bytes[0] & 1)) y = _P - y;
  return [x, y];
}

function _modpow(base, exp, mod) {
  var result = BigInt(1);
  base = base % mod;
  while (exp > BigInt(0)) {
    if (exp & BigInt(1)) result = (result * base) % mod;
    exp >>= BigInt(1);
    base = (base * base) % mod;
  }
  return result;
}

function _compress(pt) {
  var x = pt[0], y = pt[1];
  var prefix = (y & BigInt(1)) === BigInt(0) ? 2 : 3;
  var xBytes = _bigIntToBytes32(x);
  return [prefix].concat(xBytes);
}

// ─── Byte Utilities ──────────────────────────────────────────
function _bigIntToBytes32(n) {
  var hex = n.toString(16).padStart(64, '0');
  var result = [];
  for (var i = 0; i < 64; i += 2) result.push(parseInt(hex.substr(i, 2), 16));
  return result;
}

function _hexToBytes(hex) {
  var result = [];
  for (var i = 0; i < hex.length; i += 2) result.push(parseInt(hex.substr(i, 2), 16));
  return result;
}

function _bytesToHex(bytes) {
  return bytes.map(function(b) { return ('0' + b.toString(16)).slice(-2); }).join('');
}

function _bytesToBigInt(bytes) {
  var n = BigInt(0);
  for (var i = 0; i < bytes.length; i++) n = (n << BigInt(8)) | BigInt(bytes[i]);
  return n;
}

// ─── SHA256 via CryptoJS ──────────────────────────────────────
function _sha256Bytes(bytes) {
  var hex   = _bytesToHex(bytes);
  var wa    = CryptoJS.enc.Hex.parse(hex);
  var hash  = CryptoJS.SHA256(wa);
  return _hexToBytes(hash.toString(CryptoJS.enc.Hex));
}

function _sha256d(bytes) { return _sha256Bytes(_sha256Bytes(bytes)); }

// ─── RIPEMD160 via CryptoJS ───────────────────────────────────
function _ripemd160(bytes) {
  var hex  = _bytesToHex(bytes);
  var wa   = CryptoJS.enc.Hex.parse(hex);
  var hash = CryptoJS.RIPEMD160(wa);
  return _hexToBytes(hash.toString(CryptoJS.enc.Hex));
}

// ─── HMAC-SHA512 via CryptoJS ────────────────────────────────
function _hmac512(keyBytes, dataBytes) {
  var keyHex  = _bytesToHex(keyBytes);
  var dataHex = _bytesToHex(dataBytes);
  var key  = CryptoJS.enc.Hex.parse(keyHex);
  var data = CryptoJS.enc.Hex.parse(dataHex);
  var hash = CryptoJS.HmacSHA512(data, key);
  return _hexToBytes(hash.toString(CryptoJS.enc.Hex));
}

// ─── Base58Check ─────────────────────────────────────────────
var _B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function _base58Encode(bytes) {
  var count = 0;
  for (var i = 0; i < bytes.length; i++) { if (bytes[i] === 0) count++; else break; }
  var num = BigInt(0);
  for (var i = 0; i < bytes.length; i++) num = (num << BigInt(8)) | BigInt(bytes[i]);
  var result = '';
  while (num > BigInt(0)) {
    var rem = Number(num % BigInt(58));
    num = num / BigInt(58);
    result = _B58[rem] + result;
  }
  return '1'.repeat(count) + result;
}

function _base58Check(bytes) {
  var checksum = _sha256d(bytes).slice(0, 4);
  return _base58Encode(bytes.concat(checksum));
}

function _base58Decode(str) {
  var num = BigInt(0);
  for (var i = 0; i < str.length; i++) {
    num = num * BigInt(58) + BigInt(_B58.indexOf(str[i]));
  }
  var bytes = [];
  for (var i = 0; i < 82; i++) { bytes.unshift(Number(num & BigInt(255))); num >>= BigInt(8); }
  return bytes;
}

// ─── Parse xpub ──────────────────────────────────────────────
function _parseXpub(xpub) {
  var raw = _base58Decode(xpub);   // 82 bytes: 78 payload + 4 checksum
  var chaincode = raw.slice(13, 45);  // 32 bytes
  var pubkey    = raw.slice(45, 78);  // 33 bytes
  return { pub: pubkey, chain: chaincode };
}

// ─── BIP32 Child Derivation (public only) ────────────────────
function _deriveChild(pub, chain, index) {
  // index must be < 0x80000000 (non-hardened)
  var indexBytes = [
    (index >>> 24) & 0xFF,
    (index >>> 16) & 0xFF,
    (index >>>  8) & 0xFF,
    (index >>>  0) & 0xFF
  ];
  var data = pub.concat(indexBytes);
  var I    = _hmac512(chain, data);
  var IL   = I.slice(0, 32);
  var IR   = I.slice(32, 64);
  var k    = _bytesToBigInt(IL);
  if (k >= _N) return null;
  var parentPt = _decompress(pub);
  var childPt  = _pointAdd(_pointMul(k, [_Gx, _Gy]), parentPt);
  if (childPt === null) return null;
  return { pub: _compress(childPt), chain: IR };
}

// ─── Public Key → BTC Address (P2PKH) ────────────────────────
function _pubToAddress(pub) {
  var sha   = _sha256Bytes(pub);
  var h160  = _ripemd160(sha);
  var versioned = [0x00].concat(h160);
  return _base58Check(versioned);
}

// ─── واجهة API الخارجية (Blockstream) ─────────────────────────
var _BLOCKSTREAM = "https://blockstream.info/api";

// ─── توليد عنوان فريد لكل مستخدم ────────────────────────────
// يأخذ xpub ويشتق العنوان عند index = telegramid mod 100000
function generateAddress(xpub, userId) {
  try {
    var parts = _parseXpub(xpub);
    // استخدام userId كـ index (نأخذ آخر 4 أرقام لأن index < 2^31)
    var index = Math.abs(parseInt(String(userId).slice(-8))) % 2000000;
    var child = _deriveChild(parts.pub, parts.chain, index);
    if (!child) return null;
    var addr = _pubToAddress(child.pub);
    return { address: addr, index: index };
  } catch(e) {
    return null;
  }
}

// ─── التحقق من معاملة ────────────────────────────────────────
function checkPayment(options) {
  // options: { address, expectedBTC, onPaid, onPending, onNotFound, payment_id }
  var url = _BLOCKSTREAM + "/address/" + options.address;
  HTTP.get({
    url: url,
    success: libPrefix + "onAddrInfo " + JSON.stringify({
      expectedBTC: options.expectedBTC,
      address:     options.address,
      onPaid:      options.onPaid,
      onPending:   options.onPending,
      onNotFound:  options.onNotFound,
      payment_id:  options.payment_id || ""
    })
  });
}

// ─── معالج استجابة التحقق ────────────────────────────────────
function _onAddrInfo() {
  var meta = {};
  try { meta = JSON.parse(options.success_data); } catch(e) { return; }

  var body = {};
  try { body = JSON.parse(request.body); } catch(e) {
    if (meta.onNotFound) Bot.runCommand(meta.onNotFound);
    return;
  }

  var confirmed = parseInt((body.chain_stats   || {}).funded_txo_sum  || 0);
  var pending   = parseInt((body.mempool_stats || {}).funded_txo_sum  || 0);
  var spent     = parseInt((body.chain_stats   || {}).spent_txo_sum   || 0);

  var netSat    = confirmed - spent;
  var netBTC    = netSat / 100000000;
  var pendBTC   = pending / 100000000;

  options.result = {
    address:         meta.address,
    confirmed_sat:   confirmed,
    pending_sat:     pending,
    net_btc:         netBTC,
    pending_btc:     pendBTC,
    payment_id:      meta.payment_id,
    expected_btc:    meta.expectedBTC
  };

  var expected = parseFloat(meta.expectedBTC || 0);

  if (netBTC >= expected - 0.000000001 && expected > 0) {
    if (meta.onPaid)    Bot.runCommand(meta.onPaid);
  } else if (pendBTC > 0) {
    if (meta.onPending) Bot.runCommand(meta.onPending);
  } else {
    if (meta.onNotFound) Bot.runCommand(meta.onNotFound);
  }
}

// ─── جلب تاريخ معاملات العنوان ───────────────────────────────
function getTxHistory(address, onSuccess) {
  HTTP.get({
    url: _BLOCKSTREAM + "/address/" + address + "/txs",
    success: libPrefix + "onTxHistory " + onSuccess
  });
}

function _onTxHistory() {
  var cmd = options.success_data;
  var txs = [];
  try { txs = JSON.parse(request.body); } catch(e) {}
  options.result = { txs: txs };
  if (cmd) Bot.runCommand(cmd);
}

// ─── جلب UTXOs ───────────────────────────────────────────────
function getUTXOs(address, onSuccess) {
  HTTP.get({
    url: _BLOCKSTREAM + "/address/" + address + "/utxo",
    success: libPrefix + "onUTXO " + onSuccess
  });
}

function _onUTXO() {
  var cmd = options.success_data;
  var utxos = [];
  try { utxos = JSON.parse(request.body); } catch(e) {}
  var totalSat = 0;
  for (var i = 0; i < utxos.length; i++) totalSat += (utxos[i].value || 0);
  options.result = { utxos: utxos, total_btc: totalSat / 100000000 };
  if (cmd) Bot.runCommand(cmd);
}

// ─── نشر ─────────────────────────────────────────────────────
publish({
  generateAddress: generateAddress,
  checkPayment:    checkPayment,
  getTxHistory:    getTxHistory,
  getUTXOs:        getUTXOs
});

on(libPrefix + "onAddrInfo",  _onAddrInfo);
on(libPrefix + "onTxHistory", _onTxHistory);
on(libPrefix + "onUTXO",      _onUTXO);
