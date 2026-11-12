/* «القرآن الكريم» داخل «زاد» (docs/quran/README.md). تعديل القرآن ٢ (Nov 10): الفهرس أول شي، وطريقتين للقراءة من زر ▾ فوق:
   - «آية تحت آية» (الافتراضي): نص السورة بخط المصحف (KFGQPC Uthmanic Script HAFS = quran/hafs.ttf)، كبير ويملي العرض،
     تنزل بإصبعك، وتسحب يمين/يسار للسورة اللي بعدها/قبلها. بين كل صفحة والثانية خط رفيع عليه «صفحة N».
   - «صفحة صفحة»: مصحف المدينة الحقيقي، ٦٠٤ صفحة × ١٥ سطر، كل صفحة بخطها (QCF V2). الصفحة اللي قبل واللي بعد جاهزات.
   - quran/q.json: السطور ورموز الكلمات والفهرس. quran/t.json: نفس الكلمات بنص حفص (منه تنبني الآيات لـ«آية تحت آية»).
     quran/s.json: النص الإملائي (مجمع الملك فهد) للبحث بس، ينزل أول ما تبحث.
   - «شريط القراءة» {page, a}: مكان واحد بكل التطبيق والودجتين (بالتلفون Quran.java، SharedPreferences "reading").
     ينكتب كل ما يوگف التمرير (نص ثانية) وتتحدّث الودجتين وياه.
   - «القراءة اليومية» (أورادي): كل ورد بوقته وكميته (صفحة، ورقة، ربع حزب، حزب، نص جزء، جزء، أو بالوقت). يبدي من الشريطة،
     ونهايته من حدود الربع والحزب والجزء الحقيقية (RUB). ورد بقفل يطلع فوق شاشة القفل وما تطلع لحد ما تخلص؛ ورد بلا قفل
     تنبيه بس، ويبين خط رفيع جوه لوين توصل (بالتلفون: QuranDaily.java).
   zad.js يناديها: YQ.init(api)، YQ.open() الفهرس، YQ.open(page[,a]) القراءة، YQ.cardHtml()، YQ.close(). */
