/*CMD
  command: /ref_commissions
  help: سجل عمولات الإحالة
  need_reply: 
  auto_retry_time: 
  folder: 🤝 Referral
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid    = user.telegramid;
let log    = Libs.ReferralLib.getCommissionLog(tid);
let earned = Libs.ReferralLib.getTotalEarned(tid);

if (!log || log.length === 0) {
  Bot.sendMessage("💸 *سجل العمولات*\n━━━━━━━━━━━━━━\n\nلا توجد عمولات بعد.\n\nأحِل أصدقاء وستحصل على عمولة من كل شحن يقومون به!\n\n🔗 /referral — رابط إحالتك");
  return;
}

let last = log.slice(-15).reverse();
let msg  = "💸 *آخر " + last.length + " عمولة:*\n━━━━━━━━━━━━━━\n\n";

last.forEach(function(entry) {
  let lvlIcon = entry.level === 1 ? "🥇" : "🥈";
  msg += lvlIcon + " L" + entry.level + " `+" + parseFloat(entry.amount).toFixed(8) + " BTC`\n";
  msg += "   👤 من: `" + entry.from + "`\n";
  if (entry.date) { msg += "   📅 " + entry.date + "\n"; }
  msg += "\n";
});

msg += "━━━━━━━━━━━━━━\n";
msg += "💸 *إجمالي العمولات:* `" + earned.toFixed(8) + " BTC`";
Bot.sendMessage(msg);
