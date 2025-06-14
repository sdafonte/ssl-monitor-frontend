import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserRole } from '../services/api';
import { Shield, ShieldCheck } from 'lucide-react';

export const Users = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const roleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // TODO: Adicionar um toast de sucesso
    },
    onError: (error: any) => {
      // Exibe a mensagem de erro do backend (ex: "Não é possível rebaixar o último admin")
      alert(error.response?.data?.message || 'Ocorreu um erro ao atualizar a permissão.');
      // Reverte a alteração visual no select em caso de erro
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const handleRoleChange = (userId: string, newRole: 'admin' | 'member') => {
    // Confirma mudanças críticas para admins sendo rebaixados
    const userToChange = users?.find(u => u._id === userId);
    if (userToChange?.role === 'admin' && newRole === 'member') {
      if (!window.confirm(`Tem certeza que deseja remover as permissões de admin de ${userToChange.name}?`)) {
        return;
      }
    }

    roleMutation.mutate({ id: userId, role: newRole });
  };

  // Helper para contar admins
  const adminCount = users?.filter(user => user.role === 'admin').length || 0;
  const isLastAdmin = (user: any) => user.role === 'admin' && adminCount === 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground mt-2">Atribua permissões de admin ou membro aos usuários do sistema.</p>
      </div>

      {/* Informações de segurança */}
      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>
            Total de administradores: <strong>{adminCount}</strong>
            {adminCount === 1 && " - Pelo menos um admin é necessário"}
          </span>
        </div>
      </div>

      <div className="border border-border rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 font-medium">Nome</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Permissão</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-4 text-center">Carregando usuários...</td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-destructive">Falha ao carregar usuários.</td>
              </tr>
            )}
            {!isLoading && (!users || users.length === 0) && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
            {users?.map(user => (
              <tr key={user._id} className="border-t border-border">
                <td className="p-4">
                  <span className="font-medium">{user.name}</span>
                </td>
                <td className="p-4 text-muted-foreground">{user.email}</td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value as 'admin' | 'member')}
                    className="bg-input border border-border rounded p-2 focus:ring-2 focus:ring-ring"
                    disabled={roleMutation.isPending || isLastAdmin(user)}
                    title={isLastAdmin(user) ? 'Não é possível remover o último administrador' : ''}
                  >
                    <option value="member">Membro</option>
                    <option value="admin">Admin</option>
                  </select>
                  {isLastAdmin(user) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Último admin - não pode ser alterado
                    </p>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    {user.role === 'admin' ? (
                      <>
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 text-xs font-medium">Admin</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">Membro</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rodapé informativo */}
      <div className="text-xs text-muted-foreground">
        <p>
          <strong>Membros:</strong> Podem visualizar e gerenciar aplicações atribuídas.
        </p>
        <p>
          <strong>Admins:</strong> Podem gerenciar todos os aspectos do sistema, incluindo usuários e conectores.
        </p>
      </div>
    </div>
  );
};