@echo off
chcp 65001 >nul
echo ========================================================
echo   ĐỒNG BỘ NÂNG CẤP TRANG WEB LÊN NETLIFY QUA GITHUB
echo ========================================================
git add .
git commit -m "Cập nhật nâng cấp trang web 20/10"
git push origin main
echo.
echo ========================================================
echo   ĐÃ ĐẨY CODE LÊN GITHUB THÀNH CÔNG!
echo   Netlify đang tự động cập nhật link trong 5 giây...
echo ========================================================
pause
