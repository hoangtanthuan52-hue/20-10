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
    this.baseY = init ? Math.random() * height : -10;

    if (this.layer === 1) {
      this.size = Math.random() * 1.0 + 0.5;
      this.speed = 0.05;
      this.parallaxFactor = 8;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.color = '#ffffff';
    } else if (this.layer === 2) {
      this.size = Math.random() * 1.6 + 0.8;
      this.speed = 0.12;
      this.parallaxFactor = 18;
      this.alpha = Math.random() * 0.7 + 0.3;
      this.color = Math.random() > 0.5 ? '#fbcfe8' : '#fef08a';
    } else {
      this.size = Math.random() * 2.5 + 1.2;
      this.speed = 0.22;
      this.parallaxFactor = 35;
      this.alpha = Math.random() * 0.9 + 0.4;
      this.color = Math.random() > 0.5 ? '#ffd700' : '#ff69b4';
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

    bgCtx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
    bgCtx.fillStyle = this.color;
    bgCtx.beginPath();
    bgCtx.arc(renderX, renderY, this.size, 0, Math.PI * 2);
    bgCtx.fill();
  }
}

// Khởi tạo các lớp sao Parallax
const starsLayer1 = Array.from({ length: 280 }, () => new ParallaxStar(1));
const starsLayer2 = Array.from({ length: 140 }, () => new ParallaxStar(2));
const starsLayer3 = Array.from({ length: 50 }, () => new ParallaxStar(3));

// Sao băng (Shooting Star)
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
    this.x = Math.random() * width * 0.7;
    this.y = Math.random() * (height * 0.35);
    this.len = Math.random() * 140 + 90;
    this.speed = Math.random() * 12 + 9;
    this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.25; // Bay góc xéo ~45 độ
    this.alpha = 1;
  }

  update() {
    if (!this.active) return;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.alpha -= 0.018;
    if (this.alpha <= 0 || this.x > width || this.y > height) {
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
    grad.addColorStop(0.2, '#ffd700');
    grad.addColorStop(0.6, '#ff69b4');
    grad.addColorStop(1, 'transparent');

    bgCtx.strokeStyle = grad;
    bgCtx.lineWidth = 2.5;
    bgCtx.beginPath();
    bgCtx.moveTo(this.x, this.y);
    bgCtx.lineTo(tailX, tailY);
    bgCtx.stroke();
    bgCtx.restore();
  }
}

const shootingStar = new ShootingStar();
let shootingStarCooldown = 180;

// Vòng lặp vẽ bầu trời sao Parallax & Tinh vân mượt mà
let nebGrad1 = null, nebGrad2 = null;
let lastNebulaTick = 0;

function renderBackground() {
  bgCtx.clearRect(0, 0, width, height);

  // 1. Tinh vân mượt mà huyền ảo (Cập nhật gradient mỗi 3 frames để giải phóng CPU/GPU)
  lastNebulaTick++;
  if (!nebGrad1 || lastNebulaTick % 3 === 0) {
    const time = Date.now() * 0.0004;
    const cx1 = width * 0.35 + Math.sin(time) * 60;
    const cy1 = height * 0.4 + Math.cos(time) * 40;
    nebGrad1 = bgCtx.createRadialGradient(cx1, cy1, 60, cx1, cy1, width * 0.5);
    nebGrad1.addColorStop(0, 'rgba(192, 132, 252, 0.12)');
    nebGrad1.addColorStop(0.4, 'rgba(244, 114, 182, 0.07)');
    nebGrad1.addColorStop(1, 'transparent');

    const cx2 = width * 0.72 + Math.cos(time * 0.8) * 70;
    const cy2 = height * 0.65 + Math.sin(time * 0.8) * 50;
    nebGrad2 = bgCtx.createRadialGradient(cx2, cy2, 70, cx2, cy2, width * 0.55);
    nebGrad2.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
    nebGrad2.addColorStop(0.5, 'rgba(236, 72, 153, 0.05)');
    nebGrad2.addColorStop(1, 'transparent');
  }

  bgCtx.fillStyle = nebGrad1;
  bgCtx.fillRect(0, 0, width, height);
  bgCtx.fillStyle = nebGrad2;
  bgCtx.fillRect(0, 0, width, height);

  // 2. Nội suy mượt vị trí Parallax
  currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
  currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;

  starsLayer1.forEach(s => { s.update(); s.draw(currentParallaxX, currentParallaxY); });
  starsLayer2.forEach(s => { s.update(); s.draw(currentParallaxX, currentParallaxY); });
  starsLayer3.forEach(s => { s.update(); s.draw(currentParallaxX, currentParallaxY); });

  // 3. Định kỳ kích hoạt sao băng mỗi 4 - 7 giây
  shootingStarCooldown--;
  if (shootingStarCooldown <= 0) {
    shootingStar.spawn();
    shootingStarCooldown = Math.floor(Math.random() * 180) + 240;
  }
  shootingStar.update();
  shootingStar.draw();

  requestAnimationFrame(renderBackground);
}
renderBackground();

