import test from "node:test";
import assert from "node:assert/strict";
import { handleUpdate } from "../src/handle.js";
import { matchFaq } from "../src/faq.js";
import { parsePrompt } from "../src/texts.js";

const OWNER = 111;
const client = { id: 222, first_name: "Sara", username: "sara_x", language_code: "fr" };
const msg = (extra, from = client) => ({ message: { message_id: 7, chat: { id: from.id, type: "private" }, from, ...extra } });
const cb = (data, from = client) => ({ callback_query: { id: "cb1", data, from, message: { message_id: 9, chat: { id: from.id } } } });
const run = (u) => handleUpdate(u, { ownerId: OWNER });
const methods = (calls) => calls.map((c) => c.method);

test("/start shows the welcome text and four type buttons in the user's language", () => {
  const [c] = run(msg({ text: "/start" }));
  assert.match(c.body.text, /^Bonjour/);
  assert.equal(c.body.reply_markup.inline_keyboard.length, 4);
  assert.equal(c.body.reply_markup.inline_keyboard[0][0].callback_data, "t:web");
});

test("step 1: choosing a type edits the message into the budget question", () => {
  const calls = run(cb("t:ai"));
  assert.deepEqual(methods(calls), ["answerCallbackQuery", "editMessageText"]);
  assert.match(calls[1].body.text, /^Solution d'IA\n\nQuelle fourchette/);
  assert.equal(calls[1].body.reply_markup.inline_keyboard.length, 5);
  assert.equal(calls[1].body.reply_markup.inline_keyboard[2][0].callback_data, "b:ai:b2");
});

test("step 2: choosing a budget asks for the deadline", () => {
  const calls = run(cb("b:ai:b2"));
  assert.equal(calls[1].body.reply_markup.inline_keyboard[1][0].callback_data, "d:ai:b2:d1");
});

test("step 3: choosing a deadline recaps and asks for the description with a forced reply", () => {
  const calls = run(cb("d:ai:b2:d1"));
  assert.deepEqual(methods(calls), ["answerCallbackQuery", "editMessageText", "sendMessage"]);
  assert.equal(calls[1].body.reply_markup, undefined);
  const prompt = calls[2].body;
  assert.equal(prompt.reply_markup.force_reply, true);
  assert.deepEqual(parsePrompt(prompt.text), { type: "ai", budget: "b2", deadline: "d1" });
});

test("tampered or unknown callback data is ignored", () => {
  for (const d of ["t:hack", "b:ai:zzz", "d:ai:b2:d9", "x:ai", "", "b:ai", "d:ai:b2"]) assert.deepEqual(run(cb(d)), [], d);
});

test("a brief reply reaches the owner with type, budget, deadline and id, then gets an ack", () => {
  const prompt = "Application web\n200 $ à 500 $\nSous un mois\n\nDécrivez...";
  const calls = run(msg({ text: "A shop <site>", reply_to_message: { text: prompt } }, { ...client, first_name: "<b>Sara</b>" }));
  const h = calls[0].body;
  assert.equal(h.chat_id, OWNER);
  for (const re of [/\[id:222\]/, /Type: Web app/, /Budget: \$200 to \$500/, /Deadline: Within a month/, /&lt;b&gt;Sara&lt;\/b&gt;/, /A shop &lt;site&gt;/]) assert.match(h.text, re);
  assert.match(calls.at(-1).body.text, /^Merci/);
});

test("FAQ: price questions get a fixed answer in the matching language and still reach the owner", () => {
  for (const q of ["How much does it cost?", "C'est quoi le tarif ?", "كم السعر؟ بكم هذا"]) {
    const calls = run(msg({ text: q }));
    assert.match(calls[0].body.text, /Auto-answered: price/);
    assert.deepEqual(methods(calls), ["sendMessage", "sendChatAction", "sendMessage"]);
    assert.doesNotMatch(calls.at(-1).body.text, /\d+\s?\$|\$\s?\d+/);
  }
});

test("FAQ matching: language and topics", () => {
  assert.equal(matchFaq("How long will it take? what's the timeline").id, "time");
  assert.equal(matchFaq("Comment ça marche ?").lang, "fr");
  assert.equal(matchFaq("Do you have a portfolio?").id, "portfolio");
  assert.equal(matchFaq("What services do you offer").id, "services");
  assert.equal(matchFaq("I need a mobile game with 3D graphics"), null);
});

test("an unmatched message gets the plain ack and is forwarded", () => {
  const calls = run(msg({ text: "I need a mobile game" }));
  assert.match(calls[0].body.text, /Brief: not used/);
  assert.doesNotMatch(calls[0].body.text, /Auto-answered/);
  assert.match(calls.at(-1).body.text, /^Merci/);
});

test("/portfolio answers with the link and does not notify the owner", () => {
  const calls = run(msg({ text: "/portfolio" }));
  assert.equal(calls.length, 1);
  assert.match(calls[0].body.text, /sameeva\.github\.io/);
});

test("a media message is copied to the owner after the header", () => {
  assert.deepEqual(methods(run(msg({ photo: [{}] }))), ["sendMessage", "copyMessage", "sendMessage"]);
});

test("the owner's reply to a header is copied to that client", () => {
  const owner = { id: OWNER, first_name: "H" };
  const [c] = run(msg({ text: "On it", reply_to_message: { text: "New message\n[id:222]\n\nhi" } }, owner));
  assert.equal(c.method, "copyMessage");
  assert.equal(c.body.chat_id, 222);
});

test("the owner writing without a reply gets a hint, not a broadcast", () => {
  const calls = run(msg({ text: "hello" }, { id: OWNER, first_name: "H" }));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.chat_id, OWNER);
});

test("a client cannot relay messages by faking an id tag", () => {
  const calls = run(msg({ text: "x", reply_to_message: { text: "[id:999]" } }));
  assert.ok(calls.every((c) => c.body.chat_id !== 999));
  assert.equal(calls[0].body.chat_id, OWNER);
});

test("group chats and bots are ignored; /id works for anyone", () => {
  assert.deepEqual(run({ message: { chat: { id: 1, type: "group" }, from: client, text: "hi" } }), []);
  assert.deepEqual(run(msg({ text: "hi" }, { ...client, is_bot: true })), []);
  assert.equal(run(msg({ text: "/id" }))[0].body.text, "222");
});

test("very long messages are truncated", () => {
  assert.ok(run(msg({ text: "a".repeat(9000) }))[0].body.text.length < 4096);
});