(function(){
const Q=()=>window.YawmiQuran;
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ar=n=>String(n).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
const buzz=p=>{const m=window.YM;if(m)m.haptic(p);else try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const QF="https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/",GH="https://raw.githubusercontent.com/mode11h19-cell/yawmi-releases/main/quran/v2/";
const DAYS=["س","ح","ن","ث","ر","خ","ج"]; // السبت أول
// أول آية (0..6235) بكل ربع حزب من ٢٤٠، مصحف المدينة (بيانات مجمع الملك فهد عن quran-meta، مطابقة لبداية كل جزء بـq.json).
// الحزب = ٤ أرباع، الجزء = ٨.
const RUB=[0,32,50,66,81,98,112,130,148,164,183,195,209,225,239,249,259,269,278,289,307,325,344,367,385,405,425,445,463,478,493,504,516,528,550,566,580,592,606,627,640,655,669,680,695,709,719,735,750,765,777,801,824,847,862,883,899,915,929,939,954,984,1000,1018,1041,1070,1095,1109,1124,1142,1160,1181,1200,1220,1235,1253,1268,1280,1294,1309,1327,1345,1356,1374,1389,1416,1434,1453,1478,1496,1513,1533,1556,1580,1602,1625,1648,1672,1696,1711,1725,1741,1759,1777,1802,1851,1901,1930,1951,1975,1990,2011,2029,2051,2078,2098,2127,2156,2171,2190,2214,2238,2271,2308,2348,2402,2430,2458,2483,2511,2533,2565,2595,2613,2632,2654,2673,2708,2747,2791,2811,2825,2843,2855,2875,2907,2932,2983,3042,3112,3159,3185,3214,3240,3263,3280,3302,3327,3340,3365,3385,3409,3439,3462,3490,3513,3533,3550,3563,3583,3592,3615,3629,3651,3674,3700,3732,3764,3809,3870,3932,3990,4021,4065,4089,4110,4133,4153,4173,4198,4226,4242,4264,4284,4298,4322,4348,4381,4430,4484,4510,4530,4554,4577,4600,4612,4625,4656,4705,4758,4809,4854,4901,4979,5053,5090,5104,5117,5136,5156,5177,5191,5217,5229,5241,5271,5323,5393,5447,5494,5551,5609,5672,5758,5829,5884,5948,6023,6090,6154];
const KINDS=[["page","صفحة"],["leaf","ورقة"],["rub","ربع حزب"],["hizb","حزب"],["half","نص جزء"],["juz","جزء"],["min","بالوقت"]];
const MINS=[[15,"١٥ د"],[30,"٣٠ د"],[60,"ساعة"],[120,"ساعتين"]];
const NAMES=["الصبح","الظهر","العصر","المغرب","الليل"];
// السور المدنية (ترتيب مصحف المدينة)
const MADANI=new Set([2,3,4,5,8,9,13,22,24,33,47,48,49,55,57,58,59,60,61,62,63,64,65,66,76,98,99,110]);
const FS0=28,FSMIN=22,FSMAX=40;

let api=null,D=null,T=null,Tp=null,Dp=null,Sp=null,SF=null,AY=null;
let pg=null,V=null,RV=null,idx=null,dly=null,menu=null,lockEl=null;
let stack=[],skipPop=0,mode="read",cur=1,curS=0,W=0,H=0,bars=true,markA=-1,saveT=0,scrT=0,vT=0,idleT=0,lastKept=null,lockO=null;
const faces=new Map(); // صفحة → FontFace (آخر ٧ بس)

/* ---------- البيانات ---------- */
function data(){if(D)return Promise.resolve(D);if(!Dp)Dp=fetch("quran/q.json").then(r=>r.json()).then(j=>D=j).catch(e=>{Dp=null;throw e});return Dp}
function text(){if(T)return Promise.resolve(T);if(!Tp)Tp=fetch("quran/t.json").then(r=>r.json()).then(j=>T=j.p).catch(e=>{Tp=null;throw e});return Tp}
function both(){return Promise.all([data(),text()]).then(()=>ayat())}
const S0=g=>{let s=0;while(s+1<114&&D.s0[s+1]<=g)s++;return s}; // سورة الآية (0..113)
const surahOfPage=p=>{const L=D.p[p-1],h=L.find(l=>l[0]==="S");return h?+h.slice(1)-1:S0(D.pa[p-1])};
const juzOfPage=p=>D.pj[p-1];
const sEnd=s=>s<113?D.s0[s+1]:6236;
/* الآيات بنص حفص، من نفس كلمات t.json: كلمة تبدي بـ^ بـq.json = رقم الآية. صفحة الآية = صفحة أول كلمة بيها. */
function ayat(){if(AY)return AY;const w=new Array(6236),n=new Array(6236),p=new Int16Array(6236);let g=0,c=[],p0=0;
  for(let k=1;k<=604;k++){const L=D.p[k-1],TL=T[k-1];
    for(let l=0;l<L.length;l++){const s=L[l];if(!s||s[0]==="S"||s==="B")continue;
      const qs=(s[0]==="~"?s.slice(1):s).split(" "),ts=(TL[l]||"").split(" ");
      for(let i=0;i<qs.length&&g<6236;i++){const t=(ts[i]||"").replace(/ /g," ");
        if(qs[i][0]==="^"){w[g]=c.join(" ");n[g]=t;p[g]=p0||k;g++;c=[];p0=0}else{if(!c.length)p0=k;c.push(t)}}}}
  return AY={w,n,p}}
const pageOfA=g=>AY?AY.p[g]:0;
const firstOn=p=>{if(!AY)return D.pa[p-1];let g=D.pa[p-1];while(g<6235&&AY.p[g]<p)g++;return AY.p[g]===p?g:D.pa[p-1]};
const lastOn=p=>{let g=firstOn(Math.min(604,p+1));if(p>=604)return 6235;while(g>0&&AY.p[g]>p)g--;return g};
const aname=g=>{const s=S0(g);return D.s[s][0]+" · الآية "+ar(g-D.s0[s]+1)};

/* ---------- الشريطة وقراءتي اليومية (بالتلفون؛ بالمتصفح بهالجهاز) ---------- */
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
function local(){let o={};try{o=JSON.parse(localStorage.getItem("yawmi-q")||"{}")}catch(e){}if(o.day!==today()){o.day=today();o.wdone=[]}return o}
function putLocal(o){try{localStorage.setItem("yawmi-q",JSON.stringify(o))}catch(e){}}
function state(){if(Q()){try{const s=JSON.parse(Q().state());if(s)return s}catch(e){}}const o=local();
  const aw=o.awrad||[],dd=(new Date().getDay()+1)%7,td=aw.filter(w=>w.on&&w.days.includes(dd));
  return {page:o.page||1,a:o.a==null?-1:o.a,at:o.at||0,goal:td.length,done:td.filter(w=>(o.wdone||[]).includes(w.id)).length,awrad:aw}}
function keep(page,a){lastKept=page+":"+a;if(Q()){try{Q().set(page,a)}catch(e){}return}const o=local();o.page=page;o.a=a;o.at=Date.now();putLocal(o)}
function goalLine(s){s=s||state();if(!s.goal)return"";return s.done>=s.goal?"✓":`قراءة اليوم ${ar(Math.min(s.done,s.goal))} من ${ar(s.goal)}`}
// أورادي (بالتلفون QuranDaily.java؛ بالمتصفح بهالجهاز بس، بلا منبّه)
const awrad=s=>(s||state()).awrad||[];
const oldApp=()=>Q()&&!Q().awrad; // تطبيق 1.27: يحتاج تحديث
function setAwrad(L){if(Q()){if(Q().awrad)try{Q().awrad(JSON.stringify(L))}catch(e){}return}const o=local();let n=1;
  L.forEach(w=>{if(w.id)n=Math.max(n,w.id+1)});L.forEach(w=>{if(!w.id)w.id=n++});o.awrad=L;putLocal(o)}

/* ---------- خطوط «صفحة صفحة» ---------- */
const fontUrl=p=>Q()?`url(quran/v2/p${String(p).padStart(3,"0")}.woff)`
  :`url(${QF}p${p}.woff2) format("woff2"), url(${GH}p${String(p).padStart(3,"0")}.woff) format("woff")`;
function face(p){let f=faces.get(p);if(f){faces.delete(p);faces.set(p,f);return f} // آخر استعمال بالآخر
  f=new FontFace("qp"+p,fontUrl(p),{display:"block"});faces.set(p,f);
  f.load().then(()=>{document.fonts.add(f);if(Math.abs(p-cur)<=2)later(()=>fill(p,true),"f"+p)}).catch(()=>{faces.delete(p)});
  return f}
const ready=p=>{const f=faces.get(p);return !!(f&&f.status==="loaded")};
// LruCache لـ٧ صفحات: الأقدم يطلع، بس مو اللي جنب الصفحة الحالية
function trim(){if(faces.size<=7)return;for(const [p,f] of faces){if(faces.size<=7)break;if(Math.abs(p-cur)<=2)continue;try{document.fonts.delete(f)}catch(e){}faces.delete(p);const el=slot(p);if(el&&el.firstChild){el.innerHTML="";delete el.dataset.g}}}
// الشغل الثقيل بس لما يوگف السحب
const laterQ=new Map();function later(fn,key){laterQ.set(key==null?fn:key,fn);clearTimeout(idleT);idleT=setTimeout(flushLater,120)}
function flushLater(){if(dragging){idleT=setTimeout(flushLater,120);return}const q=[...laterQ.values()];laterQ.clear();q.forEach(f=>f())}
let dragging=false;

/* ---------- رسم صفحة المصحف ---------- */
// شريط اسم السورة: إطارين بأطراف مدببة ومعيّن صغير بكل جهة (quran-structure.html)
const band=n=>`<div class="qband"><svg viewBox="0 0 300 36" preserveAspectRatio="none" aria-hidden="true"><path d="M18 3H282L297 18L282 33H18L3 18Z" stroke-opacity=".5"/><path d="M24 7H276L289 18L276 29H24L11 18Z" stroke-opacity=".22"/></svg><i></i><i></i><span>سُورَةُ ${esc(n)}</span></div>`;
function lineHtml(p,l,k,glyph){const s=D.p[p-1][l];
  if(!s)return `<div class="ql e"></div>`;
  if(s[0]==="S"){const n=+s.slice(1);return `<div class="ql sh">${band(D.s[n-1][1])}</div>`}
  if(s==="B")return `<div class="ql bs">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>`;
  const c=s[0]==="~",ws=(c?s.slice(1):s).split(" "),tw=glyph?null:(T&&T[p-1][l]||"").split(" ");
  let h="";ws.forEach((w,i)=>{const end=w[0]==="^";h+=`<span data-a="${k.g}">${esc(glyph?(end?w.slice(1):w):(tw[i]||"").replace(/ /g," "))}</span>`;if(end)k.g++});
  return `<div class="ql${c?" c":""}${glyph?"":" tx"}">${h}</div>`}
function pageHtml(p){const glyph=ready(p),k={g:D.pa[p-1]},L=D.p[p-1],few=p<=2;
  let ls="";L.forEach((_,l)=>{if(few&&!L[l])return;ls+=lineHtml(p,l,k,glyph)});
  const s=surahOfPage(p);
  return `<div class="qpg${few?" few":""}"><div class="qhd"><span>${esc(D.s[s][0])} <i>${ar(s+1)}</i></span></div>
  <div class="qls" style="${glyph?`font-family:qp${p}`:""}">${ls}</div>
  <div class="qft"><span>الجزء ${ar(juzOfPage(p))}</span><span class="qno">${ar(p)}</span><span>الحزب ${ar(D.ph[p-1])}</span></div></div>`}
function slot(p){return V&&V.children[p-1]}
// ما ينعاد رسم صفحة مرسومة: بس إذا وصل خطها (كانت بنص حفص مؤقتاً)
function fill(p,force){const el=slot(p);if(!el||!D)return;if(el.firstChild&&el.dataset.g===String(ready(p))&&!force)return;if(el.firstChild&&el.dataset.g==="true")return;
  if(!ready(p)){face(p);if(!T){text().then(()=>fill(p,true)).catch(()=>{});if(!el.firstChild)el.innerHTML=`<div class="qpg"><div class="qwait">…</div></div>`;return}}
  el.dataset.g=String(ready(p));el.innerHTML=pageHtml(p);
  if(markA>=0)$$(`[data-a="${markA}"]`,el).forEach(s=>s.classList.add("hl"))}
// الصفحة وجيرانها (±٢) جاهزات قبل لا توصلها؛ البعيدة (أكثر من ٣) تنمسح
function windowAt(p){for(let d=0;d<=2;d++){[p+d,p-d].forEach(k=>{if(k>=1&&k<=604){face(k);fill(k)}})}
  $$(".qs",V).forEach((el,i)=>{if(Math.abs(i+1-p)>3&&el.firstChild){el.innerHTML="";delete el.dataset.g}});trim()}

/* ---------- «آية تحت آية» ---------- */
const BAS="بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ";
function surahHtml(s){const a0=D.s0[s],a1=sEnd(s);
  let h=`<div class="qsu-in"><div class="qsh">${band(D.s[s][1])}</div>${s!==0&&s!==8?`<div class="qbs">${BAS}</div>`:""}`,p=-1;
  for(let g=a0;g<a1;g++){const pp=AY.p[g];
    if(pp!==p){if(p>0)h+=`</p><div class="qpb"><span>صفحة ${ar(pp)}</span></div>`;h+=`<p class="qtx" data-p="${pp}">`;p=pp}
    h+=`<span class="qa" data-a="${g}">${esc(AY.w[g])} <span class="qn">${AY.n[g]}</span></span> `}
  return h+`</p>${s<113?`<p class="qnx">${esc(D.s[s+1][0])} ‹ اسحب</p>`:""}</div>`}
function rslot(s){return RV&&RV.children[s]}
function rfill(s){const el=rslot(s);if(!el||el.firstChild)return;el.innerHTML=surahHtml(s);el.scrollTop=0}
function rwindow(s){for(const k of [s,s+1,s-1])if(k>=0&&k<114)rfill(k);
  $$(".qsu",RV).forEach((el,i)=>{if(Math.abs(i-s)>1&&el.firstChild){el.innerHTML=""}})}
// أول آية ظاهرة كاملة بالشاشة (بحث ثنائي على الآيات)
function firstSeen(){const el=rslot(curS);if(!el||!el.firstChild)return D.s0[curS];const A=$$(".qa",el);if(!A.length)return D.s0[curS];
  const top=el.getBoundingClientRect().top+(bars?topH():0)+4;let lo=0,hi=A.length-1,r=A.length-1;
  while(lo<=hi){const m=(lo+hi)>>1;if(A[m].getBoundingClientRect().top>=top){r=m;hi=m-1}else lo=m+1}
  return +A[r].dataset.a}
const topH=()=>{const t=pg&&$(".qr-top",pg);return t&&!t.hidden?t.getBoundingClientRect().bottom:0};
let progAt=0; // تمرير سوّيناه احنا (مو إصبعك): ما يخفي الشريط
function toAyah(g,flash){const el=rslot(curS);if(!el)return;const a=$(`.qa[data-a="${g}"]`,el);if(!a)return;progAt=Date.now();
  if(g===D.s0[curS])el.scrollTop=0;else el.scrollTop+=a.getBoundingClientRect().top-el.getBoundingClientRect().top-Math.max(90,topH()+18);
  if(flash){a.classList.add("fl");setTimeout(()=>a.classList.add("off"),2000);setTimeout(()=>a.classList.remove("fl","off"),3400)}}

/* ---------- الصفحة والتنقل ---------- */
function geom(){W=pg.clientWidth;H=pg.clientHeight;
  const cs=getComputedStyle(document.documentElement),sat=parseFloat(cs.getPropertyValue("--sat"))||0,sab=parseFloat(cs.getPropertyValue("--sab"))||0;
  // الصفحة بإطار رفيع ١٢ من كل جهة، وجوّاه: اسم السورة فوق، الـ١٥ سطر، ورقم الصفحة تحت بالنص
  const top=sat+46,bot=sab+48,lh=(H-top-bot)/15,fs=Math.min((W-44)/17.4,lh/1.5);
  for(const [k,v] of [["--qw",W],["--qh",H],["--qlh",lh],["--qfs",fs],["--qtop",top],["--qbot",bot]])pg.style.setProperty(k,v+"px");barH()}
const fsz=()=>{const v=+((api&&api.cfg().qFs)||FS0);return v>=FSMIN&&v<=FSMAX?v:FS0};
function ensure(){if(pg)return;pg=document.createElement("section");pg.id="qrPg";pg.hidden=true;pg.setAttribute("aria-label","القرآن الكريم");
  pg.innerHTML=`<div id="qrV"></div><div id="qrR"></div>
  <div class="qr-top"><button class="qr-c" data-qx aria-label="رجوع">‹</button><div class="qr-t"><b id="qrS"></b><small id="qrSub"></small></div><button class="qr-m" data-qm id="qrM"></button></div>
  <div class="qr-bot" hidden><span id="qrN"></span><small id="qrG"></small></div><div class="qr-hint" id="qrHint" hidden>اسحب يمين ويسار تقلب</div><div class="qr-toast" id="qrT" hidden></div>`;
  document.body.appendChild(pg);V=$("#qrV",pg);RV=$("#qrR",pg);
  V.innerHTML=Array.from({length:604},(_,i)=>`<div class="qs" data-p="${i+1}"></div>`).join("");
  RV.innerHTML=Array.from({length:114},(_,i)=>`<div class="qsu" data-s="${i}"></div>`).join("");
  V.addEventListener("scroll",onScroll,{passive:true});RV.addEventListener("scroll",onRScroll,{passive:true});
  RV.addEventListener("scroll",onVScroll,{passive:true,capture:true});
  ["pointerdown","touchstart"].forEach(k=>pg.addEventListener(k,()=>{dragging=true},{passive:true}));
  ["pointerup","pointercancel","touchend","touchcancel"].forEach(k=>pg.addEventListener(k,()=>{dragging=false},{passive:true}));
  wire();addEventListener("resize",()=>{if(rdOn()){geom();if(mode==="page")go(cur);else rgo(curS,null)}})}
function isOpen(){return !!(pg&&!pg.hidden)}
const rdOn=()=>isOpen()&&stack.includes("rd");
function onScroll(){if(mode!=="page")return;clearTimeout(scrT);scrT=setTimeout(()=>{const p=Math.max(1,Math.min(604,Math.round(Math.abs(V.scrollLeft)/W)+1));if(p!==cur)setCur(p)},60)}
function setCur(p){
  cur=p;windowAt(p);head();lockCheck();if(Q()&&Q().fetch)try{Q().fetch(p)}catch(e){}
  if(markA>=0&&pageOfA(markA)!==p&&AY)markA=-1;
  clearTimeout(saveT);saveT=setTimeout(()=>keep(cur,markA>=0?markA:(AY?firstOn(cur):-1)),500)}
function go(p){p=Math.max(1,Math.min(604,p));cur=p;V.scrollLeft=-(p-1)*W;windowAt(p);head()}
// السحب يمين/يسار بـ«آية تحت آية»: السورة اللي بعدها/قبلها (العنوان يتبدّل وياه)
function onRScroll(e){if(mode!=="read"||e.target!==RV)return;const s=Math.max(0,Math.min(113,Math.round(Math.abs(RV.scrollLeft)/W)));
  if(s!==curS){curS=s;head(s)}clearTimeout(scrT);scrT=setTimeout(()=>{rwindow(curS);vSettle()},80)}
function onVScroll(e){if(mode!=="read"||e.target===RV||!e.target.classList||!e.target.classList.contains("qsu"))return;
  if(bars&&e.target.scrollTop>40&&!held()&&Date.now()-progAt>500)setBars(false);clearTimeout(vT);vT=setTimeout(vSettle,500)}
// يوگف التمرير (نص ثانية): أول آية ظاهرة كاملة = الشريطة
function vSettle(){if(mode!=="read"||!AY)return;const g=firstSeen(),p=pageOfA(g);
  cur=p;head();lockCheck();keep(p,g)}
function rgo(s,g,flash){curS=s;RV.scrollLeft=-s*W;rwindow(s);head(s);requestAnimationFrame(()=>{const el=rslot(s);if(!el)return;progAt=Date.now();if(g==null||g<0)el.scrollTop=0;else toAyah(g,flash);
  const f=g!=null&&g>=0?g:D.s0[s];cur=pageOfA(f);head()})}

function setMode(m,keepPlace){const from=mode,g0=from==="read"&&AY?firstSeen():markA;mode=m==="page"?"page":"read";pg.classList.toggle("paged",mode==="page");pg.classList.toggle("reading",mode==="read");geom();
  if(keepPlace===false)return;
  if(mode==="page"){go(from==="read"&&AY?pageOfA(g0):cur)}
  else{const g=markA>=0?markA:firstOn(cur);rgo(S0(g),g,false)}}

/* ---------- الفتح والسد ---------- */
function push(v){stack.push(v);try{history.pushState({zq:stack.length},"")}catch(e){}}
// YQ.open(): الفهرس. YQ.open(page[, a]): القراءة على هالصفحة (أو الآية)
function open(page,a){if(!api)return;ensure();const first=!isOpen();
  pg.hidden=false;document.body.classList.add("qr-on");
  if(first)setBars(true);
  return both().then(()=>{if(page==null||page===0&&a==null){if(!stack.includes("idx"))push("idx");idxDraw();return}
    reader(page,a)}).catch(()=>{api.toast("ما گدرت أفتح القرآن");close(true)})}
function reader(page,a,flash){const s=state();page=page||s.page||1;
  if(a==null||a<0)a=page===s.page&&s.a>=0?s.a:-1;markA=a!=null&&a>=0?a:-1;
  if(!stack.includes("rd"))push("rd");idxHide();pg.classList.add("rd");
  if(Q())try{Q().keep(true)}catch(e){}
  geom();pg.style.setProperty("--qrs",fsz()+"px");const m=api.cfg().qMode==="page"?"page":"read";
  mode=m;pg.classList.toggle("paged",m==="page");pg.classList.toggle("reading",m==="read");
  if(m==="page"){go(page);if(markA>=0)setTimeout(()=>flashA(markA),350);if(Q()&&Q().fetch)try{Q().fetch(page)}catch(e){}}
  else{const g=markA>=0?markA:firstOn(page);rgo(S0(g),g,markA>=0||flash)}
  setBars(true);hint();if(!lockO)lockSync()}
// المرة الجاية: الآية اللي وقفت عليها تتظلّل خفيف لثانيتين
function flashA(g){const el=slot(cur);if(!el)return;const s=$$(`[data-a="${g}"]`,el);s.forEach(x=>x.classList.add("ul"));setTimeout(()=>s.forEach(x=>x.classList.remove("ul")),2000)}
function hint(){const c=api.cfg();if(c.qHint>=2)return;c.qHint=(c.qHint||0)+1;api.save();const h=$("#qrHint",pg);h.hidden=false;setTimeout(()=>h.hidden=true,3200)}
function leaveReader(){if(!AY)return;const g=mode==="read"?firstSeen():(markA>=0?markA:firstOn(cur));keep(mode==="read"?pageOfA(g):cur,g);
  if(Q())try{Q().keep(false)}catch(e){}pg.classList.remove("rd");menuClose()}
// fromPop: الرجوع جاي من زر الرجوع/التبويب (الخطوة انشالت). غير هيچ نرجع كل خطواتنا بالـhistory
function close(fromPop){if(!isOpen())return 0;if(held())return 0;lockHide();if(stack.includes("rd"))leaveReader();const n=stack.length-(fromPop?1:0);
  pg.hidden=true;document.body.classList.remove("qr-on");idxHide();dlyHide();stack=[];
  for(const [p,f] of faces){try{document.fonts.delete(f)}catch(e){}}faces.clear();$$(".qs",V).forEach(el=>{el.innerHTML="";delete el.dataset.g});$$(".qsu",RV).forEach(el=>el.innerHTML="");
  if(!fromPop&&n>0){skipPop=1;try{history.go(-n)}catch(e){skipPop=0}}
  if(window.YZ&&YZ.refresh)YZ.refresh();return 1}
// رجوع التلفون: خطوة خطوة (الإعدادات، القراءة، الفهرس)
function back(){if(skipPop){skipPop=0;return true}if(!isOpen())return false;if(held()){try{history.pushState({zq:9},"")}catch(e){}return true}
  if(menu&&!menu.hidden){menuClose()}
  const v=stack.pop(),top=stack[stack.length-1];if(v==="ward"){wEdit=null;dlyDraw();return true}
  if(v==="set"){dlyHide();if(top==="idx")idxDraw();return true}
  if(v==="rd"){leaveReader();lockHide();if(stack.length){if(top==="set"||top==="ward")dlyDraw();else idxDraw();return true}}
  if(!stack.length){close(true);return true}
  if(stack[stack.length-1]==="idx")idxDraw();return true}
const depth=()=>isOpen()?stack.length:0;

/* ---------- الشريط فوق (دوسة تطلعه وتخفيه) ---------- */
// طول الشريط الفوق (من فوق الشاشة لآخره): «آية تحت آية» تبدي من تحته
function barH(){const t=pg&&$(".qr-top",pg);if(!t||t.hidden||!t.offsetHeight)return;const b=Math.ceil(t.getBoundingClientRect().bottom-pg.getBoundingClientRect().top);if(b>0)pg.style.setProperty("--qbar",b+"px")}
function setBars(on){bars=on;if(!pg)return;$(".qr-top",pg).hidden=!on;if(on)barH();$(".qr-bot",pg).hidden=!on||!goalLine();head()}
function head(sIdx){if(!pg||!D)return;const s=sIdx!=null?sIdx:mode==="read"?curS:surahOfPage(cur),p=mode==="read"&&sIdx!=null?(AY?pageOfA(D.s0[s]):cur):cur;
  $("#qrS",pg).textContent=ar(s+1)+". "+D.s[s][0];
  $("#qrSub",pg).textContent=`${MADANI.has(s+1)?"مدنية":"مكية"} · ${ar(D.s[s][2])} آية · صفحة ${ar(p)} · الجزء ${ar(juzOfPage(p))}`;
  $("#qrM",pg).textContent=(mode==="page"?"صفحة صفحة":"آية تحت آية")+" ▾";
  $("#qrN",pg).textContent="صفحة "+ar(p);$("#qrG",pg).textContent=goalLine()}
function toast(t){const e=$("#qrT",pg);e.textContent=t;e.hidden=false;clearTimeout(e._t);e._t=setTimeout(()=>e.hidden=true,1600)}

// زر ▾: «صفحة صفحة» / «آية تحت آية» (يتذكر)، وحجم الخط
function menuOpen(){if(!menu){menu=document.createElement("div");menu.className="qr-menu";pg.appendChild(menu)}
  menu.innerHTML=`${[["page","صفحة صفحة","صفحات المصحف"],["read","آية تحت آية","كتابة كبيرة تنزل بإصبعك"]].map(([k,l,d])=>`<button data-qmo="${k}" aria-pressed="${mode===k}"><b>${l}</b><small>${d}</small></button>`).join("")}
  ${mode==="read"?`<div class="qr-fs"><button data-qf="-2">A-</button><span>${ar(fsz())}</span><button data-qf="2">A+</button></div>`:""}`;menu.hidden=false}
function menuClose(){if(menu)menu.hidden=true}

let lp=0,lpAt=0,px=0,py=0;
function wire(){
  pg.addEventListener("pointerdown",e=>{px=e.clientX;py=e.clientY;clearTimeout(lp);const s=e.target.closest("[data-a]");if(!s||!e.target.closest("#qrV,#qrR"))return;
    lp=setTimeout(()=>{lp=0;lpAt=Date.now();mark(+s.dataset.a)},550)});
  pg.addEventListener("pointermove",e=>{if(lp&&Math.hypot(e.clientX-px,e.clientY-py)>10){clearTimeout(lp);lp=0}});
  ["pointerup","pointercancel"].forEach(k=>pg.addEventListener(k,()=>{clearTimeout(lp);lp=0}));
  pg.addEventListener("contextmenu",e=>{if(e.target.closest("#qrV,#qrR"))e.preventDefault()});
  pg.addEventListener("click",e=>{const b=e.target.closest("button");
    if(menu&&!menu.hidden&&!e.target.closest(".qr-menu")&&!(b&&b.matches("[data-qm]"))){menuClose();return}
    if(!b){if(e.target.closest("#qrV,#qrR")&&Date.now()-lpAt>700&&Math.hypot(e.clientX-px,e.clientY-py)<10){setBars(!bars);menuClose()}return}
    if(b.matches("[data-qx]")){history.back();return}
    if(b.matches("[data-qm]")){if(menu&&!menu.hidden)menuClose();else menuOpen();return}
    if(b.matches("[data-qmo]")){const m=b.dataset.qmo;menuClose();if(m===mode)return;api.cfg().qMode=m==="page"?"page":undefined;api.save();setMode(m);buzz(6);return}
    if(b.matches("[data-qf]")){const v=Math.max(FSMIN,Math.min(FSMAX,fsz()+ +b.dataset.qf)),g=firstSeen();api.cfg().qFs=v===FS0?undefined:v;api.save();
      pg.style.setProperty("--qrs",v+"px");menuOpen();requestAnimationFrame(()=>toAyah(g,false));buzz(6);return}});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)pause();else resume()})}
