/**
 * ==============================================================================
 * GALAXY_THREE.JS - HỆ THỐNG THIÊN HÀ 3D THREE.JS WEBGL CHO 23 BẠN NỮ (20/10)
 * ==============================================================================
 * - Tối ưu 60 FPS trên điện thoại bằng THREE.Points + BufferGeometry + ShaderMaterial
 * - Quản lý ảnh qua mảng PHOTOS, tự động tạo texture màu be sang trọng làm placeholder
 * - Tương tác xoay quán tính (Inertia Damping), vuốt chạm cảm ứng & nhấp xem chi tiết
 * ==============================================================================
 */

// ==============================================================================
// 1. BIẾN CẤU HÌNH Ở ĐẦU FILE (SYSTEM CONFIGURATION)
// ==============================================================================
const PHOTO_COUNT = 23;        // Số lượng ảnh hiển thị (Tương ứng 23 đóa hoa lớp 10B1)
const PHOTO_SIZE = 2.4;        // Kích thước chiều rộng khung ảnh 3D
const ORBIT_SPEED = 0.0045;    // Tốc độ xoay quỹ đạo thiên hà tự động
const SPAWN_STAGGER = 0.08;    // Độ trễ xuất hiện so le giữa các bức ảnh (giây)
const HEART_PARTICLES = 1500;  // Số lượng hạt trái tim phát sáng bằng ShaderMaterial (GPU)

// Mảng đường dẫn ảnh kỷ niệm (Hoàn toàn Offline)
const PHOTOS = [
  "images/photo1.jpg",
  "images/photo2.jpg",
  "images/photo3.jpg",
  "images/photo4.jpg",
  "images/photo5.jpg",
  "images/photo6.jpg",
  "images/photo7.jpg",
  "images/photo8.jpg"
];

