import React, { useState } from 'react';
import { Star, X, Building2, User, MessageSquare } from 'lucide-react';

const AvaliacaoModal = ({ 
  isOpen, 
  onClose, 
  empresa, 
  funcionario, 
  agendamento,
  onAvaliar 
}) => {
  const [avaliacaoEmpresa, setAvaliacaoEmpresa] = useState(0);
  const [avaliacaoFuncionario, setAvaliacaoFuncionario] = useState(0);
  const [comentarioEmpresa, setComentarioEmpresa] = useState('');
  const [comentarioFuncionario, setComentarioFuncionario] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Criar avaliações separadas
      const avaliacoes = [];

      // Avaliação da empresa
      if (avaliacaoEmpresa > 0) {
        avaliacoes.push({
          id: Date.now().toString(),
          tipo: 'empresa',
          empresaId: empresa.id,
          funcionarioId: funcionario?.id,
          agendamentoId: agendamento.id,
          clienteId: agendamento.cliente_id,
          clienteNome: agendamento.cliente_nome,
          clienteEmail: agendamento.cliente_email,
          nota: avaliacaoEmpresa,
          comentario: comentarioEmpresa,
          data: new Date().toISOString(),
          status: 'ativa'
        });
      }

      // Avaliação do funcionário
      if (avaliacaoFuncionario > 0 && funcionario) {
        avaliacoes.push({
          id: (Date.now() + 1).toString(),
          tipo: 'funcionario',
          empresaId: empresa.id,
          funcionarioId: funcionario.id,
          agendamentoId: agendamento.id,
          clienteId: agendamento.cliente_id,
          clienteNome: agendamento.cliente_nome,
          clienteEmail: agendamento.cliente_email,
          nota: avaliacaoFuncionario,
          comentario: comentarioFuncionario,
          data: new Date().toISOString(),
          status: 'ativa'
        });
      }

      // Salvar avaliações
      const avaliacoesExistentes = JSON.parse(localStorage.getItem('avaliacoes') || '[]');
      avaliacoesExistentes.push(...avaliacoes);
      localStorage.setItem('avaliacoes', JSON.stringify(avaliacoesExistentes));

      // Atualizar médias das empresas e funcionários
      await atualizarMedias();

      // Marcar agendamento como avaliado
      const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
      const agendamentoIndex = agendamentos.findIndex(a => a.id === agendamento.id);
      if (agendamentoIndex !== -1) {
        agendamentos[agendamentoIndex].avaliado = true;
        agendamentos[agendamentoIndex].dataAvaliacao = new Date().toISOString();
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
      }

      alert('✅ Avaliações enviadas com sucesso!');
      onClose();
      if (onAvaliar) onAvaliar();

    } catch (error) {
      console.error('Erro ao salvar avaliações:', error);
      alert('❌ Erro ao enviar avaliações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const atualizarMedias = async () => {
    const avaliacoes = JSON.parse(localStorage.getItem('avaliacoes') || '[]');
    
    // Atualizar média da empresa
    const avaliacoesEmpresa = avaliacoes.filter(a => 
      a.tipo === 'empresa' && a.empresaId === empresa.id
    );
    
    if (avaliacoesEmpresa.length > 0) {
      const mediaEmpresa = avaliacoesEmpresa.reduce((sum, a) => sum + a.nota, 0) / avaliacoesEmpresa.length;
      const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
      const empresaIndex = empresas.findIndex(e => e.id === empresa.id);
      
      if (empresaIndex !== -1) {
        empresas[empresaIndex].notaMedia = Math.round(mediaEmpresa * 10) / 10;
        empresas[empresaIndex].totalAvaliacoes = avaliacoesEmpresa.length;
        localStorage.setItem('empresas', JSON.stringify(empresas));
      }
    }

    // Atualizar média do funcionário
    if (funcionario) {
      const avaliacoesFuncionario = avaliacoes.filter(a => 
        a.tipo === 'funcionario' && a.funcionarioId === funcionario.id
      );
      
      if (avaliacoesFuncionario.length > 0) {
        const mediaFuncionario = avaliacoesFuncionario.reduce((sum, a) => sum + a.nota, 0) / avaliacoesFuncionario.length;
        const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
        const funcionarioIndex = funcionarios.findIndex(f => f.id === funcionario.id);
        
        if (funcionarioIndex !== -1) {
          funcionarios[funcionarioIndex].notaMedia = Math.round(mediaFuncionario * 10) / 10;
          funcionarios[funcionarioIndex].totalAvaliacoes = avaliacoesFuncionario.length;
          localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
        }
      }
    }
  };

  const renderStars = (nota, setNota, tipo) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setNota(star)}
          className={`transition-colors ${
            star <= nota ? 'text-yellow-500' : 'text-gray-300'
          } hover:text-yellow-400`}
        >
          <Star className="w-6 h-6 fill-current" />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {nota > 0 ? `${nota}/5` : 'Selecione'}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">⭐ Avaliar Serviço</h2>
              <p className="text-gray-600 mt-1">Avalie sua experiência com a empresa e o funcionário</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Informações do Agendamento */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📅 Detalhes do Agendamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Data:</span> {new Date(agendamento.data).toLocaleDateString('pt-BR')}
              </div>
              <div>
                <span className="font-medium">Horário:</span> {agendamento.hora_inicio}
              </div>
              <div>
                <span className="font-medium">Serviço:</span> {agendamento.servico_nome || 'Serviço'}
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                  agendamento.status === 'concluido' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {agendamento.status}
                </span>
              </div>
            </div>
          </div>

          {/* Avaliação da Empresa */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Avaliar Empresa</h3>
                <p className="text-sm text-gray-600">{empresa.nome}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qual sua avaliação geral da empresa? *
                </label>
                {renderStars(avaliacaoEmpresa, setAvaliacaoEmpresa, 'empresa')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentário sobre a empresa (opcional)
                </label>
                <textarea
                  value={comentarioEmpresa}
                  onChange={(e) => setComentarioEmpresa(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Compartilhe sua experiência com a empresa..."
                />
              </div>
            </div>
          </div>

          {/* Avaliação do Funcionário */}
          {funcionario && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Avaliar Funcionário</h3>
                  <p className="text-sm text-gray-600">{funcionario.nome} - {funcionario.cargo}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qual sua avaliação do atendimento? *
                  </label>
                  {renderStars(avaliacaoFuncionario, setAvaliacaoFuncionario, 'funcionario')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentário sobre o funcionário (opcional)
                  </label>
                  <textarea
                    value={comentarioFuncionario}
                    onChange={(e) => setComentarioFuncionario(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="3"
                    placeholder="Compartilhe sua experiência com o funcionário..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || (avaliacaoEmpresa === 0 && avaliacaoFuncionario === 0)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Enviando...' : 'Enviar Avaliações'}
            </button>
          </div>

          {/* Aviso */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">💡 Dica:</p>
                <p>Suas avaliações ajudam outros clientes a escolherem os melhores serviços e incentivam a melhoria contínua.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvaliacaoModal;
