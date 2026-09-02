@echo off
echo ========================================
echo    INICIANDO SISTEMA PARA MOBILE
echo ========================================

echo.
cd /d "%~dp0"

echo [1/3] Iniciando servidor backend...
start "Backend Mobile" cmd /k "cd /d ""%~dp0server"" && npm start"

echo [2/3] Aguardando 3 segundos para o backend inicializar...
timeout /t 3 /nobreak >nul

echo [3/3] Iniciando frontend para mobile...
start "Frontend Mobile" cmd /k "cd /d ""%~dp0client"" && set HOST=0.0.0.0 && npm start"

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
echo    http://IP-DO-COMPUTADOR:3000
echo.
echo 🔧 Backend API:
echo    http://IP-DO-COMPUTADOR:5000
echo.
echo Aguarde alguns segundos para carregar...
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
