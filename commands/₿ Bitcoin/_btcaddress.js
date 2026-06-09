/*CMD
  command: /btcaddress
  help: عنوان BTC الخاص بك المشتق من xpub
  need_reply: 
  auto_retry_time: 
  folder: ₿ Bitcoin
  answer: 
  keyboard: 
  aliases: 
CMD*/

let tid  = user.telegramid;
let xpub = Bot.getProperty("btc_xpub");

if (!xpub) {
  Bot.sendMessage("⚠️ لم يُضبط xpub.\nالمسؤول: `/setup xpub:YOUR_XPUB`");
  return;
}

let result = Libs.BitcoinLib.generateAddress(xpub, tid);
if (!result) {
  Bot.sendMessage("❌ فشل توليد العنوان. تواصل مع الدعم.");
  return;
}

let msg = "₿ *عنوان BTC الخاص بك*\n";
msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
msg += "📬 *العنوان:*\n`" + result.address + "`\n\n";
msg += "🔢 *الـ Index:* `" + result.index + "`\n\n";
msg += "💡 هذا العنوان مشتق خصيصاً لمعرّفك.\n";
msg += "يمكنك استخدامه لاستقبال BTC مباشرة.\n\n";
msg += "🔍 للتحقق من رصيد العنوان على الشبكة:\n";
msg += "[Blockstream Explorer](https://blockstream.info/address/" + result.address + ")";
Bot.sendMessage(msg);

Api.sendPhoto({
  photo: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + result.address,
  caption: "₿ عنوانك: " + result.address
});
