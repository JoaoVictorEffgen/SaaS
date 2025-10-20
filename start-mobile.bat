@echo off
echo ========================================
echo    INICIANDO SISTEMA PARA MOBILE
echo ========================================

echo.
echo [1/4] Matando processos Node.js existentes...
taskkill /f /im node.exe >nul 2>&1

echo [2/4] Iniciando servidor backend...
start "Backend Mobile" cmd /k "cd /d C:\Users\pqpja\OneDrive\Desktop\projeto SaaS\server && node simple-server-final.js"

echo [3/4] Aguardando 3 segundos para o backend inicializar...
timeout /t 3 /nobreak >nul

echo [4/4] Iniciando frontend para mobile...
start "Frontend Mobile" cmd /k "cd /d C:\Users\pqpja\OneDrive\Desktop\projeto SaaS\client && set HOST=0.0.0.0 && npm start"

echo.
echo ========================================
echo    SISTEMA MOBILE INICIADO!
echo ========================================
echo.
echo 🌐 URLs para acessar:
echo.
echo 💻 Computador:
echo    http://localhost:3000
echo.
echo 📱 Celular/Android Studio:
echo    http://192.168.0.7:3000
echo.
echo 🔧 Backend API:
echo    http://192.168.0.7:5001
echo.
echo 📋 Contas para teste:
echo    Business: business@teste.com / 123456
echo    Pro: pro@teste.com / 123456
echo    Cliente: cliente2@teste.com / 123456
echo.
echo Aguarde alguns segundos para carregar...
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
