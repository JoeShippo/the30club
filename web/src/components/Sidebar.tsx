import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart3, User, Users, Swords, Leaf } from 'lucide-react';
import { FEATURES, PRO_FEATURES } from '@/config/features';
import { ProBadge } from './ProBadge';

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home', isPro: false },
    { path: '/add', icon: PlusCircle, label: 'Add Plant', isPro: false },
    { path: '/stats', icon: BarChart3, label: 'Stats', isPro: false },
    ...(FEATURES.LEAGUES ? [{ 
      path: '/leagues', 
      icon: Users, 
      label: 'Leagues',
      isPro: PRO_FEATURES.LEAGUES 
    }] : []),
    ...(FEATURES.CHALLENGES ? [{ 
      path: '/challenges', 
      icon: Swords, 
      label: 'Challenges',
      isPro: PRO_FEATURES.CHALLENGES 
    }] : []),
    { path: '/profile', icon: User, label: 'Profile', isPro: false },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-base-300 lg:bg-base-100">
      
      {/* Logo */}
      <div className="p-6 border-b border-base-300">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg">The 30 Club</div>
            <div className="text-xs opacity-60">Plant diversity tracker</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label, isPro }) => {
          const isActive = location.pathname === path || 
                          (path !== '/' && location.pathname.startsWith(path));
          
          return (
            <Link
              key={path}
              to={path}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg
                transition-colors font-medium
                ${isActive
                  ? 'bg-primary text-white'
                  : 'hover:bg-base-200'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                <span>{label}</span>
              </div>
              {isPro && <ProBadge size="sm" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-base-300 text-xs opacity-50 text-center">
        The 30 Club v1.0.0
      </div>
    </aside>
  );
}