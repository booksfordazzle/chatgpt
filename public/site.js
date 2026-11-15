'use strict';
const english = document.documentElement.lang.startsWith('en');
const messages = {
  "Η εγγραφή δεν είναι διαθέσιμη σε αυτό το αρχείο. Άνοιξε τον δημοσιευμένο ιστότοπο για να εγγραφείς.": "Signup is not available in this file preview. Open the published website to join.",
  "Αποθήκευση εγγραφής…": "Saving your registration…",
  "Αποθήκευση…": "Saving…",
  "Η εγγραφή σου ολοκληρώθηκε. Θα λάβεις νέα για την κυκλοφορία!": "You are on the list. You will receive launch updates!",
  "Η εγγραφή δεν επιβεβαιώθηκε. Δοκίμασε ξανά αργότερα ή ": "Registration could not be confirmed. Try again later or ",
  "γράψε μας στο hello@primalcore.gr": "write to hello@primalcore.gr",
  "Αναπαραγωγή βίντεο ": "Play video: ",
  "Παύση βίντεο ": "Pause video: ",
  "Πάτησε το κουμπί κάτω δεξιά για αναπαραγωγή.": "Select the button at the bottom right to play.",
  "Το βίντεο δεν είναι διαθέσιμο αυτή τη στιγμή.": "The video is currently unavailable."
};
const translate = text => english ? (messages[text] || text) : text;
// Keep chapter and section anchors when changing languages.
document.querySelectorAll('[data-language-link]').forEach(link => {
  link.addEventListener('click', () => { link.hash = location.hash; });
});
document.documentElement.classList.add('js');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() { nav?.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false'); }
menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
const localPreview = location.protocol === 'file:';
document.querySelectorAll('.waitlist-form').forEach(form => {
form.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('button[type=submit]');
  if (button.disabled || !form.reportValidity()) return;
  const status = form.querySelector('.form-status');
  if (localPreview) {
    status.textContent = translate("Η εγγραφή δεν είναι διαθέσιμη σε αυτό το αρχείο. Άνοιξε τον δημοσιευμένο ιστότοπο για να εγγραφείς.");
    return;
  }
  const email = form.elements.email;
  const originalLabel = button.innerHTML;
  button.disabled = true;
  form.setAttribute('aria-busy', 'true');
  email.removeAttribute('aria-invalid');
  status.classList.remove('error');
  status.textContent = translate("Αποθήκευση εγγραφής…");
  button.textContent = translate("Αποθήκευση…");
  try {
    const response = await fetch('/api/waitlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), consent: form.elements.consent.checked, lang: document.documentElement.lang, website: form.elements.website.value, source: form.elements.source.value, landing_path: form.elements.landing_path?.value, referrer_origin: form.elements.referrer_origin?.value, ...Object.fromEntries(campaignKeys.filter(key => form.elements[key]).map(key => [key, form.elements[key].value])) }),
      signal: AbortSignal.timeout(25000)
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) throw new Error('Not confirmed');
    status.textContent = translate("Η εγγραφή σου ολοκληρώθηκε. Θα λάβεις νέα για την κυκλοφορία!");
    form.reset();
  } catch {
    status.classList.add('error');
    status.textContent = translate("Η εγγραφή δεν επιβεβαιώθηκε. Δοκίμασε ξανά αργότερα ή ");
    const link = document.createElement('a'); link.href = 'mailto:hello@primalcore.gr'; link.textContent = translate("γράψε μας στο hello@primalcore.gr"); status.append(link, '.');
  } finally {
    button.disabled = false; button.innerHTML = originalLabel; form.removeAttribute('aria-busy');
  }
});
});
// Capture only allowlisted campaign values; no tracking cookies or storage.
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const campaignQuery = new URLSearchParams(location.search);
let referrerOrigin = '';
try { referrerOrigin = new URL(document.referrer).origin; } catch {}
document.querySelectorAll('.waitlist-form').forEach(form => {
  const fields = { landing_path: location.pathname, referrer_origin: referrerOrigin };
  campaignKeys.forEach(key => { if (campaignQuery.has(key)) fields[key] = campaignQuery.get(key).slice(0, 128); });
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden'; input.name = name; input.value = value;
    form.append(input);
  });
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

