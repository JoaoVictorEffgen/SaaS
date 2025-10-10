# 🧪 GUIA COMPLETO DE TESTES DO SISTEMA

## 🚀 PASSO 1: INICIAR O SISTEMA ✅

**Backend e Frontend iniciados!**
- ✅ Backend: `http://localhost:5000`
- ✅ Frontend: `http://localhost:3000`

---

## 📋 ROTEIRO DE TESTES

### 🏢 PARTE 1: CRIAR EMPRESA (15 minutos)

#### **1.1 - Acessar o Sistema**
1. Abra o navegador em: `http://localhost:3000`
2. Você verá a tela inicial com 3 opções:
   - 🏢 **Sou Empresa** ← **CLIQUE AQUI**
   - 👤 Sou Cliente
   - 👨‍💼 Sou Funcionário

#### **1.2 - Cadastrar Nova Empresa**
1. Na tela de login da empresa, clique em **"Não tem cadastro? Cadastre-se"**
2. Preencha o formulário:
   ```
   📝 Nome da Empresa: Barbearia Moderna
   📧 Email: barbearia@teste.com
   📞 Telefone/WhatsApp: (11) 98765-4321
   📍 Endereço: Rua das Flores, 123 - Centro
   🔑 Senha: senha123
   ```
3. Clique em **"Cadastrar"**

#### **1.3 - Upload do Logo**
1. Após criar a empresa, você será direcionado ao dashboard
2. Clique em **"Configurações"** no menu lateral
3. Na seção **"Logo da Empresa"**:
   - Clique em **"Escolher arquivo"**
   - Selecione uma imagem (PNG, JPG ou GIF)
   - A logo será exibida instantaneamente
4. **Salvar** as alterações

#### **1.4 - Verificar Informações**
✅ Verifique se aparece:
- Nome da empresa no topo
- Logo da empresa
- Email e telefone corretos

---

### 💼 PARTE 2: CADASTRAR SERVIÇOS (10 minutos)

#### **2.1 - Acessar Gerenciamento de Serviços**
1. No dashboard da empresa, clique em **"Serviços"** no menu lateral
2. Clique em **"+ Novo Serviço"**

#### **2.2 - Cadastrar Primeiro Serviço**
```
📌 Nome: Corte Masculino
💰 Preço: R$ 35,00
⏱️ Duração: 30 minutos
📝 Descrição: Corte masculino tradicional
```
Clique em **"Salvar"**

#### **2.3 - Cadastrar Segundo Serviço**
```
📌 Nome: Barba
💰 Preço: R$ 25,00
⏱️ Duração: 20 minutos
📝 Descrição: Barba completa com navalha
```
Clique em **"Salvar"**

#### **2.4 - Cadastrar Terceiro Serviço**
```
📌 Nome: Corte + Barba
💰 Preço: R$ 50,00
⏱️ Duração: 50 minutos
📝 Descrição: Combo completo
```
Clique em **"Salvar"**

✅ **Verificar:** Você deve ter 3 serviços cadastrados na lista

---

### 👨‍💼 PARTE 3: CADASTRAR FUNCIONÁRIO (10 minutos)

#### **3.1 - Acessar Gerenciamento de Funcionários**
1. No dashboard da empresa, clique em **"Funcionários"** no menu lateral
2. Clique em **"+ Novo Funcionário"**

#### **3.2 - Cadastrar Funcionário**
```
👤 Nome: João Silva
📧 Email: joao@teste.com
📱 CPF: 123.456.789-00
🔑 Senha: func123
📋 Especialidade: Barbeiro
```

#### **3.3 - Configurar Horários de Trabalho**
```
🗓️ Dias de Trabalho: Segunda a Sábado
⏰ Horário de Início: 09:00
⏰ Horário de Término: 18:00
⏸️ Intervalo (Almoço): 12:00 - 13:00
```

#### **3.4 - Associar Serviços**
- Marque todos os 3 serviços que você cadastrou
- Clique em **"Salvar"**

✅ **Verificar:** Funcionário aparece na lista com status "Ativo"

---

