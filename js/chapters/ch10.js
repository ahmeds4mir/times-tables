window.Chapter10 = (function () {
  function column(api, a, b, key, prompt) {
    return {
      type: 'column',
      key: `${key}${a}x${b}`,
      col: { a, b, op: '×' },
      answer: a * b,
      prompt: prompt || (() => api.tx('نضرب رأسياً ✏️', 'Multiply in columns ✏️')),
      hint: () =>
        `${api.colHtml(a, b, '×', { show: true })}<p class="hint-rule">${api.tx(
          `نضرب ${api.N(b)} في الآحاد أولاً، ثم العشرات${a >= 100 ? '، ثم المئات' : ''}. الرقم الأحمر فوق هو ما نحمله 🔴`,
          `Multiply ${b} by the ones first, then the tens${a >= 100 ? ', then the hundreds' : ''}. The red number on top is the carry 🔴`
        )}</p>`,
    };
  }

  function roundTens(api) {
    const hundreds = api.R(0, 2) === 0;
    const d = api.R(1, 9);
    const b = api.R(2, 9);
    const a = d * (hundreds ? 100 : 10);
    const unit = hundreds ? api.tx('مئة', 'hundreds') : api.tx('عشرة', 'tens');
    return {
      key: `r${a}x${b}`,
      answer: a * b,
      choices: api.opts(a * b, [d * b, a * b * 10, a * b + (hundreds ? 100 : 10), a + b]),
      prompt: () => api.tx('سهلة! نفكر في العشرات والمئات 🤖', 'Easy! Think in tens and hundreds 🤖'),
      visual: () => api.eq([a, '×', b, '=', '?']),
      hint: () => `${api.eq([d, unit, '×', b, '=', d * b, unit])}${api.eq([d * b, unit, '=', a * b])}`,
    };
  }

  function twoNoCarry(api) {
    let a, b;
    do {
      a = api.R(11, 44);
      b = api.R(2, 4);
    } while ((a % 10) * b >= 10 || Math.floor(a / 10) * b >= 10 || a % 10 === 0);
    return column(api, a, b, 'n');
  }

  function twoCarry(api) {
    let a, b;
    do {
      a = api.R(12, 98);
      b = api.R(2, 9);
    } while ((a % 10) * b < 10);
    return column(api, a, b, 'c');
  }

  function three(api) {
    let a, b;
    do {
      a = api.R(102, 899);
      b = api.R(2, 9);
    } while (a * b > 9999 || a % 10 === 0);
    return column(api, a, b, 't');
  }

  const STORIES = [
    { e: '✏️', ar: (a, b) => `في كل علبة ${a} قلماً ✏️. كم قلماً في ${b} علب؟`, en: (a, b) => `Each box has ${a} pencils ✏️. How many pencils in ${b} boxes?` },
    { e: '🚌', ar: (a, b) => `في كل أتوبيس ${a} راكباً 🚌. كم راكباً في ${b} أتوبيسات؟`, en: (a, b) => `Each bus carries ${a} people 🚌. How many people in ${b} buses?` },
    { e: '🎫', ar: (a, b) => `ثمن التذكرة ${a} جنيهاً 🎫. كم ثمن ${b} تذاكر؟`, en: (a, b) => `A ticket costs ${a} pounds 🎫. How much do ${b} tickets cost?` },
    { e: '📚', ar: (a, b) => `في كل رف ${a} كتاباً 📚. كم كتاباً في ${b} رفوف؟`, en: (a, b) => `Each shelf holds ${a} books 📚. How many books on ${b} shelves?` },
  ];

  function story(api) {
    const i = api.R(0, STORIES.length - 1);
    const s = STORIES[i];
    let a;
    do a = api.R(13, 98);
    while (a % 10 === 0);
    const b = api.R(3, 9);
    return column(api, a, b, `s${i}`, () => api.tx(s.ar(api.N(a), api.N(b)), s.en(a, b)));
  }

  return Adventure({
    id: 'ch10',
    icon: '🤖',
    color: '#00CEC9',
    title: { ar: 'الفصل العاشر: الضرب الرأسي', en: 'Chapter 10: Column Multiplication' },
    mech: { type: 'build', token: '⚙️', goal: '🤖', bg: 'factory' },
    levels: [
      {
        icon: '🔟',
        color: '#00CEC9',
        name: { ar: 'ضرب العشرات والمئات', en: 'Multiplying Tens and Hundreds' },
        rule: { ar: '٤٠ × ٦ = ٤ عشرات × ٦ = ٢٤ عشرة = ٢٤٠', en: '40 × 6 = 4 tens × 6 = 24 tens = 240' },
        example: (api) => api.eq([40, '×', 6, '=', 240]) + api.eq([400, '×', 6, '=', 2400]),
        gens: [roundTens],
      },
      {
        icon: '2️⃣',
        color: '#0984E3',
        name: { ar: 'عدد من رقمين × رقم', en: '2-Digit × 1-Digit' },
        rule: { ar: 'نضرب الآحاد ونكتب الآحاد ونحمل العشرات، ثم نضرب العشرات ونضيف ما حملناه.', en: 'Multiply the ones, write the ones and carry the tens. Then multiply the tens and add the carry.' },
        example: (api) => api.colHtml(36, 4, '×', { show: true }),
        gens: [twoNoCarry, twoCarry, twoCarry],
      },
      {
        icon: '3️⃣',
        color: '#6C5CE7',
        name: { ar: 'عدد من ٣ أرقام × رقم', en: '3-Digit × 1-Digit' },
        rule: { ar: 'نفس الخطوات، ونكمل حتى خانة المئات.', en: 'The same steps, all the way to the hundreds.' },
        example: (api) => api.colHtml(247, 3, '×', { show: true }),
        gens: [three],
      },
      {
        icon: '📖',
        color: '#E17055',
        name: { ar: 'مسائل الضرب', en: 'Multiplication Problems' },
        rule: { ar: '"في كل واحد… كم في الكل؟" ← نضرب.', en: '"Each one has… how many in all?" → multiply.' },
        example: (api) => `<p class="hint-rule">${api.tx('٢٤ قلماً في كل علبة، ٦ علب', '24 pencils in each box, 6 boxes')}</p>${api.colHtml(24, 6, '×', { show: true })}`,
        gens: [story, story, three],
      },
    ],
  });
})();
