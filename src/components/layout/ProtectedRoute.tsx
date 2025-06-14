import { useAuth } from '../../context/AuthContext';
import { Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const { user, isLoading, login } = useAuth();

  // Se ainda estiver verificando a sessão, mostra uma mensagem de carregamento
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Verificando autenticação...
      </div>
    );
  }

  // Se não houver usuário após a verificação, inicia o fluxo de login
  if (!user) {
    login();
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Redirecionando para o login...
      </div>
    );
  }

  // Se houver um usuário, renderiza o conteúdo protegido (nossas páginas)
  return <Outlet />;
};