import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLeague: (name: string, description: string) => Promise<void>;
}

export function CreateLeagueModal({
  isOpen,
  onClose,
  onCreateLeague,
}: CreateLeagueModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreateLeague(name, description);
      setName('');
      setDescription('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md p-0">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            Create League
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">

          {/* Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                League name
              </span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={50}
              placeholder="Family Challenge"
              className="input input-bordered w-full"
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Description
              </span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="A friendly competition among family members"
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Action */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <span className="loading loading-spinner" />
            ) : (
              'Create League'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
