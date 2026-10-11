window.Sounds = (function () {
  let ctx = null;
  let enabled = localStorage.getItem('mt.sound') !== 'off';

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type = 'triangle', vol = 0.25) {
    const c = audio();
    if (!c) return;
    const t = c.currentTime + start;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function play(fn) {
    if (enabled) fn();
  }

  return {
    get enabled() {
      return enabled;
    },
    toggle() {
      enabled = !enabled;
      localStorage.setItem('mt.sound', enabled ? 'on' : 'off');
      if (!enabled && 'speechSynthesis' in window) speechSynthesis.cancel();
      return enabled;
    },
    tap() {
      play(() => tone(660, 0, 0.08, 'sine', 0.15));
    },
    correct() {
      play(() => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.08, 0.25)));
    },
    wrong() {
      play(() => {
        tone(392, 0, 0.18, 'sine', 0.18);
        tone(311.13, 0.16, 0.3, 'sine', 0.18);
      });
    },
    fanfare() {
      play(() => {
        const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
        const times = [0, 0.12, 0.24, 0.36, 0.54, 0.66];
        notes.forEach((f, i) => tone(f, times[i], i === notes.length - 1 ? 0.7 : 0.2, 'square', 0.1));
      });
    },
  };
})();
