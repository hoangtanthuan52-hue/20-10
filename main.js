/**
 * MAIN.JS - ADVANCED INTERACTION & STAGE MANAGEMENT ENGINE
 * Xử lý: Âm thanh Web Audio, Chuyển cảnh 5 giai đoạn, Puzzle từ tính & Camera Shake,
 * Quỹ đạo 3D Depth of Field & Tilt, Quả cầu ảnh 3D Inertia Momentum, Con dấu sáp đỏ & Typewriter
 */

// ==========================================================
// 1. CẤU HÌNH TỔNG THỂ HỆ THỐNG (SYSTEM CONFIG)
// ==========================================================
const CONFIG = {
  FLOWER_COUNT: 215,           // Số lượng hoa trong bó (dày đặc, không lộ nền)
  SPHERE_RADIUS: 3.2,          // Bán kính khối cầu bó hoa (~3.2)
  ASPECT_Y_RATIO: 1.10,        // Trục dọc cao hơn ~10% (khối cầu hơi méo)
  CAMERA_START_Z: 12.0,        // Camera bắt đầu ở Z = 12
  CAMERA_END_Z: 1.5,           // Camera lao vào ở Z = 1.5
  STAR_SIZE: 1.2,              // Kích thước hạt sao
  DURATIONS: {
    BLOOM_MIN: 0.7,            // Thời gian hoa nở từ tâm tối thiểu (0.7s)
    BLOOM_MAX: 1.0,            // Thời gian hoa nở từ tâm tối đa (1.0s)
    STAGGER_MAX: 0.5,          // Độ trễ ngẫu nhiên nở bung (0 - 0.5s)
    PHA_1_2: 3.0,              // Pha 1 & 2: Nở và nhấp nhô (0s -> 3.0s)
    CAMERA_DOLLY: 3.0,         // Pha 3: Camera lao vào (3.0s -> 6.0s)
    WALL_HOLD: 1.5,            // Pha 3: Giữ bức tường hoa (4.5s -> 6.0s)
    DISSOLVE_SMOKE: 1.2,       // Pha 4: Hoa tan thành khói (6.0s -> 7.2s)
    TOTAL_INTRO: 7.2           // Tổng thời lượng toàn bộ intro (7.2s)
  },
  COLORS: {
    PASTEL_PINK: ['#fbcfe8', '#f472b6', '#fda4af', '#ffb6c1'], // ~45%
    CREAM_WHITE: ['#fff1f2', '#fef9c3', '#fffbeb', '#fdfbf7'], // ~30%
    DEEP_PINK: ['#e11d48', '#db2777', '#f43f5e'],              // ~15%
    BURGUNDY: ['#881337', '#9f1239', '#be123c', '#700c25']     // ~10% ở rìa dưới và rìa trái/phải
  },
  DEBUG: false                 // Bật/tắt debug FPS & Nhãn pha (Phím D)
};

// Danh sách URL ảnh cục bộ (Hỗ trợ cả Base64 Offline 100% lẫn file images/)
const PHOTOS = (typeof OFFLINE_PHOTOS_BASE64 !== 'undefined' && Array.isArray(OFFLINE_PHOTOS_BASE64) && OFFLINE_PHOTOS_BASE64.length > 0)
  ? OFFLINE_PHOTOS_BASE64
  : [
      "images/photo1.jpg",
      "images/photo2.jpg",
      "images/photo3.jpg",
      "images/photo4.jpg",
      "images/photo5.jpg",
      "images/photo6.jpg",
      "images/photo7.jpg",
      "images/photo8.jpg"
    ];

// Đường dẫn file nhạc nền mặc định
const BGM_URL = "audio/music.mp3";

// Danh sách 23 bạn nữ trích xuất chính xác từ bảng danh sách lớp 10B1 (Giới tính: Nữ)
const FEMALE_STUDENTS = [
  { id: 1, name: "Trịnh Phan Bình An", photo: "images/binh_an.jpg", cropY: 0.15, dob: "19/05/2009", title: "Tâm Hồn Dịu Êm", wish: "Chúc Bình An ngày 20/10 ngập tràn niềm vui, cuộc sống lúc nào cũng an yên và hạnh phúc đúng như tên gọi của bạn!" },
  { id: 5, name: "Phạm Thị Nghinh Dương", photo: "images/nghinh_duong.png", cropY: 0.20, dob: "14/03/2009", title: "Ánh Nắng Mùa Thu", wish: "Chúc Nghinh Dương luôn tỏa sáng rực rỡ, tự tin chinh phục mọi mục tiêu và luôn là niềm tự hào của lớp!" },
  { id: 9, name: "Dương Ngọc Hân", photo: "images/ngoc_han.jpg", cropY: 0.18, dob: "10/05/2009", title: "Viên Ngọc Quý", wish: "Chúc Ngọc Hân ngày 20/10 nhận được thật nhiều hoa và quà, luôn xinh đẹp và duyên dáng nhé!" },
  { id: 12, name: "Lê Thu Huyền", photo: "images/thu_huyen.png", cropY: 0.18, dob: "02/05/2009", title: "Nàng Thơ Dịu Dàng", wish: "Chúc Thu Huyền luôn giữ trọn nét dịu dàng, đáng yêu và mỗi ngày đến lớp đều là một ngày ngập tràn niềm vui!" },
  { id: 15, name: "Lê Trần Vân Khánh", photo: "images/van_khanh.jpg", cropY: 0.20, dob: "10/03/2009", title: "Ngôi Sao Độc Đáo", wish: "Chúc Vân Khánh ngày 20/10 thật nhiều bất ngờ, luôn yêu đời, cá tính và tràn đầy năng lượng tích cực!" },
  { id: 16, name: "Nguyễn Thùy Lâm", photo: "images/thuy_lam.png", cropY: 0.15, dob: "18/05/2009", title: "Giai Điệu Tươi Vui", wish: "Chúc Thùy Lâm luôn xinh đẹp, học tập xuất sắc và mãi là đóa hoa thơm ngát của tập thể lớp chúng mình!" },
  { id: 17, name: "Lê Gia Linh", photo: "images/gia_linh.jpg", cropY: 0.20, dob: "14/04/2009", title: "Tài Năng Tỏa Sáng", wish: "Chúc Gia Linh luôn thông minh, rạng rỡ và đạt điểm 10 ở mọi bài kiểm tra sắp tới nhé!" },
  { id: 18, name: "Trần Thị Nhật Linh", photo: "images/nhat_linh.jpg", cropY: 0.35, dob: "05/12/2009", title: "Ánh Sáng Ban Mai", wish: "Chúc Nhật Linh ngày 20/10 thật hạnh phúc, nụ cười luôn nở trên môi và gặp thật nhiều may mắn!" },
  { id: 19, name: "Huỳnh Nguyễn Lisa", photo: "images/lisa.jpg", cropY: 0.35, dob: "30/03/2009", title: "Cô Nàng Phong Cách", wish: "Chúc Lisa luôn xinh đẹp cuốn hút, tự tin tỏa sáng và luôn là tâm điểm của sự đáng yêu trong mắt mọi người!" },
  { id: 20, name: "Nguyễn Thị Bích Loan", photo: "images/bich_loan.jpg", cropY: 0.22, dob: "17/12/2009", title: "Bông Sen Thanh Nhã", wish: "Chúc Bích Loan một ngày 20/10 ngập tràn yêu thương, luôn ngọt ngào và thành công trên mọi chặng đường!" },
  { id: 22, name: "Trần Tăng Hiền Lương", photo: "images/hien_luong.jpg", cropY: 0.20, dob: "02/10/2009", title: "Nét Đẹp Nhân Hậu", wish: "Chúc Hiền Lương luôn giữ nét đẹp trong trẻo, tốt bụng và nhận được muôn vàn tình cảm ấm áp từ mọi người!" },
  { id: 23, name: "Phan Quỳnh Mai", photo: "images/quynh_mai.png", cropY: 0.20, dob: "04/11/2009", title: "Đóa Mai Rực Rỡ", wish: "Chúc Quỳnh Mai ngày 20/10 luôn tươi tắn như mùa xuân, học tập thật giỏi và luôn mỉm cười thật tươi!" },
  { id: 25, name: "Hoàng Thị Thảo My", photo: "images/thao_my.jpg", cropY: 0.20, dob: "15/09/2009", title: "Nét Duyên Đáng Yêu", wish: "Chúc Thảo My luôn vui vẻ, lạc quan, nhận được cơn mưa lời chúc và hoa đẹp trong ngày đặc biệt này!" },
  { id: 27, name: "Trần Thị Bảo Ngọc", photo: "images/bao_ngoc.png", cropY: 0.20, dob: "12/01/2009", title: "Viên Ngọc Lấp Lánh", wish: "Chúc Bảo Ngọc luôn tỏa sáng lấp lánh như viên ngọc quý, thông minh và luôn thành công trong cuộc sống!" },
  { id: 29, name: "Lê Thảo Nguyên", photo: "images/le_thao_nguyen.jpg", cropY: 0.18, dob: "03/06/2009", title: "Đồng Xanh Tươi Mát", wish: "Chúc Thảo Nguyên luôn mang năng lượng thanh khiết, trẻ trung và mỗi ngày đều là một trải nghiệm tuyệt vời!" },
  { id: 30, name: "Trần Thảo Nguyên", photo: "images/tran_thao_nguyen.jpg", cropY: 0.20, dob: "04/03/2009", title: "Cô Gái Ấm Áp", wish: "Chúc Thảo Nguyên ngày 20/10 ấm áp ngọt ngào, ước mơ nào cũng sớm thành hiện thực nhé!" },
  { id: 32, name: "Lê Thị Hoài Phương", photo: "images/hoai_phuong.jpg", cropY: 0.22, dob: "01/06/2009", title: "Đóa Hoa Mùa Hè", wish: "Chúc Hoài Phương luôn tự tin, duyên dáng và đạt được mọi điều mình hằng mong ước!" },
  { id: 33, name: "Thẩm Trần Thục Quyên", photo: "images/thuc_quyen.jpg", cropY: 0.30, dob: "25/05/2009", title: "Nét Đẹp Thục Nữ", wish: "Chúc Thục Quyên ngày 20/10 luôn dịu dàng, đằm thắm và nhận được muôn vàn sự quan tâm chân thành!" },
  { id: 36, name: "Ngô Uyên Thảo", photo: "images/uyen_thao.png", cropY: 0.15, dob: "12/11/2009", title: "Cô Nàng Trí Tuệ", wish: "Chúc Uyên Thảo luôn thông thái, đáng yêu và mãi là người bạn đồng hành tuyệt vời của cả lớp!" },
  { id: 37, name: "Nguyễn Thị Ái Thu", photo: "images/ai_thu.jpg", cropY: 0.22, dob: "04/09/2009", title: "Mùa Thu Ngọt Ngào", wish: "Chúc Ái Thu luôn ngọt ngào như tiết trời thu, nhận được ngàn điều tốt đẹp và luôn yêu đời!" },
  { id: 39, name: "Nguyễn Cao Ngọc Thủy", photo: "images/ngoc_thuy.png", cropY: 0.20, dob: "26/01/2009", title: "Nàng Thơ Dịu Dàng", wish: "Chúc Ngọc Thủy một ngày 20/10 thật rực rỡ, luôn giữ nụ cười hồn nhiên và hạnh phúc viên mãn!" },
  { id: 41, name: "Lê Thị Thùy Trang", photo: "images/thuy_trang.png", cropY: 0.18, dob: "18/07/2009", title: "Nét Đẹp Trang Đài", wish: "Chúc Thùy Trang luôn xinh đẹp, tự tin khẳng định bản thân và gặt hái thật nhiều điểm 10!" },
  { id: 43, name: "Võ Ngọc Phương Vy", photo: "images/phuong_vy.png", cropY: 0.20, dob: "29/06/2009", title: "Đóa Vy Nồng Nàn", wish: "Chúc Phương Vy ngày 20/10 tràn ngập tiếng cười, luôn đáng yêu và là nguồn cảm hứng tươi vui của mọi người!" }
];

// Hàm lấy ảnh chính chủ của từng bạn nữ (Hỗ trợ Base64 offline lẫn file ảnh cục bộ trong images/)
function getStudentPhoto(student, index = 0) {
  if (!student) return PHOTOS[index % PHOTOS.length];
  if (typeof STUDENT_PHOTOS_BASE64 !== 'undefined' && STUDENT_PHOTOS_BASE64 && STUDENT_PHOTOS_BASE64[student.name]) {
    return STUDENT_PHOTOS_BASE64[student.name];
  }
  if (student.photo) {
    return student.photo;
  }
  return PHOTOS[index % PHOTOS.length];
}

// Hàm lấy tên hiển thị ngắn gọn, rõ đẹp, tôn vinh từng bạn nữ (không bị khuất, không trùng lặp)
function getStudentShortName(student) {
  if (!student || !student.name) return '';
  const fullName = student.name.trim();
  if (fullName.includes('Lisa')) return 'Lisa';
  if (fullName === 'Lê Thảo Nguyên') return 'Lê Thảo Nguyên';
  if (fullName === 'Trần Thảo Nguyên') return 'Trần Thảo Nguyên';
  const words = fullName.split(/\s+/);
  return words.length > 2 ? words.slice(-2).join(' ') : fullName;
}

// Nội dung bức thư tri ân cảm xúc gõ chữ
const LETTER_TEXT = `Hôm nay là ngày 20/10 - ngày dành riêng cho những người con gái tuyệt vời nhất!\n\nTập thể nam lớp 12B1 muốn gửi lời cảm ơn chân thành và sâu sắc nhất đến 23 đóa hoa của lớp mình: Trịnh Phan Bình An, Phạm Thị Nghinh Dương, Dương Ngọc Hân, Lê Thu Huyền, Lê Trần Vân Khánh, Nguyễn Thùy Lâm, Lê Gia Linh, Trần Thị Nhật Linh, Huỳnh Nguyễn Lisa, Nguyễn Thị Bích Loan, Trần Tăng Hiền Lương, Phan Quỳnh Mai, Hoàng Thị Thảo My, Trần Thị Bảo Ngọc, Lê Thảo Nguyên, Trần Thảo Nguyên, Lê Thị Hoài Phương, Thẩm Trần Thục Quyên, Ngô Uyên Thảo, Nguyễn Thị Ái Thu, Nguyễn Cao Ngọc Thủy, Lê Thị Thùy Trang và Võ Ngọc Phương Vy.\n\nCảm ơn các bạn vì đã luôn mang lại nụ cười rạng rỡ, sự ấm áp và là những mảnh ghép tuyệt vời nhất trong gia đình chung 12B1 của chúng mình. Chúc các bạn mãi luôn xinh đẹp, tự tin, học tập xuất sắc và luôn hạnh phúc mỗi ngày! 💖`;

// ==========================================================
// 2. AUDIO MANAGER (WEB AUDIO SYNTHESIZER & SFX)
// ==========================================================
class LuxuryAudioManager {
  constructor() {
    this.ctx = null;
    this.isPlayingMelody = false;
    this.melodyTimer = null;
    this.noteIndex = 0;
    // Giai điệu Canon lãng mạn
    this.notes = [
      { f: 523.25, d: 0.6 }, { f: 659.25, d: 0.6 }, { f: 783.99, d: 0.6 }, { f: 1046.50, d: 1.0 },
      { f: 880.00, d: 0.6 }, { f: 659.25, d: 0.6 }, { f: 783.99, d: 0.6 }, { f: 523.25, d: 1.0 },
      { f: 587.33, d: 0.6 }, { f: 698.46, d: 0.6 }, { f: 880.00, d: 0.6 }, { f: 659.25, d: 1.0 },
      { f: 523.25, d: 0.6 }, { f: 440.00, d: 0.6 }, { f: 493.88, d: 0.6 }, { f: 523.25, d: 1.4 }
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Âm thanh hộp nhạc nền
  playChimeNote(freq, duration) {
    if (!this.ctx || !this.isPlayingMelody) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio exception:", e);
    }
  }

  startMelody() {
    this.init();
    if (this.isPlayingMelody) return;
    this.isPlayingMelody = true;
    this.noteIndex = 0;
    this.melodyLoop();
  }

  melodyLoop() {
    if (!this.isPlayingMelody) return;
    const n = this.notes[this.noteIndex];
    this.playChimeNote(n.f, n.d * 1.5);
    this.noteIndex = (this.noteIndex + 1) % this.notes.length;
    this.melodyTimer = setTimeout(() => this.melodyLoop(), n.d * 880);
  }

  stopMelody() {
    this.isPlayingMelody = false;
    if (this.melodyTimer) clearTimeout(this.melodyTimer);
  }

  // Âm thanh tinh thể vang lên khi ghép tim thành công (Crystal Chime Arpeggio)
  playCrystalChime() {
    this.init();
    if (!this.ctx) return;
    const crystalFreqs = [880, 1108.73, 1318.51, 1760];
    crystalFreqs.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 1.2);
        } catch (e) {}
      }, idx * 120);
    });
  }

  // Âm thanh chuông vang khi mở con dấu sáp đỏ
  playBellSound(freq = 523.25, duration = 0.5) {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio bell exception:", e);
    }
  }

  // Âm thanh máy gõ chữ cơ học ASMR cao cấp (Vintage Mechanical Typewriter ASMR)
  playTypewriterASMR(char = '') {
    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const t = this.ctx.currentTime;
      const isSpace = (char === ' ');
      const isEnter = (char === '\n');

      // 1. Âm thanh va đập cơ học (Tactile Mechanical Click / Clack)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.03); // 30ms noise burst
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      const decayRate = isSpace ? 0.012 : 0.007;
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * decayRate));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      const centerFreq = isSpace ? (1200 + Math.random() * 250) : (2800 + Math.random() * 500);
      filter.frequency.setValueAtTime(centerFreq, t);
      filter.Q.setValueAtTime(isSpace ? 1.4 : 2.5, t);

      // Hệ số giảm âm lượng tiếng gõ phím xuống 28% so với trước để làm nền êm dịu, không lấn át piano
      const TYPEWRITER_VOL_SCALE = 0.28;

      const noiseGain = this.ctx.createGain();
      const nVol = (isSpace ? 0.045 : (0.035 + Math.random() * 0.012)) * TYPEWRITER_VOL_SCALE;
      noiseGain.gain.setValueAtTime(nVol, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);

      // 2. Âm thanh búa gõ trục cao su (Platen / Body Thump)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      const startPitch = isSpace ? (180 + Math.random() * 40) : (340 + Math.random() * 60);
      osc.frequency.setValueAtTime(startPitch, t);
      osc.frequency.exponentialRampToValueAtTime(startPitch * 0.45, t + 0.032);

      const thudVol = (isSpace ? 0.05 : 0.038) * TYPEWRITER_VOL_SCALE;
      oscGain.gain.setValueAtTime(thudVol, t);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.032);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.033);

      // 3. Tiếng gõ kim loại ngân rất nhẹ (Delicate Metallic Hammer Ping)
      if (!isSpace) {
        const ping = this.ctx.createOscillator();
        const pingGain = this.ctx.createGain();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(2200 + Math.random() * 600, t);

        pingGain.gain.setValueAtTime(0.012 * TYPEWRITER_VOL_SCALE, t);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);

        ping.connect(pingGain);
        pingGain.connect(this.ctx.destination);
        ping.start(t);
        ping.stop(t + 0.023);
      }

      // 4. Nếu là xuống dòng (\n): phát chuông leng keng cổ điển
      if (isEnter) {
        this.playVintageBell();
      }
    } catch (e) {}
  }

  // Tiếng chuông leng keng cổ điển của máy gõ chữ khi hết dòng (Carriage Return Bell)
  playVintageBell() {
    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const t = this.ctx.currentTime + 0.03;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2093.0, t); // Nốt Đô C7
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(3135.96, t); // Nốt Sol G7 họa âm

      gain.gain.setValueAtTime(0.014, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.66);
      osc2.stop(t + 0.66);
    } catch (e) {}
  }

  // Âm thanh vỡ dấu sáp đỏ giòn tan (Wax Seal Snap & Spark)
  playWaxCrackSound() {
    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const t = this.ctx.currentTime;
      // Tiếng nứt sáp đanh giòn
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.009));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1800, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);

      // Hòa âm chuông ngân ấm áp
      this.playBellSound(523.25, 0.4);
      setTimeout(() => {
        try { this.playBellSound(1046.5, 0.6); } catch (e) {}
      }, 90);
    } catch (e) {}
  }

  // Âm thanh pháo hoa bùng nổ chân thực: Tiếng rít vút lên -> Tiếng nổ trầm vang (Bass Boom) -> Tiếng lách tách kim tuyến
  playFireworkSound() {
    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const t = this.ctx.currentTime;

      // 1. Tiếng rít vút lên (Whistle)
      const whistle = this.ctx.createOscillator();
      const whistleGain = this.ctx.createGain();
      whistle.type = 'sine';
      whistle.frequency.setValueAtTime(450, t);
      whistle.frequency.exponentialRampToValueAtTime(1400, t + 0.32);
      whistleGain.gain.setValueAtTime(0.04, t);
      whistleGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      whistle.connect(whistleGain);
      whistleGain.connect(this.ctx.destination);
      whistle.start(t);
      whistle.stop(t + 0.33);

      // 2. Tiếng nổ trầm vang (Bass Boom) ở t + 0.30s
      const boomT = t + 0.28;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, boomT);
      osc.frequency.exponentialRampToValueAtTime(32, boomT + 0.45);
      oscGain.gain.setValueAtTime(0.32, boomT);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, boomT + 0.48);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(boomT);
      osc.stop(boomT + 0.49);

      // Tiếng nổ bung hạt (Noise burst)
      const burstSize = Math.floor(this.ctx.sampleRate * 0.22);
      const burstBuf = this.ctx.createBuffer(1, burstSize, this.ctx.sampleRate);
      const bData = burstBuf.getChannelData(0);
      for (let i = 0; i < burstSize; i++) {
        bData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.055));
      }
      const burstSrc = this.ctx.createBufferSource();
      burstSrc.buffer = burstBuf;
      const bFilter = this.ctx.createBiquadFilter();
      bFilter.type = 'lowpass';
      bFilter.frequency.setValueAtTime(750, boomT);
      const burstGain = this.ctx.createGain();
      burstGain.gain.setValueAtTime(0.22, boomT);
      burstGain.gain.exponentialRampToValueAtTime(0.0001, boomT + 0.22);
      burstSrc.connect(bFilter);
      bFilter.connect(burstGain);
      burstGain.connect(this.ctx.destination);
      burstSrc.start(boomT);

      // 3. Tiếng lách tách kim tuyến (Crackles)
      for (let i = 0; i < 6; i++) {
        const delayMs = (0.32 + 0.12 + i * 0.065 + Math.random() * 0.04) * 1000;
        setTimeout(() => {
          try {
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const cOsc = this.ctx.createOscillator();
            const cGain = this.ctx.createGain();
            cOsc.type = 'square';
            cOsc.frequency.setValueAtTime(2400 + Math.random() * 1600, now);
            cGain.gain.setValueAtTime(0.025, now);
            cGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
            cOsc.connect(cGain);
            cGain.connect(this.ctx.destination);
            cOsc.start(now);
            cOsc.stop(now + 0.022);
          } catch (e) {}
        }, delayMs);
      }
    } catch (e) {}
  }

  // Âm thanh vỡ òa tinh tú kỳ ảo khi nhấp chuột (Magic Nova Starlight Chime)
  playMagicNovaSound() {
    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const t = this.ctx.currentTime;
      const freqs = [1046.5, 1318.5, 1567.98]; // C6, E6, G6
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + idx * 0.032);
        gain.gain.setValueAtTime(0.04, t + idx * 0.032);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.032 + 0.32);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.032);
        osc.stop(t + idx * 0.032 + 0.33);
      });
    } catch (e) {}
  }

  // Âm thanh sao băng điều ước may mắn ngân vang (Wishing Star Melodic Chime)
  playWishingChime() {
    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const t = this.ctx.currentTime;
      const notes = [783.99, 1046.5, 1318.5, 1760.0]; // G5, C6, E6, A6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.065);
        gain.gain.setValueAtTime(0.075, t + i * 0.065);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.065 + 0.55);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.065);
        osc.stop(t + i * 0.065 + 0.56);
      });
    } catch (e) {}
  }

  // Tương thích ngược với các lời gọi cũ
  playTypeKeySound(char = '') {
    this.playTypewriterASMR(char);
  }
}

const audioManager = new LuxuryAudioManager();
window.audioManager = audioManager;
const bgmEl = document.getElementById('bgmAudio');
const voiceoverEl = document.getElementById('voiceoverAudio');
const voiceoverTourEl = document.getElementById('voiceoverTourAudio');
let isAudioActive = false;
let userExplicitlyPaused = false;

// Cấu hình âm lượng tiêu chuẩn: Giảm nhạc nền nhẹ nhàng (0.55), khi lồng tiếng nói thì ducking xuống 0.18
const BGM_NORMAL_VOL = 0.55;
const BGM_DUCKED_VOL = 0.18;
let currentBgmTargetVol = BGM_NORMAL_VOL;
let bgmFadeInterval = null;

function setBgmVolumeSmooth(targetVol, durationMs = 1200) {
  if (!bgmEl) return;
  if (bgmFadeInterval) clearInterval(bgmFadeInterval);
  const startVol = (typeof bgmEl.volume === 'number' && !isNaN(bgmEl.volume)) ? bgmEl.volume : BGM_NORMAL_VOL;
  const startTime = performance.now();
  currentBgmTargetVol = targetVol;

  bgmFadeInterval = setInterval(() => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    const easeProgress = 0.5 * (1 - Math.cos(Math.PI * progress));
    bgmEl.volume = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * easeProgress));
    if (progress >= 1) {
      clearInterval(bgmFadeInterval);
      bgmFadeInterval = null;
    }
  }, 30);
}

// Đảm bảo đường dẫn nguồn nhạc chính xác: ưu tiên file audio/music.mp3 hoặc Base64 offline
function ensureAudioSource() {
  if (!bgmEl) return;
  bgmEl.volume = currentBgmTargetVol;
  if (window.location.protocol === 'file:') {
    if (typeof BGM_BASE64 !== 'undefined' && BGM_BASE64 && bgmEl.src !== BGM_BASE64) {
      bgmEl.src = BGM_BASE64;
    }
    return;
  }
  if (!bgmEl.src || bgmEl.src === window.location.href || bgmEl.src.endsWith('/')) {
    bgmEl.src = 'audio/music.mp3';
  }
}

function ensureVoiceoverSource() {
  if (!voiceoverEl) return;
  if (window.location.protocol === 'file:') {
    if (typeof VOICEOVER_ENDING_BASE64 !== 'undefined' && VOICEOVER_ENDING_BASE64 && voiceoverEl.src !== VOICEOVER_ENDING_BASE64) {
      voiceoverEl.src = VOICEOVER_ENDING_BASE64;
    }
    return;
  }
  if (!voiceoverEl.src || voiceoverEl.src === window.location.href || voiceoverEl.src.endsWith('/')) {
    voiceoverEl.src = 'audio/voiceover_ending.mp3';
  }
}

if (bgmEl) {
  ensureAudioSource();
  bgmEl.addEventListener('error', (e) => {
    console.warn("audio/music.mp3 load error, fallback to embedded BGM_BASE64...", e);
    if (typeof BGM_BASE64 !== 'undefined' && BGM_BASE64 && bgmEl.src !== BGM_BASE64) {
      bgmEl.src = BGM_BASE64;
      bgmEl.load();
      if (isAudioActive || !userExplicitlyPaused) {
        bgmEl.play().then(() => {
          isAudioActive = true;
          updateAudioButtonUI(true);
          removeAutoplayPrompt();
          audioManager.stopMelody();
        }).catch(err => console.warn("Fallback play error:", err));
      }
    }
  });
}

if (voiceoverEl) {
  ensureVoiceoverSource();
  voiceoverEl.addEventListener('error', (e) => {
    console.warn("audio/voiceover_ending.mp3 load error, fallback to embedded VOICEOVER_ENDING_BASE64...", e);
    if (typeof VOICEOVER_ENDING_BASE64 !== 'undefined' && VOICEOVER_ENDING_BASE64 && voiceoverEl.src !== VOICEOVER_ENDING_BASE64) {
      voiceoverEl.src = VOICEOVER_ENDING_BASE64;
      voiceoverEl.load();
      if (window.currentActiveStage === 6 && isAudioActive) {
        voiceoverEl.play().catch(err => console.warn("Fallback voiceover error:", err));
      }
    }
  });
}

