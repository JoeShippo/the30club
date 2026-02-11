import { ReactNode } from 'react';
import { Crown, Lock } from 'lucide-react';
import { hasProAccess } from '@/config/features';
import { useAuth } from '@/auth/AuthContext';

interface ProFeatureGateProps {
  children: ReactNode;
  feature: 'leagues' | 'challenges';
  fallback?: ReactNode;
}

export function ProFeatureGate({ children, feature, fallback }: ProFeatureGateProps) {
  const { currentUser } = useAuth();
  
  const hasPro = hasProAccess(currentUser?.id, currentUser?.hasPro);

  if (hasPro) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked state
  return (
    <div className="card bg-base-200 border-2 border-warning/30">
      <div className="card-body items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Crown className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-2">
            Pro Feature
          </h3>
          <p className="opacity-70">
            {feature === 'leagues' && 'Create and join private leagues with friends.'}
            {feature === 'challenges' && 'Challenge friends to 1v1 plant battles.'}
          </p>
        </div>

        <div className="badge badge-warning gap-2">
          <Lock className="w-3 h-3" />
          Coming Soon
        </div>

        <p className="text-sm opacity-50">
          We're perfecting this feature before launch. Stay tuned!
        </p>
      </div>
    </div>
  );
}