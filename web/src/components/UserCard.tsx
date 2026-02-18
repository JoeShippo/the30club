import { PlantAvatar } from './PlantAvatar';
import { Trophy } from 'lucide-react';

interface UserCardProps {
  user: {
    id: string;
    displayName: string | null;
    avatarId: string | null;
    photoURL: string | null;
    weeklyScore?: number;
  };
  action?: React.ReactNode;
  onClick?: () => void;
}

export function UserCard({ user, action, onClick }: UserCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card bg-base-100 border border-base-300 ${
        onClick ? 'cursor-pointer hover:border-primary transition' : ''
      }`}
    >
      <div className="card-body p-4 flex-row items-center gap-4">
        <PlantAvatar
          avatarId={user.avatarId}
          photoURL={user.photoURL}
          displayName={user.displayName}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">
            {user.displayName || 'Anonymous User'}
          </div>
          {user.weeklyScore !== undefined && (
            <div className="text-sm opacity-60 flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {user.weeklyScore} plants this week
            </div>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}