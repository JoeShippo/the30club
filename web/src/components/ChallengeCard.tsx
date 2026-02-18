import { Challenge, ChallengeStatus } from '@30plants/core';
import { PlantAvatar } from './PlantAvatar';
import { Trophy, Swords, Check, X, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ChallengeCardProps {
  challenge: Challenge;
  currentUserId: string;
  challengerUser?: {
    displayName: string | null;
    avatarId: string | null;
    photoURL: string | null;
  };
  opponentUser?: {
    displayName: string | null;
    avatarId: string | null;
    photoURL: string | null;
  };
  onAccept?: (challengeId: string) => void;
  onDecline?: (challengeId: string) => void;
}

export function ChallengeCard({
  challenge,
  currentUserId,
  challengerUser,
  opponentUser,
  onAccept,
  onDecline,
}: ChallengeCardProps) {
  const isChallenger = challenge.challengerId === currentUserId;
  const isPending = challenge.status === ChallengeStatus.PENDING;
  const isActive = challenge.status === ChallengeStatus.ACTIVE;
  const isCompleted = challenge.status === ChallengeStatus.COMPLETED;
  
  const myScore = isChallenger ? challenge.challengerScore : challenge.opponentScore;
  const theirScore = isChallenger ? challenge.opponentScore : challenge.challengerScore;
  const opponent = isChallenger ? opponentUser : challengerUser;

  const getStatusBadge = () => {
    if (isPending && !isChallenger) {
      return <div className="badge badge-warning gap-1"><Clock className="h-3 w-3" /> Pending</div>;
    }
    if (isPending && isChallenger) {
      return <div className="badge badge-info gap-1"><Clock className="h-3 w-3" /> Waiting</div>;
    }
    if (isActive) {
      return <div className="badge badge-success gap-1"><Swords className="h-3 w-3" /> Active</div>;
    }
    if (isCompleted) {
      const won = myScore > theirScore;
      return won 
        ? <div className="badge badge-success gap-1"><Trophy className="h-3 w-3" /> Won</div>
        : <div className="badge badge-error gap-1">Lost</div>;
    }
    return <div className="badge">Declined</div>;
  };

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            <span className="font-semibold">Challenge</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Players */}
        <div className="flex items-center justify-between gap-4">
          
          {/* You */}
          <div className="flex flex-col items-center flex-1">
            <PlantAvatar
              avatarId={currentUserId === challenge.challengerId ? challengerUser?.avatarId : opponentUser?.avatarId}
              photoURL={currentUserId === challenge.challengerId ? challengerUser?.photoURL : opponentUser?.photoURL}
              displayName="You"
              size="md"
            />
            <div className="text-sm font-medium mt-2">You</div>
            {isActive && (
              <div className="text-2xl font-bold text-primary mt-1">{myScore}</div>
            )}
          </div>

          {/* VS */}
          <div className="text-2xl font-bold opacity-30">VS</div>

          {/* Opponent */}
          <div className="flex flex-col items-center flex-1">
            <PlantAvatar
              avatarId={opponent?.avatarId}
              photoURL={opponent?.photoURL}
              displayName={opponent?.displayName}
              size="md"
            />
            <div className="text-sm font-medium mt-2 truncate max-w-25">
              {opponent?.displayName || 'User'}
            </div>
            {isActive && (
              <div className="text-2xl font-bold text-primary mt-1">{theirScore}</div>
            )}
          </div>
        </div>

        {/* Actions or Info */}
        {isPending && !isChallenger && onAccept && onDecline && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onAccept(challenge.id)}
              className="btn btn-success btn-sm flex-1 gap-2"
            >
              <Check className="h-4 w-4" />
              Accept
            </button>
            <button
              onClick={() => onDecline(challenge.id)}
              className="btn btn-error btn-sm flex-1 gap-2"
            >
              <X className="h-4 w-4" />
              Decline
            </button>
          </div>
        )}

        {isPending && isChallenger && (
          <div className="text-center text-sm opacity-60 mt-2">
            Waiting for {opponent?.displayName || 'opponent'} to respond
          </div>
        )}

        {isActive && (
          <div className="text-center text-sm opacity-60 mt-2">
            Week of {format(new Date(challenge.weekId), 'MMM d')}
          </div>
        )}

        {isCompleted && (
          <div className="text-center text-sm font-medium mt-2">
            Final: {myScore} - {theirScore}
          </div>
        )}
      </div>
    </div>
  );
}