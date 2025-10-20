import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogOut, Star, Crown, Award, Search, Clock, 
  CheckCircle, XCircle, Calendar, User, Home, Bell,
  MapPin, Phone, Globe, Instagram, Heart, Filter
} from 'lucide-react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';

const SelecaoEmpresa = () => {
  const { user, logout } = useMySqlAuth();
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todas');
  const [showNotifications, setShowNotifications] = useState(false);
  const [promocoes, setPromocoes] = useState({});

  // Carregar empresas da API
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        setLoading(true);
        const { default: apiService } = await import('../../services/apiService');
        const response = await apiService.getClientesEmpresas();
        const empresasData = response.data || response;
        
        if (empresasData && Array.isArray(empresasData)) {
          // As promoções já vêm incluídas no endpoint de clientes
          const empresasFormatadas = empresasData.map((empresa, index) => ({
            ...empresa,
            rating: 4.7 + (index * 0.1),
            totalAvaliacoes: 25 + (index * 10),
            horarioFuncionamento: '08:00 - 19:00',
            categoria: index === 0 ? 'Estética' : 'Serviços Gerais',
            profissionais: index === 0 ? 3 : 1,
            destaque: index === 0
          }));
          
          setEmpresas(empresasFormatadas);
        }
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEmpresas();
  }, []);

  // Filtrar empresas
  const empresasFiltradas = empresas.filter(empresa => {
    const matchesSearch = empresa.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'todas' || 
                         empresa.categoria?.toLowerCase().includes(activeFilter.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
                <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Olá, {user?.nome || 'Cliente'}!
                  </h1>
              <p className="text-gray-600 mt-1">
                    Escolha uma empresa para agendar seus serviços
                  </p>
              </div>
              
            <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-colors"
              >
                <Bell className="h-6 w-6" />
                  </button>
                  
              <Link
                to="/"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-colors"
              >
                <Home className="h-6 w-6" />
              </Link>
                
                <button
                  onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-colors"
                >
                <User className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Seção do Próximo Agendamento */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Seu Próximo Agendamento</h2>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-32 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Amanhã
            </div>
          </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">Studio Le Toujours</h3>
              <p className="text-gray-600">Amanhã, 10 de Junho às 14:00</p>
              <p className="text-gray-500">Fernanda Oliveira</p>
            </div>
            
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                Ver Detalhes
                </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Cancelar / Reagendar
                </button>
              </div>
            </div>
          </div>

        {/* Seção Agende Novamente */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Agende Novamente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 - Corte de Cabelo */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">Corte de Cabelo</h3>
            </div>
          </div>

              <div className="p-6">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">4.7 (25 avaliações)</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">Aberto até as 19:00</span>
                </div>
                
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Ver Serviços
                </button>
              </div>
            </div>

            {/* Card 2 - Barbearia Clássica */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-gray-600 to-gray-800 relative">
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">Barbearia Clássica</h3>
                    </div>
                  </div>
              
              <div className="p-6">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">4.7 (25 avaliações)</span>
                    </div>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">Aberto até as 19:00</span>
                </div>
                
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Ver Serviços
                </button>
                          </div>
                        </div>

            {/* Card 3 - Massagens */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 relative">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">Barbearia Clássica</h3>
                                </div>
                              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">4.9 (25 avaliações)</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">Aberto até as 19:00</span>
                </div>
                
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Massagens
                </button>
                            </div>
                        </div>
                      </div>
                    </div>

        {/* Seção Explore Novas Opções */}
                    <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Novas Opções</h2>
          
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 mb-6">
            {['todas', 'favoritos (0)', 'estética', 'massagem'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
                        ))}
                      </div>

          {/* Barra de Pesquisa */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, especialização ou serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
                  </div>
                  
          {/* Grid de Empresas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {empresasFiltradas.map((empresa, index) => (
              <div key={empresa.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div 
                  className="h-48 relative bg-cover bg-center"
                  style={{
                    backgroundImage: empresa.imagem_fundo_url 
                      ? `url(${empresa.imagem_fundo_url})`
                      : `linear-gradient(135deg, ${index % 3 === 0 ? 'from-purple-400 to-pink-500' : index % 3 === 1 ? 'from-blue-400 to-purple-500' : 'from-green-400 to-blue-500'})`
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                  
                  {/* Badge de Promoção */}
                  {empresa.promocoes && empresa.promocoes.length > 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        PROMOÇÃO
                      </span>
                </div>
              )}

                  <div className="absolute top-4 right-4">
                    <button className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors">
                      <Heart className="h-5 w-5 text-white" />
                    </button>
                    </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold">{empresa.nome}</h3>
                              </div>
                            </div>
                            
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {empresa.rating?.toFixed(1)} ({empresa.totalAvaliacoes} avaliações)
                              </span>
                            </div>

                  <p className="text-gray-600 text-sm mb-4">{empresa.descricao}</p>
                  
                  {/* Promoções */}
                  {empresa.promocoes && empresa.promocoes.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {empresa.promocoes.slice(0, 2).map((promocao, promoIndex) => (
                          <div key={promoIndex} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {promocao.tipo_desconto === 'percentual' 
                              ? `${promocao.valor_desconto}% OFF`
                              : promocao.tipo_desconto === 'valor_fixo'
                              ? `R$ ${promocao.valor_desconto} OFF`
                              : promocao.tipo_desconto === 'meses_gratis'
                              ? `${promocao.meses_gratis} meses grátis`
                              : 'Promoção'
                            }
                                  </div>
                        ))}
                        {empresa.promocoes.length > 2 && (
                          <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            +{empresa.promocoes.length - 2} mais
                                </div>
                              )}
                            </div>
                          </div>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{empresa.endereco}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">{empresa.horarioFuncionamento}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {empresa.profissionais > 1 
                          ? `Disponível com ${empresa.profissionais} profissionais`
                          : `${empresa.profissionais} profissional`
                        }
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/cliente/empresa/${empresa.id}`}
                    className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all text-center font-medium"
                  >
                    Agendar Serviço
                  </Link>
                </div>
              </div>
            ))}
                    </div>

          {empresasFiltradas.length === 0 && (
                    <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
                    </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-gray-600">Tente ajustar os filtros ou termo de pesquisa.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelecaoEmpresa;
