// Flashy fighting-game style win FX for correct answers. Mixes 4 styles so kids don't see the same burst every time.
window.Vfx = (function () {
  const STYLES = ['spark', 'banner', 'aura', 'pow'];
  const BANNER = {
    ar: ['يَس!', 'ممتاز!', 'ضربة!', 'برافو!'],
    en: ['YES!', 'NICE!', 'HIT!', 'BRAVO!'],
  };
  let seq = 0;
  let hideTimer = null;

  function ensureHost() {
    let host = document.getElementById('vfxHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'vfxHost';
      host.setAttribute('aria-hidden', 'true');
      document.body.appendChild(host);
    }
    return host;
  }

  function pickStyle(hint) {
    if (hint && STYLES.includes(hint)) return hint;
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
      choice: 'banner',
    };
    return map[gameId] || null;
  }

  function burst(opts = {}) {
    const host = ensureHost();
    clearTimeout(hideTimer);
    host.className = 'vfx-host';
    host.innerHTML = '';
    // Force a reflow so CSS animations always restart.
    void host.offsetWidth;

    const lang = opts.lang === 'ar' ? 'ar' : 'en';
    const style = pickStyle(opts.style || styleForGame(opts.game));
    const x = opts.x != null ? opts.x : innerWidth / 2;
    const y = opts.y != null ? opts.y : innerHeight * 0.48;
    const word = BANNER[lang][Math.floor(Math.random() * BANNER[lang].length)];

    host.style.setProperty('--vx', `${Math.round(x)}px`);
    host.style.setProperty('--vy', `${Math.round(y)}px`);
    // Use mode-* on the host — never reuse .vfx-banner/.vfx-spark/etc (those animate to opacity 0).
    host.classList.add('on', `mode-${style}`);

    if (style === 'spark') {
      host.innerHTML = `
        <div class="vfx-flash"></div>
        <div class="vfx-tint"></div>
        <div class="vfx-spark">
          <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
          <b class="vfx-plus">+1</b>
        </div>
        <div class="vfx-lines"></div>`;
    } else if (style === 'banner') {
      host.innerHTML = `
        <div class="vfx-flash soft"></div>
        <div class="vfx-tint hot"></div>
        <div class="vfx-speed"></div>
        <div class="vfx-banner"><span>${word}</span></div>`;
    } else if (style === 'aura') {
      host.innerHTML = `
        <div class="vfx-flash soft"></div>
        <div class="vfx-tint cool"></div>
        <div class="vfx-aura">
          <span class="ring"></span><span class="ring d2"></span><span class="ring d3"></span>
          <span class="bolt"></span>
        </div>
        <div class="vfx-banner small"><span>${word}</span></div>`;
    } else {
      host.innerHTML = `
        <div class="vfx-flash soft"></div>
        <div class="vfx-tint hot"></div>
        <div class="vfx-pow">
          <span class="burst"></span>
          <b>POW</b>
        </div>
        <div class="vfx-stars">⭐✨🌟💫⭐</div>`;
    }

    if (window.Confetti) Confetti.burst(style === 'pow' ? 70 : 50, x, y);
    if (window.Sounds && Sounds.correct) {
      // already played by caller — leave alone
    }

    // Keep overlay up long enough for kids to actually see it (~2s hold).
    const ms = 2200;
    hideTimer = setTimeout(() => {
      host.classList.remove('on');
      setTimeout(() => {
        if (!host.classList.contains('on')) host.innerHTML = '';
      }, 250);
    }, ms);
  }

  return { burst, styleForGame, STYLES, duration: 2200 };
})();
