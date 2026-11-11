/* ١١-١١ «رسائلي»: رسائل واتساب مجدولة، تبويب «واتساب» بالشريط (مكان «ضيف»). النموذج: docs/today-11-11/2-whatsapp-widgets/wa-schedule.html
   كلشي محفوظ بالتليفون (Wa.java، الجسر window.YawmiWa): الرسائل، الجدولة، والإرسال (WaSend يدوس «إرسال» داخل الواتساب بس).
   هنا بس الشاشة: القائمة (تنتظر · الجاية · ما انرسلت · انرسلت)، رسالة جديدة/تعديل، و«التجهيز» (مرة وحدة).
   الرقم يجي بس من أسماء التليفون (B().pick ← onYawmiWa{ev:"pick"})، ما ينكتب باليد. بلا التطبيق (متصفح أو نسخة قديمة) تطلع ملاحظة بس. */
(function(){
const $=(s,r)=>(r||document).querySelector(s),B=()=>window.YawmiWa,has=()=>!!B();
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const REP=[["once","مرة وحدة"],["day","كل يوم"],["week","كل أسبوع"],["month","كل شهر"],["year","كل سنة"]];
const WHY={lock:"تنتظر تفتح التليفون",net:"تنتظر النت",busy:"تنتظر تخلص اللي بيدك",start:"هسه تنرسل",acc:"إمكانية الوصول مطفية",max:"وصلت ٢٠ رسالة اليوم",nowa:"الواتساب ما انفتح",nochat:"المحادثة ما انفتحت",notext:"الرسالة ما انكتبت بالمحادثة",nobtn:"ما لگيت زر الإرسال","sent?":"ما تأكدت أنها راحت"};
const IC={dock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.3a8.5 8.5 0 1 1 15.5-4.6z"/><path d="M9 9.2c0 3 2.6 5.6 5.6 5.6"/></svg>`,
  back:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>`,
  x:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  gear:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  rep:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12a7 7 0 1 1-2.3-5.2M19 4v4h-4"/></svg>`};
let api,pg,st={msgs:[],recent:[]},view="list",ed=null,delArm=false,poll=null,mine="";

function load(){try{st=has()?JSON.parse(B().state()):{msgs:[],recent:[]}}catch(e){st={msgs:[],recent:[]}}if(!st.msgs)st.msgs=[];if(!st.recent)st.recent=[]}
const p2=n=>String(n).padStart(2,"0");
const dISO=d=>`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`;
function dayTxt(ms){const d=new Date(ms),t=new Date(),k=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(t.getFullYear(),t.getMonth(),t.getDate()))/864e5);
  return k===0?"اليوم":k===1?"باچر":k===-1?"أمس":k>1&&k<7||k<-1&&k>-7?d.toLocaleDateString("ar-IQ",{weekday:"long"}):d.toLocaleDateString("ar-IQ",{day:"numeric",month:"long"})}
function timeTxt(ms){const d=new Date(ms),h=d.getHours();return `${h%12||12}:${p2(d.getMinutes())} ${h<12?"ص":"م"}`}
const repTxt=r=>(REP.find(x=>x[0]===r)||REP[0])[1];

function isOpen(){return !!(pg&&!pg.hidden)}
function depth(){return isOpen()?1+(view!=="list"?1:0):0}
function show(){if(!pg){pg=document.createElement("section");pg.id="ywPg";pg.setAttribute("aria-label","رسائلي");document.body.appendChild(pg)}
  load();view="list";pg.hidden=false;document.body.classList.add("yw-on");draw();mark();
  clearInterval(poll);poll=setInterval(()=>{if(!isOpen()||document.hidden||view==="new")return;const was=JSON.stringify(st);load();if(JSON.stringify(st)!==was)draw()},2000)}
function hist(replace){try{if(replace)history.replaceState({yw:"pg"},"");else history.pushState({yw:"pg"},"")}catch(e){}}
function open(){if(isOpen()){go("list");return}show();hist(false)}
function leave(){const n=depth();if(!n)return 0;view="list";pg.hidden=true;document.body.classList.remove("yw-on");clearInterval(poll);mark();return n}
function close(){leave()}
function mark(){const b=$("#mWa");if(b)b.classList.toggle("on",isOpen());if(api&&api.ui)api.ui()}
function go(v,quiet){const was=view;view=v;delArm=false;if(v!=="list"&&was==="list"&&!quiet)try{history.pushState({yw:"sub"},"")}catch(e){}pg.scrollTop=0;draw()}
const back=()=>history.back();

