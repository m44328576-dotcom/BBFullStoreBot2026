/*CMD
  command: /onIncome
  help: 
  need_reply: 
  auto_retry_time: 
  folder: 💰 Permanent Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

let wallet        = options.address;
let currency      = options.currency;
let amount        = parseFloat(options.amount);
let fiat_amount   = options.fiat_amount;
let fiat_currency = options.fiat_coin;
let fee           = options.fee;
let txn_id        = options.txn_id;

if (isNaN(amount) || amount <= 0) {
  Bot.sendMessage("⚠️ إشعار دخل بمبلغ غير صالح.\nTXN: `" + txn_id + "`");
  return;
}

let tid = user.telegramid;

// 1) تحديث المحفظة الإلكترونية
Libs.WalletLib.addBalance(String(tid), amount);
Libs.WalletLib.addTx(String(tid), {
  type:   "deposit",
  amount: amount,
  note:   "شحن دائم — TXN: " + txn_id,
  txn_id: txn_id
});

// 2) سجل الشحن التقليدي
let historyRaw = User.getProperty("tx_history");
let history    = [];
try { if (historyRaw) { history = JSON.parse(historyRaw); } } catch(e) { history = []; }
let now = new Date();
let dateStr = now.getFullYear() + "/" +
  String(now.getMonth()+1).padStart(2,"0") + "/" +
  String(now.getDate()).padStart(2,"0") + " " +
  String(now.getHours()).padStart(2,"0") + ":" +
  String(now.getMinutes()).padStart(2,"0");
history.push({ amount: amount, type: "permanent", date: dateStr, txn_id: txn_id || "N/A", fee: fee });
if (history.length > 50) { history = history.slice(-50); }
User.setProperty("tx_history", JSON.stringify(history), "string");

// 3) نقاط المكافأة
let ptsEarned = Libs.PointsLib.calcDepositPoints(amount);
if (ptsEarned > 0) {
  Libs.PointsLib.addPoints(String(tid), ptsEarned, "deposit");
}

// 4) توزيع عمولات الإحالة
let commissions = Libs.ReferralLib.distributeCommission(String(tid), amount);
commissions.forEach(function(c) {
  Libs.WalletLib.addBalance(c.id, c.amount);
  Libs.WalletLib.addTx(c.id, {
    type:   "commission_l" + c.level,
    amount: c.amount,
    note:   "عمولة L" + c.level + " من شحن " + tid
  });
  try {
    Bot.sendMessageTo(c.id,
      "💸 *عمولة إحالة L" + c.level + "!*\n" +
      "━━━━━━━━━━━━━━\n" +
      "💰 `+" + c.amount.toFixed(8) + " BTC`\n" +
      "👤 من شحن: `" + tid + "`\n" +
      "💳 رصيدك: `" + Libs.WalletLib.getBalance(c.id).toFixed(8) + " BTC`"
    );
  } catch(e) {}
});

// 5) رسالة التأكيد
let newBal   = Libs.WalletLib.getBalance(String(tid));
let btcPrice = parseFloat(Bot.getProperty("btc_price_usd") || 65000);
let usd      = (amount * btcPrice).toFixed(2);

let msg = "💰 *استلمت دفعة على محفظتك الدائمة!*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "📬 `" + wallet + "`\n\n";
msg += "✅ *المبلغ:* `+" + amount.toFixed(8) + " " + currency + "`\n";
msg += "   ≈ `" + fiat_amount + " " + fiat_currency + "` | ≈ `$" + usd + "`\n";
msg += "💸 *الرسوم:* `" + fee + "`\n";
msg += "🔑 *TXN:* `" + txn_id + "`\n\n";
if (ptsEarned > 0) {
  msg += "⭐ *نقاط مكتسبة:* `+" + ptsEarned.toLocaleString() + "`\n\n";
}
msg += "📊 *رصيدك الآن:* `" + newBal.toFixed(8) + " BTC`\n\n";
msg += "📅 " + dateStr;
Bot.sendMessage(msg);
