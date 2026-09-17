(() => {
  let lastResponse = "";

  function getLatestResponse() {
    const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
    return messages.length ? (messages[messages.length - 1].innerText || "").trim() : "";
  }

  async function check() {
    const response = getLatestResponse();
    if (!response || response === lastResponse) return;

    lastResponse = response;

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
})();
