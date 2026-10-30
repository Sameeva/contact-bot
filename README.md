# contact-bot

A Telegram bot that forwards messages from visitors to one owner, and relays the owner's replies back. It runs as a single Vercel serverless function with no database.

## How it works

- `/start` shows project types as buttons; the chosen type is added to the message the owner receives.
- Every client message is sent to the owner as a header (name, username, type, language, `[id:...]`) followed by the text. Photos and files are copied after the header.
- The owner replies to a header message in the bot chat, and the bot copies the reply to that client.
- Texts are in English, French and Arabic, chosen from the client's Telegram language.

## Setup

1. In Telegram, message `@BotFather`, send `/newbot` and keep the token.
2. Deploy: `npx vercel`, then add the environment variables below in the Vercel project settings and redeploy.

   | Variable | Value |
   | --- | --- |
   | `BOT_TOKEN` | token from BotFather |
   | `OWNER_CHAT_ID` | your numeric Telegram id (send `/id` to the bot once deployed, or use any id bot) |
   | `WEBHOOK_SECRET` | random string, letters, digits, `_` or `-`, 32+ characters |

3. Register the webhook:

   ```bash
   BOT_TOKEN=... WEBHOOK_SECRET=... npm run set-webhook https://<your-project>.vercel.app/api/webhook
   ```

Requests without the right `X-Telegram-Bot-Api-Secret-Token` header are rejected, and only the owner's id can relay replies.

## Tests

```bash
npm test
```
