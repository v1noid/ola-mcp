# ola-mcp

## Acute

Acute is a local terminal agent that drives a logged-in ChatGPT session through a real, non-headless Chromium browser.

### Install

```bash
bun install
```

### Run

```bash
bun run acute
```

Or link the CLI globally from this checkout:

```bash
bun link
acute
```

Acute opens `chatgpt.com`, waits for you to log in manually, then provides an interactive terminal prompt. Each prompt is entered into the real ChatGPT page through Playwright and the assistant response is read back into the terminal.

The browser uses `playwright-extra` with `puppeteer-extra-plugin-stealth`. The `iframe.contentWindow` and `media.codecs` evasions are disabled to match the working setup this project is based on.

This is browser automation rather than an API integration. ChatGPT DOM changes can require selector maintenance.
