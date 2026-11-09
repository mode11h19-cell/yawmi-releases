/* تصليح ٢٢ (٩ تشرين الثاني): «غلاف» التطبيق، بين الأقسام والتلفون. ينحمّل بعد cards.js وzad.js وقبل app.js.
   ١. التبويبات بالشريط (هسه · زاد · بطايقي) بنفس المستوى: من تبويب لتبويب يروح مباشرة، ما يمر بـ«هسه».
      كل تبويب يتذكر وين كان (leave/show)، وبالـhistory تبقى بس خطوات التبويب الحالي فوق «هسه». فرجوع التلفون:
      داخل التبويب خطوة خطوة، بعدين «هسه»، ومن «هسه» يطلع. «ضيف» و«هسه» يطلّعون من التبويب مثل قبل.
   ٢. شريط الساعة وشريط الإيماءات بالـAPK (v1.25+) يتبعون وضع التطبيق (data-theme)، فوراً ويا زر القمر. */
(function(){
const T=()=>({mZyara:window.YZ,mCards:window.YC});let navNext=null;
const on=()=>{const t=T();return Object.keys(t).find(k=>t[k]&&t[k].isOpen&&t[k].isOpen())};
// الرجوع اللي نسويه احنا هنا (مو زر الرجوع) يوصل لخطوة التبويب اللي طلعنا منه، وكل قسم يعوف خطوات غيره
addEventListener("popstate",()=>{if(!navNext)return;const f=navNext;navNext=null;f()});
document.addEventListener("click",e=>{const b=e.target.closest(".dock button"),from=on();if(!b||!from||b.id===from)return;
  const t=T(),A=t[from],C=t[b.id];if(!A.leave)return;const n=A.leave();
  if(C){e.stopPropagation();C.show();if(n>1){navNext=()=>C.hist(true);history.go(-(n-1))}else C.hist(true)}
  else if(n){navNext=()=>{};history.go(-n)}},true);
const A=window.YawmiAndroid;
if(A&&typeof A.setBars==="function"){const r=document.documentElement,put=()=>{if(r.dataset.theme)try{A.setBars(r.dataset.theme==="dark")}catch(x){}};
  new MutationObserver(put).observe(r,{attributes:true,attributeFilter:["data-theme"]});put()}
})();
