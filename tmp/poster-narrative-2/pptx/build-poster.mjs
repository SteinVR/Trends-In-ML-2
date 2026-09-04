import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = "/Users/steinv/Uni-Trier/Trends-In-ML-2";
const TMP = path.join(ROOT, "tmp/poster-narrative-2/pptx");
const OUT = path.join(ROOT, "output/poster-narrative-2/pptx");
const MODE = process.argv[2] || "draft-1";
const FINAL = MODE === "final";

const PX_PER_PT = 96 / 72;
const pt = (value) => value * PX_PER_PT;
const mm = (value) => (value / 25.4) * 96;

const W = mm(841);
const H = mm(594);

const C = {
  blue: "#3D8DFF",
  blueSoft: "#EAF3FF",
  cyan: "#69C5E8",
  cyanSoft: "#EAF8FC",
  raw: "#AEB5C0",
  amber: "#E97132",
  amberSoft: "#FFF2E9",
  ink: "#111318",
  secondary: "#58606B",
  panel: "#F3F6F9",
  rule: "#D8DEE6",
  white: "#FFFFFF",
};

function lineStyle(color = C.rule, width = 1) {
  return { style: "solid", fill: color, width };
}

function addRect(slide, name, x, y, w, h, fill, options = {}) {
  const geometry = options.geometry || "rect";
  const config = {
    geometry,
    name,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: options.line || lineStyle("none", 0),
    shadow: options.shadow || "shadow-none",
  };
  if (["rect", "textbox", "roundRect"].includes(geometry) && options.radius) {
    config.borderRadius = options.radius;
  }
  return slide.shapes.add(config);
}

function addText(slide, name, text, x, y, w, h, options = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: lineStyle("none", 0),
  });
  shape.text = text;
  shape.text.style = {
    typeface: "Arial",
    fontSize: pt(options.size || 24),
    bold: options.bold || false,
    italic: options.italic || false,
    color: options.color || C.ink,
    alignment: options.align || "left",
    verticalAlignment: options.valign || "top",
    lineSpacing: options.lineSpacing || 0.96,
    wrap: "square",
    autoFit: "none",
    insets: {
      top: options.insetTop || 0,
      right: options.insetRight || 0,
      bottom: options.insetBottom || 0,
      left: options.insetLeft || 0,
    },
  };
  return shape;
}

function addLine(slide, name, x1, y1, x2, y2, color, width = 2) {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const w = Math.max(Math.abs(x2 - x1), 1);
  const h = Math.max(Math.abs(y2 - y1), 1);
  return slide.shapes.add({
    geometry: "line",
    name,
    position: {
      left,
      top,
      width: w,
      height: h,
      horizontalFlip: x2 < x1,
      verticalFlip: y2 < y1,
    },
    fill: "none",
    line: lineStyle(color, width),
  });
}

function addDot(slide, name, x, y, radius, fill, line = "none") {
  return slide.shapes.add({
    geometry: "ellipse",
    name,
    position: { left: x - radius, top: y - radius, width: radius * 2, height: radius * 2 },
    fill,
    line: lineStyle(line, line === "none" ? 0 : 2),
  });
}

function addSectionLabel(slide, name, label, x, y, width) {
  addRect(slide, `${name}-marker`, x, y + 7, 10, 43, C.blue);
  addText(slide, name, label, x + 26, y, width - 26, 58, {
    size: 38,
    bold: true,
    color: C.ink,
  });
}

function addMetricValue(slide, name, value, label, x, y, width, color = C.ink) {
  addText(slide, `${name}-value`, value, x, y, width, 65, {
    size: 40,
    bold: true,
    color,
    align: "center",
    valign: "middle",
  });
  addText(slide, `${name}-label`, label, x - 10, y + 69, width + 20, 78, {
    size: 24,
    color: C.secondary,
    align: "center",
    lineSpacing: 0.92,
  });
}

