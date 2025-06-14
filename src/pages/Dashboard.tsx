import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Server, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  AlertTriangle 
} from 'lucide-react';

// Tipagem para os dados que esperamos da API
interface DashboardStats {
  totalApplications: number;
  certificateCounts: {
    valid: number;
    expiring: number;
    expired: number;
    invalid: number;
    insecure: number;
  };
  expiringSoonList: Array<{
    _id: string; // domain
    daysUntilExpiry: number;
    applicationName: string;
  }>;
}

export const Dashboard = () => {
  const { data, isLoading, isError, error } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return <div>Carregando métricas...</div>;
  }

  if (isError) {
    return <div className="text-destructive">Erro ao carregar os dados do dashboard: {error.message}</div>;
  }

  const totalProblematic = 
    (data?.certificateCounts.expired ?? 0) + 
    (data?.certificateCounts.invalid ?? 0) + 
    (data?.certificateCounts.insecure ?? 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do status de saúde dos seus certificados SSL/TLS.
        </p>
      </div>

      {/* Grid de KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aplicações Totais</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalApplications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados Válidos</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.certificateCounts.valid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirando em Breve</CardTitle>
            <ShieldAlert className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.certificateCounts.expiring}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Problemas</CardTitle>
            <ShieldX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProblematic}</div>
            <p className="text-xs text-muted-foreground">
              Expirados, Inválidos ou Inseguros
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alertas: Certificados Vencendo nos Próximos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.expiringSoonList && data.expiringSoonList.length > 0 ? (
              <ul className="space-y-3">
                {data.expiringSoonList.map((cert) => (
                  <li key={cert._id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div>
                      <span className="font-semibold">{cert._id}</span>
                      <span className="text-muted-foreground ml-2">({cert.applicationName})</span>
                    </div>
                    <Badge variant="expiring">Vence em {cert.daysUntilExpiry} dias</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum certificado com vencimento nos próximos 30 dias. Ótimo trabalho!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};