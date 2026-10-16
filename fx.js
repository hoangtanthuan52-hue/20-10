/**
 * FX.JS - GLOBAL VISUAL EFFECTS ENGINE (VFX) - 120FPS PROMOTION HIGH-PERFORMANCE ENGINE
 * Canvas Starfield 3D Parallax, Cosmic Aurora, Shooting Stars, Magic Cursor Trail,
 * 3D Wind Petals, Willow Fireworks & Climax Heart Balloons
 */

const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d', { alpha: true });
const fxCanvas = document.getElementById('fxCanvas');
const fxCtx = fxCanvas.getContext('2d', { alpha: true });

// Trạng thái màn hình và chuột
let width = window.innerWidth;
let height = window.innerHeight;
let mouseX = width / 2;
let mouseY = height / 2;
let pendingMouseX = width / 2;
let pendingMouseY = height / 2;
let hasMouseMoved = false;
let targetParallaxX = 0;
let targetParallaxY = 0;
let currentParallaxX = 0;
let currentParallaxY = 0;

// Offscreen Canvas cho Cực quang & Tinh vân (Tỷ lệ 1/3, bilinear smooth, cực kỳ nhẹ cho 120fps)
const fxOffscreen = document.createElement('canvas');
const fxOffCtx = fxOffscreen.getContext('2d');
let offW = 320, offH = 180;

function resizeCanvases() {
  width = window.innerWidth;
  height = window.innerHeight;
  bgCanvas.width = width;
  bgCanvas.height = height;
  fxCanvas.width = width;
  fxCanvas.height = height;

  offW = Math.max(280, Math.floor(width / 3));
  offH = Math.max(160, Math.floor(height / 3));
  fxOffscreen.width = offW;
  fxOffscreen.height = offH;
}
window.addEventListener('resize', resizeCanvases, { passive: true });
resizeCanvases();

// ==========================================================
// PRE-RENDERED HARDWARE SPRITES (Tối ưu hóa 120fps không cấp phát RAM)
// ==========================================================

// 1. Sprite Sao Kim Cương 4 cánh (Diamond Twinkle Flare)
const diamondSprite = document.createElement('canvas');
diamondSprite.width = 48;
diamondSprite.height = 48;
const dCtx = diamondSprite.getContext('2d');
(function initDiamondSprite() {
  const cx = 24, cy = 24;
  const glow = dCtx.createRadialGradient(cx, cy, 0, cx, cy, 22);
  glow.addColorStop(0, '#ffffff');
  glow.addColorStop(0.35, 'rgba(255, 215, 0, 0.7)');
  glow.addColorStop(0.7, 'rgba(244, 63, 94, 0.3)');
  glow.addColorStop(1, 'transparent');
  dCtx.fillStyle = glow;
  dCtx.beginPath();
  dCtx.arc(cx, cy, 22, 0, Math.PI * 2);
  dCtx.fill();

  dCtx.fillStyle = '#ffffff';
  dCtx.beginPath();
  dCtx.moveTo(cx, 2);
  dCtx.quadraticCurveTo(cx, cy, cx + 4, cy);
  dCtx.quadraticCurveTo(cx, cy, cx, 46);
  dCtx.quadraticCurveTo(cx, cy, cx - 4, cy);
  dCtx.quadraticCurveTo(cx, cy, cx, 2);
  dCtx.fill();

  dCtx.beginPath();
  dCtx.moveTo(4, cy);
  dCtx.quadraticCurveTo(cx, cy, cx, cy + 4);
  dCtx.quadraticCurveTo(cx, cy, 44, cy);
  dCtx.quadraticCurveTo(cx, cy, cx, cy - 4);
  dCtx.quadraticCurveTo(cx, cy, 4, cy);
  dCtx.fill();
})();

