/*CMD
  command: /createWallet_confirm
  help: تأكيد إنشاء محفظة جديدة
  need_reply: 
  auto_retry_time: 
  folder: 💰 Permanent Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

Bot.sendMessage("⏳ جاري إنشاء محفظة جديدة...");

Libs.CoinPayments.createPermanentWallet({
  currency: "BTC",
  label: "user_" + user.telegramid + "_new",
  onSuccess: "/onWalletCreation",
  onIPN: "/onPermanentWalletIPN",
  onIncome: "/onIncome"
});
