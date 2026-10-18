// Shared game engine for chapters 3–10. Each chapter supplies its levels and question
// generators; the engine handles the map, lesson card, play screen, scene, hints and stars.
//
// A generator is called as gen(api) when a level starts and returns a question:
//   { key, answer, type: 'choice' | 'column', choices?, col?: {a, b, op},
//     prompt(), visual?(), hint(), label?(v) }
// Text must be produced inside the functions (not when generating) so that switching
// language mid-question re-renders correctly.
window.Adventure = function (cfg) {
  const PER_LEVEL = 8;
  const SAVE_KEY = `mt.${cfg.id}`;
  const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

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

  const STR = {
    ar: {
      level: (n) => `المرحلة ${n}`,
      mixed: 'التحدي الكبير 🎲',
      mixedSub: 'أسئلة عشوائية من كل الدروس',
      play: 'هيا نلعب! 🎮',
      check: '✓',
      erase: '⌫',
      answerIs: 'الإجابة الصحيحة:',
      next: 'التالي ⬅️',
      finish: 'النتيجة 🏁',
      praise: ['ممتاز! 🌟', 'أحسنت! 🎉', 'رائع جداً! 🚀', 'برافو عليك! 👏', 'شاطر! 💪', 'عبقري! 🧠'],
      oops: ['محاولة جميلة! انظر للتلميح 💡', 'لا بأس، نتعلم من الخطأ 💛', 'قريب جداً! انظر كيف نحلها 👀'],
      typeHint: 'اكتب الناتج من الآحاد (اليمين) ⬅️',
      score: (a, b) => `إجاباتك الصحيحة: ${a} من ${b}`,
      endTitle: ['لا بأس، التمرين يصنع الأبطال! 💪', 'بداية جيدة! 👍', 'رائع جداً! 🌟', 'أنت بطل هذا الفصل! 🏆'],
      raceWin: 'فزنا بالسباق! 🏁',
      raceLose: 'المنافس سبقنا هذه المرة! 🏎️',
      turbo: 'سرعة إضافية! 🚀',
      nextLevel: 'المرحلة التالية ⬅️',
      again: 'العب مرة أخرى 🔁',
      map: 'خريطة الفصل 🗺️',
    },
    en: {
      level: (n) => `Level ${n}`,
      mixed: 'Big Challenge 🎲',
      mixedSub: 'Random questions from every lesson',
      play: "Let's play! 🎮",
      check: '✓',
      erase: '⌫',
      answerIs: 'The right answer:',
      next: 'Next ➡️',
      finish: 'Results 🏁',
      praise: ['Awesome! 🌟', 'Great job! 🎉', 'Super! 🚀', 'Well done! 👏', 'You rock! 💪', 'Genius! 🧠'],
      oops: ['Nice try! Look at the hint 💡', "It's okay, we learn from mistakes 💛", "So close! Here's how we solve it 👀"],
      typeHint: 'Type the answer starting from the ones (right) ➡️',
      score: (a, b) => `You got ${a} out of ${b} right`,
      endTitle: ['Keep practicing, champion! 💪', 'Good start! 👍', 'Really great! 🌟', 'Chapter hero! 🏆'],
      raceWin: 'We won the race! 🏁',
      raceLose: 'The rival was faster this time! 🏎️',
      turbo: 'Turbo boost! 🚀',
      nextLevel: 'Next level ➡️',
      again: 'Play again 🔁',
      map: 'Chapter map 🗺️',
    },
    arF: {
      praise: ['ممتاز! 🌟', 'أحسنتِ! 🎉', 'رائع جداً! 🚀', 'برافو عليكِ! 👏', 'شاطرة! 💪', 'عبقرية! 🧠'],
      oops: ['محاولة جميلة! انظري للتلميح 💡', 'لا بأس، نتعلم من الخطأ 💛', 'قريب جداً! انظري كيف نحلها 👀'],
      typeHint: 'اكتبي الناتج من الآحاد (اليمين) ⬅️',
      endTitle: ['لا بأس، التمرين يصنع الأبطال! 💪', 'بداية جيدة! 👍', 'رائع جداً! 🌟', 'أنتِ بطلة هذا الفصل! 🏆'],
      again: 'العبي مرة أخرى 🔁',
    },
    enF: {
      endTitle: ['Keep practicing, champion! 💪', 'Good start! 👍', 'Really great! 🌟', 'Chapter heroine! 🏆'],
    },
  };

  const LEVELS = cfg.levels.concat([
    {
      mixed: true,
      icon: '🎲',
      color: '#7B61FF',
      gens: cfg.levels.flatMap((l) => l.gens),
      games: cfg.levels.map((l) => l.game).filter(Boolean),
    },
  ]);

  let ctx = null;
  let timers = [];
  let active = false;
  const st = {
    view: 'map',
    level: 0,
    qs: [],
    idx: 0,
    results: [],
    locked: false,
    typed: [],
    pose: 'ready',
    hero: 0,
    rival: 0,
    voice: false,
    game: 'choice',
    mg: {},
  };

  const S = () => Profile.strings(STR, ctx.lang());
  const $ = (id) => document.getElementById(id);

  const api = {
    get ar() {
      return ctx.lang() === 'ar';
    },
    N: (n) => ctx.num(n),
    tx: (ar, en) => (ctx.lang() === 'ar' ? ar : en),
    g: (boy, girl) => (Profile.isGirl ? girl : boy),
    R,
    pick,
    shuffle,
    digit: (d) => (ctx.lang() === 'ar' ? AR_DIGITS[d] : String(d)),
    // Four distinct non-negative whole-number choices, shuffled.
    opts(answer, extras, n = 4) {
      const set = new Set([answer]);
      const pool = shuffle(extras).concat(shuffle([answer + 1, answer - 1, answer + 2, answer + 10, answer - 10]));
      for (const x of pool) {
        if (set.size >= n) break;
        if (Number.isInteger(x) && x >= 0) set.add(x);
      }
      for (let k = 3; set.size < n; k++) set.add(answer + k);
      return shuffle([...set]);
    },
    box: (fill) => `<span class="box${fill != null ? ' filled' : ''}">${fill != null ? fill : ''}</span>`,
    // Equation from tokens: numbers are formatted, '?' becomes the answer box, strings are operators/text.
    eq(tokens, fill) {
      const parts = tokens.map((t) => {
        if (t === '?') return api.box(fill);
        if (typeof t === 'number') return `<span>${api.N(t)}</span>`;
        if (/^[+−×÷=<>]$/.test(t)) return `<span class="op">${t}</span>`;
        return `<span class="eq-word">${t}</span>`;
      });
      return `<div class="ch1-eq adv-eq" dir="${ctx.lang() === 'ar' ? 'rtl' : 'ltr'}">${parts.join('')}</div>`;
    },
    emojis: (e, n) => `<span class="emo-row">${Array.from({ length: n }, () => `<span>${e}</span>`).join('')}</span>`,
    groups(count, size, e, extra = 0) {
      const g = Array.from({ length: count }, () => `<span class="emo-group">${api.emojis(e, size).replace('emo-row', 'emo-in')}</span>`).join('');
      const left = extra ? `<span class="emo-group left">${api.emojis(e, extra).replace('emo-row', 'emo-in')}</span>` : '';
      return `<div class="emo-groups">${g}${left}</div>`;
    },
    colHtml,
  };

  // ---------- Column arithmetic ----------

  function digitsOf(n) {
    return String(n).split('').map(Number);
  }

  function colWork(a, b, op) {
    const A = digitsOf(a).reverse();
    const B = digitsOf(b).reverse();
    const marks = [];
    if (op === '+') {
      let c = 0;
      for (let i = 0; i < Math.max(A.length, B.length); i++) {
        const s = (A[i] || 0) + (B[i] || 0) + c;
        c = s >= 10 ? 1 : 0;
        if (c) marks[i + 1] = 1;
      }
    } else if (op === '×') {
      let c = 0;
      for (let i = 0; i < A.length; i++) {
        const p = A[i] * b + c;
        c = Math.floor(p / 10);
        if (c && i < A.length - 1) marks[i + 1] = c;
      }
    } else {
      const top = A.slice();
      for (let i = 0; i < top.length; i++) {
        if (top[i] < (B[i] || 0)) {
          top[i] += 10;
          top[i + 1] -= 1;
          marks[i] = top[i];
        }
      }
      for (let i = 0; i < top.length; i++) if (top[i] !== A[i] && marks[i] == null) marks[i] = top[i];
    }
    return marks;
  }

  // Vertical layout. typed: digits typed so far (units first); show: reveal the full answer with working marks.
  function colHtml(a, b, op, { typed = null, show = false } = {}) {
    const ans = op === '+' ? a + b : op === '−' ? a - b : a * b;
    const ansLen = String(ans).length;
    const W = Math.max(String(a).length, String(b).length + 1, ansLen);
    const D = api.digit;
    const cells = (n, cls = '') => {
      const s = String(n);
      return Array.from({ length: W }, (_, i) => {
        const k = i - (W - s.length);
        return `<span class="col-cell ${cls}">${k >= 0 ? D(Number(s[k])) : ''}</span>`;
      }).join('');
    };
    const marks = show ? colWork(a, b, op) : [];
    const markRow = Array.from({ length: W }, (_, i) => {
      const m = marks[W - 1 - i];
      return `<span class="col-cell mark">${m != null ? api.N(m) : ''}</span>`;
    }).join('');
    const bStr = String(b);
    const bRow = Array.from({ length: W }, (_, i) => {
      const k = i - (W - bStr.length);
      if (i === 0) return `<span class="col-cell op">${op}</span>`;
      return `<span class="col-cell">${k >= 0 ? D(Number(bStr[k])) : ''}</span>`;
    }).join('');
    const ansDigits = digitsOf(ans).reverse();
    const ansRow = Array.from({ length: W }, (_, i) => {
      const pos = W - 1 - i;
      if (pos >= ansLen) return '<span class="col-cell"></span>';
      if (show) return `<span class="col-cell ans filled">${D(ansDigits[pos])}</span>`;
      const v = typed[pos];
      const cur = pos === typed.length ? 'cur' : '';
      return `<span class="col-cell ans ${v != null ? 'typed' : ''} ${cur}">${v != null ? D(v) : ''}</span>`;
    }).join('');
    const strikeTop = show && op === '−';
    const topCells = strikeTop
      ? Array.from({ length: W }, (_, i) => {
          const s = String(a);
          const k = i - (W - s.length);
          const pos = W - 1 - i;
          const struck = marks[pos] != null ? 'struck' : '';
          return `<span class="col-cell ${struck}">${k >= 0 ? D(Number(s[k])) : ''}</span>`;
        }).join('')
      : cells(a);
    return `<div class="col-math" dir="ltr" style="--w:${W}">
        ${show ? `<div class="col-row marks">${markRow}</div>` : ''}
        <div class="col-row">${topCells}</div>
        <div class="col-row">${bRow}</div>
        <div class="col-line"></div>
        <div class="col-row">${ansRow}</div>
      </div>`;
  }

  // ---------- Helpers ----------

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
  const tl = (o) => (o ? o[ctx.lang()] : '');
  const levelName = (i) => (LEVELS[i].mixed ? S().mixed : tl(LEVELS[i].name));

  function heroImgTag(id, cls) {
    const face = st.pose === 'ready' ? 'right' : '';
    return `<img class="adv-hero ${cls || ''}" ${id ? `id="${id}"` : ''} src="${Profile.heroImg(st.pose)}" data-face="${face}" alt="" draggable="false">`;
  }

  function heroTalk(text, pose = 'ready') {
    return `<div class="mascot-row" id="heroTalk">
      <img class="avatar hero-avatar pop-in" src="${Profile.heroImg(pose)}" alt="" draggable="false">
      <div class="bubble pop-in" style="--d:120ms">${text}</div>
    </div>`;
  }

  // ---------- Scene ----------

  function sceneHtml() {
    const m = cfg.mech;
    const n = st.qs.length;
    const done = st.results.length;
    const ok = st.results.filter(Boolean).length;
    const hero = heroImgTag('advHero');
    switch (m.type) {
      case 'path': {
        const stones = Array.from({ length: n }, (_, i) => {
          const r = st.results[i] === true ? 'ok' : st.results[i] === false ? 'miss' : '';
          return `<span class="m-stone ${r}">${i === done ? hero : ''}</span>`;
        }).join('');
        return `<div class="m-track">${stones}<span class="m-goal ${done >= n ? 'reached' : ''}">${done >= n ? hero : ''}${m.goal}</span></div>`;
      }
      case 'build': {
        const slots = Array.from({ length: n }, (_, i) => {
          const r = st.results[i] === true ? 'ok' : st.results[i] === false ? 'miss' : '';
          return `<span class="m-slot ${r}">${r ? m.token : ''}</span>`;
        }).join('');
        return `${hero}<div class="m-build">${slots}</div><span class="m-goal ${ok >= n ? 'reached' : ''}">${m.goal}</span>`;
      }
      case 'fill': {
        const pct = Math.round((ok / n) * 100);
        return `${hero}<div class="m-jar"><div class="m-jar-fill" style="height:${pct}%"></div>
            <div class="m-jar-items">${api.emojis(m.token, ok)}</div><span class="m-jar-label">${m.container}</span></div>
            <span class="m-goal ${ok >= n - 1 ? 'reached' : ''}">${m.goal}</span>`;
      }
      case 'climb': {
        const pct = Math.round((ok / n) * 78);
        return `${hero}<div class="m-sky"><span class="m-goal">${m.goal}</span><span class="m-vehicle" style="bottom:${pct}%">${m.token}</span></div>`;
      }
      default: {
        const hp = Math.min(st.hero / n, 1) * 82;
        const rp = Math.min(st.rival / n, 1) * 82;
        return `<div class="m-lanes">
            <div class="m-lane"><span class="m-runner" style="inset-inline-start:${hp}%">${hero}</span></div>
            <div class="m-lane"><span class="m-runner rival" style="inset-inline-start:${rp}%">${m.rival}</span></div>
            <span class="m-flag">🏁</span>
          </div>`;
      }
    }
  }

  function updateScene(anim) {
    const $scene = $('advScene');
    if (!$scene) return;
    $scene.innerHTML = sceneHtml();
    const $hero = $('advHero');
    if ($hero && anim) $hero.classList.add(anim);
  }

  // ---------- Screens ----------

  function renderMap() {
    const s = S();
    const progress = loadProgress();
    const cards = LEVELS.map((L, i) => {
      const color = L.color || cfg.color;
      return `<button class="level-card adv-level-card pop-in ${L.mixed ? 'boss' : ''}" type="button" data-i="${i}" style="--c:${color};--d:${i * 50}ms">
        <span class="adv-level-icon">${L.icon}</span>
        <span class="level-info">
          <span class="level-num">${L.mixed ? s.mixedSub : s.level(api.N(i + 1))}</span>
          <b>${levelName(i)}</b>
        </span>
        <span class="level-status">${ctx.starsHtml(progress[i] || 0)}</span>
      </button>`;
    }).join('');

    ctx.root.innerHTML = `
      <section class="adv adv-map" style="--c:${cfg.color}">
        <h2 class="ch1-title">${cfg.icon} ${tl(cfg.title)}</h2>
        ${heroTalk(Voice.bubble(cfg.id, ctx.lang()))}
        <div class="adv-levels">${cards}</div>
      </section>`;
    Voice.wire(ctx.root, ctx.lang());
    if (st.voice) {
      st.voice = false;
      Voice.play(cfg.id, ctx.lang());
    }

    ctx.root.querySelectorAll('.adv-level-card').forEach((btn) =>
      btn.addEventListener('click', () => {
        Sounds.tap();
        st.level = Number(btn.dataset.i);
        if (LEVELS[st.level].mixed) startLevel();
        else show('learn');
      })
    );
  }

  function renderLearn() {
    const s = S();
    const L = LEVELS[st.level];
    ctx.root.innerHTML = `
      <section class="adv adv-learn" style="--c:${L.color || cfg.color}">
        <h2 class="ch1-title">${L.icon} ${levelName(st.level)}</h2>
        ${heroTalk(`💡 ${tl(L.rule)}`)}
        <div class="card rule-card pop-in">${L.example(api)}</div>
        <div class="center"><button class="big-btn" type="button" id="goBtn">${s.play}</button></div>
      </section>`;
    $('goBtn').addEventListener('click', () => {
      Sounds.tap();
      startLevel();
    });
  }

  function buildQuestions() {
    const gens = LEVELS[st.level].gens;
    let order = [];
    while (order.length < PER_LEVEL) order = order.concat(shuffle(gens));
    order = order.slice(0, PER_LEVEL);
    const seen = new Set();
    return order.map((gen) => {
      let q;
      let tries = 0;
      do q = gen(api);
      while (seen.has(q.key) && ++tries < 20);
      seen.add(q.key);
      q.type = q.type || 'choice';
      return q;
    });
  }

  function startLevel() {
    clearTimers();
    Voice.stop();
    if (window.MiniGames) MiniGames.destroy();
    const L = LEVELS[st.level];
    st.qs = buildQuestions();
    st.idx = 0;
    st.results = [];
    st.locked = false;
    st.pose = 'ready';
    st.hero = 0;
    st.rival = 0;
    st.mg = {};
    st.game =
      L.mixed && L.games && L.games.length
        ? pick(L.games)
        : L.game || (cfg.mech.type === 'race' ? 'race' : 'choice');
    show('play');
  }

  function label(q, v) {
    return q.label ? q.label(v) : api.N(v);
  }

  function keypadHtml() {
    const s = S();
    const keys = [1, 2, 3, 4, 5, 'del', 6, 7, 8, 9, 0, 'ok'];
    return `<div class="keypad" dir="ltr">${keys
      .map((k) => {
        if (k === 'del') return `<button class="key del" type="button" data-k="del">${s.erase}</button>`;
        if (k === 'ok') return `<button class="key ok" type="button" data-k="ok" id="okKey" disabled>${s.check}</button>`;
        return `<button class="key" type="button" data-k="${k}">${api.digit(k)}</button>`;
      })
      .join('')}</div>`;
  }

  function renderPlay() {
    const s = S();
    const L = LEVELS[st.level];
    const q = st.qs[st.idx];
    st.typed = [];
    st.pose = 'ready';
    st.t0 = performance.now();
    if (window.MiniGames) MiniGames.destroy();

    const gameId = st.game || L.game || 'choice';
    const gameLabel = window.MiniGames ? MiniGames.label(gameId, ctx.lang()) : '';

    let body;
    if (q.type === 'column') {
      body = `<div class="card adv-card col-card" id="colCard">${colHtml(q.col.a, q.col.b, q.col.op, { typed: st.typed })}</div>
        <p class="adv-type-hint">${s.typeHint}</p>
        ${keypadHtml()}`;
    } else {
      const visual = q.visual ? `<div class="card adv-card">${q.visual()}</div>` : '';
      body = `${visual}<div class="mg-host" id="mgHost"></div>`;
    }

    ctx.root.innerHTML = `
      <section class="adv adv-play mech-${cfg.mech.type} theme-${cfg.id}" style="--c:${L.color || cfg.color}">
        <div class="adv-top">
          <span class="adv-chip">${L.icon} ${levelName(st.level)}</span>
          ${gameLabel && q.type !== 'column' ? `<span class="mg-chip">${gameLabel}</span>` : ''}
          <span class="adv-count">${api.N(st.idx + 1)} / ${api.N(st.qs.length)}</span>
        </div>
        <div class="adv-scene scene-${cfg.mech.bg}" id="advScene">${sceneHtml()}</div>
        <div class="adv-say" id="say">${q.prompt()}</div>
        ${body}
      </section>`;

    if (q.type === 'column') {
      ctx.root.querySelectorAll('.key').forEach((k) => k.addEventListener('click', () => press(k.dataset.k)));
    } else if (window.MiniGames) {
      const mgApi = {
        N: api.N,
        tx: api.tx,
        label,
        locked: () => st.locked,
        mg: st.mg,
        themeEmoji: cfg.mech.token || cfg.mech.goal || cfg.icon || '⭐',
        answer(v, btn) {
          resolve(v === q.answer, btn);
        },
      };
      MiniGames.mount($('mgHost'), gameId, q, mgApi);
    }
  }

  function press(k) {
    const q = st.qs[st.idx];
    if (st.locked || !q || q.type !== 'column') return;
    const len = String(q.answer).length;
    if (k === 'ok') {
      if (st.typed.length < len) return;
      resolve(Number(st.typed.slice().reverse().join('')) === q.answer);
      return;
    }
    Sounds.tap();
    if (k === 'del') st.typed.pop();
    else if (st.typed.length < len) st.typed.push(Number(k));
    $('colCard').innerHTML = colHtml(q.col.a, q.col.b, q.col.op, { typed: st.typed });
    $('okKey').disabled = st.typed.length < len;
  }

  function resolve(correct, btn) {
    if (st.locked) return;
    st.locked = true;
    const s = S();
    const q = st.qs[st.idx];
    st.results[st.idx] = correct;

    ctx.root.querySelectorAll('.choice, .key, .mg-door, .mg-balloon, .mg-card, .mg-sort-card, .mg-bucket, .mg-box').forEach((b) => (b.disabled = true));
    ctx.root.querySelectorAll('.choice, .mg-door, .mg-balloon, .mg-sort-card').forEach((b) => {
      const v = b.dataset.v != null ? Number(b.dataset.v) : q.choices[Number(b.dataset.i)];
      if (v === q.answer) b.classList.add('right');
      else if (b !== btn) b.classList.add('faded');
    });
    const $box = ctx.root.querySelector('.adv-say .box, .adv-card .box');
    if ($box) {
      $box.innerHTML = label(q, q.answer);
      $box.classList.add('filled');
    }

    let turbo = false;
    if (cfg.mech.type === 'race') {
      st.rival += 0.8;
      if (correct) {
        turbo = performance.now() - st.t0 < 7000;
        st.hero += turbo ? 1.5 : 1;
      }
    }

    const $say = $('say');
    if (correct) {
      Sounds.correct();
      st.pose = 'victory';
      updateScene('jump');
      if (q.type === 'column') {
        $('colCard').innerHTML = colHtml(q.col.a, q.col.b, q.col.op, { show: true });
        $('colCard').classList.add('correct');
      }
      $say.innerHTML = `${pick(s.praise)}${turbo ? ` <small>${s.turbo}</small>` : ''}`;
      const r = (btn || $say).getBoundingClientRect();
      Confetti.burst(40, r.left + r.width / 2, r.top + r.height / 2);
      later(next, 1400);
      return;
    }

    if (btn) btn.classList.add('wrong');
    Sounds.wrong();
    st.pose = 'hurt';
    updateScene('nod');
    $say.textContent = pick(s.oops);
    const last = st.idx >= st.qs.length - 1;
    later(() => {
      UI.sheet(
        `<div class="oops">${s.answerIs} <b>${label(q, q.answer)}</b></div><div class="hint-box">${q.hint()}</div>`,
        last ? s.finish : s.next,
        next
      );
    }, 700);
  }

  function next() {
    clearTimers();
    UI.closeSheet();
    if (window.MiniGames) MiniGames.destroy();
    st.idx++;
    st.locked = false;
    if (st.idx >= st.qs.length) finish();
    else renderPlay();
  }

  function starsFor(ok) {
    if (ok >= 7) return 3;
    if (ok >= 5) return 2;
    if (ok >= 3) return 1;
    return 0;
  }

  function finish() {
    const ok = st.results.filter(Boolean).length;
    const stars = starsFor(ok);
    const progress = loadProgress();
    if (stars > (progress[st.level] || 0)) {
      progress[st.level] = stars;
      localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
    }
    if (stars >= 1) Sounds.fanfare();
    if (stars >= 2) Confetti.celebrate();
    show('end');
  }

  function renderEnd() {
    const s = S();
    const L = LEVELS[st.level];
    const ok = st.results.filter(Boolean).length;
    const stars = starsFor(ok);
    const hasNext = st.level < LEVELS.length - 1;
    const race = cfg.mech.type === 'race' ? `<p class="score">${st.hero >= st.rival ? s.raceWin : s.raceLose}</p>` : '';
    ctx.root.innerHTML = `
      <section class="adv ch1-end adv-end card pop-in" style="--c:${L.color || cfg.color}">
        <div class="end-scene">
          <img class="end-hero" src="${Profile.heroImg(stars >= 2 ? 'victory' : 'ready')}" alt="">
          <span class="end-emoji">${stars >= 2 ? cfg.mech.goal : '💪'}</span>
        </div>
        <h2>${s.endTitle[stars]}</h2>
        ${race}
        <p class="score">${s.score(api.N(ok), api.N(st.qs.length))}</p>
        <div class="stars-big">${ctx.starsHtml(stars)}</div>
        <div class="result-actions">
          ${hasNext ? `<button class="big-btn" type="button" data-act="next">${s.nextLevel}</button>` : ''}
          <button class="big-btn ${hasNext ? 'alt' : ''}" type="button" data-act="again">${s.again}</button>
          <button class="big-btn alt2" type="button" data-act="map">${s.map}</button>
        </div>
      </section>`;
    ctx.root.querySelectorAll('[data-act]').forEach((btn) =>
      btn.addEventListener('click', () => {
        Sounds.tap();
        const act = btn.dataset.act;
        if (act === 'next') {
          st.level++;
          if (LEVELS[st.level].mixed) startLevel();
          else show('learn');
        } else if (act === 'again') startLevel();
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
    if (st.view === 'play' && st.locked) {
      next();
      return;
    }
    clearTimers();
    if (st.view === 'map') renderMap();
    else if (st.view === 'learn') renderLearn();
    else if (st.view === 'play') renderPlay();
    else renderEnd();
  }

  document.addEventListener('keydown', (e) => {
    if (!active || st.view !== 'play' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('del');
    else if (e.key === 'Enter') press('ok');
  });

  return {
    enter() {
      clearTimers();
      active = true;
      st.view = 'map';
      st.voice = true;
    },
    leave() {
      clearTimers();
      active = false;
      UI.closeSheet();
      Voice.stop();
    },
    render,
    // Exposed for automated checks of the question generators.
    _test: { buildQuestions: (lvl, c) => ((ctx = c), (st.level = lvl), buildQuestions()), LEVELS, api },
  };
};
