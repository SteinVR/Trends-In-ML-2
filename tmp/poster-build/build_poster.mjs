import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT_DIR = "/Users/steinv/Uni-Trier/Trends-In-ML-2/output/poster";
const TMP_DIR = "/Users/steinv/Uni-Trier/Trends-In-ML-2/tmp/poster-build";
const FINAL_PPTX = `${OUT_DIR}/citation-aware-legal-rag-poster-draft.pptx`;

const W = 3179;
const H = 2245;
const M = 82;
const FONT = "Arial";
const C = {
  canvas: "#FFFFFF",
  ink: "#111318",
  muted: "#58606B",
  panel: "#F2F3F5",
  panelBlue: "#EAF6FC",
  rule: "#B8BCC4",
  blue: "#3D8DFF",
  blueLight: "#6DCBF4",
  bluePale: "#D0EDFA",
  white: "#FFFFFF",
};

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

function addText(slide, name, text, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontSize: 32,
    typeface: FONT,
    color: C.ink,
    alignment: "left",
    verticalAlignment: "top",
    autoFit: "none",
    wrap: "square",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
    ...style,
  };
  return shape;
}

function addSectionLabel(slide, x, y, number, label, width) {
  addText(slide, `section-${number}-number`, number, { left: x, top: y, width: 58, height: 42 }, {
    fontSize: 24,
    bold: true,
    color: C.blue,
  });
  addText(slide, `section-${number}-label`, label, { left: x + 62, top: y - 3, width: width - 62, height: 52 }, {
    fontSize: 40,
    bold: true,
    color: C.ink,
  });
  slide.shapes.add({
    geometry: "line",
    name: `section-${number}-rule`,
    position: { left: x, top: y + 55, width, height: 0 },
    fill: "none",
    line: { style: "solid", fill: C.rule, width: 2 },
  });
}