// يطلع من التطبيق (وonPause بالتلفون): الشريطة على اللي يقراه هسه
function pause(){if(!rdOn())return;const g=mode==="read"?firstSeen():(markA>=0?markA:firstOn(cur));keep(mode==="read"?pageOfA(g):cur,g)}
// رجع للتطبيق (وonResume): إذا الودجت قلب الشريطة، نروح وياها
function resume(){if(!rdOn())return;
  const s=state(),k=s.page+":"+s.a;if(lastKept&&k!==lastKept){lastKept=k;const g=s.a>=0?s.a:firstOn(s.page);markA=s.a;
    if(mode==="page")go(s.page);else rgo(S0(g),g,true)}
  lockSync()}
// ضغطة طويلة على آية: «وقفت هنا» وتنحفظ ويا الصفحة
function mark(a){buzz(15);$$(".hl",pg).forEach(x=>x.classList.remove("hl"));markA=a;
  $$(`#qrV [data-a="${a}"],#qrR .qa[data-a="${a}"]`,pg).forEach(x=>x.classList.add("hl"));
  keep(mode==="read"?pageOfA(a):cur,a);toast("وقفت هنا")}

/* ---------- الفهرس ---------- */
const fold=s=>String(s).replace(/[ً-ٰٟـۖ-ۭ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/\s+/g," ").trim();
function idxEl(){if(!idx){idx=document.createElement("div");idx.className="qr-idx";pg.appendChild(idx)}return idx}
function idxHide(){if(idx)idx.hidden=true}
function contHtml(){const s=state();if(!s.at&&s.page<=1&&s.a<0)return"";const g=s.a>=0?s.a:firstOn(s.page);
  return `<button class="qx-cont" data-qcont><small>كمّل القراءة</small><b>${esc(aname(g))}</b>${goalLine(s)?`<span class="g">${goalLine(s)}</span>`:""}<span class="go">‹</span></button>`}
const dia=n=>`<span class="dia"><i>${ar(n)}</i></span>`;
function idxDraw(){const el=idxEl();el.hidden=false;const t=el.dataset.t||"s",z=window.YZ&&YZ.names?YZ.names():null;
  const list=t==="s"?D.s.map((x,i)=>`<button class="qi" data-qs="${i}">${dia(i+1)}<span class="tx"><b>${esc(x[0])}</b><small>${MADANI.has(i+1)?"مدنية":"مكية"} · ${ar(x[2])} آية</small></span><span class="pg">ص ${ar(x[3])}</span></button>`).join("")
    :D.j.map((x,i)=>`<button class="qi" data-qp="${x[0]}">${dia(i+1)}<span class="tx"><b>الجزء ${ar(i+1)}</b><small>${esc(D.s[x[1]-1][0])} ${ar(x[2])}</small></span><span class="pg">ص ${ar(x[0])}</span></button>`).join("");
  el.innerHTML=`<div class="qx-top"><button class="qx-z" data-qz>‹ ${esc((z&&z.z)||"زاد")}</button><h2>${esc((z&&z.q)||"القرآن الكريم")}</h2><button class="qx-g" data-qset aria-label="القراءة اليومية">⚙</button></div>
  ${contHtml()}
  <div class="qx-seg"><button data-qt="s" aria-pressed="${t==="s"}">السور ${ar(114)}</button><button data-qt="j" aria-pressed="${t==="j"}">الأجزاء ${ar(30)}</button></div>
  <label class="qx-q"><input id="qiQ" type="search" placeholder="ابحث باسم السورة أو بكلمة" autocomplete="off"></label>
  <div id="qiR"></div><div class="qx-l" id="qiL">${list}</div><p class="qi-src">${SRC}</p>`;
  const q=$("#qiQ",el);let qt=0;q.oninput=()=>{clearTimeout(qt);qt=setTimeout(()=>search(q.value),180)};
  el.onclick=idxClick;el.scrollTop=0}
function idxClick(e){const b=e.target.closest("button");if(!b)return;
  if(b.matches("[data-qz]")){history.back();return}
  if(b.matches("[data-qset]")){buzz(6);push("set");dlyDraw();return}
  if(b.matches("[data-qt]")){idx.dataset.t=b.dataset.qt;buzz(6);idxDraw();return}
  if(b.matches("[data-qcont]")){buzz(8);const s=state();reader(s.page,s.a,true);return}
  if(b.matches("[data-qs]")){buzz(6);const s=+b.dataset.qs;reader(D.s[s][3],D.s0[s]);return}
  if(b.matches("[data-qp]")){buzz(6);const p=+b.dataset.qp;reader(p,firstOn(p));return}
  if(b.matches("[data-qg]")){buzz(6);const g=+b.dataset.qg;reader(pageOfA(g),g,true);return}}

/* ---------- البحث: بالسور وبكلام الآيات سوا، بدون نت ---------- */
function sdata(){if(SF)return Promise.resolve(SF);if(!Sp)Sp=fetch("quran/s.json").then(r=>r.json()).then(j=>SF=j.a.map(fold)).catch(e=>{Sp=null;throw e});return Sp}
function search(raw){const v=fold(raw),R=$("#qiR",idx),L=$("#qiL",idx),seg=$(".qx-seg",idx);
  $$(".qi",L).forEach(b=>b.hidden=false);R.innerHTML="";seg.hidden=false;if(!v)return;
  if(/^[\d٠-٩]+$/.test(v)){const n=+v.replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d));seg.hidden=true;L.querySelectorAll(".qi").forEach(b=>b.hidden=true);
    R.innerHTML=n>=1&&n<=604?`<button class="qi" data-qp="${n}">${dia(n)}<span class="tx"><b>صفحة ${ar(n)}</b><small>${esc(D.s[surahOfPage(n)][0])}</small></span><span class="pg">ص ${ar(n)}</span></button>`:`<p class="qi-g">من ١ لـ٦٠٤</p>`;return}
  $$(".qi",L).forEach(b=>{b.hidden=!fold($("b",b).textContent).includes(v)});
  if(v.length<2)return;seg.hidden=true;
  R.innerHTML=`<p class="qi-g">يدوّر بالآيات…</p>`;
  // «الصبر» تلگى «الصبر» و«بالصبر» أول، وبعدها «صبر/اصبر/صبرا…» (نفس الكلمة بلا «ال»)
  const v2=v.split(" ").map(w=>w.length>3&&w.startsWith("ال")?w.slice(2):w).join(" ");
  sdata().then(F=>{if(fold($("#qiQ",idx).value)!==v)return;const hits=[],more=[];for(let g=0;g<F.length;g++){const k=F[g].indexOf(v);if(k>=0){hits.push([g,k,v]);continue}
      if(v2!==v){const k2=F[g].indexOf(v2);if(k2>=0)more.push([g,k2,v2])}}
    hits.push(...more);
    const sn=$$(".qi:not([hidden])",L).length;
    R.innerHTML=hits.length?`<p class="qx-h">الآيات · ${ar(hits.length)}${hits.length>80?" (أول ٨٠)":""}</p>`+hits.slice(0,80).map(([g,k,w])=>hitHtml(g,k,w)).join("")+(sn?`<p class="qx-h">السور</p>`:"")
      :sn?"":`<p class="qi-g">ماكو «${esc(raw.trim())}» بالسور ولا بالآيات</p>`})
    .catch(()=>{R.innerHTML=`<p class="qi-g">ما گدرت أفتح البحث</p>`})}
