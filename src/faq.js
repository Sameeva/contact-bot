// Fixed answers for common questions. Edit freely: keywords are matched against free-text
// messages (accents and case ignored), first match wins. Rules only, no language model.

const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ًͯ-ٟ]/g, "");

export const FAQ = [
  {
    id: "price",
    kw: {
      en: ["price", "prices", "pricing", "cost", "how much", "rate", "quote"],
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
  },
  {
    id: "bot",
    kw: {
      en: ["are you a bot", "are you real", "real person", "is this a bot", "who am i talking to"],
      fr: ["êtes-vous un bot", "es-tu un bot", "vraie personne"],
      ar: ["هل أنت بوت", "هل انت بوت", "شخص حقيقي"]
    },
    a: {
      en: "I'm a bot that collects your brief. Houssam reads every message himself and replies here.",
      fr: "Je suis un bot qui recueille votre besoin. Houssam lit lui-même chaque message et répond ici.",
      ar: "أنا بوت يجمع تفاصيل طلبك. يقرأ حسام كل رسالة بنفسه ويرد هنا."
    }
  },
  {
    id: "hello",
    maxWords: 3,
    kw: {
      en: ["hi", "hello", "hey", "good morning", "good evening"],
      fr: ["salut", "bonjour", "bonsoir", "coucou", "salam", "slm"],
      ar: ["مرحبا", "السلام عليكم", "اهلا", "أهلا", "سلام"]
    },
    a: {
      en: "Hello! Send /start for a quick guided brief, or just write what you need.",
      fr: "Bonjour ! Envoyez /start pour un court cadrage guidé, ou écrivez simplement votre besoin.",
      ar: "مرحبًا! أرسل /start لنقاش قصير موجّه، أو اكتب ما تحتاجه مباشرة."
    }
  },
  {
    id: "thanks",
    maxWords: 3,
    kw: {
      en: ["thanks", "thank you", "thx"],
      fr: ["merci"],
      ar: ["شكرا", "شكرًا", "جزاك الله"]
    },
    a: {
      en: "You're welcome! Houssam will reply here.",
      fr: "Avec plaisir ! Houssam vous répondra ici.",
      ar: "على الرحب والسعة! سيرد عليك حسام هنا."
    }
  }
];

const LANGS = ["en", "fr", "ar"];

export function faqAnswer(id, lang) {
  return FAQ.find((e) => e.id === id)?.a[lang];
}

const LATIN = /^[a-z0-9 '\-]+$/;
const escRe = (k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Latin keywords match whole words only ("rate" must not match "generate").
// Arabic has no reliable word boundary in plain text, so it keeps substring matching.
function hit(t, keyword) {
  const k = norm(keyword);
  return LATIN.test(k) ? new RegExp(`(^|[^a-z0-9])${escRe(k)}([^a-z0-9]|$)`).test(t) : t.includes(k);
}

export function matchFaq(text) {
  const t = norm(text);
  const words = t.split(/\s+/).filter(Boolean).length;
  for (const entry of FAQ) {
    if (entry.maxWords && words > entry.maxWords) continue;
    for (const lang of LANGS) {
      if (entry.kw[lang].some((k) => hit(t, k))) return { id: entry.id, lang, answer: entry.a[lang] };
    }
  }
  return null;
}
