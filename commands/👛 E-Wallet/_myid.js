/*CMD
  command: /myid
  help: معرّفك لاستقبال BTC
  need_reply: 
  auto_retry_time: 
  folder: 👛 E-Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid = user.telegramid;
let msg = "🆔 *معرّفك الداخلي*\n";
msg += "━━━━━━━━━━━━━━\n\n";
msg += "`" + tid + "`\n\n";
msg += "شارك هذا الرقم مع من يريد إرسال BTC إليك داخل البوت.\n\n";
msg += "📥 أو استخدم: /receive لعرض تعليمات الاستلام.";
Bot.sendMessage(msg);
