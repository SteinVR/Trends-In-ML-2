from pathlib import Path
p=Path('output/poster-narrative-3/revised-poster/index.html')
s=p.read_text()
s=s.replace('padding:14mm 18mm 12mm','padding:10mm 18mm 12mm')
a=s.index('header{position:relative}');b=s.index('section{margin-top:',a)
s=s[:a]+'''header{position:relative;min-height:35mm;display:flex;align-items:center;justify-content:space-between;gap:8mm}.logo{width:74mm;height:auto;flex:none}
h1{font-size:47pt;line-height:1.04;letter-spacing:-.035em;font-weight:700;margin:0;color:#073d65}
'''+s[b:]
a=s.index('.data{');b=s.index('.controls{',a)
s=s[:a]+'''.data{margin-bottom:3mm}.icon-defs{position:absolute;width:0;height:0;overflow:hidden}.icon{width:17mm;height:17mm;flex:none;fill:none;stroke:currentColor;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round}
.baseline-flow{display:grid;grid-template-columns:.68fr 1.04fr 1.42fr 1.22fr 1.45fr;gap:7mm;align-items:center;background:#f0f5f8;border:.45mm solid #c8d8e5;border-radius:3mm;padding:3mm 4mm;margin:3mm 0 5mm;min-height:33mm}
.baseline-flow h3{font-size:25pt;margin:0}.baseline-node{display:flex;align-items:center;gap:3mm;position:relative}.baseline-node p{line-height:1.15}.baseline-node strong{display:block;margin-bottom:1mm}.baseline-node:not(:last-child)::after{content:'→';position:absolute;right:-6mm;color:#437caa;font-size:29pt}.baseline-node .icon{width:15mm;height:15mm}
.pipeline-groups{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3mm 6mm}.phase{grid-column:span 2;position:relative;text-align:center;border-top:.45mm solid var(--stage);border-left:.45mm solid var(--stage);border-right:.45mm solid var(--stage);border-radius:2mm 2mm 0 0;height:7mm;margin-top:3mm;color:var(--stage)}.phase.single{grid-column:span 1}.phase span{position:relative;top:-4.5mm;background:white;padding:0 3mm;font-weight:700;font-size:24pt;text-transform:uppercase;white-space:nowrap}
.doc-stage{--stage:#3186bd;--tint:#eef7fd;--band:#dcecf7}.retrieval-stage{--stage:#4b8a42;--tint:#f1f8ef;--band:#e1efdc}.answer-stage{--stage:#b96734;--tint:#fff5ed;--band:#fae7d6}.citation-stage{--stage:#7655b5;--tint:#f6f1fc;--band:#e8ddf5}
.pipeline-card{position:relative;border:.45mm solid var(--stage);border-radius:3mm;background:var(--tint);display:flex;flex-direction:column;min-width:0;line-height:1.14}
.card-body{padding:3mm 3mm 2mm;display:flex;flex-direction:column;flex:1}.pipeline-card h3{font-size:25pt;line-height:1.12;color:var(--ink);min-height:20mm;margin:0 0 2mm}.pipeline-card .purpose{min-height:29mm}.pipeline-card .icon{color:var(--stage);width:17mm;height:17mm;margin:1mm auto 0}.pipeline-card .technology{background:var(--band);padding:2.5mm 3mm;min-height:34mm;border-radius:0 0 2.6mm 2.6mm;display:flex;align-items:flex-start;font-size:24pt}
.pipeline-card:not(:last-child)::after{content:'';position:absolute;width:5mm;height:7mm;right:-5.8mm;top:43%;background:var(--stage);clip-path:polygon(0 30%,52% 30%,52% 0,100% 50%,52% 100%,52% 70%,0 70%)}
.cumulative-note{text-align:center;margin-top:3mm;padding:2mm 3mm;background:#edf1f5;border-radius:2mm;font-weight:700}
'''+s[b:]
s=s.replace('.chart{width:100%;display:block}', '.chart{width:100%;display:block;margin:1mm 0 2mm}')
s=s.replace('.detail-grid{margin-top:4mm;grid-template-columns:.95fr 1.05fr}', '.detail-grid{margin-top:4mm;grid-template-columns:1fr 1fr}')
s=s.replace('.ocr{width:100%;margin:2mm 0}', '.ocr{width:100%;display:block;margin:3mm 0 2mm}')
a=s.index('<header>');b=s.index('</header>',a)
s=s[:a]+'''<header>
+ <h1>Building Legal RAG:<br>what each component contributes</h1>
+ <img class="logo" src="assets/trier-university.svg" alt="Universität Trier">
+'''.replace('\n+','\n')+s[b:]
# Inline SVG symbols keep every diagram icon sharp at full A1 size.
a=s.index('<main class="poster">')
s=s[:a]+'''<svg class="icon-defs" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>
<symbol id="icon-file" viewBox="0 0 48 48"><path d="M10 4h18l10 10v30H10zM28 4v12h10M17 24h14M17 30h14M17 36h10"/></symbol>
<symbol id="icon-scan" viewBox="0 0 48 48"><path d="M9 3h21l9 10v32H9zM30 3v12h9"/><path d="m14 35 7-9 7 7 5-5 2 7z" fill="currentColor" stroke="none"/><circle cx="17" cy="21" r="2" fill="currentColor" stroke="none"/></symbol>
<symbol id="icon-layers" viewBox="0 0 48 48"><path d="m24 5 20 11-20 11L4 16zM5 25l19 11 19-11M5 34l19 11 19-11"/></symbol>
<symbol id="icon-search" viewBox="0 0 48 48"><circle cx="20" cy="20" r="14"/><path d="m30 30 14 14"/></symbol>
<symbol id="icon-rank" viewBox="0 0 48 48"><path d="M6 10h3v9M5 19h7M5 27q6-6 7-1c1 3-7 4-7 8h8M5 39h5q4 0 1 3 4 3-1 4H5"/><rect x="19" y="11" width="26" height="6" rx="1" fill="currentColor" stroke="none"/><rect x="19" y="26" width="21" height="6" rx="1" fill="currentColor" stroke="none" opacity=".7"/><rect x="19" y="40" width="15" height="6" rx="1" fill="currentColor" stroke="none" opacity=".45"/></symbol>
<symbol id="icon-check" viewBox="0 0 48 48"><path d="M8 3h20l10 11v11M8 3v40h14M28 3v12h10M15 22h14M15 29h9"/><circle cx="34" cy="36" r="11" fill="currentColor" stroke="none"/><path d="m28 36 4 4 8-9" stroke="white" stroke-width="3"/></symbol>
<symbol id="icon-link" viewBox="0 0 48 48"><path d="M8 3h20l10 11v8M8 3v40h12M28 3v12h10M15 23h13M15 30h8M27 30l4-4q5-4 9 0t0 8l-4 4M34 35l-4 4q-5 5-9 0t0-8l4-4M25 35l11-11"/></symbol>
<symbol id="icon-answer" viewBox="0 0 48 48"><path d="M6 5h36v28H23l-11 10V33H6z"/><circle cx="15" cy="19" r="2" fill="currentColor"/><circle cx="24" cy="19" r="2" fill="currentColor"/><circle cx="33" cy="19" r="2" fill="currentColor"/></symbol>
</defs></svg>
'''+s[a:]
a=s.index(' <p class="baseline">');b=s.index(' <p class="controls">',a)
s=s[:a]+''' <div class="baseline-flow" role="group" aria-label="R0 baseline pipeline">
+  <h3>R0 · Baseline</h3>
+  <div class="baseline-node"><svg class="icon" aria-hidden="true"><use href="#icon-file"/></svg><p><strong>PDF text</strong>300-token passages</p></div>
+  <div class="baseline-node"><svg class="icon" aria-hidden="true"><use href="#icon-search"/></svg><p><strong>Semantic retrieval</strong>Qwen3-Embedding-0.6B</p></div>
+  <div class="baseline-node"><svg class="icon" aria-hidden="true"><use href="#icon-answer"/></svg><p><strong>Generate answer</strong>GPT-5.4-mini</p></div>
+  <div class="baseline-node"><svg class="icon" aria-hidden="true"><use href="#icon-file"/></svg><p><strong>Answer + retrieved pages</strong>All context pages as citations</p></div>
+ </div>
+ <div class="pipeline-groups" role="group" aria-label="Six cumulative pipeline additions">
+  <div class="phase doc-stage"><span>Document processing</span></div><div class="phase retrieval-stage"><span>Retrieval</span></div><div class="phase single answer-stage"><span>Answering</span></div><div class="phase single citation-stage"><span>Citations</span></div>
+  <div class="pipeline-card doc-stage"><div class="card-body"><h3>R1 · OCR</h3><p class="purpose">Recover text from scanned pages</p><svg class="icon" aria-hidden="true"><use href="#icon-scan"/></svg></div><p class="technology">PP-OCRv5</p></div>
+  <div class="pipeline-card doc-stage"><div class="card-body"><h3>R2 · Multiple<br>text scales</h3><p class="purpose">Represent evidence at multiple levels</p><svg class="icon" aria-hidden="true"><use href="#icon-layers"/></svg></div><p class="technology">Pages, sections, clauses, microchunks, tables</p></div>
+  <div class="pipeline-card retrieval-stage"><div class="card-body"><h3>R3 · Lexical<br>retrieval</h3><p class="purpose">Combine semantic and exact-term search</p><svg class="icon" aria-hidden="true"><use href="#icon-search"/></svg></div><p class="technology">BM25 + RRF<br>with semantic retrieval</p></div>
+  <div class="pipeline-card retrieval-stage"><div class="card-body"><h3>R4 · Neural<br>reranking</h3><p class="purpose">Prioritize the most relevant evidence</p><svg class="icon" aria-hidden="true"><use href="#icon-rank"/></svg></div><p class="technology">Qwen3-<br>Reranker-0.6B</p></div>
+  <div class="pipeline-card answer-stage"><div class="card-body"><h3>R5 · Answer<br>type checks</h3><p class="purpose">Normalize and validate the answer type</p><svg class="icon" aria-hidden="true"><use href="#icon-check"/></svg></div><p class="technology">Normalization, validation and confidence checks</p></div>
+  <div class="pipeline-card citation-stage"><div class="card-body"><h3>R6 · Citation<br>selection</h3><p class="purpose">Select pages from supporting chunks</p><svg class="icon" aria-hidden="true"><use href="#icon-link"/></svg></div><p class="technology">Supporting-chunk references + page validation</p></div>
+ </div>
+ <p class="cumulative-note">Each variant (R1–R6) includes all previous additions.</p>
+'''.replace('\n+','\n')+s[b:]
a=s.index(' <div class="evaluation">');b=s.index('\n</section>',a)
s=s[:a]+''' <div class="evaluation">
+  <p><strong>Answer quality Q = 0.7 × S + 0.3 × F.</strong> S / F: mean structured / free-text scores. Free text is LLM-scored.</p>
+  <p><strong>Citation precision:</strong> share of cited pages that match annotated source pages. <strong>Recall:</strong> share of annotated pages cited.</p>
+  <p>Q averages 100 questions; citation metrics average 95. A correct answer can still have poor citations.</p>
+ </div>'''.replace('\n+','\n')+s[b:]
s=s.replace('assets/sequence.svg','assets/sequence-readable.svg').replace('assets/ocr.svg','assets/ocr-readable.svg')
s=s.replace('Scanning 10 of 30 PDFs lowers Q from 65.4% to 46.2%. OCR restores most of this loss, reaching 63.2%.','Converting 10 documents into synthetic scans reduces answer quality from 65.4% to 46.2%. OCR restores most of this loss, reaching 63.2%.')
s=s.replace('<a href="poster.pdf">PDF A1</a><a href="powerpoint/legal-rag-poster-updated.pptx">PowerPoint</a>', '<span>HTML review draft</span>')
p.write_text(s)
p=Path('output/poster-narrative-3/revised-poster/build-html-charts.mjs');s=p.read_text().replace('height=423','height=375').replace('height="423"','height="375"').replace('x0=left+87','x0=left+104').replace('text(x0-23,y+11','text(x0-45,y+11');s=s.replace("svg+=text(0,405,'R0 Baseline    R1 + OCR    R2 + Multiple scales    R3 + Lexical    R4 + Reranker    R5 + Typed checks    R6 + Citations','scope');",'');p.write_text(s)
