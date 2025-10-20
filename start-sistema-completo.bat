@echo off
echo ========================================
echo    INICIANDO SISTEMA AGENDAPRO
echo ========================================

echo.
echo [1/4] Matando processos Node.js existentes...
taskkill /f /im node.exe >nul 2>&1

echo [2/4] Iniciando servidor backend na porta 5001...
start "Backend" cmd /k "cd /d C:\Users\pqpja\OneDrive\Desktop\projeto SaaS\server && node simple-server-final.js"

echo [3/4] Aguardando 3 segundos para o backend inicializar...
timeout /t 3 /nobreak >nul

echo [4/4] Iniciando frontend na porta 3000...
start "Frontend" cmd /k "cd /d C:\Users\pqpja\OneDrive\Desktop\projeto SaaS\client && npm start"

echo.
echo ========================================
echo    SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Aguarde alguns segundos para o frontend carregar...
echo Depois acesse: http://localhost:3000
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
