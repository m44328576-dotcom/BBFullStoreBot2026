/*CMD
  command: /setup
  help: إعداد البوت (للمسؤول)
  need_reply: 
  auto_retry_time: 
  folder: Common
  answer: 
  keyboard: 
  aliases: 
CMD*/

// أول استخدام يُسجّل صاحبه كمسؤول
let adminId = Bot.getProperty("admin_telegram_id");
if (!adminId) {
  Bot.setProperty("admin_telegram_id", String(user.telegramid), "string");
  adminId = String(user.telegramid);
}
if (String(user.telegramid) !== String(adminId)) {
  Bot.sendMessage("⛔ هذا الأمر للمسؤول فقط.");
  return;
}

if (!params) {
  // عرض الحالة الحالية
  let msg = "⚙️ *إعداد البوت*\n━━━━━━━━━━━━━━\n\n";
  msg += "*🔑 CoinPayments API:*\n";
  msg += (Bot.getProperty("CoinPayments_private_key") ? "✅" : "❌") + " Private Key\n";
  msg += (Bot.getProperty("CoinPayments_public_key")  ? "✅" : "❌") + " Public Key\n";
  msg += (Bot.getProperty("CoinPayments_bb_api_key")  ? "✅" : "❌") + " BB API Key\n\n";

  msg += "*⚙️ الإعدادات الحالية:*\n";
  msg += "💵 سعر BTC: `$" + (Bot.getProperty("btc_price_usd") || 65000) + "`\n";
  msg += "📛 اسم البوت: `" + (Bot.getProperty("bot_username") || "غير محدد") + "`\n";
  msg += "💸 رسوم الإرسال: `" + ((parseFloat(Bot.getProperty("send_fee_rate") || 0)) * 100).toFixed(1) + "%`\n";
  msg += "📉 حد أدنى إرسال: `" + (Bot.getProperty("min_send_btc") || 0.000001) + " BTC`\n\n";

  msg += "*⭐ إعدادات النقاط:*\n";
  msg += "نقاط/BTC: `" + (Bot.getProperty("pts_per_btc") || 1000) + "`\n";
  msg += "نقاط/إحالة: `" + (Bot.getProperty("pts_per_ref") || 500) + "`\n";
  msg += "ساتوشي/نقطة: `" + (Bot.getProperty("pts_satoshi_pt") || 10) + "`\n\n";

  msg += "*🤝 إعدادات الإحالة:*\n";
  msg += "عمولة L1: `" + ((parseFloat(Bot.getProperty("ref_comm_l1") || 0.05)) * 100).toFixed(0) + "%`\n";
  msg += "عمولة L2: `" + ((parseFloat(Bot.getProperty("ref_comm_l2") || 0.02)) * 100).toFixed(0) + "%`\n";
  msg += "مكافأة إحالة: `" + (Bot.getProperty("ref_bonus") || 0.0001) + " BTC`\n\n";

  msg += "━━━━━━━━━━━━━━\n*الصيغة:*\n";
  msg += "`/setup [مفتاح]:[قيمة]`\n\n";
  msg += "*المفاتيح المتاحة:*\n";
  msg += "• `private:KEY` — CoinPayments Private Key\n";
  msg += "• `public:KEY` — CoinPayments Public Key\n";
  msg += "• `bbapi:KEY` — BB API Key\n";
  msg += "• `botname:username` — اسم البوت\n";
  msg += "• `btcprice:65000` — سعر BTC بالدولار\n";
  msg += "• `sendfee:0.01` — رسوم الإرسال (0.01 = 1%)\n";
  msg += "• `minsend:0.000001` — حد أدنى للإرسال\n";
  msg += "• `comml1:0.05` — عمولة الإحالة L1\n";
  msg += "• `comml2:0.02` — عمولة الإحالة L2\n";
  msg += "• `refbonus:0.0001` — مكافأة الإحالة\n";
  msg += "• `ptsbtc:1000` — نقاط لكل BTC\n";
  msg += "• `ptsref:500` — نقاط لكل إحالة\n";
  msg += "• `satpt:10` — ساتوشي لكل نقطة\n";
  msg += "• `minredeem:100` — حد أدنى استبدال";

  Bot.sendMessage(msg);
  return;
}

