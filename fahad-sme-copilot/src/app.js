const $=s=>document.querySelector(s);
let L='en';try{L=localStorage.getItem('bdl')||'en'}catch(e){}
const t=(a,b)=>L==='bn'?b:a;
const bd=s=>String(s).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
const num=n=>{const s=Math.round(n).toLocaleString('en-IN');return L==='bn'?bd(s):s};
const f1=x=>{const s=x.toFixed(1).replace(/\.0$/,'');return L==='bn'?bd(s):s};
const tk=n=>(n<0?'-':'')+'৳'+num(Math.abs(n));
const sh=n=>{const a=Math.abs(n),s=n<0?'-':'';return a>=1e7?s+'৳'+f1(a/1e7)+t(' crore',' কোটি'):a>=1e5?s+'৳'+f1(a/1e5)+t(' lakh',' লাখ'):tk(n)};
const pad=n=>String(n).padStart(2,'0');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const fd=d=>d.toLocaleDateString(L==='bn'?'bn-BD':'en-GB',{day:'numeric',month:'short',year:'numeric'});
const addD=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const parse=s=>new Date(s+'T12:00:00');

const TY=[['trade','Retail / trading','খুচরা / পাইকারি ব্যবসা'],['mfg','Manufacturing','উৎপাদন'],['svc','Services','সেবা'],['agro','Agro / food','কৃষি / খাদ্য'],['rmg','RMG / export','আরএমজি / রপ্তানি'],['tech','E-commerce / tech','ই-কমার্স / প্রযুক্তি']];
const PU=[['wc','Working capital','চলতি মূলধন'],['eq','Equipment / machinery','যন্ত্রপাতি ক্রয়'],['ex','Expansion','ব্যবসা সম্প্রসারণ'],['re','Refinance existing loan','বিদ্যমান ঋণ পুনঃঅর্থায়ন']];
const FP=[['name','Business name','ব্যবসার নাম','t'],['type','Business type','ব্যবসার ধরন','s',TY],['years','Years in business','ব্যবসার বয়স (বছর)','n'],
['rev','Monthly sales (৳)','মাসিক বিক্রি (৳)','n'],['cogs','Monthly cost of goods (৳)','মাসিক পণ্যের খরচ (৳)','n'],['opex','Rent, salaries, utilities / month (৳)','ভাড়া, বেতন, বিল / মাস (৳)','n'],
['emi','Loan installments / month (৳)','মাসিক ঋণের কিস্তি (৳)','n'],['cash','Cash + bank + bKash/Nagad (৳)','নগদ + ব্যাংক + বিকাশ/নগদ (৳)','n'],
['ar','Customer dues – receivable (৳)','বাকি পাওনা (৳)','n'],['ap','Supplier dues – payable (৳)','সরবরাহকারীর দেনা (৳)','n'],['inv','Stock value (৳)','মজুত পণ্যের মূল্য (৳)','n'],
['vat','Monthly VAT / tax paid (৳)','মাসিক ভ্যাট/কর (৳)','n'],['minbal','Safety cash minimum (৳)','নিরাপদ ন্যূনতম নগদ (৳)','n']];
const FF=[['need','Amount needed (৳)','প্রয়োজনীয় ঋণ (৳)','n'],['purpose','Purpose','উদ্দেশ্য','s',PU],['tenor','Repayment period (months)','পরিশোধের মেয়াদ (মাস)','n'],
['tl','I have a valid trade license','হালনাগাদ ট্রেড লাইসেন্স আছে','b'],['tin','I have a TIN certificate','টিআইএন সনদ আছে','b'],['coll','I can offer collateral','জামানত দিতে পারব','b'],['woman','Woman-owned business','নারী উদ্যোক্তা','b']];

const DEF=()=>({v:2,name:'',type:'trade',years:3,rev:1200000,cogs:800000,opex:250000,emi:30000,cash:350000,ar:600000,ap:300000,inv:400000,vat:45000,minbal:100000,need:1000000,purpose:'wc',tenor:36,tl:true,tin:true,coll:false,woman:false,legal:'sole',cat:'gen',ntp:false,bank:false,tfloor:true,intr:0,dep:0,invest:0,ait:0,vmode:'std',vrate:15,vinp:600000,vfix:0,
ev:[{d:addD(20),l:'Customer dues collected',a:300000},{d:addD(25),l:'Supplier dues paid',a:-300000},{d:'2027-03-10',l:'Eid-ul-Fitr bonus (expected date)',a:-150000},{d:'2027-05-17',l:'Eid-ul-Adha bonus (expected date)',a:-100000}]});
let S=DEF();try{const x=localStorage.getItem('bds');if(x){const j=JSON.parse(x);if(j.v!==2)delete j.ev;S=Object.assign(DEF(),j)}}catch(e){}
const save=()=>{try{localStorage.setItem('bds',JSON.stringify(S))}catch(e){}snap('auto')};

function fld(a){const[k,e,b,ty,o]=a,v=S[k],lb=t(e,b);
if(ty==='b')return`<label class="ck"><input type="checkbox" ${v?'checked':''} oninput="sv('${k}',this)"> ${lb}</label>`;
const c=ty==='s'?`<select oninput="sv('${k}',this)">${o.map(x=>`<option value="${x[0]}" ${x[0]===v?'selected':''}>${t(x[1],x[2])}</option>`).join('')}</select>`:`<input type="${ty==='n'?'number':'text'}" ${ty==='n'?'inputmode="numeric"':''} value="${esc(v)}" oninput="sv('${k}',this)">`;
return`<label>${lb}${c}</label>`}
function sv(k,el){S[k]=el.type==='checkbox'?el.checked:el.type==='number'?(+el.value||0):el.value;save();out()}

function M(){const gp=S.rev-S.cogs,op=gp-S.opex,net=op-S.emi,gm=S.rev?gp/S.rev:0,nm=S.rev?net/S.rev:0;
const dso=S.rev?S.ar/S.rev*30:0,dpo=S.cogs?S.ap/S.cogs*30:0,dio=S.cogs?S.inv/S.cogs*30:0,ccc=dso+dio-dpo;
const fix=S.opex+S.emi,cover=fix?S.cash/fix:99,dscr=S.emi?op/S.emi:99;
let h=100;if(gm<.15)h-=10;if(nm<.05)h-=15;if(nm<0)h-=15;if(dso>45)h-=10;if(dso>60)h-=5;if(cover<2)h-=10;if(cover<1)h-=10;if(dscr<1.25)h-=15;if(ccc>75)h-=10;
return{gp,op,net,gm,nm,dso,dpo,dio,ccc,cover,dscr,h:Math.max(5,h)}}

function fc(days){const o=[],m=M(),dn=(S.rev-S.cogs-S.opex-S.emi)/30;let b=S.cash;const st=new Date();st.setHours(12,0,0,0);
for(let i=0;i<=days;i++){const d=new Date(st.getTime()+i*864e5);if(i>0){b+=dn;if(iso(d)===iso(vday(d.getFullYear(),d.getMonth())))b-=S.vat}
const k=iso(d);S.ev.forEach(e=>{if(e.d===k)b+=e.a});o.push({d,b})}return o}
const vday=(y,m)=>{const d=new Date(y,m,15,12);while(d.getDay()===5||d.getDay()===6)d.setDate(d.getDate()+1);return d};
const next15=()=>{const n=new Date(),t0=new Date(n.getFullYear(),n.getMonth(),n.getDate(),12);let d=vday(n.getFullYear(),n.getMonth());if(d<t0)d=vday(n.getFullYear(),n.getMonth()+1);return d};

function alerts(F,m){const A=[],neg=F.find(x=>x.b<0),low=F.find(x=>x.b<S.minbal);
if(neg)A.push(['r',t(`Cash may run out around ${fd(neg.d)}. Act now: collect dues, delay non-urgent purchases, or line up short-term credit.`,`${fd(neg.d)} নাগাদ নগদ শেষ হয়ে যেতে পারে। এখনই বাকি আদায়, অপ্রয়োজনীয় কেনাকাটা পিছানো বা স্বল্পমেয়াদি ঋণের ব্যবস্থা করুন।`)]);
else if(low)A.push(['w',t(`Cash drops below your ${sh(S.minbal)} safety level around ${fd(low.d)}.`,`${fd(low.d)} নাগাদ নগদ আপনার নিরাপদ সীমা ${sh(S.minbal)}-এর নিচে নামবে।`)]);
else A.push(['i',t('No cash shortfall in the next 8 months.','আগামী ৮ মাসে নগদ ঘাটতির লক্ষণ নেই।')]);
const v=next15(),dd=Math.round((v-new Date())/864e5);
A.push([dd<=7?'w':'i',t(`Monthly VAT return and payment due ${fd(v)} (15th of the month, next working day if Fri/Sat or holiday): set aside ${tk(S.vat)}.`,`মাসিক ভ্যাট রিটার্ন ও পরিশোধের শেষ তারিখ ${fd(v)} (মাসের ১৫ তারিখ; শুক্র/শনি বা ছুটি হলে পরের কর্মদিবস): ${tk(S.vat)} আলাদা রাখুন।`)]);
if(iso(new Date())<='2026-10-25')A.push(['i',t('NBR extended the July–September 2026 VAT return deadline to 25 Oct 2026 with no interest or penalty. Monthly returns are back after the 14 Oct 2026 law change.','এনবিআর জুলাই–সেপ্টেম্বর ২০২৬ ভ্যাট রিটার্নের সময় ২৫ অক্টোবর ২০২৬ পর্যন্ত বাড়িয়েছে, সুদ বা জরিমানা ছাড়া। ১৪ অক্টোবর ২০২৬-এর আইন সংশোধনে মাসিক রিটার্ন ফিরে এসেছে।')]);
taxAlerts(A);
S.ev.filter(e=>/eid|ঈদ/i.test(e.l)&&parse(e.d)>new Date()).forEach(e=>{const p=F.find(x=>iso(x.d)===e.d);if(p)A.push([p.b<S.minbal?'w':'i',t(`Eid bonus of ${tk(-e.a)} on ${fd(parse(e.d))}: projected balance after payment ${tk(p.b)}.`,`${fd(parse(e.d))} তারিখে ঈদ বোনাস ${tk(-e.a)}: পরিশোধের পর সম্ভাব্য ব্যালেন্স ${tk(p.b)}।`)])});
if(m.dso>45)A.push(['w',t(`Customers take ${f1(m.dso)} days to pay. Chasing dues faster would free up cash.`,`ক্রেতারা গড়ে ${f1(m.dso)} দিনে টাকা দেন। দ্রুত বাকি আদায় করলে নগদ বাড়বে।`)]);
if(m.net<0)A.push(['r',t(`You are losing ${tk(-m.net)} a month after loan installments.`,`কিস্তির পর প্রতি মাসে ${tk(-m.net)} লোকসান হচ্ছে।`)]);
return A}

function chart(F){const W=640,H=230,P=44,mn=Math.min(0,S.minbal*0,...F.map(x=>x.b)),mx=Math.max(S.minbal,...F.map(x=>x.b))*1.05,n=F.length-1;
const X=i=>P+i*(W-P-10)/n,Y=v=>10+(H-40)*(1-(v-mn)/(mx-mn||1));
const pts=F.map((x,i)=>X(i).toFixed(1)+','+Y(x.b).toFixed(1)).join(' ');
const lo=F.reduce((a,x)=>x.b<a.b?x:a,F[0]),li=F.indexOf(lo);
return`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('Cash balance forecast','নগদ ব্যালেন্সের পূর্বাভাস')}">
<line x1="${P}" x2="${W-10}" y1="${Y(S.minbal)}" y2="${Y(S.minbal)}" stroke="var(--warn)" stroke-dasharray="5 4"/>
<text x="${P+4}" y="${Y(S.minbal)-4}" font-size="11" fill="var(--warn)">${t('safety minimum','নিরাপদ সীমা')}</text>
${mn<0?`<line x1="${P}" x2="${W-10}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--red)"/>`:''}
<polyline points="${pts}" fill="none" stroke="var(--pri)" stroke-width="2.5"/>
<circle cx="${X(li)}" cy="${Y(lo.b)}" r="5" fill="${lo.b<S.minbal?'var(--red)':'var(--pri)'}"/>
<text x="${Math.min(X(li),W-90)}" y="${Y(lo.b)+(lo.b<mx/2?-9:17)}" font-size="12" fill="var(--ink)">${t('lowest','সর্বনিম্ন')} ${sh(lo.b)}</text>
<text x="4" y="${Y(mx)+10}" font-size="11" fill="var(--mut)">${sh(mx)}</text><text x="4" y="${Y(mn)}" font-size="11" fill="var(--mut)">${sh(mn)}</text>
${[0,Math.floor(n/2),n].map(i=>`<text x="${X(i)}" y="${H-8}" font-size="11" text-anchor="${i?i===n?'end':'middle':'start'}" fill="var(--mut)">${fd(F[i].d)}</text>`).join('')}</svg>`}