// Danh sách thông tin 23 bạn nữ trích xuất từ bảng danh sách lớp 10B1 (Giới tính: Nữ)
const STUDENTS_DATA = [
  { id: 1, name: "Trịnh Phan Bình An", dob: "19/05/2009", title: "Tâm Hồn Dịu Êm", wish: "Chúc Bình An ngày 20/10 ngập tràn niềm vui, cuộc sống lúc nào cũng an yên và hạnh phúc đúng như tên gọi của bạn!" },
  { id: 5, name: "Phạm Thị Nghinh Dương", dob: "14/03/2009", title: "Ánh Nắng Mùa Thu", wish: "Chúc Nghinh Dương luôn tỏa sáng rực rỡ, tự tin chinh phục mọi mục tiêu và luôn là niềm tự hào của lớp!" },
  { id: 9, name: "Dương Ngọc Hân", dob: "10/05/2009", title: "Viên Ngọc Quý", wish: "Chúc Ngọc Hân ngày 20/10 nhận được thật nhiều hoa và quà, luôn xinh đẹp và duyên dáng nhé!" },
  { id: 12, name: "Lê Thu Huyền", dob: "02/05/2009", title: "Nàng Thơ Dịu Dàng", wish: "Chúc Thu Huyền luôn giữ trọn nét dịu dàng, đáng yêu và mỗi ngày đến lớp đều là một ngày ngập tràn niềm vui!" },
  { id: 15, name: "Lê Trần Vân Khánh", dob: "10/03/2009", title: "Ngôi Sao Độc Đáo", wish: "Chúc Vân Khánh ngày 20/10 thật nhiều bất ngờ, luôn yêu đời, cá tính và tràn đầy năng lượng tích cực!" },
  { id: 16, name: "Nguyễn Thùy Lâm", dob: "18/05/2009", title: "Giai Điệu Tươi Vui", wish: "Chúc Thùy Lâm luôn xinh đẹp, học tập xuất sắc và mãi là đóa hoa thơm ngát của tập thể lớp chúng mình!" },
  { id: 17, name: "Lê Gia Linh", dob: "14/04/2009", title: "Tài Năng Tỏa Sáng", wish: "Chúc Gia Linh luôn thông minh, rạng rỡ và đạt điểm 10 ở mọi bài kiểm tra sắp tới nhé!" },
  { id: 18, name: "Trần Thị Nhật Linh", dob: "05/12/2009", title: "Ánh Sáng Ban Mai", wish: "Chúc Nhật Linh ngày 20/10 thật hạnh phúc, nụ cười luôn nở trên môi và gặp thật nhiều may mắn!" },
  { id: 19, name: "Huỳnh Nguyễn Lisa", dob: "30/03/2009", title: "Cô Nàng Phong Cách", wish: "Chúc Lisa luôn xinh đẹp cuốn hút, tự tin tỏa sáng và luôn là tâm điểm của sự đáng yêu trong mắt mọi người!" },
  { id: 20, name: "Nguyễn Thị Bích Loan", dob: "17/12/2009", title: "Bông Sen Thanh Nhã", wish: "Chúc Bích Loan một ngày 20/10 ngập tràn yêu thương, luôn ngọt ngào và thành công trên mọi chặng đường!" },
  { id: 22, name: "Trần Tăng Hiền Lương", dob: "02/10/2009", title: "Nét Đẹp Nhân Hậu", wish: "Chúc Hiền Lương luôn giữ nét đẹp trong trẻo, tốt bụng và nhận được muôn vàn tình cảm ấm áp từ mọi người!" },
  { id: 23, name: "Phan Quỳnh Mai", dob: "04/11/2009", title: "Đóa Mai Rực Rỡ", wish: "Chúc Quỳnh Mai ngày 20/10 luôn tươi tắn như mùa xuân, học tập thật giỏi và luôn mỉm cười thật tươi!" },
  { id: 25, name: "Hoàng Thị Thảo My", dob: "15/09/2009", title: "Nét Duyên Đáng Yêu", wish: "Chúc Thảo My luôn vui vẻ, lạc quan, nhận được cơn mưa lời chúc và hoa đẹp trong ngày đặc biệt này!" },
  { id: 27, name: "Trần Thị Bảo Ngọc", dob: "12/01/2009", title: "Viên Ngọc Lấp Lánh", wish: "Chúc Bảo Ngọc luôn tỏa sáng lấp lánh như viên ngọc quý, thông minh và luôn thành công trong cuộc sống!" },
  { id: 29, name: "Lê Thảo Nguyên", dob: "03/06/2009", title: "Đồng Xanh Tươi Mát", wish: "Chúc Thảo Nguyên luôn mang năng lượng thanh khiết, trẻ trung và mỗi ngày đều là một trải nghiệm tuyệt vời!" },
  { id: 30, name: "Trần Thảo Nguyên", dob: "04/03/2009", title: "Cô Gái Ấm Áp", wish: "Chúc Thảo Nguyên ngày 20/10 ấm áp ngọt ngào, ước mơ nào cũng sớm thành hiện thực nhé!" },
  { id: 32, name: "Lê Thị Hoài Phương", dob: "01/06/2009", title: "Đóa Hoa Mùa Hè", wish: "Chúc Hoài Phương luôn tự tin, duyên dáng và đạt được mọi điều mình hằng mong ước!" },
  { id: 33, name: "Thẩm Trần Thục Quyên", dob: "25/05/2009", title: "Nét Đẹp Thục Nữ", wish: "Chúc Thục Quyên ngày 20/10 luôn dịu dàng, đằm thắm và nhận được muôn vàn sự quan tâm chân thành!" },
  { id: 36, name: "Ngô Uyên Thảo", dob: "12/11/2009", title: "Cô Nàng Trí Tuệ", wish: "Chúc Uyên Thảo luôn thông thái, đáng yêu và mãi là người bạn đồng hành tuyệt vời của cả lớp!" },
  { id: 37, name: "Nguyễn Thị Ái Thu", dob: "04/09/2009", title: "Mùa Thu Ngọt Ngào", wish: "Chúc Ái Thu luôn ngọt ngào như tiết trời thu, nhận được ngàn điều tốt đẹp và luôn yêu đời!" },
  { id: 39, name: "Nguyễn Cao Ngọc Thủy", dob: "26/01/2009", title: "Nàng Thơ Dịu Dàng", wish: "Chúc Ngọc Thủy một ngày 20/10 thật rực rỡ, luôn giữ nụ cười hồn nhiên và hạnh phúc viên mãn!" },
  { id: 41, name: "Lê Thị Thùy Trang", dob: "18/07/2009", title: "Nét Đẹp Trang Đài", wish: "Chúc Thùy Trang luôn xinh đẹp, tự tin khẳng định bản thân và gặt hái thật nhiều điểm 10!" },
  { id: 43, name: "Võ Ngọc Phương Vy", dob: "29/06/2009", title: "Đóa Vy Nồng Nàn", wish: "Chúc Phương Vy ngày 20/10 tràn ngập tiếng cười, luôn đáng yêu và là nguồn cảm hứng tươi vui của mọi người!" }
];

