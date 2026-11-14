# PRIMAL CORE interface

Preserve the supplied dark, cinematic Greek identity: near-black surfaces, ivory typography, product and ingredient photography, restrained moss/olive tones. The home surface helps visitors understand the product's development status and request launch updates. Articles support reading.

Use self-hosted Google Sans with Greek and Latin subsets, 17px body text, spacious sections, and a clear type hierarchy. Use the supplied PRIMAL CORE wordmark as the home link. Benefit and ingredient descriptions follow the owner’s supplied Greek copy. Retain the product-development status.

Navigation is native links to static URLs. FAQs use native details/summary. The waitlist requests one email with unchecked explicit consent. Only confirmed Google storage may produce success. Keep errors actionable and keep entered data on failure. Avoid perpetual JavaScript animation loops. Both the uploaded 60fps hero film and the ingredient film use muted autoplay/loop with independent bottom-right pause/resume controls that preserve manual pause. Native controls remain available without JavaScript. Reduced-motion visitors start playback explicitly. Reduced motion always displays a static hero poster.

Tokens and responsive rules are in public/styles.css. Publishing headers are in netlify.toml.

## Saved owner spacing preference

Leave generous, visible space between a section heading and the list or content below it. Do not let the benefits heading touch the accordion's first rule. Use `--heading-content-gap` (56px desktop, 40px mobile), `--image-caption-gap` (24px desktop, 20px mobile), and `--heading-film-gap` (72px desktop, 48px mobile). Apply the same generous grouping principle to future surfaces; dense control labels may remain compact. Keep benefits top-aligned so opening answers never recenters its heading. The product photograph after “Χωρίς περιττά.” is an explicit exception to the rounded-image rule: it is edge-to-edge with no container inset or corners, approximately 2.40:1 on desktop, 2:1 on tablet and 4:3 on mobile. Use centered cover cropping while preserving the source image and grading; keep its caption on the normal content grid with the saved caption gap.

## Ingredient slider

Use the five headings and paragraphs supplied in Ingredients slider.md verbatim. Present one ingredient at a time with its icon, previous/next buttons and a 1 / 5 counter; support arrow keys, Home/End and touch swiping. Do not auto-advance reading slides. Reserve the maximum slide height so later sections do not jump, and show all five texts if JavaScript is unavailable.