### 🔓 PARTE 4: FAZER LOGOUT DA EMPRESA (2 minutos)

1. Clique no nome da empresa no topo direito
2. Clique em **"Sair"** ou **"Logout"**
3. Você voltará para a tela inicial

---

### 👤 PARTE 5: CRIAR CLIENTE (5 minutos)

#### **5.1 - Acessar Área do Cliente**
1. Na tela inicial, clique em **"👤 Sou Cliente"**
2. Clique em **"Não tem cadastro? Cadastre-se"**

#### **5.2 - Cadastrar Cliente**
```
👤 Nome: Maria Santos
📧 Email: maria@teste.com
📱 Telefone: (11) 91234-5678
🔑 Senha: cliente123
```
3. Clique em **"Cadastrar"**

✅ **Verificar:** Você foi direcionado para a área do cliente

---

### 📅 PARTE 6: FAZER AGENDAMENTO COMO CLIENTE (15 minutos)

#### **6.1 - Selecionar Empresa**
1. Na área do cliente, você verá a lista de empresas
2. Procure **"Barbearia Moderna"** (que você criou)
3. Clique em **"Agendar"** ou **"Ver mais"**

#### **6.2 - Visualizar Informações da Empresa**
✅ Verifique se aparece:
- Logo da empresa
- Nome: Barbearia Moderna
- Endereço
- Botão de WhatsApp
- Botão de Localização (GPS)

#### **6.3 - Testar Botões**
1. **Botão WhatsApp:** 
   - Clique no botão do WhatsApp
   - Deve abrir o WhatsApp Web com mensagem pré-formatada
   
2. **Botão Localização:**
   - Clique no botão de localização
   - Deve abrir um modal com o endereço
   - Pode abrir no Google Maps

#### **6.4 - Fazer Agendamento Normal**

**PASSO 1: Selecionar Funcionário**
```
👨‍💼 Escolha: João Silva
```

**PASSO 2: Selecionar Serviços**
```
✅ Marque: Corte + Barba (R$ 50,00 - 50 minutos)
```

**PASSO 3: Escolher Data e Horário**
```
📅 Data: Amanhã (escolha um dia disponível)
⏰ Horário: 10:00 (escolha um horário disponível)
```

**PASSO 4: Confirmar**
1. Revise os dados no resumo
2. Clique em **"Confirmar Agendamento"**

#### **6.5 - Modal de Agendamento Recorrente**
Após confirmar, aparecerá um modal perguntando:
**"Deseja agendar mais sessões?"**

**Opções:**
- ✅ **"Apenas Este"** - Agenda só essa vez
- 🔄 **"Agendar Série"** - Agenda múltiplas sessões

**Para este teste, clique em "Apenas Este"**

✅ **Verificar:** 
- Mensagem de sucesso
- Agendamento aparece como **"Aguardando Confirmação"**

---

### 🔔 PARTE 7: VER NOTIFICAÇÃO COMO EMPRESA (10 minutos)

#### **7.1 - Fazer Logout do Cliente**
1. Clique em **"Sair"** no canto superior direito
2. Volte para a tela inicial

#### **7.2 - Fazer Login como Empresa**
1. Clique em **"🏢 Sou Empresa"**
2. Login:
   ```
   📧 Email: barbearia@teste.com
   🔑 Senha: senha123
   ```

#### **7.3 - Verificar Notificações**
1. No dashboard, procure o **ícone de sino 🔔** no topo
2. Clique no sino
3. ✅ **Deve aparecer:**
   ```
   🔔 Novo agendamento de Maria Santos
   📅 Data: [data escolhida]
   ⏰ Horário: 10:00
   💼 Serviço: Corte + Barba
   ```

#### **7.4 - Acessar Lista de Agendamentos**
1. Clique em **"Agendamentos"** no menu lateral
2. ✅ **Verifique:**
   - Agendamento de Maria Santos está na lista
   - Status: **"Aguardando Confirmação"** (amarelo/laranja)
   - Todos os detalhes corretos

---

### 👨‍💼 PARTE 8: ACEITAR AGENDAMENTO COMO FUNCIONÁRIO (10 minutos)

