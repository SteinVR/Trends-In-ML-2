import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await b.newPage({viewport:{width:2246,height:3179}});
await page.goto('file:///home/xeliaray/Projects/Trends-In-ML-2/output/poster-narrative-3/poster/index.html');await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({media:'print'});
const data=await page.evaluate(()=>{
 const items=[],box=e=>{const r=e.getBoundingClientRect();return {left:r.x,top:r.y,width:r.width,height:r.height}},hex=c=>{const v=c.match(/[\d.]+/g);return !v||v[3]==='0'?'none':'#'+v.slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join('')};
 let id=0;
 const style=e=>{const c=getComputedStyle(e);return {fontSize:parseFloat(c.fontSize),bold:+c.fontWeight>=600,color:hex(c.color),tracking:parseFloat(c.letterSpacing)||0,underlined:c.textDecorationLine.includes('underline'),link:e.closest('a')?.getAttribute('href')||null}};
 // Native background panels and individual borders, preserving CSS positions.
 for(const e of document.querySelectorAll('.poster *')){
  if(e.namespaceURI.includes('svg')||e.closest('.toolbar'))continue;
  const c=getComputedStyle(e),r=box(e),bg=hex(c.backgroundColor);if(!r.width||!r.height)continue;
  if(bg!=='none')items.push({id:'s'+id++,kind:'rect',...r,fill:bg,stroke:'none',name:'Panel '+(e.className||e.tagName)});
  for(const edge of ['Top','Left','Bottom','Right']){
   const w=parseFloat(c['border'+edge+'Width']);if(!w||c['border'+edge+'Style']==='none')continue;
   const pos={...r};if(edge==='Top'||edge==='Bottom'){pos.height=w;if(edge==='Bottom')pos.top+=r.height-w}else{pos.width=w;if(edge==='Right')pos.left+=r.width-w}
   items.push({id:'s'+id++,kind:'rect',...pos,fill:hex(c['border'+edge+'Color']),stroke:'none',name:'Rule '+e.className});
  }
 }
 const selects='p,h1,h2,h3,figcaption,.num,.english,.metric>strong,.metric>span,.hyp-row>b,.hyp-row>span';
 for(const e of document.querySelectorAll(selects)){
  if(e.closest('.toolbar'))continue;
  const c=getComputedStyle(e),walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),chars=[];let node;
  while(node=walker.nextNode()){
   const st=style(node.parentElement);const transform=getComputedStyle(node.parentElement).textTransform;
   for(let j=0;j<node.length;j++){
    const ra=document.createRange();ra.setStart(node,j);ra.setEnd(node,j+1);const r=ra.getBoundingClientRect();
    if(r.width<.1||r.height<.1)continue;
    chars.push({char:transform==='uppercase'?node.textContent[j].toUpperCase():node.textContent[j],x:r.x,y:r.y,w:r.width,h:r.height,style:st});
   }
  }
  if(!chars.length)continue;
  const lines=[];for(const ch of chars){let l=lines.find(x=>Math.abs(x.y-ch.y)<3);if(!l){l={y:ch.y,height:ch.h,chars:[]};lines.push(l)}l.chars.push(ch)}
  lines.sort((a,b)=>a.y-b.y);
  for(const line of lines){line.runs=[];for(const ch of line.chars){const prev=line.runs.at(-1);if(prev&&JSON.stringify(prev.style)===JSON.stringify(ch.style))prev.text+=ch.char;else line.runs.push({text:ch.char,style:ch.style})}line.x=line.chars[0].x;line.right=Math.max(...line.chars.map(ch=>ch.x+ch.w));delete line.chars;}
  const r=box(e),left=lines[0].x,top=lines[0].y;let w=r.width-parseFloat(c.paddingLeft)-parseFloat(c.paddingRight)-parseFloat(c.borderLeftWidth)-parseFloat(c.borderRightWidth);
  w=Math.max(w,...lines.map(l=>l.right-left))+3;
  items.push({id:'s'+id++,kind:'text',left,top,width:w,height:Math.max(r.height,lines.at(-1).y+lines.at(-1).height-top),lines,lineHeight:parseFloat(c.lineHeight)||parseFloat(c.fontSize)*1.2,name:e.innerText.slice(0,80)});
 }
 // Editable SVG diagram primitives.
 const svg=document.querySelector('.pipeline'),sr=box(svg),sc=sr.width/2100;
 for(const e of svg.querySelectorAll('rect')){
  const c=getComputedStyle(e);items.push({id:'s'+id++,kind:'rect',...box(e),fill:hex(c.fill),stroke:hex(c.stroke),strokeWidth:parseFloat(c.strokeWidth)*sc,radius:parseFloat(e.getAttribute('rx'))*sc,name:'Pipeline node'});
 }
 for(const e of svg.querySelectorAll('g>path')){
  const c=getComputedStyle(e);const tok=e.getAttribute('d').match(/[MHVL]|-?[\d.]+/g),points=[];let x=0,y=0,i=0;
  while(i<tok.length){const cmd=tok[i++];if(cmd==='M'||cmd==='L'){x=+tok[i++];y=+tok[i++]}if(cmd==='H')x=+tok[i++];if(cmd==='V')y=+tok[i++];points.push({x:sr.left+x*sc,y:sr.top+y*sc})}
  const minx=Math.min(...points.map(p=>p.x)),miny=Math.min(...points.map(p=>p.y));
  items.push({id:'s'+id++,kind:'path',left:minx,top:miny,width:Math.max(1,Math.max(...points.map(p=>p.x))-minx),height:Math.max(1,Math.max(...points.map(p=>p.y))-miny),points:points.map(p=>({x:p.x-minx,y:p.y-miny})),stroke:hex(c.stroke),strokeWidth:parseFloat(c.strokeWidth)*sc,name:'Pipeline arrow'});
  const a=points.at(-1),z=points.at(-2),dx=a.x-z.x,dy=a.y-z.y,ang=Math.atan2(dy,dx),len=14*sc,spread=6*sc;
  const pts=[{x:a.x-len*Math.cos(ang)+spread*Math.sin(ang),y:a.y-len*Math.sin(ang)-spread*Math.cos(ang)},a,{x:a.x-len*Math.cos(ang)-spread*Math.sin(ang),y:a.y-len*Math.sin(ang)+spread*Math.cos(ang)}];
  const ax=Math.min(...pts.map(p=>p.x)),ay=Math.min(...pts.map(p=>p.y));
  items.push({id:'s'+id++,kind:'path',left:ax,top:ay,width:Math.max(...pts.map(p=>p.x))-ax,height:Math.max(...pts.map(p=>p.y))-ay,points:pts.map(p=>({x:p.x-ax,y:p.y-ay})),stroke:hex(c.stroke),strokeWidth:3*sc,name:'Arrowhead'});
 }
 for(const e of svg.querySelectorAll('text')){
  const r=box(e),runs=[];for(const node of e.childNodes){if(!node.textContent)continue;const el=node.nodeType===3?e:node,st=style(el);st.color=hex(getComputedStyle(el).fill);st.fontSize*=sc;runs.push({text:node.textContent,style:st})}
  const baseline=sr.top+(+e.getAttribute('y'))*sc,fs=parseFloat(getComputedStyle(e).fontSize)*sc;
  items.push({id:'s'+id++,kind:'text',...r,top:baseline-fs*1.069,width:r.width+5,height:fs*1.4,lines:[{runs}],lineHeight:fs*1.2,name:'Diagram: '+e.textContent});
 }
 for(const e of document.querySelectorAll('.poster img'))items.push({id:'s'+id++,kind:'image',...box(e),src:e.getAttribute('src'),name:e.alt});
 return {width:594*96/25.4,height:841*96/25.4,items};
});
await fs.writeFile('tmp/poster-pptx/dom.json',JSON.stringify(data,null,2));
await b.close();console.log('Extracted',data.items.length,'elements');
