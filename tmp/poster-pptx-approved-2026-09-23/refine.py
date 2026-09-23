from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json, sys, xml.etree.ElementTree as E

build = Path('tmp/poster-pptx-approved-2026-09-23')
NS = {'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
PR = 'http://schemas.openxmlformats.org/package/2006/relationships'
for k,v in NS.items(): E.register_namespace(k,v)
def sub(parent, tag, attrs=None):
    prefix,local=tag.split(':'); return E.SubElement(parent,'{'+NS[prefix]+'}'+local,attrs or {})

source=json.loads((build/'dom.json').read_text())
lookup={x['id']:x for x in source['items']}
offsets=json.loads((build/'offsets.json').read_text()) if '--calibrated' in sys.argv else {}
with ZipFile(build/'draft.pptx') as z: parts={n:z.read(n) for n in z.namelist()}
root=E.fromstring(parts['ppt/slides/slide1.xml'])
tree=root.find('p:cSld/p:spTree',NS)
rels=E.fromstring(parts['ppt/slides/_rels/slide1.xml.rels'])
links={}; nodes={}
for shape in tree.findall('p:sp',NS):
    nv=shape.find('p:nvSpPr/p:cNvPr',NS); item=lookup.get(nv.get('name'))
    if not item: continue
    nodes[item['id']]=shape
    nv.set('name',item['name']); nv.set('descr',item['id'])
    if item['kind']!='text': continue
    if item['left']+item['width']>source['width']:
        # Centred HTML paragraphs have a full-width box but inset text origins.
        # Keep the native text box around its actual text, within the slide.
        extent=shape.find('p:spPr/a:xfrm/a:ext',NS)
        width=max(line['right']-item['left'] for line in item['lines'])+3
        extent.set('cx',str(round(width*9525)))
    off=shape.find('p:spPr/a:xfrm/a:off',NS)
    delta=offsets.get(item['id'],{'dx':0,'dy':0})
    for axis,d in [('x','dx'),('y','dy')]: off.set(axis,str(round(int(off.get(axis))+delta[d]*9525)))
    old=shape.find('p:txBody',NS)
    if old is not None: shape.remove(old)
    tb=sub(shape,'p:txBody')
    body=sub(tb,'a:bodyPr',{'wrap':'none','lIns':'0','rIns':'0','tIns':'0','bIns':'0','anchor':'t','anchorCtr':'0'})
    sub(body,'a:noAutofit'); sub(tb,'a:lstStyle')
    for i,line in enumerate(item['lines']):
        para=sub(tb,'a:p'); pr=sub(para,'a:pPr',{'algn':'l','marL':'0','marR':'0','indent':'0','fontAlgn':'base'})
        height=line['y']-item['lines'][i-1]['y'] if i else item['lineHeight']
        sub(sub(pr,'a:lnSpc'),'a:spcPts',{'val':str(round(height*75))})
        for tag in ['spcBef','spcAft']: sub(sub(pr,'a:'+tag),'a:spcPts',{'val':'0'})
        for run in line['runs']:
            st=run['style']; r=sub(para,'a:r')
            rp=sub(r,'a:rPr',{'lang':'en-GB','sz':str(round(st['fontSize']*75)),'b':str(int(st['bold'])),'i':str(int(st['italic'])),'spc':str(round(st['tracking']*75)),'kern':'0','dirty':'0','u':'sng' if st['underlined'] else 'none'})
            sub(sub(rp,'a:solidFill'),'a:srgbClr',{'val':st['color'].lstrip('#')})
            for font in ['latin','ea','cs']: sub(rp,'a:'+font,{'typeface':'Noto Sans'})
            target=st.get('link')
            if target:
                if target not in links:
                    links[target]='rId'+str(1000+len(links))
                    E.SubElement(rels,'{'+PR+'}Relationship',{'Id':links[target],'Type':NS['r']+'/hyperlink','Target':target,'TargetMode':'External'})
                sub(rp,'a:hlinkClick',{'{'+NS['r']+'}id':links[target]})
            sub(r,'a:t').text=run['text']
        sub(para,'a:endParaRPr',{'lang':'en-GB','sz':str(round(line['runs'][-1]['style']['fontSize']*75))})

for pic in tree.findall('p:pic',NS):
    nv=pic.find('p:nvPicPr/p:cNvPr',NS)
    xfrm=pic.find('p:spPr/a:xfrm',NS)
    off=xfrm.find('a:off',NS)
    item=min((x for x in source['items'] if x['kind']=='image'), key=lambda x:abs(x['left']-int(off.get('x'))/9525)+abs(x['top']-int(off.get('y'))/9525))
    nodes[item['id']]=pic; nv.set('name',item['name']); nv.set('descr',item['id'])

# Keep each editable pipeline stage together when moved in PowerPoint.
next_id=1+max(int(n.get('id')) for n in root.findall('.//p:cNvPr',NS))
for spec in source['groups']:
    members=[x for x in source['items'] if x.get('group')==spec['id'] and x['id'] in nodes]
    if not members: continue
    member_nodes=[nodes[x['id']] for x in members]
    idx=min(list(tree).index(n) for n in member_nodes)
    group=E.Element('{'+NS['p']+'}grpSp'); nv=sub(group,'p:nvGrpSpPr')
    sub(nv,'p:cNvPr',{'id':str(next_id),'name':spec['name']}); next_id+=1
    sub(nv,'p:cNvGrpSpPr'); sub(nv,'p:nvPr')
    xf=sub(sub(group,'p:grpSpPr'),'a:xfrm')
    left=min(x['left'] for x in members); top=min(x['top'] for x in members)
    right=max(x['left']+x['width'] for x in members); bottom=max(x['top']+x['height'] for x in members)
    origin={'x':str(round(left*9525)),'y':str(round(top*9525))}
    extent={'cx':str(round((right-left)*9525)),'cy':str(round((bottom-top)*9525))}
    sub(xf,'a:off',origin); sub(xf,'a:ext',extent); sub(xf,'a:chOff',origin); sub(xf,'a:chExt',extent)
    for node in member_nodes: tree.remove(node); group.append(node)
    tree.insert(idx,group)

parts['ppt/slides/slide1.xml']=E.tostring(root,encoding='utf-8',xml_declaration=True)
parts['ppt/slides/_rels/slide1.xml.rels']=E.tostring(rels,encoding='utf-8',xml_declaration=True)
for name,value in list(parts.items()):
    if name.startswith('ppt/theme/') and name.endswith('.xml'):
        theme=E.fromstring(value)
        for key in ['hlink','folHlink']:
            node=theme.find('.//a:clrScheme/a:'+key,NS)
            if node is not None: node.clear(); sub(node,'a:srgbClr',{'val':'173248'})
        parts[name]=E.tostring(theme,encoding='utf-8',xml_declaration=True)
target='calibrated.pptx' if offsets else 'candidate.pptx'
with ZipFile(build/target,'w',ZIP_DEFLATED) as z:
    for n,v in parts.items(): z.writestr(n,v)
print(target, ':',len(nodes),'editable/source objects;',len(source['groups']),'groups;',len(links),'hyperlinks')
