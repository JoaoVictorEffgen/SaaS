import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import { getUserHomeRoute } from '../../utils/authRoutes';

const emptyForm = {
  nome: '',
  sobrenome: '',
  email: '',
  telefone: '',
  senha: '',
  confirmarSenha: ''
};

const ClientRegistrationModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { register, login } = useMySqlAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.nome.trim() || !form.sobrenome.trim() || !form.email.trim() || !form.senha) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (form.senha.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      const registration = await register({
        nome: `${form.nome.trim()} ${form.sobrenome.trim()}`,
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        senha: form.senha,
        tipo: 'cliente'
      });

      if (!registration.success) {
        setError(registration.error || 'Não foi possível criar sua conta.');
        return;
      }

      const session = await login(form.email.trim(), form.senha, 'cliente');
      if (!session.success) {
        setError('Conta criada, mas não foi possível iniciar a sessão. Faça o login na tela inicial.');
        return;
      }

      onClose();
      navigate(getUserHomeRoute('cliente'), { replace: true });
    } catch (registrationError) {
      setError(registrationError.message || 'Não foi possível criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="client-register-title">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-400 p-2.5 text-white"><UserPlus className="h-5 w-5" /></span>
            <div>
              <h2 id="client-register-title" className="font-black text-slate-950 dark:text-white">Criar conta de cliente</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Agende com as empresas parceiras.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar cadastro">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Nome *
              <input value={form.nome} onChange={(event) => updateField('nome', event.target.value)} autoComplete="given-name" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 font-normal outline-none focus:border-cyan-500 dark:border-slate-700" />
            </label>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Sobrenome *
              <input value={form.sobrenome} onChange={(event) => updateField('sobrenome', event.target.value)} autoComplete="family-name" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 font-normal outline-none focus:border-cyan-500 dark:border-slate-700" />
            </label>
          </div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">E-mail *
            <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} autoComplete="email" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 font-normal outline-none focus:border-cyan-500 dark:border-slate-700" />
          </label>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Telefone ou WhatsApp
            <input type="tel" value={form.telefone} onChange={(event) => updateField('telefone', event.target.value)} autoComplete="tel" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 font-normal outline-none focus:border-cyan-500 dark:border-slate-700" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Senha *
              <input type="password" value={form.senha} onChange={(event) => updateField('senha', event.target.value)} autoComplete="new-password" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 font-normal outline-none focus:border-cyan-500 dark:border-slate-700" />
            </label>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Confirmar senha *
              <input type="password" value={form.confirmarSenha} onChange={(event) => updateField('confirmarSenha', event.target.value)} autoComplete="new-password" className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-transparent px-3 font-normal outline-none focus:border-cyan-500 dark:border-slate-700" />
            </label>
          </div>
          <button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 font-extrabold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-60">
            {loading ? 'Criando conta...' : 'Criar minha conta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientRegistrationModal;
