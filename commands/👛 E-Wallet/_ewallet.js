/*CMD
  command: /ewallet
  help: لوحة التحكم بالمحفظة الإلكترونية
  need_reply: 
  auto_retry_time: 
  folder: 👛 E-Wallet
  answer: 
  keyboard: 
  aliases: 👛 محفظتي
CMD*/

let tid      = user.telegramid;
let bal      = Libs.WalletLib.getBalance(tid);
let pts      = Libs.PointsLib.getPoints(tid);
let refs     = Libs.ReferralLib.getTotalReferrals(tid);
let refEarned = Libs.ReferralLib.getTotalEarned(tid);
let btcPrice = parseFloat(Bot.getProperty("btc_price_usd") || 65000);
let usd      = (bal * btcPrice).toFixed(2);

let icon = bal <= 0 ? "🔴" : (bal < 0.001 ? "🟡" : "🟢");

let msg = "👛 *محفظتك الإلكترونية*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "🆔 *معرّفك:* `" + tid + "`\n\n";
msg += icon + " *الرصيد:* `" + bal.toFixed(8) + " BTC`\n";
msg += "   ≈ `$" + usd + " USD`\n\n";
msg += "⭐ *النقاط:* `" + pts.toLocaleString() + "`\n";
msg += "👥 *الإحالات:* `" + refs + "` مستخدم\n";
msg += "💸 *عمولات مكتسبة:* `" + refEarned.toFixed(8) + " BTC`\n\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n";
msg += "📤 /send — إرسال BTC\n";
msg += "📥 /receive — استقبال BTC\n";
msg += "📋 /txhistory — سجل المعاملات\n";
msg += "🔄 /redeem — استبدال النقاط\n";
msg += "🤝 /referral — رابط الإحالة\n";
msg += "💳 /pay2 أو /pay5 — شحن رصيد";

Bot.sendMessage(msg);
