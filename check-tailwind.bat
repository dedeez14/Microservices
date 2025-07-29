@echo off
echo 🎨 Testing TailwindCSS Configuration...
echo =========================================

echo.
echo 📦 Warehouse Frontend TailwindCSS Version:
cd /d c:\Project\microservices\frontend
npm list tailwindcss --depth=0 2>nul | find "tailwindcss"

echo.
echo 👥 User Frontend TailwindCSS Version:
cd /d c:\Project\microservices\user-frontend
npm list tailwindcss --depth=0 2>nul | find "tailwindcss"

echo.
echo 🔧 PostCSS Dependencies Check:
echo.
echo Warehouse Frontend:
cd /d c:\Project\microservices\frontend
npm list autoprefixer postcss --depth=0 2>nul | find /I "autoprefixer\|postcss"

echo.
echo User Frontend:
cd /d c:\Project\microservices\user-frontend
npm list autoprefixer postcss --depth=0 2>nul | find /I "autoprefixer\|postcss"

echo.
echo 📄 CSS Import Syntax Check:
echo.
echo Warehouse Frontend index.css:
cd /d c:\Project\microservices\frontend
type src\index.css | findstr /N "@tailwind\|@import.*tailwindcss" | head -n 3

echo.
echo User Frontend index.css:
cd /d c:\Project\microservices\user-frontend
type src\index.css | findstr /N "@tailwind\|@import.*tailwindcss" | head -n 3

echo.
echo ✅ TailwindCSS Configuration Check Complete!
echo.
pause
