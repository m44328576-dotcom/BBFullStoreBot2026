/*CMD
  command: /points_log
  help: سجل تفصيلي للنقاط
  need_reply: 
  auto_retry_time: 
  folder: ⭐ Points
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid  = user.telegramid;
let log  = Libs.PointsLib.getLog(String(tid));

if (!log || log.length === 0) {
  Bot.sendMessage("⭐ *سجل النقاط*\n━━━━━━━━━━━━━━\n\nلا توجد سجلات بعد.\n\n• اشحن رصيدك لكسب نقاط\n• أحِل أصدقاء لكسب المزيد");
  return;
}

let last = log.slice(-15).reverse();
let msg  = "⭐ *سجل النقاط (آخر " + last.length + " حدث):*\n━━━━━━━━━━━━━━\n\n";

let reasonMap = {
  "deposit":  "💳 شحن",
  "referral": "🤝 إحالة",
  "send":     "📤 إرسال",
  "redeem":   "🔄 استبدال",
  "credit":   "🎁 مكافأة",
  "bonus":    "🎁 مكافأة"
};

last.forEach(function(entry) {
  let lbl  = reasonMap[entry.reason] || "🔹 " + entry.reason;
  let sign = entry.pts >= 0 ? "+" : "";
  msg += lbl + "  `" + sign + entry.pts + "` نقطة\n";
  if (entry.date) { msg += "   📅 " + entry.date + "\n"; }
  msg += "\n";
});

msg += "━━━━━━━━━━━━━━\n";
msg += "⭐ *رصيدك الحالي:* `" + Libs.PointsLib.getPoints(String(tid)).toLocaleString() + "` نقطة";
Bot.sendMessage(msg);
