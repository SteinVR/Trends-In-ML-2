import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const build = 'tmp/poster-pptx-approved-2026-09-23';
const root = '/home/xeliaray/Projects/Trends-In-ML-2';
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 2246, height: 3179 } });
await page.goto('file://' + root + '/output/poster-narrative-3/revised-poster/index.html');
await page.evaluate(() => document.fonts.ready);
await page.emulateMedia({ media: 'print' });
await page.pdf({ path: build + '/reference.pdf', preferCSSPageSize: true, printBackground: true });
await page.screenshot({ path: build + '/reference.png', fullPage: true });

const data = await page.evaluate(() => {
  const items = [], groups = [];
  const box = e => { const r = e.getBoundingClientRect(); return { left: r.x, top: r.y, width: r.width, height: r.height }; };
  const hex = c => { const v = c.match(/[\d.]+/g); return !v || v[3] === '0' ? 'none' : '#' + v.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join(''); };
  let id = 0;
  for (const e of document.querySelectorAll('.pipeline-card,.baseline-flow,.hypotheses,.conclusion')) {
    e.dataset.pptxGroup = 'group' + groups.length;
    groups.push({ id: e.dataset.pptxGroup, name: e.querySelector('h3')?.innerText || e.className, ...box(e) });
  }
  const group = e => e.closest('[data-pptx-group]')?.dataset.pptxGroup || null;
  const push = (e, item) => items.push({ id: 's' + id++, group: group(e), ...item });
  const style = e => {
    const c = getComputedStyle(e);
    return { fontSize: parseFloat(c.fontSize), bold: +c.fontWeight >= 600, italic: c.fontStyle === 'italic', color: hex(c.color), tracking: parseFloat(c.letterSpacing) || 0, underlined: c.textDecorationLine.includes('underline'), link: e.closest('a')?.getAttribute('href') || null };
  };

  // Resolve generated arrows against the browser's actual layout, without editing the HTML source.
  for (const e of document.querySelectorAll('.baseline-node,.pipeline-card')) {
    const c = getComputedStyle(e, '::after');
    if (c.content === 'none' || c.content === 'normal') continue;
    const ghost = document.createElement('span');
    for (const property of c) ghost.style.setProperty(property, c.getPropertyValue(property));
    ghost.textContent = c.content.replace(/^['"]|['"]$/g, '');
    e.appendChild(ghost);
    const r = box(ghost);
    if (ghost.textContent) ghost.dataset.pptxArrow = 'text';
    else {
      push(e, { kind: 'path', ...r, name: 'Pipeline arrow', fill: hex(c.backgroundColor), stroke: 'none', points: [[0,.3],[.52,.3],[.52,0],[1,.5],[.52,1],[.52,.7],[0,.7]].map(([x,y]) => ({ x:x*r.width, y:y*r.height })) });
      ghost.remove();
    }
  }

  const backdrops = [];
  for (const e of document.querySelectorAll('.poster *')) {
    if (e.namespaceURI.includes('svg')) continue;
    const c = getComputedStyle(e), r = box(e), bg = hex(c.backgroundColor);
    if (!r.width || !r.height) continue;
    const edges = ['Top','Right','Bottom','Left'];
    const widths = edges.map(k => parseFloat(c['border'+k+'Width']));
    const colors = edges.map(k => hex(c['border'+k+'Color']));
    const uniform = widths[0] > 0 && widths.every(v => v === widths[0]) && colors.every(v => v === colors[0]);
    const radius = parseFloat(c.borderTopLeftRadius) || parseFloat(c.borderBottomLeftRadius) || 0;
    if (bg !== 'none' || uniform) backdrops.push({ id:'s'+id++, group:group(e), kind:'rect', ...r, fill:bg, stroke:uniform?colors[0]:'none', strokeWidth:uniform?widths[0]:0, radius, name:'Panel '+(e.className || e.tagName) });
    if (!uniform) for (const edge of edges) {
      const w = parseFloat(c['border'+edge+'Width']);
      if (!w || c['border'+edge+'Style'] === 'none') continue;
      const pos = {...r};
      if (edge === 'Top' || edge === 'Bottom') { pos.height=w; if (edge === 'Bottom') pos.top+=r.height-w; }
      else { pos.width=w; if (edge === 'Right') pos.left+=r.width-w; }
      backdrops.push({ id:'s'+id++, group:group(e), kind:'rect', ...pos, fill:hex(c['border'+edge+'Color']), stroke:'none', name:'Rule '+e.className });
    }
  }
  items.unshift(...backdrops);

  for (const e of document.querySelectorAll('.poster p,.poster h1,.poster h2,.poster h3,.num,.english,.phase>span,[data-pptx-arrow]')) {
    const c = getComputedStyle(e), walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), chars = [];
    let node;
    while (node = walker.nextNode()) {
      const st = style(node.parentElement), transform = getComputedStyle(node.parentElement).textTransform;
      for (let j=0; j<node.length; j++) {
        const range = document.createRange(); range.setStart(node,j); range.setEnd(node,j+1);
        const r = range.getBoundingClientRect();
        if (r.width < .1 || r.height < .1) continue;
        chars.push({ char: transform==='uppercase'?node.textContent[j].toUpperCase():node.textContent[j], x:r.x, y:r.y, w:r.width, h:r.height, style:st });
      }
    }
    if (!chars.length) continue;
    const lines = [];
    for (const ch of chars) {
      let line = lines.find(x=>Math.abs(x.y-ch.y)<3);
      if (!line) { line={y:ch.y,height:ch.h,chars:[]}; lines.push(line); }
      line.chars.push(ch);
    }
    lines.sort((a,b)=>a.y-b.y);
    for (const line of lines) {
      line.runs=[];
      for (const ch of line.chars) {
        const previous=line.runs.at(-1);
        if (previous && JSON.stringify(previous.style)===JSON.stringify(ch.style)) previous.text+=ch.char;
        else line.runs.push({text:ch.char,style:ch.style});
      }
      line.x=line.chars[0].x; line.right=Math.max(...line.chars.map(ch=>ch.x+ch.w)); delete line.chars;
    }
    const r=box(e), left=lines[0].x, top=lines[0].y;
    const width=Math.max(r.width-parseFloat(c.paddingLeft)-parseFloat(c.paddingRight)-parseFloat(c.borderLeftWidth)-parseFloat(c.borderRightWidth),...lines.map(l=>l.right-left))+3;
    push(e,{kind:'text',left,top,width,height:lines.at(-1).y+lines.at(-1).height-top,lines,lineHeight:parseFloat(c.lineHeight)||parseFloat(c.fontSize)*1.2,name:e.innerText.slice(0,100)});
  }
  for (const e of document.querySelectorAll('.poster svg.icon')) {
    const c=getComputedStyle(e), symbol=document.querySelector(e.querySelector('use').getAttribute('href')), r=box(e);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${r.width}" height="${r.height}" viewBox="${symbol.getAttribute('viewBox')}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="${c.strokeWidth}" stroke-linecap="${c.strokeLinecap}" stroke-linejoin="${c.strokeLinejoin}">${symbol.innerHTML}</svg>`.replaceAll('currentColor',c.color);
    push(e,{kind:'image',...r,svg,name:symbol.id});
  }
  for (const e of document.querySelectorAll('.poster img')) push(e,{kind:'image',...box(e),src:e.getAttribute('src'),name:e.alt});
  return {width:594*96/25.4,height:841*96/25.4,items,groups};
});
await fs.writeFile(build+'/dom.json',JSON.stringify(data,null,2));
await browser.close();
console.log('Extracted',data.items.length,'objects and',data.groups.length,'editable groups');
