import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";

import * as z from "zod/v4";

const PORT = 3100;

const mcp = createMcpHandler(() => {
  const server = new McpServer({
    name: "strix",
    version: "1.0.0",
  });

  server.registerTool(
    "send_webhook",
    {
      description: "Send a random payload to the Strix webhook",
      inputSchema: z.object({}),
    },
    async () => {
      const payload = {
        message: "hello",
        random: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };

      await fetch("https://ola.v1noid.com/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(payload),
          },
        ],
      };
    },
  );

  return server;
});

Bun.serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url);

    console.log(req.method, url.pathname);

    if (url.pathname === "/mcp") {
      return mcp.fetch(req);
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Strix running at http://localhost:${PORT}/mcp`);
