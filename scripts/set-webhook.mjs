const url = process.argv[2];
const { BOT_TOKEN, WEBHOOK_SECRET } = process.env;
if (!url || !BOT_TOKEN || !WEBHOOK_SECRET) {
  console.error("Usage: BOT_TOKEN=... WEBHOOK_SECRET=... node scripts/set-webhook.mjs https://<host>/api/webhook");
  process.exit(1);
}
const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ url, secret_token: WEBHOOK_SECRET, allowed_updates: ["message", "callback_query"] })
});
console.log(await r.json());
