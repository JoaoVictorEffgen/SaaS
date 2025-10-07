@echo off
echo ========================================
echo    LIMPANDO CACHE E REINICIANDO
echo ========================================

echo Parando todos os processos Node.js...
taskkill /F /IM node.exe >nul 2>&1

echo Limpando cache do navegador...
echo Pressione Ctrl+Shift+R no navegador para forçar atualização

echo Aguardando 3 segundos...
timeout /t 3 /nobreak >nul

echo Iniciando servidor backend...
start "Backend Server" cmd /k "cd server && node simple-server.js"

echo Aguardando 3 segundos...
timeout /t 3 /nobreak >nul

echo Iniciando frontend...
start "Frontend Client" cmd /k "cd client && npm start"

echo.
echo ========================================
echo    SISTEMA REINICIADO!
echo ========================================
echo.
echo IMPORTANTE: No navegador, pressione:
echo - Ctrl+Shift+R para forçar atualização
echo - Ou F12 > Network > Disable cache
echo.
echo Acessos:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5000
echo.
pause
