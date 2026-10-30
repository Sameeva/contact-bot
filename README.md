# contact-bot

A Telegram bot that qualifies visitors with a short guided brief, answers common questions, and forwards everything to one owner. The owner's replies are relayed back. It runs as a single Vercel serverless function with no database and no paid APIs.

## How it works

- **Guided brief.** `/start` asks for a project type, a budget range and a deadline with buttons, then asks the visitor to describe the project. The owner receives one structured message.
- **FAQ.** Free-text questions about price, timing, process, services and portfolio get a fixed answer in the visitor's language (English, French or Arabic). The message is still forwarded to the owner and marked `Auto-answered`.
- **Relay.** Each message reaches the owner as a header (name, username, type, budget, deadline, language, `[id:...]`) followed by the text. Photos and files are copied after the header. The owner replies to a header in the bot chat, and the bot copies the reply to that visitor.
- **Stateless.** The brief travels inside the button data and the prompt text, so no storage is needed.

Commands: `/start`, `/help`, `/portfolio`, `/id`.

## Setup

1. In Telegram, message `@BotFather`, send `/newbot` and keep the token.
2. Deploy with `npx vercel`, then add these environment variables (production) in the Vercel project settings and redeploy:

   | Variable | Value |
   | --- | --- |
   | `BOT_TOKEN` | token from BotFather |
   | `OWNER_CHAT_ID` | your numeric Telegram id (send `/id` to the bot) |
   | `WEBHOOK_SECRET` | random string of letters, digits, `_` or `-`, 32+ characters |

   Until `OWNER_CHAT_ID` is set, the bot only answers `/id`.
3. Register the webhook:

   ```bash
   BOT_TOKEN=... WEBHOOK_SECRET=... npm run set-webhook https://<your-project>.vercel.app/api/webhook
   ```
4. Optional: in BotFather send `/setcommands`, pick the bot and paste:

   ```
   start - Start a guided brief
   portfolio - See my work
   help - How this bot works
   id - Show your Telegram id
   ```

Requests without the right `X-Telegram-Bot-Api-Secret-Token` header are rejected, and only the owner's id can relay replies.

## Customize

- Answers and keywords: `src/faq.js`.
- Texts, budget ranges and deadlines (three languages): `src/texts.js`.
- Flow and owner message format: `src/handle.js`.

## Extending with a language model

`matchFaq` in `src/faq.js` returns `null` when no fixed answer fits. That is the place to call a language model, with a short knowledge base and a hard fallback that forwards the message to the owner without promising prices or deadlines.

## Tests

```bash
npm test
```
