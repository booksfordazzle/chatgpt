'use strict';
const story = document.querySelector('.philosophy-page');
if (story) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = [...story.querySelectorAll('.story-scene')];
  const links = [...story.querySelectorAll('.scene-navigation a')];
  const origin = story.querySelector('.origin-scene');
  const originImage = story.querySelector('.origin-image');
  const subtraction = story.querySelector('.subtraction-scene');
  const subtractionFrame = story.querySelector('.subtraction-frame');
  const complexity = story.querySelector('.complexity-copy');
  const essence = story.querySelector('.essence-lockup');
  const bottles = [...story.querySelectorAll('.clutter-bottle')];
  const returnScene = story.querySelector('.return-scene');
  const returnImage = story.querySelector('.return-visual img');
  const manifesto = story.querySelector('.manifesto-scene');
  const manifestoImage = story.querySelector('.manifesto-image');
  const positions = [
    [9,18,-20,.9],[88,19,18,.85],[22,83,15,.9],[79,83,-15,.9],
    [34,8,-8,.7],[65,10,12,.75],[3,63,-24,1],[97,64,22,1],
    [40,78,-7,.8],[59,77,8,.8],[26,42,-12,.75],[74,42,14,.75]
  ];
  const clamp = value => Math.max(0, Math.min(1, value));
  let scheduled = false;
  let active = -1;
  function update() {
    scheduled = false;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) || 88;
    let nextActive = 0;
    scenes.forEach((scene, index) => { if (scene.getBoundingClientRect().top <= header + innerHeight * .45) nextActive = index; });
    if (nextActive !== active) {
      links.forEach((link, index) => { if (index === nextActive) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
      active = nextActive;
    }
    if (reduced.matches) return;
    const originProgress = clamp(-origin.getBoundingClientRect().top / origin.offsetHeight);
    originImage.style.transform = `translateY(${originProgress * 18}px) scale(${1.03 + originProgress * .05})`;
    const p = clamp((header - subtraction.getBoundingClientRect().top) / Math.max(1, subtraction.offsetHeight - subtractionFrame.offsetHeight));
    const withdrawal = clamp((p - .38) / .42);
    bottles.forEach((bottle, index) => {
      const [x, y, rotation, scale] = positions[index];
      const appearance = clamp((p - index * .021) / .12);
      bottle.style.left = `${x}%`;
      bottle.style.top = `${y}%`;
      bottle.style.right = 'auto'; bottle.style.bottom = 'auto';
      bottle.style.opacity = String(appearance * (1 - withdrawal) * .76);
      bottle.style.transform = `translate(-50%,-50%) translate(${(x - 50) * withdrawal * 5}px,${(y - 50) * withdrawal * 4}px) rotate(${rotation}deg) scale(${scale * (.6 + appearance * .4)})`;
      bottle.style.filter = `brightness(.9) blur(${withdrawal * 10}px)`;
    });
    const exit = clamp((p - .42) / .17);
    complexity.style.opacity = String(1 - exit);
    complexity.style.filter = `blur(${exit * 8}px)`;
    const arrival = clamp((p - .62) / .2);
    essence.style.opacity = String(arrival);
    essence.style.filter = `blur(${(1 - arrival) * 14}px)`;
    essence.style.transform = `translate(-50%,calc(-50% + ${(1 - arrival) * 20}px))`;
    const returnProgress = returnScene ? clamp((innerHeight - returnScene.getBoundingClientRect().top) / (innerHeight + returnScene.offsetHeight)) : 0;
    if (returnImage) returnImage.style.clipPath = `inset(0 ${(1 - returnProgress) * 16}% 0 0)`;
    const productProgress = clamp((innerHeight - manifesto.getBoundingClientRect().top) / (innerHeight * .8));
    manifestoImage.style.filter = `brightness(${.4 + productProgress * .6})`;
    subtraction.dataset.progress = p.toFixed(3);
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
  function configure() {
    story.classList.toggle('has-story-motion', !reduced.matches);
    [originImage, complexity, essence, returnImage, manifestoImage, ...bottles].forEach(element => element?.removeAttribute('style'));
    schedule();
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', configure);
  document.fonts.ready.then(schedule);
  configure();
}
