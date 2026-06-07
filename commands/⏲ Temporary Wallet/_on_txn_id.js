/*CMD
  command: /on_txn_id
  help: 
  need_reply: 
  auto_retry_time: 
  folder: ⏲ Temporary Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

let result = options.result;

if (!result) {
  Bot.sendMessage("❌ لم يُعثر على معلومات المعاملة.");
  return;
}

let statusCode = parseInt(result.status);
let statusText = result.status_text || "غير معروف";

// ترجمة الحالة
let statusIcon = "❓";
let statusAr = statusText;

if (statusCode < 0) {
  statusIcon = "❌";
  statusAr = "فشلت / ملغاة";
} else if (statusCode === 0) {
  statusIcon = "⏳";
  statusAr = "في الانتظار";
} else if (statusCode >= 1 && statusCode < 100) {
  statusIcon = "🔄";
  statusAr = "قيد المعالجة (" + statusCode + " تأكيد)";
} else if (statusCode === 100) {
  statusIcon = "✅";
  statusAr = "مكتملة";
} else if (statusCode === 101) {
  statusIcon = "✅";
  statusAr = "مكتملة (إيداع محلي)";
}

let msg = "🔍 *حالة المعاملة*\n";
msg += "━━━━━━━━━━━━━━\n\n";
msg += statusIcon + " *الحالة:* " + statusAr + "\n\n";

if (result.amount) {
  msg += "💰 *المبلغ:* `" + parseFloat(result.amount).toFixed(8) + " BTC`\n";
}
if (result.address) {
  msg += "📬 *العنوان:* `" + result.address + "`\n";
}
if (result.txn_id) {
  msg += "🔑 *TXN:* `" + result.txn_id + "`\n";
}

if (statusCode < 100 && statusCode >= 0) {
  msg += "\n⏰ _الدفعات تحتاج تأكيدات على الشبكة. انتظر قليلاً._";
}

Bot.sendMessage(msg);