const tips=m=>{const r=[];
if(m.gm<.2)r.push(t('Gross margin is thin. Renegotiate supplier prices or review your selling price.','মোট মুনাফার হার কম। সরবরাহকারীর দাম নিয়ে দর কষুন বা বিক্রয়মূল্য পুনর্বিবেচনা করুন।'));
if(m.dso>45)r.push(t(`Cut collection time by 10 days to free about ${sh(S.rev/30*10)} in cash.`,`বাকি আদায়ের সময় ১০ দিন কমালে প্রায় ${sh(S.rev/30*10)} নগদ মুক্ত হবে।`));
if(m.dio>60)r.push(t(`Stock sits ${f1(m.dio)} days. Run offers on slow items to release cash.`,`মজুত গড়ে ${f1(m.dio)} দিন পড়ে থাকে। ধীরগতির পণ্যে অফার দিয়ে নগদ ছাড়ান।`));
if(m.dpo<20&&S.ap>0)r.push(t('You pay suppliers quickly. Ask for 30-day credit terms.','আপনি সরবরাহকারীকে দ্রুত টাকা দেন। ৩০ দিনের বাকির সুবিধা চান।'));
if(m.cover<2)r.push(t('Build a cash buffer of at least 2 months of fixed costs.','কমপক্ষে ২ মাসের নির্ধারিত খরচের সমান নগদ জমা রাখুন।'));
if(S.emi&&m.dscr<1.25)r.push(t('Loan installments are heavy compared with profit. Avoid new debt until this improves.','মুনাফার তুলনায় কিস্তি বেশি। এটি ঠিক না হওয়া পর্যন্ত নতুন ঋণ এড়ান।'));
if(!r.length)r.push(t('Your numbers look healthy. Keep monthly records (bKash/bank statements) to strengthen loan applications.','আপনার হিসাব ভালো। ঋণের আবেদন শক্ত করতে মাসিক হিসাব (বিকাশ/ব্যাংক স্টেটমেন্ট) রাখুন।'));
r.push(t('Pohela Boishakh (14 April) is the traditional Haal Khata, when old dues are settled. Plan your collections before it.','পহেলা বৈশাখে (১৪ এপ্রিল) হালখাতায় পুরনো বাকি মেটানো হয়। তার আগে আদায়ের পরিকল্পনা করুন।'));return r};

function ov(){const m=M(),c=m.h>=75?'pos':m.h>=50?'':'neg';
const K=(v,l)=>`<div class="k"><b>${v}</b><span>${l}</span></div>`;
$('#ov').innerHTML=`<div class="c"><h2>${t('Business health','ব্যবসার স্বাস্থ্য')}</h2><div class="g">
<div class="k"><div class="sc ${c}">${L==='bn'?bd(m.h):m.h}<span style="font-size:18px">/${L==='bn'?'১০০':'100'}</span></div><span>${t('Health score','স্বাস্থ্য স্কোর')}</span></div>
${K(f1(m.gm*100)+'%',t('Gross margin','মোট মুনাফার হার'))}${K(f1(m.nm*100)+'%',t('Net margin after installments','কিস্তির পর নিট হার'))}
${K(tk(m.net),t('Net profit / month','মাসিক নিট মুনাফা'))}${K(f1(m.cover)+t(' months',' মাস'),t('Cash covers fixed costs','নগদে চলবে (নির্ধারিত খরচ)'))}
${K(S.emi?f1(m.dscr)+'x':'–',t('Debt cover (DSCR)','ঋণ পরিশোধ সক্ষমতা (DSCR)'))}
${K(f1(m.dso)+t(' days',' দিন'),t('Customers pay in','ক্রেতা টাকা দেন'))}${K(f1(m.dpo)+t(' days',' দিন'),t('You pay suppliers in','আপনি সরবরাহকারীকে দেন'))}
${K(f1(m.ccc)+t(' days',' দিন'),t('Cash tied-up cycle','নগদ আটকে থাকার চক্র'))}</div></div>
<div class="c"><h2>${t('What to do next','পরবর্তী করণীয়')}</h2><ul>${tips(m).map(x=>`<li>${x}</li>`).join('')}</ul></div>`}

function cf(){const m=M(),F=fc(240);$('#al').innerHTML=alerts(F,m).map(a=>`<div class="al ${a[0]}">${a[1]}</div>`).join('');
$('#ch').innerHTML=chart(F);
$('#evl').innerHTML=S.ev.length?`<table>${S.ev.slice().sort((a,b)=>a.d<b.d?-1:1).map(e=>{const i=S.ev.indexOf(e);return`<tr><td>${fd(parse(e.d))}</td><td>${esc(e.l)}</td><td class="${e.a<0?'neg':'pos'}">${e.a<0?'-':'+'}${tk(Math.abs(e.a)).replace('-','')}</td><td><button class="b" onclick="dl(${i})" aria-label="${t('Remove','মুছুন')}">✕</button></td></tr>`}).join('')}</table>`:`<p class="mut">${t('No one-off items yet. Add Eid bonus, VAT arrears, equipment purchase or a big customer payment.','কোনো একবারের লেনদেন নেই। ঈদ বোনাস, ভ্যাট বকেয়া, যন্ত্রপাতি কেনা বা বড় পাওনা যোগ করুন।')}</p>`}
function dl(i){S.ev.splice(i,1);save();cf()}

const SRC={bb:['Official Bangladesh Bank circular','বাংলাদেশ ব্যাংকের সার্কুলার'],mk:['Market rate, BB data Jun 2026','বাজার হার, বাংলাদেশ ব্যাংক (জুন ২০২৬)'],es:['Estimate, confirm with lender','আনুমানিক, ঋণদাতার কাছে যাচাই করুন']};
const rr=o=>{const a=o.r[0]===o.r[1]?o.r[0]:o.r[0]+'–'+o.r[1];return L==='bn'?bd(a):a};
const O=[
{n:['CMSME Working Capital Refinance Fund (Bangladesh Bank, Jun 2026)','সিএমএসএমই চলতি মূলধন পুনঃঅর্থায়ন তহবিল (বাংলাদেশ ব্যাংক, জুন ২০২৬)'],r:[9,9],min:1e5,max:1e8,y:1,tl:1,tin:1,co:0,p:['wc'],s:'bb',d:['Tk 5,000 crore fund. You pay at most 9% a year, with a 3 or 6 month grace period possible. For running businesses short of working capital. CIB-classified (defaulted) borrowers are not eligible. Ask participating banks such as MTB, NRBC or Al-Arafah Islami Bank.','তহবিল ৫,০০০ কোটি টাকা। আপনার সুদ সর্বোচ্চ ৯%, ৩ বা ৬ মাস গ্রেস সম্ভব। চালু ব্যবসায় চলতি মূলধন ঘাটতির জন্য। সিআইবি-শ্রেণিকৃত খেলাপি ঋণগ্রহীতা যোগ্য নন। এমটিবি, এনআরবিসি বা আল-আরাফাহ ইসলামী ব্যাংকের মতো অংশগ্রহণকারী ব্যাংকে জিজ্ঞাসা করুন।']},
{n:['Small Enterprise Refinance Scheme for Women Entrepreneurs','নারী উদ্যোক্তাদের জন্য ক্ষুদ্র উদ্যোগ পুনঃঅর্থায়ন স্কিম'],r:[5,5],min:1e5,max:1e7,y:0,tl:0,tin:0,co:0,w:1,p:['wc','eq','ex'],s:'bb',d:['Up to 5% a year. Limits by size: informal ৳5 lakh, cottage ৳20 lakh, micro ৳50 lakh, small ৳1 crore. Personal or group guarantee can replace collateral up to ৳25 lakh. These terms were last revised in 2023, so confirm the current circular with the bank.','বছরে সর্বোচ্চ ৫%। আকার অনুযায়ী সীমা: অনানুষ্ঠানিক ৫ লাখ, কুটির ২০ লাখ, ক্ষুদ্র ৫০ লাখ, ছোট ১ কোটি টাকা। ২৫ লাখ টাকা পর্যন্ত ব্যক্তিগত বা গ্রুপ গ্যারান্টি জামানতের বদলে চলে। শর্ত ২০২৩ সালে সর্বশেষ সংশোধিত, তাই বর্তমান সার্কুলার ব্যাংকে নিশ্চিত করুন।']},
{n:['Refinance for New Entrepreneurs (cottage, micro, small)','নতুন উদ্যোক্তা পুনঃঅর্থায়ন (কুটির, ক্ষুদ্র, ছোট)'],r:[7,7],min:5e4,max:3e6,y:0,ym:3,tl:0,tin:0,co:0,p:['wc','eq','ex'],s:'bb',d:['7% a year, up to ৳30 lakh, for new entrepreneurs. Offered through participating banks and NBFIs.','নতুন উদ্যোক্তাদের জন্য বছরে ৭%, সর্বোচ্চ ৩০ লাখ টাকা। অংশগ্রহণকারী ব্যাংক ও এনবিএফআই-এর মাধ্যমে।']},
{n:['Agro-processing industry refinance','কৃষিভিত্তিক শিল্প স্থাপন পুনঃঅর্থায়ন'],r:[7,7],min:5e5,max:1e8,y:0,tl:0,tin:0,co:1,p:['eq','ex'],ty:['agro'],s:'bb',d:['7% a year, up to ৳10 crore, to set up agro-processing industries. Ask your bank or Krishi Bank.','কৃষিভিত্তিক শিল্প স্থাপনে বছরে ৭%, সর্বোচ্চ ১০ কোটি টাকা। আপনার ব্যাংক বা কৃষি ব্যাংকে জিজ্ঞাসা করুন।']},
{n:['Commercial bank SME term loan / overdraft','বাণিজ্যিক ব্যাংকের এসএমই মেয়াদি ঋণ / ওভারড্রাফট'],r:[12,14],min:5e5,max:1e8,y:2,tl:1,tin:1,co:1,p:['wc','eq','ex','re'],s:'mk',d:['All-bank average lending rate was 11.86% in June 2026, and SME loans usually cost more. BRAC Bank and Bank Asia offer collateral-free CMSME loans in some segments. Others: City Bank, Prime Bank, EBL, Dutch-Bangla.','জুন ২০২৬-এ সব ব্যাংকের গড় ঋণ সুদ ছিল ১১.৮৬%, এসএমই ঋণে সাধারণত বেশি পড়ে। ব্র্যাক ব্যাংক ও ব্যাংক এশিয়া কিছু ক্ষেত্রে জামানতবিহীন সিএমএসএমই ঋণ দেয়। অন্যান্য: সিটি ব্যাংক, প্রাইম ব্যাংক, ইবিএল, ডাচ-বাংলা।']},
{n:['NBFI term loan / equipment lease','এনবিএফআই মেয়াদি ঋণ / যন্ত্রপাতি লিজ'],r:[13,16],min:5e5,max:5e7,y:1,tl:1,tin:1,co:2,p:['eq','ex'],s:'mk',d:['Non-bank lenders averaged 13.75% in June 2026. Typical providers: IDLC, IPDC, LankaBangla. The machine itself is the security.','জুন ২০২৬-এ এনবিএফআই-এর গড় ঋণ সুদ ছিল ১৩.৭৫%। আইডিএলসি, আইপিডিসি, লংকাবাংলা। যন্ত্রটিই জামানত।']},
{n:['Bill / invoice discounting','বিল / ইনভয়েস ডিসকাউন্টিং'],r:[12,15],min:5e5,max:3e7,y:1,tl:1,tin:1,co:0,p:['wc'],s:'es',d:['Cash against unpaid B2B invoices from reliable buyers. Fits businesses with large customer dues.','নির্ভরযোগ্য ক্রেতার বকেয়া ইনভয়েসের বিপরীতে নগদ। বড় বাকি পাওনা থাকলে উপযোগী।']},
{n:['Back-to-back LC / export working capital','ব্যাক-টু-ব্যাক এলসি / রপ্তানি চলতি মূলধন'],r:[10,13],min:1e6,max:1e8,y:1,tl:1,tin:1,co:0,p:['wc','ex'],ty:['rmg','mfg'],s:'es',d:['For exporters and manufacturers with confirmed orders. Your bank opens the LC against the export order.','নিশ্চিত অর্ডারসহ রপ্তানিকারক ও উৎপাদকদের জন্য। রপ্তানি অর্ডারের বিপরীতে ব্যাংক এলসি খোলে।']},
{n:['Microfinance (NGO-MFI) enterprise loan','ক্ষুদ্রঋণ (এনজিও-এমএফআই) উদ্যোক্তা ঋণ'],r:[20,24],min:3e4,max:1e6,y:1,tl:0,tin:0,co:0,p:['wc','eq'],s:'es',d:['Typical providers: BRAC, ASA, Buro Bangladesh, TMSS. No collateral and quick, but costly. Good for small top-ups.','ব্র্যাক, আশা, ব্যুরো বাংলাদেশ, টিএমএসএস। জামানত ছাড়া ও দ্রুত, তবে খরচ বেশি। ছোট প্রয়োজনে উপযোগী।']},
{n:['Mobile-wallet digital micro-credit (bKash / Nagad partners)','মোবাইল ওয়ালেট ডিজিটাল ক্ষুদ্রঋণ (বিকাশ / নগদ অংশীদার)'],r:[18,30],min:5e3,max:2e5,y:0,tl:0,tin:0,co:0,p:['wc'],s:'es',d:['Very small, instant loans based on wallet history. Costly, so use for short gaps only.','ওয়ালেটের লেনদেন দেখে খুব ছোট ও দ্রুত ঋণ। খরচ বেশি, তাই শুধু স্বল্প ঘাটতিতে নিন।']}];
const pmt=(P,r,n)=>{const i=r/1200;return n>0?(i?P*i/(1-Math.pow(1+i,-n)):P/n):P};

