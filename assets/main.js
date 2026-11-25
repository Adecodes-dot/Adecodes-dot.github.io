// Progressive enhancement only: every section is readable without this file.
const motionOK = matchMedia('(prefers-reduced-motion: no-preference)').matches;
const topbar = document.querySelector('.topbar');

// Top bar gains a backdrop once the page scrolls.
const onScroll = () => topbar?.classList.toggle('scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu.
const menuBtn = document.querySelector('.menu-btn');
function setMenu(open) {
  topbar.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
}
menuBtn?.addEventListener('click', () => setMenu(!topbar.classList.contains('open')));
document.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && topbar?.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
});

// Hero parallax: far layers move less than near ones.
const layers = [...document.querySelectorAll('.layer[data-depth]')];
const hero = document.querySelector('.hero');
if (motionOK && layers.length) {
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(scrollY, hero.offsetHeight);
      for (const l of layers) l.style.transform = `translate3d(0, ${y * Number(l.dataset.depth)}px, 0)`;
      ticking = false;
    });
  }, { passive: true });
}

// Work index: a screenshot floats beside the hovered row and drifts with the pointer (mouse users only).
const preview = document.querySelector('.preview');
if (preview && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const img = preview.querySelector('img');
  const section = preview.parentElement;
  document.querySelectorAll('.work-row[data-shot]').forEach((row) => {
    row.addEventListener('pointerenter', () => {
      img.src = row.dataset.shot;
      img.alt = '';
      preview.style.setProperty('--y', `${row.offsetTop + row.offsetHeight / 2 - preview.offsetHeight / 2}px`);
      preview.classList.add('on');
    });
    row.addEventListener('pointermove', (e) => {
      const box = section.getBoundingClientRect();
      const x = Math.max(box.width * 0.42, Math.min(e.clientX - box.left + 40, box.width - preview.offsetWidth - 160));
      preview.style.setProperty('--x', `${x}px`);
    });
    row.addEventListener('pointerleave', () => preview.classList.remove('on'));
  });
}

// About slides.
const slides = [...document.querySelectorAll('.slide')];
const slider = document.querySelector('[data-slider]');
let current = 0;
slider?.querySelector('[data-next]').addEventListener('click', () => {
  slides[current].setAttribute('data-hidden', '');
  current = (current + 1) % slides.length;
  slides[current].removeAttribute('data-hidden');
  slider.querySelector('[data-slide-now]').textContent = String(current + 1).padStart(2, '0');
  slider.style.setProperty('--p', `${((current + 1) / slides.length) * 100}%`);
});

// Copy email. Falls back to selecting the text when the clipboard is refused.
document.querySelectorAll('[data-copy]').forEach((btn) => {
  const target = document.getElementById(btn.dataset.copy);
  const status = btn.parentElement.querySelector('.copy-status');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      status.textContent = 'Copied';
    } catch {
      getSelection().selectAllChildren(target);
      status.textContent = 'Selected. Press Ctrl+C to copy';
    }
    setTimeout(() => { status.textContent = ''; }, 3000);
  });
});
