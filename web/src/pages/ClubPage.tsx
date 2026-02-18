import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Users, Swords, Trophy, UserPlus, Search, Share2, Clock, Check, X } from 'lucide-react';
import { searchUsers, getTopUsers, generateInviteLink } from '@/services/userSearchService';
import { UserCard } from '@/components/UserCard';
import { useAuth } from '@/auth/AuthContext';
import { getUserChallenges, getPendingChallenges, acceptChallenge, declineChallenge } from '@/services/challengeService';
import { getUserById } from '@/services/userService';
import { ChallengeCard } from '@/components/ChallengeCard';
import { ProFeatureGate } from '@/components/ProFeatureGate';
import { createChallenge } from '@/services/challengeService';
import { hasProAccess } from '@/config/features';
import { ChallengeStatus } from '@30plants/core';
import { getWeekId } from '@30plants/core';
import { PlantAvatar } from '@/components/PlantAvatar';
import { getWeeklySummaries } from '@/services/weeklySummaryService';



type Tab = 'friends' | 'challenges' | 'leagues' | 'leaderboard';

export function ClubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard');


  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">The Club</h1>
          <p className="text-base-content/60">
            Connect with friends and compete together
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`tab gap-2 ${activeTab === 'leaderboard' ? 'tab-active' : ''}`}
          >
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('friends')}
            className={`tab gap-2 ${activeTab === 'friends' ? 'tab-active' : ''}`}
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Find Friends</span>
          </button>
          
          <button
            onClick={() => setActiveTab('challenges')}
            className={`tab gap-2 ${activeTab === 'challenges' ? 'tab-active' : ''}`}
          >
            <Swords className="h-4 w-4" />
            <span className="hidden sm:inline">Challenges</span>
            <div className="badge badge-primary badge-sm">PRO</div>
          </button>
          
          <button
            onClick={() => setActiveTab('leagues')}
            className={`tab gap-2 ${activeTab === 'leagues' ? 'tab-active' : ''}`}
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Leagues</span>
            <div className="badge badge-primary badge-sm">PRO</div>
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'friends' && <FindFriendsTab />}
          {activeTab === 'challenges' && <ChallengesTab />}
          {activeTab === 'leagues' && <LeaguesTab />}
        </div>

      </div>
    </Layout>
  );
}



