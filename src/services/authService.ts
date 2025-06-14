import { UserManager, User } from 'oidc-client-ts';

// Em um projeto real, estas variáveis viriam do .env
const oidcSettings = {
  authority: 'https://rhsso.idp-hml.sp.gov.br/auth/realms/idpsp',
  client_id: 'prodesp:ssl-monitor', // SUBSTITUIR COM SEU CLIENT ID REAL
  redirect_uri: 'http://localhost:5173/callback',
  post_logout_redirect_uri: 'http://localhost:5173/',
  response_type: 'code',
  scope: 'openid profile email',
};

const userManager = new UserManager(oidcSettings);

export const login = () => {
  return userManager.signinRedirect();
};

export const logout = () => {
  return userManager.signoutRedirect();
};

export const getUser = (): Promise<User | null> => {
  return userManager.getUser();
};

export default userManager;