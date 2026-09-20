# Poster Visual Concepts: The Distributed-Evidence Gap

> A layout and art-direction exploration derived from [`poster-narrative.md`](poster-narrative.md). This document does not introduce empirical claims; the narrative and reproducible analysis remain the sources of truth.

## 1. Design problem extracted from the narrative

The poster is not primarily about a RAG architecture. It is about a mismatch between two outcomes that look aligned in aggregate but separate when the gold evidence is distributed:

- Answer quality is nearly unchanged: **95.9% localized versus 94.4% distributed**.
- Final page grounding separates: **93.8% localized versus 81.6% distributed**.
- The between-group answer difference is inconclusive, while the grounding difference is **-12.2 percentage points**, with a 95% stratified-bootstrap interval of **-19.0 to -5.9 points**.
- Citation narrowing moves the groups in opposite directions: **+4.0 points** for localized evidence and **-2.6 points** for distributed evidence.
- The concrete failure is not a completely unsupported answer. It is a correct-looking answer with incomplete support: **4 / 55** versus **16 / 34** perfectly scored answers have grounding below 0.8.

This produces a strict visual hierarchy:

1. **Hero claim:** answers stay level while grounding separates.
2. **Primary evidence:** the two group estimates and their between-group uncertainty intervals.
3. **Mechanism diagnostic:** raw-to-final grounding rises for localized evidence and falls for distributed evidence.
4. **System context:** page identity is preserved through the pipeline, so the loss can be traced.
5. **Decision and boundary:** adapt citation policy to observable evidence spread; do not imply causality from one observational run.

The poster must be self-contained without an oral explanation, fit DIN A1, and keep paragraph text at 24 pt or larger. The architecture therefore supports the empirical result; it cannot occupy the hero position.

## 2. Creative direction

**Method:** *Oblique Strategies*, Brian Eno and Peter Schmidt (1975).

**Random card 42 / 49:** “Remember those quiet evenings.”

**Meaning here:** make the poster feel like a careful late-evening reading of a legal case file rather than a product dashboard. **Move:** use a warm paper field, deep ink typography, generous negative space, and reserve the warning color for distributed-evidence loss.

The first three defaults were discarded before generating the concepts below:

- three equal conference-poster columns;
- an oversized end-to-end architecture diagram;
- a dashboard containing every precision, recall, latency, and corpus statistic.

All three are easy to build, but each flattens the one result the viewer should remember.

## 3. Verbalized-sampling concept set

`Probability` is response-distribution typicality, not design quality or confidence. `Value` and `Risk` use a 1–5 decision scale.

### Central / expected concepts

| # | Candidate | Probability | Value | Risk | Evidence needed | Why this mode exists |
| --- | --- | ---: | ---: | ---: | --- | --- |
| 1 | **Quiet Twin Track — grounded.** A1 landscape. “Answer quality” and “Page grounding” repeat as two horizontal tracks; localized evidence is a blue circle and distributed evidence a coral diamond in every figure. A 6-column hero chart sits between a compact hypothesis column and the raw-to-final diagnostic. | 30% | 5 | 2 | A3 print proof; verify that the two outcomes and the -12.2 pp interval are legible from roughly 2 m. | The narrative is already a two-outcome comparison, so a repeated visual grammar maps directly to the claim without a metaphor. |
| 2 | **Evidence River.** DIFC page rectangles enter a six-step pipeline as one blue strand or several coral strands, converge on an answer, and separate again into citations. The quantitative figures sit at the two points where the streams diverge. | 22% | 4 | 4 | An audited representative trace or a clearly marked schematic; otherwise the flow could look like causal evidence. | RAG posters commonly explain systems as flows, and this narrative contains a provenance-preserving pipeline. |
| 3 | **Divergence Spine.** A large central raw-to-final slope chart becomes the vertical spine. The localized story sits on its rising side, the distributed story on its falling side, with hypothesis and method above and the product decision below. | 17% | 4 | 3 | A distance test to ensure the viewer first sees “grounding gap,” not only “narrowing regression.” | The opposite slopes are the most visually dramatic observed movement in the run. |
| 4 | **DIFC Case File.** A1 portrait styled as a restrained legal brief: research question as “Issue,” design as “Record,” result as “Finding,” and limitations as “Scope.” Charts appear as exhibits with numbered tabs rather than floating cards. | 13% | 3 | 4 | Typography test with non-law viewers; confirm that the legal-document framing does not read as parody or advocacy. | The corpus is legal and the poster must be self-contained, so a document-reading metaphor is a natural central response. |

