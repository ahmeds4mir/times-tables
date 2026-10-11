window.Chapter7 = (function () {
  const line = (api, ar, en, tokens) =>
    `<div class="step-line"><span class="step-tag">${api.tx(ar, en)}</span>${api.eq(tokens)}</div>`;
  const ask = (api) => api.tx('احسب في رأسك بسرعة! ⚡', 'Work it out in your head! ⚡');

  function addHint(api, a, b) {
    const ta = a - (a % 10);
    const tb = b - (b % 10);
    return (
      line(api, 'العشرات', 'Tens', [ta, '+', tb, '=', ta + tb]) +
      line(api, 'الآحاد', 'Ones', [a % 10, '+', b % 10, '=', (a % 10) + (b % 10)]) +
      line(api, 'المجموع', 'Total', [ta + tb, '+', (a % 10) + (b % 10), '=', a + b])
    );
  }

  function add(api, carry) {
    let a, b;
    do {
      a = api.R(12, 78);
      b = api.R(12, 99 - a);
    } while (((a % 10) + (b % 10) >= 10) !== carry || b < 11);
    const sum = a + b;
    const forgot = sum - 10;
    return {
      key: `add${a}+${b}`,
      answer: sum,
      choices: api.opts(sum, [forgot, sum + 10, sum + 1, sum - 1]),
      prompt: () => ask(api),
      visual: () => api.eq([a, '+', b, '=', '?']),
      hint: () => addHint(api, a, b),
    };
  }

  function sub(api, borrow) {
    let a, b;
    do {
      a = api.R(31, 98);
      b = api.R(11, a - 10);
    } while ((a % 10 < b % 10) !== borrow);
    const d = a - b;
    const tb = b - (b % 10);
    return {
      key: `sub${a}-${b}`,
      answer: d,
      choices: api.opts(d, [d + 10, d - 10, d + 2, Math.abs((a % 10) - (b % 10)) + (Math.floor(a / 10) - Math.floor(b / 10)) * 10]),
      prompt: () => ask(api),
      visual: () => api.eq([a, '−', b, '=', '?']),
      hint: () =>
        line(api, 'أولاً العشرات', 'Tens first', [a, '−', tb, '=', a - tb]) + line(api, 'ثم الآحاد', 'Then the ones', [a - tb, '−', b % 10, '=', d]),
    };
  }

  function to100(api) {
    let a;
    do a = api.R(11, 89);
    while (a % 10 === 0);
    const up = 10 - (a % 10);
    const next = a + up;
    const ans = 100 - a;
    const form = api.R(0, 1);
    return {
      key: `h${form}/${a}`,
      answer: ans,
      choices: api.opts(ans, [ans + 10, ans - 10, 110 - a, 90 - a]),
      prompt: () => (form ? ask(api) : api.tx('كم نحتاج لنصل إلى ١٠٠؟ 💯', 'How many more to make 100? 💯')),
      visual: () => api.eq(form ? [100, '−', a, '=', '?'] : [a, '+', '?', '=', 100]),
      hint: () =>
        line(api, 'إلى العشرة التالية', 'To the next ten', [a, '+', up, '=', next]) +
        line(api, 'ثم إلى ١٠٠', 'Then to 100', [next, '+', 100 - next, '=', 100]) +
        line(api, 'المجموع', 'Altogether', [up, '+', 100 - next, '=', ans]),
    };
  }

  function tens(api) {
    const plus = api.R(0, 1) === 0;
    let a, b;
    do {
      a = api.R(11, 79);
      b = api.R(11, plus ? 99 - a : a - 5);
    } while (b < 11 || a % 10 === 0 || b % 10 === 0);
    const ans = plus ? (a + b) * 10 : (a - b) * 10;
    const tw = api.tx('عشرة', 'tens');
    return {
      key: `t${plus}${a}/${b}`,
      answer: ans,
      choices: api.opts(ans, [ans + 100, ans - 100, ans / 10, ans + 10]),
      prompt: () => ask(api),
      visual: () => api.eq([a * 10, plus ? '+' : '−', b * 10, '=', '?']),
      hint: () =>
        `<p class="hint-rule">${api.tx('نعدّ بالعشرات ثم نضع صفراً:', 'Count in tens, then add a zero:')}</p>
        ${api.eq([a, tw, plus ? '+' : '−', b, tw, '=', plus ? a + b : a - b, tw])}${api.eq([plus ? a + b : a - b, tw, '=', ans])}`,
    };
  }

  function smart(api) {
    let a, c;
    do {
      a = api.R(11, 59);
      c = (10 - (a % 10)) % 10 + api.R(1, 3) * 10;
    } while (a % 10 === 0 || a + c > 80);
    const b = api.R(11, 99 - a - c);
    const ans = a + b + c;
    return {
      key: `sm${a}/${b}/${c}`,
      answer: ans,
      choices: api.opts(ans, [ans + 10, ans - 10, ans + 1]),
      prompt: () => api.tx('هناك طريقة ذكية! أي عددين نجمعهما أولاً؟ 🧠', "There's a smart way! Which two numbers go first? 🧠"),
      visual: () => api.eq([a, '+', b, '+', c, '=', '?']),
      hint: () =>
        line(api, 'أولاً', 'First', [a, '+', c, '=', a + c]) + line(api, 'ثم', 'Then', [a + c, '+', b, '=', ans]),
    };
  }

  return Adventure({
    id: 'ch7',
    icon: '🏎️',
    color: '#E84393',
    title: { ar: 'الفصل السابع: الحساب الذهني', en: 'Chapter 7: Mental Math' },
    mech: { type: 'race', rival: '🦊', goal: '🏆', bg: 'track' },
    levels: [
      {
        icon: '➕',
        color: '#E84393',
        name: { ar: 'الجمع الذهني', en: 'Adding in Your Head' },
        rule: { ar: 'نجمع العشرات معاً، ثم الآحاد معاً، ثم نجمع الناتجين.', en: 'Add the tens, add the ones, then put them together.' },
        example: (api) => addHint(api, 37, 25),
        gens: [(api) => add(api, false), (api) => add(api, true)],
      },
      {
        icon: '➖',
        color: '#0984E3',
        name: { ar: 'الطرح الذهني', en: 'Subtracting in Your Head' },
        rule: { ar: 'نطرح العشرات أولاً، ثم نطرح الآحاد.', en: 'Take away the tens first, then the ones.' },
        example: (api) => line(api, 'أولاً العشرات', 'Tens first', [72, '−', 30, '=', 42]) + line(api, 'ثم الآحاد', 'Then the ones', [42, '−', 8, '=', 34]),
        gens: [(api) => sub(api, false), (api) => sub(api, true)],
      },
      {
        icon: '💯',
        color: '#00B894',
        name: { ar: 'تكوين المئة', en: 'Making 100' },
        rule: { ar: 'نقفز إلى العشرة التالية، ثم بالعشرات حتى ١٠٠.', en: 'Hop to the next ten, then jump by tens to 100.' },
        example: (api) => line(api, 'إلى العشرة التالية', 'To the next ten', [65, '+', 5, '=', 70]) + line(api, 'ثم إلى ١٠٠', 'Then to 100', [70, '+', 30, '=', 100]),
        gens: [to100],
      },
      {
        icon: '🧠',
        color: '#6C5CE7',
        name: { ar: 'العشرات والطرق الذكية', en: 'Tens and Smart Tricks' },
        rule: {
          ar: '٣٤٠ + ٢٧٠ = ٣٤ عشرة + ٢٧ عشرة = ٦١ عشرة = ٦١٠. ونجمع الأعداد التي تكوّن عشرات أولاً.',
          en: '340 + 270 = 34 tens + 27 tens = 61 tens = 610. And add numbers that make a ten first.',
        },
        example: (api) => line(api, 'أولاً', 'First', [45, '+', 15, '=', 60]) + line(api, 'ثم', 'Then', [60, '+', 38, '=', 98]),
        gens: [tens, smart],
      },
    ],
  });
})();
