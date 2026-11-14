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
const localPreview = location.protocol === 'file:';
if (form && localPreview) document.querySelector('#signup-status').textContent = 'Τοπική προεπισκόπηση: οι εγγραφές λειτουργούν μόνο στον δημοσιευμένο ιστότοπο.';
form?.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('button[type=submit]');
  if (button.disabled || !form.reportValidity()) return;
  const status = document.querySelector('#signup-status');
  if (localPreview) {
    status.textContent = 'Τοπική προεπισκόπηση: το email σου δεν αποθηκεύτηκε. Οι εγγραφές λειτουργούν μόνο στον δημοσιευμένο ιστότοπο.';
    return;
  }
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
// Scroll controls the desktop film; mobile and reduced-motion visitors see the poster.
const film = document.querySelector('[data-film]');
if (film) {
  const desktop = matchMedia('(min-width: 761px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let loaded = false, scheduled = false;
  function scrub() {
    scheduled = false;
    if (!desktop.matches || reduced.matches || !Number.isFinite(film.duration) || film.seeking) return;
    const stage = film.closest('.hero-film');
    const distance = stage.offsetHeight - film.parentElement.offsetHeight;
    const progress = Math.min(1, Math.max(0, (scrollY - stage.offsetTop) / Math.max(1, distance)));
    const time = progress * Math.max(0, film.duration - .05);
    if (Math.abs(film.currentTime - time) > .06) film.currentTime = time;
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(scrub); } }
  function configure() {
    film.pause();
    if (!desktop.matches || reduced.matches) { film.classList.remove('is-ready'); return; }
    if (!loaded) { loaded = true; film.preload = 'auto'; film.load(); }
    else if (film.readyState >= 2) film.classList.add('is-ready');
    schedule();
  }
  film.addEventListener('loadeddata', () => { if (desktop.matches && !reduced.matches) film.classList.add('is-ready'); schedule(); });
  film.addEventListener('seeked', schedule);
  film.addEventListener('error', () => film.classList.remove('is-ready'));
  addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule, { passive: true });
  desktop.addEventListener('change', configure); reduced.addEventListener('change', configure); configure();
}
