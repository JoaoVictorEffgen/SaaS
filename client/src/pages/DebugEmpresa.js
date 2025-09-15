import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const DebugEmpresa = () => {
  const { empresaId } = useParams();
  const [empresa, setEmpresa] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    // Buscar dados da empresa
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresaEncontrada = empresas.find(emp => emp.id === empresaId);
    setEmpresa(empresaEncontrada);
    
    // Buscar funcionários e serviços da empresa
    const funcionariosEmpresa = JSON.parse(localStorage.getItem(`funcionarios_${empresaId}`) || '[]');
    setFuncionarios(funcionariosEmpresa);
    
    const servicosEmpresa = JSON.parse(localStorage.getItem(`servicos_${empresaId}`) || '[]');
    setServicos(servicosEmpresa);
    
    const agendamentosEmpresa = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
    setAgendamentos(agendamentosEmpresa);
  }, [empresaId]);

  const testarHorario = (horaInicio, duracaoMinutos) => {
    if (!empresa?.horario_inicio || !empresa?.horario_fim) {
      console.log('⚠️ Horário de funcionamento não definido');
      return { valido: true, motivo: 'Horário não definido' };
    }
    
    // Calcular hora fim
    const [hora, minuto] = horaInicio.split(':').map(Number);
    const totalMinutos = hora * 60 + minuto + duracaoMinutos;
    const novaHora = Math.floor(totalMinutos / 60);
    const novoMinuto = totalMinutos % 60;
    const horaFim = `${novaHora.toString().padStart(2, '0')}:${novoMinuto.toString().padStart(2, '0')}`;
    
    // Converter para minutos para comparação
    const horaInicioMinutos = horaInicio.split(':').reduce((acc, time) => (60 * acc) + +time);
    const horaFimMinutos = horaFim.split(':').reduce((acc, time) => (60 * acc) + +time);
    const empresaInicioMinutos = empresa.horario_inicio.split(':').reduce((acc, time) => (60 * acc) + +time);
    const empresaFimMinutos = empresa.horario_fim.split(':').reduce((acc, time) => (60 * acc) + +time);
    
    const valido = horaInicioMinutos >= empresaInicioMinutos && horaFimMinutos <= empresaFimMinutos;
    
    return {
      valido,
      horaInicio,
      horaFim,
      duracaoMinutos,
      empresaInicio: empresa.horario_inicio,
      empresaFim: empresa.horario_fim,
      horaInicioMinutos,
      horaFimMinutos,
      empresaInicioMinutos,
      empresaFimMinutos,
      motivo: valido ? 'Horário válido' : 'Fora do horário de funcionamento'
    };
  };

  if (!empresa) {
    return <div className="p-4">Empresa não encontrada</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug Empresa: {empresa.nome}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dados da Empresa */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">🏢 Dados da Empresa</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(empresa, null, 2)}
          </pre>
        </div>

        {/* Teste de Horários */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">🕐 Teste de Horários</h2>
          <div className="space-y-2">
            {['08:00', '10:00', '12:00', '15:00', '17:00', '18:00', '20:00'].map(hora => {
              const resultado = testarHorario(hora, 60);
              return (
                <div key={hora} className={`p-2 rounded ${resultado.valido ? 'bg-green-100' : 'bg-red-100'}`}>
                  <strong>{hora}</strong> (60min) → <strong>{resultado.horaFim}</strong>
                  <br />
                  <small className={resultado.valido ? 'text-green-600' : 'text-red-600'}>
                    {resultado.motivo}
                  </small>
                </div>
              );
            })}
          </div>
        </div>

        {/* Funcionários */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">👥 Funcionários ({funcionarios.length})</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(funcionarios, null, 2)}
          </pre>
        </div>

        {/* Serviços */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">🛠️ Serviços ({servicos.length})</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(servicos, null, 2)}
          </pre>
        </div>

        {/* Agendamentos */}
        <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
          <h2 className="text-lg font-semibold mb-2">📅 Agendamentos ({agendamentos.length})</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(agendamentos, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-4 text-center">
        <a href={`/empresa/${empresaId}`} className="text-blue-600 hover:text-blue-800">
          ← Voltar para Agendamento
        </a>
      </div>
    </div>
  );
};

export default DebugEmpresa;
