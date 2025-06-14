import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConnectors, createConnector, updateConnector, deleteConnector, Connector } from '../services/api';
import { useForm } from 'react-hook-form';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

type ConnectorFormData = Omit<Connector, '_id'>;

// Componente do Formulário
const ConnectorForm = ({ onSubmit, isLoading, initialData }: { onSubmit: (data: ConnectorFormData) => void; isLoading: boolean; initialData?: Connector | null; }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ConnectorFormData>({
    defaultValues: initialData || { name: '', type: 'slack', config: { url: '' } },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">Nome do Conector *</label>
        <Input 
          id="name" 
          placeholder="Ex: Slack #canal-alertas" 
          {...register('name', { 
            required: 'Nome é obrigatório',
            minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' }
          })} 
          className="mt-1" 
        />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>
      
      <div>
        <label htmlFor="type" className="text-sm font-medium">Tipo *</label>
        <select 
          id="type" 
          {...register('type', { required: 'Tipo é obrigatório' })} 
          className="w-full mt-1 p-2 rounded bg-input text-foreground border border-border h-10"
        >
          <option value="slack">Slack</option>
          <option value="teams">Microsoft Teams</option>
          <option value="webhook">Webhook Genérico</option>
        </select>
        {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
      </div>
      
      <div>
        <label htmlFor="config.url" className="text-sm font-medium">URL do Webhook *</label>
        <Input 
          id="config.url" 
          placeholder="https://hooks.slack.com/services/..." 
          {...register('config.url', { 
            required: 'URL é obrigatória',
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'URL deve começar com http:// ou https://'
            }
          })} 
          className="mt-1" 
        />
        {errors.config?.url && <p className="text-sm text-destructive mt-1">{errors.config.url.message}</p>}
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Conector'}
        </Button>
      </div>
    </form>
  );
};

// Componente Principal da Página
export const Connectors = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
  const queryClient = useQueryClient();

  const { data: connectors, isLoading } = useQuery({ 
    queryKey: ['connectors'], 
    queryFn: getConnectors 
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      setIsFormOpen(false);
      setEditingConnector(null);
    },
    onError: (error: any) => alert(error.response?.data?.message || 'Ocorreu um erro.'),
  };

  const createMutation = useMutation({ 
    mutationFn: createConnector, 
    ...mutationOptions 
  });
  
  const updateMutation = useMutation({ 
    mutationFn: (vars: {id: string, data: ConnectorFormData}) => updateConnector(vars.id, vars.data), 
    ...mutationOptions 
  });
  
  const deleteMutation = useMutation({ 
    mutationFn: deleteConnector, 
    ...mutationOptions 
  });

  const handleFormSubmit = (data: ConnectorFormData) => {
    if (editingConnector) {
      updateMutation.mutate({ id: editingConnector._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAddNew = () => {
    setEditingConnector(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (connector: Connector) => {
    setEditingConnector(connector);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza? Este conector será removido de todas as aplicações que o utilizam.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setEditingConnector(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Conectores</h1>
          <p className="text-muted-foreground mt-2">Configure os canais para receber alertas.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Conector
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center" onClick={handleCloseModal}>
          <div className="bg-card p-6 rounded-lg border w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingConnector ? 'Editar Conector' : 'Novo Conector'}</h2>
              <Button variant="outline" size="sm" onClick={handleCloseModal}>
                Fechar
              </Button>
            </div>
            <ConnectorForm 
              onSubmit={handleFormSubmit} 
              isLoading={createMutation.isPending || updateMutation.isPending} 
              initialData={editingConnector} 
            />
          </div>
        </div>
      )}

      <div className="border border-border rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 font-medium">Nome</th>
              <th className="p-4 font-medium">Tipo</th>
              <th className="p-4 font-medium">URL</th>
              <th className="p-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-4 text-center">Carregando...</td>
              </tr>
            )}
            {!isLoading && (!connectors || connectors.length === 0) && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  Nenhum conector configurado. Clique em "Novo Conector" para começar.
                </td>
              </tr>
            )}
            {connectors?.map(connector => (
              <tr key={connector._id} className="border-t border-border">
                <td className="p-4 font-medium">{connector.name}</td>
                <td className="p-4 capitalize">{connector.type}</td>
                <td className="p-4">
                  <span className="text-xs text-muted-foreground font-mono truncate max-w-xs block">
                    {connector.config.url}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(connector)}
                      title="Editar conector"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(connector._id)}
                      title="Excluir conector"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};