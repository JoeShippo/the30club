import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { CANONICAL_PLANTS, searchPlants } from '@30plants/core';
import { Plant, PlantCategory } from '@30plants/core';

interface PlantSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlant: (plant: Plant) => void;
  loggedPlantIds?: Set<string>;
}

export function PlantSearchModal({
  isOpen,
  onClose,
  onSelectPlant,
  loggedPlantIds = new Set(),
}: PlantSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlants, setFilteredPlants] = useState(CANONICAL_PLANTS);
  const [selectedFilter, setSelectedFilter] =
    useState<'all' | 'common' | PlantCategory>('all');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setSearchQuery('');
    setSelectedFilter('all');
    setFilteredPlants(CANONICAL_PLANTS);

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    let results = searchPlants(searchQuery);

    if (selectedFilter === 'common') {
      results = results.filter(p => p.isCommon);
    } else if (selectedFilter !== 'all') {
      results = results.filter(p => p.category === selectedFilter);
    }

    results.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredPlants(results);
  }, [searchQuery, selectedFilter]);

  if (!isOpen) return null;

  const categories: Array<{
    value: 'all' | 'common' | PlantCategory;
    label: string;
  }> = [
    { value: 'all', label: 'All' },
    { value: 'common', label: 'Common' },
    { value: PlantCategory.VEGETABLE, label: 'Vegetables' },
    { value: PlantCategory.FRUIT, label: 'Fruits' },
    { value: PlantCategory.GRAIN, label: 'Grains' },
    { value: PlantCategory.LEGUME, label: 'Legumes' },
    { value: PlantCategory.NUT_SEED, label: 'Nuts & Seeds' },
    { value: PlantCategory.HERB_SPICE, label: 'Herbs' },
  ];

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box max-w-lg p-0">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            Select Plant
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search + filters */}
        <div className="p-4 border-b space-y-3">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search plants…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedFilter(cat.value)}
                className={`
                  btn btn-sm whitespace-nowrap
                  ${selectedFilter === cat.value
                    ? 'btn-primary'
                    : 'btn-outline'}
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">

          {filteredPlants.length === 0 ? (
            <div className="card bg-base-200 m-4">
              <div className="card-body text-center opacity-70">
                No plants found
              </div>
            </div>
          ) : (
            filteredPlants.map(plant => {
              const isLogged = loggedPlantIds.has(plant.id);

              return (
                <button
                  key={plant.id}
                  onClick={() => {
                    onSelectPlant(plant);
                    onClose();
                  }}
                  className="
                    w-full text-left border-b
                    hover:bg-base-200 transition
                  "
                >
                  <div className="p-4 flex items-center justify-between">

                    <div>
                      <div className="font-medium">
                        {plant.name}
                      </div>
                      <div className="text-sm opacity-60 capitalize">
                        {plant.category.replace('_', ' ')}
                      </div>
                    </div>

                    {isLogged && (
                      <span className="badge badge-primary badge-outline">
                        Logged this week
                      </span>
                    )}

                  </div>
                </button>
              );
            })
          )}

        </div>

      </div>
    </div>
  );
}
