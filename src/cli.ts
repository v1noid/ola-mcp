#!/usr/bin/env bun
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { ChatGPTBrowser } from "./chatgpt";

const rl = createInterface({ input, output });
const browser = new ChatGPTBrowser();

function header() {
  console.clear();
  console.log("╭──────────────────────────────────────────────╮");
  console.log("│                     acute                    │");
  console.log("│       ChatGPT browser agent · Playwright     │");
  console.log("╰──────────────────────────────────────────────╯");
  console.log("Browser: non-headless · stealth enabled");
  console.log("Type a message and press Enter. /exit to quit.\n");
}

async function main() {
  const shutdown = async () => {
    await browser.close();
    rl.close();
    process.exit(0);
  };
  process.once("SIGINT", shutdown);

  header();
  await browser.launch();
  console.log("Browser opened. Log into ChatGPT if needed.");
  await browser.waitForLogin();
  header();

  while (true) {
    const prompt = (await rl.question("❯ ")).trim();
    if (!prompt) continue;
    if (prompt === "/exit" || prompt === "/quit") break;

    process.stdout.write("\nacute is thinking...\n");
    try {
      const response = await browser.sendMessage(prompt);
      console.log("\nChatGPT\n────────\n");
      console.log(response || "(No response text detected.)");
      console.log();
    } catch (error) {
      console.error("\nRequest failed:", error instanceof Error ? error.message : error);
      console.log("The browser remains open for inspection.\n");
    }
  }

  await browser.close();
  rl.close();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await browser.close();
  rl.close();
  process.exit(1);
});
