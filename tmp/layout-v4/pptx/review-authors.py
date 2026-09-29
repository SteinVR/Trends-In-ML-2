from pathlib import Path
import json,re,pymupdf,hashlib
P=Path('tmp/layout-v4/pptx');src=json.loads((P/'dom.json').read_text());doc=pymupdf.open(Path('tmp/layout-v4/authors-revision/legal-rag-layout-v4.pdf'));page=doc[0];lines=[]
for b in page.get_text('rawdict')['blocks']:
 for l in b.get('lines',[]):
  chars=[c for s in l['spans'] for c in s['chars'] if not c['c'].isspace()]
  if chars:lines.append({'text':''.join(c['c'] for c in chars),'chars':chars})
residual=[];missing=[]
for i in src['items']:
 if i['kind']!='text':continue
 needle=re.sub(r'\s+','',i['text']);candidates=[]
 for line in lines:
  at=line['text'].find(needle)
  if at>=0:
   x,y=line['chars'][at]['origin'];candidates.append((x/.75,y/.75))
 if not candidates:missing.append(i['text']);continue
 x,y=min(candidates,key=lambda p:abs(p[0]-i.get('originX',i['left']))+abs(p[1]-i['baseline']))
 residual.append({'id':i['id'],'dx':i.get('originX',i['left'])-x,'dy':i['baseline']-y})
report={'text_runs_verified':len(residual),'missing':missing,'maximum_origin_error_px':max(abs(v['dx']) for v in residual),'maximum_baseline_error_px':max(abs(v['dy']) for v in residual),'page_count':len(doc),'size_mm':[v*25.4/72 for v in page.rect[2:]],'reference_pdf_sha256':hashlib.sha256(Path('output/poster-narrative-3/layout-v4/poster.pdf').read_bytes()).hexdigest(),'font_mapping':{'BarlowCondensed':'Barlow Condensed','NotoSans':'Noto Sans','LiberationSans':'Liberation Sans'},'note':'Source PDF uses PostScript names without spaces. Font policy validates chosen matching family names; source mappings verified separately.'}
(Path('tmp/layout-v4/authors-revision/self-review.json')).write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2));assert not missing;assert len(doc)==1;assert report['maximum_origin_error_px']<.2;assert report['maximum_baseline_error_px']<.2
page.get_pixmap(matrix=pymupdf.Matrix(1,1),clip=pymupdf.Rect(710,360,1640,935)).save(Path('tmp/layout-v4/authors-revision/methods-final.png'))
