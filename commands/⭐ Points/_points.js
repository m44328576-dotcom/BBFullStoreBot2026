/*CMD
  command: /points
  help: رصيد نقاطي وكيفية الكسب
  need_reply: 
  auto_retry_time: 
  folder: ⭐ Points
  answer: 
  keyboard: 
  aliases: ⭐ نقاطي
CMD*/

let tid        = user.telegramid;
let pts        = Libs.PointsLib.getPoints(tid);
let earned     = Libs.PointsLib.getTotalEarned(tid);
let redeemed   = Libs.PointsLib.getTotalRedeemed(tid);
let satPt      = Libs.PointsLib.satoshiPerPoint();
let ptsPerBtc  = Libs.PointsLib.pointsPerBTC();
let ptsPerRef  = Libs.PointsLib.pointsPerRef();
let ptsPerSend = Libs.PointsLib.pointsPerSend();
let minRed     = Libs.PointsLib.minRedeem();

let ptsValueBtc = parseFloat(((pts * satPt) / 100000000).toFixed(8));
let btcPrice    = parseFloat(Bot.getProperty("btc_price_usd") || 65000);
let ptsValueUsd = (ptsValueBtc * btcPrice).toFixed(4);

let msg = "⭐ *مركز النقاط*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "⭐ *رصيدك:* `" + pts.toLocaleString() + "` نقطة\n";
msg += "   ≈ `" + ptsValueBtc + " BTC`\n";
msg += "   ≈ `$" + ptsValueUsd + " USD`\n\n";
msg += "📈 *إجمالي المكتسب:* `" + earned.toLocaleString() + "` نقطة\n";
msg += "🔄 *إجمالي المستبدل:* `" + redeemed.toLocaleString() + "` نقطة\n\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n";
msg += "🏆 *كيف تكسب نقاط:*\n\n";
msg += "💳 شحن BTC:    `+" + ptsPerBtc + "` نقطة/BTC\n";
msg += "🤝 إحالة:      `+" + ptsPerRef + "` نقطة/مستخدم\n";
msg += "📤 إرسال BTC:  `+" + ptsPerSend + "` نقطة/عملية\n\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n";
msg += "💱 *الاستبدال:*\n";
msg += "`" + satPt + "` ساتوشي لكل نقطة\n";
msg += "حد أدنى: `" + minRed + "` نقطة\n\n";

if (pts >= minRed) {
  msg += "✅ رصيدك كافٍ للاستبدال!\n";
  msg += "👉 /redeem `" + pts + "` — استبدل كل نقاطك\n";
  msg += "👉 /redeem `[عدد]` — استبدل جزءاً منها";
} else {
  let remaining = minRed - pts;
  msg += "📊 متبقٍ لأول استبدال: `" + remaining + "` نقطة";
}

Bot.sendMessage(msg);
