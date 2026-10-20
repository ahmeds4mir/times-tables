// Flashy fighting-game style win FX for correct answers. Mixes 4 styles so kids don't see the same burst every time.
window.Vfx = (function () {
  const STYLES = ['spark', 'banner', 'aura', 'pow'];
  const BANNER = {
    ar: ['يَس!', 'ممتاز!', 'ضربة!', 'برافو!'],
    en: ['YES!', 'NICE!', 'HIT!', 'BRAVO!'],
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let seq = 0;
  let hideTimer = null;

  function ensureHost() {
    let host = document.getElementById('vfxHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'vfxHost';
      host.className = 'vfx-host';
      host.setAttribute('aria-hidden', 'true');
      document.body.appendChild(host);
    }
    return host;
  }

  function pickStyle(hint) {
    if (hint && STYLES.includes(hint)) return hint;
    // Rotate + slight randomness so consecutive wins feel mixed.
    seq = (seq + 1) % STYLES.length;
    return Math.random() < 0.35 ? STYLES[Math.floor(Math.random() * STYLES.length)] : STYLES[seq];
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
      choice: null,
    };
    return map[gameId] || null;
  }

  function burst(opts = {}) {
    if (reduceMotion.matches) {
      if (window.Confetti) Confetti.burst(30, opts.x ?? innerWidth / 2, opts.y ?? innerHeight * 0.55);
      return;
    }
    const host = ensureHost();
    clearTimeout(hideTimer);
    host.className = 'vfx-host';
    host.innerHTML = '';

    const lang = opts.lang === 'ar' ? 'ar' : 'en';
    const style = pickStyle(opts.style || styleForGame(opts.game));
    const x = opts.x != null ? opts.x : innerWidth / 2;
    const y = opts.y != null ? opts.y : innerHeight * 0.5;
    const words = BANNER[lang];
    const word = words[Math.floor(Math.random() * words.length)];

    host.classList.add('on', `vfx-${style}`);
    host.style.setProperty('--vx', `${x}px`);
    host.style.setProperty('--vy', `${y}px`);

    if (style === 'spark') {
      host.innerHTML = `
        <div class="vfx-flash"></div>
        <div class="vfx-spark" style="left:var(--vx);top:var(--vy)">
          <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
          <b class="vfx-plus">+1</b>
        </div>
        <div class="vfx-lines"></div>`;
    } else if (style === 'banner') {
      host.innerHTML = `
        <div class="vfx-flash soft"></div>
        <div class="vfx-speed"></div>
        <div class="vfx-banner"><span>${word}</span></div>`;
    } else if (style === 'aura') {
      host.innerHTML = `
        <div class="vfx-aura" style="left:var(--vx);top:var(--vy)">
          <span class="ring"></span><span class="ring d2"></span><span class="ring d3"></span>
          <span class="bolt"></span>
        </div>`;
    } else {
      host.innerHTML = `
        <div class="vfx-flash soft"></div>
        <div class="vfx-pow" style="left:var(--vx);top:var(--vy)">
          <span class="burst"></span>
          <b>POW</b>
        </div>
        <div class="vfx-stars">⭐✨🌟💫</div>`;
    }

    // Keep a light confetti sprinkle with every style.
    if (window.Confetti) Confetti.burst(style === 'pow' ? 55 : 36, x, y);

    hideTimer = setTimeout(() => {
      host.classList.remove('on');
      host.innerHTML = '';
    }, style === 'banner' ? 700 : 560);
  }

  return { burst, styleForGame, STYLES };
})();