function addBulletList(slide, name, items, position, fontSize = 31, color = C.ink) {
  const shape = addText(slide, name, "", position, { fontSize, color, lineSpacing: 1.05 });
  shape.text.set(items.map((item) => ({
    bulletCharacter: "•",
    marginLeft: 26,
    indent: -16,
    spaceAfter: 850,
    runs: Array.isArray(item) ? item : [item],
  })));
  shape.text.style = {
    fontSize,
    typeface: FONT,
    color,
    alignment: "left",
    verticalAlignment: "top",
    autoFit: "none",
    wrap: "square",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return shape;
}

function addMetric(slide, x, y, value, label, accent = C.blue) {
  slide.shapes.add({
    geometry: "rect",
    name: `metric-accent-${value}`,
    position: { left: x, top: y + 6, width: 10, height: 116 },
    fill: accent,
    line: { style: "solid", fill: accent, width: 0 },
  });
  addText(slide, `metric-value-${value}`, value, { left: x + 28, top: y, width: 270, height: 62 }, {
    fontSize: 50,
    bold: true,
    color: C.ink,
  });
  addText(slide, `metric-label-${value}`, label, { left: x + 28, top: y + 66, width: 280, height: 66 }, {
    fontSize: 32,
    color: C.muted,
  });
}

function addArchNode(slide, x, y, w, h, step, title, lines, emphasized = false) {
  const box = slide.shapes.add({
    geometry: "rect",
    name: `architecture-${step}`,
    position: { left: x, top: y, width: w, height: h },
    fill: emphasized ? C.blue : C.panel,
    line: { style: "solid", fill: emphasized ? C.blue : C.rule, width: emphasized ? 0 : 1.5 },
    borderRadius: 12,
  });
  addText(slide, `architecture-${step}-step`, String(step).padStart(2, "0"), { left: x + 24, top: y + 20, width: 58, height: 34 }, {
    fontSize: 22,
    bold: true,
    color: emphasized ? C.white : C.blue,
  });
  addText(slide, `architecture-${step}-title`, title, { left: x + 24, top: y + 62, width: w - 48, height: 54 }, {
    fontSize: 32,
    bold: true,
    color: emphasized ? C.white : C.ink,
  });
  addText(slide, `architecture-${step}-body`, lines, { left: x + 24, top: y + 126, width: w - 48, height: h - 144 }, {
    fontSize: 32,
    color: emphasized ? C.white : C.muted,
    lineSpacing: 1.02,
  });
  return box;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(TMP_DIR, { recursive: true });

  const presentation = Presentation.create({ slideSize: { width: W, height: H } });
  const slide = presentation.slides.add();
  slide.background.fill = C.canvas;

  // Header: restrained Codex Grid-inspired hierarchy.
  addText(slide, "eyebrow", "RESEARCH POSTER · NATURAL LANGUAGE PROCESSING", { left: M, top: 54, width: 1550, height: 38 }, {
    fontSize: 24,
    bold: true,
    color: C.blue,
  });
  addText(slide, "title", "A Citation-Aware Legal RAG Pipeline", { left: M, top: 104, width: 2250, height: 108 }, {
    fontSize: 82,
    bold: true,
    color: C.ink,
    lineSpacing: 0.92,
  });
  addText(slide, "subtitle", "Architecture and page-level grounding evaluation across 100 legal questions", { left: M, top: 224, width: 2200, height: 54 }, {
    fontSize: 34,
    color: C.muted,
  });
  const repo = addText(slide, "repo", "github.com/SteinVR/Agentic-RAG-Challenge", { left: 2390, top: 72, width: 705, height: 46 }, {
    fontSize: 25,
    bold: true,
    color: C.blue,
    alignment: "right",
  });
  repo.text.get("github.com/SteinVR/Agentic-RAG-Challenge").link = {
    uri: "https://github.com/SteinVR/Agentic-RAG-Challenge",
    isExternal: true,
  };
  addText(slide, "affiliation", "Trends in Machine Learning II · Universität Trier", { left: 2250, top: 126, width: 845, height: 42 }, {
    fontSize: 25,
    color: C.muted,
    alignment: "right",
  });
  slide.shapes.add({
    geometry: "line",
    name: "header-rule",
    position: { left: M, top: 304, width: W - 2 * M, height: 0 },
    fill: "none",
    line: { style: "solid", fill: C.ink, width: 3 },
  });

  // Mandatory hypothesis section.
  addSectionLabel(slide, M, 346, "01", "HYPOTHESIS", W - 2 * M);
  slide.shapes.add({
    geometry: "rect",
    name: "hypothesis-band",
    position: { left: M, top: 424, width: W - 2 * M, height: 126 },
    fill: C.panelBlue,
    line: { style: "solid", fill: C.bluePale, width: 1 },
    borderRadius: 10,
  });
  addText(slide, "hypothesis-question", "Does answer-aware page attribution improve citation precision without creating complete source misses?", { left: M + 32, top: 449, width: 1960, height: 72 }, {
    fontSize: 38,
    bold: true,
    color: C.ink,
  });
  addText(slide, "hypothesis-statement", "H1 · A separate page-selection layer increases precision while retaining at least one correct page per answer.", { left: 2100, top: 445, width: 980, height: 82 }, {
    fontSize: 32,
    color: C.muted,
  });

  // Methodology: architecture is the visual spine.
  addSectionLabel(slide, M, 592, "02", "METHODOLOGY · SYSTEM ARCHITECTURE", W - 2 * M);
  const archY = 682;
  const nodeW = 380;
  const nodeH = 245;
  const gap = 48;
  const archX = M + 6;

  // Arrow shapes are authored before nodes so links remain visually behind entities.
  for (let i = 0; i < 6; i += 1) {
    slide.shapes.add({
      geometry: "rightArrow",
      name: `architecture-arrow-${i + 1}`,
      position: {
        left: archX + nodeW + i * (nodeW + gap) + 7,
        top: archY + 96,
        width: gap - 14,
        height: 38,
      },
      fill: i === 5 ? C.blue : C.rule,
      line: { style: "solid", fill: "none", width: 0 },
    });
  }
  addArchNode(slide, archX + 0 * (nodeW + gap), archY, nodeW, nodeH, 1, "Legal PDFs", "Page identity retained\nfrom ingestion onward");
  addArchNode(slide, archX + 1 * (nodeW + gap), archY, nodeW, nodeH, 2, "Parse & triage", "Native text · tables\nOCR fallback for scans");
  addArchNode(slide, archX + 2 * (nodeW + gap), archY, nodeW, nodeH, 3, "Multi-view index", "Page · section · clause\nmicrochunk · table");
  addArchNode(slide, archX + 3 * (nodeW + gap), archY, nodeW, nodeH, 4, "Hybrid retrieval", "BM25 + Qwen3 dense\nRRF candidate fusion");
  addArchNode(slide, archX + 4 * (nodeW + gap), archY, nodeW, nodeH, 5, "Rerank & answer", "Qwen3 reranker\ntyped extraction + LLM");
  addArchNode(slide, archX + 5 * (nodeW + gap), archY, nodeW, nodeH, 6, "Page attribution", "Answer-aware narrowing\nvalidation + fallback", true);
  addArchNode(slide, archX + 6 * (nodeW + gap), archY, nodeW, nodeH, 7, "Auditable output", "Answer · pages · trace\nlatency telemetry");

  slide.shapes.add({
    geometry: "rect",
    name: "page-contract-band",
    position: { left: M, top: 950, width: W - 2 * M, height: 70 },
    fill: C.ink,
    line: { style: "solid", fill: C.ink, width: 0 },
  });
  addText(slide, "page-contract", "Architectural invariant: every chunk keeps its document_id and page_number, so retrieval, answering, and citations remain traceable.", { left: M + 28, top: 968, width: W - 2 * M - 56, height: 38 }, {
    fontSize: 32,
    bold: true,
    color: C.white,
    alignment: "center",
  });

  // Lower evidence area: three columns, preserving the grid silhouette.
  const lowerTop = 1070;
  const lowerBottom = 2078;
  const gutter = 48;
  const col1 = 895;
  const col2 = 1140;
  const col3 = W - 2 * M - col1 - col2 - 2 * gutter;
  const x1 = M;
  const x2 = x1 + col1 + gutter;
  const x3 = x2 + col2 + gutter;

  addText(slide, "methods-title", "Experiment", { left: x1, top: lowerTop, width: col1, height: 52 }, {
    fontSize: 40,
    bold: true,
  });
  slide.shapes.add({ geometry: "line", name: "methods-rule", position: { left: x1, top: lowerTop + 62, width: col1, height: 0 }, fill: "none", line: { style: "solid", fill: C.rule, width: 2 } });
  addBulletList(slide, "methods-bullets", [
    [{ run: "Corpus: ", textStyle: { bold: true } }, "30 legal PDFs, 590 pages."],
    [{ run: "Questions: ", textStyle: { bold: true } }, "100 total; 95 have gold page annotations."],
    [{ run: "Answer types: ", textStyle: { bold: true } }, "32 boolean, 30 free text, 17 number, 15 name, 5 names, 1 date."],
    [{ run: "Paired comparison: ", textStyle: { bold: true } }, "raw pages → filter pass A → final answer-aware pages."],
    [{ run: "Metrics: ", textStyle: { bold: true } }, "macro precision, recall, and Fβ with β = 2.5."],
    [{ run: "Uncertainty: ", textStyle: { bold: true } }, "20,000 paired bootstrap resamples over 95 questions."],
  ], { left: x1, top: lowerTop + 92, width: col1, height: 610 }, 32);
  slide.shapes.add({
    geometry: "rect",
    name: "prior-work-band",
    position: { left: x1, top: lowerTop + 725, width: col1, height: 245 },
    fill: C.panel,
    line: { style: "solid", fill: C.rule, width: 1 },
    borderRadius: 10,
  });
  addText(slide, "prior-work-title", "Research context", { left: x1 + 24, top: lowerTop + 746, width: col1 - 48, height: 42 }, {
    fontSize: 32,
    bold: true,
  });
  addText(slide, "prior-work-copy", "RAG couples retrieval and generation [1]; dense retrieval complements lexical search [2,3]. Citation-aware evaluation treats provenance as a separate quality dimension [4,5].", { left: x1 + 24, top: lowerTop + 804, width: col1 - 48, height: 142 }, {
    fontSize: 32,
    color: C.muted,
    lineSpacing: 1.08,
  });

  addText(slide, "results-title", "03  RESULTS · Page-level grounding by stage", { left: x2, top: lowerTop, width: col2, height: 52 }, {
    fontSize: 40,
    bold: true,
  });
  addText(slide, "results-subtitle", "Macro averages on 95 questions with annotated source pages", { left: x2, top: lowerTop + 52, width: col2, height: 38 }, {
    fontSize: 25,
    color: C.muted,
  });
  slide.charts.add("bar", {
    position: { left: x2 - 10, top: lowerTop + 100, width: col2 + 10, height: 575 },
    categories: ["Precision", "Recall", "Fβ (β=2.5)"],
    series: [
      { name: "Raw retrieval", categories: ["Precision", "Recall", "Fβ (β=2.5)"], values: [0.637719, 0.967544, 0.876697], fill: C.rule, valuesFormatCode: "0%" },
      { name: "Filter pass A", categories: ["Precision", "Recall", "Fβ (β=2.5)"], values: [0.637719, 0.962281, 0.873113], fill: C.blueLight, valuesFormatCode: "0%" },
      { name: "Final attribution", categories: ["Precision", "Recall", "Fβ (β=2.5)"], values: [0.739474, 0.951754, 0.891790], fill: C.blue, valuesFormatCode: "0%" },
    ],
    hasLegend: true,
    legend: { position: "top", overlay: false, textStyle: { fontSize: 27, fill: C.muted } },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { fontSize: 27, fill: C.ink, bold: true } },
    chartFill: C.white,
    chartLine: { style: "solid", fill: C.white, width: 0 },
    plotAreaFill: { type: "none" },
    plotAreaLine: { style: "solid", fill: C.white, width: 0 },
    xAxis: { visible: true, line: { style: "solid", fill: C.rule, width: 1 }, textStyle: { fontSize: 29, fill: C.ink } },
    yAxis: {
      visible: true,
      min: 0,
      max: 1,
      majorUnit: 0.2,
      numberFormatCode: "0%",
      majorGridlines: { style: "solid", fill: "#E3E5E8", width: 1 },
      line: { style: "solid", fill: C.rule, width: 1 },
      textStyle: { fontSize: 25, fill: C.muted },
    },
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 75 },
  });
  slide.shapes.add({ geometry: "line", name: "results-metric-rule", position: { left: x2, top: lowerTop + 700, width: col2, height: 0 }, fill: "none", line: { style: "solid", fill: C.rule, width: 2 } });
  addMetric(slide, x2 + 10, lowerTop + 740, "+10.2 pp", "precision\n95% CI: +6.3 to +14.5", C.blue);
  addMetric(slide, x2 + 386, lowerTop + 740, "95 / 95", "retain ≥1 correct page", C.blueLight);
  addMetric(slide, x2 + 752, lowerTop + 740, "−0.33", "pages cited per question", C.ink);

  addText(slide, "findings-title", "What the result supports", { left: x3, top: lowerTop, width: col3, height: 52 }, {
    fontSize: 40,
    bold: true,
  });
  slide.shapes.add({ geometry: "line", name: "findings-rule", position: { left: x3, top: lowerTop + 62, width: col3, height: 0 }, fill: "none", line: { style: "solid", fill: C.rule, width: 2 } });
  addBulletList(slide, "findings-bullets", [
    [{ run: "Observed gain: ", textStyle: { bold: true } }, "final attribution removes excess pages and raises precision from 63.8% to 73.9%."],
    [{ run: "Small recall cost: ", textStyle: { bold: true } }, "96.8% → 95.2%; no question loses every correct page."],
    [{ run: "Best fit: ", textStyle: { bold: true } }, "single-page and numeric questions benefit most."],
    [{ run: "Failure mode: ", textStyle: { bold: true } }, "multi-page and multi-document questions lose supporting evidence."],
  ], { left: x3, top: lowerTop + 92, width: col3, height: 430 }, 32);

  slide.shapes.add({
    geometry: "rect",
    name: "conclusion-band",
    position: { left: x3, top: lowerTop + 515, width: col3, height: 180 },
    fill: C.blue,
    line: { style: "solid", fill: C.blue, width: 0 },
    borderRadius: 10,
  });
  addText(slide, "conclusion-title", "Product implication", { left: x3 + 26, top: lowerTop + 537, width: col3 - 52, height: 42 }, {
    fontSize: 32,
    bold: true,
    color: C.white,
  });
  addText(slide, "conclusion-copy", "Keep citation selection explicit; narrow conservatively for multi-page evidence.", { left: x3 + 26, top: lowerTop + 589, width: col3 - 52, height: 95 }, {
    fontSize: 32,
    bold: true,
    color: C.white,
    lineSpacing: 1.02,
  });
  addText(slide, "limitations-title", "Limitations", { left: x3, top: lowerTop + 730, width: col3, height: 42 }, {
    fontSize: 32,
    bold: true,
  });
  addBulletList(slide, "limitations", [
    "One saved run; no repeated seeds. Overall Fβ: +1.5 pp (95% CI −0.3 to +3.1).",
    "OCR was not exercised: all 590 pages exposed extractable text.",
    "Multi-page evidence regresses; mean first-token latency is 6.39 s.",
  ], { left: x3, top: lowerTop + 782, width: col3, height: 220 }, 32, C.muted);

  // Footer with compact references. Full references belong in the mandatory appendix.
  slide.shapes.add({ geometry: "line", name: "footer-rule", position: { left: M, top: 2110, width: W - 2 * M, height: 0 }, fill: "none", line: { style: "solid", fill: C.ink, width: 2 } });
  addText(slide, "references", "[1] Lewis et al., NeurIPS 2020 · [2] Karpukhin et al., EMNLP 2020 · [3] Cormack et al., SIGIR 2009 · [4] Gao et al., EMNLP 2023 · [5] Pipitone & Alami, 2024 · Model: Qwen3 Embedding/Reranker [6]", { left: M, top: 2130, width: 2460, height: 58 }, {
    fontSize: 19,
    color: C.muted,
  });
  addText(slide, "scope-note", "Competition context intentionally omitted; evaluation uses the saved legal QA benchmark artifacts.", { left: 2505, top: 2130, width: 590, height: 58 }, {
    fontSize: 18,
    color: C.muted,
    alignment: "right",
  });

  slide.speakerNotes.textFrame.setText(`
[Sources]
- Local architecture and model configuration: /Users/steinv/Projects/Agentic-RAG-Challenge/README.md; /Users/steinv/Projects/Agentic-RAG-Challenge/configs/baseline/v001/config.yaml
- Saved run and benchmark metrics: /Users/steinv/Projects/Agentic-RAG-Challenge/artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/manifest.json
- Question-level grounding stages: /Users/steinv/Projects/Agentic-RAG-Challenge/artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/grounding/ledger.jsonl
- Lewis et al. 2020: https://proceedings.neurips.cc/paper/2020/hash/6b493230-Abstract.html
- Karpukhin et al. 2020: https://aclanthology.org/2020.emnlp-main.550/
- Cormack et al. 2009: https://doi.org/10.1145/1571941.1572114
- Gao et al. 2023: https://aclanthology.org/2023.emnlp-main.398/
- Pipitone and Alami 2024: https://arxiv.org/abs/2408.10343
- Zhang et al. 2025: https://arxiv.org/abs/2506.05176

[Method]
Macro page precision, recall, and F-beta (beta=2.5) were recomputed from the 95 non-empty gold-page records. Confidence intervals use a paired non-parametric bootstrap over questions with 20,000 resamples and seed 20260903. The chart reports raw retrieval, pass-A filtering, and final answer-aware attribution for the same questions.
  `.trim());
  slide.speakerNotes.setVisible(true);

  const preview = await presentation.export({ slide, format: "png", scale: 0.5 });
  await writeBlob(`${TMP_DIR}/poster-preview.png`, preview);
  const fullPreview = await presentation.export({ slide, format: "png", scale: 1 });
  await writeBlob(`${TMP_DIR}/poster-preview-full.png`, fullPreview);
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(`${TMP_DIR}/poster-layout.json`, await layout.text());
  const inspection = await presentation.inspect({ kind: "slide,textbox,shape,chart,notes", maxChars: 12000 });
  await fs.writeFile(`${TMP_DIR}/poster-inspection.ndjson`, inspection.ndjson);

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(FINAL_PPTX);
  console.log(JSON.stringify({ finalPptx: FINAL_PPTX, preview: `${TMP_DIR}/poster-preview.png` }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
