/* «القرآن الكريم» داخل «زاد» (docs/quran/README.md): ٦٠٤ صفحة بنص Tanzil (Uthmani 1.1) وخط Amiri Quran.
   - quran/q.json: نص Tanzil كما هو بلا أي تغيير (t)، وأول آية بكل صفحة (p) وبكل جزء (j) من quran-data.xml، والسور (s)
     وبسملة كل سورة (b). quran/amiri-quran.ttf: الخط الوحيد. الاثنين داخل الـAPK (ينخدمن من التلفون): بلا نت من أول مرة.
   - كل صفحة بيها آياتها بالضبط، justify وآخر سطر بالنص. حجم الخط يتحسب لكل صفحة لحالها (fit) حتى تملي الإطار.
   - «شريط القراءة» {page, a}: وحدة بكل التطبيق والودجتين. ينحفظ لحاله لما تطلع.
   - بالذاكرة بس ٣ صفحات (الحالية واللي جنبها)؛ الباقي فارغ.
   zad.js يناديها: YQ.init(api)، YQ.open(page)، YQ.cardHtml()، YQ.close(). app.js: YQ.srcHtml() بالإعدادات. */
(function(){
const Q=()=>window.YawmiQuran;
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ar=n=>String(n).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
const buzz=p=>{const m=window.YM;if(m)m.haptic(p);else try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const GOALS=[[0,"بلا"],[1,"صفحة"],[5,"ربع جزء"],[10,"نص جزء"],[20,"جزء"]];
const COUNT_MS=15000; // الصفحة تنحسب لما تقلبها بعد ١٥ ثانية عليها

let skipPop=0; // الرجوع اللي سويناه احنا (زر «زاد» فوق): مو زر الرجوع
let api=null,D=null,Dp=null,fontOk=false,fontP=null,pg=null,V=null,cur=1,mode="page",W=0,H=0,bars=false,enteredAt=0,markP=0,markA=-1,saveT=0,scrT=0,idx=null;
const fits=new Map(); // "صفحة|عرض|طول" → [حجم الخط، ارتفاع السطر]

/* ---------- البيانات ---------- */
// بالتطبيق: من الـAPK (quran/… ينخدم من التلفون، بلا نت). بالمتصفح بلا التلفون: نفس الملفات من مستودع yawmi-releases.
const BASE=()=>Q()?"quran/":"https://raw.githubusercontent.com/mode11h19-cell/yawmi-releases/main/quran/";
function data(){if(D)return Promise.resolve(D);if(!Dp)Dp=fetch(BASE()+"q.json").then(r=>r.json()).then(j=>D=j).catch(e=>{Dp=null;throw e});return Dp}
const last=(a,g)=>{let lo=0,hi=a.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(a[m]<=g)lo=m;else hi=m-1}return lo};
let S0=null;const surahOf=g=>last(S0||(S0=D.s.map(x=>x[2])),g); // 0..113
const pageOf=g=>last(D.p,g)+1;                       // 1..604
const pageEnd=p=>p<604?D.p[p]:6236;                  // أول آية بعد الصفحة
const surahOfPage=p=>surahOf(D.p[p-1]);
const juzOfPage=p=>last(D.j,D.p[p-1])+1;
const ayahNo=g=>g-D.s[surahOf(g)][2]+1;

/* ---------- الشريطة وقراءتي اليومية (بالتلفون؛ بالمتصفح بهالجهاز) ---------- */
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
function local(){let o={};try{o=JSON.parse(localStorage.getItem("yawmi-q")||"{}")}catch(e){}if(o.day!==today()){o.day=today();o.done=0;o.seen=[]}return o}
function putLocal(o){try{localStorage.setItem("yawmi-q",JSON.stringify(o))}catch(e){}}
function state(){if(Q()){try{const s=JSON.parse(Q().state());if(s)return s}catch(e){}}const o=local();return {page:o.page||1,a:o.a==null?-1:o.a,at:o.at||0,goal:o.goal||0,done:o.done||0}}
function keep(page,a,quiet){if(Q()){try{quiet&&Q().at?Q().at(page,a):Q().set(page,a)}catch(e){}return}const o=local();o.page=page;o.a=a;o.at=Date.now();putLocal(o)}
function read(page){if(Q()){try{Q().read(page)}catch(e){}return}const o=local();if(!o.seen.includes(page)){o.seen.push(page);o.done=(o.done||0)+1;putLocal(o)}}
function setGoal(n){if(Q()){try{Q().goal(n)}catch(e){}return}const o=local();o.goal=n;putLocal(o)}
function goalLine(s){s=s||state();if(!s.goal)return"";return s.done>=s.goal?"✓":`اليوم ${ar(Math.min(s.done,s.goal))} من ${ar(s.goal)}`}

/* ---------- الخط (واحد، داخل التطبيق) ---------- */
function font(){if(fontOk)return Promise.resolve();
  if(!fontP){const f=new FontFace("AQ",`url(${BASE()}amiri-quran.ttf)`,{display:"block"});
    fontP=f.load().then(()=>{document.fonts.add(f);fontOk=true}).catch(()=>{fontOk=true})}
  return fontP}

/* ---------- رسم الصفحة ---------- */
// علامة الآية: ۝ وبعدها الرقم (Amiri Quran يرسمها دائرة بيها الرقم)، ملزوقة بآخر كلمة بمسافة ما تنكسر
function pageHtml(p){const s0=surahOfPage(p);let h="",par="";
  const flush=()=>{if(par){h+=`<p class="qt">${par}</p>`;par=""}};
  for(let g=D.p[p-1];g<pageEnd(p);g++){const n=ayahNo(g),s=surahOf(g);
    if(n===1){flush();h+=`<div class="qsh"><span>سورة ${esc(D.s[s][0])}</span></div>`;if(D.b[s])h+=`<div class="qbs">${esc(D.b[s])}</div>`}
    par+=`<span data-a="${g}">${esc(D.t[g])}\u00a0\u06dd${ar(n)}</span> `}
  flush();
  return `<div class="qpg"><div class="qhd"><span>${esc(D.s[s0][0])}</span><span>الجزء ${ar(juzOfPage(p))}</span></div>
  <div class="qbx"><div class="qin">${h}</div></div><div class="qno">${ar(p)}</div></div>`}
/* الحجم: أكبر خط تدخل بيه الصفحة كلها بالإطار، وبعدين السطور تتباعد شوية حتى ما يبقى فراغ تحت.
   الصفحات القصيرة (الفاتحة، أول البقرة) لها حد، وتبقى بالنص. */
function fit(p,el){const bx=$(".qbx",el),qin=$(".qin",el);if(!bx||!qin)return;
  const Hh=bx.clientHeight,Ww=bx.clientWidth,key=p+"|"+Ww+"|"+Hh,c=fits.get(key);
  const put=(f,l)=>{qin.style.fontSize=f+"px";qin.style.lineHeight=String(l)};
  if(c){put(c[0],c[1]);return}
  const ok=()=>qin.scrollHeight<=Hh+0.5;
  let lo=10,hi=Math.min(Ww/9,Hh/4.5);put(hi,1.9);
  if(!ok()){for(let k=0;k<14;k++){const m=(lo+hi)/2;put(m,1.9);if(ok())lo=m;else hi=m}}else lo=hi;
  let a=1.9,b=2.6;put(lo,b);if(!ok()){for(let k=0;k<10;k++){const m=(a+b)/2;put(lo,m);if(ok())a=m;else b=m}}else a=b;
  put(lo,a);fits.set(key,[lo,a])}
function slot(p){return V&&V.children[p-1]}
function fill(p,force){const el=slot(p);if(!el||!D)return;if(!force&&el.firstChild)return;
  if(!fontOk){el.innerHTML=`<div class="qpg"><div class="qwait">…</div></div>`;font().then(()=>fill(p,true));return}
  el.innerHTML=pageHtml(p);fit(p,el);
  if(markP===p&&markA>=0)$$(`[data-a="${markA}"]`,el).forEach(s=>s.classList.add("hl"))}
function windowAt(p){for(let k=Math.max(1,p-1);k<=Math.min(604,p+1);k++)fill(k);
  // ٣ صفحات بس بالذاكرة
  $$(".qs",V).forEach((el,i)=>{if(Math.abs(i+1-p)>1&&el.firstChild)el.innerHTML=""})}

/* ---------- الصفحة والتنقل ---------- */
function geom(){W=pg.clientWidth;H=pg.clientHeight;const r=document.documentElement.style;
  const cs=getComputedStyle(document.documentElement),sat=parseFloat(cs.getPropertyValue("--sat"))||0,sab=parseFloat(cs.getPropertyValue("--sab"))||0;
  const top=sat+30,bot=sab+30;
  pg.style.setProperty("--qw",W+"px");pg.style.setProperty("--qh",H+"px");
  pg.style.setProperty("--qtop",top+"px");pg.style.setProperty("--qbot",bot+"px")}
function ensure(){if(pg)return;pg=document.createElement("section");pg.id="qrPg";pg.hidden=true;pg.setAttribute("aria-label","القرآن الكريم");
  pg.innerHTML=`<div id="qrV"></div>
  <div class="qr-top" hidden><button class="qr-b" data-qx>→ <span id="qrZ"></span></button><b id="qrS"></b><button class="qr-b" data-qi>الفهرس</button></div>
  <div class="qr-bot" hidden><span id="qrN"></span><small id="qrG"></small></div><div class="qr-toast" id="qrT" hidden></div>`;
  document.body.appendChild(pg);V=$("#qrV",pg);V.innerHTML=Array.from({length:604},(_,i)=>`<div class="qs" data-p="${i+1}"></div>`).join("");
  V.addEventListener("scroll",onScroll,{passive:true});wire();addEventListener("resize",()=>{if(isOpen()){const p=cur;geom();go(p,true)}})}
function isOpen(){return !!(pg&&!pg.hidden)}
function curFromScroll(){return mode==="page"?Math.round(Math.abs(V.scrollLeft)/W)+1:Math.round(V.scrollTop/H)+1}
function onScroll(){clearTimeout(scrT);scrT=setTimeout(()=>{const p=Math.max(1,Math.min(604,curFromScroll()));if(p!==cur)setCur(p)},mode==="page"?60:90)}
function setCur(p){const was=cur,now=Date.now();
  if(p===was+1&&now-enteredAt>=COUNT_MS)read(was);
  cur=p;enteredAt=now;windowAt(p);barsText();
  clearTimeout(saveT);saveT=setTimeout(()=>keep(cur,markP===cur?markA:-1,true),400)}
function go(p,instant){p=Math.max(1,Math.min(604,p));cur=p;enteredAt=Date.now();
  if(mode==="page")V.scrollLeft=-(p-1)*W;else V.scrollTop=(p-1)*H;windowAt(p);barsText()}
function setMode(m){mode=m==="scroll"?"scroll":"page";pg.classList.toggle("scroll",mode==="scroll");pg.classList.toggle("paged",mode==="page");geom();go(cur,true)}

function open(page,a){if(!api)return;ensure();
  const s=state(),p=page||s.page||1;markP=0;markA=-1;
  if(a!=null&&a>=0){markP=p;markA=a}else if(!page&&s.a>=0){markP=s.page;markA=s.a}
  pg.hidden=false;document.body.classList.add("qr-on");bars=false;showBars();
  try{history.pushState({zq:1},"")}catch(e){}
  if(Q())try{Q().keep(true)}catch(e){}
  Promise.all([data(),font()]).then(()=>{geom();mode=(api.cfg().qMode==="scroll")?"scroll":"page";pg.classList.toggle("scroll",mode==="scroll");pg.classList.toggle("paged",mode==="page");
    go(p,true);if(markA>=0&&markP===p)setTimeout(()=>underline(p,markA),350)})
    .catch(()=>{api.toast("ما گدرت أفتح المصحف");close(true)})}
// المرة الجاية: الآية اللي وقفت عليها عليها خط رفيع لثانيتين
function underline(p,a){const el=slot(p);if(!el)return;const s=$$(`[data-a="${a}"]`,el);s.forEach(x=>x.classList.add("ul"));setTimeout(()=>s.forEach(x=>x.classList.remove("ul")),2000)}
// tellHistory=false: الرجوع جاي من زر الرجوع (popstate) فالخطوة انشالت
function close(fromPop){if(!isOpen())return 0;keep(cur,markP===cur?markA:-1,false);
  pg.hidden=true;document.body.classList.remove("qr-on");idxClose();if(Q())try{Q().keep(false)}catch(e){}
  $$(".qs",V).forEach(el=>{el.innerHTML=""});
  if(!fromPop){skipPop=1;try{history.back()}catch(e){skipPop=0}}
  if(window.YZ&&YZ.refresh)YZ.refresh();return 1}

/* ---------- الشريطين (دوسة) ---------- */
function showBars(){$(".qr-top",pg).hidden=!bars;$(".qr-bot",pg).hidden=!bars;barsText()}
function barsText(){if(!pg||!D)return;const z=window.YZ&&YZ.names?YZ.names():null;$("#qrZ",pg).textContent=(z&&z.z)||"زاد";
  $("#qrS",pg).textContent=D.s[surahOfPage(cur)][0];$("#qrN",pg).textContent="صفحة "+ar(cur);$("#qrG",pg).textContent=goalLine()}
function toast(t){const e=$("#qrT",pg);e.textContent=t;e.hidden=false;clearTimeout(e._t);e._t=setTimeout(()=>e.hidden=true,1600)}

let lp=0,lpAt=0,px=0,py=0;
function wire(){
  V.addEventListener("pointerdown",e=>{px=e.clientX;py=e.clientY;clearTimeout(lp);const s=e.target.closest("[data-a]");if(!s)return;
    lp=setTimeout(()=>{lp=0;lpAt=Date.now();mark(+s.dataset.a)},550)});
  V.addEventListener("pointermove",e=>{if(lp&&Math.hypot(e.clientX-px,e.clientY-py)>10){clearTimeout(lp);lp=0}});
  ["pointerup","pointercancel"].forEach(k=>V.addEventListener(k,()=>{clearTimeout(lp);lp=0}));
  V.addEventListener("contextmenu",e=>e.preventDefault());
  V.addEventListener("click",()=>{if(Date.now()-lpAt<700)return;bars=!bars;showBars()});
  pg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
    if(b.matches("[data-qx]")){close(false);return}
    if(b.matches("[data-qi]")){idxOpen();return}});
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&isOpen())keep(cur,markP===cur?markA:-1,false)})}
// ضغطة طويلة على آية: تتظلّل خفيف و«وقفت هنا»، وتنحفظ ويا الصفحة
function mark(a){buzz(15);$$(".hl",V).forEach(x=>x.classList.remove("hl"));markP=cur;markA=a;
  const el=slot(cur);if(el)$$(`[data-a="${a}"]`,el).forEach(x=>x.classList.add("hl"));
  keep(cur,a,false);toast("وقفت هنا")}

