window.Chapter3 = (function () {
  const ITEMS = ['🍬', '🍪', '🍓', '🎈', '⭐', '🍊'];
  const BAGS = [
    { e: '🛍️', ar: 'كيس', arQ: 'كيساً', en: 'bag', enPl: 'bags' },
    { e: '📦', ar: 'صندوق', arQ: 'صندوقاً', en: 'box', enPl: 'boxes' },
    { e: '🧺', ar: 'سلة', arQ: 'سلة', en: 'basket', enPl: 'baskets' },
  ];
  const kids = (api, k) => api.tx(k === 2 ? 'طفلين' : `${api.N(k)} أطفال`, `${k} children`);
  const because = (api, a, b, c) =>
    `<p class="hint-rule">${api.tx(`لأن ${api.N(a)} × ${api.N(b)} = ${api.N(c)}`, `because ${a} × ${b} = ${c}`)}</p>`;

  function share(api) {
    const k = api.R(2, 5);
    const q = api.R(2, 6);
    const t = k * q;
    const e = api.pick(ITEMS);
    return {
      key: `share${t}/${k}`,
      answer: q,
      choices: api.opts(q, [k, t - k, q + 2]),
      prompt: () =>
        api.tx(
          `نوزّع ${api.N(t)} ${e} على ${kids(api, k)} بالتساوي. كم يأخذ كل طفل؟`,
          `Share ${t} ${e} equally among ${kids(api, k)}. How many does each child get?`
        ),
      visual: () => `${api.emojis(e, t)}<div class="emo-kids">${api.emojis('🧒', k)}</div>`,
      hint: () => `${api.groups(k, q, e)}${api.eq([t, '÷', k, '=', q])}${because(api, k, q, t)}`,
    };
  }

  function group(api) {
    const size = api.R(2, 6);
    const count = api.R(2, 6);
    const t = size * count;
    const e = api.pick(ITEMS);
    const bag = api.pick(BAGS);
    return {
      key: `group${t}/${size}`,
      answer: count,
      choices: api.opts(count, [size, t - size, count + 2]),
      prompt: () =>
        api.tx(
          `عندنا ${api.N(t)} ${e}، نضع ${api.N(size)} في كل ${bag.ar} ${bag.e}. كم ${bag.arQ} نحتاج؟`,
          `We have ${t} ${e} and put ${size} in each ${bag.en} ${bag.e}. How many ${bag.enPl} do we need?`
        ),
      visual: () => api.emojis(e, t),
      hint: () => `${api.groups(count, size, e)}${api.eq([t, '÷', size, '=', count])}${because(api, size, count, t)}`,
    };
  }

  function fact(api) {
    const d = api.R(2, 9);
    const q = api.R(1, 9);
    const t = d * q;
    return {
      key: `fact${t}/${d}`,
      answer: q,
      choices: api.opts(q, [d, q + 1, q - 1, t - d]),
      prompt: () => api.tx('ما ناتج القسمة؟ 🤔', 'What is the answer? 🤔'),
      visual: () => api.eq([t, '÷', d, '=', '?']),
      hint: () =>
        `${api.eq([d, '×', '?', '=', t], api.N(q))}<p class="hint-rule">${api.tx(
          `نبحث في جدول ${api.N(d)} عن ${api.N(t)}، فنجد ${api.N(d)} × ${api.N(q)}`,
          `Look for ${t} in the ${d} times table: ${d} × ${q}`
        )}</p>`,
    };
  }

  function family(api) {
    const a = api.R(2, 9);
    let b = api.R(2, 9);
    if (a === b) b = b === 9 ? 3 : b + 1;
    const c = a * b;
    return {
      key: `fam${a}x${b}`,
      answer: b,
      choices: api.opts(b, [a, c, b + 1]),
      prompt: () => api.tx(`نعرف أن ${api.N(a)} × ${api.N(b)} = ${api.N(c)}. إذن:`, `We know ${a} × ${b} = ${c}. So:`),
      visual: () => api.eq([c, '÷', a, '=', '?']),
      hint: () =>
        `<p class="hint-rule">${api.tx('القسمة عكس الضرب: نفس الأعداد الثلاثة!', 'Division undoes multiplication: the same three numbers!')}</p>
        ${api.eq([a, '×', b, '=', c])}${api.eq([c, '÷', a, '=', b])}${api.eq([c, '÷', b, '=', a])}`,
    };
  }

  function special(api) {
    const n = api.R(2, 9);
    const v = api.R(0, 2);
    const forms = [
      { tokens: [n, '÷', 1, '=', '?'], answer: n, ar: 'أي عدد ÷ ١ = العدد نفسه', en: 'Any number ÷ 1 = the same number' },
      { tokens: [n, '÷', n, '=', '?'], answer: 1, ar: 'أي عدد ÷ نفسه = ١', en: 'Any number ÷ itself = 1' },
      { tokens: [0, '÷', n, '=', '?'], answer: 0, ar: 'صفر ÷ أي عدد = ٠ (لا يوجد شيء نوزّعه)', en: '0 ÷ any number = 0 (nothing to share)' },
    ][v];
    return {
      key: `sp${v}/${n}`,
      answer: forms.answer,
      choices: api.opts(forms.answer, [0, 1, n, n * n].filter((x) => x !== forms.answer)),
      prompt: () => api.tx('حالة خاصة! ✨', 'A special case! ✨'),
      visual: () => api.eq(forms.tokens),
      hint: () => `<p class="hint-rule">${api.tx(forms.ar, forms.en)}</p>`,
    };
  }

  function missing(api) {
    const d = api.R(2, 9);
    const q = api.R(2, 9);
    const t = d * q;
    const dividend = api.R(0, 1) === 0;
    return {
      key: `miss${dividend}${t}/${d}`,
      answer: dividend ? t : d,
      choices: dividend ? api.opts(t, [d + q, t + d, t - d]) : api.opts(d, [q, t - q, d + 1]),
      prompt: () => api.tx('ما العدد المخفي في الصندوق؟ 📦', 'What number is hiding in the box? 📦'),
      visual: () => api.eq(dividend ? ['?', '÷', d, '=', q] : [t, '÷', '?', '=', q]),
      hint: () =>
        dividend
          ? `<p class="hint-rule">${api.tx('نضرب لنعرف العدد الكلي:', 'Multiply to find the total:')}</p>${api.eq([d, '×', q, '=', t])}`
          : `<p class="hint-rule">${api.tx('نسأل جدول الضرب:', 'Ask the times table:')}</p>${api.eq(['?', '×', q, '=', t], api.N(d))}`,
    };
  }

  const STORIES = [
    (api, a, b) => ({
      t: a * b,
      ar: `اشترينا ${api.N(a)} أقلام ✏️ بـ ${api.N(a * b)} جنيهاً. كم ثمن القلم الواحد؟`,
      en: `We bought ${a} pencils ✏️ for ${a * b} pounds. How much is one pencil?`,
      d: a,
      ans: b,
    }),
    (api, a, b) => ({
      t: a * b,
      ar: `كتاب فيه ${api.N(a * b)} صفحة 📖، نقرأ ${api.N(a)} صفحات كل يوم. في كم يوماً ننهيه؟`,
      en: `A book has ${a * b} pages 📖. We read ${a} pages a day. How many days to finish it?`,
      d: a,
      ans: b,
    }),
    (api, a, b) => ({
      t: 4 * b,
      ar: `في الحديقة ${api.N(4 * b)} رِجلاً للقطط 🐱. كم قطة في الحديقة؟`,
      en: `There are ${4 * b} cat legs 🐱 in the garden. How many cats?`,
      d: 4,
      ans: b,
    }),
    (api, a, b) => ({
      t: a * b,
      ar: `${api.N(a * b)} لاعباً ⚽ نقسمهم إلى فرق، في كل فريق ${api.N(a)}. كم فريقاً؟`,
      en: `${a * b} players ⚽ split into teams of ${a}. How many teams?`,
      d: a,
      ans: b,
    }),
  ];

  function story(api) {
    const i = api.R(0, STORIES.length - 1);
    const a = api.R(3, 9);
    const b = api.R(4, 9);
    const s = STORIES[i](api, a, b);
    return {
      key: `story${i}/${a}/${b}`,
      answer: s.ans,
      choices: api.opts(s.ans, [s.d, s.t - s.d, s.ans + 2]),
      prompt: () => api.tx(STORIES[i](api, a, b).ar, STORIES[i](api, a, b).en),
      visual: () => api.eq([s.t, '÷', s.d, '=', '?']),
      hint: () => `${api.eq([s.t, '÷', s.d, '=', s.ans])}${because(api, s.d, s.ans, s.t)}`,
    };
  }

  return Adventure({
    id: 'ch3',
    icon: '🍬',
    color: '#FF6FB5',
    title: { ar: 'الفصل الثالث: القسمة', en: 'Chapter 3: Division' },
    mech: { type: 'fill', token: '🍬', container: '🫙', goal: '🎉', bg: 'party' },
    levels: [
      {
        icon: '🧁',
        color: '#FF6FB5',
        name: { ar: 'التوزيع بالتساوي', en: 'Sharing Equally' },
        rule: {
          ar: 'نوزّع واحدة لكل طفل، ثم واحدة أخرى… حتى ينتهي كل شيء. كل طفل يأخذ نفس العدد.',
          en: 'Give one to each child, then another… until none are left. Everyone gets the same.',
        },
        example: (api) => `${api.groups(3, 4, '🍬')}${api.eq([12, '÷', 3, '=', 4])}`,
        gens: [share, group],
      },
      {
        icon: '✖️',
        color: '#4A90FF',
        name: { ar: 'القسمة وجدول الضرب', en: 'Division and the Times Table' },
        rule: {
          ar: 'لنعرف ٢٤ ÷ ٦ نسأل: ٦ × كم = ٢٤؟ الجواب ٤.',
          en: 'To find 24 ÷ 6 ask: 6 × what = 24? The answer is 4.',
        },
        example: (api) => `${api.eq([24, '÷', 6, '=', '?'], api.N(4))}${api.eq([6, '×', 4, '=', 24])}`,
        gens: [fact, family],
      },
      {
        icon: '✨',
        color: '#00B894',
        name: { ar: 'حالات خاصة والعدد المجهول', en: 'Special Cases and Missing Numbers' },
        rule: {
          ar: 'العدد ÷ ١ = العدد • العدد ÷ نفسه = ١ • ٠ ÷ العدد = ٠',
          en: 'n ÷ 1 = n • n ÷ n = 1 • 0 ÷ n = 0',
        },
        example: (api) => `${api.eq([7, '÷', 1, '=', 7])}${api.eq([7, '÷', 7, '=', 1])}${api.eq([0, '÷', 7, '=', 0])}`,
        gens: [special, missing],
      },
      {
        icon: '📖',
        color: '#FF8A3D',
        name: { ar: 'مسائل من الحياة', en: 'Real-Life Problems' },
        rule: {
          ar: 'نقرأ المسألة جيداً: ما العدد الكلي؟ وعلى كم نقسم؟',
          en: 'Read carefully: what is the total? What do we divide by?',
        },
        example: (api) =>
          `<p class="hint-rule">${api.tx('٢٠ جنيهاً لـ ٤ أقلام ✏️', '20 pounds for 4 pencils ✏️')}</p>${api.eq([20, '÷', 4, '=', 5])}`,
        gens: [story],
      },
    ],
  });
})();
