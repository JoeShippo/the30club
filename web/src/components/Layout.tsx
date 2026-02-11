import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, PlusCircle, BarChart3, Users, Swords } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { FEATURES, PRO_FEATURES } from '@/config/features';
import { ProBadge } from './ProBadge';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home', isPro: false },
    { path: '/add', icon: PlusCircle, label: 'Add', isPro: false },
    { path: '/stats', icon: BarChart3, label: 'Stats', isPro: false },
    ...(FEATURES.LEAGUES ? [{ 
      path: '/leagues', 
      icon: Users, 
      label: 'Social',
      isPro: PRO_FEATURES.LEAGUES 
    }] : []),
    { path: '/profile', icon: User, label: 'Profile', isPro: false },
  ];

  return (
    <div className="min-h-screen flex bg-base-100">
      
      <Sidebar />

      <div className="flex-1 flex flex-col lg:pl-64">
        <main className="flex-1 pb-20 lg:pb-6">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 safe-area-inset-bottom z-40">
          <div className="flex justify-around items-center h-16">
            {navItems.map(({ path, icon: Icon, label, isPro }) => {
              const isActive = location.pathname === path || 
                              (path !== '/' && location.pathname.startsWith(path));
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                    isActive ? 'text-primary' : 'text-base-content/60'
                  }`}
                >
                  {isPro && (
                    <div className="absolute top-1 right-1/4">
                      <ProBadge size="sm" />
                    </div>
                  )}
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}