// ==============================================================================
// 2. KHỞI TẠO BIẾN TOÀN CỤC & THREE.JS ENGINE
// ==============================================================================
let scene, camera, renderer;
let heartPointsMesh, starsPointsMesh;
let photoRingGroup;
const photoMeshItems = [];

// Trạng thái kéo chuột & quán tính xoay
let isPointerDown = false;
let pointerStartX = 0;
let pointerVelocityX = 0;
let ringRotationY = 0;
let autoSpinEnabled = true;
let autoSpinTimer = null;

// Thời gian chạy (Time Clock)
const clock = new THREE.Clock();

// Raycasting để chọn thẻ ảnh
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();

// ==============================================================================
// 3. TẠO TEXTURE MÀU BE SANG TRỌNG LÀM PLACEHOLDER KHI CHƯA CÓ ẢNH
// ==============================================================================
function createBeigePlaceholderTexture(name = "20/10", title = "Nàng Thơ", index = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');

  // Nền màu be sang trọng (Warm Cream/Beige Luxury Palette)
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 680);
  bgGrad.addColorStop(0, '#fbf8f2');
  bgGrad.addColorStop(0.5, '#f5ece0');
  bgGrad.addColorStop(1, '#ebe0d0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 680);

  // Viền đôi vàng kim Champagne Gold
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, 480, 648);

  ctx.strokeStyle = '#e6ca65';
  ctx.lineWidth = 3;
  ctx.strokeRect(26, 26, 460, 628);

  // Họa tiết góc hoa văn vàng kim
  ctx.fillStyle = '#d4af37';
  ctx.beginPath();
  ctx.arc(40, 40, 6, 0, Math.PI * 2);
  ctx.arc(472, 40, 6, 0, Math.PI * 2);
  ctx.arc(40, 640, 6, 0, Math.PI * 2);
  ctx.arc(472, 640, 6, 0, Math.PI * 2);
  ctx.fill();

  // Biểu tượng trái tim phát sáng trung tâm
  ctx.fillStyle = '#e11d48';
  ctx.font = '84px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💖', 256, 240);

  // Huy hiệu thứ tự (#01, #02,...)
  ctx.fillStyle = '#b76e79';
  ctx.font = 'bold 24px "Montserrat", sans-serif';
  ctx.fillText(`• HOA KHÔI #${String(index).padStart(2, '0')} •`, 256, 335);

  // Tên bạn nữ (Font serif sang trọng)
  ctx.fillStyle = '#362312';
  ctx.font = 'bold 34px "Playfair Display", Georgia, serif';
  ctx.fillText(name, 256, 395);

  // Danh hiệu tri ân
  ctx.fillStyle = '#a16207';
  ctx.font = 'italic 24px "Dancing Script", cursive, sans-serif';
  ctx.fillText(`👑 ${title}`, 256, 445);

  // Dòng chữ chúc mừng 20/10 ở chân thẻ
  ctx.fillStyle = '#8c7662';
  ctx.font = '600 20px "Montserrat", sans-serif';
  ctx.fillText('HAPPY WOMEN\'S DAY 20/10', 256, 560);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

// ==============================================================================
// 4. SHADER CHO HỆ THỐNG HẠT TRÁI TIM (THREE.Points + ShaderMaterial)
// ==============================================================================

