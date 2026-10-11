// Builds audio/<lang>/<chapter>.mp3 from js/intros.js using Google Translate's voice.
// Usage: node tools/make-voices.mjs [chapterKey ...]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';

const window = {};
vm.runInNewContext(readFileSync(new URL('../js/intros.js', import.meta.url), 'utf8'), { window });
const only = process.argv.slice(2);

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

for (const [key, langs] of Object.entries(window.INTROS)) {
  if (only.length && !only.includes(key)) continue;
  for (const lang of ['ar', 'en']) {
    const text = (langs[lang].say || langs[lang].text).replace(/\p{Extended_Pictographic}|\uFE0F/gu, '').trim();
    const buffers = [];
    for (const part of chunks(text)) buffers.push(await tts(part, lang));
    const dir = new URL(`../audio/${lang}/`, import.meta.url);
    mkdirSync(dir, { recursive: true });
    writeFileSync(new URL(`${key}.mp3`, dir), Buffer.concat(buffers));
    console.log(`${lang}/${key}.mp3  ${buffers.length} parts`);
  }
}