function playEndingVoiceover() {
  if (!voiceoverEl) return;
  ensureVoiceoverSource();
  voiceoverEl.volume = 1.0;
  voiceoverEl.currentTime = 0;

  // Giảm nhỏ nhạc nền (Audio Ducking) để giọng đọc truyền cảm rõ ràng, ấm áp
  setBgmVolumeSmooth(BGM_DUCKED_VOL, 1000);

  if (isAudioActive && !userExplicitlyPaused) {
    const p = voiceoverEl.play();
    if (p) {
      p.catch(err => {
        console.warn("Voiceover play note:", err);
        setBgmVolumeSmooth(BGM_NORMAL_VOL, 1000);
      });
    }
  } else {
    setBgmVolumeSmooth(BGM_NORMAL_VOL, 500);
  }

  // Khi giọng đọc kết thúc (sau 35s) -> Tự động đưa nhạc nền to dần trở lại và hiện bảng thông điệp kết
  voiceoverEl.onended = () => {
    if (window.currentActiveStage === 6) {
      setBgmVolumeSmooth(BGM_NORMAL_VOL, 1800);
      if (typeof showStage6CenterpieceAndTypewriter === 'function' && !stage6HasStartedCenterpiece) {
        stage6HasStartedCenterpiece = true;
        showStage6CenterpieceAndTypewriter();
      }
    }
  };

  // Fallback an toàn: Sau 47.0 giây tự động phục hồi âm lượng chuẩn
  setTimeout(() => {
    if (window.currentActiveStage === 6 && bgmEl && bgmEl.volume < BGM_NORMAL_VOL) {
      setBgmVolumeSmooth(BGM_NORMAL_VOL, 1500);
    }
  }, 47000);
}

function stopEndingVoiceover() {
  if (voiceoverEl) {
    try {
      voiceoverEl.pause();
      voiceoverEl.currentTime = 0;
    } catch (e) {}
  }
  setBgmVolumeSmooth(BGM_NORMAL_VOL, 800);
}

function ensureVoiceoverTourSource() {
  if (!voiceoverTourEl) return;
  if (window.location.protocol === 'file:') {
    if (typeof VOICEOVER_TOUR_BASE64 !== 'undefined' && VOICEOVER_TOUR_BASE64 && voiceoverTourEl.src !== VOICEOVER_TOUR_BASE64) {
      voiceoverTourEl.src = VOICEOVER_TOUR_BASE64;
    }
    return;
  }
  if (!voiceoverTourEl.src || voiceoverTourEl.src === window.location.href || voiceoverTourEl.src.endsWith('/')) {
    voiceoverTourEl.src = 'audio/voiceover_heart_tour.mp3';
  }
}

if (voiceoverTourEl) {
  ensureVoiceoverTourSource();
  voiceoverTourEl.addEventListener('error', (e) => {
    console.warn("audio/voiceover_heart_tour.mp3 load error, fallback to embedded VOICEOVER_TOUR_BASE64...", e);
    if (typeof VOICEOVER_TOUR_BASE64 !== 'undefined' && VOICEOVER_TOUR_BASE64 && voiceoverTourEl.src !== VOICEOVER_TOUR_BASE64) {
      voiceoverTourEl.src = VOICEOVER_TOUR_BASE64;
      voiceoverTourEl.load();
      if (window.currentActiveStage === 6 && isAudioActive && typeof stage6HeartTourCurrentIdx !== 'undefined' && stage6HeartTourCurrentIdx >= 0) {
        voiceoverTourEl.play().catch(err => console.warn("Fallback tour voiceover error:", err));
      }
    }
  });
}

function playTourVoiceover() {
  if (!voiceoverTourEl) return;
  ensureVoiceoverTourSource();
  voiceoverTourEl.volume = 1.0;
  voiceoverTourEl.currentTime = 0;

  // Giảm nhỏ nhạc nền (Audio Ducking) để giọng đọc suy ngẫm rõ nét, ấm áp
  setBgmVolumeSmooth(BGM_DUCKED_VOL, 1000);

  if (isAudioActive && !userExplicitlyPaused) {
    const p = voiceoverTourEl.play();
    if (p) {
      p.catch(err => {
        console.warn("Tour voiceover play note:", err);
        setBgmVolumeSmooth(BGM_NORMAL_VOL, 1000);
      });
    }
  } else {
    setBgmVolumeSmooth(BGM_NORMAL_VOL, 500);
  }

  // Khi giọng đọc kết thúc (sau ~83.6s) -> Tự động đưa nhạc nền to dần trở lại
  voiceoverTourEl.onended = () => {
    if (window.currentActiveStage === 6) {
      setBgmVolumeSmooth(BGM_NORMAL_VOL, 1800);
    }
  };
}

function stopTourVoiceover() {
  if (voiceoverTourEl) {
    try {
      voiceoverTourEl.pause();
      voiceoverTourEl.currentTime = 0;
    } catch (e) {}
  }
  setBgmVolumeSmooth(BGM_NORMAL_VOL, 800);
}

function updateAudioButtonUI(active) {
  const btn = document.getElementById('btnAudioToggle');
  if (!btn) return;
  if (active) {
    btn.innerHTML = '<i class="fa-solid fa-music"></i><span class="audio-wave-bars is-playing"><span></span><span></span><span></span><span></span><span></span></span>';
    btn.title = 'Tạm dừng nhạc nền';
  } else {
    btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i><span class="audio-wave-bars is-paused"><span></span><span></span><span></span><span></span><span></span></span>';
    btn.title = 'Bật nhạc nền lãng mạn';
  }
}

function removeAutoplayPrompt() {
  const prompt = document.getElementById('audioAutoplayPrompt');
  if (prompt) {
    prompt.classList.add('hide');
    setTimeout(() => {
      try { prompt.remove(); } catch (e) {}
    }, 500);
  }
}

function showAutoplayPrompt() {
  if (isAudioActive || (bgmEl && !bgmEl.paused) || userExplicitlyPaused) return;
  let prompt = document.getElementById('audioAutoplayPrompt');
  if (!prompt) {
    prompt = document.createElement('div');
    prompt.id = 'audioAutoplayPrompt';
    prompt.className = 'audio-autoplay-prompt';
    prompt.innerHTML = `
      <i class="fa-solid fa-volume-high"></i>
      <span>Chạm vào màn hình để bật nhạc nền 20/10 🎵</span>
    `;
    prompt.onclick = (e) => {
      e.stopPropagation();
      userExplicitlyPaused = false;
      playGlobalAudio();
    };
    document.body.appendChild(prompt);
  }
  prompt.classList.remove('hide');
}

function playGlobalAudio() {
  userExplicitlyPaused = false;
  ensureAudioSource();
  ensureVoiceoverSource();
  ensureVoiceoverTourSource();

  if (audioManager && audioManager.ctx && audioManager.ctx.state === 'suspended') {
    try { audioManager.ctx.resume(); } catch (e) {}
  }

  if (bgmEl) {
    if (typeof bgmEl.volume !== 'number' || isNaN(bgmEl.volume) || bgmEl.volume <= 0.01) {
      bgmEl.volume = BGM_NORMAL_VOL;
    }

    const playPromise = bgmEl.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isAudioActive = true;
        updateAudioButtonUI(true);
        removeAutoplayPrompt();
        audioManager.stopMelody();
      }).catch(err => {
        console.warn("BGM play error / blocked:", err);
        // Fallback sang BGM_BASE64 nếu trước đó đang dùng file URL và không phải do chặn autoplay
        if (typeof BGM_BASE64 !== 'undefined' && BGM_BASE64 && bgmEl.src !== BGM_BASE64 && err.name !== 'NotAllowedError') {
          bgmEl.src = BGM_BASE64;
          bgmEl.load();
          bgmEl.play().then(() => {
            isAudioActive = true;
            updateAudioButtonUI(true);
            removeAutoplayPrompt();
            audioManager.stopMelody();
          }).catch(err2 => {
            isAudioActive = false;
            updateAudioButtonUI(false);
            if (!userExplicitlyPaused) showAutoplayPrompt();
          });
        } else {
          isAudioActive = false;
          updateAudioButtonUI(false);
          if (!userExplicitlyPaused) showAutoplayPrompt();
        }
      });
    }
  } else {
    isAudioActive = true;
    updateAudioButtonUI(true);
    audioManager.startMelody();
  }

  // Nếu đang ở Stage 6 và giọng đọc đang dở dang thì tiếp tục phát
  if (window.currentActiveStage === 6 && voiceoverEl && voiceoverEl.paused && voiceoverEl.currentTime > 0 && !voiceoverEl.ended) {
    voiceoverEl.play().catch(() => {});
  }
  if (window.currentActiveStage === 6 && voiceoverTourEl && voiceoverTourEl.paused && voiceoverTourEl.currentTime > 0 && !voiceoverTourEl.ended) {
    voiceoverTourEl.play().catch(() => {});
  }
}

function pauseGlobalAudio() {
  isAudioActive = false;
  userExplicitlyPaused = true;
  updateAudioButtonUI(false);
  removeAutoplayPrompt();
  if (bgmEl && !bgmEl.paused) {
    try { bgmEl.pause(); } catch (e) {}
  }
  if (voiceoverEl && !voiceoverEl.paused) {
    try { voiceoverEl.pause(); } catch (e) {}
  }
  if (voiceoverTourEl && !voiceoverTourEl.paused) {
    try { voiceoverTourEl.pause(); } catch (e) {}
  }
  audioManager.stopMelody();
}

function toggleGlobalAudio() {
  if (bgmEl && !bgmEl.paused) {
    pauseGlobalAudio();
  } else {
    userExplicitlyPaused = false;
    playGlobalAudio();
  }
}

// Bắt tương tác người dùng toàn trang để mở khóa âm thanh ngay tức thì
function onGlobalUserInteraction(e) {
  if (e.target && (e.target.id === 'audioUploadInput' || e.target.closest('#audioUploadInput') || e.target.closest('.story-modal'))) {
    return;
  }
  if (audioManager && audioManager.ctx && audioManager.ctx.state === 'suspended') {
    try { audioManager.ctx.resume(); } catch (err) {}
  }
  if (!userExplicitlyPaused && bgmEl && bgmEl.paused) {
    playGlobalAudio();
  }
}

['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => {
  window.addEventListener(evt, onGlobalUserInteraction, { capture: true, passive: true });
});

// Thử tự động phát ngay khi vào web nếu trình duyệt cho phép autoplay
function initAutoplay() {
  ensureAudioSource();
  if (bgmEl) {
    const p = bgmEl.play();
    if (p !== undefined) {
      p.then(() => {
        isAudioActive = true;
        userExplicitlyPaused = false;
        updateAudioButtonUI(true);
        removeAutoplayPrompt();
      }).catch(() => {
        isAudioActive = false;
        updateAudioButtonUI(false);
        if (!userExplicitlyPaused) showAutoplayPrompt();
      });
    }
  }
}

setTimeout(initAutoplay, 300);

// ==========================================================
// 3. QUẢN LÝ 6 GIAI ĐOẠN (CINEMATIC STAGE CONTROLLER)
// ==========================================================
let currentActiveStage = 1;
let roseAnimId = null;
let galaxyAnimFrame = null;
let photoGalaxyAnimId = null;
let stage6AnimId = null;

let isStageSwitching = false;

function switchStage(stageNumber) {
  if (isStageSwitching && stageNumber === currentActiveStage) return;
  const prevStageNum = currentActiveStage;
  currentActiveStage = stageNumber;
  window.currentActiveStage = stageNumber;
  window.switchStage = switchStage;

  // Dừng mọi animation loops của các stage không active để giải phóng 100% CPU/GPU
  if (stageNumber !== 1 && roseAnimId) {
    cancelAnimationFrame(roseAnimId);
    roseAnimId = null;
  }
  if (stageNumber !== 3 && galaxyAnimFrame) {
    cancelAnimationFrame(galaxyAnimFrame);
    galaxyAnimFrame = null;
  }
  if (stageNumber !== 4 && photoGalaxyAnimId) {
    cancelAnimationFrame(photoGalaxyAnimId);
    photoGalaxyAnimId = null;
  }
  if (stageNumber !== 6 && stage6AnimId) {
    cancelAnimationFrame(stage6AnimId);
    stage6AnimId = null;
  }

  // Hủy mọi bộ đếm tự động chuyển cảnh đang chờ để tránh xung đột
  if (window.stage1AutoTimer) clearTimeout(window.stage1AutoTimer);
  if (window.stage2AutoTimer) clearTimeout(window.stage2AutoTimer);
  if (window.stage3AutoTimer) clearTimeout(window.stage3AutoTimer);
  if (window.stage4AutoTimer) clearTimeout(window.stage4AutoTimer);
  if (window.stage5AutoOpenTimer) clearTimeout(window.stage5AutoOpenTimer);
  if (typeof cleanupStage5Highlight === 'function') cleanupStage5Highlight();
  if (typeof clearStage6Timeline === 'function') clearStage6Timeline();
  window.stage4AutoTransitioned = false;

  // Cập nhật Stepper Timeline trên Header
  document.querySelectorAll('.step-node').forEach(node => {
    const s = parseInt(node.getAttribute('data-stage'));
    if (s === stageNumber) node.classList.add('active');
    else node.classList.remove('active');
  });

  const prevStageEl = prevStageNum ? document.getElementById(`stage${prevStageNum}`) : null;
  const nextStageEl = document.getElementById(`stage${stageNumber}`);
  const veil = document.getElementById('cosmicTransitionVeil');

  // Lần load ban đầu hoặc chuyển cùng stage: set trực tiếp
  if (!prevStageEl || prevStageNum === stageNumber) {
    for (let i = 1; i <= 6; i++) {
      const stageEl = document.getElementById(`stage${i}`);
      if (stageEl) {
        stageEl.classList.toggle('stage-active', i === stageNumber);
        stageEl.classList.remove('stage-leaving');
      }
    }
    activateStageLogic(stageNumber);
    return;
  }

  // Chuyển cảnh mượt mà giữa 2 stage (Cosmic Veil + Crossfade Dissolve)
  isStageSwitching = true;
  if (veil) veil.classList.add('active');

  prevStageEl.classList.remove('stage-active');
  prevStageEl.classList.add('stage-leaving');

  if (nextStageEl) {
    nextStageEl.classList.add('stage-active');
  }

  activateStageLogic(stageNumber);

  setTimeout(() => {
    if (veil) veil.classList.remove('active');
  }, 220);

  setTimeout(() => {
    if (prevStageEl) prevStageEl.classList.remove('stage-leaving');
    isStageSwitching = false;
  }, 480);
}

function activateStageLogic(stageNumber) {
  if (stageNumber === 1) initStage1();
  else if (stageNumber === 2) initStage2();
  else if (stageNumber === 3) initStage3();
  else if (stageNumber === 4) initStage4PhotoGalaxy();
  else if (stageNumber === 5) initStage5WaxLetter();
  else if (stageNumber === 6) initStage6HeartNames();
}

// Bắt sự kiện click vào Timeline Stepper
document.querySelectorAll('.step-node').forEach(node => {
  node.addEventListener('click', () => {
    const targetStage = parseInt(node.getAttribute('data-stage'));
    switchStage(targetStage);
  });
});

const headerBrandGroup = document.getElementById('headerBrandGroup');
if (headerBrandGroup) {
  headerBrandGroup.addEventListener('click', () => {
    switchStage(1);
  });
}

// ==========================================================
// 4. STAGE 1: BÓ HOA NỞ RỘ THREE.JS 3D SIÊU ĐIỆN ẢNH (CINEMATIC INTRO)
// ==========================================================

const ROSE_C = {
  N: 210,
  R: 3.2,
  BLOOM: 1.5,
  DIVE: 3,
  HOLD: 1.2,
  FADE: 1.2,
  Z0: 12,
  Z1: 3,
  F0: 50,
  F1: 62
};

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const rnd = (a, b) => a + Math.random() * (b - a);
const eBack = x => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2);
const eIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eOut = x => 1 - Math.pow(1 - x, 3);
const mix = (a, b, t) =>
  '#' +
  [1, 3, 5]
    .map(i => {
      const u = parseInt(a.substr(i, 2), 16);
      const v = parseInt(b.substr(i, 2), 16);
      return Math.round(u + (v - u) * t)
        .toString(16)
        .padStart(2, '0');
    })
    .join('');

/* ---------- Texture hoa vẽ bằng canvas (Procedural Flower Textures) ---------- */
function roseTex(draw) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  x.translate(128, 128);
  draw(x);
  return new THREE.CanvasTexture(c);
}

