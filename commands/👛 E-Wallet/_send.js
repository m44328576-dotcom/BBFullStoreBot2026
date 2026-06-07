/*CMD
  command: /send
  help: إرسال BTC داخلياً
  need_reply: 
  auto_retry_time: 
  folder: 👛 E-Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

// الصيغة: /send [ID المستلم] [المبلغ] [ملاحظة اختيارية]

let tid = user.telegramid;

if (!params) {
  let msg = "📤 *إرسال BTC*\n━━━━━━━━━━━━━━\n\n";
  msg += "الصيغة:\n`/send [معرّف المستلم] [المبلغ] [ملاحظة]`\n\n";
  msg += "مثال:\n`/send 123456789 0.001 شكراً`\n\n";
  msg += "💰 رصيدك: `" + Libs.WalletLib.getBalance(tid).toFixed(8) + " BTC`\n\n";
  msg += "للحصول على معرّف شخص: اطلب منه /myid";
  Bot.sendMessage(msg);
  return;
}

let parts = params.split(" ");
if (parts.length < 2) {
  Bot.sendMessage("⚠️ صيغة ناقصة.\n`/send [معرّف] [مبلغ] [ملاحظة]`");
  return;
}

let toId   = parts[0].trim();
let amount = parseFloat(parts[1]);
let note   = parts.slice(2).join(" ").trim();

// التحقق من المعرّف
if (isNaN(parseInt(toId)) || toId.length < 5) {
  Bot.sendMessage("❌ معرّف المستلم غير صالح: `" + toId + "`\nالمعرّف رقم من 5+ أرقام. اطلب منه /myid");
  return;
}

if (String(toId) === String(tid)) {
  Bot.sendMessage("❌ لا يمكنك إرسال BTC لنفسك.");
  return;
}

// التحقق من المبلغ
if (isNaN(amount) || amount <= 0) {
  Bot.sendMessage("❌ مبلغ غير صالح: `" + parts[1] + "`");
  return;
}

let feeRate  = parseFloat(Bot.getProperty("send_fee_rate") || 0);
let feeAmt   = parseFloat((amount * feeRate).toFixed(8));
let netAmt   = parseFloat((amount - feeAmt).toFixed(8));
let myBal    = Libs.WalletLib.getBalance(tid);

if (myBal < amount) {
  Bot.sendMessage(
    "❌ رصيد غير كافٍ.\n" +
    "المطلوب: `" + amount.toFixed(8) + " BTC`\n" +
    "رصيدك:  `" + myBal.toFixed(8) + " BTC`"
  );
  return;
}

// حفظ بيانات التأكيد مؤقتاً
let pending = {
  toId:   toId,
  amount: amount,
  net:    netAmt,
  fee:    feeAmt,
  note:   note
};
User.setProperty("pending_send", JSON.stringify(pending), "string");

// طلب التأكيد
let btcPrice = parseFloat(Bot.getProperty("btc_price_usd") || 65000);
let usd = (amount * btcPrice).toFixed(2);

let msg = "📤 *تأكيد الإرسال*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "👤 *المستلم:* `" + toId + "`\n";
msg += "💰 *المبلغ:* `" + amount.toFixed(8) + " BTC`\n";
msg += "   ≈ `$" + usd + " USD`\n";
if (feeAmt > 0) {
  msg += "💸 *الرسوم:* `" + feeAmt.toFixed(8) + " BTC` (" + (feeRate*100).toFixed(1) + "%)\n";
  msg += "📨 *يستلم:* `" + netAmt.toFixed(8) + " BTC`\n";
}
if (note) { msg += "📝 *ملاحظة:* " + note + "\n"; }
msg += "\n💳 *رصيدك بعد الإرسال:* `" + (myBal - amount).toFixed(8) + " BTC`\n\n";
msg += "✅ /send\\_confirm — تأكيد الإرسال\n";
msg += "❌ /send\\_cancel — إلغاء";

Bot.sendMessage(msg);
