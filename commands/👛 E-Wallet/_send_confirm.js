/*CMD
  command: /send_confirm
  help: 
  need_reply: 
  auto_retry_time: 
  folder: 👛 E-Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid     = user.telegramid;
let raw     = User.getProperty("pending_send");

if (!raw) {
  Bot.sendMessage("⚠️ لا يوجد طلب إرسال معلّق.\nاستخدم /send أولاً.");
  return;
}

let pending;
try { pending = JSON.parse(raw); } catch(e) {
  Bot.sendMessage("❌ خطأ في بيانات الطلب. أعد المحاولة.");
  return;
}

// تنفيذ الإرسال
let result = Libs.WalletLib.send(tid, pending.toId, pending.amount, pending.note);

// حذف الطلب المعلّق دائماً
User.setProperty("pending_send", "", "string");

if (!result.ok) {
  Bot.sendMessage(result.error);
  return;
}

// نقاط مكافأة على الإرسال
let sendPts = Libs.PointsLib.pointsPerSend();
if (sendPts > 0) {
  Libs.PointsLib.addPoints(String(tid), sendPts, "send");
}

let msg = "✅ *تم الإرسال بنجاح!*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "👤 *إلى:* `" + pending.toId + "`\n";
msg += "💰 *المبلغ:* `" + parseFloat(pending.amount).toFixed(8) + " BTC`\n";
if (result.fee > 0) {
  msg += "💸 *الرسوم:* `" + result.fee.toFixed(8) + " BTC`\n";
  msg += "📨 *استلم:* `" + result.net.toFixed(8) + " BTC`\n";
}
if (pending.note) { msg += "📝 *ملاحظة:* " + pending.note + "\n"; }
if (sendPts > 0)  { msg += "\n⭐ كسبت `" + sendPts + "` نقطة على هذه العملية!\n"; }
msg += "\n💰 *رصيدك الآن:* `" + Libs.WalletLib.getBalance(tid).toFixed(8) + " BTC`";

Bot.sendMessage(msg);

// إشعار المستلم
try {
  let notif = "📥 *استلمت BTC!*\n";
  notif += "━━━━━━━━━━━━━━━━━━━━\n\n";
  notif += "💰 `+" + result.net.toFixed(8) + " BTC`\n";
  notif += "👤 من: `" + tid + "`\n";
  if (pending.note) { notif += "📝 " + pending.note + "\n"; }
  notif += "\n💳 رصيدك: `" + Libs.WalletLib.getBalance(pending.toId).toFixed(8) + " BTC`";
  Bot.sendMessageTo(pending.toId, notif);
} catch(e) {}
