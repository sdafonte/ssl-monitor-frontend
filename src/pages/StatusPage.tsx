import { useQuery } from '@tanstack/react-query';
import { getPublicStatus } from '../services/api';
import { ShieldCheck, ShieldAlert, ShieldX, LoaderCircle } from 'lucide-react';

// Definindo os tipos para os dados de status público
interface PublicDomain {
  status: 'valid' | 'expiring' | 'expired' | 'invalid' | 'insecure' | 'unknown';
  domain: string;
  daysUntilExpiry?: number;
}

interface PublicService {
  applicationName: string;
  domains: PublicDomain[];
}

type PublicStatusResponse = PublicService[];

// Componente para o indicador de status visual
const StatusIndicator = ({ status }: { status: string }) => {
  const statusInfo = {
    valid: { color: 'text-green-400', icon: <ShieldCheck className="h-5 w-5" />, text: 'Operacional' },
    expiring: { color: 'text-yellow-400', icon: <ShieldAlert className="h-5 w-5" />, text: 'Expira em Breve' },
    insecure: { color: 'text-orange-400', icon: <ShieldAlert className="h-5 w-5" />, text: 'Configuração Insegura' },
    expired: { color: 'text-red-500', icon: <ShieldX className="h-5 w-5" />, text: 'Expirado' },
    invalid: { color: 'text-red-500', icon: <ShieldX className="h-5 w-5" />, text: 'Inválido' },
  }[status] || { color: 'text-gray-500', icon: <ShieldX className="h-5 w-5" />, text: 'Desconhecido' };

  return (
    <div className={`flex items-center gap-2 font-semibold ${statusInfo.color}`}>
      {statusInfo.icon}
      <span>{statusInfo.text}</span>
    </div>
  );
};

export const StatusPage = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ['publicStatus'],
    queryFn: async () => {
      const result = await getPublicStatus();
      return result as unknown as PublicStatusResponse;
    },
    refetchInterval: 60000, // Atualiza a cada minuto
  });

  const hasProblems = services?.some((service: PublicService) => 
    service.domains.some((domain: PublicDomain) => domain.status !== 'valid')
  );

  const overallStatus = isLoading 
    ? 'Verificando status...' 
    : (services && services.length > 0) 
      ? hasProblems
        ? 'Alguns sistemas apresentam problemas.'
        : 'Todos os sistemas estão operacionais.'
      : 'Nenhum serviço público configurado.';
  
  const overallStatusColor = isLoading
    ? 'text-muted-foreground'
    : hasProblems
    ? 'text-yellow-400'
    : 'text-green-400';

  // Função helper para determinar o status geral de um serviço
  const getServiceStatus = (service: PublicService): string => {
    const hasInvalidDomains = service.domains.some(d => d.status === 'expired' || d.status === 'invalid');
    const hasWarningDomains = service.domains.some(d => d.status === 'expiring' || d.status === 'insecure');
    
    if (hasInvalidDomains) return 'expired';
    if (hasWarningDomains) return 'expiring';
    return 'valid';
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold">Status dos Serviços</h1>
          <p className={`text-lg mt-2 font-semibold ${overallStatusColor}`}>
            {overallStatus}
          </p>
        </header>
        
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <main className="space-y-6">
          {services?.map((service: PublicService) => (
            <div key={service.applicationName} className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{service.applicationName}</h2>
                <StatusIndicator status={getServiceStatus(service)} />
              </div>
              
              {/* Detalhes dos domínios */}
              <div className="space-y-2">
                {service.domains.map((domain: PublicDomain, index: number) => (
                  <div key={`${domain.domain}-${index}`} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{domain.domain}</span>
                    <div className="flex items-center gap-2">
                      {domain.daysUntilExpiry !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {domain.daysUntilExpiry > 0 
                            ? `${domain.daysUntilExpiry} dias` 
                            : 'Expirado'
                          }
                        </span>
                      )}
                      <StatusIndicator status={domain.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {!isLoading && (!services || services.length === 0) && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhum serviço está configurado para exibição pública.</p>
            </div>
          )}
        </main>
        
        <footer className="mt-12 text-center text-muted-foreground text-sm">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </footer>
      </div>
    </div>
  );
};