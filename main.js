/**
 * Hanumante Falooda v4 — main.js
 * Shuffle animation (headings only) + Slider + Interactions
 */

/* ── Shuffle Engine ─────────────────────────── */
const SCRAMBLE_CHARS = ['#','@','*','%','&','!','?','~','^'];

function shuffleEl(el) {
  if (el.dataset.busy === '1') return;
  el.dataset.busy = '1';

  const original = el.dataset.orig || el.textContent;
  el.dataset.orig = original;

  const chars = [...original];
  const dur    = parseFloat(el.dataset.dur  || '0.38') * 1000;
  const stagger= parseFloat(el.dataset.stg  || '0.03') * 1000;
  const mode   = el.dataset.mode || 'evenodd';

  // Build spans once
  if (!el.querySelector('.shuffle-char')) {
    el.innerHTML = chars.map((ch, i) =>
      ch === ' '
        ? '<span class="shuffle-char">&nbsp;</span>'
        : `<span class="shuffle-char" data-i="${i}">${ch}</span>`
    ).join('');
  }

  const spans = [...el.querySelectorAll('.shuffle-char')];
  let order   = spans.map((_, i) => i);
  if (mode === 'evenodd') {
    order = [
      ...order.filter(i => i % 2 === 0),
      ...order.filter(i => i % 2 !== 0)
    ];
  }

  let settled = 0;
  order.forEach((idx, pos) => {
    const span  = spans[idx];
    const target= chars[idx] === ' ' ? '\u00a0' : chars[idx];
    let iv;

    setTimeout(() => {
      span.classList.add('animating');
      iv = setInterval(() => {
        if (chars[idx] === ' ') return;
        span.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }, 38);

      setTimeout(() => {
        clearInterval(iv);
        span.textContent = target;
        if (chars[idx] === ' ') span.innerHTML = '&nbsp;';
        span.classList.remove('animating');
        settled++;
        if (settled >= spans.length) el.dataset.busy = '0';
      }, dur);
    }, pos * stagger);
  });
}

function initShuffle() {
  document.querySelectorAll('[data-shuffle]').forEach(el => {
    el.dataset.orig = el.textContent.trim();

    // Build spans immediately
    const chars = [...el.dataset.orig];
    el.innerHTML = chars.map(ch =>
      ch === ' '
        ? '<span class="shuffle-char">&nbsp;</span>'
        : `<span class="shuffle-char">${ch}</span>`
    ).join('');

    el.addEventListener('mouseenter', () => shuffleEl(el));
    el.addEventListener('touchstart', () => shuffleEl(el), { passive: true });
  });

  // Auto-trigger main heading on load
  setTimeout(() => {
    document.querySelectorAll('#hero [data-shuffle]').forEach(el => shuffleEl(el));
  }, 600);
}

/* ── Hero Slider ────────────────────────────── */
function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.s-dot');
  if (!slides.length) return;

  let cur = 0, timer;

  function goTo(n) {
    slides[cur].classList.remove('active');
    dots[cur]?.classList.remove('active');
    dots[cur]?.setAttribute('aria-pressed', 'false');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dots[cur]?.classList.add('active');
    dots[cur]?.setAttribute('aria-pressed', 'true');
  }

  const startTimer = () => { timer = setInterval(() => goTo(cur + 1), 5000); };
  const stopTimer  = () => clearInterval(timer);

  startTimer();

  dots.forEach((d, i) => d.addEventListener('click', () => { stopTimer(); goTo(i); startTimer(); }));

  document.querySelector('.slider-arrow--prev')?.addEventListener('click', () => { stopTimer(); goTo(cur - 1); startTimer(); });
  document.querySelector('.slider-arrow--next')?.addEventListener('click', () => { stopTimer(); goTo(cur + 1); startTimer(); });

  // Swipe support
  let sx = 0;
  const wrap = document.querySelector('.hero-slider');
  wrap?.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  wrap?.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 45) { stopTimer(); goTo(dx < 0 ? cur + 1 : cur - 1); startTimer(); }
  }, { passive: true });
}

/* ── Bottom bar hide on scroll-down ─────────── */
function initBottomBar() {
  const bar = document.getElementById('bottom-bar');
  if (!bar) return;
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    bar.style.transform = (y > lastY + 5 && y > 80) ? 'translateY(102%)' : 'translateY(0)';
    lastY = y;
  }, { passive: true });
}

/* ── Shake ──────────────────────────────────── */
function initShake() {
  document.querySelectorAll('.bb-btn, .btn--primary').forEach(btn => {
    let lock = false;
    const go = () => {
      if (lock) return; lock = true;
      btn.classList.add('btn--shake');
      setTimeout(() => { btn.classList.remove('btn--shake'); lock = false; }, 550);
    };
    btn.addEventListener('click', go);
    btn.addEventListener('touchstart', go, { passive: true });
  });
}

/* ── Add to cart feedback ───────────────────── */
function initAddBtns() {
  document.querySelectorAll('.menu-btn-add').forEach(btn => {
    btn.addEventListener('click', function () {
      const orig = this.textContent;
      this.textContent = '✓';
      this.classList.add('added');
      setTimeout(() => { this.textContent = orig; this.classList.remove('added'); }, 900);
    });
  });
}

/* ── Scroll reveal ──────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── Navbar scroll shadow ───────────────────── */
function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 12 ? '0 2px 12px rgba(61,26,0,0.25)' : 'none';
  }, { passive: true });
}

/* ── Section headings auto-shuffle ─────────── */
function initSectionShuffle() {
  const secHeadings = document.querySelectorAll('.sec-shuffle');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { shuffleEl(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  secHeadings.forEach(el => obs.observe(el));
}

/* ── Boot ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initShuffle();
  initSlider();
  initBottomBar();
  initShake();
  initAddBtns();
  initReveal();
  initNav();
  setTimeout(initSectionShuffle, 500);
});
