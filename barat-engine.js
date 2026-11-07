/* بارات · MYoumy mascot engine. Barat.mount(svgEl,{level}) -> {mood(k), level(i)}; Barat.LV levels; Barat.levelOf(streak) */
window.Barat=(()=>{
const LV=[
 {n:"بداية",min:0,bars:3,d:"٣ أشرطة، توه يتعلّم"},
 {n:"نشط",min:3,bars:5,d:"٥ أشرطة مثل اللوكو"},
 {n:"قوي",min:7,bars:5,halo:1,d:"هالة ذهبية تنبض وراه"},
 {n:"أسطورة",min:14,bars:7,halo:1,ring:1,d:"٧ أشرطة وحلقة تدور حوله"},
 {n:"ذهبي",min:30,bars:7,halo:1,ring:1,gold:1,d:"كله ذهب ولمعة"}];
const levelOf=s=>LV.reduce((a,l,i)=>s>=l.min?i:a,0);
const E={up:["M-26 2 Q-16 -10 -6 2","M6 2 Q16 -10 26 2"],flat:["M-24 0 H-8","M8 0 H24"],mad:["M-26 -8 L-7 1","M7 1 L26 -8"],
 sad:["M-26 2 L-7 -6","M7 -6 L26 2"],wink:["M-26 2 Q-16 -10 -6 2","M8 0 H24"],thin:["M-22 2 H-10","M10 2 H22"],star:["M-26 4 L-16 -8 L-6 4","M6 4 L16 -8 L26 4"],
 o:["M-16 -6 a6 6 0 1 0 0.01 0","M16 -6 a6 6 0 1 0 0.01 0"]};
const P={ // bar height by position t in [-1,1]
 happy:t=>40+34*t*t, calm:()=>34, playful:(t,k)=>k%2?36:62, angry:t=>80-40*t*t, sad:t=>16+10*t*t, sleepy:()=>12, party:(t,k)=>k%2?74:100, focus:t=>46-10*t*t};
const EY={happy:"up",calm:"flat",playful:"wink",angry:"mad",sad:"sad",sleepy:"thin",party:"star",focus:"o"};
let uid=0;
function mount(svg,o={}){
 const id="bt"+(++uid);let lv=o.level||0,md="calm";
 svg.setAttribute("viewBox","0 0 200 230");svg.classList.add("barat");
 svg.innerHTML=`<defs>
  <filter id="${id}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="${id}e" filterUnits="userSpaceOnUse" x="-50" y="-40" width="100" height="80"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="${id}s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
  <linearGradient id="${id}k" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--bt-fg,#fff)"/><stop offset="1" stop-color="var(--bt-fg,#fff)"/></linearGradient>
  <linearGradient id="${id}d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--bt-fg,#fff)"/><stop offset="1" stop-color="var(--bt-fg,#fff)"/></linearGradient>
  <linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1c1e"/><stop offset="1" stop-color="#050506"/></linearGradient>
  <radialGradient id="${id}h"><stop offset="0" stop-color="var(--bt-fg,#fff)" stop-opacity=".22"/><stop offset="1" stop-color="var(--bt-fg,#fff)" stop-opacity="0"/></radialGradient></defs>
 <ellipse class="bt-floor" cx="100" cy="214" rx="74" ry="9" fill="var(--bt-fg,#fff)" opacity=".2" filter="url(#${id}s)"/>
 <ellipse cx="100" cy="214" rx="64" ry="5" fill="var(--bt-fg,#fff)" opacity=".08"/>
 <circle class="bt-halo" cx="100" cy="130" r="96" fill="url(#${id}h)"/>
 <g class="bt-fx bt-conf">${[[24,"var(--bt-fg,#fff)",0],[58,"#8e8e93",.3],[100,"var(--bt-fg,#fff)",.6],[142,"#636366",.15],[176,"var(--bt-fg,#fff)",.45]].map(([x,c,d])=>`<rect x="${x}" y="6" width="6" height="12" rx="3" fill="${c}" style="animation-delay:${d}s"/>`).join("")}</g>
 <g class="bt-body">
  <g class="bt-ring"><ellipse class="bt-orb" cx="100" cy="150" rx="94" ry="20" fill="none" stroke="var(--bt-fg,#fff)" stroke-width="1.5" stroke-dasharray="36 12" opacity=".5"/><circle r="4" fill="var(--bt-fg,#fff)" filter="url(#${id}g)"><animateMotion dur="4s" repeatCount="indefinite" path="M6 150 a94 20 0 1 0 188 0 a94 20 0 1 0 -188 0"/></circle></g>
  <g class="bt-visor"><rect x="50" y="30" width="100" height="52" rx="26" fill="url(#${id}v)" stroke="var(--bt-line,rgba(255,255,255,.3))" stroke-width="1.5"/>
   <rect x="62" y="35" width="40" height="5" rx="2.5" fill="#fff" opacity=".08"/>
   <g class="bt-eyes" transform="translate(100 58)" filter="url(#${id}e)" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><g><path class="bt-e1"/><path class="bt-e2"/></g></g></g>
  <g class="bt-fx bt-tear" fill="var(--bt-fg,#fff)" filter="url(#${id}g)"><circle cx="76" cy="84" r="3.5"/></g>
  <g class="bt-fx bt-spark" stroke="var(--bt-red,#FF453A)" stroke-width="4" stroke-linecap="round" filter="url(#${id}g)"><path d="M26 34l10 8M174 34l-10 8M22 62h12M178 62h-12"/></g>
  <g class="bt-fx bt-zz" fill="var(--bt-fg,#fff)" font-family="Inter,sans-serif" font-weight="300" filter="url(#${id}g)"><text x="152" y="30" font-size="20">z</text><text x="166" y="16" font-size="15">z</text></g>
  <g class="bt-fx bt-spk" fill="var(--bt-fg,#fff)" filter="url(#${id}g)"><path d="M30 120l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M172 96l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M160 180l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/></g>
  <g class="bt-bars"></g>
 </g>`;
 const bars=svg.querySelector(".bt-bars");
 function build(){const L=LV[lv],n=L.bars,w=n===3?28:n===5?22:17,step=(140-w)/(n-1),mid=(n-1)/2;
  bars.innerHTML=[...Array(n)].map((_,k)=>{const x=30+k*step,g=L.gold||k===mid;
   return `<g class="bt-bar" style="animation-delay:${k*.09}s"><rect class="bt-r" x="${x}" width="${w}" rx="${w/2}" fill="url(#${id}${g?"d":"k"})" opacity="${k===mid||L.gold?1:.82}"/><rect class="bt-hl" x="${x+w*.22}" width="${Math.max(3,w*.18)}" rx="2" fill="var(--bt-inv,#000)" opacity="${L.gold?.28:0}"/></g>`}).join("");
  svg.classList.toggle("lv-halo",!!L.halo);svg.classList.toggle("lv-ring",!!L.ring);svg.classList.toggle("lv-gold",!!L.gold);mood(md)}
 function mood(k){md=k;const L=LV[lv],n=L.bars,mid=(n-1)/2;
  ["happy","calm","playful","angry","sad","sleepy","party","focus"].forEach(c=>svg.classList.remove(c));svg.classList.add(k);
  const [a,b]=E[EY[k]];svg.querySelector(".bt-e1").setAttribute("d",a);svg.querySelector(".bt-e2").setAttribute("d",b);
  bars.querySelectorAll(".bt-bar").forEach((g,i)=>{const t=n>1?(i-mid)/mid:0,h=Math.round(P[k](t,i));const top=196-h;
   const r=g.querySelector(".bt-r"),hl=g.querySelector(".bt-hl");r.setAttribute("y",top);r.setAttribute("height",h);
   hl.setAttribute("y",top+Math.min(8,h*.2));hl.setAttribute("height",Math.max(2,h*.45));
   if(i===mid&&!L.gold)r.setAttribute("fill",k==="angry"?"var(--bt-red,#FF453A)":`url(#${id}d)`)});
  const top=Math.min(...[...Array(n)].map((_,i)=>196-P[k](n>1?(i-mid)/mid:0,i)));
  svg.querySelector(".bt-visor").style.transform=`translateY(${Math.max(0,Math.min(80,(top-124)*1))}px)`}
 build();
 return {mood,level(i){lv=Math.max(0,Math.min(LV.length-1,i));build()},look(dx,dy){svg.querySelector(".bt-eyes g").style.translate=`${dx*5}px ${dy*3}px`},
  blink(){if(md==="sleepy"||md==="angry")return;svg.classList.add("bt-blink");setTimeout(()=>svg.classList.remove("bt-blink"),120)},get md(){return md},get lv(){return lv}};
}
const CSS=`
.barat{overflow:visible;color:#fff;-webkit-tap-highlight-color:transparent}
.barat .bt-eyes{color:#fff;transition:color .2s}.barat.angry .bt-eyes{color:var(--bt-red,#FF453A)}
.barat .bt-eyes path{transition:d .22s}
.barat .bt-visor{transition:transform .4s cubic-bezier(.3,1.4,.5,1)}
.barat .bt-eyes g{transform-box:fill-box;transform-origin:center;transition:transform .1s}
.barat.bt-blink .bt-eyes g{transform:scaleY(.12)}
.barat .bt-r,.barat .bt-hl{transition:y .35s cubic-bezier(.3,1.5,.5,1),height .35s cubic-bezier(.3,1.5,.5,1)}
.barat .bt-bar{transform-box:fill-box;transform-origin:50% 100%}
.barat.happy .bt-bar{animation:bt-eq .5s ease-in-out infinite alternate}
.barat.party .bt-bar{animation:bt-eq .22s ease-in-out infinite alternate}
.barat.playful .bt-bar{animation:bt-wave 1s ease-in-out infinite}
.barat.calm .bt-bar,.barat.focus .bt-bar{animation:bt-br 2.6s ease-in-out infinite}
.barat.sleepy .bt-bar{animation:bt-br 4s ease-in-out infinite;opacity:.55}
.barat.sad .bt-bar{opacity:.55}
@keyframes bt-eq{to{transform:scaleY(.8)}}@keyframes bt-wave{50%{transform:translateY(-14px)}}@keyframes bt-br{50%{transform:scaleY(1.18)}}
.barat .bt-body{transform-box:view-box;transform-origin:100px 205px}
.barat.happy .bt-body{animation:bt-hop .6s ease-in-out infinite}.barat.party .bt-body{animation:bt-hop .35s ease-in-out infinite}
.barat.angry .bt-body{animation:bt-glitch .14s steps(2) infinite}.barat.sad .bt-body{animation:bt-sink 3s ease-in-out infinite}
.barat.calm .bt-body,.barat.focus .bt-body{animation:bt-float 3.6s ease-in-out infinite}
@keyframes bt-hop{50%{transform:translateY(-8px)}}@keyframes bt-float{50%{transform:translateY(-4px)}}
@keyframes bt-glitch{0%{transform:translate(-3px,0)}50%{transform:translate(3px,1px)}100%{transform:translate(-2px,-1px)}}
@keyframes bt-sink{50%{transform:translateY(4px)}}
.barat .bt-fx{opacity:0;transition:opacity .3s}
.barat.angry .bt-spark,.barat.sleepy .bt-zz,.barat.party .bt-conf,.barat.sad .bt-tear,.barat.lv-gold .bt-spk{opacity:1}
.barat .bt-spark path{animation:bt-spk .5s steps(2) infinite}@keyframes bt-spk{50%{opacity:.2}}
.barat .bt-zz text{animation:bt-zz 2.4s ease-in-out infinite}.barat .bt-zz text:nth-child(2){animation-delay:.8s}
@keyframes bt-zz{0%{transform:translate(0,0);opacity:0}30%{opacity:1}100%{transform:translate(10px,-22px);opacity:0}}
.barat .bt-conf rect{animation:bt-conf 1.2s ease-out infinite}@keyframes bt-conf{0%{transform:translateY(-6px)}100%{transform:translateY(80px) rotate(200deg);opacity:0}}
.barat .bt-tear circle{animation:bt-tear 1.8s ease-in infinite}@keyframes bt-tear{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(22px);opacity:0}}
.barat .bt-spk path{transform-box:fill-box;transform-origin:center;animation:bt-tw 1.6s ease-in-out infinite}.barat .bt-spk path:nth-child(2){animation-delay:.5s}.barat .bt-spk path:nth-child(3){animation-delay:1s}
@keyframes bt-tw{50%{transform:scale(.3);opacity:.3}}
.barat .bt-halo,.barat .bt-ring,.barat .bt-floor{opacity:0;transition:opacity .4s}
.barat.lv-halo .bt-halo{opacity:1;animation:bt-pulse 2.8s ease-in-out infinite}.barat.lv-halo .bt-floor{opacity:.35}
@keyframes bt-pulse{50%{opacity:.55}}
.barat.lv-ring .bt-ring{opacity:1}.barat .bt-orb{animation:bt-dash 3s linear infinite}
.barat.angry .bt-orb{animation-duration:.6s}
@keyframes bt-dash{to{stroke-dashoffset:-96}}
@media (prefers-reduced-motion:reduce){.barat *{animation:none!important}}`;
const st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
return {LV,levelOf,mount};
})();
