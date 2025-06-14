import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../services/api';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';

// Definindo os tipos para os dados de auditoria
interface AuditUser {
  name: string;
  email: string;
}

interface AuditLog {
  _id: string;
  timestamp: string;
  user: AuditUser;
  action: string;
  entity: string;
  details: string;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const AuditLogs = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['auditLogs', page],
    queryFn: async () => {
      // Fazemos a chamada e tipamos o resultado via unknown primeiro
      const result = await getAuditLogs({ page });
      return result as unknown as AuditLogsResponse;
    },
    placeholderData: (previousData) => previousData, // Mantém os dados antigos enquanto busca os novos
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h1>
        <p className="text-muted-foreground mt-2">Histórico de ações importantes realizadas no sistema.</p>
      </div>

      <div className="border border-border rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 font-medium">Data</th>
              <th className="p-4 font-medium">Usuário</th>
              <th className="p-4 font-medium">Ação</th>
              <th className="p-4 font-medium">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-4 text-center">Carregando logs...</td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-destructive">Falha ao carregar logs.</td>
              </tr>
            )}
            {data?.logs?.length === 0 && !isLoading && !isError && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">Nenhum log encontrado.</td>
              </tr>
            )}
            {data?.logs && data.logs.map((log: AuditLog) => (
              <tr key={log._id} className="border-t border-border">
                <td className="p-4 text-muted-foreground whitespace-nowrap">
                  {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                </td>
                <td className="p-4 font-medium">{log.user.name} ({log.user.email})</td>
                <td className="p-4">
                  <span className="font-semibold">{log.action}</span>
                  <span className="text-muted-foreground"> ({log.entity})</span>
                </td>
                <td className="p-4">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data && (
        <div className="flex items-center justify-between space-x-2 py-4 text-sm">
          <div className="text-muted-foreground">
            Total de {data.total} registros.
          </div>
          <div className="flex items-center space-x-2">
            <span>Página {data.currentPage} de {data.totalPages}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(page - 1)} 
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(page + 1)} 
              disabled={page >= (data.totalPages || 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};