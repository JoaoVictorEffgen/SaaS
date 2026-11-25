import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Agendamento, ErroApi, type Estabelecimento, type Servico } from '../api';
import { dataLonga, diaCurto, moeda, proximosDias } from '../formato';
import { Aviso, Botao, Campo, Cartao } from '../ui';

const DIAS_EXIBIDOS = 14;

export default function Agendar() {
  const [estabelecimento, setEstabelecimento] = useState<Estabelecimento | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [erroInicial, setErroInicial] = useState('');

  const [servico, setServico] = useState<Servico | null>(null);
  const [data, setData] = useState('');
  const [horarios, setHorarios] = useState<string[] | null>(null);
  const [versaoHorarios, setVersaoHorarios] = useState(0);
  const [hora, setHora] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [confirmado, setConfirmado] = useState<Agendamento | null>(null);

  useEffect(() => {
    Promise.all([api<Estabelecimento>('/estabelecimento'), api<Servico[]>('/servicos')])
      .then(([e, s]) => {
        setEstabelecimento(e);
        setServicos(s);
      })
      .catch((e: Error) => setErroInicial(e.message));
  }, []);

  const dias = useMemo(
    () => (estabelecimento ? proximosDias(DIAS_EXIBIDOS, estabelecimento.horario.diasSemana) : []),
    [estabelecimento]
  );

  useEffect(() => {
    setHora('');
    setHorarios(null);
    if (!servico || !data) return;
    let ativo = true;
    api<{ horarios: string[] }>(`/disponibilidade?servicoId=${servico.id}&data=${data}`)
      .then((r) => ativo && setHorarios(r.horarios))
      .catch((e: Error) => ativo && setErro(e.message));
    return () => {
      ativo = false;
    };
  }, [servico, data, versaoHorarios]);

  async function confirmar(evento: FormEvent) {
    evento.preventDefault();
    if (!servico) return;
    setErro('');
    setEnviando(true);
    try {
      const agendamento = await api<Agendamento>('/agendamentos', {
        metodo: 'POST',
        corpo: { servicoId: servico.id, data, hora, clienteNome: nome, clienteTelefone: telefone }
      });
      setConfirmado(agendamento);
    } catch (e) {
      setErro((e as Error).message);
      if (e instanceof ErroApi && e.status === 409) setVersaoHorarios((v) => v + 1);
    } finally {
      setEnviando(false);
    }
  }

  function novoAgendamento() {
    setConfirmado(null);
    setServico(null);
    setData('');
    setHora('');
    setErro('');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Agendamento online</p>
            <h1 className="text-xl font-bold text-slate-900">{estabelecimento?.nome ?? 'Carregando...'}</h1>
          </div>
          <Link to="/login" className="text-sm text-slate-500 hover:text-slate-700">
            Área da equipe
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        {erroInicial && <Aviso>{erroInicial}</Aviso>}

        {confirmado ? (
          <Cartao className="text-center">
            <p className="text-4xl">✓</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Agendamento realizado!</h2>
            <p className="mt-2 text-slate-600">
              {confirmado.servicoNome} em {dataLonga(confirmado.data)} às {confirmado.hora}.
            </p>
            <Botao className="mt-6" onClick={novoAgendamento}>
              Fazer outro agendamento
            </Botao>
          </Cartao>
        ) : (
          <>
            <Cartao>
              <h2 className="mb-3 font-semibold text-slate-900">1. Escolha o serviço</h2>
              {servicos.length === 0 && !erroInicial && (
                <p className="text-sm text-slate-500">Nenhum serviço disponível no momento.</p>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                {servicos.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setServico(s);
                      setErro('');
                    }}
                    className={`rounded-xl border p-3 text-left transition ${
                      servico?.id === s.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="block font-medium text-slate-900">{s.nome}</span>
                    <span className="text-sm text-slate-500">
                      {s.duracaoMin} min · {moeda(s.preco)}
                    </span>
                  </button>
                ))}
              </div>
            </Cartao>

            {servico && (
              <Cartao>
                <h2 className="mb-3 font-semibold text-slate-900">2. Escolha o dia</h2>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {dias.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setData(d);
                        setErro('');
                      }}
                      className={`shrink-0 rounded-lg border px-3 py-2 text-sm capitalize transition ${
                        data === d ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {diaCurto(d)}
                    </button>
                  ))}
                </div>
              </Cartao>
            )}

            {servico && data && (
              <Cartao>
                <h2 className="mb-3 font-semibold text-slate-900">3. Escolha o horário</h2>
                {horarios === null ? (
                  <p className="text-sm text-slate-500">Carregando horários...</p>
                ) : horarios.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum horário livre neste dia. Tente outro dia.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {horarios.map((h) => (
                      <button
                        key={h}
                        onClick={() => setHora(h)}
                        className={`rounded-lg border py-2 text-sm transition ${
                          hora === h ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </Cartao>
            )}

            {servico && data && hora && (
              <Cartao>
                <h2 className="mb-3 font-semibold text-slate-900">4. Seus dados</h2>
                <form onSubmit={confirmar} className="space-y-3">
                  <Campo rotulo="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required minLength={2} />
                  <Campo
                    rotulo="WhatsApp"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                  />
                  <p className="text-sm text-slate-600">
                    {servico.nome} · {dataLonga(data)} às {hora} · {moeda(servico.preco)}
                  </p>
                  <Botao type="submit" disabled={enviando} className="w-full">
                    {enviando ? 'Agendando...' : 'Confirmar agendamento'}
                  </Botao>
                </form>
              </Cartao>
            )}

            {erro && <Aviso>{erro}</Aviso>}
          </>
        )}
      </main>
    </div>
  );
}
