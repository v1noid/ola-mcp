const PORT = Number(Bun.env.PORT ?? 3100);

Bun.serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/webhook" && req.method === "POST") {
      const payload = await req.json();

      console.log("ChatGPT response:", payload);

      return Response.json({ ok: true });
    }

    if (url.pathname === "/health") {
      return Response.json({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Webhook server running on port ${PORT}`);
