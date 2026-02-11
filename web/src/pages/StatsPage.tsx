import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Layout } from '@/components/Layout';
import {
  getUserStats,
  getWeeklyProgressHistory,
} from '@/services/userStatsService';
import { UserStats, WeeklyProgress } from '@30plants/core';
import {
  Trophy,
  TrendingUp,
  Flame,
  Target,
  Award,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

export function StatsPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [progressHistory, setProgressHistory] = useState<WeeklyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [currentUser]);

  const loadStats = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const [userStats, history] = await Promise.all([
        getUserStats(currentUser.id),
        getWeeklyProgressHistory(currentUser.id, 12),
      ]);
      setStats(userStats);
      setProgressHistory(history);
    } finally {
      setLoading(false);
    }
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

  if (!stats) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="card bg-base-200">
            <div className="card-body text-center">
              <p className="opacity-70">
                No stats yet — start logging plants 🌱
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const maxScore = Math.max(...progressHistory.map(p => p.score), 30);

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6 pb-6">

        {/* Header */}
        <div className="px-6 pt-6">
          <h1 className="text-2xl font-bold">My Stats</h1>
        </div>

        {/* Key stats */}
        <div className="px-6">
          <div className="stats stats-vertical sm:stats-horizontal shadow bg-base-100">

            <div className="stat">
              <div className="stat-title flex items-center gap-2">
                <Flame className="h-4 w-4 text-warning" />
                Current Streak
              </div>
              <div className="stat-value">{stats.currentStreak}</div>
              <div className="stat-desc">weeks</div>
            </div>

            <div className="stat">
              <div className="stat-title flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />
                Best Week
              </div>
              <div className="stat-value">{stats.bestWeekScore}</div>
              <div className="stat-desc">plants</div>
            </div>

            <div className="stat">
              <div className="stat-title flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Total Unique
              </div>
              <div className="stat-value">{stats.totalUniquePlants}</div>
              <div className="stat-desc">all time</div>
            </div>

            <div className="stat">
              <div className="stat-title flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average
              </div>
              <div className="stat-value">{stats.averageWeeklyScore}</div>
              <div className="stat-desc">per week</div>
            </div>

          </div>
        </div>

        {/* Progress chart */}
        <div className="px-6 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            12-Week Progress
          </h2>

          <div className="card bg-base-100 shadow">
            <div className="card-body">

              <div className="flex items-end justify-between h-48 gap-1">
                {progressHistory.map(week => {
                  const height = (week.score / maxScore) * 100;
                  const metGoal = week.score >= 30;

                  return (
                    <div key={week.weekId} className="flex-1 flex flex-col items-center">
                      <div className="w-full h-40 flex items-end">
                        <div
                          className={`w-full rounded-t ${
                            metGoal ? 'bg-primary' : 'bg-primary/40'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="text-xs opacity-60 mt-2 -rotate-45 origin-top-left">
                        {format(week.startDate, 'M/d')}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t flex justify-between text-sm opacity-70">
                <span>Goal: 30 plants / week</span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary rounded" />
                  Met goal
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="px-6 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements ({stats.achievements.length})
          </h2>

          {stats.achievements.length === 0 ? (
            <div className="card bg-base-200">
              <div className="card-body text-center space-y-2">
                <Award className="h-10 w-10 mx-auto opacity-40" />
                <p className="opacity-70">No achievements yet</p>
                <p className="text-sm opacity-50">
                  Keep logging plants to unlock them
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {stats.achievements.map(a => (
                <div
                  key={a.id}
                  className="card card-compact bg-base-100 border border-primary/30"
                >
                  <div className="card-body">
                    <div className="text-4xl">{a.icon}</div>
                    <div className="font-semibold text-sm">{a.name}</div>
                    <div className="text-xs opacity-70">{a.description}</div>
                    <div className="text-xs opacity-50">
                      {format(a.unlockedAt, 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="px-6">
          <div className="card bg-base-200">
            <div className="card-body space-y-3">
              <h3 className="font-medium">Milestones</h3>

              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="opacity-70">Longest streak</span>
                  <span className="font-semibold">{stats.longestStreak} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Weeks active</span>
                  <span className="font-semibold">{stats.totalWeeksActive}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Total logs</span>
                  <span className="font-semibold">{stats.totalLogs}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
