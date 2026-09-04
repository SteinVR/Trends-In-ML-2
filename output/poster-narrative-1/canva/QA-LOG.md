# Canva poster QA log

## Selected design

- Canva design ID: `DAHUL8qjEEc`
- Edit URL: <https://www.canva.com/d/bNwUqbM_P8bnu-->
- View URL: <https://www.canva.com/d/A72bW3TldEzjAdx>
- Creation job: `174ca220-15f8-4b9b-b3b3-5825b4d52c56`
- Canva page count: 1
- Canva page dimensions reported by the connector: 4096 x 2893 px, A1-landscape ratio
- The last Canva page thumbnail was retrieved with `get-design-pages`, displayed, and visually inspected.

## Scientific-content checks

- Poster language: English.
- Mandatory sections present: Hypothesis, Methodology, Results.
- Eligible analysis cohort is kept distinct from the full benchmark: 100 benchmark questions, 95 eligible questions, 59 localized and 36 distributed.
- Hero values: answer quality 95.9% vs 94.4%; final page grounding 93.8% vs 81.6%.
- Between-group differences: -1.5 pp (95% CI -10.8 to +6.7) and -12.2 pp (95% CI -19.0 to -5.9).
- Raw-to-final diagnostic: 89.8 to 93.8 (+4.0 pp) and 84.2 to 81.6 (-2.6 pp).
- Perfect-answer diagnostic: 4/55 (7.3%) vs 16/34 (47.1%).
- The poster states that this is a retrospective observational analysis of one saved run, not a causal ablation.
- Limitations, repository, run identifier, short academic references, and author/student-ID placeholders are present.

## Connector-generation and Canva fidelity record

1. Canva `prepare-design-generation` accepted the full poster brief and created job `69eabfdf-de5e-4cd1-bee8-aca58b07d62c`, but returned only `status: in_progress` for a lifecycle widget. No candidate IDs or candidate thumbnails were exposed to the agent. Reinvocation created a new job (`deacf76e-ed98-4363-aa4c-4cfcd3527f51`) instead of polling the first job.
2. Direct `generate-design` could not be used for a poster because the active connector schema accepted only `doc`, `document`, or `email` despite the general tool description mentioning posters.
3. A browser opened the Canva view URL, but Canva redirected to login. The connector OAuth session was not available in the controlled browser, so Canva PDF Print download could not be completed through the UI.
4. The connector exposed no `export-design` tool.
5. Canva Magic Layers created real editable Canva designs from the verified local raster master. The first conversion (`DAHUL9fNS7o`) lost too much chart content and was rejected. A JPEG conversion (`DAHULxlggHs`) was worse and was rejected. `DAHUL8qjEEc` was the strongest editable result and is the selected design.
6. The selected Canva thumbnail still shows Magic Layers degradation: some thin chart labels and geometry are faint or omitted, and connector rich-text extraction contains OCR errors in small metadata. Fixing those elements would require an editing transaction whose commit requires a new explicit approval under the Canva connector contract. No unapproved commit was attempted.

## Local high-fidelity master

- `poster.png`: 4967 x 3508 px (150 PPI at A1 landscape).
- `poster.pdf`: one page, 2383.92 x 1684.08 pt (DIN A1 landscape).
- The PDF was rendered through Poppler at 150 PPI to 4967 x 3509 px and the latest render was visually inspected.
- Visual inspection found no clipping, overlap, broken glyphs, black squares, or missing required sections in the local master.
- The localized/distributed distinction uses both color and shape: blue circle vs coral diamond.
- The PDF is a local high-fidelity render from the verified master SVG. It is not a Canva export.

## Remaining user action

- Replace `[AUTHOR NAME]` and `[000000]` with the final author and student ID.
- If the editable Canva version must itself be submission-ready, open the design in Canva and manually reconcile it against `poster.png` before exporting PDF Print.