function LeaderboardTab() {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentWeekId = getWeekId(new Date());

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Get all weekly summaries for current week
      const summaries = await getWeeklySummaries(currentWeekId);
      
      // Sort by score
      const sorted = summaries.sort((a, b) => b.score - a.score);
      
      // Get top 50 (or all if less)
      const top = sorted.slice(0, 50);
      
      // Load user details
      const entries = await Promise.all(
        top.map(async (summary, index) => {
          const user = await getUserById(summary.userId);
          return {
            rank: index + 1,
            userId: summary.userId,
            displayName: user?.displayName || 'Anonymous',
            avatarId: user?.avatarId,
            photoURL: user?.photoURL,
            score: summary.score,
            isCurrentUser: summary.userId === currentUser?.id,
          };
        })
      );

      setLeaderboard(entries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  // Show message if less than 10 users
  if (leaderboard.length < 10) {
    return (
      <div className="card bg-base-200">
        <div className="card-body text-center space-y-4">
          <Trophy className="h-16 w-16 mx-auto text-warning opacity-50" />
          <div>
            <h3 className="font-bold text-lg mb-2">Not Enough Players Yet</h3>
            <p className="opacity-70">
              Only {leaderboard.length} {leaderboard.length === 1 ? 'player has' : 'players have'} logged plants this week.
            </p>
            <p className="text-sm opacity-60 mt-2">
              The leaderboard will appear when 10 or more players join!
            </p>
          </div>
          
          {/* Show current user's rank if they're one of the few */}
          {leaderboard.find(e => e.isCurrentUser) && (
            <div className="card bg-primary/10 border border-primary">
              <div className="card-body p-4">
                <div className="text-sm opacity-70 mb-1">Your Score This Week</div>
                <div className="text-3xl font-bold text-primary">
                  {leaderboard.find(e => e.isCurrentUser)?.score || 0}
                </div>
              </div>
            </div>
          )}

          {/* Invite Friends CTA */}
          <button
            onClick={() => {
              // Switch to Find Friends tab
              const tabButtons = document.querySelectorAll('.tabs .tab');
              (tabButtons[1] as HTMLElement)?.click(); // Click Find Friends tab
            }}
            className="btn btn-primary gap-2"
          >
            <Share2 className="h-4 w-4" />
            Invite Friends to Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">This Week's Leaders</h3>
        <div className="text-sm opacity-60">{leaderboard.length} players</div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 mb-6">
          
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-8">
            <div className="relative">
              <PlantAvatar
                avatarId={leaderboard[1].avatarId}
                photoURL={leaderboard[1].photoURL}
                displayName={leaderboard[1].displayName}
                size="md"
              />
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300 flex items-center justify-center text-xs font-bold">
                2
              </div>
            </div>
            <div className="text-sm font-medium mt-2 truncate w-full text-center">
              {leaderboard[1].displayName}
            </div>
            <div className="text-lg font-bold text-primary">{leaderboard[1].score}</div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <PlantAvatar
                avatarId={leaderboard[0].avatarId}
                photoURL={leaderboard[0].photoURL}
                displayName={leaderboard[0].displayName}
                size="lg"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-warning flex items-center justify-center">
                <Trophy className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-sm font-bold mt-2 truncate w-full text-center">
              {leaderboard[0].displayName}
            </div>
            <div className="text-2xl font-bold text-warning">{leaderboard[0].score}</div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-8">
            <div className="relative">
              <PlantAvatar
                avatarId={leaderboard[2].avatarId}
                photoURL={leaderboard[2].photoURL}
                displayName={leaderboard[2].displayName}
                size="md"
              />
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-300 flex items-center justify-center text-xs font-bold">
                3
              </div>
            </div>
            <div className="text-sm font-medium mt-2 truncate w-full text-center">
              {leaderboard[2].displayName}
            </div>
            <div className="text-lg font-bold text-primary">{leaderboard[2].score}</div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="space-y-1">
        {leaderboard.map((entry) => (
          <div
            key={entry.userId}
            className={`
              card card-compact border transition
              ${entry.isCurrentUser 
                ? 'border-primary bg-primary/5' 
                : 'border-base-300 bg-base-100'
              }
            `}
          >
            <div className="card-body flex-row items-center gap-4 p-3">
              
              {/* Rank */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0
                ${entry.rank <= 3 ? 'bg-warning text-white' : 'bg-base-200'}
              `}>
                {entry.rank}
              </div>

              {/* Avatar */}
              <PlantAvatar
                avatarId={entry.avatarId}
                photoURL={entry.photoURL}
                displayName={entry.displayName}
                size="sm"
              />

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {entry.displayName}
                  {entry.isCurrentUser && (
                    <span className="text-xs text-primary ml-2">(You)</span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="text-xl font-bold text-primary shrink-0">
                {entry.score}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



function FindFriendsTab() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [challenging, setChallenging] = useState<string | null>(null);
  const [userChallenges, setUserChallenges] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    loadTopUsers();
    loadUserChallenges();
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        setLoading(true);
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
        setLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const loadTopUsers = async () => {
    const users = await getTopUsers(10);
    setTopUsers(users);
  };

  const loadUserChallenges = async () => {
    if (!currentUser) return;
    
    const challenges = await getUserChallenges(currentUser.id);
    const challengeMap = new Map();
    
    // Map challenges by opponent ID
    challenges.forEach(challenge => {
      const opponentId = challenge.challengerId === currentUser.id 
        ? challenge.opponentId 
        : challenge.challengerId;
      
      // Only store active or pending challenges
      if (challenge.status === ChallengeStatus.PENDING || challenge.status === ChallengeStatus.ACTIVE) {
        challengeMap.set(opponentId, challenge);
      }
    });
    
    setUserChallenges(challengeMap);
  };

  const handleShareInvite = async () => {
    if (!currentUser) return;

    const inviteLink = generateInviteLink(currentUser.id, currentUser.displayName || '');
    const text = `Join me on The 30 Club! Track your plant diversity and hit 30 different plants per week.\n\n${inviteLink}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      setInviteLinkCopied(true);
      setTimeout(() => setInviteLinkCopied(false), 2000);
    }
  };

  const handleChallenge = async (userId: string, displayName: string) => {
    if (!currentUser) return;

    if (!hasProAccess(currentUser.id, currentUser.hasPro)) {
      alert('Challenges are a Pro feature. Upgrade to challenge friends!');
      return;
    }

    setChallenging(userId);
    try {
      await createChallenge(currentUser.id, userId);
      alert(`Challenge sent to ${displayName}!`);
      await loadUserChallenges(); // Reload to update button states
    } catch (error: any) {
      alert(error.message || 'Failed to create challenge');
    } finally {
      setChallenging(null);
    }
  };

  const getChallengeButton = (userId: string, displayName: string) => {
    if (currentUser?.id === userId) return null;

    const existingChallenge = userChallenges.get(userId);

    if (existingChallenge) {
      const isChallenger = existingChallenge.challengerId === currentUser?.id;
      
      if (existingChallenge.status === ChallengeStatus.PENDING) {
        return (
          <button className="btn btn-sm btn-outline gap-2" disabled>
            <Clock className="h-4 w-4" />
            {isChallenger ? 'Pending' : 'Respond'}
          </button>
        );
      }
      
      if (existingChallenge.status === ChallengeStatus.ACTIVE) {
        return (
          <button className="btn btn-sm btn-success gap-2" disabled>
            <Check className="h-4 w-4" />
            Active
          </button>
        );
      }
    }

    return (
      <button
        onClick={() => handleChallenge(userId, displayName)}
        disabled={challenging === userId}
        className="btn btn-sm btn-primary gap-2"
      >
        {challenging === userId ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Challenge
          </>
        )}
      </button>
    );
  };

  const displayUsers = searchQuery.trim() ? searchResults : topUsers;

  return (
    <div className="space-y-6">
      
      {/* Invite Friends Card */}
      <div className="card bg-gradient-to-r from-primary to-success text-white">
        <div className="card-body">
          <h3 className="font-bold text-lg">Invite Friends</h3>
          <p className="text-sm opacity-90">
            Share your invite link and compete together!
          </p>
          <button
            onClick={handleShareInvite}
            className="btn btn-white gap-2 mt-2"
          >
            {inviteLinkCopied ? (
              <>✓ Link Copied!</>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share Invite Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50" />
        <input
          type="text"
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full pl-10"
        />
      </div>

      {/* Results */}
      <div>
        <h3 className="font-semibold mb-3">
          {searchQuery.trim() ? 'Search Results' : 'Top Users This Week'}
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="card bg-base-200">
            <div className="card-body text-center opacity-70">
              {searchQuery.trim() ? 'No users found' : 'No users yet'}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {displayUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                action={getChallengeButton(user.id, user.displayName || 'User')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



function ChallengesTab() {
  const { currentUser } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    loadChallenges();
  }, [currentUser]);

  const loadChallenges = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const allChallenges = await getUserChallenges(currentUser.id);

      // Load user details
      const userIds = new Set<string>();
      allChallenges.forEach(challenge => {
        userIds.add(challenge.challengerId);
        userIds.add(challenge.opponentId);
      });

      const cache = new Map(userCache);
      for (const userId of userIds) {
        if (!cache.has(userId)) {
          const user = await getUserById(userId);
          if (user) cache.set(userId, user);
        }
      }

      setUserCache(cache);
      setChallenges(allChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (challengeId: string) => {
    try {
      await acceptChallenge(challengeId);
      await loadChallenges();
    } catch (error) {
      alert('Failed to accept challenge');
    }
  };

  const handleDecline = async (challengeId: string) => {
    try {
      await declineChallenge(challengeId);
      await loadChallenges();
    } catch (error) {
      alert('Failed to decline challenge');
    }
  };

  // Group challenges by status
  const pendingChallenges = challenges.filter(
    c => c.status === ChallengeStatus.PENDING && c.opponentId === currentUser?.id
  );
  const sentChallenges = challenges.filter(
    c => c.status === ChallengeStatus.PENDING && c.challengerId === currentUser?.id
  );
  const activeChallenges = challenges.filter(c => c.status === ChallengeStatus.ACTIVE);
  const completedChallenges = challenges.filter(c => c.status === ChallengeStatus.COMPLETED);
  const declinedChallenges = challenges.filter(c => c.status === ChallengeStatus.DECLINED);

  return (
    <ProFeatureGate feature="challenges">
      <div className="space-y-4">
        
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="card bg-base-200">
            <div className="card-body text-center">
              <Swords className="h-12 w-12 mx-auto text-primary opacity-50 mb-2" />
              <p className="opacity-70">No challenges yet</p>
              <p className="text-sm opacity-50">
                Go to Find Friends and challenge someone!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Pending (Received) */}
            {pendingChallenges.length > 0 && (
              <div className="collapse collapse-arrow bg-warning/10 border border-warning">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" />
                  Pending Challenges ({pendingChallenges.length})
                </div>
                <div className="collapse-content space-y-3 pt-3">
                  {pendingChallenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      currentUserId={currentUser!.id}
                      challengerUser={userCache.get(challenge.challengerId)}
                      opponentUser={userCache.get(challenge.opponentId)}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sent (Waiting for Response) */}
            {sentChallenges.length > 0 && (
              <div className="collapse collapse-arrow bg-info/10 border border-info">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-info" />
                  Sent Challenges ({sentChallenges.length})
                </div>
                <div className="collapse-content space-y-3 pt-3">
                  {sentChallenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      currentUserId={currentUser!.id}
                      challengerUser={userCache.get(challenge.challengerId)}
                      opponentUser={userCache.get(challenge.opponentId)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Active */}
            {activeChallenges.length > 0 && (
              <div className="collapse collapse-arrow bg-success/10 border border-success">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title font-semibold flex items-center gap-2">
                  <Swords className="h-5 w-5 text-success" />
                  Active Challenges ({activeChallenges.length})
                </div>
                <div className="collapse-content space-y-3 pt-3">
                  {activeChallenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      currentUserId={currentUser!.id}
                      challengerUser={userCache.get(challenge.challengerId)}
                      opponentUser={userCache.get(challenge.opponentId)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedChallenges.length > 0 && (
              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-semibold flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Completed ({completedChallenges.length})
                </div>
                <div className="collapse-content space-y-3 pt-3">
                  {completedChallenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      currentUserId={currentUser!.id}
                      challengerUser={userCache.get(challenge.challengerId)}
                      opponentUser={userCache.get(challenge.opponentId)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Declined */}
            {declinedChallenges.length > 0 && (
              <div className="collapse collapse-arrow bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title font-semibold flex items-center gap-2">
                  <X className="h-5 w-5" />
                  Declined ({declinedChallenges.length})
                </div>
                <div className="collapse-content space-y-3 pt-3">
                  {declinedChallenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      currentUserId={currentUser!.id}
                      challengerUser={userCache.get(challenge.challengerId)}
                      opponentUser={userCache.get(challenge.opponentId)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ProFeatureGate>
  );
}

function LeaguesTab() {
  return (
    <ProFeatureGate feature="leagues">
      <div className="space-y-4">
        
        {/* Coming Soon Card */}
        <div className="card bg-gradient-to-r from-primary to-success text-white">
          <div className="card-body text-center">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h3 className="font-bold text-xl mb-2">Private Leagues</h3>
            <p className="opacity-90 mb-4">
              Create custom groups with friends, family, or colleagues and compete together!
            </p>
            <div className="badge badge-lg bg-white text-primary">
              Coming Soon
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h4 className="font-semibold mb-3">What's Coming:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="text-success mt-0.5">✓</div>
                <span>Create private leagues with custom names</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-success mt-0.5">✓</div>
                <span>Invite friends via unique league codes</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-success mt-0.5">✓</div>
                <span>Weekly leaderboards within your league</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-success mt-0.5">✓</div>
                <span>League chat and shared achievements</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-success mt-0.5">✓</div>
                <span>Join up to 10 leagues simultaneously</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Notify Me */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body text-center">
            <p className="text-sm opacity-70 mb-3">
              Want early access when leagues launch?
            </p>
            <button className="btn btn-primary btn-sm">
              Notify Me When Available
            </button>
          </div>
        </div>

      </div>
    </ProFeatureGate>
  );
}