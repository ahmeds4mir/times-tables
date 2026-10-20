// Shared mini-game kit. Engine / chapters call MiniGames.mount(host, id, q, api).
// api: { N, tx, label(q,v), answer(value), locked(), mg, themeEmoji, onWrongVisual? }
window.MiniGames = (function () {
  let active = null;

  const LABELS = {
    choice: { ar: 'اختيار', en: 'Choice', emoji: '🎯' },
    pop: { ar: 'فرقعة', en: 'Pop', emoji: '🎈' },
    door: { ar: 'الأبواب', en: 'Doors', emoji: '🚪' },
    memory: { ar: 'ذاكرة', en: 'Memory', emoji: '🃏' },
    connect: { ar: 'أربعة', en: 'Connect', emoji: '🪙' },
    reveal: { ar: 'الصورة', en: 'Reveal', emoji: '🖼️' },
    lucky: { ar: 'صناديق', en: 'Lucky', emoji: '🎁' },
    sort: { ar: 'فرز', en: 'Sort', emoji: '🗂️' },
    duel: { ar: 'مبارزة', en: 'Duel', emoji: '⚔️' },
    race: { ar: 'سباق', en: 'Race', emoji: '🏎️' },
  };

  const BALL_COLORS = ['#FF6FB5', '#4A90FF', '#F5B700', '#2ECC71', '#9B59B6', '#FF8A3D'];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Keep string answers like "cm" / "m" — Number("cm") is NaN and was marking correct picks wrong.
  function parseVal(raw) {
    if (typeof raw === 'number') return raw;
    if (raw == null) return raw;
    const s = String(raw);
    if (s.trim() !== '' && Number.isFinite(Number(s))) return Number(s);
    return s;
  }

  function chip() {
    return '';
  }

  function choiceBtns(q, api, extraClass) {
    const n = q.choices.length;
    return `<div class="mg-choices choices adv-choices n${n} ${extraClass || ''}">${q.choices
      .map(
        (v, i) =>
          `<button class="choice pop-in" type="button" style="--d:${i * 50}ms" data-v="${v}">${api.label(q, v)}</button>`
      )
      .join('')}</div>`;
  }

  function wireChoices(host, q, api) {
    host.querySelectorAll('[data-v]').forEach((btn) =>
      btn.addEventListener('click', () => {
        if (api.locked()) return;
        Sounds.tap();
        api.answer(parseVal(btn.dataset.v), btn);
      })
    );
  }

  // ---------- games ----------

  function choice(host, q, api) {
    host.innerHTML = `${chip(api, 'choice')}${choiceBtns(q, api)}`;
    wireChoices(host, q, api);
  }

  function pop(host, q, api) {
    const slots = shuffle(q.choices.map((v, i) => ({ v, i })));
    host.innerHTML = `${chip(api, 'pop')}<div class="mg-pop" id="mgPop"></div>`;
    const stage = host.querySelector('#mgPop');
    const timers = [];
    slots.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mg-balloon';
      b.textContent = api.label(q, s.v);
      b.dataset.v = s.v;
      b.style.setProperty('--b', BALL_COLORS[i % BALL_COLORS.length]);
      b.style.left = `${8 + i * (80 / Math.max(slots.length, 1))}%`;
      b.style.setProperty('--delay', `${i * 0.25}s`);
      b.style.setProperty('--dur', `${3.8 + (i % 3) * 0.4}s`);
      b.addEventListener('click', () => {
        if (api.locked()) return;
        Sounds.tap();
        const val = parseVal(b.dataset.v);
        if (val !== q.answer) {
          b.classList.remove('shake');
          void b.offsetWidth;
          b.classList.add('shake');
          Sounds.wrong();
          return;
        }
        api.answer(val, b);
      });
      stage.appendChild(b);
      timers.push(
        setTimeout(() => {
          if (!b.isConnected || api.locked()) return;
          b.style.opacity = '0';
        }, 4500 + i * 250)
      );
    });
    active.timers = timers;
  }

  function door(host, q, api) {
    const opts = shuffle(q.choices.slice(0, 3));
    while (opts.length < 3) opts.push(opts[0]);
    if (!opts.includes(q.answer)) opts[0] = q.answer;
    const doors = shuffle(opts.slice(0, 3));
    host.innerHTML = `${chip(api, 'door')}<div class="mg-doors">${doors
      .map(
        (v, i) =>
          `<button type="button" class="mg-door" data-v="${v}"><span>🚪</span><b>${api.tx('باب', 'Door')} ${api.N(i + 1)}</b></button>`
      )
      .join('')}</div>`;
    host.querySelectorAll('.mg-door').forEach((btn) =>
      btn.addEventListener('click', () => {
        if (api.locked()) return;
        Sounds.tap();
        const v = parseVal(btn.dataset.v);
        btn.classList.add(v === q.answer ? 'open' : 'trap');
        btn.querySelector('b').textContent = api.label(q, v);
        api.answer(v, btn);
      })
    );
  }

  function memory(host, q, api) {
    const extras = q.choices.filter((v) => v !== q.answer);
    const vals = [q.answer, extras[0] ?? q.answer + 1, extras[1] ?? q.answer + 2];
    const cards = shuffle(
      vals.flatMap((v) => [
        { v, uid: Math.random().toString(36).slice(2) },
        { v, uid: Math.random().toString(36).slice(2) },
      ])
    );
    let open = [];
    let busy = false;
    host.innerHTML = `${chip(api, 'memory')}<div class="mg-memory">${cards
      .map((c) => `<button type="button" class="mg-card back" data-uid="${c.uid}" data-v="${c.v}"><span class="face"></span></button>`)
      .join('')}</div>`;

    host.querySelectorAll('.mg-card').forEach((btn) =>
      btn.addEventListener('click', () => {
        if (api.locked() || busy || btn.classList.contains('matched') || !btn.classList.contains('back')) return;
        Sounds.tap();
        btn.classList.remove('back');
        btn.querySelector('.face').textContent = api.label(q, parseVal(btn.dataset.v));
        open.push(btn);
        if (open.length < 2) return;
        busy = true;
        const [a, b] = open;
        open = [];
        if (a.dataset.v === b.dataset.v) {
          a.classList.add('matched');
          b.classList.add('matched');
          if (parseVal(a.dataset.v) === q.answer) {
            a.classList.add('win');
            b.classList.add('win');
            api.answer(q.answer, a);
            busy = false;
          } else {
            Sounds.correct();
            busy = false;
          }
        } else {
          Sounds.wrong();
          setTimeout(() => {
            a.classList.add('back');
            b.classList.add('back');
            a.querySelector('.face').textContent = '';
            b.querySelector('.face').textContent = '';
            busy = false;
          }, 650);
        }
      })
    );
  }

  function connect(host, q, api) {
    const cols = 4;
    const rows = 4;
    if (!api.mg.connect) api.mg.connect = Array.from({ length: cols }, () => []);
    const grid = api.mg.connect;
    const cells = [];
    for (let r = rows - 1; r >= 0; r--) {
      for (let c = 0; c < cols; c++) {
        const owner = grid[c][r];
        cells.push(`<span class="mg-cell ${owner === 1 ? 'p1' : owner === 2 ? 'p2' : ''}">${owner === 1 ? '🟣' : owner === 2 ? '🔴' : ''}</span>`);
      }
    }
    host.innerHTML = `${chip(api, 'connect')}<div class="mg-connect"><div class="mg-grid">${cells.join('')}</div>${choiceBtns(q, api)}</div>`;
    host.querySelectorAll('[data-v]').forEach((btn) =>
      btn.addEventListener('click', () => {
        if (api.locked()) return;
        Sounds.tap();
        const v = parseVal(btn.dataset.v);
        const col = Math.floor(Math.random() * cols);
        if (v === q.answer) {
          if (grid[col].length < rows) grid[col].push(1);
        } else if (grid[(col + 1) % cols].length < rows) {
          grid[(col + 1) % cols].push(2);
        }
        api.answer(v, btn);
      })
    );
  }

  function reveal(host, q, api) {
    if (api.mg.reveal == null) api.mg.reveal = 0;
    const emoji = api.themeEmoji || '🎁';
    const gone = api.mg.reveal;
    const tiles = Array.from({ length: 9 }, (_, i) => `<span class="mg-tile ${i < gone ? 'off' : ''}"></span>`).join('');
    host.innerHTML = `${chip(api, 'reveal')}<div class="mg-reveal"><div class="pic">${emoji}</div><div class="mg-tiles">${tiles}</div></div>${choiceBtns(q, api)}`;
    host.querySelectorAll('[data-v]').forEach((btn) =>
      btn.addEventListener('click', () => {
        if (api.locked()) return;
        Sounds.tap();
        const v = parseVal(btn.dataset.v);
        if (v === q.answer) api.mg.reveal = Math.min(9, (api.mg.reveal || 0) + 2);
        api.answer(v, btn);
      })
    );
  }

  function lucky(host, q, api) {
    const flavors = [
      { ar: '⭐ نجوم إضافية!', en: '⭐ Bonus stars!' },
      { ar: '🚀 سرعة!', en: '🚀 Turbo!' },
      { ar: '😜 مفاجأة مضحكة!', en: '😜 Silly surprise!' },
    ];
    let picked = null;
    host.innerHTML = `${chip(api, 'lucky')}<div class="mg-lucky">
      <div class="mg-flavor" id="mgFlavor">${api.tx('اختَر صندوقاً!', 'Pick a box!')}</div>
      <div class="mg-boxes" id="mgBoxes">${[0, 1, 2]
        .map((i) => `<button type="button" class="mg-box" data-i="${i}">🎁</button>`)
        .join('')}</div>
      <div id="mgLuckyChoices" hidden></div>
    </div>`;
    host.querySelectorAll('.mg-box').forEach((btn) =>
      btn.addEventListener('click', () => {
        if (picked != null || api.locked()) return;
        Sounds.tap();
        picked = Number(btn.dataset.i);
        host.querySelectorAll('.mg-box').forEach((b) => (b.disabled = true));
        btn.classList.add('picked');
        const f = flavors[picked];
        host.querySelector('#mgFlavor').textContent = api.tx(f.ar, f.en);
        const box = host.querySelector('#mgLuckyChoices');
        box.hidden = false;
        box.innerHTML = choiceBtns(q, api);
        wireChoices(box, q, api);
      })
    );
  }

  function sort(host, q, api) {
    let selected = null;
    host.innerHTML = `${chip(api, 'sort')}<div class="mg-sort">
      <div class="mg-sort-cards">${q.choices
        .map((v) => `<button type="button" class="mg-sort-card" data-v="${v}">${api.label(q, v)}</button>`)
        .join('')}</div>
      <div class="mg-buckets">
        <button type="button" class="mg-bucket yes" data-bucket="yes">${api.tx('✓ صح', '✓ Right')}</button>
        <button type="button" class="mg-bucket no" data-bucket="no">${api.tx('✗ لا', '✗ Nope')}</button>
      </div>
    </div>`;
    host.querySelectorAll('.mg-sort-card').forEach((btn) =>
      btn.addEventListener('click', () => {
        if (api.locked()) return;
        Sounds.tap();
        selected = parseVal(btn.dataset.v);
        host.querySelectorAll('.mg-sort-card').forEach((b) => b.classList.toggle('on', b === btn));
      })
    );
    host.querySelectorAll('.mg-bucket').forEach((btn) =>
      btn.addEventListener('click', () => {
        if (api.locked() || selected == null) return;
        Sounds.tap();
        const yes = btn.dataset.bucket === 'yes';
        const correctPick = selected === q.answer;
        if (yes && correctPick) {
          btn.classList.add('flash-ok');
          api.answer(selected, btn);
        } else if (!yes && !correctPick) {
          // correctly discarded a wrong answer — pick again
          Sounds.correct();
          host.querySelectorAll('.mg-sort-card').forEach((b) => {
            if (parseVal(b.dataset.v) === selected) {
              b.disabled = true;
              b.style.opacity = '.35';
              b.classList.remove('on');
            }
          });
          selected = null;
        } else {
          // Wrong bucket: force a non-matching value (works for string answers too).
          api.answer(yes ? selected : `\0${String(q.answer)}`, btn);
        }
      })
    );
  }

  function duel(host, q, api) {
    if (!api.mg.duel) api.mg.duel = { hero: 3, rival: 3 };
    const d = api.mg.duel;
    host.innerHTML = `${chip(api, 'duel')}<div class="mg-duel">
      <div class="mg-duel-bars">
        <div class="mg-duel-bar hero">${api.tx('أنت', 'You')}<div class="track"><div class="fill" style="width:${(d.hero / 3) * 100}%"></div></div></div>
        <div class="mg-duel-vs">⚔️</div>
        <div class="mg-duel-bar rival">${api.tx('الخصم', 'Rival')}<div class="track"><div class="fill" style="width:${(d.rival / 3) * 100}%"></div></div></div>
      </div>
      ${choiceBtns(q, api)}
    </div>`;
    host.querySelectorAll('[data-v]').forEach((btn) =>
      btn.addEventListener('click', () => {
        if (api.locked()) return;
        Sounds.tap();
        const v = parseVal(btn.dataset.v);
        if (v === q.answer) d.rival = Math.max(0, d.rival - 1);
        else d.hero = Math.max(0, d.hero - 1);
        api.answer(v, btn);
      })
    );
  }

  function race(host, q, api) {
    if (api.mg.racePace == null) api.mg.racePace = 25;
    api.mg.racePace = Math.min(90, api.mg.racePace + 4);
    host.innerHTML = `${chip(api, 'race')}<div class="mg-race">
      <div class="mg-race-meter" title="rival"><i style="--p:${api.mg.racePace}%"></i></div>
      <small>${api.tx('الخصم يقترب! جاوب بسرعة 🏎️', 'Rival is coming! Answer fast 🏎️')}</small>
      ${choiceBtns(q, api)}
    </div>`;
    wireChoices(host, q, api);
  }

  const GAMES = { choice, pop, door, memory, connect, reveal, lucky, sort, duel, race };

  function destroy() {
    if (!active) return;
    (active.timers || []).forEach(clearTimeout);
    if (active.host) active.host.innerHTML = '';
    active = null;
  }

  function mount(host, id, q, api) {
    destroy();
    if (!host) return LABELS.choice;
    const gameId = GAMES[id] ? id : 'choice';
    active = { host, timers: [] };
    try {
      GAMES[gameId](host, q, api);
    } catch (e) {
      console.warn('MiniGames', gameId, e);
      choice(host, q, api);
    }
    return LABELS[gameId];
  }

  function label(id, lang) {
    const L = LABELS[id] || LABELS.choice;
    return `${L.emoji} ${lang === 'ar' ? L.ar : L.en}`;
  }

  return { mount, destroy, label, parseVal, LABELS, ids: Object.keys(GAMES) };
})();
