from pathlib import Path
import json,re,pymupdf
P=Path('tmp/layout-v4/pptx');src=json.loads((P/'dom.json').read_text());page=pymupdf.open(P/'render/candidate.pdf')[0];lines=[]
for b in page.get_text('rawdict')['blocks']:
 for l in b.get('lines',[]):
  chars=[c for s in l['spans'] for c in s['chars'] if not c['c'].isspace()]
  if chars:lines.append({'text':''.join(c['c'] for c in chars),'chars':chars})
offsets={};missing=[]
for i in src['items']:
 if i['kind']!='text':continue
 needle=re.sub(r'\s+','',i['text']);candidates=[]
 for line in lines:
  at=line['text'].find(needle)
  if at>=0:
   x,y=line['chars'][at]['origin'];candidates.append((x/.75,y/.75))
 if not candidates:missing.append(i['text']);continue
 x,y=min(candidates,key=lambda p:abs(p[0]-i['left'])+abs(p[1]-i['baseline']))
 offsets[i['id']]={'dx':i.get('originX',i['left'])-x,'dy':i['baseline']-y}
(P/'offsets.json').write_text(json.dumps(offsets,indent=2));(P/'calibration-missing.json').write_text(json.dumps(missing));print('Matched',len(offsets),'missing',missing,'maximum offsets',max(abs(v['dx']) for v in offsets.values()),max(abs(v['dy']) for v in offsets.values()))
assert not missing
