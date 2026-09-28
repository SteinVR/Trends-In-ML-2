import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const root=process.cwd(),out=root+'/tmp/layout-v4/pptx',source=root+'/output/poster-narrative-3/layout-v4';
const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await b.newPage({viewport:{width:3180,height:2246}});await page.goto('file://'+source+'/index.html');await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({media:'print'});
await page.pdf({path:out+'/reference.pdf',preferCSSPageSize:true,printBackground:true});
const result=await page.evaluate(()=>{
 const items=[],groups=[];let id=0;
 const box=e=>{const r=e.getBoundingClientRect();return{left:r.x,top:r.y,width:r.width,height:r.height}};
 const hex=c=>{const a=c.match(/[\d.]+/g);return !a||a[3]==='0'?'none':'#'+a.slice(0,3).map(v=>Math.round(+v).toString(16).padStart(2,'0')).join('')};
 for(const e of document.querySelectorAll('section,.stage,.baseline,.ocr-bars')){e.dataset.grp='g'+groups.length;groups.push({id:e.dataset.grp,parent:e.parentElement.closest('[data-grp]')?.dataset.grp||null,name:e.querySelector('h2,h3')?.innerText||e.className,...box(e)});}
 const grp=e=>e.closest('[data-grp]')?.dataset.grp||null;
 const push=(e,item)=>items.push({id:'s'+id++,group:grp(e),...item});
 for(const e of document.querySelectorAll('.poster *')){
  if(e.namespaceURI.includes('svg'))continue;
  const c=getComputedStyle(e),r=box(e);if(!r.width||!r.height)continue;
  let fill=hex(c.backgroundColor);
  if(c.backgroundImage.startsWith('linear-gradient')){let colors=c.backgroundImage.match(/rgb\([^)]*\)/g);fill={type:'gradient',gradientKind:'linear',angleDeg:0,stops:colors.map((v,i)=>({offset:i*100000/(colors.length-1),color:hex(v)}))};}
  const edges=['Top','Right','Bottom','Left'],ws=edges.map(k=>parseFloat(c['border'+k+'Width'])),cs=edges.map(k=>hex(c['border'+k+'Color']));
  const uniform=ws[0]>0&&ws.every(w=>w===ws[0])&&cs.every(v=>v===cs[0]);
  if(fill!=='none'||uniform)push(e,{kind:'rect',...r,fill,stroke:uniform?cs[0]:'none',strokeWidth:uniform?ws[0]:0,radii:['TopLeft','TopRight','BottomRight','BottomLeft'].map(k=>parseFloat(c['border'+k+'Radius'])||0),name:'Panel '+(e.id||e.className||e.tagName)});
  if(!uniform)for(const edge of edges){const w=parseFloat(c['border'+edge+'Width']);if(!w||c['border'+edge+'Style']==='none')continue;const pos={...r};if(edge==='Top'||edge==='Bottom'){pos.height=w;if(edge==='Bottom')pos.top+=r.height-w}else{pos.width=w;if(edge==='Right')pos.left+=r.width-w}push(e,{kind:'rect',...pos,fill:hex(c['border'+edge+'Color']),stroke:'none',name:'Rule'});}
 }
 // Resolve the actual grid placement of the generated stage arrows.
 const sheet=document.createElement('style');sheet.textContent='.extract-pseudo::after{display:none!important}';document.head.append(sheet);
 for(const e of document.querySelectorAll('.stage:not(:last-child)')){
  const c=getComputedStyle(e,'::after'),css=[...c].map(k=>[k,c.getPropertyValue(k)]),color=hex(c.backgroundColor);
  e.classList.add('extract-pseudo');const ghost=document.createElement('span');for(const[k,v]of css)ghost.style.setProperty(k,v);e.appendChild(ghost);const r=box(ghost);
  push(e,{kind:'path',...r,fill:color,stroke:'none',name:'Stage connector',points:[[0,.3],[.55,.3],[.55,0],[1,.5],[.55,1],[.55,.7],[0,.7]].map(([x,y])=>({x:x*r.width,y:y*r.height})),close:true});
  ghost.remove();e.classList.remove('extract-pseudo');
 }
 sheet.remove();
 for(const e of document.querySelectorAll('.chart path,.chart polyline,.chart circle')){
  const m=e.getScreenCTM(),pt=(x,y)=>({x:m.a*x+m.c*y+m.e,y:m.b*x+m.d*y+m.f}),c=getComputedStyle(e);
  if(e.tagName==='circle'){
   const p=pt(+e.getAttribute('cx'),+e.getAttribute('cy')),r=+e.getAttribute('r')*m.a;
   push(e,{kind:'ellipse',left:p.x-r,top:p.y-r,width:2*r,height:2*r,fill:hex(c.fill),stroke:'none',name:'Measured point'});
  }else{
   let pts;if(e.tagName==='polyline')pts=e.getAttribute('points').trim().split(/\s+/).map(v=>pt(...v.split(',').map(Number)));else{const q=e.getAttribute('d').match(/M([\d.]+) ([\d.]+)H([\d.]+)/);pts=[pt(+q[1],+q[2]),pt(+q[3],+q[2])];}
   const left=Math.min(...pts.map(v=>v.x)),top=Math.min(...pts.map(v=>v.y)),width=Math.max(...pts.map(v=>v.x))-left,height=Math.max(...pts.map(v=>v.y))-top;
   push(e,{kind:'path',left,top,width:Math.max(width,.01),height:Math.max(height,.01),fill:'none',stroke:hex(c.stroke),strokeWidth:parseFloat(c.strokeWidth)*m.a,points:pts.map(p=>({x:p.x-left,y:p.y-top})),name:e.tagName==='polyline'?'Measured series':'Chart grid'});
  }
 }
 for(const e of document.querySelectorAll('.chart .val')){
  const r=box(e),c=getComputedStyle(e),m=e.getScreenCTM();
  push(e,{kind:'text',...r,width:r.width+6,height:r.height+4,text:e.textContent,baseline:m.d*+e.getAttribute('y')+m.f,name:e.textContent,style:{fontSize:parseFloat(c.fontSize)*m.a,family:'Barlow Condensed',bold:true,italic:false,color:hex(c.fill),tracking:0}});
 }
 for(const e of document.querySelectorAll('.poster svg.icon')){
  const c=getComputedStyle(e),sym=document.querySelector(e.querySelector('use').getAttribute('href')),r=box(e);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${r.width}" height="${r.height}" viewBox="${sym.getAttribute('viewBox')}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}" stroke-linecap="${c.strokeLinecap}" stroke-linejoin="${c.strokeLinejoin}">${sym.innerHTML}</svg>`.replaceAll('currentColor',c.color);
  push(e,{kind:'image',...r,svg,name:sym.id});
 }
 for(const e of document.querySelectorAll('.poster img'))push(e,{kind:'image',...box(e),src:e.getAttribute('src'),name:e.alt});
 return{width:841*96/25.4,height:594*96/25.4,items,groups,italicRegions:[...document.querySelectorAll('.metric-question')].map(box)};
});
await fs.writeFile(out+'/geometry.json',JSON.stringify(result,null,2));await b.close();console.log('Native geometry:',result.items.length,'groups:',result.groups.length);