function roseGlowTex(rgb) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.35, `rgba(${rgb},.35)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function genRoseTexture(p) {
  return roseTex(x => {
    const L = 5;
    for (let l = 0; l < L; l++) {
      const r = 106 * (1 - (l / L) * 0.85);
      const n = 5 + (l % 2);
      const off = Math.random() * 6;
      const col = mix(p[0], p[1], l / (L - 1));
      for (let i = 0; i < n; i++) {
        x.save();
        x.rotate(off + (i * Math.PI * 2) / n + l * 0.5);
        x.translate(0, -r * 0.52);
        x.beginPath();
        x.ellipse(0, 0, r * 0.5, r * 0.58, 0, 0, 7);
        x.fillStyle = col;
        x.fill();
        x.globalAlpha = 0.55;
        x.strokeStyle = p[2];
        x.lineWidth = 1.5;
        x.stroke();
        x.restore();
      }
    }
    x.strokeStyle = p[2];
    x.lineWidth = 2;
    x.beginPath();
    for (let a = 0; a < 14; a += 0.2) {
      x.lineTo(Math.cos(a) * a * 1.8, Math.sin(a) * a * 1.8);
    }
    x.stroke();
  });
}

function genLilyTexture(p) {
  return roseTex(x => {
    for (let i = 0; i < 6; i++) {
      x.save();
      x.rotate((i * Math.PI) / 3);
      const g = x.createLinearGradient(0, 0, 0, -120);
      g.addColorStop(0, p[1]);
      g.addColorStop(1, p[0]);
      x.beginPath();
      x.moveTo(0, 0);
      x.bezierCurveTo(-36, -36, -36, -108, 0, -120);
      x.bezierCurveTo(36, -108, 36, -36, 0, 0);
      x.fillStyle = g;
      x.fill();
      x.strokeStyle = p[2];
      x.lineWidth = 1.2;
      x.stroke();
      x.beginPath();
      x.moveTo(0, -8);
      x.lineTo(0, -85);
      x.strokeStyle = p[1];
      x.lineWidth = 2;
      x.stroke();
      x.restore();
    }
    for (let i = 0; i < 6; i++) {
      x.save();
      x.rotate(i * 1.05 + 0.3);
      x.beginPath();
      x.moveTo(0, 0);
      x.lineTo(0, -40);
      x.strokeStyle = '#c98a3a';
      x.lineWidth = 2;
      x.stroke();
      x.beginPath();
      x.arc(0, -42, 5, 0, 7);
      x.fillStyle = '#d9a441';
      x.fill();
      x.restore();
    }
  });
}

function genHydraTexture(p) {
  return roseTex(x => {
    for (let i = 0; i < 150; i++) {
      const a = Math.random() * 7;
      const r = Math.sqrt(Math.random()) * 105;
      x.save();
      x.translate(Math.cos(a) * r, Math.sin(a) * r);
      x.rotate(Math.random() * 3);
      x.fillStyle = mix(p[0], p[1], Math.random());
      for (let k = 0; k < 4; k++) {
        x.rotate(Math.PI / 2);
        x.beginPath();
        x.ellipse(0, -5, 4.5, 6.5, 0, 0, 7);
        x.fill();
      }
      x.restore();
    }
  });
}

const ROSE_PALETTES = {
  pink: ['#fbc4d3', '#ee86a8', '#b84a6e'],
  cream: ['#fffaf0', '#f3dcc2', '#caa07a'],
  deep: ['#f08aab', '#d9467a', '#8f2149'],
  red: ['#d9534f', '#a3202e', '#5e0f1a'],
  lily: ['#ffe3ea', '#f5a3bb', '#d77a98'],
  hyd: ['#f9bfd2', '#e58bb0']
};

let ROSE_TEX = null;
function getRoseTextures() {
  if (!ROSE_TEX) {
    const P = ROSE_PALETTES;
    ROSE_TEX = [
      genRoseTexture(P.pink),
      genRoseTexture(P.pink),
      genRoseTexture(P.pink),
      genRoseTexture(P.pink),
      genHydraTexture(P.hyd),
      genRoseTexture(P.cream),
      genRoseTexture(P.cream),
      genLilyTexture(P.cream),
      genRoseTexture(P.deep),
      genRoseTexture(P.deep),
      genRoseTexture(P.red),
      genLilyTexture(P.lily)
    ];
  }
  return ROSE_TEX;
}

/* ---------- Three.js Engine Variables & State ---------- */
let roseRenderer = null;
let roseScene = null;
let roseCam = null;
let bouquetGroup = null;
let starGroup = null;
let starsPoints = null;
let dotSprite = null;
let lineMat = null;
let starPtsMat = null;
let starGlow = null;
let flowerSprites = [];
let smokeSprites = [];
let roseState = 'idle';
let roseT0 = 0;
let roseLoadT = performance.now();
let lastRoseNow = performance.now();
let roseFit = 1;
let roseSfit = 1;
roseAnimId = null;
let isRoseEngineInitialized = false;
let roseFpsCount = 0;
let roseFpsTimer = performance.now();
let currentRoseFps = 60;

function initRoseIntro3D() {
  if (isRoseEngineInitialized) return;

  const canvas = document.getElementById('roseIntroCanvas');
  const btnOpen = document.getElementById('btnRoseOpen');
  const btnReplay = document.getElementById('btnRoseReplay');
  if (!canvas) return;

  const w = window.innerWidth;
  const h = window.innerHeight;

  roseRenderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  roseRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  roseRenderer.setSize(w, h, false);
  roseRenderer.setClearColor(0x000000, 0);

  roseScene = new THREE.Scene();
  roseCam = new THREE.PerspectiveCamera(ROSE_C.F0, w / h, 0.1, 100);
  roseCam.position.z = ROSE_C.Z0;

  const ADD = THREE.AdditiveBlending;
  const gw = roseGlowTex('255,255,255');
  const textures = getRoseTextures();

  // 1. Sao nền (550 hạt)
  const sg = new THREE.BufferGeometry();
  const sa = [];
  for (let i = 0; i < 550; i++) sa.push(rnd(-14, 14), rnd(-14, 14), rnd(-8, 3));
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sa, 3));
  starsPoints = new THREE.Points(
    sg,
    new THREE.PointsMaterial({
      size: 0.14,
      map: gw,
      color: 0xcdbfff,
      transparent: true,
      depthWrite: false,
      blending: ADD
    })
  );
  roseScene.add(starsPoints);

  // 2. Chấm cam đáy
  dotSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: roseGlowTex('255,150,70'),
      transparent: true,
      blending: ADD,
      depthWrite: false
    })
  );
  dotSprite.position.y = -4.5;
  dotSprite.scale.setScalar(0.8);
  roseScene.add(dotSprite);

  // 3. Sao hoa 5 cánh bằng đường nét hình học
  starGroup = new THREE.Group();
  starGroup.position.y = -0.6;
  roseScene.add(starGroup);
  lineMat = new THREE.LineBasicMaterial({
    color: 0xd8c8ff,
    transparent: true,
    opacity: 0,
    blending: ADD,
    depthWrite: false
  });
  const ptsArr = [];
  for (let i = 0; i < 5; i++) {
    for (let k = 0; k < 7; k++) {
      const s = 1 - k * 0.13;
      const L = 2 * s;
      const sw = 0.62 * s;
      const a = (i * Math.PI * 2) / 5;
      const ca = Math.cos(a);
      const sa2 = Math.sin(a);
      const v = [];
      for (let u = 0; u <= 40; u++) v.push([sw * Math.pow(Math.sin((Math.PI * u) / 40), 0.85), (u / 40) * L]);
      for (let u = 40; u >= 0; u--) v.push([-sw * Math.pow(Math.sin((Math.PI * u) / 40), 0.85), (u / 40) * L]);
      const pts = v.map(([x, y]) => new THREE.Vector3(x * ca - y * sa2, x * sa2 + y * ca, 0));
      starGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
      pts.forEach((p, j) => {
        if (j % 3 === 0) ptsArr.push(p.x, p.y, 0);
      });
    }
  }
  starPtsMat = new THREE.PointsMaterial({
    size: 0.09,
    map: gw,
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: ADD
  });
  const sgeo = new THREE.BufferGeometry();
  sgeo.setAttribute('position', new THREE.Float32BufferAttribute(ptsArr, 3));
  starGroup.add(new THREE.Points(sgeo, starPtsMat));

  starGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: roseGlowTex('150,110,255'),
      transparent: true,
      opacity: 0,
      blending: ADD,
      depthWrite: false
    })
  );
  starGlow.scale.setScalar(6);
  starGroup.add(starGlow);

  // 4. Bó hoa (210 sprites)
  bouquetGroup = new THREE.Group();
  bouquetGroup.position.y = -0.6;
  roseScene.add(bouquetGroup);
  flowerSprites = [];
  for (let i = 0; i < ROSE_C.N; i++) {
    const r = Math.cbrt(Math.random());
    const th = Math.random() * 6.283;
    const ph = Math.acos(rnd(-1, 1));
    const t = new THREE.Vector3(
      Math.sin(ph) * Math.cos(th),
      Math.cos(ph) * 1.1,
      Math.sin(ph) * Math.sin(th)
    ).multiplyScalar(ROSE_C.R * r);
    const m = new THREE.SpriteMaterial({
      map: textures[Math.floor(Math.random() * textures.length)],
      transparent: true,
      opacity: 0,
      depthWrite: false,
      rotation: rnd(0, 6.28)
    });
    m.color.setScalar(0.72 + 0.28 * r);
    const s = new THREE.Sprite(m);
    s.visible = false;
    bouquetGroup.add(s);
    flowerSprites.push({
      s,
      t,
      r,
      size: 0.9 + 0.9 * r + rnd(0, 0.3),
      delay: rnd(0, 0.5) + 0.15 * r,
      dur: rnd(0.7, 1),
      spin: rnd(-0.2, 0.2),
      rot: m.rotation,
      ph: rnd(0, 6.28)
    });
  }

  // 5. 36 Sprite khói tan bồng bềnh
  smokeSprites = [];
  for (let i = 0; i < 36; i++) {
    const m = new THREE.SpriteMaterial({
      map: roseGlowTex(i % 2 ? '255,158,192' : '155,107,255'),
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const s = new THREE.Sprite(m);
    s.position.set(rnd(-3.5, 3.5), rnd(-5, 5), rnd(-1.5, 1.5));
    roseScene.add(s);
    smokeSprites.push({ s, m, y0: s.position.y, k: rnd(0.6, 1.2) });
  }

  isRoseEngineInitialized = true;
  resizeRoseIntro();
  window.addEventListener('resize', resizeRoseIntro);

  if (btnOpen) {
    btnOpen.onclick = (e) => {
      e.stopPropagation();
      userExplicitlyPaused = false;
      playGlobalAudio();
      startRoseBloom();
    };
    setTimeout(() => {
      if (roseState === 'idle') btnOpen.classList.add('on');
    }, 400);
  }

  if (btnReplay) {
    btnReplay.onclick = (e) => {
      e.stopPropagation();
      replayRoseIntro();
    };
  }

  canvas.addEventListener('click', () => {
    if (roseState === 'idle') {
      userExplicitlyPaused = false;
      playGlobalAudio();
      startRoseBloom();
    }
  });

  const stage1El = document.getElementById('stage1');
  if (stage1El) {
    stage1El.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.story-modal')) return;
      if (roseState === 'idle') {
        userExplicitlyPaused = false;
        playGlobalAudio();
        startRoseBloom();
      }
    });
  }

  // Tự động bung nở bó hoa sau 1.8s mở web để trải nghiệm mượt mà không bị kẹt
  setTimeout(() => {
    if (roseState === 'idle') {
      startRoseBloom();
    }
  }, 1800);
}

function resizeRoseIntro() {
  if (!roseRenderer || !roseCam) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  roseRenderer.setSize(w, h, false);
  roseCam.aspect = w / h;
  roseCam.updateProjectionMatrix();
  roseFit = Math.min(0.85, roseCam.aspect * 1.35);
  roseSfit = clamp(roseCam.aspect, 0.4, 1.1);
}

function startRoseBloom() {
  if (roseState === 'running') return;
  try {
    if (!userExplicitlyPaused && bgmEl && bgmEl.paused) {
      playGlobalAudio();
    }
  } catch (e) {}
  if (roseState === 'done') {
    flowerSprites.forEach(f => {
      f.s.visible = false;
      f.s.material.opacity = 0;
    });
    smokeSprites.forEach(o => (o.m.opacity = 0));
    if (bouquetGroup) bouquetGroup.rotation.y = 0;
    roseLoadT = 0;
    const actionWrap = document.getElementById('stage1Action');
    if (actionWrap) actionWrap.classList.remove('show-btn');
  }
  const btnOpen = document.getElementById('btnRoseOpen');
  if (btnOpen) btnOpen.classList.remove('on');
  roseState = 'running';
  roseT0 = performance.now();
}

function replayRoseIntro() {
  console.log("🌸 Replaying Rose Intro Timeline...");
  const headerOverlay = document.getElementById('flowerHeaderOverlay');
  if (headerOverlay) headerOverlay.classList.remove('fade-out');
  startRoseBloom();
}

function updateRoseDebugHUD(elapsed) {
  const hud = document.getElementById('roseDebugHud');
  if (!hud) return;
  if (!CONFIG.DEBUG) {
    hud.style.display = 'none';
    return;
  }
  hud.style.display = 'block';

  roseFpsCount++;
  const now = performance.now();
  if (now - roseFpsTimer >= 500) {
    currentRoseFps = Math.round((roseFpsCount * 1000) / (now - roseFpsTimer));
    roseFpsCount = 0;
    roseFpsTimer = now;
  }

  const fpsEl = document.getElementById('debugFps');
  const phaseEl = document.getElementById('debugPhase');
  const timeEl = document.getElementById('debugTime');
  if (fpsEl) fpsEl.textContent = currentRoseFps;
  if (timeEl) timeEl.textContent = `${elapsed.toFixed(1)}s / 7.2s`;

  if (phaseEl) {
    if (roseState === 'idle') {
      phaseEl.textContent = 'CHỜ BẮT ĐẦU (Sao ma thuật xoay)';
      phaseEl.style.color = '#c084fc';
    } else if (elapsed < ROSE_C.BLOOM) {
      phaseEl.textContent = 'PHA 2: Nở Bung Cụm Hoa (Back.out)';
      phaseEl.style.color = '#f472b6';
    } else if (elapsed < ROSE_C.BLOOM + ROSE_C.DIVE) {
      phaseEl.textContent = 'PHA 3: Camera Lao Vào (Dolly z=12→3)';
      phaseEl.style.color = '#fde047';
    } else if (elapsed < ROSE_C.BLOOM + ROSE_C.DIVE + ROSE_C.HOLD + ROSE_C.FADE) {
      phaseEl.textContent = 'PHA 4: Hoa Tan Thành Khói & Sao Hiện';
      phaseEl.style.color = '#38bdf8';
    } else {
      phaseEl.textContent = 'HOÀN TẤT: Sẵn sàng sang màn 2';
      phaseEl.style.color = '#4ade80';
    }
  }
}

function frameRoseIntro(now) {
  if (window.currentActiveStage !== 1) {
    roseAnimId = null;
    return;
  }
  roseAnimId = requestAnimationFrame(frameRoseIntro);

  const dt = Math.min((now - lastRoseNow) / 1000, 0.05);
  lastRoseNow = now;
  const ck = now / 1000;

  if (!roseScene || !roseCam || !roseRenderer) return;

  const curW = window.innerWidth;
  const curH = window.innerHeight;
  if (curW > 0 && curH > 0 && (curW !== roseRenderer.domElement.width || curH !== roseRenderer.domElement.height)) {
    resizeRoseIntro();
  }

  starsPoints.rotation.y += dt * 0.01;
  starsPoints.material.opacity = 0;
  let starA = 0;
  let wallA = 0;
  let starS = 1;
  const twinkle = 0.55 + 0.25 * Math.sin(ck * 1.7);

  if (roseState === 'idle') {
    starA = clamp((now - roseLoadT) / 1200) * (0.8 + 0.2 * Math.sin(ck * 4));
    starGroup.rotation.z += dt * 0.15;
  } else if (roseState === 'running') {
    const t = (now - roseT0) / 1000;
    starGroup.rotation.z += dt * 0.15;

    // Khi camera bắt đầu lao vào (Pha 3), mờ dần tiêu đề để hoa ngập tràn toàn màn hình
    const headerOverlay = document.getElementById('flowerHeaderOverlay');
    if (headerOverlay) {
      if (t >= ROSE_C.BLOOM && t < ROSE_C.BLOOM + ROSE_C.DIVE + ROSE_C.HOLD) {
        headerOverlay.classList.add('fade-out');
      } else {
        headerOverlay.classList.remove('fade-out');
      }
    }

    // Pha 2: Nở thành cụm
    starA = 1 - clamp(t / 0.5);
    starS = t < 0.2 ? 1 - 0.15 * (t / 0.2) : 0.85 + 0.75 * eOut(clamp((t - 0.2) / 0.5));
    for (const f of flowerSprites) {
      const p = clamp((t - f.delay) / f.dur);
      if (p <= 0) continue;
      const e = eBack(p);
      f.s.visible = true;
      f.s.position.copy(f.t).multiplyScalar(e);
      f.s.position.y += Math.sin(ck * 1.5 + f.ph) * 0.05 * p;
      f.s.scale.setScalar(f.size * Math.max(e, 0.01));
      f.s.material.rotation = f.rot + ck * f.spin;
      f.s.material.opacity = clamp(p * 3);
    }

    // Pha 3: Camera lao vào
    const q = clamp((t - ROSE_C.BLOOM) / ROSE_C.DIVE);
    const e3 = eIO(q);
    roseCam.position.z = ROSE_C.Z0 + (ROSE_C.Z1 - ROSE_C.Z0) * e3;
    roseCam.fov = ROSE_C.F0 + (ROSE_C.F1 - ROSE_C.F0) * e3;
    roseCam.updateProjectionMatrix();
    bouquetGroup.rotation.y = t * 0.4;
    bouquetGroup.scale.setScalar(roseFit * (1 + 0.6 * e3));
    wallA = 0.9 * clamp((q - 0.45) / 0.4);

    // Pha 4: Tan thành khói
    const fp = clamp((t - ROSE_C.BLOOM - ROSE_C.DIVE - ROSE_C.HOLD) / ROSE_C.FADE);
    if (fp > 0) {
      for (const f of flowerSprites) {
        f.s.material.opacity = 1 - clamp((fp - f.r * 0.3) / 0.7);
      }
      wallA *= 1 - eOut(fp);
      smokeSprites.forEach(o => {
        o.m.opacity = 0.45 * Math.sin(Math.PI * fp) * o.k;
        o.s.scale.setScalar(3 + fp * 4 * o.k);
        o.s.position.y = o.y0 + fp * 0.8;
      });
    }

    if (fp >= 1) {
      roseState = 'done';
      const headerOverlay = document.getElementById('flowerHeaderOverlay');
      if (headerOverlay) headerOverlay.classList.remove('fade-out');
      const btnOpen = document.getElementById('btnRoseOpen');
      if (btnOpen) btnOpen.classList.remove('on');
      roseCam.position.z = ROSE_C.Z0;
      roseCam.fov = ROSE_C.F0;
      roseCam.updateProjectionMatrix();
      flowerSprites.forEach(f => (f.s.visible = false));
      smokeSprites.forEach(o => (o.m.opacity = 0));
      bouquetGroup.scale.setScalar(roseFit);

      if (typeof window.onRoseIntroDone === 'function') {
        window.onRoseIntroDone();
      }
    }
  }

  if (roseState === 'idle') bouquetGroup.scale.setScalar(roseFit);
  starGroup.scale.setScalar(roseSfit * starS);
  lineMat.opacity = starA * (0.7 + 0.3 * Math.sin(ck * 4));
  starPtsMat.opacity = starA;
  starGlow.material.opacity = starA * 0.5;

  dotSprite.material.opacity = (roseState === 'running' ? 0.4 : 0.5 + 0.4 * Math.sin(ck * 3)) * (1 - wallA);
  starsPoints.material.opacity = twinkle * (1 - wallA);

  const wall = document.getElementById('roseWall');
  if (wall) wall.style.opacity = wallA;

  roseCam.lookAt(0, -0.6, 0);
  roseRenderer.render(roseScene, roseCam);

  if (CONFIG.DEBUG) {
    updateRoseDebugHUD(roseState === 'running' ? (now - roseT0) / 1000 : 0);
  }
}

// Sự kiện hoàn tất Intro (chuyển tiếp mượt)
window.onRoseIntroDone = function () {
  console.log("🌸 Rose Intro Done -> Hiện nút Tiếp nào");
  const actionWrap = document.getElementById('stage1Action');
  if (actionWrap) {
    actionWrap.classList.add('show-btn');
  }

  // Tự động chuyển sang Stage 2 (Bóc lịch 20/10) sau 1.6s
  if (window.stage1AutoTimer) clearTimeout(window.stage1AutoTimer);
  window.stage1AutoTimer = setTimeout(() => {
    if (currentActiveStage === 1) {
      switchStage(2);
    }
  }, 1600);
};

// Khởi chạy Stage 1 khi người dùng vào màn 1
function initStage1() {
  initRoseIntro3D();
  if (!roseAnimId) {
    lastRoseNow = performance.now();
    roseAnimId = requestAnimationFrame(frameRoseIntro);
  }
}

// Phím R để replay, Phím D để bật/tắt debug HUD
window.addEventListener('keydown', e => {
  if (e.key === 'r' || e.key === 'R') {
    replayRoseIntro();
  } else if (e.key === 'd' || e.key === 'D') {
    CONFIG.DEBUG = !CONFIG.DEBUG;
    const hud = document.getElementById('roseDebugHud');
    if (hud) hud.style.display = CONFIG.DEBUG ? 'block' : 'none';
  }
});

const btnStage1Next = document.getElementById('btnStage1Next');
if (btnStage1Next) {
  btnStage1Next.addEventListener('click', () => {
    switchStage(2);
  });
}

// ==========================================================
// 5. STAGE 2: LỊCH BÓC TƯỜNG TRUYỀN THỐNG 20/10 (TRADITIONAL TEAR-OFF CALENDAR)
// ==========================================================
const CAL_DAYS = [
  [14, 'Thứ Tư'],
  [15, 'Thứ Năm'],
  [16, 'Thứ Sáu'],
  [17, 'Thứ Bảy', 1],
  [18, 'Chủ Nhật', 1],
  [19, 'Thứ Hai'],
  [20, 'Thứ Ba']
];

const CAL_INTRO_LINES = [
  'Có người nhớ mọi sinh nhật, mọi sở thích của cả nhà.',
  'Nhưng lại hay quên mất chính mình.',
  'Nên mỗi năm có một ngày, chỉ để nhớ về người ấy.',
  'Ngày ấy đang đến gần…'
];

let calContainer = null;
let calSt = null;
let calHalo = null;
let calFx = null;
let calBtn = null;
let calCap = null;
let calVeil = null;
let calLn = null;
let calSkip = null;
let btnStage2Next = null;
let calCurAnim = null;
let calSkipped = false;
let isCalRunning = false;

const calSleep = ms => new Promise(r => setTimeout(r, ms));

function buildCalPages() {
  if (!calSt) return;
  calSt.querySelectorAll('.cal-page, .page').forEach(e => e.remove());
  CAL_DAYS.forEach((d, i) => {
    const p = document.createElement('div');
    p.className = 'cal-page page' + (i === 6 ? ' final' : '');
    p.style.zIndex = 20 - i;
    p.innerHTML = `
      <div class="cal-hd hd">
        <i class="cal-hole hole"></i>
        <div><b>Tháng 10</b><span>2026</span></div>
        <i class="cal-hole hole"></i>
      </div>
      <div class="cal-num num">${d[0]}</div>
      <div class="cal-ft ft${d[2] ? ' we' : ''}">
        <span class="cal-wd wd">${d[1]}</span>
        ${i === 6 ? '<b>Ngày Phụ nữ Việt Nam</b>' : ''}
      </div>
      <div class="cal-sh sh"></div>
    `;
    calSt.appendChild(p);
  });
}

function flipCalPage(p, next, d) {
  if (!p || !next) return;
  const nextSh = next.querySelector('.cal-sh, .sh');
  if (nextSh) {
    nextSh.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: d, fill: 'forwards' });
  }
  p.animate([
    { transform: 'rotateX(0deg) translateY(0)' },
    { transform: 'rotateX(-125deg) translateY(-8px)' }
  ], { duration: d, easing: 'cubic-bezier(.55,.05,.9,.5)', fill: 'forwards' });

  try {
    if (window.audioManager && audioManager.playTypeKeySound) {
      audioManager.playTypeKeySound();
    }
  } catch (e) {}
}

function bloomCalPetals() {
  if (!calSt || !calFx) return;
  const r = calSt.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height * 0.45;
  const cols = ['#f7a8c0', '#e0517f', '#ffd1dc', '#f2c05c', '#ff69b4'];

  for (let i = 0; i < 36; i++) {
    const e = document.createElement('i');
    const s = 10 + Math.random() * 15;
    e.className = 'cal-pt pt';
    e.style.cssText = `left:${cx}px;top:${cy}px;width:${s}px;height:${s * 1.15}px;background:${cols[i % cols.length]}`;
    calFx.appendChild(e);

    const a = Math.random() * 6.283;
    const rad = 60 + Math.random() * 200;
    const dx = Math.cos(a) * rad;
    const dy = Math.sin(a) * rad * 0.7 - 40;
    const fall = window.innerHeight - cy + 60;

    e.animate([
      { transform: 'translate(0,0) scale(.2) rotate(0deg)', opacity: 0 },
      { transform: `translate(${dx}px,${dy}px) scale(1) rotate(${Math.random() * 240}deg)`, opacity: 1, offset: 0.25 },
      { transform: `translate(${dx * 1.5 + (Math.random() - 0.5) * 120}px,${fall}px) rotate(${400 + Math.random() * 400}deg)`, opacity: 0.9 }
    ], {
      duration: 3000 + Math.random() * 2200,
      easing: 'cubic-bezier(.2,.6,.4,1)',
      delay: Math.random() * 250,
      fill: 'forwards'
    }).onfinish = () => e.remove();
  }

  try {
    if (window.audioManager && audioManager.playCrystalChime) {
      audioManager.playCrystalChime();
    }
    if (window.confetti) {
      window.confetti({
        particleCount: 90,
        spread: 85,
        origin: { x: cx / window.innerWidth, y: cy / window.innerHeight },
        colors: ['#ff2a70', '#ffd700', '#ffffff', '#ff69b4']
      });
    }
  } catch (err) {}
}

function sayCalCap(t) {
  if (!calCap) return;
  calCap.textContent = t;
  calCap.animate([
    { opacity: 0, transform: 'translateY(10px) scale(.92)' },
    { opacity: 1, transform: 'none' }
  ], { duration: 380, fill: 'forwards' });
}

async function introCalVeil() {
  if (!calVeil || !calLn) return;
  calVeil.style.display = 'grid';
  calVeil.style.opacity = '1';
  calSkipped = false;

  for (const l of CAL_INTRO_LINES) {
    if (calSkipped || window.currentActiveStage !== 2) break;
    calLn.textContent = l;
    calCurAnim = calLn.animate([
      { opacity: 0, transform: 'translateY(16px)', filter: 'blur(8px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0)', offset: 0.28 },
      { opacity: 1, offset: 0.82 },
      { opacity: 0, transform: 'translateY(-10px)' }
    ], { duration: 3100, easing: 'ease', fill: 'forwards' });

    try {
      await calCurAnim.finished;
    } catch (e) {}
  }
}

async function dropCalBoard() {
  if (!calSt) return;
  calSt.style.opacity = '1';
  calSt.style.transformOrigin = '50% 0';

  await calSt.animate([
    { transform: 'translateY(-95vh)' },
    { transform: 'translateY(0)' }
  ], { duration: 950, easing: 'cubic-bezier(.3,1.2,.5,1)' }).finished;

  calSt.animate([
    { transform: 'rotate(0)' },
    { transform: 'rotate(3.5deg)' },
    { transform: 'rotate(-2.5deg)' },
    { transform: 'rotate(1.2deg)' },
    { transform: 'rotate(0)' }
  ], { duration: 1800, easing: 'ease-in-out' });
}

async function runCalendarTearOff(withIntro = true) {
  if (!calSt) return;
  isCalRunning = true;
  calContainer = document.querySelector('.calendar-tearoff-container');
  if (calContainer) calContainer.classList.remove('cal-on');
  if (calBtn) calBtn.disabled = true;
  if (calHalo) calHalo.style.opacity = '0';
  if (calFx) calFx.innerHTML = '';
  if (calCap) {
    calCap.getAnimations().forEach(a => a.cancel());
    calCap.textContent = '';
  }
  calSt.style.opacity = '0';

  buildCalPages();
  const ps = [...calSt.querySelectorAll('.cal-page, .page')];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    if (calVeil) calVeil.style.display = 'none';
    calSt.style.opacity = '1';
    ps.slice(0, 6).forEach(p => p.style.display = 'none');
    if (calContainer) calContainer.classList.add('cal-on');
    if (calBtn) calBtn.disabled = false;
    isCalRunning = false;
    return;
  }

  if (withIntro && calVeil) {
    await introCalVeil();
    if (window.currentActiveStage !== 2) {
      calVeil.style.display = 'none';
      isCalRunning = false;
      return;
    }
    await calVeil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1100, fill: 'forwards' }).finished;
    calVeil.style.display = 'none';
  } else if (calVeil) {
    calVeil.style.display = 'none';
  }

  if (window.currentActiveStage !== 2) {
    isCalRunning = false;
    return;
  }

  await dropCalBoard();
  sayCalCap('Còn 6 ngày');
  await calSleep(700);

  // Lật ngày 14 (vừa phải ~600ms) -> Hiện ngày 15
  if (window.currentActiveStage !== 2) { isCalRunning = false; return; }
  flipCalPage(ps[0], ps[1], 550);
  sayCalCap('Còn 5 ngày');
  await calSleep(600);

  // Lật ngày 15 (vừa phải ~600ms) -> Hiện ngày 16
  if (window.currentActiveStage !== 2) { isCalRunning = false; return; }
  flipCalPage(ps[1], ps[2], 550);
  sayCalCap('Còn 4 ngày');
  await calSleep(600);

  // Lật ngày 16 (nhanh dần ~350ms) -> Hiện ngày 17
  if (window.currentActiveStage !== 2) { isCalRunning = false; return; }
  flipCalPage(ps[2], ps[3], 320);
  sayCalCap('Còn 3 ngày');
  await calSleep(360);

  // Lật ngày 17 (nhanh dần ~350ms) -> Hiện ngày 18
  if (window.currentActiveStage !== 2) { isCalRunning = false; return; }
  flipCalPage(ps[3], ps[4], 320);
  sayCalCap('Còn 2 ngày');
  await calSleep(360);

  // Lật ngày 18 (nhanh dần ~350ms) -> Hiện ngày 19
  if (window.currentActiveStage !== 2) { isCalRunning = false; return; }
  flipCalPage(ps[4], ps[5], 320);
  sayCalCap('Và rồi…');
  // Ngày 19 chậm lại (~800ms) trước khi sang ngày 20
  await calSleep(850);

  // Lật ngày 19 sang ngày 20 rực rỡ
  if (window.currentActiveStage !== 2) { isCalRunning = false; return; }
  flipCalPage(ps[5], ps[6], 750);
  await calSleep(750);

  if (calCap) {
    calCap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' });
  }

  if (ps[6]) {
    const numEl = ps[6].querySelector('.num, .cal-num');
    if (numEl) {
      numEl.animate([
        { transform: 'scale(1.25) rotate(-4deg)' },
        { transform: 'scale(1) rotate(0deg)' }
      ], { duration: 900, easing: 'cubic-bezier(.2,1.4,.4,1)' });
    }
  }

  if (calHalo) {
    calHalo.animate([
      { opacity: 0, transform: 'scale(.6)' },
      { opacity: 1, transform: 'scale(1)' }
    ], { duration: 1400, easing: 'ease-out', fill: 'forwards' });
  }

  bloomCalPetals();

  if (calContainer) calContainer.classList.add('cal-on');
  await calSleep(1200);
  if (calBtn) calBtn.disabled = false;
  isCalRunning = false;

  // Tự động chuyển tiếp sang Stage 3 (Thiên Hà 23 Vì Tinh Tú) sau 3.5s đọc lời chúc
  if (window.stage2AutoTimer) clearTimeout(window.stage2AutoTimer);
  window.stage2AutoTimer = setTimeout(() => {
    if (currentActiveStage === 2) {
      if (calVeil) calVeil.style.display = 'none';
      switchStage(3);
    }
  }, 3500);
}

function initStage2() {
  calSt = document.getElementById('calSt');
  calHalo = document.getElementById('calHalo');
  calFx = document.getElementById('calFx');
  calBtn = document.getElementById('calBtn');
  calCap = document.getElementById('calCap');
  calVeil = document.getElementById('calVeil');
  calLn = document.getElementById('calLn');
  calSkip = document.getElementById('calSkip');
  calContainer = document.querySelector('.calendar-tearoff-container');
  btnStage2Next = document.getElementById('btnStage2Next');

  if (calSkip) {
    calSkip.onclick = () => {
      calSkipped = true;
      if (calCurAnim) calCurAnim.finish();
    };
  }

  if (calBtn) {
    calBtn.onclick = () => {
      runCalendarTearOff(false);
    };
  }

  if (btnStage2Next) {
    btnStage2Next.onclick = () => {
      if (calVeil) calVeil.style.display = 'none';
      switchStage(3);
    };
  }

  runCalendarTearOff(true);
}

// ==========================================================
// 6. STAGE 3: THIÊN HÀ NGÂN HÀ 23 VÌ TINH TÚ (INTERACTIVE SPIRAL GALAXY)
// ==========================================================
galaxyAnimFrame = null;
let isGalaxyPaused = false;
let isGalaxy3D = true;
let galaxyDustParticles = [];

// Khởi tạo hạt bụi sao cho đĩa xoắn ốc (Spiral Galaxy Canvas)
function initGalaxyDust(ctx, w, h) {
  galaxyDustParticles = [];
  const arms = 4;
  const countPerArm = 180;
  
  for (let a = 0; a < arms; a++) {
    const armAngle = (a / arms) * Math.PI * 2;
    for (let i = 0; i < countPerArm; i++) {
      const distance = 35 + Math.pow(Math.random(), 1.5) * 330;
      // Công thức xoắn ốc Logarithmic Spiral
      const curvature = 0.007;
      const angle = armAngle + distance * curvature + (Math.random() - 0.5) * 0.45;
      
      const size = Math.random() * 2.2 + 0.6;
      const colors = ['#f7e7ce', '#ffd700', '#ff69b4', '#c084fc', '#38bdf8', '#ffffff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const alpha = Math.random() * 0.7 + 0.3;
      
      galaxyDustParticles.push({ distance, angle, size, color, alpha });
    }
  }
}

let galaxyGlobalAngle = 0;

function renderGalaxyCanvas(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Lõi thiên hà gradient tỏa sáng rực rỡ
  const coreGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
  coreGrad.addColorStop(0, 'rgba(255, 235, 170, 0.45)');
  coreGrad.addColorStop(0.3, 'rgba(255, 105, 180, 0.25)');
  coreGrad.addColorStop(0.7, 'rgba(192, 132, 252, 0.1)');
  coreGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vẽ các hạt bụi sao xoắn ốc
  galaxyDustParticles.forEach(p => {
    const currentAngle = p.angle + galaxyGlobalAngle;
    const x = cx + Math.cos(currentAngle) * p.distance;
    const y = cy + Math.sin(currentAngle) * (isGalaxy3D ? p.distance * Math.cos(42 * Math.PI / 180) : p.distance);

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function initStage3() {
  const cluster = document.getElementById('galaxyStarsCluster');
  const plane = document.getElementById('galaxyOrbitPlane');
  const canvas = document.getElementById('galaxyCanvas');
  const spotlightCard = document.getElementById('galaxySpotlightCard');

  cluster.innerHTML = '';
  spotlightCard.classList.remove('show');

  // Mặc định cài đặt góc nhìn TRỰC DIỆN 2D theo yêu cầu để nhìn rõ chân dung và tên các bạn nữ
  isGalaxy3D = false;
  if (plane) {
    plane.classList.remove('view-3d');
    plane.classList.add('view-2d');
  }

  // Kích thước canvas thiên hà
  canvas.width = canvas.parentElement.clientWidth || 880;
  canvas.height = canvas.parentElement.clientHeight || 490;
  const ctx = canvas.getContext('2d');
  initGalaxyDust(ctx, canvas.width, canvas.height);

  // Phân bổ 23 bạn nữ trên 3 quỹ đạo rõ ràng, đồng tốc êm ái, khoảng cách cân đối hoàn hảo
  const ORBIT_TRACKS = [
    { radius: 145, speed: 0.00045, startIndex: 0, count: 5, offset: 0 },
    { radius: 228, speed: 0.00045, startIndex: 5, count: 8, offset: (22 * Math.PI) / 180 },
    { radius: 312, speed: 0.00045, startIndex: 13, count: 10, offset: 0 }
  ];

  const girlNodes = [];

  ORBIT_TRACKS.forEach(track => {
    for (let i = 0; i < track.count; i++) {
      const girlIndex = track.startIndex + i;
      if (girlIndex >= FEMALE_STUDENTS.length) break;
      const girl = FEMALE_STUDENTS[girlIndex];
      const photoUrl = getStudentPhoto(girl, girlIndex);
      const shortName = getStudentShortName(girl);

      const initialAngle = track.offset + (i / track.count) * Math.PI * 2;

      const node = document.createElement('div');
      node.className = 'star-planet-node';
      node.innerHTML = `
        <div class="node-avatar-orb">
          <img src="${photoUrl}" alt="${girl.name}">
        </div>
        <div class="node-name-pill" title="${girl.name}">
          <i class="fa-solid fa-star"></i>
          <span>${shortName}</span>
        </div>
      `;

      // Hover / Click mở Spotlight Card chi tiết
      node.addEventListener('mouseenter', () => {
        showGirlSpotlight(girl, photoUrl);
      });

      node.addEventListener('click', () => {
        showGirlSpotlight(girl, photoUrl);
        if (window.confetti) {
          window.confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
        }
      });

      cluster.appendChild(node);

      girlNodes.push({
        el: node,
        radius: track.radius,
        speed: track.speed,
        angle: initialAngle
      });
    }
  });

  function showGirlSpotlight(girl, photoUrl) {
    const avatarEl = document.getElementById('spotlightAvatar');
    if (avatarEl) {
      avatarEl.src = photoUrl;
      avatarEl.alt = girl.name;
      avatarEl.title = "Bấm để xem ảnh gốc kích thước lớn (không cắt/không méo)";
      avatarEl.style.cursor = "zoom-in";
      avatarEl.onclick = () => openOriginalPhotoLightbox(girl, photoUrl);
    }
    document.getElementById('spotlightTag').innerHTML = `<i class="fa-solid fa-crown"></i> ${girl.title || 'Nàng Thơ Lớp Mình'}`;
    document.getElementById('spotlightName').textContent = girl.name;
    document.getElementById('spotlightDob').innerHTML = `<i class="fa-regular fa-calendar"></i> Sinh nhật: ${girl.dob}`;
    document.getElementById('spotlightWish').textContent = `"${girl.wish}"`;
    spotlightCard.classList.add('show');
  }

  document.getElementById('btnCloseSpotlight').onclick = () => {
    spotlightCard.classList.remove('show');
  };

  // Nút chuyển góc 3D / 2D
  const btnAngle = document.getElementById('btnToggleGalaxyAngle');
  const angleText = document.getElementById('galaxyAngleText');
  if (btnAngle && angleText) {
    btnAngle.classList.remove('active');
    angleText.textContent = "Góc Trực Diện 2D";
    btnAngle.onclick = () => {
      isGalaxy3D = !isGalaxy3D;
      if (isGalaxy3D) {
        plane.classList.add('view-3d');
        plane.classList.remove('view-2d');
        btnAngle.classList.add('active');
        angleText.textContent = "Góc Nghiêng 3D";
      } else {
        plane.classList.remove('view-3d');
        plane.classList.add('view-2d');
        btnAngle.classList.remove('active');
        angleText.textContent = "Góc Trực Diện 2D";
      }
    };
  }

  // Nút tạm dừng / tiếp tục xoay
  const btnOrbit = document.getElementById('btnToggleGalaxyOrbit');
  if (btnOrbit) {
    btnOrbit.onclick = () => {
      isGalaxyPaused = !isGalaxyPaused;
      if (isGalaxyPaused) {
        btnOrbit.innerHTML = '<i class="fa-solid fa-play"></i> <span id="galaxyOrbitText">Tạm Dừng</span>';
      } else {
        btnOrbit.innerHTML = '<i class="fa-solid fa-pause"></i> <span id="galaxyOrbitText">Đang Xoay</span>';
      }
    };
  }

  // Vòng lặp chuyển động thiên hà xoay thời gian thực
  if (galaxyAnimFrame) cancelAnimationFrame(galaxyAnimFrame);

  function animateGalaxy() {
    if (currentActiveStage === 3) {
      if (!isGalaxyPaused) {
        galaxyGlobalAngle += 0.00045;

        // Cập nhật tọa độ từng bạn nữ trên quỹ đạo thiên hà
        girlNodes.forEach(item => {
          item.angle += item.speed;
          const x = Math.cos(item.angle) * item.radius;
          const y = Math.sin(item.angle) * item.radius;

          // Counter-rotate trục X và bù trừ -22px để tâm avatar orb 44px nằm chính xác trên quỹ đạo
          if (isGalaxy3D) {
            item.el.style.transform = `translate3d(${x - 22}px, ${y - 22}px, 0px) rotateX(-42deg)`;
          } else {
            item.el.style.transform = `translate3d(${x - 22}px, ${y - 22}px, 0px) rotateX(0deg)`;
          }
        });
      }

      renderGalaxyCanvas(ctx, canvas);
      galaxyAnimFrame = requestAnimationFrame(animateGalaxy);
    } else {
      galaxyAnimFrame = null;
    }
  }
  animateGalaxy();

  // Tự động xoay 10 giây ở góc trực diện rồi tự động chuyển sang Stage 4!
  if (window.stage3AutoTimer) clearTimeout(window.stage3AutoTimer);
  window.stage3AutoTimer = setTimeout(() => {
    if (currentActiveStage === 3) {
      runStage3WarpTransition();
    }
  }, 10000);
}

// ==========================================================
// CHUYỂN CẢNH ĐIỆN ẢNH TỪ STAGE 3 (THIÊN HÀ) SANG STAGE 4 (QUẢ CẦU & TƯỜNG ẢNH)
// Tối ưu 60fps: Sử dụng GPU Hardware Layer (translateZ), không dùng filter blur
// ==========================================================
function runStage3WarpTransition() {
  // 1. Âm thanh tinh thể vang vọng vũ trụ
  audioManager.playCrystalChime();

  // 2. Hiệu ứng Warp Drive gia tốc xoay & phóng to các tinh tú trên quỹ đạo
  const orbitPlane = document.getElementById('galaxyOrbitPlane');
  const ripple = document.getElementById('screenRipple');
  const flash = document.getElementById('photoGalaxyFlash');

  if (orbitPlane) {
    orbitPlane.style.willChange = 'transform, opacity';
    orbitPlane.style.transition = 'transform 0.42s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.42s ease-out';
    orbitPlane.style.transform = 'scale(2.2) translateZ(0)';
    orbitPlane.style.opacity = '0';
  }

  // 3. Sóng xung kích ripple toàn màn hình
  if (ripple) {
    ripple.classList.remove('active');
    void ripple.offsetWidth;
    ripple.classList.add('active');
  }

  // 4. Flash hào quang
  if (flash) {
    flash.style.opacity = '0.85';
  }

  // 5. Chuyển sang Stage 4 sau khi hiệu ứng warp đạt đỉnh điểm (380ms)
  setTimeout(() => {
    if (orbitPlane) {
      orbitPlane.style.willChange = '';
      orbitPlane.style.transition = '';
      orbitPlane.style.transform = '';
      orbitPlane.style.opacity = '';
    }
    if (flash) {
      flash.style.opacity = '0';
    }
    switchStage(4);
  }, 380);
}

const btnStage3Next = document.getElementById('btnStage3Next');
if (btnStage3Next) {
  btnStage3Next.addEventListener('click', runStage3WarpTransition);
}

// ==========================================================
// 8. STAGE 4: QUẢ CẦU & BỨC TƯỜNG KỶ NIỆM (THREE.JS PHOTO GALAXY)
// Tối ưu hóa 60FPS: Pre-warming, bộ đệm kết cấu 384px, giảm drawcall và số đỉnh
// ==========================================================
let photoGalaxyInitialized = false;
photoGalaxyAnimId = null;
let photoGalaxyRestartFn = null;

function initStage4PhotoGalaxy() {
  if (!photoGalaxyInitialized) {
    photoGalaxyInitialized = true;
    setupPhotoGalaxyScene(false);
  } else if (photoGalaxyRestartFn) {
    photoGalaxyRestartFn();
  }
}

function setupPhotoGalaxyScene(preWarmOnly = false) {
  const PG_CONFIG = {
    PLACEHOLDER_COUNT: 23,
    SPEED: 0.70,
    BORDER_COLOR: '#ecd2da',
    SPHERE_R: 10,
    TIMELINE: { intro: 2.2, fly: 2.7, gather: 2.2, sphere: 5.4, burst: 1.8, wall: 2.7, hold: 10.0, out: 1.6 },
    LYRICS: [
      { t: 1.5,  d: 2.4, text: 'Vũ trụ bao la với hàng triệu vì sao lấp lánh...' },
      { t: 4.8,  d: 2.8, text: 'Nhưng rực rỡ nhất vẫn là 23 đóa hoa của tập thể lớp chúng mình 🌸' },
      { t: 8.5,  d: 3.2, text: 'Mỗi nụ cười, mỗi kỷ niệm đều tỏa sáng lấp lánh như viên ngọc quý ✨' },
      { t: 13.5, d: 3.2, text: 'Cảm ơn các bạn vì đã luôn mang lại nụ cười và sự ấm áp tuyệt vời! ❤️' },
      { t: 18.0, d: 3.8, text: 'Chúc 23 bạn nữ ngày 20/10 ngập tràn niềm vui và hạnh phúc đong đầy 💌' }
    ]
  };

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeOutBack = t => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);

  function mulberry(seed) {
    return function() {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry(20102026);
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Timeline
  const TL = {};
  let TOTAL = 0;
  for (const k of ['intro', 'fly', 'gather', 'sphere', 'burst', 'wall', 'hold', 'out']) {
    TL[k] = [TOTAL, TOTAL + PG_CONFIG.TIMELINE[k]];
    TOTAL += PG_CONFIG.TIMELINE[k];
  }
  const prog = (k, t) => clamp((t - TL[k][0]) / (TL[k][1] - TL[k][0]));

  // Renderer & Scene
  const BASE_FOV = 68;
  const canvas = document.getElementById('photoGalaxyCanvas');
  const flashEl = document.getElementById('photoGalaxyFlash');
  const subEl = document.getElementById('photoGalaxySub');
  const small = window.innerWidth < 700;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance'
  });
  renderer.autoClear = false;
  renderer.setClearColor(0x010104, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.1, 3000);

  // Fade trail motion scene
  const fadeScene = new THREE.Scene();
  const fadeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const fadeMat = new THREE.MeshBasicMaterial({
    color: 0x010104,
    transparent: true,
    opacity: 1,
    depthTest: false,
    depthWrite: false
  });
  fadeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fadeMat));

  // Radial texture helper
  function radialTex(stops, size = 128) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr;
    g.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }
  const dotTex = radialTex([
    [0, 'rgba(255,255,255,1)'],
    [0.35, 'rgba(255,255,255,.8)'],
    [1, 'rgba(255,255,255,0)']
  ]);

  // Star particle systems (Tối ưu số lượng hạt cho 60fps mượt mà)
  const starMats = [];
  function makeStars(n, rmin, rmax, size) {
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const sz = new Float32Array(n);
    const ph = new Float32Array(n);
    const sp = new Float32Array(n);
    const pal = ['#ffffff', '#bcd2ff', '#d9c2ff', '#ffe0bd'].map(c => new THREE.Color(c));

    for (let i = 0; i < n; i++) {
      const r = lerp(rmin, rmax, Math.random());
      const th = Math.random() * 6.283;
      const p2 = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(p2) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(p2);
      pos[i * 3 + 2] = r * Math.sin(p2) * Math.sin(th);

      const c = pal[Math.floor(Math.random() * 4)];
      const k = 0.5 + Math.random() * 0.5;
      col[i * 3] = c.r * k;
      col[i * 3 + 1] = c.g * k;
      col[i * 3 + 2] = c.b * k;

      sz[i] = size * (0.5 + Math.random() * 1.1 + Math.pow(Math.random(), 9) * 3.2);
      ph[i] = Math.random() * 6.283;
      sp[i] = 0.8 + Math.random() * 3.4;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
    g.setAttribute('aSpeed', new THREE.BufferAttribute(sp, 1));

    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uScale: { value: 400 } },
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSize, aPhase, aSpeed;
        uniform float uTime, uScale;
        varying vec3 vC;
        varying float vT;
        void main() {
          vC = color;
          float s = .5 + .5 * sin(uTime * aSpeed + aPhase);
          vT = .25 + .75 * s * s;
          vec4 mv = modelViewMatrix * vec4(position, 1.);
          gl_PointSize = min(64., aSize * (uScale / -mv.z) * (.75 + .5 * vT));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vC;
        varying float vT;
        void main() {
          vec2 d = gl_PointCoord - .5;
          float r = length(d);
          float core = pow(smoothstep(.5, 0., r), 2.2);
          float ray = (max(0., 1. - abs(d.x) * 16.) * max(0., 1. - abs(d.y) * 2.) +
                       max(0., 1. - abs(d.y) * 16.) * max(0., 1. - abs(d.x) * 2.)) * .5 * vT * vT;
          gl_FragColor = vec4(vC * (core * vT + ray), 1.);
        }
      `
    });
    starMats.push(m);
    return new THREE.Points(g, m);
  }

  const starsFar = makeStars(3200, 300, 900, 3.2);
  const starsNear = makeStars(500, 60, 220, 0.8);
  scene.add(starsFar, starsNear);

  // Background Nebula
  const nebula = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTex(
        [
          [0, 'rgba(95,40,150,.55)'],
          [0.5, 'rgba(60,25,110,.22)'],
          [1, 'rgba(0,0,0,0)']
        ],
        256
      ),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  nebula.material.opacity = 0.3;
  nebula.position.set(0, -40, -260);
  nebula.scale.set(900, 700, 1);
  scene.add(nebula);

  // Shooting Meteor
  const metTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 8;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 256, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)');
    gr.addColorStop(1, 'rgba(255,255,255,1)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 8);
    return new THREE.CanvasTexture(c);
  })();

  const meteor = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: metTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  meteor.visible = false;
  camera.add(meteor);
  scene.add(camera);

  let metT = -1, metNext = 2.5, metU = {};
  function updateMeteor(dt) {
    metNext -= dt;
    if (metT < 0 && metNext <= 0) {
      const H = 2 * 200 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const Wd = H * camera.aspect;
      metU = { x: Math.random() * 0.5 * Wd, y: (0.1 + Math.random() * 0.35) * H, a: Math.PI + 0.45 + Math.random() * 0.25, Wd };
      metT = 0;
      metNext = 3 + Math.random() * 5;
      meteor.visible = true;
      meteor.scale.set(36, 0.4, 1);
      meteor.rotation.z = metU.a;
    }
    if (metT >= 0) {
      metT += dt;
      const k = metT / 1.1;
      if (k >= 1) {
        metT = -1;
        meteor.visible = false;
        return;
      }
      meteor.position.set(metU.x + Math.cos(metU.a) * k * 0.7 * metU.Wd, metU.y + Math.sin(metU.a) * k * 0.7 * metU.Wd, -200);
      meteor.material.opacity = Math.sin(Math.PI * k);
    }
  }

  // Sphere Glow
  const sGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTex(
        [
          [0, 'rgba(255,190,220,.55)'],
          [0.45, 'rgba(170,110,255,.2)'],
          [1, 'rgba(0,0,0,0)']
        ],
        256
      ),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0
    })
  );
  sGlow.position.set(0, 0, -PG_CONFIG.SPHERE_R * 1.3);
  sGlow.scale.set(PG_CONFIG.SPHERE_R * 3.6, PG_CONFIG.SPHERE_R * 3.6, 1);
  scene.add(sGlow);

  // Galaxy Disk & Core (Tối ưu 4500 hạt)
  const galaxy = new THREE.Group();
  scene.add(galaxy);

  const gCore = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTex(
        [
          [0, 'rgba(255,255,255,1)'],
          [0.08, 'rgba(255,236,200,.95)'],
          [0.25, 'rgba(255,160,90,.35)'],
          [0.6, 'rgba(120,60,200,.12)'],
          [1, 'rgba(0,0,0,0)']
        ],
        256
      ),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  gCore.scale.set(9, 9, 1);

  const gHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTex(
        [
          [0, 'rgba(140,80,230,.5)'],
          [0.5, 'rgba(90,40,170,.18)'],
          [1, 'rgba(0,0,0,0)']
        ],
        256
      ),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.55
    })
  );
  gHalo.scale.set(70, 40, 1);

  function makeDisc(n, radius) {
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const c1 = new THREE.Color('#fff4d6');
    const c2 = new THREE.Color('#9b6bff');
    const c3 = new THREE.Color('#4a63ff');
    const c = new THREE.Color();

    for (let i = 0; i < n; i++) {
      const r = Math.pow(Math.random(), 1.5) * radius;
      const k = r / radius;
      const arm = Math.floor(Math.random() * 3);
      const ang = arm * (Math.PI * 2 / 3) + r * 0.38 + (Math.random() - 0.5) * (0.5 + 0.9 * k);
      pos[i * 3] = Math.cos(ang) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * radius * 0.05 * (1.3 - k);
      pos[i * 3 + 2] = Math.sin(ang) * r;

      if (k < 0.35) c.copy(c1).lerp(c2, k / 0.35);
      else c.copy(c2).lerp(c3, (k - 0.35) / 0.65);

      const b = 1.15 - k * 0.65;
      col[i * 3] = c.r * b;
      col[i * 3 + 1] = c.g * b;
      col[i * 3 + 2] = c.b * b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Points(
      g,
      new THREE.PointsMaterial({
        size: 0.45,
        map: dotTex,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      })
    );
  }

  const gDisc = makeDisc(4500, 15);
  const gDiscGroup = new THREE.Group();
  gDiscGroup.add(gDisc);
  gDiscGroup.rotation.x = 1.35;
  gDiscGroup.rotation.z = 0.25;
  galaxy.add(gHalo, gDiscGroup, gCore);

  // 23 Personalized Female Student Photo Textures (Hiển thị trọn vẹn 100% ảnh chân dung, không che tên)
  const TW = 320, TH = 384, ASPECT = TW / TH;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  function drawStudentPhotoCard(ctx, student, i, img) {
    const border = 6;
    // Khung viền màu vàng hồng champagne sang trọng
    const borderGrad = ctx.createLinearGradient(0, 0, TW, TH);
    borderGrad.addColorStop(0, '#fff0f3');
    borderGrad.addColorStop(0.5, '#ffd1dc');
    borderGrad.addColorStop(1, '#fbcfe8');
    ctx.fillStyle = borderGrad;
    ctx.fillRect(0, 0, TW, TH);

    const innerW = TW - 2 * border;
    const innerH = TH - 2 * border;

    if (img && img.complete && img.naturalWidth > 0) {
      const s = Math.max(innerW / img.width, innerH / img.height);
      const sw = innerW / s, sh = innerH / s;
      const sx = (img.width - sw) / 2;
      const cropRatioY = (typeof student.cropY === 'number') ? student.cropY : 0.22;
      const sy = Math.max(0, Math.min(img.height - sh, (img.height - sh) * cropRatioY));
      ctx.drawImage(img, sx, sy, sw, sh, border, border, innerW, innerH);

      // Viền kim loại mảnh bên trong tôn vẻ đẹp bức ảnh
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(border + 0.75, border + 0.75, innerW - 1.5, innerH - 1.5);
    } else {
      const hue = (i * 37) % 360;
      const grad = ctx.createLinearGradient(0, border, 0, TH - border);
      grad.addColorStop(0, `hsl(${hue}, 60%, 75%)`);
      grad.addColorStop(0.5, `hsl(${(hue + 25) % 360}, 55%, 50%)`);
      grad.addColorStop(1, `hsl(${(hue + 50) % 360}, 65%, 28%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(border, border, innerW, innerH);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(TW / 2, TH * 0.4, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(TW / 2, TH * 0.72, 80, 56, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 30px "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('#' + (i + 1), TW / 2, 58);
    }
  }

  const P = 23;
  const photos = [];
  for (let i = 0; i < P; i++) {
    const student = FEMALE_STUDENTS[i] || { name: `Bạn Nữ #${i + 1}`, title: 'Nàng Thơ Tỏa Sáng' };
    const cv = document.createElement('canvas');
    cv.width = TW;
    cv.height = TH;
    const ctx = cv.getContext('2d');
    drawStudentPhotoCard(ctx, student, i, null);

    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = Math.min(4, maxAniso);
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
    photos.push({ cv, ctx, tex, mat, student });

    const photoSrc = getStudentPhoto(student, i);
    const img = new Image();
    img.onload = () => {
      drawStudentPhotoCard(ctx, student, i, img);
      tex.needsUpdate = true;
    };
    img.src = photoSrc;
  }

  // 3D Tiles Layout (Phân bổ chuẩn xác 100% không sót bất kỳ bạn nữ nào)
  const R = PG_CONFIG.SPHERE_R, RW = 10.8;
  const BANDS = small ? 12 : 16;
  const WCOLS = 23; // Đúng bằng 23 bạn nữ để mỗi vòng 360° là chu kỳ hoàn hảo
  const world = new THREE.Group();
  scene.add(world);
  const geo = new THREE.PlaneGeometry(ASPECT, 1);
  const dummy = new THREE.Object3D();

  const sph = [];
  const TARGET = P * (small ? 8 : 13);
  const bandCount = (() => {
    const wts = [];
    let sum = 0;
    for (let b = 0; b < BANDS; b++) {
      const w = Math.cos(-Math.PI / 2 + (b + 0.5) * Math.PI / BANDS);
      wts.push(w);
      sum += w;
    }
    const c = wts.map(w => Math.max(3, Math.floor(TARGET * w / sum)));
    const order = [...c.keys()].sort((a, b) => wts[b] - wts[a]);
    let diff = TARGET - c.reduce((a, b) => a + b, 0);
    let k = 0;
    while (diff > 0) {
      c[order[k % BANDS]]++;
      diff--;
      k++;
    }
    k = 0;
    while (diff < 0) {
      const b = order[BANDS - 1 - (k % BANDS)];
      if (c[b] > 3) {
        c[b]--;
        diff++;
      }
      k++;
    }
    return c;
  })();

  for (let b = 0; b < BANDS; b++) {
    const lat = -Math.PI / 2 + (b + 0.5) * Math.PI / BANDS;
    const ringR = R * Math.cos(lat);
    const y = R * Math.sin(lat);
    const hBand = Math.PI * R / BANDS;
    const count = bandCount[b];
    for (let j = 0; j < count; j++) {
      const lon = (j + (b % 2) * 0.5) * 2 * Math.PI / count;
      sph.push({
        pos: new THREE.Vector3(Math.cos(lon) * ringR, y, Math.sin(lon) * ringR),
        s: Math.min((2 * Math.PI * ringR / count) / ASPECT, hBand) * 1.04
      });
    }
  }
  const N = sph.length;

  const mk = () => ({ p: new Float32Array(N * 3), q: new Float32Array(N * 4), s: new Float32Array(N) });
  const A = mk(), S = mk(), B = mk(), W = mk();
  const nA = new Float32Array(N * 3);
  const delay = new Float32Array(N);

  const meshes = [];
  // Phân bổ chuẩn xác: 5 bạn nữ trung tâm (Ái Thu, Bình An, Gia Linh, Ngọc Hân, Phương Vy) ở giữa hàng 6
  // VÀ toàn bộ 18 bạn nữ còn lại đều có mặt ngay trên khung nhìn chính diện (rows 4, 5, 6, 7)
  // để người xem chiêm ngưỡng trọn vẹn 100% cả 23 bạn nữ của lớp cùng một lúc!
  // PHÂN BỔ HOÀN HẢO 100% CẢ 23 BẠN NỮ TRÊN KHUNG NHÌN CHÍNH DIỆN:
  // - Hàng giữa (Row 6 - ngang tầm mắt): Ái Thu (19), Bình An (0), Gia Linh (6 - CHÍNH GIỮA), Ngọc Hân (2), Phương Vy (22),
  //   hai bên là Hoài Phương (16) và Thục Quyên (17).
  // - Hàng trên (Row 5): 8 bạn nữ khác biệt (Nghinh Dương, Thu Huyền, Vân Khánh, Thùy Lâm, Nhật Linh, Lisa, Bích Loan, Hiền Lương).
  // - Hàng dưới (Row 7): 8 bạn nữ khác biệt còn lại (Quỳnh Mai, Thảo My, Bảo Ngọc, Lê Thảo Nguyên, Uyên Thảo, Ngọc Thủy, Thùy Trang, Trần Thảo Nguyên).
  // => Toàn bộ 23 bạn nữ xuất hiện đầy đủ 100% không sót bất kỳ ai và HOÀN TOÀN KHÔNG CÓ AI BỊ LẶP LẠI (0% duplicates)!
  const r18 = [1, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 18, 20, 21, 15, 16, 17];

  function createRowPermutation(assignedMap) {
    const rowArr = new Array(P).fill(-1);
    const used = new Set();
    for (const [col, student] of Object.entries(assignedMap)) {
      const c = (parseInt(col) + P) % P;
      rowArr[c] = student;
      used.add(student);
    }
    const unused = [];
    for (let i = 0; i < P; i++) {
      if (!used.has(i)) unused.push(i);
    }
    let u = 0;
    for (let c = 0; c < P; c++) {
      if (rowArr[c] === -1) {
        rowArr[c] = unused[u++];
      }
    }
    return rowArr;
  }

  const row5Map = {
    19: r18[0], 20: r18[1], 21: r18[2], 22: r18[3],
    0: r18[4], 1: r18[5], 2: r18[6], 3: r18[7]
  };

  const row6Map = {
    20: r18[16], 21: 19, 22: 0, 0: 6, 1: 2, 2: 22, 3: r18[17]
  };

  const row7Map = {
    19: r18[8], 20: r18[9], 21: r18[10], 22: r18[11],
    0: r18[12], 1: r18[13], 2: r18[14], 3: r18[15]
  };

  const wallRow5 = createRowPermutation(row5Map);
  const wallRow6 = createRowPermutation(row6Map);
  const wallRow7 = createRowPermutation(row7Map);

  const wallGridRows = { 5: wallRow5, 6: wallRow6, 7: wallRow7 };

  const wallW = (2 * Math.PI * RW / WCOLS) * 0.97;
  const sW = wallW / ASPECT;
  const spacing = sW * 1.04;
  const rows = Math.ceil(N / WCOLS);
  const qTmp = new THREE.Quaternion(), eTmp = new THREE.Euler();

  for (let i = 0; i < N; i++) {
    const col = i % WCOLS;
    const row = Math.floor(i / WCOLS);
    let studentIdx;
    if (wallGridRows[row]) {
      studentIdx = wallGridRows[row][col];
    } else {
      // Các hàng phụ khác: xoay chu kỳ đảm bảo đầy đủ 23 bạn nữ
      studentIdx = wallRow6[(col + row * 7) % P];
    }
    const m = new THREE.Mesh(geo, photos[studentIdx].mat);
    m.userData = { student: photos[studentIdx].student, index: studentIdx };
    m.visible = false;
    world.add(m);
    meshes.push(m);
    delay[i] = rand() * 0.45;

    // S (Sphere)
    const sp = sph[i].pos;
    S.p.set([sp.x, sp.y, sp.z], i * 3);
    S.s[i] = sph[i].s;
    dummy.position.copy(sp);
    dummy.lookAt(sp.x * 2, sp.y * 2, sp.z * 2);
    dummy.quaternion.toArray(S.q, i * 4);

    // A (Cosmic Scattered)
    nA.set([rand() * 2 - 1, rand() * 2 - 1, rand()], i * 3);
    A.s[i] = 0.9 + Math.pow(rand(), 3) * 3.3;
    eTmp.set((rand() - 0.5) * 1.4, (rand() - 0.5) * 1.4, (rand() - 0.5) * 1.8);
    qTmp.setFromEuler(eTmp);
    qTmp.toArray(A.q, i * 4);

    // B (Explosion Burst)
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    const r = lerp(18, 42, rand());
    B.p.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
    B.s[i] = 1.2 + Math.pow(rand(), 1.5) * 2.2;
    eTmp.set(rand() * 6.28, rand() * 6.28, rand() * 6.28);
    qTmp.setFromEuler(eTmp);
    qTmp.toArray(B.q, i * 4);

    // W (Cylindrical Wall Facing Inward)
    const ang = col * 2 * Math.PI / WCOLS;
    W.p.set([RW * Math.sin(ang), (row - (rows - 1) / 2) * spacing, -RW * Math.cos(ang)], i * 3);
    W.s[i] = sW;
    eTmp.set(0, -ang, (rand() - 0.5) * 0.04);
    qTmp.setFromEuler(eTmp);
    qTmp.toArray(W.q, i * 4);
  }

  let sphereDist = 30, wallCamZ = -3;
  function layout() {
    const aspect = camera.aspect;
    const halfFov = THREE.MathUtils.degToRad(BASE_FOV / 2);
    const hf = Math.atan(Math.tan(halfFov) * Math.min(1, aspect));
    sphereDist = R / Math.sin(hf * 0.82);
    const targetColsInView = aspect >= 1 ? 8.4 : 4.2;
    const desiredWallDist = (wallW * targetColsInView) / (2 * Math.tan(halfFov) * aspect);
    const wallDist = clamp(desiredWallDist, 8.2, RW - 0.9);
    wallCamZ = wallDist - RW;
    const rx = 34 * clamp(aspect, 0.5, 1.9), ry = 28;
    for (let i = 0; i < N; i++) {
      A.p[i * 3] = nA[i * 3] * rx;
      A.p[i * 3 + 1] = nA[i * 3 + 1] * ry;
      A.p[i * 3 + 2] = lerp(-38, 24, nA[i * 3 + 2]);
    }
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
    starMats.forEach(m => (m.uniforms.uScale.value = h * renderer.getPixelRatio() / 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    layout();
    renderer.clear();
  }
  window.addEventListener('resize', resize);
  resize();

  // Timeline Tile Interpolator
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  function setTile(i, a, b, e, swirl) {
    const o = i * 3, m = meshes[i];
    let x = lerp(a.p[o], b.p[o], e), y = lerp(a.p[o + 1], b.p[o + 1], e), z = lerp(a.p[o + 2], b.p[o + 2], e);
    if (swirl) {
      const ang = Math.sin(Math.PI * e) * swirl, c = Math.cos(ang), s = Math.sin(ang);
      const nx = x * c + z * s;
      z = -x * s + z * c;
      x = nx;
    }
    m.position.set(x, y, z);
    qa.fromArray(a.q, i * 4);
    qb.fromArray(b.q, i * 4);
    m.quaternion.copy(qa).slerp(qb, e);
    m.scale.setScalar(Math.max(0.0001, lerp(a.s[i], b.s[i], e)));
  }

  function updateTiles(t) {
    const uF = prog('fly', t);
    const uG = prog('gather', t);
    const uB = prog('burst', t);
    const uW = prog('wall', t);
    const uO = prog('out', t);

    for (let i = 0; i < N; i++) {
      const m = meshes[i], d = delay[i];
      if (t < TL.fly[0]) {
        m.visible = false;
        continue;
      }
      m.visible = true;
      if (t < TL.gather[0]) {
        const e = easeOut(clamp(uF * 1.45 - d));
        const o = i * 3;
        m.position.set(A.p[o], A.p[o + 1], A.p[o + 2] - 90 * (1 - e));
        m.quaternion.fromArray(A.q, i * 4);
        m.scale.setScalar(Math.max(0.0001, A.s[i] * easeOutBack(clamp(uF * 1.45 - d))));
      } else if (t < TL.sphere[0]) {
        setTile(i, A, S, easeIO(clamp(uG * 1.45 - d)), 3.2);
      } else if (t < TL.burst[0]) {
        setTile(i, S, S, 1, 0);
        m.scale.multiplyScalar(1 + 0.035 * Math.sin(t * 2.2 + i * 0.9));
      } else if (t < TL.wall[0]) {
        setTile(i, S, B, easeIO(clamp(uB * 1.45 - d)), 0);
      } else if (t < TL.hold[0]) {
        setTile(i, B, W, easeIO(clamp(uW * 1.45 - d)), -2.4);
      } else if (t < TL.out[0]) {
        setTile(i, W, W, 1, 0);
        m.position.y += Math.sin(t * 0.9 + i * 0.7) * 0.06;
        m.position.z += Math.sin(t * 0.7 + i) * 0.05;
        m.scale.multiplyScalar(1 + 0.015 * Math.sin(t * 1.3 + i));
      } else {
        setTile(i, W, W, 1, 0);
        m.scale.multiplyScalar(Math.max(0.0001, 1 - easeIO(clamp(uO * 1.45 - d))));
      }
    }
  }

  // Subtitles / Lyrics
  let curSub = -2;
  function updateSub(t) {
    let idx = -1;
    PG_CONFIG.LYRICS.forEach((l, k) => {
      if (t >= l.t && t < l.t + l.d) idx = k;
    });
    if (idx === curSub) return;
    curSub = idx;
    if (idx < 0) {
      if (subEl) subEl.classList.remove('on');
      return;
    }
    if (subEl) {
      subEl.classList.remove('on');
      setTimeout(() => {
        if (curSub === idx) {
          subEl.textContent = '“ ' + PG_CONFIG.LYRICS[idx].text + ' ”';
          subEl.classList.add('on');
        }
      }, 120);
    }
  }

  // Interactive Drag to Pan 360 & Click to View Photo in Lightbox
  let dragging = false, lastX = 0, userYaw = 0, userVel = 0;
  let downX = 0, downY = 0;
  canvas.addEventListener('pointerdown', e => {
    dragging = true;
    lastX = e.clientX;
    downX = e.clientX;
    downY = e.clientY;
  });
  window.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    userYaw += dx * 0.005;
    userVel = dx * 0.005;
  });
  window.addEventListener('pointerup', e => {
    if (dragging) {
      dragging = false;
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      // Nếu bấm nhẹ (không phải kéo xoay cảnh), mở ảnh gốc lớn với Lightbox
      if (dist < 8 && window.currentActiveStage === 4) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
        const hits = raycaster.intersectObjects(meshes);
        if (hits.length > 0 && hits[0].object && hits[0].object.userData && hits[0].object.userData.student) {
          const st = hits[0].object.userData.student;
          const idx = hits[0].object.userData.index;
          const photoUrl = getStudentPhoto(st, idx);
          if (typeof openOriginalPhotoLightbox === 'function') {
            openOriginalPhotoLightbox(st, photoUrl);
          }
        }
      }
    }
  });
  window.addEventListener('pointercancel', () => (dragging = false));

  // Main Loop
  const flashAt = [TL.fly[0], TL.gather[0], TL.burst[0], TL.wall[0]];
  let T = 0, last = performance.now(), spin = 0, spinSpeed = 0, trail = 0;

  function stageOf(t) {
    for (const k of ['intro', 'fly', 'gather', 'sphere', 'burst', 'wall', 'hold', 'out']) {
      if (t < TL[k][1]) return k;
    }
    return 'out';
  }

  const SPIN = { intro: 0.04, fly: 0.1, gather: 0.55, sphere: 0.5, burst: 1.1, wall: 0.2, hold: 0.06, out: 0.06 };
  const TRAIL = { intro: 0, fly: 0.5, gather: 0.45, sphere: 0, burst: 0.62, wall: 0.3, hold: 0, out: 0.2 };

  function restart() {
    window.stage4AutoTransitioned = false;
    const urlTime = parseFloat(new URLSearchParams(window.location.search).get('time'));
    T = !isNaN(urlTime) ? urlTime : 0;
    spin = 0;
    curSub = -2;
    trail = 0;
    userYaw = 0;
    userVel = 0;
    renderer.clear();
    if (subEl) subEl.classList.remove('on');
    if (!photoGalaxyAnimId) {
      last = performance.now();
      photoGalaxyAnimId = requestAnimationFrame(frame);
    }
  }
  photoGalaxyRestartFn = restart;
  window.setPhotoGalaxyTime = function(tVal) { T = tVal; };

  function frame(now) {
    if (window.currentActiveStage !== 4) {
      photoGalaxyAnimId = null;
      return;
    }
    photoGalaxyAnimId = requestAnimationFrame(frame);

    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    T += dt * PG_CONFIG.SPEED;
    if (T >= TOTAL - 0.2) {
      // Tự động chuyển tiếp sang Stage 5 sau khi chiêm ngưỡng bức tường ảnh ~10s
      if (!window.stage4AutoTransitioned) {
        window.stage4AutoTransitioned = true;
        runStage4ToStage5Transition();
      }
      T = TOTAL - 0.05;
    }

    const stage = stageOf(T);

    // Galaxy fade when gathering into sphere
    const gA = T < TL.gather[0] ? 1 : 1 - easeIO(prog('gather', T));
    galaxy.visible = gA > 0.01;
    gCore.material.opacity = gA;
    gHalo.material.opacity = 0.55 * gA;
    gDisc.material.opacity = gA;
    gDiscGroup.rotation.y += dt * 0.25;

    starMats.forEach(m => (m.uniforms.uTime.value = now / 1000));
    updateMeteor(dt);

    const gl = T < TL.gather[0] ? 0 : T < TL.burst[0] ? easeIO(prog('gather', T)) : 1 - easeIO(prog('burst', T));
    sGlow.material.opacity = gl * (0.85 + 0.15 * Math.sin(T * 1.5));
    starsFar.rotation.y += dt * 0.012;
    starsNear.rotation.y += dt * 0.02;

    // Camera
    let z;
    if (T < TL.fly[0]) z = lerp(82, 78, easeOut(prog('intro', T)));
    else if (T < TL.gather[0]) z = lerp(78, 56, easeIO(prog('fly', T)));
    else if (T < TL.sphere[0]) z = lerp(56, sphereDist + 3, easeIO(prog('gather', T)));
    else if (T < TL.burst[0]) z = lerp(sphereDist + 3, sphereDist, prog('sphere', T));
    else if (T < TL.wall[0]) z = lerp(sphereDist, wallCamZ, easeIO(prog('burst', T)));
    else z = wallCamZ;

    const inWall = T >= TL.wall[0];
    camera.position.set(
      Math.sin(T * 0.25) * (inWall ? 0.8 : 0.4),
      inWall ? Math.sin(T * 0.4) * 0.6 : Math.cos(T * 0.3) * 0.5,
      z
    );
    camera.rotation.set(0, 0, Math.sin(T * 0.3) * 0.015);

    const fov = BASE_FOV + (stage === 'burst' ? 16 * Math.sin(Math.PI * prog('burst', T)) : 0);
    if (Math.abs(fov - camera.fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    // World Rotation & User Drag Pan
    spinSpeed += (SPIN[stage] - spinSpeed) * Math.min(1, dt * 2.2);
    spin += spinSpeed * dt * PG_CONFIG.SPEED;
    userYaw += userVel;
    userVel *= dragging ? 0 : 0.94;
    const tiltTarget = T < TL.burst[0] ? 0.25 : lerp(0.25, 0, easeIO(prog('burst', T)));

    // Tự động căn góc xoay mượt mà về chính diện (col = 0) khi chuyển vào Bức Tường
    // để 5 bạn nữ Ái Thu, Bình An, Gia Linh, Ngọc Hân, Phương Vy xuất hiện ngay chính giữa tầm nhìn
    let currentRotY;
    if (T < TL.burst[0]) {
      currentRotY = spin + userYaw;
    } else if (T < TL.wall[0]) {
      const uB = easeIO(prog('burst', T));
      const rem = ((spin % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const shortest = rem > Math.PI ? rem - Math.PI * 2 : rem;
      currentRotY = shortest * (1 - uB) + userYaw;
    } else {
      // Khi đang chiêm ngưỡng bức tường (wall & hold):
      // Ban đầu 2.5s đầu giữ thẳng chính diện 0 rad để thấy rõ 5 bạn nữ ở giữa (Gia Linh, Bình An, Ái Thu, Ngọc Hân, Phương Vy)
      // và toàn bộ các bạn nữ xung quanh. Sau đó xoay trôi nhẹ nhàng (pan 360°) để lần lượt lướt qua cả 23 bạn nữ!
      const timeInWall = T - TL.wall[0];
      const panFactor = Math.min(1, Math.max(0, (timeInWall - 2.5) / 1.8));
      const slowOrbit = panFactor * (timeInWall - 2.5) * 0.045;
      const ambientSway = (1 - panFactor) * Math.sin(timeInWall * 0.45) * 0.02;
      currentRotY = slowOrbit + ambientSway + userYaw;
    }
    world.rotation.set(tiltTarget, currentRotY, 0);

    updateTiles(T);
    updateSub(T);

    // Flash transition
    let f = 0;
    for (const te of flashAt) {
      if (T >= te) f = Math.max(f, 0.38 * Math.exp(-(T - te) * 4));
    }
    f = Math.max(f, clamp((T - (TOTAL - 1)) / 1) * 0.9);
    f = Math.max(f, 0.9 * Math.exp(-T * 3.5));
    if (flashEl) flashEl.style.opacity = f.toFixed(3);

    // Render with motion trail
    trail += (TRAIL[stage] - trail) * Math.min(1, dt * 3);
    if (trail > 0.05) {
      fadeMat.opacity = 1 - trail;
      renderer.render(fadeScene, fadeCam);
    } else {
      renderer.clear();
    }
    renderer.clearDepth();
    renderer.render(scene, camera);
  }

  // Pre-compile toàn bộ WebGL Shaders & Materials vào GPU VRAM
  try {
    renderer.compile(scene, camera);
  } catch (e) {
    console.warn("WebGL compile note:", e);
  }

  // Nếu chỉ pre-warm ngầm, không chạy timeline ngay
  if (!preWarmOnly) {
    restart();
  }
}

// Tự động khởi tạo trước (Pre-warm) Stage 4 trong lúc rảnh rỗi để khi người dùng bấm chuyển cảnh sẽ chạy mượt 60fps ngay
if (typeof window !== 'undefined') {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      if (!photoGalaxyInitialized) {
        photoGalaxyInitialized = true;
        setupPhotoGalaxyScene(true);
      }
    }, { timeout: 2500 });
  } else {
    setTimeout(() => {
      if (!photoGalaxyInitialized) {
        photoGalaxyInitialized = true;
        setupPhotoGalaxyScene(true);
      }
    }, 1500);
  }
}

// Chuyển cảnh từ Stage 4 sang Stage 5
function runStage4ToStage5Transition() {
  const flash = document.getElementById('photoGalaxyFlash');
  if (flash) {
    flash.style.opacity = '0.9';
    setTimeout(() => {
      flash.style.opacity = '0';
    }, 500);
  }
  setTimeout(() => {
    switchStage(5);
  }, 300);
}

const btnStage4Next = document.getElementById('btnStage4Next');
if (btnStage4Next) {
  btnStage4Next.addEventListener('click', runStage4ToStage5Transition);
}

// ==========================================================
// 9. STAGE 5: BỨC THƯ TÌNH CHÂN THỰC, CON DẤU SÁP & CLIMAX
// ==========================================================
let typeTimer = null;

function initStage5WaxLetter() {
  const envelope = document.getElementById('luxuryEnvelope');
  const seal = document.getElementById('rubyWaxSeal');
  const typeBody = document.getElementById('typewriterBody');
  const sigPath = document.getElementById('sigPath');
  const actions = document.getElementById('finalClimaxActions');
  const constellation = document.getElementById('floatingGirlsConstellation');

  if (!envelope) return;

  envelope.classList.remove('opened', 'cracking-seal');
  if (constellation) {
    constellation.classList.remove('blooming');
    createFloatingGirlsConstellation();
  }
  if (typeBody) typeBody.innerHTML = '';
  if (sigPath) sigPath.classList.remove('drawn');
  const signatureArea = document.getElementById('signatureArea');
  if (signatureArea) signatureArea.classList.remove('visible');
  if (actions) actions.classList.remove('show');
  cleanupStage5Highlight();

  // Cho phép bấm vào con dấu sáp hoặc phong bì để mở niêm phong bức thư
  if (seal) seal.onclick = (e) => { e.stopPropagation(); crackWaxSealAndOpen(); };
  if (envelope) {
    envelope.onclick = (e) => {
      if (e.target.closest('.floating-photo-item')) return;
      if (!envelope.classList.contains('opened')) {
        crackWaxSealAndOpen();
      }
    };
  }

  // Tự động phá vỡ con dấu sáp và mở thư sau 1.2s để người xem không cần thao tác bấm
  if (window.stage5AutoOpenTimer) clearTimeout(window.stage5AutoOpenTimer);
  window.stage5AutoOpenTimer = setTimeout(() => {
    if (currentActiveStage === 5 && envelope && !envelope.classList.contains('opened')) {
      crackWaxSealAndOpen();
    }
  }, 1200);
}

// Tạo hiệu ứng chùm ảnh kỷ niệm 23 bạn nữ bay lượn xung quanh bức thư (2 cột trái - 2 cột phải)
function createFloatingGirlsConstellation() {
  const container = document.getElementById('floatingGirlsConstellation');
  if (!container) return;
  container.innerHTML = '';

  // 23 Tọa độ phần trăm (%) sắp đặt 2 cánh đối xứng: Cánh trái 12 bạn (2 cột), Cánh phải 11 bạn (2 cột)
  const FLOATING_POSITIONS = [
    // === CÁNH TRÁI (LEFT WING - 12 BẠN NỮ) ===
    // Cột 1 ngoài cùng bên trái (Outer Left - 6 bạn: idx 0 -> 5)
    { left: 1.8,  top: 2.8,  rot: -4, col: 'outer-left', row: 'row-top',    anim: 'floatBob1', dur: 4.2 },
    { left: 1.8,  top: 18.8, rot: 3,  col: 'outer-left', row: 'row-top',    anim: 'floatBob2', dur: 4.7 },
    { left: 1.8,  top: 34.8, rot: -3, col: 'outer-left', row: 'row-mid',    anim: 'floatBob1', dur: 4.4 },
    { left: 1.8,  top: 50.8, rot: 4,  col: 'outer-left', row: 'row-mid',    anim: 'floatBob2', dur: 5.1 },
    { left: 1.8,  top: 66.8, rot: -4, col: 'outer-left', row: 'row-bottom', anim: 'floatBob1', dur: 4.6 },
    { left: 1.8,  top: 82.8, rot: 3,  col: 'outer-left', row: 'row-bottom', anim: 'floatBob2', dur: 4.9 },

    // Cột 2 trong bên trái - sát bức thư (Inner Left - 6 bạn: idx 6 -> 11)
    { left: 11.2, top: 5.5,  rot: 3,  col: 'inner-left', row: 'row-top',    anim: 'floatBob2', dur: 4.8 },
    { left: 11.2, top: 21.5, rot: -4, col: 'inner-left', row: 'row-top',    anim: 'floatBob1', dur: 4.3 },
    { left: 11.2, top: 37.5, rot: 4,  col: 'inner-left', row: 'row-mid',    anim: 'floatBob2', dur: 4.9 },
    { left: 11.2, top: 53.5, rot: -3, col: 'inner-left', row: 'row-mid',    anim: 'floatBob1', dur: 4.5 },
    { left: 11.2, top: 69.5, rot: 3,  col: 'inner-left', row: 'row-bottom', anim: 'floatBob2', dur: 5.0 },
    { left: 11.2, top: 85.5, rot: -4, col: 'inner-left', row: 'row-bottom', anim: 'floatBob1', dur: 4.7 },

    // === CÁNH PHẢI (RIGHT WING - 11 BẠN NỮ) ===
    // Cột 2 trong bên phải - sát bức thư (Inner Right - 5 bạn: idx 12 -> 16)
    { left: 77.2, top: 6.5,  rot: -3, col: 'inner-right', row: 'row-top',    anim: 'floatBob1', dur: 4.6 },
    { left: 77.2, top: 24.5, rot: 4,  col: 'inner-right', row: 'row-top',    anim: 'floatBob2', dur: 4.4 },
    { left: 77.2, top: 42.5, rot: -4, col: 'inner-right', row: 'row-mid',    anim: 'floatBob1', dur: 5.2 },
    { left: 77.2, top: 60.5, rot: 3,  col: 'inner-right', row: 'row-bottom', anim: 'floatBob2', dur: 4.6 },
    { left: 77.2, top: 78.5, rot: -3, col: 'inner-right', row: 'row-bottom', anim: 'floatBob1', dur: 4.8 },

    // Cột 1 ngoài cùng bên phải (Outer Right - 6 bạn: idx 17 -> 22)
    { left: 86.8, top: 2.8,  rot: 4,  col: 'outer-right', row: 'row-top',    anim: 'floatBob2', dur: 4.3 },
    { left: 86.8, top: 18.8, rot: -3, col: 'outer-right', row: 'row-top',    anim: 'floatBob1', dur: 4.8 },
    { left: 86.8, top: 34.8, rot: 4,  col: 'outer-right', row: 'row-mid',    anim: 'floatBob2', dur: 4.5 },
    { left: 86.8, top: 50.8, rot: -4, col: 'outer-right', row: 'row-mid',    anim: 'floatBob1', dur: 5.0 },
    { left: 86.8, top: 66.8, rot: 3,  col: 'outer-right', row: 'row-bottom', anim: 'floatBob2', dur: 4.7 },
    { left: 86.8, top: 82.8, rot: -3, col: 'outer-right', row: 'row-bottom', anim: 'floatBob1', dur: 4.4 }
  ];

  FEMALE_STUDENTS.forEach((st, idx) => {
    const pos = FLOATING_POSITIONS[idx] || { left: 50, top: 50, rot: 0, col: 'outer-left', row: 'row-mid', anim: 'floatBob1', dur: 4.5 };
    const photoUrl = getStudentPhoto(st, idx);

    const item = document.createElement('div');
    item.id = `floatingPhotoGirl_${idx}`;
    item.className = `floating-photo-item col-${pos.col} ${pos.row}`;
    item.style.left = `${pos.left}%`;
    item.style.top = `${pos.top}%`;
    item.style.setProperty('--target-rot', `${pos.rot}deg`);
    item.style.transitionDelay = `${(idx * 30).toFixed(0)}ms`;

    const shortName = getStudentShortName(st);
    const isLongName = shortName.length > 12;

    item.innerHTML = `
      <div class="floating-photo-card" style="animation-name: ${pos.anim}; animation-duration: ${pos.dur}s; animation-delay: ${(idx * 0.15).toFixed(2)}s;">
        <div class="floating-photo-img-wrap">
          <img src="${photoUrl}" alt="${st.name}" loading="lazy" />
          <div class="floating-photo-shine"></div>
        </div>
        <div class="floating-photo-name ${isLongName ? 'long-name' : ''}" title="${st.name}">${shortName}</div>
      </div>
    `;

    item.onclick = (e) => {
      e.stopPropagation();
      if (typeof openOriginalPhotoLightbox === 'function') {
        openOriginalPhotoLightbox(st, photoUrl);
      }
    };

    container.appendChild(item);
  });
}

// Bắn tia lửa sáp vàng kim khi con dấu vỡ đôi
function createWaxSparks(sealEl) {
  if (!sealEl) return;
  try {
    const rect = sealEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const count = 28;
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'wax-spark-particle';
      document.body.appendChild(spark);

      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const distance = 45 + Math.random() * 95;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance + Math.random() * 25;
      const size = 3 + Math.random() * 5;

      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.left = `${cx}px`;
      spark.style.top = `${cy}px`;
      spark.style.transform = `translate(-50%, -50%) scale(1)`;

      const animDuration = 650 + Math.random() * 400;
      if (spark.animate) {
        spark.animate([
          { transform: 'translate(-50%, -50%) scale(1.6)', opacity: 1 },
          { transform: `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) scale(0)`, opacity: 0 }
        ], {
          duration: animDuration,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }).onfinish = () => spark.remove();
      } else {
        setTimeout(() => spark.remove(), 600);
      }
    }
  } catch (e) {
    console.warn("Sparks error:", e);
  }
}

function crackWaxSealAndOpen() {
  const envelope = document.getElementById('luxuryEnvelope');
  if (!envelope || envelope.classList.contains('opened')) return;

  const seal = document.getElementById('rubyWaxSeal');
  const constellation = document.getElementById('floatingGirlsConstellation');

  // Âm thanh vỡ con dấu sáp giòn tan (Bảo đảm an toàn 100% trong try-catch)
  try {
    if (typeof audioManager !== 'undefined' && audioManager) {
      if (typeof audioManager.playWaxCrackSound === 'function') {
        audioManager.playWaxCrackSound();
      } else if (typeof audioManager.playBellSound === 'function') {
        audioManager.playBellSound(523.25, 0.35);
      }
    }
  } catch (e) {
    console.warn("Wax sound note:", e);
  }

  // 1. Con dấu sáp đỏ vỡ đôi + Bắn pháo sáng vàng kim
  envelope.classList.add('cracking-seal');
  try {
    if (seal) createWaxSparks(seal);
  } catch (e) {
    console.warn("Wax sparks note:", e);
  }

  // 2. Kích hoạt ảnh các bạn nữ xuất hiện bay lượn xung quanh
  if (constellation) {
    constellation.classList.add('blooming');
  }

  // 3. Nắp phong bì mở 3D và tờ giấy trồi lên
  setTimeout(() => {
    envelope.classList.add('opened');
  }, 450);

  // 4. Bắt đầu gõ chữ từng ký tự
  setTimeout(() => {
    startNaturalTypewriter();
  }, 1400);
}

let currentActivePolaroid = null;
let highlightHoldTimer = null;

function cleanupStage5Highlight() {
  if (highlightHoldTimer) {
    clearTimeout(highlightHoldTimer);
    highlightHoldTimer = null;
  }
  if (currentActivePolaroid) {
    currentActivePolaroid.classList.remove('active-highlight', 'polaroid-typing-active');
    currentActivePolaroid = null;
  }
  const constellation = document.getElementById('floatingGirlsConstellation');
  if (constellation) {
    constellation.classList.remove('listing-active');
  }
}

function highlightPolaroidCard(girlIndex) {
  // 1. Hủy bỏ bộ đếm giữ của bạn trước (nếu đang chờ 800ms)
  if (highlightHoldTimer) {
    clearTimeout(highlightHoldTimer);
    highlightHoldTimer = null;
  }
  // 2. Gỡ trạng thái active khỏi bạn trước đó
  if (currentActivePolaroid) {
    currentActivePolaroid.classList.remove('active-highlight', 'polaroid-typing-active');
    currentActivePolaroid = null;
  }
  // 3. Kích hoạt trạng thái active-highlight cho đúng thẻ bạn tương ứng
  const target = document.getElementById(`floatingPhotoGirl_${girlIndex}`);
  if (target) {
    target.classList.add('active-highlight', 'polaroid-typing-active');
    currentActivePolaroid = target;
  }
}

function releasePolaroidCard(girlIndex) {
  const isLastGirl = (girlIndex === FEMALE_STUDENTS.length - 1);
  const cardToUnset = currentActivePolaroid;

  if (highlightHoldTimer) {
    clearTimeout(highlightHoldTimer);
  }

  // Duy trì giữ thêm 800ms sau khi gõ xong tên bạn đó trước khi thu nhỏ lại mượt mà
  highlightHoldTimer = setTimeout(() => {
    if (cardToUnset) {
      cardToUnset.classList.remove('active-highlight', 'polaroid-typing-active');
      if (currentActivePolaroid === cardToUnset) {
        currentActivePolaroid = null;
      }
    }
    // Khi gõ xong toàn bộ 23 bạn, khôi phục độ sáng 100% cho toàn bộ ảnh xung quanh
    if (isLastGirl) {
      const constellation = document.getElementById('floatingGirlsConstellation');
      if (constellation) constellation.classList.remove('listing-active');
    }
    highlightHoldTimer = null;
  }, 800);
}

// Xây dựng danh sách token gõ chữ phân tách rõ giữa văn bản thường và tên 23 bạn nữ
function buildTypewriterTokens() {
  const tokens = [];
  let remainingText = LETTER_TEXT;

  for (let sIdx = 0; sIdx < FEMALE_STUDENTS.length; sIdx++) {
    const student = FEMALE_STUDENTS[sIdx];
    const name = student.name;
    const namePos = remainingText.indexOf(name);
    if (namePos !== -1) {
      // Các ký tự trước tên bạn nữ
      const beforeText = remainingText.substring(0, namePos);
      for (const ch of beforeText) {
        tokens.push({ char: ch, isName: false });
      }
      // Các ký tự trong tên bạn nữ
      for (let c = 0; c < name.length; c++) {
        tokens.push({
          char: name[c],
          isName: true,
          girlIndex: sIdx,
          isFirstChar: c === 0,
          isLastChar: c === name.length - 1
        });
      }
      remainingText = remainingText.substring(namePos + name.length);
    }
  }
  // Phần chữ còn lại sau tất cả các tên
  for (const ch of remainingText) {
    tokens.push({ char: ch, isName: false });
  }
  return tokens;
}

// Hiệu ứng gõ chữ cảm xúc tự nhiên (đồng bộ highlight ảnh Polaroid & in đậm hồng tên 23 bạn nữ)
function startNaturalTypewriter() {
  const typeBody = document.getElementById('typewriterBody');
  const sigPath = document.getElementById('sigPath');
  const actions = document.getElementById('finalClimaxActions');
  const letterPaper = document.getElementById('letterPaperSheet') || document.getElementById('letterPaper');
  const caret = document.getElementById('typingCaret');
  const constellation = document.getElementById('floatingGirlsConstellation');

  if (typeTimer) clearTimeout(typeTimer);
  cleanupStage5Highlight();

  const tokens = buildTypewriterTokens();
  let tokenIdx = 0;
  typeBody.innerHTML = '';
  let currentSpan = null;

  if (letterPaper) {
    letterPaper.style.scrollBehavior = 'auto';
    letterPaper.scrollTop = 0;
  }

  function typeToken() {
    if (tokenIdx < tokens.length) {
      const tok = tokens[tokenIdx];
      if (tok.isName) {
        if (tok.isFirstChar) {
          // Bắt đầu gõ đến danh sách 23 bạn nữ: làm mờ nhẹ các ảnh không được gọi tên
          if (tok.girlIndex === 0 && constellation) {
            const constellationEl = document.getElementById('floatingGirlsConstellation');
            if (constellationEl) constellationEl.classList.add('listing-active');
          }
          highlightPolaroidCard(tok.girlIndex);
          currentSpan = document.createElement('span');
          currentSpan.className = 'letter-girl-name';
          typeBody.appendChild(currentSpan);
        }
        if (currentSpan) {
          currentSpan.textContent += tok.char;
        } else {
          typeBody.appendChild(document.createTextNode(tok.char));
        }
        if (tok.isLastChar) {
          // Vừa gõ xong tên: kích hoạt hiệu ứng nháy sáng nhẹ và giữ active 800ms
          currentSpan.classList.add('name-glow-pulse');
          releasePolaroidCard(tok.girlIndex);
          currentSpan = null;
        }
      } else {
        if (tok.char === '\n') {
          typeBody.appendChild(document.createElement('br'));
        } else {
          typeBody.appendChild(document.createTextNode(tok.char));
        }
      }
      tokenIdx++;

      // Phát âm gõ phím máy chữ cơ học ASMR trên từng ký tự
      try {
        if (window.audioManager && audioManager.playTypewriterASMR) {
          audioManager.playTypewriterASMR(tok.char);
        }
      } catch (e) {}

      // CUỘN THEO DÒNG CHỮ ĐANG GÕ (Theo sát 100% từng chữ và con trỏ nhấp nháy)
      if (letterPaper) {
        letterPaper.scrollTop = letterPaper.scrollHeight;
      }

      // Tốc độ gõ ngẫu nhiên 30ms - 65ms tạo cảm giác gõ chữ thanh thoát
      const randDelay = Math.floor(Math.random() * 35) + 30;
      typeTimer = setTimeout(typeToken, randDelay);
    } else {
      cleanupStage5Highlight();

      // 4. Kích hoạt chữ ký viết tay SVG Handwriting chạy nét & hiển thị vùng chữ ký
      const signatureArea = document.getElementById('signatureArea');
      if (signatureArea) signatureArea.classList.add('visible');
      if (sigPath) sigPath.classList.add('drawn');

      // Cuộn êm ái xuống tận đáy bức thư để lộ trọn vẹn đoạn cảm ơn và chữ ký
      const performSmoothScrollToBottom = () => {
        if (!letterPaper) return;
        letterPaper.style.scrollBehavior = 'smooth';
        letterPaper.scrollTo({ top: letterPaper.scrollHeight + 500, behavior: 'smooth' });

        const sigEl = document.getElementById('signatureArea');
        if (sigEl && sigEl.scrollIntoView) {
          sigEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      };

      // Kích hoạt cuộn mượt mà ngay lập tức và liên tục để đảm bảo 100% cuộn hết thư
      performSmoothScrollToBottom();
      setTimeout(performSmoothScrollToBottom, 120);
      setTimeout(performSmoothScrollToBottom, 400);
      setTimeout(performSmoothScrollToBottom, 800);
      setTimeout(performSmoothScrollToBottom, 1400);

      // 5. Màn kết Cao trào (Final Climax): Bắn bóng bay trái tim & pháo hoa rực rỡ
      actions.classList.add('show');
      window.FX.startClimax();
      window.FX.triggerFirework();

      if (window.confetti) {
        window.confetti({ particleCount: 110, spread: 90, origin: { y: 0.6 } });
      }

      // Tự động chuyển tiếp sang Stage 6 (Vũ điệu trái tim vô tận) sau 9.5s để ngắm trọn vẹn thư và chữ ký
      if (window.stage5ToStage6Timer) clearTimeout(window.stage5ToStage6Timer);
      window.stage5ToStage6Timer = setTimeout(() => {
        if (currentActiveStage === 5) {
          switchStage(6);
        }
      }, 9500);
    }
  }

  typeToken();
}

// Bắt sự kiện chuyển sang Stage 6 (Vũ điệu trái tim & 23 tên lớp)
const btnGoToStage6 = document.getElementById('btnGoToStage6');
if (btnGoToStage6) {
  btnGoToStage6.addEventListener('click', (e) => {
    e.stopPropagation();
    if (typeTimer) clearTimeout(typeTimer);
    if (window.stage5ToStage6Timer) clearTimeout(window.stage5ToStage6Timer);
    if (window.stage5AutoOpenTimer) clearTimeout(window.stage5AutoOpenTimer);
    cleanupStage5Highlight();
    switchStage(6);
  });
}

// Bắt sự kiện xem lại từ đầu
const btnReplayAll = document.getElementById('btnReplayAll');
if (btnReplayAll) {
  btnReplayAll.addEventListener('click', () => {
    switchStage(1);
  });
}

// Modal mở danh sách 23 bạn nữ
const btnOpenRoster = document.getElementById('btnOpenRoster');
if (btnOpenRoster) {
  btnOpenRoster.addEventListener('click', () => {
    const modal = document.getElementById('rosterModal');
    const grid = document.getElementById('rosterGrid');
    if (!modal || !grid) return;
    grid.innerHTML = '';

    FEMALE_STUDENTS.forEach((g, idx) => {
      const card = document.createElement('div');
      card.className = 'roster-item-card';
      const photoUrl = getStudentPhoto(g, idx);
      card.innerHTML = `
        <img src="${photoUrl}" class="roster-avatar" alt="${g.name}" title="Bấm để xem ảnh gốc kích thước lớn" style="cursor: zoom-in;">
        <div class="roster-info">
          <h4>${g.name}</h4>
          <p><i class="fa-solid fa-crown"></i> ${g.title}</p>
          <div class="roster-dob"><i class="fa-regular fa-calendar-days"></i> ${g.dob}</div>
        </div>
      `;
      const avatarImg = card.querySelector('.roster-avatar');
      if (avatarImg) {
        avatarImg.onclick = (e) => {
          e.stopPropagation();
          openOriginalPhotoLightbox(g, photoUrl);
        };
      }
      card.title = "Bấm để mở trình chiếu bạn này (hoặc bấm ảnh để phóng to)";
      card.onclick = () => {
        modal.classList.remove('show');
        openCinematicTour(idx);
      };
      grid.appendChild(card);
    });

    modal.classList.add('show');
  });
}

const btnCloseRoster = document.getElementById('btnCloseRoster');
if (btnCloseRoster) {
  btnCloseRoster.addEventListener('click', () => {
    const modal = document.getElementById('rosterModal');
    if (modal) modal.classList.remove('show');
  });
}

const rosterBackdrop = document.getElementById('rosterBackdrop');
if (rosterBackdrop) {
  rosterBackdrop.addEventListener('click', () => {
    const modal = document.getElementById('rosterModal');
    if (modal) modal.classList.remove('show');
  });
}

// ==========================================================
// LIGHTBOX XEM ẢNH GỐC NGUYÊN BẢN (KHÔNG CẮT, KHÔNG MÉO, TỈ LỆ 100%)
// ==========================================================
function openOriginalPhotoLightbox(student, photoUrl) {
  const modal = document.getElementById('photoLightboxModal');
  const img = document.getElementById('lightboxImg');
  const nameEl = document.getElementById('lightboxName');
  const titleEl = document.getElementById('lightboxTitle');
  const dobEl = document.getElementById('lightboxDob');
  const wishEl = document.getElementById('lightboxWish');
  const wishBox = document.getElementById('lightboxWishBox');

  if (!modal || !img) return;

  img.src = photoUrl;
  img.alt = student ? student.name : 'Ảnh kỷ niệm 20/10';
  if (nameEl) nameEl.textContent = student ? student.name : '';
  if (titleEl) titleEl.textContent = student ? `✨ ${student.title}` : '';
  if (dobEl) dobEl.innerHTML = student && student.dob ? `<i class="fa-regular fa-calendar"></i> Sinh nhật: ${student.dob}` : '';
  if (wishEl) {
    if (student && student.wish) {
      wishEl.textContent = student.wish;
      if (wishBox) wishBox.style.display = 'block';
    } else {
      if (wishBox) wishBox.style.display = 'none';
    }
  }

  modal.classList.add('active');
}

function closeOriginalPhotoLightbox() {
  const modal = document.getElementById('photoLightboxModal');
  if (modal) modal.classList.remove('active');
}

const btnCloseLightbox = document.getElementById('btnCloseLightbox');
if (btnCloseLightbox) btnCloseLightbox.onclick = closeOriginalPhotoLightbox;

const lightboxBackdrop = document.getElementById('lightboxBackdrop');
if (lightboxBackdrop) lightboxBackdrop.onclick = closeOriginalPhotoLightbox;

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeOriginalPhotoLightbox();
    const rosterModal = document.getElementById('rosterModal');
    if (rosterModal) rosterModal.classList.remove('show');
  }
});

