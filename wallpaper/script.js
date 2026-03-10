const skyCanvas = document.getElementById("skyCanvas");
const skyCtx = skyCanvas.getContext("2d", { alpha: true });

const fxCanvas = document.getElementById("fxCanvas");
const fxCtx = fxCanvas.getContext("2d", { alpha: true });

const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

let W = 0;
let H = 0;
let isPortrait = false;

let stars = [];
let fireflies = [];
let smoke = [];
let leaves = [];

let lampX = 0;
let lampY = 0;

/* cantidades adaptables */
let STAR_COUNT = 0;
let FIREFLY_COUNT = 0;
let SMOKE_COUNT = 0;
let LEAF_COUNT = 0;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function setResponsiveConfig() {
  isPortrait = H > W;

  if (isPortrait) {
    STAR_COUNT = 24;
    FIREFLY_COUNT = 6;
    SMOKE_COUNT = 5;
    LEAF_COUNT = 6;

    lampX = W * 0.268;
    lampY = H * 0.498;
  } else if (W <= 1024) {
    STAR_COUNT = 34;
    FIREFLY_COUNT = 7;
    SMOKE_COUNT = 6;
    LEAF_COUNT = 7;

    lampX = W * 0.259;
    lampY = H * 0.489;
  } else {
    STAR_COUNT = 42;
    FIREFLY_COUNT = 8;
    SMOKE_COUNT = 7;
    LEAF_COUNT = 8;

    lampX = W * 0.257;
    lampY = H * 0.486;
  }
}

function resizeCanvas() {
  W = window.innerWidth;
  H = window.innerHeight;

  setResponsiveConfig();

  skyCanvas.width = Math.floor(W * DPR);
  skyCanvas.height = Math.floor(H * DPR);
  fxCanvas.width = Math.floor(W * DPR);
  fxCanvas.height = Math.floor(H * DPR);

  skyCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  fxCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

/* ===== ESTRELLAS EN ZONA DEL CIELO ===== */
function createStars() {
  stars = [];
  const maxTries = STAR_COUNT * 20;
  let tries = 0;

  while (stars.length < STAR_COUNT && tries < maxTries) {
    tries++;

    let x, y;

    if (isPortrait) {
      x = rand(W * 0.08, W * 0.88);
      y = rand(H * 0.03, H * 0.18);
    } else {
      x = rand(W * 0.08, W * 0.72);
      y = rand(H * 0.02, H * 0.22);
    }

    const blockedLeftTrees = x < W * 0.18 && y > H * 0.1;
    const blockedCenterTrees = x > W * 0.32 && x < W * 0.48 && y > H * 0.16;
    const blockedRightTrees = x > W * 0.58 && y > H * 0.14;

    if (
      !isPortrait &&
      (blockedLeftTrees || blockedCenterTrees || blockedRightTrees)
    ) {
      continue;
    }

    stars.push({
      x,
      y,
      size: Math.random() < 0.55 ? 2 : 3,
      alpha: rand(0.35, 0.95),
      speed: rand(0.006, 0.018),
      dir: Math.random() < 0.5 ? -1 : 1,
      sparkle: Math.random() < 0.18,
    });
  }
}

function drawStars() {
  skyCtx.clearRect(0, 0, W, H);

  for (const s of stars) {
    s.alpha += s.speed * s.dir;

    if (s.alpha <= 0.22) {
      s.alpha = 0.22;
      s.dir = 1;
    }
    if (s.alpha >= 1) {
      s.alpha = 1;
      s.dir = -1;
    }

    skyCtx.globalAlpha = s.alpha;
    skyCtx.fillStyle = "#ffffff";
    skyCtx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);

    if (s.sparkle && s.alpha > 0.78) {
      skyCtx.globalAlpha = s.alpha * 0.4;
      skyCtx.fillRect(Math.round(s.x) - 1, Math.round(s.y), s.size + 2, 1);
      skyCtx.fillRect(Math.round(s.x), Math.round(s.y) - 1, 1, s.size + 2);
    }
  }

  skyCtx.globalAlpha = 1;
}

