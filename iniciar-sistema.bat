@echo off
echo ========================================
echo    INICIANDO SISTEMA TIMEFLOW
echo ========================================

echo.
echo 1. Matando processos Node.js existentes...
taskkill /f /im node.exe 2>nul

echo.
echo 2. Iniciando Backend (porta 5001)...
start "Backend TimeFlow" cmd /k "cd server && node simple-server-final.js"

echo.
echo 3. Aguardando backend inicializar...
timeout /t 3 /nobreak >nul

echo.
echo 4. Iniciando Frontend (porta 3000)...
start "Frontend TimeFlow" cmd /k "cd client && npm start"

echo.
echo ========================================
echo    SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo URLs disponíveis:
echo   Desktop: http://localhost:3000
echo   Mobile:  http://192.168.0.7:3000
echo.
echo Aguarde alguns segundos para o frontend carregar...
echo.
pause
