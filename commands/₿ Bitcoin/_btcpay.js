/*CMD
  command: /btcpay
  help: شحن رصيد مباشرة بـ BTC
  need_reply: 
  auto_retry_time: 
  folder: ₿ Bitcoin
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid = user.telegramid;

if (!params) {
  let stats = Libs.BitcoinLib.getPoolStats();
  let msg = "₿ *الدفع المباشر بـ BTC*\n━━━━━━━━━━━━━━━━━━━━\n\n";
  msg += "بدون وسيط — مباشرة على الشبكة\n\n";
  msg += "الصيغة: `/btcpay [مبلغ]`\n";
  msg += "مثال: `/btcpay 0.001`\n\n";
  msg += "• حد أدنى: `0.000546 BTC`\n";
  msg += "• تأكيد تلقائي عبر Blockchain\n";
  msg += "• لا رسوم إضافية\n\n";
  if (stats) msg += "📊 عناوين متاحة: `" + stats.remaining + "`";
  Bot.sendMessage(msg);
  return;
}

let amount = parseFloat(params);
if (isNaN(amount) || amount <= 0) { Bot.sendMessage("❌ مبلغ غير صالح: `" + params + "`"); return; }
if (amount < 0.000546) { Bot.sendMessage("❌ الحد الأدنى `0.000546 BTC`"); return; }
if (amount > 10) { Bot.sendMessage("❌ الحد الأقصى `10 BTC`"); return; }

// إسناد عنوان من الـ Pool
let addrResult = Libs.BitcoinLib.assignAddress(tid);
if (!addrResult) {
  Bot.sendMessage("⚠️ لا تتوفر عناوين حالياً. تواصل مع المسؤول.");
  return;
}

// حفظ الدفعة المعلّقة
Bot.setProperty("BTC_pending_" + tid, JSON.stringify({
  amount:  amount,
  address: addrResult.address,
  created: Libs.WalletLib.now()
}), "string");

let btcPrice = parseFloat(Bot.getProperty("btc_price_usd") || 65000);
let usd = (amount * btcPrice).toFixed(2);

let msg = "₿ *طلب الدفع جاهز!*\n━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "💰 *المبلغ:* `" + amount.toFixed(8) + " BTC`\n";
msg += "   ≈ `$" + usd + " USD`\n\n";
msg += "📬 *أرسل إلى هذا العنوان:*\n";
msg += "`" + addrResult.address + "`\n\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n";
msg += "⚠️ أرسل المبلغ المحدد بالضبط\n";
msg += "⏱ بعد الإرسال انتظر دقيقة ثم:\n\n";
msg += "🔍 /btccheck — تحقق من الحالة";
Bot.sendMessage(msg);

Api.sendPhoto({
  photo: "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=bitcoin:" + addrResult.address + "?amount=" + amount,
  caption: "📱 امسح للدفع\n₿ " + amount.toFixed(8) + " BTC"
});