// Vertex Shader: Tính toán vị trí xoay quỹ đạo, nhấp nhô sin/cos và độ sâu phối cảnh
const heartVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  attribute float aOrbitRadius;
  attribute float aOrbitSpeed;
  attribute float aOrbitAngle;
  attribute float aVerticalAmp;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    // Chuyển động xoay quanh tâm theo thời gian thực
    float angle = aOrbitAngle + uTime * aOrbitSpeed;

    vec3 pos;
    pos.x = cos(angle) * aOrbitRadius;
    pos.z = sin(angle) * aOrbitRadius;
    pos.y = position.y + sin(uTime * aSpeed + aPhase) * aVerticalAmp;

    // Dao động lơ lửng nhẹ nhàng (Harmonic float)
    pos.x += sin(uTime * 0.75 + aPhase) * 0.35;
    pos.z += cos(uTime * 0.75 + aPhase) * 0.35;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Phối cảnh độ sâu kích thước hạt (Perspective Point Size Attenuation)
    gl_PointSize = aSize * uPixelRatio * (280.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 4.0, 95.0);

    // Hiệu ứng nhấp nháy lấp lánh (Twinkle & Shimmer)
    vAlpha = 0.5 + 0.5 * sin(uTime * 2.8 + aPhase);
  }
`;

// Fragment Shader: Vẽ hình trái tim bằng phương trình giải tích SDF (Signed Distance Field)
const heartFragmentShader = `
  precision mediump float;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Chuẩn hóa tọa độ điểm ảnh gl_PointCoord từ [0, 1] sang [-1, 1]
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    p.y = -p.y;   // Lật trục Y của WebGL PointCoord
    p.y += 0.22;  // Căn giữa tâm trái tim

    // Phương trình hình học trái tim giải tích: (x^2 + y^2 - r)^3 - x^2 * y^3 <= 0
    vec2 pScaled = p * 1.38;
    float x = pScaled.x;
    float y = pScaled.y;
    float a = x * x + y * y - 0.42;
    float heart = a * a * a - x * x * y * y * y;

    // Loại bỏ các pixel nằm ngoài hình trái tim (Cắt hình vector GPU)
    if (heart > 0.0) {
      discard;
    }

    // Viền phát quang mềm mại khử răng cưa (Anti-aliased glow edge)
    float edgeGlow = smoothstep(0.0, -0.06, heart);

    // Điểm nhấn ánh sáng trung tâm trái tim
    float centerDist = length(p - vec2(0.0, -0.1));
    float centerHighlight = 1.0 - smoothstep(0.0, 0.65, centerDist);

    vec3 finalColor = mix(vColor, vec3(1.0, 0.95, 0.8), centerHighlight * 0.4);
    float finalAlpha = vAlpha * (edgeGlow * 0.85 + centerHighlight * 0.25);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

