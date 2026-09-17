import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";

import * as z from "zod/v4";

const PORT = Number(Bun.env.PORT ?? 3100);
const WEBHOOK_URL = "https://ola.v1noid.com/webhook";

const mcp = createMcpHandler(() => {
  const server = new McpServer({
    name: "strix",
    version: "1.0.2",
  });

  server.registerTool(
    "send_webhook",
    {
      title: "Send Strix webhook",
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

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.text();

      if (!response.ok) {
        throw new Error(
          `Strix webhook failed: ${response.status} ${response.statusText}${
            responseBody ? ` - ${responseBody}` : ""
          }`,
        );
      }

      return {
        content: [
          {
            type: "text",
            text: `Webhook sent successfully: ${JSON.stringify(payload)}`,
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

    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        name: "strix",
        version: "1.0.2",
        mcp: "/mcp",
      });
    }

    if (url.pathname === "/mcp" || url.pathname === "/mcp/") {
      return mcp.fetch(req);
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Strix running at http://localhost:${PORT}/mcp`);
