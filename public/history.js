const historyPage = document.querySelector('.history-page');
if (historyPage) {
  const historyScenes = [...historyPage.querySelectorAll('.history-scene')];
  const historyLinks = [...historyPage.querySelectorAll('.history-navigation a')];
  const historyReduced = matchMedia('(prefers-reduced-motion: reduce)');
  let historyPending = false;
  function renderHistory() {
    historyPending = false;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) || 88;
    let active = 0;
    historyScenes.forEach((scene, index) => {
      const rect = scene.getBoundingClientRect();
      if (rect.top <= header + innerHeight * .45) active = index;
      const image = scene.querySelector('.history-visual img');
      if (!image) return;
      if (historyReduced.matches) { image.style.removeProperty('transform'); return; }
      if (rect.top < innerHeight && rect.bottom > 0) {
        const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
        image.style.transform = `translateY(${(progress - .5) * 12}px) scale(${1.03 + progress * .025})`;
      }
    });
    historyLinks.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  function queueHistory() { if (!historyPending) { historyPending = true; requestAnimationFrame(renderHistory); } }
  addEventListener('scroll', queueHistory, { passive: true });
  addEventListener('resize', queueHistory);
  historyReduced.addEventListener('change', queueHistory);
  document.fonts.ready.then(queueHistory);
  queueHistory();
}
