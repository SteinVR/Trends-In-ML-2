const {chromium}=require('playwright'),fs=require('fs');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage({viewport:{width:3180,height:2246}});await p.goto('file://'+process.cwd()+'/output/poster-narrative-3/layout-v4/index.html');await p.evaluate(()=>document.fonts.ready);await p.emulateMedia({media:'print'});
const result=await p.evaluate(()=>{
 const y=e=>e.getBoundingClientRect().top;
 const cards=[...document.querySelectorAll('.stage')].map(e=>({title:y(e.querySelector('h3')),description:y(e.querySelector('p')),icon:y(e.querySelector('.icon')),technology:y(e.querySelector('.tech'))}));
 const spreads=Object.fromEntries(Object.keys(cards[0]).map(k=>[k,Math.max(...cards.map(c=>c[k]))-Math.min(...cards.map(c=>c[k]))]));
 const baseline=[...document.querySelectorAll('.flow strong')].map(y);
 const order=[...document.querySelectorAll('.right>section')].map(e=>e.id);
 return {cards,spreads,baselineLabelSpread:Math.max(...baseline)-Math.min(...baseline),rightColumnOrder:order};
});fs.writeFileSync('tmp/layout-v4/review-fix/alignment.json',JSON.stringify(result,null,2));
if(Object.values(result.spreads).some(v=>v>0.5)||result.baselineLabelSpread>0.5||result.rightColumnOrder.join(',')!=='s8,s9,s10,s11,s12')throw Error('Alignment or reading-order regression');
console.log(result);await p.locator('#s6').screenshot({path:'tmp/layout-v4/review-fix/methods.png'});await b.close()})();
