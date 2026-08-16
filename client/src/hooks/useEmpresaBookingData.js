import { useEffect, useState } from 'react';
import { buscarEmpresaParaAgendamento } from '../services/clienteEmpresaService';

const useEmpresaBookingData = (empresaId) => {
  const [empresa, setEmpresa] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadEmpresa = async () => {
      try {
        setLoading(true);
        setError(null);
        const bookingData = await buscarEmpresaParaAgendamento(empresaId);

        if (isMounted) {
          setEmpresa(bookingData.empresa);
          setFuncionarios(bookingData.funcionarios);
          setServicos(bookingData.servicos);
        }
      } catch (loadError) {
        console.error('Erro ao carregar empresa para agendamento:', loadError);

        if (isMounted) {
          setEmpresa(null);
          setFuncionarios([]);
          setServicos([]);
          setError(loadError);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEmpresa();

    return () => {
      isMounted = false;
    };
  }, [empresaId]);

  return {
    empresa,
    funcionarios,
    servicos,
    loading,
    error
  };
};

export default useEmpresaBookingData;

