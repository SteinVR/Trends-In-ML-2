PPTX POSTER HANDOFF
===================

Deliverables
------------
- poster-narrative-2-pptx.pptx
  One editable PowerPoint slide at true DIN A1 landscape size (841 x 594 mm).
- poster-narrative-2-pptx.pdf
  One-page PowerPoint PDF export. Text, shapes, lines and charts remain vector.
- poster-narrative-2-pptx.png
  Full-poster QA raster at 5046 x 3564 px. This is an exact 841:594 ratio and approximately 152.4 PPI at A1.
- poster-narrative-2-pptx-a4.png
  Downscaled 1682 x 1188 px readability preview.

Editable source and diagnostics
-------------------------------
- Builder: ../../../tmp/poster-narrative-2/pptx/build-poster.mjs
- Source ledger: ../../../tmp/poster-narrative-2/pptx/source-notes.txt
- QA ledger: ../../../tmp/poster-narrative-2/pptx/qa-ledger.txt
- Layout/inspect/render diagnostics remain under ../../../tmp/poster-narrative-2/pptx/

Reproduction
------------
Run from /Users/steinv/Uni-Trier/Trends-In-ML-2/tmp/poster-narrative-2/pptx:

RUNTIME_NODE=/Users/steinv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
RUNTIME_NODE_MODULES=/Users/steinv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
RUNTIME_BIN_DIR=/Users/steinv/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override \
/Users/steinv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node build-poster.mjs final

The PDF was exported from the final PPTX with Microsoft PowerPoint to preserve native vector objects. The PNGs were rendered from that PDF with bundled Poppler:

pdftoppm -png -singlefile -scale-to-x 5046 -scale-to-y 3564 poster-narrative-2-pptx.pdf poster-narrative-2-pptx
pdftoppm -png -singlefile -scale-to-x 1682 -scale-to-y 1188 poster-narrative-2-pptx.pdf poster-narrative-2-pptx-a4

Final QA summary
----------------
- DIN A1 verified from PPTX XML: 841.0000 x 594.0000 mm.
- PDF MediaBox: 2384 x 1684 pt, one landscape A1 page.
- Minimum visible slide font verified from PPTX XML: 24.00 pt; maximum: 72.00 pt.
- slides_test.py: passed, no elements outside the slide canvas.
- PDF parsed and rendered successfully with Poppler; no raster image XObjects were found.
- All headline values were found in extracted PDF text, including both differently scoped grounding metrics.
- Full-size Results and footer crops were visually inspected after PowerPoint export.
- Boundary bar labels are one-line numbers; the pp unit appears once in the chart subtitle.
- A4 preview was visually inspected for reading order and headline legibility.
- No author name or student ID was invented. The header keeps editable room for them.

Scientific distinction retained
-------------------------------
Benchmark grounding 0.847 is computed on all 100 answers. Macro page F-beta 0.892 is computed only on the 95 questions with page annotations. They are intentionally separated in the poster.

SHA-256
-------
PPTX  ddc13591aa1dc46aedb2198551bcbb2ee395aff40535604a5158f2434d707f38
PDF   48435d8b79a0913b6a8b4064352cddecdb8f7d63964d69131a4988d0687394b1
PNG   c0099312f5f9f80fa035bfea48f13e925937edabfe247afbf34584c5cc2d971b
A4    4f20bc8285b38bd1696545188162050dd73bb469f19286bcc0eceac2066a9e6a