function fin(){const m=M(),R=[];
O.forEach(o=>{if(o.w&&!S.woman)return;let s=45;const bad=[],ok=[],mid=(o.r[0]+o.r[1])/2;
if(o.p.includes(S.purpose)){s+=15;ok.push(t('Fits your purpose','উদ্দেশ্যের সাথে মানানসই'))}else{s-=25;bad.push(t('Not designed for this purpose','এই উদ্দেশ্যের জন্য নয়'))}
if(S.need>=o.min&&S.need<=o.max){s+=10;ok.push(t('Amount within range','অঙ্ক সীমার মধ্যে'))}else if(S.need<o.min){s-=5;bad.push(t(`Below usual minimum (${sh(o.min)})`,`সাধারণ সর্বনিম্ন (${sh(o.min)})-এর কম`))}else{s-=25;bad.push(t(`Above usual limit (${sh(o.max)})`,`সাধারণ সীমা (${sh(o.max)})-এর বেশি`))}
if(S.years>=o.y)s+=5;else{s-=25;bad.push(t(`Needs ${o.y}+ years in business`,`কমপক্ষে ${o.y} বছরের ব্যবসা লাগে`))}
if(o.ym&&S.years>o.ym){s-=30;bad.push(t(`For businesses up to ${o.ym} years old`,`${o.ym} বছর পর্যন্ত পুরনো ব্যবসার জন্য`))}
s+=Math.round((13-mid)*.8)+(o.s==='bb'?3:0);
if(o.tl&&!S.tl){s-=20;bad.push(t('Needs a trade license','ট্রেড লাইসেন্স লাগবে'))}
if(o.tin&&!S.tin){s-=15;bad.push(t('Needs a TIN certificate','টিআইএন সনদ লাগবে'))}
if(o.co===1&&!S.coll){s-=20;bad.push(t('Usually needs collateral','সাধারণত জামানত লাগে'))}
if(o.ty){if(o.ty.includes(S.type)){s+=10;ok.push(t('Matches your sector','আপনার খাতের জন্য'))}else{s-=40;bad.push(t('For a different sector','অন্য খাতের জন্য'))}}
if(o.n[0].startsWith('Bill')&&S.ar<S.need*.5){s-=15;bad.push(t('Your customer dues are too small to borrow against','আপনার বাকি পাওনা ঋণের বিপরীতে কম'))}
if(o.w){s+=10;ok.push(t('Women-owned advantage','নারী উদ্যোক্তা সুবিধা'))}
const e=pmt(S.need,mid,S.tenor),d2=S.emi+e?m.op/(S.emi+e):99;
if(d2>=1.5){s+=10;ok.push(t('Comfortable to repay','পরিশোধ সহজ হবে'))}else if(d2<1){s-=20;bad.push(t('Profit may not cover installments','মুনাফায় কিস্তি কুলাবে না'))}else if(d2<1.2)s-=8;
R.push({o,s:Math.max(1,Math.min(99,s)),bad,ok,e,d2,mid})});
R.sort((a,b)=>b.s-a.s);TOP=R;
$('#fm').innerHTML=`<div class="c"><h2>${t('Bangladesh rate snapshot (16 Oct 2026)','বাংলাদেশের সুদের হার (১৬ অক্টোবর ২০২৬)')}</h2><ul><li>${t('Bangladesh Bank policy rate: 9.50% (cut from 10% on 2 Aug 2026, held in the October quarterly policy).','বাংলাদেশ ব্যাংকের নীতি সুদহার: ৯.৫০% (২ আগস্ট ২০২৬-এ ১০% থেকে কমেছে, অক্টোবরের ত্রৈমাসিক নীতিতে অপরিবর্তিত)।')}</li><li>${t('Average lending rate: banks 11.86%, NBFIs 13.75% (June 2026).','গড় ঋণ সুদ: ব্যাংক ১১.৮৬%, এনবিএফআই ১৩.৭৫% (জুন ২০২৬)।')}</li><li>${t('New CMSME working-capital refinance fund: customer rate capped at 9%. A clear CIB report is needed.','নতুন সিএমএসএমই চলতি মূলধন পুনঃঅর্থায়ন তহবিল: গ্রাহকের সুদ সর্বোচ্চ ৯%। সিআইবি রিপোর্ট পরিষ্কার থাকতে হবে।')}</li></ul></div><div class="c"><h2>${t('Best matches for you','আপনার জন্য সেরা মিল')}</h2>`+R.slice(0,5).map(x=>`<div class="k" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:17px">${x.o.n[L==='bn'?1:0]}</b><span class="pill ${x.s<55?'lo':''}">${t('Fit','মিল')} ${L==='bn'?bd(x.s):x.s}%</span></div>
<span>${t('Rate','সুদ')}: ${rr(x.o)}% · ${t('installment at mid rate','মধ্য হারে কিস্তি')}: ${tk(x.e)}${t('/month','/মাস')} · DSCR ${f1(Math.min(x.d2,99))}x</span>
<p style="margin:6px 0">${x.o.d[L==='bn'?1:0]} <span class="pill ${x.o.s==='es'?'lo':''}">${SRC[x.o.s][L==='bn'?1:0]}</span></p>
${x.ok.map(z=>`<span class="pos">✓ ${z}</span>`).join(' &nbsp; ')}${x.ok.length&&x.bad.length?'<br>':''}${x.bad.map(z=>`<span class="neg">✗ ${z}</span>`).join(' &nbsp; ')}</div>`).join('')+
`<p class="mut">${t('Usual documents: trade license, TIN, NID, 6–12 months of bank/bKash statements, BIN (if VAT-registered), clear CIB report. Rates and limits are indicative only. Confirm current terms with the lender. This is guidance, not financial advice.','সাধারণ কাগজপত্র: ট্রেড লাইসেন্স, টিআইএন, এনআইডি, ৬–১২ মাসের ব্যাংক/বিকাশ স্টেটমেন্ট, বিআইএন (ভ্যাট নিবন্ধিত হলে), পরিষ্কার সিআইবি রিপোর্ট। সুদ ও সীমা আনুমানিক। বর্তমান শর্ত ঋণদাতার কাছে নিশ্চিত হয়ে নিন। এটি পরামর্শ মাত্র, আর্থিক উপদেশ নয়।')}</p></div>`;
return R}

