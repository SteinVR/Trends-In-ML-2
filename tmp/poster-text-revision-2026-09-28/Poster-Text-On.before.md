**Research Context**

Retrieval-augmented generation (RAG) grounds language-model answers in external documents, while dense retrieval enables semantic matching between questions and passages even when wording differs (Lewis et al., 2020; Karpukhin et al., 2020).
In the legal domain, LegalBench-RAG highlights the importance of retrieving small, highly relevant legal passages (Pipitone & Houir Alami, 2024). Regulatory QA research further shows that evidence may span multiple passages and that combining lexical, semantic, and ranking-based signals can improve retrieval (Gokhan & Briscoe, 2025).
Beyond retrieval, legal QA research distinguishes answer correctness from groundedness (Trautmann et al., 2024). ==Recent end-to-end work also shows that retrieval and language-model choices both affect Legal RAG performance== {*Вот открытие, оказывается отдельные элементы системы оказывают влияние на всю систему. Кто бы мог подумать*.}(Butler & Butler, 2026).

{*Явно была предпринята попытка натянуть исследовательскую работу, но получилось нелепо*}

**Research Gap**

Existing studies examine different parts of the Legal RAG pipeline, from retrieval and groundedness to end-to-end model combinations. Less directly examined is how a broader sequence of pipeline decisions—from document access to final page selection—is associated with both answer and citation quality within one fixed system.

{*Попытка сформировать research gap. Тоже читается натянуто. Нужно подумать как сформулировать более естественно*}

**Our Contribution**

We keep the answer-generation model fixed and sequentially add OCR, multi-scale text representations, hybrid retrieval, reranking, answer-type processing, and page-level citation selection. We then track the associated changes in answer quality and citation precision and recall.

{*Точно ли именно это и в таком виде стоит тут отражать?*}
