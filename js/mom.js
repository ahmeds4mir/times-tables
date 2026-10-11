// "Ask Mom": a full-screen, step-by-step animated explanation with Mom's recorded voice.
// Each lesson uses one fixed easy example; steps run in order and wait for the voice to finish.
window.Mom = (function () {
  const IMG = 'img/mom/mom-explain.jpg';

  const STR = {
    ar: { ask: 'اسأل ماما', title: 'ماما تشرح', again: 'مرة أخرى ↻', ok: 'فهمت! 👍' },
    en: { ask: 'Ask Mom', title: 'Mom explains', again: 'Again ↻', ok: 'Got it! 👍' },
  };

  // ---------- Stage helpers ----------

  function grid(rows, cols, { emoji = '', d } = {}) {
    const size = d || Math.max(12, Math.min(30, Math.floor(230 / cols) - 6));
    const el = document.createElement('div');
    el.className = 'mg';
    el.style.setProperty('--d', `${size}px`);
    el.cells = [];
    for (let r = 0; r < rows; r++) {
      const row = document.createElement('div');
      row.className = 'mg-row';
      const line = [];
      for (let c = 0; c < cols; c++) {
        const dot = document.createElement('span');
        dot.className = `md${emoji ? ' emo' : ''}`;
        dot.textContent = emoji;
        row.appendChild(dot);
        line.push(dot);
      }
      el.appendChild(row);
      el.cells.push(line);
    }
    el.rows = [...el.children];
    el.all = (fn = () => true) => el.cells.flatMap((line, r) => line.filter((_, c) => fn(r, c)));
    return el;
  }

  function reveal(cells, gap, cls) {
    cells.forEach((cell, i) => {
      cell.style.transitionDelay = `${i * gap}ms`;
      if (cls) cell.classList.add(cls);
      cell.classList.add('on');
    });
  }

  function paint(cells, cls) {
    cells.forEach((cell) => {
      cell.style.transitionDelay = '0ms';
      cell.classList.remove('a', 'b');
      cell.classList.add(cls);
    });
  }

  function paintCols(g, from, to, gap, cls) {
    for (let c = from; c < to; c++) {
      g.cells.forEach((line) => {
        const cell = line[c];
        cell.style.transitionDelay = `${(c - from) * gap}ms`;
        cell.classList.remove('a', 'b');
        cell.classList.add(cls);
      });
    }
  }

  function ping(cells, gap = 70) {
    cells.forEach((cell, i) => {
      cell.classList.remove('ping');
      void cell.offsetWidth;
      cell.style.animationDelay = `${i * gap}ms`;
      cell.classList.add('ping');
    });
  }

  // ---------- Lessons ----------

  const PILE = [[38, 4], [8, 18], [62, 16], [30, 30], [70, 40], [4, 46], [44, 52], [22, 64], [64, 66], [6, 78], [40, 80], [72, 86]];

  const LESSONS = {
    lastCol: {
      setup(S) {
        S.g = grid(3, 5, { d: 38 });
        S.stage.append(S.g);
      },
      steps: [
        {
          ar: 'هنا ٣ صفوف، في كل صف ٤ نقاط.',
          en: 'Here are 3 rows, with 4 dots in each row.',
          ms: 2200,
          run: (S) => reveal(S.g.all((r, c) => c < 4), 140, 'a'),
        },
        {
          ar: 'نعدّها كلها: ١٢ نقطة.',
          en: 'Count them all: 12 dots.',
          run: (S) => {
            ping(S.g.all((r, c) => c < 4), 110);
            S.eq([[3, '×', 4, '=', 12]]);
          },
        },
        {
          ar: 'الآن نزيد نقطة واحدة في كل صف.',
          en: 'Now we add one more dot to each row.',
          ms: 2000,
          run: (S) => reveal(S.g.all((r, c) => c === 4), 500, 'b'),
        },
        {
          ar: 'زادت ٣ نقاط فقط، لأن عندنا ٣ صفوف.',
          en: 'Only 3 dots were added, because we have 3 rows.',
          run: (S) => {
            ping(S.g.all((r, c) => c === 4), 300);
            S.eq([[12, '+', 3, '=', 15]]);
          },
        },
        {
          ar: 'إذن ٣ × ٥ = ١٥. كلما زدنا مجموعة، نضيف العدد الأول!',
          sayAr: 'إذن ثلاثة في خمسة تساوي خمسة عشر. كلما زدنا مجموعة، نضيف العدد الأول!',
          en: 'So 3 × 5 = 15. Each extra group adds the first number!',
          sayEn: 'So 3 times 5 is 15. Each extra group adds the first number!',
          run: (S) => S.eq([[3, '×', 5, '=', 3, '×', 4, '+', 3], ['=', 15]]),
        },
      ],
    },

    swap: {
      setup(S) {
        S.g = grid(3, 5, { emoji: '🍪', d: 40 });
        S.g.classList.add('turnable');
        S.stage.append(S.g);
      },
      steps: [
        {
          ar: 'هنا ٣ صفوف من الكعك، في كل صف ٥.',
          en: 'Here are 3 rows of cookies, 5 in each row.',
          ms: 2400,
          run: (S) => reveal(S.g.all(), 120),
        },
        {
          ar: 'عددها ١٥ كعكة.',
          en: 'That is 15 cookies.',
          run: (S) => {
            ping(S.g.all(), 80);
            S.eq([[3, '×', 5, '=', 15]]);
          },
        },
        {
          ar: 'الآن ندير الطبق!',
          en: "Now let's turn the tray!",
          ms: 1800,
          run: (S) => S.g.classList.add('turn'),
        },
        {
          ar: 'صار عندنا ٥ صفوف، في كل صف ٣. لم تضِع ولا كعكة!',
          en: 'Now there are 5 rows with 3 in each. No cookie got lost!',
          run: (S) => {
            ping(S.g.all(), 80);
            S.eq([[5, '×', 3, '=', 15]]);
          },
        },
        {
          ar: 'إذن ٣ × ٥ = ٥ × ٣. تبديل العددين لا يغيّر الناتج.',
          sayAr: 'إذن ثلاثة في خمسة، مثل خمسة في ثلاثة. تبديل العددين لا يغيّر الناتج.',
          en: "So 3 × 5 = 5 × 3. Swapping the numbers doesn't change the answer.",
          sayEn: "So 3 times 5 is the same as 5 times 3. Swapping the numbers doesn't change the answer.",
          run: (S) => S.eq([[3, '×', 5, '=', 5, '×', 3]]),
        },
      ],
    },

    split: {
      setup(S) {
        S.g = grid(7, 8, { d: 24 });
        S.cut = document.createElement('span');
        S.cut.className = 'mom-scissors';
        S.cut.textContent = '✂️';
        S.g.append(S.cut);
        S.stage.append(S.g);
      },
      steps: [
        {
          ar: '٧ × ٨ صعبة؟ سنجعلها سهلة! هنا ٧ صفوف، في كل صف ٨.',
          sayAr: 'سبعة في ثمانية صعبة؟ سنجعلها سهلة! هنا سبعة صفوف، في كل صف ثمانية.',
          en: "7 × 8 looks hard? Let's make it easy! Here are 7 rows of 8.",
          sayEn: "7 times 8 looks hard? Let's make it easy! Here are 7 rows of 8.",
          ms: 2400,
          run: (S) => reveal(S.g.all(), 30),
        },
        {
          ar: 'نقصّها إلى ٥ صفوف وصفّين.',
          en: 'We cut it into 5 rows and 2 rows.',
          ms: 2200,
          run: (S) => {
            S.cut.classList.add('go');
            S.later(() => {
              S.g.classList.add('apart');
              paint(S.g.all((r) => r < 5), 'a');
              paint(S.g.all((r) => r >= 5), 'b');
            }, 900);
          },
        },
        {
          ar: '٥ × ٨ = ٤٠، سهلة!',
          sayAr: 'خمسة في ثمانية تساوي أربعين، سهلة!',
          en: '5 × 8 = 40. Easy!',
          sayEn: '5 times 8 is 40. Easy!',
          run: (S) => {
            ping(S.g.all((r) => r < 5), 25);
            S.eq([[5, '×', 8, '=', 40]]);
          },
        },
        {
          ar: '٢ × ٨ = ١٦.',
          sayAr: 'اثنان في ثمانية تساوي ستة عشر.',
          en: '2 × 8 = 16.',
          sayEn: '2 times 8 is 16.',
          run: (S) => {
            ping(S.g.all((r) => r >= 5), 40);
            S.eq([[5, '×', 8, '=', 40], [2, '×', 8, '=', 16]]);
          },
        },
        {
          ar: 'نجمعهما: ٤٠ + ١٦ = ٥٦. إذن ٧ × ٨ = ٥٦!',
          sayAr: 'نجمعهما: أربعون زائد ستة عشر تساوي ستة وخمسين. إذن سبعة في ثمانية تساوي ستة وخمسين!',
          en: 'Add them: 40 + 16 = 56. So 7 × 8 = 56!',
          sayEn: 'Add them: 40 plus 16 is 56. So 7 times 8 is 56!',
          run: (S) => {
            S.g.classList.remove('apart');
            S.eq([[40, '+', 16, '=', 56], [7, '×', 8, '=', 56]]);
          },
        },
      ],
    },

    zeroOne: {
      setup(S) {
        S.plates = document.createElement('div');
        S.plates.className = 'plates';
        S.plates.innerHTML = '<span class="plate"><span class="apple">🍎</span></span>'.repeat(4);
        S.stage.append(S.plates);
      },
      steps: [
        {
          ar: 'هنا ٤ أطباق فارغة.',
          en: 'Here are 4 empty plates.',
          ms: 1800,
          run: (S) => reveal([...S.plates.children], 250),
        },
        {
          ar: '٤ × ٠ يعني ٤ أطباق، في كل طبق لا شيء. المجموع صفر!',
          sayAr: 'أربعة في صفر يعني أربعة أطباق، في كل طبق لا شيء. المجموع صفر!',
          en: '4 × 0 means 4 plates with nothing on each. That makes 0!',
          sayEn: '4 times 0 means 4 plates with nothing on each. That makes zero!',
          run: (S) => {
            [...S.plates.children].forEach((p) => p.classList.add('shake'));
            S.eq([[4, '×', 0, '=', 0]]);
          },
        },
        {
          ar: 'الآن نضع تفاحة واحدة في كل طبق.',
          en: 'Now we put one apple on each plate.',
          ms: 2400,
          run: (S) =>
            S.plates.querySelectorAll('.apple').forEach((a, i) => {
              a.style.animationDelay = `${300 + i * 450}ms`;
              a.classList.add('drop');
            }),
        },
        {
          ar: '٤ × ١ يعني ٤ أطباق، في كل طبق تفاحة. المجموع ٤!',
          sayAr: 'أربعة في واحد يعني أربعة أطباق، في كل طبق تفاحة واحدة. المجموع أربعة!',
          en: '4 × 1 means 4 plates with 1 apple each. That makes 4!',
          sayEn: '4 times 1 means 4 plates with 1 apple each. That makes 4!',
          run: (S) => {
            ping([...S.plates.children], 200);
            S.eq([[4, '×', 0, '=', 0], [4, '×', 1, '=', 4]]);
          },
        },
        {
          ar: 'أي عدد × ٠ = ٠، وأي عدد × ١ = العدد نفسه.',
          sayAr: 'أي عدد في صفر يساوي صفر، وأي عدد في واحد يساوي العدد نفسه.',
          en: 'Any number × 0 = 0, and any number × 1 = the same number.',
          sayEn: 'Any number times 0 is 0, and any number times 1 stays the same.',
          run: (S) => S.eq([[9, '×', 0, '=', 0], [9, '×', 1, '=', 9]]),
        },
      ],
    },

    ten: {
      setup(S) {
        S.g = grid(4, 12, { d: 17 });
        S.g.cells.forEach((line) => line[9].classList.add('cut10'));
        S.stage.append(S.g);
      },
      steps: [
        {
          ar: 'هنا ٤ صفوف، في كل صف ١٢ نقطة.',
          en: 'Here are 4 rows with 12 dots in each.',
          ms: 2200,
          run: (S) => reveal(S.g.all(), 35),
        },
        {
          ar: 'أولاً نأخذ ١٠ من كل صف: ٤ × ١٠ = ٤٠، سهلة!',
          sayAr: 'أولاً نأخذ عشرة من كل صف: أربعة في عشرة تساوي أربعين، سهلة!',
          en: 'First take 10 from each row: 4 × 10 = 40. Easy!',
          sayEn: 'First take 10 from each row: 4 times 10 is 40. Easy!',
          ms: 2000,
          run: (S) => {
            S.g.classList.add('gap10');
            paintCols(S.g, 0, 10, 120, 'a');
            S.eq([[4, '×', 10, '=', 40]]);
          },
        },
        {
          ar: 'يبقى ٢ في كل صف: ٤ × ٢ = ٨.',
          sayAr: 'يبقى اثنان في كل صف: أربعة في اثنين تساوي ثمانية.',
          en: '2 are left in each row: 4 × 2 = 8.',
          sayEn: '2 are left in each row: 4 times 2 is 8.',
          run: (S) => {
            paintCols(S.g, 10, 12, 200, 'b');
            S.eq([[4, '×', 10, '=', 40], [4, '×', 2, '=', 8]]);
          },
        },
        {
          ar: 'نجمع: ٤٠ + ٨ = ٤٨. إذن ٤ × ١٢ = ٤٨!',
          sayAr: 'نجمع: أربعون زائد ثمانية تساوي ثمانية وأربعين. إذن أربعة في اثني عشر تساوي ثمانية وأربعين!',
          en: 'Add them: 40 + 8 = 48. So 4 × 12 = 48!',
          sayEn: 'Add them: 40 plus 8 is 48. So 4 times 12 is 48!',
          run: (S) => {
            ping(S.g.all(), 15);
            S.eq([[40, '+', 8, '=', 48], [4, '×', 12, '=', 48]]);
          },
        },
      ],
    },

    unknown: {
      setup(S) {
        S.pile = document.createElement('div');
        S.pile.className = 'pile';
        PILE.forEach(([x, y], i) => {
          const c = document.createElement('span');
          c.textContent = '🍬';
          c.style.left = `${x}%`;
          c.style.top = `${y}%`;
          c.style.rotate = `${((i * 47) % 70) - 35}deg`;
          S.pile.append(c);
        });
        S.g = grid(4, 3, { emoji: '🍬', d: 36 });
        S.g.rows.forEach((row, r) => {
          const n = document.createElement('b');
          n.className = 'row-num';
          n.textContent = S.N(r + 1);
          row.prepend(n);
        });
        S.stage.append(S.pile, S.g);
      },
      steps: [
        {
          ar: 'كم مرة نأخذ ٣ لنصل إلى ١٢؟ عندنا ١٢ حلوى.',
          sayAr: 'كم مرة نأخذ ثلاثة لنصل إلى اثني عشر؟ عندنا اثنتا عشرة حلوى.',
          en: 'How many 3s make 12? We have 12 candies.',
          ms: 1800,
          run: (S) => {
            reveal([...S.pile.children], 80);
            S.eq([['?', '×', 3, '=', 12]]);
          },
        },
        {
          ar: 'نرتّبها في صفوف، في كل صف ٣.',
          sayAr: 'نرتّبها في صفوف، في كل صف ثلاث.',
          en: 'Put them in rows of 3.',
          ms: 3200,
          run: (S) => {
            const pile = [...S.pile.children];
            S.g.cells.forEach((line, r) =>
              S.later(() => {
                pile.slice(r * 3, r * 3 + 3).forEach((c) => c.classList.add('gone'));
                reveal(line, 90);
              }, r * 700)
            );
            S.later(() => S.pile.classList.add('empty'), 3200);
          },
        },
        {
          ar: 'نعدّ الصفوف: ١، ٢، ٣، ٤.',
          sayAr: 'نعدّ الصفوف: واحد، اثنان، ثلاثة، أربعة.',
          en: 'Count the rows: 1, 2, 3, 4.',
          ms: 3400,
          run: (S) =>
            S.g.rows.forEach((row, r) =>
              S.later(() => {
                row.querySelector('.row-num').classList.add('on');
                ping(S.g.cells[r], 60);
              }, 300 + r * 750)
            ),
        },
        {
          ar: '٤ صفوف! إذن ٤ × ٣ = ١٢، والعدد المجهول هو ٤.',
          sayAr: 'أربعة صفوف! إذن أربعة في ثلاثة تساوي اثني عشر، والعدد المجهول هو أربعة.',
          en: '4 rows! So 4 × 3 = 12. The missing number is 4.',
          sayEn: '4 rows! So 4 times 3 is 12. The missing number is 4.',
          run: (S) => S.eq([[{ box: 4 }, '×', 3, '=', 12]]),
        },
      ],
    },
  };

  // ---------- Player ----------

  let st = null;

  function later(fn, ms) {
    st.timers.push(setTimeout(fn, ms));
  }

  function eqHtml(lines) {
    return lines
      .map(
        (tokens, i) =>
          `<div class="mom-line pop-in" style="--d:${i * 150}ms">${tokens
            .map((t) => {
              if (t === '?') return '<span class="mom-box"></span>';
              if (t && t.box != null) return `<span class="mom-box filled">${st.N(t.box)}</span>`;
              if (typeof t === 'number') return `<span>${st.N(t)}</span>`;
              return `<span class="op">${t}</span>`;
            })
            .join('')}</div>`
      )
      .join('');
  }

  function stopAudio() {
    st.audio.pause();
    st.audio.onended = st.audio.onerror = st.audio.onplaying = null;
    st.$face.classList.remove('talking');
  }

  function restart() {
    st.timers.forEach(clearTimeout);
    st.timers = [];
    stopAudio();
    st.$stage.innerHTML = '';
    st.$eq.innerHTML = '';
    st.$say.textContent = '';
    st.$ok.classList.remove('ready');
    st.$dots.forEach((d) => d.classList.remove('on'));
    st.S = { stage: st.$stage, N: st.N, later, eq: (lines) => (st.$eq.innerHTML = eqHtml(lines)) };
    st.lesson.setup(st.S);
    void st.$stage.offsetWidth;
    step(0);
  }

  function step(i) {
    const s = st.lesson.steps[i];
    const t0 = performance.now();
    const fallback = Math.max(2500, s[st.lang].length * 75);
    let moved = false;
    st.$dots.forEach((d, k) => d.classList.toggle('on', k <= i));
    st.$say.textContent = s[st.lang];
    st.$say.classList.remove('pop-in');
    void st.$say.offsetWidth;
    st.$say.classList.add('pop-in');
    s.run(st.S);

    const advance = () => {
      if (moved) return;
      moved = true;
      st.$face.classList.remove('talking');
      const wait = Math.max(700, (s.ms || 0) - (performance.now() - t0));
      later(() => (i + 1 < st.lesson.steps.length ? step(i + 1) : done()), wait);
    };
    const a = st.audio;
    a.onplaying = () => st.$face.classList.add('talking');
    a.onended = advance;
    a.onerror = () => later(advance, fallback);
    a.src = `audio/${st.lang}/mom-${st.key}-${i}.mp3`;
    a.play().catch(() => later(advance, fallback));
    later(advance, 20000);
  }

  function done() {
    st.$ok.classList.add('ready');
  }

  function open(key, lang, num, onClose) {
    close();
    Voice.stop();
    const s = STR[lang];
    const lesson = LESSONS[key];
    const $el = document.createElement('div');
    $el.className = 'mom-overlay';
    $el.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $el.innerHTML = `<div class="mom-panel" role="dialog" aria-label="${s.title}">
        <div class="mom-head">
          <img class="mom-face" src="${IMG}" alt="">
          <p class="mom-say" aria-live="polite"></p>
        </div>
        <div class="mom-stage"></div>
        <div class="mom-eq"></div>
        <div class="mom-dots">${'<span></span>'.repeat(lesson.steps.length)}</div>
        <div class="mom-actions">
          <button class="big-btn alt2" type="button" data-act="again">${s.again}</button>
          <button class="big-btn" type="button" data-act="ok">${s.ok}</button>
        </div>
      </div>`;
    document.body.appendChild($el);

    st = {
      key,
      lang,
      lesson,
      N: num,
      onClose,
      timers: [],
      audio: new Audio(),
      $el,
      $face: $el.querySelector('.mom-face'),
      $say: $el.querySelector('.mom-say'),
      $stage: $el.querySelector('.mom-stage'),
      $eq: $el.querySelector('.mom-eq'),
      $dots: [...$el.querySelectorAll('.mom-dots span')],
      $ok: $el.querySelector('[data-act="ok"]'),
    };
    $el.querySelector('[data-act="again"]').addEventListener('click', () => {
      Sounds.tap();
      restart();
    });
    st.$ok.addEventListener('click', () => {
      Sounds.tap();
      close();
    });
    restart();
  }

  function close() {
    if (!st) return;
    const { onClose } = st;
    st.timers.forEach(clearTimeout);
    stopAudio();
    st.$el.remove();
    st = null;
    if (onClose) onClose();
  }

  function button(lang, id) {
    return `<button class="ask-mom" type="button" ${id ? `id="${id}"` : ''}><img src="${IMG}" alt="">${STR[lang].ask}</button>`;
  }

  return { open, close, button, LESSONS, isOpen: () => !!st };
})();