function row(m){const s=m.st,chip=s==="fail"?`<button class="yw-chip bad" data-ywnow="${m.id}">ما انرسلت · دزها هسه</button>`
    :s==="sent"?`<span class="yw-chip ok">${m.why==="remind"?"ذكّرتك":"✓✓ انرسلت"}</span>`:s==="wait"?`<span class="yw-chip">${WHY[m.why]||"هسه تنرسل"}</span>`:"";
  const sub=s==="fail"&&WHY[m.why]?`<small class="yw-why">${WHY[m.why]}</small>`:"";
  return `<div class="yw-row" data-ywed="${m.id}"><span class="yw-av">${esc((m.name||"؟").trim().charAt(0))}</span>
    <div class="yw-mid"><b>${esc(m.name||m.num)}${m.rep&&m.rep!=="once"?` <i class="yw-rep">${IC.rep}</i>`:""}</b><p>${esc(m.text)}</p>${chip}${sub}</div>
    <div class="yw-when"><span>${m.rep&&m.rep!=="once"&&s==="next"?repTxt(m.rep):dayTxt(s==="sent"||s==="fail"?m.done||m.at:m.at)}</span><span dir="ltr">${timeTxt(s==="sent"||s==="fail"?m.done||m.at:m.at)}</span></div></div>`}
function listHtml(){const M=st.msgs,by=(s,desc)=>M.filter(m=>m.st===s).sort((a,b)=>desc?(b.done||b.at)-(a.done||a.at):a.at-b.at);
  const S=[["تنتظر",by("wait")],["الجاية",by("next")],["ما انرسلت",by("fail",1)],["انرسلت",by("sent",1)]].filter(x=>x[1].length);
  const head=`<div class="yw-top"><button class="yw-ib" data-ywback aria-label="رجوع">${IC.back}</button><h2>رسائلي</h2><button class="yw-ib" data-ywset aria-label="التجهيز">${IC.gear}</button></div>`;
  if(!has())return head+`<div class="yw-empty"><b>رسائل الواتساب المجدولة</b><p>${window.YawmiAndroid?"حدّث «يومي» من الإعدادات حتى تشتغل.":"تشتغل من تطبيق «يومي» بالموبايل."}</p></div>`;
  return head+(st.wa===false?`<p class="yw-note">الواتساب مو منزّل بهذا التليفون.</p>`:"")
    +(S.length?S.map(([t,L])=>`<h4 class="yw-sec">${t}</h4>${L.map(row).join("")}`).join(""):`<div class="yw-empty"><b>ما عندك رسائل مجدولة</b><p>اكتب الرسالة والشخص والوقت، و«يومي» يدزها بوقتها.</p></div>`)
    +`<button class="yw-fab" data-ywnew>＋ رسالة</button>`}

