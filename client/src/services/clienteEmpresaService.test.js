import apiService from './apiService';
import {
  buscarEmpresaParaAgendamento,
  listarEmpresasCliente
} from './clienteEmpresaService';

jest.mock('./apiService', () => ({
  __esModule: true,
  default: {
    getClientesEmpresas: jest.fn(),
    getClienteEmpresa: jest.fn()
  }
}));

jest.mock('../config/appConfig', () => ({
  LOCAL_DEV: false
}));

describe('clienteEmpresaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normaliza a lista de empresas recebida da API', async () => {
    apiService.getClientesEmpresas.mockResolvedValue({
      success: true,
      data: [{ id: 1, nome: 'Empresa Demo' }]
    });

    await expect(listarEmpresasCliente()).resolves.toEqual([
      expect.objectContaining({
        id: '1',
        nome: 'Empresa Demo',
        horario_inicio: '08:00',
        horario_fim: '18:00'
      })
    ]);
  });

  it('entrega empresa, funcionários e serviços prontos para o agendamento', async () => {
    apiService.getClienteEmpresa.mockResolvedValue({
      success: true,
      data: {
        id: 1,
        nome: 'Empresa Demo',
        funcionarios: [{ id: 3, nome: 'Funcionário Demo' }],
        servicos: [{ id: 4, nome: 'Corte', preco: '45.50', duracao_minutos: 30 }]
      }
    });

    await expect(buscarEmpresaParaAgendamento(1)).resolves.toEqual({
      empresa: expect.objectContaining({ id: '1', nome: 'Empresa Demo' }),
      funcionarios: [expect.objectContaining({ id: '3' })],
      servicos: [expect.objectContaining({ id: '4', preco: 45.5, duracao: 30 })]
    });
  });

  it('rejeita respostas sem empresa em vez de renderizar dados vazios', async () => {
    apiService.getClienteEmpresa.mockResolvedValue({ success: true, data: {} });

    await expect(buscarEmpresaParaAgendamento(1)).rejects.toThrow(
      'Dados da empresa não foram retornados pela API.'
    );
  });
});