/* ===== LEVE BRILLO DEL CIELO ===== */
function drawSkyGlow(time) {
  const skyHeight = isPortrait ? H * 0.2 : H * 0.24;
  const pulse = 0.025 + (Math.sin(time * 0.00045) + 1) * 0.02;

  skyCtx.globalAlpha = pulse;
  skyCtx.fillStyle = "#9fb7ff";
  skyCtx.fillRect(0, 0, W, skyHeight);
  skyCtx.globalAlpha = 1;
}

/* ===== LUCIÉRNAGAS ===== */
function createFireflies() {
  fireflies = Array.from({ length: FIREFLY_COUNT }, () => ({
    baseX: lampX + rand(-70, 70),
    baseY: lampY + rand(-60, 60),
    angle: rand(0, Math.PI * 2),
    radiusX: rand(10, 24),
    radiusY: rand(8, 18),
    speed: rand(0.004, 0.012),
    size: rand(2, 3.5),
    alpha: rand(0.35, 0.92),
    pulse: rand(0.012, 0.028),
    pulseDir: Math.random() < 0.5 ? -1 : 1,
  }));
}

function drawFireflies() {
  for (const f of fireflies) {
    f.angle += f.speed;
    f.alpha += f.pulse * f.pulseDir;

    if (f.alpha < 0.22) {
      f.alpha = 0.22;
      f.pulseDir = 1;
    }
    if (f.alpha > 0.98) {
      f.alpha = 0.98;
      f.pulseDir = -1;
    }

    const x = f.baseX + Math.cos(f.angle) * f.radiusX;
    const y = f.baseY + Math.sin(f.angle * 1.25) * f.radiusY;

    fxCtx.globalAlpha = f.alpha;
    fxCtx.fillStyle = "#ffd96e";
    fxCtx.fillRect(Math.round(x), Math.round(y), f.size, f.size);

    fxCtx.globalAlpha = f.alpha * 0.22;
    fxCtx.fillStyle = "#ffd96e";
    fxCtx.fillRect(
      Math.round(x - 2),
      Math.round(y - 2),
      f.size + 4,
      f.size + 4,
    );
  }

  fxCtx.globalAlpha = 1;
}

/* ===== HUMO ===== */
function createSmoke() {
  smoke = Array.from({ length: SMOKE_COUNT }, (_, i) => ({
    x: lampX + rand(-6, 6),
    y: lampY - rand(18, 28) - i * 6,
    size: rand(12, 20),
    alpha: rand(0.07, 0.15),
    vx: rand(-0.1, 0.1),
    vy: rand(-0.22, -0.11),
    life: rand(130, 250),
    maxLife: 250,
  }));
}

function resetSmokeParticle(p) {
  p.x = lampX + rand(-6, 6);
  p.y = lampY - rand(18, 28);
  p.size = rand(12, 20);
  p.alpha = rand(0.07, 0.15);
  p.vx = rand(-0.1, 0.1);
  p.vy = rand(-0.22, -0.11);
  p.life = rand(130, 250);
  p.maxLife = 250;
}

function drawSmoke() {
  for (const p of smoke) {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
    p.size += 0.025;

    if (p.life <= 0 || p.y < lampY - 120) {
      resetSmokeParticle(p);
    }

    const a = (p.life / p.maxLife) * p.alpha;

    fxCtx.globalAlpha = a;
    fxCtx.fillStyle = "#d7cfc5";
    fxCtx.fillRect(
      Math.round(p.x),
      Math.round(p.y),
      Math.round(p.size),
      Math.round(p.size * 0.55),
    );
  }

  fxCtx.globalAlpha = 1;
}

/* ===== HOJAS DESDE LOS ÁRBOLES ===== */
function createLeaves() {
  leaves = Array.from({ length: LEAF_COUNT }, () => {
    const side = Math.random();
    let x, y;

    if (isPortrait) {
      if (side < 0.5) {
        x = rand(W * 0.0, W * 0.25);
        y = rand(H * 0.18, H * 0.38);
      } else {
        x = rand(W * 0.72, W * 1.0);
        y = rand(H * 0.15, H * 0.36);
      }
    } else {
      if (side < 0.38) {
        x = rand(W * 0.0, W * 0.22);
        y = rand(H * 0.18, H * 0.42);
      } else if (side < 0.76) {
        x = rand(W * 0.72, W * 1.0);
        y = rand(H * 0.16, H * 0.4);
      } else {
        x = rand(W * 0.18, W * 0.78);
        y = rand(H * 0.2, H * 0.32);
      }
    }

    return {
      x,
      y,
      vx: rand(-0.15, 0.18),
      vy: rand(0.18, 0.38),
      drift: rand(0.003, 0.009),
      driftOffset: rand(0, Math.PI * 2),
      rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.012, 0.012),
      size: rand(0.9, 1.35),
    };
  });
}

