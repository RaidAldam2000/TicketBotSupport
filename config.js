const path = require('path');

module.exports = {
  token: "MTQ5MDM0OTYwODAwODY4MzYyMA.GwRqJM.Q32R0VVHF030eY8vESd8MW2AjtpxEBE7ceAyOg",
  clientId: "1490349608008683620",
  guildId: "1218605155948433430",

  // القنوات والأدوار
 // 📢 روم زر التقديم
  applyChannelId: "1477350859682877592",

  // 📩 روم استقبال الطلبات
  applicationChannelId: "1477350856754987079",

  acceptRoleId: "1477349904866218186",
  reviewerRoleId: "1477349904866218186",

  dailyLimit: 2,

  colors: {
    pending: "#f1c40f",
    accepted: "#2672b9",
    rejected: "#ed4245"
  },

  embed: {
    title: "🌟 **Zone City | Application System** 🌟\n\n",
    description:
        "نعلن عن فتح باب التقديم للانضمام إلى فريق 💼\n\n" +
        "⚡ نبحث عن أشخاص يتميزون بالاحترافية، النشاط، والقدرة على العمل ضمن فريق.\n\n" +
        "📋 تأكد من إدخال معلوماتك بشكل دقيق، حيث سيتم تقييم طلبك بعناية.\n\n" +
        "🎯 اضغط على زر **📝 تقديم** وابدأ الآن!\n\n"+
        "@everyone",
    thumbnail: path.join(__dirname, 'images', 'zone1.png'),
    image: path.join(__dirname, 'images', 'zone2.png')
  },

  buttons: {
    apply_label: "📝 تقديم",
    status_label: "📊 حاله الطلب"
  },

  dmMessages: {
    accepted: "🎉 تهانينا! تم قبول تقديمك بنجاح.",
    rejected: "❌ نأسف، تم رفض طلبك."
  },

  form: [
    { id: "q1", label: "1️⃣ الاسم الكامل - العمر - المدينة", required: true, max: 300 },
    { id: "q2", label: "2️⃣ خبرتك السابقة؟", required: true, max: 400 },
    { id: "q3", label: "3️⃣ لماذا تريد الانضمام إلى الفريق؟", required: true, max: 500 },
    { id: "q4", label: "4️⃣ هل ستكون نشيطًا؟", required: true, max: 400 },
    { id: "q5", label: "5️⃣ هل لديك خبرات إضافية؟", required: false, max: 400 }
  ],

  application: {
    positionName: "𝐓𝐫𝐢𝐚𝐥"
  },

  stateFile: "state.json"
};