window.UI = (function () {
  const $app = document.getElementById('app');
  let $sheet = null;

  // Bottom panel for hints after a wrong answer, so the "next" button is always on screen.
  function sheet(html, buttonLabel, onNext) {
    closeSheet();
    $sheet = document.createElement('div');
    $sheet.className = 'sheet-backdrop';
    $sheet.innerHTML = `<div class="sheet" role="dialog">
        <div class="sheet-body">${html}</div>
        <button class="big-btn" type="button">${buttonLabel}</button>
      </div>`;
    document.body.appendChild($sheet);
    $sheet.querySelector('.big-btn').addEventListener('click', () => {
      Sounds.tap();
      closeSheet();
      onNext();
    });
    watchScroll($sheet.querySelector('.sheet-body'));
  }

  function closeSheet() {
    if ($sheet) $sheet.remove();
    $sheet = null;
  }

  function top() {
    $app.scrollTop = 0;
  }

  // Animated "scroll down" arrow, shown only when a scroll area really has hidden content below.
  function watchScroll(el) {
    const arrow = document.createElement('button');
    arrow.type = 'button';
    arrow.className = 'scroll-hint';
    arrow.setAttribute('aria-label', '⬇');
    arrow.innerHTML = '<span>⬇</span>';
    (el === $app ? document.body : el.parentElement).appendChild(arrow);

    const update = () => {
      const hidden = el.scrollHeight - el.clientHeight - el.scrollTop;
      arrow.classList.toggle('show', hidden > 24);
    };
    arrow.addEventListener('click', () => el.scrollBy({ top: el.clientHeight * 0.7, behavior: 'smooth' }));
    el.addEventListener('scroll', update, { passive: true });
    el.addEventListener('load', update, true);
    new ResizeObserver(update).observe(el);
    new MutationObserver(() => requestAnimationFrame(update)).observe(el, { childList: true, subtree: true });
    addEventListener('resize', update);
    setTimeout(update, 600);
    update();
  }

  watchScroll($app);

  return { sheet, closeSheet, top };
})();