/* ---------- الفهرس ---------- */
const fold=s=>String(s).replace(/[ً-ْٰـ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").trim();
function idxOpen(){if(!D)return;if(!idx){idx=document.createElement("div");idx.className="qr-idx";pg.appendChild(idx)}
  idx.hidden=false;idx.dataset.t=idx.dataset.t||"s";idxDraw();try{history.pushState({zq:2},"")}catch(e){}}
function idxClose(){if(idx)idx.hidden=true}
function idxDraw(){const s=state(),cs=surahOfPage(cur),cj=juzOfPage(cur),t=idx.dataset.t;
  const list=t==="s"?D.s.map((x,i)=>{const p=pageOf(x[2]);return `<button class="qi${i===cs?" on":""}" data-qp="${p}"><span class="no">${ar(i+1)}</span><b>${esc(x[0])}</b><small>${ar(x[1])} آية</small><span class="pg">${ar(p)}</span></button>`}).join("")
    :D.j.map((g,i)=>{const p=pageOf(g);return `<button class="qi${i+1===cj?" on":""}" data-qp="${p}"><span class="no">${ar(i+1)}</span><b>الجزء ${ar(i+1)}</b><small>${esc(D.s[surahOf(g)][0])} ${ar(ayahNo(g))}</small><span class="pg">${ar(p)}</span></button>`}).join("");
  idx.innerHTML=`<div class="qi-top"><button class="qr-b" data-qc>✕</button><b>الفهرس</b><span></span></div>
  <div class="qi-tabs"><button data-qt="s" aria-pressed="${t==="s"}">السور</button><button data-qt="j" aria-pressed="${t==="j"}">الأجزاء</button></div>
  <label class="qi-q"><input id="qiQ" type="search" placeholder="اسم السورة أو رقم الصفحة" autocomplete="off"></label>
  <div class="qi-l" id="qiL">${list}</div>
  <div class="qi-set"><b>شلون تقرا</b><div class="seg">${[["page","صفحة صفحة"],["scroll","تمرير لتحت"]].map(([k,l])=>`<button data-qm="${k}" aria-pressed="${mode===k}">${l}</button>`).join("")}</div>
  <b>قراءتي اليومية</b><div class="seg">${GOALS.map(([n,l])=>`<button data-qg="${n}" aria-pressed="${(s.goal||0)===n}">${l}</button>`).join("")}</div>
  ${s.goal?`<p class="qi-g">${goalLine(s)}</p>`:""}
  <p class="qi-src">${SRC}</p></div>`;
  const q=$("#qiQ",idx);q.oninput=()=>{const v=fold(q.value);$$(".qi",idx).forEach(b=>b.hidden=false);if(!v)return;
    if(/^[\d٠-٩]+$/.test(v)){const n=+v.replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d));$("#qiL",idx).innerHTML=n>=1&&n<=604?`<button class="qi" data-qp="${n}"><b>صفحة ${ar(n)}</b><small>${esc(D.s[surahOfPage(n)][0])}</small><span class="pg">${ar(n)}</span></button>`:`<p class="qi-g">من ١ لـ٦٠٤</p>`;return}
    $$(".qi",idx).forEach(b=>{b.hidden=!fold($("b",b).textContent).includes(v)})};
  idx.onclick=e=>{const b=e.target.closest("button");if(!b)return;
    if(b.matches("[data-qc]")){history.back();return}
    if(b.matches("[data-qt]")){idx.dataset.t=b.dataset.qt;idxDraw();return}
    if(b.matches("[data-qm]")){api.cfg().qMode=b.dataset.qm==="scroll"?"scroll":undefined;api.save();setMode(b.dataset.qm);idxDraw();buzz(6);return}
    if(b.matches("[data-qg]")){setGoal(+b.dataset.qg);idxDraw();barsText();buzz(6);return}
    if(b.matches("[data-qp]")){const p=+b.dataset.qp;buzz(6);history.back();setTimeout(()=>go(p,true),30)}};
  const on=$(".qi.on",idx);if(on)setTimeout(()=>on.scrollIntoView({block:"center"}),0)}

