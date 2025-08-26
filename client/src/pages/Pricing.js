import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        'Até 10 agendamentos por mês',
        'Agenda básica',
        'Notificações por e-mail',
        'Suporte por e-mail'
      ],
      popular: false,
      buttonText: 'Começar Grátis',
      buttonLink: '/register'
    },
    {
      name: 'Pro',
      price: 'R$ 39,90',
      period: '/mês',
      description: 'Para profissionais que crescem',
      features: [
        'Agendamentos ilimitados',
        'Agenda avançada',
        'Notificações por WhatsApp',
        'Relatórios básicos',
        'Integração com calendário',
        'Suporte prioritário'
      ],
      popular: true,
      buttonText: 'Começar Pro',
      buttonLink: '/register'
    },
    {
      name: 'Business',
      price: 'R$ 99,90',
      period: '/mês',
      description: 'Para equipes e empresas',
      features: [
        'Tudo do plano Pro',
        'Múltiplos usuários',
        'Relatórios avançados',
        'API de integração',
        'Personalização completa',
        'Suporte 24/7',
        'Treinamento da equipe'
      ],
      popular: false,
      buttonText: 'Começar Business',
      buttonLink: '/register'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg mr-3"></div>
              <span className="text-xl font-semibold text-gray-900">AgendaPro</span>
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Escolha o plano ideal para você
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comece grátis e escale conforme sua necessidade. Todos os planos incluem atualizações automáticas e suporte.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-500 text-white">
                    <Star className="h-4 w-4 mr-1" />
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-lg text-gray-600 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.buttonLink}
                className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Perguntas Frequentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Posso mudar de plano a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas imediatamente.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Há período de teste gratuito?
              </h3>
              <p className="text-gray-600">
                O plano Free é sempre gratuito. Para os planos pagos, oferecemos 7 dias de teste gratuito.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Como funciona o suporte?
              </h3>
              <p className="text-gray-600">
                Todos os planos incluem suporte por e-mail. Pro e Business incluem suporte prioritário e WhatsApp.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Posso cancelar quando quiser?
              </h3>
              <p className="text-gray-600">
                Sim, você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-blue-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Junte-se a milhares de profissionais que já usam o AgendaPro
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Criar conta gratuita
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 