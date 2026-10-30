// Fixed answers for common questions. Edit freely: keywords are matched against free-text
// messages (accents and case ignored), first match wins. Level 2 (a language model) would
// plug in where `matchFaq` returns null, see README.

const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ًͯ-ٟ]/g, "");

export const FAQ = [
  {
    id: "price",
    kw: {
      en: ["price", "pricing", "cost", "how much", "rate", "quote"],
      fr: ["prix", "tarif", "combien", "coût", "devis"],
      ar: ["سعر", "أسعار", "تكلفة", "ثمن", "بكم", "عرض سعر"]
    },
    a: {
      en: "Every project is different, so I quote after a short brief. Tell me what you need and I'll come back with a price.",
      fr: "Chaque projet est différent, donc je fais un devis après un court cadrage. Dites-moi ce dont vous avez besoin et je reviens avec un prix.",
      ar: "كل مشروع مختلف، لذلك أقدّم عرض سعر بعد نقاش قصير. أخبرني بما تحتاجه وسأعود إليك بسعر."
    }
  },
  {
    id: "time",
    kw: {
      en: ["how long", "timeline", "turnaround", "delivery time", "deadline"],
      fr: ["combien de temps", "délai", "livraison"],
      ar: ["كم يستغرق", "كم تستغرق", "مدة", "كم من الوقت", "موعد التسليم"]
    },
    a: {
      en: "Timing depends on the scope. After the brief I send you a clear estimate.",
      fr: "Le délai dépend du périmètre. Après le cadrage, je vous envoie une estimation claire.",
      ar: "تعتمد المدة على حجم العمل. بعد النقاش القصير أرسل لك تقديرًا واضحًا."
    }
  },
  {
    id: "process",
    kw: {
      en: ["how does it work", "how it works", "how do we start", "get started", "process"],
      fr: ["comment ça marche", "comment on commence", "processus", "démarrer"],
      ar: ["كيف نبدأ", "كيف يعمل", "كيف تعمل", "خطوات"]
    },
    a: {
      en: "Three steps: you describe what you need (brief), I build in small steps and show progress (build), and you get the working product with a short handover (deliver).",
      fr: "Trois étapes : vous décrivez votre besoin (cadrage), je construis par petites étapes en montrant l'avancement (réalisation), puis vous recevez le produit fonctionnel avec une courte prise en main (livraison).",
      ar: "ثلاث خطوات: تصف ما تحتاجه (الاتفاق)، أبني على مراحل صغيرة وأعرض التقدم (التنفيذ)، ثم تستلم المنتج جاهزًا مع شرح مختصر (التسليم)."
    }
  },
  {
    id: "services",
    kw: {
      en: ["services", "what do you do", "what can you", "do you build", "offer"],
      fr: ["services", "que faites", "que proposez", "proposez-vous"],
      ar: ["خدمات", "ماذا تفعل", "ماذا تقدم", "ما الذي تقدمه"]
    },
    a: {
      en: "I build web apps (Next.js and TypeScript), AI solutions (chatbots, assistants, automations) and databases (schema design, SQL, performance tuning).",
      fr: "Je crée des applications web (Next.js et TypeScript), des solutions d'IA (chatbots, assistants, automatisations) et des bases de données (conception de schémas, SQL, optimisation).",
      ar: "أبني تطبيقات ويب (Next.js وTypeScript)، وحلول ذكاء اصطناعي (روبوتات محادثة ومساعدين وأتمتة)، وقواعد بيانات (تصميم المخططات وSQL وتحسين الأداء)."
    }
  },
  {
    id: "portfolio",
    kw: {
      en: ["portfolio", "examples", "previous work", "your work", "demo", "samples"],
      fr: ["portfolio", "exemples", "réalisations", "vos projets", "démo"],
      ar: ["معرض", "أمثلة", "أعمالك", "نماذج"]
    },
    a: {
      en: "See my work here: https://sameeva.github.io",
      fr: "Voici mon travail : https://sameeva.github.io",
      ar: "هذه أعمالي: https://sameeva.github.io"
    }
  }
];

const LANGS = ["en", "fr", "ar"];

export function faqAnswer(id, lang) {
  return FAQ.find((e) => e.id === id)?.a[lang];
}

export function matchFaq(text) {
  const t = norm(text);
  for (const entry of FAQ) {
    for (const lang of LANGS) {
      if (entry.kw[lang].some((k) => t.includes(norm(k)))) return { id: entry.id, lang, answer: entry.a[lang] };
    }
  }
  return null;
}
