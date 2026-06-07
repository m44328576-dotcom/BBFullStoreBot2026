/*CMD
  command: /redeem
  help: استبدال النقاط بـ BTC
  need_reply: 
  auto_retry_time: 
  folder: ⭐ Points
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid     = user.telegramid;
let myPts   = Libs.PointsLib.getPoints(tid);
let minRed  = Libs.PointsLib.minRedeem();
let satPt   = Libs.PointsLib.satoshiPerPoint();

if (!params) {
  let maxBtc = parseFloat(((myPts * satPt) / 100000000).toFixed(8));
  let msg = "🔄 *استبدال النقاط*\n━━━━━━━━━━━━━━\n\n";
  msg += "⭐ نقاطك: `" + myPts.toLocaleString() + "`\n";
  msg += "💱 قيمتها: `" + maxBtc + " BTC`\n\n";
  msg += "الصيغة: `/redeem [عدد النقاط]`\n";
  msg += "مثال: `/redeem " + Math.min(myPts, 1000) + "`\n\n";
  msg += "• حد أدنى: `" + minRed + "` نقطة\n";
  msg += "• `" + satPt + "` ساتوشي لكل نقطة";
  Bot.sendMessage(msg);
  return;
}

let ptsToRedeem = Math.floor(parseFloat(params));

if (isNaN(ptsToRedeem) || ptsToRedeem <= 0) {
  Bot.sendMessage("❌ عدد النقاط غير صالح: `" + params + "`");
  return;
}

let result = Libs.PointsLib.redeemPoints(String(tid), ptsToRedeem);

if (!result.ok) {
  Bot.sendMessage("❌ فشل الاستبدال\n" + result.error);
  return;
}

// أضف الـ BTC للمحفظة
Libs.WalletLib.addBalance(String(tid), result.btc);
Libs.WalletLib.addTx(String(tid), {
  type:   "redeem",
  amount: result.btc,
  note:   "استبدال " + result.pts + " نقطة"
});

let remaining = Libs.PointsLib.getPoints(String(tid));
let newBal    = Libs.WalletLib.getBalance(String(tid));

let msg = "🎉 *تم استبدال النقاط بنجاح!*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "⭐ *نقاط مستبدلة:* `" + result.pts.toLocaleString() + "`\n";
msg += "💰 *BTC مضاف:* `+" + result.btc.toFixed(8) + " BTC`\n";
msg += "   (`" + result.satoshi + "` ساتوشي)\n\n";
msg += "📊 *بعد الاستبدال:*\n";
msg += "⭐ نقاط متبقية: `" + remaining.toLocaleString() + "`\n";
msg += "💰 رصيد BTC: `" + newBal.toFixed(8) + " BTC`";

Bot.sendMessage(msg);
