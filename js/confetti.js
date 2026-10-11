window.Confetti = (function () {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  const colors = ['#FF5E7E', '#FFC93C', '#3EC1D3', '#7B61FF', '#2ECC71', '#FF8A3D'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let parts = [];
  let running = false;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('resize', resize);
  resize();

  function burst(count = 80, x = innerWidth / 2, y = innerHeight * 0.6) {
    if (reduceMotion.matches) return;
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
      const speed = 6 + Math.random() * 8;
      parts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 7 + Math.random() * 7,
        color: colors[i % colors.length],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 0,
      });
    }
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.25;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    parts = parts.filter((p) => p.y < innerHeight + 40 && p.life < 240);
    if (parts.length) {
      requestAnimationFrame(tick);
    } else {
      running = false;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }

  function celebrate() {
    burst(120, innerWidth * 0.25, innerHeight * 0.75);
    setTimeout(() => burst(120, innerWidth * 0.75, innerHeight * 0.75), 250);
  }

  return { burst, celebrate };
})();
