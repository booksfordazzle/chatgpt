'use strict';
// Sticky frames use the same scroll distance model as the Philosophy bottle scene.
// No perpetual animation loop. Static markup stays fully readable without this file.
(() => {
  const chapters = [...document.querySelectorAll('[data-scroll-chapter]')];
  if (!chapters.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const chapterLinks = [...document.querySelectorAll('.history-navigation a')];
  let pending = false;
  function render() {
    pending = false;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) || 88;
    let active = 0;
    chapters.forEach((chapter, index) => {
      const rect = chapter.getBoundingClientRect();
      if (rect.top < header + innerHeight * .45) active = index;
      if (reduced.matches || !chapter.classList.contains('is-scroll-chapter') || rect.top > innerHeight || rect.bottom < header) return;
      const frame = chapter.querySelector('.chapter-frame');
      const progress = Math.max(0, Math.min(1, (header - rect.top) / Math.max(1, chapter.offsetHeight - frame.offsetHeight)));
      chapter.style.setProperty('--chapter-progress', progress.toFixed(4));
    });
    chapterLinks.forEach((link, index) => { if (index === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(render); } }
  function configure() {
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) || 88;
    chapters.forEach(chapter => {
      chapter.classList.remove('is-scroll-chapter');
      chapter.style.removeProperty('--chapter-progress');
      if (reduced.matches) return;
      const content = chapter.querySelector('.chapter-content');
      const naturalHeight = content.getBoundingClientRect().height;
      const available = innerHeight - header;
      // Long text on a small/landscape screen stays a normal reading chapter.
      // Never trap content below a viewport-sized sticky frame.
      if (naturalHeight > available + 4) return;
      chapter.style.setProperty('--chapter-frame-height', available + 'px');
      chapter.style.setProperty('--chapter-height', (available + innerHeight * (chapter.dataset.beat === 'ancestry' ? 1.7 : 1.25)) + 'px');
      chapter.classList.add('is-scroll-chapter');
    });
    schedule();
  }
  addEventListener('scroll', schedule, { passive: true });
  let resizePending = false;
  addEventListener('resize', () => { if (!resizePending) { resizePending = true; requestAnimationFrame(() => { resizePending = false; configure(); }); } });
  reduced.addEventListener('change', configure);
  document.fonts.ready.then(configure);
  configure();
})();
