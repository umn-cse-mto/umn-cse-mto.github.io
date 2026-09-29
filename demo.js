// Ring-road traffic wave demo (illustrative): two rings side by side from the same jammed start and the
// same random driver noise; the right ring swaps 1-3 human drivers for automated vehicles (AVs).
// Humans: optimal-velocity follow-the-leader (OV-FTL) with noise. AVs: track a running mean of their own
// speed, capped by the safe speed. Tuned so 22 humans on a 230 m ring form stop-and-go waves.
(() => {
  const root = document.querySelector('.demo');
  if (!root) return;
  const N = 22, L = 230, LEN = 4.5, DT = 0.05, ALPHA = 0.6, BETA = 2, NOISE = 0.3, VM = 9.72, HC = 6, W = 8, TW = 40, K = 0.4;
  const MPH = 2.237, WINDOW = 240, SAMPLE = 0.5, PER = Math.round(SAMPLE / DT);   // chart: last 240 s, one point per 0.5 s
  const V = h => VM * (Math.tanh((h - HC) / W) + Math.tanh(HC / W)) / (1 + Math.tanh(HC / W));
  const rng = seed => () => {   // mulberry32: same seed -> same noise stream in both rings
    seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const gauss = r => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  const mean = a => a.reduce((p, q) => p + q, 0) / a.length;
  const sd = g => { const m = mean(g.v); return Math.sqrt(mean(g.v.map(q => (q - m) ** 2))); };

  const makeRing = (x, v, nAV, seed) => {
    const g = { x: x.slice(), v: v.slice(), U: Array(N).fill(mean(v)), av: Array(N).fill(false), r: rng(seed), hist: [], k: 0 };
    for (let i = 0; i < nAV; i++) g.av[Math.floor(i * N / nAV)] = true;
    return g;
  };
  const step = g => {
    const a = Array(N);
    for (let i = 0; i < N; i++) {
      const noise = gauss(g.r);   // drawn for every car, so both rings consume the same stream
      const ld = (i + 1) % N, h = Math.max(((g.x[ld] - g.x[i]) % L + L) % L - LEN, 0.01), dv = g.v[ld] - g.v[i];
      if (g.av[i]) {
        g.U[i] += DT / TW * (g.v[i] - g.U[i]);
        a[i] = Math.min(Math.max(K * (Math.min(g.U[i], V(h)) - g.v[i]) + BETA * Math.min(dv, 0) / (h * h), -3), 1.5);
      } else a[i] = ALPHA * (V(h) - g.v[i]) + BETA * dv / (h * h) + NOISE * noise;
      if (h < 1) a[i] = -6;
    }
    for (let i = 0; i < N; i++) { g.v[i] = Math.max(0, g.v[i] + a[i] * DT); g.x[i] = (g.x[i] + g.v[i] * DT) % L; }
    if (++g.k % PER === 0) g.hist.push(sd(g) * MPH);
  };

  // Shared warm-up: humans only, until stop-and-go waves have formed
  const warm = makeRing(Array.from({ length: N }, (_, i) => i * L / N + (i ? 0 : 1)), Array(N).fill(V(L / N - LEN)), 0, 7);
  for (let k = 0; k < 4000; k++) step(warm);

  const slider = root.querySelector('input[type=range]'), out = root.querySelector('output'), play = root.querySelector('.play');
  const canvases = [...root.querySelectorAll('canvas[data-ring]')], chart = root.querySelector('canvas.chart'), stats = [...root.querySelectorAll('[data-stat]')];
  let rings, running = false, visible = true;
  const restart = () => { out.textContent = slider.value; rings = [makeRing(warm.x, warm.v, 0, 42), makeRing(warm.x, warm.v, +slider.value, 42)]; };

  const fit = c => {
    const r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    if (c.width !== Math.round(r.width * d)) { c.width = Math.round(r.width * d); c.height = Math.round(r.height * d); }
    return c.getContext('2d');
  };
  const drawRing = (c, g) => {
    const ctx = fit(c), w = c.width, h = c.height, R = Math.min(w, h) * 0.4;
    ctx.clearRect(0, 0, w, h); ctx.lineWidth = R * 0.16; ctx.strokeStyle = '#4a2a35';
    ctx.beginPath(); ctx.arc(w / 2, h / 2, R, 0, 2 * Math.PI); ctx.stroke();
    for (let i = 0; i < N; i++) {
      const th = g.x[i] / L * 2 * Math.PI, s = Math.min(g.v[i] / 6, 1);
      ctx.save(); ctx.translate(w / 2 + R * Math.cos(th), h / 2 + R * Math.sin(th)); ctx.rotate(th + Math.PI / 2);
      ctx.fillStyle = g.av[i] ? '#ffcc33' : `hsl(345, ${Math.round(100 - 70 * s)}%, ${Math.round(28 + 50 * s)}%)`;
      ctx.fillRect(-R * 0.1, -R * 0.05, R * 0.2, R * 0.1); ctx.restore();
    }
  };
  const drawChart = () => {
    const ctx = fit(chart), w = chart.width, h = chart.height, d = window.devicePixelRatio || 1;
    const left = 26 * d, top = 8 * d, bot = h - 22 * d, ymax = 12, n = WINDOW / SAMPLE;
    ctx.clearRect(0, 0, w, h); ctx.font = `${11 * d}px Arial`; ctx.fillStyle = '#cdb8bf'; ctx.strokeStyle = '#4a2a35'; ctx.lineWidth = d;
    for (const yv of [0, 6, 12]) { const y = bot - (bot - top) * yv / ymax; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(w, y); ctx.stroke(); ctx.fillText(yv, 2 * d, y + 4 * d); }
    ctx.fillText('Speed variation (mph), last 4 minutes', left, h - 5 * d);
    rings.forEach((g, k) => {
      const pts = g.hist.slice(-n);
      ctx.strokeStyle = k ? '#ffcc33' : '#b98a98'; ctx.lineWidth = 2 * d; ctx.beginPath();
      pts.forEach((y, i) => { const X = left + (w - left) * i / n, Y = bot - (bot - top) * Math.min(y, ymax) / ymax; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
      ctx.stroke();
    });
  };
  const draw = () => {
    canvases.forEach((c, k) => drawRing(c, rings[k])); drawChart();
    rings.forEach((g, k) => { const hs = g.hist.slice(-20); stats[k].textContent = (hs.length ? mean(hs) : sd(g) * MPH).toFixed(1) + ' mph'; });
  };
  const loop = () => { if (running && visible) { for (let k = 0; k < 8; k++) rings.forEach(step); draw(); } requestAnimationFrame(loop); };
  const setRunning = on => { running = on; play.textContent = on ? 'Pause' : 'Play'; play.setAttribute('aria-pressed', String(on)); };

  slider.addEventListener('input', () => { restart(); draw(); });
  play.addEventListener('click', () => setRunning(!running));
  root.querySelector('.restart').addEventListener('click', () => { restart(); draw(); });
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(root);
  restart(); draw(); setRunning(!matchMedia('(prefers-reduced-motion: reduce)').matches); loop();
})();
