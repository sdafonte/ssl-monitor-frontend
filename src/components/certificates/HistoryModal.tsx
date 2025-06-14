import { CertificateHistory } from '@prodesp/ssl-monitor-shared';
import { format } from 'date-fns';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { X } from 'lucide-react';

interface HistoryModalProps {
  domain: string;
  history: CertificateHistory[];
  onClose: () => void;
}

export const HistoryModal = ({ domain, history, onClose }: HistoryModalProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-card p-6 rounded-lg border w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Histórico de Verificação: {domain}</h2>
          <Button variant="outline" size="sm" onClick={onClose}><X className="h-4 w-4"/></Button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-card">
              <tr>
                <th className="p-3 font-medium">Data da Verificação</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Expira em (dias)</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.slice().reverse().map((entry, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="p-3 text-muted-foreground">{format(new Date(entry.checkedAt), 'dd/MM/yyyy HH:mm:ss')}</td>
                  <td className="p-3"><Badge variant={entry.status as any}>{entry.status}</Badge></td>
                  <td className="p-3">{entry.daysUntilExpiry}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-muted-foreground">Nenhum histórico de verificação encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};