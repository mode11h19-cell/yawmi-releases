/* «بطايقي»: البطايق والتعبئة اليومية (docs/cards-addon).
   البيانات ما تنحفظ هنا ولا بالنت: كلها بالتلفون، مشفّرة (Android Keystore) عبر الجسر window.YawmiCards (APK 1.21+).
   الجسر يرجّع الحالة كلها بعد كل تغيير: {cards, tops, log, today, due}. هنا بس الرسم.
   app.js يناديها: YC.init({cfg, save, show, hide, toast}). بالمتصفح (بلا الجسر) تبين ملاحظة بس. */
(function(){
const B=()=>window.YawmiCards;
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const YMx=()=>window.YM;
const buzz=p=>{const m=YMx();if(m)m.haptic(p);else try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const calm=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;

let api=null,st=null,tab="cards",q="",pg=null,cur=null,seen={cards:0,top:0},delArm=null;
// v1.22 (تحديث ٢): ١٠ ألوان. [المفتاح، الاسم، كتابة غامقة؟]. الألوان الخمسة القديمة (c) تروح لأقرب واحد بـkOf.
const COLORS=[["k1","أونيكس"],["k2","تيتانيوم"],["k3","فضي",1],["k4","ذهبي"],["k5","شامبانيا",1],["k6","زمرّدي"],["k7","كحلي ليلي"],["k8","خمري"],["k9","بنفسجي ملكي"],["k10","نحاسي"]];
const OLD={c1:"k1",c2:"k3",c3:"k1",c4:"k2",c5:"k2"};
const kOf=c=>COLORS.some(x=>x[0]===c.k)?c.k:OLD[c.c]||"k1";
const kCls=k=>k+((COLORS.find(x=>x[0]===k)||[])[2]?" dk-t":"");
const CATS0=["شخصي","شغل","رصيد","توفير"];
// «رقم الحساب» (tr): هو اللي ينسخ بأي زر نسخ سريع. إذا ماكو، رقم البطاقة.
const qNo=c=>digits(c.tr)?[c.tr,"رقم الحساب"]:[c.no,"رقم البطاقة"];
const v2=()=>!!(B()&&typeof B().meta==="function"); // APK 1.22+ يحفظ رقم الحساب والتصنيف
const trTxt=tr=>digits(tr).replace(/(\d{4})(?=\d)/g,"$1 ");
const REPS=[["day","كل يوم"],["work","أيام الدوام"],["wk","كل أسبوع"],["mon","كل شهر"]];
const WD=["س","ح","ن","ث","ر","خ","ج"]; // السبت أول الأسبوع

/* ---------- البيانات ---------- */
function load(){const b=B();st=null;if(!b)return;try{st=JSON.parse(b.list())}catch(e){st=null}}
function apply(r){try{const o=JSON.parse(r);if(o&&Array.isArray(o.cards)){st=o;return true}}catch(e){}
  api.toast("ما انحفظت، جرّب مرة ثانية");return false}
const card=id=>st.cards.find(c=>c.id===id);
const top=id=>st.tops.find(t=>t.id===id);
const doneToday=()=>new Set(st.log.filter(l=>l.day===st.today).map(l=>l.top));
const view=()=>((api&&api.cfg().cv)==="list"?"list":"wallet");

/* ---------- الكتابة ---------- */
const digits=s=>String(s||"").replace(/\D/g,"");
const grp=no=>digits(no).replace(/(\d{4})(?=\d)/g,"$1 ");
const l4=no=>digits(no).slice(-4);
const amt=n=>Number(n||0).toLocaleString("en-US");
const hm=s=>{if(!s)return"";const [h,m]=s.split(":").map(Number);return (h%12||12)+":"+String(m).padStart(2,"0")+(h<12?" الصبح":h<16?" الظهر":h<19?" العصر":" بالليل")};
/** «تنتهي قريباً» إذا باقي شهر أو أقل لآخر يوم بشهر الانتهاء، و«منتهية» إذا فات */
function expState(exp){const m=/^(\d{2})\/(\d{2})$/.exec(exp||"");if(!m)return"";const end=new Date(2000+ +m[2],+m[1],0,23,59);
  const d=(end-Date.now())/864e5;return d<0?"gone":d<=31?"soon":""}
const badge=(c,short)=>{const s=expState(c.exp);return s?`<span class="yc-soon">${s==="gone"?"منتهية":short?"قريباً":"تنتهي قريباً"}</span>`:""};

/* ---------- النسخ ---------- */
function copy(text,label,raw){const t=raw?String(text||""):digits(text);if(!t)return false;
  let ok=false;try{ok=B().copy(t)==="1"}catch(e){}
  if(!ok)try{navigator.clipboard.writeText(t);ok=true}catch(e){}
  buzz(10);api.toast(`انتسخ ${label} ✓`);return true}

/* ---------- الصفحة ---------- */
const IC={wallet:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="11" rx="2.5"/><path d="M5 9V7.5A1.5 1.5 0 0 1 6.5 6h11A1.5 1.5 0 0 1 19 7.5V9M7 6V4.8A.8.8 0 0 1 7.8 4h8.4a.8.8 0 0 1 .8.8V6"/></svg>`,
  list:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>`,
  copy:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>`,
  dock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/></svg>`};

function isOpen(){return !!(pg&&!pg.hidden)}
function open(t){if(t){tab=t;keep=null}const was=isOpen();if(!was){show();hist(false)}else{draw(true);mark()}}
function close(){if(!isOpen())return;leave();keep=null}
// تصليح ٢٢: «بطايقي» تبويب بنفس مستوى «هسه» و«زاد» (app.js يبدّل بيناتهم). تطلع منه بالشريط = يختفي ويتذكر وين كنت
// (القسم، والبطاقة المفتوحة)، ويرجع لنفس المكان. depth = كم خطوة إله بالـhistory فوق «هسه».
let keep=null;
function depth(){if(!isOpen())return 0;const d=$("#ycDet");return 1+(d&&!d.hidden?1:0)+(pickOpen()?1:0)}
function show(){if(!pg){pg=document.createElement("section");pg.id="ycPg";pg.setAttribute("aria-label","بطايقي");document.body.appendChild(pg)}
  load();pg.hidden=false;document.body.classList.add("yc-on");scrollTo(0,0);draw(true);if(keep&&card(keep))det(keep,null,true);keep=null;mark()}
function hist(replace){try{if(replace)history.replaceState({yc:"pg"},"");else history.pushState({yc:"pg"},"");const d=$("#ycDet");if(d&&!d.hidden)history.pushState({yc:"det"},"")}catch(e){}}
function leave(){const n=depth();if(!n)return 0;const d=$("#ycDet");keep=d&&!d.hidden?cur:null;pickClose(true);detClose(true);pg.hidden=true;document.body.classList.remove("yc-on");mark();return n}
function mark(){const b=$("#mCards");if(b)b.classList.toggle("on",isOpen());if(api&&api.ui)api.ui()}

function draw(enter){if(!pg)return;const v=view();
  pg.innerHTML=`<div class="yc-top"><h2>بطايقي</h2><div class="yc-tb">${tab==="cards"&&st&&st.cards.length?`<button class="yc-ib" id="ycView" aria-label="${v==="wallet"?"اعرضها قائمة":"اعرضها محفظة"}">${v==="wallet"?IC.list:IC.wallet}</button>`:""}${st?`<button class="yc-ib yc-plus" id="ycAdd" aria-label="${tab==="cards"?"ضيف بطاقة":"ضيف تعبئة"}">+</button>`:""}</div></div>
  <div class="yc-seg" role="tablist"><span class="yc-ind" style="transform:translateX(${tab==="top"?"-100%":"0"})"></span><button role="tab" data-yt="cards" aria-selected="${tab==="cards"}">بطايقي</button><button role="tab" data-yt="top" aria-selected="${tab==="top"}">التعبئة اليومية</button></div>
  <div class="yc-body">${!st?noBridge():tab==="cards"?cardsHtml(v):topsHtml()}</div>`;
  // «قائمة بالتتابع»: أول مرة بس تنفتح كل خانة، مو بكل تحديث
  if(st&&!seen[tab]&&YMx()&&!calm()){seen[tab]=1;const L=$(".yc-anim",pg);if(L)[...L.children].slice(0,8).forEach((r,i)=>{r.style.animation=`y-up 450ms var(--ease) both`;r.style.animationDelay=i*60+"ms";setTimeout(()=>{r.style.animation="";r.style.animationDelay=""},900)})}
}
function noBridge(){return `<div class="yc-empty"><div class="yc-ei">${IC.dock}</div><b>بطايقك تنحفظ بالتلفون بس</b><p>مشفّرة داخل تطبيق «يومي» وما تطلع للنت. ${window.YawmiAndroid?"حدّث التطبيق لآخر نسخة حتى تشتغل.":"افتحها من التطبيق."}</p></div>`}

// وجه البطاقة: فوق الاسم + التصنيف + زر ⧉ (يبين حتى لو مكدّسة)، بالنص رقم الحساب كبير، وتحت رقم البطاقة كامل
function cardFace(c,big,noCp){const tr=digits(c.tr),mid=tr?trTxt(tr):grp(c.no);
  return `<div class="yc-cc ${kCls(kOf(c))}${big?" big":""}" data-yc="${esc(c.id)}"><div class="nm"><span>${esc(c.n)}</span><span class="yc-tg">${c.cat?`<small class="yc-cat">${esc(c.cat)}</small>`:""}${!noCp&&(tr||digits(c.no))?`<button class="yc-cpb" data-ycq="${esc(c.id)}" aria-label="انسخ ${tr?"رقم الحساب":"رقم البطاقة"}">${IC.copy}</button>`:""}</span></div>
  <div class="tr"><small>${tr?"رقم الحساب":mid?"رقم البطاقة":"&nbsp;"}</small><b dir="ltr">${mid||"&nbsp;"}</b></div>
  <div class="ft"><span>${tr&&c.no?`<small class="yc-ftl">رقم البطاقة</small> <bdi dir="ltr">${grp(c.no)}</bdi>`:""}</span><span>${badge(c)} <bdi dir="ltr">${esc(c.exp||"")}</bdi></span></div></div>`}
// شريط التصنيف: الكل + التصنيفات اللي بيها بطايق بس. المختار ينحفظ (cf) بنفس الملف المشفّر
function catsUsed(){const u=[];(st.cats||[]).concat(st.cards.map(c=>c.cat||"")).forEach(n=>{if(n&&!u.includes(n)&&st.cards.some(c=>c.cat===n))u.push(n)});return u}
const curCat=()=>{const f=st.cf||"";return f&&catsUsed().includes(f)?f:""};
function catBar(){const u=catsUsed();if(!u.length)return"";const f=curCat();
  return `<div class="yc-cats" role="tablist">${[["","الكل"],...u.map(n=>[n,n])].map(([k,l])=>`<button data-ycat="${esc(k)}" aria-pressed="${f===k}">${esc(l)}</button>`).join("")}</div>`}

function cardsHtml(v){if(!st.cards.length)return `<div class="yc-empty"><div class="yc-ei">${IC.dock}</div><b>ما عندك بطايق بعد</b><p>كل بطاقة تنحفظ مشفّرة بالتلفون، وكلشي بيها ينسخ بدوسة.</p><button class="yc-cta" data-yadd>+ ضيف بطاقة</button></div>`;
  const F=curCat(),base=F?st.cards.filter(c=>c.cat===F):st.cards,none=`<p class="yc-note" style="text-align:center">ماكو بطايق بهالتصنيف</p>`;
  if(v==="list"){const f=q?base.filter(c=>(c.n+" "+(c.bank||"")+" "+(c.cat||"")).includes(q)||(digits(q)&&(digits(c.no).endsWith(digits(q))||digits(c.tr).includes(digits(q))))):base;
    return catBar()+`<label class="yc-srch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg><input id="ycQ" type="search" placeholder="دوّر على بطاقة…" value="${esc(q)}" autocomplete="off"></label><div class="yc-lst yc-anim">${listRows(f)}</div>`}
  if(!base.length)return catBar()+none;
  return catBar()+`<div class="yc-stack yc-anim">${base.map(c=>cardFace(c)).join("")}</div><p class="yc-note">${base.length} ${base.length>2&&base.length<11?"بطايق":"بطاقة"} · ⧉ ينسخ رقم الحساب · دوس البطاقة لباقي الأرقام</p>`}
function listRows(f){return f.length?f.map(c=>{const tr=digits(c.tr),has=tr||digits(c.no);return `<div class="yc-row" data-yc="${esc(c.id)}"><span class="mini ${kCls(kOf(c))}">${l4(c.no)}</span><div class="tx"><b>${esc(c.n)} ${badge(c,1)}</b><small>${tr?`حساب <i dir="ltr">${trTxt(tr)}</i>`:c.no?"•••• "+l4(c.no):""}${has&&c.exp?" · ":""}${esc(c.exp||"")}</small></div>${has?`<button class="cp" data-ycp="${esc(c.id)}">انسخ</button>`:""}</div>`}).join(""):`<p class="yc-note" style="text-align:center">${curCat()&&!q?"ماكو بطايق بهالتصنيف":"ماكو"}</p>`}

function topsHtml(){if(!st.cards.length)return `<div class="yc-empty"><b>ضيف بطاقة أول</b><p>بعدها تختار البطاقة والمبلغ وشكد تتكرر.</p><button class="yc-cta" data-yadd>+ ضيف بطاقة</button></div>`;
  const D=doneToday(),due=st.due.map(top).filter(Boolean),left=due.filter(t=>!D.has(t.id)),rest=st.tops.filter(t=>!st.due.includes(t.id));
  if(!st.tops.length)return `<div class="yc-empty"><b>ما عندك تعبئة يومية</b><p>ضيف التعبئات اللي تسويها كل يوم: البطاقة، المبلغ، والتذكير.</p><button class="yc-cta" data-ytadd>+ أضف تعبئة يومية</button></div>`;
  const rem=left.map(t=>t.rem).filter(Boolean).sort()[0];
  let h=`<div class="yc-sum"><div><small>باقي اليوم</small><div class="big" data-yn="ycLeft">${left.length}<span>/${due.length}</span></div></div><small>${due.length?left.length?rem?"أذكّرك "+hm(rem):"":"خلصت كلها ✓":"ماكو تعبئة اليوم"}</small></div><div class="yc-prog"><i style="width:${due.length?(due.length-left.length)/due.length*100:0}%"></i></div>`;
  h+=`<div class="yc-anim">${due.map(t=>topRow(t,D.has(t.id))).join("")}</div>`;
  if(rest.length)h+=`<p class="yc-lbl">مو اليوم</p>${rest.map(t=>topRow(t,false,true)).join("")}`;
  h+=`<button class="yc-addtp" data-ytadd>+ أضف تعبئة يومية</button>`+week();
  return h}
// v1.23 (تعديل ٤): السطر بيه رقم الحساب، وزرين: «انسخ الحساب» (نسخ بس) و«عبّيت» (تعليم بس)
const acTxt=c=>digits(c.tr)?trTxt(c.tr):grp(c.no);
function topRow(t,done,off){const c=card(t.card)||{n:"بطاقة انحذفت",k:"k1",no:""},ac=acTxt(c);
  return `<div class="yc-tp${done?" done":""}${off?" off":""}" data-yt2="${esc(t.id)}"><span class="mini ${kCls(kOf(c))}"></span><div class="tx"><b>${esc(c.n)}</b><small>${esc(t.d||"تعبئة")}${off?" · "+REPS.find(r=>r[0]===t.rep)[1]:""}</small>${ac?`<span class="ac" dir="ltr">${ac}</span>`:""}<span class="amt" dir="ltr">${amt(t.amt)}</span></div><div class="bt">${ac?`<button class="c" data-ycpt="${esc(t.id)}">انسخ الحساب</button>`:""}${off?"":`<button class="go" data-ygo="${esc(t.id)}" aria-pressed="${done}" aria-label="${done?"رجّعها":"عبّيت"}">${done?"✓ تم":"عبّيت"}</button>`}</div></div>`}
/** السجل: مجموع كل يوم من السبت للجمعة، وتحت أعمدة صغيرة */
function week(){const T=new Date(st.today+"T12:00:00"),di=(T.getDay()+1)%7,days=[];
  for(let i=0;i<7;i++){const d=new Date(T);d.setDate(T.getDate()-di+i);days.push(d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"))}
  const sum=days.map(d=>st.log.filter(l=>l.day===d).reduce((a,l)=>a+(+l.amt||0),0)),tot=sum.reduce((a,b)=>a+b,0),mx=Math.max(1,...sum);
  return `<div class="yc-hist"><div class="hd"><span>هالأسبوع</span><b dir="ltr">${amt(tot)} <small>د.ع</small></b></div><div class="bars">${sum.map((s,i)=>`<div class="${days[i]===st.today?"t":""}${days[i]>st.today?" fut":""}"><i style="height:${s?Math.max(6,s/mx*100):0}%"></i><span>${WD[i]}</span></div>`).join("")}</div></div>`}

/* ---------- صفحة البطاقة («كارت يصير صفحة») ---------- */
function det(id,from,quiet){const c=card(id);if(!c)return;cur=id;delArm=null;let d=$("#ycDet");if(!d){d=document.createElement("section");d.id="ycDet";d.hidden=true;document.body.appendChild(d)}
  const F=[["رقم الحساب",trTxt(c.tr),"tr","رقم الحساب",0,1],["رقم البطاقة",grp(c.no),"no","رقم البطاقة"],["تاريخ الانتهاء",c.exp,"exp","التاريخ"],["CVV",c.cvv,"cvv","الـCVV"],["الرمز (PIN)",c.pin,"pin","الرمز"],["البنك أو الشركة",c.bank,"bank","الاسم",1],["ملاحظات",c.note,"note","الملاحظة",1]].filter(f=>f[1]);
  d.innerHTML=`<button class="yc-back" data-yback>→ رجوع</button>${cardFace(c,1)}
  ${F.map(([l,v,k,lab,raw,main])=>`<div class="yc-fld${raw?" txt":""}${main?" main":""}"><div><small>${l}</small><b${raw?"":' dir="ltr"'}>${esc(v)}</b></div><button data-ycf="${k}" aria-label="انسخ ${l}">${IC.copy}</button></div>`).join("")||`<p class="yc-note">ما بيها غير الاسم. دوس «عدّل» وضيف الرقم.</p>`}
  <div class="yc-acts"><button data-yedit>عدّل</button><button class="del" data-ydel>احذف</button></div>`;
  const was=!d.hidden;d.hidden=false;d.scrollTop=0;if(!was&&!quiet)try{history.pushState({yc:"det"},"")}catch(e){}
  if(from&&!was&&!calm()){const a=from.getBoundingClientRect(),t=$(".yc-cc",d),b=t.getBoundingClientRect();
    d.classList.add("yc-in");t.animate([{transform:`translate(${a.left-b.left}px,${a.top-b.top}px) scale(${a.width/b.width},${a.height/b.height})`,transformOrigin:"0 0"},{transform:"none",transformOrigin:"0 0"}],{duration:420,easing:"cubic-bezier(.2,.8,.2,1)"});
    $$(".yc-fld,.yc-acts",d).forEach((r,i)=>{r.style.animation=`y-up 380ms var(--ease) both`;r.style.animationDelay=(120+i*45)+"ms"})}
}
function detClose(quiet){const d=$("#ycDet");if(!d||d.hidden)return;cur=null;if(quiet||calm()){d.hidden=true;return}
  d.animate([{opacity:1},{opacity:0,transform:"translateX(-24px)"}],{duration:220,easing:"ease-in",fill:"forwards"});setTimeout(()=>{if(!cur){d.hidden=true;d.getAnimations().forEach(a=>a.cancel())}},220)}

/* ---------- ورقة البطاقة: ضيف / عدّل ---------- */
function cardSheet(id){const c=id?card(id):{k:"k1"},ok2=v2();let k=kOf(c),cat=c.cat||"";
  const cats=()=>{const u=[];CATS0.concat(st.cats||[],st.cards.map(x=>x.cat||""),cat?[cat]:[]).forEach(n=>{if(n&&!u.includes(n))u.push(n)});return u};
  const chips=()=>cats().map(n=>`<button class="pill" data-ycg="${esc(n)}" aria-pressed="${cat===n}">${esc(n)}</button>`).join("")+`<button class="pill yc-new" id="ycCg">+ جديد</button>`;
  api.show(`<h3>${id?"عدّل البطاقة":"بطاقة جديدة"}</h3>${ok2?"":`<p class="yc-note" style="margin:0 0 8px">حدّث التطبيق حتى ينحفظ رقم الحساب والتصنيف.</p>`}<div class="yc-form">
  <div class="yc-prev"></div>
  <p class="yc-lbl yc-lh"><span>اللون</span><span id="ycKn"></span></p>
  <div class="yc-k10" role="radiogroup" aria-label="اللون">${COLORS.map(([x,n])=>`<button class="${kCls(x)}" data-ycc="${x}" role="radio" aria-checked="${k===x}" aria-label="${n}"></button>`).join("")}</div>
  ${ok2?`<p class="yc-lbl yc-lh"><span>التصنيف</span><span>اختياري</span></p><div class="yc-pills" id="ycCgs">${chips()}</div>`:""}
  ${inp("ycN","الاسم (لازم)",c.n,"",60)}
  ${ok2?`<div class="yc-in yc-hl"><input id="ycTr" placeholder=" " value="${esc(trTxt(c.tr))}" maxlength="37" inputmode="numeric" dir="ltr" autocomplete="off"><label for="ycTr">رقم الحساب</label></div>`:""}
  ${inp("ycNo","رقم البطاقة",grp(c.no),'inputmode="numeric" dir="ltr" autocomplete="off"',23)}
  <div class="yc-r3">${inp("ycEx","الانتهاء MM/YY",c.exp,'inputmode="numeric" dir="ltr"',5)}${inp("ycCv","CVV",c.cvv,'inputmode="numeric" dir="ltr" autocomplete="off"',4)}${inp("ycPn","الرمز",c.pin,'inputmode="numeric" dir="ltr" autocomplete="off"',12)}</div>
  ${inp("ycBk","البنك أو الشركة",c.bank,"",40)}
  <div class="yc-in"><textarea id="ycNt" placeholder=" " maxlength="1000" rows="2">${esc(c.note||"")}</textarea><label for="ycNt">ملاحظات: الحد الشهري، رقم الخدمة…</label></div>
  <button class="yc-sv" id="ycSv">احفظ</button></div>`);
  const sh=$("#sheet"),val=x=>{const e=$("#"+x,sh);return e?e.value:""};
  // المعاينة تتغيّر وياك
  const pv=()=>{$(".yc-prev",sh).innerHTML=cardFace({id:"",n:val("ycN").trim()||"اسم البطاقة",tr:val("ycTr"),no:val("ycNo")||"0000000000000000",exp:val("ycEx")||"MM/YY",k,cat},0,1);$("#ycKn",sh).textContent=(COLORS.find(x=>x[0]===k)||[])[1]||""};
  $("#ycNo",sh).oninput=e=>{const i=e.target,v=grp(i.value).slice(0,23);if(i.value!==v)i.value=v;pv()};
  {const t=$("#ycTr",sh);if(t)t.oninput=()=>{const v=trTxt(t.value).slice(0,37);if(t.value!==v)t.value=v;pv()}}
  $("#ycEx",sh).oninput=e=>{const i=e.target;let v=digits(i.value).slice(0,4);if(v.length>2)v=v.slice(0,2)+"/"+v.slice(2);if(i.value!==v)i.value=v;pv()};
  $("#ycN",sh).oninput=pv;
  ["ycCv","ycPn"].forEach(x=>$("#"+x,sh).oninput=e=>{const v=digits(e.target.value);if(e.target.value!==v)e.target.value=v});
  $$("[data-ycc]",sh).forEach(b=>b.onclick=()=>{k=b.dataset.ycc;$$("[data-ycc]",sh).forEach(x=>x.setAttribute("aria-checked",x===b));buzz(8);pv()});
  const wire=()=>{const g=$("#ycCgs",sh);if(!g)return;
    $$("[data-ycg]",g).forEach(b=>b.onclick=()=>{cat=cat===b.dataset.ycg?"":b.dataset.ycg;$$("[data-ycg]",g).forEach(x=>x.setAttribute("aria-pressed",x.dataset.ycg===cat));buzz(6);pv()});
    $("#ycCg",g).onclick=e=>{const b=e.currentTarget,i=document.createElement("input");i.className="yc-cgi";i.maxLength=30;i.placeholder="اسم التصنيف";b.replaceWith(i);i.focus();
      let done=0;const go=()=>{if(done)return;done=1;const n=i.value.trim().slice(0,30);if(n)cat=n;g.innerHTML=chips();wire();pv()};
      i.onkeydown=ev=>{if(ev.key==="Enter"){ev.preventDefault();go()}};i.onblur=go}};wire();pv();
  $("#ycSv",sh).onclick=()=>{const n=$("#ycN",sh).value.trim();if(!n){const w=$("#ycN",sh).parentNode;if(YMx())YMx().shake(w);else buzz([30,40,30]);$("#ycN",sh).focus();return}
    const ex=$("#ycEx",sh).value.trim();if(ex&&!/^(0[1-9]|1[0-2])\/\d{2}$/.test(ex)){const w=$("#ycEx",sh).parentNode;if(YMx())YMx().shake(w);api.toast("الانتهاء مثل 08/27");return}
    // c: اللون القديم الأقرب، حتى APK 1.21 يحفظ لون قريب
    const o={id:id||"",n,tr:digits(val("ycTr")),no:digits($("#ycNo",sh).value),exp:ex,cvv:$("#ycCv",sh).value,pin:$("#ycPn",sh).value,bank:$("#ycBk",sh).value.trim(),note:$("#ycNt",sh).value.trim(),k,cat,c:{k3:"c2",k5:"c2",k2:"c5"}[k]||"c1"};
    if(!ok2){o.tr=c.tr||"";o.cat=c.cat||""}
    if(!apply(B().saveCard(JSON.stringify(o))))return;buzz([20,30,40]);api.hide();draw();if(id)det(id);api.toast(id?"انحفظت ✓":"انضافت ✓")};
  if(!id)setTimeout(()=>{try{$("#ycN",sh).focus()}catch(e){}},350)}
/* ---------- التصنيفات بالإعدادات: تغيير الاسم أو الحذف (البطايق تبقى، بس بلا تصنيف) ---------- */
function catSheet(back){load();if(!st||!v2()){api.toast("حدّث التطبيق حتى تشتغل التصنيفات");return}
  const L=[];(st.cats||[]).concat(st.cards.map(c=>c.cat||"")).forEach(n=>{if(n&&!L.includes(n))L.push(n)});
  const cnt=n=>st.cards.filter(c=>c.cat===n).length;
  api.show(`<h3>تصنيفات البطايق</h3>${L.length?L.map((n,i)=>`<div class="yc-cr"><div class="yc-in" style="flex:1;margin:0"><input id="ycR${i}" placeholder=" " value="${esc(n)}" maxlength="30"><label for="ycR${i}">${cnt(n)?cnt(n)+" "+(cnt(n)>2&&cnt(n)<11?"بطايق":"بطاقة"):"ماكو بطايق"}</label></div><button class="pill" data-ycrd="${i}">احذف</button></div>`).join(""):`<p class="yc-note">ماكو تصنيفات بعد. تضيفها من صفحة البطاقة.</p>`}
  <button class="yc-sv" id="ycRs">احفظ</button>${back?`<button class="back" id="ycRb">← الإعدادات</button>`:`<button class="close" data-x>سكّر</button>`}`);
  const sh=$("#sheet"),gone=new Set();
  $$("[data-ycrd]",sh).forEach(b=>b.onclick=()=>{const i=+b.dataset.ycrd;if(gone.has(i)){gone.delete(i);b.textContent="احذف";b.parentNode.style.opacity=""}else{gone.add(i);b.textContent="رجّعه";b.parentNode.style.opacity=".4"}buzz(8)});
  {const b=$("#ycRb",sh);if(b)b.onclick=back}
  $("#ycRs",sh).onclick=()=>{const ren={},cats=[];L.forEach((n,i)=>{const v=gone.has(i)?"":$("#ycR"+i,sh).value.trim().slice(0,30);if(v!==n)ren[n]=v;if(v&&!cats.includes(v))cats.push(v)});
    if(!apply(B().meta(JSON.stringify({cats,ren}))))return;buzz([20,30,40]);if(isOpen())draw();if(back)back();else api.hide();api.toast("انحفظت ✓")}}
const inp=(id,l,v,a,mx)=>`<div class="yc-in"><input id="${id}" placeholder=" " value="${esc(v||"")}" maxlength="${mx}" ${a}><label for="${id}">${l}</label></div>`;

/* ---------- ورقة التعبئة ---------- */
// خانة البطاقة: لون + اسم + رقم الحساب، تدوسها تنفتح «اختار البطاقة» (تعديل ٤)
function pickHtml(c){return c?`<span class="mini ${kCls(kOf(c))}"></span><span class="tx"><small>البطاقة</small><b>${esc(c.n)}</b>${acTxt(c)?`<span class="ac" dir="ltr">${acTxt(c)}</span>`:""}</span><span class="ch">تغيير ‹</span>`
  :`<span class="tx"><small>البطاقة</small><b class="no">اختار البطاقة</b></span><span class="ch">‹</span>`}
function topSheet(id){const t=id?top(id):{card:"",rep:"day",rem:"14:00",amt:""};
  api.show(`<h3>${id?"عدّل التعبئة":"تعبئة يومية"}</h3><div class="yc-form">
  <button class="yc-pick" id="ycPk">${pickHtml(card(t.card))}</button>
  ${inp("ycAm","المبلغ",t.amt?amt(t.amt):"",'inputmode="numeric" dir="ltr"',13)}${inp("ycDd","التفاصيل (مثلاً: رصيد خط الشغل)",t.d,"",60)}
  <p class="yc-lbl">يتكرر</p><div class="yc-pills">${REPS.map(([k,l])=>`<button class="pill" data-ytr="${k}" aria-pressed="${t.rep===k}">${l}</button>`).join("")}</div>
  <p class="yc-lbl">ذكّرني إذا ما عبّيت لحد</p><div class="yc-pills"><input type="time" id="ycRm" value="${esc(t.rem||"")}" dir="ltr"${t.rem?"":" disabled"}><button class="pill" id="ycRo" aria-pressed="${!t.rem}">بلا تذكير</button></div>
  <button class="yc-sv" id="ycSv">احفظ</button>${id?`<button class="yc-del" id="ycTd">احذف التعبئة</button>`:""}</div>`);
  const sh=$("#sheet");let card0=card(t.card)?t.card:"",rep=t.rep;
  $("#ycPk",sh).onclick=()=>picker(card0,id2=>{card0=id2;const k=$("#ycPk",sh);if(k)k.innerHTML=pickHtml(card(id2))});
  $$("[data-ytr]",sh).forEach(b=>b.onclick=()=>{rep=b.dataset.ytr;$$("[data-ytr]",sh).forEach(x=>x.setAttribute("aria-pressed",x===b))});
  $("#ycAm",sh).oninput=e=>{const d=digits(e.target.value).slice(0,10);e.target.value=d?amt(+d):""};
  const rm=$("#ycRm",sh),ro=$("#ycRo",sh);ro.onclick=()=>{const off=ro.getAttribute("aria-pressed")!=="true";ro.setAttribute("aria-pressed",off);rm.disabled=off;if(!off&&!rm.value)rm.value="14:00"};
  $("#ycSv",sh).onclick=()=>{if(!card(card0)){const k=$("#ycPk",sh);if(YMx())YMx().shake(k);else buzz([30,40,30]);return}
    const a=+digits($("#ycAm",sh).value);if(!a){const w=$("#ycAm",sh).parentNode;if(YMx())YMx().shake(w);else buzz([30,40,30]);return}
    const o={id:id||"",card:card0,amt:a,d:$("#ycDd",sh).value.trim(),rep,rem:rm.disabled?"":rm.value};
    if(!apply(B().saveTop(JSON.stringify(o))))return;buzz([20,30,40]);api.hide();draw();api.toast(id?"انحفظت ✓":"انضافت ✓")};
  if(id){const td=$("#ycTd",sh);td.onclick=()=>{if(td.dataset.arm){if(apply(B().removeTop(id))){api.hide();draw();api.toast("انحذفت")}return}
    td.dataset.arm=1;td.textContent="متأكد؟ دوس مرة ثانية";buzz(15);setTimeout(()=>{if(td.isConnected){delete td.dataset.arm;td.textContent="احذف التعبئة"}},3000)}}}

/* ---------- «اختار البطاقة»: صفحة تطلع من جوه فوق الشيت، بحث بالاسم أو رقم الحساب، تدوس وحدة وتنسد ---------- */
let pk=null,pkCb=null,pkCur="";
const pickOpen=()=>!!(pk&&!pk.hidden);
function picker(cur,cb){pkCur=cur;pkCb=cb;if(!pk){pk=document.createElement("section");pk.id="ycPick";pk.hidden=true;pk.setAttribute("aria-label","اختار البطاقة");document.body.appendChild(pk)}
  pk.innerHTML=`<div class="yc-pkh"><h3>اختار البطاقة</h3><button data-ypx>سد</button></div><label class="yc-srch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg><input id="ycPq" type="search" placeholder="الاسم أو رقم الحساب" autocomplete="off"></label><div class="yc-pkl"></div>`;
  delete pk.dataset.cl;pk.getAnimations().forEach(x=>x.cancel());pkDraw("");pk.hidden=false;pk.scrollTop=0;try{history.pushState({yc:"pick"},"")}catch(e){}
  if(!calm())pk.animate([{transform:"translateY(100%)"},{transform:"none"}],{duration:400,easing:"cubic-bezier(.2,.8,.2,1)"})}
function pkDraw(q){const d=digits(q),L=st.cards.filter(c=>!q||(c.n+" "+(c.cat||"")).includes(q)||(d&&(digits(c.tr).includes(d)||digits(c.no).includes(d))));
  $(".yc-pkl",pk).innerHTML=L.map(c=>{const on=c.id===pkCur,ac=acTxt(c);return `<button class="yc-opt${on?" on":""}" data-ypk="${esc(c.id)}"><span class="mini ${kCls(kOf(c))}"></span><span class="tx"><b>${esc(c.n)}</b>${ac?`<span class="ac" dir="ltr">${ac}</span>`:""}${c.cat?`<small>${esc(c.cat)}</small>`:""}</span><span class="ck">${on?"✓":""}</span></button>`}).join("")||`<p class="yc-note" style="text-align:center">ماكو</p>`}
function pickClose(quiet){if(!pickOpen())return;if(quiet||calm()){pk.hidden=true;return}
  pk.animate([{transform:"none"},{transform:"translateY(100%)"}],{duration:300,easing:"ease-in",fill:"forwards"});pk.dataset.cl=1;
  setTimeout(()=>{if(pk.dataset.cl){delete pk.dataset.cl;pk.hidden=true;pk.getAnimations().forEach(x=>x.cancel())}},300)}
document.addEventListener("click",e=>{if(!pickOpen()||!e.target.closest("#ycPick"))return;let b;
  if(e.target.closest("[data-ypx]")){history.back();return}
  if(b=e.target.closest("[data-ypk]")){buzz(8);const id=b.dataset.ypk;pkCur=id;$$("[data-ypk]",pk).forEach(x=>{const on=x===b;x.classList.toggle("on",on);$(".ck",x).textContent=on?"✓":""});if(pkCb)pkCb(id);setTimeout(()=>history.back(),120)}});
document.addEventListener("input",e=>{if(e.target.id==="ycPq")pkDraw(e.target.value.trim())});

/* ---------- «عبّيت»: دوسة تعلّمها ✓، الثانية تتراجع. النسخ صار بزر «انسخ الحساب» لحاله (تعديل ٤) ---------- */
function filled(btn,id){const t=top(id);if(!t||btn.dataset.busy)return;const on=btn.getAttribute("aria-pressed")!=="true";
  if(!apply(B().done(id,on)))return;
  if(on&&!calm()){btn.dataset.busy=1;buzz([20,30,40]);btn.innerHTML=(YMx()?YMx().CK:"✓")+" تم";btn.classList.add("yc-ok");
    setTimeout(()=>{draw();if(YMx())YMx().blurNums(pg)},420)}
  else{buzz(on?[20,30,40]:8);draw()}
  if(on&&!st.due.some(x=>!doneToday().has(x))&&YMx())setTimeout(()=>api.toast("خلصت تعبئة اليوم ✓"),450)}

/* ---------- الدوسات ---------- */
document.addEventListener("click",e=>{if(!isOpen())return;const at=s=>e.target.closest(s);let b;
  if(!e.target.closest("#ycPg,#ycDet"))return;
  if(b=at("[data-yt]")){if(b.dataset.yt===tab)return;tab=b.dataset.yt;buzz(8);const ind=$(".yc-ind",pg);if(ind)ind.style.transform=`translateX(${tab==="top"?"-100%":"0"})`;$$("[data-yt]",pg).forEach(x=>x.setAttribute("aria-selected",x===b));setTimeout(draw,calm()?0:260);return}
  if(at("#ycView")){api.cfg().cv=view()==="wallet"?"list":"wallet";api.save();q="";draw();return}
  if(at("#ycAdd")||at("[data-yadd]")){if(tab==="cards"||at("[data-yadd]"))cardSheet();else topSheet();return}
  if(at("[data-ytadd]")){topSheet();return}
  if(b=at("[data-ycp],[data-ycq]")){const c=card(b.dataset.ycp||b.dataset.ycq);if(c){const [n,l]=qNo(c);copy(n,l)}return}
  if(b=at("[data-ycat]")){const f=b.dataset.ycat;if(f===curCat())return;st.cf=f;buzz(6);try{if(v2())apply(B().meta(JSON.stringify({cf:f})))}catch(x){}draw();return}
  if(b=at("[data-ycf]")){const c=card(cur);if(!c)return;const k=b.dataset.ycf,L={tr:"رقم الحساب",no:"رقم البطاقة",exp:"التاريخ",cvv:"الـCVV",pin:"الرمز",bank:"الاسم",note:"الملاحظة"}[k];
    copy(k==="exp"?c.exp:c[k],L,k==="bank"||k==="note"||k==="exp");return}
  if(at("[data-yback]")){history.back();return}
  if(at("[data-yedit]")){cardSheet(cur);return}
  if(b=at("[data-ydel]")){if(delArm===cur){const id=cur;if(apply(B().removeCard(id))){history.back();draw();api.toast("انحذفت")}return}
    delArm=cur;b.textContent="متأكد؟ دوس مرة ثانية";buzz(15);const was=cur;setTimeout(()=>{if(delArm===was&&b.isConnected){delArm=null;b.textContent="احذف"}},3000);return}
  if(b=at("[data-ycpt]")){const t=top(b.dataset.ycpt),c=t&&card(t.card);if(c){const [n,l]=qNo(c);copy(n,l)}return}
  if(b=at("[data-ygo]")){filled(b,b.dataset.ygo);return}
  if(b=at("[data-yt2]")){topSheet(b.dataset.yt2);return}
  if(b=at("#ycPg .yc-body [data-yc]")){buzz(8);det(b.dataset.yc,b.classList.contains("yc-cc")?b:null);return}
});
document.addEventListener("input",e=>{if(e.target.id!=="ycQ")return;q=e.target.value.trim();const L=$(".yc-lst",pg);if(!L)return;
  const f=q?st.cards.filter(c=>(c.n+" "+(c.bank||"")).includes(q)||(digits(q)&&digits(c.no).endsWith(digits(q)))):st.cards;L.innerHTML=listRows(f)});
// رجوع الأندرويد (web.goBack) والمتصفح: يسدّ صفحة البطاقة أول، بعدين بطايقي
addEventListener("popstate",e=>{if(e.state&&e.state.zd)return; // خطوة «زاد» مو إلنا (تصليح ٢٢)
  if(pickOpen()){pickClose();return}const d=$("#ycDet");if(d&&!d.hidden){detClose();return}if(isOpen())close()});
// رجعت للتطبيق بعد يوم جديد: العلامات تتصفّر والحالة تتحدّث
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&isOpen()){load();draw()}});

function init(o){api=o;const b=document.createElement("button");b.id="mCards";b.innerHTML=`<span class="k">${IC.dock}</span>بطايقي`;
  b.onclick=()=>{if(isOpen()){scrollTo({top:0,behavior:"smooth"});return}open()};
  const at=document.getElementById("mWeek");if(at)at.after(b);else{const d=$(".dock");if(d)d.appendChild(b)}
  // اختصار أيقونة التطبيق: ?cards=1 أو ?cards=top
  const P=new URLSearchParams(location.search),k=P.get("cards");
  if(k&&!P.has("widgetsync")){P.delete("cards");history.replaceState(null,"",location.pathname+(P.toString()?"?"+P:""));setTimeout(()=>open(k==="top"?"top":"cards"),0)}}
window.YC={init,open,close,isOpen,depth,show,hist,leave,catSheet,v2,refresh:()=>{if(isOpen()){load();draw()}}};
})();
