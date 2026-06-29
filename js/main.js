const projects = [
  { title: "Alderton Property Group", category: "Real Estate",      year: "2025", image: "images/p01.png" },
  { title: "Form & Grain",            category: "Architecture",     year: "2025", image: "images/p02.png" },
  { title: "Perimeter Zero",          category: "Cybersecurity",    year: "2025", image: "images/p03.png" },
  { title: "Coquille",                category: "Restaurant",       year: "2025", image: "images/p04.png" },
  { title: "Lowband Studios",         category: "Recording Studio", year: "2025", image: "images/p05.png" },
  { title: "Cairn Interiors",         category: "Interior Design",  year: "2025", image: "images/p06.png" },
  { title: "MambaHire — Classic",     category: "Web App",          year: "2024", image: "images/p07.png" },
  { title: "Kinetic",                 category: "Health & Fitness", year: "2024", image: "images/p08.png" },
  { title: "Mamba Connections — OG",  category: "Web App",          year: "2024", image: "images/p09.png" },
  { title: "The Saltgrass Inn",       category: "Hospitality",      year: "2024", image: "images/p10.png" },
  { title: "Goldstar Pediatrics",     category: "Health",           year: "2025", image: "images/p11.png" },
  { title: "chuck design",            category: "Web Design",       year: "2026", image: "images/p12.png" },
  { title: "Family Hub — Home",       category: "Web App",          year: "2026", image: "images/p13.png" },
  { title: "Family Hub — Calendar",   category: "Web App",          year: "2026", image: "images/p14.png" },
  { title: "Family Hub — Memories",   category: "Web App",          year: "2026", image: "images/p15.png" },
  { title: "Family Hub — mAxI",       category: "Web App",          year: "2026", image: "images/p16.png" },
  { title: "Family Hub — Fun Zone",   category: "Web App",          year: "2026", image: "images/p17.png" },
  { title: "Family Hub — Study Zone", category: "Web App",          year: "2026", image: "images/p18.png" },
  { title: "Family Hub — Chores",     category: "Web App",          year: "2026", image: "images/p19.png" },
  { title: "Mamba Tech Solutions",    category: "Tech Services",    year: "2026", image: "images/p20.png" },
];

// ── State ──────────────────────────────────────────────────────
let active = 0;
let locked = false;

// ── Layout constants ───────────────────────────────────────────
function spacing() {
  return window.innerWidth < 700 ? 310 : window.innerWidth < 900 ? 420 : 620;
}

const SCALE   = [1,    0.78, 0.60, 0.44];
const OPACITY = [1,    0.72, 0.46, 0.22];

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ── Build DOM ──────────────────────────────────────────────────
const stage = document.getElementById('stage');
const cardEls = [];

projects.forEach((p, i) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', i === 0 ? '0' : '-1');
  card.setAttribute('aria-label', p.title);

  const glowEl = document.createElement('div');
  glowEl.className = 'card-glow';
  card.appendChild(glowEl);

  const faceEl = document.createElement('div');
  faceEl.className = 'card-face';
  card.appendChild(faceEl);

  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-img' + (p.image ? '' : ' placeholder');

  if (p.image) {
    const img = document.createElement('img');
    img.src = p.image;
    img.alt = p.title;
    img.loading = 'lazy';
    imgWrap.appendChild(img);
  } else {
    const label = document.createElement('span');
    label.textContent = 'coming soon';
    imgWrap.appendChild(label);
  }

  card.appendChild(imgWrap);
  stage.appendChild(card);
  cardEls.push(card);

});

// ── Render ─────────────────────────────────────────────────────
const N = projects.length;

function circDist(i) {
  let d = i - active;
  if (d >  N / 2) d -= N;
  if (d < -N / 2) d += N;
  return d;
}

