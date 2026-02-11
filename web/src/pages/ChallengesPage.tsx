import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Layout } from '@/components/Layout';
import { Swords, Clock, Trophy, X, Check } from 'lucide-react';
import { Challenge } from '@core/types';
import {
  getUserChallenges,
  acceptChallenge,
  declineChallenge,
  updateChallengeScores,
} from '@/services/challengeService';
import { format } from 'date-fns';

export function ChallengesPage() {
  const { currentUser } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    loadChallenges();
  }, [currentUser]);

  const loadChallenges = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const userChallenges = await getUserChallenges(currentUser.id);

      const updated = await Promise.all(
        userChallenges.map(async c =>
          c.status === 'accepted' ? updateChallengeScores(c.id) : c
        )
      );

      setChallenges(updated);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    await acceptChallenge(id);
    await loadChallenges();
  };

  const handleDecline = async (id: string) => {
    await declineChallenge(id);
    await loadChallenges();
  };

  const activeChallenges = challenges.filter(
    c => c.status === 'pending' || c.status === 'accepted'
  );

  const completedChallenges = challenges.filter(
    c => c.status === 'completed' || c.status === 'declined'
  );

  const list = activeTab === 'active' ? activeChallenges : completedChallenges;

  const getStatus = (challenge: Challenge) => {
    if (!currentUser) return null;

    const isChallenger = challenge.challengerId === currentUser.id;
    const isOpponent = challenge.opponentId === currentUser.id;

    if (challenge.status === 'pending') {
      return isOpponent ? 'pending_response' : 'pending_acceptance';
    }

    if (challenge.status === 'accepted') {
      const lead = challenge.challengerScore - challenge.opponentScore;
      if (lead === 0) return 'tied';
      if ((isChallenger && lead > 0) || (isOpponent && lead < 0)) return 'winning';
      return 'losing';
    }

    if (challenge.status === 'completed') {
      if (challenge.winnerId === currentUser.id) return 'won';
      if (challenge.winnerId === null) return 'tied';
      return 'lost';
    }

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

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="p-6 flex items-center gap-3">
          <Swords className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">My Challenges</h1>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-bordered px-4">
          <button
            className={`tab ${activeTab === 'active' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active ({activeChallenges.length})
          </button>
          <button
            className={`tab ${activeTab === 'completed' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed ({completedChallenges.length})
          </button>
        </div>

        {/* List */}
        <div className="p-4 space-y-4">
          {list.length === 0 ? (
            <div className="card bg-base-200">
              <div className="card-body text-center space-y-2">
                <Swords className="h-10 w-10 mx-auto opacity-40" />
                <p className="font-medium">
                  {activeTab === 'active'
                    ? 'No active challenges'
                    : 'No completed challenges'}
                </p>
                <p className="text-sm opacity-70">
                  {activeTab === 'active'
                    ? 'Challenge someone from your league'
                    : 'Your past challenges will appear here'}
                </p>
              </div>
            </div>
          ) : (
            list.map(challenge => {
              const isChallenger = challenge.challengerId === currentUser?.id;
              const opponent = isChallenger
                ? { name: challenge.opponentName, photo: challenge.opponentPhoto }
                : { name: challenge.challengerName, photo: challenge.challengerPhoto };

              const myScore = isChallenger
                ? challenge.challengerScore
                : challenge.opponentScore;

              const theirScore = isChallenger
                ? challenge.opponentScore
                : challenge.challengerScore;

              const status = getStatus(challenge);

              return (
                <div key={challenge.id} className="card bg-base-100 shadow">
                  <div className="card-body space-y-4">

                    {/* Opponent */}
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary/20 text-primary rounded-full w-12">
                          {opponent.photo ? (
                            <img src={opponent.photo} alt={opponent.name} />
                          ) : (
                            <span className="font-semibold">
                              {opponent.name[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="font-medium">vs {opponent.name}</div>
                        <div className="text-sm opacity-60">
                          Week of {format(new Date(challenge.weekId + '-1'), 'MMM d')}
                        </div>
                      </div>

                      {challenge.status === 'completed' &&
                        challenge.winnerId === currentUser?.id && (
                          <Trophy className="h-6 w-6 text-warning" />
                        )}
                    </div>

                    {/* Scores */}
                    {challenge.status !== 'pending' &&
                      challenge.status !== 'declined' && (
                        <div className="stats stats-horizontal bg-base-200">
                          <div className="stat text-center">
                            <div className="stat-value text-primary">{myScore}</div>
                            <div className="stat-title">You</div>
                          </div>
                          <div className="stat text-center">
                            <div className="stat-value">{theirScore}</div>
                            <div className="stat-title">{opponent.name}</div>
                          </div>
                        </div>
                      )}

                    {/* Actions / Status */}
                    {status === 'pending_response' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(challenge.id)}
                          className="btn btn-success flex-1"
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(challenge.id)}
                          className="btn btn-error flex-1"
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </button>
                      </div>
                    )}

                    {status === 'pending_acceptance' && (
                      <div className="alert">
                        <Clock className="h-4 w-4" />
                        Waiting for response…
                      </div>
                    )}

                    {status === 'winning' && (
                      <div className="alert alert-success">
                        🎯 You’re winning!
                      </div>
                    )}

                    {status === 'losing' && (
                      <div className="alert alert-warning">
                        Keep going!
                      </div>
                    )}

                    {status === 'tied' && (
                      <div className="alert">
                        It’s a tie
                      </div>
                    )}

                    {status === 'won' && (
                      <div className="alert alert-success">
                        🏆 You won!
                      </div>
                    )}

                    {status === 'lost' && (
                      <div className="alert alert-error">
                        Better luck next time
                      </div>
                    )}

                    {challenge.status === 'declined' && (
                      <div className="alert">
                        Declined
                      </div>
                    )}

                    {/* Time */}
                    {challenge.status === 'accepted' && (
                      <div className="text-sm opacity-60 text-center pt-2 border-t">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Ends {format(challenge.expiresAt, 'MMM d, h:mm a')}
                      </div>
                    )}

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
