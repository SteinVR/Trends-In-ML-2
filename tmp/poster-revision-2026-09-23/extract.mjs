import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await b.newPage({viewport:{width:2246,height:3179}});
await page.goto('file:///home/xeliaray/Projects/Trends-In-ML-2/output/poster-narrative-3/revised-poster/index.html');await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({media:'print'});
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
 for(const e of document.querySelectorAll('.poster img'))items.push({id:'s'+id++,kind:'image',...box(e),src:e.getAttribute('src'),name:e.alt});
 return {width:594*96/25.4,height:841*96/25.4,items};
});
await fs.writeFile('tmp/poster-revision-2026-09-23/dom.json',JSON.stringify(data,null,2));
await b.close();console.log('Extracted',data.items.length,'elements');
