'use strict';
const english = document.documentElement.lang.startsWith('en');
const messages = {
  "Η εγγραφή δεν είναι διαθέσιμη σε αυτό το αρχείο. Άνοιξε τον δημοσιευμένο ιστότοπο για να εγγραφείς.": "Signup is not available in this file preview. Open the published website to join.",
  "Αποθήκευση εγγραφής…": "Saving your registration…",
  "Αποθήκευση…": "Saving…",
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
  let redirecting = false;
  try {
    const response = await fetch('/api/waitlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), consent: form.elements.consent.checked, lang: document.documentElement.lang, device_type: form.elements.device_type?.value, website: form.elements.website.value, source: form.elements.source.value, landing_path: form.elements.landing_path?.value, referrer_origin: form.elements.referrer_origin?.value, ...Object.fromEntries(campaignKeys.filter(key => form.elements[key]).map(key => [key, form.elements[key].value])) }),
      signal: AbortSignal.timeout(25000)
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) throw new Error('Not confirmed');
    location.assign(english ? '/en/thanks.html' : '/thanks.html');
    redirecting = true;
  } catch {
    status.classList.add('error');
    status.textContent = translate("Η εγγραφή δεν επιβεβαιώθηκε. Δοκίμασε ξανά αργότερα ή ");
    const link = document.createElement('a'); link.href = 'mailto:hello@primalcore.gr'; link.textContent = translate("γράψε μας στο hello@primalcore.gr"); status.append(link, '.');
  } finally {
    if (!redirecting) { button.disabled = false; button.innerHTML = originalLabel; form.removeAttribute('aria-busy'); }
  }
});
});
// Capture only allowlisted campaign values; no tracking cookies or storage.
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const campaignQuery = new URLSearchParams(location.search);
let referrerOrigin = '';
try { referrerOrigin = new URL(document.referrer).origin; } catch {}
document.querySelectorAll('.waitlist-form').forEach(form => {
  const mobileDevice = navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const fields = { device_type: mobileDevice ? 'mobile' : 'desktop', landing_path: location.pathname, referrer_origin: referrerOrigin };
  campaignKeys.forEach(key => { if (campaignQuery.has(key)) fields[key] = campaignQuery.get(key).slice(0, 128); });
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden'; input.name = name; input.value = value;
    form.append(input);
  });
});
// A sticky scroll scene on both desktop and mobile; reduced motion keeps the poster.
const film = document.querySelector('[data-film]');
if (film) {
  const desktop = matchMedia('(min-width: 761px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let loaded = false, scheduled = false;
  function scrub() {
    scheduled = false;
    if (reduced.matches || !Number.isFinite(film.duration) || film.seeking) return;
    const stage = film.closest('.hero-film');
    const distance = stage.offsetHeight - film.parentElement.offsetHeight;
    const progress = Math.min(1, Math.max(0, (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) - stage.getBoundingClientRect().top) / Math.max(1, distance)));
    const time = progress * Math.max(0, film.duration - .05);
    if (Math.abs(film.currentTime - time) > .06) film.currentTime = time;
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(scrub); } }
  function configure() {
    film.pause();
    if (reduced.matches) { film.classList.remove('is-ready'); return; }
    const source = desktop.matches ? film.dataset.desktopSrc : film.dataset.mobileSrc;
    if (!loaded || film.getAttribute('src') !== source) { loaded = true; film.classList.remove('is-ready'); film.src = source; film.preload = 'auto'; film.load(); }
    else if (film.readyState >= 2) film.classList.add('is-ready');
    schedule();
  }
  film.addEventListener('loadeddata', () => { if (!reduced.matches) film.classList.add('is-ready'); schedule(); });
  film.addEventListener('seeked', schedule);
  film.addEventListener('error', () => film.classList.remove('is-ready'));
  addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule, { passive: true });
  desktop.addEventListener('change', configure); reduced.addEventListener('change', configure); configure();
}

