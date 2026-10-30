import { TEXTS, TYPE_KEYS, BUDGET_KEYS, DEADLINE_KEYS, pickLang, parsePrompt } from "./texts.js";
import { matchFaq, faqAnswer } from "./faq.js";

const MAX_TEXT = 3500;
const ID_TAG = /\[id:(\d+)\]/;

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rows = (items) => ({ inline_keyboard: items.map(([text, data]) => [{ text, callback_data: data }]) });

/**
 * Turns one Telegram update into the list of Bot API calls to make.
 * Stateless: the guided brief travels in button data and in the prompt text the bot sends,
 * and the client's chat id travels in the header message sent to the owner.
 */
export function handleUpdate(update, { ownerId }) {
  const calls = [];
  const call = (method, body) => calls.push({ method, body });

  if (update?.callback_query) {
    const q = update.callback_query;
    const T = TEXTS[pickLang(q.from?.language_code)];
    const [kind, type, budget, deadline] = String(q.data ?? "").split(":");
    const valid =
      q.from?.id &&
      TYPE_KEYS.includes(type) &&
      (budget === undefined || BUDGET_KEYS.includes(budget)) &&
      (deadline === undefined || DEADLINE_KEYS.includes(deadline));
    if (!valid) return calls;

    const chatId = q.from.id;
    const messageId = q.message?.message_id;
    const show = (text, markup) =>
      messageId
        ? call("editMessageText", { chat_id: chatId, message_id: messageId, text, ...(markup && { reply_markup: markup }) })
        : call("sendMessage", { chat_id: chatId, text, ...(markup && { reply_markup: markup }) });

    if (kind === "t" && budget === undefined) {
      call("answerCallbackQuery", { callback_query_id: q.id });
      show(`${T.types[type]}\n\n${T.askBudget}`, rows(BUDGET_KEYS.map((b) => [T.budgets[b], `b:${type}:${b}`])));
    } else if (kind === "b" && budget !== undefined && deadline === undefined) {
      call("answerCallbackQuery", { callback_query_id: q.id });
      show(`${T.types[type]}\n${T.budgets[budget]}\n\n${T.askDeadline}`, rows(DEADLINE_KEYS.map((d) => [T.deadlines[d], `d:${type}:${budget}:${d}`])));
    } else if (kind === "d" && budget !== undefined && deadline !== undefined) {
      call("answerCallbackQuery", { callback_query_id: q.id });
      const recap = [T.types[type], T.budgets[budget], T.deadlines[deadline]].join("\n");
      show(recap);
      call("sendMessage", {
        chat_id: chatId,
        text: `${recap}\n\n${T.describe}`,
        reply_markup: { force_reply: true, input_field_placeholder: T.placeholder }
      });
    }
    return calls;
  }

  const m = update?.message;
  if (!m || m.chat?.type !== "private" || !m.from || m.from.is_bot) return calls;

  const uid = m.from.id;
  const text = m.text ?? m.caption ?? "";
  const lang = pickLang(m.from.language_code);
  const T = TEXTS[lang];
  const command = /^\/(\w+)(@\w+)?\b/.exec(text.trim())?.[1];

  if (command === "id") {
    call("sendMessage", { chat_id: m.chat.id, text: String(uid) });
    return calls;
  }

  if (uid === ownerId) {
    const replied = m.reply_to_message;
    const target = ID_TAG.exec(replied?.text ?? replied?.caption ?? "")?.[1];
    if (target) {
      call("copyMessage", { chat_id: Number(target), from_chat_id: m.chat.id, message_id: m.message_id });
    } else {
      call("sendMessage", { chat_id: m.chat.id, text: TEXTS.en.ownerHint });
    }
    return calls;
  }

  if (command === "start" || command === "help") {
    call("sendMessage", { chat_id: m.chat.id, text: T.welcome, reply_markup: rows(TYPE_KEYS.map((k) => [T.types[k], `t:${k}`])) });
    return calls;
  }
  if (command === "portfolio") {
    call("sendMessage", { chat_id: m.chat.id, text: faqAnswer("portfolio", lang) });
    return calls;
  }

  const brief = parsePrompt(m.reply_to_message?.text);
  const inBrief = Boolean(brief.type);
  const faq = !inBrief && !m.reply_to_message && text ? matchFaq(text) : null;

  const who = [m.from.first_name, m.from.last_name].filter(Boolean).join(" ") || "Unknown";
  const handle = m.from.username ? ` (@${esc(m.from.username)})` : "";
  const body = text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}...` : text;
  const lines = [
    "<b>New message</b>",
    `From: <b>${esc(who)}</b>${handle}`,
    inBrief && `Type: ${TEXTS.en.types[brief.type]}`,
    inBrief && brief.budget && `Budget: ${TEXTS.en.budgets[brief.budget]}`,
    inBrief && brief.deadline && `Deadline: ${TEXTS.en.deadlines[brief.deadline]}`,
    !inBrief && "Brief: not used",
    `Language: ${esc(m.from.language_code ?? "unknown")}`,
    faq && `Auto-answered: ${faq.id}`,
    `[id:${m.chat.id}]`
  ].filter(Boolean);
  const header = lines.join("\n") + (body ? `\n\n${esc(body)}` : "");

  call("sendMessage", { chat_id: ownerId, text: header, parse_mode: "HTML" });
  if (!text) call("copyMessage", { chat_id: ownerId, from_chat_id: m.chat.id, message_id: m.message_id });

  if (faq) {
    call("sendChatAction", { chat_id: m.chat.id, action: "typing" });
    call("sendMessage", { chat_id: m.chat.id, text: `${faq.answer}\n\n${TEXTS[faq.lang].alsoRead}` });
  } else {
    call("sendMessage", { chat_id: m.chat.id, text: T.ack });
  }
  return calls;
}