// ==============================================================================
// 5. TẠO HỆ THỐNG HẠT VŨ TRỤ & TRÁI TIM (BUFFER GEOMETRY)
// ==============================================================================
function initHeartParticleSystem() {
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(HEART_PARTICLES * 3);
  const colors = new Float32Array(HEART_PARTICLES * 3);
  const sizes = new Float32Array(HEART_PARTICLES);
  const phases = new Float32Array(HEART_PARTICLES);
  const speeds = new Float32Array(HEART_PARTICLES);
  const orbitRadii = new Float32Array(HEART_PARTICLES);
  const orbitSpeeds = new Float32Array(HEART_PARTICLES);
  const orbitAngles = new Float32Array(HEART_PARTICLES);
  const verticalAmps = new Float32Array(HEART_PARTICLES);

  // Bảng màu hạt lấp lánh (Rose Gold, Champagne, Pastel Pink, Vàng Kim)
  const colorPalette = [
    new THREE.Color('#ffd700'), // Vàng kim
    new THREE.Color('#ff69b4'), // Hồng sen
    new THREE.Color('#f472b6'), // Hồng đào
    new THREE.Color('#c084fc'), // Tím mộng mơ
    new THREE.Color('#fef08a'), // Vàng nhạt
    new THREE.Color('#ffffff')  // Trắng sao
  ];

  for (let i = 0; i < HEART_PARTICLES; i++) {
    // Phân bổ hạt theo hình đĩa bồi tụ thiên hà (Galaxy Disk)
    const radius = THREE.MathUtils.randFloat(3.5, 18.0);
    const angle = Math.random() * Math.PI * 2;
    const y = THREE.MathUtils.randFloatSpread(5.5);

    positions[i * 3 + 0] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3 + 0] = chosenColor.r;
    colors[i * 3 + 1] = chosenColor.g;
    colors[i * 3 + 2] = chosenColor.b;

    sizes[i] = THREE.MathUtils.randFloat(18.0, 42.0);
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = THREE.MathUtils.randFloat(0.8, 2.2);

    orbitRadii[i] = radius;
    // Hạt ở gần tâm quay nhanh hơn hạt ở xa (Keplerian physics)
    orbitSpeeds[i] = (0.28 / Math.sqrt(radius)) * 0.05 * (Math.random() > 0.5 ? 1 : 1.1);
    orbitAngles[i] = angle;
    verticalAmps[i] = THREE.MathUtils.randFloat(0.3, 1.2);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute('aOrbitRadius', new THREE.BufferAttribute(orbitRadii, 1));
  geometry.setAttribute('aOrbitSpeed', new THREE.BufferAttribute(orbitSpeeds, 1));
  geometry.setAttribute('aOrbitAngle', new THREE.BufferAttribute(orbitAngles, 1));
  geometry.setAttribute('aVerticalAmp', new THREE.BufferAttribute(verticalAmps, 1));

  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: heartVertexShader,
    fragmentShader: heartFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  heartPointsMesh = new THREE.Points(geometry, shaderMaterial);
  scene.add(heartPointsMesh);
}

// Bầu trời sao vô cực nền (Deep Starfield)
function initBackgroundStars() {
  const count = 2800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = THREE.MathUtils.randFloatSpread(160);
    positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(140);
    positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(160);

    const isGold = Math.random() > 0.7;
    colors[i * 3 + 0] = isGold ? 1.0 : 0.9;
    colors[i * 3 + 1] = isGold ? 0.85 : 0.95;
    colors[i * 3 + 2] = isGold ? 0.6 : 1.0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false
  });

  starsPointsMesh = new THREE.Points(geometry, material);
  scene.add(starsPointsMesh);
}

// ==============================================================================
// 6. KHỞI TẠO VÒNG QUAY ẢNH 3D (3D PHOTO CYLINDRICAL CAROUSEL)
// ==============================================================================
function initPhotoCylinderRing() {
  photoRingGroup = new THREE.Group();
  scene.add(photoRingGroup);

  const textureLoader = new THREE.TextureLoader();
  const radius = 9.8; // Bán kính vòng quay 3D
  const angleStep = (Math.PI * 2) / PHOTO_COUNT;

  // Khung hình chữ nhật 3:4 cho chân dung
  const cardWidth = PHOTO_SIZE;
  const cardHeight = PHOTO_SIZE * 1.36;
  const cardGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
  const borderGeo = new THREE.PlaneGeometry(cardWidth + 0.12, cardHeight + 0.12);

  for (let i = 0; i < PHOTO_COUNT; i++) {
    const student = STUDENTS_DATA[i % STUDENTS_DATA.length];
    const photoUrl = PHOTOS[i % PHOTOS.length];

    // 1. Tạo Texture mặc định là Màu Be Sang Trọng
    const beigeTexture = createBeigePlaceholderTexture(student.name, student.title, i + 1);

    const cardMat = new THREE.MeshBasicMaterial({
      map: beigeTexture,
      side: THREE.DoubleSide,
      transparent: true
    });

    // 2. Thử nạp ảnh thực tế từ mảng PHOTOS, nếu lỗi giữ nguyên màu be
    if (photoUrl && photoUrl.trim() !== '') {
      textureLoader.load(
        photoUrl,
        (loadedTex) => {
          loadedTex.minFilter = THREE.LinearFilter;
          cardMat.map = loadedTex;
          cardMat.needsUpdate = true;
        },
        undefined,
        (err) => {
          // Khi lỗi đường dẫn hoặc không tải được -> Giữ nguyên texture màu be
          console.warn(`[Three.js] Ảnh ${photoUrl} không tải được, giữ placeholder màu be.`);
        }
      );
    }

    // 3. Khung viền vàng kim Champagne phản chiếu
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      side: THREE.DoubleSide
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.z = -0.01;

    // 4. Mesh chứa ảnh
    const photoMesh = new THREE.Mesh(cardGeo, cardMat);
    photoMesh.add(borderMesh);

    // Gắn metadata học sinh để phục vụ Raycaster tương tác
    photoMesh.userData = {
      index: i,
      student: student
    };

    // Đặt vị trí trên vòng trụ 3D
    const angle = i * angleStep;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(i * 0.7) * 0.45; // Nhấp nhô nhẹ tạo chiều sâu vũ trụ

    photoMesh.position.set(x, y, z);

    // Xoay mặt thẻ hướng về tâm trục
    photoMesh.lookAt(0, y, 0);
    photoMesh.rotateY(Math.PI); // Lật mặt ảnh quay ra ngoài

    // Khởi tạo scale 0 để phục vụ hiệu ứng xuất hiện so le (SPAWN_STAGGER)
    photoMesh.scale.set(0.001, 0.001, 0.001);
    photoMesh.userData.targetScale = 1.0;
    photoMesh.userData.spawnTime = i * SPAWN_STAGGER;

    photoRingGroup.add(photoMesh);
    photoMeshItems.push(photoMesh);
  }
}

