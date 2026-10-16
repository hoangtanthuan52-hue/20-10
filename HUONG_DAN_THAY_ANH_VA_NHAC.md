# 🌌 HƯỚNG DẪN SỬ DỤNG & TÙY BIẾN DỰ ÁN VŨ TRỤ TRI ÂN 20/10 (100% OFFLINE)

Dự án đã được tích hợp đầy đủ và tối ưu **100% Offline** (không cần kết nối Internet, không phụ thuộc CDN bên ngoài), hỗ trợ mở trực tiếp bằng cách nhấp đúp file `.bat` hoặc mở trực tiếp `index.html`.

---

## 📂 1. Cấu Trúc Mã Nguồn Module
```text
qua_tang_20_10_galaxy/
├── index.html                 # Giao diện chính 5 giai đoạn chuyển cảnh điện ảnh
├── style.css                  # Bảng màu Luxury, 3D Transforms, Glassmorphism, Responsive
├── fx.js                      # Canvas Parallax Starfield, Bụi sao chuột, Phấn hoa, Pháo hoa, Bóng bay
├── main.js                    # Điều khiển 5 giai đoạn, Warp Drive, Three.js Photo Galaxy, Wax Seal
├── images_data.js             # Bộ nạp ảnh Base64 Offline 100% (Mở trực tiếp file:// không bị lỗi)
├── photo_galaxy.html          # Trang hiệu ứng Quả cầu & Tường ảnh Three.js 3D độc lập (Offline)
├── galaxy_three.html          # Trang 3D độc lập Three.js WebGL 60FPS
├── Chay_Galaxy_20_10.bat      # File nhấp đúp chạy nhanh 5 giai đoạn trên Windows
├── libs/                      # Toàn bộ thư viện cục bộ (three.min.js, gsap, fonts, fontawesome)
├── images/                    # Thư mục chứa hình ảnh kỷ niệm của lớp (photo1.jpg - photo8.jpg)
└── audio/                     # Thư mục chứa nhạc nền (music.mp3)
```

---

## ✨ 2. Quy Trình 5 Giai Đoạn Chuyển Cảnh Điện Ảnh
1. **Stage 1 - Đóa Hoa Nở Giữa Ngân Hà:**
   - Đóa hoa Three.js 3D nở bung từ tâm với độ trễ tự nhiên (ease back), chuyển động nhấp nhô và tan thành khói sao.
2. **Stage 2 - Lịch Kỷ Niệm 20.10 Hoàng Gia:**
   - Khung thẻ pha lê Holographic sang trọng cân đối chính giữa, ngày 20 nhịp tim vương miện hoàng gia, tung cánh hoa hồng và pháo hoa.
3. **Stage 3 - Thiên Hà 23 Vì Tinh Tú:**
   - 23 bạn nữ chuyển động trên 4 quỹ đạo Kepler đồng tâm, nhân thiên hà 12B1 rực sáng, thẻ Spotlight chi tiết khi rê chuột.
   - Nhấn nút **"Hành Trình Kỷ Niệm ✦"** để kích hoạt hiệu ứng Warp Drive siêu tốc bay vào Stage 4.
4. **Stage 4 - Quả Cầu & Bức Tường Ảnh 3D (Photo Galaxy):**
   - 23 thẻ ảnh học sinh có viền Rose Gold và thanh danh tính (Tên + Danh hiệu) bay lượn từ vũ trụ, xoáy ốc tụ thành Quả cầu 3D.
   - Quả cầu nổ tung bung tỏa bụi sao, tái cấu trúc thành **Bức tường ảnh hình trụ 360° bao quanh người xem**.
   - Hỗ trợ **kéo chuột / vuốt chạm xoay 360° tự do** ngắm nhìn từng bạn nữ và đọc những dòng phụ đề tri ân lãng mạn.
5. **Stage 5 - Con Dấu Sáp Đỏ & Bức Thư Tri Ân:**
   - Con dấu sáp ruby vỡ đôi 3D, giấy thư xếp nếp trồi lên, hiệu ứng gõ phím chân thực, chữ ký tay viết mực đỏ và màn kết pháo hoa giấy confetti.

---

## 🚀 3. Hướng Dẫn Mở Khi Không Có Mạng (Offline 100%)
- **Cách 1 (Khuyên dùng):** Nhấp đúp vào file `Chay_Galaxy_20_10.bat`. File sẽ tự động mở trình duyệt xem trọn vẹn 5 màn chuyển cảnh mượt mà 60fps.
- **Cách 2:** Nhấp đúp trực tiếp vào file `index.html` trong bất kỳ trình duyệt nào (Chrome, Edge, Cốc Cốc, Firefox). Nhờ tệp `images_data.js`, tất cả ảnh kỷ niệm và hiệu ứng 3D đều hiển thị trọn vẹn ngay lập tức.
- **Cách 3 (Xem riêng hiệu ứng Quả cầu & Tường ảnh):** Nhấp đúp vào file `photo_galaxy.html`.
