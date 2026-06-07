/*CMD
  command: 👛 My wallet
  help: عرض عنوان محفظتي الدائمة
  need_reply: 
  auto_retry_time: 
  folder: 💰 Permanent Wallet
  answer: 
  keyboard: 
  aliases: /my_wallet, 👛 محفظتي
CMD*/

let wallet = User.getProperty("wallet");
let createdDate = User.getProperty("wallet_created") || "غير معروف";

if (!wallet) {
  let msg = "👛 *ليس لديك محفظة دائمة بعد*\n\n";
  msg += "إنشاء محفظة دائمة يمنحك:\n";
  msg += "✅ عنوان BTC ثابت خاص بك\n";
  msg += "✅ استقبال مدفوعات في أي وقت\n";
  msg += "✅ لا حاجة لإنشاء معاملة جديدة كل مرة\n\n";
  msg += "👇 أنشئ محفظتك الآن:";
  Bot.sendMessage(msg);
  Bot.runCommand("/createWallet");
  return;
}

let res = Libs.ResourcesLib.userRes("balance");
let balance = parseFloat(res.value() || 0).toFixed(8);

let msg = "👛 *محفظتك الدائمة*\n";
msg += "━━━━━━━━━━━━━━\n\n";
msg += "📬 *عنوان BTC:*\n`" + wallet + "`\n\n";
msg += "💰 *الرصيد:* `" + balance + " BTC`\n";
msg += "📅 *تاريخ الإنشاء:* " + createdDate + "\n\n";
msg += "💡 يمكنك مشاركة هذا العنوان لاستقبال BTC مباشرة.\n\n";
msg += "🔄 /createWallet\\_confirm — إنشاء محفظة جديدة";

Bot.sendMessage(msg);
