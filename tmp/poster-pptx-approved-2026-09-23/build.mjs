import fs from 'node:fs/promises';
import { Presentation, PresentationFile } from '@oai/artifact-tool';
const build='tmp/poster-pptx-approved-2026-09-23';
const source=JSON.parse(await fs.readFile(build+'/dom.json','utf8'));
const presentation=Presentation.create({slideSize:{width:source.width,height:source.height}});
const slide=presentation.slides.add(); slide.background.fill='#ffffff';
for (const item of source.items) {
  const position={left:item.left,top:item.top,width:item.width,height:item.height};
  if (item.kind==='image') {
    let svg=item.svg || await fs.readFile('output/poster-narrative-3/revised-poster/'+item.src,'utf8');
    if (item.src?.endsWith('readable.svg')) {
      svg=svg.replaceAll("font-family:Noto,'Noto Sans',sans-serif", "font-family:'Noto Sans'");
      // Office/LibreOffice do not consistently implement SVG paint-order.
      // Draw the existing white text halo first, then the unchanged dark label.
      if (item.src.endsWith('sequence-readable.svg')) svg=svg.replace(/<text([^>]*class="value"[^>]*)>([^<]*)<\/text>/g,
        '<text$1 style="fill:#fff;stroke:#fff;stroke-width:8px">$2</text><text$1 style="stroke:none">$2</text>');
    }
    const bytes=Buffer.from(svg);
    slide.images.add({name:item.id,blob:new Uint8Array(bytes),contentType:'image/svg+xml',position,fit:'contain',alt:item.name});
  } else if (item.kind==='path') {
    slide.shapes.add({name:item.id,geometry:'custom',position,fill:item.fill,line:{fill:'none',width:0},customPaths:[{width:item.width,height:item.height,commands:[...item.points.map((p,i)=>i?{lineTo:p}:{moveTo:p}),{close:{}}]}]});
  } else if (item.kind==='rect') {
    slide.shapes.add({name:item.id,geometry:'rect',position,fill:item.fill,line:{fill:item.stroke||'none',width:item.strokeWidth||0},...(item.radius?{borderRadius:item.radius}:{})});
  } else {
    const shape=slide.shapes.add({name:item.id,geometry:'textbox',position,fill:'none',line:{fill:'none',width:0}});
    shape.text=item.lines.map(l=>({runs:l.runs.map(r=>({run:r.text,textStyle:{fontSize:r.style.fontSize+'px',typeface:'Noto Sans',bold:r.style.bold,italic:r.style.italic,color:r.style.color}}))}));
    shape.text.style={typeface:'Noto Sans',fontSize:item.lines[0].runs[0].style.fontSize,color:item.lines[0].runs[0].style.color,autoFit:'none',wrap:'none',verticalAlignment:'top',insets:{left:0,right:0,top:0,bottom:0}};
  }
}
slide.speakerNotes.textFrame.setText('Code, experimental protocol and measurements: https://github.com/SteinVR/Trends-in-NLP-Poster/tree/main/output/poster-narrative-3/results\nReferences: https://arxiv.org/abs/2005.11401 ; https://arxiv.org/abs/2408.10343 ; https://doi.org/10.18653/v1/2023.emnlp-main.398\nUniversity logo: https://www.uni-trier.de/typo3conf/ext/zimktheme_unitrier/Resources/Public/Logos/Logo_Universitaet.svg');
await (await PresentationFile.exportPptx(presentation)).save(build+'/draft.pptx');
console.log('Exported editable A1 draft');
