/*CMD
  command: /onipn
  help: 
  need_reply: 
  auto_retry_time: 
  folder: ⏲ Temporary Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

// IPN Webhook من CoinPayments
// يُستخدم للمتابعة فقط - التأكيد الفعلي في onPaymentCompleted

let statusCode = parseInt(options.status);
let amount = options.amount1 || options.amount;

// نُرسل للمستخدم تحديثًا فقط إذا كانت المعاملة قيد المعالجة
if (statusCode > 0 && statusCode < 100) {
  Bot.sendMessage("🔄 *تحديث الدفع*\n━━━━━━━━━━━━━━\nحالتك: قيد المعالجة (" + statusCode + " تأكيد)\nالمبلغ: `" + parseFloat(amount || 0).toFixed(8) + " BTC`\n\n_سيُضاف الرصيد عند اكتمال التأكيدات._");
}

// لا نُعالج الاكتمال هنا - تتم معالجته في onPaymentCompleted
