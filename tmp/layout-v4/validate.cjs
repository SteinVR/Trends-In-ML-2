const {chromium}=require('playwright'),fs=require('fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage({viewport:{width:3180,height:2246}});await p.goto('file://'+process.cwd()+'/output/poster-narrative-3/layout-v4/index.html');await p.evaluate(()=>document.fonts.ready);await p.emulateMedia({media:'print'});
const result=await p.evaluate(()=>{
 const poster=document.querySelector('.poster').getBoundingClientRect();
 const overflow=[...document.querySelectorAll('.poster *')].filter(e=>!e.closest('.icon-defs')).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>poster.right+.5||r.bottom>poster.bottom+.5||r.left<-.5||r.top<-.5)}).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,80)}));
 const badFonts=[...document.querySelectorAll('p')].filter(e=>parseFloat(getComputedStyle(e).fontSize)<32).map(e=>e.textContent);
 const texts=[...document.querySelectorAll('.chart text')].map(e=>{let r=e.getBoundingClientRect();return {text:e.textContent,x:r.x,y:r.y,r:r.right,b:r.bottom}});
 const overlaps=[];for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){let a=texts[i],b=texts[j];if(a.x<b.r&&b.x<a.r&&a.y<b.b&&b.y<a.b)overlaps.push([a.text,b.text]);}
 const rangeOverflow=[];for(const el of document.querySelectorAll('p,h1,h2,h3,li,.tech,.phase')){let r=document.createRange();r.selectNodeContents(el);let b=el.getBoundingClientRect();if(getComputedStyle(el).display==='inline')continue;for(const t of r.getClientRects())if(t.right>b.right+1||t.left<b.left-1)rangeOverflow.push(el.textContent.slice(0,100));}
 return {overflow,badFonts,chartOverlaps:overlaps,rangeOverflow,body:document.querySelector('.poster').innerText};
});fs.writeFileSync('tmp/layout-v4/validation.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,body:undefined},null,2));await p.locator('#s8').screenshot({path:'tmp/layout-v4/chart-detail.png'});await b.close()})();