// رجوع التلفون: الفهرس، بعدين المصحف (zad.js يسأل قبل خطواته)
function back(){if(skipPop){skipPop=0;return true}if(idx&&!idx.hidden){idxClose();return true}if(isOpen()){close(true);return true}return false}

/* ---------- المصدر: سطر بالفهرس وبالإعدادات ---------- */
const SRC="نص القرآن من Tanzil.net · الخط Amiri Quran";
function srcHtml(){return `<p class="meta qi-src2">نص القرآن من Tanzil.net</p>`}

/* ---------- كارت «كمّل القراءة» بـ«زاد» ---------- */
function cardHtml(){const s=state();if(!D){data().then(()=>{if(window.YZ&&YZ.refresh)YZ.refresh()}).catch(()=>{});return""}
  if(!s.at&&s.page<=1)return"";const g=goalLine(s);
  return `<button class="zd-qc" data-zqc="${s.page}"><small>كمّل القراءة</small><b>${esc(D.s[surahOfPage(s.page)][0])} · صفحة ${ar(s.page)}</b>${g?`<span class="g">${g}</span>`:""}<span class="ar">‹</span></button>`}

function init(o){api=o;const P=new URLSearchParams(location.search),q=P.get("quran");
  if(q){const a=P.get("a");["quran","a"].forEach(x=>P.delete(x));history.replaceState(null,"",location.pathname+(P.toString()?"?"+P:""));
    setTimeout(()=>{if(window.YZ)YZ.open();open(+q||0,a!=null?+a:null)},0)}}
const depth=()=>isOpen()?1+(idx&&!idx.hidden?1:0):0;
window.YQ={init,open,close,isOpen,back,depth,cardHtml,state,srcHtml};
})();
