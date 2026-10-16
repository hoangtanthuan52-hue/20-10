@echo off
chcp 65001 > nul
cd /d "%~dp0"
title VŨ TRỤ TRI ÂN 20.10 - 23 VÌ TINH TÚ
echo ========================================================================
echo   TRANG WEB QUÀ TẶNG TRI ÂN 20/10 LÃNG MẠN TRONG KHÔNG GIAN VŨ TRỤ
echo   Dành tặng 23 đóa hoa tuyệt vời nhất của tập thể lớp chúng mình 🌸
echo ========================================================================
echo.
echo Đang khởi chạy ứng dụng (Hoàn toàn 100%% Offline, Không cần kết nối mạng)...
echo.

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start /b "" node serve.js >nul 2>nul
  timeout /t 1 >nul
  start "" "http://127.0.0.1:3000/index.html"
) else (
  start "" "%~dp0index.html"
)

echo.
echo 6 Giai đoạn trải nghiệm tương tác điện ảnh:
echo  1. Bó hoa nở rộ 3D & Phấn hoa phát quang (Three.js Organic Flower Bloom)
echo  2. Lịch bóc tường truyền thống 20/10 & Mưa cánh hoa (Tear-off Wall Calendar)
echo  3. Thiên hà xoắn ốc 23 tinh tú (Interactive Spiral Galaxy - 4 quỹ đạo Kepler)
echo  4. Quả cầu & Bức tường ảnh kỷ niệm 3D (Photo Galaxy Sphere & 360 Cylindrical Wall)
echo  5. Phong bì thư sáp đỏ 3D & Bức thư gõ chữ tự động cuộn (Ruby Wax Seal & Typewriter)
echo  6. Vũ điệu trái tim & 23 tên bạn nữ bay lượn vĩnh cửu (Infinite Finale)
echo.
echo Phím tắt (nếu muốn thao tác):
echo  - [R]: Xem lại hoạt ảnh hoa nở từ đầu
echo  - [D]: Bật/Tắt thanh thông số FPS & Nhãn pha (Debug HUD)
echo.
pause
