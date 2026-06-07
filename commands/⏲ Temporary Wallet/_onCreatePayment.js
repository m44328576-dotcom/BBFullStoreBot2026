/*CMD
  command: /onCreatePayment
  help: 
  need_reply: 
  auto_retry_time: 
  folder: ⏲ Temporary Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

let result = options.result;

if (!result || !result.address) {
  Bot.sendMessage("❌ فشل إنشاء طلب الدفع. يرجى المحاولة لاحقاً أو التواصل مع الدعم.");
  return;
}

let amount = parseFloat(result.amount).toFixed(8);
let expires = result.timeout ? Math.floor(result.timeout / 60) : 60;
let btcPrice = Bot.getProperty("btc_price_usd") || 65000;
let usdValue = (parseFloat(result.amount) * btcPrice).toFixed(2);

let msg = "✅ *طلب الدفع جاهز!*\n";
msg += "━━━━━━━━━━━━━━\n\n";
msg += "💰 *المبلغ المطلوب:*\n";
msg += "`" + amount + " BTC`\n";
msg += "≈ `$" + usdValue + " USD`\n\n";
msg += "📬 *عنوان الإيداع:*\n";
msg += "`" + result.address + "`\n\n";
msg += "⏱ *الصلاحية:* " + expires + " دقيقة\n\n";
msg += "🔗 [صفحة الدفع](" + result.checkout_url + ") | [تتبع الحالة](" + result.status_url + ")\n\n";
msg += "🔍 فحص يدوي: /check" + options.payment_index + "\n\n";
msg += "⚠️ _أرسل المبلغ المحدد بالضبط إلى العنوان أعلاه._";

Bot.sendMessage(msg);

// إرسال QR Code
Api.sendPhoto({
  photo: result.qrcode_url,
  caption: "📱 امسح QR للدفع السريع\n💰 " + amount + " BTC"
});

// حفظ معلومات المعاملة مؤقتًا
let pendingKey = "pending_tx_" + options.payment_index;
User.setProperty(pendingKey, JSON.stringify({
  amount: result.amount,
  address: result.address,
  created_at: new Date().toISOString(),
  index: options.payment_index
}), "string");
