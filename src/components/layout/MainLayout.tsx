import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { 
  LayoutDashboard, 
  List, 
  ShieldCheck, 
  Users, 
  PlugZap, 
  History,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { href: '/applications', label: 'Aplicações', icon: List, adminOnly: false },
    { href: '/certificates', label: 'Certificados', icon: ShieldCheck, adminOnly: false },
  ];

  const adminNavItems = [
    { href: '/users', label: 'Gerenciar Usuários', icon: Users, adminOnly: true },
    { href: '/connectors', label: 'Conectores', icon: PlugZap, adminOnly: true },
    { href: '/audit-logs', label: 'Logs de Auditoria', icon: History, adminOnly: true },
  ];

  const renderNavLinks = (items: typeof navItems) => {
    return items.map((item) => {
      if (item.adminOnly && user?.role !== 'admin') {
        return null;
      }
      return (
        <Link
          key={item.label}
          to={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            location.pathname === item.href && 'bg-primary/10 text-primary font-bold'
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      );
    });
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-background border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">SSL Monitor</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {renderNavLinks(navItems)}
        {user?.role === 'admin' && <hr className="my-4 border-border" />}
        {renderNavLinks(adminNavItems)}
      </nav>
      <div className="p-4 mt-auto border-t border-border">
        <p className="text-sm text-muted-foreground">Logado como:</p>
        <p className="font-semibold truncate">{user?.name}</p>
        <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4"/>
          Sair
        </Button>
      </div>
    </aside>
  );
};

export const MainLayout = () => {
  return (
    <div className="flex h-screen bg-secondary/20">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};