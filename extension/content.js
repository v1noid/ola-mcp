(() => {
  let lastObserved = "";
  let lastUrl = location.href;

  function getAssistantMessages() {
    const selectors = [
      '[data-message-author-role="assistant"]',
      'div[data-testid^="conversation-turn-"][data-message-author-role="assistant"]'
    ];

    for (const selector of selectors) {
      const nodes = [...document.querySelectorAll(selector)];
      if (nodes.length) return nodes;
    }
    return [];
  }

  function getLatestText() {
    const messages = getAssistantMessages();
    if (!messages.length) return "";
    return (messages[messages.length - 1].innerText || "").trim();
  }

  async function check() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      lastObserved = "";
    }

    const response = getLatestText();
    if (!response || response === lastObserved) return;
    lastObserved = response;

    const settings = await chrome.storage.local.get({
      webhookUrl: "",
      enabled: true
    });

    if (!settings.enabled || !settings.webhookUrl) return;

    chrome.runtime.sendMessage({
      type: "CHATGPT_RESPONSE",
      payload: {
        response,
        conversationUrl: location.href,
        timestamp: new Date().toISOString()
      }
    });
  }

  setInterval(check, 1000);

  new MutationObserver(check).observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true
  });
})();
