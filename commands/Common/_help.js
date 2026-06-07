/*CMD
  command: /help
  help: دليل الاستخدام الكامل
  need_reply: 
  auto_retry_time: 
  folder: Common
  answer: 
  keyboard: 
  aliases: ❓ مساعدة
CMD*/

let msg = "📖 *دليل الاستخدام الكامل*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";

msg += "👛 *المحفظة الإلكترونية:*\n";
msg += "• /ewallet — لوحة التحكم الكاملة\n";
msg += "• /balance — رصيدك وإحصائياتك\n";
msg += "• /send `[ID] [مبلغ] [ملاحظة]` — إرسال BTC\n";
msg += "• /receive — معلومات الاستلام\n";
msg += "• /myid — معرّفك لاستقبال BTC\n";
msg += "• /txhistory — سجل المعاملات الداخلية\n\n";

msg += "💳 *شحن الرصيد (CoinPayments):*\n";
msg += "• /pay2 — شحن 0.0002 BTC\n";
msg += "• /pay5 — شحن 0.0005 BTC\n";
msg += "• /pay `[مبلغ]` — مبلغ مخصص\n";
msg += "• /check`XXX` — فحص معاملة\n\n";

msg += "💰 *محفظة BTC دائمة:*\n";
msg += "• /createWallet — إنشاء محفظة\n";
msg += "• /my\\_wallet — عنوان محفظتي\n\n";

msg += "⭐ *النقاط والمكافآت:*\n";
msg += "• /points — رصيد نقاطي وكيف أكسب\n";
msg += "• /redeem `[نقاط]` — استبدال بـ BTC\n";
msg += "• /points\\_log — سجل النقاط\n\n";

msg += "🤝 *نظام الإحالة:*\n";
msg += "• /referral — رابطك وإحصائياتك\n";
msg += "• /ref\\_stats — تفاصيل إحالاتك\n";
msg += "• /ref\\_commissions — سجل عمولاتك\n\n";

msg += "📋 *أخرى:*\n";
msg += "• /history — سجل الشحن\n";
msg += "• /help — هذا الدليل";

Bot.sendMessage(msg);
