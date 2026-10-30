export const TYPE_KEYS = ["web", "ai", "db", "other"];
export const BUDGET_KEYS = ["b0", "b1", "b2", "b3", "b4"];
export const DEADLINE_KEYS = ["d0", "d1", "d2"];

export const TEXTS = {
  en: {
    welcome: "Hi, I'm Houssam's contact bot. Answer three quick questions and describe your project, and he will reply here. Or just write your message.",
    types: { web: "Web app", ai: "AI solution", db: "Database", other: "Something else" },
    budgets: { b0: "Not sure yet", b1: "Under $200", b2: "$200 to $500", b3: "$500 to $1,500", b4: "Over $1,500" },
    deadlines: { d0: "No rush", d1: "Within a month", d2: "Within a week" },
    askBudget: "What budget range are you thinking about?",
    askDeadline: "When do you need it?",
    describe: "Describe what you need: what it should do and who it is for.",
    placeholder: "Your message",
    ack: "Thanks, your message is sent. Houssam will reply here.",
    alsoRead: "Houssam will also read your message and reply here.",
    ownerHint: "Reply to a client's header message (the one containing [id:...]) to answer them."
  },
  fr: {
    welcome: "Bonjour, je suis le bot de contact de Houssam. Répondez à trois questions rapides et décrivez votre projet, il vous répondra ici. Ou écrivez simplement votre message.",
    types: { web: "Application web", ai: "Solution d'IA", db: "Base de données", other: "Autre chose" },
    budgets: { b0: "Pas encore sûr", b1: "Moins de 200 $", b2: "200 $ à 500 $", b3: "500 $ à 1 500 $", b4: "Plus de 1 500 $" },
    deadlines: { d0: "Pas pressé", d1: "Sous un mois", d2: "Sous une semaine" },
    askBudget: "Quelle fourchette de budget envisagez-vous ?",
    askDeadline: "Pour quand en avez-vous besoin ?",
    describe: "Décrivez votre besoin : ce que ça doit faire et pour qui.",
    placeholder: "Votre message",
    ack: "Merci, votre message est envoyé. Houssam vous répondra ici.",
    alsoRead: "Houssam lira aussi votre message et vous répondra ici.",
    ownerHint: "Répondez au message d'en-tête d'un client (celui qui contient [id:...]) pour lui répondre."
  },
  ar: {
    welcome: "مرحبًا، أنا بوت التواصل الخاص بحسام. أجب عن ثلاثة أسئلة سريعة وصف مشروعك وسيرد عليك هنا. أو اكتب رسالتك مباشرة.",
    types: { web: "تطبيق ويب", ai: "حل ذكاء اصطناعي", db: "قاعدة بيانات", other: "شيء آخر" },
    budgets: { b0: "لست متأكدًا بعد", b1: "أقل من 200$", b2: "200$ إلى 500$", b3: "500$ إلى 1,500$", b4: "أكثر من 1,500$" },
    deadlines: { d0: "بلا استعجال", d1: "خلال شهر", d2: "خلال أسبوع" },
    askBudget: "ما نطاق الميزانية الذي تفكر فيه؟",
    askDeadline: "متى تحتاجه؟",
    describe: "صف ما تحتاجه: ماذا يجب أن يفعل ولمن هو.",
    placeholder: "رسالتك",
    ack: "شكرًا، تم إرسال رسالتك. سيرد عليك حسام هنا.",
    alsoRead: "سيقرأ حسام رسالتك أيضًا ويرد عليك هنا.",
    ownerHint: "رُدّ على رسالة الترويسة الخاصة بالعميل (التي تحتوي [id:...]) لتجيبه."
  }
};

export function pickLang(code = "") {
  const c = String(code).slice(0, 2).toLowerCase();
  return TEXTS[c] ? c : "en";
}

function keyFromLabel(group, label) {
  for (const lang of Object.values(TEXTS)) {
    for (const [key, text] of Object.entries(lang[group])) if (text === label) return key;
  }
  return null;
}

/**
 * The guided brief carries its state in the prompt the bot sends: one line each for
 * type, budget and deadline, then the question. Read them back from the reply target.
 */
export function parsePrompt(text = "") {
  const [a, b, c] = String(text).split("\n");
  return { type: keyFromLabel("types", a), budget: keyFromLabel("budgets", b), deadline: keyFromLabel("deadlines", c) };
}
