/*CMD
  command: /pay_proof
  help: إرسال إثبات الدفع للأدمن
  need_reply: 
  auto_retry_time: 
  folder: 💸 Manual Payment
  answer: 
  keyboard: 
  aliases: 
CMD*/

// الصيغة: /pay_proof [مبلغ] [TX Hash اختياري]
let tid    = user.telegramid;
let name   = user.first_name || "مستخدم";
let adminId = Bot.getProperty("admin_telegram_id");

if (!adminId) {
  Bot.sendMessage("⚠️ البوت لم يُعدّ بعد.");
  return;
}

if (!params) {
  let msg = "📤 *إرسال إثبات الدفع*\n━━━━━━━━━━━━━━\n\n";
  msg += "الصيغة:\n`/pay_proof [المبلغ] [TX Hash]`\n\n";
  msg += "مثال:\n`/pay_proof 0.001 abc123def456...`\n\n";
  msg += "أو بالمبلغ فقط:\n`/pay_proof 0.001`";
  Bot.sendMessage(msg);
  return;
}

let parts  = params.split(" ");
let amount = parseFloat(parts[0]);
let txHash = parts[1] || "";

if (isNaN(amount) || amount <= 0) {
  Bot.sendMessage("❌ مبلغ غير صالح: `" + parts[0] + "`\nمثال: `/pay_proof 0.001`");
  return;
}

let minDep = parseFloat(Bot.getProperty("min_deposit_btc") || 0.0001);
if (amount < minDep) {
  Bot.sendMessage("❌ الحد الأدنى للإيداع: `" + minDep + " BTC`");
  return;
}

// حفظ الطلب
let reqId = String(tid) + "_" + Date.now();
let req   = {
  id:     reqId,
  userId: String(tid),
  name:   name,
  amount: amount,
  txHash: txHash,
  status: "pending"
};
Bot.setProperty("DEP_req_" + reqId, JSON.stringify(req), "string");

// إشعار الأدمن
let adminMsg = "🔔 *طلب شحن جديد!*\n";
adminMsg += "━━━━━━━━━━━━━━━━━━━━\n\n";
adminMsg += "👤 *المستخدم:* " + name + "\n";
adminMsg += "🆔 *ID:* `" + tid + "`\n";
adminMsg += "💰 *المبلغ المُرسَل:* `" + amount.toFixed(8) + " BTC`\n";
if (txHash) adminMsg += "🔑 *TX Hash:* `" + txHash + "`\n";
adminMsg += "\n✅ للقبول: `/approve " + reqId + " " + amount + "`\n";
adminMsg += "❌ للرفض: `/reject " + reqId + " [سبب]`";

try {
  Bot.sendMessageTo(adminId, adminMsg);
} catch(e) {}

// رد على المستخدم
let msg = "✅ *تم إرسال طلبك!*\n━━━━━━━━━━━━━━\n\n";
msg += "💰 *المبلغ:* `" + amount.toFixed(8) + " BTC`\n";
if (txHash) msg += "🔑 *TX:* `" + txHash + "`\n";
msg += "\n⏳ سيُراجع طلبك ويُضاف رصيدك خلال دقائق.\n\n";
msg += "🔢 *رقم طلبك:* `" + reqId + "`\n";
msg += "📊 /dep\\_status — حالة طلبك";
Bot.sendMessage(msg);
