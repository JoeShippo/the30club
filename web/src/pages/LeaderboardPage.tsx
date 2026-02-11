import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import {
  getWeeklyLeaderboard,
  getAllTimeLeaderboard,
} from '@/services/weeklySummaryService';
import { LeaderboardEntry } from '@core/types';
import { getWeekId, getWeekDates } from '@core/scoring';
import {
  Trophy,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format, subWeeks } from 'date-fns';

export function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'alltime'>('weekly');
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

  useEffect(() => {
    loadLeaderboards();
  }, [selectedWeekOffset]);

  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      const targetDate = subWeeks(new Date(), Math.abs(selectedWeekOffset));
      const weekId = getWeekId(targetDate);

      const [weekly, allTime] = await Promise.all([
        getWeeklyLeaderboard(weekId, 50),
        getAllTimeLeaderboard(50),
      ]);

      setWeeklyLeaderboard(weekly);
      setAllTimeLeaderboard(allTime);
    } finally {
      setLoading(false);
    }
  };

  const currentLeaderboard =
    activeTab === 'weekly' ? weeklyLeaderboard : allTimeLeaderboard;

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getWeekLabel = () => {
    const targetDate = subWeeks(new Date(), Math.abs(selectedWeekOffset));
    const { startDate } = getWeekDates(getWeekId(targetDate));

    if (selectedWeekOffset === 0) return 'This Week';
    if (selectedWeekOffset === -1) return 'Last Week';
    return `Week of ${format(startDate, 'MMM d')}`;
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-4">

        {/* Header */}
        <div className="p-6 flex items-center gap-3">
          <Trophy className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-bordered px-4">
          <button
            className={`tab ${activeTab === 'weekly' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            Weekly
          </button>
          <button
            className={`tab ${activeTab === 'alltime' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('alltime')}
          >
            All Time
          </button>
        </div>

        {/* Week selector */}
        {activeTab === 'weekly' && (
          <div className="flex items-center justify-between px-4 py-2">
            <button
              className="btn btn-ghost btn-circle"
              onClick={() => setSelectedWeekOffset(selectedWeekOffset - 1)}
              disabled={selectedWeekOffset <= -12}
            >
              <ChevronLeft />
            </button>

            <div className="text-center">
              <div className="font-medium">{getWeekLabel()}</div>
              <div className="text-sm opacity-60">
                {format(
                  subWeeks(new Date(), Math.abs(selectedWeekOffset)),
                  'MMM d, yyyy'
                )}
              </div>
            </div>

            <button
              className="btn btn-ghost btn-circle"
              onClick={() => setSelectedWeekOffset(selectedWeekOffset + 1)}
              disabled={selectedWeekOffset >= 0}
            >
              <ChevronRight />
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : currentLeaderboard.length === 0 ? (
          <div className="card bg-base-200 mx-4">
            <div className="card-body text-center space-y-2">
              <TrendingUp className="h-10 w-10 mx-auto opacity-40" />
              <p className="font-medium">No entries yet</p>
              <p className="text-sm opacity-70">
                Be the first to log some plants 🌱
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4 space-y-2">
            {currentLeaderboard.map(entry => (
              <div
                key={entry.userId}
                className="card card-compact bg-base-100 shadow"
              >
                <div className="card-body flex-row items-center gap-4">

                  {/* Rank */}
                  <div className="w-12 text-center font-bold opacity-70">
                    {entry.rank ? getMedal(entry.rank) : '-'}
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
                    <div className="font-medium">
                      {entry.displayName || 'Anonymous'}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {entry.score}
                    </div>
                    <div className="text-xs opacity-60">
                      {activeTab === 'weekly' ? 'plants' : 'total'}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
