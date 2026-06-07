/*CMD
  command: /history
  help: سجل عمليات الشحن عبر CoinPayments
  need_reply: 
  auto_retry_time: 
  folder: Common
  answer: 
  keyboard: 
  aliases: 📋 سجل المعاملات
CMD*/

let tid = user.telegramid;
let historyRaw = User.getProperty("tx_history");
let history = [];
try { if (historyRaw) { history = JSON.parse(historyRaw); } } catch(e) { history = []; }

if (history.length === 0) {
  Bot.sendMessage("📋 *سجل الشحن*\n━━━━━━━━━━━━━━\n\nلا توجد عمليات شحن بعد.\n\n• /pay2 — شحن 0.0002 BTC\n• /pay5 — شحن 0.0005 BTC");
  return;
}

let last = history.slice(-10).reverse();
let msg = "📋 *آخر " + last.length + " عملية شحن:*\n━━━━━━━━━━━━━━\n\n";

last.forEach(function(tx) {
  let icon = tx.type === "permanent" ? "💰" : "⏲";
  msg += icon + " `+" + parseFloat(tx.amount).toFixed(8) + " BTC`\n";
  msg += "   📅 " + tx.date + "\n";
  if (tx.txn_id && tx.txn_id !== "N/A") {
    msg += "   🔑 `" + tx.txn_id + "`\n";
  }
  msg += "\n";
});

let bal = Libs.WalletLib.getBalance(tid);
msg += "━━━━━━━━━━━━━━\n";
msg += "💰 *رصيدك الحالي:* `" + bal.toFixed(8) + " BTC`";
Bot.sendMessage(msg);
