# Discord API

Lightweight HTTP service to post messages to Discord via a webhook, mirroring the structure of `faucet-api/`.

## Endpoints

- `GET /` — Service info
- `GET /health` — Health check
- `POST /discord/post` — Post a message to Discord webhook
  - Body:
    ```json
    {
      "message": "Hello from sei-mcp!",
      "username": "optional-override"
    }
    ```

## Environment

Copy `env.example` to `.env` and set:

- `PORT` — HTTP port (default 3001)
- `DISCORD_WEBHOOK_URL` — Discord Incoming Webhook URL

## Development

```bash
# from discord-api/
npm install
npm run dev
# or build & start
npm run build
npm start
```

## Deploy

Deploy like any Node service (Render, Railway, Vercel Functions/Serverless, Fly.io, etc.). Expose the base URL, e.g. `https://your-discord-api.onrender.com`.

## Integrate with MCP Server

In the MCP server environment (or your Windsurf MCP config), set the base URL so the server proxies `discord_post_message` to this service:

```
DISCORD_API_URL=https://your-discord-api.onrender.com
```

The MCP server will call `POST {DISCORD_API_URL}/discord/post` with `{ message, username }`.
