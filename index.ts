import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";

import * as z from "zod/v4";

const PORT = 3100;

const mcp = createMcpHandler(() => {
  const server = new McpServer({
    name: "strix",
    version: "1.0.1",
  });

  server.registerTool(
    "send_webhook",
    {
      description: "Send text to the Strix webhook",
      inputSchema: z.object({
        text: z.string().min(1).describe("Text to send to the Strix webhook"),
      }),
    },
    async ({ text }) => {
      const payload = {
        message: text,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("https://ola.v1noid.com/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Strix webhook failed: ${response.status} ${response.statusText}`,
        );
      }

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
