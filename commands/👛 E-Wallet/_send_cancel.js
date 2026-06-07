/*CMD
  command: /send_cancel
  help: 
  need_reply: 
  auto_retry_time: 
  folder: 👛 E-Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

User.setProperty("pending_send", "", "string");
Bot.sendMessage("❌ *تم إلغاء الإرسال.*\n\nرصيدك: `" + Libs.WalletLib.getBalance(user.telegramid).toFixed(8) + " BTC`");
