import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const root='/home/xeliaray/Projects/Trends-In-ML-2';
const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await b.newPage({viewport:{width:2246,height:3179},deviceScaleFactor:1});
await page.goto('file://'+root+'/output/poster-narrative-3/revised-poster/index.html');await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({media:'print'});
const check=await page.evaluate(()=>{
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom}};
 const poster=document.querySelector('.poster'),pr=poster.getBoundingClientRect(),footer=document.querySelector('footer').getBoundingClientRect();
 return {poster:rect(poster),footerBottom:footer.bottom,contentLimit:pr.bottom-parseFloat(getComputedStyle(poster).paddingBottom),overflow:footer.bottom>pr.bottom-parseFloat(getComputedStyle(poster).paddingBottom),sections:[...document.querySelectorAll('header,section,.baseline-flow,.pipeline-groups,.controls,.evaluation,.chart,.detail-grid,footer')].map(e=>({tag:e.tagName,class:e.className,...rect(e)})),fonts:[...new Set([...document.querySelectorAll('.poster p')].map(e=>getComputedStyle(e).fontSize))],horizontalTextOverflow:[...document.querySelectorAll('.poster p,.poster h3,.poster h1')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.innerText),missing:[...document.images].filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src)};
});
await page.screenshot({path:root+'/tmp/poster-html-review/full.png',fullPage:true});
for(const [selector,name] of [['section[aria-labelledby="method-title"]','method'],['section[aria-labelledby="results-title"]','results']])await page.locator(selector).screenshot({path:root+'/tmp/poster-html-review/'+name+'.png'});
await page.goto('file://'+root+'/output/poster-narrative-3/revised-poster/assets/sequence-readable.svg');await page.evaluate(()=>document.fonts.ready);
check.chartTextOverlaps=await page.evaluate(()=>{
 const labels=[...document.querySelectorAll('text')].map(e=>({text:e.textContent,cls:e.getAttribute('class'),r:e.getBoundingClientRect()}));
 const overlaps=[];
 for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
  const a=labels[i],b=labels[j];if(a.r.left<b.r.right&&a.r.right>b.r.left&&a.r.top<b.r.bottom&&a.r.bottom>b.r.top)overlaps.push([a.text,b.text]);
 }return overlaps;
});
await fs.writeFile(root+'/tmp/poster-html-review/layout.json',JSON.stringify(check,null,2));console.log(JSON.stringify(check,null,2));await b.close();
