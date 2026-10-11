// "Ask Mom": a step-by-step animated explanation with Mom's voice, following the 2026-27 Egyptian
// grade 3 book (first number = number of groups, second = how many in each group).
// The child moves on with "Next"; each step waits until its animation has finished.
window.Mom = (function () {
  const IMG = 'img/mom/mom-explain.jpg';

  const STR = {
    ar: { ask: 'اسأل ماما', title: 'ماما تشرح', again: '↻ من الأول', next: 'التالي ◀', ok: 'فهمت! 👍' },
    en: { ask: 'Ask Mom', title: 'Mom explains', again: '↻ Again', next: 'Next ▶', ok: 'Got it! 👍' },
  };

  // ---------- Stage helpers ----------

  function make(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function restartAnim(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  // A big running total with a floating "+3" / "−3".
  function counter(S) {
    const el = make('<div class="mom-count"><span></span></div>');
    el.set = (v, float) => {
      el.firstChild.textContent = S.N(v);
      restartAnim(el, 'pop');
      if (float) {
        const f = make(`<span class="mom-float ${float[0] === '+' ? 'up' : 'down'}">${float}</span>`);
        el.append(f);
        setTimeout(() => f.remove(), 1500);
      }
    };
    return el;
  }

  // Fades out what is on the stage, then shows the new pieces.
  function swapStage(S, ...els) {
    [...S.stage.children].forEach((c) => c.classList.add('mom-leaving'));
    S.later(() => {
      S.stage.innerHTML = '';
      S.stage.append(...els);
    }, 350);
  }

  // One row of the times table drawn as a staircase, with the child's hero standing on a step.
  function staircase(S, table, steps) {
    const el = make('<div class="stairs"></div>');
    el.bars = [];
    for (let k = 1; k <= steps; k++) {
      const col = make(`<div class="stair-col"><div class="stair" style="--h:${k / steps}"><b>${S.N(table * k)}</b></div>
        <small>${S.N(table)} × ${S.N(k)}</small></div>`);
      col.firstChild.style.setProperty('--d', `${(k - 1) * 200}ms`);
      el.append(col);
      el.bars.push(col.querySelector('.stair'));
    }
    const hero = window.Profile ? Profile.heroImg('ready') : IMG;
    el.walker = make(`<img class="stair-walker" src="${hero}" alt="">`);
    el.append(el.walker);
    el.moveTo = (k) => {
      const bar = el.bars[k - 1];
      el.walker.style.left = `${bar.offsetLeft + bar.offsetWidth / 2}px`;
      el.walker.style.top = `${bar.offsetTop - el.walker.offsetHeight}px`;
      el.walker.classList.add('on');
      el.bars.forEach((b, i) => b.classList.toggle('here', i === k - 1));
    };
    return el;
  }

  // A 0..max number line with a frog that makes equal jumps.
  function numberLine(S, max, step) {
    const W = 300;
    const unit = (W - 30) / max;
    const x = (n) => 15 + n * unit;
    let svg = `<svg viewBox="0 0 ${W} 100"><line x1="${x(0)}" y1="78" x2="${x(max)}" y2="78"/>`;
    for (let n = 0; n <= max; n++) {
      const big = n % step === 0;
      svg += `<line class="tick" x1="${x(n)}" y1="${big ? 70 : 73}" x2="${x(n)}" y2="${big ? 86 : 83}"/>`;
      if (big) svg += `<text x="${x(n)}" y="99" text-anchor="middle">${S.N(n)}</text>`;
    }
    svg += '<g class="arcs"></g></svg>';
    const el = make(`<div class="numline">${svg}<span class="frog">🐸</span></div>`);
    const frog = el.querySelector('.frog');
    const at = (n, lift = 0) => {
      const s = el.clientWidth / W;
      return `translate(${x(n) * s - frog.offsetWidth / 2}px, ${(64 - lift) * s - frog.offsetHeight}px)`;
    };
    el.place = (n) => (frog.style.transform = at(n));
    el.jump = (from, to, label) => {
      const mid = (x(from) + x(to)) / 2;
      el.querySelector('.arcs').insertAdjacentHTML('beforeend',
        `<path d="M ${x(from)} 72 Q ${mid} 22 ${x(to)} 72"/><g class="jump-num"><circle cx="${mid}" cy="38" r="9"/>
         <text x="${mid}" y="42" text-anchor="middle">${label}</text></g>`);
      frog.animate([{ transform: at(from) }, { transform: at((from + to) / 2, 40) }, { transform: at(to) }],
        { duration: 600, easing: 'ease-in-out', fill: 'forwards' });
    };
    return el;
  }

  // Equation tokens: number | 'op' | '?' | {box} | {v, c: 'a' | 'b' | 'r', lbl: {ar, en}}
  const A = (v, lbl) => ({ v, c: 'a', lbl });
  const B = (v, lbl) => ({ v, c: 'b', lbl });
  const G = (v) => ({ v, c: 'r' });
  const MULTIPLICAND = { ar: 'المضروب', en: '1st number' };
  const MULTIPLIER = { ar: 'المضروب فيه', en: '2nd number' };

  // ---------- Lessons ----------

  const LESSONS = {
    // Lesson 1: when the 2nd number goes up (or down) by 1, the answer changes by the 1st number.
    lastCol: {
      setup(S) {
        S.count = counter(S);
        S.shelf = make('<div class="cake-shelf"></div>');
        S.boxes = [0, 1, 2].map(() => {
          const b = make('<div class="cake-box"><span class="box-tally"></span></div>');
          for (let i = 0; i < 4; i++) b.append(make('<span class="cake">🧁</span>'));
          S.shelf.append(b);
          return b;
        });
        S.stage.append(S.count, S.shelf);
      },
      steps: [
        {
          ar: 'عندنا ٣ علب، في كل علبة ٤ كب كيك: ٤، ٨، ١٢.',
          en: 'We have 3 boxes, with 4 cupcakes in each box: 4, 8, 12.',
          ms: 2800,
          run: (S) => {
            S.boxes.forEach((b, i) =>
              S.later(() => {
                b.classList.add('on');
                b.querySelector('.box-tally').textContent = S.N(4 * (i + 1));
                b.querySelector('.box-tally').classList.add('on');
                S.count.set(4 * (i + 1));
              }, 300 + i * 800)
            );
            S.eq([[A(3), '×', B(4), '=', G(12)]]);
          },
        },
        {
          ar: 'نحط واحدة زيادة في كل علبة. زاد ٣ بس، لأن عندنا ٣ علب!',
          en: 'Put one more in each box. It only grew by 3, because we have 3 boxes!',
          ms: 2200,
          run: (S) => {
            S.boxes.forEach((b, i) => {
              b.querySelector('.box-tally').classList.remove('on');
              S.later(() => b.append(make('<span class="cake extra">🧁</span>')), i * 500);
            });
            S.later(() => S.count.set(15, `+${S.N(3)}`), 1700);
            S.eq([[A(3), '×', B(5), '=', 12, '+', A(3), '=', G(15)]]);
          },
        },
        {
          ar: 'ده سلّم جدول ٣. كل درجة أعلى من اللي قبلها بـ ٣.',
          en: 'This is the 3 times table as a staircase. Each step is 3 higher than the one before.',
          ms: 2400,
          run: (S) => {
            S.stairs = staircase(S, 3, 6);
            swapStage(S, S.stairs);
            S.later(() => S.stairs.classList.add('on'), 400);
            S.later(() => S.stairs.moveTo(4), 1900);
            S.eq([[A(3), '×', B(4), '=', G(12)]]);
          },
        },
        {
          ar: 'نطلع درجة: ١٢ + ٣ = ١٥.',
          en: 'Go up one step: 12 + 3 = 15.',
          ms: 1200,
          run: (S) => {
            S.stairs.moveTo(5);
            S.eq([[A(3), '×', B(5), '=', A(3), '×', B(4), '+', A(3), '=', G(15)]]);
          },
        },
        {
          ar: 'وكل درجة لتحت بتقل ٣: ١٥، ١٢، ٩.',
          en: 'Each step down takes 3 away: 15, 12, 9.',
          ms: 1800,
          run: (S) => {
            S.stairs.moveTo(4);
            S.later(() => S.stairs.moveTo(3), 800);
            S.eq([[A(3), '×', B(3), '=', A(3), '×', B(4), '−', A(3), '=', G(9)]]);
          },
        },
        {
          ar: 'القاعدة: لو المضروب فيه زاد ١، الناتج يزيد بمقدار المضروب. ولو قل ١، الناتج يقل بمقدار المضروب.',
          en: 'The rule: when the 2nd number goes up by 1, the answer grows by the 1st number. When it goes down by 1, the answer shrinks by the 1st number.',
          ms: 800,
          run: (S) => {
            S.stairs.moveTo(5);
            S.eq([
              [A(3, MULTIPLICAND), '×', B(5, MULTIPLIER), '=', A(3), '×', B(4), '+', A(3)],
              [A(3), '×', B(3), '=', A(3), '×', B(4), '−', A(3)],
            ]);
          },
        },
      ],
    },

    // Lesson 1: swapping the numbers does not change the answer. The child picks how to count first.
    swap: {
      setup(S) {
        S.count = counter(S);
        S.tray = make('<div class="cake-tray"></div>');
        S.cells = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 5; c++) {
            const cell = make('<span class="cake">🧁</span>');
            cell.style.setProperty('--d', `${(r * 5 + c) * 70}ms`);
            S.tray.append(cell);
            S.cells.push({ cell, r, c });
          }
        }
        S.mark = (cls, test) => S.cells.forEach(({ cell, r, c }) => cell.classList.toggle(cls, test(r, c)));
        S.countBy = (way) => {
          const rows = way === 'row';
          const n = rows ? 3 : 5;
          S.mark('row', () => false);
          S.mark('col', () => false);
          for (let k = 0; k < n; k++) {
            S.later(() => {
              S.mark(way, (r, c) => (rows ? r : c) <= k);
              S.mark('now', (r, c) => (rows ? r : c) === k);
              S.count.set((rows ? 5 : 3) * (k + 1));
            }, k * 750);
          }
          S.later(() => S.mark('now', () => false), n * 750);
          S.eq([rows ? [A(3), '×', B(5), '=', G(15)] : [B(5), '×', A(3), '=', G(15)]]);
          return n * 750;
        };
        S.choices = make(`<div class="mom-choices">
          <button type="button" class="mom-choice row" data-way="row">${S.t({ ar: 'بالصفوف ↔', en: 'By rows ↔' })}</button>
          <button type="button" class="mom-choice col" data-way="col">${S.t({ ar: 'بالعواميد ↕', en: 'By columns ↕' })}</button></div>`);
        S.choices.querySelectorAll('button').forEach((btn) =>
          btn.addEventListener('click', () => {
            if (S.first) return;
            Sounds.tap();
            S.first = btn.dataset.way;
            S.choices.classList.add('mom-leaving');
            S.later(() => S.unlock(), S.countBy(S.first) + 300);
          })
        );
        S.stage.append(S.count, S.tray, S.choices);
      },
      steps: [
        {
          ar: 'صينية فيها ٣ صفوف، في كل صف ٥ كب كيك. نعدّها بالصفوف ولا بالعواميد؟',
          en: 'A tray with 3 rows, and 5 cupcakes in each row. Shall we count by rows or by columns?',
          gate: true,
          run: (S) => {
            S.tray.classList.add('on');
            S.later(() => S.choices.classList.add('on'), 1100);
            S.eq([[A(3), '×', B(5)]]);
          },
        },
        {
          ar: 'ودلوقتي نعدّها بالطريقة التانية!',
          en: "Now let's count it the other way!",
          ms: 3800,
          run: (S) => S.countBy(S.first === 'row' ? 'col' : 'row'),
        },
        {
          ar: 'نفس الصينية ونفس الكب كيك! يعني ٣ × ٥ = ٥ × ٣.',
          en: 'Same tray, same cupcakes! So 3 × 5 = 5 × 3.',
          ms: 1200,
          run: (S) => {
            S.mark('row', () => false);
            S.mark('col', () => false);
            S.cells.forEach(({ cell }, i) => S.later(() => restartAnim(cell, 'ping'), i * 40));
            S.eq([[A(3), '×', B(5), '=', B(5), '×', A(3), '=', G(15)]]);
          },
        },
        {
          ar: 'القاعدة: لو بدّلنا مكان العددين، الناتج ما بيتغيرش.',
          en: "The rule: swapping the two numbers doesn't change the answer.",
          ms: 800,
          run: (S) => S.eq([[A(3), '×', B(5), '=', B(5), '×', A(3)], [A(2), '×', B(3), '=', B(3), '×', A(2)]]),
        },
      ],
    },

    // Lesson 2: split the 1st number, multiply each part, then add.
    split: {
      setup(S) {
        const piece = (rows, cls) => {
          const p = make(`<div class="choco-piece ${cls}"></div>`);
          for (let i = 0; i < rows * 6; i++) p.append(make('<span class="sq"></span>'));
          return p;
        };
        S.bar = make('<div class="choco"></div>');
        S.p1 = piece(5, 'p1');
        S.p2 = piece(2, 'p2');
        S.p1.append(make('<span class="crack"></span>'));
        S.bar.append(S.p1, S.p2);
        S.stage.append(S.bar);
      },
      steps: [
        {
          ar: 'لوح شوكولاتة: ٧ صفوف، في كل صف ٦ مربعات. كام مربع؟',
          en: 'A chocolate bar: 7 rows with 6 squares in each. How many squares?',
          ms: 2200,
          run: (S) => {
            const sq = S.bar.querySelectorAll('.sq');
            for (let r = 0; r < 7; r++) {
              S.later(() => [...sq].slice(r * 6, r * 6 + 6).forEach((e) => e.classList.add('on')), r * 280);
            }
            S.eq([[A(7), '×', B(6), '=', '?']]);
          },
        },
        {
          ar: '٧ صعبة؟ نكسر اللوح: ٧ = ٥ + ٢.',
          en: '7 is hard? Break the bar: 7 = 5 + 2.',
          ms: 1400,
          run: (S) => {
            S.p1.querySelector('.crack').classList.add('on');
            S.later(() => {
              S.bar.classList.add('split');
              S.p1.append(make(`<span class="side">${S.t({ ar: '٥ صفوف', en: '5 rows' })}</span>`));
              S.p2.append(make(`<span class="side">${S.t({ ar: 'صفّين', en: '2 rows' })}</span>`));
            }, 700);
            S.eq([[A(7), '×', B(6), '=', A(5), '×', B(6), '+', A(2), '×', B(6)]]);
          },
        },
        {
          ar: 'القطعة الكبيرة: ٥ × ٦ = ٣٠.',
          en: 'The big piece: 5 × 6 = 30.',
          ms: 1200,
          run: (S) => {
            restartAnim(S.p1, 'ping');
            S.p1.append(make(`<span class="tag">${S.N(30)}</span>`));
            S.eq([[A(5), '×', B(6), '=', G(30)]]);
          },
        },
        {
          ar: 'القطعة الصغيرة: ٢ × ٦ = ١٢.',
          en: 'The small piece: 2 × 6 = 12.',
          ms: 1200,
          run: (S) => {
            restartAnim(S.p2, 'ping');
            S.p2.append(make(`<span class="tag">${S.N(12)}</span>`));
            S.eq([[A(5), '×', B(6), '=', G(30)], [A(2), '×', B(6), '=', G(12)]]);
          },
        },
        {
          ar: 'نجمع القطعتين: ٣٠ + ١٢ = ٤٢. يعني ٧ × ٦ = ٤٢!',
          en: 'Put them together: 30 + 12 = 42. So 7 × 6 = 42!',
          ms: 1200,
          run: (S) => {
            S.bar.classList.remove('split');
            S.bar.querySelectorAll('.side, .tag').forEach((e) => e.remove());
            S.later(() => {
              const c = counter(S);
              S.stage.append(c);
              c.set(42);
            }, 500);
            S.eq([[A(7), '×', B(6), '=', 30, '+', 12, '=', G(42)]]);
          },
        },
      ],
    },

    // Lesson 4: empty plates after a party, then rock-paper-scissors scoring (lose = 0, draw = 1, win = 5).
    zeroOne: {
      rounds: [
        ['tie', '✌️', '✌️'], ['win', '✊', '✌️'], ['lose', '✌️', '✊'], ['tie', '✊', '✊'],
        ['lose', '✊', '✋'], ['win', '✋', '✊'], ['tie', '✋', '✋'], ['lose', '✋', '✌️'],
      ],
      points: { win: 5, tie: 1, lose: 0 },
      setup(S) {
        S.party = make('<div class="party"></div>');
        S.plates = [0, 1, 2].map(() => {
          const p = make(`<div class="party-plate"><span class="zero">${S.N(0)}</span></div>`);
          for (let i = 0; i < 4; i++) p.append(make('<span class="drink">🥤</span>'));
          S.party.append(p);
          return p;
        });
        S.stage.append(S.party);
        S.names = S.t({
          ar: { win: 'فوز', tie: 'تعادل', lose: 'خسارة' },
          en: { win: 'Win', tie: 'Draw', lose: 'Lose' },
        });
      },
      steps: [
        {
          ar: 'في الحفلة: ٣ أطباق، في كل طبق ٤ كوبايات عصير.',
          en: 'At the party: 3 plates, with 4 cups of juice on each plate.',
          ms: 1600,
          run: (S) => {
            S.plates.forEach((p, i) => S.later(() => p.classList.add('on'), i * 350));
            S.eq([[A(3), '×', B(4), '=', G(12)]]);
          },
        },
        {
          ar: 'بعد الحفلة شربنا كله! لسه عندنا ٣ أطباق، بس في كل طبق ٠. يعني ٣ × ٠ = ٠.',
          en: 'After the party we drank it all! We still have 3 plates, but each has 0. So 3 × 0 = 0.',
          ms: 2600,
          run: (S) => {
            S.plates.forEach((p, i) =>
              S.later(() => {
                p.querySelectorAll('.drink').forEach((d) => d.classList.add('gone'));
                p.classList.add('empty');
              }, i * 700)
            );
            S.eq([[A(3), '×', B(0), '=', 0, '+', 0, '+', 0, '=', G(0)]]);
          },
        },
        {
          ar: 'يلا نلعب حجرة ورقة مقص مع ماما! الفوز بـ ٥ نقط، التعادل بنقطة، والخسارة بصفر.',
          en: "Let's play rock-paper-scissors with Mom! A win is 5 points, a draw is 1 point, and a loss is 0.",
          ms: 4200,
          run: (S) => {
            const L = LESSONS.zeroOne;
            const grid = make('<div class="rps-grid"></div>');
            const head = S.t({ ar: ['النتيجة', 'المرات', 'النقاط'], en: ['Result', 'Times', 'Points'] });
            S.table = make(`<table class="points-table">
              <tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>
              ${['win', 'tie', 'lose'].map((k) => `<tr data-k="${k}"><td>${S.names[k]} = ${S.N(L.points[k])}</td><td class="n"></td><td class="s"></td></tr>`).join('')}
              <tr class="tot"><td colspan="2">${S.t({ ar: 'المجموع', en: 'Total' })}</td><td class="s"></td></tr></table>`);
            swapStage(S, grid, S.table);
            L.rounds.forEach(([k, me, mom], i) =>
              S.later(() => grid.append(make(`<div class="rps-card ${k}"><span>${me}</span><i>${S.t({ ar: 'ضد', en: 'vs' })}</i><span>${mom}</span>
                <b>${S.names[k]}</b></div>`)), 500 + i * 300)
            );
            ['win', 'tie', 'lose'].forEach((k, i) =>
              S.later(() => S.cell(k, 'n', L.rounds.filter((r) => r[0] === k).length), 3200 + i * 250)
            );
            S.eq([]);
          },
        },
        {
          ar: 'التعادل ٣ مرات، كل مرة بنقطة واحدة: ٣ × ١ = ٣.',
          en: 'A draw 3 times, 1 point each time: 3 × 1 = 3.',
          ms: 1200,
          run: (S) => {
            S.focus('tie');
            S.cell('tie', 's', 3);
            S.eq([[A(3), '×', B(1), '=', G(3)]]);
          },
        },
        {
          ar: 'الخسارة ٣ مرات، كل مرة بصفر: ٣ × ٠ = ٠.',
          en: 'A loss 3 times, 0 points each time: 3 × 0 = 0.',
          ms: 1200,
          run: (S) => {
            S.focus('lose');
            S.cell('lose', 's', 0);
            S.eq([[A(3), '×', B(0), '=', G(0)]]);
          },
        },
        {
          ar: 'والفوز مرتين: ٢ × ٥ = ١٠. المجموع ١٣ نقطة! أي عدد × ٠ = ٠، وأي عدد × ١ = نفس العدد.',
          en: 'And 2 wins: 2 × 5 = 10. Total: 13 points! Any number × 0 = 0, and any number × 1 = the same number.',
          ms: 1200,
          run: (S) => {
            S.focus('win');
            S.cell('win', 's', 10);
            S.later(() => {
              S.focus(null);
              S.cell('tot', 's', 13);
            }, 900);
            S.eq([[A(2), '×', B(5), '=', G(10)], [A(9), '×', B(0), '=', G(0), '|', A(9), '×', B(1), '=', G(9)]]);
          },
        },
      ],
    },

    // Lesson 4: × 10 counts in tens; × 11 and × 12 split into 10 and the rest.
    ten: {
      setup(S) {
        S.count = counter(S);
        S.wallets = make('<div class="wallets"></div>');
        S.rows = ['🧒', '👧', '🧒', '👧'].map((kid) => {
          const row = make(`<div class="wallet"><span class="kid">${kid}</span>
            <span class="note">${S.N(10)}</span><span class="coin">${S.N(1)}</span><span class="coin">${S.N(1)}</span></div>`);
          S.wallets.append(row);
          return row;
        });
        S.stage.append(S.count, S.wallets);
      },
      steps: [
        {
          ar: '٤ أطفال، كل واحد معاه ١٢ جنيه. يعني ٤ × ١٢.',
          en: '4 kids, and each one has 12 pounds. That is 4 × 12.',
          ms: 1800,
          run: (S) => {
            S.rows.forEach((row, i) => S.later(() => row.classList.add('on'), i * 400));
            S.eq([[A(4), '×', B(12), '=', '?']]);
          },
        },
        {
          ar: 'الـ ١٢ جنيه = ورقة بعشرة، و ٢ جنيه فكّة.',
          en: '12 pounds = one 10-pound note and 2 one-pound coins.',
          ms: 1400,
          run: (S) => {
            const row = S.rows[0];
            restartAnim(row.querySelector('.note'), 'ping');
            row.querySelectorAll('.coin').forEach((c, i) => S.later(() => restartAnim(c, 'ping'), 500 + i * 300));
            S.eq([[B(12), '=', 10, '+', 2]]);
          },
        },
        {
          ar: 'نعدّ الورق بالعشرات: ١٠، ٢٠، ٣٠، ٤٠.',
          en: 'Count the notes in tens: 10, 20, 30, 40.',
          ms: 3000,
          run: (S) => {
            S.rows.forEach((row, i) =>
              S.later(() => {
                row.querySelector('.note').classList.add('lit');
                restartAnim(row.querySelector('.note'), 'ping');
                S.count.set(10 * (i + 1));
              }, i * 750)
            );
            S.eq([[A(4), '×', 10, '=', G(40)]]);
          },
        },
        {
          ar: 'والفكّة: ٤ × ٢ = ٨.',
          en: 'And the coins: 4 × 2 = 8.',
          ms: 2400,
          run: (S) => {
            S.rows.forEach((row, i) =>
              S.later(() => {
                row.querySelectorAll('.coin').forEach((c) => {
                  c.classList.add('lit');
                  restartAnim(c, 'ping');
                });
                S.count.set(40 + 2 * (i + 1));
              }, i * 550)
            );
            S.eq([[A(4), '×', 10, '=', G(40)], [A(4), '×', 2, '=', G(8)]]);
          },
        },
        {
          ar: 'نجمع: ٤٠ + ٨ = ٤٨. يعني ٤ × ١٢ = ٤٨!',
          en: 'Add them: 40 + 8 = 48. So 4 × 12 = 48!',
          ms: 800,
          run: (S) => {
            S.count.set(48);
            S.eq([[A(4), '×', B(12), '=', A(4), '×', 10, '+', A(4), '×', 2], ['=', 40, '+', 8, '=', G(48)]]);
          },
        },
      ],
    },

    // Lesson 5: find the missing number by packing boxes, then with frog jumps on a number line.
    unknown: {
      setup(S) {
        S.pile = make('<div class="cake-pile"></div>');
        for (let i = 0; i < 12; i++) S.pile.append(make('<span class="cake">🧁</span>'));
        S.shelf = make('<div class="cake-shelf packed"></div>');
        S.stage.append(S.pile, S.shelf);
      },
      steps: [
        {
          ar: 'عندنا ١٢ كب كيك، وعايزين نحطهم في علب، في كل علبة ٣. محتاجين كام علبة؟',
          en: 'We have 12 cupcakes to pack in boxes of 3. How many boxes do we need?',
          ms: 1200,
          run: (S) => {
            S.pile.classList.add('on');
            S.eq([['?', '×', B(3), '=', G(12)]]);
          },
        },
        {
          ar: 'نملا العلب: ٣، ٦، ٩، ١٢. طلعوا ٤ علب!',
          en: 'Fill the boxes: 3, 6, 9, 12. That is 4 boxes!',
          ms: 3800,
          run: (S) => {
            const cakes = [...S.pile.children];
            for (let k = 0; k < 4; k++) {
              S.later(() => {
                cakes.slice(k * 3, k * 3 + 3).forEach((c) => c.classList.add('gone'));
                S.shelf.append(make(`<div class="cake-box on"><span class="box-tally on">${S.N(3 * (k + 1))}</span>
                  <span class="cake">🧁</span><span class="cake">🧁</span><span class="cake">🧁</span><b class="box-num">${S.N(k + 1)}</b></div>`));
              }, k * 800);
            }
            S.later(() => {
              S.pile.classList.add('empty');
              S.shelf.querySelectorAll('.box-num').forEach((n) => n.classList.add('on'));
              S.eq([[{ box: 4 }, '×', B(3), '=', G(12)]]);
            }, 3300);
          },
        },
        {
          ar: 'والضفدع كمان يعرفها: بينط ٣ ٣ من الصفر لحد ما يوصل ١٢.',
          en: 'The frog can find it too: it jumps 3 at a time from 0 until it reaches 12.',
          ms: 3800,
          run: (S) => {
            S.line = numberLine(S, 12, 3);
            swapStage(S, S.line);
            S.later(() => S.line.place(0), 400);
            for (let k = 0; k < 4; k++) S.later(() => S.line.jump(3 * k, 3 * (k + 1), S.N(k + 1)), 900 + k * 750);
            S.eq([['?', '×', B(3), '=', G(12)]]);
          },
        },
        {
          ar: 'نط ٤ نطات، زي الـ ٤ علب بالظبط! يعني ٤ × ٣ = ١٢.',
          en: 'It made 4 jumps, just like the 4 boxes! So 4 × 3 = 12.',
          ms: 1200,
          run: (S) => {
            S.line.querySelectorAll('.jump-num').forEach((n, i) => S.later(() => n.classList.add('lit'), i * 250));
            S.eq([[{ box: 4 }, '×', B(3), '=', G(12)]]);
          },
        },
      ],
    },
  };

  // ---------- Player ----------

  let st = null;

  function later(fn, ms) {
    st.timers.push(setTimeout(fn, ms));
  }

  function token(t) {
    if (t === '?') return '<span class="mom-box"></span>';
    if (t && t.box != null) return `<span class="mom-box filled">${st.N(t.box)}</span>`;
    if (typeof t === 'number') return `<span>${st.N(t)}</span>`;
    if (t && t.v != null) {
      const num = `<span class="n-${t.c}">${st.N(t.v)}</span>`;
      return t.lbl ? `<span class="mom-lbl">${num}<small class="n-${t.c}">${t.lbl[st.lang]}</small></span>` : num;
    }
    return `<span class="op">${t}</span>`;
  }

  function eqHtml(lines) {
    return lines
      .map((tokens, i) => `<div class="mom-line pop-in" style="--d:${i * 150}ms">${tokens.map(token).join('')}</div>`)
      .join('');
  }

  function stopAudio() {
    st.audio.pause();
    st.audio.onended = st.audio.onerror = st.audio.onplaying = null;
    st.$face.classList.remove('talking');
  }

  function unlock() {
    st.$next.disabled = false;
    if (st.i === st.lesson.steps.length - 1) st.$next.classList.add('ready');
  }

  function restart() {
    st.timers.forEach(clearTimeout);
    st.timers = [];
    stopAudio();
    st.$stage.innerHTML = '';
    st.$eq.innerHTML = '';
    st.S = {
      stage: st.$stage,
      N: st.N,
      lang: st.lang,
      t: (o) => o[st.lang],
      later,
      unlock,
      eq: (lines) => (st.$eq.innerHTML = eqHtml(lines)),
      // Points-table helpers shared by the scoring lessons.
      cell: (k, col, v) => {
        const td = st.$stage.querySelector(k === 'tot' ? '.tot .s' : `tr[data-k="${k}"] .${col}`);
        if (td) td.innerHTML = `<span class="pop">${st.N(v)}</span>`;
      },
      focus: (k) => {
        st.$stage.querySelectorAll('tr[data-k]').forEach((tr) => tr.classList.toggle('on', tr.dataset.k === k));
        st.$stage.querySelectorAll('.rps-card').forEach((c) => c.classList.toggle('dim', k != null && !c.classList.contains(k)));
      },
    };
    st.lesson.setup(st.S);
    void st.$stage.offsetWidth;
    step(0);
  }

  function step(i) {
    const s = st.lesson.steps[i];
    const last = i === st.lesson.steps.length - 1;
    st.i = i;
    st.$dots.forEach((d, k) => d.classList.toggle('on', k <= i));
    st.$say.textContent = s[st.lang];
    restartAnim(st.$say, 'pop-in');
    s.run(st.S);

    st.$next.textContent = last ? STR[st.lang].ok : STR[st.lang].next;
    st.$next.classList.remove('ready');
    st.$next.disabled = true;
    if (!s.gate) later(unlock, s.ms || 600);

    stopAudio();
    const a = st.audio;
    a.onplaying = () => st.$face.classList.add('talking');
    a.onended = a.onerror = () => st.$face.classList.remove('talking');
    a.src = `audio/${st.lang}/mom-${st.key}-${i}.mp3`;
    a.play().catch(() => {});
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
          <button class="big-btn" type="button" data-act="next">${s.next}</button>
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
      $next: $el.querySelector('[data-act="next"]'),
    };
    $el.querySelector('[data-act="again"]').addEventListener('click', () => {
      Sounds.tap();
      restart();
    });
    st.$next.addEventListener('click', () => {
      Sounds.tap();
      if (st.i + 1 < st.lesson.steps.length) step(st.i + 1);
      else close();
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