// السطر: نص الآية بخط المصحف والكلمة معلّمة (نفس رقم الكلمة بالإملائي). إذا الكلمات ما تتطابق، يبين الإملائي والكلمة معلّمة
function hitHtml(g,k,v){const s=S0(g),F=SF[g],uw=AY.w[g].split(" "),fw=F.split(" ");
  const a=F.slice(0,k).split(" ").length-1,b=F.slice(0,k+v.length).split(" ").length-1;let line;
  if(uw.length===fw.length){const lo=Math.max(0,a-4),hi=Math.min(uw.length,b+6);
    line=`<span class="u">${lo?"… ":""}${uw.slice(lo,hi).map((w,i)=>i+lo>=a&&i+lo<=b?`<mark>${esc(w)}</mark>`:esc(w)).join(" ")}${hi<uw.length?" …":""}</span>`}
  else{const lo=Math.max(0,k-40),hi=Math.min(F.length,k+v.length+50);line=`${lo?"…":""}${esc(F.slice(lo,k))}<mark>${esc(F.slice(k,k+v.length))}</mark>${esc(F.slice(k+v.length,hi))}${hi<F.length?"…":""}`}
  return `<button class="qh" data-qg="${g}"><small>${esc(D.s[s][0])} · ${ar(g-D.s0[s]+1)}</small><p>${line}</p></button>`}

