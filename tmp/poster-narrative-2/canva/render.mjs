import { pathToFileURL } from "node:url";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/steinv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const source = "/Users/steinv/Uni-Trier/Trends-In-ML-2/output/poster-narrative-2/canva/canva-source.html";
const output = "/Users/steinv/Uni-Trier/Trends-In-ML-2/output/poster-narrative-2/canva/poster-narrative-2-canva.pdf";
const qaDir = "/Users/steinv/Uni-Trier/Trends-In-ML-2/tmp/poster-narrative-2/canva";

await mkdir(qaDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Users/steinv/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1130 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(source).href, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
await page.evaluate(() => document.fonts.ready);

const diagnostics = await page.evaluate(() => {
  const poster = document.querySelector(".poster");
  const all = [...document.querySelectorAll(".poster *")];
  const overflow = all
    .filter((el) => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
    .map((el) => ({
      tag: el.tagName,
      className: el.className?.baseVal ?? el.className ?? "",
      text: (el.textContent ?? "").trim().slice(0, 120),
      client: [el.clientWidth, el.clientHeight],
      scroll: [el.scrollWidth, el.scrollHeight],
    }));
  const textElements = all.filter((el) =>
    [...el.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
  );
  const textSizes = textElements.map((el) => ({
    tag: el.tagName,
    className: el.className?.baseVal ?? el.className ?? "",
    text: (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 100),
    fontPx: Number.parseFloat(getComputedStyle(el).fontSize),
  }));
  const undersizedText = textSizes.filter((item) => item.fontPx < 31.9);
  const rect = poster.getBoundingClientRect();
  return {
    title: document.title,
    poster: { width: rect.width, height: rect.height, ratio: rect.width / rect.height },
    elementCount: all.length,
    minAudienceFontPx: Math.min(...textSizes.map((item) => item.fontPx)),
    undersizedText,
    overflow,
  };
});

console.log(JSON.stringify(diagnostics, null, 2));

await page.pdf({
  path: output,
  width: "841mm",
  height: "594mm",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});

await page.screenshot({
  path: `${qaDir}/browser-check.png`,
  fullPage: true,
  animations: "disabled",
});

await browser.close();
