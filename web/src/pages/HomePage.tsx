import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Layout } from '@/components/Layout';
import { ProgressRing } from '@/components/ProgressRing';
import { AchievementToast } from '@/components/AchievementToast';
import {
  getWeekId,
  getWeekDates,
  PlantLog,
  WeeklySummary,
  Achievement,
  ACHIEVEMENTS,
} from '@30plants/core';
import { getPlantLogsByUserAndWeek, deletePlantLog } from '@/services/plantLogService';
import { updateWeeklySummary } from '@/services/weeklySummaryService';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

export function HomePage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<PlantLog[]>([]);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const currentWeekId = getWeekId(new Date());
  const { startDate, endDate } = getWeekDates(currentWeekId);

  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const weekLogs = await getPlantLogsByUserAndWeek(currentUser.id, currentWeekId);
      setLogs(weekLogs);

      const updatedSummary = await updateWeeklySummary(currentUser.id, currentWeekId);
      setSummary(updatedSummary);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (!summary) return;

    const score = summary.score;

    if (score === 10) setNewAchievement({ ...ACHIEVEMENTS.REACHED_10, unlockedAt: new Date() });
    if (score === 20) setNewAchievement({ ...ACHIEVEMENTS.REACHED_20, unlockedAt: new Date() });
    if (score === 30) setNewAchievement({ ...ACHIEVEMENTS.REACHED_30, unlockedAt: new Date() });
    if (score === 40) setNewAchievement({ ...ACHIEVEMENTS.REACHED_40, unlockedAt: new Date() });
  }, [summary]);

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Delete this log?')) return;

    try {
      await deletePlantLog(logId);
      await loadData();
    } catch {
      alert('Failed to delete log');
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

  const score = summary?.score ?? 0;

  return (
    <Layout>
      <div className="mx-auto max-w-2xl p-6 space-y-8">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">
            This Week’s Progress
          </h1>
          <p className="text-base-content/60">
            {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
          </p>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center">
          <ProgressRing score={score} target={30} size={220} />
        </div>

        {/* Stats */}
        <div className="stats stats-horizontal shadow w-full">

          <div className="stat">
            <div className="stat-title">Unique Plants</div>
            <div className="stat-value text-primary">{score}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Total Logs</div>
            <div className="stat-value">{logs.length}</div>
          </div>

        </div>

        {/* Motivation */}
        {score >= 30 && (
          <div className="alert alert-success">
            🎉 Congratulations! You’ve hit 30 plants this week!
          </div>
        )}

        {score >= 20 && score < 30 && (
          <div className="alert alert-info">
            You’re doing great! Only {30 - score} more to go.
          </div>
        )}

        {score < 20 && (
          <div className="alert">
            Keep going! {30 - score} unique plants to reach your goal.
          </div>
        )}

        {/* Recent Logs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Logs</h2>

          {logs.length === 0 ? (
            <div className="card bg-base-200">
              <div className="card-body text-center">
                <p>No plants logged yet this week.</p>
                <p className="text-sm opacity-70">Tap the + button to get started!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="card card-compact bg-base-100 shadow"
                >
                  <div className="card-body flex-row items-center justify-between">
                    <div>
                      <div className="font-medium">{log.plantName}</div>
                      <div className="text-sm opacity-60">
                        {format(log.loggedAt, 'MMM d, h:mm a')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AchievementToast
        achievement={newAchievement}
        onClose={() => setNewAchievement(null)}
      />
    </Layout>
  );
}
