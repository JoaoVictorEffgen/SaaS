import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, ArrowRight, Sparkles, Calendar, Clock, Zap, Star, Crown } from 'lucide-react';
import localStorageService from '../services/localStorageService';

const AccessSelector = () => {
  const [empresasDestaque, setEmpresasDestaque] = useState([]);

  useEffect(() => {
    // Carregar as 3 melhores empresas
    const empresas = localStorageService.getEmpresas();
    const topEmpresas = empresas
      .sort((a, b) => {
        const notaA = a.notaMedia || 0;
        const notaB = b.notaMedia || 0;
        const avaliacoesA = a.totalAvaliacoes || 0;
        const avaliacoesB = b.totalAvaliacoes || 0;
        
        if (notaA !== notaB) {
          return notaB - notaA;
        }
        return avaliacoesB - avaliacoesA;
      })
      .slice(0, 3);
    
    setEmpresasDestaque(topEmpresas);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              AgendaPro
            </h1>
            <p className="text-gray-600 text-lg">Sistema de Agendamento Online</p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>Revolucione sua agenda</span>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
          </div>

          {/* Action Cards */}
          <div className="space-y-6">
            <Link
              to="/empresa/login"
              className="group block"
            >
              <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/90">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Área da Empresa</h3>
                    <p className="text-gray-600 text-sm">Gerencie suas agendas e clientes</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>
            
            <Link
              to="/cliente/login"
              className="group block"
            >
              <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/90">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Agendar Serviço</h3>
                    <p className="text-gray-600 text-sm">Agende serviços online</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Agendamento 24h</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Rápido & Fácil</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Organizado</p>
            </div>
          </div>

          {/* Empresas em Destaque */}
          {empresasDestaque.length > 0 && (
            <div className="mt-12">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-bold text-gray-900">Empresas em Destaque</h3>
                  <Crown className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="text-sm text-gray-600">As melhores avaliadas pelos nossos clientes</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {empresasDestaque.map((empresa, index) => (
                  <div key={empresa.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/90 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {(empresa.nome || 'E').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{empresa.nome}</h4>
                          <p className="text-xs text-gray-600">{empresa.especializacao}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-medium text-gray-700">
                            {empresa.notaMedia ? empresa.notaMedia.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          ({empresa.totalAvaliacoes || 0})
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <Link
                  to="/cliente/login"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver todas as empresas
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Desenvolvido com ❤️ para simplificar sua vida
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessSelector;
