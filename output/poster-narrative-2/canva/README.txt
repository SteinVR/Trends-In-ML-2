FROM LEGAL PDFS TO VERIFIABLE ANSWERS - CANVA HANDOFF

Editable Canva design
Design ID: DAHUL57xGqw
Edit: https://www.canva.com/d/j3UVJ5HTQZZjEBl
View: https://www.canva.com/d/s-y9RmfgwTPpfXf
Pages: 1

Creation method
The final self-contained A1 HTML source was imported once through Canva's import-design-from-url connector with intended_design_type=poster. Canva reports the result as a custom-size editable design. No editing transaction was opened and no throwaway Canva designs were created.

Dimensions
Local print source: DIN A1 landscape, 841 x 594 mm.
Local full PNG: 5046 x 3564 px (exact 841:594 ratio, 152.4 PPI).
Local A4 readability preview: 1682 x 1188 px.
Canva page after import: 3178 x 2245 px, ratio 1.4155902. Canva rounded the CSS physical dimensions to integer pixels; this differs from 841:594 by only -0.0166%, so no derivative resize was created.

Files
canva-source.html                  Editable print-native source imported into Canva
poster-narrative-2-canva.pdf      One-page vector A1 PDF rendered from that exact source
poster-narrative-2-canva.png      5046 x 3564 high-resolution QA/output image
poster-narrative-2-canva-a4.png   Downscaled readability preview
canva-page-thumbnail.png          Thumbnail returned by Canva after import
canva-design.json                 Machine-readable Canva metadata and verification
QA-LEDGER.txt                     Iteration-by-iteration QA record

Reproduction
The local render script is stored at:
/Users/steinv/Uni-Trier/Trends-In-ML-2/tmp/poster-narrative-2/canva/render.mjs

Run it with the bundled Node runtime:
/Users/steinv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /Users/steinv/Uni-Trier/Trends-In-ML-2/tmp/poster-narrative-2/canva/render.mjs

QA summary
- Four local visual iterations were inspected.
- Minimum effective text size in the final PDF is 24.0 pt; no undersized text runs remain.
- Benchmark grounding 0.847 (100 answers) and macro page F-beta 89.2% (95 annotated questions) are explicitly disambiguated.
- The multi-page (-2.6 pp) and multi-document (-1.4 pp) regressions remain visible in the main Results row.
- Full A1 and A4 previews show no clipping, overlap, unintended wrapping, or broken reading order.
- Canva metadata, page count, thumbnail, and editable rich text were verified after import.

Author details
No author name or student ID was invented. The source preserves a clean editable header area for these details before submission.
