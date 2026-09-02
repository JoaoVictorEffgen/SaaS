import { getUserHomeRoute, isSupportedUserType } from './authRoutes';

describe('authRoutes', () => {
  it.each([
    ['empresa', '/empresa/dashboard'],
    ['funcionario', '/funcionario/agenda'],
    ['cliente', '/cliente']
  ])('direciona %s para sua área', (userType, expectedRoute) => {
    expect(getUserHomeRoute(userType)).toBe(expectedRoute);
  });

  it('não cria rota para um tipo desconhecido', () => {
    expect(getUserHomeRoute('admin')).toBeNull();
    expect(isSupportedUserType('admin')).toBe(false);
  });
});