// Nạp file MP3 riêng của người dùng
document.getElementById('audioUploadInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    bgmEl.src = url;
    bgmEl.play().then(() => {
      isAudioActive = true;
      userExplicitlyPaused = false;
      updateAudioButtonUI(true);
      removeAutoplayPrompt();
      audioManager.stopMelody();
      alert(`🎵 Đã nhận bài hát: ${file.name}`);
    }).catch(err => {
      console.warn("Lỗi phát audio:", err);
    });
  }
});

document.getElementById('btnAudioToggle').addEventListener('click', toggleGlobalAudio);

// ==========================================================
// 8. STAGE 6: GRAND FINALE - ĐÈN TRỜI KỶ NIỆM 23 BẠN NỮ & THÔNG ĐIỆP 12B1
// ==========================================================
let stage6Canvas = null;
let stage6Ctx = null;
stage6AnimId = null;
let stage6W = 0, stage6H = 0;
let stage6T0 = 0;
let stage6LastTime = 0;
let stage6OrbitAngle1 = 0; // Vòng 1 (Inner): quay thuận chiều kim đồng hồ (+0.0018)
let stage6OrbitAngle2 = 0; // Vòng 2 (Outer): quay ngược chiều kim đồng hồ (-0.0012)
const stage6Sprites = {};

