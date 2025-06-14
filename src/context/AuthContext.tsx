import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMe, UserWithId } from '../services/api';
import { login, logout } from '../services/authService';

// A interface agora usa nosso tipo interno UserWithId, que contém a 'role'
interface AuthContextType {
  user: UserWithId | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // A fonte da verdade sobre o usuário agora é esta query para nosso backend.
  // O TanStack Query gerencia o cache e o estado de carregamento para nós.
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['me'], // Chave única para esta query
    queryFn: getMe,   // Função que chama GET /api/auth/me
    retry: false,     // Não tenta novamente se falhar (ex: erro 401 se não estiver logado)
  });
  
  // Se a query der erro (ex: 401 Unauthorized), significa que não há usuário logado.
  // Se a query for bem-sucedida, 'user' conterá os dados do nosso banco.
  const authenticatedUser = isError ? null : (user || null);

  const value = { 
    user: authenticatedUser, 
    isLoading, 
    login, 
    logout 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook customizado para facilitar o acesso ao contexto de autenticação.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};