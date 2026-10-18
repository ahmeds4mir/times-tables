window.Chapter6 = (function () {
  const SETS = [
    {
      ar: 'الفاكهة المفضلة',
      en: 'Favourite fruit',
      cats: [
        { e: '🍎', ar: 'التفاح', en: 'Apples' },
        { e: '🍌', ar: 'الموز', en: 'Bananas' },
        { e: '🍊', ar: 'البرتقال', en: 'Oranges' },
        { e: '🍇', ar: 'العنب', en: 'Grapes' },
      ],
    },
    {
      ar: 'الحيوان المفضل',
      en: 'Favourite animal',
      cats: [
        { e: '🐶', ar: 'الكلب', en: 'Dogs' },
        { e: '🐱', ar: 'القطة', en: 'Cats' },
        { e: '🐰', ar: 'الأرنب', en: 'Rabbits' },
        { e: '🐦', ar: 'العصفور', en: 'Birds' },
      ],
    },
    {
      ar: 'الرياضة المفضلة',
      en: 'Favourite sport',
      cats: [
        { e: '⚽', ar: 'كرة القدم', en: 'Football' },
        { e: '🏀', ar: 'كرة السلة', en: 'Basketball' },
        { e: '🏊', ar: 'السباحة', en: 'Swimming' },
        { e: '🚴', ar: 'الدراجة', en: 'Cycling' },
      ],
    },
  ];

  function tallySvg(n) {
    const groups = Math.ceil(n / 5);
    let s = `<svg class="tally" viewBox="0 0 ${groups * 40 + 8} 56" dir="ltr" aria-hidden="true">`;
    for (let g = 0; g < groups; g++) {
      const x0 = 12 + g * 40;
      const count = Math.min(5, n - g * 5);
      for (let i = 0; i < Math.min(count, 4); i++) s += `<line x1="${x0 + i * 7}" y1="8" x2="${x0 + i * 7}" y2="48"/>`;
      if (count === 5) s += `<line class="slash" x1="${x0 - 6}" y1="42" x2="${x0 + 27}" y2="14"/>`;
    }
    return `${s}</svg>`;
  }

  function barSvg(api, set, vals, scale) {
    const top = Math.ceil((Math.max(...vals) + 1) / scale) * scale;
    const steps = top / scale;
    const ph = 130;
    const y = (v) => 140 - (v / top) * ph;
    let s = `<svg class="bars" viewBox="0 0 300 176" dir="ltr" aria-hidden="true">`;
    for (let k = 0; k <= steps; k++) {
      const v = k * scale;
      s += `<line class="grid" x1="40" y1="${y(v)}" x2="292" y2="${y(v)}"/><text class="axis" x="34" y="${y(v)}">${api.N(v)}</text>`;
    }
    const bw = 252 / vals.length;
    vals.forEach((v, i) => {
      const x = 40 + i * bw + bw * 0.22;
      s += `<rect class="bar b${i}" x="${x}" y="${y(v)}" width="${bw * 0.56}" height="${140 - y(v)}" rx="4"/>`;
      s += `<text class="bar-emoji" x="${x + bw * 0.28}" y="162">${set.cats[i].e}</text>`;
    });
    return `${s}</svg>`;
  }

  function tableHtml(api, set, vals) {
    const rows = set.cats
      .map((c, i) => `<tr><td>${c.e} ${api.tx(c.ar, c.en)}</td><td>${api.N(vals[i])}</td></tr>`)
      .join('');
    return `<table class="data-table"><caption>${api.tx(set.ar, set.en)}</caption><tbody>${rows}</tbody></table>`;
  }

  function distinctVals(api, n, lo, hi, step) {
    const pool = api.shuffle(Array.from({ length: hi - lo + 1 }, (_, i) => (lo + i) * step));
    return pool.slice(0, n);
  }

  // Shared question shapes for a table or a graph of four categories.
  function dataQuestion(api, key, set, vals, visual, step) {
    const ask = api.R(0, 3);
    const i = api.R(0, 3);
    let j = api.R(0, 3);
    if (j === i) j = (i + 1) % 4;
    const maxI = vals.indexOf(Math.max(...vals));
    const minI = vals.indexOf(Math.min(...vals));
    const name = (k) => `${set.cats[k].e} ${api.tx(set.cats[k].ar, set.cats[k].en)}`;
    const sum = vals.reduce((a, b) => a + b, 0);
    const [hi, lo] = vals[i] > vals[j] ? [i, j] : [j, i];
    const common = { visual, key: `${key}${ask}/${vals.join(',')}/${i}/${j}` };
    if (ask === 0)
      return {
        ...common,
        answer: vals[i],
        choices: api.opts(vals[i], [vals[i] + step, vals[i] - step, vals[j]]),
        prompt: () => api.tx(`كم تلميذاً اختار ${name(i)}؟`, `How many pupils chose ${name(i)}?`),
        hint: () => `<p class="hint-rule">${api.tx(`ننظر إلى ${name(i)} ونقرأ العدد: ${api.N(vals[i])}`, `Find ${name(i)} and read the number: ${vals[i]}`)}</p>${visual()}`,
      };
    if (ask === 1) {
      const most = api.R(0, 1) === 0;
      return {
        ...common,
        key: common.key + most,
        answer: most ? maxI : minI,
        choices: api.shuffle([0, 1, 2, 3]),
        label: name,
        prompt: () => (most ? api.tx('ما الاختيار الأكثر؟ 🥇', 'Which was chosen the most? 🥇') : api.tx('ما الاختيار الأقل؟', 'Which was chosen the least?')),
        hint: () =>
          `<p class="hint-rule">${most ? api.tx('الأكثر = أكبر عدد (أطول عمود)', 'Most = biggest number (tallest bar)') : api.tx('الأقل = أصغر عدد (أقصر عمود)', 'Least = smallest number (shortest bar)')}</p>${visual()}`,
      };
    }
    if (ask === 2)
      return {
        ...common,
        answer: vals[hi] - vals[lo],
        choices: api.opts(vals[hi] - vals[lo], [vals[hi] + vals[lo], vals[hi], vals[lo], vals[hi] - vals[lo] + step]),
        prompt: () => api.tx(`كم يزيد ${name(hi)} عن ${name(lo)}؟`, `How many more chose ${name(hi)} than ${name(lo)}?`),
        hint: () => api.eq([vals[hi], '−', vals[lo], '=', vals[hi] - vals[lo]]),
      };
    return {
      ...common,
      answer: sum,
      choices: api.opts(sum, [sum + step, sum - step, sum + 10, sum - vals[0]]),
      prompt: () => api.tx('كم تلميذاً شارك في الاستطلاع كله؟', 'How many pupils answered in total?'),
      hint: () => api.eq([vals[0], '+', vals[1], '+', vals[2], '+', vals[3], '=', sum]),
    };
  }

  function tally(api) {
    const n = api.R(6, 24);
    const e = api.pick(SETS).cats[api.R(0, 3)].e;
    return {
      key: `tl${n}`,
      answer: n,
      choices: api.opts(n, [n + 5, n - 5, n + 1, n - 1]),
      prompt: () => api.tx(`عددنا ${e} بالعلامات. كم العدد؟`, `We counted ${e} with tally marks. How many?`),
      visual: () => tallySvg(n),
      hint: () => {
        const fives = Math.floor(n / 5);
        const counts = Array.from({ length: fives }, (_, k) => api.N((k + 1) * 5)).join('، ');
        return `${tallySvg(n)}<p class="hint-rule">${api.tx(`نعدّ بالخمسات: ${counts} ثم نضيف ${api.N(n % 5)} ← ${api.N(n)}`, `Count in fives: ${counts.replace(/، /g, ', ')} then add ${n % 5} → ${n}`)}</p>`;
      },
    };
  }

  function table(api) {
    const set = api.pick(SETS);
    const vals = distinctVals(api, 4, 2, 15, 1);
    return dataQuestion(api, 'tb', set, vals, () => tableHtml(api, set, vals), 1);
  }

  function graph(api, scales) {
    const set = api.pick(SETS);
    const scale = api.pick(scales);
    const vals = distinctVals(api, 4, 1, scale === 1 ? 10 : 9, scale);
    const q = dataQuestion(api, `g${scale}`, set, vals, () => barSvg(api, set, vals, scale), scale);
    const prompt = q.prompt;
    q.prompt = () => `${prompt()}${scale > 1 ? `<br><small>${api.tx(`كل خط = ${api.N(scale)}`, `each line = ${scale}`)}</small>` : ''}`;
    return q;
  }

  return Adventure({
    id: 'ch6',
    icon: '📊',
    color: '#00B894',
    title: { ar: 'الفصل السادس: الجداول والرسوم البيانية', en: 'Chapter 6: Tables and Graphs' },
    mech: { type: 'climb', token: '🎈', goal: '🌈', bg: 'sky' },
    levels: [
      {
        icon: '✋',
        color: '#00B894',
        name: { ar: 'العدّ بالعلامات', en: 'Tally Marks' },
        rule: { ar: 'كل ٤ خطوط يقطعها خط خامس مائل = ٥. نعدّ بالخمسات!', en: 'Four lines crossed by a fifth = 5. Count in fives!' },
        example: (api) => `${tallySvg(13)}<p class="hint-rule">${api.tx('٥، ١٠، ثم ٣ ← ١٣', '5, 10, then 3 → 13')}</p>`,
        gens: [tally],
        game: 'reveal',
      },
      {
        icon: '📋',
        color: '#0984E3',
        name: { ar: 'قراءة الجدول', en: 'Reading a Table' },
        rule: { ar: 'نبحث عن الصف المطلوب ونقرأ العدد بجانبه. ونجمع كل الأعداد لنعرف المجموع.', en: 'Find the row and read its number. Add all the numbers to get the total.' },
        example: (api) => tableHtml(api, SETS[0], [7, 4, 9, 5]),
        gens: [table],
        game: 'memory',
      },
      {
        icon: '📊',
        color: '#E17055',
        name: { ar: 'الأعمدة البيانية', en: 'Bar Graphs' },
        rule: { ar: 'نتتبع أعلى العمود إلى الأرقام على الجانب. العمود الأطول هو الأكثر.', en: 'Follow the top of the bar across to the numbers. The tallest bar is the most.' },
        example: (api) => barSvg(api, SETS[1], [6, 3, 8, 5], 1),
        gens: [(api) => graph(api, [1, 2])],
        game: 'sort',
      },
      {
        icon: '🔟',
        color: '#6C5CE7',
        name: { ar: 'مقياس الرسم', en: 'Graph Scales' },
        rule: { ar: 'أحياناً كل خط = ٥ أو ١٠. نعدّ الخطوط بالقفز: ١٠، ٢٠، ٣٠…', en: 'Sometimes each line = 5 or 10. Skip-count the lines: 10, 20, 30…' },
        example: (api) => barSvg(api, SETS[2], [40, 20, 70, 50], 10),
        gens: [(api) => graph(api, [5, 10]), (api) => graph(api, [2, 5])],
        game: 'race',
      },
    ],
  });
})();
