/*CMD
  command: /btccheck
  help: التحقق من حالة الدفع المعلّق
  need_reply: 
  auto_retry_time: 
  folder: ₿ Bitcoin
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid = user.telegramid;
let raw = Bot.getProperty("BTC_pending_" + tid);

if (!raw) {
  Bot.sendMessage("⚠️ لا يوجد طلب دفع معلّق.\n\nأنشئ طلباً جديداً: /btcpay `[مبلغ]`");
  return;
}

let pending;
try { pending = JSON.parse(raw); } catch(e) {
  Bot.sendMessage("❌ خطأ في بيانات الطلب. أنشئ طلباً جديداً.");
  return;
}

Bot.sendMessage("🔍 جاري التحقق من الشبكة...\n📬 `" + pending.address + "`");

Libs.BitcoinLib.checkPayment({
  address:     pending.address,
  expectedBTC: pending.amount,
  onPaid:      "/onBtcPaid",
  onPending:   "/onBtcPending",
  onNotFound:  "/onBtcNotFound"
});
