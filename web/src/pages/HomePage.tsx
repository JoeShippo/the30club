import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Layout } from '@/components/Layout';
import { ProgressRing } from '@/components/ProgressRing';
import { AchievementToast } from '@/components/AchievementToast';
import { ACHIEVEMENTS } from '@30plants/core';
import {
  getWeekId,
  getWeekDates,
  PlantLog,
  WeeklySummary,
  Achievement,
} from '@30plants/core';
import { getPlantLogsByUserAndWeek, deletePlantLog } from '@/services/plantLogService';
import { updateWeeklySummary } from '@/services/weeklySummaryService';
import { getUserStats } from '@/services/userStatsService';
import { format } from 'date-fns';
import { Trash2, Plus } from 'lucide-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<PlantLog[]>([]);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [previousAchievementIds, setPreviousAchievementIds] = useState<Set<string>>(new Set());

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

    // Load user stats to check for new achievements
    const stats = await getUserStats(currentUser.id);
    
    if (stats) {
      const currentAchievementIds = new Set(stats.achievements.map(a => a.id));
      
      // Get previously known achievements from localStorage
      const storedAchievements = localStorage.getItem(`achievements_${currentUser.id}`);
      
      const previousIds = storedAchievements 
        ? new Set(JSON.parse(storedAchievements))
        : new Set<string>();
      
      // Check if this is from logging a plant
      const isReturningFromAction = sessionStorage.getItem('just_logged_plant') === 'true';
      
      if (isReturningFromAction) {
        // Find newly unlocked achievement
        const newlyUnlocked = stats.achievements.find(
          a => !previousIds.has(a.id)
        );


        if (newlyUnlocked) {
          setNewAchievement(newlyUnlocked);
        }
        
        sessionStorage.removeItem('just_logged_plant');
      }

      // Save current achievements to localStorage for next comparison
      localStorage.setItem(
        `achievements_${currentUser.id}`,
        JSON.stringify(Array.from(currentAchievementIds))
      );
      
      setPreviousAchievementIds(currentAchievementIds);
    }
  } catch (error) {
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadData();
  }, [currentUser]);

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
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6 lg:mb-8">
            <div className="h-8 bg-base-200 rounded w-64 mb-2 animate-pulse" />
            <div className="h-4 bg-base-200 rounded w-48 animate-pulse" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-6">
              <div className="card bg-base-200 animate-pulse">
                <div className="card-body items-center">
                  <div className="w-52 h-52 rounded-full bg-base-300" />
                </div>
              </div>
              <SkeletonLoader count={2} type="stat" />
            </div>
            
            <div className="space-y-4">
              <div className="h-6 bg-base-200 rounded w-32 animate-pulse" />
              <SkeletonLoader count={5} type="card" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const score = summary?.score ?? 0;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Header with Add Button */}
        <div className="mb-6 lg:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              This Week's Progress
            </h1>
            <p className="text-base-content/60">
              {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
            </p>
          </div>
          
          {/* Add Plant Button */}
          <button
            onClick={() => navigate('/add')}
            className="btn btn-primary gap-2"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Plant</span>
          </button>
        </div>

        {/* Desktop: 2-column grid, Mobile: stacked */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Left column: Progress + Stats */}
          <div className="space-y-6">
            
            {/* Progress Ring */}
            <div className="card bg-base-100 shadow">
              <div className="card-body items-center">
                <ProgressRing score={score} target={30} size={220} />
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card bg-base-100 shadow">
                <div className="card-body p-4 gap-1">
                  <div className="text-sm opacity-60">Unique Plants</div>
                  <div className="text-3xl font-bold text-primary">{score}</div>
                </div>
              </div>

              <div className="card bg-base-100 shadow">
                <div className="card-body p-4 gap-1">
                  <div className="text-sm opacity-60">Total Logs</div>
                  <div className="text-3xl font-bold">{logs.length}</div>
                </div>
              </div>
            </div>

            {/* Motivation */}
            {score >= 30 && (
              <div className="alert alert-success">
                🎉 Congratulations! You've hit 30 plants this week!
              </div>
            )}

            {score >= 20 && score < 30 && (
              <div className="alert alert-info">
                You're doing great! Only {30 - score} more to go.
              </div>
            )}

            {score < 20 && (
              <div className="alert">
                Keep going! {30 - score} unique plants to reach your goal.
              </div>
            )}
          </div>

          {/* Right column: Recent Logs */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recent Logs</h2>

            {logs.length === 0 ? (
              <div className="card bg-base-200">
                <div className="card-body text-center gap-2">
                  <div className="text-5xl">🌱</div>
                  <p className="font-medium">No plants logged yet this week</p>
                  <p className="text-sm opacity-70">Tap the + button to get started!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map(log => (
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
      </div>

      {/* Dev: Test Achievement Toast */}
{/* {import.meta.env.DEV && (
  <button
    onClick={() => {
      // Cycle through different achievements for testing
      const testAchievements = [
        ACHIEVEMENTS.FIRST_PLANT,
        ACHIEVEMENTS.REACHED_10,
        ACHIEVEMENTS.REACHED_20,
        ACHIEVEMENTS.REACHED_30,
        ACHIEVEMENTS.WEEK_STREAK_2,
        ACHIEVEMENTS.WEEK_STREAK_4,
      ];
      const random = testAchievements[Math.floor(Math.random() * testAchievements.length)];
      setNewAchievement({ ...random, unlockedAt: new Date() });
    }}
    className="btn btn-error btn-sm fixed bottom-24 right-4 z-50 lg:bottom-4"
  >
    Test Toast
  </button>
)} */}

<AchievementToast
  achievement={newAchievement}
  onClose={() => setNewAchievement(null)}
/>

      <AchievementToast
        achievement={newAchievement}
        onClose={() => setNewAchievement(null)}
      />
    </Layout>
  );
}