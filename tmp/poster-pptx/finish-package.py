from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import json,xml.etree.ElementTree as E
NS={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
for k,v in NS.items():E.register_namespace(k,v)
PR='http://schemas.openxmlformats.org/package/2006/relationships'
def el(tag,attrs=None):return E.Element('{'+NS[tag.split(':')[0]]+'}'+tag.split(':')[1],attrs or {})
def sub(parent,tag,attrs=None):q=el(tag,attrs);parent.append(q);return q
items=json.loads(Path('tmp/poster-pptx/dom.json').read_text())['items'];lookup={v['id']:v for v in items}
offsets=json.loads(Path('tmp/poster-pptx/offsets.json').read_text())
with ZipFile('tmp/poster-pptx/candidate.pptx') as z:parts={n:z.read(n) for n in z.namelist()}
root=E.fromstring(parts['ppt/slides/slide1.xml']);tree=root.find('p:cSld/p:spTree',NS)
rels=E.fromstring(parts['ppt/slides/_rels/slide1.xml.rels']);nextrel=1000
linkids={};shapes={}
for shape in tree.findall('p:sp',NS):
 nv=shape.find('p:nvSpPr/p:cNvPr',NS);item=lookup.get(nv.get('descr'))
 if not item:continue
 shapes[item['id']]=shape
 if item['kind']=='text':
  shape.find('p:txBody/a:bodyPr',NS).set('wrap','none' if item['name'].startswith('Diagram: ') else 'square')
  delta=offsets.get(item['id'],2.5)
  off=shape.find('p:spPr/a:xfrm/a:off',NS);off.set('y',str(round(int(off.get('y'))+delta*9525)))
  # Reattach author-supplied hyperlinks after exact text formatting.
  for pp,ll in zip(shape.findall('p:txBody/a:p',NS),item['lines']):
   for rr,run in zip(pp.findall('a:r',NS),ll['runs']):
    target=run['style'].get('link')
    if not target:continue
    if target not in linkids:
     linkids[target]=f'rId{nextrel}';nextrel+=1
     E.SubElement(rels,'{'+PR+'}Relationship',{'Id':linkids[target],'Type':NS['r']+'/hyperlink','Target':target,'TargetMode':'External'})
    rr.find('a:rPr',NS).set('u','sng' if run['style']['underlined'] else 'none')
    # Preserve exact reference appearance; URLs remain visible and are cited in notes.
# Group diagram nodes and their native text labels, plus the two coloured panels.
used=set();nextid=1+max(int(e.get('id')) for e in root.findall('.//p:cNvPr',NS))
groupcount=0
for bg in items:
 if bg['kind']!='rect' or bg['name'] not in ['Pipeline node','Panel hypothesis','Panel baseline','Panel conclusion']:continue
 members=[bg]
 for it in items:
  if it['id'] in used or it['kind']!='text':continue
  if it['left']>=bg['left']-4 and it['left']+it['width']<=bg['left']+bg['width']+7 and it['top']>=bg['top']-5 and it['top']+it['height']<=bg['top']+bg['height']+15:members.append(it)
 if len(members)<2:continue
 nodes=[shapes[m['id']] for m in members]
 # Include coloured left border for the hypothesis panel.
 if bg['name']=='Panel hypothesis':
  for it in items:
   if it['kind']=='rect' and it['name']=='Rule hypothesis' and it['id'] not in used:members.append(it);nodes.append(shapes[it['id']])
 idx=min(list(tree).index(n) for n in nodes)
 grp=el('p:grpSp');nv=sub(grp,'p:nvGrpSpPr')
 title=next((m['name'].removeprefix('Diagram: ') for m in members if m['kind']=='text'),bg['name'])
 sub(nv,'p:cNvPr',{'id':str(nextid),'name':title});nextid+=1;sub(nv,'p:cNvGrpSpPr');sub(nv,'p:nvPr')
 gp=sub(grp,'p:grpSpPr');xf=sub(gp,'a:xfrm')
 x,y,w,h=(round(bg[k]*9525) for k in ['left','top','width','height'])
 sub(xf,'a:off',{'x':str(x),'y':str(y)});sub(xf,'a:ext',{'cx':str(w),'cy':str(h)})
 sub(xf,'a:chOff',{'x':str(x),'y':str(y)});sub(xf,'a:chExt',{'cx':str(w),'cy':str(h)})
 for it,n in zip(members,nodes):tree.remove(n);grp.append(n);used.add(it['id'])
 tree.insert(idx,grp);groupcount+=1
parts['ppt/slides/slide1.xml']=E.tostring(root,encoding='utf-8',xml_declaration=True)
parts['ppt/slides/_rels/slide1.xml.rels']=E.tostring(rels,encoding='utf-8',xml_declaration=True)
for n,v in list(parts.items()):
 if n.startswith('ppt/theme/') and n.endswith('.xml'):
  theme=E.fromstring(v)
  for key in ['hlink','folHlink']:
   node=theme.find('.//a:clrScheme/a:'+key,NS)
   if node is not None:
    node.clear();sub(node,'a:srgbClr',{'val':'173248'})
  parts[n]=E.tostring(theme,encoding='utf-8',xml_declaration=True)
with ZipFile('tmp/poster-pptx/refined.pptx','w',ZIP_DEFLATED) as z:
 for n,v in parts.items():z.writestr(n,v)
print('Groups:',groupcount,'Hyperlinks:',len(linkids))
