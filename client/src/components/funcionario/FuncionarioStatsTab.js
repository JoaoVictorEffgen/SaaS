import React from 'react';
import { BarChart3, CalendarCheck2, CheckCircle2, Info, Users } from 'lucide-react';

const FuncionarioStatsTab = ({ agendamentos }) => {
  const realizados = agendamentos.filter((item) => item.status === 'realizado').length;
  const cancelados = agendamentos.filter((item) => item.status === 'cancelado').length;
  const finalizados = realizados + cancelados;
  const taxaConclusao = finalizados > 0
    ? Math.round((realizados / finalizados) * 100)
    : 0;
  const totalClientes = new Set(
    agendamentos
      .map((item) => item.cliente_id || item.clienteId || item.clienteNome)
      .filter(Boolean)
  ).size;

  const metrics = [
    { label: 'Atendimentos concluídos', value: realizados, icon: CheckCircle2, tone: 'emerald' },
    { label: 'Taxa de conclusão', value: `${taxaConclusao}%`, icon: BarChart3, tone: 'blue' },
    { label: 'Clientes únicos', value: totalClientes, icon: Users, tone: 'cyan' },
    { label: 'Reservas registradas', value: agendamentos.length, icon: CalendarCheck2, tone: 'violet' }
  ];

  const tones = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-400">Desempenho</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">Minhas estatísticas</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Indicadores calculados a partir dos seus agendamentos.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50 sm:p-5">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[metric.tone]}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">{metric.value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{metric.label}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h3 className="font-extrabold text-slate-950 dark:text-white">Como esta taxa é calculada?</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            A taxa de conclusão considera apenas atendimentos já finalizados: concluídos divididos pela soma de concluídos e cancelados. Reservas futuras não reduzem o indicador.
          </p>
        </div>

        <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30 sm:p-6">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-none text-amber-700 dark:text-amber-300" />
            <div>
              <h3 className="font-extrabold text-amber-950 dark:text-amber-100">Avaliações ainda não integradas</h3>
              <p className="mt-2 text-sm leading-6 text-amber-900/80 dark:text-amber-200/80">
                O sistema ainda não registra notas individuais por funcionário. Por isso, nenhuma média fictícia é exibida nesta tela.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default FuncionarioStatsTab;
