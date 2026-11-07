(()=>{
const DAYS=["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
const H0=7,H1=24,KEY="yawmi.clay";
const REP={none:"مرة وحدة",daily:"كل يوم",work:"أيام الدوام",wk:"بالأسبوع"};
const $=s=>document.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const pad=n=>String(n).padStart(2,"0");
const hh=h=>pad(h%24)+":00";
const hm=(h,m)=>pad(h%24)+":"+pad(m||0);
const ms=i=>(i.hour??99)*60+(i.em??i.min??0);
const part=h=>h<5?"بالليل":h<12?"الصبح":h<17?"الظهر":"المسا";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ds=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const pd=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const add=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return ds(d)};
const di=s=>(pd(s).getDay()+1)%7;
const today=()=>ds(new Date());
const nowH=()=>new Date().getHours();
const nowM=()=>{const n=new Date();return n.getHours()*60+n.getMinutes()};
const dayName=s=>s===today()?"اليوم":s===add(today(),1)?"باچر":DAYS[di(s)];
const I={
  rep:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/></svg>`,
  play:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>`,
  ok:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>`,
  tom:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>`,
  del:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  undo:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>`,
  basket:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18l-2 10H5z"/><path d="M8 10l4-6 4 6"/></svg>`,
  sun:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>`,
  noon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 18h18"/><path d="M6 18a6 6 0 0 1 12 0"/><path d="M12 6v2M5 10l1.5 1M19 10l-1.5 1"/></svg>`,
  moon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/></svg>`,
  done:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>`,
  edit:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>`,
  flame:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/></svg>`
};

/* ---------- state ---------- */
function seed(){
  const t=today(),T=[],L={};
  const mk=(title,hour,o={})=>T.push({id:uid(),title,date:t,hour,rep:"none",remind:true,demo:true,...o});
  mk("رد على رسائل الزباين",9,{rep:"daily"});mk("مراجعة هوية تكتم",8);mk("تصوير ريلز المطعم",16);mk("مونتاج ريل الكارسيل",17);
  mk("مكالمة المطبعة",null);mk("تصميم بوستات الأسبوع",null);mk("اجتماع ويا عميل جديد",19);mk("رياضة",22,{rep:"work"});mk("تقرير الإعلانات",null);
  L[T[0].id+"|"+t]={st:"done"};T[1].st="done";
  let org;try{if(localStorage.getItem("yawmi-org")==="1")org=true}catch(e){} // للفحوصات القديمة بس: تبدي بوضع التنظيم
  return {v:6,tasks:T,log:L,cfg:{workS:9,workE:15,remind:10,tg:false,gcal:false,brain:false,org},demo:true};
}
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||S.v!==6)S=seed();
const BC=["#8C7B66","#6E8B74","#B79B5E","#5E6A71","#A07A8C","#4F7A7A"];
const ALL=[0,1,2,3,4,5,6],WORK=[0,1,2,3,4,5];
function migrate(){const c=S.cfg;if(!Array.isArray(c.blocks))c.blocks=[
  {id:uid(),name:"نوم",s:0,e:7,days:ALL.slice(),c:BC[3]},
  {id:uid(),name:"دوام",s:c.workS??9,e:c.workE??15,days:WORK.slice(),c:BC[0]}];
  if(!c.theme)c.theme="auto";if(c.remind==null)c.remind=10;if(c.name==null)c.name="محمد"}
migrate();
const inB=(b,h)=>b.s<b.e?h>=b.s&&h<b.e:h>=b.s||h<b.e;
const blockAt=(d,h)=>S.cfg.blocks.find(b=>b.days.includes(di(d))&&inB(b,h));
const daysTxt=a=>a.length===7?"كل يوم":a.length===6&&!a.includes(6)?"أيام الدوام":a.map(i=>DAYS[i]).join("، ");
const span=b=>`${hh(b.s)} لـ ${hh(b.e)}`;
let syncOn=false,sT=null,BT=null;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){};if(me){clearTimeout(sT);sT=setTimeout(()=>{sT=null;flush()},600)}};
const occurs=(t,d)=>d<t.date?false:t.rep==="daily"?true:t.rep==="work"?di(d)!==6:t.rep==="wk"?wkShow(t,d):d===t.date;
// تقسيم الساعة: المهام اللي بدون دقيقة محددة تنرتّب ورا بعض بالدور (حسب مدتها، بلا مدة = ربع ساعة)، واللي دقيقتها محددة تبقى بمكانها والباقي يدور حواليها.
// نفس المنطق بالسيرفر (yawmi-tick: slots). em = دقيقة البداية الفعلية.
const dOf=i=>i.dur||15;
function slots(A){const R={},byH={};A.forEach(i=>{if(i.hour!=null)(byH[i.hour]=byH[i.hour]||[]).push(i)});
  for(const h in byH){const L=byH[h],fx=L.filter(i=>i.min!=null).map(i=>[i.min,i.min+dOf(i)]);L.forEach(i=>{if(i.min!=null)R[i.id]=i.min});
    let c=0;L.filter(i=>i.min==null).forEach(i=>{const d=dOf(i);let mv=true;while(mv){mv=false;for(const [a,b] of fx)if(c<b&&c+d>a){c=b;mv=true}}R[i.id]=Math.min(c,45);c+=d})}
  return R}
/* ---------- أوقات الصلاة (تنحسب بالجهاز، طريقة جعفري: فجر ١٦°، مغرب ٤°، بتوقيت بغداد) ---------- */
const CITIES=[["karbala","كربلاء",32.616,44.024],["najaf","النجف",32.0,44.336],["baghdad","بغداد",33.315,44.366],["basra","البصرة",30.508,47.783],["mosul","الموصل",36.34,43.13],["erbil","أربيل",36.19,44.01]];
const PRAY=[["fajr","الصبح"],["dhuhr","الظهرين"],["maghrib","العشائين"]],PDUR=20,PCOL="#4E8C83";
const pcfg=()=>({on:true,city:"karbala",rem:0,...(S.cfg.pray||{})});
function prayTimes(d,lat,lng){const r=Math.PI/180,[y,m,dd]=d.split("-").map(Number);
  const D=Date.UTC(y,m-1,dd,12)/864e5+2440587.5-2451545,g=(357.529+.98560028*D)*r,q=280.459+.98564736*D;
  const L=(q+1.915*Math.sin(g)+.02*Math.sin(2*g))*r,e=(23.439-3.6e-7*D)*r,RA=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L))/r/15;
  const fh=x=>((x%24)+24)%24,eqt=q/15-fh(RA),dec=Math.asin(Math.sin(e)*Math.sin(L)),noon=fh(12-eqt),la=lat*r;
  const T=a=>Math.acos((-Math.sin(a*r)-Math.sin(dec)*Math.sin(la))/(Math.cos(dec)*Math.cos(la)))/r/15,adj=t=>Math.round((t+3-lng/15)*60);
  return {fajr:adj(noon-T(16)),dhuhr:adj(noon)+1,maghrib:adj(noon+T(4))}}
// [{k,n,m}] دقيقة البداية لكل صلاة باليوم d، أو [] إذا مطفية
function prayOn(d){const c=pcfg();if(!c.on)return[];const ct=CITIES.find(x=>x[0]===c.city)||CITIES[0],t=prayTimes(d,ct[2],ct[3]);return PRAY.map(([k,n])=>({k,n,m:t[k]}))}
const prayMin=(d,h)=>prayOn(d).reduce((n,p)=>n+Math.max(0,Math.min(p.m+PDUR,h*60+60)-Math.max(p.m,h*60)),0);
const hm12=m=>`${(Math.floor(m/60)%12)||12}:${pad(m%60)}`;
/* ---------- الأدعية بصفحة الزيارات (عناوينها نفس عناوين zyara.html) ---------- */
const DUAS=[["زيارة عاشوراء",/عاشورا/],["دعاء علقمة",/علقمة/],["زيارة آل ياسين",/ياسين/],["دعاء العهد",/العهد/],["زيارة أمين الله",/أمين ?الله/]];
const NOAUDIO=["زيارة أمين الله"]; // بدون صوت بصفحة الزيارات: بس «افتح»
const duaOf=it=>it.t.dua||(DUAS.find(([,re])=>re.test(it.title))||[])[0]||null;
// امتلاء الساعة: المهمة الطويلة تاخذ من الساعات اللي بعدها هم
const fill=(A,h,skip)=>A.filter(i=>i.hour!=null&&i.id!==skip).reduce((n,i)=>{const a=i.hour*60+(i.em??i.min??0);return n+Math.max(0,Math.min(a+dOf(i),h*60+60)-Math.max(a,h*60))},0)+prayMin(D,h);
const fillTxt=n=>{const q=Math.round(n/15);return !q?"":q>4?"زايدة":q===4?"ممتلية":["","¼","½","¾"][q]+" ممتلية"};
function itemsOn(d){const A=itemsOn0(d),R=slots(A);A.forEach(i=>i.em=i.hour!=null?R[i.id]??0:null);return A}
function itemsOn0(d){return S.tasks.filter(t=>occurs(t,d)).map(t=>{const lg=t.rep!=="none"?(S.log[t.id+"|"+d]||{}):t;
  return {t,d,id:t.id,title:t.title,rep:t.rep,remind:t.remind,dur:t.dur,note:t.note,min:t.min,hour:t.rep!=="none"&&lg.hour!==undefined?lg.hour:t.hour,st:lg.st||"todo",s:lg.s,e:lg.e}})}
function setI(it,p){if(it.rep!=="none"){const k=it.id+"|"+it.d;S.log[k]={...(S.log[k]||{}),...p}}else Object.assign(it.t,p);save()}
function state(it){if(it.st==="done")return"done";if(it.st==="doing")return"doing";if(it.hour==null)return"none";if(it.d<today()||(it.d===today()&&it.hour<nowH()))return"late";return"left"}
function streak(){let n=0,d=today();const all=x=>{const a=itemsOn(x);return a.length?a.every(i=>i.st==="done"):null};
  if(all(d)!==true)d=add(d,-1);const first=S.tasks.reduce((m,t)=>t.date<m?t.date:m,today());
  for(let i=0;i<90&&d>=first;i++,d=add(d,-1)){const r=all(d);if(r===null)continue;if(!r)break;n++}return n}
const DUR=[[15,"ربع ساعة"],[30,"نص ساعة"],[45,"٤٥ دقيقة"],[60,"ساعة"],[90,"ساعة ونص"],[120,"ساعتين"],[150,"ساعتين ونص"],[180,"٣ ساعات"],[210,"٣ ساعات ونص"],[240,"٤ ساعات"]];
const arN=n=>String(n).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
const durTxt=m=>(DUR.find(x=>x[0]===m)||[0,m?arN(m)+(m<=10?" دقايق":" دقيقة"):""])[1];
// شريط المدة: ٥–٦٠ دقيقة كل ٥ ويلزگ عند الربع والنص والساعة. «أكثر» يحوّله ساعة لـ ٤ ساعات كل نص ساعة.
const durSnap=(v,big)=>{if(big)return Math.min(240,Math.max(60,Math.round(v/30)*30));for(const x of [15,30,60])if(Math.abs(v-x)<=3)return x;return Math.max(5,Math.round(v/5)*5)};
// شنو تعبر المهمة من أوقات الصلاة والأوقات الثابتة (تنبيه بس، ما يمنع)
function crossOf(it){if(!it||it.hour==null)return [];const a=it.hour*60+(it.em||0),z=a+dOf(it),N=[];
  prayOn(D).forEach(p=>{if(p.m<z&&p.m+PDUR>a)N.push(p.n)});
  for(let h=Math.floor(a/60);h*60<z;h++){const b=blockAt(D,h%24);if(b&&!N.includes(b.name))N.push(b.name)}return N}
const crossTxt=it=>{const N=crossOf(it);return N.length?`هاي المهمة تعبر وقت ${N.join(" و")}`:""};
const LBL={none:"بدون ساعة",left:"باقية",late:"راحت ساعتها",doing:"شغّال عليها",done:"سويتها"};

/* ---------- قاعدة البيانات على حسابه (Supabase) ---------- */
const C=window.YAWMI||{};let sb=null,me=null,busy=false,again=false,needPull=false,pT=null;
let snapT={},snapL={},snapC="";
const tRow=t=>({id:t.id,title:t.title,date:t.date,hour:t.hour??null,rep:t.rep||"none",remind:t.remind!==false,st:t.st||"todo",s:t.s??null,e:t.e??null,dur:t.dur??null,note:t.note||null,min:t.min??null,dua:t.dua||null,wk:t.rep==="wk"?(t.wk||3):null});
const lRow=(k,v)=>{const i=k.lastIndexOf("|");return {task_id:k.slice(0,i),day:k.slice(i+1),hour:v.hour??null,st:v.st??null,s:v.s??null,e:v.e??null}};
const cOf=c=>{const {tg,gcal,...r}=c;return r};
const noNull=o=>{const r={};for(const k in o)if(o[k]!==null&&o[k]!==undefined)r[k]=o[k];return r};
async function flush(){
  if(!me)return;if(busy){again=true;return}busy=true;again=false;let failed=false;
  try{
    const demoIds=new Set(S.tasks.filter(t=>t.demo).map(t=>t.id)),nT={},up=[],nL={},upL=[],at=new Date().toISOString();
    S.tasks.forEach(t=>{if(t.demo)return;const r=tRow(t),j=JSON.stringify(r);nT[t.id]=j;if(snapT[t.id]!==j)up.push({...r,updated_at:at})});
    const del=Object.keys(snapT).filter(id=>!nT[id]);
    Object.entries(S.log).forEach(([k,v])=>{const r=lRow(k,v);if(demoIds.has(r.task_id))return;const j=JSON.stringify(r);nL[k]=j;if(snapL[k]!==j)upL.push({...r,updated_at:at})});
    const delL=Object.keys(snapL).filter(k=>!nL[k]).map(k=>lRow(k,{}));
    const cj=JSON.stringify(cOf(S.cfg)),ops=[];
    if(up.length)ops.push(sb.from("tasks").upsert(up));
    if(del.length)ops.push(sb.from("tasks").delete().in("id",del));
    if(upL.length)ops.push(sb.from("logs").upsert(upL,{onConflict:"user_id,task_id,day"}));
    const byT={};delL.forEach(r=>(byT[r.task_id]=byT[r.task_id]||[]).push(r.day));
    Object.entries(byT).forEach(([t,days])=>ops.push(sb.from("logs").delete().eq("task_id",t).in("day",days)));
    if(cj!==snapC)ops.push(sb.from("cfg").upsert({cfg:cOf(S.cfg),updated_at:at},{onConflict:"user_id"}));
    const res=await Promise.all(ops),bad=res.find(r=>r.error);if(bad)throw bad.error;
    snapT=nT;snapL=nL;snapC=cj;
  }catch(e){console.warn("sync",e);failed=true}
  finally{busy=false;if(failed)setTimeout(flush,8000);else if(again)flush()}
  return !failed;
}
async function pull(){
  if(!me)return;if(busy||sT||!scrim.hidden){needPull=true;return}needPull=false;
  const [a,b,c,g]=await Promise.all([sb.from("tasks").select("id,title,date,hour,rep,remind,st,s,e,dur,note,min,dua,wk").order("created_at").order("id"),
    sb.from("logs").select("task_id,day,hour,st,s,e").gte("day",add(today(),-120)),sb.from("cfg").select("cfg,tg_chat_id").maybeSingle(),sb.rpc("gcal_status")]);
  if(a.error||b.error||c.error){console.warn(a.error||b.error||c.error);return}
  if(busy||sT||!scrim.hidden){needPull=true;return}
  if(!c.data){snapT={};snapL={};snapC="";S.cfg.tg=false;flush();return} // أول مرة بهالحساب: ارفع اللي بالجهاز
  const tasks=a.data.map(r=>noNull(r)),log={};
  b.data.forEach(r=>{const v=noNull({hour:r.hour,st:r.st,s:r.s,e:r.e});log[r.task_id+"|"+r.day]=v});
  snapT={};tasks.forEach(t=>snapT[t.id]=JSON.stringify(tRow(t)));
  snapL={};Object.entries(log).forEach(([k,v])=>snapL[k]=JSON.stringify(lRow(k,v)));
  const keepDemo=S.demo&&!tasks.length;
  S={v:6,tasks:keepDemo?S.tasks:tasks,log:keepDemo?S.log:log,cfg:{...c.data.cfg,tg:!!c.data.tg_chat_id,gcal:!!g.data?.on},demo:keepDemo};gmail=g.data?.email||"";
  migrate();snapC=JSON.stringify(cOf(S.cfg));
  if(JSON.stringify(cOf(S.cfg))!==JSON.stringify(c.data.cfg))flush();
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  applyTheme();render();
  andPending();andCounts();urlOpen();
}
const soonPull=()=>{clearTimeout(pT);pT=setTimeout(pull,700)};
let rt=null;
function startRT(){if(rt)return;rt=sb.channel("yawmi");["tasks","logs","cfg"].forEach(t=>rt.on("postgres_changes",{event:"*",schema:"public",table:t,filter:`user_id=eq.${me.id}`},soonPull));rt.subscribe()}
if(C.url&&C.key&&window.supabase){
  sb=window.supabase.createClient(C.url,C.key);
  sb.auth.onAuthStateChange((ev,ses)=>{const u=ses?.user||null;if((u&&u.id)!==(me&&me.id)){me=u;syncOn=!!me;if(me){startRT();pull()}else if(rt){sb.removeChannel(rt);rt=null}}});
  sb.auth.getSession().then(({data})=>{let later=false;try{later=!!localStorage.getItem("yawmi.later")}catch(e){}
    if(!data.session){if(WS)return;if(!urlDone)return setTimeout(urlOpen,300);if(!later&&!location.hash.includes("access_token"))setTimeout(()=>{if(!me&&scrim.hidden)loginSheet(true)},400)}});
  {const q=new URLSearchParams(location.search).get("gcal");if(q){history.replaceState(null,"",location.pathname);
    setTimeout(()=>toast({ok:"انربط الكالندر ✓",no:"لغيت ربط الكالندر",old:"الرابط قديم، جرّب مرة ثانية"}[q]||"ما گدرت أربط الكالندر، جرّب مرة ثانية"),600)}}
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")soonPull()});
}

