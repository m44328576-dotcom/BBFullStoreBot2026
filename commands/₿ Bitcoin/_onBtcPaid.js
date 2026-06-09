/*CMD
  command: /onBtcPaid
  help: 
  need_reply: 
  auto_retry_time: 
  folder: ₿ Bitcoin
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid     = user.telegramid;
let result  = options.result;

if (!result) { return; }

let amount    = parseFloat(result.net_btc || result.expected_btc);
let confirmed = result.confirmed_sat;
let raw       = Bot.getProperty("BTC_pending_" + tid);

// منع التسجيل المزدوج
let paidKey = "BTC_paid_" + result.address;
if (Bot.getProperty(paidKey) === "1") {
  Bot.sendMessage("ℹ️ هذه الدفعة سبق تسجيلها.\n💰 رصيدك: `" + Libs.WalletLib.getBalance(String(tid)).toFixed(8) + " BTC`");
  return;
}
Bot.setProperty(paidKey, "1", "string");

// حذف الطلب المعلّق
Bot.setProperty("BTC_pending_" + tid, "", "string");

// ── تحديث المحفظة ────────────────────────────────────────────
Libs.WalletLib.addBalance(String(tid), amount);
Libs.WalletLib.addTx(String(tid), {
  type:    "deposit",
  amount:  amount,
  note:    "دفع BTC مباشر — " + result.address,
  address: result.address
});

// ── سجل الشحن التقليدي ───────────────────────────────────────
let histRaw = User.getProperty("tx_history");
let hist = [];
try { if (histRaw) hist = JSON.parse(histRaw); } catch(e) {}
let now = Libs.WalletLib.now();
hist.push({ amount: amount, type: "btc_direct", date: now, address: result.address });
if (hist.length > 50) hist = hist.slice(-50);
User.setProperty("tx_history", JSON.stringify(hist), "string");

// ── نقاط ─────────────────────────────────────────────────────
let pts = Libs.PointsLib.calcDepositPoints(amount);
if (pts > 0) Libs.PointsLib.addPoints(String(tid), pts, "deposit");

// ── عمولات الإحالة ────────────────────────────────────────────
let commissions = Libs.ReferralLib.distributeCommission(String(tid), amount);
commissions.forEach(function(c) {
  Libs.WalletLib.addBalance(c.id, c.amount);
  Libs.WalletLib.addTx(c.id, {
    type: "commission_l" + c.level,
    amount: c.amount,
    note: "عمولة L" + c.level + " من " + tid
  });
  try {
    Bot.sendMessageTo(c.id,
      "💸 *عمولة إحالة L" + c.level + "*\n" +
      "`+" + c.amount.toFixed(8) + " BTC`\n" +
      "👤 من: `" + tid + "`"
    );
  } catch(e) {}
});

// ── رسالة التأكيد ─────────────────────────────────────────────
let newBal   = Libs.WalletLib.getBalance(String(tid));
let btcPrice = parseFloat(Bot.getProperty("btc_price_usd") || 65000);
let usd      = (amount * btcPrice).toFixed(2);

let msg = "✅ *تم تأكيد الدفع على الشبكة!*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "💰 *مستلم:* `+" + amount.toFixed(8) + " BTC`\n";
msg += "   ≈ `$" + usd + "`\n";
msg += "⛓ *تأكيدات:* " + Math.floor(confirmed / 100000000 * 100000000) + " sat\n\n";
if (pts > 0) msg += "⭐ *نقاط مكتسبة:* `+" + pts + "`\n\n";
msg += "📊 *رصيدك الآن:* `" + newBal.toFixed(8) + " BTC`\n";
msg += "📅 " + now;
Bot.sendMessage(msg);