function normalizedY(value, min, max, top, height) {
  return top + height - ((value - min) / (max - min)) * height;
}

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(TMP, { recursive: true });
  await fs.mkdir(OUT, { recursive: true });

  const presentation = Presentation.create({ slideSize: { width: W, height: H } });
  const slide = presentation.slides.add();
  slide.background.fill = C.white;

  const M = 92;
  const contentW = W - 2 * M;

  // Header
  addText(slide, "eyebrow", "RESEARCH POSTER  |  NATURAL LANGUAGE PROCESSING", M, 48, 1120, 42, {
    size: 24,
    bold: true,
    color: C.blue,
  });
  addText(slide, "title", "From Legal PDFs to Verifiable Answers", M, 92, 2360, 118, {
    size: 72,
    bold: true,
    color: C.ink,
    lineSpacing: 0.9,
  });
  addText(
    slide,
    "subtitle",
    "Evaluating answer quality, page-level grounding and latency across 100 legal questions",
    M,
    212,
    2300,
    58,
    { size: 34, color: C.secondary },
  );
  addText(
    slide,
    "repository",
    "github.com/SteinVR/Agentic-RAG-Challenge",
    W - M - 720,
    150,
    720,
    38,
    { size: 24, bold: true, color: C.blue, align: "right" },
  );
  addText(
    slide,
    "affiliation",
    "Trends in Machine Learning II  |  Universität Trier",
    W - M - 720,
    202,
    720,
    38,
    { size: 24, color: C.secondary, align: "right" },
  );
  addRect(slide, "header-rule", M, 282, contentW, 3, C.ink);

  // Hypothesis strip
  addRect(slide, "hypothesis-bg", M, 310, contentW, 220, C.blueSoft, { radius: 18 });
  addSectionLabel(slide, "hypothesis-label", "HYPOTHESIS", M + 26, 337, 360);
  addText(
    slide,
    "research-question",
    "Can a page-traceable Legal RAG pipeline balance answer quality, source grounding, validity and latency?",
    M + 390,
    330,
    1520,
    84,
    { size: 30, bold: true, color: C.ink, lineSpacing: 0.94 },
  );
  addText(
    slide,
    "secondary-question",
    "H2: Does answer-aware attribution sharpen citations while retaining at least one correct page per annotated question?",
    M + 390,
    424,
    1520,
    66,
    { size: 24, color: C.secondary, lineSpacing: 0.94 },
  );
  addRect(slide, "hypothesis-divider", M + 1950, 338, 3, 150, C.rule);
  addText(
    slide,
    "hypothesis-finding-label",
    "FINDING",
    M + 1990,
    334,
    250,
    38,
    { size: 24, bold: true, color: C.blue },
  );
  addText(
    slide,
    "hypothesis-finding",
    "H1 is partly supported: grounding missed its 0.85 threshold. H2 holds for precision, compactness and 95/95 hit coverage.",
    M + 1990,
    382,
    contentW - 2015,
    108,
    { size: 26, bold: true, color: C.ink, lineSpacing: 0.94 },
  );

  // Methodology section heading and experiment descriptor
  addSectionLabel(slide, "methodology-label", "METHODOLOGY", M, 565, 500);
  addText(
    slide,
    "methodology-data",
    "100 questions  |  30 publicly available legal PDFs  |  590 pages  |  95 with page annotations",
    M + 560,
    573,
    contentW - 560,
    44,
    { size: 26, bold: true, color: C.secondary, align: "right" },
  );
  addRect(slide, "methodology-rule", M, 625, contentW, 2, C.rule);

  const stageWidths = [410, 410, 520, 410, 520, 444];
  const stageGap = 38;
  const stageTotal = stageWidths.reduce((sum, value) => sum + value, 0) + stageGap * 5;
  const stageStart = M + (contentW - stageTotal) / 2;
  const stageY = 660;
  const stageH = 250;
  const stageXs = [];
  let cursor = stageStart;
  for (const stageWidth of stageWidths) {
    stageXs.push(cursor);
    cursor += stageWidth + stageGap;
  }

  // Flow arrows and provenance rail are created before nodes so they sit behind them.
  for (let i = 0; i < stageXs.length - 1; i += 1) {
    addRect(
      slide,
      `pipeline-arrow-${i + 1}`,
      stageXs[i] + stageWidths[i] + 4,
      stageY + 105,
      stageGap - 8,
      38,
      i === 3 || i === 4 ? C.blue : C.raw,
      { geometry: "rightArrow" },
    );
  }
  const railY = 974;
  addRect(slide, "provenance-rail", stageXs[0] + 28, railY, stageTotal - 56, 12, C.blue, { radius: 6 });
  stageXs.forEach((x, index) => {
    addDot(slide, `provenance-dot-${index + 1}`, x + stageWidths[index] / 2, railY + 6, 13, C.white, C.blue);
  });

  const stages = [
    {
      kicker: "01  SOURCE",
      title: "Page-stable ingestion",
      body: "Native text + tables\nOCR fallback available",
      fill: C.panel,
      accent: C.raw,
    },
    {
      kicker: "02  REPRESENT",
      title: "Multi-view index",
      body: "Page, section, clause,\nmicrochunk and table",
      fill: C.panel,
      accent: C.cyan,
    },
    {
      kicker: "03  RETRIEVE",
      title: "Hybrid retrieve + rerank",
      body: "BM25 + Qwen3 Embedding\nRRF + Qwen3 Reranker",
      fill: C.cyanSoft,
      accent: C.cyan,
    },
    {
      kicker: "04  ANSWER",
      title: "Typed answer",
      body: "gpt-5.4-mini\nstrict JSON + validators",
      fill: C.panel,
      accent: C.cyan,
    },
    {
      kicker: "05  ATTRIBUTE",
      title: "Answer-aware pages",
      body: "Support check + fallback\nraw -> filter -> final",
      fill: C.blue,
      accent: C.white,
      inverse: true,
    },
    {
      kicker: "06  VERIFY",
      title: "Auditable output",
      body: "Answer + pages + trace\nvalidity + TTFT",
      fill: C.panel,
      accent: C.blue,
    },
  ];

  stages.forEach((stage, index) => {
    const x = stageXs[index];
    const w = stageWidths[index];
    addRect(slide, `stage-${index + 1}-box`, x, stageY, w, stageH, stage.fill, {
      radius: 18,
      line: lineStyle(stage.inverse ? C.blue : C.rule, stage.inverse ? 0 : 2),
    });
    addRect(slide, `stage-${index + 1}-accent`, x, stageY, 12, stageH, stage.accent, { radius: 6 });
    addText(slide, `stage-${index + 1}-kicker`, stage.kicker, x + 30, stageY + 25, w - 55, 34, {
      size: 24,
      bold: true,
      color: stage.inverse ? C.white : C.blue,
    });
    addText(slide, `stage-${index + 1}-title`, stage.title, x + 30, stageY + 76, w - 55, 74, {
      size: 28,
      bold: true,
      color: stage.inverse ? C.white : C.ink,
      lineSpacing: 0.9,
    });
    addText(slide, `stage-${index + 1}-body`, stage.body, x + 30, stageY + 156, w - 55, 76, {
      size: 24,
      color: stage.inverse ? C.white : C.secondary,
      lineSpacing: 0.92,
    });
  });
  addText(
    slide,
    "provenance-label",
    "CONTINUOUS PROVENANCE  |  document_id + page_number",
    M + 720,
    940,
    1580,
    42,
    { size: 24, bold: true, color: C.blue, align: "center" },
  );
  addText(
    slide,
    "provenance-explanation",
    "The same identifiers survive every stage, so a final citation can be traced back to the exact PDF page.",
    M + 400,
    1005,
    contentW - 800,
    52,
    { size: 25, bold: true, color: C.ink, align: "center" },
  );
  addText(
    slide,
    "evaluation-design",
    "Evaluation A: end-to-end profile on 100 questions.  Evaluation B: paired raw -> filter -> final page sets on the same 95 annotated questions.",
    M + 170,
    1060,
    contentW - 340,
    48,
    { size: 24, color: C.secondary, align: "center" },
  );

  // Results scaffold
  const resultsTop = 1140;
  const resultsBottom = 1810;
  addRect(slide, "results-top-rule", M, resultsTop, contentW, 3, C.ink);
  addRect(slide, "results-bottom-rule", M, resultsBottom, contentW, 2, C.rule);

  const sx = M + 12;
  const sw = 888;
  const ax = M + 938;
  const aw = 1100;
  const bx = M + 2074;
  const bw = contentW - 2086;
  addRect(slide, "results-separator-1", M + 918, resultsTop + 22, 2, 590, C.rule);
  addRect(slide, "results-separator-2", M + 2056, resultsTop + 22, 2, 590, C.rule);

  // Results: System
  addText(slide, "results-system-label", "RESULTS  |  SYSTEM", sx, 1164, sw, 44, {
    size: 26,
    bold: true,
    color: C.blue,
  });
  addText(slide, "results-system-title", "Grounding limits an otherwise strong system", sx, 1210, sw, 72, {
    size: 30,
    bold: true,
    color: C.ink,
    lineSpacing: 0.92,
  });
  addRect(slide, "system-equation-panel", sx, 1288, sw - 6, 286, C.panel, { radius: 16 });

  const eqY = 1314;
  const eq = [
    { x: sx + 14, w: 142, value: "0.956", label: "answer\nquality", color: C.ink },
    { x: sx + 176, w: 142, value: "0.847", label: "grounding\nn = 100", color: C.amber },
    { x: sx + 338, w: 142, value: "1.000", label: "valid\noutputs", color: C.ink },
    { x: sx + 500, w: 142, value: "0.938", label: "latency\nmultiplier", color: C.ink },
    { x: sx + 690, w: 168, value: "0.759", label: "total\nscore", color: C.blue },
  ];
  addText(slide, "eq-times-1", "x", sx + 150, eqY + 7, 28, 42, { size: 27, bold: true, color: C.raw, align: "center" });
  addText(slide, "eq-times-2", "x", sx + 312, eqY + 7, 28, 42, { size: 27, bold: true, color: C.raw, align: "center" });
  addText(slide, "eq-times-3", "x", sx + 474, eqY + 7, 28, 42, { size: 27, bold: true, color: C.raw, align: "center" });
  addText(slide, "eq-equals", "=", sx + 642, eqY + 4, 48, 48, { size: 31, bold: true, color: C.ink, align: "center" });
  eq.forEach((item, index) => {
    addText(slide, `equation-${index + 1}-value`, item.value, item.x, eqY, item.w, 58, {
      size: index === 4 ? 36 : 33,
      bold: true,
      color: item.color,
      align: "center",
      valign: "middle",
    });
    addText(slide, `equation-${index + 1}-label`, item.label, item.x - 5, eqY + 64, item.w + 10, 68, {
      size: 24,
      color: C.secondary,
      align: "center",
      lineSpacing: 0.9,
    });
  });
  addRect(slide, "grounding-warning", sx + 176, 1458, 142, 6, C.amber, { radius: 3 });
  addText(slide, "grounding-threshold", "0.847 < 0.850", sx + 145, 1482, 220, 42, {
    size: 24,
    bold: true,
    color: C.amber,
    align: "center",
    lineSpacing: 0.94,
  });
  addText(slide, "valid-detail", "100/100\nvalid outputs", sx + 360, 1475, 180, 68, {
    size: 24,
    bold: true,
    color: C.ink,
    align: "center",
    lineSpacing: 0.9,
  });
  addText(slide, "latency-detail", "Mean TTFT\n6.39 s", sx + 530, 1475, 170, 68, {
    size: 24,
    bold: true,
    color: C.amber,
    align: "center",
    lineSpacing: 0.9,
  });
  addText(slide, "answer-detail", "0.943 deterministic  |  0.987 free text", sx + 8, 1600, sw - 16, 40, {
    size: 24,
    color: C.secondary,
    lineSpacing: 0.92,
  });
  addText(slide, "system-interpretation", "H1 is partly supported: quality, validity and latency pass; benchmark grounding misses 0.85.", sx + 8, 1650, sw - 16, 82, {
    size: 25,
    bold: true,
    color: C.ink,
    lineSpacing: 0.94,
  });

  // Results: Attribution
  addText(slide, "results-attribution-label", "RESULTS  |  ATTRIBUTION", ax, 1164, aw, 44, {
    size: 26,
    bold: true,
    color: C.blue,
  });
  addText(slide, "results-attribution-title", "Answer-aware selection removes citation noise", ax, 1210, aw, 52, {
    size: 31,
    bold: true,
    color: C.ink,
  });
  addText(slide, "attribution-sample", "Macro averages  |  n = 95 annotated questions", ax, 1260, aw, 38, {
    size: 24,
    color: C.secondary,
  });

  const plotXs = [ax + 310, ax + 620, ax + 930];
  const plotLabels = ["RAW", "FILTER", "FINAL"];
  const plotColors = [C.raw, C.cyan, C.blue];
  plotLabels.forEach((label, index) => {
    addText(slide, `plot-stage-${index + 1}`, label, plotXs[index] - 90, 1302, 180, 34, {
      size: 24,
      bold: true,
      color: plotColors[index],
      align: "center",
    });
  });

  const metrics = [
    { key: "precision", label: "Precision", unit: "%", values: [63.8, 63.8, 73.9], min: 60, max: 76, top: 1365 },
    { key: "recall", label: "Recall", unit: "%", values: [96.8, 96.2, 95.2], min: 94, max: 98, top: 1435 },
    { key: "fbeta", label: "F-beta", unit: "%", values: [87.7, 87.3, 89.2], min: 86.5, max: 90, top: 1505 },
    { key: "pages", label: "Pages / Q", unit: "", values: [2.56, 2.54, 2.23], min: 2.15, max: 2.65, top: 1575 },
  ];

  metrics.forEach((metric) => {
    const rowTop = metric.top;
    const rowHeight = 34;
    addText(slide, `${metric.key}-row-label`, metric.label, ax, rowTop + 4, 210, 38, {
      size: 24,
      bold: true,
      color: C.ink,
    });
    const ys = metric.values.map((value) => normalizedY(value, metric.min, metric.max, rowTop, rowHeight));
    addLine(slide, `${metric.key}-line-1`, plotXs[0], ys[0], plotXs[1], ys[1], C.raw, 5);
    addLine(slide, `${metric.key}-line-2`, plotXs[1], ys[1], plotXs[2], ys[2], C.blue, 5);
    metric.values.forEach((value, index) => {
      addDot(slide, `${metric.key}-dot-${index + 1}`, plotXs[index], ys[index], 12, plotColors[index], C.white);
      const label = metric.unit ? `${value.toFixed(1)}${metric.unit}` : value.toFixed(2);
      addText(slide, `${metric.key}-value-${index + 1}`, label, plotXs[index] - 70, ys[index] - 42, 140, 32, {
        size: 24,
        bold: index === 2,
        color: index === 2 ? C.blue : C.secondary,
        align: "center",
      });
    });
  });

  addRect(slide, "attribution-callout-rule", ax, 1642, aw, 2, C.rule);
  const calloutW = aw / 3;
  const callouts = [
    { value: "+10.2 pp", label: "precision\n95% CI +6.3 to +14.4", color: C.blue },
    { value: "-0.33", label: "pages / question\n95% CI -0.46 to -0.20", color: C.ink },
    { value: "95/95", label: "hit coverage retained\nF-beta gain uncertain", color: C.cyan },
  ];
  callouts.forEach((item, index) => {
    const x = ax + index * calloutW;
    addRect(slide, `callout-accent-${index + 1}`, x, 1657, 7, 88, item.color);
    addText(slide, `callout-value-${index + 1}`, item.value, x + 22, 1651, calloutW - 30, 46, {
      size: 30,
      bold: true,
      color: item.color,
    });
    addText(slide, `callout-label-${index + 1}`, item.label, x + 22, 1695, calloutW - 30, 58, {
      size: 24,
      color: C.secondary,
      lineSpacing: 0.9,
    });
  });

  // Results: Boundary
  addText(slide, "results-boundary-label", "RESULTS  |  BOUNDARY", bx, 1164, bw, 44, {
    size: 26,
    bold: true,
    color: C.amber,
  });
  addText(slide, "results-boundary-title", "Narrowing helps local - and hurts distributed evidence", bx, 1210, bw, 82, {
    size: 30,
    bold: true,
    color: C.ink,
    lineSpacing: 0.91,
  });
  addText(slide, "boundary-subtitle", "Exploratory F-beta delta (pp), raw -> final", bx, 1295, bw, 38, {
    size: 24,
    color: C.secondary,
  });

  const zeroX = bx + 495;
  const barScale = 72;
  addRect(slide, "boundary-zero-line", zeroX, 1335, 3, 315, C.ink);
  const bars = [
    { key: "single-page", label: "Single page", n: 59, value: 4.0, y: 1352 },
    { key: "multi-page", label: "Multi page", n: 36, value: -2.6, y: 1424 },
    { key: "single-doc", label: "Single document", n: 60, value: 3.2, y: 1496 },
    { key: "multi-doc", label: "Multi document", n: 35, value: -1.4, y: 1568 },
  ];
  bars.forEach((bar) => {
    addText(slide, `${bar.key}-label`, `${bar.label}\nn = ${bar.n}`, bx, bar.y - 8, 285, 66, {
      size: 24,
      bold: true,
      color: C.ink,
      lineSpacing: 0.88,
    });
    const width = Math.abs(bar.value) * barScale;
    const x = bar.value >= 0 ? zeroX : zeroX - width;
    const color = bar.value >= 0 ? C.blue : C.amber;
    addRect(slide, `${bar.key}-bar`, x, bar.y + 3, width, 34, color, { radius: 7 });
    const labelX = bar.value >= 0 ? x + width + 14 : x - 102;
    addText(slide, `${bar.key}-value`, `${bar.value > 0 ? "+" : ""}${bar.value.toFixed(1)}`, labelX, bar.y - 2, 100, 44, {
      size: 24,
      bold: true,
      color,
      align: bar.value >= 0 ? "left" : "right",
    });
  });
  addText(slide, "boundary-axis-left", "-3", zeroX - 235, 1655, 100, 34, {
    size: 24,
    color: C.secondary,
    align: "center",
  });
  addText(slide, "boundary-axis-zero", "0", zeroX - 30, 1655, 60, 34, {
    size: 24,
    color: C.secondary,
    align: "center",
  });
  addText(slide, "boundary-axis-right", "+5", zeroX + 315, 1655, 110, 34, {
    size: 24,
    color: C.secondary,
    align: "center",
  });
  addText(slide, "boundary-conclusion", "Multi-page regression is the clearest failure boundary.", bx, 1702, bw, 38, {
    size: 25,
    bold: true,
    color: C.amber,
  });

  addRect(slide, "metric-distinction-bg", M, 1758, contentW, 50, C.panel);
  addText(
    slide,
    "metric-distinction",
    "Do not conflate: benchmark grounding 0.847 = all 100 answers; macro page F-beta 0.892 = final attribution on 95 annotated questions.",
    M + 30,
    1766,
    contentW - 60,
    36,
    { size: 24, bold: true, color: C.secondary, align: "center" },
  );

  // Decision and limitations
  addRect(slide, "decision-strip", M, 1825, contentW, 104, C.ink, { radius: 14 });
  addText(slide, "decision-label", "DECISION", M + 38, 1848, 270, 55, {
    size: 30,
    bold: true,
    color: C.cyan,
    valign: "middle",
  });
  addText(
    slide,
    "decision-text",
    "Retrieve broadly. Attribute explicitly. Narrow conservatively when evidence spans pages or documents.",
    M + 315,
    1845,
    contentW - 360,
    62,
    { size: 31, bold: true, color: C.white, valign: "middle" },
  );

  addText(slide, "limitations-label", "LIMITATIONS", M, 1950, 300, 42, {
    size: 26,
    bold: true,
    color: C.ink,
  });
  const limW = (contentW - 80) / 3;
  const limitations = [
    {
      head: "ONE SAVED RUN",
      body: "Retrospective thresholds and questions; no repeated seeds.",
    },
    {
      head: "NO CAUSAL ABLATION",
      body: "Pipeline stages were not independently compared against a baseline.",
    },
    {
      head: "LIMITED GENERALITY",
      body: "TTFT only; OCR not exercised; one DIFC corpus and one language setting.",
    },
  ];
  limitations.forEach((item, index) => {
    const x = M + index * (limW + 40);
    addRect(slide, `limitation-rule-${index + 1}`, x, 2004, 85, 6, index === 2 ? C.amber : C.blue, { radius: 3 });
    addText(slide, `limitation-head-${index + 1}`, item.head, x, 2022, limW, 34, {
      size: 24,
      bold: true,
      color: index === 2 ? C.amber : C.blue,
    });
    addText(slide, `limitation-body-${index + 1}`, item.body, x, 2060, limW, 62, {
      size: 24,
      color: C.secondary,
      lineSpacing: 0.92,
    });
  });

  // References footer
  addRect(slide, "references-rule", M, 2136, contentW, 2, C.ink);
  addText(
    slide,
    "references-line-1",
    "[1] Lewis et al., NeurIPS 2020   [2] Karpukhin et al., EMNLP 2020   [3] Cormack et al., SIGIR 2009   [4] Gao et al., EMNLP 2023",
    M,
    2149,
    contentW,
    34,
    { size: 24, color: C.secondary },
  );
  addText(
    slide,
    "references-line-2",
    "[5] Pipitone & Alami, LegalBench-RAG 2024   [6] Zhang et al., Qwen3 Embedding 2025   |   Full references in appendix.",
    M,
    2186,
    contentW,
    34,
    { size: 24, color: C.secondary },
  );

  slide.speakerNotes.textFrame.setText(
    "[Sources]\n" +
      "Internal source of truth: /Users/steinv/Uni-Trier/Trends-In-ML-2/poster-narrative-2.md\n" +
      "Formal requirements: /Users/steinv/Uni-Trier/Trends-In-ML-2/Poster-Examination-Guidelines.pdf\n" +
      "Primary run report: artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/eval/benchmark_report.json\n" +
      "Primary page ledger: artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/grounding/ledger.csv\n" +
      "Lewis et al. (2020), https://proceedings.neurips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html\n" +
      "Karpukhin et al. (2020), https://aclanthology.org/2020.emnlp-main.550/\n" +
      "Cormack et al. (2009), https://doi.org/10.1145/1571941.1572114\n" +
      "Gao et al. (2023), https://aclanthology.org/2023.emnlp-main.398/\n" +
      "Pipitone and Houir Alami (2024), https://arxiv.org/abs/2408.10343\n" +
      "Zhang et al. (2025), https://arxiv.org/abs/2506.05176",
  );
  slide.speakerNotes.setVisible(true);

  const preview = await presentation.export({ slide, format: "png", scale: 1 });
  await writeBlob(path.join(TMP, `${MODE}-artifact-preview.png`), preview);

  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(TMP, `${MODE}-layout.json`), await layout.text());

  const snapshot = await presentation.inspect({
    kind: "slide,textbox,shape,notes,layout",
    maxChars: 60000,
  });
  await fs.writeFile(path.join(TMP, `${MODE}-snapshot.ndjson`), snapshot.ndjson);

  const pptx = await PresentationFile.exportPptx(presentation);
  const pptxPath = FINAL
    ? path.join(OUT, "poster-narrative-2-pptx.pptx")
    : path.join(TMP, `${MODE}.pptx`);
  await pptx.save(pptxPath);
  console.log(JSON.stringify({ mode: MODE, pptxPath, width: W, height: H }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
