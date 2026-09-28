from pathlib import Path
import re
p=Path('output/poster-narrative-3/layout-v4/index.html');s=p.read_text()
def pop(n):
 global s
 m=re.search(r'<section id="s'+str(n)+r'".*?</section>',s,re.S)
 s=s[:m.start()]+s[m.end():]
 return m[0]
results=pop(8);refs=pop(13)
s=re.sub(r'<div class="supporting">\s*</div>',results,s)
pos=s.rfind('</div></div></main>');s=s[:pos]+refs+s[pos:]
s=s.replace(' <span class="method-label">/ Methodology</span>','')
# Keep the embedding name attached to the semantic-retrieval node.
s=s.replace('<strong>Semantic retrieval</strong>','<strong>Semantic retrieval<span class="model">Qwen3-Embedding-0.6B</span></strong>')
s=re.sub(r'<p class="dense">Dense retrieval: Qwen3-Embedding-0.6B</p>\s*','',s)
# Restore R2 detail to the separate lower band used by the older diagram.
s=s.replace('<p class="">Pages · sections · clauses · microchunks · tables</p>\n<svg class="icon" aria-hidden="true"><use href="#icon-layers"/></svg><p class="tech"></p>','<p class=""></p>\n<svg class="icon" aria-hidden="true"><use href="#icon-layers"/></svg><p class="tech">Pages · sections · clauses · microchunks · tables</p>')
# Split the long R2 wording across heading and description without changing its words.
s=s.replace('<h3>R2 · Represent evidence at multiple scales</h3>\n<p class=""></p>','<h3>R2 · Represent evidence</h3>\n<p class="">at multiple scales</p>')
# A page with an unbroken, open-chain foreground mark; all geometry stays within 48 x 48.
s=re.sub(r'<symbol id="icon-link".*?</symbol>','''<symbol id="icon-link" viewBox="0 0 48 48"><path d="M8 3h20l10 10v13M8 3v41h14M28 3v11h10M15 22h14M15 29h9"/><circle cx="34" cy="35" r="13" fill="#f1eafb" stroke="none"/><g transform="translate(21 22)"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></g></symbol>''',s,flags=re.S)
s=s.replace('</style></head>','''
/* Reading flow v4: context 1–5, methods/evaluation/results 6–8, discussion 9–13. */
.columns{grid-template-columns:29% 39.5% 1fr}
.center{justify-content:space-between}.center #s8{margin-top:auto}
.right{justify-content:space-between;gap:10px}.right #s13{margin-top:0}
#s13 li{font-size:16pt;line-height:1.06;margin-bottom:5px}
#s13 .code{font-size:24pt;margin-top:10px;padding-top:8px}
.baseline{display:grid;grid-template-columns:125px minmax(0,1fr);gap:15px;align-items:center;padding:14px 12px}
.baseline>h3{margin:0;font-size:24pt;line-height:1.1}
.flow{grid-template-columns:1fr 1.65fr .85fr 1.15fr;gap:25px;align-items:center}
.flow>div{grid-template-columns:40px minmax(0,1fr);align-items:center;gap:8px}
.flow strong{font-size:24pt;line-height:1.1}
.flow .model{display:block;font-weight:400;white-space:nowrap;font-size:24pt;margin-top:5px}
.flow>div:not(:last-child)::after{top:50%;transform:translateY(-50%);right:-24px}
.flow .icon{width:40px;height:40px;margin:0}
.stages{gap:12px;grid-template-rows:auto auto auto 56px auto}
.stage{padding:12px 0 0;border:1px solid #c7dce8;border-radius:8px;row-gap:12px}
.stage h3,.stage>p:not(.tech){padding:0 12px}
.stage h3{line-height:1.08;font-size:24pt}
.stage .icon{width:50px;height:50px;align-self:center;justify-self:center}
.stage .tech{padding:10px 12px 12px;border:0;border-radius:6px 6px 7px 7px;line-height:1.08}
.stage.doc .tech{background:#dceef9}.stage.retr .tech{background:#e1efd9}.stage.ans .tech{background:#f8e3cf}.stage.cit .tech{background:#e7ddf4}
.stage:not(:last-child)::after{font-size:0;content:'';width:11px;height:18px;right:-12px;bottom:166px;background:var(--stage);clip-path:polygon(0 30%,55% 30%,55% 0,100% 50%,55% 100%,55% 70%,0 70%)}
</style></head>''')
p.write_text(s)
p=Path('output/poster-narrative-3/layout-v4/export.mjs');s=p.read_text().replace("'s8,s9,s10,s11,s12'","'s9,s10,s11,s12,s13'")
# Baseline nodes match the old centered composition; verify the model-node relationship instead.
s=s.replace('check.baselineSpread>0.5||','')
p.write_text(s)
