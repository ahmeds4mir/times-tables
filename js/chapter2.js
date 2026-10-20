window.Chapter2 = (function () {
  const SAVE_KEY = 'mt.ch2';
  const DAY = 720; // minutes on a 12-hour clock face
  const LAB_START = 7 * 60 + 30;

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

  // ---------- Time helpers ----------

  const T = (h, m) => h * 60 + m;
  const norm = (t) => ((t % DAY) + DAY) % DAY;
  const hourOf = (t) => Math.floor(norm(t) / 60) || 12;
  const minOf = (t) => norm(t) % 60;
  const hourAngle = (t) => (norm(t) / 60) * 30;
  const minAngle = (t) => minOf(t) * 6;

  function randTime(from, to, step) {
    return R(Math.ceil(from / step), Math.floor(to / step)) * step;
  }

  // ---------- Levels ----------

  const LEVELS = [
    { color: '#FFB13D', icon: '☀️', readStep: 15, setStep: 15, durs: [15, 30], cross: false, game: 'door' },
    { color: '#1FB5C9', icon: '🌤️', readStep: 5, setStep: 5, durs: [10, 15, 20, 25, 30, 35, 40, 45], cross: true, game: 'sort' },
    { color: '#7B61FF', icon: '🌙', readStep: 1, setStep: 5, durs: [15, 20, 25, 35, 40, 45, 50, 70, 80, 90], cross: true, game: 'pop' },
    { color: '#FF5E7E', icon: '🏅', olympics: true, game: 'memory' },
  ];

  const STOPS = [
    { key: 'wake', emoji: '⏰', period: 'morning', range: [T(6, 0), T(7, 0)], kinds: ['read'] },
    { key: 'breakfast', emoji: '🍳', period: 'morning', range: [T(7, 0), T(7, 30)], kinds: ['after'] },
    { key: 'bus', emoji: '🚌', period: 'morning', range: [T(7, 15), T(7, 45)], kinds: ['set'] },
    { key: 'school', emoji: '🏫', period: 'day', range: [T(8, 0), T(9, 0)], kinds: ['before'] },
    { key: 'lunch', emoji: '🍽️', period: 'day', range: [T(1, 30), T(2, 30)], kinds: ['elapsed'] },
    { key: 'football', emoji: '⚽', period: 'afternoon', range: [T(4, 0), T(5, 0)], kinds: ['read', 'elapsed'] },
    { key: 'homework', emoji: '📚', period: 'evening', range: [T(6, 0), T(7, 0)], kinds: ['after'] },
    { key: 'sleep', emoji: '🌙', period: 'night', range: [T(8, 30), T(9, 30)], kinds: ['set', 'read'] },
  ];

  const OLY_ORDER = ['stopwatch', 'unit', 'convert', 'race', 'unit', 'convert', 'compare', 'stopwatch'];
  const OLY_ICON = { stopwatch: '⏱️', unit: '🤔', convert: '🔢', race: '🏃', compare: '⚖️' };

  const ACTIVITIES = [
    { emoji: '😉', n: 1, unit: 's' },
    { emoji: '👏', n: 1, unit: 's' },
    { emoji: '🥤', n: 10, unit: 's' },
    { emoji: '🪥', n: 2, unit: 'm' },
    { emoji: '🥪', n: 5, unit: 'm' },
    { emoji: '🚿', n: 10, unit: 'm' },
    { emoji: '🍝', n: 15, unit: 'm' },
    { emoji: '🏫', n: 6, unit: 'h' },
    { emoji: '😴', n: 9, unit: 'h' },
    { emoji: '🚂', n: 3, unit: 'h' },
  ];

  // ---------- Text ----------

  const STR = {
    ar: {
      chapter: '⏰ الفصل الثاني: الوقت والمدة الزمنية',
      mapTalk: 'تعال نقضي يوماً معاً! في كل محطة مهمة صغيرة ⏰',
      labName: 'ورشة الساعة',
      labSub: 'حرّك العقارب وتعلّم 🕰️',
      levels: [
        { name: 'اليوم الأول', sub: 'الساعة تماماً والنصف والربع' },
        { name: 'اليوم الثاني', sub: 'كل ٥ دقائق وعبور الساعة' },
        { name: 'اليوم الثالث', sub: 'كل دقيقة ومدد أطول' },
        { name: 'أولمبياد الثواني', sub: 'الثانية: وحدة زمن جديدة' },
      ],
      labTalk: 'اسحب العقارب بإصبعك، وأنا أقرأ لك الوقت! 👆',
      tips: [
        '🟣 العقرب القصير يشير إلى الساعات',
        '🔴 العقرب الطويل يشير إلى الدقائق',
        'كل رقم على الساعة = ٥ دقائق',
        'دورة كاملة للعقرب الطويل = ٦٠ دقيقة = ساعة',
        'الدقيقة = ٦٠ ثانية ⏱️',
      ],
      now: 'الوقت الآن 🕐',
      random: 'وقت عشوائي 🎲',
      minShort: 'د',
      check: 'تمّ ✔',
      start: 'ابدأ ▶',
      stop: 'توقف ⏹',
      startLabel: 'البداية',
      endLabel: 'النهاية',
      arriveLabel: 'الوصول',
      periods: { morning: '🌅 الصباح', day: '☀️ الظهر', afternoon: '🌤️ العصر', evening: '🌇 المساء', night: '🌙 الليل', stadium: '🏟️ الملعب' },
      stops: {
        wake: { name: 'الاستيقاظ', read: () => 'رنّ المنبه! ⏰ صباح الخير! كم الساعة الآن؟' },
        breakfast: { name: 'الفطور', after: (p) => `بدأت الفطور الساعة ${p.s} وأكلت لمدة ${p.d}. متى انتهيت؟` },
        bus: { name: 'الأتوبيس', set: (p) => `الأتوبيس سيصل الساعة ${p.t}! ساعدني أضبط الساعة 🚌` },
        school: { name: 'المدرسة', before: (p) => `الطريق إلى المدرسة يستغرق ${p.d}، ووصلت الساعة ${p.a}. متى ركبت الأتوبيس؟` },
        lunch: { name: 'الغداء', elapsed: (p) => `بدأت الغداء الساعة ${p.s} وانتهيت الساعة ${p.e}. كم استغرق الغداء؟` },
        football: {
          name: 'تمرين الكرة',
          read: () => 'وصلت إلى تمرين الكرة ⚽ كم الساعة؟',
          elapsed: (p) => `بدأ التمرين الساعة ${p.s} وانتهى الساعة ${p.e}. كم استمر التمرين؟`,
        },
        homework: { name: 'الواجب', after: (p) => `بدأت الواجب الساعة ${p.s}، ويحتاج ${p.d}. متى أنتهي؟` },
        sleep: {
          name: 'النوم',
          set: (p) => `موعد النوم الساعة ${p.t} 😴 اضبط الساعة!`,
          read: () => 'تصبح على خير 🌙 كم الساعة الآن؟',
        },
      },
      setHint: 'حرّك العقارب لتعرض وقت النهاية 👆',
      oly: {
        stopwatch: (p) => `اضغط ابدأ، ثم توقف عندما تمر ${p.n} بالضبط! الرقم سيختفي، فعُدّ في رأسك 🤫`,
        unit: (p) => `كم يستغرق ${p.what} تقريباً؟`,
        convert: () => 'أكمل يا بطل 🔢',
        raceWho: (p) => `جريت السباق في ${p.a}، وصديقي في ${p.b}. من الأسرع؟ 🏃`,
        raceDiff: (p) => `جريت السباق في ${p.a}، وصديقي في ${p.b}. ما الفرق بالثواني؟ 🏃`,
        compare: () => 'أيهما أطول؟ 🤔',
      },
      activities: ['رمشة العين', 'تصفيقة واحدة', 'شرب كوب عصير', 'غسل الأسنان', 'أكل سندوتش', 'الاستحمام', 'طهي المكرونة', 'اليوم الدراسي', 'النوم بالليل', 'رحلة القطار إلى الإسكندرية'],
      me: 'أنا 🦸',
      friend: 'صديقي 🧒',
      oneMinute: 'دقيقة واحدة',
      praise: ['في الموعد تماماً! ⏰', 'أحسنت يا بطل! 🌟', 'رائع! وصلنا في الوقت 🎉', 'ممتاز! 👏', 'شاطر جداً! 💪'],
      late: ['أوه! تأخرنا قليلاً ⏰ لا بأس، انظر للمساعدة', 'لا بأس يا بطل! تعلّم من الرسم 💛'],
      olyPraise: ['ميدالية ذهبية! 🥇', 'بطل أولمبي! 🏆', 'رائع! 🌟'],
      olyMiss: ['قريب! المرة القادمة أفضل 💪', 'لا بأس، تعلّم من المساعدة 💛'],
      answerIs: 'الإجابة الصحيحة:',
      stoppedAt: (x) => `توقفت عند ${x}`,
      next: 'المحطة التالية ⬅️',
      finish: 'متابعة ⬅️',
      readHint: (h, m) => `العقرب القصير ← الساعة ${h} ، والعقرب الطويل ← ${m}`,
      fiveEach: 'تذكّر: كل رقم = ٥ دقائق',
      total: (d) => `المدة كلها: ${d}`,
      unitHint: '⏱️ الثانية قصيرة جداً (رمشة عين) • ⏲️ الدقيقة = ٦٠ ثانية • 🕰️ الساعة = ٦٠ دقيقة',
      minuteHint: '⏲️ الدقيقة = ٦٠ ثانية',
      raceHint: 'الأقل في عدد الثواني هو الأسرع! 🏃',
      countHint: 'عُدّ ببطء: واحد-ألف، اثنان-ألف، ثلاثة-ألف... ⏱️',
      dayEnd: 'انتهى يومي! شكراً لمساعدتك 🌙',
      olyEnd: 'انتهى الأولمبياد! 🏅',
      onTime: (ok, total) => `كنا في الموعد ${ok} مرات من ${total}`,
      golds: (ok, total) => `ميدالياتك الذهبية: ${ok} من ${total} 🥇`,
      nextLevel: 'المرحلة التالية ⬅️',
      again: 'العب مرة أخرى 🔁',
      map: 'خريطة الفصل 🗺️',
    },
    en: {
      chapter: '⏰ Chapter 2: Time and Duration',
      mapTalk: "Let's spend a day together! Every stop has a small mission ⏰",
      labName: 'Clock Lab',
      labSub: 'Move the hands and learn 🕰️',
      levels: [
        { name: 'Day 1', sub: "O'clock, half past and quarters" },
        { name: 'Day 2', sub: 'Every 5 minutes, across the hour' },
        { name: 'Day 3', sub: 'Every minute and longer times' },
        { name: 'Seconds Olympics', sub: 'Seconds: a new unit of time' },
      ],
      labTalk: "Drag the hands with your finger and I'll read the time! 👆",
      tips: [
        '🟣 The short hand shows the hours',
        '🔴 The long hand shows the minutes',
        'Each number on the clock = 5 minutes',
        'One full turn of the long hand = 60 minutes = 1 hour',
        '1 minute = 60 seconds ⏱️',
      ],
      now: 'Time now 🕐',
      random: 'Random time 🎲',
      minShort: 'min',
      check: 'Check ✔',
      start: 'Start ▶',
      stop: 'Stop ⏹',
      startLabel: 'Start',
      endLabel: 'End',
      arriveLabel: 'Arrival',
      periods: { morning: '🌅 Morning', day: '☀️ Noon', afternoon: '🌤️ Afternoon', evening: '🌇 Evening', night: '🌙 Night', stadium: '🏟️ Stadium' },
      stops: {
        wake: { name: 'Wake up', read: () => 'The alarm rang! ⏰ Good morning! What time is it?' },
        breakfast: { name: 'Breakfast', after: (p) => `I started breakfast at ${p.s} and ate for ${p.d}. When did I finish?` },
        bus: { name: 'School bus', set: (p) => `The bus comes at ${p.t}! Help me set the clock 🚌` },
        school: { name: 'School', before: (p) => `The ride to school takes ${p.d}, and I arrived at ${p.a}. When did I get on the bus?` },
        lunch: { name: 'Lunch', elapsed: (p) => `I started lunch at ${p.s} and finished at ${p.e}. How long was lunch?` },
        football: {
          name: 'Football practice',
          read: () => 'I got to football practice ⚽ What time is it?',
          elapsed: (p) => `Practice started at ${p.s} and ended at ${p.e}. How long was practice?`,
        },
        homework: { name: 'Homework', after: (p) => `I started homework at ${p.s} and it takes ${p.d}. When will I finish?` },
        sleep: {
          name: 'Bedtime',
          set: (p) => `Bedtime is at ${p.t} 😴 Set the clock!`,
          read: () => 'Good night 🌙 What time is it?',
        },
      },
      setHint: 'Move the hands to show the end time 👆',
      oly: {
        stopwatch: (p) => `Press Start, then Stop when exactly ${p.n} have passed! The number will hide, so count in your head 🤫`,
        unit: (p) => `About how long does ${p.what} take?`,
        convert: () => 'Fill in the box, hero 🔢',
        raceWho: (p) => `I ran the race in ${p.a}, and my friend in ${p.b}. Who was faster? 🏃`,
        raceDiff: (p) => `I ran the race in ${p.a}, and my friend in ${p.b}. What is the difference in seconds? 🏃`,
        compare: () => 'Which one is longer? 🤔',
      },
      activities: ['a blink of an eye', 'one clap', 'drinking a glass of juice', 'brushing your teeth', 'eating a sandwich', 'taking a shower', 'cooking pasta', 'a school day', 'sleeping at night', 'a train trip to Alexandria'],
      me: 'Me 🦸',
      friend: 'My friend 🧒',
      oneMinute: '1 minute',
      praise: ['Right on time! ⏰', 'Well done, hero! 🌟', "Great! We're on time 🎉", 'Excellent! 👏', 'Super smart! 💪'],
      late: ["Oh! We're a bit late ⏰ It's okay, look at the help", "It's okay, hero! Learn from the picture 💛"],
      olyPraise: ['Gold medal! 🥇', 'Olympic hero! 🏆', 'Awesome! 🌟'],
      olyMiss: ['Close! Next time will be better 💪', "It's okay, learn from the help 💛"],
      answerIs: 'The right answer:',
      stoppedAt: (x) => `You stopped at ${x}`,
      next: 'Next stop ➡️',
      finish: 'Continue ➡️',
      readHint: (h, m) => `Short hand → ${h} o'clock, long hand → ${m}`,
      fiveEach: 'Remember: each number = 5 minutes',
      total: (d) => `Total time: ${d}`,
      unitHint: '⏱️ A second is very short (a blink) • ⏲️ 1 minute = 60 seconds • 🕰️ 1 hour = 60 minutes',
      minuteHint: '⏲️ 1 minute = 60 seconds',
      raceHint: 'Fewer seconds means faster! 🏃',
      countHint: 'Count slowly: one-thousand, two-thousand, three-thousand... ⏱️',
      dayEnd: 'My day is done! Thanks for helping 🌙',
      olyEnd: 'The Olympics are over! 🏅',
      onTime: (ok, total) => `We were on time ${ok} out of ${total} times`,
      golds: (ok, total) => `Your gold medals: ${ok} out of ${total} 🥇`,
      nextLevel: 'Next level ➡️',
      again: 'Play again 🔁',
      map: 'Chapter map 🗺️',
    },
    arF: {
      mapTalk: 'تعالي نقضي يوماً معاً! في كل محطة مهمة صغيرة ⏰',
      labTalk: 'اسحبي العقارب بإصبعكِ، وأنا أقرأ لكِ الوقت! 👆',
      stops: {
        bus: { set: (p) => `الأتوبيس سيصل الساعة ${p.t}! ساعديني أضبط الساعة 🚌` },
        sleep: {
          set: (p) => `موعد النوم الساعة ${p.t} 😴 اضبطي الساعة!`,
          read: () => 'تصبحين على خير 🌙 كم الساعة الآن؟',
        },
      },
      setHint: 'حرّكي العقارب لتعرضي وقت النهاية 👆',
      oly: {
        stopwatch: (p) => `اضغطي «ابدأ»، ثم توقفي عندما تمر ${p.n} بالضبط! الرقم سيختفي، فعُدّي في رأسكِ 🤫`,
        convert: () => 'أكملي يا بطلة 🔢',
      },
      me: 'أنا 🦸‍♀️',
      friend: 'صديقتي 👧',
      praise: ['في الموعد تماماً! ⏰', 'أحسنتِ يا بطلة! 🌟', 'رائع! وصلنا في الوقت 🎉', 'ممتاز! 👏', 'شاطرة جداً! 💪'],
      late: ['أوه! تأخرنا قليلاً ⏰ لا بأس، انظري للمساعدة', 'لا بأس يا بطلة! تعلّمي من الرسم 💛'],
      olyPraise: ['ميدالية ذهبية! 🥇', 'بطلة أولمبية! 🏆', 'رائع! 🌟'],
      olyMiss: ['قريب! المرة القادمة أفضل 💪', 'لا بأس، تعلّمي من المساعدة 💛'],
      stoppedAt: (x) => `توقفتِ عند ${x}`,
      countHint: 'عُدّي ببطء: واحد-ألف، اثنان-ألف، ثلاثة-ألف... ⏱️',
    },
    enF: {
      me: 'Me 🦸‍♀️',
      friend: 'My friend 👧',
    },
  };

  // ---------- State ----------

  let ctx = null;
  let timers = [];
  let raf = 0;
  const st = { view: 'map', level: 0, missions: [], idx: 0, results: [], locked: false, clock: 0, lab: LAB_START, sw: null, lang: null, fresh: true, mg: {} };

  const S = () => Profile.strings(STR, ctx.lang());
  const N = (n) => ctx.num(n);
  const img = (name) => Profile.heroImg(name.replace('hero-', ''));
  const $ = (id) => document.getElementById(id);
  const pad = { ar: new Intl.NumberFormat('ar-EG', { minimumIntegerDigits: 2 }), en: new Intl.NumberFormat('en-US', { minimumIntegerDigits: 2 }) };
  const dec = { ar: new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 1, maximumFractionDigits: 1 }), en: new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) };

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
    cancelAnimationFrame(raf);
    if (st.sw) st.sw.running = false;
  }

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  // ---------- Formatting ----------

  const fmtTime = (t) => `${N(hourOf(t))}:${pad[ctx.lang()].format(minOf(t))}`;
  const tm = (t) => `<b class="tm" dir="ltr">${fmtTime(t)}</b>`;

  function fmtUnit(n, unit) {
    if (ctx.lang() === 'en') {
      const word = { s: 'second', m: 'minute', h: 'hour' }[unit];
      return `${n} ${word}${n === 1 ? '' : 's'}`;
    }
    const w = {
      s: ['ثانية واحدة', 'ثانيتان', 'ثوانٍ', 'ثانية'],
      m: ['دقيقة واحدة', 'دقيقتان', 'دقائق', 'دقيقة'],
      h: ['ساعة واحدة', 'ساعتان', 'ساعات', 'ساعة'],
    }[unit];
    if (n === 1) return w[0];
    if (n === 2) return w[1];
    return `${N(n)} ${n >= 3 && n <= 10 ? w[2] : w[3]}`;
  }

  function fmtDur(d) {
    const h = Math.floor(d / 60);
    const m = d % 60;
    const parts = [];
    if (h) parts.push(fmtUnit(h, 'h'));
    if (m || !h) parts.push(fmtUnit(m, 'm'));
    return parts.join(ctx.lang() === 'ar' ? ' و ' : ' ');
  }

  // ---------- Clock ----------

  function clockSvg(t, opts = {}) {
    let ticks = '';
    for (let i = 0; i < 60; i++) {
      const big = i % 5 === 0;
      ticks += `<line x1="100" y1="16" x2="100" y2="${big ? 26 : 21}" class="tick${big ? ' big' : ''}" transform="rotate(${i * 6} 100 100)"/>`;
    }
    let nums = '';
    for (let n = 1; n <= 12; n++) {
      const a = (n * 30 * Math.PI) / 180;
      nums += `<text x="${(100 + 62 * Math.sin(a)).toFixed(1)}" y="${(100 - 62 * Math.cos(a)).toFixed(1)}">${N(n)}</text>`;
    }
    return `<svg class="clock ${opts.cls || ''}" ${opts.id ? `id="${opts.id}"` : ''} viewBox="0 0 200 200" dir="ltr" aria-hidden="true">
      <circle cx="100" cy="100" r="95" class="rim"/>
      <circle cx="100" cy="100" r="87" class="face"/>
      ${ticks}${nums}
      <line x1="100" y1="112" x2="100" y2="54" class="hand hour" transform="rotate(${hourAngle(t)} 100 100)"/>
      <line x1="100" y1="116" x2="100" y2="26" class="hand minute" transform="rotate(${minAngle(t)} 100 100)"/>
      <circle cx="100" cy="100" r="7" class="pin"/>
    </svg>`;
  }

  function setHands(svg, t) {
    svg.querySelector('.hour').setAttribute('transform', `rotate(${hourAngle(t)} 100 100)`);
    svg.querySelector('.minute').setAttribute('transform', `rotate(${minAngle(t)} 100 100)`);
  }

  function angleDiff(a, b) {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  function dragClock(svg, snap, get, set) {
    let hand = null;

    function pointer(e) {
      const r = svg.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      return {
        angle: ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360,
        dist: Math.hypot(x, y) / (r.width / 2),
      };
    }

    function move(e) {
      const { angle } = pointer(e);
      const t = get();
      const h = Math.floor(t / 60);
      const m = t % 60;
      let next;
      if (hand === 'minute') {
        const nm = (Math.round(angle / 6 / snap) * snap) % 60;
        let nh = h;
        if (m >= 45 && nm < 15) nh++;
        else if (m < 15 && nm >= 45) nh--;
        next = norm(T(nh, nm));
      } else {
        next = norm(T(Math.round(angle / 30 - m / 60), m));
      }
      if (next !== t) {
        set(next);
        setHands(svg, next);
        Sounds.tick();
      }
    }

    svg.addEventListener('pointerdown', (e) => {
      if (st.locked && st.view === 'play') return;
      const { angle, dist } = pointer(e);
      const t = get();
      const dh = angleDiff(angle, hourAngle(t));
      const dm = angleDiff(angle, minAngle(t));
      hand = Math.abs(dh - dm) < 20 ? (dist < 0.55 ? 'hour' : 'minute') : dh < dm ? 'hour' : 'minute';
      try {
        svg.setPointerCapture(e.pointerId);
      } catch {}
      svg.classList.add('dragging');
      move(e);
    });
    svg.addEventListener('pointermove', (e) => {
      if (hand && !(st.locked && st.view === 'play')) move(e);
    });
    const end = () => {
      hand = null;
      svg.classList.remove('dragging');
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
  }

  function stepButtons(step) {
    return `<div class="clock-steps" dir="ltr">
      <button class="step-btn" type="button" data-step="${-step}" dir="${ctx.lang() === 'ar' ? 'rtl' : 'ltr'}"><span dir="ltr">−${N(step)}</span> ${S().minShort}</button>
      <button class="step-btn" type="button" data-step="${step}" dir="${ctx.lang() === 'ar' ? 'rtl' : 'ltr'}"><span dir="ltr">+${N(step)}</span> ${S().minShort}</button>
    </div>`;
  }

  function wireSteps(root, svg, get, set) {
    root.querySelectorAll('.step-btn').forEach((b) =>
      b.addEventListener('click', () => {
        if (st.locked && st.view === 'play') return;
        const next = norm(get() + Number(b.dataset.step));
        set(next);
        setHands(svg, next);
        Sounds.tick();
      })
    );
  }

  function timelineHtml(from, to) {
    const pts = [from];
    for (let h = Math.floor(from / 60) + 1; h * 60 < to; h++) pts.push(h * 60);
    pts.push(to);
    let html = '<div class="timeline">';
    pts.forEach((p, i) => {
      if (i > 0) html += `<span class="tl-jump">+${fmtDur(p - pts[i - 1])}</span>`;
      html += `<span class="tl-point" dir="ltr">${fmtTime(p)}</span>`;
    });
    return `${html}</div><p class="array-caption">${S().total(fmtDur(to - from))}</p>`;
  }

  // ---------- Mission generation ----------

  function uniq(answer, candidates, key = (x) => x, ok = () => true) {
    const out = [answer];
    const seen = new Set([key(answer)]);
    for (const c of candidates) {
      if (out.length >= 4) break;
      if (!ok(c) || seen.has(key(c))) continue;
      seen.add(key(c));
      out.push(c);
    }
    return shuffle(out);
  }

  function timeChoices(t, step, extra = []) {
    const h = hourOf(t);
    const m = minOf(t);
    const swapped = m % 5 === 0 ? T(m / 5 || 12, (h % 12) * 5) : t + 60;
    const cands = shuffle([t + 60, t - 60, swapped, t + step, t - step, ...extra]).concat([t + 30, t - 30, t + 5, t - 5, t + 120]);
    return uniq(norm(t), cands.map(norm), norm);
  }

  function durChoices(s, d) {
    const naive = Math.abs(minOf(s + d) - minOf(s));
    const cands = shuffle([d + 10, d - 10, d + 5, 60 - d, naive, d + 60]).concat([d - 5, d + 15, d + 20, d + 30]);
    return uniq(d, cands, (x) => x, (x) => x > 0);
  }

  function buildDayMission(stop, cfg) {
    const [lo, hi] = stop.range;
    const kind = pick(stop.kinds);
    const d = pick(cfg.durs);
    switch (kind) {
      case 'read': {
        const t = randTime(lo, hi, cfg.readStep);
        return { kind, t, answer: norm(t), choices: timeChoices(t, cfg.setStep) };
      }
      case 'set': {
        const t = randTime(lo, hi, cfg.setStep);
        let start;
        do start = randTime(lo - 120, hi + 60, cfg.setStep);
        while (norm(start) === norm(t));
        return { kind, t, answer: norm(t), start: norm(start), step: cfg.setStep };
      }
      case 'after': {
        const s = randTime(lo, hi, cfg.setStep);
        if (!cfg.cross && minOf(s) + d > 60) return null;
        const mode = Math.random() < 0.5 ? 'set' : 'choose';
        const choices = mode === 'choose' ? timeChoices(s + d, cfg.setStep, [s - d, s + d - 60, s + d + 10, s + d - 10]) : null;
        return { kind, s, d, answer: norm(s + d), mode, choices, start: norm(s), step: cfg.setStep };
      }
      case 'before': {
        const a = randTime(lo, hi, cfg.setStep);
        if (!cfg.cross && minOf(a) - d < 0) return null;
        return { kind, a, d, answer: norm(a - d), choices: timeChoices(a - d, cfg.setStep, [a + d, a - d + 60, a - d - 10, a - d + 10]) };
      }
      default: {
        const s = randTime(lo, hi, cfg.setStep);
        if (!cfg.cross && minOf(s) + d > 60) return null;
        return { kind, s, e: s + d, answer: d, choices: durChoices(s, d) };
      }
    }
  }

  function buildOlympics() {
    const acts = shuffle(ACTIVITIES.map((_, i) => i));
    const converts = shuffle([0, 1, 2, 3]);
    let watch = 0;
    return OLY_ORDER.map((kind) => {
      switch (kind) {
        case 'stopwatch':
          return { kind, target: watch++ === 0 ? 5 : 10 };
        case 'unit': {
          const act = acts.pop();
          const a = ACTIVITIES[act];
          return { kind, act, answer: a.unit, choices: ['s', 'm', 'h'] };
        }
        case 'convert': {
          const v = converts.pop();
          const k = R(2, 3);
          const x = R(1, 11) * 5;
          const answer = [60, 60 * k, x, k][v];
          const cands = shuffle([answer + 10, answer - 10, 100, answer * 2, answer + 5, answer + 1, answer - 1]);
          return { kind, v, k, x, answer, choices: uniq(answer, cands, (y) => y, (y) => y > 0) };
        }
        case 'race': {
          const a = R(12, 25);
          let b = R(12, 25);
          if (a === b) b += R(2, 4);
          if (Math.random() < 0.5) return { kind, ask: 'who', a, b, answer: a < b ? 'me' : 'friend', choices: ['me', 'friend'] };
          const diff = Math.abs(a - b);
          return { kind, ask: 'diff', a, b, answer: diff, choices: uniq(diff, shuffle([diff + 1, diff - 1, diff + 2, a + b, Math.max(a, b)]), (y) => y, (y) => y > 0) };
        }
        default: {
          const x = pick([45, 50, 55, 65, 70, 75, 90]);
          return { kind, x, answer: x > 60 ? 'sec' : 'min', choices: shuffle(['sec', 'min']) };
        }
      }
    });
  }

  function buildMissions(level) {
    const cfg = LEVELS[level];
    if (cfg.olympics) return buildOlympics();
    return STOPS.map((stop) => {
      let m = null;
      while (!m) m = buildDayMission(stop, cfg);
      m.stop = stop.key;
      return m;
    });
  }

  // ---------- Mission display ----------

  function promptText(m) {
    const s = S();
    if (m.stop) {
      const p = {};
      for (const k of ['t', 's', 'e', 'a']) if (m[k] != null) p[k] = tm(m[k]);
      if (m.d != null) p.d = `<b>${fmtDur(m.d)}</b>`;
      const text = s.stops[m.stop][m.kind](p);
      return m.kind === 'after' && m.mode === 'set' ? `${text}<br><small>${s.setHint}</small>` : text;
    }
    switch (m.kind) {
      case 'stopwatch':
        return s.oly.stopwatch({ n: `<b>${fmtUnit(m.target, 's')}</b>` });
      case 'unit':
        return s.oly.unit({ what: `<b>${s.activities[m.act]}</b>` });
      case 'race':
        return s.oly[m.ask === 'who' ? 'raceWho' : 'raceDiff']({ a: `<b>${fmtUnit(m.a, 's')}</b>`, b: `<b>${fmtUnit(m.b, 's')}</b>` });
      default:
        return s.oly[m.kind]();
    }
  }

  function choiceLabel(m, v) {
    const s = S();
    switch (m.kind) {
      case 'read':
      case 'after':
      case 'before':
        return `<span dir="ltr">${fmtTime(v)}</span>`;
      case 'elapsed':
        return fmtDur(v);
      case 'unit':
        return fmtUnit(ACTIVITIES[m.act].n, v);
      case 'race':
        return m.ask === 'who' ? s[v] : N(v);
      case 'compare':
        return v === 'sec' ? fmtUnit(m.x, 's') : s.oneMinute;
      default:
        return N(v);
    }
  }

  function convertEq(m, fill) {
    const box = `<span class="box${fill != null ? ' filled' : ''}">${fill != null ? N(fill) : ''}</span>`;
    const and = ctx.lang() === 'ar' ? 'و' : '+';
    const sec = ctx.lang() === 'ar' ? 'ثانية' : 'seconds';
    const min = ctx.lang() === 'ar' ? 'دقائق' : 'minutes';
    const parts = [
      [`<span>${S().oneMinute}</span>`, '<span class="op">=</span>', box, `<span>${sec}</span>`],
      [`<span>${fmtUnit(m.k, 'm')}</span>`, '<span class="op">=</span>', box, `<span>${sec}</span>`],
      [`<span>${fmtUnit(60 + m.x, 's')}</span>`, '<span class="op">=</span>', `<span>${S().oneMinute}</span>`, `<span class="op">${and}</span>`, box, `<span>${sec}</span>`],
      [`<span>${fmtUnit(60 * m.k, 's')}</span>`, '<span class="op">=</span>', box, `<span>${min}</span>`],
    ][m.v];
    return `<div class="ch1-eq c2-eq">${parts.join('')}</div>`;
  }

  function missionBody(m) {
    const s = S();
    const label = (text, inner) => `<figure class="clock-fig">${inner}<figcaption>${text}</figcaption></figure>`;
    switch (m.kind) {
      case 'read':
        return clockSvg(m.t);
      case 'set':
        return `${clockSvg(m.start, { id: 'dragClock', cls: 'interactive' })}${stepButtons(m.step)}`;
      case 'after':
        return m.mode === 'set'
          ? `${clockSvg(m.start, { id: 'dragClock', cls: 'interactive' })}${stepButtons(m.step)}`
          : label(s.startLabel, clockSvg(m.s, { cls: 'small' }));
      case 'before':
        return label(s.arriveLabel, clockSvg(m.a, { cls: 'small' }));
      case 'elapsed':
        return `<div class="clock-pair">${label(s.startLabel, clockSvg(m.s, { cls: 'small' }))}${label(s.endLabel, clockSvg(m.e, { cls: 'small' }))}</div>`;
      case 'stopwatch':
        return `<div class="stopwatch" id="sw">${dec[ctx.lang()].format(0)}</div>`;
      case 'unit':
        return `<div class="big-emoji">${ACTIVITIES[m.act].emoji}</div>`;
      case 'convert':
        return convertEq(m);
      case 'race':
        return `<div class="race"><span>${S().me} ${fmtUnit(m.a, 's')}</span><span>${S().friend} ${fmtUnit(m.b, 's')}</span></div>`;
      default:
        return '<div class="big-emoji">⚖️</div>';
    }
  }

  function isDrag(m) {
    return m.kind === 'set' || (m.kind === 'after' && m.mode === 'set');
  }

  function hintHtml(m, extra) {
    const s = S();
    switch (m.kind) {
      case 'read':
      case 'set': {
        const mm = minOf(m.answer);
        const body = `${clockSvg(m.answer, { cls: 'small' })}<p class="hint-rule">${s.readHint(N(hourOf(m.answer)), fmtUnit(mm, 'm'))}</p>`;
        return `${body}<p class="array-caption">${s.fiveEach}</p>`;
      }
      case 'after':
        return timelineHtml(m.s, m.s + m.d);
      case 'before':
        return timelineHtml(m.a - m.d, m.a);
      case 'elapsed':
        return timelineHtml(m.s, m.e);
      case 'stopwatch':
        return `<p class="hint-rule">${extra}</p><p class="hint-rule">${s.countHint}</p>`;
      case 'unit':
        return `<p class="hint-rule">${s.unitHint}</p>`;
      case 'race':
        return `<p class="hint-rule">${s.raceHint}</p>${m.ask === 'diff' ? `<p class="hint-rule" dir="ltr">${N(Math.max(m.a, m.b))} − ${N(Math.min(m.a, m.b))} = ${N(Math.abs(m.a - m.b))}</p>` : ''}`;
      case 'convert':
        return `<p class="hint-rule">${s.minuteHint}</p>${convertEq(m, m.answer)}`;
      default:
        return `<p class="hint-rule">${s.minuteHint}</p>`;
    }
  }

  // ---------- Screens ----------

  function heroTalk(text) {
    return `<div class="mascot-row" id="heroTalk">
      <img class="avatar hero-avatar pop-in" src="${img('hero-ready')}" alt="" draggable="false">
      <div class="bubble pop-in" style="--d:120ms">${text}</div>
    </div>`;
  }

  function renderMap() {
    const s = S();
    const progress = loadProgress();
    const lab = `<button class="level-card pop-in" type="button" data-i="lab" style="--c:#00B894">
        <span class="level-icon">🕰️</span>
        <span class="level-info"><b>${s.labName}</b><span class="level-sub">${s.labSub}</span></span>
      </button>`;
    const cards = LEVELS.map(
      (L, i) => `<button class="level-card pop-in ${L.olympics ? 'boss' : ''}" type="button" data-i="${i}" style="--c:${L.color};--d:${(i + 1) * 60}ms">
        <span class="level-icon">${L.icon}</span>
        <span class="level-info"><b>${s.levels[i].name}</b><span class="level-sub">${s.levels[i].sub}</span></span>
        <span class="level-status">${ctx.starsHtml(progress[i] || 0)}</span>
      </button>`
    ).join('');

    ctx.root.innerHTML = `
      <section class="c2 c2-map">
        <h2 class="ch1-title">${s.chapter}</h2>
        ${heroTalk(Voice.bubble('chapter2', ctx.lang()))}
        <div class="levels">${lab}${cards}</div>
      </section>`;
    Voice.wire(ctx.root, ctx.lang());

    ctx.root.querySelectorAll('.level-card').forEach((btn) =>
      btn.addEventListener('click', () => {
        Sounds.tap();
        if (btn.dataset.i === 'lab') show('lab');
        else startLevel(Number(btn.dataset.i));
      })
    );
  }

  function labReading(t) {
    const h = hourOf(t);
    const m = minOf(t);
    const nextH = (h % 12) + 1;
    if (ctx.lang() === 'en') {
      if (m === 0) return `${h} o'clock`;
      if (m === 15) return `quarter past ${h}`;
      if (m === 30) return `half past ${h}`;
      if (m === 45) return `quarter to ${nextH}`;
      return `${m} minutes past ${h}`;
    }
    if (m === 0) return `الساعة ${N(h)} تماماً`;
    if (m === 15) return `الساعة ${N(h)} والربع`;
    if (m === 30) return `الساعة ${N(h)} والنصف`;
    if (m === 45) return `الساعة ${N(nextH)} إلا ربع`;
    return `الساعة ${N(h)} و ${fmtUnit(m, 'm')}`;
  }

  function renderLab() {
    const s = S();
    ctx.root.innerHTML = `
      <section class="c2 c2-lab" style="--c:#00B894">
        <h2 class="ch1-title">🕰️ ${s.labName}</h2>
        <p class="review-talk">${s.labTalk}</p>
        <div class="card lab-clock">
          ${clockSvg(st.lab, { id: 'dragClock', cls: 'interactive' })}
          ${stepButtons(5)}
          <div class="lab-digital" dir="ltr" id="labTime">${fmtTime(st.lab)}</div>
          <p class="lab-say" id="labSay">${labReading(st.lab)}</p>
          <div class="lab-actions">
            <button class="big-btn alt" type="button" id="nowBtn">${s.now}</button>
            <button class="big-btn alt2" type="button" id="randBtn">${s.random}</button>
          </div>
        </div>
        <div class="card lab-tips">
          <ul>${s.tips.map((x) => `<li>${x}</li>`).join('')}</ul>
        </div>
      </section>`;

    const svg = $('dragClock');
    const set = (t) => {
      st.lab = t;
      $('labTime').textContent = fmtTime(t);
      $('labSay').textContent = labReading(t);
    };
    dragClock(svg, 1, () => st.lab, set);
    wireSteps(ctx.root, svg, () => st.lab, set);
    const jump = (t) => {
      Sounds.tap();
      set(norm(t));
      setHands(svg, st.lab);
    };
    $('nowBtn').addEventListener('click', () => {
      const d = new Date();
      jump(T(d.getHours(), d.getMinutes()));
    });
    $('randBtn').addEventListener('click', () => jump(R(0, 143) * 5));
  }

  function startLevel(level) {
    clearTimers();
    if (window.MiniGames) MiniGames.destroy();
    st.level = level;
    st.missions = buildMissions(level);
    st.idx = 0;
    st.results = [];
    st.locked = false;
    st.fresh = true;
    st.mg = {};
    show('play');
  }

  function pathHtml() {
    const L = LEVELS[st.level];
    return st.missions
      .map((m, i) => {
        const icon = L.olympics ? OLY_ICON[m.kind] : STOPS[i].emoji;
        const state = st.results[i] === true ? 'ok' : st.results[i] === false ? 'late' : i === st.idx ? 'now' : '';
        return `<span class="stop ${state}">${icon}</span>`;
      })
      .join('');
  }

  function renderPlay() {
    const s = S();
    const L = LEVELS[st.level];
    const m = st.missions[st.idx];
    const stop = L.olympics ? null : STOPS[st.idx];
    const period = stop ? stop.period : 'stadium';
    const title = stop ? s.stops[stop.key].name : s.levels[st.level].name;
    const emoji = stop ? stop.emoji : OLY_ICON[m.kind];

    const useGame = !isDrag(m) && m.kind !== 'stopwatch' && m.choices && window.MiniGames;
    const gameId = L.game || 'choice';
    const gameLabel = useGame ? MiniGames.label(gameId, ctx.lang()) : '';

    let controls;
    if (isDrag(m)) controls = `<div class="center"><button class="big-btn" type="button" id="checkBtn">${s.check}</button></div>`;
    else if (m.kind === 'stopwatch') controls = `<div class="center"><button class="big-btn alt" type="button" id="swBtn">${s.start}</button></div>`;
    else if (useGame) controls = `<div class="mg-host" id="mgHost"></div>`;
    else {
      controls = `<div class="choices c2-choices n${m.choices.length}">${m.choices
        .map((v, i) => `<button class="choice pop-in" type="button" style="--d:${i * 60}ms" data-i="${i}">${choiceLabel(m, v)}</button>`)
        .join('')}</div>`;
    }

    if (window.MiniGames) MiniGames.destroy();

    ctx.root.innerHTML = `
      <section class="c2 c2-play" style="--c:${L.color}">
        <div class="c2-path">${pathHtml()}</div>
        <div class="c2-scene period-${period} ${st.fresh ? 'pop-in' : ''}">
          <span class="scene-label">${s.periods[period]} • ${title}</span>
          <span class="c2-hero-box" id="c2HeroBox"><img class="c2-hero" id="c2Hero" src="${img('hero-ready')}" data-face="right" alt="" draggable="false"></span>
          <span class="scene-emoji">${emoji}</span>
        </div>
        <div class="c2-say" id="say">${promptText(m)}</div>
        ${gameLabel ? `<div class="center"><span class="mg-chip">${gameLabel}</span></div>` : ''}
        <div class="card c2-mission">${missionBody(m)}</div>
        ${controls}
        <div class="feedback" id="fb"></div>
      </section>`;
    st.fresh = false;

    if (stop && stop.key === 'wake') Sounds.bell();

    if (isDrag(m)) {
      st.clock = m.start;
      const svg = $('dragClock');
      dragClock(svg, m.step, () => st.clock, (t) => (st.clock = t));
      wireSteps(ctx.root, svg, () => st.clock, (t) => (st.clock = t));
      $('checkBtn').addEventListener('click', () => resolve(norm(st.clock) === m.answer));
    } else if (m.kind === 'stopwatch') {
      $('swBtn').addEventListener('click', toggleStopwatch);
    } else if (useGame) {
      MiniGames.mount($('mgHost'), gameId, m, {
        N,
        tx: (ar, en) => (ctx.lang() === 'ar' ? ar : en),
        label: choiceLabel,
        locked: () => st.locked,
        mg: st.mg,
        themeEmoji: emoji,
        answer(v, btn) {
          resolve(v === m.answer, btn);
        },
      });
    } else {
      ctx.root.querySelectorAll('.choice').forEach((btn) =>
        btn.addEventListener('click', () => {
          const v = m.choices[Number(btn.dataset.i)];
          resolve(v === m.answer, btn);
        })
      );
    }
  }

  function toggleStopwatch() {
    const s = S();
    const m = st.missions[st.idx];
    const $sw = $('sw');
    const $btn = $('swBtn');
    if (!st.sw || !st.sw.running) {
      Sounds.tap();
      st.sw = { running: true, t0: performance.now() };
      $btn.textContent = s.stop;
      $btn.classList.remove('alt');
      const tick = () => {
        if (!st.sw || !st.sw.running) return;
        const el = (performance.now() - st.sw.t0) / 1000;
        if (el < 2.5) $sw.textContent = dec[ctx.lang()].format(el);
        else {
          $sw.textContent = ctx.lang() === 'ar' ? '🤫 ؟' : '🤫 ?';
          $sw.classList.add('hidden-time');
        }
        raf = requestAnimationFrame(tick);
      };
      tick();
      return;
    }
    st.sw.running = false;
    cancelAnimationFrame(raf);
    const el = (performance.now() - st.sw.t0) / 1000;
    const shown = `${dec[ctx.lang()].format(el)} ${ctx.lang() === 'ar' ? 'ثانية' : 's'}`;
    $sw.textContent = shown;
    $sw.classList.remove('hidden-time');
    $btn.disabled = true;
    resolve(Math.abs(el - m.target) <= 1, null, s.stoppedAt(shown));
  }

  function resolve(correct, btn, extra) {
    if (st.locked) return;
    st.locked = true;
    st.sw = null;
    const s = S();
    const m = st.missions[st.idx];
    const oly = LEVELS[st.level].olympics;
    st.results[st.idx] = correct;

    ctx.root.querySelectorAll('.choice, .step-btn, #checkBtn, .mg-door, .mg-balloon, .mg-card, .mg-sort-card, .mg-bucket, .mg-box').forEach((b) => (b.disabled = true));
    ctx.root.querySelectorAll('.choice, .mg-door, .mg-balloon, .mg-sort-card').forEach((b) => {
      let v;
      if (b.dataset.v != null) {
        const n = Number(b.dataset.v);
        v = Number.isFinite(n) && String(n) === String(b.dataset.v).trim() ? n : b.dataset.v;
      } else {
        v = m.choices[Number(b.dataset.i)];
      }
      if (v === m.answer) b.classList.add('right');
      else if (b !== btn) b.classList.add('faded');
    });
    const $box = ctx.root.querySelector('.c2-mission .box');
    if ($box) {
      $box.textContent = N(m.answer);
      $box.classList.add('filled');
    }
    ctx.root.querySelector('.c2-path').innerHTML = pathHtml();

    const $hero = $('c2Hero');
    const $say = $('say');
    if (correct) {
      Sounds.correct();
      $hero.src = img('hero-victory');
      $hero.dataset.face = '';
      $('c2HeroBox').classList.add('jump');
      $say.innerHTML = `${pick(oly ? s.olyPraise : s.praise)}${extra ? `<br><small>${extra}</small>` : ''}`;
      if (isDrag(m)) $('dragClock').classList.add('correct');
      {
        const r = (btn || $('c2HeroBox')).getBoundingClientRect();
        if (window.Vfx) {
          Vfx.burst({
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
            lang: ctx.lang(),
            game: LEVELS[st.level].game || 'choice',
          });
        } else {
          Confetti.burst(40, r.left + r.width / 2, r.top + r.height / 2);
        }
      }
      later(next, window.Vfx ? 2300 : 1700);
      return;
    }

    if (btn) btn.classList.add('wrong');
    Sounds.wrong();
    $hero.src = img('hero-hurt');
    $hero.dataset.face = 'right';
    $('c2HeroBox').classList.add('nod');
    $say.textContent = pick(oly ? s.olyMiss : s.late);
    const last = st.idx >= st.missions.length - 1;
    const answerLine = m.kind === 'stopwatch' ? '' : `<div class="oops">${s.answerIs} <b>${choiceLabel(m, m.answer)}</b></div>`;
    later(
      () =>
        UI.sheet(
          `${answerLine}<div class="hint-box" style="--c:${LEVELS[st.level].color}">${hintHtml(m, extra)}</div>`,
          last ? s.finish : oly ? s.finish : s.next,
          next
        ),
      700
    );
  }

  function next() {
    clearTimers();
    st.idx++;
    st.locked = false;
    if (st.idx >= st.missions.length) {
      finish();
      return;
    }
    renderPlay();
    UI.top();
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
    if (stars >= 1) {
      if (window.Vfx && Vfx.finale) Vfx.finale({ lang: ctx.lang() });
      else {
        Sounds.fanfare();
        if (stars >= 2) Confetti.celebrate();
      }
    }
    show('end');
  }

  function renderEnd() {
    const s = S();
    const L = LEVELS[st.level];
    const ok = st.results.filter(Boolean).length;
    const total = st.missions.length;
    const stars = starsFor(ok);
    const hasNext = st.level < LEVELS.length - 1;

    ctx.root.innerHTML = `
      <section class="c2 ch1-end card pop-in" style="--c:${L.color}">
        <div class="end-scene">
          <img class="end-hero" src="${img(stars >= 2 ? 'hero-victory' : 'hero-ready')}" alt="">
          <span class="end-emoji">${L.olympics ? '🏅' : '🌙'}</span>
        </div>
        <h2>${L.olympics ? s.olyEnd : s.dayEnd}</h2>
        <p class="score">${(L.olympics ? s.golds : s.onTime)(N(ok), N(total))}</p>
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
        if (act === 'next') startLevel(st.level + 1);
        else if (act === 'again') startLevel(st.level);
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
    st.lang = ctx.lang();
    if (st.view === 'play') {
      if (st.locked) {
        next();
        return;
      }
      clearTimers();
      st.sw = null;
    }
    if (st.view === 'map') renderMap();
    else if (st.view === 'lab') renderLab();
    else if (st.view === 'play') renderPlay();
    else renderEnd();
  }

  return {
    enter() {
      clearTimers();
      st.view = 'map';
    },
    leave() {
      clearTimers();
      UI.closeSheet();
    },
    render,
  };
})();
