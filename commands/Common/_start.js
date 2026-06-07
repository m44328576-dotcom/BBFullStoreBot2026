/*CMD
  command: /start
  help: 
  need_reply: 
  auto_retry_time: 
  folder: Common

  <<ANSWER
🏪 *مرحباً بك في متجرنا!*
  ANSWER
  keyboard: 👛 محفظتي, 💰 رصيدي,\n⭐ نقاطي, 🤝 إحالاتي,\n💳 شحن رصيد, ❓ مساعدة
  aliases: 
CMD*/

let tid  = user.telegramid;
let name = user.first_name || "عزيزي";

// ── معالجة رابط الإحالة /start refXXXXX ─────────────────────
if (params && params.indexOf("ref") === 0) {
  let referrerId = params.replace("ref", "").trim();
  if (referrerId && referrerId !== String(tid)) {
    let linkResult = Libs.ReferralLib.linkReferral(referrerId, tid);
    if (linkResult.ok) {
      // مكافأة فورية للمُحيل
      let bonus = Libs.ReferralLib.getReferralBonus();
      Libs.WalletLib.addBalance(referrerId, bonus);
      Libs.WalletLib.addTx(referrerId, {
        type: "referral_bonus",
        amount: bonus,
        note: "إحالة مستخدم جديد: " + tid
      });
      // نقاط للمُحيل
      let refPts = Libs.PointsLib.pointsPerRef();
      Libs.PointsLib.addPoints(referrerId, refPts, "referral");

      // إشعار للمُحيل
      try {
        let notif = "🎉 *إحالة جديدة!*\n";
        notif += "━━━━━━━━━━━━━━\n";
        notif += "👤 انضم مستخدم جديد برابطك!\n\n";
        notif += "🎁 *مكافأتك:*\n";
        notif += "💰 `+" + bonus.toFixed(8) + " BTC`\n";
        notif += "⭐ `+" + refPts + "` نقطة\n\n";
        notif += "💸 ستحصل على عمولة من كل شحن يقوم به.";
        Bot.sendMessageTo(referrerId, notif);
      } catch(e) {}

      // رسالة للمستخدم الجديد
      Bot.sendMessage(
        "🎉 تم تسجيلك برابط إحالة!\n" +
        "ستحصل على مزايا إضافية عند الشحن.\n\n" +
        "👋 أهلاً *" + name + "*!"
      );

      // L2: إشعار لجد المُحيل إن وُجد
      if (linkResult.grandRef) {
        try {
          Bot.sendMessageTo(linkResult.grandRef,
            "📢 إحالة L2 جديدة!\nمستخدم انضم عبر شبكتك. ستحصل على " +
            (Libs.ReferralLib.commRate_L2() * 100).toFixed(0) +
            "% من شحناته."
          );
        } catch(e) {}
      }
    }
  }
}

// ── رسالة الترحيب الرئيسية ───────────────────────────────────
let bal  = Libs.WalletLib.getBalance(tid);
let pts  = Libs.PointsLib.getPoints(tid);
let refs = Libs.ReferralLib.getTotalReferrals(tid);

let msg = "👋 أهلاً *" + name + "*!\n\n";

if (bal > 0) {
  msg += "💰 رصيدك: `" + bal.toFixed(8) + " BTC`\n";
  msg += "⭐ نقاطك: `" + pts.toLocaleString() + "`\n";
  msg += "👥 إحالاتك: `" + refs + "`\n\n";
}

msg += "اختر من القائمة أدناه 👇";
Bot.sendMessage(msg);
