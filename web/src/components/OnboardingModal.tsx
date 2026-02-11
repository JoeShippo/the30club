import { useState } from 'react';
import { PLANT_AVATARS } from '@/config/plantAvatars';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: (displayName: string, avatarId: string) => Promise<void>;
}

type Step = 'welcome' | 'name' | 'avatar' | 'firstplant';

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PLANT_AVATARS[0].id);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const steps: Step[] = ['welcome', 'name', 'avatar', 'firstplant'];
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex) / (steps.length - 1)) * 100;

  const handleNameNext = () => {
    if (!displayName.trim()) {
      setNameError('Please enter your name');
      return;
    }
    if (displayName.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }
    setNameError('');
    setStep('avatar');
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await onComplete(displayName.trim(), selectedAvatar);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setSaving(false);
    }
  };

  const selectedAvatarObj = PLANT_AVATARS.find(a => a.id === selectedAvatar)!;

  return (
    <div className="fixed inset-0 z-50 bg-base-100 flex flex-col">

      {/* Progress bar */}
      {step !== 'welcome' && (
        <div className="w-full h-1 bg-base-300">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Back button */}
      {step !== 'welcome' && (
        <button
          onClick={() => setStep(steps[stepIndex - 1])}
          className="btn btn-ghost btn-sm w-fit m-4 gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16 max-w-md mx-auto w-full">

        {/* ── STEP 1: Welcome ── */}
        {step === 'welcome' && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="text-8xl">🌱</div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold">Welcome to<br/>The 30 Club</h1>
              <p className="text-base opacity-60 leading-relaxed">
                Research shows eating <strong>30 different plants</strong> per week
                dramatically improves gut health and overall wellbeing.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full">
              {[
                { emoji: '🥗', label: 'Track plants' },
                { emoji: '📊', label: 'See progress' },
                { emoji: '🏆', label: 'Hit 30/week' },
              ].map(item => (
                <div key={item.label} className="card bg-base-200">
                  <div className="card-body items-center p-3 gap-1">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('name')}
              className="btn btn-primary btn-lg w-full gap-2"
            >
              Get Started
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ── STEP 2: Name ── */}
        {step === 'name' && (
          <div className="w-full space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-2xl font-bold">What should we call you?</h2>
              <p className="opacity-60 text-sm">
                This is how you'll appear on leaderboards
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={displayName}
                onChange={e => {
                  setDisplayName(e.target.value);
                  setNameError('');
                }}
                onKeyDown={e => e.key === 'Enter' && handleNameNext()}
                placeholder="Your name"
                maxLength={30}
                autoFocus
                className={`input input-bordered w-full text-lg ${
                  nameError ? 'input-error' : ''
                }`}
              />
              {nameError && (
                <p className="text-error text-sm">{nameError}</p>
              )}
            </div>

            <button
              onClick={handleNameNext}
              disabled={!displayName.trim()}
              className="btn btn-primary w-full gap-2"
            >
              Continue
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ── STEP 3: Avatar ── */}
        {step === 'avatar' && (
          <div className="w-full space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="text-5xl mb-2">{selectedAvatarObj.emoji}</div>
              <h2 className="text-2xl font-bold">Pick your plant</h2>
              <p className="opacity-60 text-sm">
                Choose an avatar that represents you
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {PLANT_AVATARS.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`
                    card transition-all duration-150
                    ${selectedAvatar === avatar.id
                      ? 'bg-primary/20 border-2 border-primary scale-105'
                      : 'bg-base-200 border-2 border-transparent hover:border-primary/40'
                    }
                  `}
                >
                  <div className="card-body items-center p-3 gap-1">
                    <span className="text-3xl">{avatar.emoji}</span>
                    <span className="text-xs opacity-60">{avatar.name}</span>
                    {selectedAvatar === avatar.id && (
                      <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('firstplant')}
              className="btn btn-primary w-full gap-2"
            >
              That's me!
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ── STEP 4: Ready ── */}
        {step === 'firstplant' && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="text-7xl">{selectedAvatarObj.emoji}</div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">
                You're all set, {displayName}! 🎉
              </h2>
              <p className="opacity-60 text-sm leading-relaxed">
                Your goal is <strong>30 unique plants</strong> every week.
                Vegetables, fruits, grains, nuts, herbs — they all count!
              </p>
            </div>

            <div className="card bg-base-200 text-left">
              <div className="card-body gap-3">
                <h3 className="font-semibold">Quick tips:</h3>
                <ul className="text-sm opacity-70 space-y-2">
                  <li>🗓️ Weeks run <strong>Monday to Sunday</strong></li>
                  <li>🌿 Each plant counts <strong>once per week</strong></li>
                  <li>🧄 Herbs & spices count too — garlic, ginger, etc.</li>
                  <li>☕ Coffee beans and cocoa count as plants!</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleFinish}
              disabled={saving}
              className="btn btn-primary btn-lg w-full gap-2"
            >
              {saving
                ? <span className="loading loading-spinner" />
                : <>
                    Log my first plant
                    <ChevronRight className="h-5 w-5" />
                  </>
              }
            </button>
          </div>
        )}

      </div>
    </div>
  );
}