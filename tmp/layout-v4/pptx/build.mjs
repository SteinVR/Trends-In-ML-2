import fs from 'node:fs/promises';import{Presentation,PresentationFile}from'@oai/artifact-tool';
const dir='tmp/layout-v4/pptx',src=JSON.parse(await fs.readFile(dir+'/dom.json','utf8'));
const p=Presentation.create({slideSize:{width:src.width,height:src.height}});const slide=p.slides.add();slide.background.fill='#ffffff';
for(const i of src.items){const position={left:i.left,top:i.top,width:i.width,height:i.height};
 if(i.kind==='image'){const svg=i.svg||await fs.readFile('output/poster-narrative-3/layout-v4/'+i.src,'utf8');slide.images.add({name:i.id,blob:new Uint8Array(Buffer.from(svg)),contentType:'image/svg+xml',position,fit:'contain',alt:i.name});}
 else if(i.kind==='path')slide.shapes.add({name:i.id,geometry:'custom',position,fill:i.fill,line:{fill:i.stroke||'none',width:i.strokeWidth||0},customPaths:[{width:i.width,height:i.height,commands:[...i.points.map((pt,j)=>j?{lineTo:pt}:{moveTo:pt}),...(i.close?[{close:{}}]:[])]}]});
 else if(i.kind==='rect'||i.kind==='ellipse')slide.shapes.add({name:i.id,geometry:i.kind==='ellipse'?'ellipse':'rect',position,fill:i.fill,line:{fill:i.stroke||'none',width:i.strokeWidth||0},...(i.radii?.some(x=>x)?{borderRadius:Math.max(...i.radii)}:{})});
 else{const sh=slide.shapes.add({name:i.id,geometry:'textbox',position,fill:'none',line:{fill:'none',width:0}});sh.text=i.text;sh.text.style={typeface:i.style.family,fontSize:i.style.fontSize,bold:i.style.bold,italic:i.style.italic,color:i.style.color,autoFit:'none',wrap:'none',verticalAlignment:'top',insets:{left:0,right:0,top:0,bottom:0}};}
}
slide.speakerNotes.textFrame.setText('Faithful editable reconstruction of the approved layout-v4 poster. Source: ../index.html and ../poster.pdf. Text, cards, plot series and data labels are native editable objects; charts use grouped vector elements to preserve the approved layout rather than Excel chart objects. Icons and university logo are vector SVG graphics. Measurements: ../../results/metrics.csv. Scientific text: external/Final layout and text.pdf. Code and reproducibility: https://github.com/SteinVR/Trends-in-NLP-Poster');
await(await PresentationFile.exportPptx(p)).save(dir+'/draft.pptx');console.log('Draft exported');
