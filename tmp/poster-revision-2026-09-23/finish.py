from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json, xml.etree.ElementTree as E
NS={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
for k,v in NS.items(): E.register_namespace(k,v)
PR='http://schemas.openxmlformats.org/package/2006/relationships'
def sub(parent, tag, attrs=None):
 prefix,local=tag.split(':');return E.SubElement(parent,'{'+NS[prefix]+'}'+local,attrs or {})
build=Path('tmp/poster-revision-2026-09-23')
items=json.loads((build/'dom.json').read_text())['items'];lookup={v['id']:v for v in items}
offsets=json.loads((build/'offsets.json').read_text())
with ZipFile(build/'candidate.pptx') as z:parts={n:z.read(n) for n in z.namelist()}
root=E.fromstring(parts['ppt/slides/slide1.xml']);rels=E.fromstring(parts['ppt/slides/_rels/slide1.xml.rels']);links={}
for shape in root.findall('.//p:sp',NS):
 nv=shape.find('p:nvSpPr/p:cNvPr',NS);item=lookup.get(nv.get('descr'))
 if not item or item['kind']!='text':continue
 off=shape.find('p:spPr/a:xfrm/a:off',NS);delta=offsets[item['id']]
 for axis,d in [('x','dx'),('y','dy')]:off.set(axis,str(round(int(off.get(axis))+delta[d]*9525)))
 for para,line in zip(shape.findall('p:txBody/a:p',NS),item['lines']):
  for run,spec in zip(para.findall('a:r',NS),line['runs']):
   target=spec['style'].get('link')
   if target:
    if target not in links:
     links[target]='rId'+str(1000+len(links))
     E.SubElement(rels,'{'+PR+'}Relationship',{'Id':links[target],'Type':NS['r']+'/hyperlink','Target':target,'TargetMode':'External'})
    sub(run.find('a:rPr',NS),'a:hlinkClick',{'{'+NS['r']+'}id':links[target]})
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
with ZipFile(build/'refined.pptx','w',ZIP_DEFLATED) as z:
 for n,v in parts.items():z.writestr(n,v)
print('Applied calibrated positions to',len(offsets),'text boxes; active links:',len(links))
