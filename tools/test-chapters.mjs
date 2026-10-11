// Runs every chapter 3–10 question generator many times in both languages and checks
// that answers are among the choices, choices are distinct, and no text is broken.
// Usage: node tools/test-chapters.mjs [runs]
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const RUNS = Number(process.argv[2] || 400);
const sandbox = {
  window: {},
  document: { addEventListener() {}, getElementById: () => null },
  Profile: { isGirl: false, strings: (t, l) => t[l], heroImg: () => '' },
  Sounds: {},
  Voice: {},
  UI: {},
  Confetti: {},
  console,
};
sandbox.window = sandbox;
vm.createContext(sandbox);
const load = (f) => vm.runInContext(readFileSync(new URL(`../js/${f}`, import.meta.url), 'utf8'), sandbox, { filename: f });
load('engine.js');
const chapters = [3, 4, 5, 6, 7, 8, 9, 10];
chapters.forEach((n) => load(`chapters/ch${n}.js`));

const fmt = { ar: new Intl.NumberFormat('ar-EG'), en: new Intl.NumberFormat('en-US') };
let problems = 0;
let checked = 0;
const fail = (where, msg) => {
  if (problems++ < 30) console.log(`✗ ${where}: ${msg}`);
};

for (const n of chapters) {
  const ch = sandbox[`Chapter${n}`];
  const { LEVELS, api } = ch._test;
  for (const lang of ['ar', 'en']) {
    const ctx = { lang: () => lang, num: (x) => fmt[lang].format(x), starsHtml: () => '' };
    for (let lvl = 0; lvl < LEVELS.length; lvl++) {
      ch._test.buildQuestions(lvl, ctx);
      if (!LEVELS[lvl].mixed) {
        const ex = LEVELS[lvl].example(api);
        if (/undefined|NaN/.test(ex)) fail(`ch${n} L${lvl + 1} example ${lang}`, ex.slice(0, 120));
      }
      for (let r = 0; r < RUNS; r++) {
        const qs = ch._test.buildQuestions(lvl, ctx);
        if (qs.length !== 8) fail(`ch${n} L${lvl + 1}`, `got ${qs.length} questions`);
        for (const q of qs) {
          checked++;
          const where = `ch${n} L${lvl + 1} ${q.key} ${lang}`;
          if (q.type === 'column') {
            const { a, b, op } = q.col;
            const want = op === '+' ? a + b : op === '−' ? a - b : a * b;
            if (want !== q.answer || q.answer < 0) fail(where, `column answer ${q.answer} != ${want}`);
          } else {
            if (!q.choices || q.choices.length < 3) fail(where, `only ${q.choices && q.choices.length} choices`);
            else if (!q.choices.includes(q.answer)) fail(where, `answer ${q.answer} not in ${q.choices}`);
            else if (new Set(q.choices).size !== q.choices.length) fail(where, `duplicate choices ${q.choices}`);
            const labels = q.choices.map((v) => (q.label ? q.label(v) : api.N(v)));
            if (new Set(labels).size !== labels.length) fail(where, `duplicate labels ${labels}`);
            if (q.choices.some((v) => typeof v === 'number' && (v < 0 || !Number.isInteger(v)))) fail(where, `bad choice ${q.choices}`);
          }
          const text = [q.prompt(), q.visual ? q.visual() : '', q.hint()].join(' ');
          if (/undefined|NaN|\[object/.test(text)) fail(where, text.slice(0, 160));
        }
      }
    }
  }
}
console.log(problems ? `${problems} problems in ${checked} questions` : `ALL OK (${checked} questions)`);
process.exit(problems ? 1 : 0);
