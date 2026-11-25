import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, MessageCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { api, getToken, setToken } from './api';

const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateLabel = (value) => (value ? value.split('-').reverse().join('/') : '');

const AssistenteApp = () => {
  const { isDark, toggleTheme } = useTheme();
  const [screen, setScreen] = useState('inicio');
  const [establishment, setEstablishment] = useState(null);
  const [error, setError] = useState('');

  const loadEstablishment = async () => {
    const data = await api('/estabelecimento');
    setEstablishment(data);
    return data;
  };

  useEffect(() => {
    loadEstablishment().catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <button type="button" onClick={() => setScreen('inicio')} className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Assistente do estabelecimento</p>
            <h1 className="text-xl font-bold">{establishment?.nome || 'Carregando...'}</h1>
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleTheme} className="rounded-full border border-slate-200 p-2 dark:border-slate-700" aria-label="Alternar tema">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => setScreen(screen === 'painel' ? 'inicio' : 'painel')} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-emerald-500 dark:text-slate-950">
              {screen === 'painel' ? 'Voltar ao agendamento' : 'Abrir painel'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {screen === 'inicio' ? (
          <PublicScreen establishment={establishment} onBooked={loadEstablishment} />
        ) : (
          <PainelScreen establishment={establishment} reload={loadEstablishment} />
        )}
      </main>
    </div>
  );
};

