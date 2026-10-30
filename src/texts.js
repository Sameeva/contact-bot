export const TYPE_KEYS = ["web", "ai", "db", "other"];

export const TEXTS = {
  en: {
    welcome: "Hi, I'm Houssam's contact bot. Tell me what you need and he will reply here. Pick a project type to start, or just write your message.",
    types: { web: "Web app", ai: "AI solution", db: "Database", other: "Something else" },
    describe: "Describe what you need: the goal, a deadline and a budget if you have one.",
    placeholder: "Your message",
    ack: "Thanks, your message is sent. Houssam will reply here.",
    ownerHint: "Reply to a client's header message (the one containing [id:...]) to answer them."
  },
  fr: {
    welcome: "Bonjour, je suis le bot de contact de Houssam. Dites-moi ce dont vous avez besoin et il vous répondra ici. Choisissez un type de projet pour commencer, ou écrivez directement votre message.",
    types: { web: "Application web", ai: "Solution d'IA", db: "Base de données", other: "Autre chose" },
    describe: "Décrivez votre besoin : l'objectif, un délai et un budget si vous en avez un.",
    placeholder: "Votre message",
    ack: "Merci, votre message est envoyé. Houssam vous répondra ici.",
    ownerHint: "Répondez au message d'en-tête d'un client (celui qui contient [id:...]) pour lui répondre."
  },
  ar: {
    welcome: "مرحبًا، أنا بوت التواصل الخاص بحسام. أخبرني بما تحتاجه وسيرد عليك هنا. اختر نوع المشروع للبدء، أو اكتب رسالتك مباشرة.",
    types: { web: "تطبيق ويب", ai: "حل ذكاء اصطناعي", db: "قاعدة بيانات", other: "شيء آخر" },
    describe: "صف ما تحتاجه: الهدف، والموعد النهائي، والميزانية إن وجدت.",
    placeholder: "رسالتك",
    ack: "شكرًا، تم إرسال رسالتك. سيرد عليك حسام هنا.",
    ownerHint: "رُدّ على رسالة الترويسة الخاصة بالعميل (التي تحتوي [id:...]) لتجيبه."
  }
};

export function pickLang(code = "") {
  const c = String(code).slice(0, 2).toLowerCase();
  return TEXTS[c] ? c : "en";
}

/** Find the type key whose label (in any language) is the first line of `text`. */
export function typeFromPrompt(text = "") {
  const first = String(text).split("\n", 1)[0];
  for (const lang of Object.values(TEXTS)) {
    for (const key of TYPE_KEYS) if (lang.types[key] === first) return key;
  }
  return null;
}
