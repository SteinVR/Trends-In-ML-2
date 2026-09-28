from pathlib import Path
import re
p=Path('output/poster-narrative-3/layout-v4/index.html');s=p.read_text()
def pop(n):
 global s
 m=re.search(r'<section id="s'+str(n)+r'".*?</section>',s,re.S)
 s=s[:m.start()]+s[m.end():]
 return m[0]
con=pop(11);lim=pop(12);refs=pop(13)
# End the main narrative in the right column. Supporting material stays separate.
a=s.index('<div class="col right">');prefix=s[:a];suffix=s[a:]
pos=prefix.rfind('</div>');prefix=prefix[:pos]+'<div class="supporting">'+lim+refs+'</div>'+prefix[pos:]
pos=suffix.rfind('</div></div></main>');suffix=suffix[:pos]+con+suffix[pos:]
s=prefix+suffix
# R2 has a representation inventory, not a named implementation/model footer.
s=s.replace('<p class=""></p>\n<svg class="icon" aria-hidden="true"><use href="#icon-layers"/></svg><p class="tech">Pages · sections · clauses · microchunks · tables</p>', '<p class="">Pages · sections · clauses · microchunks · tables</p>\n<svg class="icon" aria-hidden="true"><use href="#icon-layers"/></svg><p class="tech"></p>')
# One shared row grid for stage titles, descriptions, icons and technology labels.
s=s.replace('</style></head>','''
/* Shared stage rows, followed by a continuous results-to-conclusion reading path. */
.stages{grid-template-rows:auto auto auto 48px auto;gap:10px}
.stage{display:grid;grid-template-rows:subgrid;grid-row:2 / span 4;min-height:0;padding:12px 10px;row-gap:10px}
.stage h3{min-height:0;margin:0;line-height:1.08}
.stage>p:not(.tech){margin:0;line-height:1.05}
.stage .icon{height:44px;width:44px;justify-self:center;align-self:center;margin:0}
.stage .tech{margin:0;padding-top:10px;border-top:1px solid #c8d8e2;line-height:1.05}
.stage:not(:last-child)::after{top:auto;bottom:154px;right:-14px}
#s6 .content>h3:first-child,#s6 .subhead{display:inline;margin:0 8px 0 0}
#s6 .content>h3:first-child+p,#s6 .subhead+p{display:inline}
#s6 .subhead::before{content:'';display:block;height:16px}
.baseline{margin-top:17px}
.supporting{margin-top:auto;display:flex;flex-direction:column;gap:14px;padding-top:18px;border-top:2px solid #b8d4e4}
.supporting #s13{margin-top:0}
.right #s11{margin-top:auto}
.right .takeaways{display:block;margin-top:14px}
.right .takeaways>div{border:0;padding:0;margin:0 0 12px}
.right .takeaways h3{display:inline;font-size:24pt;margin:0 8px 0 0;line-height:1.05}
.right .takeaways p{display:inline;line-height:1.05}
.right .takeaways>div:last-child{margin-bottom:0}
.right .main-takeaway{padding:16px;line-height:1.05}
.right .unexpected{margin-top:14px!important;padding-top:12px}
</style></head>''')
p.write_text(s)
