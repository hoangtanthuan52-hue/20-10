/**
 * FX.JS - GLOBAL VISUAL EFFECTS ENGINE (VFX)
 * Canvas Starfield 3D Parallax, Shooting Stars, Magic Cursor Trail,
 * Pollen Spores, Falling Petals, Willow Fireworks & Climax Heart Balloons
 */

const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
const fxCanvas = document.getElementById('fxCanvas');
const fxCtx = fxCanvas.getContext('2d');

// Trạng thái màn hình và chuột
let width = window.innerWidth;
let height = window.innerHeight;
let mouseX = width / 2;
let mouseY = height / 2;
let targetParallaxX = 0;
let targetParallaxY = 0;
let currentParallaxX = 0;
let currentParallaxY = 0;

function resizeCanvases() {
  width = window.innerWidth;
  height = window.innerHeight;
  bgCanvas.width = width;
  bgCanvas.height = height;
  fxCanvas.width = width;
  fxCanvas.height = height;
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// Bắt tọa độ chuột cho hiệu ứng Parallax và Magic Cursor
let lastSpawnX = 0, lastSpawnY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  targetParallaxX = (e.clientX - width / 2) / (width / 2);
  targetParallaxY = (e.clientY - height / 2) / (height / 2);

  const dx = e.clientX - lastSpawnX;
  const dy = e.clientY - lastSpawnY;
  if (dx * dx + dy * dy > 64) {
    lastSpawnX = e.clientX;
    lastSpawnY = e.clientY;
    spawnCursorTrail(e.clientX, e.clientY);
  }
});

// ==========================================================
// 1. STARFIELD 3D PARALLAX & SAO BĂNG (SHOOTING STARS)
// ==========================================================
class ParallaxStar {
  constructor(layer) {
    this.layer = layer; // 1: Xa nhất, 2: Trung bình, 3: Gần
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
      // ~35% của lớp sao gần là sao kim cương 4 cánh lấp lánh (Diamond Twinkle Star)
      this.isDiamond = Math.random() < 0.35;
    }

    this.twinkleSpeed = (Math.random() - 0.5) * 0.025;
  }

  update() {
    this.baseY -= this.speed;
    if (this.baseY < -20) this.baseY = height + 20;

    this.alpha += this.twinkleSpeed;
    if (this.alpha > 1 || this.alpha < 0.2) {
      this.twinkleSpeed = -this.twinkleSpeed;
    }
  }

  draw(pX, pY) {
    const renderX = this.baseX - pX * this.parallaxFactor;
    const renderY = this.baseY - pY * this.parallaxFactor;
    const currentAlpha = Math.max(0, Math.min(1, this.alpha));

    if (this.isDiamond) {
      // Sao kim cương 4 cánh tỏa sáng nghệ thuật (4-point Diamond Flare)
      bgCtx.save();
      bgCtx.translate(renderX, renderY);
      bgCtx.globalAlpha = currentAlpha;

      // Hào quang tỏa tròn mềm mại
      const glowR = this.size * 3.2;
      const g = bgCtx.createRadialGradient(0, 0, 0, 0, 0, glowR);
      g.addColorStop(0, this.color);
      g.addColorStop(0.4, this.color);
      g.addColorStop(1, 'transparent');
      bgCtx.fillStyle = g;
      bgCtx.beginPath();
      bgCtx.arc(0, 0, glowR, 0, Math.PI * 2);
      bgCtx.fill();

      // Cánh nhọn dọc
      const armV = this.size * 3.5;
      const thick = this.size * 0.5;
      bgCtx.fillStyle = '#ffffff';
      bgCtx.beginPath();
      bgCtx.moveTo(0, -armV);
      bgCtx.quadraticCurveTo(0, 0, thick, 0);
      bgCtx.quadraticCurveTo(0, 0, 0, armV);
      bgCtx.quadraticCurveTo(0, 0, -thick, 0);
      bgCtx.quadraticCurveTo(0, 0, 0, -armV);
      bgCtx.fill();

      // Cánh nhọn ngang
      const armH = armV * 0.75;
      bgCtx.beginPath();
      bgCtx.moveTo(-armH, 0);
      bgCtx.quadraticCurveTo(0, 0, 0, thick);
      bgCtx.quadraticCurveTo(0, 0, armH, 0);
      bgCtx.quadraticCurveTo(0, 0, 0, -thick);
      bgCtx.quadraticCurveTo(0, 0, -armH, 0);
      bgCtx.fill();

      // Tâm sáng trắng
      bgCtx.beginPath();
      bgCtx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
      bgCtx.fill();

      bgCtx.restore();
    } else {
      bgCtx.globalAlpha = currentAlpha;
      if (this.size > 1.8) {
        // Sao có hào quang tỏa nhẹ xung quanh
        const g = bgCtx.createRadialGradient(renderX, renderY, 0, renderX, renderY, this.size * 2.2);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.4, this.color);
        g.addColorStop(1, 'transparent');
        bgCtx.fillStyle = g;
        bgCtx.beginPath();
        bgCtx.arc(renderX, renderY, this.size * 2.2, 0, Math.PI * 2);
        bgCtx.fill();
      } else {
        bgCtx.fillStyle = this.color;
        bgCtx.beginPath();
        bgCtx.arc(renderX, renderY, this.size, 0, Math.PI * 2);
        bgCtx.fill();
      }
    }
  }
}