/* ---------- ui ---------- */
const scrim=$("#scrim"),sheet=$("#sheet");
const show=(h,wide)=>{sheet.className="sheet"+(wide?" wide":"");sheet.innerHTML=`<span class="grab"></span>`+h;scrim.hidden=false;sheet.onclick=null;sheet.scrollTop=0};
const hide=()=>{scrim.hidden=true;stopMic();if(needPull)soonPull()};
scrim.addEventListener("click",e=>{if(e.target===scrim||e.target.closest("[data-x]"))hide()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")hide()});
let tT;const toast=m=>{const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(tT);tT=setTimeout(()=>t.hidden=true,2800)};
const askNotif=()=>{try{if("Notification"in window&&Notification.permission==="default")Notification.requestPermission()}catch(e){}};

const Q=new URLSearchParams(location.search),WS=Q.has("widgetsync");
let D=/^\d{4}-\d{2}-\d{2}$/.test(Q.get("d")||"")?Q.get("d"):today();
let urlDone=!(Q.get("task")||Q.get("add"));
function urlOpen(){if(urlDone||WS)return;urlDone=true;try{history.replaceState(null,"",location.pathname)}catch(e){}
  if(Q.get("task")){const it=itemsOn(D).find(i=>i.id===Q.get("task"));if(it)taskSheet(it)}
  else{const tx=(Q.get("text")||"").slice(0,500),vo=Q.get("voice")==="1"; // ?text= من «شارك بيومي»، ?voice=1 من زر المايك بالويدجت
    if(!ORG())hAdd({day:D,text:tx,voice:vo});else{addSheet(vo,D);const ta=$("#ta");if(ta&&tx)ta.value=tx}}}
function tile(i){const s=state(i);
  return `<button class="tile ${s}" data-id="${i.id}"><span class="hr">${i.hour!=null?`<b${i.em?' style="font-size:14px"':""}>${i.hour%12||12}${i.em?":"+pad(i.em):""}</b><small>${part(i.hour)}</small>`:s==="done"?I.ok:"<b>؟</b>"}</span>
  <span class="tx"><b>${esc(i.title)}</b><small>${LBL[s]}${i.dur?` · ${durTxt(i.dur)}`:""}${i.rep!=="none"?` · ${I.rep}${REP[i.rep]}`:""}</small></span></button>`}
function nextItem(A){const h=D===today()?nowH():0;const c=A.filter(i=>i.st==="todo"&&i.hour!=null).sort((a,b)=>ms(a)-ms(b));return c.find(i=>i.hour>=h)||c[0]||A.find(i=>i.st==="todo")}
function render(){
  const H=nowH();motto();$("#hi").textContent=(H>=5&&H<12?"صباح الخير":"مسا الخير")+(S.cfg.name?" "+S.cfg.name:"");
  let s="";try{s=pd(D).toLocaleDateString("ar-IQ",{weekday:"long",day:"numeric",month:"long"}).replace("،","")}catch(e){}
  try{const hj=new Intl.DateTimeFormat("ar-IQ-u-ca-islamic-umalqura",{day:"numeric",month:"long",timeZone:"Asia/Baghdad"}).format(new Date(pd(D).getTime()+(12+24*(S.cfg.hadj||0))*36e5));if(hj)s+=" · "+hj}catch(e){} // التاريخ الهجري (أم القرى)
  $("#dl").textContent=s;$("#demo").hidden=!S.demo;
  if(hassaMode())hassaRender();else{
  $("#days").innerHTML=[...Array(7)].map((_,k)=>{const d=add(today(),k),a=itemsOn(d),dn=a.filter(x=>x.st==="done").length;
    return `<button class="dy press" data-d="${d}" aria-pressed="${d===D}"><b>${dayName(d)}</b><small>${di(d)===6&&!a.length?"راحة":a.length?`${dn} من ${a.length}`:"فاضي"}</small></button>`}).join("");
  const A=itemsOn(D),doing=A.find(i=>i.st==="doing"),nx=nextItem(A);
  if(doing) $("#now").innerHTML=`<span class="lb"><i></i>شغّال عليها هسه${doing.s!=null?` · صارلك ${Math.max(0,nowM()-doing.s)} دقيقة`:""}</span><h2>${esc(doing.title)}</h2><p class="bsay" id="bsay"></p><div class="acts"><button class="g press" data-now="done">سويتها ✓</button><button class="s press" data-now="open">تفاصيل</button></div>`;
  else if(nx) $("#now").innerHTML=`<span class="lb">${D===today()?"الجاية":"أول مهمة "+dayName(D)}</span><h2>${esc(nx.title)}</h2><p class="bsay" id="bsay"></p><span class="t">${nx.hour!=null?`الساعة ${hm(nx.hour,nx.em)}`:"بعدك ما حددت ساعتها"}</span><div class="acts">${D===today()?`<button class="g press" data-now="start">ابديها هسه</button>`:""}<button class="s press" data-now="open">${nx.hour!=null?"غيّر ساعتها":"حدد ساعتها"}</button></div>`;
  else $("#now").innerHTML=`<span class="lb">${A.length?"خلصت كلشي":"يوم فاضي"}</span><h2>${A.length?"عاشت ايدك، خلصت كل مهامك":"شنو عندك "+dayName(D)+"؟"}</h2><p class="bsay" id="bsay"></p><div class="acts"><button class="g press" data-now="add">ضيف مهام</button></div>`;
  const dn=A.filter(i=>i.st==="done").length, late=A.filter(i=>state(i)==="late").length, sk=streak();
  const ord=A.slice().sort((a,b)=>(a.st==="done"?0:1)-(b.st==="done"?0:1));
  $("#jar").innerHTML=`<div class="top"><h3>سويت ${dn} من ${A.length}</h3><span>${A.length?Math.round(dn/A.length*100):0}٪</span></div>
  <div class="beads">${ord.map(i=>{const s=state(i);return `<span class="bead ${s==="done"?"d":s==="late"?"l":s==="doing"?"n":""}" title="${esc(i.title)}"></span>`}).join("")||'<span class="empty">بعد ما عندك مهام</span>'}</div>
  <div class="chips"><span class="chip">${I.flame}<b>${sk}</b> أيام ورا بعض</span>${late?`<span class="chip" style="color:var(--on-late);background:var(--late)"><b>${late}</b> راحت ساعتها</span>`:""}</div>`;
  const T=[["basket","السلة","مهام بدون ساعة، دوس عليها وحط ساعتها",i=>i.hour==null&&i.st!=="done"],
           ["sun","الصبح","٧ لـ ١٢",i=>i.hour!=null&&i.hour<12&&i.st!=="done"],
           ["noon","الظهر","١٢ لـ ٥",i=>i.hour!=null&&i.hour>=12&&i.hour<17&&i.st!=="done"],
           ["moon","المسا","٥ لـ ١٢ بالليل",i=>i.hour!=null&&i.hour>=17&&i.st!=="done"]];
  let html=T.map(([ic,t,sub,f],k)=>{const it=A.filter(f).sort((a,b)=>ms(a)-ms(b));
    return `<section class="clay tray"><header><span class="ic">${I[ic]}</span><div><h3>${t}</h3><small>${sub}</small></div><span class="cnt">${it.length}</span></header>
    <div class="tiles">${it.map(tile).join("")}${k===0?`<button class="tile add" data-add>+ ضيف مهام</button>`:""}</div>${!it.length&&k?`<p class="empty">ماكو شي ب${t}</p>`:""}</section>`}).join("");
  const D_=A.filter(i=>i.st==="done");
  html+=`<details class="clay tray donebox" ${D_.length&&D_.length<=4?"open":""}><summary><header><span class="ic">${I.done}</span><div><h3>سويتها</h3><small>${D_.length?"دوس حتى تشوفها":"تجي هنا لما تخلصها"}</small></div><span class="cnt">${D_.length}</span></header></summary><div class="tiles" style="margin-top:14px">${D_.map(tile).join("")}</div></details>`;
  $("#trays").innerHTML=html;
  }
  if(BT)btAfter();
  try{if(window.YawmiAndroid)YawmiAndroid.setWidget(JSON.stringify({...wDay(today()),tomorrow:wDay(add(today(),1)),streak:streak(),lvl:btLv(),remind:S.cfg.remind||0,phone:rto()!=="tg",pray:prayOn(today()).map(p=>({t:p.n,m:p.m})),prem:pcfg().rem,...alarmPayload(),hadj:S.cfg.hadj||0,cnt:S.cfg.cnt||{},occ:occs().map(o=>({t:o.t,d:o.d})),ras:rasList().slice(0,12).map(t=>({id:t.id,t:t.title,d:t.date}))}))}catch(e){}
  pushAlarms();
}
// جملة يكتبها بنفسه بالإعدادات، تطلع سطر صغير فوگ التحية (cfg.motto)
function motto(){let m=$("#motto");const t=(S.cfg.motto||"").trim();if(!t){if(m)m.remove();return}
  if(!m){m=document.createElement("p");m.id="motto";m.style.cssText="margin:0 0 4px;font-size:14px;font-weight:700;color:var(--gold);line-height:1.5";$("#hi").before(m)}m.textContent=t}
/* ---------- ويدجت الأندرويد (بس داخل الـAPK) ---------- */
// وين يوصل التذكير: phone / tg / both. الافتراضي: الاثنين إذا التلي مربوط، وإلا التلفون
const RTO=[["phone","التلفون"],["tg","التلي"],["both","الاثنين"]];
const rto=()=>S.cfg.rto||(S.cfg.tg?"both":"phone");
function wDay(d){const T=itemsOn(d).slice().sort((a,b)=>ms(a)-ms(b));
  return {day:d,done:T.filter(i=>i.st==="done").length,total:T.length,tasks:T.map(i=>({id:i.id,t:i.title,h:i.hour??null,st:i.st,d:i.dur??null,m:i.em??null}))}}
let pendRun=false;
async function andPending(){
  if(pendRun||!me||!window.YawmiAndroid||!YawmiAndroid.pending)return;pendRun=true;
  try{ // يرجع يشتغل بكل pull (مو مرة وحدة بس)، حتى دوسات الويدجت والإشعار توصل والتطبيق مفتوح
  let L=[];try{L=JSON.parse(YawmiAndroid.pending()||"[]")}catch(e){}
  if(!Array.isArray(L)||!L.length)return;
  const ids=[];
  L.forEach(a=>{if(!a||!a.id)return;ids.push(a.id);const it=itemsOn(a.day||today()).find(i=>i.id===a.id);if(!it)return;
    if(a.st==="done"){setI(it,{st:"done"});const t=findT(a.id);if(t&&t.rep==="none"&&t.hour==null&&t.date<today())t.date=today()/* براسي: مثل hDone */}else if(a.st==="todo")setI(it,{st:"todo",s:null,e:null});
    if(Number.isInteger(a.hour)&&a.hour>=0&&a.hour<24)setI(it,{hour:a.hour})});
  clearTimeout(sT);sT=null;
  let ok=false;for(let k=0;k<20&&!ok;k++){if(!busy)ok=(await flush())===true;if(!ok)await new Promise(r=>setTimeout(r,1500))}
  if(ok)try{YawmiAndroid.applied(JSON.stringify(ids))}catch(e){}
  render();
  }finally{pendRun=false}
}

// السبحة والصلوات من ويدجتات الأبيض والأسود: الدوسات تنتظر بالتلفون (YawmiAndroid.counts) لحد ما تنحفظ بـ cfg.cnt
// cfg.cnt = {sbh:{n:كل التسبيحات}, slw:{d:"YYYY-MM-DD", n:صلوات اليوم, all:الكل}}
let cntRun=false;
async function andCounts(){
  if(cntRun||!me||!window.YawmiAndroid||!YawmiAndroid.counts)return;
  let P={};try{P=JSON.parse(YawmiAndroid.counts()||"{}")}catch(e){}
  const sbh=Math.max(0,+P.sbh||0),slw=P.slw&&typeof P.slw==="object"?P.slw:{},days=Object.keys(slw).filter(d=>/^\d{4}-\d\d-\d\d$/.test(d)).sort();
  if(!sbh&&!days.length)return;
  cntRun=true;
  try{
    const K={...(S.cfg.cnt||{})};
    if(sbh)K.sbh={n:((K.sbh&&+K.sbh.n)||0)+sbh};
    let s={d:"",n:0,all:0,...(K.slw||{})};
    for(const d of days){const v=Math.max(0,+slw[d]||0);s.all=(+s.all||0)+v;if(d===s.d)s.n=(+s.n||0)+v;else if(d>s.d){s.d=d;s.n=v}}
    if(days.length)K.slw=s;
    S.cfg.cnt=K;save();
    clearTimeout(sT);sT=null;
    let ok=false;for(let k=0;k<20&&!ok;k++){if(!busy)ok=(await flush())===true;if(!ok)await new Promise(r=>setTimeout(r,1500))}
    if(ok)try{YawmiAndroid.countsApplied(JSON.stringify(P))}catch(e){}
    render();
  }finally{cntRun=false}
}
// مناسبات للعد التنازلي بالويدجت: cfg.occ = [{id,t,d:"YYYY-MM-DD"}]
const occs=()=>Array.isArray(S.cfg.occ)?S.cfg.occ.filter(o=>o&&o.t&&/^\d{4}-\d\d-\d\d$/.test(o.d)):[];
const occDay=d=>{let t=d;try{t=new Date(d+"T12:00:00").toLocaleDateString("ar-IQ-u-nu-latn",{day:"numeric",month:"long",year:"numeric"})}catch(e){}
  const n=Math.round((new Date(d+"T12:00:00")-new Date(today()+"T12:00:00"))/864e5);return t+" · "+(n<=0?"اليوم":n===1?"باچر":"بعد "+n+" يوم")};
const occHtml=()=>occs().slice().sort((a,b)=>a.d<b.d?-1:1).map(o=>`<div class="row" style="align-items:center;gap:8px;margin-bottom:6px"><span style="flex:1"><b>${esc(o.t)}</b><br><small class="meta">${occDay(o.d)}</small></span><button class="pill" data-oc="${o.id}" aria-label="امسح" style="flex:none;width:48px">✕</button></div>`).join("")||'<p class="meta" style="margin:0 0 6px">ماكو مناسبات بعد</p>';

/* ---------- task sheet ---------- */
// ساعات الاختيار: كل الـ24 ماعدا وقت «نوم» بأوقاتي، تبدي من نهاية النوم. الساعة الحالية وساعة المهمة تبقى ظاهرة.
const sleepB=d=>S.cfg.blocks.find(b=>/نوم/.test(b.name)&&b.days.includes(di(d)));
function keyHours(it){const sb_=sleepB(D),h=nowH(),isT=D===today(),st=sb_?sb_.e:H0;
  return [...Array(24)].map((_,k)=>(st+k)%24).filter(x=>!(sb_&&inB(sb_,x))||(isT&&x===h)||it.hour===x)}
function keys(it){const A=itemsOn(D),h=nowH(),isT=D===today();let g="";
  for(const x of keyHours(it)){const k=A.some(i=>i.hour===x&&i.id!==it.id);const busy=blockAt(D,x);
    g+=`<button class="key ${it.hour===x?"sel":""} ${busy?"busy":""} ${isT&&x<h?"past":""}" data-h="${x}">${k?'<span class="k2"></span>':""}<b>${x%12||12}</b><small>${busy?esc(busy.name):fillTxt(fill(A,x,it.id))||part(x)}</small></button>`}
  return g}
// يرجّع نفس صفحة المهمة بدون ما تقفز لفوگ
function reT(id){const y=sheet.scrollTop,it=itemsOn(D).find(x=>x.id===id);if(it){taskSheet(it);sheet.scrollTop=y}}
// إذا الساعة ممتلية يسأل: تحطها بالساعة اللي بعدها؟ إذا لا، تنحط وتبين «زايدة».
function placeAt(it,h,go){const A=itemsOn(D);if(it&&it.hour===h)return go(h);
  {const f=fill(A,h,it&&it.id)-prayMin(D,h);if(!f||f+(it?dOf(it):15)<=60)return go(h)} /* الصلاة ما تسأل هنا: تطلع تنبيه «تعبر وقت…» */const n=(h+1)%24;
  show(`<h3>الساعة ${h%12||12} ممتلية</h3><p class="why">${esc(fillTxt(fill(A,h,it&&it.id)))}. تحطها بالـ${n%12||12}؟</p>
  <div class="row"><button class="bb dark" id="pfY" style="justify-content:center">إي، بالـ${n%12||12}</button><button class="bb soft" id="pfN" style="justify-content:center">لا، خليها بالـ${h%12||12}</button></div>`);
  $("#pfY").onclick=()=>go(n);$("#pfN").onclick=()=>go(h)}
// قسم الدعاء بصفحة المهمة: إذا اسمها يطابق دعاء (أو اختاره مرة) يطلع «شغّل» و«افتح الدعاء»، وإلا يختار من القائمة
function duaSec(it){const k=duaOf(it);
  if(k)return `<div class="sec"><h4>${esc(k)}</h4><div class="row" style="flex-wrap:wrap">${NOAUDIO.includes(k)?"":`<button class="bb dark" data-dgo="play" style="justify-content:center">▶ شغّل</button>`}<button class="bb ${NOAUDIO.includes(k)?"dark":"soft"}" data-dgo="open" style="justify-content:center">افتح الدعاء</button></div>${it.t.dua?`<button class="pill" data-dua="" style="align-self:flex-start;margin-top:6px">مو هذا الدعاء</button>`:""}</div>`;
  return `<details class="sec"><summary><h4 style="display:inline">هاي دعاء؟ اختاره حتى تشغّله من هنا</h4></summary><div class="row" style="flex-wrap:wrap;margin-top:8px">${DUAS.map(([n])=>`<button class="pill" data-dua="${esc(n)}">${esc(n)}</button>`).join("")}</div></details>`}
function openDua(k,play){const A=window.YawmiAndroid,th=isEve()?"dark":"light";
  try{if(A.openZyaraAt)return A.openZyaraAt(th,k,!!play);A.openZyara(th);toast("حدّث التطبيق حتى يفتح على الدعاء مباشرة")}catch(e){}}
function taskSheet(it){if(!ORG())return hSheet(it);
  const s=state(it);
  const tagBg={none:"var(--none)",left:"var(--left)",late:"var(--late)",doing:"var(--doing)",done:"var(--done)"}[s];
  const tagC={none:"var(--ink)",left:"var(--on-left)",late:"var(--on-late)",doing:"#F6EEDF",done:"var(--on-done)"}[s];
  const why=s==="done"?(it.s!=null&&it.e!=null?`سويتها. اشتغلت عليها ${Math.max(1,it.e-it.s)} دقيقة.`:"سويتها ✓"):s==="doing"?`شغّال عليها${it.s!=null?` من ${Math.max(0,nowM()-it.s)} دقيقة`:""}.`:s==="late"?`كان وقتها الساعة ${hm(it.hour,it.em)} وراحت. تسويها هسه، لو تختار ساعة ثانية؟`:s==="left"?`ساعتها ${hm(it.hour,it.em)}${it.remind&&S.cfg.remind?`، وأذكّرك قبلها ${S.cfg.remind} دقايق`:""}.`:"بعدك ما حددت شوكت تسويها. اختار ساعة من تحت.";
  let b="";
  if(it.st!=="done"){
    if(D===today()&&it.st!=="doing") b+=`<button class="bb dark" data-act="doing"><span class="i">${I.play}</span><span>راح أسويها هسه<small>تطلع بالكارت فوق</small></span></button>`;
    b+=`<button class="bb ok" data-act="done"><span class="i">${I.ok}</span><span>سويتها<small>تروح لصينية «سويتها»</small></span></button>`;
  } else b+=`<button class="bb soft" data-act="undo"><span class="i">${I.undo}</span><span>رجّعها، ما سويتها</span></button>`;
  show(`<div><span class="tag" style="background:${tagBg};color:${tagC}">${LBL[s]}</span></div>
  <h3>${esc(it.title)}</h3><p class="meta">${dayName(D)}${it.rep!=="none"?" · "+REP[it.rep]:""}</p>
  <p class="why">${why}</p>
  <div class="big">${b}</div>
  ${it.st!=="done"?`<div class="sec"><h4>${it.hour!=null?"غيّر ساعتها":"شوكت راح تسويها؟"}</h4><div class="keys">${keys(it)}</div></div>`:""}
  ${it.st!=="done"&&it.hour!=null?`<div class="sec"><h4>بأي دقيقة تبديها؟</h4><p class="meta" style="margin:-4px 0 8px">${it.min!=null?"اخترتها بنفسك. دوس عليها مرة ثانية حتى ترجع بالدور.":`بالدور: ${hm(it.hour,it.em)}. أو اختار دقيقة:`}</p><div class="row" style="flex-wrap:wrap">${[0,15,30,45].map(m=>`<button class="pill" data-min="${m}" aria-pressed="${it.min===m}" dir="ltr">${it.hour%12||12}:${pad(m)}</button>`).join("")}</div></div>`:""}
  ${it.st!=="done"?`<div class="sec"><h4>شكد تاخذ؟ <b id="durV" style="color:var(--gold)">${it.dur?durTxt(it.dur):"ما حددتها"}</b></h4>
  <input type="range" id="durR" aria-label="المدة" style="width:100%;accent-color:var(--gold);margin:4px 0 0">
  <div id="durK" style="position:relative;height:16px;font-size:11px;color:var(--muted)"></div>
  <button class="pill" id="durM" style="align-self:flex-start;margin-top:8px"></button>
  <p class="meta" id="cross" style="margin:8px 0 0;color:var(--on-late)">${esc(crossTxt(it))}</p></div>`:""}
  ${window.YawmiAndroid&&YawmiAndroid.openZyara?duaSec(it):""}
  <div class="sec"><h4>تفاصيل أو ملاحظات</h4><textarea class="ta" id="tnote" maxlength="2000" style="min-height:90px;line-height:1.7" placeholder="اكتب أي تفاصيل تخص هالمهمة">${esc(it.note||"")}</textarea></div>
  <div class="sec"><h4>تتكرر؟</h4><div class="row" style="flex-wrap:wrap">${Object.entries(REP).map(([k,l])=>`<button class="pill" data-rep="${k}" aria-pressed="${it.rep===k}">${l}</button>`).join("")}<button class="pill" data-rem aria-pressed="${!!it.remind}">${it.remind?"ذكّرني ✓":"ذكّرني"}</button></div></div>
  <div class="row" style="flex-wrap:wrap">${D===today()&&it.st!=="done"?`<button class="bb soft" data-act="tom"><span class="i">${I.tom}</span><span>خليها لباچر</span></button>`:""}<button class="bb soft" data-act="edit"><span class="i">${I.edit}</span><span>عدّل اسمها</span></button><button class="bb soft" data-act="del"><span class="i">${I.del}</span><span>احذفها</span></button></div>
  <button class="close" data-x>سكّر</button>`);
  {const n=$("#tnote");n.oninput=()=>{it.t.note=n.value.slice(0,2000)||undefined;it.note=it.t.note;save()}}
  // المدة تتغيّر بمكانها بدون ما ترجع تبني الصفحة (حتى ما تقفز لفوگ)
  {const r=$("#durR");if(r){let big=(it.dur||0)>60;
    const mode=()=>{const T=big?[60,120,180,240]:[15,30,60],lo=big?60:5,hi=big?240:60;r.min=lo;r.max=hi;r.step=big?30:1;r.value=Math.min(hi,Math.max(lo,it.dur||(big?60:15)));
      $("#durK").innerHTML=T.map(x=>`<span style="position:absolute;inset-inline-start:calc(${(x-lo)/(hi-lo)*100}% - ${(x-lo)/(hi-lo)*14}px + 7px);transform:translateX(50%);white-space:nowrap">${durTxt(x)}</span>`).join("");
      $("#durM").textContent=big?"أقل من ساعة":"أكثر من ساعة"};
    const setD=m=>{it.t.dur=m;it.dur=m;$("#durV").textContent=durTxt(m);save();render();const n=itemsOn(D).find(x=>x.id===it.id);$("#cross").textContent=crossTxt(n)};
    r.oninput=()=>{const v=durSnap(+r.value,big);r.value=v;$("#durV").textContent=durTxt(v)};r.onchange=()=>setD(durSnap(+r.value,big));
    $("#durM").onclick=e=>{e.stopPropagation();big=!big;mode();setD(durSnap(+r.value,big))};mode()}}
  sheet.onclick=e=>{
    const h=e.target.closest("[data-h]");if(h){placeAt(it,+h.dataset.h,x=>{setI(it,{hour:x});hide();render();const c=crossTxt(itemsOn(D).find(i=>i.id===it.id));toast(`انحطت الساعة ${hh(x)}`+(c?` · ${c}`:""))});return}
    const r=e.target.closest("[data-rep]");if(r){const t=it.t,nr=r.dataset.rep;if(nr!==t.rep){if(nr!=="none"){t.hour=it.hour;t.date=D}t.rep=nr;save();render();reT(t.id)}return}
    const mn=e.target.closest("[data-min]");if(mn){const v=+mn.dataset.min;it.t.min=it.t.min===v?null:v;save();render();reT(it.id);return}
    if(e.target.closest("[data-rem]")){it.t.remind=!it.t.remind;if(it.t.remind)askNotif();save();render();reT(it.id);return}
    const dq=e.target.closest("[data-dua]");if(dq){it.t.dua=dq.dataset.dua||undefined;save();reT(it.id);return}
    const dg=e.target.closest("[data-dgo]");if(dg){openDua(duaOf(it),dg.dataset.dgo==="play");return}
    const a=e.target.closest("[data-act]");if(!a)return;const k=a.dataset.act;
    if(k==="edit"){sheet.querySelector("h3").outerHTML=`<div class="row"><input class="inp" id="tt" maxlength="80" style="min-width:0" value="${esc(it.title)}"><button class="pill" id="ttok" style="flex:none">احفظ</button></div>`;
      const i=$("#tt");i.focus();i.select();sheet.scrollTop=0;
      const go=()=>{const v=i.value.trim();if(!v){i.focus();return}it.t.title=v.slice(0,80);save();render();taskSheet(itemsOn(D).find(x=>x.id===it.id));toast("انحفظ ✓")};
      $("#ttok").onclick=go;i.onkeydown=ev=>{if(ev.key==="Enter")go()};return}
    if(k==="doing"){itemsOn(D).forEach(x=>{if(x.st==="doing")setI(x,{st:"todo"})});setI(it,{st:"doing",s:nowM(),hour:it.hour??nowH()});toast("بالتوفيق");btReact("focus","ركّز… آني ساكت")}
    if(k==="done"){setI(it,{st:"done",e:D===today()?nowM():null,hour:it.hour??(D===today()?Math.max(H0,nowH()):null)});toast("عاشت ايدك ✓");btDone()}
    if(k==="undo")setI(it,{st:"todo",s:null,e:null});
    if(k==="tom"){if(it.rep!=="none")toast("هاي تتكرر، تطلع باچر وحدها");else{it.t.date=add(D,1);it.t.hour=null;it.t.st="todo";save();toast("انتقلت لباچر");btReact("sad","خليها لباچر وارتاح")}}
    if(k==="del"){S.tasks=S.tasks.filter(x=>x.id!==it.id);save()}
    hide();render();
  };
}

/* ---------- add ---------- */
// بتطبيق الأندرويد (1.17+) المايك يروح لخدمة الكلام مال التلفون: YawmiAndroid.listen() ويرجع بـ onYawmiHeard(نص، خطأ)
const NSR=window.YawmiAndroid&&typeof YawmiAndroid.listen==="function"?class{start(){NSR.cur=this;try{YawmiAndroid.listen(this.lang||"ar-IQ")}catch(e){NSR.cur=null;this.onerror&&this.onerror(e)}}stop(){}}:null;
window.onYawmiHeard=(t,err)=>{const r=NSR&&NSR.cur;if(!r)return;NSR.cur=null;
  if(t)r.onresult&&r.onresult({resultIndex:0,results:[Object.assign([{transcript:String(t)}],{isFinal:true})]});else if(err)r.onerror&&r.onerror({});r.onend&&r.onend()};
const SR=NSR||window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null;
function stopMic(){if(rec){try{rec.stop()}catch(e){}rec=null}}
const clearDemo=()=>{if(S.demo){S.tasks=S.tasks.filter(t=>!t.demo);S.log={};S.demo=false}};
// يوم المهمة: الافتراضي اليوم (أو اليوم اللي بالرابط ?add=1&d=)، ويتغيّر من الأزرار فوگ
const dLbl=d=>{try{return pd(d).toLocaleDateString("ar-IQ",{weekday:"long",day:"numeric",month:"long"}).replace("،","")}catch(e){return d}};
function addSheet(voice,day=today()){if(!ORG())return hAdd({voice,day});let ad=day<today()?today():day;
  const wk=[...Array(7)].map((_,k)=>add(today(),k));
  show(`<h3 id="adh">شنو عندك ${dayName(ad)}؟</h3>
  <div class="row" id="adays" style="flex-wrap:wrap;gap:6px">${wk.map(d=>`<button class="pill" data-ad="${d}" aria-pressed="${d===ad}">${dayName(d)}</button>`).join("")}<button class="pill" id="adOther" aria-pressed="${!wk.includes(ad)}">${wk.includes(ad)?"تاريخ ثاني":esc(dLbl(ad))}</button><input type="date" id="adPick" min="${today()}" value="${ad}" style="position:absolute;opacity:0;width:1px;height:1px;pointer-events:none"></div>
  <p class="meta">كل مهمة بسطر. اكتب ١٥ مرة وحدة، وبعدين حط لكل وحدة ساعتها.</p>
  <textarea class="ta" id="ta" placeholder="تصوير ريلز المطعم&#10;رد على الرسائل&#10;مكالمة المطبعة"></textarea>
  ${SR?`<button class="pill" id="talk" style="align-self:flex-start">احچيها بالمايك</button>`:`<p class="meta">تگدر تحچيها بعد ما تربط التلي، تدز بصمة للبوت.</p>`}
  <div class="row"><button class="bb dark" id="sv" style="justify-content:center">ضيفها</button><button class="bb soft" data-x style="justify-content:center">إلغاء</button></div>`);
  const ta=$("#ta");setTimeout(()=>ta.focus(),60);
  const pick=d=>{ad=d;$("#adh").textContent=`شنو عندك ${dayName(d)}؟`;const inW=wk.includes(d);
    sheet.querySelectorAll("[data-ad]").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.ad===d)));const o=$("#adOther");o.setAttribute("aria-pressed",String(!inW));o.textContent=inW?"تاريخ ثاني":dLbl(d)};
  sheet.querySelectorAll("[data-ad]").forEach(b=>b.onclick=()=>pick(b.dataset.ad));
  {const ip=$("#adPick");$("#adOther").onclick=()=>{try{ip.showPicker()}catch(e){ip.style.pointerEvents="auto";ip.focus();ip.click()}};ip.onchange=()=>{if(/^\d{4}-\d{2}-\d{2}$/.test(ip.value)&&ip.value>=today())pick(ip.value)}}
  $("#sv").onclick=()=>{const L=ta.value.split(/\n|،/).map(x=>x.trim()).filter(Boolean);if(!L.length)return;
    clearDemo();
    L.forEach(x=>S.tasks.push({id:uid(),title:x.slice(0,80),date:ad,hour:null,rep:"none",remind:true,st:"todo"}));save();hide();D=ad;render();toast(`انضافت ${L.length} بسلة ${dayName(ad)}. دوس على كل وحدة وحط ساعتها`)};
  const tk=$("#talk");
  if(tk)tk.onclick=()=>{if(rec){stopMic();tk.textContent="احچيها بالمايك";return}
    try{rec=new SR();rec.lang="ar-IQ";rec.continuous=true;
      rec.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)ta.value=(ta.value?ta.value.replace(/\s*$/,"")+"\n":"")+e.results[i][0].transcript.trim()};
      rec.onerror=()=>{stopMic();tk.textContent="ما گدرت أسمعك هنا، اكتبها"};
      rec.onend=()=>{rec=null};rec.start();tk.textContent="أسمعك… دوس حتى توگّف";
    }catch(e){tk.textContent="ما گدرت أسمعك هنا، اكتبها"}};
  if(voice&&tk)tk.click();
}

