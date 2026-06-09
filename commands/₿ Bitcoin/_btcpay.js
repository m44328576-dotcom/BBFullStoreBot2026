/*CMD
  command: /btcpay
  help: شحن رصيد مباشرة بـ BTC بدون وسيط
  need_reply: 
  auto_retry_time: 
  folder: ₿ Bitcoin
  answer: 
  keyboard: 
  aliases: 
CMD*/

// الصيغة: /btcpay [مبلغ]
let tid = user.telegramid;

if (!params) {
  let msg = "₿ *الدفع المباشر بـ BTC*\n";
  msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
  msg += "بدون وسيط — مباشرة على الشبكة\n\n";
  msg += "الصيغة: `/btcpay [مبلغ]`\n";
  msg += "مثال:   `/btcpay 0.001`\n\n";
  msg += "• حد أدنى: `0.000546 BTC` (dust limit)\n";
  msg += "• تأكيد تلقائي عبر Blockchain\n";
  msg += "• لا رسوم إضافية";
  Bot.sendMessage(msg);
  return;
}

let amount = parseFloat(params);
if (isNaN(amount) || amount <= 0) {
  Bot.sendMessage("❌ مبلغ غير صالح: `" + params + "`");
  return;
}
if (amount < 0.000546) {
  Bot.sendMessage("❌ الحد الأدنى `0.000546 BTC` (dust limit الشبكة).");
  return;
}
if (amount > 10) {
  Bot.sendMessage("❌ الحد الأقصى `10 BTC` لكل عملية.");
  return;
}

// التحقق من إعداد xpub
let xpub = Bot.getProperty("btc_xpub");
if (!xpub) {
  Bot.sendMessage("⚠️ لم يُضبط xpub بعد.\nالمسؤول يجب أن يشغّل: `/setup xpub:YOUR_XPUB`");
  return;
}

// توليد العنوان
let result = Libs.BitcoinLib.generateAddress(xpub, tid);
if (!result) {
  Bot.sendMessage("❌ فشل توليد عنوان BTC. تواصل مع الدعم.");
  return;
}

// حفظ بيانات الدفع المعلّق
let paymentId = "pay_" + tid + "_" + Date.now();
let pending = {
  amount:     amount,
  address:    result.address,
  index:      result.index,
  created_at: Libs.WalletLib.now(),
  expires_in: 60  // دقيقة
};
Bot.setProperty("BTC_pending_" + tid, JSON.stringify(pending), "string");

let btcPrice = parseFloat(Bot.getProperty("btc_price_usd") || 65000);
let usd = (amount * btcPrice).toFixed(2);

let msg = "₿ *طلب الدفع المباشر*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "💰 *المبلغ:* `" + amount.toFixed(8) + " BTC`\n";
msg += "   ≈ `$" + usd + " USD`\n\n";
msg += "📬 *عنوان BTC:*\n";
msg += "`" + result.address + "`\n\n";
msg += "⏱ *الصلاحية:* 60 دقيقة\n\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n";
msg += "⚠️ *مهم:*\n";
msg += "• أرسل المبلغ المحدد بالضبط\n";
msg += "• من أي محفظة BTC خارجية\n";
msg += "• انتظر تأكيداً واحداً على الأقل\n\n";
msg += "🔍 للتحقق اليدوي: /btccheck\n";
msg += "📊 رصيدك: `" + Libs.WalletLib.getBalance(String(tid)).toFixed(8) + " BTC`";

Bot.sendMessage(msg);

// QR Code عبر API مجاني
Api.sendPhoto({
  photo: "https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=bitcoin:" + result.address + "?amount=" + amount,
  caption: "📱 امسح QR Code للدفع\n₿ " + amount.toFixed(8) + " BTC → " + result.address
});