// Danh sách các hạt sao bụi vũ trụ và trái tim 3D nền bay từ dưới lên
let stage6Stars = [];
let stage6AmbientHearts = [];
let finaleCards = [];

// Tương tác chuột và cảm ứng 360 độ
let stage6UserYaw = 0;
let stage6UserPitch = 0;
let stage6UserVelYaw = 0;
let stage6UserVelPitch = 0;
let stage6IsDragging = false;
let stage6LastX = 0;
let stage6LastY = 0;
let stage6InteractionsAttached = false;

// Sprite trái tim có quầng sáng phát quang
function getStage6HeartSprite(color) {
  if (stage6Sprites[color]) return stage6Sprites[color];
  const s = 128, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const gl = g.createRadialGradient(s / 2, s / 2, s * 0.1, s / 2, s / 2, s / 2);
  gl.addColorStop(0, color + '99');
  gl.addColorStop(1, color + '00');
  g.fillStyle = gl;
  g.fillRect(0, 0, s, s);
  g.beginPath();
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    i ? g.lineTo(s / 2 + (x * s) / 60, s / 2 + (y * s) / 60 + s * 0.02) : g.moveTo(s / 2 + (x * s) / 60, s / 2 + (y * s) / 60 + s * 0.02);
  }
  g.closePath();
  g.fillStyle = color;
  g.fill();
  return (stage6Sprites[color] = c);
}

