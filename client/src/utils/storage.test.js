import { readJsonStorage } from './storage';

describe('readJsonStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retorna o valor padrão quando a chave não existe', () => {
    expect(readJsonStorage('missing', [])).toEqual([]);
  });

  it('retorna JSON válido armazenado', () => {
    localStorage.setItem('empresa', JSON.stringify({ id: 1, nome: 'TimeFlow' }));

    expect(readJsonStorage('empresa', null)).toEqual({ id: 1, nome: 'TimeFlow' });
  });

  it('não interrompe a aplicação quando o JSON está corrompido', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem('empresa', '{invalid');

    expect(readJsonStorage('empresa', null)).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });
});

