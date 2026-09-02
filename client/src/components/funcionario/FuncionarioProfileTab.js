import React from 'react';
import { Briefcase, Edit, LockKeyhole, Mail, Phone, Save, ShieldCheck, User } from 'lucide-react';

const FuncionarioProfileTab = ({
  isEditing,
  onEditingChange,
  profileData,
  onProfileDataChange,
  onSave
}) => {
  const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:disabled:border-slate-800 dark:disabled:bg-slate-950/60 dark:disabled:text-slate-500';

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-lg font-extrabold text-white shadow-lg shadow-blue-600/20">
              {(profileData.nome || 'F').charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-400">Dados pessoais</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">Meu perfil</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Mantenha seus contatos atualizados para receber avisos.</p>
            </div>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => onEditingChange(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              Editar contato
            </button>
          ) : (
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => onEditingChange(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
              >
                <Save className="h-4 w-4" />
                Salvar alterações
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-slate-400" />
              <h3 className="font-extrabold text-slate-900 dark:text-white">Informações profissionais</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Nome completo</span>
                <span className="relative block">
                  <User className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="text" value={profileData.nome || ''} disabled className={`${fieldClass} pl-10`} />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">CPF</span>
                <input type="text" value={profileData.cpf || ''} disabled className={fieldClass} />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Cargo</span>
                <span className="relative block">
                  <Briefcase className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="text" value={profileData.cargo || ''} disabled className={`${fieldClass} pl-10`} />
                </span>
              </label>
            </div>

            <p className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Estes dados são protegidos e administrados pela empresa.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/50">
            <div className="mb-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white">Canais de contato</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Você pode editar seu telefone. O e-mail de acesso é administrado pela empresa.</p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Telefone *</span>
                <span className="relative block">
                  <Phone className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={profileData.telefone || ''}
                    onChange={(event) => onProfileDataChange((current) => ({
                      ...current,
                      telefone: event.target.value.replace(/\D/g, '')
                    }))}
                    disabled={!isEditing}
                    className={`${fieldClass} pl-10`}
                    maxLength={11}
                    placeholder="11999999999"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">E-mail *</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={profileData.email || ''}
                    disabled
                    className={`${fieldClass} pl-10`}
                    placeholder="seu@email.com"
                  />
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <aside className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-none" />
        <p><strong>Segurança dos dados:</strong> alterações de nome, CPF e cargo devem ser solicitadas ao administrador da empresa.</p>
      </aside>
    </div>
  );
};

export default FuncionarioProfileTab;
