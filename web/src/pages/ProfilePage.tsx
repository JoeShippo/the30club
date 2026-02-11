import { Layout } from '@/components/Layout';
import { useAuth } from '@/auth/AuthContext';
import { LogOut, User as UserIcon, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
      navigate('/login');
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl p-6 space-y-6">

        {/* Header */}
        <h1 className="text-2xl font-bold text-center">
          Profile
        </h1>

        {/* User card */}
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center space-y-4">

            {/* Avatar */}
            <div className="avatar placeholder">
              <div className="bg-primary/20 text-primary rounded-full w-24">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                  />
                ) : (
                  <UserIcon className="h-12 w-12" />
                )}
              </div>
            </div>

            {/* Name */}
            <h2 className="text-xl font-semibold">
              {currentUser.displayName || 'Anonymous User'}
            </h2>

            {/* Email */}
            <div className="flex items-center gap-2 text-sm opacity-70">
              <Mail className="h-4 w-4" />
              {currentUser.email}
            </div>

            {/* Member since */}
            <div className="text-sm opacity-50">
              Member since {currentUser.createdAt.toLocaleDateString()}
            </div>

          </div>
        </div>

        {/* Actions */}
        <div>
          <button
            onClick={handleSignOut}
            className="btn btn-error w-full gap-2"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>

        {/* App info */}
        <div className="text-center text-sm opacity-50 space-y-1 pt-4">
          <p>30 Plants v1.0.0</p>
          <p>Track your plant diversity journey</p>
        </div>

      </div>
    </Layout>
  );
}
