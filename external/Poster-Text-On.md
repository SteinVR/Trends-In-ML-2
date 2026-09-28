**Research Context**

Retrieval-augmented generation (RAG) conditions language-model answers on retrieved documents ([Lewis et al., 2020](https://arxiv.org/abs/2005.11401)). Legal retrieval must balance precise evidence selection with sufficient coverage: LegalBench-RAG targets minimal relevant passages ([Pipitone & Houir Alami, 2024](https://arxiv.org/abs/2408.10343)), while regulatory QA experiments show that retrieving all supporting evidence becomes harder when it spans multiple passages ([Gokhan & Briscoe, 2025](https://aclanthology.org/2025.nllp-1.10/)). In an end-to-end legal benchmark, retrieval-model choice had a larger effect on answer correctness than generator choice ([Butler & Butler, 2026](https://arxiv.org/abs/2603.01710)).

Evaluation also extends beyond correctness. Legal QA research assesses whether answers are supported by the supplied context ([Trautmann et al., 2024](https://aclanthology.org/2024.nllp-1.14/)), while ALCE evaluates answer correctness and citation quality separately ([Gao et al., 2023](https://aclanthology.org/2023.emnlp-main.398/)). Together, these studies motivate examining both the evidence available to the generator and the sources ultimately cited.

**Research Question**

Building on this work, we study component choices within a legal PDF question-answering system: with the generator fixed, which pipeline additions improve answer quality and page-level citation precision and recall, and where do these objectives conflict?

**Our Contribution**

We build a Legal RAG pipeline and provide an empirical comparison of seven cumulative configurations on 30 documents and 100 questions. Our experiments identify where added complexity helps or hurts: OCR recovers most of the loss caused by synthetic scans; multi-scale representations initially reduce answer quality, while subsequent hybrid retrieval and reranking improve it; citation selection raises precision at the cost of recall. These findings provide evidence for component selection within the tested system.