// ==============================================================================
// 7. XỬ LÝ SỰ KIỆN TƯƠNG TÁC CHUỘT / CẢM ỨNG & RAYCASTER
// ==============================================================================
function setupInteractions(canvasEl) {
  // Bắt đầu kéo chuột
  const onPointerDown = (clientX) => {
    isPointerDown = true;
    autoSpinEnabled = false;
    if (autoSpinTimer) clearTimeout(autoSpinTimer);
    pointerStartX = clientX;
    pointerVelocityX = 0;
  };

  // Di chuyển chuột
  const onPointerMove = (clientX) => {
    if (!isPointerDown) return;
    const deltaX = clientX - pointerStartX;
    ringRotationY += deltaX * 0.0035;
    pointerVelocityX = deltaX * 0.0035;
    pointerStartX = clientX;
  };

  // Thả chuột
  const onPointerUp = () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    // Sau 3.5 giây không tương tác, tự động xoay tiếp
    autoSpinTimer = setTimeout(() => {
      autoSpinEnabled = true;
    }, 3500);
  };

  // Sự kiện Chuột Máy Tính (Mouse Events)
  canvasEl.addEventListener('mousedown', (e) => onPointerDown(e.clientX));
  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX));
  window.addEventListener('mouseup', onPointerUp);

  // Sự kiện Cảm Ứng Điện Thoại (Touch Events - Responsive Mobile)
  canvasEl.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) onPointerDown(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) onPointerMove(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', onPointerUp);

  // Click chọn ảnh (Raycaster Spotlight)
  canvasEl.addEventListener('click', (e) => {
    const rect = canvasEl.getBoundingClientRect();
    mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseVec, camera);
    const intersects = raycaster.intersectObjects(photoMeshItems);

    if (intersects.length > 0) {
      const hitCard = intersects[0].object;
      const student = hitCard.userData.student;
      onCardSelected(hitCard.userData.index, student);
    }
  });
}

// Xử lý khi người dùng chọn 1 bức ảnh
function onCardSelected(index, student) {
  autoSpinEnabled = false;
  if (autoSpinTimer) clearTimeout(autoSpinTimer);
  autoSpinTimer = setTimeout(() => { autoSpinEnabled = true; }, 4500);

  // Tính góc quay để đưa thẻ đó về chính diện (Góc 0 độ đối diện camera)
  const angleStep = (Math.PI * 2) / PHOTO_COUNT;
  const targetRingAngle = -index * angleStep + Math.PI / 2;
  const diff = (targetRingAngle - ringRotationY) % (Math.PI * 2);
  let normDiff = diff;
  if (normDiff > Math.PI) normDiff -= Math.PI * 2;
  if (normDiff < -Math.PI) normDiff += Math.PI * 2;

  ringRotationY += normDiff;
  pointerVelocityX = 0;

  // Kích hoạt callback nếu có trong UI bên ngoài
  if (typeof window.onThreeCardFocus === 'function') {
    window.onThreeCardFocus(index, student);
  }
}