// Ingredient film retains muted autoplay and independent pause.
document.querySelectorAll('[data-loop-video]').forEach(video => {
  const frame = video.closest('[data-video-frame]');
  const toggle = frame.querySelector('.media-toggle');
  const status = document.getElementById(video.dataset.statusId);
  const name = video.dataset.videoName;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false, nearViewport = false, playPending = false;
  video.muted = true;
  video.controls = false;
  function sync() {
    toggle.setAttribute('aria-label', (video.paused ? translate("Αναπαραγωγή βίντεο ") : translate("Παύση βίντεο ")) + name);
    toggle.innerHTML = video.paused
      ? '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="m8 5 11 7-11 7Z" fill="currentColor"/></svg>'
      : '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor"/></svg>';
  }
  async function play(explicit = false) {
    if (playPending || (!explicit && (userPaused || reduced.matches || !nearViewport || document.hidden))) return;
    playPending = true;
    if (explicit) { video.classList.add('explicit-playback'); nearViewport = true; }
    status.textContent = '';
    try { await video.play(); }
    catch (error) { if (error.name !== 'AbortError') status.textContent = translate("Πάτησε το κουμπί κάτω δεξιά για αναπαραγωγή."); }
    finally {
      playPending = false;
      if (userPaused || document.hidden || !nearViewport) video.pause();
      sync();
    }
  }
  toggle.addEventListener('click', () => {
    if (!video.paused || playPending) { userPaused = true; video.pause(); sync(); }
    else { userPaused = false; play(true); }
  });
  ['play', 'pause', 'ended'].forEach(event => video.addEventListener(event, sync));
  video.addEventListener('loadeddata', () => video.classList.add('is-ready'));
  if (video.readyState >= 2) video.classList.add('is-ready');
  video.addEventListener('error', () => {
    video.classList.remove('is-ready');
    status.textContent = translate("Το βίντεο δεν είναι διαθέσιμο αυτή τη στιγμή.");
    sync();
  });
  new IntersectionObserver(entries => {
    nearViewport = entries[0].isIntersecting;
    if (nearViewport) play(); else video.pause();
  }, { rootMargin: '600px 0px' }).observe(video);
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { nearViewport = true; play(); }
  }, { threshold: .01 }).observe(video);
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else play(); });
  reduced.addEventListener('change', () => { if (reduced.matches) video.pause(); else play(); });
  video.pause();
  sync();
});

const slider = document.querySelector('.ingredient-slider');
if (slider) {
  const slidesElement = slider.querySelector('.ingredient-slides');
  const slides = [...slidesElement.children];
  const count = slider.querySelector('.slider-count');
  let index = 0;
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    count.textContent = `${index + 1} / ${slides.length}`;
    count.setAttribute('aria-label', `${english ? 'Ingredient' : 'Συστατικό'} ${index + 1} ${english ? 'of' : 'από'} ${slides.length}: ${slides[index].querySelector('h3').textContent}`);
  }
  function measure() {
    const probe = slidesElement.cloneNode(true);
    probe.removeAttribute('id');
    probe.setAttribute('aria-hidden', 'true');
    Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', pointerEvents: 'none', width: `${slidesElement.clientWidth}px`, left: '0', top: '0' });
    [...probe.children].forEach(slide => { slide.hidden = false; });
    slider.append(probe);
    const height = Math.max(...[...probe.children].map(slide => slide.getBoundingClientRect().height));
    probe.remove();
    slidesElement.style.minHeight = `${Math.ceil(height)}px`;
  }
  slider.querySelector('.slider-prev').addEventListener('click', () => show(index - 1));
  slider.querySelector('.slider-next').addEventListener('click', () => show(index + 1));
  slider.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    show(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let touch;
  slider.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') touch = { x: event.clientX, y: event.clientY }; });
  slider.addEventListener('pointerup', event => {
    if (!touch) return;
    const dx = event.clientX - touch.x, dy = event.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
  });
  slider.addEventListener('pointercancel', () => { touch = null; });
  let resizeFrame;
  addEventListener('resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(measure); });
  show(0);
  measure();
  document.fonts.ready.then(measure);
}

// Avoid publishing a plain email link in the contact page's initial markup.
document.querySelectorAll('[data-reveal-email]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', () => {
    const result = document.getElementById(button.getAttribute('aria-controls'));
    if (result.childElementCount) return;
    const address = atob(button.dataset.revealEmail);
    const link = document.createElement('a');
    link.className = 'contact-email';
    link.href = 'mailto:' + address;
    link.textContent = address;
    result.append(link);
    button.setAttribute('aria-expanded', 'true');
    button.hidden = true;
    link.focus();
  });
});

// Two photo frames move by at most 18px, without changing layout or captions.
const parallaxFrames = [...document.querySelectorAll('[data-photo-parallax]')];
if (parallaxFrames.length) {
  const reducedPhotoMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const visibleFrames = new Set();
  let photoFramePending = false;
  function updatePhotos() {
    photoFramePending = false;
    if (reducedPhotoMotion.matches) return;
    visibleFrames.forEach(frame => {
      const rect = frame.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / ((innerHeight + rect.height) / 2)));
      const distance = Math.min(innerWidth <= 760 ? 8 : 18, rect.height * .025);
      frame.querySelector('img').style.transform = `translateY(${progress * distance}px) scale(1.06)`;
    });
  }
  function schedulePhotos() {
    if (!reducedPhotoMotion.matches && visibleFrames.size && !photoFramePending) {
      photoFramePending = true;
      requestAnimationFrame(updatePhotos);
    }
  }
  const photoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) visibleFrames.add(entry.target); else visibleFrames.delete(entry.target); });
    schedulePhotos();
  }, { rootMargin: '64px 0px' });
  const photoEncounterObserver = new IntersectionObserver(entries => {
    if (reducedPhotoMotion.matches) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('photo-encountered');
        photoEncounterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .15 });
  function configurePhotoMotion() {
    parallaxFrames.forEach(frame => {
      frame.classList.toggle('has-parallax', !reducedPhotoMotion.matches);
      if (reducedPhotoMotion.matches) frame.querySelector('img').style.removeProperty('transform');
      else if (!frame.classList.contains('photo-encountered')) photoEncounterObserver.observe(frame);
    });
    schedulePhotos();
  }
  parallaxFrames.forEach(frame => photoObserver.observe(frame));
  addEventListener('scroll', schedulePhotos, { passive: true });
  addEventListener('resize', schedulePhotos);
  reducedPhotoMotion.addEventListener('change', configurePhotoMotion);
  configurePhotoMotion();
}