/* ---------- الدخول للحساب ---------- */
function loginSheet(first){
  show(`<h3>${first?"هلا 👋":"كل أجهزتك"}</h3><p class="why">حتى تنحفظ مهامك على حسابك وتطلع نفسها بالموبايل واللابتوب، اكتب إيميلك وندزلك رمز دخول على التلي.</p>
  <input class="inp" id="em" type="email" inputmode="email" autocomplete="email" placeholder="الإيميل" dir="ltr">
  <button class="bb dark" id="emtg" style="justify-content:center">دزلي الرمز على التلي</button>
  <button class="bb soft" id="emok" style="justify-content:center">أو دزلي رابط بالإيميل</button>
  <button class="close" data-x id="later">${first?"بعدين":"سكّر"}</button>`);
  try{const v=localStorage.getItem("yawmi.email");if(v)$("#em").value=v}catch(e){}
  setTimeout(()=>$("#em").focus(),60);
  $("#later").onclick=()=>{if(first)try{localStorage.setItem("yawmi.later","1")}catch(e){}};
  const val=()=>{const em=$("#em").value.trim();if(!/^\S+@\S+\.\S+$/.test(em)){$("#em").focus();return ""}try{localStorage.setItem("yawmi.email",em)}catch(e){}return em};
  $("#emtg").onclick=async()=>{const em=val();if(!em)return;$("#emtg").textContent="لحظة…";
    let r={};try{r=await fetch(C.url+"/functions/v1/yawmi-tg?login=1",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:em})}).then(x=>x.json())}catch(e){}
    if(!r.ok){$("#emtg").textContent="دزلي الرمز على التلي";return toast(r.why==="notg"||r.why==="nouser"?"هالإيميل مو مربوط بالتلي، استعمل رابط الإيميل":"ما گدرت أدز، جرّب بعد شوية")}
    codeSheet(em)};
  $("#emok").onclick=async()=>{const em=val();if(!em)return;$("#emok").textContent="لحظة…";
    const {error}=await sb.auth.signInWithOtp({email:em,options:{emailRedirectTo:location.origin+location.pathname}});
    if(error){$("#emok").textContent="أو دزلي رابط بالإيميل";toast("ما گدرت أدز، جرّب بعد شوية");return}
    show(`<h3>شوف إيميلك 📬</h3><p class="why">دزيتلك رابط على <b dir="ltr">${esc(em)}</b>. افتحه بنفس المتصفح اللي فاتح بيه التطبيق.</p><button class="close" data-x>تمام</button>`)};
}
function codeSheet(em){
  show(`<h3>شوف التلي 📬</h3><p class="why">البوت دزلك رمز. اكتبه هنا.</p>
  <input id="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="الرمز" style="border:0;border-radius:18px;padding:14px;background:var(--bg);box-shadow:var(--sh-in);text-align:center;font-size:22px;letter-spacing:6px">
  <button class="bb dark" id="otpok" style="justify-content:center">دخول</button><button class="close" data-x>سكّر</button>`);
  setTimeout(()=>$("#otp").focus(),60);
  let busyO=false;
  const go=async()=>{if(busyO)return;const t=($("#otp").value||"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\D/g,"");if(t.length<6){$("#otp").focus();return}
    busyO=true;$("#otpok").textContent="لحظة…";
    const {error}=await sb.auth.verifyOtp({email:em,token:t,type:"email"});busyO=false;
    if(error){$("#otpok").textContent="دخول";toast("الرمز غلط أو انتهى، اطلب واحد جديد");return}
    hide();toast("هلا"+(S.cfg.name?" "+S.cfg.name:"")+" ✓ دخلت")};
  $("#otpok").onclick=go;$("#otp").oninput=()=>{const v=($("#otp").value||"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\D/g,"");if(v.length===8)go()};
}

/* ---------- link / times ---------- */
const CN=[["tg","تيليجرام","يذكّرك قبل كل مهمة، يدزلك مهام اليوم الصبح، وتضيف مهمة برسالة أو بصمة."],["gcal","Google Calendar","مواعيدك بالكالندر تطلع هنا، ومهامك تصعد له."],["brain","عقل المؤسسة","مهام اليوم وشكد سويت تبين بداشبورد مركز التحكم."],["sync","كل أجهزتك","نفس المهام على الموبايل واللابتوب."]];
function linkSheet(){
  show(`<h3>التلي والربط</h3><div class="big">${CN.map(([k,n,d])=>{const on=k==="sync"?syncOn:S.cfg[k];return `<button class="bb ${on?"ok":"soft"}" data-cn="${k}"><span>${n}<small>${d}</small></span><span style="margin-inline-start:auto;font-size:13px">${on?"مربوط ✓":"اربط"}</span></button>`}).join("")}</div><button class="close" data-x>سكّر</button>`);
  sheet.onclick=e=>{const b=e.target.closest("[data-cn]");if(!b)return;const k=b.dataset.cn;
    if(k==="tg")return tgSheet();
    if(k==="sync"){if(!sb)return toast("المزامنة بعدها ما تشتغل بهالنسخة");if(!me)return loginSheet(false);
      show(`<h3>كل أجهزتك</h3><p class="why">شغّالة. مهامك محفوظة على حسابك <b dir="ltr">${esc(me.email||"")}</b>، وتطلع نفسها بأي جهاز تدخل منه بنفس الإيميل.</p><button class="bb soft" id="out" style="justify-content:center">اطلع من الحساب</button><button class="close" data-x>سكّر</button>`);
      $("#out").onclick=async()=>{await sb.auth.signOut();hide();toast("طلعت من الحساب")};return}
    if(k==="gcal")return gcalSheet();
    show(`<h3>${k==="gcal"?"Google Calendar":"عقل المؤسسة"}</h3><p class="why">${S.cfg[k]?"مربوط ✓":"هذا الربط بعده يتجهز. من يخلص يشتغل من نفسه وتشوفه هنا مربوط."}</p><button class="back" id="lbk">← الربط</button>`);
    $("#lbk").onclick=linkSheet};
}
let gmail="";
function gcalSheet(){
  if(!sb)return toast("الربط ما يشتغل بهالنسخة");if(!me)return loginSheet(false);
  if(!C.gcal){show(`<h3>Google Calendar</h3><p class="why">هذا الربط بعده يتجهز. من يخلص يشتغل من نفسه وتشوفه هنا مربوط.</p><button class="back" id="lbk">← الربط</button>`);$("#lbk").onclick=linkSheet;return}
  const on=!!S.cfg.gcal;
  show(`<h3>Google Calendar</h3><p class="why">${on?`مربوط ✓ ${gmail?`على <b dir="ltr">${esc(gmail)}</b>`:""}<br>`:""}مهامك اللي بيها ساعة تصعد للكالندر، ومواعيد الكالندر تنزل هنا كمهام بساعتها. إذا غيّرت أو حذفت بمكان، يتغيّر بالثاني خلال ٥ دقايق. المهام المتكررة ومواعيد اليوم الكامل ما تنربط.</p>
  <button class="bb dark" id="gok" style="justify-content:center">${on?"افصل الكالندر":"اربط بحساب Google"}</button><button class="back" id="lbk">← الربط</button>`);
  $("#lbk").onclick=linkSheet;
  $("#gok").onclick=async()=>{
    if(on){const {error}=await sb.rpc("gcal_off");if(error)return toast("ما گدرت أفصله، جرّب بعد شوية");S.cfg.gcal=false;hide();render();toast("انفصل الكالندر");return}
    const {data,error}=await sb.rpc("gcal_start");if(error||!data)return toast("ما گدرت أبدي الربط، جرّب بعد شوية");
    location.href=C.url+"/functions/v1/yawmi-gcal?start="+encodeURIComponent(data)};
}
function tgSheet(){
  const bot=C.bot,linked=!!S.cfg.tg;
  show(`<h3>ربط تيليجرام</h3><p class="meta">${linked?"مربوط ✓":"تفتح البوت، يدزلك رمز، تكتبه هنا."}</p>
  <div class="bubble me">باچر الساعة ٤ تصوير المطعم</div>
  <div class="bubble">انضافت ✓ «تصوير المطعم» باچر الساعة ٤. أذكّرك ٣:٥٠</div>
  <div class="bubble">صباح الخير${S.cfg.name?" "+esc(S.cfg.name):""}، عندك اليوم ٨ مهام. أولها الساعة ٩ رد على الرسائل.</div>
  <div class="bubble">بعد ١٠ دقايق: تصوير ريلز المطعم · [راح أسويها] [سويتها]</div>
  ${linked?"":bot?`<a class="bb soft" href="https://t.me/${esc(bot)}?start=link" target="_blank" rel="noopener" style="justify-content:center;text-decoration:none">١. افتح البوت ودوس Start</a>
  <input id="tgc" inputmode="numeric" maxlength="6" placeholder="٢. الرمز (٦ أرقام)" style="border:0;border-radius:18px;padding:14px;background:var(--bg);box-shadow:var(--sh-in);text-align:center;font-size:18px;letter-spacing:4px">`:`<p class="why">البوت بعده يتجهز، من يخلص يطلع هنا زر يفتحه.</p>`}
  ${linked||bot?`<button class="bb dark" id="tgok" style="justify-content:center">${linked?"افصل التلي":"اربط"}</button>`:""}
  <button class="close" data-x>سكّر</button>`);
  const ok=$("#tgok");if(!ok)return;
  ok.onclick=async()=>{
    if(!me){loginSheet(false);toast("سجّل دخول أول حتى تربط التلي");return}
    if(linked){const {error}=await sb.rpc("unlink_telegram");if(error)return toast("ما گدرت أفصله، جرّب بعد شوية");S.cfg.tg=false;hide();render();toast("انفصل التلي");return}
    const c=$("#tgc"),v=c.value.replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\D/g,"");
    if(!/^\d{6}$/.test(v)){c.focus();return}
    ok.textContent="لحظة…";const {data,error}=await sb.rpc("link_telegram",{p_code:v});
    if(error||!data){ok.textContent="اربط";toast("الرمز مو صحيح، لو خلص وقته. دوس Start مرة ثانية");return}
    S.cfg.tg=true;askNotif();hide();render();toast("انربط التلي ✓")};
}
// الإعدادات (مونو): كل شي بمكان واحد، مجموعات زجاج بعنوان صغير. نفس الخيارات ونفس البيانات، بس الشكل.
// كل تغيير يحفظ ويعيد رسم الصفحة بنفس مكان التمرير (reS).
const SI={bell:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" stroke-linejoin="round"/><path d="M10 20h4" stroke-linecap="round"/></svg>`,
  clock:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>`,
  cal:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4" stroke-linecap="round"/></svg>`,
  alarm:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="7"/><path d="M12 10v3l2 1.5M5 4L2.5 6.5M19 4l2.5 2.5"/></svg>`,
  ask:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01"/></svg>`,
  book:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z"/></svg>`,
  moon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 15A8 8 0 1 1 9 4a6.5 6.5 0 0 0 11 11z"/></svg>`,
  link:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M21 4L3 11l6 2 2 6 3-4 5 4z"/></svg>`,
  user:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
  back:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>`};
const sgp=(t,h,pad)=>`<div class="sgp"><b>${t}</b><div class="sl${pad?" pad":""}">${h}</div></div>`;
const srow=(ic,t,v,attr)=>`<button class="si" ${attr}><span class="ic">${SI[ic]}</span><span class="t">${t}</span><span class="v">${v}</span></button>`;
const sswi=(ic,t,on,attr)=>`<button class="si" ${attr} role="switch" aria-pressed="${!!on}"><span class="ic">${SI[ic]}</span><span class="t">${t}</span><span class="swi"></span></button>`;
const sseg=(items)=>`<div class="seg">${items.join("")}</div>`;
const remTxt=n=>n?n+" دقايق":"مطفي";
function reS(f){const y=sheet.scrollTop;f();sheet.scrollTop=y}
function setSheet(){
  const c=S.cfg,TH=[["light","صباحي"],["auto","تلقائي"],["dark","مسائي"]],A=ac(),P=pcfg();
  show(`<h3>الإعدادات</h3>
  ${sgp("التذكير",srow("bell","قبل المهمة",remTxt(c.remind),'id="stR"'))}
  ${sgp("يومي",srow("cal","أوقاتي",c.blocks.length?c.blocks.length+" أوقات":"ماكو",'id="stm"')+srow("alarm","المنبه",A.alarms.length?A.alarms.length+" منبه":"والنغمة",'id="stA"')+sswi("layers","وضع التنظيم",ORG(),'data-org')+`<p class="meta sorg">يرجّع الأسبوع وشرائط الساعات والمدة</p>`)}
  ${sgp("المنبهات",`<div class="sp"><span class="h">منبه الصبح ويا ملخص يومك من ILO</span>${sseg([`<button class="pill" data-wk="0" aria-pressed="${!A.wake.on}">مطفي</button>`,...WAKE.map(m=>`<button class="pill" data-wk="${m}" aria-pressed="${A.wake.on&&A.wake.m===m}" dir="ltr">${hm12(m)}</button>`)])}</div>`
    +sswi("ask","بعد المهمة يسألك «سويتها لو أأجّلها؟»",A.ask,`data-ak="${A.ask?0:1}"`)
    +sswi("book","دعاء العهد · بعد الصبح",A.duaR.ahd,'data-dr="ahd"')+sswi("book","دعاء كميل · ليلة الجمعة",A.duaR.kml,'data-dr="kml"'))}
  ${sgp("الصلاة",sswi("moon","أوقات الصلاة",P.on,`data-po="${P.on?0:1}"`)
    +(P.on?`<div class="sp">${sseg(CITIES.map(([k,n])=>`<button class="pill" data-pc="${k}" aria-pressed="${P.city===k}">${n}</button>`))}</div>
    <div class="sp"><span class="h">تذكير قبل الأذان</span>${sseg([0,5,10,15].map(n=>`<button class="pill" data-pr="${n}" aria-pressed="${P.rem===n}">${n?n+" د":"لا"}</button>`))}</div>`:""))}
  ${sgp("الشكل",sseg(TH.map(([k,l])=>`<button class="pill" data-th="${k}" aria-pressed="${c.theme===k}">${l}</button>`)),1)}
  ${sgp("أنت",`<label class="sp"><span class="h">اسمك</span><input class="inp" id="nm" maxlength="30" placeholder="شنو نناديك؟" value="${esc(c.name||"")}"></label>
    <label class="sp"><span class="h">جملة تطلع بالبداية</span><input class="inp" id="mt" maxlength="80" placeholder="مثلاً: بسم الله الرحمن الرحيم" value="${esc(c.motto||"")}"></label>
    <div class="sp"><span class="h">التاريخ الهجري</span>${sseg([[-1,"يوم ناقص"],[0,"مضبوط"],[1,"يوم زايد"]].map(([v,l])=>`<button class="pill" data-hj="${v}" aria-pressed="${(c.hadj||0)===v}">${l}</button>`))}</div>`)}
  ${sgp("المناسبات",`<div class="sp"><span class="h">ويدجت «عد تنازلي» يعد الأيام للمناسبة الجاية</span><div id="ocL">${occHtml()}</div>
    <div class="row" style="gap:8px"><input class="inp" id="ocT" maxlength="30" placeholder="شنو المناسبة؟" style="flex:1"><input class="inp" id="ocD" type="date" style="flex:1" min="${today()}"></div>
    <button class="pill" id="ocA" style="margin-top:8px">+ ضيف المناسبة</button></div>`)}
  ${sgp("الربط",srow("link","تيليجرام",c.tg?"مربوط":"مو مربوط",'id="stl"')+srow("user","حسابك",me?esc(me.email||"داخل"):"مو داخل",'id="sac"'))}
  <p class="sfoot">${me?"المزامنة شغّالة بكل أجهزتك":"مو داخل، المهام محفوظة بهالجهاز بس"}</p>
  <button class="close" data-x>سكّر</button>`);
  const nm=$("#nm");nm.onchange=()=>{c.name=nm.value.trim();save();render()};
  const mt=$("#mt");mt.onchange=()=>{c.motto=mt.value.trim().slice(0,80)||undefined;save();render()};
  const keep=()=>{nm.onchange();mt.onchange()};
  $("#stR").onclick=()=>{keep();remSheet()};
  $("#stl").onclick=()=>{keep();tgSheet()};
  $("#stm").onclick=()=>{keep();timeSheet(setSheet)};
  $("#stA").onclick=()=>{keep();alarmSheet()};
  $("#ocA").onclick=()=>{const t=$("#ocT").value.trim().slice(0,30),d=$("#ocD").value;if(!t)return toast("اكتب اسم المناسبة");if(!/^\d{4}-\d\d-\d\d$/.test(d))return toast("اختار تاريخها");
    c.occ=[...occs(),{id:Math.random().toString(36).slice(2,9),t,d}];save();render();$("#ocL").innerHTML=occHtml();$("#ocT").value="";$("#ocD").value="";toast("انضافت")};
  $("#sac").onclick=()=>{keep();if(!sb)return toast("الحساب ما يشتغل بهالنسخة");if(!me)return loginSheet(false);
    show(`<h3>حسابك</h3><p class="why">داخل بـ <b dir="ltr">${esc(me.email||"")}</b>. مهامك محفوظة على حسابك وتطلع نفسها بأي جهاز تدخل منه.</p><button class="bb soft" id="out" style="justify-content:center">اطلع من الحساب</button><button class="back" id="sbk">← الإعدادات</button>`);
    $("#sbk").onclick=setSheet;$("#out").onclick=async()=>{await sb.auth.signOut();hide();toast("طلعت من الحساب")}};
  sheet.onclick=e=>{
    const pp=e.target.closest("[data-po],[data-pc],[data-pr]");if(pp){const P=pcfg();if(pp.dataset.po)P.on=pp.dataset.po==="1";if(pp.dataset.pc)P.city=pp.dataset.pc;if(pp.dataset.pr)P.rem=+pp.dataset.pr;if(P.rem)askNotif();c.pray=P;save();render();reS(setSheet);return}
    const wk=e.target.closest("[data-wk],[data-ak],[data-dr]");if(wk){const A=ac();if(wk.dataset.wk){const m=+wk.dataset.wk;c.wake=m?{on:true,m}:{...A.wake,on:false}}
      if(wk.dataset.ak)c.ask=wk.dataset.ak==="1";if(wk.dataset.dr){c.duaR={...A.duaR,[wk.dataset.dr]:!A.duaR[wk.dataset.dr]}}save();render();reS(setSheet);return}
    const oc=e.target.closest("[data-oc]");if(oc){c.occ=occs().filter(o=>o.id!==oc.dataset.oc);if(!c.occ.length)c.occ=undefined;save();render();$("#ocL").innerHTML=occHtml();return}
    const hj=e.target.closest("[data-hj]");if(hj){c.hadj=+hj.dataset.hj||undefined;save();render();reS(setSheet);return}
    if(e.target.closest("[data-org]")){c.org=ORG()?undefined:true;save();render();reS(setSheet);return}
    const t=e.target.closest("[data-th]");if(t){c.theme=t.dataset.th;save();applyTheme();reS(setSheet)}};
}
// صفحة «التذكير» من الإعدادات: قبل المهمة بكم دقيقة، ووين يوصل (بس داخل الـAPK)
function remSheet(){const c=S.cfg;
  show(`<button class="sbk" id="rbk">${SI.back}<span>الإعدادات</span></button><h3>التذكير</h3>
  <div class="sgp"><b>أذكّرك قبل المهمة بـ</b><div class="sl pad">${sseg([0,5,10,15,30].map(n=>`<button class="pill" data-r="${n}" aria-pressed="${c.remind===n}">${n||"لا"}</button>`))}</div><span class="sn">دقايق. تقدر تطفيه لمهمة وحدة من ورقتها.</span></div>
  ${window.YawmiAndroid?`<div class="sgp"><b>التذكير يوصلني</b><div class="sl pad">${sseg(RTO.map(([k,l])=>`<button class="pill" data-to="${k}" aria-pressed="${rto()===k}">${l}</button>`))}</div></div>`:""}
  <button class="close" data-x>سكّر</button>`);
  $("#rbk").onclick=setSheet;
  sheet.onclick=e=>{const r=e.target.closest("[data-r]");if(r){c.remind=+r.dataset.r;if(c.remind)askNotif();save();render();reS(remSheet);return}
    const o=e.target.closest("[data-to]");if(o){c.rto=o.dataset.to;save();render();reS(remSheet)}};
}
let tmFrom=null; // منين انفتحت «أوقاتي» (الإعدادات أو الأسبوع) حتى يرجعلها
function timeSheet(from){if(from!==undefined)tmFrom=from;
  const c=S.cfg;
  show(`<h3>أوقاتي</h3><p class="meta">أوقاتك الثابتة (نوم، دوام، رياضة، غدا…). تطلع بالأشرطة، وتبين باهتة لما تختار ساعة المهمة.</p>
  <div class="big">${c.blocks.map(b=>`<button class="blk-row press" data-b="${b.id}"><i style="background:${b.c}"></i><span><b>${esc(b.name)}</b><small>${span(b)} · ${daysTxt(b.days)}</small></span></button>`).join("")||'<p class="empty">ماكو أوقات ثابتة بعد</p>'}
  ${prayOn(D).map(p=>`<div class="blk-row" style="opacity:.75"><i style="background:${PCOL}"></i><span><b>${p.n}</b><small>${hm12(p.m)} · ${PDUR} دقيقة · ${esc((CITIES.find(x=>x[0]===pcfg().city)||CITIES[0])[1])}</small></span></div>`).join("")}
  <button class="bb soft" data-b="new" style="justify-content:center">+ ضيف وقت ثابت</button></div>
  ${tmFrom===setSheet?`<button class="back" id="tbk">← الإعدادات</button>`:`<button class="close" data-x>سكّر</button>`}`);
  {const k=$("#tbk");if(k)k.onclick=setSheet}
  sheet.onclick=e=>{const b=e.target.closest("[data-b]");if(b)blockSheet(b.dataset.b==="new"?null:c.blocks.find(x=>x.id===b.dataset.b))};
}
function blockSheet(b){
  const isNew=!b;const w=b?{...b,days:b.days.slice()}:{id:uid(),name:"",s:17,e:18,days:ALL.slice(),c:BC.find(x=>!S.cfg.blocks.some(b=>b.c===x))||BC[0]};
  const opt=v=>[...Array(24)].map((_,h)=>`<option value="${h}" ${h===v?"selected":""}>${h%12||12} ${part(h)}</option>`).join("");
  show(`<h3>${isNew?"وقت ثابت جديد":"عدّل الوقت"}</h3>
  <input class="inp" id="bn" maxlength="30" placeholder="شنو؟ مثلاً رياضة، غدا، صلاة الجمعة" value="${esc(w.name)}">
  <div class="field"><span>من</span><select class="sel" id="bs">${opt(w.s)}</select></div>
  <div class="field"><span>لـ</span><select class="sel" id="be">${opt(w.e)}</select></div>
  <div class="sec"><h4>أي أيام؟</h4><div class="row" style="flex-wrap:wrap">${DAYS.map((n,i)=>`<button class="pill" data-dd="${i}" aria-pressed="${w.days.includes(i)}">${n}</button>`).join("")}</div>
  <div class="row" style="margin-top:8px"><button class="pill" data-pre="all">كل يوم</button><button class="pill" data-pre="work">أيام الدوام</button></div></div>
  <div class="sec"><h4>لونه بالأشرطة</h4><div class="sw">${BC.map(x=>`<button data-c="${x}" style="background:${x}" aria-pressed="${w.c===x}" aria-label="لون"></button>`).join("")}</div></div>
  <div class="row"><button class="bb dark" id="bsv" style="justify-content:center">احفظ</button>${isNew?"":`<button class="bb soft" id="bdl" style="justify-content:center">احذفه</button>`}</div>
  <button class="back" id="bbk">← أوقاتي</button>`);
  const paint=()=>{sheet.querySelectorAll("[data-dd]").forEach(x=>x.setAttribute("aria-pressed",String(w.days.includes(+x.dataset.dd))));sheet.querySelectorAll("[data-c]").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.c===w.c)))};
  sheet.onclick=e=>{const d=e.target.closest("[data-dd]");if(d){const i=+d.dataset.dd;w.days=w.days.includes(i)?w.days.filter(x=>x!==i):[...w.days,i].sort();paint();return}
    const p=e.target.closest("[data-pre]");if(p){w.days=(p.dataset.pre==="all"?ALL:WORK).slice();paint();return}
    const cc=e.target.closest("[data-c]");if(cc){w.c=cc.dataset.c;paint()}};
  $("#bbk").onclick=timeSheet;
  $("#bsv").onclick=()=>{w.name=$("#bn").value.trim();w.s=+$("#bs").value;w.e=+$("#be").value;
    if(!w.name){$("#bn").focus();return}if(w.s===w.e){toast("البداية والنهاية نفس الساعة");return}if(!w.days.length){toast("اختار يوم واحد على الأقل");return}
    const L=S.cfg.blocks;const i=L.findIndex(x=>x.id===w.id);if(i<0)L.push(w);else L[i]=w;save();render();timeSheet();toast("انحفظ ✓")};
  if(!isNew)$("#bdl").onclick=()=>{S.cfg.blocks=S.cfg.blocks.filter(x=>x.id!==w.id);save();render();timeSheet();toast("انحذف")};
}

/* ---------- الأسبوع: 7 columns × 24 hour strips (168 hours) ---------- */
function cellOf(d,h,A){const t=A.filter(i=>i.hour===h);if(t.length){const s=t.map(state);return {k:s.includes("doing")?"tn":s.every(x=>x==="done")?"td":s.includes("late")?"tl":"t",t}}
  if(prayMin(d,h))return {p:1};const b=blockAt(d,h);return b?{b}:{}}
function weekSheet(){
  const ds_=[...Array(7)].map((_,k)=>add(today(),k)),AA=ds_.map(itemsOn);
  let free=0,tk=0;const used={};
  let g=`<span></span>`+ds_.map((d,k)=>`<button class="dh ${d===D?"on":""}" data-wd="${d}">${dayName(d)}<small>${AA[k].length?AA[k].length+" مهام":"—"}</small></button>`).join("");
  for(let h=0;h<24;h++){g+=`<span class="hl">${h%3===0?(h%12||12):""}</span>`;
    ds_.forEach((d,k)=>{const c=cellOf(d,h,AA[k]);if(c.t)tk++;else if(c.p){}else if(c.b)used[c.b.id]=(used[c.b.id]||0)+1;else free++;
      g+=`<span class="c ${c.k||""}" data-wd="${d}" ${c.b||c.p?`style="background:${c.p?PCOL:c.b.c}"`:""} title="${c.t?esc(c.t.map(x=>x.title).join("، ")):c.p?"صلاة":c.b?esc(c.b.name):"فاضي"} · ${hh(h)}"></span>`})}
  const lg=S.cfg.blocks.map(b=>`<span><i style="background:${b.c}"></i>${esc(b.name)}</span>`).join("")+(pcfg().on?`<span><i style="background:${PCOL}"></i>صلاة</span>`:"")+`<span><i style="background:var(--gold)"></i>مهمة</span><span><i style="background:var(--done)"></i>سويتها</span><span><i style="background:var(--none)"></i>فاضي</span>`;
  show(`<h3>أسبوعك: ١٦٨ ساعة</h3><p class="meta">كل عمود يوم، وكل شريط ساعة. دوس على أي يوم حتى تفتحه ساعة ساعة.</p>
  <div class="free"><span class="chip"><b>${free}</b> ساعة فاضية</span>${S.cfg.blocks.map(b=>used[b.id]?`<span class="chip"><i style="width:10px;height:10px;border-radius:3px;background:${b.c};display:inline-block"></i><b>${used[b.id]}</b> ${esc(b.name)}</span>`:"").join("")}<span class="chip"><b>${tk}</b> ساعة مهام</span></div>
  <div class="wk">${g}</div><div class="lg">${lg}</div>
  <div class="row"><button class="bb soft" data-tm style="justify-content:center">أوقاتي</button><button class="bb soft" data-x style="justify-content:center">سكّر</button></div>`,true);
  sheet.onclick=e=>{const w=e.target.closest("[data-wd]");if(w){D=w.dataset.wd;render();daySheet();return}if(e.target.closest("[data-tm]"))timeSheet(null)};
}
function daySheet(){
  const A=itemsOn(D),isT=D===today(),h0=nowH();let rows="",h=0;
  while(h<24){const b=blockAt(D,h),t=A.filter(i=>i.hour===h).sort((x,y)=>(x.em||0)-(y.em||0));
    if(b&&!t.length){let e=h+1;while(e<24&&blockAt(D,e)===b&&!A.some(i=>i.hour===e))e++;
      rows+=`<div class="dr"><span class="h">${h%12||12}<small>${part(h)}</small></span><span class="bar blk" style="background:${b.c}">${esc(b.name)} · لـ ${hh(e)}</span></div>`;h=e;continue}
    rows+=`<div class="dr"><span class="h">${h%12||12}<small>${part(h)}</small></span>${t.length?`<div class="bar has">${t.map(tile).join("")}</div>`:`<button class="bar em ${isT&&h<h0?"past":""}" data-eh="${h}">فاضي · دوس وحط مهمة</button>`}</div>`;h++}
  const nb=A.filter(i=>i.hour==null&&i.st!=="done").length;
  show(`<button class="back" id="wbk">← الأسبوع</button><h3>${dayName(D)} ساعة ساعة</h3><p class="meta">${nb?`عندك ${nb} بالسلة بدون ساعة. دوس على ساعة فاضية وحطها بيها.`:"دوس على ساعة فاضية حتى تحط بيها مهمة."}</p><div class="dv">${rows}</div><button class="close" data-x>سكّر</button>`,true);
  $("#wbk").onclick=weekSheet;
  sheet.onclick=e=>{const em=e.target.closest("[data-eh]");if(em)return pickSheet(+em.dataset.eh);
    const t=e.target.closest(".tile[data-id]");if(t){const it=itemsOn(D).find(i=>i.id===t.dataset.id);if(it)taskSheet(it)}};
}
function pickSheet(h,back=daySheet){
  const B=itemsOn(D).filter(i=>i.hour==null&&i.st!=="done");
  show(`<button class="back" id="pbk">← ${dayName(D)}</button><h3>شنو تسوي الساعة ${hh(h)}؟</h3>
  ${B.length?`<p class="meta">اختار من السلة:</p><div class="big">${B.map(i=>`<button class="bb soft" data-pk="${i.id}"><span>${esc(i.title)}</span></button>`).join("")}</div>`:`<p class="why">السلة فاضية. اكتب مهمة جديدة لهالساعة:</p>`}
  <input class="inp" id="pn" maxlength="80" placeholder="لو اكتب مهمة جديدة هنا">
  <button class="bb dark" id="pok" style="justify-content:center">حطها بهالساعة</button>`);
  $("#pbk").onclick=back;
  sheet.onclick=e=>{const p=e.target.closest("[data-pk]");if(!p)return;const it=itemsOn(D).find(i=>i.id===p.dataset.pk);if(it)placeAt(it,h,x=>{setI(it,{hour:x});render();toast(`انحطت الساعة ${hh(x)}`);back()})};
  $("#pok").onclick=()=>{const v=$("#pn").value.trim();if(!v){$("#pn").focus();return}
    clearDemo();
    placeAt(null,h,x=>{S.tasks.push({id:uid(),title:v.slice(0,80),date:D,hour:x,rep:"none",remind:true,st:"todo"});save();render();toast(`انضافت الساعة ${hh(x)}`);back()})};
}

/* ---------- صباحي / مسائي ---------- */
const isEve=()=>{const t=S.cfg.theme;return t==="dark"||(t==="auto"&&(nowH()<5||nowH()>=18))};
function applyTheme(){const e=isEve();document.documentElement.dataset.theme=e?"dark":"light";
  const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=e?"#050506":"#eeeef1";
  $("#theme").innerHTML=`${e?I.moon:I.sun}<span>${e?"مسائي":"صباحي"}</span>`}
$("#theme").onclick=()=>{S.cfg.theme=isEve()?"light":"dark";save();applyTheme();toast(isEve()?"مسائي 🌙":"صباحي ☀️")};

/* ---------- events ---------- */
document.addEventListener("click",e=>{
  if(e.target.closest("#sheet"))return;
  const d=e.target.closest("[data-d]");if(d){D=d.dataset.d;render();return}
  const t=e.target.closest(".tile[data-id]");if(t){const it=itemsOn(D).find(i=>i.id===t.dataset.id);if(it)taskSheet(it);return}
  if(e.target.closest("[data-add]"))return addSheet();
  const n=e.target.closest("[data-now]");if(n){const A=itemsOn(D),it=A.find(i=>i.st==="doing")||nextItem(A);const k=n.dataset.now;
    if(k==="add"||!it)return addSheet();
    if(k==="done"){setI(it,{st:"done",e:nowM()});render();toast("عاشت ايدك ✓");btDone();return}
    if(k==="start"){A.forEach(x=>{if(x.st==="doing")setI(x,{st:"todo"})});setI(it,{st:"doing",s:nowM(),hour:it.hour??nowH()});render();toast("بالتوفيق");btReact("focus","ركّز… آني ساكت");return}
    return taskSheet(it)}
});
$("#mLink").innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg><span>الإعدادات</span>`;$("#mLink").setAttribute("aria-label","الإعدادات");
$("#mAdd").onclick=()=>addSheet();$("#mLink").onclick=setSheet;$("#mTime").remove();$("#mWeek").onclick=weekSheet;
{const z=$("#mTom");z.id="mZyara";z.innerHTML=`<span class="k"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5z"/><path d="M12 6v13"/></svg></span>زيارات`;
  z.onclick=()=>{try{if(window.YawmiAndroid&&YawmiAndroid.openZyara)return YawmiAndroid.openZyara(isEve()?"dark":"light")}catch(e){}toast(window.YawmiAndroid?"حدّث التطبيق حتى تشتغل الزيارات":"الزيارات تشتغل بتطبيق الموبايل، وبدون نت")}}
// «اليوم» بمكان «رتّب يومي»: index.html بعده بيه #mArr، هنا يتبدّل اسمه وشكله
{const z=$("#mArr");z.id="mDay";z.innerHTML=`<span class="k"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5h14M5 9.7h14M5 14.3h9M5 19h14"/></svg></span>اليوم`;z.onclick=()=>dayView()}
/* ---------- اليوم: ٢٤ شريط من ١٢ بالليل، كل شريط ساعة، والمهام تتقسم بنفس الشريط ---------- */
function dayView(){
  const A=itemsOn(D),isT=D===today(),h0=nowH(),P=prayOn(D),pc=(a,z)=>`inset-inline-start:${a/60*100}%;width:${(z-a)/60*100}%`;let rows="";
  const iv=i=>{const a=i.hour*60+i.em;return [a,a+dOf(i)]};
  for(let h=0;h<24;h++){const b=blockAt(D,h),H=h*60,t=A.filter(i=>{if(i.hour==null)return false;const [a,z]=iv(i);return a<H+60&&z>H}).sort((x,y)=>iv(x)[0]-iv(y)[0]),
    cut=i=>{const [a,z]=iv(i);return [Math.max(a,H)-H,Math.min(z,H+60)-H]},tot=t.reduce((n,i)=>{const [a,z]=cut(i);return n+z-a},0);let sg="";
    P.forEach(p=>{const a=Math.max(p.m,h*60),z=Math.min(p.m+PDUR,h*60+60);if(z>a)sg+=`<span class="sg pr" style="${pc(a-h*60,z-h*60)}">${p.n}</span>`});
    t.forEach((i,k)=>{const s=state(i),[ca,cz]=cut(i),a=tot>60?k*60/t.length:ca,z=tot>60?(k+1)*60/t.length:cz,go=i.hour!==h;
      sg+=`<button class="sg tk ${s}" data-id="${i.id}" style="${pc(a,z)}"><b>${go?"↳ ":""}${esc(i.title)}</b><small dir="ltr">${go?"":`${h%12||12}:${pad(i.em)}`}</small></button>`});
    const first=b&&(h===0||blockAt(D,h-1)!==b);
    rows+=`<div class="hs ${isT&&h<h0?"past":""} ${isT&&h===h0?"now":""}"><span class="h">${h%12||12}<small>${part(h)}</small></span><div class="st ${b?"blk":""}" data-eh="${h}" ${b?`style="background:${b.c}"`:""}>${!t.length&&(first||!b)?`<span class="lb">${b?esc(b.name):"فاضي"}</span>`:""}${sg}</div></div>`}
  const nb=A.filter(i=>i.hour==null&&i.st!=="done").length;
  show(`<style>.hv{display:flex;flex-direction:column;gap:4px}.hs{display:flex;gap:8px;align-items:center}.hs.past{opacity:.55}
.hs .h{width:40px;flex:none;text-align:center;font-family:var(--head);font-weight:800;font-size:14px;line-height:1}.hs .h small{display:block;font-family:var(--body);font-weight:400;font-size:9.5px;color:var(--muted)}
.hs.now .h{color:var(--gold)}.hs.now .st{box-shadow:0 0 0 2px var(--gold)}
.st{position:relative;flex:1;height:38px;border-radius:12px;background:var(--bg);box-shadow:var(--sh-in);cursor:pointer;overflow:hidden}.st.blk{opacity:.85;box-shadow:none}
.st .lb{position:absolute;inset-inline-start:12px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--muted)}.st.blk .lb{color:#fff;font-weight:600}
.sg{position:absolute;top:3px;bottom:3px;border-radius:9px;display:flex;flex-direction:column;justify-content:center;padding:0 7px;min-width:0;overflow:hidden;text-align:start;font-size:12px;line-height:1.15;border:0}
.sg b,.sg small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sg small{font-size:9.5px;opacity:.8}
.sg.pr{background:${PCOL};color:#fff;font-weight:700;font-size:11px;align-items:center;padding:0 3px}
.sg.tk{background:var(--gold);color:#2B2620;box-shadow:inset 0 0 0 1.5px #00000014;margin-inline:1px}.sg.tk.late{background:var(--late);color:var(--on-late)}.sg.tk.done{background:var(--done);color:var(--on-done)}.sg.tk.doing{background:var(--ink);color:var(--card)}</style>
  <h3>${dayName(D)} ساعة ساعة</h3><p class="meta">كل شريط ساعة، من ١٢ بالليل. ${nb?`عندك ${nb} بالسلة بدون ساعة. `:""}دوس على مكان فاضي حتى تحط مهمة.</p>
  <div class="hv">${rows}</div><button class="close" data-x>سكّر</button>`,true);
  const y=sheet.querySelector(".hs.now");if(y)setTimeout(()=>y.scrollIntoView({block:"center"}),30);
  sheet.onclick=e=>{const t=e.target.closest(".sg.tk[data-id]");if(t){const it=itemsOn(D).find(i=>i.id===t.dataset.id);if(it)taskSheet(it);return}
    const em=e.target.closest("[data-eh]");if(em)pickSheet(+em.dataset.eh,dayView)};
}
/* ---------- المنبهات (ترن من الـAPK حتى لو التطبيق مسدود) ---------- */
// cfg.wake {on,m}: منبه الصبح ويا ملخص اليوم · cfg.ask: يسأل «سويتها؟» بعد وقت المهمة · cfg.duaR {ahd,kml}: تذكير الأدعية · cfg.alarms: منبهات عادية
const ac=()=>({wake:{on:false,m:390,...(S.cfg.wake||{})},ask:S.cfg.ask!==false,duaR:{ahd:true,kml:true,...(S.cfg.duaR||{})},alarms:S.cfg.alarms||[]});
const WAKE=[330,360,390,420,450,480];
function dayText(d){const T=itemsOn(d).filter(i=>i.st!=="done"),h=T.filter(i=>i.hour!=null).sort((a,b)=>ms(a)-ms(b));
  const hi=`صباح الخير${S.cfg.name?" "+S.cfg.name:""}`;if(!T.length)return `${hi}، ${dayName(d)==="اليوم"?"اليوم":dayName(d)} ما عندك مهام.`;
  return `${hi}، عندك ${T.length} ${T.length===1?"مهمة":"مهام"}.${h.length?` أولها الساعة ${tTxt(h[0].hour*60+h[0].em)}: ${h[0].title}.`:""}`}
function duaRem(d){const c=ac().duaR,P=prayTimes(d,...(CITIES.find(x=>x[0]===pcfg().city)||CITIES[0]).slice(2)),R=[];
  if(c.ahd)R.push({day:d,m:P.fajr+20,k:"دعاء العهد"});if(c.kml&&di(d)===5)R.push({day:d,m:P.maghrib+30,k:"دعاء كميل"});return R}
function alarmPayload(){const c=ac(),t=today(),n=add(t,1);
  return {wake:c.wake.on?{m:c.wake.m,day:t,today:dayText(t),tomorrow:dayText(n)}:null,ask:c.ask,prayTom:prayOn(n).map(p=>({t:p.n,m:p.m})),duaRem:[...duaRem(t),...duaRem(n)]}}
// أيام التطبيق: 0=السبت. أيام الـAPK: 0=الأحد
let alSent="";function pushAlarms(){try{const A=window.YawmiAndroid;if(!A||!A.setAlarms)return;
  const j=JSON.stringify(ac().alarms.map(a=>({id:a.id,m:a.m,days:a.days.map(x=>(x+6)%7),label:a.label||"منبه",on:a.on!==false})));if(j!==alSent){A.setAlarms(j);alSent=j}}catch(e){}}
const tTxt=m=>`${hm12(m)} ${part(Math.floor(m/60))}`;
function toneRow(){const A=window.YawmiAndroid;if(!A||!A.pickRingtone)return `<p class="meta">النغمة وتشغيل المنبه والتطبيق مسدود تحتاج آخر نسخة من تطبيق الموبايل.</p>`;
  let n="";try{n=A.ringtoneName()||""}catch(e){}
  return `<button class="bb soft" id="tone"><span>النغمة<small id="toneN">${esc(n||"صوت المنبه الأساسي")}</small></span><span style="margin-inline-start:auto;font-size:13px">غيّرها</span></button>`}
function toneWire(){const b=$("#tone");if(!b)return;b.onclick=()=>{try{YawmiAndroid.pickRingtone()}catch(e){}};
  window.onYawmiRingtone=n=>{const x=$("#toneN");if(x)x.textContent=n||"صوت المنبه الأساسي";toast("انحفظت النغمة ✓")}}
function alarmSheet(){const L=ac().alarms;
  show(`<h3>المنبه</h3><p class="meta">منبه عادي مو مربوط بمهمة. يرن بوقته حتى لو التطبيق مسدود.</p>
  <div class="big">${L.map(a=>`<div class="bb soft" style="cursor:default"><span data-al="${a.id}" style="flex:1;cursor:pointer"><b style="font-size:22px;font-family:var(--head)" dir="ltr">${hm12(a.m)}</b> ${part(Math.floor(a.m/60))}<small>${esc(a.label||"منبه")} · ${daysTxt(a.days)}</small></span><button class="pill" data-alon="${a.id}" aria-pressed="${a.on!==false}">${a.on!==false?"شغّال":"مطفي"}</button></div>`).join("")||'<p class="empty">ماكو منبهات بعد</p>'}
  <button class="bb dark" data-al="new" style="justify-content:center">+ منبه جديد</button>${toneRow()}</div>
  <button class="close" data-x>سكّر</button>`);
  toneWire();
  sheet.onclick=e=>{const o=e.target.closest("[data-alon]");if(o){const a=L.find(x=>x.id===o.dataset.alon);a.on=a.on===false;S.cfg.alarms=L;save();render();alarmSheet();return}
    const b=e.target.closest("[data-al]");if(b)alarmEdit(b.dataset.al==="new"?null:L.find(x=>x.id===b.dataset.al))};
}
function alarmEdit(a){const isNew=!a,w=a?{...a,days:a.days.slice()}:{id:uid(),m:390,days:ALL.slice(),label:"",on:true};
  show(`<h3>${isNew?"منبه جديد":"عدّل المنبه"}</h3>
  <input class="inp" id="alT" type="time" value="${pad(Math.floor(w.m/60))}:${pad(w.m%60)}" dir="ltr" style="font-size:28px;text-align:center;font-family:var(--head)">
  <input class="inp" id="alL" maxlength="30" placeholder="اسمه (اختياري)، مثلاً: الدوام" value="${esc(w.label||"")}">
  <div class="sec"><h4>أي أيام؟</h4><div class="row" style="flex-wrap:wrap">${DAYS.map((n,i)=>`<button class="pill" data-dd="${i}" aria-pressed="${w.days.includes(i)}">${n}</button>`).join("")}</div>
  <div class="row" style="margin-top:8px"><button class="pill" data-pre="all">كل يوم</button><button class="pill" data-pre="work">أيام الدوام</button></div></div>
  <div class="row"><button class="bb dark" id="alS" style="justify-content:center">احفظ</button>${isNew?"":`<button class="bb soft" id="alD" style="justify-content:center">احذفه</button>`}</div>
  <button class="back" id="alB">← المنبه</button>`);
  const paint=()=>sheet.querySelectorAll("[data-dd]").forEach(x=>x.setAttribute("aria-pressed",String(w.days.includes(+x.dataset.dd))));
  sheet.onclick=e=>{const d=e.target.closest("[data-dd]");if(d){const i=+d.dataset.dd;w.days=w.days.includes(i)?w.days.filter(x=>x!==i):[...w.days,i].sort();paint();return}
    const p=e.target.closest("[data-pre]");if(p){w.days=(p.dataset.pre==="all"?ALL:WORK).slice();paint()}};
  $("#alB").onclick=alarmSheet;
  $("#alS").onclick=()=>{const v=$("#alT").value;if(!/^\d{2}:\d{2}$/.test(v)){$("#alT").focus();return}if(!w.days.length){toast("اختار يوم واحد على الأقل");return}
    w.m=+v.slice(0,2)*60+ +v.slice(3);w.label=$("#alL").value.trim().slice(0,30);const L=ac().alarms.slice(),i=L.findIndex(x=>x.id===w.id);if(i<0)L.push(w);else L[i]=w;
    S.cfg.alarms=L;save();render();alarmSheet();toast(`المنبه ${tTxt(w.m)} ✓`)};
  if(!isNew)$("#alD").onclick=()=>{S.cfg.alarms=ac().alarms.filter(x=>x.id!==w.id);save();render();alarmSheet();toast("انحذف")};
}
{const b=document.createElement("button");b.id="mAlarm";b.innerHTML=`<span class="k"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="7"/><path d="M12 10v3l2 1.5M5 4L2.5 6.5M19 4l2.5 2.5"/></svg></span>منبه`;b.onclick=alarmSheet;$("#mWeek").after(b)}
$("#demo").onclick=()=>{clearDemo();save();render();toast("انمسحت. دوس «ضيف» وابدي")};

/* ---------- «هسه»: الواجهة الجديدة (ثوابتي / براسي / مواعيد) ---------- */
// الخانة تنعرف من الحقول الموجودة، بلا عمود جديد:
//   ثوابتي = تتكرر (daily / work / wk) · براسي = مرة وحدة بلا ساعة · مواعيد = مرة وحدة بساعة
// wk = «كم مرة بالأسبوع» (t.wk من ١ لـ ٦): تطلع كل يوم لحد ما تنسوّى هالعدد من السبت للجمعة.
// «وضع التنظيم» (cfg.org) يرجّع الواجهة القديمة كلها (الأسبوع، الشرائط، المدة).
const ORG=()=>S.cfg.org===true;
const kindOf=t=>t.rep!=="none"?"fix":t.hour==null?"ras":"app";
const KIND=[["ras","براسي"],["fix","ثابت"],["app","موعد"]];
const rasList=()=>{const T=today();return S.tasks.map((t,k)=>[t,k]).filter(([t])=>t.rep==="none"&&t.hour==null&&t.st!=="done"&&t.date<=T)
  .sort((a,b)=>a[0].date<b[0].date?-1:a[0].date>b[0].date?1:a[1]-b[1]).map(x=>x[0])};
const ageOf=t=>Math.round((pd(today())-pd(t.date))/864e5);
const ageTxt=n=>`من ${arN(n)} ${n<=10?"أيام":"يوم"}`;
const dots=(n,f)=>`<span class="dots" aria-label="${arN(f)} من ${arN(n)}">${[...Array(n)].map((_,k)=>`<i class="${k<f?"f":""}"></i>`).join("")}</span>`;
let hOpen="",hSkip=new Set();
const HI={
  now:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>`,
  mic:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>`,
  layers:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>`};
SI.layers=HI.layers;
// الواجهة: تتبدّل بين «هسه» والقديمة حسب وضع التنظيم، وILO ينتقل يم التحية
function hassaMode(){const on=!ORG(),b=document.body;b.classList.toggle("hassa",on);
  let H=$("#hassa");if(!H){H=document.createElement("div");H.id="hassa";$("#trays").after(H)}
  const bt=$("#btBtn"),hd=$(".hd>div");
  if(on){if(bt&&bt.parentNode!==hd)hd.prepend(bt);$("#now").innerHTML="";if(!$(".hsay")){const p=document.createElement("p");p.id="bsay";p.className="hsay";$("#hi").after(p)}}
  else{if(bt&&bt.parentNode!==$("#nowWrap"))$("#nowWrap").append(bt);const p=$(".hsay");if(p)p.remove();H.innerHTML=""}
  if(!$("#mNow")){const n=document.createElement("button");n.id="mNow";n.innerHTML=`<span class="k">${HI.now}</span>هسه`;n.onclick=()=>{hide();scrollTo({top:0,behavior:"smooth"})};$(".dock").prepend(n)}
  return on}
function hassaRender(){D=today();const T=D,A=itemsOn(T),now=nowM();
  const fix=A.filter(i=>i.rep!=="none"),app=A.filter(i=>i.rep==="none"&&i.hour!=null).sort((a,b)=>ms(a)-ms(b)),ras=rasList();
  const up=A.filter(i=>i.hour!=null&&i.st!=="done"&&i.hour*60+(i.em||0)>=now).sort((a,b)=>ms(a)-ms(b)),nx=up[0],af=up[1];
  let h="";
  if(S.demo)h+=`<div class="hnote"><span>هاي أمثلة حتى تشوف شلون يشتغل</span><button data-hdemo>امسحها</button></div>`;
  else if(!S.cfg.hSeen)h+=`<div class="hnote">${HI.layers}<span>رتّبنا مهامك على ثلاث خانات</span><button data-hseen>تمام</button></div>`;
  if(nx)h+=`<section class="hcard hnext"><div class="row"><span class="lab"><i></i>الجاي</span><button class="hp sm" data-hok="${nx.id}">سويتها</button></div>
    <b class="nt">الساعة <span class="n">${(nx.hour%12||12)+(nx.em?":"+pad(nx.em):"")}</span> · ${esc(nx.title)}</b>${af?`<span class="sub">بعدها: ${esc(af.title)}</span>`:""}</section>`;
  let one=ras.find(t=>!hSkip.has(t.id));if(!one&&ras.length){hSkip.clear();one=ras[0]}
  h+=one?`<section class="hcard hone"><span class="lab">شغلة وحدة هسه</span><button class="big" data-hid="${one.id}">${esc(one.title)}</button>
    <div class="hbtns"><button class="hp w" data-hdo="${one.id}">سويتها</button><button class="hp" data-hlater="${one.id}">مو هسه</button><button class="hp" data-hdel="${one.id}">شيلها</button></div></section>`
    :`<section class="hcard hone hempty"><b class="big">ما براسك شي، ارتاح</b><span class="sub">إذا خطرلك شي، دوس «ضيف»</span></section>`;
  const fd=fix.filter(i=>i.st==="done").length,ad=app.filter(i=>i.st!=="done").length;
  const row=(k,t,c,body)=>`<button class="fold${hOpen===k?" op":""}" data-hfold="${k}" aria-expanded="${hOpen===k}"><span>${t}</span><span class="k">${c}</span></button>${hOpen===k?`<div class="hlist">${body}</div>`:""}`;
  const fixRow=i=>{const w=i.t.rep==="wk"?wkCount(i.t,T):null;return `<div class="it${i.st==="done"?" dn":""}"><button class="tt" data-hid="${i.id}">${esc(i.title)}</button>${w!=null?dots(i.t.wk||3,w):""}<button class="o" data-hok="${i.id}" aria-label="${i.st==="done"?"رجّعها":"سويتها"}"></button></div>`};
  const rasRow=t=>{const a=ageOf(t);return `<div class="it${a>7?" old":""}"><button class="tt" data-hid="${t.id}">${esc(t.title)}</button>${a>7?`<span class="ag">${ageTxt(a)}</span>`:""}<button class="o" data-hdo="${t.id}" aria-label="سويتها"></button></div>`};
  const appRow=i=>{const s=state(i);return `<div class="it${s==="done"?" dn":s==="late"?" late":""}"><span class="tm n">${hm(i.hour,i.em)}</span><button class="tt" data-hid="${i.id}">${esc(i.title)}</button><button class="o" data-hok="${i.id}" aria-label="${s==="done"?"رجّعها":"سويتها"}"></button></div>`};
  h+=`<section class="hcard hfolds">${row("fix","ثوابتي",fix.length?`${arN(fd)} من ${arN(fix.length)} اليوم`:"ماكو",fix.map(fixRow).join("")||`<p class="hem">ماكو ثوابت. ضيفها من «ضيف» ← ثابت</p>`)}
    ${row("ras","براسي",ras.length?`${arN(ras.length)} ${ras.length===1?"شغلة":"شغلات"}`:"فاضية",ras.map(rasRow).join("")||`<p class="hem">ما براسك شي، ارتاح</p>`)}
    ${row("app","مواعيد",app.length?`${arN(ad)} اليوم`:"ماكو",app.map(appRow).join("")||`<p class="hem">ماكو مواعيد اليوم</p>`)}</section>`;
  $("#hassa").innerHTML=h}
// كم مرة انسوّت هالأسبوع (من السبت لليوم d، ويا اليوم)
function wkCount(t,d){let n=0;for(let x=add(d,-di(d));x<=d;x=add(x,1)){const l=S.log[t.id+"|"+x];if(l&&l.st==="done")n++}return n}
// «كم مرة بالأسبوع»: تختفي إذا كملت العدد قبل اليوم (اللي انسوّت اليوم تبقى مشطوبة)
function wkShow(t,d){const l=S.log[t.id+"|"+d];if(l&&l.st==="done")return true;let n=0;for(let x=add(d,-di(d));x<d;x=add(x,1)){const g=S.log[t.id+"|"+x];if(g&&g.st==="done")n++}return n<(t.wk||3)}
const findT=id=>S.tasks.find(t=>t.id===id);
const itemOf=id=>{const t=findT(id);if(!t)return null;const d=t.rep==="none"&&t.date<today()?t.date:today();return itemsOn(d).find(i=>i.id===id)||null};
function hDone(id){const t=findT(id);if(!t)return;
  if(t.rep==="none"){t.st="done";t.date=t.date<today()?today():t.date;t.e=nowM();save()}
  else{const it=itemOf(id);if(it)setI(it,{st:"done",e:nowM()})}
  render();toast("عاشت ايدك ✓");
  const F=itemsOn(today()).filter(i=>i.rep!=="none");if(t.rep!=="none"&&F.length&&F.every(i=>i.st==="done"))btReact("party","سويت كل ثوابتك اليوم، الله يتقبّل",9000);else btDone()}
document.addEventListener("click",e=>{if(ORG()||e.target.closest("#sheet"))return;
  const q=s=>e.target.closest(s);let b;
  if(q("[data-hseen]")){S.cfg.hSeen=1;save();render();return}
  if(q("[data-hdemo]"))return $("#demo").click();
  if(b=q("[data-hfold]")){const k=b.dataset.hfold;hOpen=hOpen===k?"":k;render();return}
  if(b=q("[data-hok]")){const it=itemOf(b.dataset.hok);if(!it)return;if(it.st==="done"){setI(it,{st:"todo",s:null,e:null});render()}else hDone(it.id);return}
  if(b=q("[data-hdo]"))return hDone(b.dataset.hdo);
  if(b=q("[data-hlater]")){const n=rasList().length;if(n<2)return toast("ما عندك غيرها براسك");hSkip.add(b.dataset.hlater);render();return}
  if(b=q("[data-hdel]")){const t=findT(b.dataset.hdel);if(!t)return;const i=S.tasks.indexOf(t);S.tasks.splice(i,1);save();render();toast("انشالت");return}
  if(b=q("[data-hid]")){const it=itemOf(b.dataset.hid);if(it)hSheet(it)}},true);
// ورقة الشغلة: الاسم، الملاحظة، الخانة، سويتها / شيلها. الساعة والدقيقة بس للموعد.
function hSheet(it){const t=it.t,k=kindOf(t),T=today();
  const dd=[...Array(4)].map((_,j)=>add(T,j));
  show(`<div class="row hhead"><h3 id="hT">${esc(t.title)}</h3><button class="pill" id="hEd" style="flex:none">تعديل</button></div>
  ${k==="ras"&&ageOf(t)>0?`<p class="meta">براسك ${ageTxt(ageOf(t))}</p>`:k==="fix"?`<p class="meta">${REP[t.rep]}${t.rep==="wk"?` · ${arN(t.wk||3)} مرات`:""}</p>`:""}
  <textarea class="ta" id="tnote" maxlength="2000" style="min-height:70px;line-height:1.7" placeholder="ملاحظة (اختياري)">${esc(t.note||"")}</textarea>
  <div class="sec"><h4>بأي خانة؟</h4>${sseg(KIND.map(([v,l])=>`<button class="pill" data-hk="${v}" aria-pressed="${k===v}">${l}</button>`))}</div>
  ${k==="fix"?fixOpts(t.rep,t.wk||3):""}
  ${k==="app"?`<div class="sec"><h4>شوكت؟</h4><div class="row" style="flex-wrap:wrap;gap:6px">${dd.map(d=>`<button class="pill" data-hd="${d}" aria-pressed="${t.date===d}">${dayName(d)}</button>`).join("")}</div>
    <input type="time" class="inp htime" id="hTm" value="${pad(t.hour)}:${pad(t.min||0)}">
    <div style="margin-top:8px">${sswi("bell",`ذكّرني قبل ${arN(S.cfg.remind||10)} دقايق`,t.remind!==false,'data-hrem')}</div></div>`:""}
  ${window.YawmiAndroid&&YawmiAndroid.openZyara?duaSec(it):""}
  <div class="hbtns">${it.st==="done"?`<button class="hp" id="hUn">رجّعها، ما سويتها</button>`:`<button class="hp w" id="hDo">سويتها</button>`}<button class="hp" id="hDel">شيلها</button></div>
  <button class="close" data-x>سكّر</button>`);
  const re=()=>{const n=itemOf(t.id);if(n){const y=sheet.scrollTop;hSheet(n);sheet.scrollTop=y}};
  {const n=$("#tnote");n.oninput=()=>{t.note=n.value.slice(0,2000)||undefined;save()}}
  $("#hEd").onclick=()=>{$("#hT").outerHTML=`<input class="inp" id="tt" maxlength="80" style="min-width:0;flex:1" value="${esc(t.title)}">`;$("#hEd").textContent="احفظ";const i=$("#tt");i.focus();i.select();
    const go=()=>{const v=i.value.trim();if(!v)return i.focus();t.title=v.slice(0,80);save();render();re();toast("انحفظ ✓")};$("#hEd").onclick=go;i.onkeydown=ev=>{if(ev.key==="Enter")go()}};
  {const tm=$("#hTm");if(tm)tm.onchange=()=>{const m=/^(\d\d):(\d\d)$/.exec(tm.value);if(!m)return;t.hour=+m[1];t.min=+m[2]||null;save();render()}}
  $("#hDel").onclick=()=>{S.tasks=S.tasks.filter(x=>x.id!==t.id);save();hide();render();toast("انشالت")};
  {const d=$("#hDo");if(d)d.onclick=()=>{hide();hDone(t.id)}}
  {const u=$("#hUn");if(u)u.onclick=()=>{if(t.rep==="none"){t.st="todo";t.e=undefined;save()}else setI(it,{st:"todo",s:null,e:null});hide();render()}}
  sheet.onclick=e=>{const q=s=>e.target.closest(s);let b;
    if(b=q("[data-hk]")){const v=b.dataset.hk;if(v===k)return;
      if(v==="ras"){t.rep="none";t.hour=null;t.min=undefined;if(t.date<T)t.date=T}
      if(v==="fix"){t.rep="daily";t.date=T;t.st="todo"}
      if(v==="app"){t.rep="none";if(t.date<T)t.date=T;if(t.hour==null){t.hour=(nowH()+1)%24;t.min=undefined}}
      save();render();re();return}
    if(b=q("[data-hrep]")){t.rep=b.dataset.hrep;if(t.rep==="wk"&&!t.wk)t.wk=3;save();render();re();return}
    if(b=q("[data-hwk]")){t.wk=Math.max(1,Math.min(6,(t.wk||3)+ +b.dataset.hwk));save();render();re();return}
    if(b=q("[data-hd]")){t.date=b.dataset.hd;save();render();re();return}
    if(q("[data-hrem]")){t.remind=t.remind===false;if(t.remind)askNotif();save();render();re();return}
    const dq=q("[data-dua]");if(dq){t.dua=dq.dataset.dua||undefined;save();re();return}
    const dg=q("[data-dgo]");if(dg){openDua(duaOf(it),dg.dataset.dgo==="play");return}}}
const fixOpts=(rep,wk)=>`<div class="sec"><h4>شكد تتكرر؟</h4><div class="row" style="flex-wrap:wrap;gap:6px">${[["daily","كل يوم"],["work","أيام الدوام"],["wk","كم مرة بالأسبوع"]].map(([v,l])=>`<button class="pill" data-hrep="${v}" aria-pressed="${rep===v}">${l}</button>`).join("")}</div>
  ${rep==="wk"?`<div class="row hctr"><span class="meta">بالأسبوع</span><button class="pill" data-hwk="-1" aria-label="أقل">−</button><b class="n">${wk}</b><button class="pill" data-hwk="1" aria-label="أكثر">+</button></div>`:""}</div>`;
// ورقة «ضيف»: براسي (المختار من البداية) / ثابت / موعد
function hAdd(o={}){const T=today(),st={kind:o.kind||"ras",day:o.day&&o.day>T?o.day:T,rep:"daily",wk:3,ap:null,hr:null,rem:true,text:o.text||""};
  const nh=(nowH()+1)%24;
  const draw=()=>{const k=st.kind,dd=[...Array(4)].map((_,j)=>add(T,j));
    show(`<h3>شنو براسك؟</h3>
    <div class="hinp"><textarea class="ta" id="ta" placeholder="مثلاً: أجيب فواكه">${esc(st.text)}</textarea>${SR?`<button class="hmic" id="talk" aria-label="احچيها">${HI.mic}</button>`:""}</div>
    ${sseg(KIND.map(([v,l])=>`<button class="pill" data-ak="${v}" aria-pressed="${k===v}">${l}</button>`))}
    ${k==="ras"?sseg([[T,"اليوم"],[add(T,1),"باچر"]].map(([d,l])=>`<button class="pill" data-ad="${d}" aria-pressed="${st.day===d}">${l}</button>`)):""}
    ${k==="fix"?fixOpts(st.rep,st.wk)+`<div class="sec"><h4>ساعة تقريبية (اختياري)</h4><div class="row" style="flex-wrap:wrap;gap:6px">${[[8,"الصبح"],[13,"الظهر"],[18,"المسا"]].map(([h,l])=>`<button class="pill" data-ahr="${h}" aria-pressed="${st.hr===h}">${l}</button>`).join("")}</div></div>`:""}
    ${k==="app"?`<div class="sec"><h4>شوكت؟</h4><div class="row" style="flex-wrap:wrap;gap:6px">${dd.map(d=>`<button class="pill" data-ad="${d}" aria-pressed="${st.day===d}">${dayName(d)}</button>`).join("")}</div>
      <input type="time" class="inp htime" id="hTm" value="${st.ap||pad(nh)+":00"}">
      <div style="margin-top:8px">${sswi("bell",`ذكّرني قبل ${arN(S.cfg.remind||10)} دقايق`,st.rem,'data-arem')}</div></div>`:""}
    <button class="hp w big" id="sv">حفظ</button>`);
    const ta=$("#ta");ta.oninput=()=>{st.text=ta.value};if(!o.voice)setTimeout(()=>ta.focus(),60);
    {const tm=$("#hTm");if(tm)tm.onchange=()=>{st.ap=tm.value}}
    $("#sv").onclick=save_;
    const tk=$("#talk");if(tk)tk.onclick=()=>{if(rec){stopMic();tk.classList.remove("on");return}
      try{rec=new SR();rec.lang="ar-IQ";rec.continuous=true;
        rec.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal){ta.value=(ta.value?ta.value.replace(/\s*$/,"")+"\n":"")+e.results[i][0].transcript.trim();st.text=ta.value}};
        rec.onerror=()=>{stopMic();tk.classList.remove("on");toast("ما گدرت أسمعك هنا، اكتبها")};rec.onend=()=>{rec=null;tk.classList.remove("on")};rec.start();tk.classList.add("on")}catch(e){toast("ما گدرت أسمعك هنا، اكتبها")}};
    if(o.voice&&tk){o.voice=false;tk.click()}
    sheet.onclick=e=>{const q=s=>e.target.closest(s);let b;
      if(b=q("[data-ak]")){st.kind=b.dataset.ak;if(st.kind==="ras"&&st.day>add(T,1))st.day=T;draw();return}
      if(b=q("[data-ad]")){st.day=b.dataset.ad;draw();return}
      if(b=q("[data-hrep]")){st.rep=b.dataset.hrep;draw();return}
      if(b=q("[data-hwk]")){st.wk=Math.max(1,Math.min(6,st.wk+ +b.dataset.hwk));draw();return}
      if(b=q("[data-ahr]")){const h=+b.dataset.ahr;st.hr=st.hr===h?null:h;draw();return}
      if(q("[data-arem]")){st.rem=!st.rem;draw();return}}};
  const save_=()=>{const L=st.text.split(/\n|،/).map(x=>x.trim()).filter(Boolean);if(!L.length)return $("#ta").focus();
    clearDemo();const k=st.kind;let hr=null,mn;
    if(k==="app"){const m=/^(\d\d):(\d\d)$/.exec(st.ap||pad(nh)+":00");hr=+m[1];mn=+m[2]||undefined}
    L.forEach(x=>{const t={id:uid(),title:x.slice(0,80),date:k==="fix"?T:st.day,hour:k==="app"?hr:k==="fix"?st.hr:null,rep:k==="fix"?st.rep:"none",remind:k==="app"?st.rem:true,st:"todo"};
      if(k==="app"&&mn)t.min=mn;if(k==="fix"&&st.rep==="wk")t.wk=st.wk;S.tasks.push(t)});
    if(k==="app"&&st.rem)askNotif();
    stopMic();save();hide();hOpen=k==="ras"?hOpen:k;render();
    toast(k==="ras"?`✓ ${L.length>1?arN(L.length)+" شغلات":L[0].slice(0,30)}، براسك${st.day!==T?" باچر":""}`:k==="fix"?"انضافت لثوابتك ✓":`انحط الموعد ${dayName(st.day)} الساعة ${hm12(hr*60+(mn||0))} ✓`)};
  draw()}
/* ---------- تذكير قبل المهمة (إشعار بالجهاز، والتلي يذكّر من السيرفر) ---------- */
const fired=new Set();
setInterval(()=>{const m=nowM(),r=S.cfg.remind;
  if(r)itemsOn(today()).forEach(i=>{if(i.remind&&i.st==="todo"&&i.hour!=null){const st=i.hour*60+(i.em||0),k=i.id+today();if(!fired.has(k)&&m>=st-r&&m<st){fired.add(k);const msg=`بعد ${st-m} دقايق: ${i.title}`;toast(msg);
    try{if("Notification"in window&&Notification.permission==="granted")new Notification("يومي",{body:msg,icon:"icon-192.png",tag:k})}catch(e){}}}});
  {const pr=pcfg().rem;if(pr)prayOn(today()).forEach(p=>{const k="p"+p.k+today();if(!fired.has(k)&&m>=p.m-pr&&m<p.m){fired.add(k);const msg=`بعد ${p.m-m} دقايق أذان ${p.n}`;toast(msg);
    try{if("Notification"in window&&Notification.permission==="granted")new Notification("يومي",{body:msg,icon:"icon-192.png",tag:k})}catch(e){}}})}
  if(S.cfg.theme==="auto")applyTheme();
  if(scrim.hidden)render()},30000);
/* ---------- بارات (الشخصية بالكارت الأسود) ---------- */
const BSAY={happy:["مهمة منجزة ✓ عاشت ايدك","هيچ أريدك! الإيقاع صح ♪","وحدة راحت، يلا الثانية"],calm:["النظام شغّال… خذ راحتك","وحدة وحدة، ما مستعجلين","رتّب يومك بهدوء"],
 focus:["ركّز… آني ساكت","وضع التركيز شغّال","يلا، آني وياك"],playful:["هههه دغدغة مو مسموحة 😆","أنا اللوكو، بس أرقص 😜"],
 angry:["خطأ: الساعة راحت! 😤","گلت راح أسويها… وما سويتها!"],sad:["ما لحگناها… باچر نعوضها","البطارية واطية… بس أنا وياك"],
 sleepy:["وضع السكون… Zzz","رتّب باچر قبل لا تنام"],party:["١٠٠٪! خلصت كل اليوم 🎉","ولا مهمة باقية! فخور بيك"]};
let btLine="",btT,btHold=0,btLast="",btTaps=[];
const btLv=()=>S.cfg.btl??Barat.levelOf(streak());
const btPick=k=>{const p=BSAY[k].filter(x=>x!==btLast);const v=p[Math.floor(Math.random()*p.length)]||BSAY[k][0];btLast=v;return v};
function btType(t){btLine=t;clearInterval(btT);let n=0;btT=setInterval(()=>{n++;const e=$("#bsay");if(e)e.textContent=t.slice(0,n);if(n>=t.length)clearInterval(btT)},28)}
function btBase(){const h=nowH(),A=itemsOn(today());if(h>=23||h<5)return["sleepy"];if(A.length&&A.every(i=>i.st==="done"))return["party"];
  if(A.some(i=>i.st==="doing"))return["focus"];const late=A.filter(i=>state(i)==="late").length;
  if(late>=2)return["angry",`${late} مهام راحت ساعتها! 😤 رتّبها`];if(late===1)return["sad","وحدة راحت ساعتها… نلحگها؟"];
  if(!A.length)return["calm","السلة فاضية. شنو عندك اليوم؟"];return[h<11?"calm":A.some(i=>i.st==="done")?"happy":"calm"]}
function btSync(){if(Date.now()<btHold)return;const [k,l]=btBase();if(k!==BT.md||!btLine){BT.mood(k);btType(l||btPick(k))}}
function btReact(k,line,ms=6000){if(!BT)return;btHold=Date.now()+ms;BT.mood(k);btType(line||btPick(k));setTimeout(btSync,ms+60)}
function btDone(){const A=itemsOn(today());if(A.length&&A.every(i=>i.st==="done"))btReact("party",null,9000);else btReact("happy")}
// المرحلة: تكبر ويا السلسلة. إذا انكسرت السلسلة (البارحة بيها مهام وما خلصت) يرجع مرحلة وحدة بس، مو للبداية.
function btLevel(){const sk=streak(),t=today(),c=S.cfg,top=Barat.levelOf(sk);let l=c.btl,ch=false;
  if(l==null){l=top;ch=true}
  if(c.btd&&c.btd<t){const a=itemsOn(add(t,-1));if(a.length&&!a.every(i=>i.st==="done")&&top<l)l--}
  if(c.btd!==t){c.btd=t;ch=true}
  const up=top>l;if(up)l=top;
  if(l!==c.btl){c.btl=l;ch=true}if(ch)save();
  if(l!==BT.lv)BT.level(l);
  if(up&&!WS)btReact("party",`تطوّرت! صرت «${Barat.LV[l].n}» 🥳`,9000)}
function btAfter(){const e=$("#bsay");if(e)e.textContent=btLine;btLevel();btSync()}
function btSheet(){const sk=streak(),l=btLv(),cur=Barat.LV[l],nx=Barat.LV[l+1],left=nx?Math.max(0,nx.min-sk):0;
  show(`<h3>ILO · ${cur.n}</h3><p class="meta">سلسلتك ${sk} ${sk===1?"يوم":"أيام"} ورا بعض. كل ما تخلص كل مهام يومك يكبر وياك.</p>
  <svg class="btbig" id="btBig"></svg>
  ${nx?`<div><p class="meta" style="margin-bottom:6px">باقي ${left} ${left===1?"يوم":"أيام"} ويصير «${nx.n}»</p><div class="prog"><i style="width:${Math.max(0,Math.min(100,Math.round((sk-cur.min)/(nx.min-cur.min)*100)))}%"></i></div></div>`:`<p class="why">وصلت لآخر مرحلة. ILO ذهبي كامل ✨</p>`}
  <div class="big">${Barat.LV.map((v,i)=>`<div class="lvrow ${i>l?"lock":""} ${i===l?"cur":""}"><svg id="lvm${i}"></svg><span><b>${i+1}. ${v.n}</b><small>${v.min?"من "+v.min+" يوم":"من البداية"} · ${v.d}</small></span></div>`).join("")}</div>
  <p class="meta" style="text-align:center">إذا انكسرت السلسلة يرجع خطوة لورا، مو للبداية.</p><button class="close" data-x>سكّر</button>`);
  const big=Barat.mount($("#btBig"),{level:l});big.mood(BT.md==="sleepy"?"sleepy":"happy");
  Barat.LV.forEach((v,i)=>Barat.mount($("#lvm"+i),{level:i}).mood(i<=l?"happy":"sleepy"));
  $("#btBig").onclick=()=>{const t=Date.now();btTaps=btTaps.filter(x=>t-x<2500);btTaps.push(t);
    if(btTaps.length>=5){big.mood("angry");toast("بس عاد! نظامي انضرب 😠");setTimeout(()=>big.mood("calm"),3000)}else big.mood(btTaps.length>=3?"playful":"happy")};
}
if(window.Barat&&$("#bt")){
  BT=Barat.mount($("#bt"),{level:btLv()});
  $("#btBtn").onclick=btSheet;
  addEventListener("pointermove",e=>{const r=$("#bt").getBoundingClientRect();BT.look(Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/300)),Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height*.25))/300)))});
  setInterval(()=>BT.blink(),3900);
}
/* ---------- ترحيب ILO (يطلع لما تفتح التطبيق، مرة الصبح ومرة المسا) ---------- */
function intro(){
  if(WS||!urlDone||!window.Barat)return;
  try{if(localStorage.getItem("yawmi-nointro"))return}catch(e){} // للفحوصات بس
  // مرتين باليوم بالأكثر: مرة الصبح (٥ الفجر لـ ٢ الظهر) ومرة العصر والليل. ويطلع بس لما التطبيق ينفتح من جديد، مو لما ترجعله وهو مفتوح.
  {const h=nowH(),k=(h<5?add(today(),-1):today())+(h>=5&&h<14?"am":"pm");if(S.cfg.inK===k)return;S.cfg.inK=k;delete S.cfg.inAt;save()}
  const st=document.createElement("style");st.textContent=`.intro{position:fixed;inset:0;z-index:80;background:var(--wall);background-color:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px 16px;text-align:center;transition:opacity .55s,transform .55s}
.intro.out{opacity:0;transform:scale(1.04);pointer-events:none}.in-bt{width:170px;height:200px}
.intro h2{font-family:var(--num);font-size:26px;font-weight:500;line-height:1.3;min-height:34px;color:var(--fg)}
.intro .in-p{font-size:15px;color:var(--f2);max-width:340px;min-height:44px;line-height:1.5}
.in-go{min-height:48px;padding:12px 28px;border-radius:24px;border:1px solid var(--fg);background:var(--fg);color:var(--inv);font:inherit;font-size:15px;font-weight:500;opacity:0;transition:opacity .5s}
.in-go.on{opacity:1}
.in-skip{position:absolute;top:calc(14px + env(safe-area-inset-top));left:14px;min-height:44px;padding:8px 14px;border:0;background:none;color:var(--f2);font:inherit;font-size:14px}`;document.head.appendChild(st);
  const el=document.createElement("div");el.className="intro";el.setAttribute("role","dialog");el.setAttribute("aria-label","هلا بيك");
  el.innerHTML=`<button class="in-skip" id="inSkip">تخطّي</button><svg class="in-bt" id="inBt"></svg>
  <div><h2 id="inH"></h2><p class="in-p" id="inP"></p></div><button class="in-go" id="inGo">يلا نبدي</button>`;
  document.body.appendChild(el);
  const nm=S.cfg.name?" "+S.cfg.name:"";
  const IB=Barat.mount(el.querySelector("#inBt"),{level:btLv()});IB.mood("sleepy");
  const H=nowH(),A=itemsOn(today()),left=A.filter(i=>i.st!=="done"),c=left.filter(i=>i.hour!=null).sort((a,b)=>ms(a)-ms(b)),nx=c.find(i=>i.hour>=H)||null;
  const g=(H>=23||H<5?`هلا${nm}، بعدك صاحي؟`:H<12?`صباح الخير${nm}`:H<17?`هلا${nm}، نهارك سعيد`:`مسا الخير${nm}`)+(di(today())===6?"، جمعة مباركة":"");
  const p=!A.length?"يومك فاضي. شنو عندك اليوم؟":!left.length?"خلصت كل مهام اليوم. عاشت ايدك!":
    `عندك اليوم ${arN(left.length)} ${left.length===1?"مهمة":left.length<=10?"مهام":"مهمة"}`+(nx?`، الجاية الساعة ${arN(nx.hour%12||12)} ${nx.title}`:"")+".";
  let done=false,auto,ivs=[];
  const typeIn=(e,t,sp,cb)=>{let n=0;const iv=setInterval(()=>{n++;e.textContent=t.slice(0,n);if(n>=t.length){clearInterval(iv);cb&&cb()}},sp);ivs.push(iv)};
  const go=()=>{if(done)return;done=true;ivs.forEach(clearInterval);clearTimeout(auto);el.classList.add("out");setTimeout(()=>{el.remove();st.remove()},600);
    btReact("happy","يلا، آني وياك ♪",5000)};
  const arm=ms=>{clearTimeout(auto);auto=setTimeout(go,ms)};
  el.querySelector("#inSkip").onclick=go;el.querySelector("#inGo").onclick=go;
  setTimeout(()=>{if(done)return;IB.mood(H>=23||H<5?"calm":"happy");
    typeIn(el.querySelector("#inH"),g,45,()=>typeIn(el.querySelector("#inP"),p,26,()=>{el.querySelector("#inGo").classList.add("on");arm(7000)}))},650);
  arm(20000)}
/* ---------- شريط «شنو يشتغل هسه» (صوت الزيارات بالـAPK) ---------- */
{const A=window.YawmiAndroid;if(A&&typeof A.nowPlaying==="function"){
  const st=document.createElement("style");st.textContent=`.np{position:fixed;left:50%;transform:translateX(-50%);z-index:19;display:flex;align-items:center;gap:8px;padding:8px;border-radius:24px;background:var(--card);box-shadow:var(--sh),var(--sh-in);width:min(440px,calc(100vw - 32px))}
.np[hidden],.np-b[hidden]{display:none}.np-t{flex:1;min-width:0;display:flex;align-items:center;gap:10px;padding:2px 8px;text-align:start}
.np-t b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.np-t small{display:block;font-size:11px;color:var(--muted)}
.np-b{width:40px;height:40px;border-radius:15px;display:grid;place-items:center;background:var(--bg);box-shadow:var(--sh-sm);flex:none}.np-b.pl{background:var(--gold);color:#2B2620}.np-b svg{width:18px;height:18px}
.np .eq{display:flex;gap:3px;align-items:flex-end;height:18px;flex:none}.np .eq i{width:3px;height:6px;border-radius:2px;background:var(--gold)}
.np.on .eq i{animation:npq .9s infinite ease-in-out}.np .eq i:nth-child(2){animation-delay:.2s}.np .eq i:nth-child(3){animation-delay:.4s}@keyframes npq{50%{height:18px}}
.np-a{border:0;background:none;padding:0;margin-inline-start:6px;font:inherit;font-size:11px;color:var(--gold);text-decoration:underline}
body.np-on{padding-bottom:196px}`;document.head.appendChild(st);
  const PL=`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>`,PA=`<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4.5" height="16" rx="1.5"/><rect x="13.5" y="4" width="4.5" height="16" rx="1.5"/></svg>`;
  const NX=`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 5l9 7-9 7z"/><rect x="15.5" y="5" width="3.5" height="14" rx="1.2"/></svg>`;
  const el=document.createElement("div");el.className="np";el.hidden=true;el.setAttribute("role","region");el.setAttribute("aria-label","شنو يشتغل هسه");
  el.innerHTML=`<div class="np-t" id="npOpen" role="button" tabindex="0"><span class="eq"><i></i><i></i><i></i></span><span style="min-width:0"><b id="npT"></b><small><span id="npS"></span></small></span></div><button class="np-b" id="npN" aria-label="اللي بعدها" hidden>${NX}</button><button class="np-b" id="npR" aria-label="السرعة" hidden style="font-size:13px;font-weight:800"></button><button class="np-b pl" id="npP"></button><button class="np-b" id="npX" aria-label="سكّرها">${I.del}</button>`;
  document.body.appendChild(el);
  const tick=()=>{if(document.visibilityState!=="visible")return;let d=null;try{const s=A.nowPlaying();d=s?JSON.parse(s):null}catch(e){}
    el.hidden=!d;document.body.classList.toggle("np-on",!!d);if(!d)return;
    const dk=$(".dock");el.style.bottom=((dk?dk.offsetHeight:90)+26)+"px";
    $("#npT").textContent=d.title||"زيارة";$("#npS").textContent=d.playing?"تشتغل هسه":d.ended?"خلصت":"واگفة";
    {const n=$("#npN");n.hidden=!(typeof A.zyaraNext==="function"&&d.next);if(d.next)n.title="بعدها: "+d.next}
    {let a=$("#npA");const can=typeof A.zyaraAuto==="function"&&"auto"in d;if(!can){if(a)a.remove()}else{if(!a){a=document.createElement("button");a.id="npA";a.className="np-a";$("#npS").after(a);
      a.onclick=e=>{e.stopPropagation();try{A.zyaraAuto(a.dataset.on!=="1")}catch(x){}setTimeout(tick,250)}}
      a.dataset.on=d.auto?"1":"0";a.textContent=d.auto?"بعدها: تكمّل":"بعدها: توگف"}}
    {const r=$("#npR");r.hidden=typeof A.zyaraSpeed!=="function";r.textContent="×"+(d.rate||1)}
    el.classList.toggle("on",!!d.playing);const p=$("#npP");p.innerHTML=d.playing?PA:PL;p.setAttribute("aria-label",d.playing?"وگّفها":"شغّلها")};
  $("#npOpen").onclick=()=>{try{A.openZyara(isEve()?"dark":"light")}catch(e){}};
  $("#npP").onclick=()=>{try{A.zyaraToggle()}catch(e){}setTimeout(tick,250)};
  $("#npR").onclick=()=>{try{A.zyaraSpeed()}catch(e){}setTimeout(tick,250)};
  $("#npN").onclick=()=>{try{A.zyaraNext()}catch(e){}setTimeout(tick,250)};
  $("#npX").onclick=()=>{try{A.zyaraStop()}catch(e){}setTimeout(tick,250)};
  document.addEventListener("visibilitychange",tick);setInterval(tick,2000);tick()}}
applyTheme();render();intro();
if(!sb)setTimeout(urlOpen,300);
})();
