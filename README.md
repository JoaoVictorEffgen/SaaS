# 🚀 AgendaPro - Sistema de Agendamento SaaS

Sistema completo de agendamento online com PWA, pagamentos automáticos e gestão empresarial.

## ✨ Funcionalidades

### 🎯 Sistema de Usuários
- **Empresa:** Cadastro e gestão completa
- **Funcionário:** Vinculado à empresa
- **Cliente:** Agendamento de serviços

### 📱 PWA (Progressive Web App)
- Instalação em celular/desktop
- Funcionamento offline
- Ícones personalizados
- Notificações push

### 💳 Sistema de Pagamentos (Para Implementar)
- Planos: R$ 49,99 | R$ 149,99 | R$ 249,99
- Cobrança automática mensal
- Dashboard de receita
- Controle de acesso por plano

## 🛠️ Tecnologias

- **Frontend:** React + PWA
- **Backend:** Node.js + Express
- **Database:** MySQL + Sequelize
- **Pagamentos:** Stripe (para implementar)
- **Autenticação:** JWT

## 🚀 Instalação

### Pré-requisitos
- Node.js 16+
- MySQL 8+
- Git

### Passo a passo
```bash
# Clone o repositório
git clone https://github.com/JoaoVictorEffgen/SaaS.git
cd SaaS

# Instale dependências
cd server && npm install
cd ../client && npm install

# Configure o banco MySQL
# Edite server/.env com suas credenciais

# Inicie o sistema
npm run start-system
```

## 📱 Acesso

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Rede local:** http://192.168.0.7:3000

## 💰 Planos de Pagamento

| Plano | Preço | Funcionalidades |
|-------|-------|----------------|
| **Básico** | R$ 49,99/mês | 200 agendamentos, 5 funcionários |
| **Premium** | R$ 149,99/mês | 1000 agendamentos, 20 funcionários |
| **Enterprise** | R$ 249,99/mês | Ilimitado + API + White label |

## 🎯 Próximos Passos

1. **Implementar sistema de pagamentos** (Stripe)
2. **Configurar planos** de assinatura
3. **Criar dashboard** de gestão
4. **Testar cobrança** automática
5. **Lançar** para o mercado

## 📞 Suporte

Para implementar o sistema de pagamentos ou dúvidas técnicas, entre em contato.

---

**🎉 Sistema 80% pronto! Só falta monetizar!** 💰✨