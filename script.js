/* ===== Prefers-reduced-motion ===== */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== Sticky top bar ===== */
const topBar = document.getElementById('topBar');
function onScroll(){ if (scrollY > 100){ topBar.classList.add('visible'); topBar.classList.remove('hidden'); } else { topBar.classList.add('hidden'); topBar.classList.remove('visible'); } }
if(!reduced) addEventListener('scroll', onScroll); onScroll();

/* ===== GSAP reveals ===== */
gsap.registerPlugin(ScrollTrigger);
const reveal = (sel, delayStep=0.12) => {
  document.querySelectorAll(sel).forEach((el,i)=>{
    gsap.fromTo(el,{opacity:0,y:18},{opacity:1,y:0,duration:.6,delay:i*delayStep,ease:"power2.out",
      scrollTrigger: reduced?null:{trigger:el,start:"top 88%"}});
  });
};
reveal('.hero .display, .hero .lead, .chip, .cta .btn', .10);
reveal('.plan-card', .15);

/* ===== Parallax (very light) ===== */
if(!reduced){
  const layers = document.querySelectorAll('[data-speed]');
  addEventListener('scroll', ()=> {
    const y = scrollY;
    layers.forEach(el => { const s = parseFloat(el.dataset.speed || '0.9'); el.style.transform = `translateY(${y*(1-s)}px)`; });
  });
}

/* ===== 3D Orbit behavior ===== */
const orbit = document.getElementById('portraitOrbit');
document.querySelectorAll('.portrait').forEach(card=>{
  card.addEventListener('mouseenter', ()=> { orbit.style.animationDuration = '30s'; });
  card.addEventListener('mouseleave', ()=> { orbit.style.animationDuration = '18s'; });
  card.addEventListener('click', ()=>{
    const src = card.querySelector('img').src;
    document.getElementById('lightImg').src = src;
    openModal('lightbox');
  });
});

/* ===== Chart.js: Ideas submitted vs funded (replace with real data later) ===== */
function initChart(){
  const el = document.getElementById('budgetChart'); if(!el) return;
  const ctx = el.getContext('2d');
  const g1 = ctx.createLinearGradient(0,0,0,300); g1.addColorStop(0,'rgba(167,139,250,.6)'); g1.addColorStop(1,'rgba(255,255,255,0)');
  const g2 = ctx.createLinearGradient(0,0,0,300); g2.addColorStop(0,'rgba(253,230,138,.45)'); g2.addColorStop(1,'rgba(255,255,255,0)');
  new Chart(ctx,{
    type:'line',
    data:{ labels:['Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'],
      datasets:[
        {label:'Ideas submitted', data:[14,22,28,35,27,31,38,45], borderColor:'#A78BFA', backgroundColor:g1, fill:true, tension:.35, pointRadius:3, pointBackgroundColor:'#FDE68A'},
        {label:'Ideas funded', data:[5,10,15,22,17,20,27,33], borderColor:'#FDE68A', backgroundColor:g2, fill:true, tension:.35, pointRadius:3, pointBackgroundColor:'#330072'}
      ]},
    options:{ responsive:true,
      plugins:{ legend:{ labels:{ color:'#fff', font:{ family:'JetBrains Mono' } } },
        tooltip:{ backgroundColor:'rgba(255,255,255,.9)', titleColor:'#111', bodyColor:'#222', borderColor:'rgba(0,0,0,.15)', borderWidth:1 }},
      scales:{ x:{ ticks:{ color:'#ddd', font:{ family:'JetBrains Mono'} }, grid:{color:'rgba(255,255,255,.08)'} },
               y:{ ticks:{ color:'#ddd', font:{ family:'JetBrains Mono'} }, grid:{color:'rgba(255,255,255,.08)'} } }
    }
  });
}
if(!reduced) initChart();

