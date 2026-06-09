/*CMD
  command: /onBtcPending
  help: 
  need_reply: 
  auto_retry_time: 
  folder: ₿ Bitcoin
  answer: 
  keyboard: 
  aliases: 
CMD*/

let result = options.result;
if (!result) return;

let pendBTC = parseFloat(result.pending_btc || 0);

let msg = "⏳ *الدفع في Mempool*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "🔄 المعاملة وصلت للشبكة وتنتظر التأكيد.\n\n";
msg += "💰 *المبلغ المعلّق:* `" + pendBTC.toFixed(8) + " BTC`\n";
msg += "⛓ *التأكيدات:* 0 (في انتظار التعدين)\n\n";
msg += "⏱ عادةً تستغرق 10-30 دقيقة.\n\n";
msg += "🔍 تحقق مجدداً: /btccheck";
Bot.sendMessage(msg);
