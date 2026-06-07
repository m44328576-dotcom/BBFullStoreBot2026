/*CMD
  command: /createWallet
  help: إنشاء محفظة BTC دائمة
  need_reply: 
  auto_retry_time: 
  folder: 💰 Permanent Wallet
  answer: 
  keyboard: 
  aliases: 🔄 new wallet, 🔄 محفظة جديدة
CMD*/

// التحقق إذا كان المستخدم لديه محفظة بالفعل
let existingWallet = User.getProperty("wallet");

if (existingWallet) {
  let msg = "💰 *لديك محفظة دائمة بالفعل!*\n";
  msg += "━━━━━━━━━━━━━━\n\n";
  msg += "📬 *عنوانك:*\n`" + existingWallet + "`\n\n";
  msg += "⚠️ هل تريد إنشاء محفظة جديدة؟\n";
  msg += "أرسل /createWallet\\_confirm للتأكيد\n\n";
  msg += "_ملاحظة: إنشاء محفظة جديدة لن يؤثر على رصيدك._";
  Bot.sendMessage(msg);
  return;
}

Bot.sendMessage("⏳ جاري إنشاء محفظتك الدائمة...\nهذا قد يستغرق بضع ثوانٍ.");

Libs.CoinPayments.createPermanentWallet({
  currency: "BTC",
  label: "user_" + user.telegramid,
  onSuccess: "/onWalletCreation",
  onIPN: "/onPermanentWalletIPN",
  onIncome: "/onIncome"
});
