# BBDemoStoreBot2026 — Full Edition

بوت تيليغرام متكامل مبني على منصة **Bots.Business**، يشمل:
- 💳 استقبال مدفوعات BTC عبر CoinPayments (مؤقتة + دائمة)
- 👛 محفظة إلكترونية داخلية (إرسال / استلام بين المستخدمين)
- ⭐ نظام نقاط ومكافآت
- 🤝 نظام إحالة وعمولة متعدد المستويات (L1 + L2)

---

## هيكل الملفات

```
BBDemoStoreBot2026/
├── bot.json
├── commands/
│   ├── Common/
│   │   ├── _.js                    ← wildcard + معالجة الأزرار
│   │   ├── _start.js               ← ترحيب + معالجة رابط الإحالة
│   │   ├── _balance.js             ← الرصيد الشامل
│   │   ├── _history.js             ← سجل الشحن
│   │   ├── _help.js                ← الدليل الكامل
│   │   └── _setup.js               ← لوحة الإعداد (للمسؤول)
│   │
│   ├── 👛 E-Wallet/                ← المحفظة الإلكترونية
│   │   ├── _ewallet.js             ← لوحة التحكم
│   │   ├── _myid.js                ← معرّفي
│   │   ├── _receive.js             ← كيف أستقبل
│   │   ├── _send.js                ← إرسال (مع تأكيد)
│   │   ├── _send_confirm.js        ← تأكيد الإرسال
│   │   ├── _send_cancel.js         ← إلغاء
│   │   └── _txhistory.js           ← سجل المعاملات الداخلية
│   │
│   ├── ⭐ Points/                  ← نظام النقاط
│   │   ├── _points.js              ← رصيد النقاط وكيف أكسب
│   │   ├── _redeem.js              ← استبدال النقاط بـ BTC
│   │   └── _points_log.js          ← سجل النقاط
│   │
│   ├── 🤝 Referral/               ← نظام الإحالة
│   │   ├── _referral.js            ← رابطي وإحصائياتي
│   │   ├── _ref_stats.js           ← تفاصيل الإحالات
│   │   └── _ref_commissions.js     ← سجل العمولات
│   │
│   ├── ⏲ Temporary Wallet/
│   │   ├── _pay.js                 ← دفع بمبلغ مخصص
│   │   ├── _pay2.js / _pay5.js     ← اختصارات
│   │   ├── _onCreatePayment.js     ← عرض QR + تعليمات
│   │   ├── _onPaymentCompleted.js  ← تحديث كل الأنظمة
│   │   ├── _on_txn_id.js           ← حالة معاملة
│   │   └── _onipn.js               ← IPN تدريجي
│   │
│   └── 💰 Permanent Wallet/
│       ├── _createWallet.js
│       ├── _createWallet_confirm.js
│       ├── _onWalletCreation.js
│       ├── _onIncome.js            ← تحديث كل الأنظمة
│       ├── _onPermanentWalletIPN.js
│       ├── _test.js
│       └── 👛 My wallet.js
│
└── libs/
    ├── CoinPayments.js    ← بدون تعديل
    ├── ResourcesLib.js    ← للتوافق مع الكود القديم
    ├── WalletLib.js       ← المحفظة الإلكترونية
    ├── PointsLib.js       ← نظام النقاط
    └── ReferralLib.js     ← نظام الإحالة والعمولة
```

---

## تدفق الأنظمة

```
مستخدم يشحن BTC
       │
       ▼
_onPaymentCompleted / _onIncome
       │
       ├──► WalletLib.addBalance()     ← يُضاف للمحفظة
       ├──► PointsLib.addPoints()      ← يكسب نقاط
       └──► ReferralLib.distributeCommission()
                  │
                  ├──► L1 (5%)  ← المُحيل المباشر
                  └──► L2 (2%)  ← جد المُحيل

مستخدم يُرسل BTC لمستخدم آخر
       │
       ▼
WalletLib.send()
       ├──► يُخصم من المُرسِل
       ├──► يُضاف للمستلم (بعد خصم الرسوم)
       └──► PointsLib.addPoints()  ← نقاط على الإرسال

مستخدم ينضم برابط إحالة
       │
       ▼
/start ref[ID]
       ├──► ReferralLib.linkReferral()
       ├──► WalletLib.addBalance(referrer, bonus)  ← مكافأة فورية
       └──► PointsLib.addPoints(referrer, ptsRef)  ← نقاط فورية
```

---

## الإعداد

### 1. إعداد CoinPayments + BB API

```
/setup private:PRIVATEKEY public:PUBLICKEY bbapi:BBAPIKEY botname:YOUR_BOT_USERNAME
```

### 2. تخصيص الإعدادات (اختياري)

```
/setup btcprice:65000
/setup sendfee:0.01        ← رسوم الإرسال 1%
/setup minsend:0.000001
/setup comml1:0.05         ← عمولة L1 = 5%
/setup comml2:0.02         ← عمولة L2 = 2%
/setup refbonus:0.0001     ← مكافأة الإحالة
/setup ptsbtc:1000         ← 1000 نقطة لكل BTC
/setup ptsref:500          ← 500 نقطة لكل إحالة
/setup satpt:10            ← 10 ساتوشي لكل نقطة
/setup minredeem:100
```

---

## القيم الافتراضية

| الإعداد | القيمة |
|---------|--------|
| عمولة L1 | 5% |
| عمولة L2 | 2% |
| مكافأة إحالة | 0.0001 BTC + 500 نقطة |
| نقاط/BTC | 1000 |
| نقاط/إرسال | 10 |
| ساتوشي/نقطة | 10 |
| حد أدنى استبدال | 100 نقطة |
| رسوم الإرسال | 0% |
