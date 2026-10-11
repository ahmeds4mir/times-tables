window.Voice = (function () {
  let audio = null;
  let current = null;

  function stop() {
    if (audio) {
      audio.pause();
      audio = null;
    }
    current = null;
    document.querySelectorAll('.listen-btn.playing').forEach((b) => b.classList.remove('playing'));
  }

  function play(key, lang, force) {
    stop();
    if (!Sounds.enabled && !force) return;
    current = key;
    audio = new Audio(`audio/${lang}/${key}.mp3`);
    const mark = (on) =>
      document.querySelectorAll(`.listen-btn[data-voice="${key}"]`).forEach((b) => b.classList.toggle('playing', on));
    audio.addEventListener('playing', () => mark(true));
    audio.addEventListener('ended', () => {
      mark(false);
      audio = null;
      current = null;
    });
    audio.play().catch(() => mark(false));
  }

  // Speech bubble text plus a replay button, for the hint shown when a chapter opens.
  function bubble(key, lang) {
    const intro = INTROS[key][lang];
    return `${intro.text} <button class="listen-btn" type="button" data-voice="${key}" aria-label="🔊">🔊</button>`;
  }

  function wire(root, lang) {
    root.querySelectorAll('.listen-btn').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (current === btn.dataset.voice) stop();
        else play(btn.dataset.voice, lang, true);
      })
    );
  }

  return { play, stop, bubble, wire };
})();
