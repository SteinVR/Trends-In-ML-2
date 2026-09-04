import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT_DIR = "/Users/steinv/Uni-Trier/Trends-In-ML-2/output/poster-narrative-1/pptx";
const TMP_DIR = "/Users/steinv/Uni-Trier/Trends-In-ML-2/tmp/poster-narrative-1-pptx";
const PPTX_PATH = `${OUT_DIR}/poster.pptx`;
const PNG_PATH = `${OUT_DIR}/poster.png`;

const W = 3178.58;
const H = 2245.04;

const PAPER = "#F3EFE6";
const INK = "#172234";
const MUTED = "#676A6B";
const STONE = "#AAA69C";
const LIGHT = "#DED8CB";
const LIGHTER = "#E9E4D9";
const BLUE = "#2F6F89";
const BLUE_LIGHT = "#BCD1D9";
const CORAL = "#B64A3E";
const CORAL_LIGHT = "#DEC0BB";
const BRASS = "#9C7530";
const WHITE = "#FBF9F4";

const BODY = "Arial";
const DISPLAY = "Georgia";

function addShape(slide, name, geometry, left, top, width, height, fill = "none", line = { style: "solid", fill: "none", width: 0 }, rotation = 0) {
  return slide.shapes.add({
    geometry,
    name,
    position: { left, top, width, height, rotation },
    fill,
    line,
  });
}

