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
    this.page = await this.browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    await this.page.goto("https://chatgpt.com/", {
      waitUntil: "domcontentloaded",
    });

    return this.page;
  }

  private composer() {
    if (!this.page) throw new Error("Browser is not started");

    return this.page.getByRole("textbox", { name: "Chat with ChatGPT" });
  }

  async waitForLogin(timeoutMs = 5 * 60 * 1000) {
    if (!this.page) throw new Error("Browser is not started");

    console.log("Waiting for ChatGPT login in the browser...");

    await this.composer().waitFor({
      state: "visible",
      timeout: timeoutMs,
    });
  }

  async sendMessage(message: string) {
    if (!this.page) throw new Error("Browser is not started");

    const composer = this.composer();

    await composer.waitFor({
      state: "visible",
      timeout: 15_000,
    });

    await composer.fill(message);
    await this.page.getByTestId("send-button").click();

    return this.waitForResponse();
  }

  private async waitForResponse() {
    if (!this.page) throw new Error("Browser is not started");

    const assistantMessages = this.page.locator(
      '[data-message-author-role="assistant"]'
    );

    const before = await assistantMessages.count();

    await this.page.waitForFunction(
      (previous) =>
        document.querySelectorAll(
          '[data-message-author-role="assistant"]'
        ).length > previous,
      before,
      { timeout: 120_000 }
    );

    const latest = assistantMessages.last();
    let last = "";

    for (let i = 0; i < 600; i++) {
      const current = (await latest.innerText()).trim();

      if (current && current === last) {
        await this.page.waitForTimeout(1200);

        const stable = (await latest.innerText()).trim();

        if (stable === current) {
          return current;
        }

        last = stable;
      } else {
        last = current;
      }

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