let parts = params.split(" ");
let updated = [];

parts.forEach(function(part) {
  let kv = part.split(":");
  if (kv.length < 2) { return; }
  let k = kv[0].toLowerCase().trim();
  let v = kv.slice(1).join(":");

  if (k === "private")    { Libs.CoinPayments.setPrivateKey(v); updated.push("✅ Private Key"); }
  else if (k === "public") { Libs.CoinPayments.setPublicKey(v);  updated.push("✅ Public Key"); }
  else if (k === "bbapi")  { Libs.CoinPayments.setBBApiKey(v);   updated.push("✅ BB API Key"); }
  else if (k === "botname") {
    Bot.setProperty("bot_username", v.replace("@",""), "string");
    updated.push("✅ Bot Username: " + v);
  }
  else if (k === "btcprice") {
    let p = parseFloat(v);
    if (!isNaN(p) && p > 0) { Bot.setProperty("btc_price_usd", p, "float"); updated.push("✅ BTC Price: $" + p); }
  }
  else if (k === "sendfee") {
    let f = parseFloat(v);
    if (!isNaN(f) && f >= 0 && f < 1) { Bot.setProperty("send_fee_rate", f, "float"); updated.push("✅ Send Fee: " + (f*100).toFixed(1) + "%"); }
  }
  else if (k === "minsend") {
    let m = parseFloat(v);
    if (!isNaN(m) && m > 0) { Bot.setProperty("min_send_btc", m, "float"); updated.push("✅ Min Send: " + m); }
  }
  else if (k === "comml1") {
    let r = parseFloat(v);
    if (!isNaN(r) && r >= 0 && r < 1) { Bot.setProperty("ref_comm_l1", r, "float"); updated.push("✅ L1 Rate: " + (r*100) + "%"); }
  }
  else if (k === "comml2") {
    let r = parseFloat(v);
    if (!isNaN(r) && r >= 0 && r < 1) { Bot.setProperty("ref_comm_l2", r, "float"); updated.push("✅ L2 Rate: " + (r*100) + "%"); }
  }
  else if (k === "refbonus") {
    let b = parseFloat(v);
    if (!isNaN(b) && b >= 0) { Bot.setProperty("ref_bonus", b, "float"); updated.push("✅ Ref Bonus: " + b + " BTC"); }
  }
  else if (k === "ptsbtc") {
    let p = parseFloat(v);
    if (!isNaN(p) && p > 0) { Bot.setProperty("pts_per_btc", p, "float"); updated.push("✅ Points/BTC: " + p); }
  }
  else if (k === "ptsref") {
    let p = parseFloat(v);
    if (!isNaN(p) && p >= 0) { Bot.setProperty("pts_per_ref", p, "float"); updated.push("✅ Points/Ref: " + p); }
  }
  else if (k === "satpt") {
    let s = parseFloat(v);
    if (!isNaN(s) && s > 0) { Bot.setProperty("pts_satoshi_pt", s, "float"); updated.push("✅ Satoshi/Point: " + s); }
  }
  else if (k === "minredeem") {
    let m = parseFloat(v);
    if (!isNaN(m) && m > 0) { Bot.setProperty("pts_min_redeem", m, "float"); updated.push("✅ Min Redeem: " + m + " pts"); }
  }
  else if (k === "xpub") {
    if (v.indexOf("xpub") === 0 && v.length > 100) {
      Bot.setProperty("btc_xpub", v, "string");
      updated.push("✅ xpub: " + v.substr(0,20) + "...");
    } else {
      updated.push("❌ xpub غير صالح (يجب أن يبدأ بـ xpub)");
    }
  }
});

if (updated.length > 0) {
  Bot.sendMessage("⚙️ *تم التحديث:*\n" + updated.join("\n"));
} else {
  Bot.sendMessage("⚠️ لم يُحدَّث شيء. تحقق من الصيغة.");
}
