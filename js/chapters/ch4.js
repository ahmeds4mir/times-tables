window.Chapter4 = (function () {
  const carries = (a, b) => {
    let c = 0;
    let n = 0;
    while (a || b) {
      c = (a % 10) + (b % 10) + c >= 10 ? 1 : 0;
      n += c;
      a = Math.floor(a / 10);
      b = Math.floor(b / 10);
    }
    return n;
  };
  const borrows = (a, b) => {
    let n = 0;
    let br = 0;
    while (a) {
      const t = (a % 10) - br;
      br = t < b % 10 ? 1 : 0;
      n += br;
      a = Math.floor(a / 10);
      b = Math.floor(b / 10);
    }
    return n;
  };

  function column(api, a, b, op, key, prompt) {
    return {
      type: 'column',
      key: `${key}${a}${op}${b}`,
      col: { a, b, op },
      answer: op === '+' ? a + b : a - b,
      prompt: prompt || (() => api.tx('نحسب رأسياً ✏️', 'Solve in columns ✏️')),
      hint: () =>
        `${api.colHtml(a, b, op, { show: true })}<p class="hint-rule">${
          op === '+'
            ? api.tx('نبدأ من الآحاد. الرقم الصغير فوق هو ما نحمله 🔴', 'Start with the ones. The small number on top is the carry 🔴')
            : api.tx('نبدأ من الآحاد. الأرقام الصغيرة فوق تبيّن ما استلفناه 🔴', 'Start with the ones. The small numbers on top show the borrowing 🔴')
        }</p>`,
    };
  }

  function addNoCarry(api) {
    let a, b;
    do {
      a = api.R(101, 799);
      b = api.R(101, 899 - a);
    } while (carries(a, b) !== 0 || b < 100);
    return column(api, a, b, '+', 'a0');
  }

  function addCarry(api) {
    let a, b;
    do {
      a = api.R(109, 789);
      b = api.R(109, 999 - a);
    } while (carries(a, b) < 1 || b < 100 || a + b > 999);
    return column(api, a, b, '+', 'a1');
  }

  function subBorrow(api) {
    let a, b;
    do {
      a = api.R(300, 999);
      b = api.R(101, a - 100);
    } while (borrows(a, b) < 1);
    return column(api, a, b, '−', 's1');
  }

  function subZero(api) {
    const a = api.R(2, 9) * 100 + api.pick([0, 0, api.R(1, 5)]);
    let b;
    do b = api.R(101, a - 50);
    while (b % 10 <= a % 10);
    return column(api, a, b, '−', 's0');
  }

  function add4(api) {
    let a, b;
    do {
      a = api.R(1000, 7999);
      b = api.R(1000, 9999 - a);
    } while (carries(a, b) < 1);
    return column(api, a, b, '+', 'a4');
  }

  function sub4(api) {
    let a, b;
    do {
      a = api.R(3000, 9999);
      b = api.R(1000, a - 500);
    } while (borrows(a, b) < 1);
    return column(api, a, b, '−', 's4');
  }

  const STORIES = [
    { op: '+', ar: (a, b) => `في المكتبة ${a} كتاباً عربياً 📗 و${b} كتاباً إنجليزياً 📘. كم كتاباً في المكتبة؟`, en: (a, b) => `The library has ${a} Arabic books 📗 and ${b} English books 📘. How many books in all?` },
    { op: '+', ar: (a, b) => `باع المخبز ${a} رغيفاً صباحاً 🥖 و${b} رغيفاً مساءً. كم رغيفاً باع؟`, en: (a, b) => `The bakery sold ${a} loaves 🥖 in the morning and ${b} in the evening. How many loaves?` },
    { op: '−', ar: (a, b) => `في الملعب ${a} مشجعاً 🏟️، خرج منهم ${b}. كم مشجعاً بقي؟`, en: (a, b) => `${a} fans 🏟️ were in the stadium and ${b} left. How many are still there?` },
    { op: '−', ar: (a, b) => `مع أبي ${a} جنيهاً 💵، اشترى حقيبة بـ ${b} جنيهاً. كم جنيهاً بقي معه؟`, en: (a, b) => `Dad had ${a} pounds 💵 and bought a bag for ${b} pounds. How much is left?` },
  ];

  function story(api) {
    const i = api.R(0, STORIES.length - 1);
    const s = STORIES[i];
    let a, b;
    do {
      a = api.R(211, 789);
      b = api.R(111, 689);
      if (s.op === '−' && b > a) [a, b] = [b, a];
    } while (
      a % 100 < 11 ||
      b % 100 < 11 ||
      (s.op === '+' ? a + b > 999 || carries(a, b) < 1 : a - b < 100 || borrows(a, b) < 1)
    );
    return column(api, a, b, s.op, `st${i}`, () => api.tx(s.ar(api.N(a), api.N(b)), s.en(a, b)));
  }

  function estimate(api) {
    let a, b;
    do {
      a = api.R(1, 6) * 100 + api.pick([-2, -1, 1, 2, 3]) * api.R(1, 4);
      b = api.R(1, 3) * 100 + api.pick([-2, -1, 1, 2, 3]) * api.R(1, 4);
    } while (a < 100 || b < 100);
    const ans = Math.round(a / 100) * 100 + Math.round(b / 100) * 100;
    return {
      key: `est${a}+${b}`,
      answer: ans,
      choices: api.shuffle([ans - 200, ans - 100, ans, ans + 100].filter((x) => x > 0).concat(ans < 300 ? [ans + 200] : []).slice(0, 4)),
      prompt: () => api.tx('الناتج أقرب إلى أي عدد؟ (نقرّب لأقرب مئة) 🎯', 'Which is the answer closest to? (Round to the nearest hundred) 🎯'),
      visual: () => api.eq([a, '+', b]),
      hint: () =>
        `<p class="hint-rule">${api.tx(`${api.N(a)} ← ${api.N(Math.round(a / 100) * 100)} و ${api.N(b)} ← ${api.N(Math.round(b / 100) * 100)}`, `${a} → ${Math.round(a / 100) * 100} and ${b} → ${Math.round(b / 100) * 100}`)}</p>
         ${api.eq([Math.round(a / 100) * 100, '+', Math.round(b / 100) * 100, '=', ans])}`,
    };
  }

  return Adventure({
    id: 'ch4',
    icon: '🏴‍☠️',
    color: '#E17055',
    title: { ar: 'الفصل الرابع: الجمع والطرح الرأسي', en: 'Chapter 4: Column Adding & Subtracting' },
    mech: { type: 'path', goal: '💰', bg: 'treasure' },
    levels: [
      {
        icon: '➕',
        color: '#E17055',
        name: { ar: 'الجمع مع الحمل', en: 'Adding with Carrying' },
        rule: {
          ar: 'نبدأ من الآحاد. إذا كان المجموع ١٠ أو أكثر نكتب الآحاد ونحمل ١ للعشرات.',
          en: 'Start with the ones. If the sum is 10 or more, write the ones and carry 1 to the tens.',
        },
        example: (api) => api.colHtml(358, 274, '+', { show: true }),
        gens: [addNoCarry, addCarry, addCarry],
        game: 'door',
      },
      {
        icon: '➖',
        color: '#0984E3',
        name: { ar: 'الطرح مع الاستلاف', en: 'Subtracting with Borrowing' },
        rule: {
          ar: 'إذا كان الرقم العلوي أصغر نستلف ١ من الخانة المجاورة فيزيد ١٠.',
          en: 'If the top digit is smaller, borrow 1 from the next column: it becomes 10 more.',
        },
        example: (api) => api.colHtml(503, 268, '−', { show: true }),
        gens: [subBorrow, subZero],
        game: 'connect',
      },
      {
        icon: '🔢',
        color: '#6C5CE7',
        name: { ar: 'أعداد من ٤ أرقام', en: '4-Digit Numbers' },
        rule: {
          ar: 'نفس الخطوات تماماً، فقط خانة جديدة: الألوف!',
          en: 'Exactly the same steps, just one more column: the thousands!',
        },
        example: (api) => api.colHtml(2675, 1348, '+', { show: true }),
        gens: [add4, sub4],
        game: 'memory',
      },
      {
        icon: '📖',
        color: '#00B894',
        name: { ar: 'مسائل وتقدير', en: 'Problems and Estimating' },
        rule: {
          ar: 'في المسألة: "كم الكل؟" ← نجمع • "كم بقي؟" ← نطرح. ونقرّب لنتأكد أن الناتج منطقي.',
          en: '"How many in all?" → add • "How many left?" → subtract. Round to check the answer makes sense.',
        },
        example: (api) => `${api.eq([398, '+', 205])}<p class="hint-rule">${api.tx('٤٠٠ + ٢٠٠ = ٦٠٠ تقريباً', 'about 400 + 200 = 600')}</p>`,
        gens: [story, story, estimate],
        game: 'reveal',
      },
    ],
  });
})();