function blank(){const d=new Date(Date.now()+36e5);d.setMinutes(0,0,0);return {id:0,name:"",num:"",text:"",date:dISO(d),time:p2(d.getHours())+":00",rep:"once",mode:"auto"}}
function fromMsg(m){const live=m.st==="next"||m.st==="wait",d=new Date(m.st==="next"?m.at:Math.max(m.at,Date.now()+36e5));return {id:live?m.id:0,from:m.id,st:m.st,name:m.name,num:m.num,text:m.text,date:dISO(d),time:p2(d.getHours())+":"+p2(d.getMinutes()),rep:m.rep||"once",mode:m.mode||"auto"}}
function newHtml(){const e=ed,P=st.recent.filter(r=>r.num!==e.num).slice(0,3);
  return `<div class="yw-top"><button class="yw-ib" data-ywback aria-label="سد">${IC.x}</button><h2>${e.id?"تعديل الرسالة":"رسالة جديدة"}</h2><span class="yw-ib ghost"></span></div>
  <h4 class="yw-lab">لمنو؟</h4><div class="yw-pills">${e.num?`<button class="yw-pill on">${esc(e.name||e.num)}</button>`:""}${P.map(r=>`<button class="yw-pill" data-ywto="${esc(r.num)}" data-n="${esc(r.name)}">${esc(r.name||r.num)}</button>`).join("")}<button class="yw-pill line" data-ywpick>＋ من الأسماء</button></div>
  <div class="yw-box"><small>الرسالة</small><textarea id="ywT" maxlength="2000" placeholder="اكتب رسالتك">${esc(e.text)}</textarea></div>
  <h4 class="yw-lab">متى؟</h4><div class="yw-two"><label class="yw-box"><small>اليوم</small><input type="date" id="ywD" value="${e.date}" min="${dISO(new Date())}"></label><label class="yw-box"><small>الساعة</small><input type="time" id="ywH" value="${e.time}"></label></div>
  <h4 class="yw-lab">تتكرر؟</h4><div class="yw-pills">${REP.map(([k,l])=>`<button class="yw-pill${e.rep===k?" on":""}" data-ywrep="${k}">${l}</button>`).join("")}</div>
  <h4 class="yw-lab">شلون تنرسل؟</h4>
  ${[["auto","يدزها لحاله","بوقتها بالضبط. إذا التليفون مقفول برمز تنتظر، وأول ما تفتحه تنرسل."],["remind","يذكّرني وأنا أدز","يطلعلك تنبيه بوقتها، تدوسه والرسالة جاهزة بالواتساب."]].map(([k,t,s])=>`<button class="yw-mode${e.mode===k?" on":""}" data-ywmode="${k}"><i></i><span><b>${t}</b><small>${s}</small></span></button>`).join("")}
  <button class="yw-save" data-ywsave>${e.id?"حفظ":"جدولها"}</button>
  ${e.from?`<button class="yw-del" data-ywdel>${delArm?"متأكد؟ دوس مرة ثانية":"حذف الرسالة"}</button>`:""}`}

function setHtml(){const ok=`<span class="yw-chip ok">✓ تمام</span>`;
  const step=(n,t,s,act)=>`<div class="yw-step"><span class="n">${n}</span><div><b>${t}</b><p>${s}</p>${act}</div></div>`;
  return `<div class="yw-top"><button class="yw-ib" data-ywback aria-label="رجوع">${IC.back}</button><h2>التجهيز</h2><span class="yw-ib ghost"></span></div>
  <p class="yw-note">مرة وحدة بس. «يومي» يوديك لكل إعداد.</p>
  ${step("١","إمكانية الوصول","حتى «يومي» يفتح الواتساب ويدوس زر الإرسال بدالك. يشتغل داخل الواتساب بس، وما يقرا رسايلك. اختار «يومي: رسائل الواتساب» وشغّلها.",st.acc?ok:`<button class="yw-go" data-ywopen="acc">شغّلها</button>`)}
  ${step("٢","السماح بالإعدادات المقيدة","إذا التليفون ما خلاك تشغّلها بالخطوة ١ (لأن التطبيق مو من المتجر): افتح معلومات التطبيق ← ⋮ فوق ← «السماح بالإعدادات المقيدة»، وارجع للخطوة ١.",`<button class="yw-go" data-ywopen="app">افتح</button>`)}
  ${step("٣","إبقاء الجهاز مفتوحاً","حتى تنرسل بوقتها وانت بالبيت أو بالسيارة. سامسونج: الإعدادات ← شاشة القفل ← «إبقاء الجهاز مفتوحاً»، واختار البيت أو سماعتك أو سيارتك. بلاها الرسالة تنتظر لحد ما تفتح التليفون.",`<button class="yw-go" data-ywopen="lock">افتح</button>`)}
  ${step("٤","تجربة","يدز «تجربة من يومي ✓» لرقمك انت حتى تتأكد.",`<div class="yw-me"><input id="ywMe" inputmode="tel" dir="ltr" placeholder="07XX XXX XXXX" value="${esc(mine||st.me||"")}"><button class="yw-go" data-ywtest>جرّب</button></div>${st.tested?ok:""}`)}`}

function draw(){if(!pg)return;
  pg.innerHTML=`<div class="yw-in">${view==="new"?newHtml():view==="set"?setHtml():listHtml()}</div>`}
