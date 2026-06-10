/*CMD
  command: /setup_btc_pool
  help: تحميل عناوين BTC (للمسؤول)
  need_reply: 
  auto_retry_time: 
  folder: ₿ Bitcoin
  answer: 
  keyboard: 
  aliases: 
CMD*/

let adminId = Bot.getProperty("admin_telegram_id");
if (adminId && String(user.telegramid) !== String(adminId)) {
  Bot.sendMessage("⛔ للمسؤول فقط.");
  return;
}

let stats = Libs.BitcoinLib.getPoolStats();

if (!params) {
  let msg = "₿ *إدارة عناوين BTC Pool*\n━━━━━━━━━━━━━━\n\n";
  msg += "📊 *الحالة:*\n";
  msg += "• إجمالي العناوين: `" + stats.total + "`\n";
  msg += "• مُستخدم: `" + stats.used + "`\n";
  msg += "• متبقي: `" + stats.remaining + "`\n\n";
  msg += "━━━━━━━━━━━━━━\n";
  msg += "📥 *لإضافة عناوين:*\n";
  msg += "1. شغّل على جهازك:\n";
  msg += "`python3 generate_addresses.py --xpub YOUR_XPUB --count 500`\n\n";
  msg += "2. انسخ محتوى `addresses.json`\n\n";
  msg += "3. أرسل:\n";
  msg += "`/setup_btc_pool [JSON array]`\n\n";
  msg += "مثال:\n";
  msg += "`/setup_btc_pool [\"1ABC...\",\"1DEF...\"]`";
  Bot.sendMessage(msg);
  return;
}

// تحميل العناوين
let count = Libs.BitcoinLib.loadPool(params);
if (!count) {
  Bot.sendMessage("❌ فشل التحميل. تأكد أن الـ params هو JSON array.\nمثال: `[\"1ABC123\",\"1DEF456\"]`");
  return;
}

let newStats = Libs.BitcoinLib.getPoolStats();
let msg = "✅ *تم تحميل العناوين!*\n━━━━━━━━━━━━━━\n\n";
msg += "➕ مُضاف: `" + count + "` عنوان\n";
msg += "📊 إجمالي الآن: `" + newStats.total + "`\n";
msg += "✅ متاح: `" + newStats.remaining + "`\n\n";
msg += "البوت جاهز لاستقبال مدفوعات BTC!";
Bot.sendMessage(msg);
