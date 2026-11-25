import { useEffect, useState } from 'react';

type Estabelecimento = { nome: string };

const API_URL = import.meta.env.VITE_API_URL ?? '';

export default function App() {
  const [estabelecimento, setEstabelecimento] = useState<Estabelecimento | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/estabelecimento`)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<Estabelecimento>;
      })
      .then(setEstabelecimento)
      .catch(() => setErro(true));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">TimeFlow</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {estabelecimento?.nome ?? (erro ? 'API indisponível' : 'Carregando...')}
        </h1>
        <p className="mt-3 text-sm text-slate-500">Agendamentos online deste estabelecimento.</p>
      </section>
    </main>
  );
}