#### **8.1 - Fazer Logout da Empresa**
1. Sair da conta da empresa
2. Voltar para a tela inicial

#### **8.2 - Fazer Login como Funcionário**
1. Clique em **"👨‍💼 Sou Funcionário"**
2. Login:
   ```
   📱 CPF: 123.456.789-00
   🔑 Senha: func123
   ```

#### **8.3 - Ver Notificações**
1. Clique no sino 🔔 no topo
2. ✅ **Deve aparecer:**
   ```
   🔔 Novo agendamento para você
   👤 Cliente: Maria Santos
   📅 Data: [data escolhida]
   ⏰ Horário: 10:00
   ```

#### **8.4 - Acessar Meus Agendamentos**
1. No dashboard do funcionário, vá em **"Meus Agendamentos"**
2. Você verá o agendamento de Maria Santos

#### **8.5 - Confirmar o Agendamento**
1. Encontre o agendamento
2. Clique em **"Confirmar"** ou **"Aceitar"**
3. O status muda para **"Confirmado"** (verde)

✅ **Verificar:** 
- Status mudou de amarelo para verde
- Botão mudou para "Marcar como Realizado"

---

### ✅ PARTE 9: CLIENTE VER CONFIRMAÇÃO (5 minutos)

#### **9.1 - Fazer Logout do Funcionário**
1. Sair da conta do funcionário

#### **9.2 - Fazer Login como Cliente**
1. Clique em **"👤 Sou Cliente"**
2. Login:
   ```
   📧 Email: maria@teste.com
   🔑 Senha: cliente123
   ```

#### **9.3 - Ver Notificações**
1. Clique no sino 🔔
2. ✅ **Deve aparecer:**
   ```
   ✅ Seu agendamento foi confirmado!
   📅 Data: [data escolhida]
   ⏰ Horário: 10:00
   💼 Serviço: Corte + Barba
   ```

#### **9.4 - Ver Meus Agendamentos**
1. Vá em **"Meus Agendamentos"**
2. ✅ **Verificar:**
   - Status: **"Confirmado"** (verde)
   - Todos os detalhes corretos

---

### 🔄 PARTE 10: TESTAR AGENDAMENTO RECORRENTE (15 minutos)

#### **10.1 - Fazer Novo Agendamento**
1. Ainda como cliente (Maria)
2. Vá em **"Fazer Agendamento"**
3. Selecione a **Barbearia Moderna** novamente

#### **10.2 - Preencher Dados**
```
👨‍💼 Funcionário: João Silva
✅ Serviço: Corte Masculino
📅 Data: Próxima Segunda-feira
⏰ Horário: 14:00
```

#### **10.3 - Confirmar e Escolher Recorrente**
1. Clique em **"Confirmar Agendamento"**
2. No modal que aparecer, clique em **"Agendar Série"**

#### **10.4 - Configurar Recorrência**
```
🔢 Número de Agendamentos: 5
🔄 Tipo de Recorrência: Semanal
📅 Dia da Semana: Segunda-feira (mesmo dia da primeira data)
```

#### **10.5 - Visualizar Prévia**
✅ **Verifique que aparece a prévia:**
```
📅 Agendamento 1: [Data da primeira segunda]
📅 Agendamento 2: [Data da segunda segunda] (+7 dias)
📅 Agendamento 3: [Data da terceira segunda] (+7 dias)
📅 Agendamento 4: [Data da quarta segunda] (+7 dias)
📅 Agendamento 5: [Data da quinta segunda] (+7 dias)
```

#### **10.6 - Confirmar Série**
1. Clique em **"Confirmar Série Recorrente"**
2. ✅ **Verificar:**
   - Mensagem de sucesso: "5 agendamentos criados!"
   - Todos os 5 agendamentos aparecem em "Meus Agendamentos"

---

### 🎯 PARTE 11: TESTAR NOTIFICAÇÃO DE SÉRIE COMPLETA (10 minutos)

#### **11.1 - Login como Funcionário**
1. Fazer logout do cliente
2. Login como João (funcionário)

