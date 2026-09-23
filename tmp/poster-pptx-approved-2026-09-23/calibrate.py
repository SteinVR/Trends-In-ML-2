from pathlib import Path
import json, re
import pymupdf

build=Path('tmp/poster-pptx-approved-2026-09-23')
normal=lambda s: re.sub(r'\s+','',s)
def lines(path):
    page=pymupdf.open(path)[0]
    output=[]
    for block in page.get_text('rawdict')['blocks']:
        for line in block.get('lines',[]):
            chars=[c for span in line['spans'] for c in span['chars'] if not c['c'].isspace()]
            if chars: output.append({'text':''.join(c['c'] for c in chars),'chars':chars})
    return output
reference=lines(build/'reference.pdf')
candidate=lines(build/'render/candidate.pdf')
items=json.loads((build/'dom.json').read_text())['items']
offsets={}; missing=[]
for item in items:
    if item['kind']!='text': continue
    first=normal(''.join(r['text'] for r in item['lines'][0]['runs']))
    matches=[]
    for data in [reference,candidate]:
        options=[]
        for line in data:
            at=line['text'].find(first)
            if at>=0:
                c=line['chars'][at]
                options.append({'x':c['origin'][0],'y':c['origin'][1]})
        if not options: break
        matches.append(min(options,key=lambda line:abs(line['x']/0.75-item['left'])+abs(line['y']/0.75-item['top'])))
    if len(matches)!=2:
        missing.append({'id':item['id'],'text':first}); continue
    a,b=matches
    offsets[item['id']]={'dx':(a['x']-b['x'])/0.75,'dy':(a['y']-b['y'])/0.75}
print('Calibrated:',len(offsets),'text boxes; unmatched:',missing)
(build/'offsets.json').write_text(json.dumps(offsets,indent=2))
(build/'calibration-missing.json').write_text(json.dumps(missing,indent=2))
