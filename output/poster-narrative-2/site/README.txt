FROM LEGAL PDFs TO VERIFIABLE ANSWERS - SITE BUILD

Files
-----
index.html                         Editable, self-contained HTML/CSS/inline-SVG source
poster-narrative-2-site.pdf        One-page DIN A1 landscape vector PDF
poster-narrative-2-site.png        5046 x 3564 px high-resolution render
poster-narrative-2-site-a4.png     1682 x 1188 px downscaled readability preview

Reproduction
------------
From the repository root, run:

/Users/steinv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  tmp/poster-narrative-2/site/render.mjs final

The renderer uses the installed Google Chrome executable at:
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome

It prints index.html with an exact @page size of 841 mm x 594 mm, then creates
the full-resolution and A4-preview PNGs. No network requests or external web
assets are used.

QA ledger
---------
Iteration 1
- Inspected full 5046 x 3564 render and DOM overflow diagnostics.
- Found clipped Hypothesis copy, result panels extending into the footer,
  overlapping score labels, attribution labels, boundary labels, and an
  obstructive decorative ring.

Iteration 2
- Reallocated vertical space without reducing type, constrained all result
  panels, shortened hypothesis copy, removed the ring, and reflowed charts.
- Found two remaining structural problems: clipped H2 and collisions in the
  System factor grid and negative Boundary values.

Iteration 3
- Reduced H1/H2 to one-line statements, replaced the System factor grid with
  one equation and two callouts, and separated Boundary labels from bars.
- Inspected Hypothesis, System, Attribution, Boundary, and full poster crops.

Iteration 4
- Removed the final System-caption run-on and separated the Boundary axis unit
  from its numerical ticks.
- Inspected System, Boundary, and the complete A4 preview.

Iterations 5-6
- Centered five short System captions in fixed columns and added subtle
  separators; confirmed that +3 and +4 Boundary ticks remain distinct.
- Re-rendered and visually inspected System, Boundary, full A4, and the latest
  PDF page at 150 PPI.

Final checks
------------
- PDF: 1 page, DIN A1 landscape, 2383.92 x 1684.08 pt.
- PDF resources: zero image XObjects; text and SVG charts remain vector.
- High-resolution PNG: 5046 x 3564 px, exact 841:594 ratio (6x dimensions),
  above the 150-PPI requirement.
- A4 readability preview: 1682 x 1188 px.
- Effective minimum type size: 24.00 pt; no measured labels below 24 pt.
- Layout diagnostics: no horizontal or vertical overflow above 1 px.
- Required text anchors and all headline metrics were found in extracted PDF
  text, including the score equation, 95/95, multi-page boundary, and TTFT.
- Final PDF render: no clipping, overlap, unintended wrapping, or missing copy.

Content notes
-------------
- Benchmark grounding 0.847 is explicitly labeled as the 100-answer benchmark
  component and kept separate from macro page F-beta 0.892 on 95 annotated
  questions.
- The multi-page and multi-document regressions are visible Results, not hidden
  in Limitations.
- The header contains an intentionally blank editable area for author details;
  no author name or student ID was invented.
