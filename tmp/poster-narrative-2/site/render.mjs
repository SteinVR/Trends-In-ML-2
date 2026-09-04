import { chromium } from "/Users/steinv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = "/Users/steinv/Uni-Trier/Trends-In-ML-2";
const source = path.join(root, "output/poster-narrative-2/site/index.html");
const outputDir = path.join(root, "output/poster-narrative-2/site");
const qaDir = path.join(root, "tmp/poster-narrative-2/site/qa");
const iteration = process.argv[2] || "iteration-1";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const pageUrl = `${pathToFileURL(source).href}?qa=${encodeURIComponent(iteration)}`;

await mkdir(outputDir, { recursive: true });
await mkdir(qaDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
  args: ["--font-render-hinting=none", "--disable-lcd-text"],
});

const exactA1ToPreviewScale = 0.5291666666666667;
const screenshotCss = `
  html, body {
    width: 1682px !important;
    height: 1188px !important;
    min-width: 1682px !important;
    min-height: 1188px !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: #fff !important;
  }
  .poster {
    transform: scale(${exactA1ToPreviewScale});
    transform-origin: 0 0;
  }
`;

async function preparePage(context, media = "screen") {
  const page = await context.newPage();
  await page.emulateMedia({ media });
  await page.goto(pageUrl, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

try {
  const pdfContext = await browser.newContext({ viewport: { width: 3400, height: 2400 } });
  const pdfPage = await preparePage(pdfContext, "print");
  await pdfPage.pdf({
    path: path.join(outputDir, "poster-narrative-2-site.pdf"),
    width: "841mm",
    height: "594mm",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  await pdfContext.close();

  const auditContext = await browser.newContext({ viewport: { width: 3400, height: 2400 } });
  const auditPage = await preparePage(auditContext, "screen");
  const diagnostics = await auditPage.evaluate(() => {
    const selectors = [
      ".poster",
      ".poster-header",
      ".hypothesis-panel",
      ".methodology",
      ".pipeline-figure",
      ".results",
      ".result-panels",
      ".system-panel",
      ".attribution-panel",
      ".boundary-panel",
      ".decision",
      ".limitations",
      ".poster-footer",
    ];
    return selectors.map((selector) => {
      const element = document.querySelector(selector);
      const rect = element.getBoundingClientRect();
      return {
        selector,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        overflowX: element.scrollWidth - element.clientWidth,
        overflowY: element.scrollHeight - element.clientHeight,
      };
    });
  });
  await writeFile(
    path.join(qaDir, `${iteration}-diagnostics.json`),
    `${JSON.stringify(diagnostics, null, 2)}\n`,
    "utf8",
  );
  const fontAudit = await auditPage.evaluate(() => {
    const svgTexts = [...document.querySelectorAll("svg text")].map((element) => {
      const matrix = element.getScreenCTM();
      const scaleY = Math.hypot(matrix.c, matrix.d);
      const fontSize = Number.parseFloat(getComputedStyle(element).fontSize);
      return {
        kind: "svg",
        text: element.textContent.trim(),
        effectivePt: Number((fontSize * scaleY * 0.75).toFixed(2)),
      };
    });
    const htmlTexts = [...document.querySelectorAll("p, h1, h2, h3, li, a, .micro-label, .section-index")]
      .filter((element) => !element.closest("svg") && element.textContent.trim())
      .map((element) => ({
        kind: "html",
        text: element.textContent.trim(),
        effectivePt: Number((Number.parseFloat(getComputedStyle(element).fontSize) * 0.75).toFixed(2)),
      }));
    const items = [...svgTexts, ...htmlTexts];
    return {
      minimumPt: Math.min(...items.map((item) => item.effectivePt)),
      below24Pt: items.filter((item) => item.effectivePt < 23.95),
      items,
    };
  });
  await writeFile(
    path.join(qaDir, `${iteration}-font-audit.json`),
    `${JSON.stringify(fontAudit, null, 2)}\n`,
    "utf8",
  );
  await auditContext.close();

  const hiContext = await browser.newContext({
    viewport: { width: 1682, height: 1188 },
    deviceScaleFactor: 3,
  });
  const hiPage = await preparePage(hiContext, "screen");
  await hiPage.addStyleTag({ content: screenshotCss });
  await hiPage.screenshot({
    path: path.join(outputDir, "poster-narrative-2-site.png"),
    fullPage: false,
    animations: "disabled",
  });
  await hiPage.screenshot({
    path: path.join(qaDir, `${iteration}-full.png`),
    fullPage: false,
    animations: "disabled",
  });
  for (const [name, selector] of [
    ["hypothesis", ".hypothesis"],
    ["methodology", ".methodology"],
    ["system", ".system-panel"],
    ["attribution", ".attribution-panel"],
    ["boundary", ".boundary-panel"],
    ["decision", ".decision-row"],
    ["footer", ".poster-footer"],
  ]) {
    await hiPage.locator(selector).screenshot({
      path: path.join(qaDir, `${iteration}-${name}.png`),
      animations: "disabled",
    });
  }
  await hiContext.close();

  const a4Context = await browser.newContext({
    viewport: { width: 1682, height: 1188 },
    deviceScaleFactor: 1,
  });
  const a4Page = await preparePage(a4Context, "screen");
  await a4Page.addStyleTag({ content: screenshotCss });
  await a4Page.screenshot({
    path: path.join(outputDir, "poster-narrative-2-site-a4.png"),
    fullPage: false,
    animations: "disabled",
  });
  await a4Context.close();
} finally {
  await browser.close();
}
