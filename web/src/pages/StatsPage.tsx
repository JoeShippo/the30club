import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Layout } from '@/components/Layout';
import { SkeletonLoader } from '@/components/SkeletonLoader';

import {
  updateUserStats,
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
    //console.log('=== STATS DEBUG ===');
    //console.log('User ID:', currentUser.id);

    const stats = await updateUserStats(currentUser.id);
    //console.log('Stats result:', stats);

    const history = await getWeeklyProgressHistory(currentUser.id, 12);
    //console.log('History result:', history);

    setStats(stats);
    setProgressHistory(history);
  } catch (error) {
    console.error('=== STATS ERROR ===', error); // ← Make sure this is uncommented
    alert(`Error loading stats: ${error}`); // ← Add this to see the error
  } finally {
    setLoading(false);
  }
};

if (loading) {
  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-base-200 rounded w-32 animate-pulse" />
        
        <SkeletonLoader count={4} type="stat" />
        
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card bg-base-200 animate-pulse">
            <div className="card-body h-64" />
          </div>
          <div className="space-y-4">
            <SkeletonLoader count={3} type="card" />
          </div>
        </div>
      </div>
    </Layout>
  );
}

  if (!stats) {
    return (
      <Layout>
        <div className="flex justify-center py-20 px-6">
          <div className="card bg-base-200 w-full max-w-sm">
            <div className="card-body items-center text-center gap-3">
              <div className="text-5xl">🌱</div>
              <p className="font-medium">No stats yet</p>
              <p className="text-sm opacity-60">
                Start logging plants to see your progress here
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

const maxScore = Math.ceil(Math.max(...progressHistory.map(p => p.score), 30) / 5) * 5;


  // Safe date formatter - handles Firestore Timestamps and Date objects
const safeFormat = (date: any, formatStr: string): string => {
  if (!date) return '';
  try {
    const d = date?.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return '';
    return format(d, formatStr);
  } catch {
    return '';
  }
};

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
      <h1 className="text-2xl lg:text-3xl font-bold">My Stats</h1>

        {/* Key stats — 2x2 grid of stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 gap-1">
            <div className="flex items-center gap-2 text-sm opacity-60">
              <Flame className="h-4 w-4 text-warning" />
              Current Streak
            </div>
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs opacity-50">weeks</div>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 gap-1">
            <div className="flex items-center gap-2 text-sm opacity-60">
                <Trophy className="h-4 w-4 text-warning" />
                Best Week
              </div>
              <div className="text-3xl font-bold">{stats.bestWeekScore}</div>
              <div className="text-xs opacity-50">plants</div>
            </div>
          </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 gap-1">
            <div className="flex items-center gap-2 text-sm opacity-60">
                <Target className="h-4 w-4 text-primary" />
                Total Unique
              </div>
              <div className="text-3xl font-bold">{stats.totalUniquePlants}</div>
              <div className="text-xs opacity-50">all time</div>
            </div>
          </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body p-4 gap-1">
            <div className="flex items-center gap-2 text-sm opacity-60">
                <TrendingUp className="h-4 w-4 text-primary" />
                Average
              </div>
              <div className="text-3xl font-bold">{stats.averageWeeklyScore}</div>
              <div className="text-xs opacity-50">per week</div>
            </div>
          </div>

        </div>

 <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            12-Week Progress
          </h2>
          <div className="card bg-base-100 shadow">
            <div className="card-body">

              {progressHistory.length === 0 ? (
                <div className="text-center py-8 opacity-50">No history yet</div>
              ) : (
                <>
                  <div className="flex gap-2">

          {/* Y-axis */}
        <div className="flex flex-col justify-between text-right shrink-0 pb-5" style={{ height: '160px' }}>
{(() => {
  const roundedMax = Math.ceil(maxScore / 5) * 5;
  const steps = [roundedMax, roundedMax * 0.75, roundedMax * 0.5, roundedMax * 0.25, 0]
    .map(v => Math.round(v / 5) * 5);
  return steps.map((val, index) => (
    <span key={index} className="text-xs opacity-40 leading-none">{val}</span>
  ));
})()}
        </div>

          {/* Bars + X-axis */}
          <div className="flex-1 flex flex-col">

            {/* Bar area with baseline */}
            <div
              className="flex-1 flex items-end gap-1.5 border-b border-base-300"
              style={{ height: '140px' }}
            >
              {progressHistory.map(week => {
                const metGoal = week.score >= 30;
                const heightPct = week.score === 0
                  ? 1.5
                  : Math.max((week.score / maxScore) * 100, 3);

                return (
                  <div
                    key={week.weekId}
                    className="group relative flex-1 flex flex-col justify-end"
                    style={{ height: '100%' }}
                  >
                    {/* Tooltip */}
                    <div className="
                      absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      bg-base-300 text-base-content rounded-lg px-3 py-2
                      text-xs whitespace-nowrap shadow-lg
                      opacity-0 group-hover:opacity-100
                      pointer-events-none transition-opacity duration-150
                      z-10
                    ">
                      <div className="font-semibold mb-1">
                        {safeFormat(week.startDate, 'MMM d')} – {safeFormat(week.endDate, 'MMM d')}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span>🌿 <strong>{week.score}</strong> unique plants</span>
                        <span>📝 <strong>{week.totalLogs ?? '—'}</strong> total logs</span>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-base-300" />
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all duration-300 cursor-pointer ${
                        metGoal
                          ? 'bg-success hover:opacity-80'
                          : 'bg-primary hover:opacity-80'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex gap-1.5 pt-1">
              {progressHistory.map(week => (
                <div
                  key={week.weekId}
                  className="flex-1 text-center opacity-40"
                  style={{ fontSize: '10px' }}
                >
                  {safeFormat(week.startDate, 'M/d')}
                </div>
              ))}
            </div>

          </div>
        </div>
                </>
              )}

              {/* Legend */}
              <div className="mt-4 pt-4 border-t flex justify-end gap-4 text-sm opacity-60">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded bg-primary" />
                  Under 30
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded bg-success" />
                  30+ plants
                </span>
              </div>

            </div>
          </div>
      </div>
      <div className="space-y-3">
          <h3 className="font-semibold">Milestones</h3>
          <div className="card bg-base-200">
            <div className="card-body gap-3">
              

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="opacity-60">Longest streak</span>
                  <span className="font-semibold">{stats.longestStreak} weeks</span>
                </div>
                <div className="divider my-0 opacity-30" />
                <div className="flex justify-between">
                  <span className="opacity-60">Weeks active</span>
                  <span className="font-semibold">{stats.totalWeeksActive}</span>
                </div>
                <div className="divider my-0 opacity-30" />
                <div className="flex justify-between">
                  <span className="opacity-60">Total logs</span>
                  <span className="font-semibold">{stats.totalLogs}</span>
                </div>
                <div className="divider my-0 opacity-30" />
                      <div className="flex justify-between">
        <span className="opacity-60">Friends Referred</span>
        <span className="font-semibold flex items-center gap-2">
          {stats.referralCount}
          {stats.referralCount >= 1 && <span>🤝</span>}
        </span>
      </div>
              </div>

            </div>
          </div>

          <h2 className="text-lg font-semibold flex items-center gap-2 mt-6">
            <Award className="h-5 w-5" />
            Achievements
            <span className="badge badge-primary badge-sm">
              {stats.achievements.length}
            </span>
          </h2>
                    {stats.achievements.length === 0 ? (
            <div className="card bg-base-200">
              <div className="card-body items-center text-center gap-2">
                <Award className="h-10 w-10 opacity-30" />
                <p className="font-medium opacity-60">No achievements yet</p>
                <p className="text-sm opacity-40">
                  Keep logging plants to unlock them
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {stats.achievements.map(a => (
                <div
                  key={a.id}
                  className="card bg-base-100 shadow border border-primary/20"
                >
                  <div className="card-body p-4 gap-1">
                    <div className="text-3xl">{a.icon}</div>
                    <div className="font-semibold text-sm mt-1">{a.name}</div>
                    <div className="text-xs opacity-60">{a.description}</div>
                    <div className="text-xs opacity-40 mt-1">
                      {safeFormat(a.unlockedAt, 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
 </div>




      </div>
    </Layout>
  );
}