export const USER_HOME_ROUTES = Object.freeze({
  empresa: '/empresa/dashboard',
  funcionario: '/funcionario/agenda',
  cliente: '/cliente'
});

export const getUserHomeRoute = (userType) => USER_HOME_ROUTES[userType] || null;

export const isSupportedUserType = (userType) => Boolean(getUserHomeRoute(userType));