// Muted, audio-free ingredient film. Retry on media readiness and natural interaction.
document.querySelectorAll('[data-loop-video]').forEach(video => {
  const frame = video.closest('[data-video-frame]');
  const toggle = frame.querySelector('.media-toggle');
  const status = document.getElementById(video.dataset.statusId);
  const name = video.dataset.videoName;
  let userPaused = false, nearViewport = false, playPending = false;
  video.defaultMuted = true; video.muted = true;
  video.setAttribute('muted', ''); video.setAttribute('playsinline', '');
  video.autoplay = true; video.loop = true; video.controls = false;
  // Pick the source explicitly: some mobile WebKit versions ignore <source media>.
  const source = [...video.querySelectorAll('source')].find(source => !source.media || matchMedia(source.media).matches);
  if (matchMedia('(max-width: 760px)').matches && video.dataset.mobilePoster) video.poster = video.dataset.mobilePoster;
  if (source) { video.src = source.getAttribute('src'); video.load(); }
  function sync() {
    toggle.setAttribute('aria-label', (video.paused ? translate("Αναπαραγωγή βίντεο ") : translate("Παύση βίντεο ")) + name);
    toggle.innerHTML = video.paused
      ? '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="m8 5 11 7-11 7Z" fill="currentColor"/></svg>'
      : '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor"/></svg>';
  }
  async function play() {
    if (playPending || userPaused || !nearViewport || document.hidden) return;
    playPending = true; status.textContent = ''; video.muted = true;
    try { await video.play(); }
    catch (error) {
      // Autoplay policy failures retry on readiness/visibility/ordinary gestures.
      // Keep the poster and pause/play control without asking visitors to press play.
      if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') status.textContent = translate("Το βίντεο δεν είναι διαθέσιμο αυτή τη στιγμή.");
    } finally { playPending = false; if (userPaused || document.hidden || !nearViewport) video.pause(); sync(); }
  }
  toggle.addEventListener('click', () => {
    if (!video.paused || playPending) { userPaused = true; video.pause(); sync(); }
    else { userPaused = false; nearViewport = true; play(); }
  });
  ['play', 'pause', 'ended'].forEach(event => video.addEventListener(event, sync));
  ['loadeddata', 'canplay'].forEach(event => video.addEventListener(event, () => { video.classList.add('is-ready'); play(); }));
  video.addEventListener('error', () => { video.classList.remove('is-ready'); status.textContent = translate("Το βίντεο δεν είναι διαθέσιμο αυτή τη στιγμή."); sync(); });
  new IntersectionObserver(entries => {
    nearViewport = entries[0].isIntersecting;
    if (nearViewport) play(); else video.pause();
  }, { threshold: .01 }).observe(video);
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else play(); });
  ['touchstart', 'touchend', 'pointerdown'].forEach(event => document.addEventListener(event, () => { if (video.paused) play(); }, { passive: true }));
  addEventListener('pageshow', play);
  sync();
});

// The testimonial waits for a deliberate click, then plays inline with audio.
document.querySelectorAll('[data-testimonial]').forEach(frame => {
  const video = frame.querySelector('video');
  const button = frame.querySelector('.testimonial-play');
  const status = frame.querySelector('.testimonial-status');
  video.controls = false;
  button.addEventListener('click', async () => {
    video.controls = true; video.muted = false; video.volume = 1; status.hidden = true;
    try { await video.play(); button.hidden = true; }
    catch { status.hidden = false; button.hidden = false; }
  });
  video.addEventListener('play', () => { button.hidden = true; status.hidden = true; });
  video.addEventListener('ended', () => { button.hidden = false; });
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

// Product photographs crossfade only while visible; pause, keyboard and swipe stay independent.
document.querySelectorAll('[data-product-gallery]').forEach(gallery => {
  const slides = [...gallery.querySelectorAll('.product-slide')];
  const previous = gallery.querySelector('[data-gallery-prev]');
  const next = gallery.querySelector('[data-gallery-next]');
  const toggle = gallery.querySelector('[data-gallery-toggle]');
  const counter = gallery.querySelector('.product-gallery-count');
  const status = gallery.querySelector('[data-gallery-status]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, timer, visible = false, userPaused = false, hovered = false, focused = false, motionOptIn = false;
  let touchStart = null;
  function syncTimer() {
    clearTimeout(timer);
    const paused = userPaused || (reduced.matches && !motionOptIn);
    toggle.setAttribute('aria-label', english ? (paused ? 'Play slideshow' : 'Pause slideshow') : (paused ? 'Αναπαραγωγή παρουσίασης' : 'Παύση παρουσίασης'));
    toggle.innerHTML = paused
      ? '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="m8 5 11 7-11 7Z" fill="currentColor"/></svg>'
      : '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    if (visible && !paused && !hovered && !focused && !document.hidden) timer = setTimeout(() => show(index + 1), 6000);
  }
  function show(nextIndex, manual = false) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.classList.toggle('is-active', i === index); slide.setAttribute('aria-hidden', String(i !== index)); });
    counter.textContent = `${index + 1} / ${slides.length}`;
    if (manual) status.textContent = english ? `Photo ${index + 1} of ${slides.length}` : `Φωτογραφία ${index + 1} από ${slides.length}`;
    syncTimer();
  }
  gallery.classList.add('is-product-slideshow');
  previous.addEventListener('click', () => show(index - 1, true));
  next.addEventListener('click', () => show(index + 1, true));
  toggle.addEventListener('click', () => { if (reduced.matches && !motionOptIn) { motionOptIn = true; userPaused = false; } else userPaused = !userPaused; focused = false; hovered = false; syncTimer(); });
  gallery.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); show(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : index + (event.key === 'ArrowLeft' ? -1 : 1), true);
  });
  gallery.addEventListener('touchstart', event => { touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }, { passive: true });
  gallery.addEventListener('touchend', event => { if (!touchStart) return; const x = event.changedTouches[0].clientX - touchStart.x, y = event.changedTouches[0].clientY - touchStart.y; if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y)) show(index + (x < 0 ? 1 : -1), true); touchStart = null; }, { passive: true });
  gallery.addEventListener('mouseenter', () => { hovered = true; syncTimer(); });
  gallery.addEventListener('mouseleave', () => { hovered = false; syncTimer(); });
  gallery.addEventListener('focusin', () => { focused = true; syncTimer(); });
  gallery.addEventListener('focusout', event => { if (!gallery.contains(event.relatedTarget)) { focused = false; syncTimer(); } });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) slides.forEach(slide => { slide.querySelector('img').loading = 'eager'; }); syncTimer(); }, { threshold: .15 }).observe(gallery);
  document.addEventListener('visibilitychange', syncTimer);
  reduced.addEventListener('change', () => { motionOptIn = false; syncTimer(); });
  show(0);
});