/* ===== PDF.js thumbnails ===== */
async function renderThumb(canvas, url){
  try{
    const pdf = await pdfjsLib.getDocument(url).promise;
    const page = await pdf.getPage(1);
    const vp = page.getViewport({scale:canvas.width / page.getViewport({scale:1}).width});
    const ctx = canvas.getContext('2d');
    canvas.height = vp.height;
    await page.render({canvasContext:ctx, viewport:vp}).promise;
  }catch(e){
    // fallback: show a simple message block
    const ctx = canvas.getContext('2d');
    ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#FDE68A'; ctx.font='16px Inter'; ctx.fillText('Preview unavailable', 12, 28);
  }
}
document.querySelectorAll('.pdf-thumb').forEach(c => renderThumb(c, c.dataset.src));

/* ===== PDF modal ===== */
const pdfModal = document.getElementById('pdfModal');
const pdfTitle = document.getElementById('pdfTitle');
const pdfFrame = document.getElementById('pdfFrame');
function openModal(id){ document.getElementById(id).classList.add('visible'); document.getElementById(id).classList.remove('hidden'); }
function closeModals(){ document.querySelectorAll('.modal').forEach(m=>m.classList.remove('visible')); }
document.querySelectorAll('.open-pdf').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    pdfTitle.textContent = btn.dataset.title || 'Document';
    pdfFrame.src = btn.dataset.pdf;
    openModal('pdfModal');
  });
});
document.querySelectorAll('.modal-close').forEach(x=> x.addEventListener('click', closeModals));
addEventListener('keydown', e=>{ if(e.key==='Escape') closeModals(); });

/* ===== Idea form: confetti + success + (hook to your form) ===== */
const ideaForm = document.getElementById('ideaForm');
const successMsg = document.getElementById('formSuccess');
ideaForm?.addEventListener('submit', (e)=>{
  e.preventDefault();

  // TODO: connect to your endpoint
  // fetch('https://formsubmit.co/YOUREMAIL', { method:'POST', body:new FormData(ideaForm) });

  if(!reduced){
    const end = Date.now()+900;
    (function burst(){
      confetti({ particleCount: 3, spread: 55, angle:60, origin:{x:0}, colors:['#330072','#A78BFA','#FDE68A']});
      confetti({ particleCount: 3, spread: 55, angle:120, origin:{x:1}, colors:['#330072','#A78BFA','#FDE68A']});
      if(Date.now()<end) requestAnimationFrame(burst);
    })();
  }
  successMsg.classList.remove('hidden');
  ideaForm.reset();
});

/* ===== ICS: Add to Calendar (downloads .ics) ===== */
document.getElementById('addCal')?.addEventListener('click', (e)=>{
  e.preventDefault();
  // Adjust date/time below to your Sunday voting window (local, no TZ conversion)
  const title = 'Vote — Freshman Treasurer (Slane Student Center)';
  const start = '20250907T120000'; // YYYYMMDDTHHMMSS (example: Sep 7, 12:00)
  const end   = '20250907T160000';
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Blake Bird//HPU29//EN
BEGIN:VEVENT
UID:${Date.now()}@hpu29
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
LOCATION:Slane Student Center
END:VEVENT
END:VCALENDAR`;
  const blob = new Blob([ics],{type:'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='vote-slane.ics'; a.click();
  URL.revokeObjectURL(url);
});

/* ===== QR: auto-set to current site if hosted on GitHub Pages ===== */
(function setQR(){
  const img = document.getElementById('qr'); if(!img) return;
  const here = location.href.replace(/index\.html$/,'');
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(here)}`;
  img.src = url;
})();

/* ===== Easter egg ===== */
let typed = '';
const secret = 'budgetbackflip';
addEventListener('keydown', e=>{
  if(e.key.length!==1) return;
  typed += e.key.toLowerCase();
  if(!secret.startsWith(typed)) typed='';
  if(typed===secret){
    const orb = document.getElementById('portraitOrbit');
    const prev = getComputedStyle(orb).animationDuration;
    orb.style.animationDuration='60s';
    confetti({particleCount:40,spread:80,origin:{y:.6}, colors:['#FDE68A']});
    setTimeout(()=>{ orb.style.animationDuration=prev; }, 5000);
    typed='';
  }
});
