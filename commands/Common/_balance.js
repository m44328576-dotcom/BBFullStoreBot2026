/*CMD
  command: /balance
  help: رصيدك الكامل
  need_reply: 
  auto_retry_time: 
  folder: Common
  answer: 
  keyboard: 
  aliases: 💰 رصيدي, 💰 balance
CMD*/

let tid      = user.telegramid;
let bal      = Libs.WalletLib.getBalance(tid);
let pts      = Libs.PointsLib.getPoints(tid);
let btcPrice = parseFloat(Bot.getProperty("btc_price_usd") || 65000);
let usd      = (bal * btcPrice).toFixed(2);
let ptsVal   = parseFloat(((pts * Libs.PointsLib.satoshiPerPoint()) / 100000000).toFixed(8));
let refEarned = Libs.ReferralLib.getTotalEarned(tid);

let icon = bal <= 0 ? "🔴" : (bal < 0.001 ? "🟡" : "🟢");

let msg = "💰 *لوحة رصيدك*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";

msg += "💳 *المحفظة الإلكترونية:*\n";
msg += icon + " `" + bal.toFixed(8) + " BTC`\n";
msg += "   ≈ `$" + usd + " USD`\n\n";

msg += "⭐ *النقاط:*\n";
msg += "`" + pts.toLocaleString() + "` نقطة\n";
msg += "   ≈ `" + ptsVal.toFixed(8) + " BTC`\n\n";

msg += "🤝 *عمولات الإحالة:*\n";
msg += "`" + refEarned.toFixed(8) + " BTC` إجمالي مكتسب\n\n";

msg += "━━━━━━━━━━━━━━━━━━━━\n";

if (bal <= 0) {
  msg += "💡 اشحن رصيدك الآن:\n";
  msg += "• /pay2 — 0.0002 BTC\n";
  msg += "• /pay5 — 0.0005 BTC";
} else {
  msg += "📤 /send — إرسال BTC\n";
  msg += "🔄 /redeem — استبدال النقاط\n";
  msg += "📋 /txhistory — سجل المعاملات";
}

Bot.sendMessage(msg);
