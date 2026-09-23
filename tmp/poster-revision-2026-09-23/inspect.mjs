import {chromium} from 'playwright';
const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await b.newPage({viewport:{width:2246,height:3900}});
await page.goto('file:///home/xeliaray/Projects/Trends-In-ML-2/output/poster-narrative-3/revised-poster/index.html');await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({media:'print'});
console.log(await page.evaluate(()=>[...document.querySelectorAll('header,.masthead,h1,.context,.question,.hypotheses,.data,.design-note,.baseline,.stages,.controls,.evaluation,.metrics-line,.chart,.chart-caption,.detail-grid,.conclusion,.scope,footer')].map(e=>({tag:e.tagName,class:e.className,h:e.getBoundingClientRect().height,top:e.getBoundingClientRect().top}))));
await page.screenshot({path:'tmp/poster-revision-2026-09-23/diagnostic.png',fullPage:true});await b.close();
