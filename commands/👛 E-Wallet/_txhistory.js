/*CMD
  command: /txhistory
  help: سجل معاملات المحفظة الداخلية
  need_reply: 
  auto_retry_time: 
  folder: 👛 E-Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid  = user.telegramid;
let hist = Libs.WalletLib.getTxHistory(tid);

if (!hist || hist.length === 0) {
  Bot.sendMessage("📋 *سجل المعاملات الداخلية*\n━━━━━━━━━━━━━━\n\nلا توجد معاملات بعد.\n\n• /pay2 — اشحن رصيدك\n• /send — أرسل لمستخدم آخر");
  return;
}

let last = hist.slice(-12).reverse();
let msg  = "📋 *آخر " + last.length + " معاملة داخلية:*\n━━━━━━━━━━━━━━\n\n";

let typeMap = {
  "deposit":        { icon: "⬇️", label: "شحن" },
  "receive":        { icon: "📥", label: "استلام" },
  "send":           { icon: "📤", label: "إرسال" },
  "referral_bonus": { icon: "🎁", label: "مكافأة إحالة" },
  "commission_l1":  { icon: "💸", label: "عمولة L1" },
  "commission_l2":  { icon: "💸", label: "عمولة L2" },
  "redeem":         { icon: "🔄", label: "استبدال نقاط" }
};

last.forEach(function(tx) {
  let t     = typeMap[tx.type] || { icon: "🔹", label: tx.type };
  let sign  = tx.amount >= 0 ? "+" : "";
  let color = tx.amount >= 0 ? "" : "";
  msg += t.icon + " *" + t.label + "*\n";
  msg += "   " + sign + "`" + parseFloat(tx.amount).toFixed(8) + " BTC`\n";
  if (tx.from)  { msg += "   👤 من: `" + tx.from + "`\n"; }
  if (tx.to)    { msg += "   👤 إلى: `" + tx.to + "`\n"; }
  if (tx.note)  { msg += "   📝 " + tx.note + "\n"; }
  if (tx.date)  { msg += "   📅 " + tx.date + "\n"; }
  msg += "\n";
});

msg += "━━━━━━━━━━━━━━\n";
msg += "💰 *رصيدك:* `" + Libs.WalletLib.getBalance(tid).toFixed(8) + " BTC`";
Bot.sendMessage(msg);
