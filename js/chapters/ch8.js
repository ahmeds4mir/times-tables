window.Chapter8 = (function () {
  const ITEMS = ['🍪', '🍩', '🧁', '🍓', '⚽', '🖍️'];
  const combo = (q, r) => `${q}|${r}`;
  const comboLabel = (api) => (v) => {
    const [q, r] = v.split('|').map(Number);
    return api.tx(`${api.N(q)} والباقي ${api.N(r)}`, `${q} remainder ${r}`);
  };

  // Correct pair plus tempting wrong pairs, including a remainder that is too big.
  function comboChoices(api, d, q, r) {
    const set = new Set([combo(q, r)]);
    const pool = api.shuffle([combo(q - 1, r + d), combo(q + 1, r), combo(q, r + 1 < d ? r + 1 : r - 1), combo(q + 1, Math.max(r - 1, 0)), combo(q - 1, r)]);
    for (const c of pool) {
      if (set.size >= 4) break;
      const [a, b] = c.split('|').map(Number);
      if (a >= 0 && b >= 0) set.add(c);
    }
    return api.shuffle([...set]);
  }

  const divHint = (api, t, d, q, r) =>
    `<p class="hint-rule">${api.tx(
      `في جدول ${api.N(d)}: أكبر ناتج لا يزيد عن ${api.N(t)} هو ${api.N(d)} × ${api.N(q)} = ${api.N(d * q)}`,
      `In the ${d} times table, the biggest answer not over ${t} is ${d} × ${q} = ${d * q}`
    )}</p>${api.eq([t, '−', d * q, '=', r])}<p class="hint-rule">${api.tx(
      `إذن ${api.N(t)} ÷ ${api.N(d)} = ${api.N(q)} والباقي ${api.N(r)}`,
      `So ${t} ÷ ${d} = ${q} remainder ${r}`
    )}</p>`;

  function plates(api) {
    const d = api.R(2, 5);
    const q = api.R(2, 5);
    const r = api.R(1, d - 1);
    const t = d * q + r;
    const e = api.pick(ITEMS);
    return {
      key: `pl${t}/${d}`,
      answer: combo(q, r),
      choices: comboChoices(api, d, q, r),
      label: comboLabel(api),
      prompt: () =>
        api.tx(
          `نضع ${api.N(t)} ${e} في أطباق، في كل طبق ${api.N(d)}. كم طبقاً يمتلئ؟ وكم يتبقى؟`,
          `Put ${t} ${e} on plates, ${d} on each. How many full plates? How many left over?`
        ),
      visual: () => api.emojis(e, t),
      hint: () =>
        `${api.groups(q, d, e, r)}<p class="hint-rule">${api.tx(`الأطباق الممتلئة: ${api.N(q)} • الباقي: ${api.N(r)}`, `${q} full plates, ${r} left over`)}</p>`,
    };
  }

  function divide(api) {
    const d = api.R(2, 9);
    const q = api.R(2, 9);
    const r = api.R(1, d - 1);
    const t = d * q + r;
    return {
      key: `dv${t}/${d}`,
      answer: combo(q, r),
      choices: comboChoices(api, d, q, r),
      label: comboLabel(api),
      prompt: () => api.tx('ما الناتج والباقي؟ 🤔', 'What are the answer and the remainder? 🤔'),
      visual: () => api.eq([t, '÷', d, '=', '?']),
      hint: () => divHint(api, t, d, q, r),
    };
  }

  function check(api) {
    const d = api.R(2, 9);
    const q = api.R(2, 9);
    const r = api.R(1, d - 1);
    const t = d * q + r;
    return {
      key: `ck${t}/${d}`,
      answer: t,
      choices: api.opts(t, [d * q, t + d, d * (q + 1), t - 1]),
      prompt: () =>
        api.tx(
          `${api.N(t)} ÷ ${api.N(d)} = ${api.N(q)} والباقي ${api.N(r)}. نتحقق: ما العدد في الصندوق؟ 🔍`,
          `${t} ÷ ${d} = ${q} remainder ${r}. Let's check: what goes in the box? 🔍`
        ),
      visual: () => api.eq([d, '×', q, '+', r, '=', '?']),
      hint: () =>
        `<p class="hint-rule">${api.tx('المقسوم عليه × الناتج + الباقي = العدد الأصلي', 'divisor × answer + remainder = the starting number')}</p>${api.eq([d, '×', q, '=', d * q])}${api.eq([d * q, '+', r, '=', t])}`,
    };
  }

  function impossible(api) {
    const d = api.R(3, 8);
    const bad = api.R(d, d + 2);
    const goods = api.shuffle(Array.from({ length: d - 1 }, (_, i) => i + 1)).slice(0, 3);
    return {
      key: `im${d}/${bad}`,
      answer: bad,
      choices: api.shuffle(goods.concat([bad])),
      prompt: () => api.tx(`نقسم على ${api.N(d)}. أي باقٍ مستحيل؟ 🚫`, `We divide by ${d}. Which remainder is impossible? 🚫`),
      visual: () => api.eq(['?', '÷', d]),
      hint: () =>
        `<p class="hint-rule">${api.tx(
          `الباقي يجب أن يكون أصغر من ${api.N(d)}. لو بقي ${api.N(d)} أو أكثر نستطيع أن نملأ مجموعة أخرى!`,
          `The remainder must be smaller than ${d}. If ${d} or more are left, we can make another group!`
        )}</p>`,
    };
  }

  function cars(api) {
    const per = api.R(3, 6);
    let n;
    do n = api.R(11, 40);
    while (n % per === 0);
    const ans = Math.ceil(n / per);
    return {
      key: `car${n}/${per}`,
      answer: ans,
      choices: api.opts(ans, [ans - 1, ans + 1, n % per]),
      prompt: () =>
        api.tx(
          `${api.N(n)} طفلاً يذهبون في رحلة 🚐، وكل سيارة تأخذ ${api.N(per)} أطفال. كم سيارة نحتاج لكي يركب الجميع؟`,
          `${n} children go on a trip 🚐 and each van takes ${per}. How many vans so everyone rides?`
        ),
      visual: () => api.eq([n, '÷', per, '=', '?']),
      hint: () =>
        `${api.eq([n, '÷', per, '=', Math.floor(n / per)])}<p class="hint-rule">${api.tx(
          `الباقي: ${api.N(n % per)} — ويحتاجون سيارة أخرى! ← ${api.N(ans)} 🚐`,
          `${n % per} children are left and need one more van! → ${ans} vans`
        )}</p>`,
    };
  }

  function shop(api) {
    const price = api.R(3, 9);
    let m;
    do m = api.R(11, 60);
    while (m % price === 0);
    const ans = Math.floor(m / price);
    return {
      key: `sh${m}/${price}`,
      answer: ans,
      choices: api.opts(ans, [ans + 1, ans - 1, m % price]),
      prompt: () =>
        api.tx(
          `معنا ${api.N(m)} جنيهاً 💵، والكراسة بـ ${api.N(price)} جنيهات. كم كراسة نستطيع أن نشتري؟`,
          `We have ${m} pounds 💵 and a notebook costs ${price} pounds. How many notebooks can we buy?`
        ),
      visual: () => api.eq([m, '÷', price, '=', '?']),
      hint: () =>
        `${api.eq([m, '÷', price, '=', ans])}<p class="hint-rule">${api.tx(
          `الباقي: ${api.N(m % price)} — لا يكفي لكراسة أخرى ← ${api.N(ans)} 📒`,
          `The ${m % price} pounds left are not enough for another one → ${ans}`
        )}</p>`,
    };
  }

  return Adventure({
    id: 'ch8',
    icon: '🚚',
    color: '#FDCB6E',
    title: { ar: 'الفصل الثامن: القسمة مع الباقي', en: 'Chapter 8: Division with Remainders' },
    mech: { type: 'fill', token: '📦', container: '🚚', goal: '🏁', bg: 'road' },
    levels: [
      {
        icon: '🍪',
        color: '#E17055',
        name: { ar: 'ما يتبقى', en: 'What Is Left Over' },
        rule: { ar: 'نملأ المجموعات بالتساوي، وما لا يكفي لمجموعة كاملة هو الباقي.', en: 'Fill equal groups. What is not enough for a full group is the remainder.' },
        example: (api) => `${api.groups(4, 3, '🍪', 2)}${api.eq([14, '÷', 3, '=', 4])}<p class="hint-rule">${api.tx('والباقي ٢', 'remainder 2')}</p>`,
        gens: [plates],
        game: 'sort',
      },
      {
        icon: '➗',
        color: '#0984E3',
        name: { ar: 'القسمة بباقٍ', en: 'Dividing with a Remainder' },
        rule: { ar: 'نبحث في جدول الضرب عن أكبر ناتج لا يزيد عن العدد، ثم نطرح لنعرف الباقي.', en: 'Find the biggest times-table answer not over the number, then subtract to get the remainder.' },
        example: (api) => divHint(api, 23, 4, 5, 3),
        gens: [divide],
        game: 'door',
      },
      {
        icon: '🔍',
        color: '#00B894',
        name: { ar: 'نتحقق من الحل', en: 'Checking the Answer' },
        rule: { ar: 'المقسوم عليه × الناتج + الباقي = العدد الأصلي. والباقي دائماً أصغر من المقسوم عليه.', en: 'divisor × answer + remainder = the starting number. The remainder is always smaller than the divisor.' },
        example: (api) => `${api.eq([4, '×', 5, '+', 3, '=', 23])}`,
        gens: [check, impossible],
        game: 'pop',
      },
      {
        icon: '🚐',
        color: '#6C5CE7',
        name: { ar: 'مسائل ذكية', en: 'Smart Problems' },
        rule: { ar: 'نفكر في الباقي: هل يحتاج سيارة أخرى (نزيد ١)، أم لا يكفي لشيء (نتركه)؟', en: 'Think about the remainder: does it need one more van (add 1), or is it not enough (leave it)?' },
        example: (api) => `${api.eq([22, '÷', 4, '=', 5])}<p class="hint-rule">${api.tx('والباقي ٢ ← نحتاج ٦ سيارات 🚐', 'remainder 2 → we need 6 vans 🚐')}</p>`,
        gens: [cars, shop],
        game: 'lucky',
      },
    ],
  });
})();