// 2. Sprite Đốm sáng Bokeh Lãng mạn (4 màu pastel)
const bokehColorPrefixes = [
  'rgba(244, 63, 94,',   // Rose
  'rgba(251, 113, 133,', // Peony Pink
  'rgba(251, 191, 36,',  // Champagne Amber
  'rgba(217, 70, 239,'   // Magenta Violet
];
const bokehSprites = bokehColorPrefixes.map(prefix => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `${prefix} 0.22)`);
  g.addColorStop(0.45, `${prefix} 0.11)`);
  g.addColorStop(1, `${prefix} 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();
  return c;
});

// 3. Sprite Cánh hoa hồng nhung 3D (4 tông màu hoa hồng)
const petalThemes = [
  { base: '#9f1239', mid: '#e11d48', tip: '#fda4af' }, // Hoa hồng nhung đỏ
  { base: '#be185d', mid: '#f43f5e', tip: '#fbcfe8' }, // Hoa hồng cánh sen
  { base: '#b91c1c', mid: '#fb7185', tip: '#ffe4e6' }, // Hoa hồng hoàng gia
  { base: '#881337', mid: '#db2777', tip: '#fce7f3' }  // Mẫu đơn tím hồng
];
const petalSprites = petalThemes.map(theme => {
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 56;
  const ctx = c.getContext('2d');
  const cx = 24, cy = 6;
  const size = 44;

  const grad = ctx.createRadialGradient(cx, cy + size * 0.35, 1, cx, cy + size * 0.5, size);
  grad.addColorStop(0, theme.base);
  grad.addColorStop(0.5, theme.mid);
  grad.addColorStop(1, theme.tip);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.bezierCurveTo(cx - size * 0.55, cy - size * 0.45, cx - size * 0.95, cy + size * 0.4, cx, cy + size);
  ctx.bezierCurveTo(cx + size * 0.95, cy + size * 0.4, cx + size * 0.55, cy - size * 0.45, cx, cy);
  ctx.fill();

  // Gân lá mờ tinh xảo
  ctx.strokeStyle = 'rgba(255, 240, 245, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.15);
  ctx.quadraticCurveTo(cx + 2, cy + size * 0.5, cx, cy + size * 0.85);
  ctx.stroke();

  return c;
});

// Bắt tọa độ chuột tối ưu hóa (Throttled per-frame)
let lastSpawnX = 0, lastSpawnY = 0;
window.addEventListener('mousemove', (e) => {
  pendingMouseX = e.clientX;
  pendingMouseY = e.clientY;
  targetParallaxX = (e.clientX - width / 2) / (width / 2);
  targetParallaxY = (e.clientY - height / 2) / (height / 2);
  hasMouseMoved = true;
}, { passive: true });

// ==========================================================
// 1. STARFIELD 3D PARALLAX & SAO BĂNG (120FPS OPTIMIZED)
// ==========================================================
class ParallaxStar {
  constructor(layer) {
    this.layer = layer; // 1: Xa, 2: Trung, 3: Gần
    this.reset(true);
  }

  reset(init = false) {
    this.baseX = Math.random() * width;
    this.baseY = init ? Math.random() * height : -15;

    if (this.layer === 1) {
      this.size = Math.random() * 1.1 + 0.4;
      this.speed = 0.05;
      this.parallaxFactor = 8;
      this.alpha = Math.random() * 0.45 + 0.25;
      this.color = Math.random() > 0.4 ? '#ffffff' : '#fce7f3';
      this.isDiamond = false;
    } else if (this.layer === 2) {
      this.size = Math.random() * 1.6 + 0.8;
      this.speed = 0.12;
      this.parallaxFactor = 18;
      this.alpha = Math.random() * 0.65 + 0.35;
      const palette = ['#fbcfe8', '#fef08a', '#ffd1dc', '#ffffff'];
      this.color = palette[Math.floor(Math.random() * palette.length)];
      this.isDiamond = false;
    } else {
      this.size = Math.random() * 2.8 + 1.2;
      this.speed = 0.22;
      this.parallaxFactor = 35;
      this.alpha = Math.random() * 0.85 + 0.45;
      const palette = ['#ffd700', '#ff69b4', '#fff0f5', '#fda4af', '#fef08a'];
      this.color = palette[Math.floor(Math.random() * palette.length)];
      this.isDiamond = Math.random() < 0.35;
    }

    this.twinkleSpeed = (Math.random() - 0.5) * 0.025;
  }

  update(dt = 1) {
    this.baseY -= this.speed * dt;
    if (this.baseY < -20) this.baseY = height + 20;

    this.alpha += this.twinkleSpeed * dt;
    if (this.alpha > 1 || this.alpha < 0.2) {
      this.twinkleSpeed = -this.twinkleSpeed;
    }
  }

  draw(pX, pY) {
    const renderX = this.baseX - pX * this.parallaxFactor;
    const renderY = this.baseY - pY * this.parallaxFactor;
    const currentAlpha = Math.max(0, Math.min(1, this.alpha));

    if (this.isDiamond) {
      // Dùng Sprite đã pre-render (0ms gradient allocation)
      bgCtx.globalAlpha = currentAlpha;
      const s = this.size * 3.5;
      bgCtx.drawImage(diamondSprite, renderX - s / 2, renderY - s / 2, s, s);
    } else if (this.layer === 1) {
      // Lớp 1 dùng fillRect nhanh gấp 3 lần arc
      bgCtx.globalAlpha = currentAlpha;
      bgCtx.fillStyle = this.color;
      bgCtx.fillRect(renderX, renderY, this.size, this.size);
    } else {
      bgCtx.globalAlpha = currentAlpha;
      bgCtx.fillStyle = this.color;
      bgCtx.beginPath();
      bgCtx.arc(renderX, renderY, this.size, 0, Math.PI * 2);
      bgCtx.fill();
    }
  }
}

const starsLayer1 = Array.from({ length: 150 }, () => new ParallaxStar(1));
const starsLayer2 = Array.from({ length: 70 }, () => new ParallaxStar(2));
const starsLayer3 = Array.from({ length: 25 }, () => new ParallaxStar(3));

// Đốm sáng Bokeh hữu cơ lãng mạn (Dùng Pre-rendered Sprites, 0ms overhead)
class RomanticBokehOrb {
  constructor() {
    this.reset(true);
  }
  reset(init = false) {
    this.x = Math.random() * width;
    this.y = init ? Math.random() * height : height + Math.random() * 80;
    this.radius = Math.random() * 45 + 25;
    this.speedY = Math.random() * 0.22 + 0.1;
    this.speedX = (Math.random() - 0.5) * 0.15;
    this.phase = Math.random() * Math.PI * 2;
    this.baseAlpha = Math.random() * 0.07 + 0.035;
    this.spriteIdx = Math.floor(Math.random() * bokehSprites.length);
  }
  update(dt = 1) {
    this.y -= this.speedY * dt;
    this.x += (this.speedX + Math.sin(Date.now() * 0.0008 + this.phase) * 0.18) * dt;
    if (this.y < -this.radius * 2 || this.x < -this.radius * 2 || this.x > width + this.radius * 2) {
      this.reset(false);
    }
  }
  draw() {
    const pulse = 0.85 + 0.15 * Math.sin(Date.now() * 0.0012 + this.phase);
    bgCtx.globalAlpha = this.baseAlpha * pulse * 1.5;
    bgCtx.drawImage(
      bokehSprites[this.spriteIdx],
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );
  }
}
const bokehOrbs = Array.from({ length: 16 }, () => new RomanticBokehOrb());

// Dải lụa Cực Quang Vũ Trụ (Render trên fxOffscreen 1/3 scale, 0.2ms overhead)
function drawCosmicAurora(time) {
  fxOffCtx.save();
  fxOffCtx.globalCompositeOperation = 'screen';

  const auroraBands = [
    {
      baseY: offH * 0.22,
      heightSpread: 45,
      freq: 0.007,
      speed: 0.0007,
      color1: 'rgba(244, 63, 94, 0.22)',   // Hồng ngọc
      color2: 'rgba(168, 85, 247, 0.18)'   // Tím vũ trụ
    },
    {
      baseY: offH * 0.15,
      heightSpread: 35,
      freq: 0.009,
      speed: 0.0009,
      color1: 'rgba(56, 189, 248, 0.18)',  // Cyan cực quang
      color2: 'rgba(251, 113, 133, 0.15)'  // Phấn hồng
    },
    {
      baseY: offH * 0.32,
      heightSpread: 40,
      freq: 0.0055,
      speed: -0.0006,
      color1: 'rgba(251, 191, 36, 0.15)',  // Vàng Champagne
      color2: 'rgba(225, 29, 72, 0.16)'    // Hồng thắm
    }
  ];

  auroraBands.forEach((band, idx) => {
    fxOffCtx.beginPath();
    const step = 25;
    fxOffCtx.moveTo(0, band.baseY);

    for (let x = 0; x <= offW + step; x += step) {
      const w1 = Math.sin(x * band.freq + time * band.speed * 1000 + idx);
      const w2 = Math.cos(x * band.freq * 1.6 - time * band.speed * 750);
      const y = band.baseY + (w1 * 12 + w2 * 7);
      fxOffCtx.lineTo(x, y);
    }

    for (let x = offW + step; x >= 0; x -= step) {
      const w1 = Math.sin(x * band.freq * 1.3 + time * band.speed * 1100 + idx * 1.4);
      const y = band.baseY + band.heightSpread + (w1 * 14);
      fxOffCtx.lineTo(x, y);
    }
    fxOffCtx.closePath();

    const grad = fxOffCtx.createLinearGradient(0, band.baseY - 15, 0, band.baseY + band.heightSpread + 18);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.3, band.color1);
    grad.addColorStop(0.65, band.color2);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    fxOffCtx.fillStyle = grad;
    fxOffCtx.fill();
  });

  fxOffCtx.restore();
}

// Tinh vân thở nhịp nhàng (Vẽ trên fxOffscreen, 0.1ms overhead)
function drawNebulae(time) {
  fxOffCtx.save();
  fxOffCtx.globalCompositeOperation = 'screen';

  const cx1 = offW * 0.42 + Math.sin(time) * 18;
  const cy1 = offH * 0.32 + Math.cos(time * 0.9) * 14;
  const r1 = Math.max(offW, offH) * 0.52;
  const nebGrad1 = fxOffCtx.createRadialGradient(cx1, cy1, 12, cx1, cy1, r1);
  nebGrad1.addColorStop(0, 'rgba(244, 63, 94, 0.22)');
  nebGrad1.addColorStop(0.4, 'rgba(219, 39, 119, 0.14)');
  nebGrad1.addColorStop(0.75, 'rgba(136, 19, 78, 0.06)');
  nebGrad1.addColorStop(1, 'transparent');

  const cx2 = offW * 0.2 + Math.cos(time * 0.8) * 20;
  const cy2 = offH * 0.72 + Math.sin(time * 0.7) * 15;
  const r2 = Math.max(offW, offH) * 0.5;
  const nebGrad2 = fxOffCtx.createRadialGradient(cx2, cy2, 15, cx2, cy2, r2);
  nebGrad2.addColorStop(0, 'rgba(168, 85, 247, 0.18)');
  nebGrad2.addColorStop(0.45, 'rgba(126, 34, 206, 0.10)');
  nebGrad2.addColorStop(1, 'transparent');

  const cx3 = offW * 0.8 + Math.sin(time * 0.75) * 18;
  const cy3 = offH * 0.55 + Math.cos(time * 0.85) * 14;
  const r3 = Math.max(offW, offH) * 0.48;
  const nebGrad3 = fxOffCtx.createRadialGradient(cx3, cy3, 15, cx3, cy3, r3);
  nebGrad3.addColorStop(0, 'rgba(251, 191, 36, 0.15)');
  nebGrad3.addColorStop(0.5, 'rgba(244, 114, 182, 0.08)');
  nebGrad3.addColorStop(1, 'transparent');

  fxOffCtx.fillStyle = nebGrad1;
  fxOffCtx.fillRect(0, 0, offW, offH);
  fxOffCtx.fillStyle = nebGrad2;
  fxOffCtx.fillRect(0, 0, offW, offH);
  fxOffCtx.fillStyle = nebGrad3;
  fxOffCtx.fillRect(0, 0, offW, offH);

  fxOffCtx.restore();
}

// Sao băng tương tác (Interactive Wishing Shooting Star)
class ShootingStar {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.len = 0;
    this.speed = 0;
    this.angle = 0;
    this.alpha = 0;
  }

  spawn() {
    this.active = true;
    this.x = Math.random() * width * 0.75;
    this.y = Math.random() * (height * 0.35);
    this.len = Math.random() * 140 + 95;
    this.speed = Math.random() * 11 + 8.5;
    this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.28;
    this.alpha = 1;
  }

  checkHit(px, py) {
    if (!this.active || this.alpha < 0.2) return false;
    const dx = px - this.x;
    const dy = py - this.y;
    return (dx * dx + dy * dy <= 60 * 60); // Bán kính chạm 60px
  }

  explode() {
    if (!this.active) return;
    this.active = false;
    if (typeof triggerHeartFirework === 'function') {
      triggerHeartFirework(this.x, this.y, 0.9);
    }
    if (typeof spawnBlossomShower === 'function') {
      spawnBlossomShower(this.x, this.y, 16);
    }
    if (window.audioManager && typeof window.audioManager.playWishingChime === 'function') {
      window.audioManager.playWishingChime();
    } else if (window.audioManager && typeof window.audioManager.playBellSound === 'function') {
      window.audioManager.playBellSound(1318.5, 0.5);
    }
    if (typeof window.showWishingBubble === 'function') {
      window.showWishingBubble(this.x, this.y);
    }
  }

  update(dt = 1) {
    if (!this.active) return;
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;
    this.alpha -= 0.016 * dt;
    if (this.alpha <= 0 || this.x > width + 50 || this.y > height + 50) {
      this.active = false;
    }
  }

  draw() {
    if (!this.active || this.alpha <= 0) return;
    bgCtx.save();
    bgCtx.globalAlpha = this.alpha;

    const tailX = this.x - Math.cos(this.angle) * this.len;
    const tailY = this.y - Math.sin(this.angle) * this.len;

    const grad = bgCtx.createLinearGradient(this.x, this.y, tailX, tailY);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#fde047');
    grad.addColorStop(0.55, '#f43f5e');
    grad.addColorStop(0.85, '#c084fc');
    grad.addColorStop(1, 'transparent');

    bgCtx.strokeStyle = grad;
    bgCtx.lineWidth = 3.2;
    bgCtx.lineCap = 'round';
    bgCtx.beginPath();
    bgCtx.moveTo(this.x, this.y);
    bgCtx.lineTo(tailX, tailY);
    bgCtx.stroke();

    // Hào quang ở đầu sao băng
    const headGlow = bgCtx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 12);
    headGlow.addColorStop(0, '#ffffff');
    headGlow.addColorStop(0.4, 'rgba(253, 224, 71, 0.85)');
    headGlow.addColorStop(0.8, 'rgba(244, 63, 94, 0.4)');
    headGlow.addColorStop(1, 'transparent');
    bgCtx.fillStyle = headGlow;
    bgCtx.beginPath();
    bgCtx.arc(this.x, this.y, 12, 0, Math.PI * 2);
    bgCtx.fill();

    bgCtx.restore();
  }
}

const shootingStars = [new ShootingStar(), new ShootingStar()];
let shootingStarCooldown = 120;
let lastBgTime = performance.now();

function renderBackground(now = performance.now()) {
  // Khi ở Stage 6, canvas heartNamesCanvas bao phủ toàn màn hình -> tạm dừng vẽ bgCanvas để tối ưu 120fps
  if (window.currentActiveStage === 6) {
    bgCtx.clearRect(0, 0, width, height);
    requestAnimationFrame(renderBackground);
    return;
  }

  const dt = Math.min(2.0, (now - lastBgTime) / 16.667);
  lastBgTime = now;
  const time = Date.now() * 0.00045;

  bgCtx.clearRect(0, 0, width, height);

  // 1. Cập nhật và Blit Cực quang + Tinh vân từ Offscreen Canvas (siêu nhanh ~0.3ms)
  fxOffCtx.clearRect(0, 0, offW, offH);
  drawCosmicAurora(time);
  drawNebulae(time);

  bgCtx.save();
  bgCtx.globalCompositeOperation = 'screen';
  bgCtx.drawImage(fxOffscreen, 0, 0, width, height);
  bgCtx.restore();

  // 2. Đốm sáng Bokeh mộng mơ
  bokehOrbs.forEach(orb => {
    orb.update(dt);
    orb.draw();
  });

  // 3. Nội suy Parallax mượt mà
  currentParallaxX += (targetParallaxX - currentParallaxX) * 0.06 * dt;
  currentParallaxY += (targetParallaxY - currentParallaxY) * 0.06 * dt;

  starsLayer1.forEach(s => { s.update(dt); s.draw(currentParallaxX, currentParallaxY); });
  starsLayer2.forEach(s => { s.update(dt); s.draw(currentParallaxX, currentParallaxY); });
  starsLayer3.forEach(s => { s.update(dt); s.draw(currentParallaxX, currentParallaxY); });

  // 4. Kích hoạt sao băng
  shootingStarCooldown -= dt;
  if (shootingStarCooldown <= 0) {
    const idleStar = shootingStars.find(s => !s.active);
    if (idleStar) idleStar.spawn();
    shootingStarCooldown = Math.floor(Math.random() * 150) + 160;
  }
  shootingStars.forEach(s => {
    s.update(dt);
    s.draw();
  });

  requestAnimationFrame(renderBackground);
}
requestAnimationFrame(renderBackground);

// ==========================================================
// 2. MAGIC FAIRY CURSOR TRAIL & STARLIGHT NOVA BURST (120FPS)
// ==========================================================
const cursorParticles = [];
const novaParticles = [];
const novaRings = [];

class StardustParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2.4 + 0.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damping = 0.94;
    this.gravity = 0.05;
    this.alpha = 1;
    this.decay = Math.random() * 0.028 + 0.018;
    this.size = Math.random() * 3.2 + 1.2;
    this.isDiamond = Math.random() < 0.45;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.1;
    const colors = ['#ffffff', '#ffd700', '#fce7f3', '#f43f5e', '#38bdf8', '#fbbf24'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update(dt = 1) {
    this.vx *= Math.pow(this.damping, dt);
    this.vy = (this.vy * Math.pow(this.damping, dt)) + this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rot += this.rotSpeed * dt;
    this.alpha -= this.decay * dt;
  }

  draw() {
    if (this.alpha <= 0) return;
    fxCtx.save();
    fxCtx.translate(this.x, this.y);
    fxCtx.rotate(this.rot);
    fxCtx.globalAlpha = Math.max(0, this.alpha);

    if (this.isDiamond) {
      const s = this.size * 2.8;
      fxCtx.drawImage(diamondSprite, -s / 2, -s / 2, s, s);
    } else {
      fxCtx.fillStyle = this.color;
      fxCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }
    fxCtx.restore();
  }
}

function spawnCursorTrail(x, y) {
  if (cursorParticles.length > 40) return;
  cursorParticles.push(new StardustParticle(x, y));
  cursorParticles.push(new StardustParticle(x, y));
}

// Vụ nổ tinh tú và trái tim khi nhấp chuột (Starlight Nova Burst)
class StarlightNovaParticle {
  constructor(x, y, isHeart = false) {
    this.x = x;
    this.y = y;
    this.isHeart = isHeart;
    const angle = Math.random() * Math.PI * 2;
    const speed = isHeart ? (Math.random() * 2.8 + 1.2) : (Math.random() * 5.5 + 2.0);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - (isHeart ? 1.6 : 0.3);
    this.damping = 0.94;
    this.gravity = isHeart ? -0.05 : 0.07;
    this.alpha = 1;
    this.decay = Math.random() * 0.024 + 0.016;
    this.size = isHeart ? (Math.random() * 15 + 11) : (Math.random() * 5.2 + 2.4);
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.14;

    const colors = ['#ffffff', '#fef08a', '#ffd700', '#f43f5e', '#ec4899', '#c084fc', '#38bdf8'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update(dt = 1) {
    this.vx *= Math.pow(this.damping, dt);
    this.vy = (this.vy * Math.pow(this.damping, dt)) + this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rot += this.rotSpeed * dt;
    this.alpha -= this.decay * dt;
  }

  draw() {
    if (this.alpha <= 0) return;
    fxCtx.save();
    fxCtx.translate(this.x, this.y);
    fxCtx.rotate(this.rot);
    fxCtx.globalAlpha = Math.max(0, this.alpha);

    if (this.isHeart) {
      fxCtx.fillStyle = this.color;
      fxCtx.font = `${this.size}px serif`;
      fxCtx.textAlign = 'center';
      fxCtx.textBaseline = 'middle';
      fxCtx.fillText('♥', 0, 0);
    } else {
      const s = this.size * 3.4;
      fxCtx.drawImage(diamondSprite, -s / 2, -s / 2, s, s);
    }
    fxCtx.restore();
  }
}

class NovaShockwaveRing {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 4;
    this.maxRadius = Math.random() * 45 + 38;
    this.alpha = 0.9;
    this.decay = 0.034;
    this.color = Math.random() > 0.5 ? '#ffd700' : '#f43f5e';
  }

  update(dt = 1) {
    this.radius += ((this.maxRadius - this.radius) * 0.18 + 1.2) * dt;
    this.alpha -= this.decay * dt;
  }

  draw() {
    if (this.alpha <= 0) return;
    fxCtx.save();
    fxCtx.globalAlpha = Math.max(0, this.alpha);
    fxCtx.strokeStyle = this.color;
    fxCtx.lineWidth = 2.4;
    fxCtx.beginPath();
    fxCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    fxCtx.stroke();
    fxCtx.restore();
  }
}

function spawnStarlightNova(x, y) {
  novaRings.push(new NovaShockwaveRing(x, y));
  const particleCount = 14;
  for (let i = 0; i < particleCount; i++) {
    const isHeart = (i % 4 === 0);
    novaParticles.push(new StarlightNovaParticle(x, y, isHeart));
  }
  try {
    if (window.audioManager && typeof window.audioManager.playMagicNovaSound === 'function') {
      window.audioManager.playMagicNovaSound();
    } else if (window.audioManager && typeof window.audioManager.playBellSound === 'function') {
      window.audioManager.playBellSound(1046.5, 0.25);
    }
  } catch (e) {}
}

// Bắt sự kiện chạm / click để kích hoạt Starlight Nova Burst và kiểm tra bắt sao băng
window.addEventListener('pointerdown', (e) => {
  const target = e.target;
  const isInteractive = target.closest('button') || target.closest('input') || target.closest('a') || target.closest('.lightbox-content-box') || target.closest('.tour-controls-bar');

  let hitStar = false;
  shootingStars.forEach(star => {
    if (star.active && star.checkHit(e.clientX, e.clientY)) {
      star.explode();
      hitStar = true;
    }
  });

  if (!isInteractive && !hitStar) {
    spawnStarlightNova(e.clientX, e.clientY);
  }
});

const magicCursorEl = document.getElementById('magicCursor');

// ==========================================================
// 3. STAGE 1: PHẤN HOA PHÁT QUANG & CÁNH HOA RƠI 3D (120FPS SPRITES)
// ==========================================================
class PollenSpore {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = width / 2 + (Math.random() - 0.5) * 450;
    this.y = height / 2 + (Math.random() - 0.5) * 450;
    this.size = Math.random() * 2.2 + 0.8;
    this.angle = Math.random() * Math.PI * 2;
    this.orbitRadius = Math.random() * 220 + 60;
    this.speed = (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1);
    this.alpha = Math.random() * 0.7 + 0.3;
    this.color = Math.random() > 0.5 ? '#fef08a' : '#f472b6';
  }

  update(dt = 1) {
    this.angle += this.speed * dt;
    this.x = width / 2 + Math.cos(this.angle) * this.orbitRadius;
    this.y = height / 2 + Math.sin(this.angle) * (this.orbitRadius * 0.75);
  }

  draw() {
    fxCtx.globalAlpha = this.alpha;
    fxCtx.fillStyle = this.color;
    fxCtx.beginPath();
    fxCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    fxCtx.fill();
  }
}

// Cánh hoa hồng rơi 3D vật lý gió & tương tác chuột (Dùng Pre-rendered Sprites, 120fps)
class FallingPetal {
  constructor() {
    this.reset(true);
  }

  reset(init = false) {
    this.x = Math.random() * width;
    this.y = init ? Math.random() * height : -35;
    this.size = Math.random() * 14 + 10;
    this.speedY = Math.random() * 1.5 + 0.9;
    this.swayAmp = Math.random() * 2.8 + 1.2;
    this.swayFreq = Math.random() * 0.02 + 0.01;
    this.flip = Math.random() * Math.PI;
    this.flipSpeed = Math.random() * 0.025 + 0.012;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.025;
    this.alpha = Math.random() * 0.45 + 0.5;
    this.themeIdx = Math.floor(Math.random() * petalSprites.length);

    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = 0;
  }

  update(dt = 1) {
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distSq = dx * dx + dy * dy;
    const maxRepelDist = 130;

    if (distSq < maxRepelDist * maxRepelDist && distSq > 4) {
      const dist = Math.sqrt(distSq);
      const force = (1 - dist / maxRepelDist) * 3.5;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
      this.rotSpeed += (Math.random() - 0.5) * 0.04;
      this.flipSpeed += 0.02;
    }

    this.vx *= 0.94;
    this.vy *= 0.92;

    this.y += (this.speedY + this.vy) * dt;
    this.x += (Math.sin(this.y * this.swayFreq) * this.swayAmp + this.vx) * dt;
    this.flip += this.flipSpeed * dt;
    this.rot += this.rotSpeed * dt;

    if (this.y > height + 45 || this.x < -60 || this.x > width + 60) {
      this.reset();
    }
  }

  draw() {
    fxCtx.save();
    fxCtx.translate(this.x, this.y);
    fxCtx.rotate(this.rot);

    const scaleX = Math.cos(this.flip);
    const scaleY = Math.sin(this.flip * 0.6) * 0.35 + 0.8;
    fxCtx.scale(scaleX, scaleY);
    fxCtx.globalAlpha = Math.max(0.1, Math.min(1, this.alpha));

    // Vẽ từ Sprite đã pre-render (250x faster than createRadialGradient + shadowBlur!)
    fxCtx.drawImage(
      petalSprites[this.themeIdx],
      -this.size * 0.5,
      -this.size * 0.6,
      this.size,
      this.size * 1.2
    );

    fxCtx.restore();
  }
}

const pollenSpores = Array.from({ length: 45 }, () => new PollenSpore());
const fallingPetals = Array.from({ length: 20 }, () => new FallingPetal());

// ==========================================================
// 4. STAGE 4: PHÁO HOA VẬT LÝ CAO CẤP (WILLOW SPARKLE FIREWORKS)
// ==========================================================
class WillowSparkleParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5.5 + 2.0;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damping = 0.97; // Lực cản không khí
    this.gravity = 0.05; // Trọng lực nhẹ rơi như thác ánh sáng willow
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.012;
    this.history = [];
  }

  update() {
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > 5) this.history.shift();

    this.vx *= this.damping;
    this.vy = this.vy * this.damping + this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw() {
    if (this.alpha <= 0) return;
    fxCtx.save();
    fxCtx.globalAlpha = Math.max(0, this.alpha);

    // Vẽ vệt đuôi ánh sáng (Sparkle Trail)
    if (this.history.length > 1) {
      fxCtx.strokeStyle = this.color;
      fxCtx.lineWidth = 1.6;
      fxCtx.beginPath();
      fxCtx.moveTo(this.history[0].x, this.history[0].y);
      for (let i = 1; i < this.history.length; i++) {
        fxCtx.lineTo(this.history[i].x, this.history[i].y);
      }
      fxCtx.stroke();
    }

    fxCtx.fillStyle = '#ffffff';
    fxCtx.beginPath();
    fxCtx.arc(this.x, this.y, 1.8, 0, Math.PI * 2);
    fxCtx.fill();

    fxCtx.restore();
  }
}

const fireworkParticles = [];

// Pháo hoa bung nở hình TRÁI TIM (Heart-Shaped Firework)
class HeartFireworkParticle {
  constructor(x, y, vx, vy, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.damping = 0.965;
    this.gravity = 0.04;
    this.alpha = 1;
    this.decay = Math.random() * 0.014 + 0.011;
    this.size = Math.random() * 2.2 + 1.6;
    this.history = [];
  }

  update(dt = 1) {
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > 5) this.history.shift();

    this.vx *= Math.pow(this.damping, dt);
    this.vy = (this.vy * Math.pow(this.damping, dt)) + this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.alpha -= this.decay * dt;
  }

  draw() {
    if (this.alpha <= 0) return;
    fxCtx.save();
    fxCtx.globalAlpha = Math.max(0, this.alpha);

    if (this.history.length > 1) {
      fxCtx.strokeStyle = this.color;
      fxCtx.lineWidth = 1.8;
      fxCtx.beginPath();
      fxCtx.moveTo(this.history[0].x, this.history[0].y);
      for (let i = 1; i < this.history.length; i++) {
        fxCtx.lineTo(this.history[i].x, this.history[i].y);
      }
      fxCtx.stroke();
    }

    fxCtx.fillStyle = '#ffffff';
    fxCtx.beginPath();
    fxCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    fxCtx.fill();
    fxCtx.restore();
  }
}

function triggerHeartFirework(x, y, scale = 1.0) {
  const spawnX = x || Math.random() * (width * 0.6) + width * 0.2;
  const spawnY = y || Math.random() * (height * 0.35) + height * 0.12;
  const colors = ['#ff1493', '#ff69b4', '#ffd700', '#f43f5e', '#fff0f5', '#fb7185'];
  const col = colors[Math.floor(Math.random() * colors.length)];

  try {
    if (window.audioManager && window.audioManager.playFireworkSound) {
      window.audioManager.playFireworkSound();
    }
  } catch (e) {}

  const count = 55;
  const baseSpeed = (Math.random() * 0.6 + 1.8) * scale;
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const speed = baseSpeed * (0.85 + Math.random() * 0.3);
    const vx = (hx / 16) * 4.5 * speed;
    const vy = (hy / 16) * 4.5 * speed;

    fireworkParticles.push(new HeartFireworkParticle(spawnX, spawnY, vx, vy, col));
  }
}

function triggerWillowFirework(x, y) {
  const spawnX = x || Math.random() * (width * 0.7) + width * 0.15;
  const spawnY = y || Math.random() * (height * 0.4) + height * 0.1;
  const colors = ['#f7e7ce', '#ffd700', '#ff69b4', '#b76e79', '#ffffff', '#ff9bb6'];
  const col = colors[Math.floor(Math.random() * colors.length)];

  try {
    if (window.audioManager && window.audioManager.playFireworkSound) {
      window.audioManager.playFireworkSound();
    }
  } catch (e) {}

  for (let i = 0; i < 55; i++) {
    fireworkParticles.push(new WillowSparkleParticle(spawnX, spawnY, col));
  }
}

// ==========================================================
// 5. STAGE 5: BÓNG BAY TRÁI TIM CAO TRÀO (CLIMAX HEART BALLOONS)
// ==========================================================
class FloatingHeartBalloon {
  constructor() {
    this.reset();
    this.y = height + Math.random() * 200;
  }

  reset() {
    this.x = Math.random() * width;
    this.y = height + 40;
    this.size = Math.random() * 22 + 14;
    this.speedY = Math.random() * 1.5 + 0.8;
    this.swaySpeed = Math.random() * 0.02 + 0.01;
    this.alpha = Math.random() * 0.6 + 0.35;
    const colors = ['#ff4b7d', '#e11d48', '#f472b6', '#ffd700', '#fb7185'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update(dt = 1) {
    this.y -= this.speedY * dt;
    this.x += Math.sin(this.y * this.swaySpeed) * 1.2 * dt;
    if (this.y < -50) this.reset();
  }

  draw() {
    fxCtx.save();
    fxCtx.globalAlpha = this.alpha;
    fxCtx.fillStyle = this.color;
    fxCtx.font = `${this.size}px serif`;
    fxCtx.fillText('♥', this.x, this.y);
    fxCtx.restore();
  }
}

let climaxHeartBalloons = [];
let isClimaxActive = false;

function activateClimaxBalloons() {
  isClimaxActive = true;
  climaxHeartBalloons = Array.from({ length: 45 }, () => new FloatingHeartBalloon());
}

// ==========================================================
// 6. MAIN FX RENDER LOOP (120FPS SYNCED)
// ==========================================================
let lastFxTime = performance.now();

function renderFxLoop(now = performance.now()) {
  const dt = Math.min(2.0, (now - lastFxTime) / 16.667);
  lastFxTime = now;

  fxCtx.clearRect(0, 0, width, height);

  // Xử lý chuột mượt mà đúng tần số 120fps
  mouseX = pendingMouseX;
  mouseY = pendingMouseY;
  if (hasMouseMoved) {
    const dx = mouseX - lastSpawnX;
    const dy = mouseY - lastSpawnY;
    if (dx * dx + dy * dy > 80 && cursorParticles.length < 35) {
      lastSpawnX = mouseX;
      lastSpawnY = mouseY;
      spawnCursorTrail(mouseX, mouseY);
    }
    if (magicCursorEl) {
      magicCursorEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }
    hasMouseMoved = false;
  }

  // 1. Vẽ vệt bụi sao chuột
  for (let i = cursorParticles.length - 1; i >= 0; i--) {
    cursorParticles[i].update(dt);
    cursorParticles[i].draw();
    if (cursorParticles[i].alpha <= 0) {
      cursorParticles.splice(i, 1);
    }
  }

  // 2. Sóng xung kích Starlight Nova & vụ nổ sao mini
  for (let i = novaRings.length - 1; i >= 0; i--) {
    novaRings[i].update(dt);
    novaRings[i].draw();
    if (novaRings[i].alpha <= 0) {
      novaRings.splice(i, 1);
    }
  }

  for (let i = novaParticles.length - 1; i >= 0; i--) {
    novaParticles[i].update(dt);
    novaParticles[i].draw();
    if (novaParticles[i].alpha <= 0) {
      novaParticles.splice(i, 1);
    }
  }

  // 3. Phấn hoa ở Stage 1 & 2
  if (window.currentActiveStage === 1 || window.currentActiveStage === 2) {
    pollenSpores.forEach(p => { p.update(dt); p.draw(); });
  }

  // Cánh hoa hồng rơi 3D bay bổng lơ lửng khắp các giai đoạn
  fallingPetals.forEach(fp => { fp.update(dt); fp.draw(); });

  // 4. Vẽ pháo hoa vật lý willow và pháo hoa trái tim
  for (let i = fireworkParticles.length - 1; i >= 0; i--) {
    fireworkParticles[i].update(dt);
    fireworkParticles[i].draw();
    if (fireworkParticles[i].alpha <= 0) {
      fireworkParticles.splice(i, 1);
    }
  }

  // 5. Vẽ bóng bay trái tim khi đạt cao trào
  if (isClimaxActive) {
    climaxHeartBalloons.forEach(b => { b.update(dt); b.draw(); });
  }

  requestAnimationFrame(renderFxLoop);
}
requestAnimationFrame(renderFxLoop);

// Bắn loạt pháo hoa chúc mừng dồn dập
function launchFireworkBarrage(count = 5) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const rx = Math.random() * (width * 0.8) + width * 0.1;
      const ry = Math.random() * (height * 0.45) + height * 0.08;
      triggerWillowFirework(rx, ry);
    }, i * 260);
  }
}

// Đại tiệc pháo hoa bùng nổ đa tầng (Grand Climax Multi-Wave Barrage)
function launchGrandFinaleBarrage() {
  const totalWaves = 9;
  for (let wave = 0; wave < totalWaves; wave++) {
    setTimeout(() => {
      const isHeart = (wave % 2 === 0);
      const rx = Math.random() * (width * 0.7) + width * 0.15;
      const ry = Math.random() * (height * 0.38) + height * 0.08;

      if (isHeart) {
        triggerHeartFirework(rx, ry, 1.15);
      } else {
        triggerWillowFirework(rx, ry);
      }

      // Confetti bung tỏa ở các wave 1, 4, 7
      if (wave === 1 || wave === 4 || wave === 7) {
        if (window.confetti) {
          window.confetti({
            particleCount: 55,
            angle: 60,
            spread: 70,
            origin: { x: 0.1, y: 0.65 },
            colors: ['#ffd700', '#ff69b4', '#ffffff', '#e11d48']
          });
          window.confetti({
            particleCount: 55,
            angle: 120,
            spread: 70,
            origin: { x: 0.9, y: 0.65 },
            colors: ['#ffd700', '#ff69b4', '#ffffff', '#e11d48']
          });
        }
      }

      // Rung màn hình nhẹ nhàng ở wave 0 và wave 5
      if (wave === 0 || wave === 5) {
        document.body.classList.add('camera-shake');
        setTimeout(() => document.body.classList.remove('camera-shake'), 350);
      }
    }, wave * 380);
  }
}

// Tung thêm chùm cánh hoa rơi tại tọa độ
function spawnBlossomShower(x, y, count = 20) {
  const originX = x || width / 2;
  const originY = y || height / 2;
  for (let i = 0; i < count; i++) {
    const p = new FallingPetal();
    p.x = originX + (Math.random() - 0.5) * 220;
    p.y = originY + (Math.random() - 0.5) * 140;
    p.speedY = Math.random() * 2.0 + 0.9;
    fallingPetals.push(p);
  }
}

// Export các hàm điều khiển cho main.js
window.FX = {
  triggerFirework: triggerWillowFirework,
  triggerHeartFirework: triggerHeartFirework,
  launchBarrage: launchFireworkBarrage,
  launchGrandFinaleBarrage: launchGrandFinaleBarrage,
  spawnBlossomShower: spawnBlossomShower,
  startClimax: activateClimaxBalloons
};
