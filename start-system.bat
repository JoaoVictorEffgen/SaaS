@echo off
echo ========================================
echo    INICIANDO SISTEMA SAAS AGENDAMENTO
echo ========================================

echo.
echo [1/3] Parando processos antigos...
taskkill /F /IM node.exe >nul 2>&1

echo [2/3] Iniciando servidor backend...
start "Backend Server" cmd /k "cd server && node simple-server.js"

echo [3/3] Aguardando 3 segundos e iniciando frontend...
timeout /t 3 /nobreak >nul

echo Iniciando frontend...
start "Frontend Client" cmd /k "cd client && npm start"

echo.
echo ========================================
echo    SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo Acessos:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5000
echo.
echo Credenciais de teste:
echo - Cliente: maria@email.com / cliente123
echo - Empresa: contato@barbeariamoderna.com / empresa123
echo - Funcionario: 123.456.789-00 / funcionario123
echo.
pause
