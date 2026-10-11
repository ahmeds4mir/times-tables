// Builds audio/<lang>/<chapter>.mp3 from js/intros.js and audio/<lang>/mom-<lesson>-<step>.mp3
// from js/mom.js using Google Translate's voice.
// Usage: node tools/make-voices.mjs [key ...]   (keys like ch3 or mom-swap)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';

const window = {};
for (const file of ['intros.js', 'mom.js']) {
  vm.runInNewContext(readFileSync(new URL(`../js/${file}`, import.meta.url), 'utf8'), { window });
}
const only = process.argv.slice(2);

// Google reads Western digits more reliably than Arabic-Indic ones.
const westernDigits = (s) => s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660));

const clips = [];
for (const [key, langs] of Object.entries(window.INTROS)) {
  for (const lang of ['ar', 'en']) clips.push({ key, lang, name: key, text: langs[lang].say || langs[lang].text });
}
for (const [lesson, { steps }] of Object.entries(window.Mom.LESSONS)) {
  steps.forEach((s, i) => {
    clips.push({ key: `mom-${lesson}`, lang: 'ar', name: `mom-${lesson}-${i}`, text: s.sayAr || s.ar });
    clips.push({ key: `mom-${lesson}`, lang: 'en', name: `mom-${lesson}-${i}`, text: s.sayEn || s.en });
  });
}

// Google accepts about 200 characters per request, so long texts are sent sentence by sentence.
function chunks(text) {
  const parts = text.split(/(?<=[.!?؟،,:])\s+/);
  const out = [];
  for (const p of parts) {
    if (out.length && (out[out.length - 1] + ' ' + p).length <= 180) out[out.length - 1] += ' ' + p;
    else out.push(p);
  }
  return out;
}

async function tts(text, lang) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (attempt >= 4) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

for (const { key, lang, name, text: raw } of clips) {
  if (only.length && !only.includes(key)) continue;
  const text = westernDigits(raw.replace(/\p{Extended_Pictographic}|\uFE0F/gu, '').trim());
  const buffers = [];
  for (const part of chunks(text)) buffers.push(await tts(part, lang));
  const dir = new URL(`../audio/${lang}/`, import.meta.url);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL(`${name}.mp3`, dir), Buffer.concat(buffers));
  console.log(`${lang}/${name}.mp3  ${buffers.length} parts`);
}
