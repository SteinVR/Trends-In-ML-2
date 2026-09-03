# Poster Narrative: Citation-Aware Legal RAG

> Working narrative for the empirical argument that will guide the poster copy and visuals. This is not a layout specification or final poster text.
>
> Source project: [Agentic-RAG-Challenge](https://github.com/SteinVR/Agentic-RAG-Challenge)

## 1. Narrative decision

### Central story

Legal RAG must retrieve enough evidence to answer a question and decide which source pages to cite. The studied pipeline handles citation selection in a separate, answer-aware attribution stage. This stage reduces citation noise without causing a complete source miss on any annotated question, but the benefit is uneven: narrowing works well when evidence is concentrated on one page and can remove support when an answer spans several pages or documents.

### One-sentence takeaway

> An explicit answer-aware attribution stage raised macro page precision from 63.8% to 73.9% and reduced the average citation set by 0.33 pages per question, while all 95 annotated questions retained at least one correct page; multi-page evidence remains the main failure mode.

### Product implication

The product should retrieve broadly for answer generation and select citations in a separate, traceable step. When evidence is distributed across pages or documents, selection should remain conservative.

### Scope boundary

The poster evaluates the page-attribution stage rather than competition performance or the repository's full feature set. The legal corpus consists of publicly available primary documents from the official DIFC Legal Database and DIFC Courts Judgments & Orders repositories. The challenge supplies the task context and packaged warm-up evaluation inputs; it did not publish the original legal documents.

The word *agentic* should not lead the title. The saved implementation is a staged, mostly deterministic pipeline with model-assisted decisions, not an autonomous agent that plans and repeatedly acts on an environment.

## 2. Working title and subtitle

**Recommended title:** *Citation-Aware Legal RAG: From Retrieved Chunks to Auditable Source Pages*

**Subtitle:** *A paired stage analysis across 100 legal questions and 590 PDF pages*

**Architecture-oriented alternative:** *Separating Retrieval, Answering, and Page Attribution in a Legal RAG Pipeline*

## 3. Hypothesis

### Research context

Retrieval-augmented generation (RAG) conditions generated answers on external evidence. Dense retrieval supports semantic matching, while lexical retrieval remains useful for exact legal terms, article numbers, names, and dates. Rank fusion and reranking combine these signals, but the highest-ranked chunks are not automatically the best final citations.

This distinction is consequential in legal question answering: a system may retrieve enough evidence for a correct answer while citing redundant, weakly related, or incomplete pages. Prior work on attributed generation and legal RAG evaluation therefore treats citation quality separately from answer quality.

### Research gap

Many RAG pipelines pass the pages attached to retrieved chunks directly into the answer. The studied pipeline preserves page identity through ingestion and retrieval, then selects citations after producing the answer. The open question is whether this narrowing removes citation noise without creating complete source misses.

### Research question

**Can an explicit answer-aware page-attribution stage improve source-page precision while preserving at least one correct source page for every answer?**

### Working hypothesis

**H1.** Compared with pages inherited directly from retrieval, final answer-aware attribution will:

1. increase macro source-page precision;
2. reduce the mean number of cited pages per question; and
3. preserve question-level hit coverage, defined as retaining at least one gold source page.

Recall and F-beta serve as guardrails. A precision gain does not support the hypothesis if it comes from systematically discarding required multi-page evidence.

### Operational definitions

| Concept | Operational measure |
| --- | --- |
| Citation noise | False-positive source pages, reflected in page precision |
| Citation-set size | Mean emitted pages per eligible question |
| Complete source miss | No overlap between emitted pages and gold pages for a question |
| Evidence completeness | Page recall |
| Combined grounding quality | Page F-beta with beta = 2.5, weighting recall more than precision |

### Study status

The hypothesis was formulated retrospectively around a saved development run; it was not preregistered. The poster must describe the study as a paired stage analysis, not as a randomized or independently repeated experiment.

## 4. Methodology

### Evaluation data

- **Corpus:** 30 publicly available DIFC legal PDFs containing 590 pages: 9 laws or consolidated legal instruments and 21 court judgments or orders.
- **Primary sources:** [DIFC Legal Database](https://www.difc.ae/business/laws-and-regulations/legal-database) and [DIFC Courts Judgments & Orders](https://www.difccourts.ae/rules-decisions/judgments-orders).
- **Benchmark:** 100 legal questions. Of these, 95 have annotated source pages and are eligible for page-level evaluation; 5 have no gold page reference.
- **Answer types:** 32 boolean, 30 free text, 17 number, 15 name, 5 name-list, and 1 date question.
- **Evaluation artifacts:** the saved run evaluates the packaged warm-up questions against the corresponding page-level gold references. The challenge provides benchmark and distribution context, not the underlying legal documents.

The corpus is described as *publicly available*, not *openly licensed*: public access does not establish an open-content license, and the applicable source terms have not been verified.

### Relation to the term-paper corpus

The related term paper *Parametric Adaptation Methods for Document-Grounded Legal QA* selects eight publicly available laws, regulations, judgments, and orders from the same DIFC source collection. Five of its eight document IDs also occur in the 30-document corpus evaluated here.

The benchmarks are separate. The term paper independently authors 200 question-answer pairs and evaluates a 50-question split; neither that benchmark nor its scores are inputs to this poster analysis. Only its corpus description and official-source citations carry over.

### System architecture

The system retrieves broadly and narrows citations after answering.

1. **Page-first ingestion.** Each PDF is processed page by page. Native text, structural parsing, tables, and OCR fallback produce a canonical corpus. Every downstream record retains `document_id` and `page_number`.
2. **Multi-view indexing.** The system represents the same material as page, section, clause, microchunk, and table chunks instead of relying on one granularity.
3. **Hybrid retrieval.** BM25 lexical retrieval and `Qwen3-Embedding-0.6B` dense retrieval produce candidates. Reciprocal Rank Fusion combines their rankings, and `Qwen3-Reranker-0.6B` reranks the fused evidence.
4. **Typed answering.** `gpt-5.4-mini` produces schema-constrained answers. Structured outputs pass type-specific normalization and validation, boolean and number answers receive additional deterministic evidence checks, and free-text outputs pass answer-to-evidence support validation.
5. **Explicit page attribution.** The system collapses chunk references into candidate pages and filters repeated boilerplate. The answer solver identifies relevant evidence; validation emits supported candidate pages and falls back when narrowing lacks support.
6. **Auditable output.** Each answer includes source pages, per-question traces, validation decisions, and latency telemetry.

The architectural invariant is:

> Every chunk keeps its document and page identity, so retrieval, answering, and citation decisions remain traceable.

### Compared stages

The experiment compares three citation sets for the same 95 questions:

| Stage | Meaning |
| --- | --- |
| Raw retrieval | All unique pages inherited from retrieved evidence chunks |
| Filter pass A | Raw pages after deterministic repeated-boilerplate suppression; title-page suppression exists in the code but was disabled in the saved run |
| Final attribution | Candidate pages retained because they support the produced answer, with validation and fallback behavior |

All three stages come from the same run. The paired comparison measures how each question's citation set changes as the pipeline narrows it; it does not compare independently trained systems.

### Metrics and uncertainty

- Macro precision, recall, and F-beta are computed per question and then averaged over the 95 eligible questions.
- F-beta uses beta = 2.5, giving recall more weight than precision.
- Question-level hit coverage counts whether at least one gold page is retained.
- Citation-set size is the mean number of emitted pages per eligible question.
- Uncertainty estimates use 20,000 paired bootstrap resamples over questions with random seed `20260903`.

### Reproducibility

Repository: <https://github.com/SteinVR/Agentic-RAG-Challenge>

Evidence from the saved run:

| Artifact | Repository-relative path |
| --- | --- |
| Run configuration | `artifacts/warmup_runs/configs/solver_narrowing_true.yaml` |
| Run manifest | `artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/manifest.json` |
| Page-level summary | `artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/grounding/summary.json` |
| Question-level page ledger | `artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/grounding/ledger.csv` |
| System-level evaluation | `artifacts/warmup_runs/runs/submission_e2e_20260424_solver_narrowing_no_guard/eval/benchmark_report.json` |

Before submission, the repository must include the paired-bootstrap and slice-analysis code needed to regenerate every reported number.

## 5. Results

### Primary results

Macro averages over the 95 questions with annotated source pages:

| Citation stage | Precision | Recall | F-beta (beta = 2.5) | Pages per question | At least one correct page |
| --- | ---: | ---: | ---: | ---: | ---: |
| Raw retrieval | 63.8% | 96.8% | 87.7% | 2.56 | 95 / 95 |
| Filter pass A | 63.8% | 96.2% | 87.3% | 2.54 | 95 / 95 |
| Final attribution | **73.9%** | 95.2% | **89.2%** | **2.23** | **95 / 95** |

Final attribution versus raw retrieval:

| Measure | Paired change | 95% paired-bootstrap interval |
| --- | ---: | ---: |
| Precision | **+10.2 percentage points** | +6.3 to +14.4 pp |
| Recall | -1.6 percentage points | -3.7 to 0.0 pp |
| F-beta | +1.5 percentage points | -0.3 to +3.1 pp |
| Pages per question | **-0.33 pages** | -0.46 to -0.20 pages |

### Interpretation

Final attribution meets the precision and citation-size predictions: it removes false-positive pages and retains at least one correct page for every eligible question. The recall point estimate falls by 1.6 percentage points, and the uncertainty interval for the F-beta change includes zero. The evidence therefore supports **cleaner citation sets with preserved question-level coverage**, but not a general improvement in every aspect of grounding.

The deterministic filter does not improve macro precision and slightly reduces recall. The measured precision gain appears only after the answer is available, supporting answer-aware attribution rather than generic retrieval cleanup.

### Exploratory slice analysis

| Evidence shape | Questions | Raw F-beta | Final F-beta | Change |
| --- | ---: | ---: | ---: | ---: |
| Single-page gold evidence | 59 | 89.8% | 93.8% | +4.0 pp |
| Multi-page gold evidence | 36 | 84.2% | 81.6% | -2.6 pp |
| Single-document gold evidence | 60 | 89.9% | 93.1% | +3.2 pp |
| Multi-document gold evidence | 35 | 83.9% | 82.5% | -1.4 pp |

These slices are exploratory, not confirmatory. They expose the central failure mode: answer-aware narrowing helps when evidence is localized but can under-cite answers that require distributed support.

### Answer to the hypothesis

**Partially supported.** Final attribution improves precision, reduces citation-set size, and preserves at least one correct page for all eligible questions. It does not preserve every gold page, and the aggregate F-beta improvement remains inconclusive. The supported product decision is to keep attribution explicit and use a conservative policy for multi-page and multi-document evidence.

## 6. Limitations

The final poster should include these limitations.

- **Single saved run.** No end-to-end runs were repeated with different random seeds.
- **Retrospective analysis.** The research question was formulated around existing development artifacts rather than preregistered.
- **Stage comparison, not a full causal ablation.** Raw and final citations come from the same run, and final attribution depends on the produced answer.
- **Limited external validity.** The evaluation uses one 100-question warm-up benchmark of legal documents.
- **Distributed evidence regression.** Multi-page and multi-document questions lose some required support.
- **OCR is not evaluated separately.** The pipeline includes OCR fallback, but there is no OCR-on versus OCR-off comparison; all 590 PDF pages expose at least 50 characters of extractable native text.
- **Model dependence.** Final page selection partly depends on model-reported relevant evidence and type-specific support checks.
- **Latency is descriptive only.** Mean first-token latency is 6.39 seconds, but no controlled latency experiment was conducted.

## 7. Poster narrative flow

Without an oral presentation, the poster must carry this sequence on its own:

1. **Problem:** retrieved evidence is necessary for answering, but retrieved pages are too noisy to serve directly as citations.
2. **Hypothesis:** a separate answer-aware attribution stage can improve precision without causing complete source misses.
3. **Architecture:** preserve page identity, retrieve broadly, answer, then select and validate citations.
4. **Experiment:** compare raw, filtered, and final page sets for the same 95 annotated questions.
5. **Main result:** precision rises by 10.2 pp, citation sets shrink by 0.33 pages, and question-level hit coverage remains 95/95.
6. **Boundary of the result:** overall F-beta improvement is uncertain and multi-page evidence regresses.
7. **Decision:** keep page attribution as a first-class product component, but narrow conservatively when evidence is distributed.

## 8. Evidence that should become visuals later

Three visuals carry the argument:

1. **Architecture flow:** PDFs -> page-stable multi-view index -> hybrid retrieval -> typed answering -> answer-aware page attribution -> auditable answer.
2. **Primary comparison:** grouped bars or a compact slope chart for precision, recall, and F-beta across raw, filter-pass, and final stages.
3. **Failure-mode contrast:** single-page versus multi-page F-beta change, making the product limitation immediately visible.

The architecture visual explains the mechanism; the two result visuals provide the evidence. Product screenshots are unnecessary unless they clarify a specific step.

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
- [x] Mandatory **Methodology** section identifies data, models, algorithms, comparison stages, metrics, and repository.
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

1. Add a reproducible poster-analysis script for paired bootstrap intervals and evidence-shape slices.
2. Confirm the exact author line, student ID(s), and whether the work is individual or paired.
3. Confirm the permitted-use and disclosure wording for AI tools from the official integrity declaration.
4. Turn the candidate reference list into complete, consistently formatted appendix entries.
5. Decide whether the title should emphasize the research contribution (*auditable source pages*) or the product decomposition (*retrieval, answering, attribution*).
