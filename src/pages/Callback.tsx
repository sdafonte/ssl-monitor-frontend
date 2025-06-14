import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userManager from '../services/authService';

export const CallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // A função signinRedirectCallback processa a resposta do IDP
    userManager.signinRedirectCallback()
      .then(() => {
        // Após o sucesso, redireciona para a página inicial (Dashboard)
        navigate('/');
      })
      .catch((error) => {
        console.error("Erro no callback do OIDC:", error);
        // Em caso de erro, pode-se redirecionar para uma página de erro ou de login
        // Por simplicidade, redirecionamos para a raiz também, onde o fluxo de login recomeçará.
        navigate('/');
      });
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Processando autenticação...</p>
    </div>
  );
};