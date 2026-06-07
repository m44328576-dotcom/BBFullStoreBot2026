/*CMD
  command: /onWalletCreation
  help: 
  need_reply: 
  auto_retry_time: 
  folder: 💰 Permanent Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

if (!options.result || !options.result.address) {
  Bot.sendMessage("❌ فشل إنشاء المحفظة. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.");
  return;
}

let wallet = options.result.address;
User.setProperty("wallet", wallet, "string");

// تسجيل تاريخ الإنشاء
let now = new Date();
let dateStr = now.getFullYear() + "/" +
  String(now.getMonth() + 1).padStart(2, "0") + "/" +
  String(now.getDate()).padStart(2, "0");
User.setProperty("wallet_created", dateStr, "string");

let msg = "🎉 *تم إنشاء محفظتك الدائمة!*\n";
msg += "━━━━━━━━━━━━━━\n\n";
msg += "📬 *عنوان BTC الخاص بك:*\n";
msg += "`" + wallet + "`\n\n";
msg += "✅ هذا العنوان ثابت ودائم — يمكنك مشاركته للاستلام في أي وقت.\n\n";
msg += "📅 تاريخ الإنشاء: " + dateStr + "\n\n";
msg += "💡 *نصيحة:* احفظ هذا العنوان في مكان آمن.\n\n";
msg += "أوامر مفيدة:\n";
msg += "• /my\\_wallet — عرض عنوانك دائماً\n";
msg += "• /balance — رصيدك الحالي";

Bot.sendMessage(msg);
