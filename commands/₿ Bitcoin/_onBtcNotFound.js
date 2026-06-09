/*CMD
  command: /onBtcNotFound
  help: 
  need_reply: 
  auto_retry_time: 
  folder: ₿ Bitcoin
  answer: 
  keyboard: 
  aliases: 
CMD*/

let result  = options.result;
let tid     = user.telegramid;
let raw     = Bot.getProperty("BTC_pending_" + tid);
let pending = {};
try { pending = JSON.parse(raw || "{}"); } catch(e) {}

let msg = "🔍 *لا توجد معاملة بعد*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "📬 العنوان: `" + (result ? result.address : pending.address || "غير معروف") + "`\n";
msg += "💰 المبلغ المطلوب: `" + parseFloat(pending.amount || 0).toFixed(8) + " BTC`\n\n";
msg += "لم يُرسَل أي BTC لهذا العنوان بعد.\n\n";
msg += "• تأكد من نسخ العنوان بشكل صحيح\n";
msg += "• تأكد من أن المبلغ صحيح\n";
msg += "• بعد الإرسال انتظر 1-2 دقيقة ثم /btccheck";
Bot.sendMessage(msg);
