import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import type { Browser, Page } from "playwright";

const stealthPlugin = stealth();
stealthPlugin.enabledEvasions.delete("iframe.contentWindow");
stealthPlugin.enabledEvasions.delete("media.codecs");
chromium.use(stealthPlugin);

export class ChatGPTBrowser {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async launch() {
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage({ viewport: { width: 1440, height: 900 } });
    await this.page.goto("https://chatgpt.com/", { waitUntil: "domcontentloaded" });
    return this.page;
  }

  async waitForLogin(timeoutMs = 5 * 60 * 1000) {
    if (!this.page) throw new Error("Browser is not started");
    const deadline = Date.now() + timeoutMs;
    console.log("Waiting for ChatGPT login in the browser...");

    while (Date.now() < deadline) {
      const composer = this.page.locator('textarea, [contenteditable="true"], div[role="textbox"]').first();
      try {
        if (await composer.isVisible({ timeout: 500 })) return;
      } catch {}
      await this.page.waitForTimeout(1000);
    }
    throw new Error("Timed out waiting for ChatGPT login.");
  }

  async sendMessage(message: string) {
    if (!this.page) throw new Error("Browser is not started");
    const composer = this.page.locator('textarea, [contenteditable="true"], div[role="textbox"]').first();
    await composer.waitFor({ state: "visible", timeout: 15_000 });
    await composer.fill(message);
    await composer.press("Enter");

    const messages = this.page.locator('[data-message-author-role="assistant"]');
    const before = await messages.count();
    await this.page.waitForFunction(
      (previous) => document.querySelectorAll('[data-message-author-role="assistant"]').length > previous,
      before,
      { timeout: 120_000 }
    );

    const latest = messages.last();
    let last = "";
    for (let i = 0; i < 600; i++) {
      const current = (await latest.innerText()).trim();
      if (current && current === last) {
        await this.page.waitForTimeout(1200);
        if ((await latest.innerText()).trim() === current) return current;
      }
      last = current;
      await this.page.waitForTimeout(500);
    }
    return last;
  }

  async close() {
    await this.browser?.close();
    this.browser = null;
    this.page = null;
  }
}
