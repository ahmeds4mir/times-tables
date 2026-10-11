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

  // Equation tokens: number | 'op' | '?' | {box} | {v, c: 'a' | 'b' | 'r', lbl: {ar, en}}
  const A = (v, lbl) => ({ v, c: 'a', lbl });
  const B = (v, lbl) => ({ v, c: 'b', lbl });
  const G = (v) => ({ v, c: 'r' });
  const MULTIPLICAND = { ar: 'المضروب', en: '1st number' };
  const MULTIPLIER = { ar: 'المضروب فيه', en: '2nd number' };

  // ---------- Lessons ----------

  const LESSONS = {
    // Lesson 1: when the 2nd number grows by 1, the answer grows by the 1st number.
    lastCol: {
      setup(S) {
        S.count = counter(S);
        S.shelf = make('<div class="cake-shelf"></div>');
        S.legend = make('<div class="mom-legend"></div>');
        S.boxes = [0, 1, 2].map(() => {
          const b = make('<div class="cake-box"><span class="box-tally"></span></div>');
          for (let i = 0; i < 4; i++) b.append(make('<span class="cake">🧁</span>'));
          S.shelf.append(b);
          return b;
        });
        S.addOne = (gap) =>
          S.boxes.forEach((b, i) => S.later(() => b.append(make('<span class="cake extra">🧁</span>')), i * gap));
        S.stage.append(S.count, S.shelf, S.legend);
      },
      steps: [
        {
          ar: 'عندنا ٣ علب، في كل علبة ٤ كب كيك.',
          en: 'We have 3 boxes, with 4 cupcakes in each box.',
          ms: 1500,
          run: (S) => {
            S.boxes.forEach((b, i) => S.later(() => b.classList.add('on'), i * 400));
            S.eq([[A(3), '×', B(4)]]);
          },
        },
        {
          ar: 'نعدّ بالأربعات: ٤، ٨، ١٢.',
          en: 'Count in fours: 4, 8, 12.',
          ms: 2600,
          run: (S) => {
            S.boxes.forEach((b, i) =>
              S.later(() => {
                b.querySelector('.box-tally').textContent = S.N(4 * (i + 1));
                b.querySelector('.box-tally').classList.add('on');
                restartAnim(b, 'ping');
                S.count.set(4 * (i + 1));
              }, i * 800)
            );
            S.eq([[A(3), '×', B(4), '=', G(12)]]);
          },
        },
        {
          ar: 'نحط كب كيك زيادة في كل علبة.',
          en: 'Now put one more cupcake in each box.',
          ms: 2200,
          run: (S) => {
            S.boxes.forEach((b) => b.querySelector('.box-tally').classList.remove('on'));
            S.addOne(500);
            S.later(() => S.count.set(15, `+${S.N(3)}`), 1700);
            S.eq([[A(3), '×', B(5), '=', 12, '+', A(3), '=', G(15)]]);
          },
        },
        {
          ar: 'زاد ٣ بس، لأن عندنا ٣ علب: واحدة زيادة لكل علبة!',
          en: 'It only grew by 3, because we have 3 boxes: one more for each box!',
          ms: 1800,
          run: (S) => {
            S.shelf.querySelectorAll('.extra').forEach((c, i) => S.later(() => restartAnim(c, 'ping'), i * 400));
            S.eq([[A(3), '×', B(5), '=', A(3), '×', B(4), '+', A(3)]]);
          },
        },
        {
          ar: 'ولو أكلنا واحدة من كل علبة، الناتج يقل ٣.',
          en: 'And if we eat one from each box, the answer goes down by 3.',
          ms: 2000,
          run: (S) => {
            S.shelf.querySelectorAll('.extra').forEach((c, i) => S.later(() => c.classList.add('eaten'), i * 300));
            S.later(() => {
              S.shelf.querySelectorAll('.extra').forEach((c) => c.remove());
              S.count.set(12, `−${S.N(3)}`);
            }, 1500);
            S.eq([[A(3), '×', B(4), '=', 15, '−', A(3), '=', G(12)]]);
          },
        },
        {
          ar: 'القاعدة: لو المضروب فيه زاد ١، الناتج يزيد بمقدار المضروب.',
          en: 'The rule: when the 2nd number grows by 1, the answer grows by the 1st number.',
          ms: 1600,
          run: (S) => {
            S.addOne(250);
            S.later(() => S.count.set(15, `+${S.N(3)}`), 800);
            S.legend.innerHTML = `<span class="a">${S.t({ ar: 'المضروب = عدد العلب', en: '1st number = boxes' })}</span>
              <span class="b">${S.t({ ar: 'المضروب فيه = في كل علبة', en: '2nd number = in each box' })}</span>`;
            S.eq([[A(3, MULTIPLICAND), '×', B(5, MULTIPLIER), '=', A(3), '×', B(4), '+', A(3)]]);
          },
        },
      ],
    },

    // Lesson 1: swapping the numbers does not change the answer.
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
        S.stage.append(S.count, S.tray);
      },
      steps: [
        {
          ar: 'صينية فيها ٣ صفوف، في كل صف ٥ كب كيك.',
          en: 'A tray with 3 rows, and 5 cupcakes in each row.',
          ms: 1400,
          run: (S) => {
            S.tray.classList.add('on');
            S.eq([[A(3), '×', B(5)]]);
          },
        },
        {
          ar: 'نعدّ بالصفوف: ٥، ١٠، ١٥.',
          en: 'Count by rows: 5, 10, 15.',
          ms: 2600,
          run: (S) => {
            [0, 1, 2].forEach((row) =>
              S.later(() => {
                S.mark('row', (r) => r <= row);
                S.mark('now', (r) => r === row);
                S.count.set(5 * (row + 1));
              }, row * 800)
            );
            S.eq([[A(3), '×', B(5), '=', G(15)]]);
          },
        },
        {
          ar: 'ونعدّها بالعواميد: ٥ عواميد، في كل عمود ٣: ٣، ٦، ٩، ١٢، ١٥.',
          en: 'Now count by columns: 5 columns of 3: 3, 6, 9, 12, 15.',
          ms: 3800,
          run: (S) => {
            S.mark('row', () => false);
            [0, 1, 2, 3, 4].forEach((col) =>
              S.later(() => {
                S.mark('col', (r, c) => c <= col);
                S.mark('now', (r, c) => c === col);
                S.count.set(3 * (col + 1));
              }, col * 700)
            );
            S.eq([[B(5), '×', A(3), '=', G(15)]]);
          },
        },
        {
          ar: 'نفس الصينية ونفس الكب كيك! يعني ٣ × ٥ = ٥ × ٣.',
          en: 'Same tray, same cupcakes! So 3 × 5 = 5 × 3.',
          ms: 1200,
          run: (S) => {
            S.mark('now', () => false);
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

    // Lesson 4: the book's darts game — any number × 0 = 0, × 1 = the same number.
    zeroOne: {
      rings: [
        { pts: 0, r: 120, c: '#9AA3B5' },
        { pts: 1, r: 95, c: '#2B8BE2' },
        { pts: 5, r: 72, c: '#1F9D55' },
        { pts: 10, r: 48, c: '#E2572B' },
      ],
      hits: {
        10: [[-16, -12], [18, 10]],
        5: [],
        1: [[-79, -29], [80, -24], [-40, 76], [50, 70]],
        0: [[93, 54], [-93, 54], [-69, -83]],
      },
      setup(S) {
        const L = LESSONS.zeroOne;
        const C = 125;
        let svg = '<svg class="dart-board" viewBox="0 0 250 250">';
        L.rings.forEach((g) => {
          const y = g.pts === 10 ? C + 7 : C - g.r + 18;
          svg += `<g class="ring" data-p="${g.pts}"><circle cx="${C}" cy="${C}" r="${g.r}" fill="${g.c}" stroke="#fff" stroke-width="3"/>
            <text x="${C}" y="${y}" text-anchor="middle">${S.N(g.pts)}</text></g>`;
        });
        svg += '<g class="darts"></g></svg>';
        S.board = make(svg);
        const head = S.t({ ar: ['الحلقة', 'السهام', 'النقاط'], en: ['Ring', 'Darts', 'Points'] });
        S.table = make(`<table class="dart-score">
          <tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>
          ${[10, 5, 1, 0].map((p) => `<tr data-p="${p}"><td>${S.N(p)}</td><td class="n"></td><td class="s"></td></tr>`).join('')}
          <tr class="tot"><td colspan="2">${S.t({ ar: 'المجموع', en: 'Total' })}</td><td class="s"></td></tr></table>`);
        S.stage.classList.add('col');
        S.stage.append(S.board, S.table);
        S.focus = (p) => {
          S.board.classList.toggle('focus', p != null);
          S.board.querySelectorAll('.ring').forEach((g) => g.classList.toggle('on', Number(g.dataset.p) === p));
          S.table.querySelectorAll('tr[data-p]').forEach((tr) => tr.classList.toggle('on', Number(tr.dataset.p) === p));
        };
        S.cell = (p, col, v) => {
          const td = S.table.querySelector(p === 'tot' ? '.tot .s' : `tr[data-p="${p}"] .${col}`);
          td.innerHTML = `<span class="pop">${S.N(v)}</span>`;
        };
        S.countRing = (p, gap) => {
          const ds = [...S.board.querySelectorAll(`.dart[data-p="${p}"]`)];
          if (!ds.length) S.cell(p, 's', 0);
          ds.forEach((d, i) => S.later(() => { d.classList.add('counted'); S.cell(p, 's', (i + 1) * p); }, i * gap));
          return Math.max(1, ds.length) * gap;
        };
      },
      steps: [
        {
          ar: 'لعبة السهام! كل حلقة ليها نقط: ١٠ و ٥ و ١ و ٠.',
          en: 'A darts game! Each ring has points: 10, 5, 1 and 0.',
          ms: 2200,
          run: (S) => {
            [10, 5, 1, 0].forEach((p, i) => S.later(() => S.focus(p), i * 500));
            S.later(() => S.focus(null), 2100);
            S.eq([]);
          },
        },
        {
          ar: 'سلمى رمت ٩ سهام. نعدّ السهام اللي في كل حلقة.',
          en: 'Salma threw 9 darts. Count the darts in each ring.',
          ms: 3600,
          run: (S) => {
            const all = [];
            Object.entries(LESSONS.zeroOne.hits).forEach(([p, list]) => list.forEach(([x, y]) => all.push([p, x, y])));
            const g = S.board.querySelector('.darts');
            all.forEach(([p, x, y], i) =>
              S.later(() => g.insertAdjacentHTML('beforeend',
                `<g class="dart" data-p="${p}"><circle cx="${125 + x}" cy="${125 + y}" r="7"/></g>`), i * 260)
            );
            [10, 5, 1, 0].forEach((p, i) =>
              S.later(() => S.cell(p, 'n', LESSONS.zeroOne.hits[p].length), all.length * 260 + 300 + i * 250)
            );
          },
        },
        {
          ar: 'حلقة الواحد: ٤ سهام، كل سهم بنقطة واحدة. يعني ٤ × ١ = ٤.',
          en: 'The 1 ring: 4 darts, each worth 1 point. So 4 × 1 = 4.',
          ms: 2000,
          run: (S) => {
            S.focus(1);
            S.countRing(1, 450);
            S.eq([[A(4), '×', B(1), '=', G(4)]]);
          },
        },
        {
          ar: 'حلقة الصفر: ٣ سهام، كل سهم بصفر. يعني ٣ × ٠ = ٠.',
          en: 'The 0 ring: 3 darts, each worth 0. So 3 × 0 = 0.',
          ms: 2000,
          run: (S) => {
            S.focus(0);
            S.countRing(0, 550);
            S.eq([[A(3), '×', B(0), '=', G(0)]]);
          },
        },
        {
          ar: 'حلقة ٥: ولا سهم، يعني ٠ × ٥ = ٠. وحلقة ١٠: سهمين، يعني ٢ × ١٠ = ٢٠.',
          en: 'The 5 ring: no darts, so 0 × 5 = 0. The 10 ring: 2 darts, so 2 × 10 = 20.',
          ms: 2400,
          run: (S) => {
            S.focus(5);
            S.countRing(5, 400);
            S.later(() => {
              S.focus(10);
              S.countRing(10, 450);
            }, 1200);
            S.eq([[A(0), '×', B(5), '=', G(0)], [A(2), '×', B(10), '=', G(20)]]);
          },
        },
        {
          ar: 'المجموع ٢٤ نقطة! وافتكر: أي عدد × ٠ = ٠، وأي عدد × ١ = نفس العدد.',
          en: 'Total: 24 points! Remember: any number × 0 = 0, and any number × 1 = the same number.',
          ms: 800,
          run: (S) => {
            S.focus(null);
            S.cell('tot', 's', 24);
            S.eq([[20, '+', 0, '+', 4, '+', 0, '=', G(24)], [A(9), '×', B(0), '=', G(0), '|', A(9), '×', B(1), '=', G(9)]]);
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
        S.stage.classList.add('col');
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

    // Lesson 5: find the missing number by counting in the times table.
    unknown: {
      setup(S) {
        S.pile = make('<div class="cake-pile"></div>');
        for (let i = 0; i < 12; i++) S.pile.append(make('<span class="cake">🧁</span>'));
        S.shelf = make('<div class="cake-shelf packed"></div>');
        S.chips = make('<div class="table-chips"></div>');
        S.stage.classList.add('col');
        S.stage.append(S.pile, S.shelf, S.chips);
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
          ar: 'نملا العلب: ٣، ٦، ٩، ١٢.',
          en: 'Fill the boxes: 3, 6, 9, 12.',
          ms: 3400,
          run: (S) => {
            const cakes = [...S.pile.children];
            for (let k = 0; k < 4; k++) {
              S.later(() => {
                cakes.slice(k * 3, k * 3 + 3).forEach((c) => c.classList.add('gone'));
                const box = make(`<div class="cake-box on"><span class="box-tally on">${S.N(3 * (k + 1))}</span>
                  <span class="cake">🧁</span><span class="cake">🧁</span><span class="cake">🧁</span><b class="box-num">${S.N(k + 1)}</b></div>`);
                S.shelf.append(box);
              }, k * 800);
            }
            S.later(() => S.pile.classList.add('empty'), 3300);
          },
        },
        {
          ar: 'خلصوا في ٤ علب! يعني ٤ × ٣ = ١٢.',
          en: 'They fit in 4 boxes! So 4 × 3 = 12.',
          ms: 1800,
          run: (S) => {
            S.shelf.querySelectorAll('.box-num').forEach((n, i) => S.later(() => {
              n.classList.add('on');
              restartAnim(n, 'ping');
            }, i * 400));
            S.eq([[{ box: 4 }, '×', B(3), '=', G(12)]]);
          },
        },
        {
          ar: 'السر: نعدّ في جدول ٣ لحد ما نوصل ١٢، ونشوف عدّينا كام مرة.',
          en: 'The trick: count in the 3 times table until you reach 12, and see how many steps it took.',
          ms: 2400,
          run: (S) => {
            for (let k = 1; k <= 4; k++) {
              S.later(() => S.chips.append(make(`<span class="chip ${k === 4 ? 'hit' : ''}">${S.N(k)} × ${S.N(3)} = ${S.N(3 * k)}</span>`)), (k - 1) * 550);
            }
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

  function restart() {
    st.timers.forEach(clearTimeout);
    st.timers = [];
    stopAudio();
    st.$stage.innerHTML = '';
    st.$stage.className = 'mom-stage';
    st.$eq.innerHTML = '';
    st.S = {
      stage: st.$stage,
      N: st.N,
      lang: st.lang,
      t: (o) => o[st.lang],
      later,
      eq: (lines) => (st.$eq.innerHTML = eqHtml(lines)),
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
    later(() => {
      st.$next.disabled = false;
      if (last) st.$next.classList.add('ready');
    }, s.ms || 600);

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
