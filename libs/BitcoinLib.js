// ============================================================
// BitcoinLib.js — HD Wallet + Blockchain Verification
// BBDemoStoreBot2026 | Bots.Business (Duktape compatible)
// ============================================================
// ✅ لا BigInt — يعمل على أي JS engine
// ✅ secp256k1 كاملة بـ 32-bit safe integers
// ✅ BIP32 HD Wallet (xpub derivation)
// ✅ blockstream.info للتحقق من الشبكة
// ============================================================

libPrefix = "BTC_";

// ═══════════════════════════════════════════════════════════
// 256-bit Arithmetic — قائمة من 8 أرقام 32-bit (big-endian)
// ═══════════════════════════════════════════════════════════

// secp256k1 constants كـ hex strings (نحوّلها عند الحاجة)
var _HEX_P  = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F";
var _HEX_N  = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141";
var _HEX_GX = "79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798";
var _HEX_GY = "483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8";

// ─── Byte Array Utilities ────────────────────────────────────
function _hexToBytes(hex) {
  hex = hex.toUpperCase();
  var r = [];
  for (var i = 0; i < hex.length; i += 2)
    r.push(parseInt(hex.substr(i, 2), 16));
  return r;
}

function _bytesToHex(b) {
  var r = "";
  for (var i = 0; i < b.length; i++)
    r += ("0" + b[i].toString(16)).slice(-2);
  return r.toUpperCase();
}

