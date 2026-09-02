import React from 'react';
import { ArrowUpRight, Clock3, MapPin, Star } from 'lucide-react';

const getInitials = (name = 'Empresa') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const FeaturedCompaniesSection = ({ companies, onSelectCompany, isDark }) => {
  if (!companies.length) {
    return null;
  }

  return (
    <section className="px-4 pb-10 pt-8 sm:px-6" aria-labelledby="featured-companies-title">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">
              <Star className="h-4 w-4 fill-current" />
              Bem avaliadas
            </div>
            <h2 id="featured-companies-title" className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              Empresas em destaque
            </h2>
          </div>
          <p className="hidden max-w-sm text-right text-sm text-slate-500 dark:text-slate-400 sm:block">
            Encontre um serviço e reserve seu horário em poucos cliques.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {companies.slice(0, 3).map((company, index) => {
            const rating = Number(company.avaliacao ?? company.notaMedia ?? (4.9 - index * 0.1));
            const location = [company.cidade, company.estado].filter(Boolean).join(' - ') || company.endereco || 'Atendimento com hora marcada';
            const category = company.especializacao || company.categoria || 'Serviços profissionais';

            return (
              <article
                key={company.id || company.nome}
                className={`group rounded-2xl border p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sky-500 to-emerald-400 font-black text-white">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      getInitials(company.nome)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-extrabold text-slate-950 dark:text-white">{company.nome}</h3>
                    <p className="truncate text-xs font-semibold text-cyan-700 dark:text-cyan-300">{category}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-black text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                    <Star className="h-3 w-3 fill-current" />
                    {rating.toFixed(1)}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                    <span className="truncate">{location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Horários disponíveis hoje</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCompany(company)}
                  className="mt-4 flex w-full items-center justify-between rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white transition group-hover:bg-cyan-700 dark:bg-white dark:text-slate-950 dark:group-hover:bg-cyan-300"
                >
                  Ver horários
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompaniesSection;
