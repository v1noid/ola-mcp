chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "CHATGPT_RESPONSE") return;

  chrome.storage.local.get({ webhookUrl: "", enabled: true }).then(async (settings) => {
    if (!settings.enabled || !settings.webhookUrl) return;

    const response = await fetch(settings.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload)
    });

    if (!response.ok) {
      console.error("Ola webhook failed:", response.status, await response.text());
    }
  }).catch((error) => console.error("Ola webhook error:", error));
});
