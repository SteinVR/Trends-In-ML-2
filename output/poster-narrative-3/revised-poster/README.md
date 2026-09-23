# Legal RAG poster — HTML review version

**Current scope:** edit and review `index.html` only. The PDF, PNG, PPTX and ZIP are frozen exports from the preceding version and do not reflect the latest HTML changes. Do not re-export until the user approves the poster.

Revised from the joint feedback in `external/RAG Poster/RAGPoster.html`. The revision explains the research context and each pipeline component, groups the hypotheses into three themes, clarifies evaluation and scan controls, and preserves the measured results. The current HTML implements the supplied visual pipeline reference, separates the three result metrics into readable charts and expands the OCR condition labels. No author names or author placeholder are shown.

- `poster.pdf`: frozen PDF of the preceding version.
- `poster.png`: frozen preview of the preceding version.
- `index.html`: editable HTML master with local assets.
- `powerpoint/legal-rag-poster-updated.pptx`: frozen PowerPoint of the preceding version.
- `legal-rag-poster-revised.zip`: frozen package of the preceding version.
- `revision-notes.md`: mapping from the joint feedback to the revision, including the hypothesis renumbering.

The experimental data are in `../results/metrics.csv`. H1–H3 on this poster group the earlier six research hypotheses; the original experiment protocol and companion paper retain their original numbering. The earlier poster files remain unchanged. The revised files have not been published to the public repository.

## PowerPoint

Install `assets/NotoSans-Regular.ttf` and `assets/NotoSans-Bold.ttf` before opening the PPTX. The ZIP also includes these fonts. Fonts are supplied separately, not embedded in the slide.

Text, pipeline labels and rules are editable PowerPoint objects. The original charts and university logo remain vector SVG images. Their individual data points are not native Excel chart objects. Text uses fixed line breaks to preserve the layout; after substantial edits, adjust text boxes and check the full page. HTML and PPTX do not synchronize automatically.

The PDF was reviewed as a rendered page. The PPTX was structurally validated and rendered with LibreOffice for comparison against the PDF; it has not been opened in Microsoft PowerPoint.

## Update the HTML charts

```bash
node output/poster-narrative-3/revised-poster/build-html-charts.mjs
```

This reads `../results/metrics.csv` and updates only `assets/sequence-readable.svg` and `assets/ocr-readable.svg`. Chart panels share a 0–100% scale. HTML review screenshots and layout diagnostics belong under `tmp/poster-html-review/`.

## Re-export the PDF after poster approval

From the repository root, with Node, Playwright and Chromium available:

```bash
NODE_PATH=<directory-containing-playwright> node output/poster-narrative-3/revised-poster/export.mjs
```

This rebuilds `poster.pdf` and `poster.png`, and saves the layout receipt under `tmp/poster-revision-2026-09-23/`. It does not run new experiments or change the SVG figures. The temporary PPTX reconstruction scripts and validation files for this revision are under `tmp/poster-revision-2026-09-23/`.

For an academic submission, the separate required appendix remains a distinct deliverable. This archive contains the revised poster and its editable version.
