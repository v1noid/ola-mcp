const WEBHOOK_URL = "https://ola.v1noid.com/webhook";

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "CHATGPT_RESPONSE") return;

  fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message.payload)
  }).then(async (response) => {
    if (!response.ok) {
      console.error("Ola webhook failed:", response.status, await response.text());
    }
  }).catch((error) => console.error("Ola webhook error:", error));
});
