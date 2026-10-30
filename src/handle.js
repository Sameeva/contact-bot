import { TEXTS, TYPE_KEYS, pickLang, typeFromPrompt } from "./texts.js";

const MAX_TEXT = 3500;
const ID_TAG = /\[id:(\d+)\]/;

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Turns one Telegram update into the list of Bot API calls to make.
 * Stateless: the project type travels in the prompt the bot sent, and the
 * client's chat id travels in the header message sent to the owner.
 */
export function handleUpdate(update, { ownerId }) {
  const calls = [];
  const call = (method, body) => calls.push({ method, body });

  if (update?.callback_query) {
    const q = update.callback_query;
    const key = String(q.data ?? "").replace(/^t:/, "");
    if (!TYPE_KEYS.includes(key)) return calls;
    const T = TEXTS[pickLang(q.from?.language_code)];
    call("answerCallbackQuery", { callback_query_id: q.id });
    call("sendMessage", {
      chat_id: q.from.id,
      text: `${T.types[key]}\n\n${T.describe}`,
      reply_markup: { force_reply: true, input_field_placeholder: T.placeholder }
    });
    return calls;
  }

  const m = update?.message;
  if (!m || m.chat?.type !== "private" || !m.from || m.from.is_bot) return calls;

  const uid = m.from.id;
  const text = m.text ?? m.caption ?? "";
  const T = TEXTS[pickLang(m.from.language_code)];

  if (text.trim() === "/id") {
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

  if (/^\/(start|help)(@\w+)?\b/.test(text)) {
    call("sendMessage", {
      chat_id: m.chat.id,
      text: T.welcome,
      reply_markup: {
        inline_keyboard: TYPE_KEYS.map((k) => [{ text: T.types[k], callback_data: `t:${k}` }])
      }
    });
    return calls;
  }

  const type = typeFromPrompt(m.reply_to_message?.text);
  const who = [m.from.first_name, m.from.last_name].filter(Boolean).join(" ") || "Unknown";
  const handle = m.from.username ? ` (@${esc(m.from.username)})` : "";
  const body = text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}...` : text;
  const header =
    `<b>New message</b>\nFrom: <b>${esc(who)}</b>${handle}\n` +
    `Type: ${type ? TEXTS.en.types[type] : "not chosen"}\n` +
    `Language: ${esc(m.from.language_code ?? "unknown")}\n[id:${m.chat.id}]` +
    (body ? `\n\n${esc(body)}` : "");

  call("sendMessage", { chat_id: ownerId, text: header, parse_mode: "HTML" });
  if (!text) call("copyMessage", { chat_id: ownerId, from_chat_id: m.chat.id, message_id: m.message_id });
  call("sendMessage", { chat_id: m.chat.id, text: T.ack });
  return calls;
}