// ==========================================================
// 2. MAGIC FAIRY CURSOR TRAIL (VỆT BỤI SAO KIM TUYẾN MƯỢT MÀ)
// ==========================================================
const cursorParticles = [];

class StardustParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2.2 + 0.4;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damping = 0.95;
    this.gravity = 0.06;
    this.alpha = 1;
    this.decay = Math.random() * 0.03 + 0.02;
    this.size = Math.random() * 2.5 + 1.2;
    const colors = ['#ffd700', '#f7e7ce', '#ff69b4', '#ffffff', '#fbcfe8'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.vx *= this.damping;
    this.vy = this.vy * this.damping + this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw() {
    if (this.alpha <= 0) return;
    fxCtx.globalAlpha = Math.max(0, this.alpha);
    fxCtx.fillStyle = this.color;
    fxCtx.beginPath();
    fxCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    fxCtx.fill();
  }
}

function spawnCursorTrail(x, y) {
  if (cursorParticles.length > 40) return;
  cursorParticles.push(new StardustParticle(x, y));
  cursorParticles.push(new StardustParticle(x, y));
}

// Cập nhật vị trí con trỏ ma thuật #magicCursor
const magicCursorEl = document.getElementById('magicCursor');
window.addEventListener('mousemove', (e) => {
  if (magicCursorEl) {
    magicCursorEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
  }
});

// ==========================================================
// 3. STAGE 1: PHẤN HOA PHÁT QUANG (POLLEN SPORES) & CÁNH HOA RƠI
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

// Cánh hoa hồng rơi (Falling Petals Physics)
class FallingPetal {
  constructor() {
    this.reset(true);
  }

  reset(init = false) {
    this.x = Math.random() * width;
    this.y = init ? Math.random() * height : -30;
    this.size = Math.random() * 12 + 9;
    this.speedY = Math.random() * 1.6 + 1.1;
    this.swayAmp = Math.random() * 2.5 + 1.2;
    this.swayFreq = Math.random() * 0.02 + 0.01;
    this.flip = Math.random() * Math.PI;
    this.flipSpeed = Math.random() * 0.03 + 0.01;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.03;
    this.alpha = Math.random() * 0.5 + 0.45;
  }

  update() {
    this.y += this.speedY;
    this.x += Math.sin(this.y * this.swayFreq) * this.swayAmp;
    this.flip += this.flipSpeed;
    this.rot += this.rotSpeed;

    if (this.y > height + 35) {
      this.reset();
    }
  }

  draw() {
    fxCtx.save();
    fxCtx.translate(this.x, this.y);
    fxCtx.rotate(this.rot);
    fxCtx.scale(Math.cos(this.flip), 1);

    fxCtx.fillStyle = `rgba(255, 105, 180, ${this.alpha})`;
    fxCtx.beginPath();
    fxCtx.moveTo(0, 0);
    fxCtx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
    fxCtx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
    fxCtx.fill();

    fxCtx.restore();
  }
}

const pollenSpores = Array.from({ length: 80 }, () => new PollenSpore());
const fallingPetals = Array.from({ length: 24 }, () => new FallingPetal());

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

function triggerWillowFirework(x, y) {
  const spawnX = x || Math.random() * (width * 0.7) + width * 0.15;
  const spawnY = y || Math.random() * (height * 0.4) + height * 0.1;
  const colors = ['#f7e7ce', '#ffd700', '#ff69b4', '#b76e79', '#ffffff', '#ff9bb6'];
  const col = colors[Math.floor(Math.random() * colors.length)];

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

  // 2. Vẽ phấn hoa & cánh hoa rơi (hiển thị ở Giai đoạn 1 và 2 để tạo không gian ngập tràn hoa)
  if (window.currentActiveStage === 1 || window.currentActiveStage === 2) {
    pollenSpores.forEach(p => { p.update(); p.draw(); });
    fallingPetals.forEach(fp => { fp.update(); fp.draw(); });
  }

  // 3. Vẽ pháo hoa vật lý willow
  for (let i = fireworkParticles.length - 1; i >= 0; i--) {
    fireworkParticles[i].update();
    fireworkParticles[i].draw();
    if (fireworkParticles[i].alpha <= 0) {
      fireworkParticles.splice(i, 1);
    }
  }

  // 4. Vẽ bóng bay trái tim khi đạt cao trào
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
  launchBarrage: launchFireworkBarrage,
  spawnBlossomShower: spawnBlossomShower,
  startClimax: activateClimaxBalloons
};