function ask(q){const s=q.toLowerCase(),m=M(),F=fc(240);
if(/eid|bonus|ঈদ|বোনাস/.test(s)){const e=S.ev.find(x=>/eid|ঈদ/i.test(x.l));if(!e)return t('Add your Eid bonus in the Cash-flow tab and I will check if you can afford it.','ক্যাশ-ফ্লো ট্যাবে ঈদ বোনাস যোগ করুন, আমি দেখে বলব সামলাতে পারবেন কিনা।');
const p=F.find(x=>iso(x.d)===e.d);if(!p)return t('That date is beyond the 8-month forecast.','তারিখটি ৮ মাসের পূর্বাভাসের বাইরে।');
if(p.b>=S.minbal)return t(`Yes. After the ${tk(-e.a)} bonus you would still hold about ${tk(p.b)}, above your safety level.`,`হ্যাঁ। ${tk(-e.a)} বোনাস দেওয়ার পরও প্রায় ${tk(p.b)} থাকবে, যা নিরাপদ সীমার ওপরে।`);
const gap=S.minbal-p.b,mo=Math.max(1,Math.round((parse(e.d)-new Date())/2592e6));
return t(`Tight. Balance after bonus would be ${tk(p.b)}, ${tk(gap)} below your safety level. Set aside ${tk(gap/mo)} a month, collect dues early, or ask a supplier for extra credit before Eid.`,`চাপ হবে। বোনাসের পর ব্যালেন্স ${tk(p.b)}, নিরাপদ সীমার ${tk(gap)} নিচে। প্রতি মাসে ${tk(gap/mo)} আলাদা রাখুন, আগেভাগে বাকি আদায় করুন বা ঈদের আগে সরবরাহকারীর কাছে অতিরিক্ত বাকি চান।`)}
if(/risk|danger|ঝুঁকি/.test(s)){const R=risks().filter(x=>x.s!=='i').slice(0,3);return R.length?R.map(x=>'• '+x.h+' '+x.f).join('<br>'):t('No high or medium risks found in your numbers. Keep records and review monthly.','আপনার হিসাবে উচ্চ বা মাঝারি ঝুঁকি পাওয়া যায়নি। হিসাব রাখুন ও প্রতি মাসে দেখুন।')}
if(/stress|what if|scenario|স্ট্রেস/.test(s)){const x=stressRows()[2];return t(`If sales fall 20%, your monthly profit becomes ${tk(x.net)} and your lowest cash in the next 8 months is ${tk(x.lo)}. Result: ${x.v==='ok'?'you can absorb it':x.v==='tight'?'tight, cash goes below your safety level':'dangerous, build a buffer or cut costs now'}. See the full table below.`,`বিক্রি ২০% কমলে মাসিক মুনাফা হবে ${tk(x.net)} এবং আগামী ৮ মাসে সর্বনিম্ন নগদ ${tk(x.lo)}। ফল: ${x.v==='ok'?'সামলানো সম্ভব':x.v==='tight'?'চাপ হবে, নগদ নিরাপদ সীমার নিচে যাবে':'বিপজ্জনক, এখনই নগদ জমান বা খরচ কমান'}। পুরো টেবিল নিচে দেখুন।`)}
if(/\bplan\b|future|next step|what should i do|roadmap|পরিকল্পনা|ভবিষ্যৎ|করণীয়/.test(s)){const P=plan();return t('Next 30 days:','আগামী ৩০ দিন:')+'<br>'+P[0].slice(0,3).map(x=>'• '+x).join('<br>')+'<br>'+t('Next 90 days:','আগামী ৯০ দিন:')+'<br>'+P[1].slice(0,2).map(x=>'• '+x).join('<br>')}
if(/grow|idea|improve|increase|suggest|বাড়া|পরামর্শ/.test(s)){const V=levers().slice(0,3);return V.length?t('Biggest levers for you: ','আপনার জন্য সবচেয়ে কার্যকর উপায়: ')+'<br>'+V.map(x=>'• '+x[0]+': '+(x[2]?tk(x[1])+t(' cash released once',' একবার নগদ মুক্ত'):'+'+tk(x[1])+t(' a month',' প্রতি মাসে'))).join('<br>'):t('Enter your sales and costs on the Overview tab first.','আগে সারসংক্ষেপ ট্যাবে বিক্রি ও খরচ দিন।')}
if(/loan|financ|fund|credit|ঋণ|লোন|টাকা ধার/.test(s)){const r=fin()[0];return t(`Best match: ${r.o.n[0]} (fit ${r.s}%). Estimated installment ${tk(r.e)}/month. ${r.bad.length?'Watch out: '+r.bad.join('; ')+'.':'No major blockers.'} See the Financing tab for more.`,`সেরা মিল: ${r.o.n[1]} (মিল ${bd(r.s)}%)। আনুমানিক কিস্তি ${tk(r.e)}/মাস। ${r.bad.length?'সতর্কতা: '+r.bad.join('; ')+'।':'বড় কোনো বাধা নেই।'} বিস্তারিত ফাইন্যান্সিং ট্যাবে দেখুন।`)}
if(/income tax|tax bill|tax estimate|how much tax|tax calc|আয়কর|কত কর|কর কত/.test(s)){const x=taxCalc(),v=vatCalc();return t(`Estimated income tax for 2026-27: ${tk(x.gross)} (${f1(x.eff*100)}% of your taxable profit of ${sh(x.T)}). Set aside about ${tk(x.mo)} a month. ${x.fl?'The 1% turnover-tax floor applies. ':''}${x.net<0?'Tax already paid exceeds this, so you have a credit.':'After tax already paid you owe '+tk(x.net)+'.'} Monthly VAT is about ${tk(Math.max(v.net,0))}. See the Tax tab for the breakdown, and confirm with your accountant.`,`২০২৬-২৭ এর আনুমানিক আয়কর: ${tk(x.gross)} (করযোগ্য মুনাফা ${sh(x.T)}-এর ${f1(x.eff*100)}%)। মাসে প্রায় ${tk(x.mo)} আলাদা রাখুন। ${x.fl?'১% টার্নওভার করের ন্যূনতম সীমা প্রযোজ্য। ':''}${x.net<0?'ইতিমধ্যে পরিশোধিত কর এর চেয়ে বেশি, তাই ক্রেডিট আছে।':'পরিশোধিত করের পর আপনাকে দিতে হবে '+tk(x.net)+'।'} মাসিক ভ্যাট প্রায় ${tk(Math.max(v.net,0))}। বিস্তারিত কর ট্যাবে দেখুন এবং হিসাবরক্ষকের কাছে নিশ্চিত করুন।`)}
if(/turnover|threshold|registration|startup|টার্নওভার|নিবন্ধন/.test(s))return t('Budget FY2026-27 brought a simplified turnover tax for small and retail businesses: a fixed amount by category and location, with no VAT returns. VAT registration is at ৳30 lakh yearly turnover and the budget proposed lowering it to ৳20 lakh, so confirm the final rule with NBR or your accountant. Registered startups and tech ventures get 0% turnover tax, and startup services are VAT-exempt until 2035.','২০২৬-২৭ বাজেটে ছোট ও খুচরা ব্যবসার জন্য সরল টার্নওভার কর এসেছে: ধরন ও এলাকা অনুযায়ী নির্দিষ্ট অঙ্ক, ভ্যাট রিটার্ন লাগবে না। ভ্যাট নিবন্ধন বছরে ৳৩০ লাখ টার্নওভারে, বাজেটে ৳২০ লাখে নামানোর প্রস্তাব ছিল, তাই চূড়ান্ত নিয়ম এনবিআর বা হিসাবরক্ষকের কাছে নিশ্চিত করুন। নিবন্ধিত স্টার্টআপ ও প্রযুক্তি উদ্যোগে টার্নওভার কর ০%, স্টার্টআপ সেবা ২০৩৫ পর্যন্ত ভ্যাটমুক্ত।');
if(/vat|tax|ভ্যাট|ট্যাক্স/.test(s)){const v=next15();return t(`VAT return and payment are due by the 15th of each month. Next: ${fd(v)}. Set aside about ${tk(S.vat)} each month in a separate account. Confirm rates and turnover-tax rules with your accountant.`,`ভ্যাট রিটার্ন ও পরিশোধ প্রতি মাসের ১৫ তারিখের মধ্যে। পরবর্তী: ${fd(v)}। প্রতি মাসে প্রায় ${tk(S.vat)} আলাদা অ্যাকাউন্টে রাখুন। হার ও টার্নওভার করের নিয়ম হিসাবরক্ষকের কাছে নিশ্চিত করুন।`)}
if(/due|receiv|collect|বাকি|পাওনা|আদায়/.test(s))return t(`Customers owe you ${tk(S.ar)} and pay in ${f1(m.dso)} days on average. Cutting that by 10 days releases about ${sh(S.rev/30*10)}. Send reminders on day 25 and offer 2% early-payment discounts to big buyers.`,`ক্রেতাদের কাছে আপনার পাওনা ${tk(S.ar)}, গড়ে ${f1(m.dso)} দিনে পরিশোধ করেন। ১০ দিন কমালে প্রায় ${sh(S.rev/30*10)} নগদ মুক্ত হবে। ২৫তম দিনে তাগাদা দিন এবং বড় ক্রেতাকে আগাম পরিশোধে ২% ছাড় দিন।`);
if(/profit|margin|মুনাফা|লাভ/.test(s))return t(`Gross margin ${f1(m.gm*100)}%, net margin ${f1(m.nm*100)}%. Net profit is ${tk(m.net)} a month after installments. ${tips(m)[0]}`,`মোট মুনাফার হার ${f1(m.gm*100)}%, নিট ${f1(m.nm*100)}%। কিস্তির পর মাসিক নিট মুনাফা ${tk(m.net)}। ${tips(m)[0]}`);
if(/cash|runway|alert|নগদ|সতর্ক/.test(s))return alerts(F,m).map(a=>'• '+a[1]).join('<br>');
return t('Try asking about: risks, stress test, next steps, ideas to grow, Eid bonus, loans, VAT, customer dues, profit, or cash alerts.','জিজ্ঞাসা করুন: ঝুঁকি, স্ট্রেস টেস্ট, পরবর্তী করণীয়, মুনাফা বাড়ানো, ঈদ বোনাস, ঋণ, ভ্যাট, বাকি পাওনা, মুনাফা বা নগদ সতর্কতা।')}
const C=[];
function say(q){q=q.trim();if(!q)return;C.push(['u',q],['a',ask(q)]);chat()}
function chat(){$('#chat').innerHTML=C.map(x=>`<div class="m ${x[0]}">${x[0]==='u'?x[1].replace(/</g,'&lt;'):x[1]}</div>`).join('');}
let TOP=[];
const TW={
trade:[['Slow-moving stock ties up cash and can spoil or go out of season.','ধীরগতির পণ্য নগদ আটকে রাখে এবং নষ্ট বা মৌসুম-বহির্ভূত হতে পারে।'],['Credit sales (baki) can turn into bad debts. Set a credit limit for each customer.','বাকিতে বিক্রি খারাপ ঋণে পরিণত হতে পারে। প্রতি ক্রেতার জন্য বাকির সীমা ঠিক করুন।'],['Supplier price swings squeeze your margin. Review selling prices every month.','সরবরাহকারীর দামের ওঠানামা মুনাফা কমায়। প্রতি মাসে বিক্রয়মূল্য পর্যালোচনা করুন।']],
mfg:[['Raw-material price jumps and supply gaps can stop production. Keep a second supplier.','কাঁচামালের দাম বৃদ্ধি ও সরবরাহ সংকটে উৎপাদন থেমে যেতে পারে। দ্বিতীয় সরবরাহকারী রাখুন।'],['Power or gas interruptions and machine breakdowns cut output. Budget for maintenance.','বিদ্যুৎ বা গ্যাসের বিঘ্ন ও যন্ত্র বিকল হলে উৎপাদন কমে। রক্ষণাবেক্ষণের বাজেট রাখুন।'],['Depending on one big buyer is risky. Aim to grow other customers.','একজন বড় ক্রেতার ওপর নির্ভরতা ঝুঁকিপূর্ণ। অন্য ক্রেতা বাড়ান।']],
svc:[['Relying on a few clients or one key person is risky. Spread the work.','অল্প কয়েকজন ক্লায়েন্ট বা একজন মূল ব্যক্তির ওপর নির্ভরতা ঝুঁকিপূর্ণ। কাজ ছড়িয়ে দিন।'],['Late client payments hurt most when wages are due on time. Ask for advance or milestone payments.','বেতন সময়মতো দিতে হলে ক্লায়েন্টের দেরিতে পরিশোধ বেশি ক্ষতি করে। অগ্রিম বা ধাপে ধাপে পেমেন্ট চান।'],['Underpricing your time hides losses. Track the cost of each job.','সময়ের কম দাম ধরলে লোকসান ঢাকা পড়ে। প্রতিটি কাজের খরচ হিসাব করুন।']],
agro:[['Weather, floods and disease can wipe out a season. Spread crops or locations, and keep a reserve.','আবহাওয়া, বন্যা ও রোগে পুরো মৌসুম নষ্ট হতে পারে। ফসল বা স্থান ভাগ করুন এবং রিজার্ভ রাখুন।'],['Prices often fall at harvest and rise later. Storage and cold chain help you wait.','ফসল তোলার সময় দাম কমে, পরে বাড়ে। সংরক্ষণ ও কোল্ড চেইন অপেক্ষা করতে সাহায্য করে।'],['Perishable goods lose value fast. Match production to confirmed orders.','পচনশীল পণ্যের মূল্য দ্রুত কমে। নিশ্চিত অর্ডারের সাথে মিলিয়ে উৎপাদন করুন।']],
rmg:[['Buyer concentration and order cancellations are a major risk. Aim for several buyers.','একক ক্রেতা নির্ভরতা ও অর্ডার বাতিল বড় ঝুঁকি। একাধিক ক্রেতা রাখুন।'],['Taka-dollar swings and LC timing change your real margin. Plan for both.','টাকা-ডলারের ওঠানামা ও এলসির সময় প্রকৃত মুনাফা বদলে দেয়। দুটিই হিসাবে রাখুন।'],['Wages and Eid bonuses are due even if orders slow. Keep a wage reserve.','অর্ডার কমলেও বেতন ও ঈদ বোনাস দিতে হয়। বেতনের রিজার্ভ রাখুন।']],
tech:[['Cash-on-delivery returns and slow payment gateways delay your cash. Track them weekly.','ক্যাশ অন ডেলিভারিতে ফেরত ও পেমেন্ট গেটওয়ের দেরি নগদ আটকায়। সাপ্তাহিক হিসাব রাখুন।'],['Relying on one platform (Facebook, marketplace) is risky. Build your own customer list.','একটি প্ল্যাটফর্মের ওপর নির্ভরতা (ফেসবুক, মার্কেটপ্লেস) ঝুঁকিপূর্ণ। নিজস্ব ক্রেতার তালিকা গড়ুন।'],['Ad spend that does not pay back burns cash. Measure the return on each campaign.','যে বিজ্ঞাপনের খরচ উঠে আসে না তা নগদ পোড়ায়। প্রতিটি ক্যাম্পেইনের ফল মাপুন।']]};

function risks(){const m=M(),F=fc(240),R=[],fx=S.opex+S.emi,ad=(s,a,b,c,d)=>R.push({s,h:t(a,b),f:t(c,d)});
const neg=F.find(x=>x.b<0),low=F.find(x=>x.b<S.minbal);
if(neg)ad('r',`Cash is forecast to run out around ${fd(neg.d)}.`,`${fd(neg.d)} নাগাদ নগদ শেষ হওয়ার পূর্বাভাস।`,'Collect dues now, delay non-urgent purchases and ask suppliers for longer credit. Arrange short-term working capital before that date, not after it.','এখনই বাকি আদায় করুন, জরুরি নয় এমন কেনা পিছান, সরবরাহকারীর কাছে বেশি বাকির সময় চান। ওই তারিখের আগেই স্বল্পমেয়াদি চলতি মূলধনের ব্যবস্থা করুন।');
else if(low)ad('w',`Cash dips below your ${sh(S.minbal)} safety level around ${fd(low.d)}.`,`${fd(low.d)} নাগাদ নগদ আপনার ${sh(S.minbal)} নিরাপদ সীমার নিচে নামবে।`,'Plan collections and payments around that date, or arrange a small working-capital limit in advance.','ওই তারিখ ঘিরে আদায় ও পরিশোধের পরিকল্পনা করুন, অথবা আগে থেকে ছোট চলতি মূলধন সীমা ঠিক রাখুন।');
if(m.cover<1)ad('r',`Cash covers only ${f1(m.cover)} months of fixed costs.`,`নগদে নির্ধারিত খরচ চলবে মাত্র ${f1(m.cover)} মাস।`,'Build a buffer of 2 to 3 months of fixed costs. Start by collecting dues and trimming costs.','২ থেকে ৩ মাসের নির্ধারিত খরচের সমান নগদ জমান। শুরুতে বাকি আদায় ও খরচ কমান।');
else if(m.cover<2)ad('w',`Cash covers only ${f1(m.cover)} months of fixed costs.`,`নগদে নির্ধারিত খরচ চলবে মাত্র ${f1(m.cover)} মাস।`,'Aim for at least 2 to 3 months of fixed costs in reserve.','কমপক্ষে ২ থেকে ৩ মাসের নির্ধারিত খরচ রিজার্ভ রাখুন।');
if(m.gm<=0)ad('r','Your gross margin is zero or negative, so every sale loses money.','মোট মুনাফা শূন্য বা ঋণাত্মক, তাই প্রতিটি বিক্রিতে লোকসান।','Raise prices or cut the cost of goods before anything else.','সবার আগে দাম বাড়ান বা পণ্যের খরচ কমান।');
else{const be=fx/m.gm,ms=S.rev?(S.rev-be)/S.rev:-1;if(ms<.25)ad(ms<0?'r':ms<.15?'w':'i',`Break-even sales are ${sh(be)} a month. Your sales are ${f1(Math.abs(ms)*100)}% ${ms<0?'below':'above'} it.`,`ব্রেক-ইভেন বিক্রি মাসে ${sh(be)}। আপনার বিক্রি তার ${f1(Math.abs(ms)*100)}% ${ms<0?'নিচে':'ওপরে'}।`,'Raise margin or cut fixed costs to widen this cushion.','মুনাফার হার বাড়ান বা নির্ধারিত খরচ কমিয়ে এই নিরাপত্তা-ব্যবধান বাড়ান।')}
if(S.emi>0){if(m.dscr<1)ad('r',`Operating profit (${sh(m.op)}) does not cover loan installments (${sh(S.emi)}).`,`পরিচালন মুনাফা (${sh(m.op)}) ঋণের কিস্তি (${sh(S.emi)}) মেটাতে পারছে না।`,'Do not take new debt. Talk to your lender early about rescheduling, and cut costs.','নতুন ঋণ নেবেন না। আগেভাগে ঋণদাতার সাথে কিস্তি পুনর্গঠন নিয়ে কথা বলুন এবং খরচ কমান।');else if(m.dscr<1.25)ad('w',`Installments use most of your operating profit (cover ${f1(m.dscr)}x).`,`কিস্তিতে পরিচালন মুনাফার বড় অংশ যাচ্ছে (কভার ${f1(m.dscr)}x)।`,'Avoid new debt until cover is above 1.25x.','কভার ১.২৫x-এর ওপরে না যাওয়া পর্যন্ত নতুন ঋণ এড়ান।')}
if(m.dso>60)ad('r',`Customers take ${f1(m.dso)} days to pay.`,`ক্রেতারা টাকা দিতে ${f1(m.dso)} দিন নেন।`,'Set credit limits, send reminders and offer a small discount for early payment.','বাকির সীমা ঠিক করুন, তাগাদা দিন এবং আগাম পরিশোধে সামান্য ছাড় দিন।');
else if(m.dso>45)ad('w',`Customers take ${f1(m.dso)} days to pay.`,`ক্রেতারা টাকা দিতে ${f1(m.dso)} দিন নেন।`,'Send reminders earlier and follow up on every overdue amount.','আগে থেকে তাগাদা দিন এবং প্রতিটি বকেয়ার খোঁজ নিন।');
if(S.type!=='svc'&&m.dio>60)ad(m.dio>90?'r':'w',`Stock sits for ${f1(m.dio)} days on average.`,`মজুত গড়ে ${f1(m.dio)} দিন পড়ে থাকে।`,'Run offers on slow items and order smaller batches more often.','ধীরগতির পণ্যে অফার দিন এবং ছোট ব্যাচে ঘন ঘন অর্ডার করুন।');
if(m.net<0)ad('r',`You lose ${tk(-m.net)} a month after loan installments.`,`কিস্তির পর প্রতি মাসে ${tk(-m.net)} লোকসান হচ্ছে।`,'Find the biggest cost line and cut or renegotiate it this month.','সবচেয়ে বড় খরচের খাত খুঁজে এই মাসেই কমান বা পুনরায় দর কষুন।');
else if(m.gm>0&&m.gm<.15)ad('w',`Gross margin is thin at ${f1(m.gm*100)}%.`,`মোট মুনাফার হার কম, ${f1(m.gm*100)}%।`,'Review prices and supplier rates. Small price rises matter a lot at thin margins.','দাম ও সরবরাহকারীর হার দেখুন। কম মার্জিনে ছোট দাম বৃদ্ধিও বড় প্রভাব ফেলে।');
if(S.rev&&S.opex/S.rev>.3)ad('w',`Fixed costs are ${f1(S.opex/S.rev*100)}% of sales.`,`নির্ধারিত খরচ বিক্রির ${f1(S.opex/S.rev*100)}%।`,'High fixed costs hurt most when sales dip. Review rent, staff and utilities.','বিক্রি কমলে উচ্চ নির্ধারিত খরচ সবচেয়ে বেশি ক্ষতি করে। ভাড়া, কর্মী ও বিল পর্যালোচনা করুন।');
if(!S.tl)ad('w','No valid trade license.','হালনাগাদ ট্রেড লাইসেন্স নেই।','A trade license is needed to operate legally and for most bank and refinance loans. Renew or apply through your city corporation or union parishad.','বৈধভাবে ব্যবসা চালাতে ও বেশিরভাগ ব্যাংক ও পুনঃঅর্থায়ন ঋণের জন্য ট্রেড লাইসেন্স লাগে। সিটি কর্পোরেশন বা ইউনিয়ন পরিষদে নবায়ন বা আবেদন করুন।');
if(!S.tin)ad('w','No TIN certificate.','টিআইএন সনদ নেই।','Banks usually ask for a TIN for business loans. Register online with the NBR and file your return.','ব্যবসায়িক ঋণে ব্যাংক সাধারণত টিআইএন চায়। এনবিআরে অনলাইনে নিবন্ধন করুন ও রিটার্ন দিন।');
const yr=S.rev*12;if(yr>=2e6)ad('i',`Yearly sales of about ${sh(yr)} are near or above the ৳30 lakh VAT registration level (the budget proposed ৳20 lakh).`,`বছরে প্রায় ${sh(yr)} বিক্রি ভ্যাট নিবন্ধনের ৳৩০ লাখ সীমার কাছাকাছি বা ওপরে (বাজেটে ৳২০ লাখের প্রস্তাব ছিল)।`,'Confirm with NBR or your accountant whether you must register for VAT or use the simplified turnover tax.','ভ্যাট নিবন্ধন বা সরল টার্নওভার কর লাগবে কিনা এনবিআর বা হিসাবরক্ষকের কাছে নিশ্চিত করুন।');
ad('i','A defaulted loan or overdue installment spoils your CIB record.','খেলাপি ঋণ বা বকেয়া কিস্তি সিআইবি রেকর্ড নষ্ট করে।','CIB-classified borrowers cannot use the new CMSME refinance fund. Pay every installment on time.','সিআইবি-শ্রেণিকৃত ঋণগ্রহীতা নতুন সিএমএসএমই পুনঃঅর্থায়ন তহবিল পান না। প্রতিটি কিস্তি সময়মতো দিন।');
const o={r:0,w:1,i:2};return R.sort((a,b)=>o[a.s]-o[b.s])}