const PublicScreen = ({ establishment }) => {
  const [form, setForm] = useState({ nome: '', telefone: '', servico_id: '', funcionario_id: '', slot: '' });
  const [slots, setSlots] = useState([]);
  const [notice, setNotice] = useState('');
  const [chat, setChat] = useState([
    { from: 'assistente', text: 'Envie OI para agendar, ou SIM e NAO para confirmar um horario.' }
  ]);
  const [draft, setDraft] = useState('OI');
  const [phone, setPhone] = useState('11988887777');

  useEffect(() => {
    if (!establishment) return;
    const serviceId = establishment.servicos?.[0]?.id || '';
    const staffId = establishment.equipe?.[0]?.id || '';
    setForm((current) => ({ ...current, servico_id: current.servico_id || serviceId, funcionario_id: current.funcionario_id || staffId }));
  }, [establishment]);

  const loadSlots = async (servicoId, funcionarioId) => {
    if (!servicoId || !funcionarioId) return;
    try {
      const result = await api(`/disponibilidade?servico_id=${servicoId}&funcionario_id=${funcionarioId}`);
      setSlots(result.data || []);
    } catch (err) {
      setSlots([]);
    }
  };

  useEffect(() => {
    loadSlots(form.servico_id, form.funcionario_id);
  }, [form.servico_id, form.funcionario_id]);

  const selectedSlot = useMemo(
    () => slots.find((slot) => `${slot.data}|${slot.hora}` === form.slot),
    [slots, form.slot]
  );

  const submitBooking = async (event) => {
    event.preventDefault();
    setNotice('');
    try {
      const result = await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          nome: form.nome,
          telefone: form.telefone,
          servico_id: Number(form.servico_id),
          funcionario_id: Number(form.funcionario_id),
          data: selectedSlot?.data,
          hora: selectedSlot?.hora
        })
      });
      setNotice(result.mensagem?.texto || 'Horario reservado. A confirmacao foi enviada no WhatsApp.');
      setForm((current) => ({ ...current, nome: '', telefone: '', slot: '' }));
      loadSlots(form.servico_id, form.funcionario_id);
    } catch (err) {
      setNotice(err.message);
    }
  };

  const sendChat = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setChat((current) => [...current, { from: 'cliente', text }]);
    setDraft('');
    try {
      const result = await api('/whatsapp/webhook', {
        method: 'POST',
        body: JSON.stringify({ from: phone, text })
      });
      const replies = result.respostas?.length ? result.respostas : ['Sem resposta.'];
      setChat((current) => [...current, ...replies.map((item) => ({ from: 'assistente', text: item }))]);
    } catch (err) {
      setChat((current) => [...current, { from: 'assistente', text: err.message }]);
    }
  };

  if (!establishment) return <p>Carregando o estabelecimento...</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <div className="mb-6 flex items-start gap-3">
          <CalendarClock className="mt-1 h-6 w-6 text-emerald-600" />
          <div>
            <h2 className="text-2xl font-bold">Agende neste estabelecimento</h2>
            <p className="mt-1 text-sm text-slate-500">{establishment.descricao} {establishment.cidade ? `· ${establishment.cidade}` : ''}</p>
            <p className="mt-2 text-sm text-emerald-700">A confirmacao e o lembrete saem sozinhos no WhatsApp do cliente.</p>
          </div>
        </div>
        <form onSubmit={submitBooking} className="grid gap-4">
          <label className="grid gap-1 text-sm font-medium">
            Seu nome
            <input required value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            WhatsApp
            <input required value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} placeholder="11999999999" className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Servico
            <select value={form.servico_id} onChange={(event) => setForm({ ...form, servico_id: event.target.value, slot: '' })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
              {establishment.servicos.map((service) => (
                <option key={service.id} value={service.id}>{service.nome} · {service.duracao_minutos} min · {money(service.preco)}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Profissional
            <select value={form.funcionario_id} onChange={(event) => setForm({ ...form, funcionario_id: event.target.value, slot: '' })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
              {establishment.equipe.map((person) => (
                <option key={person.id} value={person.id}>{person.nome}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Horario livre
            <select required value={form.slot} onChange={(event) => setForm({ ...form, slot: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
              <option value="">Escolha um horario</option>
              {slots.map((slot) => (
                <option key={`${slot.data}-${slot.hora}`} value={`${slot.data}|${slot.hora}`}>{dateLabel(slot.data)} as {slot.hora}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Reservar e enviar WhatsApp</button>
          {notice && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
        </form>
      </section>

      <section className="flex min-h-[640px] flex-col rounded-3xl bg-white shadow-sm dark:bg-slate-900">
        <div className="flex items-center gap-3 rounded-t-3xl bg-emerald-600 px-5 py-4 text-white">
          <MessageCircle className="h-5 w-5" />
          <div>
            <h2 className="font-semibold">WhatsApp do assistente</h2>
            <p className="text-xs text-emerald-100">Simulacao local. Com o token da API oficial, a mesma mensagem sai no numero real.</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {chat.map((message, index) => (
            <div key={`${message.from}-${index}`} className={`flex ${message.from === 'cliente' ? 'justify-end' : 'justify-start'}`}>
              <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${message.from === 'cliente' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'}`}>
                {message.text}
              </p>
            </div>
          ))}
        </div>
        <form onSubmit={sendChat} className="grid gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
          <input value={phone} onChange={(event) => setPhone(event.target.value)} aria-label="WhatsApp do teste" className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          <div className="flex gap-2">
            <input value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Mensagem" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Enviar</button>
          </div>
        </form>
      </section>
    </div>
  );
};

const PainelScreen = ({ establishment, reload }) => {
  const [user, setUser] = useState(null);
  const [identifier, setIdentifier] = useState('empresa@timeflow.local');
  const [senha, setSenha] = useState('12345678');
  const [tab, setTab] = useState('agenda');
  const [error, setError] = useState('');

  const login = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const result = await api('/users/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, senha })
      });
      setToken(result.token);
      setUser(result.user);
      setTab(result.user.tipo === 'vendedor' ? 'vendas' : 'agenda');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!getToken()) return;
    api('/users/profile').then(setUser).catch(() => setToken(''));
  }, []);

  if (!user) {
    return (
      <form onSubmit={login} className="mx-auto grid max-w-md gap-4 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h2 className="text-2xl font-bold">Entrar no painel</h2>
        <p className="text-sm text-slate-500">Dono, equipe e vendas entram aqui. O cliente agenda sem criar conta.</p>
        <label className="grid gap-1 text-sm font-medium">E-mail<input value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" /></label>
        <label className="grid gap-1 text-sm font-medium">Senha<input type="password" value={senha} onChange={(event) => setSenha(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" /></label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">Entrar</button>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <p>Dono: empresa@timeflow.local</p>
          <p>Equipe: funcionario@timeflow.local</p>
          <p>Vendas: vendas@timeflow.local</p>
          <p>Senha dos tres: 12345678</p>
        </div>
      </form>
    );
  }

  const tabs = user.tipo === 'vendedor'
    ? [['vendas', 'Vendas']]
    : [['agenda', 'Agenda'], ['mensagens', 'WhatsApp'], ...(user.tipo === 'dono' ? [['servicos', 'Servicos'], ['equipe', 'Equipe'], ['automacao', 'Automacao']] : [])];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{establishment?.nome}</h2>
          <p className="text-sm text-slate-500">{user.nome} · {user.tipo}</p>
        </div>
        <button type="button" onClick={() => { setToken(''); setUser(null); }} className="rounded-full border border-slate-300 px-4 py-2 text-sm">Sair</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === id ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900'}`}>{label}</button>
        ))}
      </div>
      {tab === 'agenda' && <AgendaTab user={user} />}
      {tab === 'mensagens' && <MensagensTab />}
      {tab === 'servicos' && <ServicosTab />}
      {tab === 'equipe' && <EquipeTab />}
      {tab === 'automacao' && <AutomacaoTab establishment={establishment} reload={reload} />}
      {tab === 'vendas' && <VendasTab />}
    </div>
  );
};

const AgendaTab = ({ user }) => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const load = () => api('/agendamentos').then(setItems).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api(`/agendamentos/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    load();
  };

  return (
    <section className="grid gap-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {items.length === 0 && <p className="rounded-2xl bg-white p-4 text-sm dark:bg-slate-900">Nenhum horario nesta agenda.</p>}
      {items.map((item) => (
        <article key={item.id} className="rounded-2xl bg-white p-4 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{item.cliente_nome} · {item.servico_nome}</h3>
              <p className="text-sm text-slate-500">{dateLabel(item.data)} as {item.hora} · {item.funcionario_nome} · {item.status} · {item.origem}</p>
              <p className="text-sm">{item.cliente_telefone}</p>
            </div>
            {(user.tipo === 'dono' || Number(item.funcionario_id) === Number(user.id)) && (
              <div className="flex gap-2">
                {item.status === 'confirmado' && <button type="button" onClick={() => updateStatus(item.id, 'realizado')} className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">Concluir</button>}
                {item.status === 'confirmado' && <button type="button" onClick={() => updateStatus(item.id, 'no_show')} className="rounded-full bg-amber-600 px-3 py-1 text-xs text-white">Falta</button>}
                {['aguardando_confirmacao', 'confirmado'].includes(item.status) && <button type="button" onClick={() => updateStatus(item.id, 'cancelado')} className="rounded-full bg-red-600 px-3 py-1 text-xs text-white">Cancelar</button>}
              </div>
            )}
          </div>
        </article>
      ))}
    </section>
  );
};

const MensagensTab = () => {
  const [items, setItems] = useState([]);
  useEffect(() => { api('/whatsapp/mensagens').then(setItems).catch(() => setItems([])); }, []);
  return (
    <section className="grid gap-2">
      {items.length === 0 && <p className="rounded-2xl bg-white p-4 text-sm dark:bg-slate-900">Nenhuma mensagem ainda.</p>}
      {[...items].reverse().map((item) => (
        <article key={item.id} className="rounded-2xl bg-white p-4 text-sm dark:bg-slate-900">
          <p className="font-semibold">{item.direcao === 'saida' ? 'Enviada' : 'Recebida'} · {item.tipo} · {item.status}</p>
          <p className="text-slate-500">{item.telefone}</p>
          <p className="mt-1 whitespace-pre-wrap">{item.texto}</p>
        </article>
      ))}
    </section>
  );
};

const ServicosTab = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ nome: '', duracao_minutos: 30, preco: 50 });
  const [error, setError] = useState('');
  const load = () => api('/servicos').then(setItems);
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api('/servicos', { method: 'POST', body: JSON.stringify(form) });
      setForm({ nome: '', duracao_minutos: 30, preco: 50 });
      load();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <section className="grid gap-4">
      <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-4 dark:bg-slate-900">
        <input required placeholder="Nome" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
        <input type="number" min="15" value={form.duracao_minutos} onChange={(event) => setForm({ ...form, duracao_minutos: Number(event.target.value) })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
        <input type="number" min="0" value={form.preco} onChange={(event) => setForm({ ...form, preco: Number(event.target.value) })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
        <button type="submit" className="rounded-xl bg-emerald-600 font-semibold text-white">Adicionar</button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {items.filter((item) => item.ativo !== false).map((item) => (
        <p key={item.id} className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">{item.nome} · {item.duracao_minutos} min · {money(item.preco)}</p>
      ))}
    </section>
  );
};

const EquipeTab = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '12345678', cargo: 'Profissional' });
  const [error, setError] = useState('');
  const load = () => api('/equipe').then(setItems);
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api('/equipe', { method: 'POST', body: JSON.stringify(form) });
      setForm({ nome: '', email: '', telefone: '', senha: '12345678', cargo: 'Profissional' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <section className="grid gap-4">
      <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-2 dark:bg-slate-900">
        <input required placeholder="Nome" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
        <input required type="email" placeholder="E-mail" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
        <input required placeholder="WhatsApp" value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
        <input required placeholder="Cargo" value={form.cargo} onChange={(event) => setForm({ ...form, cargo: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
        <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white md:col-span-2">Adicionar profissional</button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {items.map((item) => <p key={item.id} className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-900">{item.nome} · {item.cargo} · {item.email}</p>)}
    </section>
  );
};

const AutomacaoTab = ({ establishment, reload }) => {
  const [form, setForm] = useState({
    lembrete_horas: establishment?.lembrete_horas || 24,
    whatsapp: establishment?.whatsapp || ''
  });
  const [notice, setNotice] = useState('');
  const save = async (event) => {
    event.preventDefault();
    const data = await api('/estabelecimento', { method: 'PUT', body: JSON.stringify(form) });
    setNotice(`Lembrete automatico ${data.lembrete_horas}h antes, no WhatsApp ${data.whatsapp}.`);
    reload();
  };
  const processNow = async () => {
    const result = await api('/whatsapp/processar', { method: 'POST' });
    setNotice(`${result.enviados} lembrete(s) processado(s).`);
  };
  return (
    <form onSubmit={save} className="grid max-w-xl gap-4 rounded-2xl bg-white p-4 dark:bg-slate-900">
      <p className="text-sm text-slate-500">Cada instalacao fala somente com os clientes deste estabelecimento. A mensagem de confirmacao sai ao reservar. O lembrete sai sozinho antes do horario.</p>
      <label className="grid gap-1 text-sm font-medium">WhatsApp do estabelecimento<input value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" /></label>
      <label className="grid gap-1 text-sm font-medium">Lembrar com antecedencia (horas)<input type="number" min="1" value={form.lembrete_horas} onChange={(event) => setForm({ ...form, lembrete_horas: Number(event.target.value) })} className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" /></label>
      <div className="flex gap-2">
        <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">Salvar</button>
        <button type="button" onClick={processNow} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold">Processar lembretes agora</button>
      </div>
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}
    </form>
  );
};

const VendasTab = () => {
  const [items, setItems] = useState([]);
  const [clienteNome, setClienteNome] = useState('');
  const [error, setError] = useState('');
  const load = () => api('/vendas').then(setItems);
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api('/vendas', { method: 'POST', body: JSON.stringify({ cliente_nome: clienteNome }) });
      setClienteNome('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <section className="grid gap-4">
      <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-white p-4 dark:bg-slate-900">
        <h3 className="text-lg font-bold">Vender para outro estabelecimento</h3>
        <p className="text-sm text-slate-500">O codigo nao abre uma segunda empresa aqui. Ele libera uma instalacao nova, com a agenda e o WhatsApp daquele negocio apenas.</p>
        <div className="flex gap-2">
          <input required value={clienteNome} onChange={(event) => setClienteNome(event.target.value)} placeholder="Nome do estabelecimento comprador" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
          <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">Gerar licenca</button>
        </div>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {items.map((item) => (
        <article key={item.codigo} className="rounded-2xl bg-white p-4 dark:bg-slate-900">
          <p className="font-semibold">{item.cliente_nome}</p>
          <p className="text-sm">Codigo {item.codigo} · {item.status}</p>
          <p className="text-sm text-slate-500">{item.observacao}</p>
        </article>
      ))}
    </section>
  );
};

export default AssistenteApp;
