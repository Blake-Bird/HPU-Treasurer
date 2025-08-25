/* --------------------------------------------------------------
   Helpers & Global Settings
   -------------------------------------------------------------- */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------------
   Sticky Top Bar (shows after scroll)
   -------------------------------------------------------------- */
function toggleTopBar() {
    const topBar = document.getElementById('topBar');
    if (window.scrollY > 100) {
        topBar.classList.add('visible');
        topBar.classList.remove('hidden');
    } else {
        topBar.classList.remove('visible');
        topBar.classList.add('hidden');
    }
}
if (!prefersReduced) window.addEventListener('scroll', toggleTopBar);

/* --------------------------------------------------------------
   GSAP ScrollTrigger – reveal animations
   -------------------------------------------------------------- */
gsap.registerPlugin(ScrollTrigger);

// Hero text & chips
gsap.utils.toArray('.hero-section .display-1, .hero-section .lead, .chip, .cta-group .btn')
    .forEach((el, i) => {
        gsap.fromTo(el,
            { opacity: 0, y: 20 },
            {
                opacity: 1, y: 0,
                delay: i * 0.12,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: prefersReduced ? null : {
                    trigger: el,
                    start: "top 85%"
                }
            });
    });

// Plan cards
gsap.utils.toArray('.plan-card').forEach((card, i) => {
    gsap.fromTo(card,
        { opacity: 0, y: 40, rotateX: 8 },
        {
            opacity: 1, y: 0, rotateX: 0,
            delay: i * 0.15 + 0.5,
            duration: 0.7,
            ease: "back.out(1.2)",
            scrollTrigger: prefersReduced ? null : {
                trigger: card,
                start: "top 85%"
            }
        });
});

/* --------------------------------------------------------------
   Transparency Chart (Chart.js)
   -------------------------------------------------------------- */
function initChart() {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(167,139,250,0.6)"); // Orchid
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'],
            datasets: [
                {
                    label: 'Ideas submitted',
                    data: [12,18,25,30,22,27,35,40,38],
                    borderColor: '#A78BFA',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#FDE68A'
                },
                {
                    label: 'Ideas funded',
                    data: [5,9,13,20,15,18,25,30,28],
                    borderColor: '#FDE68A',
                    backgroundColor: 'rgba(253,230,138,0.2)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#330072'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { font: { family: 'JetBrains Mono' } } },
                tooltip: {
                    backgroundColor: "rgba(255,255,255,0.85)",
                    titleFont: { family: 'JetBrains Mono', weight:'600' },
                    bodyFont:  { family: 'JetBrains Mono' },
                    borderColor: "rgba(255,255,255,0.4)"
                }
            },
            scales: {
                x: { ticks: { color:'#fff', font:{family:'JetBrains Mono'} } },
                y: { ticks: { color:'#fff', font:{family:'JetBrains Mono'} } }
            }
        }
    });
}
if (!prefersReduced) initChart();

/* --------------------------------------------------------------
   PDF Viewer Modal
   -------------------------------------------------------------- */
const pdfModal = document.getElementById('pdfModal');
const pdfIframe = document.getElementById('pdfIframe');
const pdfTitle  = document.getElementById('pdfTitle');

document.querySelectorAll('.open-pdf').forEach(btn => {
    btn.addEventListener('click', () => {
        const url   = btn.dataset.pdf;
        const title = btn.dataset.title || 'Document';
        pdfIframe.src = url;
        pdfTitle.textContent = title;
        pdfModal.classList.add('visible');
    });
});
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        pdfModal.classList.remove('visible');
        lightboxModal?.classList.remove('visible'); // for portrait
    });
});

/* --------------------------------------------------------------
   Portrait Lightbox (click a portrait → modal)
   -------------------------------------------------------------- */
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

document.querySelectorAll('.portrait').forEach(portrait => {
    portrait.addEventListener('click', () => {
        const src = portrait.querySelector('img').src;
        // Simple caption – you can replace with a real bio later
        lightboxImg.src = src;
        lightboxCaption.textContent = "Blake – Builder, Treasurer, Visionary.";
        lightboxModal.classList.add('visible');
    });
});

/* --------------------------------------------------------------
   Idea Form (confetti + success message)
   -------------------------------------------------------------- */
const ideaForm   = document.getElementById('ideaForm');
const formSuccess = document.getElementById('formSuccess');

ideaForm?.addEventListener('submit', e => {
    e.preventDefault();

    // ---- OPTIONAL: send to Google Form / Typeform here ----
    // const googleURL = 'https://docs.google.com/forms/d/e/XXXXX/formResponse';
    // fetch(googleURL, { method:'POST', mode:'no-cors', body:new FormData(ideaForm) });

    // Confetti burst (respect reduced‑motion)
    if (!prefersReduced) {
        const end = Date.now() + 1200;
        (function frame(){
            confetti({
                particleCount:2,
                angle:60,
                spread:55,
                origin:{x:0},
                colors:['#330072','#A78BFA','#FDE68A']
            });
            confetti({
                particleCount:2,
                angle:120,
                spread:55,
                origin:{x:1},
                colors:['#330072','#A78BFA','#FDE68A']
            });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    }

    // Show success message
    formSuccess.classList.remove('hidden');
    ideaForm.reset();
});

/* --------------------------------------------------------------
   Latin motto SVG draw animation (fallback for reduced motion)
   -------------------------------------------------------------- */
if (!prefersReduced) {
    const path = document.getElementById('mottoPath');
    // CSS already animates the stroke; we just ensure it's visible after load
}

/* --------------------------------------------------------------
   Easter Egg: type “budgetbackflip” → slow orbit + tiny confetti
   -------------------------------------------------------------- */
let typed = '';
const secret = 'budgetbackflip';
document.addEventListener('keydown', e => {
    if (e.key.length === 1) { // ignore special keys
        typed += e.key.toLowerCase();
        if (!secret.startsWith(typed)) typed = ''; // reset on mismatch
        if (typed === secret) {
            const orbit = document.getElementById('portraitOrbit');
            orbit.style.animationDuration = '60s'; // slow down

            confetti({
                particleCount:30,
                spread:70,
                origin:{y:0.6},
                colors:['#FDE68A']
            });

            setTimeout(() => {
                orbit.style.animationDuration = '18s';
            }, 5000);
            typed = '';
        }
    }
});

/* --------------------------------------------------------------
   Parallax (optional, lightweight)
   -------------------------------------------------------------- */
if (!prefersReduced) {
    const parallaxEls = document.querySelectorAll('[data-speed]');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        parallaxEls.forEach(el => {
            const speed = parseFloat(el.dataset.speed);
            el.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });
}

/* --------------------------------------------------------------
   Initial page load – set top‑bar correctly
   -------------------------------------------------------------- */
toggleTopBar(); // ensure correct state on first paint

/* ==============================================================
   End of script.js
   ============================================================== */
