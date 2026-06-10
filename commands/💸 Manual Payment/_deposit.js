/*CMD
  command: /deposit
  help: طلب شحن يدوي عبر الأدمن
  need_reply: 
  auto_retry_time: 
  folder: 💸 Manual Payment
  answer: 
  keyboard: 
  aliases: 💳 شحن رصيد
CMD*/

let tid     = user.telegramid;
let name    = user.first_name || "مستخدم";
let bal     = Libs.WalletLib.getBalance(String(tid));
let btcAddr = Bot.getProperty("admin_btc_address") || "لم يُحدد بعد";
let adminId = Bot.getProperty("admin_telegram_id");

if (!adminId) {
  Bot.sendMessage("⚠️ البوت لم يُعدّ بعد. تواصل مع المسؤول.");
  return;
}

let msg = "💳 *طلب شحن الرصيد*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "📬 *عنوان BTC للإيداع:*\n";
msg += "`" + btcAddr + "`\n\n";
msg += "📋 *خطوات الشحن:*\n";
msg += "1️⃣ أرسل BTC للعنوان أعلاه\n";
msg += "2️⃣ أرسل لنا إثبات الدفع: /pay\\_proof\n";
msg += "3️⃣ سيُضاف رصيدك خلال دقائق\n\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n";
msg += "💰 رصيدك الحالي: `" + bal.toFixed(8) + " BTC`\n\n";
msg += "⚡ الحدود:\n";
msg += "• حد أدنى: `" + (Bot.getProperty("min_deposit_btc") || "0.0001") + " BTC`\n";
msg += "• لا حد أقصى";

Bot.sendMessage(msg);

if (btcAddr !== "لم يُحدد بعد") {
  Api.sendPhoto({
    photo: "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=bitcoin:" + btcAddr,
    caption: "📱 امسح QR للإيداع\n📬 " + btcAddr
  });
}