// Khởi tạo các hạt sao và trái tim bay lơ lửng từ dưới lên trên khắp màn hình
function initStage6Atmosphere() {
  stage6Stars = [];
  const countStars = 160;
  const curW = stage6W || window.innerWidth || 1200;
  const curH = stage6H || window.innerHeight || 800;
  const STAR_COLORS = ['#ffffff', '#ffffff', '#fff0f5', '#fef08a', '#ffd1dc'];
  for (let i = 0; i < countStars; i++) {
    stage6Stars.push({
      x: Math.random() * curW,
      y: Math.random() * curH,
      size: 1.0 + Math.random() * 2.4,
      speedY: 18 + Math.random() * 32,
      phase: Math.random() * 6.28,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
    });
  }

  const HEART_COLORS = ['#ff3b5c', '#ff6b9d', '#ff8fb1', '#ffd700', '#ff1493'];
  stage6AmbientHearts = [];
  for (let i = 0; i < 35; i++) {
    stage6AmbientHearts.push({
      x: Math.random() * curW,
      y: Math.random() * curH,
      size: 16 + Math.random() * 26,
      speedY: 16 + Math.random() * 32,
      phase: Math.random() * 6.28,
      col: HEART_COLORS[i % HEART_COLORS.length]
    });
  }
}

// ==========================================================
// TỌA ĐỘ 23 ĐIỂM CHUẨN HÓA TRÊN VÒNG TRÁI TIM (EQUAL ARC-LENGTH HEART FORMULA)
// Được tính toán qua mô hình thư giãn đàn hồi (Spring Relaxation) để đảm bảo:
// 1. Khoảng cách Euclidean giữa tất cả các thẻ liền kề hoàn toàn bằng nhau (~0.265 đơn vị).
// 2. Không bị co cụm ở đỉnh lõm hoặc đáy nhọn.
// 3. Đối xứng gương song phương tuyệt đối (Bilateral Symmetry) giữa nửa trái và nửa phải.
// ==========================================================
const HEART_23_NORM = [
  { nx:  0.0000, ny: -0.5800 }, // 0: Đỉnh lõm chính giữa (nâng cao để hoàn toàn không bị bảng trung tâm che)
  { nx:  0.1100, ny: -0.7900 }, // 1: Cung tròn trên bên phải
  { nx:  0.3175, ny: -0.9670 }, // 2: Cánh phải trên
  { nx:  0.5818, ny: -1.0000 }, // 3: Đỉnh cao nhất bên phải
  { nx:  0.8229, ny: -0.8586 }, // 4: Vòm ngoài phải
  { nx:  0.9794, ny: -0.5859 }, // 5: Sườn ngoài trên phải
  { nx:  1.0000, ny: -0.2495 }, // 6: Điểm mở rộng cực đại bên phải
  { nx:  0.8916, ny:  0.0585 }, // 7: Eo phải
  { nx:  0.7178, ny:  0.3137 }, // 8: Sườn nghiêng phải
  { nx:  0.5202, ny:  0.5391 }, // 9: Sườn dốc dưới phải
  { nx:  0.3193, ny:  0.7598 }, // 10: Tiếp cận đáy phải
  { nx:  0.1328, ny:  1.0000 }, // 11: Đáy nhọn phải
  { nx: -0.1328, ny:  1.0000 }, // 12: Đáy nhọn trái
  { nx: -0.3193, ny:  0.7598 }, // 13: Tiếp cận đáy trái
  { nx: -0.5202, ny:  0.5391 }, // 14: Sườn dốc dưới trái
  { nx: -0.7178, ny:  0.3137 }, // 15: Sườn nghiêng trái
  { nx: -0.8916, ny:  0.0585 }, // 16: Eo trái
  { nx: -1.0000, ny: -0.2495 }, // 17: Điểm mở rộng cực đại bên trái
  { nx: -0.9794, ny: -0.5859 }, // 18: Sườn ngoài trên trái
  { nx: -0.8229, ny: -0.8586 }, // 19: Vòm ngoài trái
  { nx: -0.5818, ny: -1.0000 }, // 20: Đỉnh cao nhất bên trái
  { nx: -0.3175, ny: -0.9670 }, // 21: Cánh trái trên
  { nx: -0.1100, ny: -0.7900 }  // 22: Cung tròn trên bên trái nối về tâm
];

// Tự động điều chỉnh hướng hiển thị Bong bóng lời chúc (Speech Bubble)
// Nếu thẻ ở nửa trên màn hình (hoặc gần mép trên < 250px): Bubble hiển thị ở DƯỚI để không bị che
function updateCardBubblePosition(cardEl) {
  if (!cardEl) return;
  const rect = cardEl.getBoundingClientRect();
  if (rect.top < 250) {
    cardEl.classList.add('bubble-below');
  } else {
    cardEl.classList.remove('bubble-below');
  }

  const bubble = cardEl.querySelector('.finale-wish-bubble');
  if (bubble) {
    if (rect.left < 130) {
      bubble.classList.add('align-left');
      bubble.classList.remove('align-right');
    } else if (window.innerWidth - rect.right < 130) {
      bubble.classList.add('align-right');
      bubble.classList.remove('align-left');
    } else {
      bubble.classList.remove('align-left', 'align-right');
    }
  }
}

// Tạo 23 thẻ kỷ niệm Polaroid phóng to 1.5x với thông tin đầy đủ của 23 bạn nữ 12B1
function buildStage6MiniCards() {
  const cardsLayer = document.getElementById('finaleCardsLayer');
  if (!cardsLayer) return;
  cardsLayer.innerHTML = '';
  finaleCards = [];

  const goldenAngle = 2.3999632; // ~137.5 độ (Golden Phyllotaxis Dispersion)

  FEMALE_STUDENTS.forEach((st, idx) => {
    const card = document.createElement('div');
    card.className = 'finale-mini-card';
    card.id = `finaleCard_${idx}`;
    card.setAttribute('data-idx', idx);

    // Mặc định các bạn ở nửa trên trái tim thì bong bóng hiển thị bên DƯỚI để không bị tràn mép trên
    const norm = HEART_23_NORM[idx];
    if (norm && norm.ny < 0.1) {
      card.classList.add('bubble-below');
    }

    const photoUrl = getStudentPhoto(st, idx);
    const shortName = getStudentShortName(st);
    const wish = st.wish || `Chúc ${shortName} ngày 20/10 luôn rạng rỡ và hạnh phúc nhé! ❤️`;

    card.innerHTML = `
      <div class="finale-card-frame">
        <div class="finale-card-photo-wrap">
          <img src="${photoUrl}" alt="${st.name}" loading="lazy">
          <div class="finale-card-shine"></div>
        </div>
        <div class="finale-card-pill">
          <i class="fa-solid fa-heart"></i>
          <span>${shortName}</span>
        </div>
      </div>
      <div class="finale-wish-bubble">
        <span>${wish}</span>
        <span class="bubble-arrow"></span>
      </div>
    `;

    // Ban đầu ẩn hoàn toàn ở tâm (sẽ bung nở từ giây thứ 14s)
    card.style.transform = 'translate(-50%, -50%) translate3d(0, 0, 0) scale(0)';
    card.style.opacity = '0';

    // Phân bố các điểm neo lơ lửng ngẫu nhiên nhưng hài hòa khắp viewport
    const rRatio = Math.sqrt((idx + 1) / 23);
    const fAngle = idx * goldenAngle + (idx % 2 === 0 ? 0.35 : -0.35);
    const normFloatX = Math.cos(fAngle) * rRatio * 0.38;
    const normFloatY = Math.sin(fAngle) * rRatio * 0.34;

    const itemData = {
      el: card,
      student: st,
      index: idx,
      normFloatX: normFloatX,
      normFloatY: normFloatY,
      isHovered: false,
      lastX: 0,
      lastY: 0
    };

    // Tương tác di chuột / chạm: Giữ nguyên vị trí, phóng to scale(1.85) với viền phát sáng lộng lẫy
    card.addEventListener('pointerenter', () => {
      updateCardBubblePosition(card);
      // Tạm tắt bạn tour đang bật nếu người dùng chủ động rê chuột vào bạn khác
      if (typeof stage6HeartTourCurrentIdx !== 'undefined' && stage6HeartTourCurrentIdx >= 0 && stage6HeartTourCurrentIdx !== idx) {
        const tourItem = finaleCards[stage6HeartTourCurrentIdx];
        if (tourItem && tourItem.el) {
          tourItem.el.classList.remove('is-active', 'tour-active');
          tourItem.el.style.zIndex = '45';
          tourItem.isHovered = false;
        }
      }
      itemData.isHovered = true;
      card.classList.add('is-active');
      card.style.zIndex = '130';
    });
    card.addEventListener('pointerleave', () => {
      itemData.isHovered = false;
      card.classList.remove('is-active');
      card.style.zIndex = '45';
    });

    // Bấm vào thẻ để ngắm ảnh gốc cỡ lớn trong Lightbox
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof openOriginalPhotoLightbox === 'function') {
        openOriginalPhotoLightbox(st, photoUrl);
      }
    });

    cardsLayer.appendChild(card);
    finaleCards.push(itemData);
  });
}

// Thiết lập điều khiển kéo chuột / vuốt tay xoay 360 độ trong không gian
function setupStage6Interactions() {
  if (stage6InteractionsAttached) return;
  stage6InteractionsAttached = true;

  window.addEventListener('pointerdown', (e) => {
    if (window.currentActiveStage !== 6) return;
    if (e.target.closest('.finale-mini-card') || e.target.closest('button')) return;
    stage6IsDragging = true;
    stage6LastX = e.clientX;
    stage6LastY = e.clientY;
    stage6UserVelYaw = 0;
    stage6UserVelPitch = 0;
  });

  window.addEventListener('pointermove', (e) => {
    if (!stage6IsDragging || window.currentActiveStage !== 6) return;
    const dx = e.clientX - stage6LastX;
    const dy = e.clientY - stage6LastY;
    stage6LastX = e.clientX;
    stage6LastY = e.clientY;

    const deltaYaw = dx * 0.005;
    const deltaPitch = dy * 0.003;
    stage6UserYaw += deltaYaw;
    stage6UserPitch = Math.max(-0.45, Math.min(0.45, stage6UserPitch + deltaPitch));

    stage6UserVelYaw = deltaYaw;
    stage6UserVelPitch = deltaPitch;
  });

  window.addEventListener('pointerup', () => {
    stage6IsDragging = false;
  });
  window.addEventListener('pointercancel', () => {
    stage6IsDragging = false;
  });
}

let stage6BgGrad = null;
let stage6NebulaGrad = null;

function resizeStage6() {
  if (!stage6Canvas || !stage6Ctx) return;
  const d = Math.min(window.devicePixelRatio || 1, 2);
  stage6W = window.innerWidth;
  stage6H = window.innerHeight;
  stage6Canvas.width = stage6W * d;
  stage6Canvas.height = stage6H * d;
  stage6Ctx.setTransform(d, 0, 0, d, 0, 0);

  // Pre-bake gradients một lần duy nhất khi resize, tối ưu 120fps
  stage6BgGrad = stage6Ctx.createRadialGradient(
    stage6W / 2, stage6H / 2, 0,
    stage6W / 2, stage6H / 2, Math.max(stage6W, stage6H) * 0.85
  );
  stage6BgGrad.addColorStop(0, '#380a33');
  stage6BgGrad.addColorStop(0.28, '#24062a');
  stage6BgGrad.addColorStop(0.62, '#14031d');
  stage6BgGrad.addColorStop(1, '#090113');

  const nebulaR = Math.min(stage6W, stage6H) * 0.75;
  stage6NebulaGrad = stage6Ctx.createRadialGradient(
    stage6W / 2, stage6H / 2, 0,
    stage6W / 2, stage6H / 2, nebulaR
  );
  stage6NebulaGrad.addColorStop(0, 'rgba(244, 63, 94, 0.28)');
  stage6NebulaGrad.addColorStop(0.35, 'rgba(219, 39, 119, 0.18)');
  stage6NebulaGrad.addColorStop(0.68, 'rgba(168, 85, 247, 0.08)');
  stage6NebulaGrad.addColorStop(1, 'rgba(9, 1, 19, 0)');
}

function stage6Frame(now) {
  if (window.currentActiveStage !== 6) {
    if (stage6AnimId) cancelAnimationFrame(stage6AnimId);
    stage6AnimId = null;
    return;
  }

  if (!stage6LastTime) stage6LastTime = now;
  const dt = Math.min(0.1, (now - stage6LastTime) / 1000);
  stage6LastTime = now;
  const time = (now - stage6T0) / 1000;

  if (!stage6BgGrad) resizeStage6();

  // 1. VẼ BẦU TRỜI VŨ TRỤ CÓ CHIỀU SÂU (Cached Gradient, 0ms overhead)
  stage6Ctx.globalAlpha = 1;
  stage6Ctx.globalCompositeOperation = 'source-over';
  stage6Ctx.fillStyle = stage6BgGrad;
  stage6Ctx.fillRect(0, 0, stage6W, stage6H);

  // Tinh vân phát sáng lãng mạn
  const nebulaPulse = 0.7 + 0.3 * Math.sin(time * 0.85);
  stage6Ctx.globalAlpha = nebulaPulse;
  stage6Ctx.globalCompositeOperation = 'screen';
  stage6Ctx.fillStyle = stage6NebulaGrad;
  stage6Ctx.fillRect(0, 0, stage6W, stage6H);
  stage6Ctx.globalCompositeOperation = 'source-over';

  // 2. VẼ HẠT BỤI SAO & SAO KIM CƯƠNG BAY TỪ DƯỚI LÊN TRÊN KHẮP MÀN HÌNH
  for (const s of stage6Stars) {
    s.y -= s.speedY * dt;
    s.x += Math.sin(time + s.phase) * 0.35;
    if (s.y < -15) {
      s.y = stage6H + 15;
      s.x = Math.random() * stage6W;
    }
    const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(time * 2.2 + s.phase));
    stage6Ctx.globalAlpha = twinkle;
    if (s.size > 2.2 && twinkle > 0.65) {
      // Sao kim cương 4 cánh lấp lánh nghệ thuật
      const arm = s.size * 2.4;
      stage6Ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      stage6Ctx.lineWidth = 1.2;
      stage6Ctx.beginPath();
      stage6Ctx.moveTo(s.x - arm, s.y);
      stage6Ctx.lineTo(s.x + arm, s.y);
      stage6Ctx.moveTo(s.x, s.y - arm);
      stage6Ctx.lineTo(s.x, s.y + arm);
      stage6Ctx.stroke();
    }
    stage6Ctx.fillStyle = s.color || '#ffffff';
    stage6Ctx.beginPath();
    stage6Ctx.arc(s.x, s.y, s.size * 0.75, 0, Math.PI * 2);
    stage6Ctx.fill();
  }

  // 3. VẼ TRÁI TIM NHỎ 3D BAY LƠ LỬNG TỪ DƯỚI LÊN TRÊN
  for (const h of stage6AmbientHearts) {
    h.y -= h.speedY * dt;
    h.x += Math.sin(time * 1.3 + h.phase) * 0.7;
    if (h.y < -40) {
      h.y = stage6H + 40;
      h.x = Math.random() * stage6W;
    }
    const pulseAlpha = 0.45 + 0.35 * Math.sin(time * 1.5 + h.phase);
    stage6Ctx.globalAlpha = pulseAlpha;
    const sprite = getStage6HeartSprite(h.col);
    stage6Ctx.drawImage(sprite, h.x - h.size / 2, h.y - h.size / 2, h.size, h.size);
  }

  // 4. QUÁN TÍNH XOAY CỦA NGƯỜI DÙNG
  if (!stage6IsDragging) {
    stage6UserYaw += stage6UserVelYaw;
    stage6UserPitch = Math.max(-0.45, Math.min(0.45, stage6UserPitch + stage6UserVelPitch));
    stage6UserVelYaw *= 0.92;
    stage6UserVelPitch *= 0.92;
  }

  // 5. CẬP NHẬT 23 THẺ ẢNH POLAROID THEO CUE SHEET CHÍNH XÁC:
  // - Trước 14.5s: Ẩn tuyệt đối toàn bộ 23 ảnh
  // - 14.5s -> 26.0s (Giai đoạn 1): 23 ảnh tỏa ra từ tâm và bay lơ lửng chậm rãi khắp màn hình quanh dòng chữ
  // - 26.0s -> 30.5s (Giai đoạn 2 - kéo dài 4.5s): 23 ảnh di chuyển tụ lại về vòng cung Hình Trái Tim
  // - Từ 30.5s trở đi: Hoàn tất khóa vào Vòng Trái Tim, giữ nhịp thở êm ái
  const winW = window.innerWidth || stage6W || 1200;
  const winH = window.innerHeight || stage6H || 800;
  const isMobile = winW < 768;

  // Hệ số mở rộng quy mô vòng Trái Tim (chiếm ~88% - 94% viewport, thoáng đãng không che khuất bảng chữ)
  let heartScaleX, heartScaleY, heartCenterY, baseCardScale;

  if (isMobile) {
    heartScaleX = Math.max(160, winW * 0.46);
    heartScaleY = Math.max(260, winH * 0.44);
    heartCenterY = -winH * 0.02;
    baseCardScale = 0.92;
  } else {
    // Desktop: Mở rộng 88% - 94% viewport, giữ dáng tim thanh thoát bao bọc bảng trung tâm
    heartScaleY = Math.max(340, Math.min(winH * 0.47, 460));
    heartScaleX = Math.max(460, Math.min(winW * 0.48, heartScaleY * 1.36));
    heartCenterY = -winH * 0.015;
    // Tự động scale thẻ hài hòa trên màn hình laptop
    baseCardScale = Math.min(1.0, Math.max(0.82, winH / 920));
  }

  // Lấy mốc thời gian thực từ audio giọng đọc (hoặc fallback chính xác từ lúc bắt đầu)
  const timelineTime = getStage6TimelineTime();

  // ĐỒNG BỘ 9 CÂU PHỤ ĐỀ TRỰC TIẾP TỪ AUDIO CURRENTTIME (0.0s -> 34.2s)
  const storyWrap = document.getElementById('finaleStorytellingWrap');
  const storyText = document.getElementById('finaleStoryText');

  if (storyWrap && storyText) {
    if (timelineTime < 34.5) {
      storyWrap.style.display = 'flex';

      let activeSub = null;
      for (let i = 0; i < STAGE6_SUBTITLES.length; i++) {
        const sub = STAGE6_SUBTITLES[i];
        if (timelineTime >= sub.start && timelineTime <= sub.end) {
          activeSub = sub;
          break;
        }
      }

      if (activeSub) {
        if (storyText.textContent !== activeSub.text) {
          storyText.textContent = activeSub.text;
        }
        // Hiệu ứng mờ dần (fade-out 0.3s) trong 0.3s cuối của câu; trước đó hiện rõ (fade-in 0.3s)
        if (timelineTime > activeSub.end - 0.3) {
          if (!storyText.classList.contains('fade-out')) {
            storyText.className = 'finale-story-text fade-out';
          }
        } else {
          if (!storyText.classList.contains('visible')) {
            storyText.className = 'finale-story-text visible';
          }
        }
      } else {
        // Khoảng nghỉ chuyển câu (0.2s gap)
        if (!storyText.classList.contains('fade-out')) {
          storyText.className = 'finale-story-text fade-out';
        }
      }
    } else {
      storyWrap.style.display = 'none';
    }
  }

  // TRONG SUỐT 34 GIÂY GIỌNG ĐỌC: TUYỆT ĐỐI ẨN BẢNG TRUNG TÂM VÀ THANH ĐIỀU KHIỂN
  const centerpiece = document.getElementById('finaleCenterpiece');
  const actionOverlay = document.getElementById('stage6ActionOverlay');

  if (timelineTime < 34.5) {
    if (centerpiece && !stage6HasStartedCenterpiece) {
      centerpiece.style.display = 'none';
      centerpiece.style.opacity = '0';
      centerpiece.style.visibility = 'hidden';
      centerpiece.style.pointerEvents = 'none';
      centerpiece.classList.remove('show');
    }
    if (actionOverlay) {
      actionOverlay.classList.remove('show');
    }
  } else {
    // Đúng giây thứ 34.5s: Hiện bảng trung tâm mượt mà và bắt đầu chạy typewriter
    if (!stage6HasStartedCenterpiece) {
      stage6HasStartedCenterpiece = true;
      showStage6CenterpieceAndTypewriter();
    }
  }

  // CẬP NHẬT 23 THẺ ẢNH POLAROID:
  for (const it of finaleCards) {
    const cardEl = it.el;
    if (!cardEl) continue;

    // Trước 14.5s: Ẩn tuyệt đối toàn bộ 23 ảnh
    if (timelineTime < 14.5) {
      cardEl.style.opacity = '0';
      cardEl.style.transform = 'translate(-50%, -50%) translate3d(0px, 0px, 0px) scale(0)';
      continue;
    }

    const floatBaseX = it.normFloatX * winW;
    const floatBaseY = it.normFloatY * winH;

    let curX = 0, curY = 0, curScale = baseCardScale, curOpacity = 1.0, curRot = 0;

    if (timelineTime < 26.0) {
      // Giai đoạn 1 (từ 14.5s đến 26.0s):
      // 23 ảnh tỏa ra từ tâm và bay lơ lửng chậm rãi khắp màn hình quanh dòng chữ
      const cardStartTime = 14.5 + (it.index * 0.16); // Phân bổ từ 14.5s đến 18.02s
      const flyDur = 1.4;

      if (timelineTime < cardStartTime) {
        cardEl.style.opacity = '0';
        cardEl.style.transform = 'translate(-50%, -50%) translate3d(0px, 0px, 0px) scale(0)';
        continue;
      } else if (timelineTime < cardStartTime + flyDur) {
        const p = (timelineTime - cardStartTime) / flyDur;
        const easeP = 1 - Math.pow(1 - p, 3);
        curX = floatBaseX * easeP;
        curY = floatBaseY * easeP;
        curScale = (0.2 + 0.8 * easeP) * baseCardScale;
        curOpacity = Math.min(1.0, easeP * 1.5);
        curRot = Math.sin(timelineTime * 1.2 + it.index) * 6;
      } else {
        // Đang bay lơ lửng thư thái khắp màn hình quanh dòng chữ
        const driftX = Math.sin(timelineTime * 0.9 + it.index * 1.4) * 15;
        const driftY = Math.cos(timelineTime * 0.8 + it.index * 1.2) * 12;
        curX = floatBaseX + driftX;
        curY = floatBaseY + driftY;
        curScale = baseCardScale;
        curOpacity = 1.0;
        curRot = Math.sin(timelineTime * 0.7 + it.index * 1.5) * 7;
      }
    } else if (timelineTime < 30.5) {
      // Giai đoạn 2 (từ 26.0s đến 30.5s - kéo dài 4.5s):
      // 23 ảnh di chuyển tụ lại dần về vị trí vòng cung Hình Trái Tim
      if (!stage6HasTriggeredConfetti26) {
        stage6HasTriggeredConfetti26 = true;
        try {
          if (window.audioManager?.playCrystalChime) audioManager.playCrystalChime();
          if (window.audioManager?.playBellSound) audioManager.playBellSound(1046, 1.3);
          if (window.FX?.triggerFirework) window.FX.triggerFirework();
          if (window.confetti) {
            window.confetti({
              particleCount: 100,
              spread: 90,
              origin: { x: 0.5, y: 0.5 },
              colors: ['#ffd700', '#ff1493', '#ff69b4', '#ffffff', '#e11d48']
            });
          }
        } catch (e) {}
      }

      const norm = HEART_23_NORM[it.index];
      const targetX = norm.nx * heartScaleX;
      const targetY = norm.ny * heartScaleY + heartCenterY;

      // Vị trí xuất phát từ trạng thái lơ lửng lúc t = 26.0s
      const srcDriftX = Math.sin(26.0 * 0.9 + it.index * 1.4) * 15;
      const srcDriftY = Math.cos(26.0 * 0.8 + it.index * 1.2) * 12;
      const srcX = floatBaseX + srcDriftX;
      const srcY = floatBaseY + srcDriftY;
      const srcRot = Math.sin(26.0 * 0.7 + it.index * 1.5) * 7;

      const p = Math.min(1.0, (timelineTime - 26.0) / 4.5);
      const easeP = 0.5 * (1 - Math.cos(Math.PI * p)); // Cosine easing êm dịu
      curX = srcX * (1 - easeP) + targetX * easeP;
      curY = srcY * (1 - easeP) + targetY * easeP;
      curRot = srcRot * (1 - easeP) + (Math.sin(it.index * 0.8) * 1.6) * easeP;
      curScale = baseCardScale;
      curOpacity = 1.0;
    } else {
      // Từ 30.5s trở đi: Hoàn tất xếp hình trái tim, khóa vào vị trí và giữ nhịp thở êm ái
      const norm = HEART_23_NORM[it.index];
      const targetX = norm.nx * heartScaleX;
      const targetY = norm.ny * heartScaleY + heartCenterY;
      const breathe = Math.sin(timelineTime * 1.4 + it.index * 0.5) * 2.5;
      const dirX = targetX !== 0 ? (targetX / Math.abs(targetX)) : 0;
      const dirY = targetY !== 0 ? (targetY / Math.abs(targetY)) : 1;
      curX = targetX + dirX * breathe;
      curY = targetY + dirY * breathe;
      curRot = Math.sin(timelineTime * 1.2 + it.index * 0.7) * 1.5;
      curScale = baseCardScale;
      curOpacity = 1.0;
    }

    if (it.isHovered) {
      cardEl.style.transform = `translate(-50%, -50%) translate3d(${it.lastX}px, ${it.lastY}px, 0px) scale(${baseCardScale.toFixed(3)})`;
      cardEl.style.zIndex = '100';
      cardEl.style.opacity = '1';
      continue;
    }

    it.lastX = curX.toFixed(1);
    it.lastY = curY.toFixed(1);

    cardEl.style.transform = `translate(-50%, -50%) translate3d(${it.lastX}px, ${it.lastY}px, 0px) rotate(${curRot.toFixed(1)}deg) scale(${curScale.toFixed(3)})`;
    cardEl.style.opacity = curOpacity.toFixed(3);
    cardEl.style.zIndex = '45';
  }

  stage6AnimId = requestAnimationFrame(stage6Frame);
}

