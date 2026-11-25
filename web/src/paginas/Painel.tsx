import { useState } from 'react';
import { useAuth } from '../auth';
import Agenda from './painel/Agenda';
import Equipe from './painel/Equipe';
import Servicos from './painel/Servicos';

const ABAS = [
  { id: 'agenda', rotulo: 'Agenda', apenasDono: false },
  { id: 'servicos', rotulo: 'Serviços', apenasDono: true },
  { id: 'equipe', rotulo: 'Equipe', apenasDono: true }
] as const;

type Aba = (typeof ABAS)[number]['id'];

export default function Painel() {
  const { usuario, sair } = useAuth();
  const [aba, setAba] = useState<Aba>('agenda');
  const abas = ABAS.filter((a) => !a.apenasDono || usuario?.papel === 'dono');

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Painel</p>
            <p className="text-sm text-slate-700">
              {usuario?.nome} · {usuario?.papel === 'dono' ? 'Dono' : 'Funcionário'}
            </p>
          </div>
          <button onClick={sair} className="text-sm text-slate-500 hover:text-slate-700">
            Sair
          </button>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 px-4">
          {abas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
                aba === a.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {a.rotulo}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl p-4">
        {aba === 'agenda' && <Agenda />}
        {aba === 'servicos' && <Servicos />}
        {aba === 'equipe' && <Equipe />}
      </main>
    </div>
  );
}
