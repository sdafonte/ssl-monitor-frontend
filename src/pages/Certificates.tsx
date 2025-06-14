import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllDomainStatuses, forceCheckCertificateByDomain, DomainStatus } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { HealthScoreBadge } from '../components/ui/HealthScoreBadge';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const CertificatesTable = ({ certificates, onForceCheck, checkingId }: { certificates: DomainStatus[], onForceCheck: (domain: string) => void, checkingId: string | null }) => (
  <div className="border border-border rounded-lg">
    <table className="w-full text-left text-sm">
      <thead className="bg-muted/50">
        <tr>
          <th className="p-4 font-medium">Domínio</th>
          <th className="p-4 font-medium">Aplicação</th>
          <th className="p-4 font-medium">Status</th>
          <th className="p-4 font-medium">Health Score</th>
          <th className="p-4 font-medium">Expira em (dias)</th>
          <th className="p-4 font-medium">Última Verificação</th>
          <th className="p-4 font-medium text-right">Ações</th>
        </tr>
      </thead>
      <tbody>
        {certificates.map(cert => (
          <tr key={cert._id} className="border-t border-border">
            <td className="p-4 font-semibold">{cert._id}</td>
            <td className="p-4 text-muted-foreground">
              <Link to={`/applications/${cert.applicationId._id}`} className="hover:underline">{cert.applicationId.name}</Link>
            </td>
            <td className="p-4"><Badge variant={cert.status as any}>{cert.status}</Badge></td>
            <td className="p-4"><HealthScoreBadge grade={cert.healthScore.grade} /></td>
            <td className="p-4 text-center">{cert.daysUntilExpiry}</td>
            <td className="p-4 text-muted-foreground">{format(new Date(cert.lastChecked), "dd/MM/yy HH:mm")}</td>
            <td className="p-4 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onForceCheck(cert._id)}
                disabled={checkingId === cert._id}
              >
                <RefreshCw className={`h-4 w-4 ${checkingId === cert._id ? 'animate-spin' : ''}`} />
                <span className="ml-2 hidden sm:inline">{checkingId === cert._id ? 'Verificando...' : 'Verificar'}</span>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Certificates = () => {
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Vamos precisar adicionar a função getAllDomainStatuses em api.ts
  const { data, isLoading, isError } = useQuery({ 
    queryKey: ['domainStatuses'], 
    queryFn: getAllDomainStatuses 
  });

  const checkMutation = useMutation({
    mutationFn: forceCheckCertificateByDomain,
    onSuccess: () => {
      // Invalida a query para forçar o refetch da lista
      queryClient.invalidateQueries({ queryKey: ['domainStatuses'] });
      // TODO: Adicionar toast de sucesso
    },
    onError: (error) => {
      alert(`Falha ao verificar: ${error.message}`);
      // TODO: Adicionar toast de erro
    },
    onSettled: () => {
      setCheckingId(null); // Limpa o estado de carregamento da linha
    }
  });

  const handleForceCheck = (domain: string) => {
    setCheckingId(domain);
    checkMutation.mutate(domain);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Todos os Certificados</h1>
        <p className="text-muted-foreground mt-2">Uma visão geral de todos os domínios monitorados no sistema.</p>
      </div>
      
      <div>
        {isLoading && <p>Carregando certificados...</p>}
        {isError && <p className="text-destructive">Não foi possível carregar os certificados.</p>}
        {data && <CertificatesTable certificates={data} onForceCheck={handleForceCheck} checkingId={checkingId} />}
      </div>
    </div>
  );
};