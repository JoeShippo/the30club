import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Layout } from '@/components/Layout';
import { CreateLeagueModal } from '@/components/CreateLeagueModal';
import { JoinLeagueModal } from '@/components/JoinLeagueModal';
import { Users, Plus, LogIn, Copy, Check } from 'lucide-react';
import { League } from '@core/types';
import { getUserLeagues, createLeague, joinLeagueByCode } from '@/services/leagueService';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Swords } from 'lucide-react';
import { ProFeatureGate } from '@/components/ProFeatureGate';


export function LeaguesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadLeagues();
  }, [currentUser]);

  const loadLeagues = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userLeagues = await getUserLeagues(currentUser.id);
      setLeagues(userLeagues);
    } catch (error) {
      console.error('Error loading leagues:', error);
    } finally {
      setLoading(false);
    }
  };

const handleCreateLeague = async (name: string, description: string) => {
  if (!currentUser) return;
  
  try {
    await createLeague(name, description, currentUser.id);
    await loadLeagues();
  } catch (error: any) {
    if (error.message.includes('too quickly')) {
      alert(error.message);
    } else {
      alert('Failed to create league. Please try again.');
    }
  }
};

  const handleJoinLeague = async (inviteCode: string) => {
    if (!currentUser) return;
    await joinLeagueByCode(inviteCode, currentUser.id);
    await loadLeagues();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      </Layout>
    );
  }

  return (
  <Layout>
    <div className="mx-auto max-w-2xl p-6 space-y-6">

      {/* Header */}
      <h1 className="text-2xl font-bold text-center">
        Social
      </h1>

      <ProFeatureGate feature="leagues">
        <Link
    to="/challenges"
    className="btn btn-outline w-full mb-6 flex items-center gap-2"
  >
    <Swords className="h-5 w-5" />
    My Challenges
  </Link>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary gap-2"
        >
          <Plus className="h-5 w-5" />
          Create League
        </button>

        <button
          onClick={() => setShowJoinModal(true)}
          className="btn btn-outline gap-2"
        >
          <LogIn className="h-5 w-5" />
          Join League
        </button>
      </div>

      {/* Leagues */}
      {leagues.length === 0 ? (
        <div className="card bg-base-200">
          <div className="card-body text-center space-y-2">
            <Users className="h-10 w-10 mx-auto opacity-40" />
            <p className="font-medium">
              You’re not in any leagues yet
            </p>
            <p className="text-sm opacity-70">
              Create your own or join one with an invite code
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {leagues.map(league => (
            <div
              key={league.id}
              onClick={() => navigate(`/leagues/${league.id}`)}
              className="card bg-base-100 shadow cursor-pointer hover:shadow-md transition"
            >
              <div className="card-body space-y-3">

                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {league.name}
                    </h3>
                    {league.description && (
                      <p className="text-sm opacity-70 mt-1">
                        {league.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-sm opacity-60">
                    <Users className="h-4 w-4" />
                    {league.memberIds.length}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-sm">
                    Invite code:{' '}
                    <span className="badge badge-outline font-mono">
                      {league.inviteCode}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(league.inviteCode);
                    }}
                    className="btn btn-ghost btn-circle btn-sm"
                  >
                    {copiedCode === league.inviteCode ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      </ProFeatureGate>
    </div>
    

    <CreateLeagueModal
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      onCreateLeague={handleCreateLeague}
    />

    <JoinLeagueModal
      isOpen={showJoinModal}
      onClose={() => setShowJoinModal(false)}
      onJoinLeague={handleJoinLeague}
    />

      

        
  </Layout >
);

}