// Khởi tạo các lớp sao Parallax
const starsLayer1 = Array.from({ length: 280 }, () => new ParallaxStar(1));
const starsLayer2 = Array.from({ length: 140 }, () => new ParallaxStar(2));
const starsLayer3 = Array.from({ length: 50 }, () => new ParallaxStar(3));

// Đốm sáng Bokeh hữu cơ lãng mạn (Romantic Bokeh Light Orbs)
class RomanticBokehOrb {
  constructor() {
    this.reset(true);
  }
  reset(init = false) {
    this.x = Math.random() * width;
    this.y = init ? Math.random() * height : height + Math.random() * 80;
    this.radius = Math.random() * 50 + 25; // 25px - 75px
    this.speedY = Math.random() * 0.22 + 0.1;
    this.speedX = (Math.random() - 0.5) * 0.15;
    this.phase = Math.random() * Math.PI * 2;
    this.baseAlpha = Math.random() * 0.07 + 0.035;
    const colors = [
      'rgba(244, 63, 94,',   // Rose
      'rgba(251, 113, 133,', // Peony Pink
      'rgba(251, 191, 36,',  // Champagne Amber
      'rgba(217, 70, 239,',  // Magenta Violet
      'rgba(254, 205, 211,'  // Soft Blush
    ];
    this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
  }
  update() {
    this.y -= this.speedY;
    this.x += this.speedX + Math.sin(Date.now() * 0.0008 + this.phase) * 0.18;
    if (this.y < -this.radius * 2 || this.x < -this.radius * 2 || this.x > width + this.radius * 2) {
      this.reset(false);
    }
  }
  draw() {
    const pulse = 0.85 + 0.15 * Math.sin(Date.now() * 0.0012 + this.phase);
    const a = this.baseAlpha * pulse;
    const grad = bgCtx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius
    );
    grad.addColorStop(0, `${this.colorPrefix} ${a * 1.5})`);
    grad.addColorStop(0.5, `${this.colorPrefix} ${a * 0.7})`);
    grad.addColorStop(1, `${this.colorPrefix} 0)`);
    bgCtx.fillStyle = grad;
    bgCtx.beginPath();
    bgCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    bgCtx.fill();
  }
}
const bokehOrbs = Array.from({ length: 22 }, () => new RomanticBokehOrb());

