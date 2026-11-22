import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import nodemailer from 'nodemailer';
import {renderSkinResultMessage, skinResultMessage} from '../server/skin-result-template.mjs';
import {editorialResult, renderEditorialResult} from '../public/skin-profile/editorial-result.mjs';

import {editorialCopy} from '../public/skin-profile/editorial-copy.mjs';

const titles = {C: 'CALM', M: 'HYDRATE', A: 'SMOOTH', B: 'BALANCE', E: 'ESSENTIAL'};

test('quiz and email render the same title, guidance, and ordered photographs for each result', async () => {
  await access(new URL('../public/assets/skin-profile-wordmark.png', import.meta.url));
  for (const [primary, title] of Object.entries(titles)) {
    const result = {primary, secondary: null, habits: ['sun', 'keep']};
    const profile = editorialResult(result);
    const web = renderEditorialResult(profile, []);
    const {html, text, subject} = skinResultMessage(result, 'https://preview.example');
    assert.match(web, new RegExp(`id="result-title"[^>]*>${title}</h1>`));
    assert.match(html, new RegExp(`class="result-title"[^>]*>${title}</h1>`));
    assert.equal(subject, `Το Skin Profile σου — ${title} | PRIMAL CORE`);
    for (const content of [profile.subtitle, profile.disclaimer, 'Πρωί', 'Βράδυ', 'Τι να προσέξεις στα συστατικά', 'Η υπάρχουσα ρουτίνα σου σε καλύπτει']) {
      assert(web.includes(content));
      assert(html.includes(content));
      assert(text.includes(content));
    }
    assert(!/<script|<form|<iframe|onload=|onerror=|cid:/i.test(html));
    assert(html.includes('role="presentation"'));
    assert(html.includes('max-width:600px'));
    assert.match(html, /src="https:\/\/preview\.example\/assets\/skin-profile-wordmark\.png"[^>]+alt="PRIMAL CORE"/);
    assert.match(html, /BEEF TALLOW &amp; MASTIC/);
    const webImages = [...web.matchAll(/data-image="([^"]+)"/g)].map(match => match[1]);
    const mailImages = [...html.matchAll(/<img src="https:\/\/preview\.example\/images\/skin-profiles\/([^"]+)\.jpg"/g)].map(match => match[1]);
    assert.deepEqual(mailImages, webImages);
    for (const file of webImages) {
      for (const suffix of ['.jpg', '.webp', '-600.webp']) {
        await access(new URL(`../public/images/skin-profiles/${file}${suffix}`, import.meta.url));
      }
    }
  }
  assert.throws(() => skinResultMessage({primary: '<script>', secondary: null, habits: []}));
  assert.throws(() => skinResultMessage({primary: 'C', secondary: null, habits: []}, 'http://preview.example'));
});

test('result email MIME has HTML and plain text without attachments', async () => {
  const transport = nodemailer.createTransport({streamTransport: true, buffer: true, newline: 'unix'});
  const message = await transport.sendMail({
    from: 'hello@primalcore.gr',
    to: 'example@example.com',
    ...skinResultMessage({primary: 'B', secondary: null, habits: []})
  });
  const raw = message.message.toString();
  assert.match(raw, /multipart\/alternative/);
  assert.match(raw, /Content-Type: text\/plain; charset=utf-8/);
  assert.match(raw, /Content-Type: text\/html; charset=utf-8/);
  assert.doesNotMatch(raw, /multipart\/(mixed|related)|Content-ID:/);
  transport.close();
});

test('PROTECT is renderable for review without assigning it to a quiz answer', () => {
  const {protect} = editorialCopy;
  const web = renderEditorialResult(protect, []);
  const {html, text, subject} = renderSkinResultMessage(protect);
  assert.match(web, />PROTECT<\/h1>/);
  assert.match(html, />PROTECT<\/h1>/);
  assert.match(html, /protect\/layered-rock\.jpg/);
  assert.match(html, /src="https:\/\/primalcore\.gr\/assets\/skin-profile-wordmark\.png"[^>]+alt="PRIMAL CORE"/);
  assert.match(subject, /PROTECT/);
  assert(text.includes(protect.disclaimer));
});
