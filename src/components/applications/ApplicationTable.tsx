import { Link } from 'react-router-dom';
import { ApplicationWithId } from '../../services/api';
import { Button } from '../ui/Button';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';

interface ApplicationTableProps {
  applications: ApplicationWithId[];
  onEdit: (application: ApplicationWithId) => void;
  onDelete: (id: string) => void;
}

export const ApplicationTable = ({ applications, onEdit, onDelete }: ApplicationTableProps) => {
  return (
    <div className="border border-border rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-4 font-medium">Nome da Aplicação</th>
            <th className="p-4 font-medium">URL</th>
            <th className="p-4 font-medium">Ambiente</th>
            <th className="p-4 font-medium">Prioridade</th>
            <th className="p-4 font-medium">Atualizado em</th>
            <th className="p-4 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app._id} className="border-t border-border hover:bg-muted/50">
              <td className="p-4 font-semibold">
                <Link to={`/applications/${app._id}`} className="hover:underline text-primary">
                  {app.name}
                </Link>
              </td>
              <td className="p-4 text-muted-foreground truncate max-w-xs">
                <a href={app.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{app.url}</a>
              </td>
              <td className="p-4">
                <Badge variant={app.environment as any}>{app.environment}</Badge>
              </td>
              <td className="p-4 capitalize">{app.priority}</td>
              <td className="p-4 text-muted-foreground">
                {format(new Date(app.updatedAt), 'dd/MM/yyyy')}
              </td>
              <td className="p-4">
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => onEdit(app)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(app._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};