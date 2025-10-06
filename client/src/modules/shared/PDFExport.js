import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const PDFExport = ({ 
  filters, 
  userId, 
  userPlan, 
  agendamentos = [], 
  funcionarios = [], 
  servicos = [],
  kpis = null 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Verificar se o usuário tem acesso à exportação PDF
  const hasPDFAccess = userPlan === 'pro' || userPlan === 'business';

  const generatePDF = async () => {
    if (!hasPDFAccess) {
      alert('Exportação em PDF está disponível apenas nos planos Pro e Business.');
      return;
    }

    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Configurar fonte
      pdf.setFont('helvetica');

      // Cabeçalho
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório Gerencial', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Filtros aplicados
      if (hasFilters()) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Filtros Aplicados', 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const filterTexts = getFilterTexts();
        filterTexts.forEach(filterText => {
          pdf.text(filterText, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // KPIs Principais
      if (kpis) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Indicadores Principais', 20, yPosition);
        yPosition += 15;

        const kpiData = [
          ['Métrica', 'Valor'],
          ['Total de Agendamentos', kpis.totalAgendamentos.toString()],
          ['Taxa de Comparecimento', `${kpis.taxaComparecimento.toFixed(1)}%`],
          ['Receita Total', formatCurrency(kpis.receitaTotal)],
          ['Receita Média por Agendamento', formatCurrency(kpis.receitaMediaPorAgendamento)],
          ['Satisfação Média', `${kpis.satisfacaoMedia.toFixed(1)}/5.0`],
          ['Tempo Médio por Cliente', `${kpis.tempoMedioPorCliente.toFixed(0)} min`],
          ['Taxa de Conversão', `${kpis.taxaConversao.toFixed(1)}%`]
        ];

        // Criar tabela de KPIs
        pdf.autoTable({
          head: [kpiData[0]],
          body: kpiData.slice(1),
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { left: 20, right: 20 }
        });

        yPosition = pdf.lastAutoTable.finalY + 20;
      }

      // Agendamentos por Status
      const statusCounts = getAgendamentosPorStatus();
      if (statusCounts.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Agendamentos por Status', 20, yPosition);
        yPosition += 15;

        const statusData = [
          ['Status', 'Quantidade', 'Percentual'],
          ...statusCounts.map(status => [
            status.status,
            status.count.toString(),
            `${((status.count / agendamentos.length) * 100).toFixed(1)}%`
          ])
        ];

        pdf.autoTable({
          head: [statusData[0]],
          body: statusData.slice(1),
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129] },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { left: 20, right: 20 }
        });

        yPosition = pdf.lastAutoTable.finalY + 20;
      }

      // Performance dos Funcionários
      if (funcionarios.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Performance dos Funcionários', 20, yPosition);
        yPosition += 15;

        const funcionariosData = funcionarios.map(funcionario => {
          const agendamentosFuncionario = agendamentos.filter(a => a.funcionario_id === funcionario.id);
          const receitaFuncionario = agendamentosFuncionario
            .filter(a => a.status === 'confirmado')
            .reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0);

          return [
            funcionario.nome,
            agendamentosFuncionario.length.toString(),
            formatCurrency(receitaFuncionario)
          ];
        });

        const funcionariosTableData = [
          ['Funcionário', 'Agendamentos', 'Receita'],
          ...funcionariosData
        ];

        pdf.autoTable({
          head: [funcionariosTableData[0]],
          body: funcionariosTableData.slice(1),
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [139, 92, 246] },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { left: 20, right: 20 }
        });

        yPosition = pdf.lastAutoTable.finalY + 20;
      }

      // Serviços Mais Solicitados
      const servicosData = getServicosMaisSolicitados();
      if (servicosData.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Serviços Mais Solicitados', 20, yPosition);
        yPosition += 15;

        const servicosTableData = [
          ['Serviço', 'Agendamentos', 'Receita Total'],
          ...servicosData.map(servico => [
            servico.nome,
            servico.count.toString(),
            formatCurrency(servico.receita)
          ])
        ];

        pdf.autoTable({
          head: [servicosTableData[0]],
          body: servicosTableData.slice(1),
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [245, 158, 11] },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { left: 20, right: 20 }
        });

        yPosition = pdf.lastAutoTable.finalY + 20;
      }

      // Análise Temporal
      const analiseTemporal = getAnaliseTemporal();
      if (analiseTemporal.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Análise Temporal - Últimos 7 Dias', 20, yPosition);
        yPosition += 15;

        const temporalData = [
          ['Data', 'Agendamentos', 'Receita'],
          ...analiseTemporal.map(dia => [
            dia.data,
            dia.agendamentos.toString(),
            formatCurrency(dia.receita)
          ])
        ];

        pdf.autoTable({
          head: [temporalData[0]],
          body: temporalData.slice(1),
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68] },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { left: 20, right: 20 }
        });
      }

      // Rodapé
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Página ${i} de ${totalPages} - Relatório Gerado pelo Sistema SaaS de Agendamento`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Download do PDF
      const fileName = `relatorio-gerencial-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o relatório PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasFilters = () => {
    return Object.values(filters).some(value => 
      value !== '' && value !== '30d'
    );
  };

  const getFilterTexts = () => {
    const texts = [];
    
    if (filters.funcionario) {
      const funcionario = funcionarios.find(f => f.id === filters.funcionario);
      texts.push(`• Funcionário: ${funcionario?.nome || 'Não encontrado'}`);
    }
    
    if (filters.servico) {
      const servico = servicos.find(s => s.id === filters.servico);
      texts.push(`• Serviço: ${servico?.nome || 'Não encontrado'}`);
    }
    
    if (filters.status) {
      texts.push(`• Status: ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`);
    }
    
    if (filters.periodo && filters.periodo !== '30d') {
      const periodoText = {
        '7d': 'Últimos 7 dias',
        '90d': 'Últimos 90 dias',
        '1y': 'Último ano',
        'custom': 'Período personalizado'
      };
      texts.push(`• Período: ${periodoText[filters.periodo] || filters.periodo}`);
    }
    
    if (filters.periodo === 'custom') {
      if (filters.dataInicio) texts.push(`• Data início: ${filters.dataInicio}`);
      if (filters.dataFim) texts.push(`• Data fim: ${filters.dataFim}`);
    }
    
    if (filters.valorMin) texts.push(`• Valor mínimo: ${formatCurrency(filters.valorMin)}`);
    if (filters.valorMax) texts.push(`• Valor máximo: ${formatCurrency(filters.valorMax)}`);

    return texts;
  };

  const getAgendamentosPorStatus = () => {
    const statusCounts = {};
    agendamentos.forEach(agendamento => {
      statusCounts[agendamento.status] = (statusCounts[agendamento.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }));
  };

  const getServicosMaisSolicitados = () => {
    const servicosCount = {};
    agendamentos.forEach(agendamento => {
      const servicoId = agendamento.servico_id;
      servicosCount[servicoId] = (servicosCount[servicoId] || 0) + 1;
    });

    return Object.entries(servicosCount)
      .map(([servicoId, count]) => {
        const servico = servicos.find(s => s.id === servicoId);
        const receita = agendamentos
          .filter(a => a.servico_id === servicoId && a.status === 'confirmado')
          .reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0);

        return {
          nome: servico?.nome || 'Serviço não encontrado',
          count,
          receita
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const getAnaliseTemporal = () => {
    const ultimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      
      const agendamentosDia = agendamentos.filter(a => a.data === dataStr);
      const receitaDia = agendamentosDia
        .filter(a => a.status === 'confirmado')
        .reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0);

      ultimos7Dias.push({
        data: data.toLocaleDateString('pt-BR'),
        agendamentos: agendamentosDia.length,
        receita: receitaDia
      });
    }
    return ultimos7Dias;
  };

  if (!hasPDFAccess) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 text-center">
        <FileText className="h-10 w-10 text-orange-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Exportação em PDF</h3>
        <p className="text-gray-600 mb-4">
          Relatórios em PDF para reuniões gerenciais estão disponíveis nos planos Pro e Business.
        </p>
        <div className="bg-white rounded-lg p-3 inline-block">
          <p className="text-sm text-gray-500">Seu plano atual: <span className="font-semibold capitalize">{userPlan}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Exportar Relatório PDF</h3>
            <p className="text-sm text-gray-600">Relatório completo para reuniões gerenciais</p>
          </div>
        </div>
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gerando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Conteúdo do Relatório:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
            KPIs e indicadores principais
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Agendamentos por status
          </li>
          <li className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-purple-600" />
            Performance dos funcionários
          </li>
          <li className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-orange-600" />
            Serviços mais solicitados
          </li>
          <li className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-indigo-600" />
            Análise temporal (últimos 7 dias)
          </li>
          {hasFilters() && (
            <li className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-600" />
              Filtros aplicados
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PDFExport;