### Tail / less expected concepts

| # | Candidate | Probability | Value | Risk | Evidence needed | Why this mode exists |
| --- | --- | ---: | ---: | ---: | --- | --- |
| 5 | **The Missing Page.** A page-shaped void interrupts a bundle of distributed evidence at the center of an otherwise conventional results poster. The 81.6% grounding value sits at the edge of the void; the close answer scores remain intact above it. | 8% | 4 | 5 | Manual review of a real under-grounded answer; without it the void overstates a literal dropped-page mechanism. | Negative space can make incomplete support physically felt, but it is unusual in empirical posters. |
| 6 | **Quiet Evening Desk.** Warm ivory stock, navy type, thin brass rules, and margin annotations mimic a researcher comparing pages after dark. Boxes disappear; alignment, indents, and two data colors carry the structure. | 5% | 4 | 3 | Print sample under the venue’s lighting and a grayscale check; subtle hierarchy can collapse at distance. | The randomly selected Oblique Strategies card pushes the visual language away from the standard white-card dashboard. |
| 7 | **Claim–Page Weave.** A central bipartite diagram connects three answer claims to gold and emitted DIFC pages; one distributed support edge ends before the citation set. Aggregate results surround the trace as validation rather than as the first visual. | 3% | 4 | 5 | A verified, compact question trace whose claim-level mapping is defensible; the current narrative explicitly leaves this inspection open. | It shows what “distributed support” means more concretely than bars, but requires evidence not yet selected. |
| 8 | **Two Reading Distances.** From 3 m the poster contains only the title, “answers stay level,” “grounding -12.2 pp,” and the two opposing slopes. At arm’s length, the same large shapes become containers for method, uncertainty, limitations, and reproducibility details. | 2% | 5 | 3 | Full-size or tiled proof at 3 m and 0.5 m; verify that near-view copy does not damage the far-view silhouette. | It treats viewing distance as the organizing material, a less typical but useful response to the no-presentation constraint. |

## 4. Final choice: Quiet Twin Track

**Why:** concept 1 is the most direct translation of the research question and the lowest-risk way to remain self-contained. It can borrow the calm material language of concept 6 and the two-distance discipline of concept 8 without depending on an unaudited example trace. Most importantly, it makes answer quality and grounding equal visual objects, then lets their different behavior become the finding.

### Format and grid

- **Canvas:** DIN A1 landscape, 841 × 594 mm.
- **Grid:** 12 columns, 28–32 mm outer margins, 10–12 mm gutters.
- **Reading order:** title, numbered Hypothesis and Methodology sections, Results, then decision and limitations.
- **Copy budget:** approximately 550–700 words excluding chart labels and abbreviated references.
- **Distance contract:** one claim at 3 m, the complete argument at 1 m, caveats and reproduction details at arm’s length.

### Wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ TITLE + SUBTITLE                                      AUTHOR / AFFILIATION   │
│ Answers stay level. Grounding separates when evidence spans pages.           │
├───────────────────┬──────────────────────────────────────────────────────────┤
│ 1  HYPOTHESIS     │ 2  METHODOLOGY · PAGE-STABLE EVIDENCE FLOW              │
│                   │ PDF → multi-view index → retrieval → answer → attribution│
│ Problem + RQ      │ one blue strand / several coral strands                  │
│ H1                ├──────────────────────────────────┬───────────────────────┤
│ 95 eligible       │ 3  RESULTS · HERO               │ 4  RESULTS · DIAGNOSTIC│
│ 59 / 36 groups    │ Answer:   ●95.9 ◆94.4  Δ-1.5   │ Raw ─────── Final     │
│ Metric definition │ Grounding:●93.8 ◆81.6  Δ-12.2  │ ● 89.8 ↗ 93.8 +4.0  │
│                   │ bootstrap intervals beside      │ ◆ 84.2 ↘ 81.6 -2.6  │
│                   │ 4/55 versus 16/34 mismatch      │ Adaptive policy      │
├───────────────────┴──────────────────────────────────┴───────────────────────┤
│ 5  DECISION + LIMITATIONS + REPRODUCIBILITY             repo + short refs    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### What goes where

