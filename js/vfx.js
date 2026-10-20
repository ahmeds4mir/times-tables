// Point-score VFX (gender scenes) + big end-of-level finales (5 boy / 5 girl).
window.Vfx = (function () {
  const STYLES = ['spark', 'banner', 'aura', 'pow'];
  const FINALES = ['trophy', 'fireworks', 'podium', 'mega', 'legend'];

  const SCENES_BOY = {
    spark: 'img/vfx-ideas/1-hit-spark.jpg',
    banner: 'img/vfx-ideas/2-yes-banner.jpg',
    aura: 'img/vfx-ideas/3-power-aura.jpg',
    pow: 'img/vfx-ideas/4-comic-pow.jpg',
  };
  const SCENES_GIRL = {
    spark: 'img/vfx-ideas/girl/1-hit-spark.jpg',
    banner: 'img/vfx-ideas/girl/2-yes-banner.jpg',
    aura: 'img/vfx-ideas/girl/3-power-aura.jpg',
    pow: 'img/vfx-ideas/girl/4-comic-pow.jpg',
  };

  const BANNER = {
    boy: {
      ar: ['يَس!', 'ممتاز!', 'ضربة!', 'برافو!'],
      en: ['YES!', 'NICE!', 'HIT!', 'BRAVO!'],
    },
    girl: {
      ar: ['ياي!', 'رائعة!', 'لمعة!', 'برافو!'],
      en: ['YAY!', 'CUTE!', 'SPARK!', 'BRAVO!'],
    },
  };

  const FINALE_TITLE = {
    boy: {
      trophy: { ar: 'بطل!', en: 'CHAMPION!' },
      fireworks: { ar: 'ألعاب نارية!', en: 'FIREWORKS!' },
      podium: { ar: 'المركز الأول!', en: '1st PLACE!' },
      mega: { ar: 'فوز خرافي!', en: 'MEGA WIN!' },
      legend: { ar: 'أسطورة!', en: 'LEGEND!' },
    },
    girl: {
      trophy: { ar: 'ملكة!', en: 'QUEEN!' },
      fireworks: { ar: 'قلوب لامعة!', en: 'SPARKLE!' },
      podium: { ar: 'نجمة!', en: 'SUPERSTAR!' },
      mega: { ar: 'ياي كبير!', en: 'BIG YAY!' },
      legend: { ar: 'ساحرة!', en: 'MAGIC!' },
    },
  };

  const DURATION = 2400;
  const FINALE_DURATION = 4200;
  let seq = 0;
  let finaleSeq = 0;
  let hideTimer = null;

  function gender() {
    return window.Profile && Profile.isGirl ? 'girl' : 'boy';
  }

  function scenes() {
    return gender() === 'girl' ? SCENES_GIRL : SCENES_BOY;
  }

  function preload() {
    const all = [
      ...Object.values(SCENES_BOY),
      ...Object.values(SCENES_GIRL),
      ...FINALES.flatMap((id) => [
        `img/vfx-ideas/finale/boy-${id}.jpg`,
        `img/vfx-ideas/finale/girl-${id}.jpg`,
      ]),
    ];
    all.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }
  preload();

  function ensureHost() {
    let host = document.getElementById('vfxHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'vfxHost';
      host.className = 'vfx-host';
      host.setAttribute('aria-hidden', 'true');
    }
    document.body.appendChild(host);
    return host;
  }

  function pickStyle(hint) {
    if (hint && STYLES.includes(hint)) return hint;
    seq = (seq + 1) % STYLES.length;
    return Math.random() < 0.35 ? STYLES[Math.floor(Math.random() * STYLES.length)] : STYLES[seq];
  }

  function pickFinale(hint) {
    if (hint && FINALES.includes(hint)) return hint;
    finaleSeq = (finaleSeq + 1) % FINALES.length;
    return Math.random() < 0.4 ? FINALES[Math.floor(Math.random() * FINALES.length)] : FINALES[finaleSeq];
  }

  function styleForGame(gameId) {
    const map = {
      pop: 'pow',
      door: 'spark',
      memory: 'aura',
      connect: 'spark',
      reveal: 'banner',
      lucky: 'pow',
      sort: 'aura',
      duel: 'spark',
      race: 'banner',
      choice: 'banner',
    };
    return map[gameId] || null;
  }

  function fxMarkup(style, lang, word, g) {
    const girly = g === 'girl';
    if (style === 'spark') {
      return `
        <div class="vfx-flash${girly ? ' pink' : ''}"></div>
        <div class="vfx-lines${girly ? ' pink' : ''}"></div>
        <div class="vfx-spark">
          <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
          <span class="vfx-starburst${girly ? ' pink' : ''}"></span>
          <b class="vfx-plus${girly ? ' pink' : ''}">+1</b>
        </div>
        ${girly ? '<div class="vfx-hearts">💖✨💗✨💖</div>' : ''}`;
    }
    if (style === 'banner') {
      const label = word === 'HIT!' || word === 'ضربة!' ? (girly ? 'YAY!' : 'YES!') : word;
      return `
        <div class="vfx-flash soft${girly ? ' pink' : ''}"></div>
        <div class="vfx-speed${girly ? ' pink' : ''}"></div>
        <div class="vfx-banner${girly ? ' pink' : ''}"><span>${label}</span></div>`;
    }
    if (style === 'aura') {
      return `
        <div class="vfx-flash soft${girly ? ' pink' : ''}"></div>
        <div class="vfx-aura${girly ? ' pink' : ''}">
          <span class="ring"></span><span class="ring d2"></span><span class="ring d3"></span>
          <span class="bolt"></span>
        </div>
        <div class="vfx-banner small${girly ? ' pink' : ''}"><span>${
          lang === 'ar' ? (girly ? 'لمعة!' : 'قوة!') : girly ? 'GLOW!' : 'POWER!'
        }</span></div>`;
    }
    return `
      <div class="vfx-flash soft${girly ? ' pink' : ''}"></div>
      <div class="vfx-pow${girly ? ' pink' : ''}">
        <span class="burst"></span>
        <b>${girly ? 'YAY' : 'POW'}</b>
      </div>
      <div class="vfx-bam${girly ? ' pink' : ''}">${girly ? '💖' : 'BAM!'}</div>
      <div class="vfx-stars">${girly ? '💖✨🌟💫💗' : '⭐✨🌟💫⭐'}</div>`;
  }

  function finaleMarkup(kind, lang, g) {
    const title = FINALE_TITLE[g][kind][lang] || FINALE_TITLE[g][kind].en;
    const girly = g === 'girl';
    const bits = girly
      ? '<div class="vfx-finale-bits">💖✨🎀🌟💗🦄💫🌸💖</div>'
      : '<div class="vfx-finale-bits">⭐✨🏆🌟💫🎉🔥⭐✨</div>';
    return `
      <div class="vfx-flash soft${girly ? ' pink' : ''}"></div>
      <div class="vfx-finale-rays${girly ? ' pink' : ''}"></div>
      <div class="vfx-finale-ring${girly ? ' pink' : ''}"></div>
      <div class="vfx-finale-ring delay${girly ? ' pink' : ''}"></div>
      <div class="vfx-finale-title${girly ? ' pink' : ''}"><span>${title}</span></div>
      ${bits}
      <div class="vfx-finale-burst${girly ? ' pink' : ''}"></div>`;
  }

  function burst(opts = {}) {
    const host = ensureHost();
    clearTimeout(hideTimer);
    host.className = 'vfx-host';
    host.innerHTML = '';
    void host.offsetWidth;

    const g = gender();
    const lang = opts.lang === 'ar' ? 'ar' : 'en';
    const style = pickStyle(opts.style || styleForGame(opts.game));
    const words = BANNER[g][lang];
    const word = words[Math.floor(Math.random() * words.length)];
    const scene = scenes()[style];

    host.style.setProperty('--vx', '50%');
    host.style.setProperty('--vy', '45%');
    host.classList.add('on', `mode-${style}`, `gender-${g}`);

    host.innerHTML = `
      <div class="vfx-scene-wrap">
        <img class="vfx-scene" src="${scene}" alt="" draggable="false">
      </div>
      <div class="vfx-scene-shade" aria-hidden="true"></div>
      <div class="vfx-fx" data-style="${style}">${fxMarkup(style, lang, word, g)}</div>`;

    if (window.Confetti) {
      const cx = opts.x != null ? opts.x : innerWidth / 2;
      const cy = opts.y != null ? opts.y : innerHeight * 0.45;
      Confetti.burst(style === 'pow' ? 70 : 50, cx, cy);
    }

    hideTimer = setTimeout(() => {
      host.classList.add('leaving');
      setTimeout(() => {
        host.classList.remove('on', 'leaving');
        host.innerHTML = '';
      }, 380);
    }, DURATION);
  }

  /** Big end-of-level celebration — 5 styles × boy/girl. */
  function finale(opts = {}) {
    const host = ensureHost();
    clearTimeout(hideTimer);
    host.className = 'vfx-host';
    host.innerHTML = '';
    void host.offsetWidth;

    const g = gender();
    const lang = opts.lang === 'ar' ? 'ar' : 'en';
    const kind = pickFinale(opts.style);
    const scene = `img/vfx-ideas/finale/${g}-${kind}.jpg`;

    host.style.setProperty('--vx', '50%');
    host.style.setProperty('--vy', '42%');
    host.classList.add('on', 'mode-finale', `finale-${kind}`, `gender-${g}`);

    host.innerHTML = `
      <div class="vfx-scene-wrap">
        <img class="vfx-scene" src="${scene}" alt="" draggable="false">
      </div>
      <div class="vfx-scene-shade finale" aria-hidden="true"></div>
      <div class="vfx-fx finale">${finaleMarkup(kind, lang, g)}</div>`;

    if (window.Sounds && Sounds.cheer) Sounds.cheer(g);
    else if (window.Sounds && Sounds.fanfare) Sounds.fanfare();

    if (window.Confetti) {
      Confetti.celebrate();
      setTimeout(() => Confetti.burst(90, innerWidth / 2, innerHeight * 0.35), 500);
      setTimeout(() => Confetti.burst(70, innerWidth * 0.3, innerHeight * 0.5), 1100);
      setTimeout(() => Confetti.burst(70, innerWidth * 0.7, innerHeight * 0.5), 1600);
    }

    hideTimer = setTimeout(() => {
      host.classList.add('leaving');
      setTimeout(() => {
        host.classList.remove('on', 'leaving');
        host.innerHTML = '';
      }, 450);
    }, FINALE_DURATION);
  }

  return {
    burst,
    finale,
    styleForGame,
    STYLES,
    FINALES,
    SCENES: SCENES_BOY,
    SCENES_GIRL,
    duration: DURATION,
    finaleDuration: FINALE_DURATION,
  };
})();
