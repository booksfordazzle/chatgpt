# PRIMAL CORE interface

Preserve the supplied dark, cinematic Greek identity: near-black surfaces, ivory typography, product and ingredient photography, restrained moss/olive tones. The home surface helps visitors understand the product's development status and request launch updates. Articles support reading.

Use self-hosted Google Sans with Greek and Latin subsets, 17px body text, spacious sections, and a clear type hierarchy. Use the supplied PRIMAL CORE wordmark as the home link. Benefit and ingredient descriptions follow the owner’s supplied Greek copy. Retain the product-development status.

Navigation is native links to static URLs. FAQs use native details/summary. The waitlist requests one email with unchecked explicit consent. Only confirmed Google storage may produce success. Keep errors actionable and keep entered data on failure. Avoid perpetual JavaScript animation loops. The hero uses the original ia.mp4 with desktop scroll seeking and a sticky stage. Mobile, no-JavaScript and reduced-motion visitors see its static poster. The ingredient film independently uses muted autoplay/loop with a bottom-right pause/resume control preserving manual pause. Native ingredient controls remain available without JavaScript. Reduced-motion visitors start ingredient playback explicitly.

Tokens and responsive rules are in public/styles.css. Publishing headers are in netlify.toml.

The shared menu contains “Φιλοσοφία”, “Ιστορία”, “Blog” and “Επικοινωνία”, linking to `/philosophy.html`, `/about.html`, `/blog/index.html` and `/contact.html`. The about page uses “Ιστορία” in its title. The footer contact link also opens `/contact.html`. FAQ remains on the homepage and is omitted from the shared menu. The header uses its collapsible menu at widths of 1100px and below so the expanded link set fits. Route-specific cinematic composition and motion belong in [the philosophy surface brief](.impeccable/surfaces/philosophy.md), rather than becoming defaults for other pages.

## Layout

Use the shared `--page-gutter`: `max(40px, calc((100vw - 1520px)/2))` on desktop, 28px at 1100px and below, and 20px at 760px and below. Content wrappers and prose align their left edge with the wordmark; prose retains its 740px maximum reading width. Intentionally centered compositions stay centered. Contact-specific layout belongs in [the contact surface brief](.impeccable/surfaces/contact.md).

## Saved owner spacing preference

Leave generous, visible space between a section heading and the list or content below it. Do not let the benefits heading touch the accordion's first rule. Use `--heading-content-gap` (56px desktop, 40px mobile), `--image-caption-gap` (24px desktop, 20px mobile), and `--heading-film-gap` (72px desktop, 48px mobile). Apply the same generous grouping principle to future surfaces; dense control labels may remain compact. Keep benefits top-aligned so opening answers never recenters its heading. The full-width product photograph is an explicit exception to the rounded-image rule: it is edge-to-edge with no container inset or corners, approximately 2.40:1 on desktop, 2:1 on tablet and 4:3 on mobile. Use centered cover cropping while preserving the source image and grading; keep its caption on the normal content grid with the saved caption gap.

Benefit accordions retain native details/summary behavior and use a chevron that rotates 180 degrees when open.

## Ingredient slider

Use the five headings and paragraphs supplied in Ingredients slider.md verbatim. Present one ingredient at a time with its icon, previous/next buttons and a 1 / 5 counter; support arrow keys, Home/End and touch swiping. Do not auto-advance reading slides. Reserve the maximum slide height so later sections do not jump, and show all five texts if JavaScript is unavailable.

## Background

Use subtle, broad asymmetric neutral gradients from near-black to charcoal/medium gray behind the content. Preserve readable ivory text and the cinematic imagery.

## Homepage sequence

Owner-specified order: scroll hero with its own consented email signup → benefits → autoplay ingredient film with centered two-line heading → manual slider → full-width product photograph with caption → FAQ and waitlist availability form side by side immediately before the footer; stack them in that order on mobile.

Both hero and bottom signup forms submit independently through the same confirmed-storage handler; each owns unique field IDs, validation and status messages.

The shared menu contains no waitlist button. Both email fields show “Το email σου” as their placeholder.
