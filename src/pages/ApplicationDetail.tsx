import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getApplicationById, getDomainStatusesByAppId, getCertificateChain, DomainStatus } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { HealthScoreBadge } from '../components/ui/HealthScoreBadge';
import { Button } from '../components/ui/Button';
import { HistoryModal } from '../components/certificates/HistoryModal';
import { ChainVisualizer } from '../components/certificates/ChainVisualizer';
import { ArrowLeft, Lock, Network } from 'lucide-react';

// Componente interno para o Modal da Cadeia de Confiança
const ChainModal = ({ domain, onClose }: { domain: string; onClose: () => void }) => {
    const { data: chainData, isLoading } = useQuery({
        queryKey: ['chain', domain],
        queryFn: () => getCertificateChain(domain),
        enabled: !!domain,
    });

    return (
        <div className="fixed inset-0 bg-background/90 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-card p-6 rounded-lg border w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Cadeia de Confiança para {domain}</h2>
                {isLoading && <div className="h-[500px] flex items-center justify-center"><p>Carregando cadeia...</p></div>}
                {chainData && <ChainVisualizer chainData={chainData} />}
                <Button onClick={onClose} className="mt-4">Fechar</Button>
            </div>
        </div>
    );
};

// Componente interno para o Card de cada Certificado/Domínio
const CertificateStatusCard = ({ certStatus }: { certStatus: DomainStatus }) => {
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [chainModalOpen, setChainModalOpen] = useState(false);
    
    // Convertendo para o formato esperado pelo HistoryModal
    const fakeHistory = [{
        status: certStatus.status,
        checkedAt: new Date(certStatus.lastChecked),
        daysUntilExpiry: certStatus.daysUntilExpiry,
        errorMessage: undefined
    }];

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{certStatus._id}</CardTitle>
                            <Badge variant={certStatus.status as any} className="mt-2">{certStatus.status}</Badge>
                        </div>
                        {certStatus.healthScore && <HealthScoreBadge grade={certStatus.healthScore.grade} />}
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Expira em</p>
                        <p className="font-semibold">{certStatus.daysUntilExpiry} dias</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                            <Lock className="h-4 w-4" />Protocolo TLS
                        </p>
                        <div className="flex items-center gap-1">
                            <p>{certStatus.tlsVersion}</p>
                            {certStatus.status === 'insecure' && (
                                <span title="Protocolo Inseguro" className="text-orange-400">⚠️</span>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <p className="text-muted-foreground">Cifra Utilizada</p>
                        <p className="truncate">{certStatus.cipherName}</p>
                    </div>
                    <div className="flex gap-2 md:col-span-3">
                        <Button variant="outline" size="sm" onClick={() => setHistoryModalOpen(true)}>
                            Ver Histórico
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setChainModalOpen(true)}>
                            <Network className="mr-2 h-4 w-4" />
                            Visualizar Cadeia
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {historyModalOpen && (
                <HistoryModal 
                    domain={certStatus._id} 
                    history={fakeHistory} 
                    onClose={() => setHistoryModalOpen(false)} 
                />
            )}
            {chainModalOpen && (
                <ChainModal 
                    domain={certStatus._id} 
                    onClose={() => setChainModalOpen(false)} 
                />
            )}
        </>
    );
};

// Componente Principal da Página
export const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: application, isLoading: isLoadingApp } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplicationById(id!),
    enabled: !!id,
  });

  const { data: certificates, isLoading: isLoadingCerts } = useQuery({
    queryKey: ['certificates', 'byApp', id],
    queryFn: () => getDomainStatusesByAppId(id!),
    enabled: !!id,
  });

  if (isLoadingApp) {
    return <div>Carregando detalhes da aplicação...</div>;
  }

  if (!application) {
    return <div>Aplicação não encontrada.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <Link 
          to="/applications" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Aplicações
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{application.name}</h1>
        <a 
          href={application.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-muted-foreground hover:underline"
        >
          {application.url}
        </a>
        {application.description && (
          <p className="text-muted-foreground mt-2">{application.description}</p>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Detalhes da Aplicação</h2>
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Responsável</p>
              <p>{application.responsible.name} ({application.responsible.email})</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ambiente</p>
              <p className="capitalize">{application.environment}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Prioridade</p>
              <p className="capitalize">{application.priority}</p>
            </div>
            {application.tags && application.tags.length > 0 && (
              <div className="md:col-span-3">
                <p className="text-muted-foreground mb-2">Tags</p>
                <div className="flex gap-1 flex-wrap">
                  {application.tags.map(tag => (
                    <Badge key={tag} variant="default" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="md:col-span-3">
              <p className="text-muted-foreground">Status Page</p>
              <p>{application.showOnStatusPage ? 'Visível' : 'Oculto'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Domínios Monitorados</h2>
        {isLoadingCerts ? (
          <p>Carregando certificados...</p>
        ) : (
          <div className="space-y-4">
            {certificates && certificates.length > 0 ? (
              certificates.map(certStatus => (
                <CertificateStatusCard key={certStatus._id} certStatus={certStatus} />
              ))
            ) : (
              <p className="text-muted-foreground">Nenhum certificado encontrado para esta aplicação.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};