1. **Title band, full width.** Use the recommended title, subtitle, author line, and one plain-language sentence: “Answers remain similarly accurate, but complete source support falls when evidence is distributed.” Do not place methodology or logos here.
2. **Left three columns: Hypothesis and study capsule.** Keep only the problem, research question, H1, the 95-question eligibility rule, the 59/36 split, and the F-beta definition. Present answer-type composition only if space remains after the required limitations.
3. **Upper-right nine columns: Methodology.** A shallow six-node architecture strip explains page-stable provenance before the viewer reaches the results. Show one strand for localized evidence and several for distributed evidence, but do not depict a particular page being dropped until a representative trace has been manually verified.
4. **Lower-middle six columns: primary Results.** Use a two-row dot plot on the same clearly labelled 75–100% axis rather than bars. Row one shows the near-overlap in answer score; row two shows the grounding separation. Beside each row, show `distributed - localized` as a compact interval plot, so the answer interval visibly crosses zero and the grounding interval does not.
5. **Inside the hero zone: mismatch callout.** Place `4 / 55 (7.3%)` and `16 / 34 (47.1%)` as two proportional horizontal strips titled “Perfect answer, grounding < 0.8.” It is a consequence of the main result, not a third independent headline.
6. **Lower-right three columns: diagnostic Results and decision.** The slope chart uses only two lines: 89.8→93.8 for localized evidence and 84.2→81.6 for distributed evidence. Follow it immediately with the product implication and a one-sentence non-causal boundary.
7. **Footer, full width: limitations and reproducibility.** Include the single saved run, retrospective hypothesis, page/document confounding, heterogeneous answer scoring, repository link, and analysis artifact paths. Keep complete references in the separate appendix.

### How the visuals behave

- **Localized evidence:** muted blue `#2F6F89`, circular marker, solid line.
- **Distributed evidence:** muted coral `#B64A3E`, diamond marker, solid line.
- **Background:** warm paper `#F3EFE6`; **text:** deep ink `#172234`; **secondary rules:** stone `#77756F`; optional brass annotation `#B58A3A`.
- Color is never the only encoding: circles versus diamonds and direct labels repeat in every quantitative figure.
- On the paper background, the blue, coral, and ink colors meet a 4.5:1 text-contrast target. Stone and brass are restricted to non-text rules or large accents.
- Solid marks mean measured values. Dotted connectors are reserved for explanatory system flow. This prevents the architecture schematic from looking like causal proof.
- Prefer vector SVG charts and line art. Avoid screenshots, rendered UI panels, gradients, 3D effects, stock courthouse imagery, gavels, scales of justice, and decorative document stacks.

### Typography and density

- Preferred pairing: **Source Serif 4 Semibold** for the title and **Source Sans 3** for everything else; verify local availability before construction.
- Title: 62–68 pt. Section heads: 30–34 pt. Hero numbers: 48–64 pt. Body, captions, chart labels, and caveats: at least 24 pt.
- Limit body lines to roughly 45–65 characters. Use sentence fragments only in diagram nodes and data labels, not in the explanation of the result.
- Use whitespace instead of card borders. A single thin rule can separate major zones; repeated rounded rectangles would turn the poster back into a dashboard.

## 5. Build gates

Before converting this direction into the poster artifact:

1. Verify every chart value against the reproducible evidence-shape analysis.
2. Decide whether the representative trace is sufficiently audited; omit it if not.
3. Confirm author name, affiliation, student ID, and AI-use disclosure requirements.
4. Build a monochrome wireframe first and test it at A3, which is 50% of A1 dimensions.
5. Add color only after the reading order survives the print test; then check grayscale and common color-vision deficiencies.

**First action step:** construct the A1 landscape wireframe with real chart geometry and placeholder copy, then print or export an A3 proof. The concept changes only if the primary claim is not recoverable within five seconds at that scale.
