import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Layout } from '@/components/Layout';
import { PlantSearchModal } from '@/components/PlantSearchModal';
import { BulkLogModal } from '@/components/BulkLogModal';
import { Plant, getWeekId, getPlantById } from '@30plants/core';
import {
  createPlantLog,
  getPlantLogsByUserAndWeek,
  getRecentPlantLogs,
} from '@/services/plantLogService';
import { Check, Search, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '@/services/analytics';
import { rateLimiter, formatTimeRemaining } from '@/utils/rateLimiter';


export function AddPlantPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggedPlantIds, setLoggedPlantIds] = useState<Set<string>>(new Set());
  const [recentPlants, setRecentPlants] = useState<Plant[]>([]);
  

  useEffect(() => {
    loadLoggedPlants();
    loadRecentPlants();
  }, [currentUser]);

  const loadLoggedPlants = async () => {
    if (!currentUser) return;

    const weekId = getWeekId(new Date());
    const logs = await getPlantLogsByUserAndWeek(currentUser.id, weekId);
    setLoggedPlantIds(new Set(logs.map(log => log.plantId)));
  };

  const loadRecentPlants = async () => {
    if (!currentUser) return;

    const logs = await getRecentPlantLogs(currentUser.id, 10);
    const uniquePlantIds = Array.from(new Set(logs.map(log => log.plantId)));

    const plants: Plant[] = [];
    for (const plantId of uniquePlantIds.slice(0, 6)) {
      const plant = getPlantById(plantId);
      if (plant) plants.push(plant);
    }

    setRecentPlants(plants);
  };

  const handleQuickLog = async (plant: Plant) => {
  if (!currentUser) return;

  setLoading(true);
  try {
    await createPlantLog(currentUser.id, plant.id, plant.name);
    navigate('/');
  } catch (error: any) {
    if (error.message.includes('Rate limit exceeded')) {
      alert(error.message);
    } else {
      alert('Failed to log plant. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

const handleLogPlant = async () => {
  if (!currentUser || !selectedPlant) return;

  setLoading(true);
  try {
    await createPlantLog(currentUser.id, selectedPlant.id, selectedPlant.name);
    navigate('/');
  } catch (error: any) {
    if (error.message.includes('Rate limit exceeded')) {
      alert(error.message); // Or use a toast notification
    } else {
      alert('Failed to log plant. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  const handleBulkLog = async (plants: Plant[]) => {
  if (!currentUser) return;

  // Check bulk rate limit
  if (!rateLimiter.checkLimit(currentUser.id, 'bulk_log')) {
    const resetTime = rateLimiter.getResetTime(currentUser.id, 'bulk_log');
    alert(
      `You've used too many bulk logs recently. Try again in ${formatTimeRemaining(resetTime)}`
    );
    return;
  }

  // Check if individual logs would be rate limited
  const remaining = rateLimiter.getRemaining(currentUser.id, 'plant_log');
  if (plants.length > remaining) {
    alert(
      `You can only log ${remaining} more plants today. Try logging fewer plants or wait 24 hours.`
    );
    return;
  }

  try {
    for (const plant of plants) {
      await createPlantLog(currentUser.id, plant.id, plant.name);
    }

    // Track bulk log event
    trackEvent('bulk_plants_logged', {
      count: plants.length,
      plantIds: plants.map(p => p.id),
    });

    navigate('/');
  } catch (error: any) {
    if (error.message.includes('Rate limit exceeded')) {
      alert(error.message);
    } else {
      alert('Failed to log plants. Please try again.');
    }
  }
};

  const isAlreadyLogged = selectedPlant
    ? loggedPlantIds.has(selectedPlant.id)
    : false;

  return (
    <Layout>
          <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <h1 className="text-2xl font-bold text-center">
          Log a Plant
        </h1>

        {/* Search */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-outline w-full justify-start gap-3 h-auto py-4"
        >
          <Search className="h-5 w-5 opacity-60" />
          <span className="text-base-content/60">
            {selectedPlant ? selectedPlant.name : 'Search for a plant…'}
          </span>
        </button>

        {/* Bulk log */}
        <button
          onClick={() => setShowBulkModal(true)}
          className="btn btn-primary w-full gap-2"
        >
          <Plus className="h-5 w-5" />
          Log Multiple Plants
        </button>

        {/* Recent plants */}
        {recentPlants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium opacity-70">
              <Clock className="h-4 w-4" />
              Recently Logged
            </div>

            <div className="grid grid-cols-2 gap-3">
              {recentPlants.map(plant => {
                const alreadyLogged = loggedPlantIds.has(plant.id);

                return (
                  <button
                    key={plant.id}
                    onClick={() => handleQuickLog(plant)}
                    disabled={loading}
                    className={`
                      card card-compact border transition
                      ${alreadyLogged
                        ? 'border-primary bg-primary/10'
                        : 'border-base-300 hover:border-primary'}
                    `}
                  >
                    <div className="card-body p-3">
                      <div className="font-medium text-sm">
                        {plant.name}
                      </div>

                      {alreadyLogged && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Check className="h-3 w-3" />
                          Logged
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected plant */}
        {selectedPlant && (
          <div className="card bg-base-200">
            <div className="card-body space-y-3">

              <div>
                <h3 className="text-lg font-semibold">
                  {selectedPlant.name}
                </h3>
                <p className="text-sm opacity-70 capitalize">
                  {selectedPlant.category.replace('_', ' ')}
                </p>
              </div>

              {isAlreadyLogged && (
                <div className="alert alert-info py-2">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">
                    Already logged this week
                  </span>
                </div>
              )}

              <button
                onClick={handleLogPlant}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading && <span className="loading loading-spinner" />}
                {!loading && isAlreadyLogged && 'Log Again (Won’t Increase Score)'}
                {!loading && !isAlreadyLogged && 'Log Plant'}
              </button>

            </div>
          </div>
        )}

        {/* Info */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="font-medium">How it works</h3>
            <ul className="text-sm opacity-70 space-y-1">
              <li>• Each unique plant counts once per week</li>
              <li>• Logging again won’t increase your score</li>
              <li>• Weeks reset every Monday</li>
              <li>• Goal: 30 different plants per week</li>
            </ul>
          </div>
        </div>

      </div>

      <PlantSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectPlant={setSelectedPlant}
        loggedPlantIds={loggedPlantIds}
      />

      <BulkLogModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onLogPlants={handleBulkLog}
        loggedPlantIds={loggedPlantIds}
      />
    </Layout>
  );
}
