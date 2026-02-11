import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Plant } from '@30plants/core';
import { PlantSearchModal } from './PlantSearchModal';

interface BulkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogPlants: (plants: Plant[]) => Promise<void>;
  loggedPlantIds: Set<string>;
}

export function BulkLogModal({
  isOpen,
  onClose,
  onLogPlants,
  loggedPlantIds,
}: BulkLogModalProps) {
  const [selectedPlants, setSelectedPlants] = useState<Plant[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddPlant = (plant: Plant) => {
    if (!selectedPlants.find(p => p.id === plant.id)) {
      setSelectedPlants([...selectedPlants, plant]);
    }
  };

  const handleRemovePlant = (plantId: string) => {
    setSelectedPlants(selectedPlants.filter(p => p.id !== plantId));
  };

  const handleSubmit = async () => {
    if (selectedPlants.length === 0) return;

    setLoading(true);
    try {
      await onLogPlants(selectedPlants);
      setSelectedPlants([]);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPlants([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal */}
      <div className="modal modal-open">
        <div className="modal-box max-w-md p-0">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">
              Log Multiple Plants
            </h2>
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 max-h-[50vh] overflow-y-auto">

            {selectedPlants.length === 0 ? (
              <div className="card bg-base-200">
                <div className="card-body text-center space-y-1">
                  <p className="opacity-70">No plants selected</p>
                  <p className="text-sm opacity-50">
                    Use the button below to add plants
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedPlants.map(plant => {
                  const isLogged = loggedPlantIds.has(plant.id);

                  return (
                    <div
                      key={plant.id}
                      className="card card-compact bg-base-100 border"
                    >
                      <div className="card-body flex-row items-center justify-between">

                        <div>
                          <div className="font-medium text-sm">
                            {plant.name}
                          </div>
                          {isLogged && (
                            <div className="text-xs text-primary">
                              Already logged this week
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemovePlant(plant.id)}
                          className="btn btn-ghost btn-sm btn-circle text-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Actions */}
          <div className="p-4 border-t space-y-2">

            <button
              onClick={() => setShowSearch(true)}
              disabled={loading}
              className="btn btn-outline w-full gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Plant
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || selectedPlants.length === 0}
              className="btn btn-primary w-full gap-2"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Logging {selectedPlants.length} plant{selectedPlants.length !== 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Log {selectedPlants.length} Plant{selectedPlants.length !== 1 ? 's' : ''}
                </>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Search modal */}
      <PlantSearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectPlant={handleAddPlant}
        loggedPlantIds={loggedPlantIds}
      />
    </>
  );
}