(function () {
  const $app = document.getElementById('app');
  const $homeBtn = document.getElementById('homeBtn');
  const $langBtn = document.getElementById('langBtn');
  const $soundBtn = document.getElementById('soundBtn');
  const $title = document.getElementById('appTitle');

  const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const EMOJI = ['🍎', '🍓', '⭐', '🐟', '🌸', '🍪', '🎈', '🐞', '🍊', '💎'];
  const COLORS = ['#FF5E7E', '#FF8A3D', '#F5B700', '#2ECC71', '#1FB5C9', '#4A90FF', '#7B61FF', '#D94FE8', '#FF6FB5', '#00B894'];
  const QUESTIONS_PER_ROUND = 10;
  const CHAPTERS = {
    chapter1: Chapter1,
    chapter2: Chapter2,
    ch3: Chapter3,
    ch4: Chapter4,
    ch5: Chapter5,
    ch6: Chapter6,
    ch7: Chapter7,
    ch8: Chapter8,
    ch9: Chapter9,
    ch10: Chapter10,
  };
  const START_TILES = [
    { key: 'chapter1', icon: null, bg: '#7B61FF,#1FB5C9', ar: 'قواعد الضرب', en: 'Multiplication Rules' },
    { key: 'chapter2', icon: '⏰', bg: '#FFB13D,#FF5E7E', ar: 'الوقت', en: 'Time' },
    { key: 'ch3', icon: '🍬', bg: '#FF6FB5,#FF9A8B', ar: 'القسمة', en: 'Division' },
    { key: 'ch4', icon: '🏴‍☠️', bg: '#E17055,#FDCB6E', ar: 'الجمع والطرح', en: 'Add & Subtract' },
    { key: 'ch5', icon: '📏', bg: '#0984E3,#74B9FF', ar: 'الطول', en: 'Length' },
    { key: 'ch6', icon: '📊', bg: '#00B894,#55EFC4', ar: 'الجداول والرسوم', en: 'Tables & Graphs' },
    { key: 'ch7', icon: '🏎️', bg: '#E84393,#FD79A8', ar: 'الحساب الذهني', en: 'Mental Math' },
    { key: 'ch8', icon: '🚚', bg: '#F39C12,#FDCB6E', ar: 'القسمة بباقٍ', en: 'Remainders' },
    { key: 'ch9', icon: '🚀', bg: '#6C5CE7,#A29BFE', ar: 'الأعداد الكبيرة', en: 'Big Numbers' },
    { key: 'ch10', icon: '🤖', bg: '#00CEC9,#0984E3', ar: 'الضرب الرأسي', en: 'Column ×' },
  ];
  const SAVE_KEYS = { chapter1: 'mt.ch1', chapter2: 'mt.ch2' };
  const AVATAR_MOODS = ['hello', 'think', 'cheer', 'encourage', 'trophy'];
  function preloadAvatar() {
    AVATAR_MOODS.forEach((mood) => {
      new Image().src = Profile.avatarImg(mood);
    });
  }
  preloadAvatar();

  const STRINGS = {
    ar: {
      title: 'مغامرات الرياضيات 🎈',
      startTalk: (n) => `أهلاً يا ${n}! ماذا نتعلم اليوم؟ 😊`,
      editProfile: '✏️ تغيير الشخصية أو الاسم',
      setupTalk: 'أهلاً! من سيلعب معنا اليوم؟ 😊',
      setupHero: '١. الشخصية',
      setupName: '٢. الاسم',
      namePlaceholder: 'الاسم هنا ✏️',
      boy: 'ولد',
      girl: 'بنت',
      setupGo: 'هيا نبدأ! 🚀',
      startTables: 'جدول الضرب',
      startTablesSub: 'راجع والعب 🎮',
      chapterN: (n) => `الفصل ${n}`,
      table: 'جدول',
      mixed: 'تحدي الأبطال (كل الجداول)',
      review: 'هيا نراجع جدول',
      play: 'هيا نلعب! 🎮',
      next: 'التالي ⬅️',
      question: 'السؤال',
      of: 'من',
      qmark: '؟',
      groups: (a, b) => `عدد المجموعات: ${a} ، في كل مجموعة: ${b}`,
      praise: ['ممتاز! 🌟', 'أحسنت! 🎉', 'رائع جداً! 🚀', 'برافو عليك! 👏', 'شاطر! 💪', 'عبقري! 🧠', 'هايل! 🦁'],
      streak: (n) => `${n} إجابات صحيحة متتالية! 🔥`,
      oops: 'محاولة جميلة! 💛 الإجابة الصحيحة هي',
      thinking: ['فكّر جيداً! 🤔', 'أنت تستطيع! 💪', 'هيا يا بطل! 🚀', 'أنا واثق فيك! 😊'],
      cheerUp: ['ولا يهمك! المرة الجاية هتعرفها 💛', 'غلطة صغيرة، كمّل يا بطل! 💪', 'كلنا بنتعلم من أخطائنا 😊'],
      reviewTalk: 'اضغط على أي سطر وأنا هوريك الرسم! 👆',
      score: (s, t) => `إجاباتك الصحيحة: ${s} من ${t}`,
      result: ['لا بأس، التمرين يصنع الأبطال! 💪', 'بداية جيدة! 👍', 'رائع جداً! 🌟', 'أنت بطل جدول الضرب! 🏆'],
      again: 'العب مرة أخرى 🔁',
      reviewAgain: 'راجع الجدول 📖',
      chooseOther: 'اختر جدولاً آخر 🏠',
      home: 'الرئيسية',
      lang: 'English',
      sound: 'الصوت',
    },
    en: {
      title: 'Math Adventures 🎈',
      startTalk: (n) => `Hi ${n}! What shall we learn today? 😊`,
      editProfile: '✏️ Change character or name',
      setupTalk: "Hi! Who's playing with us today? 😊",
      setupHero: '1. Pick your character',
      setupName: '2. Your name',
      namePlaceholder: 'Type your name ✏️',
      boy: 'Boy',
      girl: 'Girl',
      setupGo: "Let's start! 🚀",
      startTables: 'Times Tables',
      startTablesSub: 'Review and play 🎮',
      chapterN: (n) => `Chapter ${n}`,
      table: 'Table',
      mixed: 'Champion Challenge (all tables)',
      review: "Let's review the table of",
      play: "Let's play! 🎮",
      next: 'Next ➡️',
      question: 'Question',
      of: 'of',
      qmark: '?',
      groups: (a, b) => `${a} groups of ${b}`,
      praise: ['Awesome! 🌟', 'Great job! 🎉', 'Super! 🚀', 'Well done! 👏', 'You rock! 💪', 'Genius! 🧠', 'Fantastic! 🦁'],
      streak: (n) => `${n} in a row! 🔥`,
      oops: 'Nice try! 💛 The answer is',
      thinking: ['Think carefully! 🤔', 'You can do it! 💪', 'Go, champion! 🚀', 'I believe in you! 😊'],
      cheerUp: ["Don't worry, you'll get it next time! 💛", 'Small mistake, keep going champ! 💪', 'We all learn from mistakes 😊'],
      reviewTalk: "Tap any row and I'll show you the picture! 👆",
      score: (s, t) => `You got ${s} out of ${t} right`,
      result: ['Keep practicing, champion! 💪', 'Good start! 👍', 'Really great! 🌟', 'Times table hero! 🏆'],
      again: 'Play again 🔁',
      reviewAgain: 'Review the table 📖',
      chooseOther: 'Pick another table 🏠',
      home: 'Home',
      lang: 'العربية',
      sound: 'Sound',
    },
    arF: {
      startTablesSub: 'راجعي والعبي 🎮',
      praise: ['ممتاز! 🌟', 'أحسنتِ! 🎉', 'رائع جداً! 🚀', 'برافو عليكِ! 👏', 'شاطرة! 💪', 'عبقرية! 🧠', 'هايلة! 🦁'],
      thinking: ['فكّري جيداً! 🤔', 'أنتِ تستطيعين! 💪', 'هيا يا بطلة! 🚀', 'أنا واثقة فيكِ! 😊'],
      cheerUp: ['ولا يهمك! المرة الجاية هتعرفيها 💛', 'غلطة صغيرة، كمّلي يا بطلة! 💪', 'كلنا بنتعلم من أخطائنا 😊'],
      reviewTalk: 'اضغطي على أي سطر وأنا هوريكي الرسم! 👆',
      result: ['لا بأس، التمرين يصنع الأبطال! 💪', 'بداية جيدة! 👍', 'رائع جداً! 🌟', 'أنتِ بطلة جدول الضرب! 🏆'],
      reviewAgain: 'راجعي الجدول 📖',
      chooseOther: 'اختاري جدولاً آخر 🏠',
    },
    enF: {
      result: ['Keep practicing, champion! 💪', 'Good start! 👍', 'Really great! 🌟', 'Times table heroine! 🏆'],
    },
  };

  let lang = localStorage.getItem('mt.lang') === 'en' ? 'en' : 'ar';
  let stars = JSON.parse(localStorage.getItem('mt.stars') || '{}');
  let screen = { name: Profile.exists ? 'start' : 'setup' };
  let quiz = null;
  let pendingTimer = null;

  const formatters = { ar: new Intl.NumberFormat('ar-EG'), en: new Intl.NumberFormat('en-US') };
  const num = (n) => formatters[lang].format(n);
  const t = (key, ...args) => {
    const v = Profile.strings(STRINGS, lang)[key];
    return typeof v === 'function' ? v(...args) : v;
  };

  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function starsHtml(count) {
    return `<span class="stars">${[0, 1, 2]
      .map((i) => `<span class="star ${i < count ? 'on' : ''}">⭐</span>`)
      .join('')}</span>`;
  }

  function mascot(mood, text, size = '') {
    return `<div class="mascot-row ${size}" id="mascot">
      <img class="avatar pop-in" src="${Profile.avatarImg(mood)}" alt="" draggable="false">
      <div class="bubble pop-in" style="--d:120ms">${text}</div>
    </div>`;
  }

  function setMascot(mood, text, animation) {
    const $m = document.getElementById('mascot');
    if (!$m) return;
    const $img = $m.querySelector('.avatar');
    const $bubble = $m.querySelector('.bubble');
    $img.src = Profile.avatarImg(mood);
    $bubble.innerHTML = text;
    for (const el of [$img, $bubble]) {
      el.classList.remove('pop-in', 'jump', 'nod');
      void el.offsetWidth;
    }
    $img.classList.add(animation);
    $bubble.classList.add('pop-in');
  }

  function equation(a, b, answerHtml) {
    return `<div class="equation" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
      <span>${num(a)}</span><span class="op">×</span><span>${num(b)}</span><span class="op">=</span><span class="ans">${answerHtml}</span>
    </div>`;
  }

  // Emoji size shrinks with the number of rows/columns so 10 × 10 still fits a phone screen.
  function arrayVisual(a, b, emoji) {
    const size = Math.min(30, Math.floor(150 / a) - 3, Math.floor(260 / b) - 4);
    const cells = Array.from({ length: b }, () => `<span>${emoji}</span>`).join('');
    const rows = range(1, a)
      .map((i) => `<div class="arr-row pop-in" style="--d:${i * 50}ms">${cells}</div>`)
      .join('');
    return `<div class="array" style="--s:${size}px">${rows}</div>
      <p class="array-caption">${t('groups', num(a), num(b))}</p>`;
  }

  function speak(a, b) {
    if (!Sounds.enabled || !('speechSynthesis' in window)) return;
    const prefix = lang === 'ar' ? 'ar' : 'en';
    const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (!voice) return;
    const text = lang === 'ar' ? `${a} في ${b} يساوي ${a * b}` : `${a} times ${b} equals ${a * b}`;
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = 0.9;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function saveStars() {
    localStorage.setItem('mt.stars', JSON.stringify(stars));
  }

  // ---------- Navigation ----------

  function go(next) {
    clearTimeout(pendingTimer);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    Voice.stop();
    UI.closeSheet();
    if (CHAPTERS[screen.name] && next.name !== screen.name) CHAPTERS[screen.name].leave();
    screen = next;
    render();
    UI.top();
  }

  function chapterStars(key) {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(SAVE_KEYS[key] || `mt.${key}`) || '{}');
    } catch {
      saved = {};
    }
    return Object.values(saved).reduce((a, b) => a + (Number(b) || 0), 0);
  }

  function setLabel(el, text) {
    el.title = text;
    el.setAttribute('aria-label', text);
  }

  function renderTopbar() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = t('title').replace(/\s*\S+$/u, '');
    $title.textContent = t('title');
    $langBtn.textContent = lang === 'ar' ? 'EN' : 'ع';
    setLabel($langBtn, t('lang'));
    $soundBtn.textContent = Sounds.enabled ? '🔊' : '🔇';
    setLabel($soundBtn, t('sound'));
    setLabel($homeBtn, t('home'));
    $homeBtn.classList.toggle('hidden', screen.name === 'start' || !Profile.exists);
  }

  function render() {
    renderTopbar();
    if (screen.name === 'setup') renderSetup();
    else if (screen.name === 'start') renderStart();
    else if (CHAPTERS[screen.name]) CHAPTERS[screen.name].render({ root: $app, lang: () => lang, num, starsHtml });
    else if (screen.name === 'home') renderHome();
    else if (screen.name === 'review') renderReview(screen.table);
    else if (screen.name === 'quiz') renderQuiz();
    else if (screen.name === 'result') renderResult();
  }

  // ---------- Start ----------

  function renderStart() {
    const tiles = START_TILES.map((c, i) => {
      const icon = c.icon ? `<span class="tile-icon">${c.icon}</span>` : `<img class="tile-icon" src="${Profile.heroImg('ready')}" alt="" draggable="false">`;
      const earned = chapterStars(c.key);
      return `<button class="chapter-tile pop-in" type="button" data-chapter="${c.key}" style="--bg:linear-gradient(135deg,${c.bg});--d:${i * 40}ms">
          ${icon}
          <span class="tile-text"><small>${t('chapterN', num(i + 1))}</small><b>${c[lang]}</b></span>
          ${earned ? `<span class="tile-stars">⭐${num(earned)}</span>` : ''}
        </button>`;
    }).join('');

    $app.innerHTML = `
      <section class="start">
        ${mascot('hello', t('startTalk', Profile.name))}
        <button class="tables-banner pop-in" type="button" id="tablesBtn">
          <span class="start-icon" dir="ltr">${num(3)}×${num(4)}</span>
          <b>${t('startTables')}</b>
          <span>${t('startTablesSub')}</span>
        </button>
        <div class="chapter-tiles">${tiles}</div>
        <div class="center"><button class="link-btn" type="button" id="editProfileBtn">${t('editProfile')}</button></div>
      </section>`;

    document.getElementById('tablesBtn').addEventListener('click', () => {
      Sounds.tap();
      go({ name: 'home' });
      Voice.play('tables', lang);
    });
    $app.querySelectorAll('[data-chapter]').forEach((btn) =>
      btn.addEventListener('click', () => {
        const key = btn.dataset.chapter;
        Sounds.tap();
        CHAPTERS[key].enter();
        go({ name: key });
        if (key === 'chapter1' || key === 'chapter2') Voice.play(key, lang);
      })
    );
    document.getElementById('editProfileBtn').addEventListener('click', () => {
      Sounds.tap();
      go({ name: 'setup' });
    });
  }

  // ---------- Setup (character and name) ----------

  function renderSetup() {
    const draft = screen.draft || (screen.draft = { avatar: Profile.exists ? Profile.avatar : null, name: Profile.rawName });
    const card = (id, img) => `
      <button class="avatar-choice pop-in ${draft.avatar === id ? 'selected' : ''}" type="button" data-avatar="${id}" style="--d:${id === 'girl' ? 120 : 0}ms">
        <img src="${img}" alt="" draggable="false">
        <b>${t(id)}</b>
      </button>`;

    $app.innerHTML = `
      <section class="setup">
        <h2 class="setup-talk pop-in">${t('setupTalk')}</h2>
        <div class="card setup-card pop-in">
          <h3>${t('setupHero')}</h3>
          <div class="avatar-choices">
            ${card('boy', 'img/avatar-hello.jpg')}
            ${card('girl', 'img/girl/avatar-hello.jpg')}
          </div>
          <h3>${t('setupName')}</h3>
          <input class="name-input" id="nameInput" type="text" maxlength="20" autocomplete="off" placeholder="${t('namePlaceholder')}">
          <div class="center"><button class="big-btn" type="button" id="setupGo">${t('setupGo')}</button></div>
        </div>
      </section>`;

    const $name = document.getElementById('nameInput');
    const $go = document.getElementById('setupGo');
    $name.value = draft.name;
    const update = () => {
      $go.disabled = !(draft.avatar && draft.name.trim());
    };
    update();

    $app.querySelectorAll('.avatar-choice').forEach((btn) =>
      btn.addEventListener('click', () => {
        Sounds.tap();
        draft.avatar = btn.dataset.avatar;
        $app.querySelectorAll('.avatar-choice').forEach((b) => b.classList.toggle('selected', b === btn));
        const $img = btn.querySelector('img');
        $img.classList.remove('jump');
        void $img.offsetWidth;
        $img.classList.add('jump');
        update();
      })
    );
    $name.addEventListener('input', () => {
      draft.name = $name.value;
      update();
    });
    $name.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !$go.disabled) $go.click();
    });
    $go.addEventListener('click', () => {
      Profile.save(draft.name, draft.avatar);
      preloadAvatar();
      Sounds.correct();
      Confetti.burst(80, innerWidth / 2, innerHeight / 2);
      go({ name: 'start' });
    });
  }

  // ---------- Home ----------

  function renderHome() {
    const cards = TABLES.map(
      (n, i) => `
      <button class="table-card pop-in" type="button" style="--c:${COLORS[i]};--d:${i * 50}ms" data-table="${n}">
        <span class="card-emoji">${EMOJI[i]}</span>
        <span class="card-num">${num(n)}</span>
        <span class="card-label">${t('table')} ${num(n)}</span>
        ${starsHtml(stars[n] || 0)}
      </button>`
    ).join('');

    $app.innerHTML = `
      <section class="home">
        ${mascot('hello', Voice.bubble('tables', lang))}
        <div class="grid">${cards}</div>
        <button class="mixed-card pop-in" type="button" style="--d:550ms" data-table="mix">
          <span>🎲 ${t('mixed')}</span>${starsHtml(stars.mix || 0)}
        </button>
      </section>`;
    Voice.wire($app, lang);

    $app.querySelectorAll('[data-table]').forEach((btn) =>
      btn.addEventListener('click', () => {
        Sounds.tap();
        const v = btn.dataset.table;
        if (v === 'mix') startQuiz('mix');
        else go({ name: 'review', table: Number(v) });
      })
    );
  }

  // ---------- Review ----------

  function renderReview(n) {
    const emoji = EMOJI[n - 1];
    const color = COLORS[n - 1];
    const rows = range(1, 10)
      .map(
        (b) => `<button class="fact-row pop-in" type="button" style="--d:${b * 40}ms" data-b="${b}">
          ${equation(n, b, num(n * b))}
        </button>`
      )
      .join('');

    $app.innerHTML = `
      <section class="review" style="--c:${color}">
        <h2>${emoji} ${t('review')} ${num(n)} ${emoji}</h2>
        <p class="review-talk">${t('reviewTalk')}</p>
        <div class="visual card" id="visual">${arrayVisual(n, 1, emoji)}</div>
        <div class="facts">${rows}</div>
        <div class="center"><button class="big-btn" type="button" id="playBtn">${t('play')}</button></div>
      </section>`;

    const $visual = document.getElementById('visual');
    $app.querySelectorAll('.fact-row').forEach((row) =>
      row.addEventListener('click', () => {
        const b = Number(row.dataset.b);
        Sounds.tap();
        $app.querySelectorAll('.fact-row.selected').forEach((r) => r.classList.remove('selected'));
        row.classList.add('selected');
        $visual.innerHTML = arrayVisual(n, b, emoji);
        speak(n, b);
      })
    );
    $app.querySelector('.fact-row').classList.add('selected');
    document.getElementById('playBtn').addEventListener('click', () => {
      Sounds.tap();
      startQuiz(n);
    });
  }

  // ---------- Quiz ----------

  function makeChoices(a, b) {
    const answer = a * b;
    const set = new Set([answer]);
    const candidates = shuffle([
      a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b,
      answer + 1, answer - 1, answer + 2, answer + 10, answer - 10, a + b,
    ]).filter((x) => x > 0 && x !== answer);
    for (const c of candidates) {
      if (set.size >= 4) break;
      set.add(c);
    }
    for (let k = 3; set.size < 4; k++) set.add(answer + k);
    return shuffle([...set]);
  }

  function makeQuestions(table) {
    let pairs;
    if (table === 'mix') {
      const seen = new Set();
      pairs = [];
      while (pairs.length < QUESTIONS_PER_ROUND) {
        const a = randInt(2, 10);
        const b = randInt(1, 10);
        const key = `${Math.min(a, b)}x${Math.max(a, b)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push({ a, b, table: a });
      }
    } else {
      // Occasionally flip the order to practise the commutative property (3 × 4 = 4 × 3).
      pairs = shuffle(range(1, 10)).map((b) =>
        Math.random() < 0.25 ? { a: b, b: table, table } : { a: table, b, table }
      );
    }
    return pairs.map((q) => ({ ...q, choices: makeChoices(q.a, q.b) }));
  }

  function startQuiz(table) {
    quiz = { table, qs: makeQuestions(table), idx: 0, score: 0, streak: 0, results: [], locked: false };
    go({ name: 'quiz' });
  }

  function renderQuiz() {
    const q = quiz.qs[quiz.idx];
    const color = COLORS[q.table - 1];
    const dots = quiz.qs
      .map((_, i) => {
        const cls = i < quiz.idx ? (quiz.results[i] ? 'ok' : 'miss') : i === quiz.idx ? 'now' : '';
        return `<span class="dot ${cls}"></span>`;
      })
      .join('');

    $app.innerHTML = `
      <section class="quiz" style="--c:${color}">
        <div class="quiz-top">
          <div class="dots">${dots}</div>
          <div class="streak ${quiz.streak >= 3 ? 'hot' : ''}">🔥 ${num(quiz.streak)}</div>
        </div>
        ${mascot('think', pick(t('thinking')))}
        <div class="question card pop-in">
          <p class="q-label">${t('question')} ${num(quiz.idx + 1)} ${t('of')} ${num(quiz.qs.length)}</p>
          ${equation(q.a, q.b, `<span class="qmark">${t('qmark')}</span>`)}
        </div>
        <div class="choices">
          ${q.choices
            .map((v, i) => `<button class="choice pop-in" type="button" style="--d:${100 + i * 70}ms" data-v="${v}">${num(v)}</button>`)
            .join('')}
        </div>
        <div class="feedback" id="feedback" aria-live="polite"></div>
      </section>`;

    $app.querySelectorAll('.choice').forEach((btn) =>
      btn.addEventListener('click', () => answer(btn, Number(btn.dataset.v)))
    );
  }

  function answer(btn, value) {
    if (quiz.locked) return;
    quiz.locked = true;

    const q = quiz.qs[quiz.idx];
    const correctValue = q.a * q.b;
    const isCorrect = value === correctValue;
    quiz.results[quiz.idx] = isCorrect;

    const $feedback = document.getElementById('feedback');
    const $ans = $app.querySelector('.question .ans');
    $ans.innerHTML = `<span class="bounce">${num(correctValue)}</span>`;

    $app.querySelectorAll('.choice').forEach((b) => {
      b.disabled = true;
      const v = Number(b.dataset.v);
      if (v === correctValue) b.classList.add('right');
      else if (b !== btn) b.classList.add('faded');
    });

    if (isCorrect) {
      quiz.score++;
      quiz.streak++;
      Sounds.correct();
      const r = btn.getBoundingClientRect();
      Confetti.burst(60, r.left + r.width / 2, r.top + r.height / 2);
      setMascot('cheer', pick(t('praise')), 'jump');
      $feedback.innerHTML =
        quiz.streak >= 3 ? `<div class="streak-msg bounce">${t('streak', num(quiz.streak))}</div>` : '';
      pendingTimer = setTimeout(nextQuestion, 1700);
    } else {
      quiz.streak = 0;
      btn.classList.add('wrong');
      Sounds.wrong();
      setMascot('encourage', pick(t('cheerUp')), 'nod');
      pendingTimer = setTimeout(
        () =>
          UI.sheet(
            `<div class="oops">${t('oops')} <b>${num(correctValue)}</b></div>
             <div class="visual hint-visual" style="--c:${COLORS[q.table - 1]}">${arrayVisual(q.a, q.b, EMOJI[q.table - 1])}</div>`,
            t('next'),
            nextQuestion
          ),
        600
      );
    }
  }

  function nextQuestion() {
    clearTimeout(pendingTimer);
    quiz.idx++;
    quiz.locked = false;
    go({ name: quiz.idx >= quiz.qs.length ? 'result' : 'quiz' });
  }

  // ---------- Result ----------

  function starsFor(score) {
    if (score >= 9) return 3;
    if (score >= 7) return 2;
    if (score >= 5) return 1;
    return 0;
  }

  function renderResult() {
    const total = quiz.qs.length;
    const earned = starsFor(quiz.score);
    if (!screen.celebrated) {
      screen.celebrated = true;
      if (earned > (stars[quiz.table] || 0)) {
        stars[quiz.table] = earned;
        saveStars();
      }
      if (earned >= 1) Sounds.fanfare();
      if (earned >= 2) Confetti.celebrate();
    }

    $app.innerHTML = `
      <section class="result card pop-in">
        <img class="result-avatar" src="${Profile.avatarImg(['encourage', 'encourage', 'cheer', 'trophy'][earned])}" alt="" draggable="false">
        <h2>${t('result')[earned]}</h2>
        <p class="score">${t('score', num(quiz.score), num(total))}</p>
        <div class="stars-big">${starsHtml(earned)}</div>
        <div class="result-actions">
          <button class="big-btn" type="button" id="againBtn">${t('again')}</button>
          ${quiz.table !== 'mix' ? `<button class="big-btn alt" type="button" id="reviewBtn">${t('reviewAgain')}</button>` : ''}
          <button class="big-btn alt2" type="button" id="otherBtn">${t('chooseOther')}</button>
        </div>
      </section>`;

    document.getElementById('againBtn').addEventListener('click', () => {
      Sounds.tap();
      startQuiz(quiz.table);
    });
    const $review = document.getElementById('reviewBtn');
    if ($review) {
      $review.addEventListener('click', () => {
        Sounds.tap();
        go({ name: 'review', table: quiz.table });
      });
    }
    document.getElementById('otherBtn').addEventListener('click', () => {
      Sounds.tap();
      go({ name: 'home' });
    });
  }

  // ---------- Top bar ----------

  $homeBtn.addEventListener('click', () => {
    Sounds.tap();
    go({ name: 'start' });
  });

  $langBtn.addEventListener('click', () => {
    lang = lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('mt.lang', lang);
    Sounds.tap();
    Voice.stop();
    UI.closeSheet();
    if (screen.name === 'quiz' && quiz.locked) nextQuestion();
    else render();
  });

  $soundBtn.addEventListener('click', () => {
    Sounds.toggle();
    Sounds.tap();
    renderTopbar();
  });

  if ('speechSynthesis' in window) speechSynthesis.getVoices();
  render();
})();
