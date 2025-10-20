@echo off
echo =============================================
echo SAAS AGENDAPRO - SISTEMA COMPLETO
echo =============================================
echo.

echo 🔧 Verificando ambiente...
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado! Instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado! Instale o npm primeiro.
    pause
    exit /b 1
)

echo ✅ Node.js e npm encontrados
echo.

REM Verificar se o arquivo .env existe
if not exist "server\.env" (
    echo ❌ Arquivo .env não encontrado em server/
    echo 📝 Copiando env.example para .env...
    copy "server\env.example" "server\.env"
    echo ✅ Arquivo .env criado
    echo.
)

echo 🚀 Iniciando servidor backend...
echo.
cd server
start "Servidor Backend" cmd /k "node app.js"
cd ..

echo ⏳ Aguardando servidor iniciar...
timeout /t 3 /nobreak >nul

echo 🎨 Iniciando cliente frontend...
echo.
cd client
start "Cliente Frontend" cmd /k "npm start"
cd ..

echo.
echo ✅ Sistema iniciado com sucesso!
echo.
echo 🌐 Acessos disponíveis:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo    Teste:    http://localhost:5000/api/test
echo    Health:   http://localhost:5000/api/health
echo.
echo 📱 Para acesso mobile:
echo    Substitua localhost pelo IP da sua rede local
echo.
echo ⚠️  Para parar o sistema, feche as janelas do terminal
echo.
pause