function render(instant) {
  const sp = spacing();

  cardEls.forEach((card, i) => {
    const d    = circDist(i);
    const absd = Math.abs(d);
    const idx  = clamp(absd, 0, 3);

    const scale   = SCALE[idx];
    const opacity = OPACITY[idx];
    const x       = d * sp;
    const z       = 10 - absd;

    if (instant) card.style.transition = 'none';
    const isActive = absd === 0;
    card.style.transform = `translate(-50%, -50%) translateX(${x}px) scale(${scale})`;
    card.style.opacity   = opacity;
    card.style.zIndex    = z;
    card.style.cursor    = isActive ? 'default' : 'pointer';

    // Show solid face + image only on the active card
    const face = card.querySelector('.card-face');
    const img  = card.querySelector('.card-img');
    if (face) face.style.opacity = isActive ? '1' : '0';
    if (img)  img.style.opacity  = isActive ? '1' : '0';
    card.setAttribute('tabindex', absd === 0 ? '0' : '-1');

    if (instant) {
      // Force reflow then restore transition
      void card.offsetWidth;
      card.style.transition = '';
    }
  });

}

// ── Navigation ─────────────────────────────────────────────────
function goTo(index) {
  if (locked) return;
  const next = ((index % projects.length) + projects.length) % projects.length;
  if (next === active) return;
  active = next;
  locked = true;
  render();
  setTimeout(() => { locked = false; }, 300);
}

function advance(dir) {
  goTo(active + dir);
}

// ── Scroll wheel (desktop) ─────────────────────────────────────
let wheelBuffer = 0;
let wheelTimer = null;

stage.addEventListener('wheel', e => {
  e.preventDefault();
  wheelBuffer += e.deltaY + e.deltaX;
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => { wheelBuffer = 0; }, 80);

  if (Math.abs(wheelBuffer) >= 20) {
    advance(wheelBuffer > 0 ? 1 : -1);
    wheelBuffer = 0;
  }
}, { passive: false });

// ── Card click ─────────────────────────────────────────────────
cardEls.forEach((card, i) => {
  card.addEventListener('click', () => {
    const d = circDist(i);
    if (d === 0) openLightbox(projects[i]);
    else advance(d > 0 ? 1 : -1);
  });
});

// ── Lightbox ───────────────────────────────────────────────────
let lbOpen  = false;
let lbScale = 1;

function openLightbox(project) {
  if (!project.image) return;
  const lb   = document.getElementById('lightbox');
  const img  = document.getElementById('lb-img');
  const wrap = document.getElementById('lb-zoom-wrap');
  img.src = project.image;
  img.alt = project.title;
  lbScale = 1;
  wrap.style.transform = 'scale(1)';
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  lbOpen = true;
  document.getElementById('lb-close').focus();
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  lbOpen = false;
}

document.getElementById('lb-close').addEventListener('click', closeLightbox);

document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeLightbox();
});

document.getElementById('lightbox').addEventListener('wheel', e => {
  e.preventDefault();
  const wrap = document.getElementById('lb-zoom-wrap');
  lbScale = Math.max(0.5, Math.min(5, lbScale * (e.deltaY < 0 ? 1.1 : 0.91)));
  wrap.style.transform = `scale(${lbScale.toFixed(3)})`;
}, { passive: false });

document.getElementById('lb-zoom-wrap').addEventListener('dblclick', () => {
  const wrap = document.getElementById('lb-zoom-wrap');
  lbScale = 1;
  wrap.style.transform = 'scale(1)';
});

// ── Keyboard ───────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (lbOpen) {
    if (e.key === 'Escape') closeLightbox();
    return;
  }
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); advance(1); }
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); advance(-1); }
});

// ── Touch swipe ────────────────────────────────────────────────
let touchStartX = 0;

stage.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

stage.addEventListener('touchend', e => {
  const dx = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 40) advance(dx > 0 ? 1 : -1);
}, { passive: true });

// ── Init ───────────────────────────────────────────────────────
render(true);
