import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

const variantes = {
  primario: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300',
  secundario: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400',
  perigo: 'border border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:text-red-300'
};

export function Botao({
  variante = 'primario',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: keyof typeof variantes }) {
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${variantes[variante]} ${className}`}
      {...props}
    />
  );
}

export function Campo({ rotulo, ...props }: InputHTMLAttributes<HTMLInputElement> & { rotulo: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{rotulo}</span>
      <input
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        {...props}
      />
    </label>
  );
}

export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl bg-white p-6 shadow-sm ${className}`}>{children}</section>;
}

export function Aviso({ tipo = 'erro', children }: { tipo?: 'erro' | 'sucesso'; children: ReactNode }) {
  const cores = tipo === 'erro' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700';
  return (
    <p role={tipo === 'erro' ? 'alert' : 'status'} className={`rounded-lg px-3 py-2 text-sm ${cores}`}>
      {children}
    </p>
  );
}
