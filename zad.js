/* «زاد»: زيارات وأدعية + مجالس (docs/zad/README.md).
   الصوت والكتابة والعلامات كلها بالتلفون عبر الجسر window.YawmiZad (APK 1.24+): هنا بس الرسم.
   الزيارات الأصلية (zyara.html بالتطبيق) تنفتح بصفحتها مثل قبل، والصوت يمشي ويا الكتابة نفس ما هو.
   app.js يناديها: YZ.init({cfg, save, show, hide, toast, ui}). */
(function(){
const Z=()=>window.YawmiZad,AN=()=>window.YawmiAndroid;
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const YMx=()=>window.YM;
const buzz=p=>{const m=YMx();if(m)m.haptic(p);else try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const shake=el=>{const m=YMx();if(m)m.shake(el);else buzz([30,40,30])};
const calm=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmt=s=>{s=Math.max(0,Math.floor(s||0));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=String(s%60).padStart(2,"0");return h?h+":"+String(m).padStart(2,"0")+":"+x:m+":"+x};
const NM0={z:"زاد",q:"القرآن الكريم",a:"زيارات وأدعية",b:"مجالس"}; // q: v1.26 «القرآن الكريم» (quran.js)
// الزيارات اللي بالتطبيق (zyara.html): المفتاح z + رقم القسم بالصفحة. بلا الجسر تبين هاي بس.
const ZY=[["z0","زيارة عاشوراء","زيارة",701],["z1","دعاء علقمة","دعاء",900],["z2","زيارة آل ياسين","زيارة",486],["z3","دعاء العهد","دعاء",516],["z4","زيارة أمين الله","زيارة",0]];
const TY={zyara:"زيارة",dua:"دعاء"};
const RATES=[1,1.25,1.5,2,3];
const IC={play:`<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`,pause:`<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>`,
  srch:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>`,
  // أيقونة رفيعة للشريط السفلي: كتاب مفتوح بخط واحد
  dock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z"/><path d="M12 6.5V19"/></svg>`};

let api=null,st=null,pg=null,stk=[],poll=0,rd=null,mk=null,tbar=null;

/* ---------- البيانات ---------- */
const has=()=>!!(Z()&&typeof Z().state==="function");
function load(){st=null;if(!has())return;try{st=JSON.parse(Z().state())}catch(e){st=null}}
const N=()=>{const c=(api&&api.cfg().zadN)||{};return {z:c.z||NM0.z,q:c.q||NM0.q,a:c.a||NM0.a,b:c.b||NM0.b}};
const hid=()=>(api&&api.cfg().zadHide)||[]; // v1.26 بلا التلفون: الأصلية اللي انحذفت (بالتلفون Zad.java يخفيها)
const items=s=>st?st.items.filter(i=>i.sec===s):s==="a"?ZY.filter(z=>!hid().includes(z[0])).map(([id,t,ty,dur],k)=>({id,sec:"a",kind:ty==="دعاء"?"dua":"zyara",builtin:1,t,dur,pos:0,n:k+1})):[];
const item=id=>st&&st.items.find(i=>i.id===id);
const now=()=>{if(!has())return null;try{return JSON.parse(Z().now()||"null")}catch(e){return null}};
const J=(f,...a)=>{try{const r=Z()[f](...a);return r?JSON.parse(r):null}catch(e){return null}};
const pct=(p,d)=>d>0?Math.min(100,Math.max(0,p/d*100)):0;
const status=i=>i.done?["done","خلصت ✓"]:i.pos>1&&i.dur>0?["","وصلت "+Math.round(pct(i.pos,i.dur))+"٪"]:["","ما بديت"];
const theme=()=>document.documentElement.dataset.theme==="dark"?"dark":"light";

/* ---------- الصفحة والتنقّل (كل خطوة بالـhistory حتى الرجوع بالأندرويد يمشي) ---------- */
function isOpen(){return !!(pg&&!pg.hidden)}
function ensure(){if(pg)return;pg=document.createElement("section");pg.id="zdPg";pg.hidden=true;pg.setAttribute("aria-label",N().z);document.body.appendChild(pg)}
function open(v){const was=isOpen();if(!was){if(v||!stk.length)stk=[{v:"home"}];show();hist(false)}
  if(v)go(v,true);else if(was)draw();mark()}
function close(){if(!isOpen())return;leave();stk=[]}
// تصليح ٢٢: «زاد» تبويب بنفس مستوى «هسه» و«بطايقي» (app.js يبدّل بيناتهم). تطلع منه بالشريط = يختفي ويتذكر وين كنت (stk)،
// ويرجع لنفس المكان. depth = كم خطوة إله بالـhistory فوق «هسه». hist يكتب خطواته (أول وحدة بمكان التبويب اللي قبله لو replace).
function depth(){return isOpen()?stk.length+(rd&&!rd.hidden?1:0)+(mk&&!mk.hidden?1:0)+(window.YQ?YQ.depth():0):0}
function show(){ensure();load();fonts();if(!stk.length)stk=[{v:"home"}];pg.hidden=false;document.body.classList.add("zd-on");draw();mark()}
function hist(replace){try{if(replace)history.replaceState({zd:1},"");else history.pushState({zd:1},"");for(let k=2;k<=stk.length;k++)history.pushState({zd:k},"")}catch(e){}}
function leave(){const n=depth();if(!n)return 0;if(window.YQ&&YQ.isOpen())YQ.close(true);stopPoll();rdClose(true);mkClose(true);pg.hidden=true;document.body.classList.remove("zd-on");mark();return n}
function mark(){const b=$("#mZyara");if(b)b.classList.toggle("on",isOpen());if(api&&api.ui)api.ui()}
function go(v,replace){if(replace&&stk.length)stk[stk.length-1]=v;else{stk.push(v);try{history.pushState({zd:stk.length},"")}catch(e){}}draw()}
const cur=()=>stk[stk.length-1]||{v:"home"};
// خطوط القراءة تنحمّل بس أول ما تنفتح «زاد»، حتى ما تثقّل باقي التطبيق
function fonts(){if(document.getElementById("zdFonts"))return;const l=document.createElement("link");l.id="zdFonts";l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css2?family=Amiri&family=Noto+Naskh+Arabic:wght@400;600&display=swap";document.head.appendChild(l)}

function draw(){if(!pg)return;stopPoll();const c=cur();
  pg.innerHTML=c.v==="sec"?secHtml(c.s):c.v==="listen"?listenHtml(c.id):homeHtml();pg.scrollTop=0;
  if(c.v==="sec")wireSec(c.s);if(c.v==="listen")wireListen(c.id);
  if(!calm()&&YMx()){$$(".zd-anim>*",pg).slice(0,8).forEach((r,i)=>{r.style.animation="y-up 420ms var(--ease) both";r.style.animationDelay=i*50+"ms";setTimeout(()=>{r.style.animation="";r.style.animationDelay=""},900)})}}

/* ---------- الرئيسية ---------- */
function contHtml(L,big){if(!L||!L.k)return"";const i=item(L.k);const t=i?i.t:(ZY.find(z=>z[0]===L.k)||[])[1];if(!t)return"";
  const no=i&&i.sec==="b"?`<span class="zd-n">${i.n}</span>`:"";
  return `<div class="zd-cont" role="button" tabindex="0" data-zc="${esc(L.k)}">${big?`<button class="zd-x" data-zx aria-label="شيله">✕</button>`:""}<small>كمّل من وين وقفت</small><b>${no}${esc(t)}</b>
  <div class="r"><span class="pl">${IC.play}</span><div style="flex:1"><div class="bar"><i style="width:${pct(L.pos,L.dur)}%"></i></div><div class="t"><span>${fmt(L.pos)}</span><span>${L.dur?fmt(L.dur):""}</span></div></div></div></div>`}
function homeHtml(){const n=N(),L=st&&st.last&&!st.last.hid?st.last:null;
  return `<div class="zd-top"><h2>${esc(n.z)}</h2></div>${window.YQ?YQ.cardHtml():""}${contHtml(L,1)}
  <div class="zd-secs zd-anim">${[["q",n.q],["a",n.a],["b",n.b]].filter(([k])=>k!=="q"||window.YQ).map(([k,t])=>`<button class="zd-sec" ${k==="q"?"data-zq":`data-zs="${k}"`}><b>${esc(t)}</b><span>‹</span></button>`).join("")}</div>
  ${has()?"":`<p class="zd-note">${AN()?"حدّث التطبيق حتى تنحفظ المجالس والإضافات.":"«زاد» يشتغل بتطبيق «يومي» بالموبايل. الصوت والكتابة ينحفظن بالتلفون."}</p>`}`}

/* ---------- داخل القسم ---------- */
function rowHtml(i,live){const [k,s]=status(i),ty=i.sec==="a"?(TY[i.kind]||""):(i.stops&&i.stops.length?`★ ${i.stops.length}`:"");
  return `<div class="zd-lec${live===i.id?" live":""}" data-zi="${esc(i.id)}"><span class="no">${i.n}</span><div class="tx"><b>${esc(i.t)}</b>
  <small><span class="zd-n">${i.dur?fmt(i.dur):"—"}</span>${ty?`<span>${esc(ty)}</span>`:""}</small><div class="pb"><i style="width:${i.done?100:pct(i.pos,i.dur)}%"></i></div></div><span class="st ${k}">${s}</span></div>`}
function secHtml(s){const n=N(),L=items(s),P=st&&st.play,LS=st&&(s==="b"?st.lastb:st.last),live=P&&P.k&&L.some(i=>i.id===P.k)?P.k:LS?LS.k:"";
  let h=`<button class="zd-back" data-zb>→ ${esc(n.z)}</button><div class="zd-top"><h2 class="s">${esc(s==="a"?n.a:n.b)}</h2><div class="zd-tb">${s==="b"&&has()?`<button class="zd-pdf" data-zpdf>⤓ PDF</button>`:""}<button class="zd-add" data-zadd>+ أضف</button></div></div>`;
  if(s==="b"){if(!has())return h+`<p class="zd-empty">${AN()?"حدّث التطبيق حتى تنحفظ المجالس بالتلفون.":"المجالس تنحفظ بالتلفون، افتحها من تطبيق «يومي»."}</p>`;
    h+=contHtml(st.lastb,0);
    if(L.length)h+=`<label class="zd-srch">${IC.srch}<input id="zdQ" type="search" placeholder="دوّر بكل الكتابة…" autocomplete="off"></label><div id="zdHits"></div>`;
    h+=L.length?`<p class="zd-lbl"><span>كل المحاضرات · <span class="zd-n">${L.length}</span></span><span>خلصت <span class="zd-n">${L.filter(i=>i.done).length}</span></span></p>`:
      `<p class="zd-empty">ما عندك مجالس بعد. دوس «+ أضف» وحط الصوت والكتابة، أو ملف مضغوط بيه كلهن.</p>`}
  h+=`<div class="zd-list zd-anim" data-zl="${s}">${L.map(i=>rowHtml(i,live)).join("")}</div>`;
  if(L.length>1&&has())h+=`<p class="zd-note">دوسة طويلة واسحب حتى تبدّل الترتيب</p>`;
  return h}
function wireSec(s){const q=$("#zdQ",pg);if(q){let t=0;q.oninput=()=>{clearTimeout(t);t=setTimeout(()=>hits(q.value.trim()),250)}}
  const list=$(".zd-list",pg);if(list&&has()&&list.children.length>1)dragSort(list,s);
  else if(list)$$(".zd-lec",list).forEach(r=>longPress(r,()=>delSheet(r.dataset.zi)))}
/* v1.26 أي زيارة أو دعاء ينحذف: اللي أضفتها تنمسح ملفاتها، والأصلية تنخفي (ترجع من الإعدادات) */
function delSheet(id){const i=item(id)||items("a").find(x=>x.id===id);if(!i)return;
  api.show(`<h3>${esc(i.t)}</h3><p class="zd-dmsg">${i.builtin?"تنخفي من كل مكان، وترجّعها من الإعدادات «رجّع الزيارات المحذوفة».":"ينمسح الصوت والكتابة والأوقات."}</p><button class="zd-del" id="zdDl">احذف</button>`);
  const b=$("#zdDl",$("#sheet"));b.onclick=()=>{if(!b.dataset.arm){b.dataset.arm=1;b.textContent="متأكد؟ دوس مرة ثانية";buzz(15);return}
    if(has()){try{Z().remove(id)}catch(x){}}else if(i.builtin){const c=api.cfg();c.zadHide=[...new Set([...(c.zadHide||[]),id])];api.save()}
    load();api.hide();draw();api.toast("انحذفت")}}

/* بحث بكل الكتابة (بالتلفون، بدون نت) */
function hits(q){const box=$("#zdHits",pg),list=$(".zd-list",pg),lbl=$(".zd-lbl",pg);if(!box)return;
  if(q.length<2){box.innerHTML="";if(list)list.hidden=false;if(lbl)lbl.hidden=false;return}
  const R=J("search",q)||[];if(list)list.hidden=true;if(lbl)lbl.hidden=true;
  box.innerHTML=R.length?R.slice(0,60).map(r=>{const i=item(r.id);if(!i)return"";const a=r.s.slice(0,r.ms),b=r.s.slice(r.ms,r.ms+r.ml),c=r.s.slice(r.ms+r.ml);
    return `<button class="zd-hit" data-zh="${esc(r.id)}" data-at="${r.at}" data-len="${r.ml}"><small><span class="zd-n">${i.n}</span> · ${esc(i.t)}</small><p>${r.pre?"…":""}${esc(a)}<mark>${esc(b)}</mark>${esc(c)}${r.post?"…":""}</p></button>`}).join(""):`<p class="zd-empty">ماكو «${esc(q)}» بالكتابة</p>`}

/* دوسة طويلة وسحب يبدّل الترتيب، والأرقام تتحدّث */
let dragging=false;
function dragSort(list,s){let tm=0,row=null,y0=0,rows=[],from=-1,to=-1,h=0,sy=0;
  const cancel=()=>{clearTimeout(tm);tm=0};
  list.addEventListener("pointerdown",e=>{const r=e.target.closest(".zd-lec");if(!r||e.button>0)return;y0=e.clientY;sy=pg.scrollTop;
    tm=setTimeout(()=>{tm=0;row=r;dragging=true;rows=[...list.children];from=to=rows.indexOf(r);h=r.offsetHeight+8;r.classList.add("drag");buzz(15);
      try{r.setPointerCapture(e.pointerId)}catch(x){}},450)});
  list.addEventListener("pointermove",e=>{if(tm&&Math.abs(e.clientY-y0)>8){cancel();return}if(!row)return;e.preventDefault();
    const dy=e.clientY-y0+(pg.scrollTop-sy);row.style.transform=`translateY(${dy}px)`;
    to=Math.max(0,Math.min(rows.length-1,from+Math.round(dy/h)));
    rows.forEach((x,k)=>{if(x===row)return;x.classList.add("mv");x.style.transform=k>from&&k<=to?`translateY(${-h}px)`:k<from&&k>=to?`translateY(${h}px)`:""})});
  const end=()=>{cancel();if(!row)return;const r=row;row=null;setTimeout(()=>dragging=false,50);
    if(to!==from){const ids=rows.map(x=>x.dataset.zi);ids.splice(to,0,ids.splice(from,1)[0]);try{Z().order(s,JSON.stringify(ids))}catch(x){}buzz([10,20,10]);load();draw();return}
    rows.forEach(x=>{x.style.transform="";x.classList.remove("mv")});r.classList.remove("drag");
    delSheet(r.dataset.zi)}; // v1.26 ضغطة طويلة بلا سحب: «احذف»
  list.addEventListener("pointerup",end);list.addEventListener("pointercancel",end);
  list.addEventListener("touchmove",e=>{if(row)e.preventDefault()},{passive:false});
  list.addEventListener("contextmenu",e=>e.preventDefault())}

/* ---------- السماع ---------- */
function stopsHtml(i){return (i.stops||[]).map((b,k)=>`<button data-zst="${k}"><span>★ ${esc(b.n||"وقفة "+(k+1))}</span><span class="zd-n">${fmt(b.t)}</span></button>`).join("")}
function listenHtml(id){const i=item(id);if(!i)return `<button class="zd-back" data-zb>→ رجوع</button><p class="zd-empty">انحذفت</p>`;
  const lec=i.sec==="b",rate=i.rate||1;
  let h=`<button class="zd-back" data-zb>→ رجوع</button><button class="zd-h3" data-zt aria-label="غيّر العنوان">${lec?`<span class="zd-n">${i.n}</span>`:""}${esc(i.t)}</button>
  <div class="zd-scrub" id="zdSc"><div class="tr"></div><div class="fill"></div>${(i.stops||[]).map(b=>`<i class="bm" style="left:${pct(b.t,i.dur)}%"></i>`).join("")}<i class="knob"></i></div>
  <div class="zd-times"><span id="zdCur">${fmt(i.pos)}</span><span id="zdRem">-${fmt(i.dur-i.pos)}</span></div>
  <div class="zd-ctrl"><button class="sk" data-zr>${rate}×</button><button class="sk" data-zk="15">+15</button><button class="pp" data-zp aria-label="شغّل">${IC.play}</button><button class="sk" data-zk="-15">-15</button><button class="star" data-zs2>★ وقفة</button></div>
  <div class="zd-bms" id="zdBm">${stopsHtml(i)}</div>`;
  if(lec)h+=bookHtml(i);
  else h+=duaaHtml(i);
  h+=`<button class="zd-del" data-zdel>احذف</button>`;return h}
function bookHtml(i){let t="";if(i.hasText)try{t=Z().text(i.id)||""}catch(e){}
  const lines=t.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,3).join("\n"),m=i.mc||{};
  return `<button class="zd-book${t?"":" no"}" data-zread><div class="hh"><b>📖 الكتابة</b><span>${t?"وصلت "+Math.round(pct(i.rp||0,i.tl||1))+"٪ ‹":"ناقصها الكتابة"}</span></div>
  <p>${esc(lines||"بعد ما انضافت الكتابة لهالمحاضرة.")}</p>${t?`<div class="meta"><span><i></i><span class="zd-n">${m.u||0}</span> خط</span><span>★ <span class="zd-n">${m.s||0}</span></span><span>✎ <span class="zd-n">${m.n||0}</span> ملاحظة</span></div>`:""}</button>`}
// كتابة الزيارة/الدعاء المضافة: إذا بيها أوقات مثل [12:40] بأول السطر، السطر الحالي يتظلّل ويا الصوت
function paras(t){const out=[];String(t||"").split("\n").forEach(l=>{const m=/^\s*\[(?:(\d+):)?(\d{1,2}):(\d{2})\]\s*/.exec(l);const x=(m?l.slice(m[0].length):l).trim();
  if(!x)return;out.push({x,t:m?(+(m[1]||0))*3600+(+m[2])*60+(+m[3]):null})});return out}
// تصليح ٢٢: الجديدة اللي ما بيها أوقات، التلفون يحسبها وقت الإضافة (<id>.sync.json) وتنحط على نفس الأسطر
function syncTimes(i,P){if(P.some(p=>p.t!=null)||!Z().sync)return;const S=J("sync",i.id)||[];if(S.length!==P.length)return;S.forEach((s,k)=>{if(s&&s.start>=0)P[k].t=s.start})}
function duaaHtml(i){let t="";if(i.hasText)try{t=Z().text(i.id)||""}catch(e){}const P=paras(t);syncTimes(i,P);const sync=P.some(p=>p.t!=null);
  return `<div class="zd-rt"><span>${i.sync?"يضبط الكتابة…":sync?"الكتابة · تمشي ويا الصوت":"الكتابة"}</span><span class="fs"><button data-zf="-2">A-</button><button data-zf="2">A+</button></span></div>
  <div class="zd-duaa${sync?" sync":""}" id="zdDu" style="--zfz:${fz()}px">${P.length?P.map((p,k)=>`<p class="zd-para zd-read" data-k="${k}"${p.t!=null?` data-t="${p.t}"`:""}>${esc(p.x)}</p>`).join(""):`<p class="zd-note">ناقصها الكتابة</p>`}</div>`}
const fz=()=>{const v=+((api&&api.cfg().zfs)||17);return v>=15&&v<=23?v:17};

function wireListen(id){const i=item(id);if(!i)return;const sc=$("#zdSc",pg);
  const seekAt=x=>{const r=sc.getBoundingClientRect();return Math.max(0,Math.min(1,(x-r.left)/r.width))*(i.dur||0)};
  let drag=false;
  sc.addEventListener("pointerdown",e=>{drag=true;try{sc.setPointerCapture(e.pointerId)}catch(x){}paint({pos:seekAt(e.clientX),dur:i.dur},1)});
  sc.addEventListener("pointermove",e=>{if(drag)paint({pos:seekAt(e.clientX),dur:i.dur},1)});
  sc.addEventListener("pointerup",e=>{if(!drag)return;drag=false;const t=seekAt(e.clientX);ensurePlay(id,t,false);buzz(6)});
  $$("[data-zst]",pg).forEach(b=>longPress(b,()=>stopSheet(id,+b.dataset.zst)));
  if(i.hasAudio&&Z().fromHere&&!i.sync)$$("#zdDu.sync .zd-para",pg).forEach(e=>longPress(e,()=>hereSheet(id,+e.dataset.k)));
  const p=now();paint(p&&p.k===id?p:{pos:i.pos,dur:i.dur,on:false});
  startPoll(id)}
// الصوت ما شغّال على هالمحاضرة؟ يبدي منها (من وين وقفت أو من ثانية معيّنة)
function ensurePlay(id,t,play){const p=now();if(p&&p.k===id){if(t!=null)Z().seek(t);if(play)Z().toggle()}else Z().play(id,t==null?-1:t,!!play);setTimeout(tick,60)}
let lastK=-1;
function paint(p,dragOnly){if(!p)return;const d=p.dur||0,x=pct(p.pos,d)+"%";const f=$(".fill",pg),k=$(".knob",pg);if(!f)return;
  f.style.width=x;k.style.left=x;$("#zdCur",pg).textContent=fmt(p.pos);$("#zdRem",pg).textContent="-"+fmt(d-p.pos);
  if(dragOnly)return;const pp=$("[data-zp]",pg);if(pp&&pp.dataset.on!==String(!!p.on)){pp.dataset.on=!!p.on;pp.innerHTML=p.on?IC.pause:IC.play;pp.setAttribute("aria-label",p.on?"وقّف":"شغّل")}
  const r=$("[data-zr]",pg);if(r&&p.rate)r.textContent=p.rate+"×";
  const du=$("#zdDu.sync",pg);if(du){const L=$$(".zd-para[data-t]",du);let k=-1;L.forEach((e,n)=>{if(+e.dataset.t<=p.pos+.2)k=n});
    L.forEach((e,n)=>{e.classList.toggle("cur",n===k);e.classList.toggle("past",n<k)});
    if(k!==lastK&&k>=0&&p.on){lastK=k;const e=L[k],r2=e.getBoundingClientRect();if(r2.top<90||r2.bottom>innerHeight-120)pg.scrollTo({top:pg.scrollTop+r2.top-innerHeight/3,behavior:calm()?"auto":"smooth"})}}}
function tick(){const c=cur();if(c.v!=="listen"||!isOpen()||document.hidden)return;const p=now(),i=item(c.id);
  if(p&&p.k===c.id)paint(p);else if(i)paint({pos:i.pos,dur:i.dur,on:false,rate:i.rate||1})}
function startPoll(){stopPoll();lastK=-1;poll=setInterval(tick,500)}
function stopPoll(){if(poll){clearInterval(poll);poll=0}}

/* ---------- الدوسة الطويلة ---------- */
let lpFired=0;
function longPress(el,fn){let t=0,x=0,y=0;
  el.addEventListener("pointerdown",e=>{x=e.clientX;y=e.clientY;t=setTimeout(()=>{t=0;lpFired=Date.now();buzz(15);fn()},500)});
  el.addEventListener("pointermove",e=>{if(t&&Math.hypot(e.clientX-x,e.clientY-y)>8){clearTimeout(t);t=0}});
  ["pointerup","pointercancel","pointerleave"].forEach(k=>el.addEventListener(k,()=>{if(t){clearTimeout(t);t=0}}));
  el.addEventListener("contextmenu",e=>e.preventDefault())}

/* ---------- أوراق صغيرة: العنوان، الوقفة ---------- */
const inp=(id,l,v,a,mx)=>`<div class="zd-in"><input id="${id}" placeholder=" " value="${esc(v||"")}" maxlength="${mx}" ${a||""}><label for="${id}">${l}</label></div>`;
function titleSheet(id){const i=item(id);if(!i)return;
  api.show(`<h3>العنوان</h3>${inp("zdTi","العنوان",i.t,"",120)}<button class="zd-sv" id="zdTs">احفظ</button><button class="close" data-x>سكّر</button>`);
  const sh=$("#sheet"),t=$("#zdTi",sh);setTimeout(()=>{try{t.focus()}catch(e){}},300);
  $("#zdTs",sh).onclick=()=>{const v=t.value.trim();if(!v){shake(t.parentNode);return}Z().setTitle(id,v);load();api.hide();draw();api.toast("انحفظ ✓")}}
// «يبدي من هنا»: هالسطر يبدي من وين واصل الصوت هسه، واللي بعده تنعاد حسبتها لحالها
function hereSheet(id,k){const i=item(id);if(!i)return;const p=now(),pos=p&&p.k===id?p.pos:i.pos||0;const L=$$("#zdDu .zd-para",pg)[k];
  api.show(`<h3>هالسطر</h3><p class="zd-hint" style="font-size:14px;line-height:1.8">${esc((L?L.textContent:"").slice(0,90))}</p><button class="zd-sv" id="zdHr">يبدي من هنا · <span class="zd-n">${fmt(pos)}</span></button><button class="close" data-x>سكّر</button>`);
  $("#zdHr",$("#sheet")).onclick=()=>{let ok=false;try{ok=Z().fromHere(id,k,pos)}catch(e){}api.hide();if(!ok){api.toast("ما گدرت");return}buzz(8);load();draw()}}
function stopSheet(id,k){const i=item(id),b=i&&i.stops&&i.stops[k];if(!b)return;
  api.show(`<h3>الوقفة · <span class="zd-n">${fmt(b.t)}</span></h3>${inp("zdBn","اسمها",b.n||"وقفة "+(k+1),"",40)}<button class="zd-sv" id="zdBs">احفظ</button><button class="zd-del" id="zdBd">احذف الوقفة</button>`);
  const sh=$("#sheet");
  $("#zdBs",sh).onclick=()=>{const S=i.stops.slice();S[k]={t:b.t,n:$("#zdBn",sh).value.trim().slice(0,40)||"وقفة "+(k+1)};Z().setStops(id,JSON.stringify(S));load();api.hide();draw()};
  $("#zdBd",sh).onclick=()=>{const S=i.stops.slice();S.splice(k,1);Z().setStops(id,JSON.stringify(S));load();api.hide();draw();api.toast("انشالت")}}

/* ---------- الإضافة ---------- */
let add=null; // {sec, kind, audio:{tmp,name,dur}, zipCb}
function addSheet(s){if(!has()){api.toast(AN()?"حدّث التطبيق حتى تضيف":"الإضافة من تطبيق «يومي» بالموبايل");return}
  add={sec:s,kind:"zyara",audio:null};const a=s==="a";
  api.show(`<h3>${a?"إضافة زيارة أو دعاء":"محاضرة جديدة"}</h3>${a?`<div class="zd-chips">${[["zyara","زيارة"],["dua","دعاء"]].map(([k,l])=>`<button data-zk2="${k}" aria-pressed="${k==="zyara"}">${l}</button>`).join("")}</div>`:""}
  ${a||!Z().pickMany?`<button class="zd-file zip" id="zdZip"><i>⧉</i><span><b style="font-weight:600">ملف مضغوط (zip)</b> · الصوت والكتابة سوا</span></button>
  <p class="zd-hint">بالـzip تقدر تحط ${a?"وحدة أو كلهن":"محاضرة وحدة أو كلهن"}. سمّي الصوت والكتابة نفس الاسم، مثلاً «03 الصبر». الرقم يصير الترتيب، والاسم يصير العنوان.</p>`
  :`<button class="zd-file zip" id="zdMany"><i>＋</i><span><b style="font-weight:600">كذا مجلس</b> · zip، أو كذا صوت وكتابة سوا</span></button>
  <p class="zd-hint">الصوت والكتابة اللي بنفس الاسم يصيرن مجلس واحد. الرقم بأول الاسم (إذا موجود) يصير الترتيب. وبالـzip كل مجلد مجلس. تشوفهن قبل لا ينزلن.</p>`}
  <p class="zd-sl">أو وحدة وحدة</p>
  ${inp("zdAt","العنوان (لازم)","","",120)}
  <button class="zd-file" id="zdAu"><i>♪</i><span>اختار الملف الصوتي من تليفونك</span></button>
  <div class="zd-in"><textarea id="zdTx" placeholder=" " rows="4"></textarea><label for="zdTx">الكتابة (الصقها هنا)</label></div>
  <button class="zd-lnk" id="zdTf">أو اختار ملف txt</button>
  <button class="zd-sv" id="zdAs">احفظ</button>`);
  const sh=$("#sheet");
  $$("[data-zk2]",sh).forEach(b=>b.onclick=()=>{add.kind=b.dataset.zk2;$$("[data-zk2]",sh).forEach(x=>x.setAttribute("aria-pressed",x===b));buzz(6)});
  {const z=$("#zdZip",sh);if(z)z.onclick=()=>{try{Z().pickZip(s,add.kind)}catch(e){}};const m=$("#zdMany",sh);if(m)m.onclick=()=>{try{Z().pickMany()}catch(e){}}}
  $("#zdAu",sh).onclick=()=>{try{Z().pick("audio")}catch(e){}};
  $("#zdTf",sh).onclick=()=>{try{Z().pick("txt")}catch(e){}};
  $("#zdAs",sh).onclick=()=>{const t=$("#zdAt",sh).value.trim(),tx=$("#zdTx",sh).value;
    if(!t){shake($("#zdAt",sh).parentNode);return}
    if(!add.audio&&!tx.trim()){shake($("#zdAu",sh));return}
    const r=J("add",JSON.stringify({sec:s,kind:add.kind,t,tmp:add.audio?add.audio.tmp:"",text:tx}));
    if(!r||!r.id){api.toast("ما انحفظت، جرّب مرة ثانية");return}
    buzz([20,30,40]);add=null;load();api.hide();draw();api.toast(r.miss?r.miss+" · انضافت":r.sync?"انضافت ✓ · يضبط الكتابة…":"انضافت ✓")}}
/* ---------- «＋ كذا مجلس» (تعديل القرآن ٢): zip أو كذا ملف ← نطابق ← تشوفهن ← ينزلن بالخلفية ---------- */
const ar=n=>String(n).replace(/[0-9]/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
const LEADN=/^\s*([0-9٠-٩]+)[\s._\-–)]*/;
const bkFold=s=>String(s).replace(/[ً-ٰٟـ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه");
const bkKey=n=>bkFold(String(n).replace(LEADN,"").replace(/[_\-.]+/g," ")).replace(/\s+/g," ").trim().toLowerCase();
const bkNo=n=>{const m=String(n).match(LEADN);return m&&String(n).replace(LEADN,"").trim()?+m[1].replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)):-1};
const bkTitle=n=>{const t=String(n).replace(LEADN,"").replace(/_+/g," ").replace(/\s+/g," ").trim();return t||String(n).trim()};
// الملفات ← المجالس: بالمجلد كل مجلد مجلس (إذا بيه أكثر من صوت، كل صوت ويا كتابته بالاسم)، وبرّه الصوت والكتابة بنفس الاسم سوا
function bulkMatch(F){const G=new Map();F.forEach(f=>{const d=f.dir||"";if(!G.has(d))G.set(d,[]);G.get(d).push(f)});
  const rows=[],dirs=[...G.keys()].filter(Boolean),root=dirs.length===1&&!G.has("")?dirs[0]:null; // zip بيه مجلد واحد بس، والملفات كلها جوّاه
  for(const [d,fs] of G){const A=fs.filter(f=>f.kind==="a"),T=fs.filter(f=>f.kind==="t");
    if(d&&d!==root&&A.length<=1){const nm=d.split("/").pop(),x=A[0]?T.find(t=>bkKey(t.name)===bkKey(A[0].name))||T[0]:T[0];
      rows.push({t:bkTitle(nm),no:bkNo(nm),src:nm,a:A[0]||null,x:x||null});continue}
    const used=new Set();
    A.forEach(a=>{const x=T.find(t=>!used.has(t)&&bkKey(t.name)===bkKey(a.name));if(x)used.add(x);rows.push({t:bkTitle(a.name),no:bkNo(a.name),src:a.name,a,x:x||null})});
    T.filter(t=>!used.has(t)).forEach(x=>rows.push({t:bkTitle(x.name),no:bkNo(x.name),src:x.name,a:null,x}))}
  const nat=(p,q)=>p.src.localeCompare(q.src,"ar",{numeric:true});
  return rows.sort((p,q)=>p.no>=0&&q.no>=0?p.no-q.no||nat(p,q):p.no>=0?-1:q.no>=0?1:nat(p,q))}
let bk=null;
async function bulkScanned(F){bk={F,rows:bulkMatch(F),T:F.filter(f=>f.kind==="t")};
  if(!bk.rows.length){bk=null;api.hide();api.toast("ما لگيت صوت أو كتابة بالملفات");return}
  bulkDraw();
  // الـPDF: نطلّع كتابته هنا (pdf.js)، والسطر يتحدّث لما يخلص
  const P=bk.T.filter(t=>t.pdf&&t.text==null);if(!P.length)return;
  for(const t of P){try{t.text=await pdfText(Z().pdf(t.k))}catch(e){t.text="";t.bad=1}}
  if(bk&&!bk.going)bulkDraw()}
let pdfjs=null;
function pdfText(b64){if(!b64)return Promise.reject(new Error("no pdf"));
  // pdf.js من داخل التطبيق (/pdfjs/ ← assets، ZadBulk.lib): بلا إنترنت من أول مرة. الـworker يشتغل بنفس الصفحة (pdfjsWorker)
  const js=u=>new Promise((ok,no)=>{const s=document.createElement("script");s.src=u;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  if(!pdfjs)pdfjs=js("/pdfjs/pdf.worker.min.js").then(()=>js("/pdfjs/pdf.min.js")).then(()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc="/pdfjs/pdf.worker.min.js";return window.pdfjsLib})
    .catch(e=>{pdfjs=null;throw new Error("pdf.js")});
  return pdfjs.then(async L=>{const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    const doc=await L.getDocument({data:u}).promise;const out=[];
    for(let p=1;p<=doc.numPages;p++){const c=await (await doc.getPage(p)).getTextContent();pdfLines(c.items).forEach(l=>out.push(l));out.push("")}
    return out.join("\n").replace(/\n{3,}/g,"\n\n").trim()})}
// الـPDF يحفظ الحروف العربية بترتيب الشاشة (من اليسار) وبأشكالها (ﻢﻴﺣﺮﻟا): نرتّب كل سطر من اليمين ونرجّعها حروف عادية
function pdfLines(I){const L=[];I.filter(it=>it.str!==undefined&&it.transform).sort((a,b)=>b.transform[5]-a.transform[5]).forEach(it=>{
    const y=it.transform[5],h=Math.max(1,it.height||Math.abs(it.transform[3])||10),l=L.find(l=>Math.abs(l.y-y)<h*.5);if(l)l.it.push(it);else L.push({y,h,it:[it]})});
  return L.map(l=>{const rtl=l.it.reduce((n,it)=>n+(it.dir==="rtl"?it.str.length:-it.str.replace(/\s/g,"").length),0)>0,x=it=>it.transform[4],w=it=>it.width||0;
    const A=l.it.slice().sort((a,b)=>rtl?x(b)+w(b)-(x(a)+w(a)):x(a)-x(b));let t="",prev=null;
    A.forEach(it=>{if(prev){const gap=rtl?x(prev)-(x(it)+w(it)):x(it)-(x(prev)+w(prev));if(gap>l.h*.25&&!/\s$/.test(t)&&!/^\s/.test(it.str))t+=" "}t+=it.str;prev=it});
    return t.normalize("NFKC").replace(/[ \t]+/g," ").trim()})}
function bulkDraw(){if(!bk)return;const R=bk.rows,T=bk.T,taken=new Map();R.forEach((r,i)=>{if(r.x)taken.set(r.x,i)});
  api.show(`<h3>كذا مجلس · ${ar(R.length)}</h3><p class="zd-dmsg">شيّك قبل لا تنزلهن: العنوان تغيّره من مكانه، والكتابة تختارها إذا ما لگيتها.</p>
  <div class="zd-bl">${R.map((r,i)=>`<div class="zd-br"><input class="zd-bt" data-rt="${i}" value="${esc(r.t)}" maxlength="120" aria-label="العنوان">
    <div class="zd-bm"><span class="zd-bi${r.a?"":" off"}" title="${r.a?esc(r.a.name):"بلا صوت"}">🔊</span><span class="zd-bi${r.x?"":" off"}">📄</span>
    <select data-rx="${i}" aria-label="الكتابة"><option value="">${r.x?"بلا كتابة":"اختار كتابة…"}</option>${T.map((t,k)=>`<option value="${k}"${r.x===t?" selected":""}>${esc(t.name)}${t.pdf&&t.text==null?" (يقرا…)":t.bad?" (ما انقرت)":""}${taken.has(t)&&taken.get(t)!==i?" ·":""}</option>`).join("")}</select>
    ${r.a&&r.a.dur?`<span class="zd-bd zd-n">${fmt(r.a.dur)}</span>`:""}<button class="zd-bx" data-rdel="${i}" aria-label="شيل">✕</button></div></div>`).join("")}</div>
  <button class="zd-sv" id="zdBgo">نزّلهن كلهن</button>`);
  const sh=$("#sheet");
  $$("[data-rt]",sh).forEach(e=>e.oninput=()=>{R[+e.dataset.rt].t=e.value});
  $$("[data-rx]",sh).forEach(e=>e.onchange=()=>{const i=+e.dataset.rx,t=e.value===""?null:T[+e.value];if(t)R.forEach(r=>{if(r.x===t)r.x=null});R[i].x=t;bulkDraw()});
  $$("[data-rdel]",sh).forEach(e=>e.onclick=()=>{R.splice(+e.dataset.rdel,1);buzz(6);if(!R.length){bk=null;api.hide();return}bulkDraw()});
  $("#zdBgo",sh).onclick=bulkGo}
function bulkGo(){const R=bk.rows.filter(r=>r.a||r.x&&(r.x.text||r.x.pdf));if(!R.length){api.toast("ماكو صوت ولا كتابة");return}
  if(R.some(r=>r.x&&r.x.pdf&&r.x.text==null)){api.toast("لحظة، دا أقرا الـPDF…");return}
  const old=items("b"),same=r=>old.find(i=>bkKey(i.t)===bkKey(r.t)),dup=R.filter(same);
  const go=how=>{const rows=[];R.forEach(r=>{const o=same(r);if(o&&how==="skip")return;
      rows.push({t:r.t.trim()||"مجلس",a:r.a?r.a.k:"",text:r.x&&r.x.text||"",replace:o&&how==="replace"?o.id:""})});
    if(!rows.length){bk=null;api.hide();api.toast("ما انضاف شي");return}
    bk.going=rows.length;bulkAt(0,rows.length);try{Z().bulkAdd(JSON.stringify(rows))}catch(e){api.toast("ما گدرت")}};
  if(!dup.length){go("both");return}
  api.show(`<h3>${dup.length===1?`«${esc(dup[0].t)}» موجود`:`${ar(dup.length)} منهن أسماءهن موجودة`}</h3><p class="zd-dmsg">شسوي بيهن؟</p>
  <button class="zd-sv" data-bd="replace">استبدل</button><button class="zd-nmb zd-bw" data-bd="skip">تخطّى</button><button class="zd-nmb zd-bw" data-bd="both">خليهم الاثنين</button>`);
  $$("[data-bd]",$("#sheet")).forEach(b=>b.onclick=()=>go(b.dataset.bd))}
// ينزلن بالخلفية: شريط يمشي، وتگدر تسد وتكمل
function bulkAt(done,total){if(!bk||!bk.going)return;
  if(!$("#zdBp"))api.show(`<h3>دا أنزّل المجالس</h3><div class="zd-bp"><i id="zdBp"></i></div><p class="zd-dmsg" id="zdBn"></p><button class="close" data-x>كمّل بالخلفية</button>`);
  const p=$("#zdBp");if(p)p.style.width=Math.round(done/Math.max(1,total)*100)+"%";const n=$("#zdBn");if(n)n.textContent=`${ar(done)} من ${ar(total)}`;
  if(done>=total){bk=null;load();if(isOpen())draw();setTimeout(()=>{if($("#zdBp"))api.hide()},500);buzz([20,30,40]);api.toast(total===1?"انضاف مجلس ✓":`انضافن ${ar(total)} مجالس ✓`)}}
// النتيجة من التلفون (اختيار ملف، أو الـzip خلص)
window.onYawmiZad=function(o){if(!o)return;const sh=$("#sheet");
  if(o.ev==="pick"&&o.ok&&sh&&add){if(o.what==="audio"){add.audio=o;const b=$("#zdAu",sh);if(b){b.classList.add("ok");b.innerHTML=`<i>♪</i><span>${esc(o.name)} · <span class="zd-n">${fmt(o.dur)}</span></span>`}
      const t=$("#zdAt",sh);if(t&&!t.value.trim())t.value=String(o.name||"").replace(/\.[^.]+$/,"").replace(/^\s*\d+[\s._-]*/,"")}
    if(o.what==="txt"){const t=$("#zdTx",sh);if(t)t.value=o.text||""}}
  if(o.ev==="zip"){add=null;load();api.hide();if(isOpen())draw();
    if(!o.ok){api.toast("ما گدرت أفتح الملف");return}
    const m=(o.missing||[]).length;api.toast(o.added?(o.added===1?"انضافت وحدة":"انضافن "+o.added)+(m?` · ${m} ناقصها شي`:" ✓"):"ما لگيت صوت أو كتابة بالملف")}
  if(o.ev==="bulk-wait"){bk={wait:1};api.show(`<h3>كذا مجلس</h3><div class="zd-bk-w"><i></i>دا أفتح ${o.n>1?ar(o.n)+" ملفات":"الملف"}…</div>`)}
  if(o.ev==="bulk-scan"){if(!o.ok){bk=null;if(!o.none){api.hide();api.toast("ما گدرت أفتح الملفات")}return}bulkScanned(o.files||[])}
  if(o.ev==="bulk")bulkAt(o.done,o.total);
  if(o.ev==="state"&&isOpen()){load();const c=cur();if(c.v!=="listen")draw()}
  if(o.ev==="synced"&&isOpen()){load();const c=cur();if(c.v!=="listen"||c.id===o.id)draw()}};

/* ---------- صفحة القراءة: مثل الكتاب، ما تتحرك ويا الصوت ---------- */
function rdOpen(id,at,len,swap){const i=item(id);if(!i)return;let t="";try{t=Z().text(id)||""}catch(e){}
  if(!rd){rd=document.createElement("section");rd.id="zdRd";rd.hidden=true;document.body.appendChild(rd)}
  rd.dataset.id=id;rd.hidden=false;rd._ed=0;rd.classList.remove("zd-editing");{const eb=$(".zd-edb",rd);if(eb)eb.hidden=true}document.body.classList.add("zd-rdo");if(!swap)try{history.pushState({zd:"rd"},"")}catch(e){}
  rd.innerHTML=`<div class="zd-rbar"><button class="zd-back" data-zrb style="margin:0">→ رجوع</button><div class="r">${i.sec==="b"&&t&&has()&&Z().setText?`<button data-zed-t>✎ تعديل</button>`:""}<button data-zf="-2">A-</button><button data-zf="2">A+</button><button data-zmk>علاماتي</button></div></div>
  <div class="zd-page" id="zdPage" style="--zfz:${fz()}px"><h2>${esc(i.t)}</h2><p class="sub">${i.sec==="b"?`المحاضرة <span class="zd-n">${i.n}</span> · `:""}<span class="zd-n">${i.dur?fmt(i.dur):""}</span></p>
  <div class="zd-txt zd-read" id="zdTxt"></div><p class="zd-endp">— نهاية ${i.sec==="b"?"المحاضرة "+i.n:"الكتابة"} —</p></div>`;
  rd._t=t;rd._m=(J("marks",id)||[]).filter(m=>m&&m.end>m.start);rd._q=at!=null?[at,at+(len||1)]:null;
  render();try{Z().quiet(true)}catch(e){}
  requestAnimationFrame(()=>{const page=$("#zdPage",rd),el=$(rd._q?".q":".zd-here",rd);if(el){page.scrollTop=Math.max(0,el.getBoundingClientRect().top-page.getBoundingClientRect().top-page.clientHeight/3)}
    if(rd._q)setTimeout(()=>{$$(".q",rd).forEach(x=>x.classList.add("off"))},900)});
  document.removeEventListener("selectionchange",onSel);document.addEventListener("selectionchange",onSel)}
function rdClose(quiet){if(!rd||rd.hidden)return;saveRead();rd.hidden=true;document.body.classList.remove("zd-rdo");hideBar();document.removeEventListener("selectionchange",onSel);try{Z().quiet(false)}catch(e){}
  if(!quiet&&isOpen()){load();const c=cur();if(c.v==="listen")draw()}}
// النص يتقسّم لقطع حسب العلامات ويتلوّن. النص يتغيّر بس بـ«✎ تعديل» (والعلامات تتزحزح وياه)، والعلامات أرقام حروف منه.
function render(){const t=rd._t,M=rd._m,i=item(rd.dataset.id),rp=i&&i.rp>0&&i.rp<t.length?i.rp:-1,Q=rd._q;
  const cuts=new Set([0,t.length]);M.forEach(m=>{cuts.add(Math.max(0,Math.min(t.length,m.start)));cuts.add(Math.max(0,Math.min(t.length,m.end)))});
  if(rp>0)cuts.add(rp);if(Q){cuts.add(Q[0]);cuts.add(Math.min(t.length,Q[1]))}
  const C=[...cuts].sort((a,b)=>a-b);let h="";
  for(let k=0;k<C.length-1;k++){const a=C[k],b=C[k+1];if(a===rp)h+=`<span class="zd-here" contenteditable="false"></span>`;if(b<=a)continue;
    const on=M.filter(m=>m.start<b&&m.end>a),cls=new Set();on.forEach(m=>{cls.add(m.type);if(m.type==="s"&&m.start===a)cls.add("sb");if(m.type==="n"&&m.end===b)cls.add("ne")});
    if(Q&&a>=Q[0]&&b<=Q[1])cls.add("q");
    h+=`<span class="zs${cls.size?" "+[...cls].join(" "):""}" data-o="${a}">${esc(t.slice(a,b))}</span>`}
  if(!t)h=`<span class="zd-note">ناقصها الكتابة</span>`;
  $("#zdTxt",rd).innerHTML=h}
// رقم الحرف من مكان بالصفحة: طول النص من أول الكتابة لهالنقطة (الـ«وصلت هنا» و★ و✎ مرسومات بالـCSS، ما يدخلن بالعدّ)
function offAt(node,off){const T=$("#zdTxt",rd);if(!T||!T.contains(node))return -1;const r=document.createRange();r.setStart(T,0);try{r.setEnd(node,off)}catch(e){return -1}return r.toString().length}
function saveRead(){if(!rd||rd.hidden)return;const page=$("#zdPage",rd),T=$("#zdTxt",rd);if(!page||!T||!rd._t)return;
  const b=page.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+60;let o=-1;
  try{const c=document.caretRangeFromPoint?document.caretRangeFromPoint(x,y):null;if(c)o=offAt(c.startContainer,c.startOffset)}catch(e){}
  if(page.scrollTop<40)o=0;if(o<0)return;
  // أول السطر، مو نص الكلمة
  const t=rd._t;while(o>0&&!/\s/.test(t[o-1]))o--;
  try{Z().readAt(rd.dataset.id,o)}catch(e){}}
function saveMarks(){try{Z().setMarks(rd.dataset.id,JSON.stringify(rd._m))}catch(e){}const page=$("#zdPage",rd),y=page.scrollTop;render();page.scrollTop=y;load()}

/* ---------- تعديل الكتابة (تعديل القرآن ٢): بنفس مكانها ونفس الخط، والعلامات تتزحزح ويا الكلام ---------- */
// الفرق بين النصين: اللي بالنص يبقى حرف حرف (Myers)، بعد ما نشيل الأول والآخر المتشابهين. map[i] = مكان الحرف القديم i بالجديد، أو -1 إذا انمسح
function diffMap(a,b){const n=a.length,m=b.length;let p=0;while(p<n&&p<m&&a[p]===b[p])p++;let q=0;while(q<n-p&&q<m-p&&a[n-1-q]===b[m-1-q])q++;
  const map=new Int32Array(n+1);for(let i=0;i<p;i++)map[i]=i;for(let i=0;i<q;i++)map[n-1-i]=m-1-i;map[n]=m;
  const A=a.slice(p,n-q),B=b.slice(p,m-q),N=A.length,M=B.length;for(let i=0;i<N;i++)map[p+i]=-1;
  if(!N||!M)return map;
  const MAX=Math.min(N+M,4000),off=MAX+1,V=new Int32Array(2*MAX+3),T=[];let done=-1;
  for(let d=0;d<=MAX&&done<0;d++){T.push(V.slice());
    for(let k=-d;k<=d;k+=2){let x=k===-d||(k!==d&&V[off+k-1]<V[off+k+1])?V[off+k+1]:V[off+k-1]+1,y=x-k;
      while(x<N&&y<M&&A[x]===B[y]){x++;y++}V[off+k]=x;if(x>=N&&y>=M){done=d;break}}}
  if(done<0)return map; // تغيّر كلشي بالنص: الوسط ينحسب ممسوح وانكتب من جديد
  let x=N,y=M;for(let d=done;d>0;d--){const W=T[d],k=x-y,pk=k===-d||(k!==d&&W[off+k-1]<W[off+k+1])?k+1:k-1,px=W[off+pk],py=px-pk;
    while(x>px&&y>py){x--;y--;map[p+x]=p+y}x=px;y=py}
  while(x>0&&y>0){x--;y--;map[p+x]=p+y}
  return map}
// علامة [start,end): أول حرف باقي منها لآخر حرف باقي. إذا كلامها انمسح كله تنشال
function shiftMarks(M,map,n){const out=[];M.forEach(mk=>{let s=-1,e=-1;for(let i=Math.max(0,mk.start);i<Math.min(n,mk.end);i++){if(map[i]>=0){if(s<0)s=map[i];e=map[i]+1}}
  if(s>=0&&e>s)out.push(Object.assign({},mk,{start:s,end:e}))});return out}
function shiftAt(o,map,n){if(o==null||o<0)return o;for(let i=Math.min(o,n);i<=n;i++)if(map[i]>=0)return map[i];return map[n]}
function edOpen(){if(!rd||rd.hidden||rd._ed)return;hideBar();getSelection().removeAllRanges();const T=$("#zdTxt",rd),page=$("#zdPage",rd),y=page.scrollTop;
  rd._ed=1;rd.classList.add("zd-editing");
  T.innerHTML=`<textarea class="zd-edt zd-read" id="zdEd" spellcheck="false" dir="rtl"></textarea>`;const ta=$("#zdEd",T);ta.value=rd._t;
  const fit=()=>{ta.style.height="auto";ta.style.height=ta.scrollHeight+"px"};ta.oninput=fit;fit();page.scrollTop=y;
  let eb=$(".zd-edb",rd);if(!eb){eb=document.createElement("div");eb.className="zd-edb";rd.appendChild(eb)}
  eb.innerHTML=`<button class="zd-sv" data-zed-s>احفظ</button><button class="zd-edc" data-zed-c>إلغاء</button>`;eb.hidden=false}
function edClose(){rd._ed=0;rd.classList.remove("zd-editing");const eb=$(".zd-edb",rd);if(eb)eb.hidden=true;const page=$("#zdPage",rd),y=page.scrollTop;render();page.scrollTop=y}
function edCancel(){const ta=$("#zdEd",rd);if(ta&&ta.value!==rd._t){
    api.show(`<h3>تلغي التعديل؟</h3><p class="zd-dmsg">اللي غيّرته ما ينحفظ.</p><button class="zd-del" id="zdEx">إي، ألغيه</button><button class="close" data-x>لا، كمّل</button>`);
    $("#zdEx",$("#sheet")).onclick=()=>{api.hide();edClose()};return}
  edClose()}
function edSave(){const ta=$("#zdEd",rd);if(!ta)return;const nt=ta.value.replace(/\r\n?/g,"\n");if(nt===rd._t){edClose();return}
  if(!nt.trim()){api.toast("الكتابة فارغة");return}
  const old=rd._t,map=diffMap(old,nt),M=shiftMarks(rd._m,map,old.length),gone=rd._m.length-M.length,i=item(rd.dataset.id),rp=i&&i.rp>0?shiftAt(i.rp,map,old.length):-1;
  let ok=false;try{ok=Z().setText(rd.dataset.id,nt,JSON.stringify(M),rp==null?-1:rp)}catch(e){}
  if(!ok){api.toast("ما گدرت أحفظ");return}
  rd._t=nt;rd._m=M;load();buzz(10);edClose();api.toast(gone?`انحفظ ✓ (${gone===1?"علامة وحدة انشالت":gone+" علامات انشالت"} لأن كلامها انمسح)`:"انحفظ ✓")}

/* شريط التعليم: تسحب على كلام ويطلع فوقه */
function bar(html,rect){if(!tbar){tbar=document.createElement("div");tbar.className="zd-tbar";tbar.hidden=true;document.body.appendChild(tbar);
    tbar.addEventListener("pointerdown",e=>e.preventDefault()); // ما يضيّع التحديد
    tbar.addEventListener("click",onBar)}
  tbar.innerHTML=html;tbar.hidden=false;const w=tbar.offsetWidth,hh=tbar.offsetHeight;
  let x=rect.left+rect.width/2-w/2,y=rect.top-hh-10;if(y<70)y=rect.bottom+10;
  tbar.style.left=Math.max(8,Math.min(innerWidth-w-8,x))+"px";tbar.style.top=y+"px"}
function hideBar(){if(tbar)tbar.hidden=true}
let selT=0,selR=null,tapM=null;
function onSel(){clearTimeout(selT);selT=setTimeout(()=>{if(!rd||rd.hidden||rd._ed)return;const s=getSelection();
  if(!s||s.isCollapsed||!s.rangeCount){if(!tapM)hideBar();return}
  const r=s.getRangeAt(0),T=$("#zdTxt",rd);if(!T.contains(r.commonAncestorContainer)){hideBar();return}
  let a=offAt(r.startContainer,r.startOffset),b=offAt(r.endContainer,r.endOffset);const t=rd._t;
  while(a<b&&/\s/.test(t[a]))a++;while(b>a&&/\s/.test(t[b-1]))b--;if(a<0||b<=a){hideBar();return}
  selR=[a,b];tapM=null;
  bar(`<button data-zm="u"><i class="ru"></i>خط أحمر</button><button data-zm="h">تظليل</button><button data-zm="s">★</button><button data-zm="n">✎ ملاحظة</button>`,r.getBoundingClientRect())},200)}
function onBar(e){const b=e.target.closest("button");if(!b)return;
  if(b.dataset.zm){const ty=b.dataset.zm,[a,c]=selR||[];if(a==null)return;getSelection().removeAllRanges();hideBar();
    if(ty==="n"){noteSheet({type:"n",start:a,end:c,note:""},true);return}
    rd._m.push({type:ty,start:a,end:c});buzz(10);saveMarks();return}
  if(b.dataset.zrm!=null){const k=+b.dataset.zrm;rd._m.splice(k,1);tapM=null;hideBar();buzz(8);saveMarks();api.toast("انشالت");return}
  if(b.dataset.zed!=null){const m=rd._m[+b.dataset.zed];tapM=null;hideBar();noteSheet(m,false)}}
function noteSheet(m,isNew){const q=rd._t.slice(m.start,m.end);
  api.show(`<h3>ملاحظة</h3><q class="zd-q">${esc(q.length>220?q.slice(0,220)+"…":q)}</q><textarea class="zd-ta" id="zdNt" maxlength="2000" placeholder="اكتب ملاحظتك…">${esc(m.note||"")}</textarea>
  <button class="zd-sv" id="zdNs">احفظ</button>${isNew?"":`<button class="zd-del" id="zdNd">شيل العلامة</button>`}`);
  const sh=$("#sheet");setTimeout(()=>{try{$("#zdNt",sh).focus()}catch(e){}},300);
  $("#zdNs",sh).onclick=()=>{m.note=$("#zdNt",sh).value.trim();if(isNew)rd._m.push(m);api.hide();buzz(10);saveMarks()};
  if(!isNew)$("#zdNd",sh).onclick=()=>{const k=rd._m.indexOf(m);if(k>=0)rd._m.splice(k,1);api.hide();saveMarks();api.toast("انشالت")}}
// دوسة على كلام معلّم: «شيل العلامة» أو الملاحظة تنفتح
function onTxtTap(e){const s=getSelection();if(s&&!s.isCollapsed)return;const z=e.target.closest(".zs");if(!z||!/\b(u|h|s|n)\b/.test(z.className)){tapM=null;hideBar();return}
  let o=+z.dataset.o;try{const c=document.caretRangeFromPoint(e.clientX,e.clientY);if(c){const x=offAt(c.startContainer,c.startOffset);if(x>=0)o=x}}catch(x){}
  const idx=[];rd._m.forEach((m,k)=>{if(m.start<=o&&m.end>=o)idx.push(k)});if(!idx.length)return;const k=idx[idx.length-1],m=rd._m[k];
  if(m.type==="n"){noteSheet(m,false);return}
  tapM=k;bar(`<button data-zrm="${k}">شيل العلامة</button>`,z.getBoundingClientRect())}

/* ---------- «علاماتي»: من كل المحاضرات ---------- */
let mkF="";
function mkOpen(){if(!mk){mk=document.createElement("section");mk.id="zdMk";mk.hidden=true;document.body.appendChild(mk)}mk.hidden=false;mkF="";mkJump=null;try{history.pushState({zd:"mk"},"")}catch(e){}mkDraw()}
let mkJump=null;
function mkClose(){if(!mk||mk.hidden)return;mk.hidden=true;const j=mkJump;mkJump=null;if(!j||!rd||rd.hidden)return;
  if(rd.dataset.id!==j.id){saveRead();rdOpen(j.id,j.a,j.l,true);return}
  rd._q=[j.a,j.a+j.l];render();const q=$(".q",rd),page=$("#zdPage",rd);if(q)page.scrollTop+=q.getBoundingClientRect().top-page.getBoundingClientRect().top-page.clientHeight/3;
  setTimeout(()=>$$(".q",rd).forEach(x=>x.classList.add("off")),900)}
const MKN={u:"خط أحمر",h:"تظليل",s:"★ نجمة",n:"✎ ملاحظة"};
function mkDraw(){const A=(J("allMarks")||[]).filter(m=>!mkF||m.type===mkF);
  mk.innerHTML=`<div class="zd-top"><h2 class="s">علاماتي</h2><button class="zd-back" data-zmx style="margin:0">سد</button></div>
  <div class="zd-fl">${[["","الكل"],["u","خطوط"],["s","نجوم"],["n","ملاحظات"]].map(([k,l])=>`<button data-zmf="${k}" aria-pressed="${mkF===k}">${l}</button>`).join("")}</div>
  ${A.length?A.map(m=>`<button class="zd-mi" data-zmi="${esc(m.id)}" data-at="${m.start}" data-len="${m.end-m.start}"><small><span class="k">${m.type==="u"?"<i></i>":""}${MKN[m.type]||""}</span><span>${esc(m.t)}</span></small><p>${esc(m.x)}</p>${m.note?`<p class="nt">✎ ${esc(m.note)}</p>`:""}</button>`).join(""):`<p class="zd-empty">${mkF?"ماكو بهالنوع":"بعد ما علّمت على شي. بصفحة القراءة، ظلّل أي كلام ويطلعلك الشريط."}</p>`}
  <p class="zd-note">كل المحاضرات، مو بس هاي. تدوس وحدة تروح لمكانها.</p>`}

/* ---------- PDF: كل المحاضرات بالترتيب، ويا الخطوط والتظليل والنجوم، والملاحظات بآخر كل وحدة ---------- */
function pdf(){const L=items("b");if(!L.length)return;api.toast("دا أسوّي الـPDF…");
  setTimeout(()=>{let body="";L.forEach(i=>{let t="";try{t=i.hasText?Z().text(i.id)||"":""}catch(e){}const M=(J("marks",i.id)||[]).filter(m=>m.end>m.start);
    const cuts=new Set([0,t.length]);M.forEach(m=>{cuts.add(m.start);cuts.add(m.end)});const C=[...cuts].filter(x=>x>=0&&x<=t.length).sort((a,b)=>a-b);let h="";
    for(let k=0;k<C.length-1;k++){const a=C[k],b=C[k+1];const cls=new Set();M.forEach(m=>{if(m.start<b&&m.end>a){cls.add(m.type);if(m.type==="s"&&m.start===a)cls.add("sb")}});
      h+=cls.size?`<span class="${[...cls].join(" ")}">${esc(t.slice(a,b))}</span>`:esc(t.slice(a,b))}
    const notes=M.filter(m=>m.type==="n"&&m.note);
    body+=`<section><p class="no">${i.n}</p><h1>${esc(i.t)}</h1><div class="t">${h||"<i>ناقصها الكتابة</i>"}</div>${notes.length?`<div class="nts"><b>الملاحظات</b>${notes.map(m=>`<p><q>${esc(t.slice(m.start,m.end).slice(0,160))}</q> ${esc(m.note)}</p>`).join("")}</div>`:""}</section>`});
    const html=`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>@font-face{font-family:Nk;src:url(fonts/Naskh-400.ttf)}@font-face{font-family:Nk;font-weight:600;src:url(fonts/Naskh-600.ttf)}
@page{margin:16mm 15mm}body{font:14px/2.05 Nk,serif;color:#111;margin:0}section{page-break-before:always}section:first-child{page-break-before:auto}
.no{text-align:center;font:200 26px/1 sans-serif;color:#888;margin:0}h1{text-align:center;font-size:20px;font-weight:600;margin:4px 0 16px}
.t{white-space:pre-line;text-align:justify}.u{text-decoration:underline;text-decoration-color:#e5484d;text-decoration-thickness:2px;text-underline-offset:5px}
.h{background:#e8e8e8}.s{border-bottom:1.5px solid #111}.sb::before{content:"★";font-size:9px;vertical-align:super}.n{border-bottom:1.5px dashed #111}
.nts{margin-top:18px;border-top:1px solid #ccc;padding-top:8px;font-size:12.5px}.nts p{margin:6px 0}.nts q{color:#666}</style></head><body>${body}</body></html>`;
    try{Z().print(html,N().b)}catch(e){api.toast("ما گدرت أسوّي الـPDF")}},60)}

/* ---------- الدوسات ---------- */
document.addEventListener("click",e=>{const at=s=>e.target.closest(s);let b;
  if(rd&&!rd.hidden&&e.target.closest("#zdRd")){
    if(at("[data-zed-t]")){buzz(6);edOpen();return}
    if(at("[data-zed-s]")){edSave();return}
    if(at("[data-zed-c]")){edCancel();return}
    if(rd._ed)return;
    if(at("[data-zrb]")){history.back();return}
    if(b=at("#zdRd [data-zf]")){setFz(+b.dataset.zf);$("#zdPage",rd).style.setProperty("--zfz",fz()+"px");return}
    if(at("[data-zmk]")){mkOpen();return}
    if(at("#zdTxt"))onTxtTap(e);else{tapM=null;hideBar()}
    return}
  if(mk&&!mk.hidden&&e.target.closest("#zdMk")){
    if(at("[data-zmx]")){history.back();return}
    if(b=at("[data-zmf]")){mkF=b.dataset.zmf;buzz(6);mkDraw();return}
    // «علاماتي» تنسد (رجوع) وتروح للمكان بالقراءة
    if(b=at("[data-zmi]")){mkJump={id:b.dataset.zmi,a:+b.dataset.at,l:+b.dataset.len};buzz(6);history.back();return}
    return}
  if(!isOpen()||!e.target.closest("#zdPg"))return;
  if(Date.now()-lpFired<600||dragging)return;
  if(at("[data-zb]")){history.back();return}
  if(b=at("[data-zx]")){e.stopPropagation();try{Z().hideLast()}catch(x){}if(st&&st.last)st.last.hid=1;buzz(8);draw();api.toast("انشال · يرجع لما تسمع شي جديد");return}
  if(b=at("[data-zc]")){buzz(8);playKey(b.dataset.zc,true);return}
  if(b=at("[data-zs]")){buzz(6);go({v:"sec",s:b.dataset.zs});return}
  if(at("[data-zq]")){buzz(6);YQ.open();return}
  if(b=at("[data-zqc]")){buzz(8);YQ.open(+b.dataset.zqc);return}
  if(at("[data-zadd]")){addSheet(cur().s);return}
  if(at("[data-zpdf]")){pdf();return}
  if(b=at("[data-zh]")){rdOpen(b.dataset.zh,+b.dataset.at,+b.dataset.len);return}
  if(b=at("[data-zi]")){buzz(6);playKey(b.dataset.zi,false);return}
  const c=cur();if(c.v!=="listen")return;const id=c.id;
  if(at("[data-zp]")){buzz(8);const p=now();if(p&&p.k===id)Z().toggle();else Z().play(id,-1,true);setTimeout(tick,80);return}
  if(b=at("[data-zk]")){const p=now();if(p&&p.k===id){Z().skip(+b.dataset.zk);setTimeout(tick,60)}else{const i=item(id);ensurePlay(id,Math.max(0,Math.min(i.dur||0,(i.pos||0)+ +b.dataset.zk)),false)}buzz(6);return}
  if(at("[data-zr]")){const i=item(id),r=RATES[(RATES.indexOf(+(i.rate||1))+1)%RATES.length];Z().speed(id,r);i.rate=r;$("[data-zr]",pg).textContent=r+"×";buzz(6);return}
  if(at("[data-zs2]")){const p=now();if(!p||p.k!==id){api.toast("شغّل الصوت أول");return}const r=J("addStop",id);if(r){buzz([15,30,15]);load();const i=item(id);$("#zdBm",pg).innerHTML=stopsHtml(i);
      $$("[data-zst]",pg).forEach(b=>longPress(b,()=>stopSheet(id,+b.dataset.zst)));const sc=$("#zdSc",pg);sc.insertAdjacentHTML("afterbegin",`<i class="bm" style="left:${pct(p.pos,p.dur)}%"></i>`);api.toast("★ انحفظت الوقفة · "+fmt(p.pos))}return}
  if(b=at("[data-zst]")){const i=item(id),s=i.stops[+b.dataset.zst];if(s){ensurePlay(id,s.t,false);buzz(6)}return}
  if(at("[data-zt]")){titleSheet(id);return}
  if(at("[data-zread]")){const i=item(id);if(i&&i.hasText)rdOpen(id);else api.toast("ناقصها الكتابة");return}
  if(b=at("#zdPg [data-zf]")){setFz(+b.dataset.zf);const d=$("#zdDu",pg);if(d)d.style.setProperty("--zfz",fz()+"px");return}
  if(b=at("[data-zdel]")){if(b.dataset.arm){try{Z().remove(id)}catch(x){}load();history.back();api.toast("انحذفت");return}
    b.dataset.arm=1;b.textContent="متأكد؟ دوس مرة ثانية";buzz(15);setTimeout(()=>{if(b.isConnected){delete b.dataset.arm;b.textContent="احذف"}},3000);return}
});
function setFz(d){const v=Math.max(15,Math.min(23,fz()+d));api.cfg().zfs=v;api.save();buzz(6)}
// سطر بالقائمة / كارت «كمّل»: الزيارات الأصلية تنفتح بصفحتها، والباقي بصفحة السماع
function playKey(k,play){const i=item(k);
  if(/^z\d$/.test(k)&&(!i||i.builtin)){const idx=k.slice(1),pos=i?i.pos||0:0;
    try{if(has()&&Z().openZyara)return Z().openZyara(theme(),+idx,play?pos:-1,!!play);const A=AN();if(A&&A.openZyaraAt)return A.openZyaraAt(theme(),idx,!!play);if(A&&A.openZyara)return A.openZyara(theme())}catch(e){}
    api.toast(AN()?"حدّث التطبيق":"الزيارات تشتغل بتطبيق الموبايل، وبدون نت");return}
  if(!i)return;if(play){try{Z().play(k,-1,true)}catch(e){}}
  go({v:"listen",id:k})}

// رجوع الأندرويد: علاماتي، بعدين القراءة، بعدين خطوة خطوة لحد ما تنسد «زاد»
let ownPop=0; // «زاد» وانت داخله = ترجع لأوله: هالرجوع احنا سويناه، مو زر الرجوع (تصليح ٢٢)
addEventListener("popstate",e=>{if(ownPop){ownPop=0;return}if(e.state&&e.state.yc)return; // خطوة «بطايقي» مو إلنا (تصليح ٢٢)
  if(window.YQ&&YQ.back())return; // v1.26 المصحف وفهرسه أول
  if(mk&&!mk.hidden){mkClose();return}
  if(rd&&!rd.hidden&&rd._ed){try{history.pushState({zd:"rd"},"")}catch(x){}edCancel();return} // يعدّل: الرجوع مثل «إلغاء»
  if(rd&&!rd.hidden){rdClose();return}
  if(!isOpen())return;if(stk.length>1){stk.pop();load();draw()}else close()});
document.addEventListener("visibilitychange",()=>{if(document.hidden){if(rd&&!rd.hidden)saveRead()}else if(isOpen()&&!(rd&&!rd.hidden)){load();const c=cur();if(c.v!=="listen")draw();else tick()}});

/* ---------- الإعدادات: «أسماء الأقسام» (زر صغير بآخرها) ---------- */
function namesHtml(){const n=N();return `<div class="zd-nmw"><button class="zd-nmb" id="zdNb">أسماء الأقسام ⌄</button><div class="zd-nm" id="zdNm" hidden>
  <label class="sp"><span class="h">اسم القسم</span><input class="inp" id="zdN0" maxlength="20" value="${esc(n.z)}"></label>
  <label class="sp"><span class="h">القرآن</span><input class="inp" id="zdN3" maxlength="30" value="${esc(n.q)}"></label>
  <label class="sp"><span class="h">القسم الأول</span><input class="inp" id="zdN1" maxlength="30" value="${esc(n.a)}"></label>
  <label class="sp"><span class="h">القسم الثاني</span><input class="inp" id="zdN2" maxlength="30" value="${esc(n.b)}"></label>
  <p>تكتب ويتغيّر مباشرة. «رجّع الأصلي» يرجّعها زاد · القرآن الكريم · زيارات وأدعية · مجالس.</p><button class="zd-nmb" id="zdNr">رجّع الأصلي</button></div>
  ${hiddenN()?`<button class="zd-nmb zd-unh" id="zdUnh">رجّع الزيارات المحذوفة</button>`:""}${prevT()?`<button class="zd-nmb zd-unh" id="zdPrv">رجّع النسخة السابقة من «${esc(prevT())}»</button>`:""}</div>`}
// تعديل القرآن ٢: آخر مجلس انعدلت كتابته (عنوانه)، وترجع كتابته وعلاماته مثل ما چانت قبل آخر تعديل
function prevT(){const p=has()&&Z().prevInfo?J("prevInfo"):null;return p&&p.id&&item(p.id)?item(p.id).t:""}
// v1.26 كم وحدة من الأصلية انحذفت (بالتلفون Zad.java، بلا التلفون cfg.zadHide)
function hiddenN(){if(has()&&Z().hiddenCount){try{return Z().hiddenCount()}catch(e){}}return hid().length}
function wireNames(root){const b=$("#zdNb",root),box=$("#zdNm",root);if(!b)return;
  b.onclick=()=>{box.hidden=!box.hidden;if(!box.hidden)setTimeout(()=>box.scrollIntoView({block:"end",behavior:calm()?"auto":"smooth"}),50)};
  const put=()=>{const v=k=>$("#zdN"+k,root).value.trim(),z={};if(v(0)&&v(0)!==NM0.z)z.z=v(0);if(v(3)&&v(3)!==NM0.q)z.q=v(3);if(v(1)&&v(1)!==NM0.a)z.a=v(1);if(v(2)&&v(2)!==NM0.b)z.b=v(2);
    const c=api.cfg();if(Object.keys(z).length)c.zadN=z;else delete c.zadN;api.save();names()};
  [0,1,2,3].forEach(k=>$("#zdN"+k,root).oninput=put);
  $("#zdNr",root).onclick=()=>{$("#zdN0",root).value=NM0.z;$("#zdN3",root).value=NM0.q;$("#zdN1",root).value=NM0.a;$("#zdN2",root).value=NM0.b;put();buzz(8);api.toast("رجعت الأسماء ✓")};
  const pv=$("#zdPrv",root);if(pv)pv.onclick=()=>{const t=prevT();api.show(`<h3>ترجع النسخة السابقة؟</h3><p class="zd-dmsg">كتابة «${esc(t)}» وعلاماتها ترجع مثل ما چانت قبل آخر تعديل.</p><button class="zd-sv" id="zdPrvY">رجّعها</button><button class="close" data-x>لا</button>`);
    $("#zdPrvY",$("#sheet")).onclick=()=>{let ok=false;try{ok=Z().restorePrev()}catch(e){}api.hide();if(ok){pv.hidden=true;load();buzz(8);api.toast("رجعت ✓")}else api.toast("ما گدرت")}};
  const u=$("#zdUnh",root);if(u)u.onclick=()=>{if(has()&&Z().unhide){try{Z().unhide()}catch(e){}}else{delete api.cfg().zadHide;api.save()}
    load();u.hidden=true;buzz(8);api.toast("رجعت الزيارات ✓");if(isOpen())draw()}}
// الأسماء بكل مكان: زر الشريط، الصفحة، والإشعار (بالتلفون)
function names(){const n=N(),b=$("#mZyara");if(b){const l=b.lastChild;if(l&&l.nodeType===3)l.textContent=n.z}
  if(pg)pg.setAttribute("aria-label",n.z);try{if(has()&&Z().names)Z().names(JSON.stringify(n))}catch(e){}if(isOpen()&&!(rd&&!rd.hidden))draw()}

function init(o){api=o;if(window.YQ)YQ.init(o);const z=document.getElementById("mZyara")||document.getElementById("mTom");if(!z)return;
  z.id="mZyara";z.innerHTML=`<span class="k">${IC.dock}</span>${esc(N().z)}`;
  z.onclick=()=>{if(isOpen()){if(stk.length>1){const n=stk.length-1;stk=[stk[0]];draw();ownPop=1;try{history.go(-n)}catch(e){ownPop=0}}else pg.scrollTo({top:0,behavior:"smooth"});return}open()};
  try{if(has()&&Z().names)Z().names(JSON.stringify(N()))}catch(e){}
  const P=new URLSearchParams(location.search);
  if(P.get("zad")&&!P.has("widgetsync")){const D=new URLSearchParams(P);["zad","at","len"].forEach(x=>P.delete(x));history.replaceState(null,"",location.pathname+(P.toString()?"?"+P:""));
    setTimeout(()=>deep(D),0)}}
// فتح مباشر: ?zad=1 زاد، ?zad=a زيارات، ?zad=b مجالس (ودجت زاد)، ?zad=<id>[&at&len] مادة. بأول تحميل ومن YS.open (shell.js)
function deep(P){const k=P.get("zad"),r=P.get("at"),l=+(P.get("len")||1);if(!k)return false;if(!isOpen())open();load();
  if(k==="a"||k==="b"){const t=stk[stk.length-1];if(!(t&&t.v==="sec"&&t.s===k))go({v:"sec",s:k})}
  else if(k!=="1"&&item(k))go({v:"listen",id:k});if(k!=="1"&&r!=null&&item(k))rdOpen(k,+r,l);if(window.YS)YS.shown();return true}
window.YZ={init,deep,open,close,isOpen,depth,show,hist,leave,names,namesHtml,wireNames,refresh:()=>{if(isOpen()){load();draw()}}};
})();
