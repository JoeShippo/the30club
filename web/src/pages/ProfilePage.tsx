import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/auth/AuthContext';
import { LogOut, User as UserIcon, Mail, Trash2, Shield, ChevronRight } from 'lucide-react';
import { PlantAvatar } from '@/components/PlantAvatar';
import { useNavigate } from 'react-router-dom';
import { deleteAccount } from '@/services/deleteAccountService';
import { optOut, optIn, trackEvent } from '@/services/analytics';

export function ProfilePage() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    localStorage.getItem('analytics_opt_out') !== 'true'
  );

  const handleToggleAnalytics = (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
    if (enabled) {
      localStorage.removeItem('analytics_opt_out');
      optIn();
      trackEvent('analytics_opted_in'); // ← Track opt-in
    } else {
      trackEvent('analytics_opted_out'); // ← Track opt-out (will be last event)
      localStorage.setItem('analytics_opt_out', 'true');
      optOut();
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser || deleteConfirmText !== 'DELETE') return;

    setDeleting(true);
    try {
      trackEvent('account_deleted'); // ← Track before deletion
      await deleteAccount(currentUser.id);
      navigate('/login');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert('For security, please sign out and sign back in before deleting your account.');
      } else {
        alert('Failed to delete account. Please try again.');
        console.error(error);
      }
      setDeleting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <Layout>
      <div className="mx-auto max-w-2xl p-6 space-y-6">

        {/* Header */}
        <h1 className="text-2xl font-bold text-center">Profile</h1>

        {/* User card */}
        <div className="card bg-base-100 shadow">
          <div className="card-body items-center text-center space-y-4">
            <PlantAvatar
              avatarId={currentUser.avatarId}
              photoURL={currentUser.photoURL}
              displayName={currentUser.displayName}
              size="xl"
            />

            <h2 className="text-xl font-semibold">
              {currentUser.displayName || 'Anonymous User'}
            </h2>

            <div className="flex items-center gap-2 text-sm opacity-70">
              <Mail className="h-4 w-4" />
              {currentUser.email}
            </div>

            <div className="text-sm opacity-50">
              Member since {currentUser.createdAt.toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="btn btn-outline w-full gap-2"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>

        {/* Privacy & Data */}
        <div className="card bg-base-100 shadow">
          <div className="card-body gap-3">
            <button
              onClick={() => setShowPrivacy(!showPrivacy)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2 font-medium">
                <Shield className="h-5 w-5 text-primary" />
                Privacy & Your Data
              </div>
              <ChevronRight className={`h-4 w-4 opacity-50 transition-transform ${showPrivacy ? 'rotate-90' : ''}`} />
            </button>

            {showPrivacy && (
              <>
                <div className="text-sm opacity-70 space-y-2 pt-2 border-t">
                  <p>
                    <strong>What we store:</strong> Your email, display name, plant logs,
                    weekly scores and any leagues or challenges you participate in.
                  </p>
                  <p>
                    <strong>What we don't do:</strong> We never sell your data, use it
                    for advertising, or share it with third parties.
                  </p>
                  <p>
                    <strong>Your rights:</strong> Under GDPR you have the right to access,
                    correct and delete your data at any time. Use the button below to
                    permanently delete your account and all associated data.
                  </p>
                  <p>
                    <strong>Data location:</strong> Your data is stored in Google Firebase
                    (EU region).
                  </p>
                </div>
                
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => handleToggleAnalytics(e.target.checked)}
                      className="checkbox checkbox-primary"
                    />
                    <div>
                      <span className="label-text font-medium">Usage Analytics</span>
                      <p className="text-xs opacity-60 mt-0.5">
                        Help us improve by sharing anonymous usage data
                      </p>
                    </div>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="card border-2 border-error/30 bg-base-100">
          <div className="card-body gap-4">
            <h3 className="font-semibold text-error flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </h3>

            {!showDeleteConfirm ? (
              <div className="space-y-2">
                <p className="text-sm opacity-70">
                  Permanently delete your account and all your data.
                  This cannot be undone.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-error btn-outline btn-sm gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete My Account
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="alert alert-error text-sm">
                  This will permanently delete all your plant logs, stats,
                  league memberships and your account. This <strong>cannot</strong> be undone.
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Type <strong>DELETE</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value.toUpperCase())}
                    placeholder="DELETE"
                    className="input input-bordered input-error w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || deleting}
                    className="btn btn-error flex-1 gap-2"
                  >
                    {deleting && <span className="loading loading-spinner loading-sm" />}
                    {deleting ? 'Deleting...' : 'Delete Everything'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* App info */}
        <div className="text-center text-sm opacity-40 space-y-1 pt-2">
          <p>The 30 Club v1.0.0</p>
          <p>Made with 🌱 for plant diversity</p>
        </div>

      </div>
    </Layout>
  );
}