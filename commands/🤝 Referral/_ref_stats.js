/*CMD
  command: /ref_stats
  help: تفاصيل إحالاتك
  need_reply: 
  auto_retry_time: 
  folder: 🤝 Referral
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid    = user.telegramid;
let l1List = Libs.ReferralLib.getReferrals_L1(tid);
let l2List = Libs.ReferralLib.getReferrals_L2(tid);
let earned = Libs.ReferralLib.getTotalEarned(tid);
let l1Rate = (Libs.ReferralLib.commRate_L1() * 100).toFixed(0);
let l2Rate = (Libs.ReferralLib.commRate_L2() * 100).toFixed(0);

let msg = "📊 *تفاصيل إحالاتك*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";

msg += "🥇 *إحالات مباشرة (L1) — عمولة " + l1Rate + "%:*\n";
if (l1List.length === 0) {
  msg += "لا يوجد إحالات بعد.\n";
} else {
  let showMax = Math.min(l1List.length, 10);
  for (let i = 0; i < showMax; i++) {
    let bal = Libs.WalletLib.getBalance(l1List[i]);
    msg += (i+1) + ". `" + l1List[i] + "`";
    if (bal > 0) { msg += " — رصيد: `" + bal.toFixed(6) + " BTC`"; }
    msg += "\n";
  }
  if (l1List.length > 10) {
    msg += "... و `" + (l1List.length - 10) + "` آخرين\n";
  }
}

msg += "\n🥈 *إحالات غير مباشرة (L2) — عمولة " + l2Rate + "%:*\n";
if (l2List.length === 0) {
  msg += "لا يوجد إحالات L2 بعد.\n";
} else {
  msg += "إجمالي: `" + l2List.length + "` مستخدم\n";
}

msg += "\n━━━━━━━━━━━━━━━━━━━━\n";
msg += "💸 *إجمالي عمولاتك:* `" + earned.toFixed(8) + " BTC`\n\n";
msg += "💸 /ref\\_commissions — سجل العمولات التفصيلي";

Bot.sendMessage(msg);
