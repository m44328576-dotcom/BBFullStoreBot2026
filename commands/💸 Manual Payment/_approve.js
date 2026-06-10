/*CMD
  command: /approve
  help: قبول طلب الشحن (للأدمن)
  need_reply: 
  auto_retry_time: 
  folder: 💸 Manual Payment
  answer: 
  keyboard: 
  aliases: 
CMD*/

// الصيغة: /approve [reqId] [مبلغ اختياري للتعديل]
let adminId = Bot.getProperty("admin_telegram_id");
if (String(user.telegramid) !== String(adminId)) {
  Bot.sendMessage("⛔ للأدمن فقط.");
  return;
}

if (!params) {
  Bot.sendMessage("الصيغة: `/approve [reqId] [مبلغ]`\nمثال: `/approve 123456_1234567890 0.001`");
  return;
}

let parts = params.split(" ");
let reqId = parts[0];
let overrideAmount = parts[1] ? parseFloat(parts[1]) : null;

let raw = Bot.getProperty("DEP_req_" + reqId);
if (!raw) {
  Bot.sendMessage("❌ طلب غير موجود: `" + reqId + "`");
  return;
}

let req;
try { req = JSON.parse(raw); } catch(e) {
  Bot.sendMessage("❌ خطأ في بيانات الطلب.");
  return;
}

if (req.status === "approved") {
  Bot.sendMessage("⚠️ هذا الطلب تمت الموافقة عليه مسبقاً.");
  return;
}

let amount = overrideAmount || parseFloat(req.amount);
if (isNaN(amount) || amount <= 0) {
  Bot.sendMessage("❌ مبلغ غير صالح.");
  return;
}

let userId = String(req.userId);

// تحديث الرصيد
Libs.WalletLib.addBalance(userId, amount);
Libs.WalletLib.addTx(userId, {
  type:   "deposit",
  amount: amount,
  note:   "شحن يدوي — أدمن — req:" + reqId
});

// نقاط
let pts = Libs.PointsLib.calcDepositPoints(amount);
if (pts > 0) Libs.PointsLib.addPoints(userId, pts, "deposit");

// عمولات الإحالة
let commissions = Libs.ReferralLib.distributeCommission(userId, amount);
commissions.forEach(function(c) {
  Libs.WalletLib.addBalance(c.id, c.amount);
  Libs.WalletLib.addTx(c.id, {
    type: "commission_l" + c.level,
    amount: c.amount,
    note: "عمولة L" + c.level + " من شحن " + userId
  });
  try {
    Bot.sendMessageTo(c.id,
      "💸 *عمولة إحالة L" + c.level + "*\n`+" + c.amount.toFixed(8) + " BTC`"
    );
  } catch(e) {}
});

// تحديث حالة الطلب
req.status = "approved";
req.approvedAmount = amount;
Bot.setProperty("DEP_req_" + reqId, JSON.stringify(req), "string");

// إشعار المستخدم
let newBal   = Libs.WalletLib.getBalance(userId);
let btcPrice = parseFloat(Bot.getProperty("btc_price_usd") || 65000);
let usd      = (amount * btcPrice).toFixed(2);

try {
  let userMsg = "🎉 *تمت الموافقة على طلبك!*\n";
  userMsg += "━━━━━━━━━━━━━━━━━━━━\n\n";
  userMsg += "💰 *مُضاف:* `+" + amount.toFixed(8) + " BTC`\n";
  userMsg += "   ≈ `$" + usd + " USD`\n";
  if (pts > 0) userMsg += "⭐ *نقاط:* `+" + pts + "`\n";
  userMsg += "\n📊 *رصيدك الآن:* `" + newBal.toFixed(8) + " BTC`";
  Bot.sendMessageTo(userId, userMsg);
} catch(e) {}

// تأكيد للأدمن
let msg = "✅ *تمت الموافقة*\n━━━━━━━━━━━━━━\n\n";
msg += "👤 المستخدم: `" + userId + "`\n";
msg += "💰 المبلغ: `+" + amount.toFixed(8) + " BTC`\n";
msg += "📊 رصيده الآن: `" + newBal.toFixed(8) + " BTC`";
Bot.sendMessage(msg);
