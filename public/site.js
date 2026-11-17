'use strict';
const english = document.documentElement.lang.startsWith('en');
const messages = {
  "Η εγγραφή δεν είναι διαθέσιμη σε αυτό το αρχείο. Άνοιξε τον δημοσιευμένο ιστότοπο για να εγγραφείς.": "Signup is not available in this file preview. Open the published website to join.",
  "Αποθήκευση εγγραφής…": "Saving your registration…",
  "Αποθήκευση…": "Saving…",
  "Η εγγραφή δεν επιβεβαιώθηκε. Δοκίμασε ξανά αργότερα ή ": "Registration could not be confirmed. Try again later or ",
  "γράψε μας στο ermitikos@gmail.com": "write to ermitikos@gmail.com",
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
let attributionStorage;
try { attributionStorage = window.sessionStorage; } catch {}
// Optional attribution must not prevent the hero, navigation or forms from working.
const attribution = (() => {
  try {
    if (globalThis.PrimalAttribution?.create) return globalThis.PrimalAttribution.create({ location, document, navigator, window, storage: attributionStorage });
  } catch {}
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'referrer_full', 'referrer_origin', 'landing_page', 'landing_path', 'device_type', 'os', 'browser', 'screen_width', 'viewport'];
  return { snapshot: () => Object.fromEntries(keys.map(key => [key, ''])), ready: Promise.resolve() };
})();
function populateAttributionFields(form) {
  const fields = attribution.snapshot();
  for (const [name, value] of Object.entries(fields)) {
    let input = form.querySelector(`input[name="${name}"]`);
    if (!input) { input = document.createElement('input'); input.type = 'hidden'; input.name = name; form.append(input); }
    input.value = value;
  }
  return fields;
}

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
    await attribution.ready;
    const fields = populateAttributionFields(form);
    const payload = { ...fields, email: email.value.trim(), consent: form.elements.consent.checked, lang: document.documentElement.lang, website: form.elements.website.value, source: form.elements.source.value };
    if (window.PRIMAL_DEV === true) console.log('[waitlist payload]', payload);
    const response = await fetch('/api/waitlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000)
    });
    const result = await response.json();
    if (response.status === 429) {
      status.classList.add('error');
      status.textContent = english ? 'Too many attempts. Please wait 10 minutes before trying again.' : 'Πολλές προσπάθειες. Περίμενε 10 λεπτά πριν δοκιμάσεις ξανά.';
      return;
    }
    if (!response.ok || result.ok !== true) throw new Error('Not confirmed');
    location.assign(english ? '/en/thanks.html' : '/thanks.html');
    redirecting = true;
  } catch {
    status.classList.add('error');
    status.textContent = translate("Η εγγραφή δεν επιβεβαιώθηκε. Δοκίμασε ξανά αργότερα ή ");
    const link = document.createElement('a'); link.href = 'mailto:ermitikos@gmail.com'; link.textContent = translate("γράψε μας στο ermitikos@gmail.com"); status.append(link, '.');
  } finally {
    if (!redirecting) { button.disabled = false; button.innerHTML = originalLabel; form.removeAttribute('aria-busy'); }
  }
});
});
// One capture shared by both forms, refreshed for current viewport on submit.
document.querySelectorAll('.waitlist-form').forEach(populateAttributionFields);
attribution.ready.then(() => document.querySelectorAll('.waitlist-form').forEach(populateAttributionFields));
// Responsive silent autoplay hero. Text advances once with playback, never scroll.
const film = document.querySelector('[data-film]');
if (film) {
  const scene = film.closest('.hero-film');
  const title = scene.querySelector('#hero-title');
  const signup = scene.querySelector('.hero-signup');
  const toggle = scene.querySelector('[data-hero-toggle]');
  const desktop = matchMedia('(min-width: 761px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let viewportWidth = innerWidth, finishedIntro = false, userPaused = false;
  let nearViewport = true, playPending = false, generation = 0, frameTask = null, loadTimer;
  const captureViewport = () => {
    const root = document.documentElement;
    root.style.setProperty('--hero-viewport-height', `${innerHeight}px`);
    root.classList.toggle('hero-viewport-medium', innerHeight <= 950);
    root.classList.toggle('hero-viewport-short', innerHeight <= 800);
    root.classList.toggle('hero-viewport-small', innerHeight <= 650);
  };
  function alignHeadings() {
    const heading = signup.querySelector('#hero-waitlist-title');
    const offset = heading.offsetTop + heading.offsetHeight / 2 - signup.offsetHeight / 2;
    scene.style.setProperty('--hero-heading-offset', `${offset}px`);
  }
  function paint(titleOpacity, signupOpacity, shade) {
    scene.style.setProperty('--hero-title-opacity', String(titleOpacity));
    scene.style.setProperty('--hero-signup-opacity', String(signupOpacity));
    scene.style.setProperty('--hero-shade-opacity', String(shade));
    signup.inert = signupOpacity < .05;
    title.setAttribute('aria-hidden', String(titleOpacity < .01));
  }
  function finishIntro() { finishedIntro = true; paint(0, 1, 1); }
  function readableFallback() {
    clearTimeout(loadTimer);
    if (finishedIntro && !reduced.matches) { finishIntro(); return; }
    scene.classList.remove('has-timed-reveal');
    scene.classList.add('is-hero-static');
    signup.inert = false;
    title.removeAttribute('aria-hidden');
  }
  function updateReveal() {
    if (reduced.matches || scene.classList.contains('is-hero-static')) return;
    if (finishedIntro) { finishIntro(); return; }
    const duration = Number.isFinite(film.duration) && film.duration > 0 ? film.duration : 10;
    const time = film.currentTime;
    const fps = Number(desktop.matches ? film.dataset.desktopFps : film.dataset.mobileFps);
    const start = Math.max(0, duration - 200 / fps);
    const phase = Math.min(1, Math.max(0, (time - start) / Math.max(.01, duration - .05 - start)));
    const ease = value => { const t = Math.min(1, Math.max(0, value)); return t * t * (3 - 2 * t); };
    const titleIn = ease((time - Math.max(0, start - 1.25)) / (.18 * Math.max(.01, duration - .05 - start)));
    const titleOut = ease((phase - .4) / .15);
    const signupIn = ease((phase - .62) / .2);
    paint(titleIn * (1 - titleOut), signupIn, titleIn);
    if (signupIn >= .999) finishIntro();
  }
  function syncToggle() {
    toggle.hidden = reduced.matches || Boolean(film.error);
    const paused = film.paused;
    toggle.setAttribute('aria-label', english ? (paused ? 'Play background video' : 'Pause background video') : (paused ? 'Αναπαραγωγή βίντεο φόντου' : 'Παύση βίντεο φόντου'));
    toggle.innerHTML = paused
      ? '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="m8 5 11 7-11 7Z" fill="currentColor"/></svg>'
      : '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor"/></svg>';
  }
  function cancelFrames() {
    if (frameTask === null) return;
    if (film.cancelVideoFrameCallback) film.cancelVideoFrameCallback(frameTask);
    else cancelAnimationFrame(frameTask);
    frameTask = null;
  }
  function tick() {
    frameTask = null;
    updateReveal();
    if (film.paused || reduced.matches || document.hidden || !nearViewport || finishedIntro || scene.classList.contains('is-hero-static')) return;
    frameTask = film.requestVideoFrameCallback ? film.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
  }
  async function playHero() {
    if (reduced.matches || userPaused || !nearViewport || document.hidden || playPending || film.error) return;
    const currentGeneration = generation;
    playPending = true;
    film.muted = true;
    try { await film.play(); }
    catch { if (currentGeneration === generation) readableFallback(); }
    finally { if (currentGeneration === generation) { playPending = false; syncToggle(); } }
  }
  function configure() {
    generation++; playPending = false; cancelFrames(); clearTimeout(loadTimer);
    film.pause(); film.defaultMuted = true; film.muted = true; film.playsInline = true;
    film.loop = true; film.autoplay = !reduced.matches && !userPaused; film.controls = false;
    captureViewport(); alignHeadings();
    if (reduced.matches) { readableFallback(); syncToggle(); return; }
    scene.classList.remove('is-hero-static'); scene.classList.add('has-timed-reveal');
    if (finishedIntro) finishIntro(); else paint(0, 0, 0);
    const source = desktop.matches ? film.dataset.desktopSrc : film.dataset.mobileSrc;
    film.poster = desktop.matches ? film.dataset.desktopPoster : film.dataset.mobilePoster;
    if (film.getAttribute('src') !== source) { film.classList.remove('is-ready'); film.src = source; film.preload = 'auto'; film.load(); }
    loadTimer = setTimeout(() => { if (film.readyState < 3 || film.paused) readableFallback(); }, 6000);
    playHero(); syncToggle();
  }
  film.addEventListener('playing', () => { if (userPaused || reduced.matches || document.hidden || !nearViewport) { film.pause(); return; } clearTimeout(loadTimer); film.classList.add('is-ready'); cancelFrames(); tick(); syncToggle(); });
  film.addEventListener('pause', () => { cancelFrames(); syncToggle(); });
  film.addEventListener('timeupdate', updateReveal);
  film.addEventListener('loadedmetadata', updateReveal);
  film.addEventListener('waiting', () => { clearTimeout(loadTimer); loadTimer = setTimeout(() => { if (film.readyState < 3) readableFallback(); }, 6000); });
  film.addEventListener('canplay', playHero);
  film.addEventListener('error', () => { cancelFrames(); film.classList.remove('is-ready'); readableFallback(); syncToggle(); });
  toggle.addEventListener('click', () => {
    if (!film.paused || playPending) { userPaused = true; film.autoplay = false; film.pause(); finishIntro(); }
    else { userPaused = false; film.autoplay = true; playHero(); }
  });
  // Never hide/reposition an active email field when the background loops.
  signup.addEventListener('focusin', () => { if (scene.classList.contains('has-timed-reveal')) finishIntro(); });
  new IntersectionObserver(entries => {
    nearViewport = entries[0].isIntersecting;
    if (nearViewport) playHero(); else film.pause();
  }, { threshold: .01 }).observe(scene);
  document.addEventListener('visibilitychange', () => { if (document.hidden) film.pause(); else playHero(); });
  ['touchstart', 'pointerdown'].forEach(event => scene.addEventListener(event, () => { if (film.paused) playHero(); }, { passive: true }));
  addEventListener('resize', () => {
    if (innerWidth !== viewportWidth || !matchMedia('(pointer: coarse)').matches) { viewportWidth = innerWidth; captureViewport(); }
    alignHeadings();
  }, { passive: true });
  addEventListener('pageshow', playHero);
  if (typeof ResizeObserver === 'function') new ResizeObserver(alignHeadings).observe(signup);
  document.fonts.ready.then(alignHeadings);
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

// Industry first, testimonial second; load the second film only on selection.
document.querySelectorAll('[data-testimonial]').forEach(frame => {
  const video = frame.querySelector('video');
  const button = frame.querySelector('.testimonial-play');
  const status = frame.querySelector('.testimonial-status');
  const navigation = frame.querySelector('[data-testimonial-navigation]');
  const films = [{ src: video.getAttribute('src'), poster: video.getAttribute('poster'), label: video.getAttribute('aria-label') }];
  if (frame.dataset.nextVideoSrc) films.push({ src: frame.dataset.nextVideoSrc, poster: frame.dataset.nextVideoPoster, label: english ? 'Play testimonial with sound' : 'Μαρτυρία PRIMAL CORE με ήχο' });
  let index = 0, selection = 0;
  video.controls = false;
  async function playSelected() {
    const currentSelection = selection;
    // Keep native controls from shading the picture during playback.
    video.controls = false; video.muted = false; video.volume = 1; status.hidden = true;
    try { await video.play(); if (currentSelection === selection) button.hidden = true; }
    catch { if (currentSelection === selection) { video.controls = true; status.hidden = false; button.hidden = false; } }
  }
  button.addEventListener('click', playSelected);
  if (navigation && films.length > 1) {
    navigation.hidden = false;
    const count = navigation.querySelector('.testimonial-count');
    navigation.querySelector('.testimonial-next').addEventListener('click', () => {
      video.pause();
      index = (index + 1) % films.length;
      selection++;
      video.src = films[index].src; video.poster = films[index].poster;
      video.setAttribute('aria-label', films[index].label);
      button.setAttribute('aria-label', english ? 'Play video with sound' : 'Αναπαραγωγή βίντεο με ήχο');
      button.hidden = false; status.hidden = true;
      count.textContent = `${index + 1} / ${films.length}`;
      count.setAttribute('aria-label', `${english ? 'Video' : 'Βίντεο'} ${index + 1} ${english ? 'of' : 'από'} ${films.length}`);
      video.load();
      // Keep the selected film in view rather than its below-video switch.
      const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) || 0;
      if (matchMedia('(max-width: 760px)').matches) {
        // Center the picture itself, excluding Next, padding and scroll margins.
        requestAnimationFrame(() => {
          const rect = video.getBoundingClientRect();
          const viewport = window.visualViewport;
          const center = viewport ? viewport.offsetTop + viewport.height / 2 : innerHeight / 2;
          window.scrollTo({ top: window.scrollY + rect.top + rect.height / 2 - center, behavior: 'instant' });
        });
      } else if (frame.getBoundingClientRect().top < headerHeight) frame.scrollIntoView({ block: 'start', behavior: 'instant' });
      playSelected();
    });
  }
  video.addEventListener('play', () => { video.controls = false; button.hidden = true; status.hidden = true; });
  // A tap can pause without the native shaded overlay; the play button resumes.
  video.addEventListener('click', () => { if (!video.paused) { video.pause(); button.hidden = false; } });
  video.addEventListener('ended', () => { video.controls = true; button.hidden = false; });
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
  const allSlides = [...gallery.querySelectorAll('.product-slide')];
  const mobileViewport = matchMedia('(max-width: 760px)');
  const currentSlides = () => allSlides.filter(slide => !slide.dataset.galleryViewport || slide.dataset.galleryViewport === (mobileViewport.matches ? 'mobile' : 'desktop'));
  let slides = currentSlides();
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
    allSlides.forEach(slide => { const active = slide === slides[index]; slide.classList.toggle('is-active', active); slide.setAttribute('aria-hidden', String(!active)); });
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
  mobileViewport.addEventListener('change', () => { slides = currentSlides(); if (visible) slides.forEach(slide => { slide.querySelector('img').loading = 'eager'; }); show(0); });
  show(0);
});

// Contact spam verification runs on FormSubmit, followed by a branded return page.
document.querySelectorAll('[data-contact-form]').forEach(form => {
  if (/^https?:$/.test(location.protocol)) {
    const next = document.createElement('input'); next.type = 'hidden'; next.name = '_next';
    next.value = new URL(english ? '/en/contact-sent' : '/contact-sent', location.origin).href; form.append(next);
  }
  form.addEventListener('submit', event => {
    const status = form.querySelector('[data-contact-status]');
    if (form.querySelector('[name="_honey"]').value) {
      event.preventDefault();
      status.dataset.state = 'error';
      status.textContent = english ? 'Please reload the page and try again.' : 'Ανανέωσε τη σελίδα και δοκίμασε ξανά.';
      return;
    }
    status.dataset.state = 'pending';
    status.textContent = english ? 'Continuing to spam verification…' : 'Συνέχεια στον έλεγχο ανεπιθύμητων μηνυμάτων…';
  });
});

// Open the confirmation film only after the visitor explicitly chooses to watch.
const confirmationVideoLink = document.querySelector('[data-confirmation-video-open]');
const confirmationVideoDialog = document.querySelector('#confirmation-video-dialog');
if (confirmationVideoLink && confirmationVideoDialog && typeof confirmationVideoDialog.showModal === 'function') {
  const video = confirmationVideoDialog.querySelector('[data-confirmation-video]');
  const status = confirmationVideoDialog.querySelector('.confirmation-video-status');
  // Native controls darken the opening frames; reveal them only when playback ends.
  const hidePlaybackControls = () => { video.controls = false; status.hidden = true; };
  video.addEventListener('play', hidePlaybackControls);
  video.addEventListener('ended', () => { video.controls = true; });
  confirmationVideoLink.addEventListener('click', event => {
    event.preventDefault();
    if (!video.getAttribute('src')) { video.src = video.dataset.src; video.load(); }
    video.playsInline = true;
    hidePlaybackControls();
    confirmationVideoDialog.showModal();
    document.documentElement.classList.add('has-confirmation-video');
    status.hidden = true;
    video.play().catch(() => {
      video.controls = true;
      status.textContent = english ? 'Select Play in the video controls to start.' : 'Πάτησε αναπαραγωγή στα χειριστήρια του βίντεο.';
      status.hidden = false;
    });
  });
  confirmationVideoDialog.querySelector('.confirmation-video-close').addEventListener('click', () => confirmationVideoDialog.close());
  confirmationVideoDialog.addEventListener('click', event => { if (event.target === confirmationVideoDialog) confirmationVideoDialog.close(); });
  confirmationVideoDialog.addEventListener('close', () => {
    video.pause();
    if (Number.isFinite(video.duration)) video.currentTime = 0;
    document.documentElement.classList.remove('has-confirmation-video');
    confirmationVideoLink.focus({ preventScroll: true });
  });
}
