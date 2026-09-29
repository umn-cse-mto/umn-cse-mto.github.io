// Ring-road traffic wave demo (illustrative). Human drivers: optimal-velocity follow-the-leader (OV-FTL)
// with noise; automated vehicles: track a running mean of their own speed, capped by the safe speed.
// Parameters tuned so 22 humans on a 230 m ring form stop-and-go waves and one AV damps them.
(() => {
  const root = document.querySelector('.demo');
  if (!root) return;
  const cv = root.querySelector('canvas'), ctx = cv.getContext('2d');
  const slider = root.querySelector('input[type=range]'), out = root.querySelector('output');
  const play = root.querySelector('.play'), statVar = root.querySelector('[data-stat=var]'), statMin = root.querySelector('[data-stat=min]');
  const N = 22, L = 230, LEN = 4.5, DT = 0.05, ALPHA = 0.6, BETA = 2, NOISE = 0.3, VM = 9.72, HC = 6, W = 8, TW = 40, K = 0.4;
  const V = h => VM * (Math.tanh((h - HC) / W) + Math.tanh(HC / W)) / (1 + Math.tanh(HC / W));
  const randn = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  let x, v, U, av, running = false, visible = true, sdEma = null, minEma = null;

  const reset = () => {
    x = Array.from({ length: N }, (_, i) => (i * L / N + randn() * 0.2 + L) % L);
    v = Array(N).fill(V(L / N - LEN)); U = v.slice(); setAV();
  };
  const setAV = () => {
    const n = +slider.value; out.textContent = n;
    av = Array(N).fill(false);
    const mean = v.reduce((p, q) => p + q, 0) / N;   // start the AV at the average traffic speed
    for (let i = 0; i < n; i++) { const j = Math.floor(i * N / n); av[j] = true; U[j] = mean; }
  };
  const step = () => {
    const a = Array(N);
    for (let i = 0; i < N; i++) {
      const ld = (i + 1) % N, h = Math.max(((x[ld] - x[i]) % L + L) % L - LEN, 0.01), dv = v[ld] - v[i];
      if (av[i]) {
        U[i] += DT / TW * (v[i] - U[i]);
        a[i] = Math.min(Math.max(K * (Math.min(U[i], V(h)) - v[i]) + BETA * Math.min(dv, 0) / (h * h), -3), 1.5);
      } else a[i] = ALPHA * (V(h) - v[i]) + BETA * dv / (h * h) + NOISE * randn();
      if (h < 1) a[i] = -6;
    }
    for (let i = 0; i < N; i++) { v[i] = Math.max(0, v[i] + a[i] * DT); x[i] = (x[i] + v[i] * DT) % L; }
  };
  const draw = () => {
    const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
    const w = cv.width, hgt = cv.height, R = Math.min(w, hgt) * 0.4, cx = w / 2, cy = hgt / 2;
    ctx.clearRect(0, 0, w, hgt);
    ctx.lineWidth = R * 0.16; ctx.strokeStyle = getComputedStyle(root).getPropertyValue('--road'); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
    for (let i = 0; i < N; i++) {
      const th = x[i] / L * 2 * Math.PI, s = Math.min(v[i] / 6, 1);
      ctx.save(); ctx.translate(cx + R * Math.cos(th), cy + R * Math.sin(th)); ctx.rotate(th + Math.PI / 2);
      ctx.fillStyle = av[i] ? '#ffcc33' : `hsl(345, ${Math.round(100 - 70 * s)}%, ${Math.round(25 + 45 * s)}%)`;
      ctx.fillRect(-R * 0.1, -R * 0.05, R * 0.2, R * 0.1);
      if (av[i]) { ctx.strokeStyle = '#260b14'; ctx.lineWidth = Math.max(1, R * 0.012); ctx.strokeRect(-R * 0.1, -R * 0.05, R * 0.2, R * 0.1); }
      ctx.restore();
    }
    const mean = v.reduce((p, q) => p + q, 0) / N, sd = Math.sqrt(v.reduce((p, q) => p + (q - mean) ** 2, 0) / N);
    sdEma = sdEma === null ? sd : sdEma + 0.02 * (sd - sdEma); minEma = minEma === null ? Math.min(...v) : minEma + 0.02 * (Math.min(...v) - minEma);
    statVar.textContent = (sdEma * 2.237).toFixed(1) + ' mph'; statMin.textContent = (minEma * 2.237).toFixed(1) + ' mph';
  };
  const loop = () => { if (running && visible) { for (let k = 0; k < 8; k++) step(); draw(); } requestAnimationFrame(loop); };
  const setRunning = on => { running = on; play.textContent = on ? 'Pause' : 'Play'; play.setAttribute('aria-pressed', String(on)); };

  slider.addEventListener('input', setAV);
  play.addEventListener('click', () => setRunning(!running));
  root.querySelector('.restart').addEventListener('click', () => { reset(); sdEma = minEma = null; draw(); });
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(cv);
  reset(); for (let k = 0; k < 4000; k++) step();   // warm up so waves are already visible
  draw(); setRunning(!matchMedia('(prefers-reduced-motion: reduce)').matches); loop();
})();
