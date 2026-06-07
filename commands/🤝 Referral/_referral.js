/*CMD
  command: /referral
  help: رابط إحالتك وإحصائياتك
  need_reply: 
  auto_retry_time: 
  folder: 🤝 Referral
  answer: 
  keyboard: 
  aliases: 🤝 إحالاتي
CMD*/

let tid      = user.telegramid;
let code     = Libs.ReferralLib.getRefCode(tid);
let botName  = Bot.getProperty("bot_username") || "YOUR_BOT";
let l1List   = Libs.ReferralLib.getReferrals_L1(tid);
let l2List   = Libs.ReferralLib.getReferrals_L2(tid);
let earned   = Libs.ReferralLib.getTotalEarned(tid);
let refBy    = Libs.ReferralLib.getReferredBy(tid);
let l1Rate   = (Libs.ReferralLib.commRate_L1() * 100).toFixed(0);
let l2Rate   = (Libs.ReferralLib.commRate_L2() * 100).toFixed(0);
let bonus    = Libs.ReferralLib.getReferralBonus();
let ptsRef   = Libs.PointsLib.pointsPerRef();
let refLink  = "https://t.me/" + botName + "?start=" + code;

let msg = "🤝 *مركز الإحالة*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "🔗 *رابط إحالتك:*\n";
msg += "`" + refLink + "`\n\n";
msg += "📊 *إحصائياتك:*\n";
msg += "👥 إحالات مباشرة (L1): `" + l1List.length + "` مستخدم\n";
msg += "👥 إحالات غير مباشرة (L2): `" + l2List.length + "` مستخدم\n";
msg += "💸 إجمالي عمولات: `" + earned.toFixed(8) + " BTC`\n\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n";
msg += "🏆 *مكافآت الإحالة:*\n\n";
msg += "🎁 مكافأة فورية: `" + bonus.toFixed(8) + " BTC` + `" + ptsRef + "` نقطة\n";
msg += "💸 عمولة L1: `" + l1Rate + "%` من كل شحن مباشر\n";
msg += "💸 عمولة L2: `" + l2Rate + "%` من شحن إحالاتك\n\n";

if (refBy) {
  msg += "ℹ️ أحالك: `" + refBy + "`\n\n";
}

msg += "━━━━━━━━━━━━━━━━━━━━\n";
msg += "📋 /ref\\_stats — تفاصيل إحالاتي\n";
msg += "💸 /ref\\_commissions — سجل العمولات";

Bot.sendMessage(msg);
