window.Chapter5 = (function () {
  const UNIT = {
    ar: { cm: 'سنتيمتر', m: 'متر', km: 'كيلومتر' },
    en: { cm: 'centimetres', m: 'metres', km: 'kilometres' },
    arS: { cm: 'سم', m: 'م', km: 'كم' },
    enS: { cm: 'cm', m: 'm', km: 'km' },
  };
  const short = (api, u) => (api.ar ? UNIT.arS : UNIT.enS)[u];

  // 247 cm → "2 m 47 cm"; 3500 m → "3 km 500 m".
  function two(api, v, big, small, per) {
    const B = Math.floor(v / per);
    const r = v % per;
    if (!B) return `${api.N(r)} ${short(api, small)}`;
    if (!r) return `${api.N(B)} ${short(api, big)}`;
    return `${api.N(B)} ${short(api, big)}${api.ar ? ' و' : ''} ${api.N(r)} ${short(api, small)}`;
  }
  const fmtCm = (api, v) => two(api, v, 'm', 'cm', 100);
  const fmtM = (api, v) => two(api, v, 'km', 'm', 1000);

  const THINGS = [
    { e: '✏️', ar: 'طول قلم الرصاص', en: 'A pencil is about', n: 15, u: 'cm' },
    { e: '🚪', ar: 'ارتفاع الباب', en: 'A door is about', n: 2, u: 'm' },
    { e: '🏫', ar: 'طول الفصل', en: 'A classroom is about', n: 8, u: 'm' },
    { e: '🚗', ar: 'المسافة من القاهرة إلى الإسكندرية', en: 'Cairo to Alexandria is about', n: 220, u: 'km' },
    { e: '🧽', ar: 'طول الممحاة', en: 'An eraser is about', n: 4, u: 'cm' },
    { e: '🏊', ar: 'طول حمام السباحة', en: 'A swimming pool is about', n: 25, u: 'm' },
    { e: '🚶', ar: 'المسافة من البيت إلى المدرسة', en: 'Home to school is about', n: 2, u: 'km' },
    { e: '📕', ar: 'طول الكتاب', en: 'A book is about', n: 25, u: 'cm' },
    { e: '🦒', ar: 'ارتفاع الزرافة', en: 'A giraffe is about', n: 5, u: 'm' },
    { e: '✈️', ar: 'المسافة من القاهرة إلى أسوان', en: 'Cairo to Aswan is about', n: 700, u: 'km' },
    { e: '🐜', ar: 'طول النملة', en: 'An ant is about', n: 1, u: 'cm' },
    { e: '🌴', ar: 'ارتفاع النخلة', en: 'A palm tree is about', n: 12, u: 'm' },
  ];

  function unit(api) {
    const i = api.R(0, THINGS.length - 1);
    const t = THINGS[i];
    return {
      key: `u${i}`,
      answer: t.u,
      choices: ['cm', 'm', 'km'],
      label: (v) => `${(api.ar ? UNIT.ar : UNIT.en)[v]}`,
      prompt: () => api.tx(`${t.ar} حوالي ${api.N(t.n)} … ؟`, `${t.en} ${t.n} … ?`),
      visual: () => `<div class="big-emoji">${t.e}</div>`,
      hint: () =>
        `<p class="hint-rule">${api.tx(
          '🐜 السنتيمتر للأشياء الصغيرة • 🚪 المتر للغرف والأشجار • 🚗 الكيلومتر للمسافات بين الأماكن',
          '🐜 cm for small things • 🚪 m for rooms and trees • 🚗 km for distances between places'
        )}</p>`,
    };
  }

  function tapeSvg(api, start, v) {
    let s = `<svg class="tape" viewBox="0 0 320 76" dir="ltr" aria-hidden="true"><rect class="tape-body" x="0" y="24" width="320" height="44" rx="6"/>`;
    for (let c = start; c <= start + 30; c++) {
      const x = 10 + (c - start) * 10;
      const h = c % 10 === 0 ? 22 : c % 5 === 0 ? 15 : 9;
      s += `<line class="tape-tick" x1="${x}" y1="24" x2="${x}" y2="${24 + h}"/>`;
      if (c % 10 === 0) s += `<text class="tape-num" x="${x}" y="60">${api.N(c)}</text>`;
    }
    const x = 10 + (v - start) * 10;
    s += `<polygon class="tape-arrow" points="${x - 8},2 ${x + 8},2 ${x},22"/></svg>`;
    return s;
  }

  function tape(api) {
    const start = api.R(8, 22) * 10;
    let v;
    do v = start + api.R(3, 27);
    while (v % 10 === 0);
    return {
      key: `t${v}`,
      answer: v,
      choices: api.opts(v, [v + 10, v - 10, v + 1, v - 1]),
      label: (x) => fmtCm(api, x),
      prompt: () => api.tx('كم الطول عند السهم؟ 📏 (الأرقام بالسنتيمتر)', 'What length does the arrow show? 📏 (numbers are in cm)'),
      visual: () => tapeSvg(api, start, v),
      hint: () => {
        const ten = Math.floor(v / 10) * 10;
        return `<p class="hint-rule">${api.tx(
          `كل علامة صغيرة = ١ سم. السهم بعد ${api.N(ten)} بـ ${api.N(v - ten)} علامات ← ${api.N(v)} سم`,
          `Each small mark = 1 cm. The arrow is ${v - ten} marks after ${ten} → ${v} cm`
        )}</p><p class="hint-rule">${api.tx(`${api.N(v)} سم = ${fmtCm(api, v)} لأن ١ م = ١٠٠ سم`, `${v} cm = ${fmtCm(api, v)} because 1 m = 100 cm`)}</p>`;
      },
    };
  }

  function convert(api) {
    const v = api.R(0, 3);
    const k = api.R(1, 9);
    const r = api.R(1, 19) * 50;
    const c = api.R(5, 95);
    const forms = [
      { tokens: [k, 'كم', '=', '?', 'م'], en: [k, 'km', '=', '?', 'm'], answer: k * 1000, ex: [k * 100, k * 10, k * 10000] },
      { tokens: [k, 'كم', 'و', r, 'م', '=', '?', 'م'], en: [k, 'km', r, 'm', '=', '?', 'm'], answer: k * 1000 + r, ex: [k * 100 + r, k + r, k * 1000 + r * 10] },
      { tokens: [k, 'م', '=', '?', 'سم'], en: [k, 'm', '=', '?', 'cm'], answer: k * 100, ex: [k * 10, k * 1000, k + 100] },
      { tokens: [k, 'م', 'و', c, 'سم', '=', '?', 'سم'], en: [k, 'm', c, 'cm', '=', '?', 'cm'], answer: k * 100 + c, ex: [k * 10 + c, k * 1000 + c, k + c] },
    ][v];
    const rule = v < 2 ? ['١ كم = ١٠٠٠ م', '1 km = 1000 m'] : ['١ م = ١٠٠ سم', '1 m = 100 cm'];
    return {
      key: `c${v}/${k}/${r}/${c}`,
      answer: forms.answer,
      choices: api.opts(forms.answer, forms.ex),
      prompt: () => api.tx('نحوّل الوحدة 🔄', 'Convert the units 🔄'),
      visual: () => api.eq(api.ar ? forms.tokens : forms.en),
      hint: () => `<p class="hint-rule">💡 ${api.tx(rule[0], rule[1])}</p>${api.eq(api.ar ? forms.tokens : forms.en, api.N(forms.answer))}`,
    };
  }

  function split(api) {
    const meters = api.R(0, 1) === 0;
    const v = meters ? api.R(1, 9) * 1000 + api.R(1, 19) * 50 : api.R(1, 9) * 100 + api.R(5, 95);
    const fmt = (x) => (meters ? fmtM(api, x) : fmtCm(api, x));
    const ex = meters ? [v * 10, Math.floor(v / 10), v + 1000] : [v * 10, v + 100, v - 100];
    return {
      key: `sp${v}`,
      answer: v,
      choices: api.opts(v, ex.filter((x) => x > 0)),
      label: fmt,
      prompt: () =>
        api.tx(`${api.N(v)} ${meters ? 'متر' : 'سنتيمتر'} = ؟`, `${v} ${meters ? 'metres' : 'centimetres'} = ?`),
      visual: () => `<div class="big-emoji">${meters ? '🛣️' : '📏'}</div>`,
      hint: () =>
        `<p class="hint-rule">💡 ${meters ? api.tx('كل ١٠٠٠ م = ١ كم', 'Every 1000 m = 1 km') : api.tx('كل ١٠٠ سم = ١ م', 'Every 100 cm = 1 m')}</p><p class="hint-rule">${api.N(v)} ${
          meters ? short(api, 'm') : short(api, 'cm')
        } = ${fmt(v)}</p>`,
    };
  }

  function mapSvg(api, a, b, c) {
    const m = short(api, 'm');
    return `<svg class="route-map" viewBox="0 0 300 160" aria-hidden="true">
      <line class="route-straight" x1="34" y1="124" x2="266" y2="124"/>
      <polyline class="route-road" points="34,124 150,34 266,124"/>
      <text class="route-num" x="70" y="70">${api.N(a)} ${m}</text>
      <text class="route-num" x="230" y="70">${api.N(b)} ${m}</text>
      <text class="route-num dash" x="150" y="150">${api.N(c)} ${m}</text>
      <text class="route-emoji" x="34" y="124">🏠</text>
      <text class="route-emoji" x="150" y="34">🌳</text>
      <text class="route-emoji" x="266" y="124">🏫</text>
    </svg>`;
  }

  function route(api) {
    const a = api.R(30, 90) * 10;
    const b = api.R(30, 90) * 10;
    const c = Math.round(((a + b) * 0.72) / 10) * 10;
    const ask = api.R(0, 1);
    const answer = ask === 0 ? a + b : a + b - c;
    return {
      key: `r${a}/${b}/${ask}`,
      answer,
      choices: api.opts(answer, ask === 0 ? [a + b + 100, a + b - 100, c, a + b + 10] : [a + b, c, answer + 100, answer - 10]),
      label: (x) => fmtM(api, x),
      prompt: () =>
        ask === 0
          ? api.tx('كم طول الطريق من البيت 🏠 إلى المدرسة 🏫 مروراً بالحديقة 🌳؟', 'How long is the road from home 🏠 to school 🏫 through the park 🌳?')
          : api.tx('كم يزيد طول الطريق عن المسافة المستقيمة (المتقطعة)؟', 'How much longer is the road than the straight (dashed) distance?'),
      visual: () => mapSvg(api, a, b, c),
      hint: () =>
        ask === 0
          ? `${api.eq([a, '+', b, '=', a + b])}<p class="hint-rule">${api.N(a + b)} ${short(api, 'm')} = ${fmtM(api, a + b)}</p>`
          : `${api.eq([a, '+', b, '=', a + b])}${api.eq([a + b, '−', c, '=', answer])}`,
    };
  }

  return Adventure({
    id: 'ch5',
    icon: '📏',
    color: '#0984E3',
    title: { ar: 'الفصل الخامس: الطول', en: 'Chapter 5: Length' },
    mech: { type: 'build', token: '🪵', goal: '🏝️', bg: 'river' },
    levels: [
      {
        icon: '📐',
        color: '#0984E3',
        name: { ar: 'الوحدة المناسبة', en: 'The Right Unit' },
        rule: {
          ar: 'السنتيمتر للأشياء الصغيرة، والمتر للأشياء الكبيرة، والكيلومتر للمسافات الطويلة.',
          en: 'Centimetres for small things, metres for big things, kilometres for long distances.',
        },
        example: (api) =>
          `<div class="unit-row"><span>🐜<b>${short(api, 'cm')}</b></span><span>🦒<b>${short(api, 'm')}</b></span><span>🚗<b>${short(api, 'km')}</b></span></div>`,
        gens: [unit],
      },
      {
        icon: '📏',
        color: '#00B894',
        name: { ar: 'شريط القياس', en: 'The Measuring Tape' },
        rule: { ar: 'كل علامة صغيرة = ١ سم، والعلامة الطويلة كل ١٠ سم. ١ م = ١٠٠ سم.', en: 'Each small mark = 1 cm; the long marks are every 10 cm. 1 m = 100 cm.' },
        example: (api) => `${tapeSvg(api, 120, 137)}<p class="hint-rule">${api.tx('١٣٧ سم = ١ م و ٣٧ سم', '137 cm = 1 m 37 cm')}</p>`,
        gens: [tape],
      },
      {
        icon: '🔄',
        color: '#6C5CE7',
        name: { ar: 'تحويل الوحدات', en: 'Converting Units' },
        rule: { ar: '١ كم = ١٠٠٠ م • ١ م = ١٠٠ سم', en: '1 km = 1000 m • 1 m = 100 cm' },
        example: (api) => `${api.eq(api.ar ? [2, 'كم', 'و', 300, 'م', '=', 2300, 'م'] : [2, 'km', 300, 'm', '=', 2300, 'm'])}${api.eq(api.ar ? [3, 'م', '=', 300, 'سم'] : [3, 'm', '=', 300, 'cm'])}`,
        gens: [convert, split],
      },
      {
        icon: '🗺️',
        color: '#E17055',
        name: { ar: 'الطريق والمسافة', en: 'Road and Distance' },
        rule: {
          ar: 'طول الطريق = مجموع أجزائه. المسافة = الخط المستقيم بين المكانين، وهي أقصر.',
          en: 'Road length = add its parts. Distance = the straight line between places, which is shorter.',
        },
        example: (api) => mapSvg(api, 450, 380, 600),
        gens: [route],
      },
    ],
  });
})();