// Dải lụa Cực Quang Vũ Trụ (Cosmic Aurora Borealis VFX)
function drawCosmicAurora(time) {
  bgCtx.save();
  bgCtx.globalCompositeOperation = 'screen';

  const auroraBands = [
    {
      baseY: height * 0.22,
      heightSpread: 120,
      freq: 0.0024,
      speed: 0.0007,
      color1: 'rgba(244, 63, 94, 0.16)',   // Hồng ngọc
      color2: 'rgba(168, 85, 247, 0.14)',  // Tím vũ trụ
      color3: 'rgba(217, 70, 239, 0.04)'
    },
    {
      baseY: height * 0.15,
      heightSpread: 95,
      freq: 0.0032,
      speed: 0.0009,
      color1: 'rgba(56, 189, 248, 0.13)',  // Cyan cực quang
      color2: 'rgba(251, 113, 133, 0.11)', // Phấn hồng
      color3: 'rgba(244, 114, 182, 0.04)'
    },
    {
      baseY: height * 0.32,
      heightSpread: 110,
      freq: 0.0019,
      speed: -0.0006,
      color1: 'rgba(251, 191, 36, 0.11)',  // Vàng Champagne
      color2: 'rgba(225, 29, 72, 0.12)',   // Hồng thắm
      color3: 'rgba(136, 19, 78, 0.03)'
    }
  ];

  auroraBands.forEach((band, idx) => {
    bgCtx.beginPath();
    const step = 45;
    bgCtx.moveTo(0, band.baseY);

    // Sóng mép trên
    for (let x = 0; x <= width + step; x += step) {
      const w1 = Math.sin(x * band.freq + time * band.speed * 1000 + idx);
      const w2 = Math.cos(x * band.freq * 1.6 - time * band.speed * 750);
      const y = band.baseY + (w1 * 32 + w2 * 18);
      bgCtx.lineTo(x, y);
    }

    // Sóng mép dưới (lượn ngược chiều)
    for (let x = width + step; x >= 0; x -= step) {
      const w1 = Math.sin(x * band.freq * 1.3 + time * band.speed * 1100 + idx * 1.4);
      const y = band.baseY + band.heightSpread + (w1 * 38);
      bgCtx.lineTo(x, y);
    }
    bgCtx.closePath();

    const grad = bgCtx.createLinearGradient(0, band.baseY - 30, 0, band.baseY + band.heightSpread + 40);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.3, band.color1);
    grad.addColorStop(0.65, band.color2);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    bgCtx.fillStyle = grad;
    bgCtx.fill();
  });

  bgCtx.restore();
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

  update() {
    if (!this.active) return;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.alpha -= 0.016;
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

// Vòng lặp vẽ bầu trời sao Parallax & Tinh vân hoa hồng thở nhịp nhàng (Style 1: Romantic Rose Nebula)
let nebGrad1 = null, nebGrad2 = null, nebGrad3 = null;
let lastNebulaTick = 0;

function renderBackground() {
  bgCtx.clearRect(0, 0, width, height);

  // 1. Dải lụa Cực Quang Vũ Trụ (Cosmic Aurora Borealis)
  const time = Date.now() * 0.00045;
  drawCosmicAurora(time);

  // 2. Tinh vân hữu cơ đa tầng thở nhịp nhàng
  lastNebulaTick++;
  if (!nebGrad1 || lastNebulaTick % 3 === 0) {
    // Cụm 1: Tinh vân Hoa Hồng & Rượu Vang ở góc trên trung tâm
    const cx1 = width * 0.42 + Math.sin(time) * 55;
    const cy1 = height * 0.32 + Math.cos(time * 0.9) * 40;
    const r1 = Math.max(width, height) * 0.52;
    nebGrad1 = bgCtx.createRadialGradient(cx1, cy1, 40, cx1, cy1, r1);
    nebGrad1.addColorStop(0, 'rgba(244, 63, 94, 0.18)');
    nebGrad1.addColorStop(0.4, 'rgba(219, 39, 119, 0.11)');
    nebGrad1.addColorStop(0.75, 'rgba(136, 19, 78, 0.05)');
    nebGrad1.addColorStop(1, 'transparent');

    // Cụm 2: Tinh vân Tím Hoàng Gia & Mẫu Đơn bên góc trái dưới
    const cx2 = width * 0.2 + Math.cos(time * 0.8) * 60;
    const cy2 = height * 0.72 + Math.sin(time * 0.7) * 45;
    const r2 = Math.max(width, height) * 0.5;
    nebGrad2 = bgCtx.createRadialGradient(cx2, cy2, 50, cx2, cy2, r2);
    nebGrad2.addColorStop(0, 'rgba(168, 85, 247, 0.14)');
    nebGrad2.addColorStop(0.45, 'rgba(126, 34, 206, 0.08)');
    nebGrad2.addColorStop(1, 'transparent');

    // Cụm 3: Tinh vân Bụi Vàng Champagne & Hổ Phách bên góc phải
    const cx3 = width * 0.8 + Math.sin(time * 0.75) * 50;
    const cy3 = height * 0.55 + Math.cos(time * 0.85) * 40;
    const r3 = Math.max(width, height) * 0.48;
    nebGrad3 = bgCtx.createRadialGradient(cx3, cy3, 50, cx3, cy3, r3);
    nebGrad3.addColorStop(0, 'rgba(251, 191, 36, 0.12)');
    nebGrad3.addColorStop(0.5, 'rgba(244, 114, 182, 0.07)');
    nebGrad3.addColorStop(1, 'transparent');
  }

  bgCtx.save();
  bgCtx.globalCompositeOperation = 'screen';
  bgCtx.fillStyle = nebGrad1;
  bgCtx.fillRect(0, 0, width, height);
  bgCtx.fillStyle = nebGrad2;
  bgCtx.fillRect(0, 0, width, height);
  bgCtx.fillStyle = nebGrad3;
  bgCtx.fillRect(0, 0, width, height);

  // Đốm sáng Bokeh lơ lửng mộng mơ
  bokehOrbs.forEach(orb => {
    orb.update();
    orb.draw();
  });
  bgCtx.restore();

  // 3. Nội suy mượt vị trí Parallax
  currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
  currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;

  starsLayer1.forEach(s => { s.update(); s.draw(currentParallaxX, currentParallaxY); });
  starsLayer2.forEach(s => { s.update(); s.draw(currentParallaxX, currentParallaxY); });
  starsLayer3.forEach(s => { s.update(); s.draw(currentParallaxX, currentParallaxY); });

  // 4. Kích hoạt sao băng định kỳ
  shootingStarCooldown--;
  if (shootingStarCooldown <= 0) {
    const idleStar = shootingStars.find(s => !s.active);
    if (idleStar) idleStar.spawn();
    shootingStarCooldown = Math.floor(Math.random() * 150) + 160;
  }
  shootingStars.forEach(s => {
    s.update();
    s.draw();
  });

  requestAnimationFrame(renderBackground);
}
renderBackground();

// ==========================================================
// 2. MAGIC FAIRY CURSOR TRAIL & STARLIGHT NOVA BURST
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
    this.isDiamond = Math.random() < 0.4;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.1;
    const colors = ['#ffffff', '#ffd700', '#fce7f3', '#f43f5e', '#38bdf8', '#fbbf24'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.vx *= this.damping;
    this.vy = this.vy * this.damping + this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.rotSpeed;
    this.alpha -= this.decay;
  }

  draw() {
    if (this.alpha <= 0) return;
    fxCtx.save();
    fxCtx.translate(this.x, this.y);
    fxCtx.rotate(this.rot);
    fxCtx.globalAlpha = Math.max(0, this.alpha);

    if (this.isDiamond) {
      const arm = this.size * 2.2;
      const t = this.size * 0.4;
      fxCtx.fillStyle = this.color;
      fxCtx.beginPath();
      fxCtx.moveTo(0, -arm);
      fxCtx.quadraticCurveTo(0, 0, t, 0);
      fxCtx.quadraticCurveTo(0, 0, 0, arm);
      fxCtx.quadraticCurveTo(0, 0, -t, 0);
      fxCtx.quadraticCurveTo(0, 0, 0, -arm);
      fxCtx.fill();

      fxCtx.beginPath();
      fxCtx.moveTo(-arm * 0.7, 0);
      fxCtx.quadraticCurveTo(0, 0, 0, t);
      fxCtx.quadraticCurveTo(0, 0, arm * 0.7, 0);
      fxCtx.quadraticCurveTo(0, 0, 0, -t);
      fxCtx.quadraticCurveTo(0, 0, -arm * 0.7, 0);
      fxCtx.fill();
    } else {
      fxCtx.fillStyle = this.color;
      fxCtx.beginPath();
      fxCtx.arc(0, 0, this.size, 0, Math.PI * 2);
      fxCtx.fill();
    }
    fxCtx.restore();
  }
}