function grab(){const t=$("#ywT",pg),d=$("#ywD",pg),h=$("#ywH",pg);if(t)ed.text=t.value;if(d&&d.value)ed.date=d.value;if(h&&h.value)ed.time=h.value}
function save(){grab();const e=ed,at=new Date(e.date+"T"+e.time+":00").getTime();
  if(!e.num)return api.toast("اختار الشخص من الأسماء");if(!e.text.trim())return api.toast("اكتب الرسالة");
  if(!(at>Date.now()-60000))return api.toast("هذا الوقت فات، اختار وقت جاي");
  const id=B().save(JSON.stringify({id:e.id,name:e.name,num:e.num,text:e.text.trim(),at,rep:e.rep,mode:e.mode}));
  if(!id)return api.toast("ما انحفظت، تأكد من الرقم والرسالة");
  load();const first=e.mode==="auto"&&!st.acc;
  if(first){view="set";draw();api.toast("انجدولت ✓ باقي التجهيز مرة وحدة")}else{back();api.toast(`انجدولت ✓ ${dayTxt(at)} ${timeTxt(at)}`)}}

document.addEventListener("click",e=>{if(!isOpen())return;const at=s=>e.target.closest(s);let b;
  if(!at("#ywPg"))return;
  if(at("[data-ywback]")){back();return}
  if(at("[data-ywset]")){if(has())go("set");return}
  if(at("[data-ywnew]")){ed=blank();go("new");return}
  if(b=at("[data-ywnow]")){B().now(+b.dataset.ywnow);load();draw();api.toast("هسه تنرسل");return}
  if(b=at("[data-ywed]")){const m=st.msgs.find(x=>x.id===+b.dataset.ywed);if(m){ed=fromMsg(m);go("new")}return}
  if(at("[data-ywpick]")){grab();B().pick();return}
  if(b=at("[data-ywto]")){grab();ed.num=b.dataset.ywto;ed.name=b.dataset.n;draw();return}
  if(b=at("[data-ywrep]")){grab();ed.rep=b.dataset.ywrep;draw();return}
  if(b=at("[data-ywmode]")){grab();ed.mode=b.dataset.ywmode;draw();return}
  if(at("[data-ywsave]")){save();return}
  if(at("[data-ywdel]")){if(!delArm){delArm=true;draw();return}B().del(ed.from);load();back();api.toast("انحذفت");return}
  if(b=at("[data-ywopen]")){B().open(b.dataset.ywopen);return}
  if(at("[data-ywtest]")){mine=$("#ywMe",pg).value;if(!st.acc)return api.toast("شغّل إمكانية الوصول أول (الخطوة ١)");
    if(!B().test(mine))return api.toast("اكتب رقمك صح");api.toast("هسه تنرسل، شوف الواتساب");setTimeout(()=>{load();if(view==="set")draw()},400);return}});
// التليفون يرد: الاسم المختار
window.onYawmiWa=o=>{if(!o||o.ev!=="pick"||view!=="new"||!ed)return;if(!o.ok){if(!o.none)api.toast("هذا الاسم ما بيه رقم ينفع");return}ed.name=o.name||o.num;ed.num=o.num;draw()};
// رجوع الأندرويد والمتصفح: الصفحة الفرعية أول، بعدين «رسائلي»
addEventListener("popstate",e=>{if(!isOpen()||(e.state&&(e.state.zd||e.state.yc)))return;
  if(view!=="list"){view="list";load();draw();return}close()});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&isOpen()&&view!=="new"){load();draw()}});

function init(o){api=o;const b=$("#mWa");if(b){b.querySelector(".k").innerHTML=IC.dock;b.onclick=()=>open()}
  const P=new URLSearchParams(location.search);
  if(P.get("wa")&&!P.has("widgetsync")){const D=new URLSearchParams(P);P.delete("wa");history.replaceState(null,"",location.pathname+(P.toString()?"?"+P:""));setTimeout(()=>deep(D),0)}}
// فتح مباشر من التنبيه: ?wa=1
function deep(P){if(!P.get("wa"))return false;open();if(window.YS)YS.shown();return true}
window.YWA={init,deep,open,close,isOpen,depth,show,hist,leave};
})();
