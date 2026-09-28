from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json,sys,xml.etree.ElementTree as E
P=Path('tmp/layout-v4/pptx');src=json.loads((P/'dom.json').read_text());lookup={i['id']:i for i in src['items']}
NS={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
for k,v in NS.items():E.register_namespace(k,v)
def sub(e,t,attrs={}):k,t=t.split(':');return E.SubElement(e,'{'+NS[k]+'}'+t,attrs)
def local(e,t):return e.find(t,NS)
with ZipFile(P/'draft.pptx') as z:parts={n:z.read(n) for n in z.namelist()}
root=E.fromstring(parts['ppt/slides/slide1.xml']);tree=local(root,'p:cSld/p:spTree');nodes={}; offsets=json.loads((P/'offsets.json').read_text()) if '--calibrated' in sys.argv else {}
for node in list(tree):
 nv=node.find('.//p:cNvPr',NS)
 if nv is None:continue
 i=lookup.get(nv.get('name'))
 if not i and node.tag.endswith('pic'):
  x=node.find('.//a:xfrm/a:off',NS)
  if x is not None:i=min((v for v in src['items'] if v['kind']=='image'),key=lambda v:abs(v['left']-int(x.get('x'))/9525)+abs(v['top']-int(x.get('y'))/9525))
 if not i:continue
 nodes[i['id']]=node;nv.set('name',i['name']);nv.set('descr',i['id'])
 if i['kind']=='text':
  off=node.find('p:spPr/a:xfrm/a:off',NS);delta=offsets.get(i['id'],{'dx':0,'dy':0})
  for a,d in [('x','dx'),('y','dy')]:off.set(a,str(round(int(off.get(a))+delta[d]*9525)))
  old=local(node,'p:txBody')
  if old is not None:node.remove(old)
  tb=sub(node,'p:txBody');pr=sub(tb,'a:bodyPr',{'wrap':'none','lIns':'0','rIns':'0','tIns':'0','bIns':'0','anchor':'t','anchorCtr':'0'});sub(pr,'a:noAutofit');sub(tb,'a:lstStyle')
  para=sub(tb,'a:p');pp=sub(para,'a:pPr',{'algn':'l','marL':'0','marR':'0','indent':'0','fontAlgn':'base'})
  for t in ['spcBef','spcAft']:sub(sub(pp,'a:'+t),'a:spcPts',{'val':'0'})
  st=i['style'];r=sub(para,'a:r');rp=sub(r,'a:rPr',{'lang':'en-GB','sz':str(round(st['fontSize']*75)),'b':str(int(st['bold'])),'i':str(int(st['italic'])),'spc':str(round(st['tracking']*75)),'kern':'0','dirty':'0'})
  sub(sub(rp,'a:solidFill'),'a:srgbClr',{'val':st['color'][1:]})
  for k in ['latin','ea','cs']:sub(rp,'a:'+k,{'typeface':st['family']})
  sub(r,'a:t').text=i['text'];sub(para,'a:endParaRPr',{'lang':'en-GB','sz':str(round(st['fontSize']*75))})
 elif i['kind']=='rect' and any(i.get('radii',[])):
  # Preserve each CSS corner separately with exact native cubic curves.
  sp=local(node,'p:spPr')
  for old in list(sp):
   if old.tag.endswith('prstGeom') or old.tag.endswith('custGeom'):sp.remove(old)
  geom=sub(sp,'a:custGeom')
  for t in ['avLst','gdLst','ahLst','cxnLst']:sub(geom,'a:'+t)
  sub(geom,'a:rect',{'l':'0','t':'0','r':'r','b':'b'});paths=sub(geom,'a:pathLst')
  w,h=i['width'],i['height'];tl,tr,br,bl=i['radii'];scale=1000
  path=sub(paths,'a:path',{'w':str(round(w*scale)),'h':str(round(h*scale))})
  def cmd(kind,*pts):
   e=sub(path,'a:'+kind)
   for x,y in pts:sub(e,'a:pt',{'x':str(round(x*scale)),'y':str(round(y*scale))})
  k=.5522847498
  cmd('moveTo',(tl,0));cmd('lnTo',(w-tr,0));cmd('cubicBezTo',(w-tr+k*tr,0),(w,tr-k*tr),(w,tr));cmd('lnTo',(w,h-br));cmd('cubicBezTo',(w,h-br+k*br),(w-br+k*br,h),(w-br,h));cmd('lnTo',(bl,h));cmd('cubicBezTo',(bl-k*bl,h),(0,h-bl+k*bl),(0,h-bl));cmd('lnTo',(0,tl));cmd('cubicBezTo',(0,tl-k*tl),(tl-k*tl,0),(tl,0));sub(path,'a:close')
  # Geometry must precede fill/line in spPr schema order.
  sp.remove(geom);sp.insert(1,geom)
# Compose group hierarchy without flattening editable shapes.
nextid=max(int(x.get('id')) for x in root.findall('.//p:cNvPr',NS))+1
for g in reversed(src['groups']):
 members=[nodes[i['id']] for i in src['items'] if i.get('group')==g['id'] and i['id'] in nodes]
 members += [nodes[x['id']] for x in src['groups'] if x.get('parent')==g['id'] and x['id'] in nodes]
 if not members:continue
 order=list(tree);members.sort(key=lambda n:order.index(n));idx=order.index(members[0])
 grp=E.Element('{'+NS['p']+'}grpSp');nv=sub(grp,'p:nvGrpSpPr');sub(nv,'p:cNvPr',{'id':str(nextid),'name':g['name']});nextid+=1;sub(nv,'p:cNvGrpSpPr');sub(nv,'p:nvPr');xf=sub(sub(grp,'p:grpSpPr'),'a:xfrm')
 off={'x':str(round(g['left']*9525)),'y':str(round(g['top']*9525))};ext={'cx':str(round(g['width']*9525)),'cy':str(round(g['height']*9525))}
 for t,a in [('off',off),('ext',ext),('chOff',off),('chExt',ext)]:sub(xf,'a:'+t,a)
 for n in members:tree.remove(n);grp.append(n)
 tree.insert(idx,grp);nodes[g['id']]=grp
parts['ppt/slides/slide1.xml']=E.tostring(root,encoding='utf-8',xml_declaration=True)
with ZipFile(P/('calibrated.pptx' if offsets else 'candidate.pptx'),'w',ZIP_DEFLATED) as z:
 for n,v in parts.items():z.writestr(n,v)
print('Refined editable objects:',len(nodes),'calibrated:',bool(offsets))