// ==========================================================
// BẢNG CUE SHEET 9 CÂU PHỤ ĐỀ ĐOẠN KẾT (KHỚP 100% VỚI GIỌNG ĐỌC AUDIO 35S)
// ==========================================================
const STAGE6_SUBTITLES = [
  { start: 0.0,  end: 3.6,  text: "10 năm sau, hay 20 năm sau, hay 30 năm sau nữa..." },
  { start: 3.8,  end: 6.2,  text: "Những chuyến đi này sẽ là ký ức..." },
  { start: 6.4,  end: 10.2, text: "Có khi lúc đó chúng ta quên mất những tháng ngày cùng nhau này..." },
  { start: 10.4, end: 14.3, text: "Nhưng mà biết đâu, 50 năm sau đó trong một chiều nắng ngập vàng..." },
  { start: 14.5, end: 18.8, text: "Những tấm hình cũ sẽ nằm trên đôi tay run rẩy, rồi bất chợt kỷ niệm sẽ ùa về..." },
  { start: 19.0, end: 22.8, text: "Và ta nhớ lại cái lần đầu tiên bỡ ngỡ trước biển trời rộng lớn..." },
  { start: 23.0, end: 25.5, text: "Nhớ lại cái nôn nao khi thấy tuyết ngập tràn..." },
  { start: 25.7, end: 29.0, text: "Nhớ lại những chuyến đi, nhớ hết tất cả những con người..." },
  { start: 29.2, end: 34.2, text: "Và nhớ lại những nụ cười rất tươi... của một thời tuổi trẻ." }
];

let stage6VoiceStartT0 = 0;
let stage6HasStartedCenterpiece = false;
let stage6HasTriggeredConfetti26 = false;
let stage6Timers = [];

function getStage6TimelineTime() {
  if (voiceoverEl && !voiceoverEl.paused && voiceoverEl.currentTime > 0) {
    return voiceoverEl.currentTime;
  }
  if (stage6VoiceStartT0 > 0) {
    return (performance.now() - stage6VoiceStartT0) / 1000;
  }
  return 0;
}

function clearStage6Timeline() {
  if (typeof stopEndingVoiceover === 'function') {
    stopEndingVoiceover();
  }
  if (typeof stopTourVoiceover === 'function') {
    stopTourVoiceover();
  }
  if (typeof stopStage6HeartSequentialTour === 'function') {
    stopStage6HeartSequentialTour();
  }
  if (stage6Timers && Array.isArray(stage6Timers)) {
    stage6Timers.forEach(t => clearTimeout(t));
    stage6Timers = [];
  }
  if (window.stage6TypeTimer) {
    clearTimeout(window.stage6TypeTimer);
    window.stage6TypeTimer = null;
  }
  stage6HasStartedCenterpiece = false;
  stage6HasTriggeredConfetti26 = false;
}

// ==========================================================
// 8.6. CHU KỲ TỰ ĐỘNG FOCUS TỪNG BẠN NỮ TRÊN VÒNG TRÁI TIM (SEQUENTIAL HEART TOUR)
// Khi thông điệp hiện ra xong: Tự động kích hoạt hiệu ứng hover từ bạn đầu (idx 0)
// đến bạn cuối (idx 22), mỗi bạn hiển thị ~2.5s với bong bóng lời chúc & ánh sáng lung linh
// ==========================================================
let stage6HeartTourTimer = null;
let stage6HeartTourCurrentIdx = -1;
const STAGE6_CARD_TOUR_DURATION = 2500; // 2.5s mỗi bạn nữ theo đúng yêu cầu

function stopStage6HeartSequentialTour() {
  if (stage6HeartTourTimer) {
    clearTimeout(stage6HeartTourTimer);
    stage6HeartTourTimer = null;
  }
  if (stage6HeartTourCurrentIdx >= 0 && stage6HeartTourCurrentIdx < finaleCards.length) {
    const prev = finaleCards[stage6HeartTourCurrentIdx];
    if (prev && prev.el) {
      prev.el.classList.remove('is-active', 'tour-active');
      prev.el.style.zIndex = '45';
      prev.isHovered = false;
    }
  }
  stage6HeartTourCurrentIdx = -1;
}

function startStage6HeartSequentialTour() {
  stopStage6HeartSequentialTour();
  if (window.currentActiveStage !== 6 || !finaleCards || finaleCards.length === 0) return;

  // Bổ sung đoạn audio lắng đọng khi trái tim ảnh chạy
  if (typeof playTourVoiceover === 'function') {
    playTourVoiceover();
  }

  function highlightNextCard(idx) {
    if (window.currentActiveStage !== 6) {
      stopStage6HeartSequentialTour();
      return;
    }

    // Nếu đã hoàn tất qua cả 23 bạn nữ:
    if (idx >= finaleCards.length) {
      if (stage6HeartTourCurrentIdx >= 0 && stage6HeartTourCurrentIdx < finaleCards.length) {
        const prev = finaleCards[stage6HeartTourCurrentIdx];
        if (prev && prev.el) {
          prev.el.classList.remove('is-active', 'tour-active');
          prev.el.style.zIndex = '45';
          prev.isHovered = false;
        }
      }
      stage6HeartTourCurrentIdx = -1;

      // Nghỉ 3.5s rồi nhẹ nhàng lặp lại một vòng mới để trái tim luôn sống động
      stage6HeartTourTimer = setTimeout(() => {
        highlightNextCard(0);
      }, 3500);
      return;
    }

    // Tắt highlight của bạn trước
    if (stage6HeartTourCurrentIdx >= 0 && stage6HeartTourCurrentIdx < finaleCards.length) {
      const prev = finaleCards[stage6HeartTourCurrentIdx];
      if (prev && prev.el) {
        prev.el.classList.remove('is-active', 'tour-active');
        prev.el.style.zIndex = '45';
        prev.isHovered = false;
      }
    }

    // Bật highlight bạn tiếp theo
    stage6HeartTourCurrentIdx = idx;
    const it = finaleCards[idx];
    if (it && it.el) {
      if (typeof updateCardBubblePosition === 'function') {
        updateCardBubblePosition(it.el);
      }
      it.isHovered = true;
      it.el.classList.add('is-active', 'tour-active');
      it.el.style.zIndex = '120';

      // Âm thanh chuông pha lê trong trẻo
      try {
        if (window.audioManager && audioManager.playCrystalChime) {
          audioManager.playCrystalChime();
        } else if (window.audioManager && audioManager.playBellSound) {
          audioManager.playBellSound(784 + (idx % 7) * 65, 0.35);
        }
      } catch (e) {}

      // Bắn vài hạt kim tuyến lấp lánh nhẹ nhàng quanh ảnh bạn nữ
      try {
        if (window.confetti && it.el) {
          const rect = it.el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const originX = (rect.left + rect.width / 2) / window.innerWidth;
            const originY = (rect.top + rect.height / 2) / window.innerHeight;
            window.confetti({
              particleCount: 16,
              spread: 45,
              origin: { x: originX, y: originY },
              colors: ['#ffd700', '#ff69b4', '#ffffff', '#e11d48'],
              scalar: 0.7,
              ticks: 80
            });
          }
        }
      } catch (e) {}
    }

    // Đúng 2.5s chuyển sang bạn tiếp theo (từ bạn đầu đến bạn cuối)
    stage6HeartTourTimer = setTimeout(() => {
      highlightNextCard(idx + 1);
    }, STAGE6_CARD_TOUR_DURATION);
  }

  // Bắt đầu từ bạn đầu tiên (Index 0) sau 1.2s nghỉ
  stage6HeartTourTimer = setTimeout(() => {
    highlightNextCard(0);
  }, 1200);
}

// BƯỚC 3: HIỆN BẢNG THÔNG ĐIỆP CHÍNH VÀ CHẠY HIỆU ỨNG GÕ CHỮ (ĐÚNG GIÂY THỨ 34.5s)
function showStage6CenterpieceAndTypewriter() {
  const centerpiece = document.getElementById('finaleCenterpiece');
  const centerCard = document.getElementById('finaleCenterpieceCard');
  const badge = document.getElementById('finaleBadge');
  const title = document.getElementById('finaleTitle');
  const typeBody = document.getElementById('finaleTypeBody');
  const cursor = document.getElementById('finaleCursor');
  const actionOverlay = document.getElementById('stage6ActionOverlay');

  if (centerpiece) {
    centerpiece.style.display = 'block';
    centerpiece.style.visibility = 'visible';
    centerpiece.classList.add('show');
    centerpiece.style.opacity = '1';
    centerpiece.style.pointerEvents = 'auto';
  }
  if (centerCard) centerCard.classList.add('reveal-box');
  if (badge) {
    badge.style.opacity = '1';
    badge.style.transform = 'translateY(0)';
    badge.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  }
  if (title) {
    title.innerHTML = 'Gửi 23 Đóa Hoa Rạng Rỡ Nhất<br>Của Tập Thể 12B1';
    title.classList.add('visible');
    title.style.opacity = '1';
  }

  // Chạy hiệu ứng gõ chữ (typewriter) cho đoạn lời chúc từ tập thể nam
  const part1 = "Thanh xuân của chúng mình đẹp nhất là vì có sự xuất hiện của các bạn. Món quà nhỏ này tụi con trai 12B1 đã cố gắng chuẩn bị bằng tất cả tấm lòng, dù đôi chỗ có thể còn vụng về hay thiếu sót, mong các bạn nữ nhẹ nhàng bỏ qua nhé.";
  const part2 = "Chúc 23 đóa hoa của lớp mình luôn mỉm cười, rạng rỡ và hạnh phúc! ❤️";

  let curPart = 1;
  let charIdx = 0;
  if (typeBody) typeBody.innerHTML = '';
  if (cursor) cursor.classList.remove('hide');

  if (window.stage6TypeTimer) {
    clearTimeout(window.stage6TypeTimer);
    window.stage6TypeTimer = null;
  }

  function typeClimaxChar() {
    if (window.currentActiveStage !== 6) return;

    if (curPart === 1) {
      if (charIdx < part1.length) {
        const ch = part1[charIdx];
        charIdx++;
        if (typeBody) typeBody.innerHTML = part1.slice(0, charIdx);
        try {
          if (window.audioManager && audioManager.playTypewriterASMR) {
            audioManager.playTypewriterASMR(ch);
          }
        } catch (e) {}
        window.stage6TypeTimer = setTimeout(typeClimaxChar, 33);
      } else {
        curPart = 2;
        charIdx = 0;
        if (typeBody) typeBody.innerHTML = part1 + '<br><br>';
        try {
          if (window.audioManager && audioManager.playVintageBell) {
            audioManager.playVintageBell();
          }
        } catch (e) {}
        window.stage6TypeTimer = setTimeout(typeClimaxChar, 250);
      }
    } else {
      if (charIdx < part2.length) {
        const ch = part2[charIdx];
        charIdx++;
        if (typeBody) typeBody.innerHTML = part1 + '<br><br>' + part2.slice(0, charIdx);
        try {
          if (window.audioManager && audioManager.playTypewriterASMR) {
            audioManager.playTypewriterASMR(ch);
          }
        } catch (e) {}
        window.stage6TypeTimer = setTimeout(typeClimaxChar, 33);
      } else {
        // Gõ xong toàn bộ thông điệp!
        try {
          if (window.audioManager && audioManager.playVintageBell) {
            audioManager.playVintageBell();
          }
        } catch (e) {}
        if (cursor) cursor.classList.add('hide');

        // Hiện thanh nút điều khiển bên dưới
        if (actionOverlay) {
          actionOverlay.classList.add('show');
        }

        // BÙNG NỔ ĐẠI TIỆC PHÁO HOA TRÁI TIM & KIM TUYẾN KHI KẾT THÚC THÔNG ĐIỆP
        try {
          if (window.FX && window.FX.launchGrandFinaleBarrage) {
            window.FX.launchGrandFinaleBarrage();
          }
        } catch (e) {}

        // TỰ ĐỘNG FOCUS TỪNG BẠN NỮ TRÊN VÒNG TRÁI TIM (TỪ BẠN ĐẦU ĐẾN BẠN CUỐI, 2.5S MỖI BẠN)
        try {
          if (typeof startStage6HeartSequentialTour === 'function') {
            startStage6HeartSequentialTour();
          }
        } catch (e) {}
      }
    }
  }

  typeClimaxChar();
}

// ==========================================================
// KHỞI ĐỘNG TIMELINE ĐOẠN KẾT (ĐỒNG BỘ TUYỆT ĐỐI VỚI AUDIO GIỌNG ĐỌC)
// ==========================================================
function runStage6CinematicTimeline() {
  clearStage6Timeline();

  const heartWrap = document.getElementById('finaleOpeningHeartWrap');
  const heart = document.getElementById('finaleOpeningHeart');
  const storyWrap = document.getElementById('finaleStorytellingWrap');
  const storyText = document.getElementById('finaleStoryText');
  const centerpiece = document.getElementById('finaleCenterpiece');
  const centerCard = document.getElementById('finaleCenterpieceCard');
  const badge = document.getElementById('finaleBadge');
  const title = document.getElementById('finaleTitle');
  const typeBody = document.getElementById('finaleTypeBody');
  const cursor = document.getElementById('finaleCursor');
  const actionOverlay = document.getElementById('stage6ActionOverlay');

  // Khởi tạo trạng thái ban đầu: TUYỆT ĐỐI ẨN bảng thông điệp và thanh nút bấm
  if (centerpiece) {
    centerpiece.classList.remove('show');
    centerpiece.style.display = 'none';
    centerpiece.style.opacity = '0';
    centerpiece.style.visibility = 'hidden';
    centerpiece.style.pointerEvents = 'none';
  }
  if (centerCard) centerCard.classList.remove('reveal-box');
  if (badge) {
    badge.style.opacity = '0';
    badge.style.transform = 'translateY(12px)';
  }
  if (title) {
    title.classList.remove('visible');
    title.style.opacity = '0';
    title.innerHTML = 'Gửi 23 Đóa Hoa Rạng Rỡ Nhất<br>Của Tập Thể 12B1';
  }
  if (typeBody) typeBody.innerHTML = '';
  if (cursor) cursor.classList.remove('hide');
  if (actionOverlay) {
    actionOverlay.classList.remove('show');
  }

  // Khởi tạo trạng thái chữ phụ đề
  if (storyWrap && storyText) {
    storyWrap.style.display = 'flex';
    storyText.textContent = '';
    storyText.className = 'finale-story-text';
  }

  // Reset mốc thời gian đồng bộ và các cờ trạng thái
  stage6VoiceStartT0 = performance.now();
  stage6T0 = stage6VoiceStartT0;
  stage6LastTime = stage6VoiceStartT0;
  stage6HasStartedCenterpiece = false;
  stage6HasTriggeredConfetti26 = false;

  // Phát file audio giọng đọc 35s & giảm âm lượng BGM (Audio Ducking)
  if (typeof playEndingVoiceover === 'function') {
    playEndingVoiceover();
  }

  // Trái tim mở màn: Nở bung và biến mất tức thì (0s -> 0.4s) để nhường trọn không gian cho câu 1
  if (heartWrap && heart) {
    heartWrap.style.display = 'flex';
    heartWrap.style.opacity = '1';
    heart.className = 'finale-opening-heart beating';

    try {
      if (window.audioManager?.playBellSound) audioManager.playBellSound(554, 0.85);
      if (window.audioManager?.playCrystalChime) audioManager.playCrystalChime();
    } catch (e) {}

    setTimeout(() => {
      heartWrap.style.transition = 'opacity 0.25s ease';
      heartWrap.style.opacity = '0';
      setTimeout(() => {
        heartWrap.style.display = 'none';
        heart.className = 'finale-opening-heart';
      }, 250);
    }, 350);
  }
}

// ==========================================================
// 8.5. CHẾ ĐỘ TRÌNH CHIẾU ĐIỆN ẢNH 23 ĐÓA HOA (CINEMATIC TOUR)
// ==========================================================
let tourCurrentIndex = 0;
let tourProgressTimer = null;
let tourSlideTimeout = null;
let tourIsPlaying = false;
let tourProgressPercent = 0;
const TOUR_SLIDE_DURATION = 3000; // 3 giây mỗi bạn nữ theo yêu cầu

function openCinematicTour(startIndex = 0) {
  const modal = document.getElementById('cinematicTourModal');
  if (!modal) return;
  if (typeof stopTourVoiceover === 'function') {
    stopTourVoiceover();
  }
  stopTourTimer();
  resetTourProgress();
  tourCurrentIndex = (startIndex >= 0 && startIndex < FEMALE_STUDENTS.length) ? startIndex : 0;
  modal.classList.add('active');
  tourIsPlaying = true;
  updateTourPlayPauseBtn();
  renderTourStudent(tourCurrentIndex, 'next');
  startTourTimer();

  try {
    if (window.audioManager?.playCrystalChime) {
      window.audioManager.playCrystalChime();
    }
  } catch (e) {}
}

function closeCinematicTour() {
  const modal = document.getElementById('cinematicTourModal');
  if (modal) modal.classList.remove('active');
  stopTourTimer();
  resetTourProgress();
  tourIsPlaying = false;
  if (tourSlideTimeout) {
    clearTimeout(tourSlideTimeout);
    tourSlideTimeout = null;
  }
}

function renderTourStudent(idx, direction = 'next') {
  if (idx < 0 || idx >= FEMALE_STUDENTS.length) return;
  const cardStage = document.getElementById('tourCardStage');
  const student = FEMALE_STUDENTS[idx];
  const photoUrl = getStudentPhoto(student, idx);

  const updateFields = () => {
    const idxText = document.getElementById('tourCurrentIndex');
    const numberTag = document.getElementById('tourNumberTag');
    const nameEl = document.getElementById('tourStudentName');
    const titleEl = document.getElementById('tourStudentTitle');
    const dobEl = document.getElementById('tourStudentDob');
    const wishEl = document.getElementById('tourStudentWish');
    const imgEl = document.getElementById('tourPhotoImg');
    const heartCountEl = document.getElementById('tourHeartCount');

    if (idxText) idxText.textContent = `${idx + 1}`;
    if (numberTag) numberTag.textContent = `ĐÓA HOA SỐ ${String(idx + 1).padStart(2, '0')}`;
    if (nameEl) nameEl.textContent = student.name;
    if (titleEl) titleEl.textContent = `✨ ${student.title}`;
    if (dobEl) dobEl.innerHTML = `<i class="fa-regular fa-calendar"></i> ${student.dob || '20/10/2026'}`;
    if (wishEl) wishEl.textContent = student.wish || 'Luôn rạng rỡ và hạnh phúc nhé!';
    if (imgEl) {
      imgEl.src = photoUrl;
    }
    if (heartCountEl) {
      heartCountEl.textContent = `${20 + ((idx * 7) % 35)}`;
    }

    // Hiệu ứng cánh hoa rơi nhẹ tôn vinh bạn nữ
    try {
      if (window.FX?.spawnBlossomShower) {
        window.FX.spawnBlossomShower(window.innerWidth / 2, window.innerHeight * 0.4, 12);
      }
    } catch (e) {}
  };

  if (!cardStage) {
    updateFields();
    return;
  }

  if (tourSlideTimeout) {
    clearTimeout(tourSlideTimeout);
    tourSlideTimeout = null;
  }
  cardStage.classList.remove('tour-slide-leave-prev', 'tour-slide-leave-next', 'tour-slide-enter-prev', 'tour-slide-enter-next');

  // Chuyển động lướt có hướng mượt mà
  const leaveClass = (direction === 'prev') ? 'tour-slide-leave-prev' : 'tour-slide-leave-next';
  const enterClass = (direction === 'prev') ? 'tour-slide-enter-prev' : 'tour-slide-enter-next';

  cardStage.classList.add(leaveClass);
  tourSlideTimeout = setTimeout(() => {
    updateFields();
    cardStage.classList.remove(leaveClass);
    cardStage.classList.add(enterClass);

    // Force reflow
    void cardStage.offsetWidth;

    cardStage.classList.remove(enterClass);
    tourSlideTimeout = null;
  }, 180);
}

function resetTourProgress() {
  const fill = document.getElementById('tourProgressFill');
  if (fill) fill.style.width = '0%';
  tourProgressPercent = 0;
}

function stopTourTimer() {
  if (tourProgressTimer) {
    clearInterval(tourProgressTimer);
    tourProgressTimer = null;
  }
}

function startTourTimer() {
  stopTourTimer();
  resetTourProgress();
  if (!tourIsPlaying) return;

  const stepInterval = 40; // Cập nhật progress bar mỗi 40ms mượt mà
  const stepIncrement = (stepInterval / TOUR_SLIDE_DURATION) * 100;
  const fill = document.getElementById('tourProgressFill');

  tourProgressTimer = setInterval(() => {
    tourProgressPercent += stepIncrement;
    if (fill) fill.style.width = `${Math.min(100, tourProgressPercent)}%`;

    if (tourProgressPercent >= 100) {
      stopTourTimer();
      resetTourProgress();
      nextTourStudent(true);
    }
  }, stepInterval);
}

function nextTourStudent(isAuto = false) {
  stopTourTimer();
  resetTourProgress();

  if (tourCurrentIndex < FEMALE_STUDENTS.length - 1) {
    tourCurrentIndex++;
    renderTourStudent(tourCurrentIndex, 'next');
    if (tourIsPlaying) startTourTimer();
  } else {
    if (isAuto) {
      // Đã chiếu xong trọn vẹn đủ 23 bạn nữ không sót một ai
      closeCinematicTour();
      try {
        if (window.FX?.launchGrandFinaleBarrage) {
          window.FX.launchGrandFinaleBarrage();
        }
      } catch (e) {}
    } else {
      // Bấm nút Tiếp theo ở bạn cuối: quay vòng lại bạn số 1
      tourCurrentIndex = 0;
      renderTourStudent(tourCurrentIndex, 'next');
      if (tourIsPlaying) startTourTimer();
    }
  }
}

function prevTourStudent() {
  stopTourTimer();
  resetTourProgress();

  if (tourCurrentIndex > 0) {
    tourCurrentIndex--;
  } else {
    tourCurrentIndex = FEMALE_STUDENTS.length - 1;
  }
  renderTourStudent(tourCurrentIndex, 'prev');
  if (tourIsPlaying) startTourTimer();
}

function toggleTourPlayPause() {
  tourIsPlaying = !tourIsPlaying;
  updateTourPlayPauseBtn();
  if (tourIsPlaying) {
    startTourTimer();
  } else {
    stopTourTimer();
  }
}

function updateTourPlayPauseBtn() {
  const btn = document.getElementById('btnTourPlayPause');
  if (!btn) return;
  if (tourIsPlaying) {
    btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    btn.title = 'Tạm dừng trình chiếu';
  } else {
    btn.innerHTML = '<i class="fa-solid fa-play"></i>';
    btn.title = 'Tiếp tục trình chiếu';
  }
}

function addTourHeart() {
  const countEl = document.getElementById('tourHeartCount');
  if (countEl) {
    countEl.textContent = parseInt(countEl.textContent || '0') + 1;
  }
  try {
    if (window.audioManager?.playBellSound) {
      window.audioManager.playBellSound(1318.5, 0.4);
    }
    if (window.FX?.spawnBlossomShower) {
      window.FX.spawnBlossomShower(window.innerWidth * 0.65, window.innerHeight * 0.6, 16);
    }
  } catch (e) {}
}

// Gắn sự kiện cho các nút điều khiển Tour Điện Ảnh
function initCinematicTourEvents() {
  const btnOpenTour = document.getElementById('btnCinematicTour');
  if (btnOpenTour) btnOpenTour.onclick = () => openCinematicTour(0);

  const btnFirework = document.getElementById('btnLaunchFirework');
  if (btnFirework) btnFirework.onclick = () => {
    try {
      if (window.FX?.launchGrandFinaleBarrage) {
        window.FX.launchGrandFinaleBarrage();
      }
    } catch (e) {}
  };

  const btnClose = document.getElementById('btnCloseTour');
  if (btnClose) btnClose.onclick = closeCinematicTour;

  const backdrop = document.getElementById('tourBackdrop');
  if (backdrop) backdrop.onclick = closeCinematicTour;

  const btnNext = document.getElementById('btnTourNext');
  if (btnNext) btnNext.onclick = nextTourStudent;

  const btnPrev = document.getElementById('btnTourPrev');
  if (btnPrev) btnPrev.onclick = prevTourStudent;

  const btnPlay = document.getElementById('btnTourPlayPause');
  if (btnPlay) btnPlay.onclick = toggleTourPlayPause;

  const btnHeart = document.getElementById('btnTourHeart');
  if (btnHeart) btnHeart.onclick = addTourHeart;

  window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('cinematicTourModal');
    if (!modal || !modal.classList.contains('active')) return;
    if (e.key === 'ArrowRight') nextTourStudent();
    if (e.key === 'ArrowLeft') prevTourStudent();
    if (e.key === ' ') { e.preventDefault(); toggleTourPlayPause(); }
    if (e.key === 'Escape') closeCinematicTour();
  });
}

function initStage6HeartNames() {
  stage6Canvas = document.getElementById('heartNamesCanvas');
  if (!stage6Canvas) return;
  stage6Ctx = stage6Canvas.getContext('2d');
  resizeStage6();
  initStage6Atmosphere();
  buildStage6MiniCards();
  setupStage6Interactions();

  const heartWrap = document.getElementById('finaleOpeningHeartWrap');
  if (heartWrap) {
    heartWrap.onclick = (e) => {
      e.stopPropagation();
      runStage6CinematicTimeline();
    };
  }

  stage6T0 = performance.now();
  stage6LastTime = performance.now();
  stage6OrbitAngle1 = 0;
  stage6OrbitAngle2 = 0;

  // Khởi động chuỗi kịch bản điện ảnh
  runStage6CinematicTimeline();

  if (stage6AnimId) cancelAnimationFrame(stage6AnimId);
  stage6AnimId = requestAnimationFrame(stage6Frame);
}

