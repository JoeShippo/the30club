import { useState } from 'react';
import { X } from 'lucide-react';

interface JoinLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinLeague: (inviteCode: string) => Promise<void>;
}

export function JoinLeagueModal({
  isOpen,
  onClose,
  onJoinLeague,
}: JoinLeagueModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onJoinLeague(inviteCode.toUpperCase());
      setInviteCode('');
      onClose();
    } catch (error: any) {
      alert(error.message || 'Failed to join league');
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
            Join League
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

          {/* Invite code */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Invite code
              </span>
            </label>

            <input
              type="text"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              required
              maxLength={6}
              placeholder="ABC123"
              className="
                input input-bordered w-full
                uppercase text-center text-2xl
                tracking-widest font-mono
              "
            />

            <label className="label">
              <span className="label-text-alt opacity-70">
                Enter the 6-character code shared by the league creator
              </span>
            </label>
          </div>

          {/* Action */}
          <button
            type="submit"
            disabled={loading || inviteCode.length !== 6}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <span className="loading loading-spinner" />
            ) : (
              'Join League'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
