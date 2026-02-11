import { useEffect, useState } from 'react';

interface ProgressRingProps {
  score: number;
  target?: number;
  size?: number;
}

export function ProgressRing({
  score,
  target = 30,
  size = 200,
}: ProgressRingProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / target, 1);
  const strokeDashoffset = circumference - progress * circumference;

  const [animate, setAnimate] = useState(false);
  const goalMet = score >= target;

  useEffect(() => {
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 800);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={`
          -rotate-90
          ${goalMet ? 'text-success' : 'text-primary'}
        `}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="opacity-10"
        />

        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center */}
      <div
        className={`
          absolute flex flex-col items-center
          ${animate ? 'animate-pulse' : ''}
        `}
      >
        <div className="text-5xl font-bold leading-none">
          {score}
        </div>
        <div className="text-sm opacity-60">
          / {target}
        </div>

        {goalMet && (
          <span className="badge badge-success mt-2">
            Goal met
          </span>
        )}
      </div>
    </div>
  );
}
