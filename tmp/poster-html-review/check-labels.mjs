import {chromium} from 'playwright';
const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const page=await b.newPage();
for(const file of ['sequence-readable.svg','ocr-readable.svg']){
 await page.goto('file:///home/xeliaray/Projects/Trends-In-ML-2/output/poster-narrative-3/revised-poster/assets/'+file);await page.evaluate(()=>document.fonts.ready);
 const result=await page.evaluate(()=>{
  const texts=[...document.querySelectorAll('text')];const overlaps=[];
  for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
   const a=texts[i].getBBox(),z=texts[j].getBBox();if(a.x<z.x+z.width&&a.x+a.width>z.x&&a.y<z.y+z.height&&a.y+a.height>z.y)overlaps.push([texts[i].textContent,texts[j].textContent]);
  }
  const crosses=(a,b,r)=>{
   let enter=0,leave=1,dx=b.x-a.x,dy=b.y-a.y;
   for(const [p,q] of [[-dx,a.x-r.x],[dx,r.x+r.width-a.x],[-dy,a.y-r.y],[dy,r.y+r.height-a.y]]){
    if(p===0){if(q<0)return false;continue;}const t=q/p;if(p<0)enter=Math.max(enter,t);else leave=Math.min(leave,t);if(enter>leave)return false;
   }return true;
  };
  const labelLineCollisions=[];
  for(const label of document.querySelectorAll('.point-label text')){
   const rect=label.getBBox(),line=label.closest('[data-metric]').querySelector('polyline'),points=[...line.points];
   for(let i=1;i<points.length;i++)if(crosses(points[i-1],points[i],rect))labelLineCollisions.push(label.textContent);
  }
  const box=document.documentElement.viewBox.baseVal;
  const clippedText=texts.filter(e=>{const r=e.getBBox();return r.x<-.5||r.x+r.width>box.width+.5||r.y<-.5||r.y+r.height>box.height+.5}).map(e=>e.textContent);
  return {overlaps,labelLineCollisions,clippedText};
 });console.log(file,JSON.stringify(result));
}
await b.close();
