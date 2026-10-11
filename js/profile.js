window.Profile = (function () {
  const KEY = 'mt.profile';
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem(KEY));
  } catch {}
  if (!data || !data.name || !['boy', 'girl'].includes(data.avatar)) data = null;

  const cache = new Map();

  function merge(base, extra) {
    const out = { ...base };
    for (const [k, v] of Object.entries(extra)) {
      const b = base[k];
      out[k] = b && v && typeof b === 'object' && typeof v === 'object' && !Array.isArray(v) ? merge(b, v) : v;
    }
    return out;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  return {
    get exists() {
      return !!data;
    },
    get name() {
      return data ? escapeHtml(data.name) : '';
    },
    get rawName() {
      return data ? data.name : '';
    },
    get avatar() {
      return data ? data.avatar : 'boy';
    },
    get isGirl() {
      return !!data && data.avatar === 'girl';
    },
    save(name, avatar) {
      data = { name: name.trim().slice(0, 20), avatar };
      localStorage.setItem(KEY, JSON.stringify(data));
    },
    avatarImg(mood) {
      return this.isGirl ? `img/girl/avatar-${mood}.jpg` : `img/avatar-${mood}.jpg`;
    },
    heroImg(pose) {
      return this.isGirl ? `img/girl/hero-${pose}.png` : `img/ch1/hero-${pose}.png`;
    },
    // Tables may define `${lang}F` with feminine overrides used when the girl avatar is chosen.
    strings(table, lang) {
      const fem = this.isGirl && table[`${lang}F`];
      if (!fem) return table[lang];
      if (!cache.has(table)) cache.set(table, {});
      const byLang = cache.get(table);
      if (!byLang[lang]) byLang[lang] = merge(table[lang], fem);
      return byLang[lang];
    },
  };
})();