/* ---------- «القراءة اليومية»: أورادي (الإعدادات) ---------- */
let wEdit=null,wDel=0,tickT=0;
function dlyHide(){if(dly)dly.hidden=true}
const hm=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");
const h12=m=>ar((Math.floor(m/60)%12||12)+":"+String(m%60).padStart(2,"0"));
const when=m=>m<300?"الليل":m<420?"بعد الفجر":m<720?"الصبح":m<1020?"الظهر":m<1170?"العصر والمغرب":"الليل";
// «صفحتين»، «نص جزء»، «ساعة» (نفس QuranDaily.amount)
function amount(k,n){if(k==="min")return n===15?"ربع ساعة":n===30?"نص ساعة":n===60?"ساعة":"ساعتين";if(k==="half")return"نص جزء";
  const w=k==="leaf"?["ورقة","ورقتين","ورقات"]:k==="rub"?["ربع حزب","ربعين","أرباع"]:k==="hizb"?["حزب","حزبين","أحزاب"]:k==="juz"?["جزء","جزأين","أجزاء"]:["صفحة","صفحتين","صفحات"];
  return n<=1?w[0]:n===2?w[1]:ar(n)+" "+(n<=10?w[2]:w[0])}
const MAXN={page:40,leaf:20,rub:16,hizb:10,juz:30};
const daysTxt=d=>d.length===7?"كل يوم":DAYS.filter((_,i)=>d.includes(i)).join(" ");
const LOCK=`<svg class="qw-lk" viewBox="0 0 24 24" aria-label="بقفل"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;
function dlyDraw(){if(!dly){dly=document.createElement("div");dly.className="qr-dly";pg.appendChild(dly)}idxHide();dly.hidden=false;
  if(wEdit)return wDraw();const s=state(),L=awrad(s),phone=!!Q();
  dly.innerHTML=`<div class="qx-top"><button class="qr-c" data-qdb aria-label="رجوع">‹</button><h2 class="s">القراءة اليومية</h2><span style="width:40px"></span></div>
  <p class="qd-l">وقت قراءة القرآن</p>
  ${oldApp()?`<p class="qd-note">حدّث «يومي» من الإعدادات حتى تضيف أكثر من وقت.</p>`:`<div class="qw-list">${L.map(w=>`<div class="qw"><button class="qw-b" data-qw="${w.id}"><b>${esc(w.name||"قراءة")} · ${h12(w.m)}</b><small>${amount(w.kind,w.n)} · ${daysTxt(w.days)}${w.lock?LOCK:""}</small></button><button class="qw-sw" data-qwon="${w.id}" aria-pressed="${!!w.on}" aria-label="${w.on?"شغّال":"طافي"}"><i class="sw"></i></button></div>`).join("")||`<p class="qd-empty">بعد ما حاطّ وقت للقراءة</p>`}</div>
  <button class="qd-add" data-qwadd>＋ وقت</button>`}
  <p class="qd-note">${phone?`كل وقت يبدي من وين وقفت. اللي بقفل يطلع فوق شاشة القفل ويبقى مفتوح لحد ما تخلص، والمكالمات تشتغل، وللطوارئ: دوس مطوّل ١٠ ثواني على الزر الصغير بالزاوية. اللي بلا قفل بس تنبيه.`:"المنبّهات تشتغل بتطبيق «يومي» بالموبايل."}</p>`;
  dly.onclick=dlyClick}
function wDraw(){const w=wEdit,all=w.days.length===7,custom=NAMES.includes(w.name)?"":w.name;
  dly.innerHTML=`<div class="qx-top"><button class="qr-c" data-qdb aria-label="رجوع">‹</button><h2 class="s">${w.id?"تعديل الوقت":"وقت جديد"}</h2><span style="width:40px"></span></div>
  <p class="qd-l">الاسم</p><div class="qd-ch">${NAMES.map(n=>`<button data-qwn="${n}" aria-pressed="${w.name===n}">${n}</button>`).join("")}</div>
  <input class="qd-in" id="qwName" maxlength="24" placeholder="أو اكتب اسم" value="${esc(custom)}">
  <p class="qd-l">الساعة</p><label class="qd-t"><input type="time" id="qdT" value="${hm(w.m)}"><small>${when(w.m)}</small></label>
  <p class="qd-l">الكمية</p><div class="qd-ch">${KINDS.map(([k,l])=>`<button data-qwk="${k}" aria-pressed="${w.kind===k}">${l}</button>`).join("")}</div>
  ${w.kind==="min"?`<div class="qd-ch qd-sub">${MINS.map(([n,l])=>`<button data-qwm="${n}" aria-pressed="${w.n===n}">${l}</button>`).join("")}</div>`
    :w.kind==="half"?"":`<div class="qd-cnt"><button data-qwc="-1" aria-label="أقل"${w.n<=1?" disabled":""}>−</button><b>${amount(w.kind,w.n)}</b><button data-qwc="1" aria-label="أكثر"${w.n>=MAXN[w.kind]?" disabled":""}>＋</button></div>`}
  <p class="qd-l">الأيام</p><div class="qd-ch dd"><button class="all" data-qwall aria-pressed="${all}">كل يوم</button>${DAYS.map((l,i)=>`<button data-qwd="${i}" aria-pressed="${!all&&w.days.includes(i)}">${l}</button>`).join("")}</div>
  <button class="qd-on" data-qwlock aria-pressed="${!!w.lock}"><span class="tx"><b>ما أطلع لحد ما أخلص</b><small>${w.lock?"يطلع فوق شاشة القفل ويقفل التليفون لحد «خلصت ✓»":"بلا قفل: بس تنبيه بوقته"}</small></span><i class="sw"></i></button>
  <button class="qd-try" data-qwsave>${w.id?"حفظ":"ضيف الوقت"}</button>
  <button class="qd-perm" data-qdtry>شوف شلون يطلع ‹</button>
  ${w.id?`<button class="qd-del" data-qwdel>${wDel?"متأكد؟ دوس مرة ثانية":"حذف"}</button>`:""}`;
  const t=$("#qdT",dly);t.onchange=()=>{const m=/^(\d\d):(\d\d)$/.exec(t.value);if(!m)return;w.m=+m[1]*60+ +m[2];$(".qd-t small",dly).textContent=when(w.m)};
  const nm=$("#qwName",dly);nm.oninput=()=>{w.name=nm.value.trim();$$("[data-qwn]",dly).forEach(b=>b.setAttribute("aria-pressed","false"))}}
function wOpen(w){wEdit=w?JSON.parse(JSON.stringify(w)):{name:"",m:330,kind:"page",n:2,days:[0,1,2,3,4,5,6],lock:false,on:true};wDel=0;push("ward");dlyDraw()}
function dlyClick(e){const b=e.target.closest("button");if(!b)return;
  if(b.matches("[data-qdb]")){history.back();return}
  if(!wEdit){const L=awrad();
    if(b.matches("[data-qwadd]")){buzz(6);wOpen(null);return}
    if(b.matches("[data-qw]")){buzz(6);wOpen(L.find(w=>w.id===+b.dataset.qw));return}
    if(b.matches("[data-qwon]")){const w=L.find(x=>x.id===+b.dataset.qwon);if(!w)return;w.on=!w.on;setAwrad(L);buzz(8);dlyDraw();return}
    return}
  const w=wEdit;
  if(b.matches("[data-qwn]")){w.name=w.name===b.dataset.qwn?"":b.dataset.qwn;buzz(6);wDraw();return}
  if(b.matches("[data-qwk]")){const k=b.dataset.qwk;if(k!==w.kind){w.kind=k;w.n=k==="min"?30:k==="page"||k==="leaf"?2:1}buzz(6);wDraw();return}
  if(b.matches("[data-qwm]")){w.n=+b.dataset.qwm;buzz(6);wDraw();return}
  if(b.matches("[data-qwc]")){w.n=Math.max(1,Math.min(MAXN[w.kind]||1,w.n+ +b.dataset.qwc));buzz(6);wDraw();return}
  if(b.matches("[data-qwall]")){w.days=[0,1,2,3,4,5,6];buzz(6);wDraw();return}
  if(b.matches("[data-qwd]")){const i=+b.dataset.qwd;w.days=w.days.length===7?[i]:w.days.includes(i)?w.days.filter(x=>x!==i):[...w.days,i].sort();if(!w.days.length)w.days=[0,1,2,3,4,5,6];buzz(6);wDraw();return}
  if(b.matches("[data-qwlock]")){w.lock=!w.lock;buzz(8);wDraw();return}
  if(b.matches("[data-qwsave]")){const L=awrad(),i=L.findIndex(x=>x.id&&x.id===w.id);if(i>=0)L[i]=w;else L.push(w);setAwrad(L);buzz([10,30,10]);
    wEdit=null;history.back();return}
  if(b.matches("[data-qwdel]")){if(!wDel){wDel=1;buzz(8);wDraw();return}setAwrad(awrad().filter(x=>x.id!==w.id));buzz([20,40]);wEdit=null;history.back();return}
  if(b.matches("[data-qdtry]")){buzz(8);const t=Object.assign({},w,{id:w.id||0});
    if(Q()&&Q().lockTest){try{Q().lockTest(JSON.stringify(t))}catch(x){}setTimeout(lockSync,250)}
    else{const s=state();lockStart(Object.assign(t,{start:s.page,a:s.a,test:true,open:true,at:Date.now()}))}return}}

/* ---------- الورد هسه ---------- */
// بقفل: فوق شاشة القفل، ما يطلع ولا يرجع لحد «خلصت ✓». بلا قفل: خط رفيع جوه بس.
const held=()=>!!(lockO&&lockO.lock);
// fromNote: انفتح من تنبيه الورد. الورد بلا قفل يبين بس من التنبيه، أو إذا القرآن مفتوح وهو بادي بيه.
function lockSync(fromNote){if(!Q()||!Q().lock)return;let L=null;try{L=JSON.parse(Q().lock()||"null")}catch(e){}
  if(!L||!L.on){if(lockO&&!lockO.test)lockStop(false);return}
  if(L.kind==null){L.kind="page";L.n=L.need||1;L.lock=!L.test;L.open=true} // تطبيق 1.27
  if(lockO&&lockO.at===L.at)return;
  if(L.lock||L.test||fromNote===true||L.open&&rdOn())lockStart(L)}
function lockStart(L){if(!api)return;const s=state();
  lockO={at:L.at||Date.now(),id:L.id||0,name:L.name||"",kind:L.kind||"page",n:L.n||1,lock:!!L.lock,test:!!L.test,start:L.start||s.page,a:L.a==null?-1:L.a,spent:L.spent||0,ok:false};
  if(!L.open){lockO.start=s.page;lockO.a=s.a;if(Q()&&Q().wardOpen)try{Q().wardOpen(s.page,s.a)}catch(e){}} // يبدي من الشريطة هسه
  const wasOpen=rdOn();if(window.YZ&&!YZ.isOpen())YZ.open();ensure();pg.hidden=false;document.body.classList.add("qr-on");document.body.classList.toggle("qr-lock",lockO.lock);dlyHide();idxHide();
  both().then(()=>{if(!lockO)return;aim(lockO);if(lockO.lock||!wasOpen)reader(lockO.start,lockO.a>=0?lockO.a:null);lockUi();lockCheck();
    clearInterval(tickT);if(lockO.kind==="min")tickT=setInterval(tick,5000)})}
// النهاية من صفحة البداية: صفحات وأوراق بالعدد؛ الربع والحزب والجزء على حدودهن الحقيقية بالمصحف.
// إذا هو بالنص الأول من الربع/الحزب/الجزء يكمله ويا الباقي من الكمية، وإذا عبر نصه (بالصفحات) تنحسب الكمية من اللي بعده.
function aim(o){o.end=0;o.endG=-1;o.to="";if(o.kind==="min")return;
  if(o.kind==="page"||o.kind==="leaf"){o.end=Math.min(604,o.start+(o.kind==="leaf"?2:1)*o.n-1);o.endG=lastOn(o.end);return}
  const g0=o.a>=0&&pageOfA(o.a)===o.start?o.a:firstOn(o.start),u=o.kind==="rub"?1:o.kind==="juz"?8:4,B=[];
  for(let i=0;i<240;i+=u)B.push(RUB[i]);B.push(6236);
  let k=0;while(k+1<B.length-1&&B[k+1]<=g0)k++;
  const p0=pageOfA(B[k]),p1=B[k+1]<6236?pageOfA(B[k+1]):605,fr=p1>p0?(o.start-p0)/(p1-p0):0,e=Math.min(B.length-1,k+o.n+(fr>=.5?1:0));
  o.endG=B[e]-1;o.end=pageOfA(o.endG);
  o.to=o.kind==="juz"?"آخر الجزء "+ar(e):o.kind==="rub"?"آخر الربع":"آخر الحزب "+ar(e)}
function lockUi(){if(!lockEl){lockEl=document.createElement("div");lockEl.className="qr-lk";pg.appendChild(lockEl)}lockEl.hidden=false;
  lockEl.classList.toggle("thin",!lockO.lock);
  lockEl.innerHTML=`${lockO.lock?`<button class="qr-sos" data-qsos aria-label="طوارئ: دوس مطوّل ١٠ ثواني"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/><circle class="r" cx="18" cy="18" r="15"/></svg><i>!</i></button>`:""}
  <div class="qr-lb"><span id="qrLn"></span><button id="qrDone" disabled>خلصت ✓</button>${lockO.test?`<button class="qr-lt" data-qlt>سد التجربة</button>`:""}</div>`;
  const sos=$("[data-qsos]",lockEl);
  if(sos){let t=0;const stop=()=>{clearTimeout(t);sos.classList.remove("hold")};
    sos.onpointerdown=e=>{e.preventDefault();sos.classList.add("hold");t=setTimeout(()=>{stop();buzz([40,60,40]);lockStop(false,true)},10000)};
    ["pointerup","pointerleave","pointercancel"].forEach(k=>sos.addEventListener(k,stop));sos.oncontextmenu=e=>e.preventDefault()}
  $("#qrDone",lockEl).onclick=()=>{if(!lockO||!lockO.ok)return;buzz([20,30,40]);lockStop(true)};
  const lt=$("[data-qlt]",lockEl);if(lt)lt.onclick=()=>lockStop(false,true);
  $(".qr-top [data-qx]",pg).hidden=lockO.lock}
// العداد الخفي للورد بالوقت: يمشي بس والقرآن قدامه، وما يبين رقم
function tick(){if(!lockO||lockO.kind!=="min"){clearInterval(tickT);return}if(document.hidden||!rdOn())return;
  lockO.spent+=5000;if(Q()&&Q().wardSpent&&lockO.spent%15000===0)try{Q().wardSpent(lockO.spent)}catch(e){}lockCheck()}
// «خلصت ✓» يشتغل بس لما توصل لآخر الكمية (أو يخلص الوقت)
function lockCheck(){if(!lockO||!lockEl||!AY)return;const o=lockO;let ok=false;
  if(o.kind==="min")ok=o.spent>=o.n*60000;
  else if(mode==="page")ok=cur>=o.end;
  else{const el=rslot(curS),a=el&&$(`.qa[data-a="${o.endG}"]`,el);if(S0(o.endG)<curS)ok=true;else if(a){const r=a.getBoundingClientRect();ok=r.bottom<=el.getBoundingClientRect().bottom-8}}
  if(!o.ok&&ok)buzz(10);o.ok=o.ok||ok;
  const nm=(o.name?"قراءة "+o.name:"القراءة")+" · "+amount(o.kind,o.n),left=Math.max(0,o.end-Math.max(cur,o.start)+(o.ok?0:1));
  $("#qrLn",lockEl).textContent=o.ok?(o.kind==="min"?"خلص الوقت":"وصلت آخر المقدار"):o.kind==="min"?nm
    :o.to?`لحد ${o.to} · صفحة ${ar(o.end)}`:`الباقي ${left<=1?"هالصفحة":ar(left)+" صفحات"} · لحد صفحة ${ar(o.end)}`;
  $("#qrDone",lockEl).disabled=!o.ok}
// يطلع من القراءة والورد بلا قفل بعده ما خلص: الخط يختفي والورد يبقى لحد ما يرجع
function lockHide(){if(!lockO)return;if(lockO.test){lockStop(false);return}if(Q()&&Q().wardSpent&&lockO.spent)try{Q().wardSpent(lockO.spent)}catch(e){}
  lockO=null;clearInterval(tickT);if(lockEl)lockEl.hidden=true;document.body.classList.remove("qr-lock")}
function lockStop(done,sos){const o=lockO;lockO=null;clearInterval(tickT);if(lockEl)lockEl.hidden=true;document.body.classList.remove("qr-lock");if(pg)$(".qr-top [data-qx]",pg).hidden=false;
  if(Q()&&Q().lockEnd){try{Q().lockEnd(!!done)}catch(e){}setTimeout(()=>lockSync(),400)} // الورد اللي ينتظر يجي هسه
  else if(done&&o&&!o.test&&o.id){const l=local();l.wdone=[...(l.wdone||[]),o.id];putLocal(l)}
  if(done)toast("تقبّل الله ✓");else if(sos)toast("طلعت")}

/* ---------- المصدر: سطر بالفهرس وبالإعدادات ---------- */
const SRC="خطوط القرآن من Quran Foundation · مصحف المدينة النبوية (مجمع الملك فهد) · ترتيب الصفحات من QUL · نص البحث من مجمع الملك فهد";
function srcHtml(){return `<p class="meta qi-src2">خطوط القرآن من Quran Foundation</p>`}

/* ---------- كارت «كمّل القراءة» بـ«زاد» ---------- */
function cardHtml(){const s=state();if(!D||!AY){both().then(()=>{if(window.YZ&&YZ.refresh)YZ.refresh()}).catch(()=>{});return""}
  if(!s.at&&s.page<=1&&s.a<0)return"";const g=goalLine(s),a=s.a>=0?s.a:firstOn(s.page);
  return `<button class="zd-qc" data-zqc="${s.page}"><small>كمّل القراءة</small><b>${esc(aname(a))}</b>${g?`<span class="g">${g}</span>`:""}<span class="ar">‹</span></button>`}

// فتح مباشر: ?quran=i الفهرس، ?quran=<صفحة>[&a=<آية>] القراءة. بأول تحميل (init) ومن YS.open والتطبيق مفتوح (shell.js)
function deep(P){const q=P.get("quran"),a=P.get("a");if(q==null)return false;if(window.YZ&&!YZ.isOpen())YZ.open();
  if(q==="i")open();else open(+q||state().page||1,a!=null?+a:null);if(window.YS)YS.shown();return true}
function init(o){api=o;const P=new URLSearchParams(location.search);
  if(P.has("widgetsync"))return;
  const note=P.has("qlock");
  if(P.get("quran")!=null){const D=new URLSearchParams(P);["quran","a","qlock"].forEach(x=>P.delete(x));history.replaceState(null,"",location.pathname+(P.toString()?"?"+P:""));
    setTimeout(()=>deep(D),0)}
  setTimeout(()=>lockSync(note),300);document.addEventListener("visibilitychange",()=>{if(!document.hidden)lockSync()})}
window.YQ={init,deep,open,close,isOpen,back,depth,cardHtml,state,srcHtml,lock:lockSync,pause,resume};
})();
