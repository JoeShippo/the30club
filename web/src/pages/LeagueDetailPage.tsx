import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Layout } from '@/components/Layout';
import { CreateChallengeModal } from '@/components/CreateChallengeModal';
import { ArrowLeft, Trophy, Swords, Copy, Check, Users } from 'lucide-react';
import { League, LeagueLeaderboardEntry } from '@core/types';
import { getLeagueById, getLeagueLeaderboard } from '@/services/leagueService';
import { createChallenge } from '@/services/challengeService';
import { getWeekId } from '@core/scoring';

export function LeagueDetailPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [league, setLeague] = useState<League | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeagueLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadLeagueData();
  }, [leagueId]);

  const loadLeagueData = async () => {
    if (!leagueId || !currentUser) return;

    setLoading(true);
    try {
      const leagueData = await getLeagueById(leagueId);
      setLeague(leagueData);

      if (leagueData) {
        const currentWeekId = getWeekId(new Date());
        const leaderboardData = await getLeagueLeaderboard(leagueId, currentWeekId);
        setLeaderboard(leaderboardData);
      }
    } catch (error) {
      console.error('Error loading league:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (opponentId: string) => {
    if (!currentUser) return;
    await createChallenge(currentUser.id, opponentId);
    setShowChallengeModal(false);
  };

  const handleCopyCode = () => {
    if (league) {
      navigator.clipboard.writeText(league.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
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

if (!league) {
  return (
    <Layout>
      <div className="flex justify-center py-20">
        <div className="card bg-base-200">
          <div className="card-body text-center">
            <p className="opacity-70">League not found</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

return (
  <Layout>
    <div className="mx-auto max-w-2xl space-y-4">

      {/* Header */}
      <div className="card bg-base-100 shadow">
        <div className="card-body space-y-3">

          <button
            onClick={() => navigate('/leagues')}
            className="btn btn-ghost btn-sm w-fit gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leagues
          </button>

          <div>
            <h1 className="text-2xl font-bold">{league.name}</h1>
            {league.description && (
              <p className="opacity-70 mt-1">{league.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm opacity-70">
              <Users className="h-4 w-4" />
              {league.memberIds.length} members
            </div>

            <button
              onClick={handleCopyCode}
              className="btn btn-outline btn-sm gap-2"
            >
              {copiedCode ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  {league.inviteCode}
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Challenge CTA */}
      <div className="px-4">
        <button
          onClick={() => setShowChallengeModal(true)}
          className="btn btn-primary w-full gap-2"
        >
          <Swords className="h-5 w-5" />
          Challenge a Member
        </button>
      </div>

      {/* Leaderboard */}
      <div className="px-4 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          This Week’s Leaderboard
        </h2>

        {leaderboard.length === 0 ? (
          <div className="card bg-base-200">
            <div className="card-body text-center space-y-1">
              <p className="opacity-70">No scores yet this week</p>
              <p className="text-sm opacity-50">
                Be the first to log some plants 🌱
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map(entry => {
              const medal = entry.rank ? getMedalEmoji(entry.rank) : null;
              const isCurrentUser = entry.userId === currentUser?.id;

              return (
                <div
                  key={entry.userId}
                  className={`
                    card card-compact shadow
                    ${isCurrentUser ? 'bg-primary/10 border border-primary' : 'bg-base-100'}
                  `}
                >
                  <div className="card-body flex-row items-center gap-4">

                    {/* Rank */}
                    <div className="w-10 text-center font-bold opacity-70">
                      {medal || `#${entry.rank}`}
                    </div>

                    {/* Avatar */}
                    <div className="avatar placeholder">
                      <div className="bg-primary/20 text-primary rounded-full w-12">
                        {entry.photoURL ? (
                          <img src={entry.photoURL} alt={entry.displayName || ''} />
                        ) : (
                          <span className="font-semibold">
                            {(entry.displayName || 'A')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {entry.displayName || 'Anonymous'}
                        {isCurrentUser && (
                          <span className="badge badge-primary badge-sm">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {entry.score}
                      </div>
                      <div className="text-xs opacity-60">plants</div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

    <CreateChallengeModal
      isOpen={showChallengeModal}
      onClose={() => setShowChallengeModal(false)}
      onCreateChallenge={handleCreateChallenge}
      currentUserId={currentUser?.id || ''}
      leagueMembers={league.memberIds}
    />
  </Layout>
);

}