'use strict';
document.documentElement.classList.add('js');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() { nav?.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false'); }
menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
const form = document.querySelector('.waitlist-form');
form?.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('button[type=submit]');
  if (button.disabled || !form.reportValidity()) return;
  const status = document.querySelector('#signup-status');
  const email = form.elements.email;
  const originalLabel = button.innerHTML;
  button.disabled = true;
  form.setAttribute('aria-busy', 'true');
  email.removeAttribute('aria-invalid');
  status.classList.remove('error');
  status.textContent = 'Αποθήκευση εγγραφής…';
  button.textContent = 'Αποθήκευση…';
  try {
    const response = await fetch('/api/waitlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), consent: form.elements.consent.checked, website: form.elements.website.value }),
      signal: AbortSignal.timeout(25000)
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) throw new Error('Not confirmed');
    status.textContent = 'Η εγγραφή σου ολοκληρώθηκε. Θα λάβεις νέα για την κυκλοφορία!';
    form.reset();
  } catch {
    status.classList.add('error');
    status.textContent = 'Η εγγραφή δεν επιβεβαιώθηκε. Δοκίμασε ξανά αργότερα ή ';
    const link = document.createElement('a'); link.href = 'mailto:hello@primalcore.gr'; link.textContent = 'γράψε μας στο hello@primalcore.gr'; status.append(link, '.');
  } finally {
    button.disabled = false; button.innerHTML = originalLabel; form.removeAttribute('aria-busy');
  }
});
// A single event-driven film: no perpetual animation loop, no download for reduced motion.
const film = document.querySelector('[data-film]');
const filmButton = document.querySelector('[data-film-toggle]');
if (film && filmButton) {
  const desktop = matchMedia('(min-width: 761px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false, loaded = false, scheduled = false;
  const load = () => { if (!loaded) { loaded = true; film.preload = 'auto'; film.load(); } };
  function scrub() {
    scheduled = false;
    if (!desktop.matches || reduced.matches || paused || !Number.isFinite(film.duration) || film.seeking) return;
    const stage = film.closest('.hero-film');
    const distance = stage.offsetHeight - film.parentElement.offsetHeight;
    const progress = Math.min(1, Math.max(0, (scrollY - stage.offsetTop) / Math.max(1, distance)));
    const time = progress * Math.max(0, film.duration - .05);
    if (Math.abs(film.currentTime - time) > .06) film.currentTime = time;
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(scrub); } }
  function configure() {
    film.pause();
    if (reduced.matches) { filmButton.hidden = true; film.classList.remove('is-ready'); return; }
    filmButton.hidden = false;
    filmButton.setAttribute('aria-pressed', String(paused));
    filmButton.textContent = desktop.matches ? (paused ? 'Συνέχιση κίνησης' : 'Παύση κίνησης') : 'Προβολή ταινίας';
    if (desktop.matches) { load(); schedule(); }
  }
  film.addEventListener('loadeddata', () => { if (!reduced.matches) film.classList.add('is-ready'); schedule(); });
  film.addEventListener('seeked', schedule);
  film.addEventListener('ended', () => { filmButton.textContent = 'Προβολή ξανά'; filmButton.setAttribute('aria-pressed', 'false'); });
  film.addEventListener('error', () => { film.classList.remove('is-ready'); filmButton.hidden = true; });
  filmButton.addEventListener('click', async () => {
    if (desktop.matches) { paused = !paused; configure(); return; }
    load();
    if (!film.paused) { film.pause(); filmButton.textContent = 'Συνέχιση ταινίας'; filmButton.setAttribute('aria-pressed','false'); return; }
    if (film.ended) film.currentTime = 0;
    try { await film.play(); film.classList.add('is-ready'); filmButton.textContent = 'Παύση ταινίας'; filmButton.setAttribute('aria-pressed','true'); } catch { filmButton.textContent = 'Δοκίμασε ξανά την ταινία'; }
  });
  addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule, { passive: true });
  desktop.addEventListener('change', configure); reduced.addEventListener('change', configure); configure();
}