function stressRows(){const sc=[[t('Today','আজকের অবস্থা'),{}],[t('Sales fall 10%','বিক্রি ১০% কমে'),{rev:S.rev*.9,cogs:S.cogs*.9}],[t('Sales fall 20%','বিক্রি ২০% কমে'),{rev:S.rev*.8,cogs:S.cogs*.8}],[t('Sales fall 30%','বিক্রি ৩০% কমে'),{rev:S.rev*.7,cogs:S.cogs*.7}],[t('Material costs rise 10%','মালের খরচ ১০% বাড়ে'),{cogs:S.cogs*1.1}],[t('Rent, wages, utilities rise 10%','ভাড়া, বেতন, বিল ১০% বাড়ে'),{opex:S.opex*1.1}],[t('Customers pay 15 days late','ক্রেতা ১৫ দিন দেরিতে দেন'),{},[{d:addD(1),l:'',a:-S.rev/30*15}]]];
return sc.map(x=>{const o=S;S=Object.assign({},o,x[1]);if(x[2])S.ev=o.ev.concat(x[2]);const m=M(),F=fc(240),lo=Math.min(...F.map(y=>y.b));S=o;return{n:x[0],net:m.net,lo,v:lo<0||m.net<0?'bad':lo<S.minbal?'tight':'ok'}})}

function levers(){return[[t('Raise prices 2% (sales volume holds)','দাম ২% বাড়ান (বিক্রির পরিমাণ একই থাকলে)'),S.rev*.02,0],[t('Cut material cost 3% through better buying','ভালো দামে কিনে মালের খরচ ৩% কমান'),S.cogs*.03,0],[t('Cut rent, utilities and overheads 5%','ভাড়া, বিল ও ওভারহেড ৫% কমান'),S.opex*.05,0],[t('Collect from customers 10 days sooner','ক্রেতার কাছ থেকে ১০ দিন আগে আদায় করুন'),S.rev/30*10,1],[t('Sell down 20% of slow stock','ধীরগতির মজুতের ২০% বিক্রি করুন'),S.inv*.2,1],[t('Get 10 more days credit from suppliers','সরবরাহকারীর কাছে ১০ দিন বেশি বাকি নিন'),S.cogs/30*10,1]].filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1])}

function plan(){const m=M(),buf=(S.opex+S.emi)*3,gap=Math.max(0,buf-S.cash),top=TOP[0],nu=new Date(),
bon=S.ev.filter(e=>/eid|ঈদ/i.test(e.l)&&e.a<0&&parse(e.d)>nu).reduce((a,e)=>a-e.a,0),miss=[!S.tl&&t('trade license','ট্রেড লাইসেন্স'),!S.tin&&t('TIN','টিআইএন')].filter(Boolean).join(t(' and ',' ও '));
const A=[t('Record every sale and expense daily. Banks ask for 6 to 12 months of bank or bKash/Nagad statements.','প্রতিদিন প্রতিটি বিক্রি ও খরচ লিখুন। ব্যাংক ৬ থেকে ১২ মাসের ব্যাংক বা বিকাশ/নগদ স্টেটমেন্ট চায়।')],B=[],C2=[];
if(S.ar>0)A.push(t(`Chase the ${tk(S.ar)} customers owe you. Collecting just a quarter releases ${sh(S.ar/4)}.`,`ক্রেতাদের কাছে পাওনা ${tk(S.ar)} আদায়ে নামুন। এক-চতুর্থাংশ আদায় হলেই ${sh(S.ar/4)} নগদ মুক্ত হবে।`));
if(S.vat>0)A.push(t(`Set aside ${tk(S.vat)} for VAT before the 15th of each month.`,`প্রতি মাসের ১৫ তারিখের আগে ভ্যাটের জন্য ${tk(S.vat)} আলাদা রাখুন।`));
{const x=taxCalc();if(x.gross>0)A.push(t(`Set aside about ${tk(x.mo)} a month for income tax (estimate ${tk(x.gross)} for the year). See the Tax tab.`,`আয়করের জন্য মাসে প্রায় ${tk(x.mo)} আলাদা রাখুন (বছরে আনুমানিক ${tk(x.gross)})। কর ট্যাব দেখুন।`))}
if(miss)A.push(t(`Get your ${miss}. You need it for formal loans.`,`আপনার ${miss} করে নিন। আনুষ্ঠানিক ঋণের জন্য লাগবে।`));
A.push(t('Check that no installment is overdue, so your CIB record stays clean.','কোনো কিস্তি বকেয়া নেই কিনা দেখুন, যাতে সিআইবি রেকর্ড পরিষ্কার থাকে।'));
if(gap>0)B.push(t(`Start a cash reserve: target ${sh(buf)} (3 months of fixed costs), you are ${sh(gap)} short. Save about ${sh(gap/12)} a month to get there in a year.`,`নগদ রিজার্ভ শুরু করুন: লক্ষ্য ${sh(buf)} (৩ মাসের নির্ধারিত খরচ), ঘাটতি ${sh(gap)}। এক বছরে পৌঁছাতে মাসে প্রায় ${sh(gap/12)} জমান।`));
if(S.cogs>0)B.push(t(`Ask suppliers for 10 more days of credit. That alone frees about ${sh(S.cogs/30*10)}.`,`সরবরাহকারীর কাছে ১০ দিন বেশি বাকি চান। এতেই প্রায় ${sh(S.cogs/30*10)} মুক্ত হবে।`));
if(top&&top.s>=60)B.push(t(`If you need funds, start with: ${top.o.n[0]} (fit ${top.s}%). Check the Financing tab for what to prepare.`,`তহবিল লাগলে শুরু করুন: ${top.o.n[1]} (মিল ${bd(top.s)}%)। কী প্রস্তুত করবেন তা ফাইন্যান্সিং ট্যাবে দেখুন।`));
if(bon>0)B.push(t(`Keep ${sh(bon)} ready for Eid bonuses (Eid-ul-Fitr is expected around 10 Mar 2027).`,`ঈদ বোনাসের জন্য ${sh(bon)} প্রস্তুত রাখুন (ঈদুল ফিতর ১০ মার্চ ২০২৭ নাগাদ প্রত্যাশিত)।`));
if(m.gm<.2)B.push(t('Review prices and supplier rates to lift your gross margin above 20%.','মোট মুনাফার হার ২০%-এর ওপরে তুলতে দাম ও সরবরাহকারীর হার পর্যালোচনা করুন।'));
C2.push(gap>0?t(`Reach your cash reserve of ${sh(buf)}.`,`${sh(buf)} নগদ রিজার্ভে পৌঁছান।`):t('Keep your cash reserve at 3 months of fixed costs.','নগদ রিজার্ভ ৩ মাসের নির্ধারিত খরচের সমান রাখুন।'));
C2.push(t('Collect old dues before Pohela Boishakh (14 April 2027), when Haal Khata accounts are settled.','হালখাতার হিসাব মেটানোর পহেলা বৈশাখের (১৪ এপ্রিল ২০২৭) আগে পুরনো বাকি আদায় করুন।'));
C2.push(t('As a rule of thumb, avoid depending on one customer or supplier for more than about 30% of your business.','সাধারণ নিয়ম হিসেবে, একজন ক্রেতা বা সরবরাহকারীর ওপর ব্যবসার ৩০%-এর বেশি নির্ভর না করার চেষ্টা করুন।'));
C2.push(m.dscr>=1.5&&m.cover>=2?t('Your cover and reserve are healthy, so you can consider borrowing to grow.','আপনার কভার ও রিজার্ভ ভালো, তাই বাড়তে ঋণ নেওয়ার কথা ভাবতে পারেন।'):t('Fix cash cover and debt cover first. Borrow to grow only once cover is above 1.5x and cash covers 2 months.','আগে নগদ ও ঋণ কভার ঠিক করুন। কভার ১.৫x-এর ওপরে ও নগদ ২ মাস চলার মতো হলে তবেই বাড়তে ঋণ নিন।'));
C2.push(t('Update your numbers every month and review this plan every quarter.','প্রতি মাসে হিসাব হালনাগাদ করুন এবং প্রতি তিন মাসে এই পরিকল্পনা দেখুন।'));
return[A,B,C2]}