#### **11.2 - Marcar Agendamentos como Realizados**
1. Vá em **"Meus Agendamentos"**
2. Você verá os 5 agendamentos recorrentes
3. **Marque 4 deles como "Realizado"** (um por um)
4. Deixe o 5º (último) para depois

#### **11.3 - Marcar o Último Agendamento**
1. Marque o 5º agendamento como **"Realizado"**
2. 🎉 **Deve aparecer uma notificação especial:**
   ```
   🎉 Parabéns!
   Série de agendamentos recorrentes concluída!
   Cliente: Maria Santos
   Total: 5 agendamentos realizados
   ```

#### **11.4 - Verificar Notificação do Cliente**
1. Fazer logout do funcionário
2. Login como Maria (cliente)
3. Verificar notificações
4. ✅ **Deve ter:**
   ```
   🎉 Parabéns! Você completou todos os seus agendamentos!
   Total: 5 sessões realizadas
   Serviço: Corte Masculino
   ```

---

## ✅ CHECKLIST FINAL DE TESTES

### 🏢 EMPRESA:
- [x] Cadastro de empresa
- [x] Upload de logo
- [x] Cadastro de serviços (múltiplos)
- [x] Cadastro de funcionários
- [x] Configuração de horários
- [x] Ver agendamentos
- [x] Receber notificações

### 👨‍💼 FUNCIONÁRIO:
- [x] Login com CPF
- [x] Ver agenda pessoal
- [x] Receber notificações
- [x] Confirmar agendamentos
- [x] Marcar como realizado
- [x] Notificação de série completa

### 👤 CLIENTE:
- [x] Cadastro de cliente
- [x] Ver empresas disponíveis
- [x] Ver logo da empresa
- [x] Botão WhatsApp funcional
- [x] Botão GPS/Localização
- [x] Fazer agendamento normal
- [x] Fazer agendamento recorrente (3, 5 ou 7 sessões)
- [x] Ver prévia de datas recorrentes
- [x] Receber notificações
- [x] Ver status dos agendamentos

### 🔄 AGENDAMENTOS RECORRENTES:
- [x] Escolher quantidade (3, 5 ou 7)
- [x] Escolher tipo (Semanal, Quinzenal, Mensal)
- [x] Selecionar dia da semana (apenas 1)
- [x] Ver prévia das datas
- [x] Criar todos de uma vez
- [x] Notificação quando série completa

### 🔔 NOTIFICAÇÕES:
- [x] Novo agendamento (empresa)
- [x] Novo agendamento (funcionário)
- [x] Agendamento confirmado (cliente)
- [x] Série completa (funcionário e cliente)

---

## 🎉 RESULTADO ESPERADO

Ao final destes testes, você terá:

✅ **1 Empresa cadastrada** com logo  
✅ **3 Serviços cadastrados** com preços e durações  
✅ **1 Funcionário cadastrado** com horários  
✅ **1 Cliente cadastrado**  
✅ **1 Agendamento normal** confirmado  
✅ **5 Agendamentos recorrentes** (série semanal)  
✅ **Notificações funcionando** em todos os perfis  
✅ **WhatsApp e GPS integrados**  

---

## 📊 TEMPO ESTIMADO TOTAL

⏱️ **1h30min a 2h** para fazer todos os testes completos

---

## 💡 DICAS IMPORTANTES

1. **Abra em abas diferentes** - Facilita trocar entre perfis
2. **Use modo anônimo** - Para testar múltiplos logins simultâneos
3. **Tire prints** - Documente cada etapa funcionando
4. **Teste os botões** - WhatsApp, GPS, todos os cliques
5. **Veja as notificações** - São a parte mais importante!

---

## 🐛 O QUE FAZER SE DER ERRO

1. **Verifique o console do navegador** (F12)
2. **Veja o terminal do backend** - Logs de erro
3. **Limpe o cache** - Ctrl + Shift + Del
4. **Reinicie o sistema** - Pare e inicie novamente

---

**🚀 Bons testes! Qualquer problema, me avise!**

