/*CMD
  command: /receive
  help: تعليمات استلام BTC
  need_reply: 
  auto_retry_time: 
  folder: 👛 E-Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid      = user.telegramid;
let bal      = Libs.WalletLib.getBalance(tid);
let btcWallet = User.getProperty("wallet");
let botName   = Bot.getProperty("bot_username") || "هذا البوت";

let msg = "📥 *كيف تستقبل BTC*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";

msg += "1️⃣ *تحويل داخلي (فوري - بدون رسوم):*\n";
msg += "شارك معرّفك مع المُرسِل:\n";
msg += "🆔 `" + tid + "`\n";
msg += "المُرسِل يستخدم: `/send " + tid + " [مبلغ]`\n\n";

if (btcWallet) {
  msg += "2️⃣ *إيداع BTC خارجي (محفظة دائمة):*\n";
  msg += "عنوانك: `" + btcWallet + "`\n";
  msg += "أرسل BTC لهذا العنوان من أي محفظة.\n\n";
} else {
  msg += "2️⃣ *إيداع BTC خارجي:*\n";
  msg += "أنشئ محفظة دائمة أولاً: /createWallet\n\n";
}

msg += "3️⃣ *رابط الإحالة (اكسب من دعوة الآخرين):*\n";
msg += "استخدم: /referral\n\n";

msg += "━━━━━━━━━━━━━━━━━━━━\n";
msg += "💰 رصيدك الحالي: `" + bal.toFixed(8) + " BTC`";

Bot.sendMessage(msg);