// ==============================================================================
// 8. KHỞI TẠO VÀ RESPONSIVE VIEWPORT
// ==============================================================================
function initThreeGalaxyScene(containerId) {
  const container = document.getElementById(containerId) || document.body;
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // Tạo Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06030c, 0.015);

  // Tạo Camera với góc nhìn tối ưu cho cả Desktop & Mobile
  camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
  adjustCameraDistance(width, height);

  // Tạo WebGLRenderer với thiết lập tiết kiệm pin và đảm bảo 60fps trên điện thoại
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Khóa tối đa 2x pixel ratio để không giật lag
  container.appendChild(renderer.domElement);

  // Ánh sáng môi trường
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
  scene.add(ambientLight);

  // Khởi tạo các hệ thống 3D
  initBackgroundStars();
  initHeartParticleSystem();
  initPhotoCylinderRing();
  setupInteractions(renderer.domElement);

  // Lắng nghe sự kiện co giãn màn hình (Responsive Resize)
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth || window.innerWidth;
    const newHeight = container.clientHeight || window.innerHeight;

    camera.aspect = newWidth / newHeight;
    adjustCameraDistance(newWidth, newHeight);
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (heartPointsMesh) {
      heartPointsMesh.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    }
  });

  // Bắt đầu vòng lặp Render 60 FPS
  animate();
}

// Tự động điều chỉnh khoảng cách camera theo tỉ lệ màn hình
function adjustCameraDistance(w, h) {
  // Màn hình dọc (Điện thoại): Lùi xa camera để thấy trọn vẹn vòng quay
  if (w < h) {
    camera.position.set(0, 1.8, 25.0);
  } else if (w < 900) {
    camera.position.set(0, 1.4, 21.0);
  } else {
    camera.position.set(0, 1.2, 18.5);
  }
  camera.lookAt(0, 0, 0);
}

// ==============================================================================
// 9. VÒNG LẶP RENDER 60 FPS (RENDER ANIMATION LOOP)
// ==============================================================================
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // 1. Cập nhật Uniform thời gian cho Shader hạt trái tim
  if (heartPointsMesh) {
    heartPointsMesh.material.uniforms.uTime.value = elapsedTime;
  }

  // 2. Xoay nhẹ bầu trời sao nền
  if (starsPointsMesh) {
    starsPointsMesh.rotation.y = elapsedTime * 0.0008;
    starsPointsMesh.rotation.x = elapsedTime * 0.0004;
  }

  // 3. Vật lý quán tính và xoay vòng quay ảnh 3D
  if (photoRingGroup) {
    if (!isPointerDown) {
      ringRotationY += pointerVelocityX;
      pointerVelocityX *= 0.95; // Lực cản quán tính mượt mà

      if (Math.abs(pointerVelocityX) < 0.0005) {
        pointerVelocityX = 0;
        if (autoSpinEnabled) {
          ringRotationY -= ORBIT_SPEED;
        }
      }
    }
    photoRingGroup.rotation.y = ringRotationY;

    // 4. Cập nhật xuất hiện so le (SPAWN_STAGGER) cho từng ảnh
    photoMeshItems.forEach((mesh) => {
      const spawnTime = mesh.userData.spawnTime;
      if (elapsedTime >= spawnTime) {
        const progress = Math.min(1.0, (elapsedTime - spawnTime) * 1.8);
        // Easing mượt mà (Cubic ease-out)
        const scaleVal = 1.0 - Math.pow(1.0 - progress, 3);
        mesh.scale.set(scaleVal, scaleVal, scaleVal);
      }
    });
  }

  renderer.render(scene, camera);
}

// Export các hàm điều khiển ra Window toàn cục
window.ThreeGalaxy = {
  init: initThreeGalaxyScene,
  rotateToCard: onCardSelected,
  CONFIG: {
    PHOTO_COUNT,
    PHOTO_SIZE,
    ORBIT_SPEED,
    SPAWN_STAGGER,
    HEART_PARTICLES
  }
};
