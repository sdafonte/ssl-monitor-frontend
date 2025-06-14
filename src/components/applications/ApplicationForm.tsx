import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Application } from '@prodesp/ssl-monitor-shared';
import { useQuery } from '@tanstack/react-query';
import { getConnectors, ApplicationWithId, Connector } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ApplicationFormProps {
  onSubmit: (data: Application) => void;
  isLoading: boolean;
  initialData?: ApplicationWithId | null;
}

// Tipo simplificado para evitar problemas de recursão infinita
type ApplicationFormData = {
  name: string;
  url: string;
  description?: string;
  environment: 'production' | 'staging' | 'development';
  priority: 'high' | 'medium' | 'low';
  responsible: {
    name: string;
    email: string;
  };
  tags?: string[];
  notificationConnectors?: string[];
  showOnStatusPage?: boolean;
};

export const ApplicationForm = ({ onSubmit, isLoading, initialData }: ApplicationFormProps) => {
  const { data: connectors } = useQuery<Connector[]>({ 
    queryKey: ['connectors'], 
    queryFn: getConnectors 
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ApplicationFormData>({
    defaultValues: {
      name: '',
      url: '',
      description: '',
      environment: 'production',
      priority: 'medium',
      responsible: { name: '', email: '' },
      tags: [],
      notificationConnectors: [],
      showOnStatusPage: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData as ApplicationFormData);
    }
  }, [initialData, reset]);
  
  const isEditing = !!initialData;

  const handleFormSubmit = (data: ApplicationFormData) => {
    // Validação básica manual
    if (!data.name?.trim()) {
      alert('Nome da aplicação é obrigatório');
      return;
    }
    if (!data.url?.trim()) {
      alert('URL é obrigatória');
      return;
    }
    if (!data.responsible?.name?.trim()) {
      alert('Nome do responsável é obrigatório');
      return;
    }
    if (!data.responsible?.email?.trim()) {
      alert('Email do responsável é obrigatório');
      return;
    }

    onSubmit(data as Application);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
      <div>
        <label htmlFor="name" className="text-sm font-medium">Nome da Aplicação *</label>
        <Input 
          id="name" 
          {...register('name', { required: 'Nome é obrigatório' })} 
          className="mt-1" 
        />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="url" className="text-sm font-medium">URL do Domínio Principal *</label>
        <Input 
          id="url" 
          {...register('url', { 
            required: 'URL é obrigatória',
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'URL deve começar com http:// ou https://'
            }
          })} 
          className="mt-1" 
        />
        {errors.url && <p className="text-sm text-destructive mt-1">{errors.url.message}</p>}
      </div>

      <div>
        <label htmlFor="responsible.name" className="text-sm font-medium">Nome do Responsável *</label>
        <Input 
          id="responsible.name" 
          {...register('responsible.name', { required: 'Nome do responsável é obrigatório' })} 
          className="mt-1" 
        />
        {errors.responsible?.name && <p className="text-sm text-destructive mt-1">{errors.responsible.name.message}</p>}
      </div>

      <div>
        <label htmlFor="responsible.email" className="text-sm font-medium">Email do Responsável *</label>
        <Input 
          id="responsible.email" 
          {...register('responsible.email', { 
            required: 'Email é obrigatório',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Email inválido'
            }
          })} 
          className="mt-1" 
        />
        {errors.responsible?.email && <p className="text-sm text-destructive mt-1">{errors.responsible.email.message}</p>}
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="environment" className="text-sm font-medium">Ambiente</label>
          <select id="environment" {...register('environment')} className="w-full mt-1 p-2 rounded bg-input text-foreground border border-border h-10">
            <option value="production">Produção</option>
            <option value="staging">Homologação</option>
            <option value="development">Desenvolvimento</option>
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="priority" className="text-sm font-medium">Prioridade</label>
           <select id="priority" {...register('priority')} className="w-full mt-1 p-2 rounded bg-input text-foreground border border-border h-10">
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium">Descrição (opcional)</label>
        <Input id="description" {...register('description')} className="mt-1" />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Canais de Notificação</label>
        <div className="space-y-2 rounded-md border p-4">
          {!connectors || connectors.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum conector cadastrado.</p>
          ) : (
            connectors.map(connector => (
              <div key={connector._id} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id={`connector-${connector._id}`} 
                  {...register('notificationConnectors')} 
                  value={connector._id}
                />
                <label htmlFor={`connector-${connector._id}`} className="text-sm">
                  {connector.name} ({connector.type})
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          id="showOnStatusPage" 
          {...register('showOnStatusPage')} 
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="showOnStatusPage" className="text-sm font-medium">
          Exibir na Página de Status Pública
        </label>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Aplicação')}
        </Button>
      </div>
    </form>
  );
};