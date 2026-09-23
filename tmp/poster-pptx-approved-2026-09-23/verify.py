from pathlib import Path
from zipfile import ZipFile
import hashlib, json, re, xml.etree.ElementTree as E
import pymupdf

build=Path('tmp/poster-pptx-approved-2026-09-23')
final=build/'validated/legal-rag-poster-updated-v3.pptx'
receipt=json.loads((build/'validation-v3.json').read_text())
assert hashlib.sha256(final.read_bytes()).hexdigest()==receipt['finalSha256']
assert receipt['packageIntegrity']['findingCount']==0
assert receipt['presentationLayout']['findingCount']==0
assert not receipt['presentationLayout']['warnings']
assert receipt['firstPartyImport']['passed']
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with ZipFile(final) as z:
    slide=E.fromstring(z.read('ppt/slides/slide1.xml'))
    dimensions=E.fromstring(z.read('ppt/presentation.xml')).find('p:sldSz',ns)
    assert dimensions.get('cx')=='21384000' and dimensions.get('cy')=='30276000'
    source=json.loads((build/'dom.json').read_text())
    expected={x['id']:x for x in source['items'] if x['kind']=='text'}
    found={}
    for shape in slide.findall('.//p:sp',ns):
        ident=shape.find('p:nvSpPr/p:cNvPr',ns).get('descr')
        if ident not in expected: continue
        actual=[''.join(t.text or '' for t in line.findall('.//a:t',ns)) for line in shape.findall('p:txBody/a:p',ns)]
        want=[''.join(run['text'] for run in line['runs']) for line in expected[ident]['lines']]
        assert actual==want,(ident,actual,want)
        found[ident]=actual
    assert set(found)==set(expected)
    assert len(slide.findall('.//p:grpSp',ns))==9
    assert len(slide.findall('.//p:pic',ns))==13
    assert min(int(r.get('sz')) for r in slide.findall('.//a:rPr',ns) if r.get('sz'))>=2400
    visible=' '.join(t.text or '' for t in slide.findall('.//a:t',ns))
    for bad in ['sequential additions','Q averages 100','Q is an aggregate score','R5 adds no score gain','R4–R6 reuse','[AUTHOR NAME]','TRENDS IN MACHINE LEARNING II']:
        assert bad not in visible,bad
    svg_files=[z.read(n) for n in z.namelist() if n.endswith('.svg')]
    chart=E.fromstring(next(b for b in svg_files if b'data-metric=' in b))
    svg_ns={'s':'http://www.w3.org/2000/svg'}
    metrics={}
    for metric in chart.findall('s:g',svg_ns):
        metrics[metric.get('data-metric')]=[float(p.get('data-value')) for p in metric.findall('s:g',svg_ns)]
    assert metrics=={'Q':[46.2,63.2,49.8,74.6,84.4,84.4,84.4],'precision':[7.6,11.2,14.7,22.2,27.1,27.1,61.8],'recall':[38.5,61.6,52.9,72.7,78.9,78.9,74.7]}

render=pymupdf.open(build/'render/legal-rag-poster-updated-v3.pdf')
assert len(render)==1
page=render[0]
page.get_pixmap().save(build/'final-review.png')
norm=lambda s:re.sub(r'\s+','',s)
rendered=norm(page.get_text())
for item in expected.values():
    for line in item['lines']:
        s=norm(''.join(r['text'] for r in line['runs']))
        assert s in rendered,('Missing from render',s)
for metric in metrics.values():
    for value in metric: assert str(value) in rendered
for filename,sha in json.loads((build/'source-hashes.json').read_text()).items():
    assert hashlib.sha256(Path(filename).read_bytes()).hexdigest()==sha,('Protected source changed',filename)
report={'editableTextBoxes':len(found),'groups':9,'vectorImages':13,'matchedTextLines':sum(len(v) for v in found.values()),'bodyMinimumPt':24,'chartDataMatched':True,'sourceAndOtherExportsUnchanged':True,'finalSha256':receipt['finalSha256'],'renderedWith':'LibreOffice','nativeMicrosoftPowerPointChecked':False}
(build/'self-review.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
