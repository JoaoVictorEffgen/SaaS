import React, { useState, useEffect } from 'react';
import { Star, User, Building2, MessageSquare, Calendar } from 'lucide-react';

const AvaliacoesList = ({ 
  tipo, // 'empresa' ou 'funcionario'
  empresaId, 
  funcionarioId,
  showHeader = true 
}) => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvaliacoes();
  }, [tipo, empresaId, funcionarioId]);

  const loadAvaliacoes = () => {
    try {
      const todasAvaliacoes = JSON.parse(localStorage.getItem('avaliacoes') || '[]');
      
      let avaliacoesFiltradas = [];
      
      if (tipo === 'empresa') {
        avaliacoesFiltradas = todasAvaliacoes.filter(a => 
          a.tipo === 'empresa' && a.empresaId === empresaId && a.status === 'ativa'
        );
      } else if (tipo === 'funcionario') {
        avaliacoesFiltradas = todasAvaliacoes.filter(a => 
          a.tipo === 'funcionario' && a.funcionarioId === funcionarioId && a.status === 'ativa'
        );
      }

      // Ordenar por data (mais recentes primeiro)
      avaliacoesFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
      
      setAvaliacoes(avaliacoesFiltradas);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      setAvaliacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (nota) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= nota ? 'text-yellow-500 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calcularMedia = () => {
    if (avaliacoes.length === 0) return 0;
    const soma = avaliacoes.reduce((acc, av) => acc + av.nota, 0);
    return (soma / avaliacoes.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                {tipo === 'empresa' ? (
                  <Building2 className="w-6 h-6 text-blue-600" />
                ) : (
                  <User className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {tipo === 'empresa' ? 'Avaliações da Empresa' : 'Avaliações do Funcionário'}
                </h3>
                <p className="text-sm text-gray-600">
                  {avaliacoes.length} avaliação{avaliacoes.length !== 1 ? 'ões' : ''}
                </p>
              </div>
            </div>
            
            {avaliacoes.length > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-2xl font-bold text-gray-900">{calcularMedia()}</span>
                </div>
                <p className="text-sm text-gray-600">Média geral</p>
              </div>
            )}
          </div>
        </div>
      )}

      {avaliacoes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma avaliação ainda
          </h3>
          <p className="text-gray-600">
            {tipo === 'empresa' 
              ? 'Esta empresa ainda não recebeu avaliações.' 
              : 'Este funcionário ainda não recebeu avaliações.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {avaliacoes.map((avaliacao) => (
            <div key={avaliacao.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {avaliacao.clienteNome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{avaliacao.clienteNome}</h4>
                    <p className="text-sm text-gray-600">{avaliacao.clienteEmail}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(avaliacao.nota)}
                    <span className="text-sm font-medium text-gray-900">{avaliacao.nota}/5</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatarData(avaliacao.data)}
                  </div>
                </div>
              </div>

              {avaliacao.comentario && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                    <p className="text-gray-700 text-sm leading-relaxed">
                      "{avaliacao.comentario}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvaliacoesList;
