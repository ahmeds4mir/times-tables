window.Chapter9 = (function () {
  const PLACES = {
    ar: ['آحاد', 'عشرات', 'مئات', 'ألوف', 'عشرات ألوف', 'مئات ألوف'],
    en: ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'],
  };
  const place = (api, p) => (api.ar ? PLACES.ar : PLACES.en)[p];

  function chart(api, n, highlight = -1) {
    const s = String(n);
    const len = s.length;
    const head = Array.from({ length: len }, (_, i) => `<th class="${len - 1 - i === highlight ? 'hl' : ''}">${place(api, len - 1 - i)}</th>`).join('');
    const row = s
      .split('')
      .map((d, i) => `<td class="${len - 1 - i === highlight ? 'hl' : ''}">${api.digit(Number(d))}</td>`)
      .join('');
    return `<table class="pv-chart" dir="ltr"><tr>${head}</tr><tr>${row}</tr></table>`;
  }

  function distinctNumber(api, len) {
    const digits = api.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    if (digits[0] === 0) [digits[0], digits[1]] = [digits[1], digits[0]];
    return Number(digits.slice(0, len).join(''));
  }

  function valueOf(api) {
    const len = api.R(5, 6);
    const n = distinctNumber(api, len);
    const s = String(n);
    let p;
    do p = api.R(0, len - 1);
    while (s[len - 1 - p] === '0');
    const d = Number(s[len - 1 - p]);
    const others = api.shuffle(Array.from({ length: len }, (_, k) => k).filter((k) => k !== p)).slice(0, 3);
    return {
      key: `v${n}/${p}`,
      answer: d * 10 ** p,
      choices: api.shuffle([p, ...others].map((k) => d * 10 ** k)),
      prompt: () => api.tx(`ما قيمة الرقم ${api.digit(d)} في هذا العدد؟`, `What is the value of the digit ${d} in this number?`),
      visual: () => `<div class="big-num">${api.N(n)}</div>`,
      hint: () =>
        `${chart(api, n, p)}<p class="hint-rule">${api.tx(
          `الرقم ${api.digit(d)} في خانة ${place(api, p)} ← قيمته ${api.N(d * 10 ** p)}`,
          `${d} is in the ${place(api, p)} place → its value is ${d * 10 ** p}`
        )}</p>`,
    };
  }

  function compose(api) {
    const digits = [api.R(1, 9), api.R(0, 9), api.R(0, 9), api.R(0, 9), api.R(0, 9)];
    if (!digits.slice(1).includes(0)) digits[api.R(1, 4)] = 0;
    const n = Number(digits.join(''));
    const parts = digits.map((d, i) => ({ d, p: 4 - i })).filter((x) => x.d);
    const squeezed = Number(parts.map((x) => x.d).join(''));
    const shifted = n * 10;
    const swapped = Number([digits[1] || digits[0], digits[0], ...digits.slice(2)].join('')) || n + 1000;
    const extras = [squeezed, shifted, swapped, n + 10000, n + 1000].filter((x) => x !== n);
    return {
      key: `c${n}`,
      answer: n,
      choices: api.opts(n, extras),
      prompt: () =>
        api.tx('ما العدد المكوّن من:', 'Which number is made of:') +
        `<br><b>${parts.map((x) => `${api.N(x.d)} ${place(api, x.p)}`).join(api.tx('، ', ', '))}</b>`,
      hint: () =>
        `${chart(api, n)}<p class="hint-rule">${api.tx('الخانة الفارغة نكتب فيها صفراً ٠', 'An empty place gets a zero 0')}</p>`,
    };
  }

  function biggest(api) {
    const base = api.R(10, 98) * 1000 + api.R(0, 999);
    const most = api.R(0, 1) === 0;
    const set = new Set([base]);
    for (const delta of api.shuffle([1, 10, 100, 1000, 10000, -1, -10, -100, -1000])) {
      if (set.size >= 4) break;
      const x = base + delta * api.R(1, 4);
      if (x >= 10000 && x <= 99999) set.add(x);
    }
    const nums = [...set];
    const answer = most ? Math.max(...nums) : Math.min(...nums);
    return {
      key: `b${most}${nums.join()}`,
      answer,
      choices: api.shuffle(nums),
      prompt: () => (most ? api.tx('أي عدد هو الأكبر؟ 🐘', 'Which number is the biggest? 🐘') : api.tx('أي عدد هو الأصغر؟ 🐭', 'Which number is the smallest? 🐭')),
      hint: () =>
        `<p class="hint-rule">${api.tx(
          'نقارن من اليسار: أولاً عشرات الألوف، ثم الألوف… أول رقم مختلف يحدد الأكبر.',
          'Compare from the left: ten thousands first, then thousands… the first different digit decides.'
        )}</p><p class="hint-rule">${api.shuffle(nums)
          .sort((a, b) => (most ? b - a : a - b))
          .map((x) => api.N(x))
          .join(' ، ')}</p>`,
    };
  }

  function lineSvg(api, start, step, k) {
    let s = `<svg class="numline" viewBox="0 0 320 84" dir="ltr" aria-hidden="true"><line class="nl-axis" x1="10" y1="44" x2="310" y2="44"/>`;
    for (let i = 0; i <= 10; i++) {
      const x = 20 + i * 28;
      s += `<line class="nl-tick${i % 5 === 0 ? ' big' : ''}" x1="${x}" y1="${i % 5 === 0 ? 32 : 37}" x2="${x}" y2="${i % 5 === 0 ? 56 : 51}"/>`;
      if (i % 5 === 0) s += `<text class="nl-num" x="${x}" y="76">${api.N(start + i * step)}</text>`;
    }
    if (k != null) {
      const x = 20 + k * 28;
      s += `<polygon class="nl-arrow" points="${x - 8},6 ${x + 8},6 ${x},28"/>`;
    }
    return `${s}</svg>`;
  }

  function numberLine(api) {
    const step = api.pick([1000, 10000]);
    const start = step === 1000 ? api.R(1, 9) * 10000 : api.R(1, 8) * 100000;
    let k;
    do k = api.R(1, 9);
    while (k === 5);
    const ans = start + k * step;
    return {
      key: `nl${start}/${step}/${k}`,
      answer: ans,
      choices: api.opts(ans, [ans + step, ans - step, start + k * (step / 10)]),
      prompt: () => api.tx('ما العدد عند السهم؟ 🎯', 'Which number is at the arrow? 🎯'),
      visual: () => lineSvg(api, start, step, k),
      hint: () =>
        `<p class="hint-rule">${api.tx(
          `كل قفزة = ${api.N(step)}. السهم بعد ${api.N(start)} بـ ${api.N(k)} قفزات`,
          `Each jump = ${step}. The arrow is ${k} jumps after ${start}`
        )}</p>${api.eq([start, '+', k, '×', step, '=', ans])}`,
    };
  }

  function times10(api) {
    const v = api.R(0, 2);
    const a = v === 1 ? api.R(2, 99) : api.R(2, 999);
    const forms = [
      { tokens: [a, '×', 10, '=', '?'], answer: a * 10, ar: '× ١٠ ← نضع صفراً واحداً على اليمين', en: '× 10 → put one zero on the right' },
      { tokens: [a, '×', 100, '=', '?'], answer: a * 100, ar: '× ١٠٠ ← نضع صفرين على اليمين', en: '× 100 → put two zeros on the right' },
      { tokens: [a * 10, '÷', 10, '=', '?'], answer: a, ar: '÷ ١٠ ← نحذف صفراً من اليمين', en: '÷ 10 → take one zero off the right' },
    ][v];
    return {
      key: `x${v}/${a}`,
      answer: forms.answer,
      choices: api.opts(forms.answer, [a * 10, a * 100, a * 1000, a].filter((x) => x !== forms.answer)),
      prompt: () => api.tx('سهلة إذا عرفنا السر! 🪄', 'Easy when you know the secret! 🪄'),
      visual: () => api.eq(forms.tokens),
      hint: () => `<p class="hint-rule">💡 ${api.tx(forms.ar, forms.en)}</p>${api.eq(forms.tokens, api.N(forms.answer))}`,
    };
  }

  return Adventure({
    id: 'ch9',
    icon: '🚀',
    color: '#6C5CE7',
    title: { ar: 'الفصل التاسع: الأعداد الكبيرة', en: 'Chapter 9: Big Numbers' },
    mech: { type: 'climb', token: '🚀', goal: '🌕', bg: 'space' },
    levels: [
      {
        icon: '🏠',
        color: '#6C5CE7',
        name: { ar: 'القيمة المكانية', en: 'Place Value' },
        rule: { ar: 'كل رقم له بيت (خانة)، وقيمته تتغير حسب بيته.', en: 'Every digit lives in a place, and its value depends on that place.' },
        example: (api) => `${chart(api, 473258, 4)}<p class="hint-rule">${api.tx('الرقم ٧ قيمته ٧٠٬٠٠٠', 'The 7 is worth 70,000')}</p>`,
        gens: [valueOf, compose],
      },
      {
        icon: '⚖️',
        color: '#E17055',
        name: { ar: 'المقارنة', en: 'Comparing' },
        rule: { ar: 'نقارن الأرقام من اليسار. أول رقم مختلف يحدد العدد الأكبر.', en: 'Compare digits from the left. The first different digit decides.' },
        example: (api) => `<div class="big-num">${api.N(45213)}</div><div class="big-num">${api.N(45876)}</div><p class="hint-rule">${api.tx('٢ أصغر من ٨ في خانة المئات ← العدد الثاني أكبر', '2 is less than 8 in the hundreds → the second is bigger')}</p>`,
        gens: [biggest],
      },
      {
        icon: '📍',
        color: '#00B894',
        name: { ar: 'خط الأعداد', en: 'The Number Line' },
        rule: { ar: 'نعرف كم تساوي القفزة الواحدة، ثم نعدّ القفزات.', en: 'Find what one jump is worth, then count the jumps.' },
        example: (api) => lineSvg(api, 30000, 1000, 3),
        gens: [numberLine],
      },
      {
        icon: '🪄',
        color: '#E84393',
        name: { ar: 'الضرب في ١٠ و ١٠٠', en: 'Times 10 and 100' },
        rule: { ar: '× ١٠ نضع صفراً، × ١٠٠ نضع صفرين، ÷ ١٠ نحذف صفراً.', en: '× 10 add a zero, × 100 add two zeros, ÷ 10 take a zero away.' },
        example: (api) => `${api.eq([34, '×', 10, '=', 340])}${api.eq([34, '×', 100, '=', 3400])}${api.eq([340, '÷', 10, '=', 34])}`,
        gens: [times10, numberLine],
      },
    ],
  });
})();
