@echo off
echo ========================================
echo    PARANDO SISTEMA SAAS AGENDAMENTO
echo ========================================

echo Parando todos os processos Node.js...
taskkill /F /IM node.exe

echo Sistema parado com sucesso!
pause
