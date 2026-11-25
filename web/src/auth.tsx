import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenSalvo, type Usuario } from './api';

type Auth = {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(Boolean(tokenSalvo.ler()));

  useEffect(() => {
    if (!tokenSalvo.ler()) return;
    api<{ usuario: Usuario }>('/auth/me')
      .then(({ usuario }) => setUsuario(usuario))
      .catch(() => tokenSalvo.limpar())
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const resposta = await api<{ token: string; usuario: Usuario }>('/auth/login', {
      metodo: 'POST',
      corpo: { email, senha }
    });
    tokenSalvo.salvar(resposta.token);
    setUsuario(resposta.usuario);
  }, []);

  const sair = useCallback(async () => {
    await api('/auth/logout', { metodo: 'POST' }).catch(() => undefined);
    tokenSalvo.limpar();
    setUsuario(null);
  }, []);

  return <AuthContext.Provider value={{ usuario, carregando, entrar, sair }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return contexto;
}
