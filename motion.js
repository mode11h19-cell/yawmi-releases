/* «يومي»: الحركات (6-motion) وزر المايك (8 §3–4). CSS بـ motion.css، وهنا بس اللي يحتاج JavaScript.
   app.js يناديها من مكانها (window.YM). ماكو مكتبات. إذا «تقليل الحركة» مفعّل، الحركات تنطفي والخطوات تبقى. */
(function(){
const $=s=>document.querySelector(s);
const calm=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const A=()=>window.YawmiAndroid;
// الهزّة: من الجسر إذا موجود (APK 1.18)، وإلا navigator.vibrate
function haptic(p){try{const a=A();if(a&&typeof a.haptic==="function")return a.haptic(JSON.stringify(p));if(navigator.vibrate)navigator.vibrate(p)}catch(e){}}
const CK=`<svg class="y-ck" viewBox="0 0 22 22"><path d="M5 11.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const later=(f,ms)=>calm()?f():setTimeout(f,ms);

/* 14 · ضغطة تحسها: هزّة خفيفة لكل زر */
document.addEventListener("pointerdown",e=>{const b=e.target.closest("button,[role=button]");if(b&&!b.disabled&&!b.closest(".y-micb"))haptic(8)},{passive:true});

/* 1 · صح يترسم، وبعدها يكمل الشغل */
function check(btn,go){if(btn.dataset.animating)return;btn.dataset.animating=1;haptic(15);const row=btn.closest(".it"),card=btn.closest(".hone");
  if(row){const o=row.querySelector(".o");if(o&&!o.querySelector(".y-ck"))o.insertAdjacentHTML("beforeend",CK);row.classList.add("y-chk");return later(go,320)}
  if(card){card.classList.add("y-chk");return later(go,420)}
  go()}

/* 26 + 2 · إشعارات مكدّسة تحت، وبيها «تراجع» */
let son=null;const items=[];let open=false;
function lay(){const L=items.slice().reverse();L.forEach((e,i)=>{e.style.transform=open?`translateY(${-i*58}px)`:`translateY(${-i*10}px) scale(${1-i*.06})`;e.style.opacity=i>2?0:1-(open?0:i*.15);e.style.zIndex=10-i;e.style.pointerEvents=i>2?"none":""})}
function dockH(){const d=$(".dock");document.documentElement.style.setProperty("--y-dock",(d?d.offsetHeight+16:96)+"px")}
function toast(msg,o={}){if(!son){son=document.createElement("div");son.className="y-son";son.setAttribute("role","status");son.setAttribute("aria-live","polite");document.body.appendChild(son);
    son.onclick=e=>{if(e.target.closest("button"))return;open=!open;lay()}}
  dockH();const e=document.createElement("div");e.className="y-ti";e.innerHTML=`<span></span>`;e.firstChild.textContent=msg;
  if(o.undo){const b=document.createElement("button");b.textContent="تراجع";b.onclick=ev=>{ev.stopPropagation();haptic(10);drop(e);o.undo()};e.appendChild(b);e.insertAdjacentHTML("beforeend","<i></i>")}
  e.style.transform="translateY(80px)";e.style.opacity=0;son.appendChild(e);items.push(e);while(items.length>4)drop(items[0],true);
  haptic(8);requestAnimationFrame(()=>requestAnimationFrame(lay));
  e._t=setTimeout(()=>drop(e),o.ms||4000);return e}
function drop(e,now){const i=items.indexOf(e);if(i<0)return;items.splice(i,1);clearTimeout(e._t);
  if(now||calm()){e.remove()}else{e.style.opacity=0;e.style.transform+=" translateY(20px)";setTimeout(()=>e.remove(),300)}
  if(!items.length)open=false;lay()}

/* 3 · زر الحفظ يصغر لدائرة، تدور، وبعدها صح */
function morph(btn,go){if(!btn||calm())return go();haptic(8);btn.style.width=btn.offsetWidth+"px";btn.classList.add("y-mb");
  if(!btn.querySelector(".y-spn"))btn.insertAdjacentHTML("beforeend",`<span class="y-spn"></span>${CK}`);
  requestAnimationFrame(()=>btn.classList.add("ld"));
  setTimeout(()=>{btn.classList.remove("ld");btn.classList.add("ok");haptic([20,30,40]);setTimeout(go,420)},400)}

/* 4 + 5 · الخانة تنفتح، والمهام تدخل وحدة ورا الثانية (أول 8 بس) */
function unfold(list){if(!list||calm())return;haptic(10);
  const w=document.createElement("div");w.className="y-acc";list.before(w);w.appendChild(list);
  [...list.children].slice(0,8).forEach((r,i)=>{r.style.animation=`y-up 450ms var(--ease) both`;r.style.animationDelay=i*70+"ms"});
  requestAnimationFrame(()=>requestAnimationFrame(()=>w.classList.add("open")));
  setTimeout(()=>{if(w.parentNode){w.before(list);w.remove()}[...list.children].forEach(r=>{r.style.animation="";r.style.animationDelay=""})},900)}

/* 9 · مؤشر يتزحلق بالقطع (براسي / ثابت / موعد، والاختيارات بالإعدادات) */
let segPrev=[];
// same=true: نفس الصفحة انرسمت من جديد، فالمؤشر يتزحلق من مكانه القديم للجديد
function segs(root,same){const now=[];(root||document).querySelectorAll(".seg").forEach((sg,n)=>{const on=sg.querySelector(".pill[aria-pressed=true]");if(!on){now.push(null);return}
  const k=document.createElement("i");k.className="y-ind";sg.prepend(k);
  // offset* ما تتأثر بالـtransform، فتنقاس صح حتى والورقة بعدها تكبر
  const x=on.offsetLeft;now.push(x);
  k.style.width=on.offsetWidth+"px";k.style.top=on.offsetTop+"px";k.style.bottom=(sg.clientHeight-on.offsetTop-on.offsetHeight)+"px";k.style.borderRadius=getComputedStyle(on).borderRadius;
  const prev=same?segPrev[n]:null;
  if(prev!=null&&prev!==x&&!calm()){k.style.transition="none";k.style.transform=`translateX(${prev}px)`;void k.offsetWidth;k.style.transition="";haptic(8)}
  k.style.transform=`translateX(${x}px)`;sg.classList.add("y-on")});segPrev=now}

/* 10 · زجاج سائل بالشريط السفلي: الفقاعة على الزر اللي انت بصفحته */
let blob=null,cur=null;
function dock(id){const d=$(".dock");if(!d)return;if(!blob){blob=document.createElement("span");blob.className="y-blob";d.prepend(blob)}
  const b=document.getElementById(id)||d.querySelector("button:not([hidden])");if(!b||getComputedStyle(b).display==="none")return;
  const r=d.getBoundingClientRect(),q=b.getBoundingClientRect(),x=q.left-r.left;
  if(cur!==null&&cur!==id&&!calm()){blob.style.width=(q.width+30)+"px";setTimeout(()=>blob.style.width=q.width+"px",220);haptic(10)}else blob.style.width=q.width+"px";
  blob.style.transform=`translateX(${x}px)`;cur=id}

/* 8 + 13 · الشيت يطلع من الزر أو الكارت اللي دسته، 11 · صفحة جديدة من الجنب، 12 · رجوع بسحب من الحافة */
let from=null,goingBack=false,lastTitle="";
const origin=el=>{from=el?el.getBoundingClientRect():null};
document.addEventListener("click",e=>{if(e.target.closest("#sheet .back"))goingBack=true},true);
function sheetOpened(sheet,was){const h=sheet.querySelector("h3"),title=h?h.textContent:"",same=was&&title===lastTitle;lastTitle=title;
  sheet.classList.remove("y-from","y-pin","y-pback","y-shut");sheet.style.transform="";
  if(!calm()){
    if(was&&!same){void sheet.offsetWidth;sheet.classList.add(goingBack?"y-pback":"y-pin")}
    else if(from){const s=sheet.getBoundingClientRect();if(s.width&&s.height){
      sheet.style.setProperty("--y-dx",(from.left+from.width/2-(s.left+s.width/2))+"px");sheet.style.setProperty("--y-dy",(from.top+from.height/2-(s.top+s.height/2))+"px");
      sheet.style.setProperty("--y-sx",Math.max(.05,from.width/s.width));sheet.style.setProperty("--y-sy",Math.max(.05,from.height/s.height));void sheet.offsetWidth;sheet.classList.add("y-from")}}}
  if(!was)sheet._from=from;
  if(was&&same&&sheet._from===undefined)sheet._from=null;
  from=null;goingBack=false;segs(sheet,same);fields(sheet)}
// يرجع زر لما ينسد (بس إذا طلع من زر)
function sheetClosing(sheet,done){const f=sheet._from;sheet._from=null;if(!f||calm())return done();
  const s=sheet.getBoundingClientRect();sheet.style.setProperty("--y-dx",(f.left+f.width/2-(s.left+s.width/2))+"px");sheet.style.setProperty("--y-dy",(f.top+f.height/2-(s.top+s.height/2))+"px");
  sheet.style.setProperty("--y-sx",Math.max(.05,f.width/s.width));sheet.style.setProperty("--y-sy",Math.max(.05,f.height/s.height));sheet.classList.remove("y-from","y-pin","y-pback");sheet.classList.add("y-shut");
  setTimeout(()=>{sheet.classList.remove("y-shut");done()},280)}
// يبدي بس إذا اللمسة بأول 20px من الحافة، وبعد ما تتحرك 10px للجنب (غير هيچ الدوسة على زر تنمسك كأنها سحب)
{let x0=null,y0=0,dx=0,sh=null,go=false;
  document.addEventListener("touchstart",e=>{sh=$("#sheet");if(!sh||$("#scrim").hidden||!sh.querySelector(".back"))return x0=null;const t=e.touches[0],r=sh.getBoundingClientRect();
    if(t.clientX<r.right-20)return x0=null;x0=t.clientX;y0=t.clientY;dx=0;go=false},{passive:true});
  document.addEventListener("touchmove",e=>{if(x0==null)return;const t=e.touches[0];dx=Math.max(0,x0-t.clientX);
    if(!go){if(Math.abs(t.clientY-y0)>dx&&Math.abs(t.clientY-y0)>10)return x0=null;if(dx<10)return;go=true}
    sh.classList.add("y-drag");sh.style.transform=`translateX(${-dx}px)`},{passive:true});
  document.addEventListener("touchend",()=>{if(x0==null)return;x0=null;if(!go)return;sh.classList.remove("y-drag");
    if(dx>90){haptic(10);sh.style.transform="";const b=sh.querySelector(".back");if(b)b.click()}
    else{sh.classList.add("y-ret");sh.style.transform="";setTimeout(()=>sh.classList.remove("y-ret"),360)}dx=0})}

/* 15 · تشغيل ↔ إيقاف يتحوّل */
function pp(el,on){let p=el.querySelector(".y-pp");if(!p){el.innerHTML=`<span class="y-pp"><i></i><i></i></span>`;p=el.firstChild}p.classList.toggle("on",!!on)}

/* 16 · سحب للتحديث بالرئيسية (خطوط اللوگو تتموّج)، 6 · سحب لتحت فوق خانة مفتوحة يطلّع خانة مهمة جديدة */
function pulls(o){const pi=document.createElement("div");pi.className="y-pull";pi.innerHTML=`<span class="y-bars"><i></i><i></i><i></i><i></i><i></i></span><span></span>`;document.body.appendChild(pi);
  let y0=null,dy=0,mode="",st=null,on=false;
  addEventListener("touchstart",e=>{if(scrollY>0||!document.body.classList.contains("hassa")||!$("#scrim").hidden||document.body.classList.contains("y-mic-on"))return y0=null;
    const t=e.target;if(t.closest("input,textarea,.dock,.y-micb"))return y0=null;
    st=t.closest(".hfolds");mode=st&&st.querySelector(".hlist")?"add":"ref";y0=e.touches[0].clientY;dy=0;on=false},{passive:true});
  addEventListener("touchmove",e=>{if(y0==null)return;dy=Math.max(0,e.touches[0].clientY-y0);if(!on&&dy<10)return;on=true;const k=Math.min(1,dy/(mode==="add"?45:90));
    pi.classList.remove("back");pi.style.transform=`translate(-50%,${-70+Math.min(dy,110)*.8}px)`;pi.lastChild.textContent=mode==="add"?(k>=1?"شيل إصبعك وضيف":"اسحب حتى تضيف"):(k>=1?"شيل إصبعك وحدّث":"اسحب حتى تحدّث");
    pi.querySelectorAll("i").forEach((b,i)=>b.style.transform=`scaleY(${.35+.65*Math.min(1,k*1.4-i*.08)})`)},{passive:true});
  addEventListener("touchend",()=>{if(y0==null)return;y0=null;if(!on)return;const ok=dy>=(mode==="add"?45:90);pi.querySelectorAll("i").forEach(b=>b.style.transform="");
    if(ok&&mode==="ref"){haptic(10);pi.classList.add("spin");pi.lastChild.textContent="يحدّث…";const end=()=>{pi.classList.remove("spin");pi.classList.add("back");pi.style.transform=""};
      Promise.resolve(o.refresh&&o.refresh()).finally(()=>setTimeout(end,calm()?0:1900))}
    else{pi.classList.add("back");pi.style.transform="";if(ok&&mode==="add"){haptic(15);o.add&&o.add(st)}}dy=0})}
// خانة مهمة جديدة تنطوي من فوق القائمة المفتوحة
function quickAdd(list,save){if(!list)return;let w=list.querySelector(".y-padd");if(w){w.querySelector("input").focus();return}
  w=document.createElement("div");w.className="y-padd";w.innerHTML=`<div><div class="row"><input maxlength="80" placeholder="شغلة جديدة" aria-label="شغلة جديدة"><button class="hp w sm">ضيف</button></div></div>`;list.prepend(w);
  const i=w.querySelector("input"),go=()=>{const v=i.value.trim();if(!v){shake(i);return}save(v)};
  w.querySelector("button").onclick=go;i.onkeydown=e=>{if(e.key==="Enter")go()};
  requestAnimationFrame(()=>requestAnimationFrame(()=>{w.classList.add("open");i.focus()}))}

/* 17 · هيكل التحميل */
const skel=()=>`<div class="y-skel y-skc"></div><div class="y-skel y-skc s"></div><div class="y-skel y-skc"></div>`;

/* 18 · خلصت كلشي اليوم */
const allDone=(t,still)=>`<div class="y-alldone${still?" y-still":""}" style="display:flex;flex-direction:column;align-items:center;gap:10px"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="27"/><path d="M20 33l8 8 16-17"/></svg><b class="big">${t}</b></div>`;

/* 19 · كلام يطلع من الضباب، كلمة كلمة */
function blurText(el,text){if(!el)return;if(calm()){el.textContent=text;return}
  el.classList.add("y-blurtext");el.textContent="";text.split(" ").forEach((w,i)=>{const s=document.createElement("span");s.textContent=w+" ";s.style.setProperty("--i",i);el.appendChild(s)})}
const blurTime=t=>calm()?0:600+(t.split(" ").length-1)*90;

/* 20 · حافة تتوهّج والمزامنة شغّالة (تطلع بس إذا طوّلت) */
let gl=null,gT=null,gN=0;
function glow(on){if(!gl){gl=document.createElement("div");gl.innerHTML=`<div class="y-glow b"></div><div class="y-glow"></div>`;document.body.appendChild(gl)}
  gN=Math.max(0,gN+(on?1:-1));clearTimeout(gT);
  if(gN)gT=setTimeout(()=>{if(gN&&document.visibilityState==="visible")gl.querySelectorAll(".y-glow").forEach(g=>g.classList.add("on"))},600);
  else gl.querySelectorAll(".y-glow").forEach(g=>g.classList.remove("on"))}
document.addEventListener("visibilitychange",()=>document.documentElement.classList.toggle("y-bg",document.visibilityState!=="visible"));
document.addEventListener("visibilitychange",()=>{if(document.visibilityState!=="visible"&&gl)gl.querySelectorAll(".y-glow").forEach(g=>g.classList.remove("on"))});

/* 23 · الأرقام تتبدّل بالضباب: [data-yn="مفتاح"] */
const nums={};
function blurNums(root){(root||document).querySelectorAll("[data-yn]").forEach(e=>{const k=e.dataset.yn,v=e.textContent;const old=nums[k];nums[k]=v;
  if(old==null||old===v||calm())return;e.classList.add("y-bn");e.textContent=old;e.classList.add("out");setTimeout(()=>{e.textContent=v;e.classList.remove("out")},250);haptic(8)})}

/* 25 · الجزيرة: حبة سودة فوق بيها الموعد اللي انت بيه هسه والوقت الباقي */
let isl=null;
function island(it,big){if(!isl){isl=document.createElement("div");isl.className="y-isl";isl.setAttribute("role","status");document.body.appendChild(isl)}
  document.body.classList.toggle("y-isl-on",!!it);
  if(!it){isl._k=null;isl.classList.remove("on","y-big");document.body.classList.remove("y-isl-big");return}
  const key=it.title+"|"+it.left;if(isl._k===key){isl.classList.toggle("y-big",!!big);document.body.classList.toggle("y-isl-big",!!big);return}isl._k=key;
  isl.innerHTML=`<span class="y-sm"><i></i><span class="n"></span></span><span class="y-tx"><small>هسه</small><span class="t"></span></span><b></b>`;
  isl.querySelector(".t").textContent=it.title;isl.querySelector("b").textContent=it.left;isl.querySelector(".y-sm .n").textContent=it.left;
  isl.classList.add("on");isl.classList.toggle("y-big",!!big);document.body.classList.toggle("y-isl-big",!!big)}

/* 28 · هزّة الخطأ */
function shake(el){if(!el)return;haptic([30,40,30]);el.classList.remove("y-shake");void el.offsetWidth;el.classList.add("y-shake");setTimeout(()=>el.classList.remove("y-shake"),420);try{el.focus()}catch(e){}}

/* 29 · عنوان يطير لفوق: كل خانة كتابة بيها placeholder */
function fields(root){(root||document).querySelectorAll("textarea.ta[placeholder],input.inp[placeholder]").forEach(i=>{if(i.parentNode.classList.contains("y-field")||!i.placeholder.trim())return;
  // إذا الخانة بيها عنوان فوقها (الإعدادات)، العنوان نفسه يصير اللي يطير
  const sp=i.closest("label.sp"),h=sp&&sp.querySelector(".h");
  const w=document.createElement("div");w.className="y-field";const l=document.createElement("span");l.className="y-fl";l.setAttribute("aria-hidden","true");l.textContent=h?h.textContent:i.placeholder;if(!i.getAttribute("aria-label"))i.setAttribute("aria-label",l.textContent);
  if(h)h.hidden=true;i.before(w);w.appendChild(i);w.appendChild(l);i.placeholder=" "})}

window.YM={haptic,check,toast,morph,unfold,segs,dock,origin,sheetOpened,sheetClosing,pp,pulls,quickAdd,skel,allDone,blurText,blurTime,glow,blurNums,island,shake,fields,calm,CK};
})();
