@echo off
chcp 65001 > nul
echo ========================================================================
echo   TRANG THIÊN HÀ 3D THREE.JS WEBGL CHO 23 BẠN NỮ (20/10)
echo   Tối ưu mượt 60 FPS bằng THREE.Points + BufferGeometry + ShaderMaterial
echo ========================================================================
echo.
echo Đang mở trình duyệt khởi động không gian Three.js 3D...
start "" "%~dp0galaxy_three.html"
echo.
echo Thông số cấu hình hệ thống:
echo  - PHOTO_COUNT: 23 bạn nữ lớp 10B1
echo  - PHOTO_SIZE: 2.4 (Khung ảnh chân dung 3:4)
echo  - ORBIT_SPEED: 0.0045 (Quay thiên hà tự động)
echo  - SPAWN_STAGGER: 0.08s (Xuất hiện so le)
echo  - HEART_PARTICLES: 1500 hạt trái tim GPU Shader
echo  - Placeholder Texture: Màu be sang trọng viền vàng kim
echo.
pause
