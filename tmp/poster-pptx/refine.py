from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import json,xml.etree.ElementTree as E
NS={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
for k,v in NS.items():E.register_namespace(k,v)
def el(tag,attrs=None):return E.Element('{'+NS[tag.split(':')[0]]+'}'+tag.split(':')[1],attrs or {})
def sub(parent,tag,attrs=None):q=el(tag,attrs);parent.append(q);return q
src=json.loads(Path('tmp/poster-pptx/dom.json').read_text());items={x['id']:x for x in src['items']}
with ZipFile('tmp/poster-pptx/artifact-draft.pptx') as z:parts={n:z.read(n) for n in z.namelist()}
root=E.fromstring(parts['ppt/slides/slide1.xml']);text_n=0
for shape in root.findall('.//p:sp',NS):
 nv=shape.find('p:nvSpPr/p:cNvPr',NS);ident=nv.get('name');item=items.get(ident)
 if not item:continue
 nv.set('name',item['name']);nv.set('descr',ident)
 if item['kind']!='text':continue
 text_n+=1
 old=shape.find('p:txBody',NS)
 if old is not None:shape.remove(old)
 tb=sub(shape,'p:txBody');body=sub(tb,'a:bodyPr',{'wrap':'none','lIns':'0','rIns':'0','tIns':'0','bIns':'0','anchor':'t','anchorCtr':'0'})
 sub(body,'a:noAutofit');sub(tb,'a:lstStyle')
 for line in item['lines']:
  p=sub(tb,'a:p');pr=sub(p,'a:pPr',{'algn':'l','marL':'0','marR':'0','indent':'0','fontAlgn':'base'})
  lsp=sub(pr,'a:lnSpc');sub(lsp,'a:spcPts',{'val':str(round(item['lineHeight']*75))})
  for tag in ['spcBef','spcAft']:sub(sub(pr,'a:'+tag),'a:spcPts',{'val':'0'})
  for run in line['runs']:
   st=run['style'];r=sub(p,'a:r');rp=sub(r,'a:rPr',{'lang':'en-GB','sz':str(round(st['fontSize']*75)),'b':'1' if st['bold'] else '0','spc':str(round(st['tracking']*75)),'kern':'0','dirty':'0',**({'u':'sng'} if st['underlined'] else {})})
   sub(sub(rp,'a:solidFill'),'a:srgbClr',{'val':st['color'].lstrip('#')})
   for font in ['latin','ea','cs']:sub(rp,'a:'+font,{'typeface':'Noto Sans'})
   t=sub(r,'a:t');t.text=run['text']
  sub(p,'a:endParaRPr',{'lang':'en-GB','sz':str(round(line['runs'][-1]['style']['fontSize']*75))})
parts['ppt/slides/slide1.xml']=E.tostring(root,encoding='utf-8',xml_declaration=True)
with ZipFile('tmp/poster-pptx/candidate.pptx','w',ZIP_DEFLATED) as z:
 for n,v in parts.items():z.writestr(n,v)
print('Native text boxes:',text_n)