function addText(slide, name, text, left, top, width, height, options = {}) {
  const shape = addShape(slide, name, "textbox", left, top, width, height, options.fill ?? "none", options.line ?? { style: "solid", fill: "none", width: 0 });
  shape.text = text;
  shape.text.style = {
    fontSize: options.fontSize ?? 32,
    fontSizePt: options.fontSizePt,
    bold: options.bold ?? false,
    italic: options.italic ?? false,
    color: options.color ?? INK,
    alignment: options.align ?? "left",
    verticalAlignment: options.valign ?? "top",
    typeface: options.typeface ?? BODY,
    autoFit: "none",
    wrap: "square",
    lineSpacing: options.lineSpacing,
    insets: options.insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return shape;
}

function addLine(slide, name, left, top, width, height, color = LIGHT, weight = 3, style = "solid", flip = false) {
  return slide.shapes.add({
    geometry: "line",
    name,
    position: { left, top, width, height, verticalFlip: flip },
    fill: "none",
    line: { style, fill: color, width: weight },
  });
}

function addCircle(slide, name, cx, cy, diameter, fill, lineColor = PAPER, lineWidth = 3) {
  return addShape(slide, name, "ellipse", cx - diameter / 2, cy - diameter / 2, diameter, diameter, fill, { style: "solid", fill: lineColor, width: lineWidth });
}

function addDiamond(slide, name, cx, cy, diameter, fill, lineColor = PAPER, lineWidth = 3) {
  return addShape(slide, name, "diamond", cx - diameter / 2, cy - diameter / 2, diameter, diameter, fill, { style: "solid", fill: lineColor, width: lineWidth });
}

function addSectionHead(slide, number, label, x, y, width) {
  addText(slide, `section-${number}-number`, number, x, y, 62, 52, { fontSize: 42, bold: true, color: BRASS });
  addText(slide, `section-${number}-label`, label.toUpperCase(), x + 74, y + 4, width - 74, 48, { fontSize: 38, bold: true, color: INK });
}

function map(value, min, max, start, end) {
  return start + ((value - min) / (max - min)) * (end - start);
}

function addHorizontalTrack(slide, name, y, x1, x2) {
  addLine(slide, `${name}-baseline`, x1, y, x2 - x1, 0.5, STONE, 3, "solid");
  for (const tick of [75, 80, 85, 90, 95, 100]) {
    const x = map(tick, 75, 100, x1, x2);
    addLine(slide, `${name}-tick-${tick}`, x, y - 10, 0.5, 20, STONE, 2, "solid");
  }
}

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(TMP_DIR, { recursive: true });

  const presentation = Presentation.create({ slideSize: { width: W, height: H } });
  const slide = presentation.slides.add();
  slide.name = "Research poster";
  slide.background.fill = PAPER;

  // Title band
  addText(slide, "eyebrow", "RESEARCH POSTER  /  LEGAL NLP  /  EVIDENCE-SHAPE ANALYSIS", 130, 64, 1300, 44, { fontSize: 32, bold: true, color: BRASS });
  addText(slide, "author-placeholder", "AUTHOR NAME  ·  UNIVERSITY OF TRIER  ·  STUDENT ID: ______", 1830, 64, 1218, 44, { fontSize: 32, bold: true, color: MUTED, align: "right" });
  addText(slide, "poster-title", "Correct Answers, Uneven Grounding:\nThe Distributed-Evidence Gap in Legal RAG", 130, 126, 2918, 184, { fontSize: 86, bold: true, color: INK, typeface: DISPLAY, lineSpacing: 0.92 });
  addText(slide, "poster-subtitle", "An evidence-shape analysis across a 100-question legal benchmark and 590 PDF pages", 132, 329, 2300, 44, { fontSize: 34, color: MUTED });
  addText(slide, "takeaway-a", "Answers stay level.", 130, 405, 685, 64, { fontSize: 48, bold: true, color: BLUE });
  addText(slide, "takeaway-b", "Grounding separates when evidence spans pages.", 820, 405, 1910, 64, { fontSize: 48, bold: true, color: CORAL });
  addLine(slide, "title-rule", 130, 516, 2918, 0.5, INK, 4, "solid");

  // Major dividers establish a flat editorial grid.
  addLine(slide, "left-rail-divider", 770, 572, 0.5, 1224, LIGHT, 3, "solid");
  addLine(slide, "method-result-divider", 820, 913, 2228, 0.5, LIGHT, 3, "solid");
  addLine(slide, "results-right-divider", 2270, 955, 0.5, 827, LIGHT, 3, "solid");
  addLine(slide, "footer-divider", 130, 1834, 2918, 0.5, INK, 4, "solid");

  // 01 Hypothesis
  addSectionHead(slide, "01", "Hypothesis", 130, 575, 610);
  addText(slide, "hypothesis-context", "RAG can find enough evidence to answer while still emitting an incomplete citation set [1,3]. In legal QA, one correct page is not the same as complete support.", 130, 647, 600, 145, { fontSize: 32, color: INK, lineSpacing: 1.08 });
  addText(slide, "rq-label", "RESEARCH QUESTION", 130, 820, 600, 42, { fontSize: 32, bold: true, color: BRASS });
  addText(slide, "research-question", "How does distributed evidence affect the relationship between answer quality and source grounding?", 130, 870, 600, 166, { fontSize: 38, bold: true, color: INK, typeface: DISPLAY, lineSpacing: 1.02 });
  addText(slide, "h1-label", "H1", 130, 1064, 70, 48, { fontSize: 38, bold: true, color: CORAL });
  addText(slide, "h1-copy", "Multi-page evidence will leave answer scores comparable but lower final page grounding; a uniform citation-narrowing policy may widen the gap.", 210, 1064, 520, 190, { fontSize: 33, color: INK, lineSpacing: 1.08 });
  addLine(slide, "study-rule", 130, 1280, 600, 0.5, LIGHT, 3, "solid");
  addText(slide, "eligible-big", "95 / 100", 130, 1302, 330, 86, { fontSize: 70, bold: true, color: INK, typeface: DISPLAY });
  addText(slide, "eligible-caption", "questions had annotated gold pages and were eligible for this analysis", 130, 1390, 560, 82, { fontSize: 32, color: MUTED });
  addCircle(slide, "localized-key-circle", 155, 1518, 34, BLUE, BLUE, 1);
  addText(slide, "localized-count", "59", 190, 1481, 105, 72, { fontSize: 56, bold: true, color: BLUE });
  addText(slide, "localized-label", "localized - one gold page", 300, 1491, 410, 54, { fontSize: 32, color: INK });
  addDiamond(slide, "distributed-key-diamond", 155, 1594, 40, CORAL, CORAL, 1);
  addText(slide, "distributed-count", "36", 190, 1557, 105, 72, { fontSize: 56, bold: true, color: CORAL });
  addText(slide, "distributed-label", "distributed - multiple gold pages", 300, 1567, 410, 54, { fontSize: 32, color: INK });
  addText(slide, "metric-definition", "PAGE GROUNDING\nPer-question Fβ over emitted vs gold (document, page) pairs; β = 2.5 weights recall more than precision.", 130, 1650, 600, 132, { fontSize: 32, color: INK, lineSpacing: 1.04 });

  // 02 Methodology - connectors first, then nodes.
  addSectionHead(slide, "02", "Methodology - page-stable evidence flow", 820, 575, 2228);
  const flowCenters = [900, 1335, 1770, 2205, 2640];
  for (let i = 0; i < flowCenters.length - 1; i += 1) {
    addLine(slide, `flow-connector-${i + 1}`, flowCenters[i] + 26, 710, flowCenters[i + 1] - flowCenters[i] - 52, 0.5, STONE, 4, "dotted");
    addShape(slide, `flow-arrowhead-${i + 1}`, "triangle", flowCenters[i + 1] - 31, 696, 28, 28, STONE, { style: "solid", fill: STONE, width: 0 }, 90);
  }
  const flow = [
    ["1", "30 DIFC PDFs\n590 pages", "public primary legal documents"],
    ["2", "Page-stable\nmulti-view index", "page · section · clause · chunk · table"],
    ["3", "Hybrid retrieval", "BM25 + Qwen3 · RRF + rerank"],
    ["4", "Typed answer", "GPT-5.4-mini · schema + evidence checks"],
    ["5", "Final page\nattribution", "support validation + fallback"],
  ];
  flow.forEach((node, index) => {
    const cx = flowCenters[index];
    addCircle(slide, `flow-node-${index + 1}`, cx, 710, 52, INK, PAPER, 4);
    addText(slide, `flow-node-number-${index + 1}`, node[0], cx - 20, 689, 40, 42, { fontSize: 32, bold: true, color: WHITE, align: "center", valign: "middle" });
    addText(slide, `flow-node-title-${index + 1}`, node[1], cx - 185, 755, 370, 82, { fontSize: 34, bold: true, color: INK, align: "center", lineSpacing: 1.0 });
    addText(slide, `flow-node-detail-${index + 1}`, node[2], cx - 190, 838, 380, 60, { fontSize: 32, color: MUTED, align: "center", lineSpacing: 1.0 });
  });
  addText(slide, "provenance-invariant", "INVARIANT  Every evidence record retains document_id + page_number.", 1690, 584, 1328, 40, { fontSize: 32, bold: true, color: BRASS, align: "right" });

  // 03 Primary result
  addSectionHead(slide, "03", "Results", 820, 950, 1410);
  addText(slide, "results-claim", "Answer quality stays close; final page grounding does not.", 820, 1016, 1380, 60, { fontSize: 44, bold: true, color: INK, typeface: DISPLAY });
  addText(slide, "estimate-heading", "GROUP MEANS (%)", 820, 1092, 600, 42, { fontSize: 32, bold: true, color: BRASS });
  addText(slide, "difference-heading", "DISTRIBUTED - LOCALIZED (PP, 95% CI)", 1735, 1092, 500, 44, { fontSize: 32, bold: true, color: BRASS, align: "center" });

  const trackX1 = 1050;
  const trackX2 = 1660;
  addHorizontalTrack(slide, "answer-track", 1218, trackX1, trackX2);
  addHorizontalTrack(slide, "grounding-track", 1406, trackX1, trackX2);
  addText(slide, "answer-row-label", "Answer\nquality", 820, 1165, 210, 90, { fontSize: 34, bold: true, color: INK });
  addText(slide, "grounding-row-label", "Final page\ngrounding", 820, 1352, 210, 92, { fontSize: 34, bold: true, color: INK });

  const answerLocalizedX = map(95.9, 75, 100, trackX1, trackX2);
  const answerDistributedX = map(94.4, 75, 100, trackX1, trackX2);
  const groundingLocalizedX = map(93.8, 75, 100, trackX1, trackX2);
  const groundingDistributedX = map(81.6, 75, 100, trackX1, trackX2);
  addCircle(slide, "answer-localized-marker", answerLocalizedX, 1194, 42, BLUE, PAPER, 3);
  addDiamond(slide, "answer-distributed-marker", answerDistributedX, 1243, 46, CORAL, PAPER, 3);
  addCircle(slide, "grounding-localized-marker", groundingLocalizedX, 1382, 42, BLUE, PAPER, 3);
  addDiamond(slide, "grounding-distributed-marker", groundingDistributedX, 1431, 46, CORAL, PAPER, 3);
  addText(slide, "answer-localized-value", "95.9", answerLocalizedX - 78, 1138, 156, 42, { fontSize: 34, bold: true, color: BLUE, align: "center" });
  addText(slide, "answer-distributed-value", "94.4", answerDistributedX - 78, 1264, 156, 42, { fontSize: 34, bold: true, color: CORAL, align: "center" });
  addText(slide, "grounding-localized-value", "93.8", groundingLocalizedX - 78, 1326, 156, 42, { fontSize: 34, bold: true, color: BLUE, align: "center" });
  addText(slide, "grounding-distributed-value", "81.6", groundingDistributedX - 78, 1452, 156, 42, { fontSize: 34, bold: true, color: CORAL, align: "center" });
  for (const tick of [75, 80, 85, 90, 95, 100]) {
    const x = map(tick, 75, 100, trackX1, trackX2);
    addText(slide, `score-tick-label-${tick}`, String(tick), x - 38, 1492, 76, 38, { fontSize: 32, color: MUTED, align: "center" });
  }

  // Difference and confidence intervals, on a common -20 to +10 pp axis.
  const diffX1 = 1788;
  const diffX2 = 2195;
  const zeroX = map(0, -20, 10, diffX1, diffX2);
  addLine(slide, "difference-zero-line", zeroX, 1160, 0.5, 307, STONE, 3, "dotted");
  addLine(slide, "answer-ci", map(-10.8, -20, 10, diffX1, diffX2), 1218, map(6.7, -20, 10, diffX1, diffX2) - map(-10.8, -20, 10, diffX1, diffX2), 0.5, INK, 7, "solid");
  addLine(slide, "answer-ci-left-cap", map(-10.8, -20, 10, diffX1, diffX2), 1202, 0.5, 32, INK, 5, "solid");
  addLine(slide, "answer-ci-right-cap", map(6.7, -20, 10, diffX1, diffX2), 1202, 0.5, 32, INK, 5, "solid");
  addDiamond(slide, "answer-difference-marker", map(-1.5, -20, 10, diffX1, diffX2), 1218, 40, CORAL, PAPER, 3);
  addLine(slide, "grounding-ci", map(-19.0, -20, 10, diffX1, diffX2), 1406, map(-5.9, -20, 10, diffX1, diffX2) - map(-19.0, -20, 10, diffX1, diffX2), 0.5, INK, 7, "solid");
  addLine(slide, "grounding-ci-left-cap", map(-19.0, -20, 10, diffX1, diffX2), 1390, 0.5, 32, INK, 5, "solid");
  addLine(slide, "grounding-ci-right-cap", map(-5.9, -20, 10, diffX1, diffX2), 1390, 0.5, 32, INK, 5, "solid");
  addDiamond(slide, "grounding-difference-marker", map(-12.2, -20, 10, diffX1, diffX2), 1406, 40, CORAL, PAPER, 3);
  addText(slide, "answer-difference-label", "-1.5  [-10.8, +6.7]", 1760, 1257, 470, 42, { fontSize: 34, bold: true, color: INK, align: "center" });
  addText(slide, "grounding-difference-label", "-12.2  [-19.0, -5.9]", 1740, 1445, 500, 42, { fontSize: 34, bold: true, color: CORAL, align: "center" });
  for (const tick of [-20, -10, 0, 10]) {
    const x = map(tick, -20, 10, diffX1, diffX2);
    addText(slide, `difference-tick-${tick}`, tick > 0 ? `+${tick}` : String(tick), x - 42, 1492, 84, 38, { fontSize: 32, color: MUTED, align: "center" });
  }

  // Perfect-answer mismatch diagnostic.
  addText(slide, "mismatch-title", "PERFECT ANSWER, BUT PAGE GROUNDING < 0.8", 820, 1550, 1400, 42, { fontSize: 32, bold: true, color: BRASS });
  addText(slide, "mismatch-localized-label", "Localized", 820, 1618, 205, 42, { fontSize: 34, bold: true, color: BLUE });
  addText(slide, "mismatch-distributed-label", "Distributed", 820, 1711, 205, 42, { fontSize: 34, bold: true, color: CORAL });
  addShape(slide, "mismatch-localized-base", "rect", 1040, 1621, 900, 34, LIGHTER, { style: "solid", fill: "none", width: 0 });
  addShape(slide, "mismatch-localized-fill", "rect", 1040, 1621, 900 * 0.073, 34, BLUE, { style: "solid", fill: "none", width: 0 });
  addShape(slide, "mismatch-distributed-base", "rect", 1040, 1714, 900, 34, LIGHTER, { style: "solid", fill: "none", width: 0 });
  addShape(slide, "mismatch-distributed-fill", "rect", 1040, 1714, 900 * 0.471, 34, CORAL, { style: "solid", fill: "none", width: 0 });
  addText(slide, "mismatch-localized-value", "4 / 55  (7.3%)", 1965, 1608, 260, 48, { fontSize: 34, bold: true, color: BLUE, align: "right" });
  addText(slide, "mismatch-distributed-value", "16 / 34  (47.1%)", 1930, 1701, 295, 48, { fontSize: 34, bold: true, color: CORAL, align: "right" });
  addText(slide, "mismatch-caption", "Denominators are perfectly scored answers, not all questions.", 1040, 1763, 1185, 38, { fontSize: 32, color: MUTED });

  // 04 Diagnostic and design implication.
  addSectionHead(slide, "04", "Where the gap widens", 2320, 950, 728);
  addText(slide, "diagnostic-subtitle", "Raw retrieval -> final attribution", 2320, 1015, 728, 48, { fontSize: 36, bold: true, color: INK });
  const rawX = 2420;
  const finalX = 2945;
  const chartTop = 1110;
  const chartBottom = 1410;
  for (const tick of [80, 85, 90, 95]) {
    const y = map(tick, 80, 95, chartBottom, chartTop);
    addLine(slide, `slope-grid-${tick}`, rawX - 30, y, finalX - rawX + 60, 0.5, LIGHT, 2, "solid");
    addText(slide, `slope-y-${tick}`, String(tick), rawX - 85, y - 20, 48, 40, { fontSize: 32, color: MUTED, align: "right" });
  }
  const locRawY = map(89.8, 80, 95, chartBottom, chartTop);
  const locFinalY = map(93.8, 80, 95, chartBottom, chartTop);
  const distRawY = map(84.2, 80, 95, chartBottom, chartTop);
  const distFinalY = map(81.6, 80, 95, chartBottom, chartTop);
  addLine(slide, "localized-slope", rawX, locFinalY, finalX - rawX, locRawY - locFinalY, BLUE, 8, "solid", true);
  addLine(slide, "distributed-slope", rawX, distRawY, finalX - rawX, distFinalY - distRawY, CORAL, 8, "solid");
  addCircle(slide, "localized-raw-marker", rawX, locRawY, 42, BLUE, PAPER, 3);
  addCircle(slide, "localized-final-marker", finalX, locFinalY, 42, BLUE, PAPER, 3);
  addDiamond(slide, "distributed-raw-marker", rawX, distRawY, 46, CORAL, PAPER, 3);
  addDiamond(slide, "distributed-final-marker", finalX, distFinalY, 46, CORAL, PAPER, 3);
  addText(slide, "localized-raw-value", "89.8", rawX - 74, locRawY - 60, 148, 42, { fontSize: 34, bold: true, color: BLUE, align: "center" });
  addText(slide, "localized-final-value", "93.8", finalX - 74, locFinalY - 60, 148, 42, { fontSize: 34, bold: true, color: BLUE, align: "center" });
  addText(slide, "distributed-raw-value", "84.2", rawX - 74, distRawY + 28, 148, 42, { fontSize: 34, bold: true, color: CORAL, align: "center" });
  addText(slide, "distributed-final-value", "81.6", finalX - 74, distFinalY + 28, 148, 42, { fontSize: 34, bold: true, color: CORAL, align: "center" });
  addText(slide, "raw-label", "RAW", rawX - 110, 1443, 220, 42, { fontSize: 32, bold: true, color: MUTED, align: "center" });
  addText(slide, "final-label", "FINAL", finalX - 110, 1443, 220, 42, { fontSize: 32, bold: true, color: MUTED, align: "center" });
  addText(slide, "localized-change", "+4.0 pp", 2565, 1130, 240, 46, { fontSize: 38, bold: true, color: BLUE, align: "center" });
  addText(slide, "distributed-change", "-2.6 pp", 2565, 1330, 240, 46, { fontSize: 38, bold: true, color: CORAL, align: "center" });
  addText(slide, "implication-label", "DESIGN IMPLICATION", 2320, 1510, 728, 42, { fontSize: 32, bold: true, color: BRASS });
  addText(slide, "implication-title", "Treat evidence shape as a routing signal.", 2320, 1560, 728, 102, { fontSize: 44, bold: true, color: INK, typeface: DISPLAY, lineSpacing: 1.0 });
  addText(slide, "implication-copy", "Narrow localized support; preserve and aggregate distributed support. At inference time, route on observable evidence spread or claim-level support.", 2320, 1666, 728, 96, { fontSize: 32, color: INK, lineSpacing: 1.04 });
  addText(slide, "diagnostic-boundary", "Observed association; not a causal ablation.", 2320, 1770, 728, 42, { fontSize: 32, bold: true, color: CORAL });

  // Footer: limitations, reproducibility, and compact references.
  addSectionHead(slide, "05", "Limitations", 130, 1863, 1300);
  addText(slide, "limitations-copy", "• Single saved run; retrospective, non-preregistered hypothesis.\n• Observational slice: page and document distribution are confounded (35/36 multi-page questions are also multi-document).\n• Heterogeneous answer scoring and uneven answer-type composition.\n• Raw-to-final comparison is diagnostic, not a causal ablation.", 130, 1930, 1325, 265, { fontSize: 32, color: INK, lineSpacing: 1.04 });

  addSectionHead(slide, "06", "Reproducibility", 1530, 1863, 760);
  addText(slide, "repro-copy", "github.com/SteinVR/Agentic-RAG-Challenge\nSaved artifacts: config, manifest, answer-score checkpoint, page ledger.\n20,000 stratified bootstrap resamples; seed 20260903.\nCorpus: DIFC Legal Database + DIFC Courts.", 1530, 1930, 770, 265, { fontSize: 32, color: INK, lineSpacing: 1.04 });

  addText(slide, "references-head", "SELECTED REFERENCES", 2380, 1870, 668, 44, { fontSize: 38, bold: true, color: INK });
  addText(slide, "references-copy", "[1] Lewis et al., NeurIPS 2020.\n[2] Cormack et al., SIGIR 2009.\n[3] Gao et al., EMNLP 2023.\n[4] Pipitone & Houir Alami, 2024.", 2380, 1930, 668, 215, { fontSize: 32, color: INK, lineSpacing: 1.05 });

  const notes = `[Sources]\n- /Users/steinv/Uni-Trier/Trends-In-ML-2/poster-narrative.md (research question, operational definitions, corpus, architecture, all reported estimates, intervals, limitations, and reproducibility paths)\n- /Users/steinv/Uni-Trier/Trends-In-ML-2/poster-visual-concepts.md (Quiet Twin Track visual direction)\n- /Users/steinv/Uni-Trier/Trends-In-ML-2/Poster-Examination-Guidelines.pdf (required sections, DIN A1 format, minimum 24 pt paragraph text, appendix and submission constraints)\n- https://proceedings.neurips.cc/paper/2020/hash/6b493230-Abstract.html (Lewis et al., 2020)\n- https://doi.org/10.1145/1571941.1572114 (Cormack et al., 2009)\n- https://aclanthology.org/2023.emnlp-main.398/ (Gao et al., 2023)\n- https://arxiv.org/abs/2408.10343 (Pipitone and Houir Alami, 2024)\n- https://www.difc.ae/business/laws-and-regulations/legal-database (official corpus source)\n- https://www.difccourts.ae/rules-decisions/judgments-orders (official corpus source)\n- https://github.com/SteinVR/Agentic-RAG-Challenge (implementation and saved run artifacts)\n[/Sources]`;
  slide.speakerNotes.textFrame.setText(notes);
  slide.speakerNotes.setVisible(false);

  const png = await presentation.export({ slide, format: "png", scale: 1.5625 });
  await writeBlob(PNG_PATH, png);
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(`${TMP_DIR}/poster.layout.json`, await layout.text());
  const inspection = await presentation.inspect({
    kind: "slide,textbox,shape,notes",
    maxChars: 50000,
  });
  await fs.writeFile(`${TMP_DIR}/poster.inspect.ndjson`, inspection.ndjson);

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(PPTX_PATH);
  console.log(JSON.stringify({ pptx: PPTX_PATH, png: PNG_PATH, width: W, height: H }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
