import json,pymupdf
from pathlib import Path
p=Path('tmp/layout-v4/pptx');data=json.loads((p/'geometry.json').read_text());page=pymupdf.open(p/'reference.pdf')[0]
fonts=set();n=0
for b in page.get_text('rawdict')['blocks']:
 for l in b.get('lines',[]):
  for s in l['spans']:
   s['text']=''.join(c['c'] for c in s['chars'])
   if not s['text'].strip() or s['font'].startswith('Type3'):continue
   x0,y0,x1,y1=[v/0.75 for v in s['bbox']];font=s['font'];fonts.add(font)
   family='Noto Sans' if 'Noto' in font else 'Barlow Condensed' if 'Barlow' in font else 'Liberation Sans'
   bold='Bold' in font;italic=bool(s['flags']&2);size=s['size']/0.75
   center=((x0+x1)/2,(y0+y1)/2)
   italic=italic or any(g['left']-2<=center[0]<=g['left']+g['width']+2 and g['top']-2<=center[1]<=g['top']+g['height']+2 for g in data.get('italicRegions',[]))
   candidates=[g for g in data['groups'] if g['left']-1<=center[0]<=g['left']+g['width']+1 and g['top']-2<=center[1]<=g['top']+g['height']+2]
   group=min(candidates,key=lambda g:g['width']*g['height'])['id'] if candidates else None
   data['items'].append({'id':f't{n}','kind':'text','left':x0,'top':y0,'width':x1-x0+6,'height':y1-y0+4,'originX':next(c['origin'][0] for c in s['chars'] if not c['c'].isspace())/0.75,'baseline':s['origin'][1]/0.75,'group':group,'text':s['text'],'name':s['text'][:70],'style':{'fontSize':size,'family':family,'bold':bold,'italic':italic,'color':f'#{s["color"]:06x}','tracking':-1.3 if family=='Noto Sans' else 0}});n+=1
(p/'dom.json').write_text(json.dumps(data,indent=2));print('Native text runs:',n,'Fonts:',fonts)