function _int32ToBytes(n) {
  return [(n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF];
}

// ─── 256-bit Integer = array of 8 uint32 (big-endian) ───────
// نمثّل الأعداد كـ arrays من 8 أرقام 32-bit
// كل رقم في النطاق [0, 0xFFFFFFFF]

function _fromHex256(hex) {
  hex = hex.replace(/^0x/i, "").toUpperCase();
  while (hex.length < 64) hex = "0" + hex;
  var w = [];
  for (var i = 0; i < 8; i++)
    w.push(parseInt(hex.substr(i * 8, 8), 16) >>> 0);
  return w;
}

function _toHex256(w) {
  var r = "";
  for (var i = 0; i < 8; i++)
    r += ("00000000" + (w[i] >>> 0).toString(16)).slice(-8);
  return r.toUpperCase();
}

function _zero256()  { return [0,0,0,0,0,0,0,0]; }
function _one256()   { return [0,0,0,0,0,0,0,1]; }
function _copy256(a) { return a.slice(); }

function _cmp256(a, b) {
  for (var i = 0; i < 8; i++) {
    if ((a[i] >>> 0) < (b[i] >>> 0)) return -1;
    if ((a[i] >>> 0) > (b[i] >>> 0)) return  1;
  }
  return 0;
}

function _isZero256(a) {
  for (var i = 0; i < 8; i++) if (a[i] !== 0) return false;
  return true;
}

// ─── إضافة 256-bit ───────────────────────────────────────────
function _add256(a, b) {
  var r = [0,0,0,0,0,0,0,0];
  var carry = 0;
  for (var i = 7; i >= 0; i--) {
    var s = (a[i] >>> 0) + (b[i] >>> 0) + carry;
    r[i] = s >>> 0;
    carry = Math.floor(s / 0x100000000);
  }
  return r;  // نُهمل الـ overflow (carry)
}

// ─── طرح 256-bit (a >= b مضمون) ─────────────────────────────
function _sub256(a, b) {
  var r = [0,0,0,0,0,0,0,0];
  var borrow = 0;
  for (var i = 7; i >= 0; i--) {
    var d = (a[i] >>> 0) - (b[i] >>> 0) - borrow;
    if (d < 0) { d += 0x100000000; borrow = 1; } else { borrow = 0; }
    r[i] = d >>> 0;
  }
  return r;
}

// ─── ضرب 256-bit × 256-bit mod P ────────────────────────────
// نستخدم خوارزمية المضاعفة التدريجية (double-and-add على المستوى البيتي)
// لكن أسرع: نكسر كل عدد إلى 32-bit chunks وتجميع النتائج

function _mulmod(a, b, m) {
  // double-and-add: O(256) iterations, كل منها O(1) عملية 256-bit
  var result = _zero256();
  var addend = _copy256(a);
  // reduce addend mod m أولاً
  while (_cmp256(addend, m) >= 0) addend = _sub256(addend, m);

  var bCopy = _copy256(b);
  // نأخذ bits من bCopy من الـ LSB
  for (var bit = 0; bit < 256; bit++) {
    // هل bit الـ LSB مضبوط؟
    if (bCopy[7] & 1) {
      result = _add256(result, addend);
      if (_cmp256(result, m) >= 0) result = _sub256(result, m);
    }
    // shift bCopy right 1 bit
    var carry = 0;
    for (var i = 0; i < 8; i++) {
      var newCarry = bCopy[i] & 1;
      bCopy[i] = (bCopy[i] >>> 1) | (carry << 31);
      carry = newCarry;
    }
    // double addend
    addend = _add256(addend, addend);
    if (_cmp256(addend, m) >= 0) addend = _sub256(addend, m);
  }
  return result;
}

// ─── Modular Inverse عبر Fermat: a^(p-2) mod p ──────────────
function _invmod(a, m) {
  // exp = m - 2
  var exp = _sub256(m, [0,0,0,0,0,0,0,2]);
  return _powmod(a, exp, m);
}

function _powmod(base, exp, m) {
  var result = _one256();
  var b = _copy256(base);
  while (_cmp256(exp, _zero256()) > 0) {
    if (exp[7] & 1) {
      result = _mulmod(result, b, m);
    }
    b = _mulmod(b, b, m);
    // shift exp right 1 bit
    var carry = 0;
    for (var i = 0; i < 8; i++) {
      var nc = exp[i] & 1;
      exp[i] = (exp[i] >>> 1) | (carry << 31);
      carry = nc;
    }
  }
  return result;
}

// ─── secp256k1 Constants ─────────────────────────────────────
var _P  = _fromHex256(_HEX_P);
var _N  = _fromHex256(_HEX_N);
var _Gx = _fromHex256(_HEX_GX);
var _Gy = _fromHex256(_HEX_GY);

// ─── secp256k1 Point Operations ──────────────────────────────
function _pointAdd(P1, P2) {
  if (P1 === null) return P2;
  if (P2 === null) return P1;
  var x1=P1[0], y1=P1[1], x2=P2[0], y2=P2[1];
  var lam;
  if (_cmp256(x1,x2) === 0) {
    if (_cmp256(y1,y2) !== 0) return null;
    // lam = 3x^2 / 2y mod P
    var x1sq = _mulmod(x1, x1, _P);
    var num  = _mulmod(_fromHex256("3"), x1sq, _P);
    var den  = _mulmod(_fromHex256("2"), y1, _P);
    lam = _mulmod(num, _invmod(den, _P), _P);
  } else {
    // lam = (y2-y1)/(x2-x1) mod P
    var dy = _cmp256(y2,y1)>=0 ? _sub256(y2,y1) : _sub256(_add256(y2,_P),y1);
    while (_cmp256(dy,_P)>=0) dy=_sub256(dy,_P);
    var dx = _cmp256(x2,x1)>=0 ? _sub256(x2,x1) : _sub256(_add256(x2,_P),x1);
    while (_cmp256(dx,_P)>=0) dx=_sub256(dx,_P);
    lam = _mulmod(dy, _invmod(dx, _P), _P);
  }
  // x3 = lam^2 - x1 - x2 mod P
  var lam2 = _mulmod(lam, lam, _P);
  var x3 = _sub256(lam2, x1);
  while (_cmp256(x3, _zero256()) < 0) x3 = _add256(x3, _P);
  x3 = _sub256(x3, x2);
  while (_cmp256(x3, _zero256()) < 0) x3 = _add256(x3, _P);
  while (_cmp256(x3, _P) >= 0) x3 = _sub256(x3, _P);
  // y3 = lam*(x1-x3) - y1 mod P
  var dx1x3 = _cmp256(x1,x3)>=0 ? _sub256(x1,x3) : _add256(_sub256(x1,x3), _P);
  while (_cmp256(dx1x3,_P)>=0) dx1x3=_sub256(dx1x3,_P);
  var y3 = _mulmod(lam, dx1x3, _P);
  y3 = _cmp256(y3,y1)>=0 ? _sub256(y3,y1) : _add256(_sub256(y3,y1),_P);
  while (_cmp256(y3,_P)>=0) y3=_sub256(y3,_P);
  return [x3, y3];
}

function _pointMul(k, pt) {
  var result = null;
  var addend = [_copy256(pt[0]), _copy256(pt[1])];
  var kCopy  = _copy256(k);
  for (var bit = 0; bit < 256; bit++) {
    if (kCopy[7] & 1) result = _pointAdd(result, addend);
    addend = _pointAdd(addend, addend);
    var carry = 0;
    for (var i = 0; i < 8; i++) {
      var nc = kCopy[i] & 1;
      kCopy[i] = (kCopy[i] >>> 1) | (carry << 31);
      carry = nc;
    }
  }
  return result;
}

function _decompress(byteArr) {
  // byteArr: [prefix(1), x(32)] = 33 bytes
  var xHex = _bytesToHex(byteArr.slice(1, 33));
  var x = _fromHex256(xHex);
  // y^2 = x^3 + 7 mod P
  var x2  = _mulmod(x, x, _P);
  var x3  = _mulmod(x2, x, _P);
  var y2  = _add256(x3, _fromHex256("7"));
  while (_cmp256(y2,_P)>=0) y2=_sub256(y2,_P);
  // y = y2^((P+1)/4) mod P  [P ≡ 3 mod 4]
  var exp = _add256(_P, _one256());
  // divide by 4: shift right 2
  for (var s = 0; s < 2; s++) {
    var carry = 0;
    for (var i = 0; i < 8; i++) {
      var nc = exp[i] & 1;
      exp[i] = (exp[i] >>> 1) | (carry << 31);
      carry = nc;
    }
  }
  var y = _powmod(y2, exp, _P);
  // check parity
  if ((y[7] & 1) !== (byteArr[0] & 1))
    y = _sub256(_P, y);
  return [x, y];
}

function _compress(pt) {
  var x = pt[0], y = pt[1];
  var prefix = (y[7] & 1) === 0 ? 0x02 : 0x03;
  var xBytes = _hexToBytes(_toHex256(x));
  return [prefix].concat(xBytes);
}

// ─── CryptoJS Wrappers ───────────────────────────────────────
function _sha256b(byteArr) {
  var wa   = CryptoJS.enc.Hex.parse(_bytesToHex(byteArr));
  var hash = CryptoJS.SHA256(wa);
  return _hexToBytes(hash.toString(CryptoJS.enc.Hex));
}
function _sha256d(b)  { return _sha256b(_sha256b(b)); }
function _ripemd160(byteArr) {
  var wa   = CryptoJS.enc.Hex.parse(_bytesToHex(byteArr));
  var hash = CryptoJS.RIPEMD160(wa);
  return _hexToBytes(hash.toString(CryptoJS.enc.Hex));
}
function _hmac512(keyB, dataB) {
  var key  = CryptoJS.enc.Hex.parse(_bytesToHex(keyB));
  var data = CryptoJS.enc.Hex.parse(_bytesToHex(dataB));
  var hash = CryptoJS.HmacSHA512(data, key);
  return _hexToBytes(hash.toString(CryptoJS.enc.Hex));
}

// ─── Base58Check ─────────────────────────────────────────────
var _B58A = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function _b58enc(byteArr) {
  var count = 0;
  for (var i = 0; i < byteArr.length; i++) {
    if (byteArr[i] === 0) count++; else break;
  }
  // convert byte array to big integer via hex
  var hexStr = _bytesToHex(byteArr);
  // use _fromHex256 style but for variable length
  // represent as array, then do repeated divmod58
  var digits = byteArr.slice(); // copy
  var result = "";
  // long division by 58
  while (digits.length > 0 && !(digits.length === 1 && digits[0] === 0)) {
    var rem = 0;
    var next = [];
    for (var i2 = 0; i2 < digits.length; i2++) {
      var cur = rem * 256 + digits[i2];
      var q   = Math.floor(cur / 58);
      rem     = cur % 58;
      if (next.length > 0 || q > 0) next.push(q);
    }
    result = _B58A[rem] + result;
    digits = next;
  }
  return "1".repeat(count) + result;
}

function _b58chk(byteArr) {
  var cs = _sha256d(byteArr).slice(0, 4);
  return _b58enc(byteArr.concat(cs));
}

function _b58dec(str) {
  // decode to exactly 82 bytes
  var bytes = [];
  for (var i = 0; i < str.length; i++) {
    var c = _B58A.indexOf(str[i]);
    var carry = c;
    for (var j = bytes.length - 1; j >= 0; j--) {
      carry += 58 * bytes[j];
      bytes[j] = carry & 0xFF;
      carry >>= 8;
    }
    while (carry > 0) { bytes.unshift(carry & 0xFF); carry >>= 8; }
  }
  // pad to 82
  while (bytes.length < 82) bytes.unshift(0);
  return bytes;
}

// ─── BIP32 xpub Parsing ──────────────────────────────────────
function _parseXpub(xpub) {
  var raw  = _b58dec(xpub);        // 82 bytes
  var chain = raw.slice(13, 45);   // 32 bytes chaincode
  var pub   = raw.slice(45, 78);   // 33 bytes pubkey
  return { pub: pub, chain: chain };
}

// ─── BIP32 Child Public Key Derivation ───────────────────────
function _deriveChild(pub, chain, index) {
  var idxBytes = _int32ToBytes(index);
  var data     = pub.concat(idxBytes);
  var I        = _hmac512(chain, data);
  var IL       = I.slice(0, 32);
  var IR       = I.slice(32, 64);
  var k        = _fromHex256(_bytesToHex(IL));
  if (_cmp256(k, _N) >= 0) return null;
  var G    = [_copy256(_Gx), _copy256(_Gy)];
  var Kpar = _decompress(pub);
  var Kch  = _pointAdd(_pointMul(k, G), Kpar);
  if (Kch === null) return null;
  return { pub: _compress(Kch), chain: IR };
}

// ─── Public Key → P2PKH Address ──────────────────────────────
function _pub2addr(pub) {
  var sha  = _sha256b(pub);
  var h160 = _ripemd160(sha);
  var ver  = [0x00].concat(h160);
  return _b58chk(ver);
}

// ══════════════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════════════

function generateAddress(xpub, userId) {
  try {
    var parts = _parseXpub(xpub);
    var index = Math.abs(parseInt(String(userId).slice(-8)) || 0) % 2000000;
    var child = _deriveChild(parts.pub, parts.chain, index);
    if (!child) return null;
    return { address: _pub2addr(child.pub), index: index };
  } catch(e) {
    return null;
  }
}

function checkPayment(opts) {
  // opts: { address, expectedBTC, onPaid, onPending, onNotFound }
  var meta = JSON.stringify({
    expectedBTC: opts.expectedBTC,
    address:     opts.address,
    onPaid:      opts.onPaid      || "",
    onPending:   opts.onPending   || "",
    onNotFound:  opts.onNotFound  || ""
  });
  HTTP.get({
    url:     "https://blockstream.info/api/address/" + opts.address,
    success: libPrefix + "onAddrInfo " + meta
  });
}

function getTxHistory(address, onSuccess) {
  HTTP.get({
    url:     "https://blockstream.info/api/address/" + address + "/txs",
    success: libPrefix + "onTxHist " + onSuccess
  });
}

// ─── Handlers ────────────────────────────────────────────────
function _onAddrInfo() {
  var meta = {};
  try { meta = JSON.parse(options.success_data); } catch(e) { return; }
  var body = {};
  try { body = JSON.parse(request.body); } catch(e) {
    if (meta.onNotFound) { options.result = { address: meta.address }; Bot.runCommand(meta.onNotFound); }
    return;
  }
  var confSat = parseInt((body.chain_stats   || {}).funded_txo_sum || 0);
  var spentSat= parseInt((body.chain_stats   || {}).spent_txo_sum  || 0);
  var pendSat = parseInt((body.mempool_stats || {}).funded_txo_sum || 0);
  var netBTC  = (confSat - spentSat) / 1e8;
  var pendBTC = pendSat / 1e8;
  var expected = parseFloat(meta.expectedBTC || 0);

  options.result = {
    address:      meta.address,
    net_btc:      netBTC,
    pending_btc:  pendBTC,
    expected_btc: expected,
    conf_sat:     confSat
  };

  if (netBTC >= expected - 1e-8 && expected > 0) {
    if (meta.onPaid)    Bot.runCommand(meta.onPaid);
  } else if (pendBTC > 0) {
    if (meta.onPending) Bot.runCommand(meta.onPending);
  } else {
    if (meta.onNotFound) Bot.runCommand(meta.onNotFound);
  }
}

function _onTxHist() {
  var cmd = options.success_data;
  var txs = [];
  try { txs = JSON.parse(request.body); } catch(e) {}
  options.result = { txs: txs };
  if (cmd) Bot.runCommand(cmd);
}

publish({
  generateAddress: generateAddress,
  checkPayment:    checkPayment,
  getTxHistory:    getTxHistory
});

on(libPrefix + "onAddrInfo", _onAddrInfo);
on(libPrefix + "onTxHist",   _onTxHist);
