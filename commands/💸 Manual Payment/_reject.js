/*CMD
  command: /reject
  help: رفض طلب الشحن (للأدمن)
  need_reply: 
  auto_retry_time: 
  folder: 💸 Manual Payment
  answer: 
  keyboard: 
  aliases: 
CMD*/

let adminId = Bot.getProperty("admin_telegram_id");
if (String(user.telegramid) !== String(adminId)) {
  Bot.sendMessage("⛔ للأدمن فقط.");
  return;
}

if (!params) {
  Bot.sendMessage("الصيغة: `/reject [reqId] [سبب]`\nمثال: `/reject 123456_789 المبلغ غير مطابق`");
  return;
}

let parts  = params.split(" ");
let reqId  = parts[0];
let reason = parts.slice(1).join(" ") || "لم يُحدد سبب";

let raw = Bot.getProperty("DEP_req_" + reqId);
if (!raw) { Bot.sendMessage("❌ طلب غير موجود: `" + reqId + "`"); return; }

let req;
try { req = JSON.parse(raw); } catch(e) { Bot.sendMessage("❌ خطأ في البيانات."); return; }

if (req.status === "approved") { Bot.sendMessage("⚠️ هذا الطلب مقبول بالفعل."); return; }
if (req.status === "rejected") { Bot.sendMessage("⚠️ هذا الطلب مرفوض بالفعل."); return; }

req.status = "rejected";
req.reason = reason;
Bot.setProperty("DEP_req_" + reqId, JSON.stringify(req), "string");

try {
  let userMsg = "❌ *تم رفض طلبك*\n━━━━━━━━━━━━━━\n\n";
  userMsg += "💰 المبلغ: `" + parseFloat(req.amount).toFixed(8) + " BTC`\n";
  userMsg += "📝 السبب: " + reason + "\n\n";
  userMsg += "إذا كان هناك خطأ تواصل مع الدعم: /deposit";
  Bot.sendMessageTo(String(req.userId), userMsg);
} catch(e) {}

Bot.sendMessage("✅ تم رفض الطلب `" + reqId + "`\nالسبب: " + reason);