function rk(){const R=risks(),nr=R.filter(x=>x.s==='r').length,nw=R.filter(x=>x.s==='w').length,lv=nr?'r':nw>=2?'w':'i',lab={r:t('High','উচ্চ'),w:t('Medium','মাঝারি'),i:t('Info','তথ্য')},P=plan(),SR=stressRows(),V=levers(),tw=(TW[S.type]||[]).map(x=>`<li>${x[L==='bn'?1:0]}</li>`).join('');
const ul=a=>`<ul>${a.map(x=>`<li>${x}</li>`).join('')}</ul>`;
$('#rk').innerHTML=`<div class="c"><h2>${t('Risk check','ঝুঁকি যাচাই')}: <span class="pill ${lv==='r'?'hi':lv==='w'?'lo':''}">${lv==='r'?t('High risk','উচ্চ ঝুঁকি'):lv==='w'?t('Medium risk','মাঝারি ঝুঁকি'):t('Low risk','নিম্ন ঝুঁকি')}</span></h2>
${R.map(x=>`<div class="al ${x.s}"><b>${lab[x.s]}:</b> ${x.h}<br><span class="mut">${t('What to do','করণীয়')}: ${x.f}</span></div>`).join('')}
<p class="mut">${t('These checks use only the numbers you entered.','এই যাচাই শুধু আপনার দেওয়া সংখ্যা থেকে করা।')}</p></div>
<div class="c"><h2>${t('Stress test','স্ট্রেস টেস্ট')}</h2><div class="sx"><table><tr><th>${t('Scenario','পরিস্থিতি')}</th><th>${t('Profit / month','মাসিক মুনাফা')}</th><th>${t('Lowest cash (8 months)','সর্বনিম্ন নগদ (৮ মাস)')}</th><th></th></tr>
${SR.map(x=>`<tr><td>${x.n}</td><td class="${x.net<0?'neg':''}">${tk(x.net)}</td><td class="${x.lo<0?'neg':''}">${tk(x.lo)}</td><td><span class="pill ${x.v==='ok'?'':x.v==='tight'?'lo':'hi'}">${x.v==='ok'?t('Safe','নিরাপদ'):x.v==='tight'?t('Tight','চাপ'):t('Danger','বিপদ')}</span></td></tr>`).join('')}</table></div>
<p class="mut">${t('Cost of goods moves with sales in the sales-fall cases. Tight means cash dips below your safety level.','বিক্রি কমার ক্ষেত্রে মালের খরচও বিক্রির সাথে কমে ধরা হয়েছে। চাপ মানে নগদ নিরাপদ সীমার নিচে নামে।')}</p></div>
<div class="c"><h2>${t('Ways to improve cash and profit','নগদ ও মুনাফা বাড়ানোর উপায়')}</h2>${V.length?`<table>${V.map(x=>`<tr><td>${x[0]}</td><td class="pos">${x[2]?tk(x[1])+t(' cash released once',' একবার নগদ মুক্ত'):'+'+tk(x[1])+t(' a month',' প্রতি মাসে')}</td></tr>`).join('')}</table>`:`<p class="mut">${t('Enter your sales and costs first.','আগে বিক্রি ও খরচ দিন।')}</p>`}</div>
<div class="c"><h2>${t('Your action plan','আপনার কর্মপরিকল্পনা')}</h2><h3 style="font-size:15px;margin:6px 0 0">${t('Next 30 days','আগামী ৩০ দিন')}</h3>${ul(P[0])}<h3 style="font-size:15px;margin:6px 0 0">${t('Next 90 days','আগামী ৯০ দিন')}</h3>${ul(P[1])}<h3 style="font-size:15px;margin:6px 0 0">${t('Next 12 months','আগামী ১২ মাস')}</h3>${ul(P[2])}</div>
<div class="c"><h2>${t('Watch-outs for your type of business','আপনার ব্যবসার ধরনের সতর্কতা')}</h2><ul>${tw}</ul><p class="mut">${t('General good practice, not a forecast.','সাধারণ ভালো চর্চা, কোনো পূর্বাভাস নয়।')}</p></div>`}
// ---------- Backup, restore and saved versions ----------
const SNAPK='bdsnap',SNAPMAX=7,BKAPP='fahad-sme-copilot',TE=new TextEncoder(),TD=new TextDecoder();
const b64=u=>{let s='';u.forEach(c=>{s+=String.fromCharCode(c)});return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function kdf(p,salt,it){const k=await globalThis.crypto.subtle.importKey('raw',TE.encode(p),'PBKDF2',false,['deriveKey']);return globalThis.crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:it,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
function snaps(){try{const a=JSON.parse(localStorage.getItem(SNAPK)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function snap(w,force){try{const a=snaps(),n=Date.now();if(!force&&a.length&&n-a[0].t<864e5)return;a.unshift({t:n,w,d:JSON.parse(JSON.stringify(S))});localStorage.setItem(SNAPK,JSON.stringify(a.slice(0,SNAPMAX)))}catch(e){}}
// Validates and sanitises any data that comes from outside (backup file, pasted code, stored snapshot).
function clean(r){if(!r||typeof r!=='object'||Array.isArray(r))throw new Error('format');const o=DEF(),B=1e12;
['rev','cogs','opex','emi','cash','ar','ap','inv','vat','minbal','need','intr','dep','invest','ait','vinp','vfix'].forEach(k=>{if(r[k]!==undefined&&r[k]!==null&&r[k]!==''){const v=+r[k];if(Number.isFinite(v))o[k]=Math.min(Math.max(v,-B),B)}});
if(Number.isFinite(+r.years)&&r.years!==null)o.years=Math.min(Math.max(+r.years,0),200);
if(Number.isFinite(+r.tenor)&&r.tenor!==null)o.tenor=Math.min(Math.max(Math.round(+r.tenor),1),360);
if(typeof r.name==='string')o.name=r.name.slice(0,80);
if(TY.some(x=>x[0]===r.type))o.type=r.type;
if(PU.some(x=>x[0]===r.purpose))o.purpose=r.purpose;
['tl','tin','coll','woman','ntp','bank','tfloor'].forEach(k=>{if(typeof r[k]==='boolean')o[k]=r[k]});
if(LG.some(x=>x[0]===r.legal))o.legal=r.legal;if(CT.some(x=>x[0]===r.cat))o.cat=r.cat;if(VM.some(x=>x[0]===r.vmode))o.vmode=r.vmode;
if(r.vrate!==null&&r.vrate!==''&&Number.isFinite(+r.vrate))o.vrate=Math.min(Math.max(+r.vrate,0),100);
if(Array.isArray(r.ev))o.ev=r.ev.filter(e=>e&&typeof e==='object'&&/^\d{4}-\d{2}-\d{2}$/.test(e.d)&&!isNaN(Date.parse(e.d+'T12:00:00'))&&Number.isFinite(+e.a)&&Math.abs(+e.a)<=B).slice(0,100).map(e=>({d:e.d,l:String(e.l==null?'':e.l).slice(0,80),a:+e.a}));
o.v=2;return o}
async function bkExport(pass){const body={app:BKAPP,schema:2,exported:new Date().toISOString()};
if(!pass){body.data=JSON.parse(JSON.stringify(S));return JSON.stringify(body,null,1)}
const CR=globalThis.crypto;if(!(CR&&CR.subtle))throw new Error('nocrypto');
const salt=CR.getRandomValues(new Uint8Array(16)),iv=CR.getRandomValues(new Uint8Array(12)),it=600000;
const ct=await CR.subtle.encrypt({name:'AES-GCM',iv},await kdf(pass,salt,it),TE.encode(JSON.stringify(S)));
body.enc={alg:'AES-GCM',kdf:'PBKDF2-SHA256',iter:it,salt:b64(salt),iv:b64(iv)};body.ct=b64(new Uint8Array(ct));return JSON.stringify(body,null,1)}
async function bkImport(text,pass){if(typeof text!=='string'||text.length>2e5)throw new Error('big');let b;try{b=JSON.parse(text)}catch(e){throw new Error('format')}
if(!b||typeof b!=='object'||b.app!==BKAPP)throw new Error('format');if(b.schema!==2)throw new Error('version');
if(!b.enc){if(!b.data)throw new Error('format');return clean(b.data)}
if(!pass)throw new Error('needpass');
const e=b.enc,it=+e.iter;if(e.alg!=='AES-GCM'||e.kdf!=='PBKDF2-SHA256'||!Number.isInteger(it)||it<1e5||it>1e6||typeof e.salt!=='string'||typeof e.iv!=='string'||typeof b.ct!=='string')throw new Error('format');
const CR=globalThis.crypto;if(!(CR&&CR.subtle))throw new Error('nocrypto');
let pt;try{pt=await CR.subtle.decrypt({name:'AES-GCM',iv:unb64(e.iv)},await kdf(pass,unb64(e.salt),it),unb64(b.ct))}catch(x){throw new Error('badpass')}
let d;try{d=JSON.parse(TD.decode(pt))}catch(x){throw new Error('format')}return clean(d)}
const BKE={format:['This is not a valid Fahad SME Copilot backup.','এটি বৈধ ফাহাদ এসএমই কোপাইলট ব্যাকআপ নয়।'],version:['This backup is from a newer or unknown version.','এই ব্যাকআপ নতুন বা অজানা সংস্করণের।'],needpass:['This backup is locked. Enter its passphrase first.','এই ব্যাকআপ লক করা। আগে পাসফ্রেজ দিন।'],badpass:['Wrong passphrase, or the backup was changed.','পাসফ্রেজ ভুল, অথবা ব্যাকআপ পরিবর্তিত হয়েছে।'],nocrypto:['Locking needs a secure (https) page. Clear the passphrase to save an unlocked backup.','লক করতে নিরাপদ (https) পেজ লাগবে। লকবিহীন ব্যাকআপের জন্য পাসফ্রেজ মুছুন।'],big:['That file or code is too large.','ফাইল বা কোড অনেক বড়।']};
const bke=e=>{const m=BKE[e&&e.message];return m?t(m[0],m[1]):t('Something went wrong. Please try again.','কিছু ভুল হয়েছে। আবার চেষ্টা করুন।')};
function bmsg(k,s){const m=$('#bkmsg');m.textContent=s;m.className=k==='err'?'neg':'pos'}
const OKR=()=>t('Restored. Your previous data is saved under Saved versions.','পুনরুদ্ধার হয়েছে। আগের তথ্য "সংরক্ষিত সংস্করণে" রাখা আছে।');
async function doRestore(text,pass){const n=await bkImport(text,pass);snap('restore',true);S=n;save();lang();bmsg('ok',OKR())}
function snapRestore(i){const a=snaps();if(!a[i])return false;try{const n=clean(a[i].d);snap('restore',true);S=n;save();lang();bmsg('ok',OKR());return true}catch(e){return false}}
function snapList(){const a=snaps(),W={auto:t('Automatic','স্বয়ংক্রিয়'),manual:t('Saved by you','আপনার সংরক্ষণ'),reset:t('Before reset','রিসেটের আগে'),restore:t('Before restore','পুনরুদ্ধারের আগে')};
$('#bklist').innerHTML=a.length?`<p class="mut">${t('Date · Type · Sales / Cash','তারিখ · ধরন · বিক্রি / নগদ')}</p><table>${a.map((x,i)=>{const d=x.d||{};return`<tr><td>${esc(new Date(x.t).toLocaleString(L==='bn'?'bn-BD':'en-GB',{dateStyle:'medium',timeStyle:'short'}))}</td><td>${esc(W[x.w]||x.w)}</td><td>${sh(+d.rev||0)} / ${sh(+d.cash||0)}</td><td><button class="b" data-i="${i}">${t('Restore','ফিরিয়ে আনুন')}</button></td></tr>`}).join('')}</table>`:`<p class="mut">${t('No saved versions yet.','এখনো কোনো সংরক্ষিত সংস্করণ নেই।')}</p>`;
document.querySelectorAll('#bklist button').forEach(b=>{b.onclick=()=>snapRestore(+b.dataset.i)})}
function bkUI(){$('#bkbox').innerHTML=`<div class="c"><h2>${t('Backup and restore','ব্যাকআপ ও পুনরুদ্ধার')}</h2>
<p class="mut">${t('Your data is stored only on this device. Save a backup so you can restore it on a new phone, after clearing the browser, or if you lose the device.','আপনার তথ্য শুধু এই ডিভাইসে থাকে। নতুন ফোনে, ব্রাউজার পরিষ্কার করার পর বা ডিভাইস হারালে ফিরিয়ে আনতে ব্যাকআপ সংরক্ষণ করুন।')}</p>
<label>${t('Passphrase (locks a backup, and opens a locked one). Keep it safe: it cannot be recovered.','পাসফ্রেজ (ব্যাকআপ লক করে ও খোলে)। নিরাপদে রাখুন: ফেরত পাওয়া যায় না।')}<input type="password" id="bkpass" autocomplete="new-password"></label>
<div class="ch"><button class="b pri" id="bkdl">${t('Download backup file','ব্যাকআপ ফাইল ডাউনলোড')}</button><button class="b" id="bkshow">${t('Show backup code','ব্যাকআপ কোড দেখান')}</button></div>
<p class="mut">${t('If the file does not download on your device, use "Show backup code" and copy it.','ফাইল ডাউনলোড না হলে "ব্যাকআপ কোড দেখান" চেপে কপি করুন।')}</p>
<label>${t('Backup code: copy it to save, or paste a saved code here to restore','ব্যাকআপ কোড: সংরক্ষণে কপি করুন, পুনরুদ্ধারে সংরক্ষিত কোড এখানে পেস্ট করুন')}<textarea id="bktxt" rows="4" spellcheck="false" style="font-family:monospace;font-size:12px"></textarea></label>
<label>${t('Or choose a backup file','অথবা ব্যাকআপ ফাইল বাছুন')}<input type="file" id="bkfile" accept=".json,application/json"></label>
<div class="ch"><button class="b pri" id="bkrestore">${t('Restore from this code','এই কোড থেকে পুনরুদ্ধার')}</button></div>
<div id="bkmsg" role="status" class="mut"></div>
<h2 style="margin-top:14px">${t('Saved versions on this device','এই ডিভাইসে সংরক্ষিত সংস্করণ')}</h2>
<p class="mut">${t('The app keeps up to 7 versions automatically (about one a day, and before every reset or restore) so you can undo a mistake.','অ্যাপ স্বয়ংক্রিয়ভাবে সর্বোচ্চ ৭টি সংস্করণ রাখে (দিনে প্রায় একটি, এবং প্রতিটি রিসেট বা পুনরুদ্ধারের আগে) যাতে ভুল ফেরানো যায়।')}</p>
<div class="ch"><button class="b" id="bksave">${t('Save a version now','এখন একটি সংস্করণ সংরক্ষণ')}</button></div><div id="bklist"></div></div>`;
$('#bkdl').onclick=async()=>{try{const x=await bkExport($('#bkpass').value),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([x],{type:'application/json'}));a.download='fahad-sme-copilot-backup-'+iso(new Date())+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);bmsg('ok',t('Backup file created. Keep it somewhere safe.','ব্যাকআপ ফাইল তৈরি হয়েছে। নিরাপদ জায়গায় রাখুন।'))}catch(e){bmsg('err',bke(e))}};
$('#bkshow').onclick=async()=>{try{$('#bktxt').value=await bkExport($('#bkpass').value);bmsg('ok',t('Copy the code above and keep it somewhere safe.','উপরের কোড কপি করে নিরাপদ জায়গায় রাখুন।'))}catch(e){bmsg('err',bke(e))}};
$('#bkfile').onchange=async ev=>{try{const f=ev.target.files[0];if(!f)return;if(f.size>2e5)throw new Error('big');$('#bktxt').value=await f.text();bmsg('ok',t('File loaded. Now press Restore.','ফাইল লোড হয়েছে। এবার "পুনরুদ্ধার" চাপুন।'))}catch(e){bmsg('err',bke(e))}};
$('#bkrestore').onclick=async()=>{try{await doRestore($('#bktxt').value,$('#bkpass').value)}catch(e){bmsg('err',bke(e))}};
$('#bksave').onclick=()=>{snap('manual',true);snapList();bmsg('ok',t('Version saved.','সংস্করণ সংরক্ষিত হয়েছে।'))};
snapList()}

// ---------- Tax (Bangladesh Finance Act 2026: income year 2026-27, assessment years 2026-27 and 2027-28) ----------
const LG=[['sole','Sole proprietorship (individual)','একক মালিকানা (ব্যক্তি)'],['firm','Partnership firm','অংশীদারি ফার্ম'],['pvt','Private limited company','প্রাইভেট লিমিটেড কোম্পানি']];
const CT=[['gen','General taxpayer','সাধারণ করদাতা'],['woman','Woman, or aged 65 or above','নারী, বা ৬৫ বছর বা তার বেশি বয়সী'],['dis','Person with disability or third gender','প্রতিবন্ধী বা তৃতীয় লিঙ্গ'],['ff','Gazetted war-wounded freedom fighter or July warrior','গেজেটভুক্ত যুদ্ধাহত মুক্তিযোদ্ধা বা জুলাই যোদ্ধা']];
const VM=[['std','Standard VAT (15%)','স্ট্যান্ডার্ড ভ্যাট (১৫%)'],['tot','Simplified turnover tax (small and retail)','সরল টার্নওভার কর (ছোট ও খুচরা)'],['none','Not VAT-registered or exempt','ভ্যাট নিবন্ধিত নয় বা অব্যাহতিপ্রাপ্ত']];
const FT=[['legal','Legal form of the business','ব্যবসার আইনি রূপ','s',LG],['cat','Taxpayer category (sets the tax-free limit)','করদাতার ধরন (করমুক্ত সীমা নির্ধারণ করে)','s',CT],
['ntp','First-time taxpayer (minimum tax ৳1,000)','প্রথমবার করদাতা (ন্যূনতম কর ৳১,০০০)','b'],['bank','Company meets the banking-channel condition (25% rate)','কোম্পানি ব্যাংকিং চ্যানেল শর্ত পূরণ করে (২৫% হার)','b'],['tfloor','Apply the 1% turnover-tax floor','১% টার্নওভার করের ন্যূনতম সীমা প্রয়োগ করুন','b'],
['intr','Loan interest paid in a year (৳)','বছরে পরিশোধিত ঋণের সুদ (৳)','n'],['dep','Depreciation and other allowed deductions per year (৳)','বছরে অবচয় ও অন্যান্য অনুমোদিত বাদ (৳)','n'],
['invest','Eligible investment per year, e.g. life insurance, DPS (৳)','বছরে যোগ্য বিনিয়োগ, যেমন জীবন বীমা, ডিপিএস (৳)','n'],['ait','Tax already deducted at source or paid in advance this year (৳)','এ বছর উৎসে কর্তিত বা অগ্রিম পরিশোধিত কর (৳)','n'],
['vmode','VAT status','ভ্যাট অবস্থা','s',VM],['vrate','VAT rate (%)','ভ্যাট হার (%)','n'],['vinp','Monthly purchases with VAT invoices, before VAT (৳)','মাসিক ভ্যাট-চালানযুক্ত ক্রয়, ভ্যাট বাদে (৳)','n'],['vfix','Fixed monthly turnover tax, if you use that scheme (৳)','নির্ধারিত মাসিক টার্নওভার কর, ঐ স্কিমে হলে (৳)','n']];
const TH={gen:4e5,woman:45e4,dis:525e3,ff:55e4},SLAB=[[3e5,.1],[4e5,.15],[5e5,.2],[2e6,.25],[Infinity,.3]];
function slabTax(T,cat){const th=TH[cat]||TH.gen;if(!(T>th))return 0;let r=T-th,x=0;for(const[w,p]of SLAB){const u=Math.min(r,w);x+=u*p;r-=u;if(r<=0)break}return x}
function taxCalc(s){s=s||S;const rev=Math.max(s.rev,0)*12,prof=(s.rev-s.cogs-s.opex)*12-s.intr-s.dep,T=Math.max(prof,0),th=TH[s.cat]||TH.gen;
let slab=0,rebate=0,minUp=0,rate=0,reg;
if(s.legal==='sole'){slab=slabTax(T,s.cat);rebate=T>th?Math.min(.03*T,.1*Math.max(s.invest,0),75e4,slab):0;reg=slab-rebate;const mn=s.ntp?1e3:5e3;if(T>th&&reg<mn){minUp=mn-reg;reg=mn}}
else{rate=s.legal==='pvt'&&s.bank?.25:.275;reg=T*rate}
const tot=.01*rev,fl=!!s.tfloor&&tot>reg,gross=fl?tot:reg,paid=Math.max(s.ait,0);
return{rev,prof,T,th,slab,rebate,minUp,rate,reg,tot,fl,gross,paid,net:gross-paid,eff:T>0?gross/T:0,mo:gross/12,after:prof-gross}}
function vatCalc(s){s=s||S;if(s.vmode==='none')return{mode:'none',out:0,inp:0,net:0};if(s.vmode==='tot')return{mode:'tot',out:0,inp:0,net:Math.max(s.vfix,0)};
const r=Math.max(s.vrate,0)/100,out=s.rev*r,inp=Math.max(s.vinp,0)*r;return{mode:'std',out,inp,net:out-inp}}
function taxWin(n){const y=n.getFullYear(),m=n.getMonth(),g=taxCalc().gross,yy=L==='bn'?bd(y):y;
if(m>=6&&m<=8)return{k:'early',end:new Date(y,8,30,12),msg:t(`File your income tax return by 30 Sep ${yy} for a 5% rebate (up to ৳25,000): about ${tk(Math.min(.05*g,25000))} saved.`,`৩০ সেপ্টেম্বর ${yy}-এর মধ্যে আয়কর রিটার্ন দিলে ৫% রিবেট (সর্বোচ্চ ৳২৫,০০০): প্রায় ${tk(Math.min(.05*g,25000))} সাশ্রয়।`)};
if(m>=9)return{k:'plain',end:new Date(y,11,31,12),msg:t(`File your income tax return by 31 Dec ${yy}: no rebate, but no extra tax. From 1 January the extra tax is 2% (at least ৳3,000).`,`৩১ ডিসেম্বর ${yy}-এর মধ্যে আয়কর রিটার্ন দিন: রিবেট নেই, বাড়তি করও নেই। ১ জানুয়ারি থেকে অতিরিক্ত কর ২% (সর্বনিম্ন ৳৩,০০০)।`)};
if(m<=2)return{k:'late2',end:new Date(y,2,31,12),msg:t(`Late filing: extra tax of 2% (at least ৳3,000), about ${tk(Math.max(.02*g,3000))}. From 1 April it becomes 5%.`,`দেরিতে রিটার্ন: অতিরিক্ত কর ২% (সর্বনিম্ন ৳৩,০০০), প্রায় ${tk(Math.max(.02*g,3000))}। ১ এপ্রিল থেকে ৫%।`)};
return{k:'late5',end:new Date(y,5,30,12),msg:t(`Late filing: extra tax of 5% (at least ৳5,000), about ${tk(Math.max(.05*g,5000))}.`,`দেরিতে রিটার্ন: অতিরিক্ত কর ৫% (সর্বনিম্ন ৳৫,০০০), প্রায় ${tk(Math.max(.05*g,5000))}।`)}}
function advDates(n,k){const o=[],t0=new Date(n.getFullYear(),n.getMonth(),n.getDate(),12);for(let y=n.getFullYear();o.length<k&&y<=n.getFullYear()+2;y++)[[2,15],[5,15],[8,15],[11,15]].forEach(([m,d])=>{const x=new Date(y,m,d,12);if(x>=t0&&o.length<k)o.push(x)});return o}
function taxAlerts(A){const x=taxCalc();if(!(x.gross>0))return;
if(S.legal==='sole'){const w=taxWin(new Date());A.push([w.k==='late2'||w.k==='late5'?'w':'i',w.msg])}
if(S.legal==='pvt'){const d=advDates(new Date(),1)[0];A.push(['i',t(`Advance income tax instalment of about ${tk(x.gross/4)} is due around ${fd(d)} (15 Mar, 15 Jun, 15 Sep, 15 Dec).`,`অগ্রিম আয়কর কিস্তি প্রায় ${tk(x.gross/4)}, ${fd(d)} নাগাদ দেয় (১৫ মার্চ, ১৫ জুন, ১৫ সেপ্টেম্বর, ১৫ ডিসেম্বর)।`)])}}
const TXE=/^(Income tax|আয়কর)/;
function applyTax(){const x=taxCalc(),v=vatCalc(),n=new Date(),pay=Math.max(x.net,0),lab=t('Income tax (estimate)','আয়কর (আনুমানিক)');
S.vat=Math.max(Math.round(v.net),0);S.ev=S.ev.filter(e=>!TXE.test(e.l));
if(pay>0){if(S.legal==='pvt'){const lim=iso(new Date(Date.now()+240*864e5));advDates(n,4).forEach(d=>{if(iso(d)<=lim)S.ev.push({d:iso(d),l:lab,a:-Math.round(pay/4)})})}else S.ev.push({d:iso(taxWin(n).end),l:lab,a:-Math.round(pay)})}
save();lang();const m=$('#txmsg');m.textContent=t('Done. Your forecast now includes monthly VAT and the estimated income tax payment.','হয়েছে। আপনার পূর্বাভাসে এখন মাসিক ভ্যাট ও আনুমানিক আয়কর পরিশোধ যুক্ত হয়েছে।');m.className='pos'}
function tx(){const x=taxCalc(),v=vatCalc(),w=taxWin(new Date()),pc=r=>f1(r*100)+'%',K=(a,b)=>`<div class="k"><b>${a}</b><span>${b}</span></div>`,row=(a,b,c)=>`<tr><td>${a}</td><td class="${c||''}">${b}</td></tr>`;
const nm={sole:t('Sole proprietor (slab rates)','একক মালিকানা (স্ল্যাব হার)'),firm:t('Partnership firm (27.5%)','অংশীদারি ফার্ম (২৭.৫%)'),pvt:t(`Private company (${S.bank?'25':'27.5'}%)`,`প্রাইভেট কোম্পানি (${S.bank?'২৫':'২৭.৫'}%)`)};
const cmp=['sole','firm','pvt'].map(l=>{const y=taxCalc(Object.assign({},S,{legal:l}));return`<tr><td>${l===S.legal?'<b>'+nm[l]+'</b>':nm[l]}</td><td>${tk(y.gross)}</td><td>${pc(y.eff)}</td></tr>`}).join('');
const g=x.gross,fw=[['early',t('1 Jul to 30 Sep','১ জুলাই – ৩০ সেপ্টেম্বর'),g-Math.min(.05*g,25000),t('5% rebate (max ৳25,000)','৫% রিবেট (সর্বোচ্চ ৳২৫,০০০)')],['plain',t('1 Oct to 31 Dec','১ অক্টোবর – ৩১ ডিসেম্বর'),g,t('No rebate, no extra tax','রিবেট নেই, বাড়তি করও নেই')],['late2',t('1 Jan to 31 Mar','১ জানুয়ারি – ৩১ মার্চ'),g+Math.max(.02*g,3000),t('Extra 2% (min ৳3,000)','অতিরিক্ত ২% (সর্বনিম্ন ৳৩,০০০)')],['late5',t('1 Apr to 30 Jun','১ এপ্রিল – ৩০ জুন'),g+Math.max(.05*g,5000),t('Extra 5% (min ৳5,000)','অতিরিক্ত ৫% (সর্বনিম্ন ৳৫,০০০)')]];
$('#tx').innerHTML=`<div class="c"><h2>${t('Income tax estimate for 2026-27','২০২৬-২৭ এর আয়কর হিসাব')}</h2>
<p class="mut">${t('Annual estimate from your monthly numbers (12 months), under the Finance Act 2026 that took effect on 1 July 2026.','আপনার মাসিক হিসাবকে ১২ মাসে ধরে বার্ষিক আনুমানিক হিসাব, ১ জুলাই ২০২৬ থেকে কার্যকর অর্থ আইন ২০২৬ অনুযায়ী।')}</p>
<div class="g">${K(sh(x.rev),t('Yearly sales','বার্ষিক বিক্রি'))}${K(sh(x.T),t('Taxable profit','করযোগ্য মুনাফা'))}${K(tk(x.gross),t('Income tax for the year','বছরের আয়কর'))}${K(pc(x.eff),t('Tax as share of profit','মুনাফার বিপরীতে করের হার'))}${K(tk(x.mo),t('Set aside each month','প্রতি মাসে আলাদা রাখুন'))}${K(sh(x.after),t('Profit after tax','কর-পরবর্তী মুনাফা'))}</div></div>
<div class="c"><h2>${t('How this is worked out','হিসাব যেভাবে হয়েছে')}</h2><table>
${row(t('Taxable profit (sales - goods - overheads - interest - other deductions) x 12','করযোগ্য মুনাফা (বিক্রি - পণ্য - খরচ - সুদ - অন্যান্য বাদ) x ১২'),tk(x.prof))}
${S.legal==='sole'?row(t(`Tax-free limit for your category`,`আপনার ধরনের করমুক্ত সীমা`),tk(x.th))+row(t('Tax on slabs (10%, 15%, 20%, 25%, 30%)','স্ল্যাব অনুযায়ী কর (১০%, ১৫%, ২০%, ২৫%, ৩০%)'),tk(x.slab))+row(t('Investment rebate','বিনিয়োগ রিবেট'),'-'+tk(x.rebate).replace('-',''))+row(t('Minimum tax top-up','ন্যূনতম করের পূরণ'),tk(x.minUp)):row(t(`Flat rate on profit (${pc(x.rate)})`,`মুনাফার ওপর সমহার (${pc(x.rate)})`),tk(x.reg))}
${row(t('Regular tax','নিয়মিত কর'),tk(x.reg))}
${row(t('1% turnover-tax floor on yearly sales','বার্ষিক বিক্রির ১% টার্নওভার করের ন্যূনতম সীমা'),tk(x.tot)+(x.fl?' ← '+t('applies','প্রযোজ্য'):''),x.fl?'neg':'')}
${row('<b>'+t('Income tax for the year','বছরের আয়কর')+'</b>','<b>'+tk(x.gross)+'</b>')}
${row(t('Tax already deducted or paid','ইতিমধ্যে কর্তিত বা পরিশোধিত কর'),'-'+tk(x.paid).replace('-',''))}
${row('<b>'+(x.net<0?t('Credit to carry forward or claim back','ক্রেডিট (ফেরত বা সমন্বয়যোগ্য)'):t('Still to pay','এখনো দিতে হবে'))+'</b>','<b>'+tk(Math.abs(x.net))+'</b>',x.net<0?'pos':'')}</table>
<p class="mut">${t('The turnover-tax floor applies when regular tax is lower, even in a loss year. Small-business exceptions may exist, so confirm with your accountant, or untick it above to see the figure without it.','নিয়মিত কর কম হলে, লোকসানের বছরেও টার্নওভার করের ন্যূনতম সীমা প্রযোজ্য হয়। ছোট ব্যবসার ক্ষেত্রে ব্যতিক্রম থাকতে পারে, তাই হিসাবরক্ষকের কাছে নিশ্চিত করুন, অথবা উপরে টিক তুলে এটি ছাড়া অঙ্ক দেখুন।')}</p></div>
${S.legal==='sole'&&g>0?`<div class="c"><h2>${t('When you file matters (individual returns)','কবে রিটার্ন দিচ্ছেন তা গুরুত্বপূর্ণ (ব্যক্তি করদাতা)')}</h2><table><tr><th>${t('Filing period','দাখিলের সময়')}</th><th>${t('Estimated tax','আনুমানিক কর')}</th><th></th></tr>${fw.map(r=>`<tr><td>${r[0]===w.k?'<b>'+r[1]+'</b>':r[1]}</td><td>${tk(r[2])}</td><td>${r[3]}</td></tr>`).join('')}</table><p class="${w.k==='late2'||w.k==='late5'?'neg':'pos'}">${w.msg}</p></div>`:''}
<div class="c"><h2>${t('VAT each month','প্রতি মাসের ভ্যাট')}</h2>${v.mode==='std'?`<table>${row(t('VAT you charge on sales','বিক্রিতে আদায় করা ভ্যাট'),tk(v.out))}${row(t('Minus VAT paid on purchases (input credit)','বাদ: ক্রয়ে পরিশোধিত ভ্যাট (ইনপুট ক্রেডিট)'),'-'+tk(v.inp).replace('-',''))}${row('<b>'+(v.net<0?t('Credit carried forward','ক্রেডিট সামনে টানা হবে'):t('VAT to pay','দেয় ভ্যাট'))+'</b>','<b>'+tk(Math.abs(v.net))+'</b>')}</table><p class="mut">${t('Assumes your sales figure is before VAT and that suppliers charged VAT on the purchases you list. Return and payment are due by the 15th of each month.','ধরা হয়েছে আপনার বিক্রির অঙ্ক ভ্যাট বাদে এবং আপনার দেওয়া ক্রয়ে সরবরাহকারী ভ্যাট নিয়েছে। রিটার্ন ও পরিশোধ প্রতি মাসের ১৫ তারিখের মধ্যে।')}</p>`:v.mode==='tot'?`<p>${t('Simplified turnover tax is a fixed amount set by business category and location, paid through a bank or mobile financial service, with no VAT returns. Enter your amount above. Current monthly amount','সরল টার্নওভার কর ব্যবসার ধরন ও এলাকা অনুযায়ী নির্ধারিত অঙ্ক, ব্যাংক বা মোবাইল ব্যাংকিংয়ে পরিশোধ, ভ্যাট রিটার্ন লাগে না। অঙ্ক উপরে দিন। বর্তমান মাসিক অঙ্ক')}: <b>${tk(v.net)}</b></p>`:`<p>${t('No VAT is counted because you are marked not registered or exempt.','আপনাকে নিবন্ধিত নয় বা অব্যাহতিপ্রাপ্ত দেখানো হয়েছে, তাই ভ্যাট ধরা হয়নি।')}</p>`}</div>
<div class="c"><h2>${t('Same profit, different legal form','একই মুনাফা, ভিন্ন আইনি রূপ')}</h2><table><tr><th>${t('Form','রূপ')}</th><th>${t('Tax for the year','বছরের কর')}</th><th>${t('Share of profit','মুনাফার হার')}</th></tr>${cmp}</table><p class="mut">${t('Income tax only. It leaves out dividend tax, the owner pay, costs of running a company and other factors, so it is not advice on which form to choose.','শুধু আয়কর। লভ্যাংশ কর, মালিকের বেতন, কোম্পানি চালানোর খরচ ও অন্যান্য বিষয় বাদ, তাই কোন রূপ বেছে নেবেন তার পরামর্শ নয়।')}</p></div>
<div class="c"><div class="ch"><button class="b pri" onclick="applyTax()">${t('Use in my cash-flow forecast','আমার নগদ প্রবাহ পূর্বাভাসে ব্যবহার করুন')}</button></div><div id="txmsg" role="status" class="mut"></div>
<p class="mut">${t('This sets your monthly VAT and adds the estimated income tax payment (one payment on the filing deadline, or four advance instalments for a company). Re-pressing it replaces those items.','এটি আপনার মাসিক ভ্যাট ঠিক করে এবং আনুমানিক আয়কর পরিশোধ যোগ করে (দাখিলের শেষ তারিখে একটি পরিশোধ, কোম্পানির ক্ষেত্রে চারটি অগ্রিম কিস্তি)। আবার চাপলে সেগুলো প্রতিস্থাপিত হয়।')}</p></div>
<p class="mut">${t('Based on the Finance Act 2026 and the Income Tax Act 2023 as reported on 23 Aug 2026. Estimates only. Rates change every budget. This is not tax advice: confirm with a tax professional or the NBR before filing or paying.','২৩ আগস্ট ২০২৬-এ প্রকাশিত তথ্য অনুযায়ী অর্থ আইন ২০২৬ ও আয়কর আইন ২০২৩-এর ভিত্তিতে। শুধু আনুমানিক হিসাব। প্রতিটি বাজেটে হার বদলায়। এটি কর-পরামর্শ নয়: দাখিল বা পরিশোধের আগে কর পেশাজীবী বা এনবিআরের কাছে নিশ্চিত হোন।')}</p>`}

function out(){ov();cf();fin();rk();tx()}

function tabs(){const N=[t('Overview','সারসংক্ষেপ'),t('Cash-flow & alerts','নগদ প্রবাহ ও সতর্কতা'),t('Financing','ঋণ ও অর্থায়ন'),t('Copilot & risks','কোপাইলট ও ঝুঁকি'),t('Tax','কর')];
$('#nv').innerHTML=N.map((n,i)=>`<button class="b ${i===T?'on':''}" onclick="go(${i})">${n}</button>`).join('');
document.querySelectorAll('.p').forEach((p,i)=>p.classList.toggle('on',i===T))}
let T=0;const go=i=>{T=i;tabs()};

function lang(){document.documentElement.lang=L;
$('#ti').innerHTML=t('Fahad SME Finance Copilot <small>For Bangladeshi small businesses · amounts in Taka (৳)</small>','ফাহাদ এসএমই ফাইন্যান্স কোপাইলট <small>বাংলাদেশের ক্ষুদ্র ও মাঝারি ব্যবসার জন্য · অঙ্ক টাকায় (৳)</small>');
$('#lg').textContent=t('বাংলা','English');$('#rs').textContent=t('Reset sample data','নমুনা তথ্য রিসেট');
$('#h_pr').textContent=t('Your business','আপনার ব্যবসা');$('#smp').textContent=t('Pre-filled with sample figures. Replace them with yours. Everything stays on your device.','নমুনা তথ্য দেওয়া আছে, নিজের তথ্য বসান। সব তথ্য আপনার ডিভাইসেই থাকে।');
$('#f_pr').innerHTML=FP.map(fld).join('');$('#h_fn').textContent=t('What do you need?','আপনার কী প্রয়োজন?');$('#f_fn').innerHTML=FF.map(fld).join('');
$('#h_fc').textContent=t('8-month cash forecast','৮ মাসের নগদ পূর্বাভাস');$('#fcn').textContent=t('Based on your monthly run-rate, VAT on the 15th, and the one-off items below.','মাসিক গড় আয়-ব্যয়, ১৫ তারিখের ভ্যাট এবং নিচের একবারের লেনদেন ধরে হিসাব।');
$('#h_ev').textContent=t('Upcoming one-off payments and receipts','আসন্ন একবারের লেনদেন');$('#l_d').textContent=t('Date','তারিখ');$('#l_n').textContent=t('Description','বিবরণ');$('#l_a').textContent=t('Amount (৳)','অঙ্ক (৳)');$('#l_t').textContent=t('Type','ধরন');
$('#et').innerHTML=`<option value="-1">${t('Money out','খরচ')}</option><option value="1">${t('Money in','আয়')}</option>`;$('#ad').textContent=t('Add','যোগ করুন');
$('#h_co').textContent=t('Ask your copilot','কোপাইলটকে জিজ্ঞাসা করুন');$('#q').placeholder=t('e.g. Can I afford the Eid bonus?','যেমন: ঈদ বোনাস দিতে পারব?');$('#qs').textContent=t('Ask','জিজ্ঞাসা');
const Q=[[t('Can I afford the Eid bonus?','ঈদ বোনাস দিতে পারব?')],[t('Which loan suits me?','কোন ঋণ আমার জন্য ভালো?')],[t('When is VAT due?','ভ্যাট কবে দিতে হবে?')],[t('How do I collect dues faster?','বাকি দ্রুত আদায় করব কীভাবে?')],[t('How is my profit?','আমার মুনাফা কেমন?')],[t('Any cash alerts?','নগদ সতর্কতা আছে?')],[t('What are my biggest risks?','আমার সবচেয়ে বড় ঝুঁকি কী?')],[t('Stress test my business','আমার ব্যবসার স্ট্রেস টেস্ট')],[t('What should I do next?','এরপর আমার কী করা উচিত?')],[t('Ideas to grow profit','মুনাফা বাড়ানোর উপায়')],[t('How much tax will I pay?','আমাকে কত কর দিতে হবে?')]];
$('#chips').innerHTML=Q.map((x,i)=>`<button class="b" data-i="${i}">${x[0]}</button>`).join('');
const QK=['eid bonus','loan','vat','dues','profit','cash alert','risk','stress test','plan','ideas to grow','income tax'];document.querySelectorAll('#chips button').forEach(b=>b.onclick=()=>say(QK[b.dataset.i]));
$('#ft').textContent=t('Estimates for planning only. Not financial, tax or legal advice. Check with your bank and accountant.','শুধু পরিকল্পনার জন্য আনুমানিক হিসাব। আর্থিক, কর বা আইনি পরামর্শ নয়। ব্যাংক ও হিসাবরক্ষকের সাথে যাচাই করুন।');
$('#h_tx').textContent=t('Tax estimate (Bangladesh)','কর হিসাব (বাংলাদেশ)');$('#f_tx').innerHTML=FT.map(fld).join('');C.length=0;chat();tabs();out();bkUI()}

$('#lg').onclick=()=>{L=L==='en'?'bn':'en';try{localStorage.setItem('bdl',L)}catch(e){}lang()};
$('#rs').onclick=()=>{snap('reset',true);S=DEF();save();lang()};
$('#ad').onclick=()=>{const d=$('#ed').value,l=$('#en').value.trim(),a=Math.abs(+$('#ea').value||0)*(+$('#et').value);if(!d||!l||!a)return;S.ev.push({d,l,a});save();$('#en').value='';$('#ea').value='';cf()};
$('#qs').onclick=()=>{say($('#q').value);$('#q').value=''};$('#q').onkeydown=e=>{if(e.key==='Enter')$('#qs').click()};
lang();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
