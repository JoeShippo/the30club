import { useEffect, useState } from 'react';
import { Achievement } from '@30plants/core';
import { Award, X } from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementToast({
  achievement,
  onClose,
}: AchievementToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!achievement) return;

    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="toast toast-top toast-center z-50">
      <div
        className={`
          alert alert-success shadow-lg transition-all duration-300
          ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        `}
      >
        {/* Icon / Emoji */}
        <div className="text-3xl">
          {achievement.icon}
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <Award className="h-4 w-4" />
            Achievement unlocked!
          </div>
          <div className="font-bold text-lg">
            {achievement.name}
          </div>
          <div className="text-sm opacity-80">
            {achievement.description}
          </div>
        </div>

        {/* Close */}
        <button
          onClick={() => {
            setShow(false);
            setTimeout(onClose, 300);
          }}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
