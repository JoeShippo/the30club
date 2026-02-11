import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, PlusCircle, Users, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/add', icon: PlusCircle, label: 'Add' },
    { path: '/stats', icon: BarChart3, label: 'Stats' },
    { path: '/leagues', icon: Users, label: 'Social' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      {/* Main content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 safe-area-inset-bottom">
        <div className="flex h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive =
              location.pathname === path ||
              location.pathname.startsWith(path + '/');

            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex flex-1 flex-col items-center justify-center
                  transition-colors
                  ${isActive
                    ? 'text-primary'
                    : 'text-base-content/50'}
                `}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
