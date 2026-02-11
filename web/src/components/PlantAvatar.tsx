import { PLANT_AVATARS } from '@/config/plantAvatars';

interface PlantAvatarProps {
  avatarId?: string | null;
  photoURL?: string | null;
  displayName?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm:  'w-8 h-8 text-lg',
  md:  'w-12 h-12 text-2xl',
  lg:  'w-16 h-16 text-3xl',
  xl:  'w-24 h-24 text-5xl',
};

export function PlantAvatar({
  avatarId,
  photoURL,
  displayName,
  size = 'md',
}: PlantAvatarProps) {
  const avatar = PLANT_AVATARS.find(a => a.id === avatarId);
  const sizeClass = sizes[size];

  if (avatar) {
    return (
      <div className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center shrink-0`}>
        {avatar.emoji}
      </div>
    );
  }

  if (photoURL) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden shrink-0`}>
        <img src={photoURL} alt={displayName || 'User'} className="w-full h-full object-cover" />
      </div>
    );
  }

  // Fallback to initial
  return (
    <div className={`${sizeClass} rounded-full bg-primary/20 flex items-center justify-center shrink-0 font-semibold text-primary`}>
      {(displayName || 'A')[0].toUpperCase()}
    </div>
  );
}