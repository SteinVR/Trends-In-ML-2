# Poster Narrative: The Distributed-Evidence Gap in Legal RAG

> Working narrative for the empirical argument that will guide the poster copy and visuals. This is not a layout specification or final poster text.
>
> Source project: [Agentic-RAG-Challenge](https://github.com/SteinVR/Agentic-RAG-Challenge)

## 1. Narrative decision

### Central story

A legal RAG system can produce a correct answer without providing equally reliable source support. In the evaluated pipeline, answer scores remain high whether the gold evidence is located on one page or distributed across several pages. Source grounding follows a different pattern: it is substantially lower for questions that require multi-page evidence. The gap widens during final citation narrowing, which improves grounding for localized evidence but can remove part of the support required by distributed answers.

### One-sentence takeaway

> Across 95 questions with annotated source pages, mean answer score was similar for single-page and multi-page evidence (95.9% versus 94.4%), while final page grounding was 12.2 percentage points lower for multi-page evidence (93.8% versus 81.6%); post-answer narrowing improved single-page grounding by 4.0 points but reduced multi-page grounding by 2.6 points.

### Product implication

Evidence distribution should be a first-class control signal in the product. The pipeline can narrow citations aggressively when support is localized, but it should preserve and aggregate evidence conservatively when several pages contribute to the answer. Because gold evidence shape is unavailable at inference time, a deployable system would need an observable proxy based on the spread of retrieved evidence, cross-document dependencies, or claim-level support checks.

### Scope boundary

The poster presents an observational evidence-shape analysis of one saved pipeline run. It does not claim that distributed evidence causes lower grounding, compare independently trained systems, or evaluate competition ranking. The architecture explains how evidence moves from PDF pages to an answer and its citations; the empirical contribution is the measured difference between localized and distributed evidence.

The legal corpus consists of publicly available primary documents from the official DIFC Legal Database and DIFC Courts Judgments & Orders repositories. The challenge supplies task context and packaged warm-up evaluation inputs; it did not publish the original legal documents.

The word *agentic* should not lead the title. The saved implementation is a staged, mostly deterministic pipeline with model-assisted decisions, not an autonomous agent that plans and repeatedly acts on an environment.

## 2. Working title and subtitle

**Recommended title:** *Correct Answers, Uneven Grounding: The Distributed-Evidence Gap in Legal RAG*

**Subtitle:** *An evidence-shape analysis across 100 legal questions and 590 PDF pages*

**Architecture-oriented alternative:** *Tracing Distributed Evidence Through a Page-Stable Legal RAG Pipeline*

## 3. Hypothesis

### Research context

Retrieval-augmented generation (RAG) conditions generated answers on external evidence. Dense retrieval supports semantic matching, while lexical retrieval remains useful for exact legal terms, article numbers, names, and dates. Rank fusion and reranking combine these signals, but finding enough information to answer a question and producing a complete set of citations are separate outcomes.

This distinction matters in legal question answering. A model may synthesize the right answer from several retrieved fragments while the final citation set contains only part of the required support. A binary check that finds any correct page can therefore look successful even when other necessary pages are missing.

### Research gap

Aggregate answer and grounding scores do not show whether failures depend on the shape of the underlying evidence. The evaluated benchmark makes this analysis possible because each eligible question has gold document-page references. The open question is whether answer quality and source grounding remain aligned when evidence is distributed across pages rather than localized on one page.

### Research question

**How does distributed evidence affect the relationship between answer quality and source grounding in a legal RAG pipeline?**

### Working hypothesis

**H1.** Questions whose gold evidence spans multiple pages will have answer scores comparable to questions supported by one page, but lower final source-page grounding. A uniform post-answer citation-narrowing policy will not close this gap and may widen it by removing part of the distributed support.

### Operational definitions

| Concept | Operational measure |
| --- | --- |
| Localized evidence | Exactly one gold source page; all 59 such questions also reference one document |
| Distributed evidence | More than one gold source page; 35 of 36 such questions also reference more than one document |
| Answer quality | Per-question benchmark answer score on a 0–1 scale: deterministic scoring for structured answers and model-assisted scoring for free text |
| Source grounding | Page-level F-beta over emitted and gold `(document, page)` references, with beta = 2.5 to weight recall more than precision |
| Perfect answer with weak grounding | Descriptive diagnostic: answer score = 1 and source grounding < 0.8 |
| Narrowing effect | Change in page-level F-beta from pages inherited from retrieval to the final emitted citation set |

### Study status

The hypothesis was formulated retrospectively around a saved development run; it was not preregistered. The poster must describe the result as an exploratory slice analysis and observed association, not as a randomized experiment or causal effect.

## 4. Methodology

### Evaluation data

- **Corpus:** 30 publicly available DIFC legal PDFs containing 590 pages: 9 laws or consolidated legal instruments and 21 court judgments or orders.
- **Primary sources:** [DIFC Legal Database](https://www.difc.ae/business/laws-and-regulations/legal-database) and [DIFC Courts Judgments & Orders](https://www.difccourts.ae/rules-decisions/judgments-orders).
- **Benchmark:** 100 legal questions. Of these, 95 have annotated source pages and are eligible for evidence-shape analysis; 5 have no gold page reference.
- **Answer types:** 32 boolean, 30 free text, 17 number, 15 name, 5 name-list, and 1 date question.
- **Evidence shape:** 59 eligible questions have one gold page; 36 have multiple gold pages. Of the latter, 35 also span multiple documents and 1 uses several pages from one document.
- **Evaluation artifacts:** the saved run evaluates the packaged warm-up questions against answer references and page-level gold references. The challenge provides benchmark and distribution context, not the underlying legal documents.

The corpus is described as *publicly available*, not *openly licensed*: public access does not establish an open-content license, and the applicable source terms have not been verified.

### Relation to the term-paper corpus

The related term paper *Parametric Adaptation Methods for Document-Grounded Legal QA* selects eight publicly available laws, regulations, judgments, and orders from the same DIFC source collection. Five of its eight document IDs also occur in the 30-document corpus evaluated here.

The benchmarks are separate. The term paper independently authors 200 question-answer pairs and evaluates a 50-question split; neither that benchmark nor its scores are inputs to this poster analysis. Only its corpus description and official-source citations carry over.

### System architecture

The architecture preserves page provenance while evidence moves through retrieval, answering, and citation selection.

1. **Page-first ingestion.** Each PDF is processed page by page. Native text, structural parsing, tables, and OCR fallback produce a canonical corpus. Every downstream record retains `document_id` and `page_number`.
2. **Multi-view indexing.** The system represents the same material as page, section, clause, microchunk, and table chunks instead of relying on one granularity.
3. **Hybrid retrieval.** BM25 lexical retrieval and `Qwen3-Embedding-0.6B` dense retrieval produce candidates. Reciprocal Rank Fusion combines their rankings, and `Qwen3-Reranker-0.6B` reranks the fused evidence.
4. **Typed answering.** `gpt-5.4-mini` produces schema-constrained answers. Structured outputs pass type-specific normalization and validation, boolean and number answers receive additional deterministic evidence checks, and free-text outputs pass answer-to-evidence support validation.
5. **Explicit page attribution.** The system collapses chunk references into candidate pages and filters repeated boilerplate. The answer solver identifies relevant evidence; validation emits supported candidate pages and falls back when narrowing lacks support.
6. **Auditable output.** Each answer includes source pages, per-question traces, validation decisions, and latency telemetry.

The architectural invariant is:

> Every chunk keeps its document and page identity, so retrieval, answering, and citation decisions remain traceable.

### Evidence-shape analysis

The primary analysis compares two disjoint groups among the 95 questions with gold source pages:

| Group | Definition | Questions |
| --- | --- | ---: |
| Localized | One gold page | 59 |
| Distributed | More than one gold page | 36 |

For each group, the analysis reports mean answer score, mean final source grounding, and the number of perfectly scored answers whose grounding is below 0.8. Group differences use 20,000 stratified bootstrap resamples within the localized and distributed groups with random seed `20260903`.

The page and document dimensions cannot be separated in this benchmark: all localized questions use one document, while 35 of 36 distributed questions use multiple documents. The poster should therefore describe a combined *distributed-evidence* pattern rather than claim independent page-count and document-count effects.

### Pipeline-stage diagnostic

To identify where the observed gap changes, the analysis also compares citation sets from the same run:

| Stage | Meaning |
| --- | --- |
| Raw retrieval | All unique pages inherited from retrieved evidence chunks |
| Filter pass A | Raw pages after deterministic repeated-boilerplate suppression; title-page suppression exists in the code but was disabled in the saved run |
| Final attribution | Candidate pages retained because they support the produced answer, with validation and fallback behavior |

This is a diagnostic comparison within one pipeline run, not a causal ablation of independently executed systems.

### Metrics and uncertainty

- Answer scores are taken from the saved benchmark evaluation and averaged within evidence-shape groups.
- Page precision, recall, and F-beta are computed per question and then averaged over eligible questions.
- F-beta uses beta = 2.5, giving recall more weight than precision.
- The primary uncertainty intervals compare distributed minus localized mean answer score and grounding using stratified bootstrap resampling.
- Existing paired-bootstrap intervals for raw-to-final citation changes are secondary diagnostics.
- The grounding-below-0.8 threshold is descriptive and was not preregistered.

### Reproducibility

Repository: <https://github.com/SteinVR/Agentic-RAG-Challenge>

Evidence from the saved run:

| Artifact | Repository-relative path |
| --- | --- |
| Run configuration | `artifacts/warmup_runs/configs/solver_narrowing_true.yaml` |
| Run manifest | `artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/manifest.json` |
| Question-level answer scores | `artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/eval/benchmark_answer_scores.checkpoint.jsonl` |
| System-level evaluation | `artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/eval/benchmark_report.json` |
| Page-level summary | `artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/grounding/summary.json` |
| Question-level page ledger | `artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/grounding/ledger.csv` |

Before submission, the repository must include the evidence-shape and bootstrap analysis code needed to regenerate every reported number.

## 5. Results

### Primary result: answer quality remains high while grounding diverges

| Evidence shape | Questions | Mean answer score | Final page grounding | Perfect answers with grounding < 0.8 |
| --- | ---: | ---: | ---: | ---: |
| Localized: one gold page | 59 | **95.9%** | **93.8%** | 4 / 55 (7.3%) |
| Distributed: multiple gold pages | 36 | **94.4%** | **81.6%** | 16 / 34 (47.1%) |

Distributed minus localized evidence:

| Measure | Mean difference | 95% stratified-bootstrap interval |
| --- | ---: | ---: |
| Answer score | -1.5 percentage points | -10.8 to +6.7 pp |
| Source grounding | **-12.2 percentage points** | **-19.0 to -5.9 pp** |

The answer-score interval includes zero, while the grounding interval does not. In this run, distributed-evidence questions therefore receive answer scores comparable to localized questions but substantially weaker source grounding.

The same pattern is visible within boolean questions, the largest answer-type stratum represented in both groups: all 32 boolean answers score 1.0, while mean grounding is 96.3% for the 13 localized questions and 87.7% for the 19 distributed questions. This within-type comparison is descriptive, not a separate confirmatory test.

The perfect-answer diagnostic makes the product failure concrete. Only 4 of 55 perfectly scored localized answers have grounding below 0.8, compared with 16 of 34 perfectly scored distributed answers. A correct-looking answer is therefore not sufficient evidence that its citations are reliable or complete.

### Where the gap widens

| Evidence shape | Raw retrieval F-beta | Final attribution F-beta | Change |
| --- | ---: | ---: | ---: |
| Localized: one gold page | 89.8% | 93.8% | **+4.0 pp** |
| Distributed: multiple gold pages | 84.2% | 81.6% | **-2.6 pp** |

The pipeline already performs worse on distributed evidence before final attribution. Post-answer narrowing then moves the groups in opposite directions: it removes useful noise for localized questions but loses some required support for distributed questions.

Across all 95 eligible questions, final attribution raises macro precision from 63.8% to 73.9% and reduces recall from 96.8% to 95.2%. The F-beta change is +1.5 percentage points with a paired-bootstrap interval from -0.3 to +3.1 points. This aggregate precision gain is consistent with citation-set narrowing, but it does not establish a general improvement in grounding and conceals the distributed-evidence regression.

All 95 eligible questions retain at least one correct page. That binary hit metric is necessary but insufficient: it cannot detect cases in which a multi-page answer keeps one correct page while dropping other required pages.

### Answer to the hypothesis

The observed run is consistent with H1. Answer scores remain similar across evidence shapes, whereas final grounding is substantially lower for distributed evidence. Citation narrowing improves localized questions and degrades distributed ones. Because the analysis is retrospective, based on one run, and the page and document dimensions are almost perfectly aligned, the result supports an evidence-shape association rather than a causal claim about any single architectural component.

## 6. Limitations

- **Single saved run.** No end-to-end runs were repeated with different random seeds.
- **Retrospective hypothesis.** The research question was formulated around existing development artifacts rather than preregistered.
- **Observational slice analysis.** Questions were not assigned to evidence shapes, so the result does not establish that distribution itself causes lower grounding.
- **Page and document shape are confounded.** Thirty-five of 36 multi-page questions are also multi-document; their independent effects cannot be estimated from this benchmark.
- **Heterogeneous answer scoring.** Structured answers use deterministic scoring, while free-text answers use model-assisted evaluation. Their normalized scores share a 0–1 scale but are not guaranteed to be identically calibrated.
- **Uneven answer-type composition.** Number questions occur only in the localized group, while name questions are concentrated in the distributed group. The boolean slice reduces but does not eliminate this concern.
- **Descriptive threshold.** Grounding below 0.8 is used to make mismatches interpretable, not as a preregistered success criterion.
- **Stage comparison is not a causal ablation.** Raw and final citations come from the same run, and final attribution depends on the produced answer.
- **Limited external validity.** The evaluation uses one 100-question warm-up benchmark over DIFC legal documents.
- **OCR is not evaluated separately.** The pipeline includes OCR fallback, but there is no OCR-on versus OCR-off comparison; all 590 PDF pages expose at least 50 characters of extractable native text.
- **Latency is descriptive only.** Mean first-token latency is 6.39 seconds, but no controlled latency experiment was conducted.

## 7. Poster narrative flow

Without an oral presentation, the poster must carry this sequence on its own:

1. **Problem:** a correct legal answer and a complete set of supporting sources are different outcomes.
2. **Hypothesis:** distributed evidence will affect grounding more strongly than answer quality.
3. **Architecture:** page identity is preserved while evidence flows through ingestion, retrieval, typed answering, and citation selection.
4. **Experiment:** compare answer score and final grounding for 59 localized and 36 distributed-evidence questions.
5. **Main result:** answer scores remain similar, but grounding is 12.2 percentage points lower for distributed evidence.
6. **Mechanism diagnostic:** post-answer narrowing improves localized evidence by 4.0 points and degrades distributed evidence by 2.6 points.
7. **Decision:** treat evidence shape as a routing and validation signal instead of applying one citation policy to every answer.

## 8. Evidence that should become visuals later

Layout and art-direction alternatives derived from this narrative are documented separately in [`poster-visual-concepts.md`](poster-visual-concepts.md), so visual exploration does not become a source of new empirical claims.

Three visuals carry the argument:

1. **Evidence-flow architecture:** PDFs -> page-stable multi-view index -> hybrid retrieval -> typed answering -> page attribution -> auditable answer, with distributed evidence visibly converging on one answer.
2. **Primary contrast:** grouped dots or bars for answer score and grounding across localized and distributed evidence, including the bootstrap interval for the between-group difference.
3. **Where the gap widens:** a two-line slope chart showing raw-to-final F-beta rising for localized evidence and falling for distributed evidence.

A compact callout can show `4 / 55` versus `16 / 34` perfectly scored answers with grounding below 0.8. Product screenshots are unnecessary unless they clarify a specific evidence-loss trace.

## 9. Candidate academic references for the appendix

Core academic references for the final appendix:

1. Lewis, P., et al. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*. NeurIPS. <https://proceedings.neurips.cc/paper/2020/hash/6b493230-Abstract.html>
2. Karpukhin, V., et al. (2020). *Dense Passage Retrieval for Open-Domain Question Answering*. EMNLP. <https://aclanthology.org/2020.emnlp-main.550/>
3. Cormack, G. V., Clarke, C. L. A., and Buettcher, S. (2009). *Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods*. SIGIR. <https://doi.org/10.1145/1571941.1572114>
4. Gao, T., et al. (2023). *Enabling Large Language Models to Generate Text with Citations*. EMNLP. <https://aclanthology.org/2023.emnlp-main.398/>
5. Pipitone, N., and Houir Alami, G. (2024). *LegalBench-RAG: A Benchmark for Retrieval-Augmented Generation in the Legal Domain*. <https://arxiv.org/abs/2408.10343>
6. Zhang, Y., et al. (2025). *Qwen3 Embedding: Advancing Text Embedding and Reranking Through Foundation Models*. <https://arxiv.org/abs/2506.05176>

The appendix should also cite relevant model documentation, dataset documentation, repository software, and benchmark sources. As required by the examination guidelines, the reference list must remain primarily academic.

### Official corpus sources

These non-academic primary sources establish where the legal documents are published:

1. DIFC Courts. (n.d.). *Judgments & orders*. <https://www.difccourts.ae/rules-decisions/judgments-orders>
2. Dubai International Financial Centre. (n.d.). *DIFC legal database*. <https://www.difc.ae/business/laws-and-regulations/legal-database>

## 10. Requirements traced from the examination guidelines

### Poster content

- [x] Empirical NLP work is the center of the story.
- [x] Mandatory **Hypothesis** section includes a research question, prior-work context, and contribution.
- [x] Mandatory **Methodology** section identifies data, models, algorithms, evidence-shape groups, metrics, and repository.
- [x] Mandatory **Results** section contains graphical/table-ready results, interpretation, limitations, and unexpected outcomes.
- [x] Narrative is self-contained because there is no oral presentation.
- [ ] Author name(s), affiliation, and student ID(s) still need to be added.

### Poster format

- [ ] DIN A1, 594 x 841 mm, portrait or landscape.
- [ ] Paragraph text at least 24 pt with sufficient contrast.
- [ ] Pixel-based figures at least 150 PPI.
- [ ] Design must reinforce the argument rather than decorate it.

### Mandatory appendix and submission

- [ ] Separate appendix PDF with complete references.
- [ ] Signed University of Trier declaration of academic integrity.
- [ ] Verify the declaration's rules for documenting the use of AI tools in the project and poster preparation.
- [ ] ZIP contains exactly two PDFs: poster and appendix.
- [ ] ZIP filename follows `{student_id}.zip` or `{student_id_1}_{student_id_2}.zip` exactly.
- [ ] Submit through the seminar-group `posters` folder on STUD.IP by 30 September 2026, end of day Central European Time.

The submission rules are a hard gate: violating them results in an automatic grade of 5.0.

## 11. Open work before layout

1. Add a reproducible analysis script for evidence-shape grouping, answer-grounding comparisons, stratified bootstrap intervals, and stage diagnostics.
2. Manually inspect the 20 perfectly scored answers with grounding below 0.8 to distinguish missing support from extra-page noise and evaluator artifacts.
3. Select one representative distributed-evidence trace for the poster only if it can be shown without exposing unsupported interpretation.
4. Confirm the exact author line, student ID(s), and whether the work is individual or paired.
5. Confirm the permitted-use and disclosure wording for AI tools from the official integrity declaration.
6. Turn the candidate reference list into complete, consistently formatted appendix entries.
