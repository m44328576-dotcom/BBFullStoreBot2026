/*CMD
  command: /pay
  help: شحن رصيد بمبلغ مخصص (BTC)
  need_reply: 
  auto_retry_time: 
  folder: ⏲ Temporary Wallet
  answer: 
  keyboard: 
  aliases: 
CMD*/

// التحقق من وجود المبلغ وصحته
if (!params) {
  Bot.sendMessage("⚠️ يرجى تحديد المبلغ.\nمثال: `/pay 0.001`\n\nأو استخدم الاختصارات:\n• /pay2 — 0.0002 BTC\n• /pay5 — 0.0005 BTC");
  return;
}

let amount = parseFloat(params);

if (isNaN(amount) || amount <= 0) {
  Bot.sendMessage("❌ مبلغ غير صالح: `" + params + "`\nيرجى إدخال رقم موجب.\nمثال: `/pay 0.001`");
  return;
}

// حد أدنى للمبلغ
let minAmount = 0.00001;
if (amount < minAmount) {
  Bot.sendMessage("❌ الحد الأدنى للدفع هو `" + minAmount + "` BTC.");
  return;
}

// حد أقصى للمبلغ (حماية من الأخطاء)
let maxAmount = 10;
if (amount > maxAmount) {
  Bot.sendMessage("❌ الحد الأقصى للدفع هو `" + maxAmount + "` BTC.");
  return;
}

Bot.sendMessage("⏳ جاري إنشاء طلب الدفع لـ `" + amount + " BTC`...");

let options = {
  fields: {
    amount: amount,
    currency: "BTC",
  },
  onSuccess: '/onCreatePayment',
  onPaymentCompleted: "/onPaymentCompleted",
  onIPN: "/onipn"
};

Libs.CoinPayments.createTransaction(options);
