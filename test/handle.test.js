import test from "node:test";
import assert from "node:assert/strict";
import { handleUpdate } from "../src/handle.js";

const OWNER = 111;
const client = { id: 222, first_name: "Sara", username: "sara_x", language_code: "fr" };
const msg = (extra, from = client) => ({ message: { message_id: 7, chat: { id: from.id, type: "private" }, from, ...extra } });
const run = (u) => handleUpdate(u, { ownerId: OWNER });

test("/start shows the welcome text and four type buttons in the user's language", () => {
  const [c] = run(msg({ text: "/start" }));
  assert.equal(c.method, "sendMessage");
  assert.match(c.body.text, /^Bonjour/);
  assert.equal(c.body.reply_markup.inline_keyboard.length, 4);
  assert.equal(c.body.reply_markup.inline_keyboard[0][0].callback_data, "t:web");
});

test("choosing a type answers the callback and asks for a forced reply", () => {
  const calls = run({ callback_query: { id: "cb1", data: "t:ai", from: client, message: { chat: { id: 222 } } } });
  assert.equal(calls[0].method, "answerCallbackQuery");
  assert.equal(calls[1].body.reply_markup.force_reply, true);
  assert.match(calls[1].body.text, /^Solution d'IA\n\n/);
});

test("unknown callback data is ignored", () => {
  assert.deepEqual(run({ callback_query: { id: "x", data: "t:hack", from: client } }), []);
});

test("a client message reaches the owner with id, type and escaped name, then gets an ack", () => {
  const evil = { ...client, first_name: "<b>Sara</b>" };
  const calls = run(msg({ text: "Need a shop <site>", reply_to_message: { text: "Application web\n\nDécrivez..." } }, evil));
  const h = calls[0];
  assert.equal(h.body.chat_id, OWNER);
  assert.match(h.body.text, /\[id:222\]/);
  assert.match(h.body.text, /Type: Web app/);
  assert.match(h.body.text, /&lt;b&gt;Sara&lt;\/b&gt;/);
  assert.match(h.body.text, /Need a shop &lt;site&gt;/);
  assert.equal(calls.at(-1).body.chat_id, 222);
  assert.match(calls.at(-1).body.text, /^Merci/);
});

test("a media message is copied to the owner after the header", () => {
  const calls = run(msg({ photo: [{}] }));
  assert.deepEqual(calls.map((c) => c.method), ["sendMessage", "copyMessage", "sendMessage"]);
});

test("the owner's reply to a header is copied to that client", () => {
  const owner = { id: OWNER, first_name: "H" };
  const [c] = run(msg({ text: "On it", reply_to_message: { text: "New message\n[id:222]\n\nhi" } }, owner));
  assert.equal(c.method, "copyMessage");
  assert.equal(c.body.chat_id, 222);
});

test("the owner writing without a reply gets a hint, not a broadcast", () => {
  const owner = { id: OWNER, first_name: "H" };
  const calls = run(msg({ text: "hello" }, owner));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.chat_id, OWNER);
});

test("a client cannot relay messages by faking an id tag", () => {
  const calls = run(msg({ text: "x", reply_to_message: { text: "[id:999]" } }));
  assert.ok(calls.every((c) => c.method !== "copyMessage" || c.body.chat_id === OWNER));
  assert.equal(calls[0].body.chat_id, OWNER);
});

test("group chats and bots are ignored; /id works for anyone", () => {
  assert.deepEqual(run({ message: { chat: { id: 1, type: "group" }, from: client, text: "hi" } }), []);
  assert.deepEqual(run(msg({ text: "hi" }, { ...client, is_bot: true })), []);
  assert.equal(run(msg({ text: "/id" }))[0].body.text, "222");
});

test("very long messages are truncated", () => {
  const [h] = run(msg({ text: "a".repeat(9000) }));
  assert.ok(h.body.text.length < 4096);
});
