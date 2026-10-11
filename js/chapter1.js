window.Chapter1 = (function () {
  const BOX = '☐';
  const SAVE_KEY = 'mt.ch1';
  const MONSTER_HP = 10;
  const HERO_HP = 3;

  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- Question generators (one per lesson) ----------

  function genOneMore() {
    const a = R(2, 9);
    const b = R(2, 9);
    switch (R(0, 2)) {
      case 0:
        return { tokens: [a, '×', b + 1, '=', a, '×', b, '+', BOX], answer: a, extras: [b, b + 1, 1], visual: { mode: 'lastCol', rows: a, cols: b + 1 } };
      case 1:
        return { tokens: [a, '×', b + 1, '=', BOX, '+', a], answer: a * b, extras: [a * (b + 1), a * (b - 1), a * b + 1], visual: { mode: 'lastCol', rows: a, cols: b + 1 } };
      default:
        return { tokens: [a, '×', b, '=', a, '×', b - 1, '+', BOX], answer: a, extras: [b, b - 1, 1], visual: { mode: 'lastCol', rows: a, cols: b } };
    }
  }

  function genSwap() {
    const a = R(2, 9);
    let b = R(2, 9);
    if (a === b) b = b === 9 ? 2 : b + 1;
    const visual = { mode: 'swap', rows: a, cols: b };
    return R(0, 1) === 0
      ? { tokens: [a, '×', b, '=', b, '×', BOX], answer: a, extras: [b, a * b, a + 1], visual }
      : { tokens: [a, '×', b, '=', BOX, '×', a], answer: b, extras: [a, a * b, b + 1], visual };
  }

  function genSplit() {
    const a = R(6, 9);
    const b = R(3, 9);
    const s = Math.random() < 0.6 ? 5 : R(2, a - 2);
    const r = a - s;
    const visual = { mode: 'split', rows: a, cols: b, s };
    switch (R(0, 2)) {
      case 0:
        return { tokens: [a, '×', b, '=', s, '×', b, '+', BOX, '×', b], answer: r, extras: [a, s, b], visual };
      case 1:
        return { tokens: [a, '×', b, '=', s, '×', b, '+', BOX], answer: r * b, extras: [r, a * b, s * b], visual };
      default:
        return { tokens: [s, '×', b, '+', r, '×', b, '=', BOX, '×', b], answer: a, extras: [s, r, a * b], visual };
    }
  }

  function genZeroOne() {
    const a = R(1, 10);
    const zero = { mode: 'zero', rows: a };
    const one = { mode: 'one', rows: a };
    return pick([
      { tokens: [a, '×', 0, '=', BOX], answer: 0, extras: [a, 1, 10], visual: zero },
      { tokens: [0, '×', a, '=', BOX], answer: 0, extras: [a, 1, 10], visual: zero },
      { tokens: [a, '×', 1, '=', BOX], answer: a, extras: [a + 1, 1, 0], visual: one },
      { tokens: [1, '×', a, '=', BOX], answer: a, extras: [a + 1, 1, 0], visual: one },
      { tokens: [a, '×', BOX, '=', 0], answer: 0, extras: [1, a, 10], visual: zero },
      { tokens: [a, '×', BOX, '=', a], answer: 1, extras: [0, a, 10], visual: one },
    ]);
  }

  function genTens() {
    const a = R(1, 9);
    const b = pick([10, 10, 11, 12]);
    const visual = { mode: 'ten', rows: a, cols: b };
    if (b > 10 && Math.random() < 0.4) {
      return { tokens: [a, '×', b, '=', a, '×', 10, '+', BOX], answer: a * (b - 10), extras: [b - 10, a * 10, a * b], visual };
    }
    const extras = [a * 10, a * b + 10, a + b];
    return Math.random() < 0.5
      ? { tokens: [a, '×', b, '=', BOX], answer: a * b, extras, visual }
      : { tokens: [b, '×', a, '=', BOX], answer: a * b, extras, visual };
  }

  function genUnknown() {
    const a = R(2, 9);
    const b = R(2, 9);
    const c = a * b;
    return R(0, 1) === 0
      ? { tokens: [BOX, '×', b, '=', c], answer: a, extras: [b, a + 1, a - 1], visual: { mode: 'unknownRows', rows: a, cols: b } }
      : { tokens: [a, '×', BOX, '=', c], answer: b, extras: [a, b + 1, b - 1], visual: { mode: 'unknownCols', rows: a, cols: b } };
  }

  function genBoss() {
    const lesson = R(0, 5);
    return { ...LESSONS[lesson].gen(), lesson };
  }

  const LESSONS = [
    { monster: 'monster-1', color: '#2ECC71', gen: genOneMore, example: { tokens: [3, '×', 5, '=', 3, '×', 4, '+', 3] }, visual: { mode: 'lastCol', rows: 3, cols: 5 } },
    { monster: 'monster-2', color: '#9B59B6', gen: genSwap, example: { tokens: [3, '×', 5, '=', 5, '×', 3] }, visual: { mode: 'swap', rows: 3, cols: 5 } },
    { monster: 'monster-3', color: '#FF8A3D', gen: genSplit, example: { tokens: [7, '×', 8, '=', 5, '×', 8, '+', 2, '×', 8] }, visual: { mode: 'split', rows: 7, cols: 8, s: 5 } },
    { monster: 'monster-4', color: '#1FB5C9', gen: genZeroOne, example: { tokens: [6, '×', 0, '=', 0] }, visual: { mode: 'zero', rows: 6 } },
    { monster: 'monster-5', color: '#FF5E7E', gen: genTens, example: { tokens: [4, '×', 12, '=', 4, '×', 10, '+', 4, '×', 2] }, visual: { mode: 'ten', rows: 4, cols: 12 } },
    { monster: 'monster-6', color: '#00B894', gen: genUnknown, example: { tokens: [BOX, '×', 3, '=', 12], fill: 4 }, visual: { mode: 'unknownRows', rows: 4, cols: 3 } },
    { monster: 'monster-boss', color: '#7B61FF', gen: genBoss, boss: true },
  ];
  const BOSS_INDEX = LESSONS.length - 1;

  // ---------- Text ----------

  const STR = {
    ar: {
      chapter: '⚔️ الفصل الأول: قواعد الضرب',
      mapTalk: 'ساعدني أهزم وحوش قواعد الضرب! اختر مرحلة ⚔️',
      level: (n) => `المرحلة ${n}`,
      bossLabel: '👑 الزعيم',
      locked: 'اهزم الوحوش الستة أولاً، ثم نواجه الزعيم! 🔒',
      waiting: (m) => `${m} ينتظرك في المعركة!`,
      fight: 'إلى المعركة! ⚔️',
      startTalk: ['هيا نهزمه! ⚔️', 'ركّز يا بطل! 🎯', 'أنت أقوى منه! 💪'],
      hit: ['ضربة قوية! 💥', 'أحسنت يا بطل! ⚔️', 'رائع! الوحش يضعف! 🔥', 'برافو! 🌟', 'هجوم ممتاز! 🚀'],
      hurt: ['أوه! الوحش ضربنا 😵 لكن لا تستسلم!', 'لا بأس، انظر للقاعدة وحاول! 💛'],
      answerIs: 'الإجابة الصحيحة:',
      nextQ: 'هجوم جديد ⚔️',
      finish: 'متابعة ⬅️',
      win: (m) => `هزمت ${m}! 🎉`,
      bossWin: 'أنت بطل الفصل الأول! 🏆',
      lose: (m) => `${m} هرب هذه المرة! 🏃`,
      loseTalk: 'راجع القاعدة وارجع أقوى! 💪',
      hearts: (n) => `القلوب المتبقية: ${n}`,
      nextLevel: 'المرحلة التالية ⬅️',
      again: 'العب مرة أخرى 🔁',
      map: 'خريطة الفصل 🗺️',
      review: 'راجع القاعدة 📖',
      tryAgain: 'حاول مرة أخرى ⚔️',
      lessons: [
        { name: 'زيادة مجموعة', monster: 'سلايم الزائد', rule: 'عندما يزيد العدد الثاني ١، يزيد الناتج بمقدار العدد الأول.' },
        { name: 'خاصية الإبدال', monster: 'خفاش المرآة', rule: 'تبديل مكان العددين لا يغيّر الناتج.' },
        { name: 'التجزئة', monster: 'سلطعون التجزئة', rule: 'نجزّئ العدد الكبير إلى عددين أسهل، ثم نجمع الناتجين.' },
        { name: 'الضرب في صفر وواحد', monster: 'شبح الصفر', rule: 'أي عدد × ٠ = ٠ ، وأي عدد × ١ = العدد نفسه.' },
        { name: 'الضرب في ١٠ و ١١ و ١٢', monster: 'تنين العشرة', rule: 'نضرب في ١٠ ثم نضيف الباقي: ٤ × ١٢ = ٤ × ١٠ + ٤ × ٢' },
        { name: 'إيجاد العدد المجهول', monster: 'قزم الصندوق', rule: 'نبحث في جدول الضرب عن العدد الذي يعطينا الناتج.' },
        { name: 'المعركة الكبرى', monster: 'ملك القواعد', rule: 'كل القواعد معاً! استخدم كل ما تعلّمته.' },
      ],
      cap: {
        lastCol: (a) => `كل صف زاد نقطة واحدة 🟠 فزاد الناتج ${a}`,
        swap: (a, b) => `${a} صفوف في كل صف ${b} = ${b} صفوف في كل صف ${a}`,
        split: (s, r) => `جزّأنا الصفوف: ${s} صفوف 🟣 و ${r} صفوف 🟠`,
        zero: (a) => `${a} مجموعات فارغة ← لا شيء = ٠`,
        one: (a) => `${a} مجموعات، في كل منها نقطة واحدة = ${a}`,
        tenOnly: (a) => `${a} صفوف، في كل صف ١٠ = ${a} عشرات`,
        ten: (r) => `نضرب في ١٠ 🟣 ثم نضيف ${r} من كل صف 🟠`,
        unknownRows: (c, b, a) => `${c} نقطة في صفوف، كل صف ${b} ← عدد الصفوف ${a}`,
        unknownCols: (c, a, b) => `${c} نقطة في ${a} صفوف ← في كل صف ${b}`,
      },
    },
    en: {
      chapter: '⚔️ Chapter 1: Rules of Multiplication',
      mapTalk: 'Help me defeat the multiplication monsters! Pick a level ⚔️',
      level: (n) => `Level ${n}`,
      bossLabel: '👑 Boss',
      locked: 'Defeat all 6 monsters first, then we face the boss! 🔒',
      waiting: (m) => `${m} is waiting for you!`,
      fight: 'To battle! ⚔️',
      startTalk: ["Let's beat it! ⚔️", 'Focus, hero! 🎯', 'You are stronger! 💪'],
      hit: ['Strong hit! 💥', 'Well done, hero! ⚔️', 'Great! The monster is weaker! 🔥', 'Bravo! 🌟', 'Awesome attack! 🚀'],
      hurt: ["Oops! The monster hit us 😵 but don't give up!", "It's okay, look at the rule and try again! 💛"],
      answerIs: 'The right answer:',
      nextQ: 'Next attack ⚔️',
      finish: 'Continue ➡️',
      win: (m) => `You defeated ${m}! 🎉`,
      bossWin: 'Chapter 1 champion! 🏆',
      lose: (m) => `${m} got away this time! 🏃`,
      loseTalk: 'Review the rule and come back stronger! 💪',
      hearts: (n) => `Hearts left: ${n}`,
      nextLevel: 'Next level ➡️',
      again: 'Play again 🔁',
      map: 'Chapter map 🗺️',
      review: 'Review the rule 📖',
      tryAgain: 'Try again ⚔️',
      lessons: [
        { name: 'One More Group', monster: 'Plus Slime', rule: 'When the second number goes up by 1, the answer grows by the first number.' },
        { name: 'Swap the Order', monster: 'Mirror Bat', rule: 'Swapping the two numbers does not change the answer.' },
        { name: 'Split It', monster: 'Splitter Crab', rule: 'Split the big number into two easier numbers, then add the two answers.' },
        { name: 'Times 0 and 1', monster: 'Zero Ghost', rule: 'Any number × 0 = 0, and any number × 1 = the same number.' },
        { name: 'Times 10, 11 and 12', monster: 'Ten Dragon', rule: 'Multiply by 10, then add the rest: 4 × 12 = 4 × 10 + 4 × 2' },
        { name: 'Find the Missing Number', monster: 'Box Gnome', rule: 'Search the times table for the number that gives the answer.' },
        { name: 'The Big Battle', monster: 'Rules King', rule: 'All the rules together! Use everything you learned.' },
      ],
      cap: {
        lastCol: (a) => `Each row got 1 more dot 🟠 so the answer grew by ${a}`,
        swap: (a, b) => `${a} rows of ${b} = ${b} rows of ${a}`,
        split: (s, r) => `We split the rows: ${s} rows 🟣 and ${r} rows 🟠`,
        zero: (a) => `${a} empty groups → nothing = 0`,
        one: (a) => `${a} groups of 1 dot = ${a}`,
        tenOnly: (a) => `${a} rows of 10 = ${a} tens`,
        ten: (r) => `Times 10 🟣 then add ${r} more in each row 🟠`,
        unknownRows: (c, b, a) => `${c} dots in rows of ${b} → ${a} rows`,
        unknownCols: (c, a, b) => `${c} dots in ${a} rows → ${b} in each row`,
      },
    },
    arF: {
      mapTalk: 'ساعديني أهزم وحوش قواعد الضرب! اختاري مرحلة ⚔️',
      locked: 'اهزمي الوحوش الستة أولاً، ثم نواجه الزعيم! 🔒',
      startTalk: ['هيا نهزمه! ⚔️', 'ركّزي يا بطلة! 🎯', 'أنتِ أقوى منه! 💪'],
      hit: ['ضربة قوية! 💥', 'أحسنتِ يا بطلة! ⚔️', 'رائع! الوحش يضعف! 🔥', 'برافو! 🌟', 'هجوم ممتاز! 🚀'],
      hurt: ['أوه! الوحش ضربنا 😵 لكن لا تستسلمي!', 'لا بأس، انظري للقاعدة وحاولي! 💛'],
      win: (m) => `هزمتِ ${m}! 🎉`,
      bossWin: 'أنتِ بطلة الفصل الأول! 🏆',
      loseTalk: 'راجعي القاعدة وارجعي أقوى! 💪',
      review: 'راجعي القاعدة 📖',
      tryAgain: 'حاولي مرة أخرى ⚔️',
    },
  };

  // ---------- State ----------

  let ctx = null;
  let timers = [];
  const st = { view: 'map', lesson: 0, monsterHp: MONSTER_HP, heroHp: HERO_HP, q: null, locked: false, recent: [], talk: null, fresh: true, win: false, lang: null };

  const S = () => Profile.strings(STR, ctx.lang());
  const N = (n) => ctx.num(n);
  const dir = () => (ctx.lang() === 'ar' ? 'rtl' : 'ltr');
  const img = (name) => (name.startsWith('hero-') ? Profile.heroImg(name.slice(5)) : `img/ch1/${name}.png`);
  const $ = (id) => document.getElementById(id);

  function preload() {
    ['hero-ready', 'hero-attack', 'hero-hurt', 'hero-victory', ...LESSONS.map((l) => l.monster)].forEach((name) => {
      new Image().src = img(name);
    });
  }

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function bossUnlocked(progress) {
    return LESSONS.slice(0, BOSS_INDEX).every((_, i) => (progress[i] || 0) > 0);
  }

  function animate(el, cls) {
    el.classList.remove('lunge', 'lunge-back', 'hit', 'hurt');
    void el.offsetWidth;
    el.classList.add(cls);
  }

  // ---------- Pieces ----------

  function eq(tokens, fill) {
    const parts = tokens.map((tok) => {
      if (tok === BOX) {
        return `<span class="box${fill != null ? ' filled' : ''}">${fill != null ? N(fill) : ''}</span>`;
      }
      if (typeof tok === 'number') return `<span>${N(tok)}</span>`;
      return `<span class="op">${tok}</span>`;
    });
    return `<div class="ch1-eq" dir="${dir()}">${parts.join('')}</div>`;
  }

  function grid(rows, cols, cls) {
    const size = cols <= 5 ? 22 : cols <= 8 ? 18 : cols <= 10 ? 15 : 13;
    let html = `<div class="ch1-dots" style="--dot:${size}px">`;
    for (let r = 0; r < rows; r++) {
      html += '<div class="dot-row">';
      for (let c = 0; c < cols; c++) html += `<span class="ch1-dot ${cls(r, c)}"></span>`;
      html += '</div>';
    }
    return html + '</div>';
  }

  function visualHtml(v) {
    const cap = S().cap;
    let body;
    let caption;
    switch (v.mode) {
      case 'lastCol':
        body = grid(v.rows, v.cols, (r, c) => (c === v.cols - 1 ? 'b' : 'a'));
        caption = cap.lastCol(N(v.rows));
        break;
      case 'swap':
        body = `<div class="swap">${grid(v.rows, v.cols, () => 'a')}<span class="swap-eq">=</span>${grid(v.cols, v.rows, () => 'c')}</div>`;
        caption = cap.swap(N(v.rows), N(v.cols));
        break;
      case 'split':
        body = grid(v.rows, v.cols, (r) => (r < v.s ? 'a' : 'b'));
        caption = cap.split(N(v.s), N(v.rows - v.s));
        break;
      case 'zero':
        body = `<div class="empty-groups">${'<span class="empty-group"></span>'.repeat(v.rows)}</div>`;
        caption = cap.zero(N(v.rows));
        break;
      case 'one':
        body = grid(v.rows, 1, () => 'a');
        caption = cap.one(N(v.rows));
        break;
      case 'ten':
        body = grid(v.rows, v.cols, (r, c) => (c < 10 ? 'a' : 'b'));
        caption = v.cols === 10 ? cap.tenOnly(N(v.rows)) : cap.ten(N(v.cols - 10));
        break;
      case 'unknownRows':
        body = grid(v.rows, v.cols, () => 'a');
        caption = cap.unknownRows(N(v.rows * v.cols), N(v.cols), N(v.rows));
        break;
      default:
        body = grid(v.rows, v.cols, () => 'a');
        caption = cap.unknownCols(N(v.rows * v.cols), N(v.rows), N(v.cols));
    }
    return `<div class="ch1-visual">${body}<p class="array-caption">${caption}</p></div>`;
  }

  function heroTalk(pose, text) {
    return `<div class="mascot-row" id="heroTalk">
      <img class="avatar hero-avatar pop-in" src="${img('hero-' + pose)}" alt="" draggable="false">
      <div class="bubble pop-in" style="--d:120ms">${text}</div>
    </div>`;
  }

  function heartsHtml() {
    return Array.from({ length: HERO_HP }, (_, i) =>
      i < st.heroHp ? '<span class="heart">❤️</span>' : '<span class="heart lost">🤍</span>'
    ).join('');
  }

  function hpClass() {
    return st.monsterHp <= 3 ? 'low' : st.monsterHp <= 6 ? 'mid' : '';
  }

  function makeChoices(answer, extras) {
    const set = new Set([answer]);
    const pool = shuffle(extras).concat(shuffle([answer + 1, answer - 1, answer + 2, answer + 10, answer * 2]));
    for (const x of pool) {
      if (set.size >= 4) break;
      if (Number.isInteger(x) && x >= 0) set.add(x);
    }
    for (let k = 3; set.size < 4; k++) set.add(answer + k);
    return shuffle([...set]);
  }

  function newQuestion() {
    const L = LESSONS[st.lesson];
    let q;
    let tries = 0;
    do {
      q = L.gen();
      tries++;
    } while (st.recent.includes(q.tokens.join()) && tries < 20);
    if (q.lesson == null) q.lesson = st.lesson;
    st.recent.push(q.tokens.join());
    if (st.recent.length > 6) st.recent.shift();
    q.choices = makeChoices(q.answer, q.extras);
    return q;
  }

  // ---------- Screens ----------

  function renderMap() {
    const s = S();
    const progress = loadProgress();
    const bossOpen = bossUnlocked(progress);
    const cards = LESSONS.map((L, i) => {
      const locked = L.boss && !bossOpen;
      return `<button class="level-card pop-in ${L.boss ? 'boss' : ''} ${locked ? 'locked' : ''}" type="button" data-i="${i}" style="--c:${L.color};--d:${i * 60}ms">
        <img class="level-monster" src="${img(L.monster)}" alt="" draggable="false">
        <span class="level-info">
          <span class="level-num">${L.boss ? s.bossLabel : s.level(N(i + 1))}</span>
          <b>${s.lessons[i].name}</b>
          <span class="level-sub">👾 ${s.lessons[i].monster}</span>
        </span>
        <span class="level-status">${locked ? '🔒' : ctx.starsHtml(progress[i] || 0)}</span>
      </button>`;
    }).join('');

    ctx.root.innerHTML = `
      <section class="ch1 ch1-map">
        <h2 class="ch1-title">${s.chapter}</h2>
        ${heroTalk('ready', Voice.bubble('chapter1', ctx.lang()))}
        <div class="levels">${cards}</div>
      </section>`;
    Voice.wire(ctx.root, ctx.lang());

    ctx.root.querySelectorAll('.level-card').forEach((btn) =>
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        if (btn.classList.contains('locked')) {
          Sounds.wrong();
          $('heroTalk').querySelector('.bubble').textContent = s.locked;
          return;
        }
        Sounds.tap();
        st.lesson = i;
        show('learn');
      })
    );
  }

  function renderLearn() {
    const s = S();
    const L = LESSONS[st.lesson];
    const text = s.lessons[st.lesson];
    const body = L.boss
      ? `<ul class="rule-list">${s.lessons
          .slice(0, BOSS_INDEX)
          .map((x, i) => `<li><img src="${img(LESSONS[i].monster)}" alt=""><span><b>${x.name}:</b> ${x.rule}</span></li>`)
          .join('')}</ul>`
      : `${eq(L.example.tokens, L.example.fill)}${visualHtml(L.visual)}`;

    ctx.root.innerHTML = `
      <section class="ch1 ch1-learn" style="--c:${L.color}">
        <h2 class="ch1-title">📖 ${text.name}</h2>
        ${heroTalk('ready', text.rule)}
        <div class="card rule-card pop-in">${body}</div>
        <div class="vs-preview"><img src="${img(L.monster)}" alt=""><p>${s.waiting(text.monster)}</p></div>
        <div class="center"><button class="big-btn" type="button" id="fightBtn">${s.fight}</button></div>
      </section>`;

    $('fightBtn').addEventListener('click', () => {
      Sounds.tap();
      startBattle();
    });
  }

  function startBattle() {
    clearTimers();
    st.monsterHp = MONSTER_HP;
    st.heroHp = HERO_HP;
    st.recent = [];
    st.q = newQuestion();
    st.locked = false;
    st.talk = pick(S().startTalk);
    st.fresh = true;
    show('battle');
  }

  function renderBattle() {
    const s = S();
    const L = LESSONS[st.lesson];
    const q = st.q;

    ctx.root.innerHTML = `
      <section class="ch1 ch1-battle" style="--c:${L.color}">
        <div class="arena ${st.fresh ? 'pop-in' : ''}">
          <div class="fighter hero-side">
            <div class="hearts" id="hearts">${heartsHtml()}</div>
            <div id="heroWrap"><div class="bob"><img class="hero-img" id="heroImg" src="${img('hero-ready')}" data-face="right" alt="" draggable="false"></div></div>
          </div>
          <div class="fighter monster-side">
            <div class="hp">
              <span class="hp-name">${s.lessons[st.lesson].monster}</span>
              <div class="hp-bar"><div class="hp-fill ${hpClass()}" id="hpFill" style="width:${(st.monsterHp / MONSTER_HP) * 100}%"></div></div>
              <span class="hp-num" id="hpNum">${N(st.monsterHp)} / ${N(MONSTER_HP)}</span>
            </div>
            <div id="monWrap" class="monster-wrap"><div class="bob slow"><img class="monster-img" src="${img(L.monster)}" alt="" draggable="false"></div><div id="fx"></div></div>
          </div>
        </div>
        <div class="battle-talk" id="talk">${st.talk}</div>
        <div class="card ch1-question">${eq(q.tokens)}</div>
        <div class="choices">
          ${q.choices.map((v, i) => `<button class="choice pop-in" type="button" style="--d:${i * 60}ms" data-v="${v}">${N(v)}</button>`).join('')}
        </div>
        <div class="feedback" id="fb"></div>
      </section>`;
    st.fresh = false;

    ctx.root.querySelectorAll('.choice').forEach((btn) =>
      btn.addEventListener('click', () => answer(btn, Number(btn.dataset.v)))
    );
  }

  function answer(btn, value) {
    if (st.locked) return;
    st.locked = true;
    const s = S();
    const q = st.q;
    const correct = value === q.answer;

    ctx.root.querySelectorAll('.choice').forEach((b) => {
      b.disabled = true;
      const v = Number(b.dataset.v);
      if (v === q.answer) b.classList.add('right');
      else if (b !== btn) b.classList.add('faded');
    });
    const $box = ctx.root.querySelector('.ch1-question .box');
    if ($box) {
      $box.textContent = N(q.answer);
      $box.classList.add('filled');
    }

    const $heroWrap = $('heroWrap');
    const $heroImg = $('heroImg');
    const $monWrap = $('monWrap');
    const $talk = $('talk');

    if (correct) {
      st.monsterHp--;
      Sounds.correct();
      $talk.textContent = pick(s.hit);
      $heroImg.src = img('hero-attack');
      $heroImg.dataset.face = 'left';
      animate($heroWrap, 'lunge');
      later(() => Sounds.slash(), 120);
      later(() => {
        Sounds.hit();
        animate($monWrap, 'hit');
        $('fx').innerHTML = `<span class="boom">💥</span><span class="damage">-${N(1)}</span>`;
        const $fill = $('hpFill');
        $fill.style.width = `${(st.monsterHp / MONSTER_HP) * 100}%`;
        $fill.className = `hp-fill ${hpClass()}`;
        $('hpNum').textContent = `${N(st.monsterHp)} / ${N(MONSTER_HP)}`;
      }, 300);

      if (st.monsterHp <= 0) {
        later(() => {
          $monWrap.classList.add('defeated');
          $heroImg.src = img('hero-victory');
          $heroImg.dataset.face = 'right';
          Sounds.fanfare();
          Confetti.celebrate();
        }, 1000);
        later(() => finish(true), 2600);
      } else {
        later(() => {
          st.q = newQuestion();
          st.locked = false;
          st.talk = $talk.textContent;
          renderBattle();
        }, 1500);
      }
    } else {
      st.heroHp--;
      btn.classList.add('wrong');
      Sounds.wrong();
      $talk.textContent = pick(s.hurt);
      animate($monWrap, 'lunge-back');
      later(() => Sounds.roar(), 100);
      later(() => {
        Sounds.hit();
        animate($heroWrap, 'hurt');
        $heroImg.src = img('hero-hurt');
        $heroImg.dataset.face = 'right';
        $('hearts').innerHTML = heartsHtml();
      }, 350);

      const rule = s.lessons[q.lesson].rule;
      later(
        () =>
          UI.sheet(
            `<div class="oops">${s.answerIs} <b>${N(q.answer)}</b></div>
             <div class="hint-box" style="--c:${LESSONS[st.lesson].color}"><p class="hint-rule">💡 ${rule}</p>${visualHtml(q.visual)}</div>`,
            st.heroHp <= 0 ? s.finish : s.nextQ,
            () => {
              if (st.heroHp <= 0) {
                finish(false);
                return;
              }
              st.q = newQuestion();
              st.locked = false;
              st.talk = pick(s.startTalk);
              renderBattle();
            }
          ),
        900
      );
    }
  }

  function finish(win) {
    clearTimers();
    st.win = win;
    if (win) {
      const progress = loadProgress();
      if (st.heroHp > (progress[st.lesson] || 0)) {
        progress[st.lesson] = st.heroHp;
        localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
      }
    }
    show('end');
  }

  function renderEnd() {
    const s = S();
    const L = LESSONS[st.lesson];
    const text = s.lessons[st.lesson];
    const progress = loadProgress();
    const hasNext = st.win && st.lesson < BOSS_INDEX && (st.lesson + 1 < BOSS_INDEX || bossUnlocked(progress));

    const buttons = st.win
      ? `${hasNext ? `<button class="big-btn" type="button" data-act="next">${s.nextLevel}</button>` : ''}
         <button class="big-btn ${hasNext ? 'alt' : ''}" type="button" data-act="again">${s.again}</button>
         <button class="big-btn alt2" type="button" data-act="map">${s.map}</button>`
      : `<button class="big-btn" type="button" data-act="learn">${s.review}</button>
         <button class="big-btn alt" type="button" data-act="again">${s.tryAgain}</button>
         <button class="big-btn alt2" type="button" data-act="map">${s.map}</button>`;

    ctx.root.innerHTML = `
      <section class="ch1 ch1-end card pop-in" style="--c:${L.color}">
        <div class="end-scene">
          <img class="end-hero" src="${img(st.win ? 'hero-victory' : 'hero-hurt')}" alt="">
          <img class="end-monster ${st.win ? 'beaten' : ''}" src="${img(L.monster)}" alt="">
        </div>
        <h2>${st.win ? (L.boss ? s.bossWin : s.win(text.monster)) : s.lose(text.monster)}</h2>
        ${st.win
          ? `<p class="score">${s.hearts(N(st.heroHp))}</p><div class="stars-big">${ctx.starsHtml(st.heroHp)}</div>`
          : `<p class="score">${s.loseTalk}</p>`}
        <div class="result-actions">${buttons}</div>
      </section>`;

    ctx.root.querySelectorAll('[data-act]').forEach((btn) =>
      btn.addEventListener('click', () => {
        Sounds.tap();
        const act = btn.dataset.act;
        if (act === 'next') {
          st.lesson++;
          show('learn');
        } else if (act === 'again') startBattle();
        else if (act === 'learn') show('learn');
        else show('map');
      })
    );
  }

  function show(view) {
    st.view = view;
    render(ctx);
    UI.top();
  }

  function render(context) {
    ctx = context;
    if (st.lang !== ctx.lang()) {
      st.lang = ctx.lang();
      st.talk = pick(S().startTalk);
    }
    if (st.view === 'battle' && st.locked) {
      clearTimers();
      if (st.monsterHp <= 0) return finish(true);
      if (st.heroHp <= 0) return finish(false);
      st.q = newQuestion();
      st.locked = false;
    }
    if (st.view === 'map') renderMap();
    else if (st.view === 'learn') renderLearn();
    else if (st.view === 'battle') renderBattle();
    else renderEnd();
  }

  return {
    enter() {
      clearTimers();
      preload();
      st.view = 'map';
    },
    leave() {
      clearTimers();
      UI.closeSheet();
    },
    render,
  };
})();
