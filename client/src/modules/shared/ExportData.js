import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File, 
  Calendar,
  Users,
  BarChart3,
  Package,
  ArrowLeft
} from 'lucide-react';
const ExportData = () => {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('30d');
  const [loading, setLoading] = useState(false);

  const handleExport = async (type, format = 'csv') => {
    setLoading(true);
    
    try {
      switch (type) {
        case 'agendamentos':
        case 'kpis':
        case 'funcionarios':
        case 'servicos':
        case 'relatorio':
        case 'all':
          // exportService será implementado posteriormente
          alert(`Exportação de ${type} em formato ${format} será implementada em breve!`);
          break;
          
        default:
          console.warn('Tipo de exportação não reconhecido:', type);
          break;
      }
      
      // Simular delay para mostrar loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const exportOptions = [
    {
      id: 'agendamentos',
      title: 'Agendamentos',
      description: 'Lista completa de agendamentos com detalhes',
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 'kpis',
      title: 'KPIs e Métricas',
      description: 'Indicadores de performance e estatísticas',
      icon: BarChart3,
      color: 'green'
    },
    {
      id: 'funcionarios',
      title: 'Funcionários',
      description: 'Dados dos funcionários cadastrados',
      icon: Users,
      color: 'purple'
    },
    {
      id: 'servicos',
      title: 'Serviços',
      description: 'Catálogo de serviços oferecidos',
      icon: FileText,
      color: 'orange'
    },
    {
      id: 'relatorio',
      title: 'Relatório Completo',
      description: 'Relatório consolidado em PDF',
      icon: File,
      color: 'red'
    },
    {
      id: 'all',
      title: 'Exportar Tudo',
      description: 'Todos os dados em arquivos separados',
      icon: Package,
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exportação de Dados</h2>
          <p className="text-gray-600">Exporte seus dados em diferentes formatos</p>
        </div>
        
        {/* Controles */}
        <div className="flex space-x-4">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
        </div>
      </div>

      {/* Botão Voltar - Discreto */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/empresa/dashboard')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar ao Dashboard
        </button>
      </div>

      {/* Grid de opções de exportação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exportOptions.map((option) => {
          const IconComponent = option.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
            red: 'bg-red-100 text-red-600',
            indigo: 'bg-indigo-100 text-indigo-600'
          };

          return (
            <div key={option.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${colorClasses[option.color]}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                  
                  {/* Botões de ação */}
                  <div className="flex space-x-2">
                    {option.id !== 'relatorio' && option.id !== 'all' && (
                      <>
                        <button
                          onClick={() => handleExport(option.id, 'csv')}
                          disabled={loading}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <FileText className="h-4 w-4 mr-1 inline" />
                          CSV
                        </button>
                        <button
                          onClick={() => handleExport(option.id, 'excel')}
                          disabled={loading}
                          className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-1 inline" />
                          Excel
                        </button>
                      </>
                    )}
                    
                    {(option.id === 'relatorio' || option.id === 'all') && (
                      <button
                        onClick={() => handleExport(option.id)}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        <Download className="h-4 w-4 mr-1 inline" />
                        {loading ? 'Exportando...' : 'Exportar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informações adicionais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Sobre os Formatos</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>CSV:</strong> Formato de texto simples, compatível com Excel, Google Sheets e outros editores de planilhas.</p>
              <p><strong>Excel:</strong> Formato nativo do Microsoft Excel (.xlsx), ideal para análises avançadas.</p>
              <p><strong>PDF:</strong> Relatório formatado e pronto para impressão ou compartilhamento.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dicas de uso */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Dicas de Uso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Para Análises:</h4>
            <ul className="space-y-1">
              <li>• Use CSV para importar em ferramentas de BI</li>
              <li>• Excel é ideal para gráficos e tabelas dinâmicas</li>
              <li>• KPIs incluem tendências e comparações</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Para Relatórios:</h4>
            <ul className="space-y-1">
              <li>• Relatório completo inclui resumo executivo</li>
              <li>• Dados são filtrados pelo período selecionado</li>
              <li>• Arquivos incluem timestamp para organização</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
