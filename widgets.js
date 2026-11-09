/* v1.26 الإعدادات «الودجتات» (docs/widgets/3-hide-widgets-delete-ziyara.md): كل ودجتات «يومي» بصورتها وحجمها ومفتاح.
   تطفيه = يختفي من قائمة ودجتات التلفون (Widgets.java يطفي الـreceiver). بياناته تبقى. بس بالتطبيق (YawmiWidgets).
   app.js: ${YW.btnHtml()} بآخر الإعدادات، وYW.wire(sheet,{show,toast}). */
(function(){
const B=()=>window.YawmiWidgets;
const $=(s,r)=>(r||document).querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ar=n=>String(n).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
const buzz=p=>{const m=window.YM;if(m)m.haptic(p);else try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const has=()=>!!(B()&&typeof B().list==="function");
function btnHtml(){return has()?`<button class="zd-nmb yw-b" id="ywB">الودجتات</button>`:""}
function list(){try{return JSON.parse(B().list())||[]}catch(e){return []}}
function rowHtml(w){return `<div class="yw-r" data-c="${esc(w.c)}"><img src="widgets/${esc(w.img)}.webp" alt="" loading="lazy">
  <div class="t"><b>${esc(w.n)}</b><small>${ar(w.w)}×${ar(w.h)}${w.placed?" · على شاشتك":""}</small></div>
  <button class="yw-s" role="switch" aria-pressed="${!!w.on}" aria-label="${esc(w.n)}"><span class="swi"></span></button></div>`}
function open(api){const L=list();
  api.show(`<h3>الودجتات</h3><p class="meta yw-m">تطفي ودجت يختفي من قائمة ودجتات التلفون، وعدّاداته تبقى.</p><div class="yw-l">${L.map(rowHtml).join("")}</div>
  <p class="meta yw-ask" id="ywAsk" hidden></p><button class="close" data-x>سكّر</button>`);
  const sh=$("#sheet");let ask=null;
  sh.querySelector(".yw-l").onclick=e=>{const s=e.target.closest(".yw-s");if(!s)return;const r=s.closest(".yw-r"),c=r.dataset.c,w=list().find(x=>x.c===c);if(!w)return;
    const on=s.getAttribute("aria-pressed")!=="true";
    // على الشاشة هسه: يسأل مرة وحدة
    if(!on&&w.placed&&ask!==c){ask=c;const a=$("#ywAsk",sh);a.textContent="هذا الودجت على شاشتك، إذا تطفيه ينشال منها. أكيد؟ دوس المفتاح مرة ثانية.";a.hidden=false;
      r.after(a);buzz(15);return}
    ask=null;$("#ywAsk",sh).hidden=true;
    let ok=false;try{ok=B().set(c,on)}catch(x){}
    if(ok){s.setAttribute("aria-pressed",String(on));buzz(8);api.toast(on?"رجع لقائمة الودجتات":"اختفى من قائمة الودجتات")}else api.toast("ما گدرت")}}
function wire(root,api){const b=$("#ywB",root);if(b)b.onclick=()=>open(api)}
window.YW={btnHtml,wire,open};
})();