function resetLeaf(leaf) {
  const side = Math.random();

  if (isPortrait) {
    if (side < 0.5) {
      leaf.x = rand(W * 0.0, W * 0.25);
      leaf.y = rand(H * 0.18, H * 0.38);
    } else {
      leaf.x = rand(W * 0.72, W * 1.0);
      leaf.y = rand(H * 0.15, H * 0.36);
    }
  } else {
    if (side < 0.38) {
      leaf.x = rand(W * 0.0, W * 0.22);
      leaf.y = rand(H * 0.18, H * 0.42);
    } else if (side < 0.76) {
      leaf.x = rand(W * 0.72, W * 1.0);
      leaf.y = rand(H * 0.16, H * 0.4);
    } else {
      leaf.x = rand(W * 0.18, W * 0.78);
      leaf.y = rand(H * 0.2, H * 0.32);
    }
  }

  leaf.vx = rand(-0.15, 0.18);
  leaf.vy = rand(0.18, 0.38);
  leaf.drift = rand(0.003, 0.009);
  leaf.driftOffset = rand(0, Math.PI * 2);
  leaf.rotation = rand(0, Math.PI * 2);
  leaf.rotationSpeed = rand(-0.012, 0.012);
  leaf.size = rand(0.9, 1.35);
}

function drawPixelLeaf(ctx, x, y, scale, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  const dark = "#7a1e10";
  const mid = "#c94d16";
  const light = "#ff9a2f";

  const pixels = [
    { x: 0, y: 0, c: dark },
    { x: 1, y: 0, c: mid },
    { x: 2, y: 0, c: dark },
    { x: -1, y: 1, c: dark },
    { x: 0, y: 1, c: mid },
    { x: 1, y: 1, c: light },
    { x: 2, y: 1, c: mid },
    { x: 3, y: 1, c: dark },
    { x: -2, y: 2, c: dark },
    { x: -1, y: 2, c: mid },
    { x: 0, y: 2, c: light },
    { x: 1, y: 2, c: mid },
    { x: 2, y: 2, c: light },
    { x: 3, y: 2, c: mid },
    { x: -1, y: 3, c: dark },
    { x: 0, y: 3, c: mid },
    { x: 1, y: 3, c: light },
    { x: 2, y: 3, c: mid },
    { x: 0, y: 4, c: dark },
    { x: 1, y: 4, c: mid },
    { x: 0, y: 5, c: dark },
  ];

  for (const p of pixels) {
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x * 2, p.y * 2, 2, 2);
  }

  ctx.restore();
}

function drawLeaves(time) {
  for (const leaf of leaves) {
    leaf.y += leaf.vy;
    leaf.x += leaf.vx + Math.sin(time * leaf.drift + leaf.driftOffset) * 0.28;
    leaf.rotation += leaf.rotationSpeed;

    if (leaf.y > H + 35 || leaf.x < -40 || leaf.x > W + 40) {
      resetLeaf(leaf);
    }

    drawPixelLeaf(fxCtx, leaf.x, leaf.y, leaf.size, leaf.rotation);
  }
}

function animate(time) {
  drawStars();
  drawSkyGlow(time);

  fxCtx.clearRect(0, 0, W, H);

  drawSmoke();
  drawFireflies();
  drawLeaves(time);

  requestAnimationFrame(animate);
}

function rebuildScene() {
  resizeCanvas();
  createStars();
  createFireflies();
  createSmoke();
  createLeaves();
}

window.addEventListener("resize", rebuildScene);
window.addEventListener("orientationchange", () => {
  setTimeout(rebuildScene, 200);
});

rebuildScene();
requestAnimationFrame(animate);
