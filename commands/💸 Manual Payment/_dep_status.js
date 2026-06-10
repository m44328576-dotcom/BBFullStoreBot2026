/*CMD
  command: /dep_status
  help: حالة آخر طلب شحن
  need_reply: 
  auto_retry_time: 
  folder: 💸 Manual Payment
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid = user.telegramid;

if (!params) {
  Bot.sendMessage("الصيغة: `/dep_status [reqId]`\nأو: `/dep_status` لعرض تعليمات");
  return;
}

let raw = Bot.getProperty("DEP_req_" + params);
if (!raw) {
  Bot.sendMessage("❌ طلب غير موجود: `" + params + "`\nتأكد من رقم الطلب.");
  return;
}

let req;
try { req = JSON.parse(raw); } catch(e) { Bot.sendMessage("❌ خطأ في البيانات."); return; }

if (String(req.userId) !== String(tid) && String(tid) !== String(Bot.getProperty("admin_telegram_id"))) {
  Bot.sendMessage("⛔ هذا الطلب ليس لك.");
  return;
}

let statusIcon = { pending: "⏳", approved: "✅", rejected: "❌" };
let statusText = { pending: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض" };
let icon = statusIcon[req.status] || "❓";
let text = statusText[req.status] || req.status;

let msg = icon + " *حالة الطلب: " + text + "*\n━━━━━━━━━━━━━━\n\n";
msg += "🔢 `" + params + "`\n";
msg += "💰 المبلغ: `" + parseFloat(req.amount).toFixed(8) + " BTC`\n";
if (req.txHash) msg += "🔑 TX: `" + req.txHash + "`\n";
if (req.approvedAmount) msg += "✅ مُضاف: `" + parseFloat(req.approvedAmount).toFixed(8) + " BTC`\n";
if (req.reason) msg += "📝 السبب: " + req.reason + "\n";

Bot.sendMessage(msg);