function spawnCursorTrail(x, y) {
  if (cursorParticles.length > 55) return;
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

  update() {
    this.vx *= this.damping;
    this.vy = this.vy * this.damping + this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.rotSpeed;
    this.alpha -= this.decay;
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
      const r = this.size;
      const g = fxCtx.createRadialGradient(0, 0, 0, 0, 0, r * 2.5);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.4, this.color);
      g.addColorStop(1, 'transparent');
      fxCtx.fillStyle = g;
      fxCtx.beginPath();
      fxCtx.arc(0, 0, r * 2.5, 0, Math.PI * 2);
      fxCtx.fill();

      fxCtx.fillStyle = '#ffffff';
      fxCtx.beginPath();
      const arm = r * 3.2;
      const t = r * 0.45;
      fxCtx.moveTo(0, -arm);
      fxCtx.quadraticCurveTo(0, 0, t, 0);
      fxCtx.quadraticCurveTo(0, 0, 0, arm);
      fxCtx.quadraticCurveTo(0, 0, -t, 0);
      fxCtx.quadraticCurveTo(0, 0, 0, -arm);
      fxCtx.fill();

      fxCtx.beginPath();
      const armH = arm * 0.8;
      fxCtx.moveTo(-armH, 0);
      fxCtx.quadraticCurveTo(0, 0, 0, t);
      fxCtx.quadraticCurveTo(0, 0, armH, 0);
      fxCtx.quadraticCurveTo(0, 0, 0, -t);
      fxCtx.quadraticCurveTo(0, 0, -armH, 0);
      fxCtx.fill();
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

  update() {
    this.radius += (this.maxRadius - this.radius) * 0.18 + 1.2;
    this.alpha -= this.decay;
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
  const particleCount = 16;
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

  // Kiểm tra bắt trúng sao băng điều ước
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

// Cập nhật vị trí con trỏ ma thuật #magicCursor
const magicCursorEl = document.getElementById('magicCursor');
window.addEventListener('mousemove', (e) => {
  if (magicCursorEl) {
    magicCursorEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  }
});

// ==========================================================
// 3. STAGE 1: PHẤN HOA PHÁT QUANG (POLLEN SPORES) & CÁNH HOA RƠI 3D
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

  update() {
    this.angle += this.speed;
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

// Cánh hoa hồng rơi 3D vật lý gió & tương tác chuột (3D Petals with Wind Physics & Mouse Repulsion)
class FallingPetal {
  constructor() {
    this.reset(true);
  }

  reset(init = false) {
    this.x = Math.random() * width;
    this.y = init ? Math.random() * height : -35;
    this.size = Math.random() * 13 + 10;
    this.speedY = Math.random() * 1.5 + 0.9;
    this.swayAmp = Math.random() * 2.8 + 1.2;
    this.swayFreq = Math.random() * 0.02 + 0.01;
    this.flip = Math.random() * Math.PI;
    this.flipSpeed = Math.random() * 0.025 + 0.012;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.025;
    this.alpha = Math.random() * 0.45 + 0.5;

    // Vận tốc vật lý tương tác gió & chuột
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = 0;

    // Bảng màu cánh hoa hồng nhung / hoa mẫu đơn
    const petalThemes = [
      { base: '#9f1239', mid: '#e11d48', tip: '#fda4af' }, // Hoa hồng nhung đỏ
      { base: '#be185d', mid: '#f43f5e', tip: '#fbcfe8' }, // Hoa hồng cánh sen
      { base: '#b91c1c', mid: '#fb7185', tip: '#ffe4e6' }, // Hoa hồng hoàng gia
      { base: '#881337', mid: '#db2777', tip: '#fce7f3' }  // Mẫu đơn tím hồng
    ];
    this.theme = petalThemes[Math.floor(Math.random() * petalThemes.length)];
  }

  update() {
    // 1. Tương tác đẩy gió từ chuột (Mouse Wind Repulsion)
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distSq = dx * dx + dy * dy;
    const maxRepelDist = 135;

    if (distSq < maxRepelDist * maxRepelDist && distSq > 4) {
      const dist = Math.sqrt(distSq);
      const force = (1 - dist / maxRepelDist) * 3.8;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
      this.rotSpeed += (Math.random() - 0.5) * 0.04;
      this.flipSpeed += 0.02;
    }

    // Giảm dần vận tốc tương tác
    this.vx *= 0.94;
    this.vy *= 0.92;

    this.y += this.speedY + this.vy;
    this.x += Math.sin(this.y * this.swayFreq) * this.swayAmp + this.vx;
    this.flip += this.flipSpeed;
    this.rot += this.rotSpeed;

    if (this.y > height + 45 || this.x < -60 || this.x > width + 60) {
      this.reset();
    }
  }

  draw() {
    fxCtx.save();
    fxCtx.translate(this.x, this.y);
    fxCtx.rotate(this.rot);

    // Hiệu ứng phối cảnh 3D lật nghiêng theo chiều không gian
    const scaleX = Math.cos(this.flip);
    const scaleY = Math.sin(this.flip * 0.6) * 0.35 + 0.8;
    fxCtx.scale(scaleX, scaleY);

    // Đổ bóng hào quang nhung mịn
    fxCtx.shadowColor = 'rgba(225, 29, 72, 0.35)';
    fxCtx.shadowBlur = 6;
    fxCtx.globalAlpha = Math.max(0.1, Math.min(1, this.alpha));

    // Gradient cánh hoa 3 tầng màu mềm mại
    const grad = fxCtx.createRadialGradient(
      0, this.size * 0.35, 1,
      0, this.size * 0.5, this.size
    );
    grad.addColorStop(0, this.theme.base);
    grad.addColorStop(0.5, this.theme.mid);
    grad.addColorStop(1, this.theme.tip);

    fxCtx.fillStyle = grad;
    fxCtx.beginPath();
    fxCtx.moveTo(0, 0);
    fxCtx.bezierCurveTo(-this.size * 0.55, -this.size * 0.45, -this.size * 0.95, this.size * 0.4, 0, this.size);
    fxCtx.bezierCurveTo(this.size * 0.95, this.size * 0.4, this.size * 0.55, -this.size * 0.45, 0, 0);
    fxCtx.fill();

    // Gân lá mờ tinh xảo giữa cánh hoa (Subtle Delicate Vein)
    fxCtx.strokeStyle = 'rgba(255, 240, 245, 0.4)';
    fxCtx.lineWidth = 0.9;
    fxCtx.beginPath();
    fxCtx.moveTo(0, this.size * 0.15);
    fxCtx.quadraticCurveTo(this.size * 0.08, this.size * 0.5, 0, this.size * 0.85);
    fxCtx.stroke();

    fxCtx.restore();
  }
}

const pollenSpores = Array.from({ length: 80 }, () => new PollenSpore());
const fallingPetals = Array.from({ length: 28 }, () => new FallingPetal());

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

  const count = 68;
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

  for (let i = 0; i < 65; i++) {
    fireworkParticles.push(new WillowSparkleParticle(spawnX, spawnY, col));
  }
}

// ==========================================================
// 5. STAGE 5: BÓNG BAY TRÁI TIM CAO TRÀO (CLIMAX HEART BALLOONS)
// ==========================================================
class FloatingHeartBalloon {
  constructor() {
    this.reset();
    this.y = height + Math.random() * 200; // Khởi tạo dưới đáy màn hình
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

  update() {
    this.y -= this.speedY;
    this.x += Math.sin(this.y * this.swaySpeed) * 1.2;
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
  climaxHeartBalloons = Array.from({ length: 60 }, () => new FloatingHeartBalloon());
}

// ==========================================================
// 6. MAIN FX RENDER LOOP
// ==========================================================
function renderFxLoop() {
  fxCtx.clearRect(0, 0, width, height);

  // 1. Vẽ vệt bụi sao chuột
  for (let i = cursorParticles.length - 1; i >= 0; i--) {
    cursorParticles[i].update();
    cursorParticles[i].draw();
    if (cursorParticles[i].alpha <= 0) {
      cursorParticles.splice(i, 1);
    }
  }

  // 2. Vẽ sóng xung kích Starlight Nova & vụ nổ sao mini
  for (let i = novaRings.length - 1; i >= 0; i--) {
    novaRings[i].update();
    novaRings[i].draw();
    if (novaRings[i].alpha <= 0) {
      novaRings.splice(i, 1);
    }
  }

  for (let i = novaParticles.length - 1; i >= 0; i--) {
    novaParticles[i].update();
    novaParticles[i].draw();
    if (novaParticles[i].alpha <= 0) {
      novaParticles.splice(i, 1);
    }
  }

  // 3. Phấn hoa ở Stage 1 & 2
  if (window.currentActiveStage === 1 || window.currentActiveStage === 2) {
    pollenSpores.forEach(p => { p.update(); p.draw(); });
  }

  // Cánh hoa hồng rơi 3D bay bổng lơ lửng khắp các giai đoạn
  fallingPetals.forEach(fp => { fp.update(); fp.draw(); });

  // 4. Vẽ pháo hoa vật lý willow và pháo hoa trái tim
  for (let i = fireworkParticles.length - 1; i >= 0; i--) {
    fireworkParticles[i].update();
    fireworkParticles[i].draw();
    if (fireworkParticles[i].alpha <= 0) {
      fireworkParticles.splice(i, 1);
    }
  }

  // 5. Vẽ bóng bay trái tim khi đạt cao trào
  if (isClimaxActive) {
    climaxHeartBalloons.forEach(b => { b.update(); b.draw(); });
  }

  requestAnimationFrame(renderFxLoop);
}
renderFxLoop();

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
