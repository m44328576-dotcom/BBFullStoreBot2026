/*CMD
  command: *
  help: 
  need_reply: 
  auto_retry_time: 
  folder: Common
  answer: 
  keyboard: 
  aliases: 
CMD*/

// ── /checkXXX ────────────────────────────────────────────────
if ((message.indexOf('/check') + 1) > 0) {
  let idx = message.split("/check")[1].trim();
  if (!idx || isNaN(parseInt(idx))) {
    Bot.sendMessage("⚠️ صيغة خاطئة.\nالاستخدام: `/check123` (123 = رقم المعاملة)");
    return;
  }
  Bot.sendMessage("🔄 جاري التحقق من المعاملة `" + idx + "`...");
  Libs.CoinPayments.getTxInfo({ payment_index: idx, onSuccess: '/on_txn_id' });
  return;
}

// ── أزرار لوحة المفاتيح ───────────────────────────────────────
if (message === "👛 محفظتي")      { Bot.runCommand("/ewallet");  return; }
if (message === "💰 رصيدي")       { Bot.runCommand("/balance");  return; }
if (message === "⭐ نقاطي")       { Bot.runCommand("/points");   return; }
if (message === "🤝 إحالاتي")     { Bot.runCommand("/referral"); return; }
if (message === "❓ مساعدة")      { Bot.runCommand("/help");     return; }
if (message === "📋 سجل المعاملات") { Bot.runCommand("/txhistory"); return; }

if (message === "💳 إيداع")   { Bot.runCommand("/deposit"); return; }
if (message === "💳 شحن رصيد") {
  let msg = "💳 *اختر مبلغ الشحن:*\n━━━━━━━━━━━━━━\n\n";
  msg += "⏲ /pay2 — `0.0002 BTC`\n";
  msg += "⏲ /pay5 — `0.0005 BTC`\n";
  msg += "⏲ /pay `[مبلغ]` — مبلغ مخصص\n\n";
  msg += "💰 /createWallet — محفظة BTC دائمة";
  Bot.sendMessage(msg);
  return;
}
