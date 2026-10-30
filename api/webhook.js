import { handleUpdate } from "../src/handle.js";

export default async function handler(req, res) {
  const { BOT_TOKEN, WEBHOOK_SECRET, OWNER_CHAT_ID } = process.env;
  const ownerId = Number(OWNER_CHAT_ID);
  if (!BOT_TOKEN || !WEBHOOK_SECRET) return res.status(500).end();
  if (req.method !== "POST") return res.status(405).end();
  if (req.headers["x-telegram-bot-api-secret-token"] !== WEBHOOK_SECRET) return res.status(401).end();

  // Until OWNER_CHAT_ID is set, the bot only answers /id so the owner can read their id.
  const ownerSet = Number.isInteger(ownerId);
  const idOnly = !ownerSet && req.body?.message?.text?.trim() !== "/id";
  const calls = idOnly ? [] : handleUpdate(req.body, { ownerId });

  for (const { method, body } of calls) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!r.ok) console.error(method, r.status, await r.text());
    } catch {
      console.error(method, "request failed");
    }
  }
  res.status(200).end();
}
