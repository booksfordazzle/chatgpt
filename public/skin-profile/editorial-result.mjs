import {disclaimer, habits, identities, profiles, resultStories} from './content.mjs';
import {editorialCopy, imageDescriptions} from './editorial-copy.mjs';

const resultProfiles = {C: 'calm', M: 'hydrate', A: 'smooth', B: 'balance'};
const assetRoot = './images/skin-profiles/';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, character =>
  ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[character]
);

const inlineMarkup = text => escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const paragraphs = items => items.map(text => ['p', text]);

function existingEssential() {
  const identity = identities.E;
  const profile = profiles.E;
  const story = resultStories.E;
  return {
    title: identity.title,
    subtitle: identity.subtitle,
    hero: 'shared/essential-stone',
    intro: paragraphs([identity.intro, profile.reason]),
    sections: [
      {title: 'Κατανόησε την επιδερμίδα σου', blocks: paragraphs(story.explanation)},
      {title: story.actionTitle, blocks: paragraphs(story.actions)},
      {title: 'Τι μπορείς να περιμένεις;', blocks: paragraphs(story.expectations)},
      {title: 'Η καθημερινή σου ρουτίνα', blocks: [['h3', 'Πρωί'], ['ul', profile.morning], ['h3', 'Βράδυ'], ['ul', profile.evening]]},
      {title: 'Τι να προσέξεις στα συστατικά', blocks: paragraphs(profile.ingredients.map(([name, text]) => `**${name}:** ${text}`))}
    ],
    disclaimer
  };
}

export function editorialResult(result) {
  const profile = resultProfiles[result.primary]
    ? editorialCopy[resultProfiles[result.primary]]
    : existingEssential();
  const guidance = result.habits.length
    ? [{title: 'Με βάση την καθημερινή σου ρουτίνα', blocks: paragraphs(result.habits.map(id => habits[id]))}]
    : [];
  return {...profile, sections: [...profile.sections, ...guidance]};
}

export function renderBlocks(blocks, styles = {}) {
  const attributes = tag => styles[tag] ? ` style="${styles[tag]}"` : '';
  return blocks.map(([tag, value]) =>
    tag === 'ul'
      ? `<ul${attributes('ul')}>${value.map(text => `<li${attributes('li')}>${inlineMarkup(text)}</li>`).join('')}</ul>`
      : `<${tag}${attributes(tag)}>${inlineMarkup(value)}</${tag}>`
  ).join('');
}

export function editorialImage(file) {
  return {path: assetRoot + file, alt: imageDescriptions[file]};
}

function webImage(file, eager = false) {
  const {path, alt} = editorialImage(file);
  return `<figure class="skin-editorial-image" data-image="${file}"><img src="${path}.webp" srcset="${path}-600.webp 600w, ${path}.webp 1200w" sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 960px) calc(100vw - 56px), 900px" width="1200" height="900" alt="${escapeHtml(alt)}" ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"'}></figure>`;
}

export function renderEditorialResult(profile, summary) {
  return `<article class="skin-editorial" aria-labelledby="result-title">
    <header class="skin-editorial-copy skin-editorial-heading">
      <h1 id="result-title" tabindex="-1">${escapeHtml(profile.title)}</h1>
      <p class="skin-editorial-subtitle">${escapeHtml(profile.subtitle)}</p>
    </header>
    ${webImage(profile.hero, true)}
    <div class="skin-editorial-copy skin-editorial-intro">
      ${renderBlocks(profile.intro)}
      <details><summary>Τι μας έδειξαν οι απαντήσεις σου</summary>${renderBlocks(paragraphs(summary))}</details>
    </div>
    ${profile.sections.map(({title, blocks, image}) => `
      ${image ? webImage(image) : ''}
      <section class="skin-editorial-copy skin-editorial-section">
        <h2>${escapeHtml(title)}</h2>
        ${renderBlocks(blocks)}
      </section>`).join('')}
    <aside id="result-final-note" class="skin-editorial-copy skin-editorial-disclaimer" aria-label="Σημείωση για τα αποτελέσματα">
      <p>${escapeHtml(profile.disclaimer)}</p>
      <p id="quiz-save-status" role="status"></p>
    </aside>
  </article>`;
}
