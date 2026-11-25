import { type FormEvent, useEffect, useState } from 'react';
import { api, type Servico } from '../../api';
import { moeda } from '../../formato';
import { Aviso, Botao, Campo, Cartao } from '../../ui';

type Formulario = { nome: string; duracaoMin: string; preco: string; ativo: boolean };

const VAZIO: Formulario = { nome: '', duracaoMin: '30', preco: '', ativo: true };

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [form, setForm] = useState<Formulario>(VAZIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = () =>
    api<Servico[]>('/servicos/todos')
      .then(setServicos)
      .catch((e: Error) => setErro(e.message));

  useEffect(() => {
    carregar();
  }, []);

  function editar(servico: Servico) {
    setEditandoId(servico.id);
    setForm({ nome: servico.nome, duracaoMin: String(servico.duracaoMin), preco: servico.preco.toFixed(2).replace('.', ','), ativo: servico.ativo });
    setErro('');
  }

  function limpar() {
    setEditandoId(null);
    setForm(VAZIO);
    setErro('');
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      const corpo = {
        nome: form.nome,
        duracaoMin: Number(form.duracaoMin),
        preco: Number(form.preco.replace(',', '.')),
        ativo: form.ativo
      };
      await api(editandoId ? `/servicos/${editandoId}` : '/servicos', { metodo: editandoId ? 'PUT' : 'POST', corpo });
      limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function remover(servico: Servico) {
    if (!confirm(`Remover o serviço "${servico.nome}"?`)) return;
    try {
      await api(`/servicos/${servico.id}`, { metodo: 'DELETE' });
      if (editandoId === servico.id) limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_320px]">
      <Cartao className="!p-0">
        <ul className="divide-y divide-slate-100">
          {servicos.length === 0 && <li className="p-4 text-sm text-slate-500">Nenhum serviço cadastrado.</li>}
          {servicos.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-slate-900">
                  {s.nome}
                  {!s.ativo && <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">Inativo</span>}
                </p>
                <p className="text-sm text-slate-500">
                  {s.duracaoMin} min · {moeda(s.preco)}
                </p>
              </div>
              <div className="flex gap-2">
                <Botao variante="secundario" onClick={() => editar(s)}>
                  Editar
                </Botao>
                <Botao variante="perigo" onClick={() => remover(s)}>
                  Remover
                </Botao>
              </div>
            </li>
          ))}
        </ul>
      </Cartao>

      <Cartao>
        <h2 className="mb-4 font-semibold text-slate-900">{editandoId ? 'Editar serviço' : 'Novo serviço'}</h2>
        <form onSubmit={salvar} className="space-y-3">
          <Campo rotulo="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <Campo
            rotulo="Duração (minutos)"
            type="number"
            min={5}
            max={480}
            step={5}
            value={form.duracaoMin}
            onChange={(e) => setForm({ ...form, duracaoMin: e.target.value })}
            required
          />
          <Campo
            rotulo="Preço (R$)"
            inputMode="decimal"
            placeholder="0,00"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
            required
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
            Disponível para agendamento
          </label>
          {erro && <Aviso>{erro}</Aviso>}
          <div className="flex gap-2">
            <Botao type="submit" disabled={salvando} className="flex-1">
              {salvando ? 'Salvando...' : 'Salvar'}
            </Botao>
            {editandoId && (
              <Botao type="button" variante="secundario" onClick={limpar}>
                Cancelar
              </Botao>
            )}
          </div>
        </form>
      </Cartao>
    </div>
  );
}