window.addEventListener('resize', () => {
  if (window.currentActiveStage === 6) {
    resizeStage6();
  }
});

// ==========================================================
// VFX 6: BẮT ĐƯỢC SAO BĂNG ĐIỀU ƯỚC 20/10 MAY MẮN
// ==========================================================
const wishingStarQuotes = [
  "✦ Điều ước thành hiện thực: Chúc bạn luôn rạng rỡ như ánh mặt trời, bình yên như dòng sông và ngập tràn hạnh phúc mỗi ngày!",
  "✦ Bắt được ngôi sao may mắn: Chúc mọi hoài bão của bạn đều thuận buồm xuôi gió, luôn được yêu thương và trân trọng!",
  "✦ Lời chúc từ vũ trụ: Bạn là một vì tinh tú độc nhất vô nhị. Hãy luôn tự tin, kiêu hãnh và toả sáng theo cách riêng!",
  "✦ Phép màu 20/10: Chúc nụ cười ngọt ngào luôn ngự trị trên môi, mọi âu lo đều tan biến như sương sớm!",
  "✦ Nguyện ước tinh tú: Chúc bạn luôn xinh đẹp, yêu đời và luôn có người đồng hành ấm áp trên mọi nẻo đường!",
  "✦ Chúc phái nữ lớp ta: Luôn giữ ngọn lửa đam mê, học tập xuất sắc và gặt hái vô vàn thành công rực rỡ!",
  "✦ Món quà từ thiên hà: Chúc bạn mỗi ngày thức giấc đều đón nhận niềm vui bất ngờ và sự ngọt ngào trọn vẹn!",
  "✦ Điều ước thanh xuân: Chúc thanh xuân của bạn luôn rực rỡ ngát hương như vườn hoa mẫu đơn nở rộ!",
  "✦ Ánh sáng diệu kỳ: Chúc bạn luôn can đảm theo đuổi ước mơ, và vũ trụ sẽ luôn ưu ái gửi đến bạn những điều tốt đẹp nhất!",
  "✦ Ngôi sao may mắn: Chúc bạn 20/10 nhận được thật nhiều hoa, ngập tràn quà tặng và muôn vàn lời chúc chân thành!",
  "✦ Vũ điệu thiên hà: Chúc tâm hồn bạn mãi trong trẻo như giọt sương mai, bình yên và an nhiên giữa cuộc sống!",
  "✦ Tinh tú chở che: Mong bạn luôn gặp được những điều may mắn, quý nhân phù trợ và bạn bè luôn sát cánh bên cạnh!"
];

let wishingBubbleTimer = null;

window.showWishingBubble = function(x, y) {
  const toast = document.getElementById('wishingBubbleToast');
  const textEl = document.getElementById('wishingBubbleText');
  if (!toast || !textEl) return;

  const quote = wishingStarQuotes[Math.floor(Math.random() * wishingStarQuotes.length)];
  textEl.textContent = quote;

  toast.classList.add('active');

  if (wishingBubbleTimer) clearTimeout(wishingBubbleTimer);
  wishingBubbleTimer = setTimeout(() => {
    toast.classList.remove('active');
  }, 5000);
};

// ==========================================================
// VFX 2: 3D CARD TILT & HOLOGRAPHIC SPECULAR INTERACTION
// ==========================================================
function setup3DCardTiltInteractions() {
  // 1. Tilt 3D cho Modal Tour Điện ảnh
  const tourFrame = document.querySelector('.tour-photo-frame');
  if (tourFrame) {
    let tourTiltRaf = null;
    tourFrame.addEventListener('mousemove', (e) => {
      if (tourTiltRaf) return;
      tourTiltRaf = requestAnimationFrame(() => {
        const rect = tourFrame.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -12;
        const rotY = ((x - cx) / cx) * 12;
        tourFrame.style.transform = `perspective(800px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) scale(1.03)`;
        tourTiltRaf = null;
      });
    }, { passive: true });

    tourFrame.addEventListener('mouseleave', () => {
      if (tourTiltRaf) cancelAnimationFrame(tourTiltRaf);
      tourTiltRaf = null;
      tourFrame.style.transform = '';
    });
  }

  // 2. Tilt 3D tương tác khi di chuột vào Mini Card ở Stage 6 (Throttled per-frame)
  let cardTiltRaf = null;
  document.addEventListener('mousemove', (e) => {
    if (cardTiltRaf) return;
    cardTiltRaf = requestAnimationFrame(() => {
      const activeHoverCard = e.target ? e.target.closest('.finale-mini-card') : null;
      if (activeHoverCard) {
        const rect = activeHoverCard.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const rotX = ((e.clientY - cy) / (rect.height / 2)) * -14;
        const rotY = ((e.clientX - cx) / (rect.width / 2)) * 14;

        const frame = activeHoverCard.querySelector('.finale-card-frame');
        if (frame) {
          frame.style.transform = `scale(1.3) perspective(400px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg)`;
        }
      }
      cardTiltRaf = null;
    });
  }, { passive: true });

  // 3. Đóng bubble toast khi nhấn nút đóng
  const btnCloseWish = document.getElementById('btnCloseWishBubble');
  if (btnCloseWish) {
    btnCloseWish.addEventListener('click', () => {
      const toast = document.getElementById('wishingBubbleToast');
      if (toast) toast.classList.remove('active');
      if (wishingBubbleTimer) clearTimeout(wishingBubbleTimer);
    });
  }
}

// ==========================================================
// 10. TÍNH NĂNG "MÓN QUÀ MANG VỀ": XUẤT ẢNH STORY 9:16 (1080x1920)
// ==========================================================

const StoryCardManager = {
  currentStudentIdx: 0,
  cachedImages: {},
  canvas: null,
  ctx: null,

  init() {
    this.canvas = document.getElementById('storyCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.populateStudentOptions();
    this.setupEvents();
    this.preloadAllImages();
  },

  populateStudentOptions() {
    const select = document.getElementById('storyStudentSelect');
    const strip = document.getElementById('storyAvatarStrip');
    if (!select || !strip) return;

    select.innerHTML = '';
    strip.innerHTML = '';

    FEMALE_STUDENTS.forEach((st, idx) => {
      // 1. Thêm vào thẻ select
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${String(idx + 1).padStart(2, '0')}. ${st.name} — ${st.title}`;
      select.appendChild(opt);

      // 2. Thêm vào avatar strip
      const photoUrl = getStudentPhoto(st, idx);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `story-avatar-thumb-btn ${idx === 0 ? 'active' : ''}`;
      btn.title = `${st.name} (${st.title})`;
      btn.dataset.idx = idx;
      btn.innerHTML = `<img src="${photoUrl}" class="story-avatar-thumb" alt="${st.name}">`;
      btn.onclick = () => {
        this.selectStudent(idx);
      };
      strip.appendChild(btn);
    });
  },

  selectStudent(idx) {
    if (idx < 0) idx = FEMALE_STUDENTS.length - 1;
    if (idx >= FEMALE_STUDENTS.length) idx = 0;
    this.currentStudentIdx = idx;

    const select = document.getElementById('storyStudentSelect');
    if (select) select.value = idx;

    const counter = document.getElementById('storyStudentCounter');
    if (counter) counter.textContent = `${idx + 1} / ${FEMALE_STUDENTS.length}`;

    // Cập nhật trạng thái active của avatar strip
    const strip = document.getElementById('storyAvatarStrip');
    if (strip) {
      const btns = strip.querySelectorAll('.story-avatar-thumb-btn');
      btns.forEach((b, i) => {
        if (i === idx) {
          b.classList.add('active');
          b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          b.classList.remove('active');
        }
      });
    }

    // Cập nhật textarea lời chúc theo bạn nữ được chọn
    const textarea = document.getElementById('storyCustomWish');
    const currentStudent = FEMALE_STUDENTS[idx];
    if (textarea && currentStudent) {
      textarea.value = currentStudent.wish || `Chúc ${currentStudent.name} ngày 20/10 luôn ngập tràn niềm vui, rạng rỡ và hạnh phúc trọn vẹn! ❤️`;
    }

    this.render();
  },

  setupEvents() {
    // 1. Thay đổi select dropdown
    const select = document.getElementById('storyStudentSelect');
    if (select) {
      select.onchange = (e) => {
        this.selectStudent(parseInt(e.target.value) || 0);
      };
    }

    // 2. Nút Prev / Next
    const btnPrev = document.getElementById('btnStoryPrevStudent');
    if (btnPrev) btnPrev.onclick = () => this.selectStudent(this.currentStudentIdx - 1);

    const btnNext = document.getElementById('btnStoryNextStudent');
    if (btnNext) btnNext.onclick = () => this.selectStudent(this.currentStudentIdx + 1);

    // 3. Textarea sửa lời chúc
    const textarea = document.getElementById('storyCustomWish');
    if (textarea) {
      let debounceTimer = null;
      textarea.oninput = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.render();
        }, 120);
      };
    }

    // 4. Các nút Preset lời chúc
    const presetsContainer = document.getElementById('storyQuickWishes');
    if (presetsContainer) {
      presetsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.story-preset-btn');
        if (!btn) return;
        const preset = btn.dataset.preset;
        const st = FEMALE_STUDENTS[this.currentStudentIdx];
        if (!st) return;

        if (preset === 'default') {
          textarea.value = st.wish || `Chúc ${st.name} ngày 20/10 thật hạnh phúc! ❤️`;
        } else if (preset === '1') {
          textarea.value = `Chúc ${st.name} ngày 20/10 luôn xinh đẹp, tự tin toả sáng như vì sao rực rỡ nhất giữa dải ngân hà 12B1! ✨🌸`;
        } else if (preset === '2') {
          textarea.value = `Chúc ${st.name} tuổi thanh xuân ngập tràn may mắn, học tập xuất sắc, luôn nhận được nhiều điểm 10 và muôn vàn yêu thương! 💖`;
        }
        this.render();
      });
    }

    // 5. Nút Tải Ảnh Story HD (1080x1920)
    const btnDownload = document.getElementById('btnDownloadStoryCard');
    if (btnDownload) {
      btnDownload.onclick = () => this.downloadStoryCard();
    }

    // 6. Nút Chia sẻ Story
    const btnShare = document.getElementById('btnShareStoryCard');
    if (btnShare) {
      btnShare.onclick = () => this.shareStoryCard();
    }

    // 7. Nút Sao chép ảnh
    const btnCopy = document.getElementById('btnCopyStoryCard');
    if (btnCopy) {
      btnCopy.onclick = () => this.copyStoryCard();
    }

    // 8. Đóng modal
    const btnClose = document.getElementById('btnCloseStoryModal');
    if (btnClose) btnClose.onclick = () => this.close();

    const backdrop = document.getElementById('storyModalBackdrop');
    if (backdrop) backdrop.onclick = () => this.close();

    // Phím Escape
    window.addEventListener('keydown', (e) => {
      const modal = document.getElementById('storyCardModal');
      if (modal && modal.classList.contains('active') && e.key === 'Escape') {
        this.close();
      }
    });

    // 9. Nút mở Modal từ Header, Stage 6, Tour, Lightbox
    const btnHeader = document.getElementById('btnHeaderExportStory');
    if (btnHeader) btnHeader.onclick = () => this.open(this.currentStudentIdx);

    const btnStage6 = document.getElementById('btnExportStoryCard');
    if (btnStage6) btnStage6.onclick = () => this.open(this.currentStudentIdx);

    const btnTour = document.getElementById('btnTourExportStory');
    if (btnTour) {
      btnTour.onclick = () => {
        const tourIdxEl = document.getElementById('tourCurrentIndex');
        const curIdx = tourIdxEl ? (parseInt(tourIdxEl.textContent) - 1) : this.currentStudentIdx;
        this.open(Math.max(0, curIdx));
      };
    }

    const btnLightbox = document.getElementById('btnLightboxExportStory');
    if (btnLightbox) {
      btnLightbox.onclick = () => {
        this.open(this.currentStudentIdx);
      };
    }
  },

  open(studentIdx = 0) {
    const modal = document.getElementById('storyCardModal');
    if (!modal) return;
    this.selectStudent(studentIdx);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  },

  close() {
    const modal = document.getElementById('storyCardModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  },

  showToast(message) {
    const toast = document.getElementById('storyToast');
    const textEl = document.getElementById('storyToastText');
    if (!toast || !textEl) return;
    textEl.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 4000);
  },

  getStudentImage(student, idx, callback) {
    const photoUrl = getStudentPhoto(student, idx);
    if (!photoUrl) {
      callback(null);
      return;
    }
    if (this.cachedImages[photoUrl] && this.cachedImages[photoUrl].complete) {
      callback(this.cachedImages[photoUrl]);
      return;
    }
    const img = new Image();
    if (!photoUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      this.cachedImages[photoUrl] = img;
      callback(img);
    };
    img.onerror = () => {
      callback(null);
    };
    img.src = photoUrl;
  },

  preloadAllImages() {
    FEMALE_STUDENTS.forEach((st, idx) => {
      this.getStudentImage(st, idx, () => {});
    });
  },

  // Helper vẽ hình chữ nhật bo góc
  roundRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      return;
    }
    let r = radius;
    if (typeof r === 'number') {
      r = { tl: r, tr: r, br: r, bl: r };
    } else {
      r = Object.assign({ tl: 0, tr: 0, br: 0, bl: 0 }, r);
    }
    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + width - r.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
    ctx.lineTo(x + width, y + height - r.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
    ctx.lineTo(x + r.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
  },

  // Helper vẽ chữ tự động xuống dòng và căn giữa
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return 0;
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    for (let k = 0; k < lines.length; k++) {
      ctx.fillText(lines[k], x, startY + (k * lineHeight));
    }
    return lines.length;
  },

  // RENDER TOÀN BỘ CANVAS 1080 x 1920 PX
  render() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = 1080;
    const height = 1920;
    const student = FEMALE_STUDENTS[this.currentStudentIdx] || FEMALE_STUDENTS[0];
    const textarea = document.getElementById('storyCustomWish');
    const wishText = (textarea && textarea.value.trim()) ? textarea.value.trim() : (student.wish || '');

    this.getStudentImage(student, this.currentStudentIdx, (img) => {
      try {
        // 1. NỀN THIÊN HÀ SÂU THẲM (DEEP LUXURY GALAXY BACKGROUND)
        ctx.clearRect(0, 0, width, height);

      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0.00, '#070110');
      bgGradient.addColorStop(0.20, '#150322');
      bgGradient.addColorStop(0.50, '#2c0633');
      bgGradient.addColorStop(0.80, '#190326');
      bgGradient.addColorStop(1.00, '#06010d');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Quầng sáng tinh vân (Cosmic Nebula Glows)
      const radialNebula1 = ctx.createRadialGradient(width * 0.5, height * 0.28, 50, width * 0.5, height * 0.28, 650);
      radialNebula1.addColorStop(0, 'rgba(225, 29, 72, 0.32)');
      radialNebula1.addColorStop(0.5, 'rgba(219, 39, 119, 0.15)');
      radialNebula1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialNebula1;
      ctx.fillRect(0, 0, width, height);

      const radialNebula2 = ctx.createRadialGradient(width * 0.25, height * 0.72, 30, width * 0.25, height * 0.72, 500);
      radialNebula2.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
      radialNebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialNebula2;
      ctx.fillRect(0, 0, width, height);

      const radialNebula3 = ctx.createRadialGradient(width * 0.75, height * 0.85, 30, width * 0.75, height * 0.85, 450);
      radialNebula3.addColorStop(0, 'rgba(255, 215, 0, 0.18)');
      radialNebula3.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialNebula3;
      ctx.fillRect(0, 0, width, height);

      // Bụi sao & Tinh tú lấp lánh (Deterministic Stars)
      ctx.save();
      for (let i = 0; i < 110; i++) {
        const starX = ((i * 137.5) % width);
        const starY = ((i * 329.7) % height);
        const starR = ((i % 5) * 0.6) + 0.8;
        const starAlpha = ((i % 7) / 10) + 0.3;

        ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
        ctx.beginPath();
        ctx.arc(starX, starY, starR, 0, Math.PI * 2);
        ctx.fill();

        if (i % 8 === 0) {
          ctx.strokeStyle = `rgba(255, 215, 0, ${starAlpha * 0.8})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(starX - 6, starY);
          ctx.lineTo(starX + 6, starY);
          ctx.moveTo(starX, starY - 6);
          ctx.lineTo(starX, starY + 6);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Khung viền chỉ vàng hoàng gia đôi (Double Gold Royal Border)
      ctx.save();
      const margin = 42;
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
      ctx.lineWidth = 2;
      this.roundRect(ctx, margin, margin, width - margin * 2, height - margin * 2, 28);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
      ctx.lineWidth = 1;
      this.roundRect(ctx, margin + 8, margin + 8, width - (margin + 8) * 2, height - (margin + 8) * 2, 22);
      ctx.stroke();

      // Hoa văn 4 góc (Corner Flourish Accents)
      const corners = [
        [margin + 16, margin + 16],
        [width - margin - 16, margin + 16],
        [margin + 16, height - margin - 16],
        [width - margin - 16, height - margin - 16]
      ];
      ctx.fillStyle = '#ffd700';
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 2. HEADER: TIÊU ĐỀ THIỆP & BADGE
      ctx.save();
      ctx.textAlign = 'center';

      // Top Tag Pill: ✦ FOREVER 12B1 • 20.10.2026 ✦
      const pillW = 460;
      const pillH = 46;
      const pillX = (width - pillW) / 2;
      const pillY = 125;
      ctx.fillStyle = 'rgba(26, 6, 36, 0.85)';
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, pillX, pillY, pillW, pillH, 999);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 20px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.fillText('✦ FOREVER 12B1 • 20.10.2026 ✦', width / 2, pillY + 30);

      // Tiêu đề chính lớn: ĐÓA HOA RẠNG RỠ
      ctx.font = '700 62px "Playfair Display", Georgia, serif';
      const titleGrad = ctx.createLinearGradient(width / 2 - 250, 200, width / 2 + 250, 260);
      titleGrad.addColorStop(0, '#ffffff');
      titleGrad.addColorStop(0.35, '#fde68a');
      titleGrad.addColorStop(0.7, '#f472b6');
      titleGrad.addColorStop(1, '#ffd700');
      ctx.fillStyle = titleGrad;
      ctx.shadowColor = 'rgba(225, 29, 72, 0.6)';
      ctx.shadowBlur = 25;
      ctx.fillText('ĐÓA HOA RẠNG RỠ', width / 2, 235);
      ctx.shadowBlur = 0;

      // Phụ đề: GIỮA NGÂN HÀ THANH XUÂN
      ctx.font = '600 26px "Montserrat", sans-serif';
      ctx.fillStyle = '#fce7f3';
      ctx.fillText('GIỮA NGÂN HÀ THANH XUÂN', width / 2, 280);

      // Dấu ngắt trang trí
      ctx.fillStyle = '#ffd700';
      ctx.font = '20px serif';
      ctx.fillText('◆  •  ◆', width / 2, 315);
      ctx.restore();

      // 3. THẺ ẢNH POLAROID CHÍNH GIỮA (CENTER PHOTO CARD)
      const cardW = 780;
      const cardH = 880;
      const cardX = (width - cardW) / 2;
      const cardY = 345;

      ctx.save();
      // Đổ bóng phát quang của khung thẻ
      ctx.shadowColor = 'rgba(225, 29, 72, 0.5)';
      ctx.shadowBlur = 45;
      ctx.shadowOffsetY = 15;

      // Nền khung thẻ polaroid màu ngọc trai sang trọng
      const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      cardGrad.addColorStop(0, '#ffffff');
      cardGrad.addColorStop(0.6, '#fff5f7');
      cardGrad.addColorStop(1, '#fef2f4');
      ctx.fillStyle = cardGrad;
      this.roundRect(ctx, cardX, cardY, cardW, cardH, 26);
      ctx.fill();

      // Viền kim loại vàng hồng bao quanh khung thẻ
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
      ctx.lineWidth = 3;
      this.roundRect(ctx, cardX, cardY, cardW, cardH, 26);
      ctx.stroke();

      // Khung chứa ảnh chụp (Photo Inner Box)
      const photoPadding = 32;
      const photoX = cardX + photoPadding;
      const photoY = cardY + photoPadding;
      const photoW = cardW - photoPadding * 2;
      const photoH = 680;
      const photoRadius = 18;

      ctx.save();
      this.roundRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
      ctx.clip();

      if (img && img.width > 0) {
        const imgAspect = img.width / img.height;
        const targetAspect = photoW / photoH;
        let sx, sy, sWidth, sHeight;

        if (imgAspect > targetAspect) {
          sHeight = img.height;
          sWidth = img.height * targetAspect;
          sx = (img.width - sWidth) / 2;
          sy = 0;
        } else {
          sWidth = img.width;
          sHeight = img.width / targetAspect;
          sx = 0;
          const cropYPercent = typeof student.cropY === 'number' ? student.cropY : 0.20;
          sy = Math.max(0, Math.min(img.height - sHeight, (img.height - sHeight) * cropYPercent * 2.2));
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, photoX, photoY, photoW, photoH);

        // Lớp phủ ánh sáng gradient nhẹ trên bề mặt ảnh
        const photoGlow = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
        photoGlow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        photoGlow.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        photoGlow.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
        ctx.fillStyle = photoGlow;
        ctx.fillRect(photoX, photoY, photoW, photoH);
      } else {
        ctx.fillStyle = '#20052d';
        ctx.fillRect(photoX, photoY, photoW, photoH);
        ctx.fillStyle = '#ffd700';
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(student.name, photoX + photoW / 2, photoY + photoH / 2);
      }
      ctx.restore();

      // Viền trong bức ảnh
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
      ctx.stroke();

      // Thông tin học sinh dưới tấm ảnh polaroid
      ctx.textAlign = 'center';

      // 1. Tên học sinh
      ctx.font = '700 44px "Playfair Display", serif';
      ctx.fillStyle = '#881337';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 5;
      ctx.fillText(student.name, width / 2, cardY + 762);
      ctx.shadowBlur = 0;

      // 2. Danh hiệu & Ngày sinh
      const badgeText = `✨ ${student.title} • ${student.dob}`;
      ctx.font = '600 23px "Be Vietnam Pro", sans-serif';
      const badgeMetrics = ctx.measureText(badgeText);
      const bW = badgeMetrics.width + 36;
      const bH = 40;
      const bX = (width - bW) / 2;
      const bY = cardY + 795;

      ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.35)';
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, bX, bY, bW, bH, 999);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#be123c';
      ctx.fillText(badgeText, width / 2, bY + 28);
      ctx.restore();

      // 4. KHUNG LỜI CHÚC TRÂN TRỌNG (HEARTFELT WISH BOX)
      const wishW = 860;
      const wishH = 340;
      const wishX = (width - wishW) / 2;
      const wishY = 1260;

      ctx.save();
      // Nền kính mờ huyền ảo
      ctx.fillStyle = 'rgba(24, 7, 34, 0.85)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 30;
      this.roundRect(ctx, wishX, wishY, wishW, wishH, 24);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Viền vàng hồng quý phái
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, wishX, wishY, wishW, wishH, 24);
      ctx.stroke();

      // Dấu ngoặc kép trang trí mở
      ctx.font = '700 70px "Playfair Display", Georgia, serif';
      ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.textAlign = 'left';
      ctx.fillText('“', wishX + 32, wishY + 68);

      // Dấu ngoặc kép trang trí đóng
      ctx.textAlign = 'right';
      ctx.fillText('”', wishX + wishW - 32, wishY + wishH - 50);

      // Nội dung lời chúc (Tự động xuống dòng)
      ctx.textAlign = 'center';
      ctx.font = 'italic 500 27px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#fff0f5';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 10;
      this.wrapText(ctx, wishText, width / 2, wishY + 130, wishW - 120, 44);
      ctx.shadowBlur = 0;

      // Chữ ký tập thể nam 12B1
      ctx.font = '700 23px "Dancing Script", cursive, "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.fillText('— Tập thể nam 12B1 thân tặng với tất cả sự trân trọng ❤️ —', width / 2, wishY + wishH - 30);
      ctx.restore();

      // 5. FOOTER: THÔNG ĐIỆP ĐOẠN KẾT
      ctx.save();
      ctx.textAlign = 'center';

      // 3 Ngôi sao nhỏ
      ctx.font = '22px serif';
      ctx.fillStyle = '#ffd700';
      ctx.fillText('✦   ✦   ✦', width / 2, 1665);

      // Tên tác phẩm
      ctx.font = '600 22px "Montserrat", sans-serif';
      ctx.fillStyle = 'rgba(253, 230, 138, 0.9)';
      ctx.fillText('COSMIC 20.10 • ĐÓA HOA NỞ GIỮA NGÂN HÀ 12B1', width / 2, 1715);

      // Thông điệp thanh xuân
      ctx.font = '400 18px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = 'rgba(252, 231, 243, 0.65)';
      ctx.fillText('Mãi là những ký ức vô giá và tươi đẹp nhất của tuổi học trò', width / 2, 1750);

      // Watermark nhỏ góc đáy
      ctx.font = '600 14px "Montserrat", sans-serif';
      ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.fillText('HIGH RESOLUTION STORY CARD • 1080 × 1920 PX', width / 2, 1835);
      ctx.restore();
      } catch (err) {
        console.error('Lỗi khi render Story Canvas:', err);
      }
    });
  },

  // TẢI ẢNH PNG 1080x1920 XUỐNG MÁY
  downloadStoryCard() {
    if (!this.canvas) return;
    const student = FEMALE_STUDENTS[this.currentStudentIdx] || FEMALE_STUDENTS[0];
    
    // Tên file không dấu, gọn gàng
    const cleanName = student.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/\s+/g, '_');
    const filename = `Thiep_20_10_12B1_${cleanName}.png`;

    try {
      this.canvas.toBlob((blob) => {
        if (!blob) {
          const dataUrl = this.canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.showToast(`✨ Đã tải thiệp Story của bạn ${student.name} thành công!`);
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        this.showToast(`✨ Đã tải thiệp Story của bạn ${student.name} thành công!`);

        // Bắn pháo giấy chúc mừng
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
          });
        }
      }, 'image/png');
    } catch (e) {
      console.error('Lỗi xuất ảnh Story Canvas:', e);
      const dataUrl = this.canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast(`✨ Đã tải thiệp Story của bạn ${student.name} thành công!`);
    }
  },

  // CHIA SẺ STORY LÊN MẠNG XÃ HỘI
  async shareStoryCard() {
    if (!this.canvas) return;
    const student = FEMALE_STUDENTS[this.currentStudentIdx] || FEMALE_STUDENTS[0];

    try {
      if (navigator.share && this.canvas.toBlob) {
        this.canvas.toBlob(async (blob) => {
          if (!blob) {
            this.downloadStoryCard();
            return;
          }
          const cleanName = student.name.replace(/\s+/g, '_');
          const file = new File([blob], `Thiep_20_10_12B1_${cleanName}.png`, { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Thiệp 20/10 12B1 - ${student.name}`,
              text: `Đóa hoa rạng rỡ của 12B1 • 20.10.2026 🌸`,
              files: [file]
            });
            this.showToast('✨ Đã mở chia sẻ Story!');
          } else {
            this.downloadStoryCard();
          }
        }, 'image/png');
      } else {
        this.downloadStoryCard();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.downloadStoryCard();
      }
    }
  },

  // SAO CHÉP ẢNH VÀO CLIPBOARD
  async copyStoryCard() {
    if (!this.canvas) return;
    const student = FEMALE_STUDENTS[this.currentStudentIdx] || FEMALE_STUDENTS[0];

    try {
      if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
        this.canvas.toBlob(async (blob) => {
          if (!blob) {
            this.showToast('Không thể sao chép ảnh. Vui lòng bấm Tải Về!');
            return;
          }
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          this.showToast(`📋 Đã sao chép ảnh thiệp ${student.name} vào bộ nhớ tạm!`);
        }, 'image/png');
      } else {
        this.downloadStoryCard();
      }
    } catch (err) {
      console.warn('Lỗi clipboard:', err);
      this.downloadStoryCard();
    }
  }
};

// ==========================================================
// 9. KHỞI TẠO ỨNG DỤNG (INITIALIZATION)
// ==========================================================
window.addEventListener('DOMContentLoaded', () => {
  initCinematicTourEvents();
  setup3DCardTiltInteractions();
  StoryCardManager.init();
  const urlParams = new URLSearchParams(window.location.search);
  const hashMatch = window.location.hash.match(/stage(\d+)/i);
  const startStage = parseInt(urlParams.get('stage')) || (hashMatch ? parseInt(hashMatch[1]) : 1);
  switchStage(startStage);
});
