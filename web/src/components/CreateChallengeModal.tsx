import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { getUserById } from '@/services/userService';
import { User } from '@core/types';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChallenge: (opponentId: string) => Promise<void>;
  currentUserId: string;
  leagueMembers?: string[];
}

export function CreateChallengeModal({
  isOpen,
  onClose,
  onCreateChallenge,
  currentUserId,
  leagueMembers = [],
}: CreateChallengeModalProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<User | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, leagueMembers]);

  const loadMembers = async () => {
    const users: User[] = [];

    for (const userId of leagueMembers) {
      if (userId !== currentUserId) {
        const user = await getUserById(userId);
        if (user) users.push(user);
      }
    }

    setMembers(users);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpponent) return;

    setLoading(true);
    try {
      await onCreateChallenge(selectedOpponent.id);
      setSelectedOpponent(null);
      setSearchQuery('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(
    m =>
      m.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md p-0">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            Create Challenge
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50" />
            <input
              type="text"
              placeholder="Search members…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10"
            />
          </div>
        </div>

        {/* Members */}
        <div className="max-h-[45vh] overflow-y-auto p-2 space-y-1">

          {filteredMembers.length === 0 ? (
            <div className="card bg-base-200 m-2">
              <div className="card-body text-center">
                <p className="opacity-70">
                  {members.length === 0
                    ? 'No members in this league yet'
                    : 'No members found'}
                </p>
              </div>
            </div>
          ) : (
            filteredMembers.map(member => {
              const isSelected = selectedOpponent?.id === member.id;

              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedOpponent(member)}
                  className={`
                    card card-compact w-full text-left transition
                    ${isSelected
                      ? 'bg-primary/10 border border-primary'
                      : 'bg-base-100 hover:bg-base-200'}
                  `}
                >
                  <div className="card-body flex-row items-center gap-3">

                    {/* Avatar */}
                    <div className="avatar placeholder">
                      <div className="bg-primary/20 text-primary rounded-full w-12">
                        {member.photoURL ? (
                          <img src={member.photoURL} alt={member.displayName || ''} />
                        ) : (
                          <span className="font-semibold">
                            {(member.displayName || member.email)[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      <div className="font-medium">
                        {member.displayName || 'Anonymous'}
                      </div>
                      <div className="text-sm opacity-60">
                        {member.email}
                      </div>
                    </div>

                  </div>
                </button>
              );
            })
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedOpponent}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <span className="loading loading-spinner" />
            ) : (
              'Challenge This User'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
