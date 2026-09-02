import {
  dedupeAgendamentos,
  listarAgendamentosLocais,
  persistirAgendamento,
  salvarAgendamentoLocal
} from './agendamentoPersistence';

jest.mock('../config/appConfig', () => ({
  LOCAL_DEV: false
}));

jest.mock('./apiService', () => ({
  __esModule: true,
  default: {
    createAgendamento: jest.fn()
  }
}));

describe('agendamentoPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('grava o agendamento na chave global e na chave da empresa', () => {
    const agendamento = {
      id: 10,
      empresa_id: 7,
      cliente_email: 'ana@cliente.com',
      funcionario_id: 3,
      data: '2026-09-03',
      hora: '09:00'
    };

    salvarAgendamentoLocal(agendamento);

    expect(JSON.parse(localStorage.getItem('agendamentos'))).toEqual([agendamento]);
    expect(JSON.parse(localStorage.getItem('agendamentos_7'))).toEqual([agendamento]);
  });

  it('lista unificando as duas chaves e filtrando pelo cliente', () => {
    salvarAgendamentoLocal({
      id: 1,
      empresa_id: 7,
      cliente_email: 'ana@cliente.com',
      data: '2026-09-03'
    });
    localStorage.setItem(
      'agendamentos',
      JSON.stringify([
        { id: 1, empresa_id: 7, cliente_email: 'ana@cliente.com' },
        { id: 2, empresa_id: 7, cliente_email: 'outra@cliente.com' }
      ])
    );

    expect(
      listarAgendamentosLocais({ empresaId: 7, clienteEmail: 'ana@cliente.com' })
    ).toEqual([
      expect.objectContaining({ id: 1, cliente_email: 'ana@cliente.com' })
    ]);
  });

  it('remove duplicatas ao unificar as chaves', () => {
    expect(
      dedupeAgendamentos([
        { id: 1, hora: '09:00' },
        { id: '1', hora: '09:00' },
        { id: 2, hora: '10:00' }
      ])
    ).toEqual([
      { id: 1, hora: '09:00' },
      { id: 2, hora: '10:00' }
    ]);
  });

  it('persiste na API em produção antes de gravar localmente', async () => {
    const api = { createAgendamento: jest.fn().mockResolvedValue({ id: 88, status: 'em_aprovacao' }) };
    const agendamento = {
      id: 10,
      empresa_id: 7,
      funcionario_id: 3,
      data: '2026-09-03',
      hora: '09:00',
      valor_total: 80
    };

    const resultado = await persistirAgendamento(agendamento, { apiService: api, localDev: false });

    expect(api.createAgendamento).toHaveBeenCalledWith({
      empresa_id: 7,
      funcionario_id: 3,
      data: '2026-09-03',
      hora: '09:00',
      servicos: undefined,
      observacoes: undefined,
      valor_total: 80
    });
    expect(resultado.id).toBe(88);
    expect(JSON.parse(localStorage.getItem('agendamentos_7'))[0].id).toBe(88);
  });

  it('não esconde falha da API em produção', async () => {
    const api = {
      createAgendamento: jest.fn().mockRejectedValue(new Error('horario ocupado'))
    };

    await expect(
      persistirAgendamento(
        { id: 1, empresa_id: 7, data: '2026-09-03', hora: '09:00' },
        { apiService: api, localDev: false }
      )
    ).rejects.toThrow('horario ocupado');

    expect(localStorage.getItem('agendamentos')).toBeNull();
  });
});
