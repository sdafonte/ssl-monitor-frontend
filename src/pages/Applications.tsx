import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, createApplication, updateApplication, deleteApplication, ApplicationWithId } from '../services/api';
import { Application } from '@prodesp/ssl-monitor-shared';
import { useDebounce } from '../hooks/useDebounce';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { ApplicationTable } from '../components/applications/ApplicationTable';
import { PlusCircle } from 'lucide-react';

export const Applications = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationWithId | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ environment: '', priority: '' });
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['applications', page, debouncedSearchTerm, filters],
    queryFn: () => getApplications({ page, search: debouncedSearchTerm, ...filters }),
    placeholderData: (previousData) => previousData,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsFormOpen(false);
      setEditingApp(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Ocorreu um erro.');
    },
  };

  const createMutation = useMutation({ mutationFn: createApplication, ...mutationOptions });
  const updateMutation = useMutation({ mutationFn: updateApplication, ...mutationOptions });
  const deleteMutation = useMutation({ mutationFn: deleteApplication, onSuccess: mutationOptions.onSuccess });

  const handleFormSubmit = (formData: Application) => {
    if (editingApp) {
      updateMutation.mutate({ id: editingApp._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (app: ApplicationWithId) => {
    setEditingApp(app);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingApp(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta aplicação? Esta ação também removerá os certificados e status associados.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFilterChange = (filterType: 'environment' | 'priority', value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({ environment: '', priority: '' });
    setPage(1);
  };
  
  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aplicações Monitoradas</h1>
          <p className="text-muted-foreground mt-2">Gerencie as aplicações e domínios a serem monitorados.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Aplicação
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center" onClick={() => setIsFormOpen(false)}>
          <div className="bg-card p-6 rounded-lg border w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingApp ? 'Editar Aplicação' : 'Nova Aplicação'}</h2>
              <Button variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>Fechar</Button>
            </div>
            <ApplicationForm onSubmit={handleFormSubmit} isLoading={isMutating} initialData={editingApp} />
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Buscar por nome ou URL..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        />
        
        {/* Filtros implementados */}
        <select
          value={filters.environment}
          onChange={(e) => handleFilterChange('environment', e.target.value)}
          className="px-3 py-2 rounded border border-border bg-background text-foreground"
        >
          <option value="">Todos os ambientes</option>
          <option value="production">Produção</option>
          <option value="staging">Homologação</option>
          <option value="development">Desenvolvimento</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="px-3 py-2 rounded border border-border bg-background text-foreground"
        >
          <option value="">Todas as prioridades</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>

        {(filters.environment || filters.priority) && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        )}
      </div>

      <div>
        {isLoading && <p>Carregando aplicações...</p>}
        {isError && <p className="text-destructive">Não foi possível carregar as aplicações.</p>}
        {data && (
          <>
            <ApplicationTable applications={data.applications} onEdit={handleEdit} onDelete={handleDelete} />
            <div className="flex items-center justify-between space-x-2 py-4 text-sm">
              <div className="text-muted-foreground">
                Total de {data.totalApplications} aplicações.
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
          </>
        )}
      </div>
    </div>
  );
};