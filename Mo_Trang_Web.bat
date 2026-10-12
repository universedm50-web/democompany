@echo off
chcp 65001 > nul
echo ========================================================
echo   DEMO GROUP - THE BREATH OF MEKONG SEA (4.000 HA)
echo   Đang khởi chạy trang web giới thiệu công ty...
echo ========================================================
start "" "index.html"
echo Đã mở trang web trong trình duyệt mặc định của bạn.
timeout /t 3 > nul
exit
