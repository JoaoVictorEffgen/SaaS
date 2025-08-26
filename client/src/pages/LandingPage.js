import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Zap, CheckCircle, Star, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-primary-600" />,
      title: 'Agendamento Inteligente',
      description: 'Sistema automático que gerencia seus horários e evita conflitos de agenda.'
    },
    {
      icon: <Clock className="w-8 h-8 text-primary-600" />,
      title: 'Horários Flexíveis',
      description: 'Configure seus horários disponíveis e deixe os clientes escolherem o melhor momento.'
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: 'Gestão de Clientes',
      description: 'Acompanhe todos os agendamentos e mantenha histórico completo dos clientes.'
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-600" />,
      title: 'Notificações Automáticas',
      description: 'E-mails e WhatsApp automáticos para confirmar e lembrar dos agendamentos.'
    }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Psicóloga',
      content: 'O sistema revolucionou minha agenda. Agora meus clientes agendam sozinhos e eu recebo notificações automáticas.',
      rating: 5
    },
    {
      name: 'João Santos',
      role: 'Dentista',
      content: 'Excelente ferramenta! Reduzi drasticamente as falhas de agendamento e melhorei a experiência dos pacientes.',
      rating: 5
    },
    {
      name: 'Ana Costa',
      role: 'Consultora',
      content: 'Simples de usar e muito eficiente. Meus clientes adoram a facilidade para agendar consultas online.',
      rating: 5
    }
  ];

  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        'Até 10 agendamentos/mês',
        'Agenda básica',
        'Notificações por e-mail',
        'Suporte por e-mail'
      ],
      popular: false,
      cta: 'Começar Grátis',
      href: '/register'
    },
    {
      name: 'Pro',
      price: 'R$ 39,90',
      period: '/mês',
      description: 'Para profissionais ativos',
      features: [
        'Agendamentos ilimitados',
        'Notificações WhatsApp',
        'Relatórios básicos',
        'Personalização da agenda',
        'Suporte prioritário'
      ],
      popular: true,
      cta: 'Começar Pro',
      href: '/register?plan=pro'
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
        'Integrações API',
        'Suporte 24/7'
      ],
      popular: false,
      cta: 'Começar Business',
      href: '/register?plan=business'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">AgendaPro</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">
                Funcionalidades
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors">
                Preços
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors">
                Depoimentos
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Agendamento Online{' '}
            <span className="text-gradient">Simplificado</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transforme sua agenda em uma ferramenta poderosa. Deixe seus clientes agendarem 
            online 24/7 enquanto você foca no que realmente importa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary btn-lg text-lg px-8 py-4"
            >
              Começar Grátis por 30 Dias
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button className="btn-outline btn-lg text-lg px-8 py-4">
              Ver Demonstração
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Não é necessário cartão de crédito • Cancelamento a qualquer momento
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para gerenciar sua agenda
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ferramentas poderosas e fáceis de usar para profissionais e empresas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como funciona em 3 passos simples
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Configure sua agenda
              </h3>
              <p className="text-gray-600">
                Defina seus horários disponíveis, duração das consultas e intervalos.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Compartilhe o link
              </h3>
              <p className="text-gray-600">
                Envie o link da sua agenda para clientes agendarem online.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gerencie agendamentos
              </h3>
              <p className="text-gray-600">
                Receba notificações e acompanhe todos os agendamentos pelo dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos usuários dizem
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planos simples e transparentes
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para suas necessidades
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`card relative ${plan.popular ? 'ring-2 ring-primary-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <div className="card-header text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                
                <div className="card-body">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-success-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="card-footer text-center">
                  <Link
                    to={plan.href}
                    className={`w-full btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para transformar sua agenda?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já otimizaram seus agendamentos
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 hover:bg-gray-100 btn btn-lg text-lg px-8 py-4"
          >
            Começar Grátis Agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Calendar className="w-8 h-8 text-primary-400 mr-3" />
                <h3 className="text-xl font-bold">AgendaPro</h3>
              </div>
              <p className="text-gray-400">
                Sistema de agendamento online para profissionais e empresas.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AgendaPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 