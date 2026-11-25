import { useCallback, useEffect, useState } from 'react';
import { api, type Agendamento, type StatusAgendamento } from '../../api';
import { dataIso, dataLonga, hojeIso, moeda, telefone } from '../../formato';
import { Aviso, Botao, Cartao } from '../../ui';

const ROTULOS: Record<StatusAgendamento, { texto: string; cor: string }> = {
  agendado: { texto: 'Agendado', cor: 'bg-amber-100 text-amber-800' },
  confirmado: { texto: 'Confirmado', cor: 'bg-sky-100 text-sky-800' },
  realizado: { texto: 'Realizado', cor: 'bg-emerald-100 text-emerald-800' },
  cancelado: { texto: 'Cancelado', cor: 'bg-slate-200 text-slate-600' },
  falta: { texto: 'Falta', cor: 'bg-red-100 text-red-700' }
};

const ACOES: { status: StatusAgendamento; rotulo: string; de: StatusAgendamento[]; variante: 'primario' | 'secundario' | 'perigo' }[] = [
  { status: 'confirmado', rotulo: 'Confirmar', de: ['agendado'], variante: 'secundario' },
  { status: 'realizado', rotulo: 'Concluir', de: ['agendado', 'confirmado'], variante: 'primario' },
  { status: 'falta', rotulo: 'Falta', de: ['agendado', 'confirmado'], variante: 'secundario' },
  { status: 'cancelado', rotulo: 'Cancelar', de: ['agendado', 'confirmado'], variante: 'perigo' }
];

const deslocar = (iso: string, dias: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return dataIso(d);
};

export default function Agenda() {
  const [data, setData] = useState(hojeIso());
  const [agendamentos, setAgendamentos] = useState<Agendamento[] | null>(null);
  const [erro, setErro] = useState('');

  const carregar = useCallback(() => {
    setErro('');
    api<Agendamento[]>(`/agendamentos?data=${data}`)
      .then(setAgendamentos)
      .catch((e: Error) => setErro(e.message));
  }, [data]);

  useEffect(() => {
    setAgendamentos(null);
    carregar();
  }, [carregar]);

  async function mudarStatus(id: string, status: StatusAgendamento) {
    if (status === 'cancelado' && !confirm('Cancelar este agendamento?')) return;
    try {
      const atualizado = await api<Agendamento>(`/agendamentos/${id}/status`, { metodo: 'PATCH', corpo: { status } });
      setAgendamentos((lista) => lista?.map((a) => (a.id === id ? atualizado : a)) ?? null);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <Cartao className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Botao variante="secundario" onClick={() => setData((d) => deslocar(d, -1))} aria-label="Dia anterior">
            ‹
          </Botao>
          <input
            type="date"
            value={data}
            onChange={(e) => e.target.value && setData(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <Botao variante="secundario" onClick={() => setData((d) => deslocar(d, 1))} aria-label="Próximo dia">
            ›
          </Botao>
          <Botao variante="secundario" onClick={() => setData(hojeIso())}>
            Hoje
          </Botao>
        </div>
        <p className="text-sm text-slate-600 first-letter:uppercase">{dataLonga(data)}</p>
      </Cartao>

      {erro && <Aviso>{erro}</Aviso>}

      {agendamentos === null ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : agendamentos.length === 0 ? (
        <Cartao>
          <p className="text-center text-sm text-slate-500">Nenhum agendamento neste dia.</p>
        </Cartao>
      ) : (
        <ul className="space-y-2">
          {agendamentos.map((a) => (
            <li key={a.id}>
              <Cartao className="flex flex-wrap items-center justify-between gap-3 !p-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold tabular-nums text-slate-900">{a.hora}</span>
                  <div>
                    <p className="font-medium text-slate-900">{a.clienteNome}</p>
                    <p className="text-sm text-slate-500">
                      {a.servicoNome} · {a.duracaoMin} min · {moeda(a.preco)} · {telefone(a.clienteTelefone)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROTULOS[a.status].cor}`}>
                    {ROTULOS[a.status].texto}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ACOES.filter((acao) => acao.de.includes(a.status)).map((acao) => (
                    <Botao key={acao.status} variante={acao.variante} onClick={() => mudarStatus(a.id, acao.status)}>
                      {acao.rotulo}
                    </Botao>
                  ))}
                </div>
              </Cartao>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
