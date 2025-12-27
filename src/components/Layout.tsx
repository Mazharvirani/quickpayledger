import { NavLink, Outlet } from 'react-router-dom';
import { Package, FileText, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Layout() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-header text-header-foreground border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              <span className="font-semibold text-lg">InvoiceHub</span>
            </div>
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-header-foreground/80 hover:bg-header-foreground/10'
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="ml-2 text-header-foreground/80 hover:bg-header-foreground/10 hover:text-header-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
