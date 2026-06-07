/*CMD
  command: /test
  help: اختبار IPN للمحفظة الدائمة (للتطوير فقط)
  need_reply: 
  auto_retry_time: 
  folder: 💰 Permanent Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

// التحقق من صلاحية المسؤول
let adminId = Bot.getProperty("admin_telegram_id");
if (adminId && String(user.telegramid) !== String(adminId)) {
  Bot.sendMessage("⛔ هذا الأمر للمسؤول فقط.");
  return;
}

Bot.sendMessage("🧪 جاري تشغيل اختبار IPN...");

Libs.CoinPayments.callTestPermanentWalletIncome({
  onIPN: "/onPermanentWalletIPN",
  onIncome: "/onIncome"
});
