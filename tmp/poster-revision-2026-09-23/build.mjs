import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const src=JSON.parse(await fs.readFile('tmp/poster-revision-2026-09-23/dom.json','utf8'));
const p=Presentation.create({slideSize:{width:src.width,height:src.height}}),s=p.slides.add();s.background.fill='#ffffff';
for(const item of src.items){
 const position={left:item.left,top:item.top,width:item.width,height:item.height};
 if(item.kind==='image'){
  s.images.add({blob:new Uint8Array(await fs.readFile('output/poster-narrative-3/revised-poster/'+item.src)),contentType:'image/svg+xml',position,fit:'contain',alt:item.name});continue;
 }
 if(item.kind==='path'){
  s.shapes.add({name:item.id,geometry:'custom',position,fill:'none',line:{fill:item.stroke,width:item.strokeWidth},customPaths:[{width:item.width,height:item.height,commands:item.points.map((v,i)=>i?{lineTo:v}:{moveTo:v})}]});continue;
 }
 if(item.kind==='rect'){
  s.shapes.add({name:item.id,geometry:'rect',position,fill:item.fill,line:{fill:item.stroke||'none',width:item.strokeWidth||0},...(item.radius?{borderRadius:item.radius}:{})});continue;
 }
 const sh=s.shapes.add({name:item.id,geometry:'textbox',position,fill:'none',line:{fill:'none',width:0}});
 sh.text=item.lines.map(l=>({runs:l.runs.map(r=>({run:r.text,textStyle:{fontSize:r.style.fontSize+'px',typeface:'Noto Sans',bold:r.style.bold,color:r.style.color}}))}));
 sh.text.style={typeface:'Noto Sans',fontSize:item.lines[0].runs[0].style.fontSize,color:item.lines[0].runs[0].style.color,autoFit:'none',wrap:'none',verticalAlignment:'top',insets:{left:0,right:0,top:0,bottom:0}};
}
s.speakerNotes.textFrame.setText('Revised from the joint feedback dated 2026-09-23. H1 = retrieval (former H2-H4), H2 = OCR (former H1), H3 = citations (former H6). R5 is reported separately. Source measurements and protocol: https://github.com/SteinVR/Trends-in-NLP-Poster/tree/main/output/poster-narrative-3/results . Research hypothesis IDs in the original paper differ. Figures are preserved source SVGs; the surrounding text and pipeline stages are editable. Logo: https://www.uni-trier.de/typo3conf/ext/zimktheme_unitrier/Resources/Public/Logos/Logo_Universitaet.svg . References: https://arxiv.org/abs/2005.11401 ; https://arxiv.org/abs/2408.10343 ; https://doi.org/10.18653/v1/2023.emnlp-main.398 .');
await(await PresentationFile.exportPptx(p)).save('tmp/poster-revision-2026-09-23/artifact-draft.pptx');
console.log('Artifact draft exported');
