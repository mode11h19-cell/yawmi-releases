/* «يومي»: المايك (8-reset-mic §3 و§4).
   السماع: بالـAPK 1.18 من الجسر (YawmiAndroid.listenLive، بلا نافذة جوجل، وبيه قوة الصوت).
   بالـAPK الأقدم: listen() القديم (نافذة جوجل). بالمتصفح: webkitSpeechRecognition.
   الزر: دوسة = يسمع ويوقف وحده لما تسكت. ضغطة وتثبيت (أكثر من 250ms) = يسمع وانت ضاغط، تشيل إصبعك ينضاف. تسحب أكثر من 60px يتلغى. */
(function(){
const $=s=>document.querySelector(s);
const YM=()=>window.YM||{haptic(){},calm:()=>true,CK:""};
const MIC=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>`;

/* السامع: start(h) و stop(). h = {part(t), final(t), rms(v 0..1), end(), err(why)} */
let HH;function hearer(){return HH!==undefined?HH:(HH=mk())}
function mk(){const A=window.YawmiAndroid;
  if(A&&typeof A.listenLive==="function"){let h=null;
    window.onYawmiMic=s=>{if(!h)return;let m;try{m=typeof s==="string"?JSON.parse(s):s}catch(e){return}
      if(m.k==="rms")h.rms&&h.rms(Math.max(0,Math.min(1,(m.v+2)/12)));else if(m.k==="part")h.part&&h.part(m.t||"");
      else if(m.k==="final"){const x=h;x.final&&x.final(m.t||"")}else if(m.k==="err"){const x=h;h=null;x.err&&x.err(m.t||"")}else if(m.k==="end"){const x=h;h=null;x.end&&x.end()}};
    return {live:true,start(x,hold){h=x;try{A.listenLive("ar-IQ",!!hold)}catch(e){h=null;x.err&&x.err("")}},stop(){try{A.stopListen()}catch(e){}},cancel(){h=null;try{A.cancelListen?A.cancelListen():A.stopListen()}catch(e){}}}}
  if(A&&typeof A.listen==="function"){let h=null;const prev=window.onYawmiHeard;
    return {live:false,start(x){h=x;window.onYawmiHeard=(t,err)=>{const y=h;h=null;window.onYawmiHeard=prev;if(!y)return;if(t){y.final&&y.final(String(t))}else y.err&&y.err(err?"":"");y.end&&y.end()};try{A.listen("ar-IQ")}catch(e){h=null;x.err&&x.err("")}},stop(){},cancel(){h=null}}}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return null;
  let r=null;return {live:true,start(x,hold){try{r=new SR();r.lang="ar-IQ";r.interimResults=true;r.continuous=!!hold;
      r.onresult=e=>{let f="",p="";for(let i=0;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)f+=t;else p+=t}x.part&&x.part((f+p).trim());if(f&&!hold)x.final&&x.final(f.trim())};
      r.onerror=ev=>{x.err&&x.err(ev&&ev.error||"")};r.onend=()=>{r=null;x.end&&x.end()};r.start()}catch(e){x.err&&x.err("")}},
    stop(){try{r&&r.stop()}catch(e){}},cancel(){const y=r;r=null;try{y&&y.abort()}catch(e){}}}}

/* الزر جنب الشريط السفلي، والحركة */
function init(o){const H=hearer();if(!H||$(".y-micb"))return null;
  const b=document.createElement("button");b.className="y-micb";b.setAttribute("aria-label","احچي وضيف");
  b.innerHTML=`<span class="mi">${MIC}</span><span class="lv">${"<i></i>".repeat(22)}</span>${YM().CK}`;
  const rip=document.createElement("span");rip.className="y-rip";const dim=document.createElement("div");dim.className="y-dim";const said=document.createElement("div");said.className="y-said";said.setAttribute("aria-live","polite");
  document.body.append(dim,said,rip,b);document.body.classList.add("y-has-mic");
  const bars=[...b.querySelectorAll(".lv i")];
  // مكانه: يسار الشريط السفلي، بنفس طوله
  const place=()=>{const d=$(".dock");if(!d||document.body.classList.contains("y-mic-on"))return;const r=d.getBoundingClientRect();
    const left=Math.max(8,r.left-56-10);b.style.left=left+"px";b.style.bottom=(innerHeight-r.bottom+(r.height-56)/2)+"px";rip.style.left=left+"px";rip.style.bottom=b.style.bottom;
    b.hidden=rip.hidden=!document.body.classList.contains("hassa")};
  addEventListener("resize",place);setInterval(place,1500);place();requestAnimationFrame(()=>requestAnimationFrame(place));setTimeout(place,300);
  let state="",level=0,raf=0,text="",held=false,cancel=false,t0=0,x0=0,holdT=null,wordsShown=0,endT=null;
  const glowOn=on=>{try{YM().glow(on)}catch(e){}};
  const anim=()=>{const t=performance.now()/1000;bars.forEach((x,i)=>{const e=H.live&&level>0?level*(.55+.45*Math.abs(Math.sin(t*9+i*.9))):Math.abs(Math.sin(t*7+i*.7))*Math.abs(Math.sin(t*2.3+i*.3))*.8;x.style.height=(4+e*22)+"px"});raf=requestAnimationFrame(anim)};
  const showWords=t=>{const ws=t.split(/\s+/).filter(Boolean);if(ws.length<wordsShown){said.querySelectorAll("span").forEach(s=>s.remove());wordsShown=0}
    const sp=[...said.querySelectorAll("span")];ws.forEach((w,i)=>{if(i<sp.length){sp[i].textContent=w+" ";return}const s=document.createElement("span");s.textContent=w+" ";said.appendChild(s);requestAnimationFrame(()=>requestAnimationFrame(()=>s.classList.add("in")))});wordsShown=ws.length};
  const hint=(t,x)=>{let h=said.querySelector("small");if(!h){h=document.createElement("small");said.prepend(h)}h.textContent=t;h.classList.toggle("x",!!x)};
  function start(hold){if(state)return;state="on";held=hold;cancel=false;text="";wordsShown=0;level=0;YM().haptic(12);
    rip.classList.remove("go");void rip.offsetWidth;rip.classList.add("go");said.innerHTML="";
    setTimeout(()=>{if(state!=="on")return;document.body.classList.add("y-mic-on");glowOn(true);hint(hold?"يسمعك… ← اسحب للإلغاء":"يسمعك…");if(!YM().calm())anim()},YM().calm()?0:120);
    H.start({part:t=>{text=t;showWords(t)},final:t=>{text=t;showWords(t);if(!held)finish()},rms:v=>{level=level*.6+v*.4},
      err:()=>{if(state!=="on")return;if(text)return finish();reset();try{o.toast&&o.toast("ما گدرت أسمعك، جرّب مرة ثانية")}catch(e){}},
      end:()=>{if(state==="on"){if(text&&!cancel)finish();else reset()}}},hold);
    clearTimeout(endT);endT=setTimeout(()=>{if(state==="on")H.stop()},hold?60000:15000)}
  function reset(){cancelAnimationFrame(raf);clearTimeout(endT);state="";glowOn(false);document.body.classList.remove("y-mic-on","y-mic-ok");said.innerHTML="";place()}
  function finish(){if(state!=="on")return;state="ok";cancelAnimationFrame(raf);clearTimeout(endT);glowOn(false);H.stop();
    const t=text.trim();if(!t||cancel){YM().haptic(30);return reset()}
    document.body.classList.remove("y-mic-on");document.body.classList.add("y-mic-ok");YM().haptic([20,30,40]);place();
    const calm=YM().calm(),res=o.add(t)||{};
    if(calm){reset();return}
    // الجملة تصير كارت وتطير لأول القائمة
    setTimeout(()=>{const sr=said.getBoundingClientRect(),f=document.createElement("div");f.className="y-fly";f.textContent=t.length>60?t.slice(0,58)+"…":t;
      f.style.cssText=`left:18px;right:18px;top:${Math.max(60,sr.top)}px`;document.body.appendChild(f);said.innerHTML="";
      const to=res.target&&res.target();const r=to?to.getBoundingClientRect():{top:120,left:18,width:innerWidth-36};
      requestAnimationFrame(()=>{f.style.top=r.top+"px";f.style.left=r.left+"px";f.style.right=(innerWidth-r.left-r.width)+"px";f.style.background="var(--gl)";f.style.color="var(--fg)";f.style.opacity=".2"});
      setTimeout(()=>{f.remove();reset();res.done&&res.done()},650)},500)}
  b.onpointerdown=e=>{if(state==="on"&&!held){finish();return}if(state)return;t0=Date.now();x0=e.clientX;cancel=false;try{b.setPointerCapture(e.pointerId)}catch(x){}
    holdT=setTimeout(()=>start(true),250)};
  b.onpointermove=e=>{if(state!=="on"||!held)return;const dx=e.clientX-x0;const c=dx>60;if(c!==cancel){cancel=c;hint(c?"شيل إصبعك حتى يتلغى":"يسمعك… ← اسحب للإلغاء",c);YM().haptic(c?30:8)}};
  b.onpointerup=()=>{clearTimeout(holdT);if(state==="on"&&held){if(cancel){H.cancel();YM().haptic(30);reset()}else{held=false;if(text)finish();else{H.stop();setTimeout(()=>{if(state==="on")text?finish():reset()},1200)}}return}
    if(!state&&Date.now()-t0<250)start(false)};
  b.onpointercancel=()=>{clearTimeout(holdT);if(state==="on"&&held){H.cancel();reset()}};
  b.oncontextmenu=e=>e.preventDefault();
  return {place,hearer:H}}

window.YMic={init,hearer};
})();
