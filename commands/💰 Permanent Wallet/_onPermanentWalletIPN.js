/*CMD
  command: /onPermanentWalletIPN
  help: 
  need_reply: 
  auto_retry_time: 
  folder: 💰 Permanent Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

// IPN للمحفظة الدائمة - سجّل الحدث للمراقبة
// المعالجة الفعلية تتم في /onIncome
let status = options.status;
let statusText = options.status_text || "";

// يمكن إضافة logging هنا للمراقبة
// Bot.sendMessage("IPN: " + status + " - " + statusText);
