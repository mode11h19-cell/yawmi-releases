/* تصليح ٢٢ (٩ تشرين الثاني): «غلاف» التطبيق، بين الأقسام والتلفون. ينحمّل بعد cards.js وzad.js وقبل app.js.
   ١. التبويبات بالشريط (هسه · زاد · بطايقي) بنفس المستوى: من تبويب لتبويب يروح مباشرة، ما يمر بـ«هسه».
      كل تبويب يتذكر وين كان (leave/show)، وبالـhistory تبقى بس خطوات التبويب الحالي فوق «هسه». فرجوع التلفون:
      داخل التبويب خطوة خطوة، بعدين «هسه»، ومن «هسه» يطلع. «ضيف» و«هسه» يطلّعون من التبويب مثل قبل.
   ٢. شريط الساعة وشريط الإيماءات بالـAPK (v1.25+) يتبعون وضع التطبيق (data-theme)، فوراً ويا زر القمر.
   ٣. فتح صفحة مباشرة (١١-١١، ودجت زاد والتنبيهات: ?quran= ?zad= ?cards=): بأول تحميل index.html يحط html.deep فالرئيسية
      ما تبين ولا لحظة، وYS.shown يشيلها لما تنفتح الصفحة. وإذا التطبيق مفتوح MainActivity.onNewIntent ينادي YS.open
      فيروح للصفحة فوراً بلا إعادة تحميل. */
(function(){
const T=()=>({mZyara:window.YZ,mCards:window.YC});let navNext=null;
const on=()=>{const t=T();return Object.keys(t).find(k=>t[k]&&t[k].isOpen&&t[k].isOpen())};
// الرجوع اللي نسويه احنا هنا (مو زر الرجوع) يوصل لخطوة التبويب اللي طلعنا منه، وكل قسم يعوف خطوات غيره
addEventListener("popstate",()=>{if(!navNext)return;const f=navNext;navNext=null;f()});
document.addEventListener("click",e=>{const b=e.target.closest(".dock button"),from=on();if(!b||!from||b.id===from)return;
  const t=T(),A=t[from],C=t[b.id];if(!A.leave)return;const n=A.leave();
  if(C){e.stopPropagation();C.show();if(n>1){navNext=()=>C.hist(true);history.go(-(n-1))}else C.hist(true)}
  else if(n){navNext=()=>{};history.go(-n)}},true);
const R=document.documentElement,shown=()=>R.classList.remove("deep");
if(R.classList.contains("deep"))setTimeout(shown,2000); // إذا الصفحة ما انفتحت لأي سبب، الرئيسية ترجع
function openQs(qs){const P=new URLSearchParams(qs),t=P.has("cards")?"mCards":P.has("quran")||P.has("zad")?"mZyara":null;
  if(!t||!window.YZ||!window.YC||!window.YQ)return false;
  if(document.body.classList.contains("qr-lock"))return true; // وقت قراءة بقفل: يبقى عليه
  const from=on(),sw=from&&from!==t;if(sw){const b=document.getElementById(t);if(!b)return false;b.click()}
  setTimeout(()=>{if(P.has("cards"))YC.deep(P);else if(P.has("quran")){YQ.deep(P);if(P.has("qlock"))YQ.lock(true)}else YZ.deep(P)},sw?60:0);return true}
window.YS={open:openQs,shown};
const A=window.YawmiAndroid;
if(A&&typeof A.setBars==="function"){const r=document.documentElement,put=()=>{if(r.dataset.theme)try{A.setBars(r.dataset.theme==="dark")}catch(x){}};
  new MutationObserver(put).observe(r,{attributes:true,attributeFilter:["data-theme"]});put()}
})();
