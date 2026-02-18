import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Chrome } from 'lucide-react';
import {
  signUpWithEmail,
  signInWithGoogle,
  //signInWithApple,
} from '@/auth/authService';
import {
  GiCarrot,
  GiBroccoli,
  GiWheat,
  GiBanana,
  GiCabbage,
  GiTomato,
  GiAubergine,
  GiPumpkin,
  GiCorn,
  GiPear,
  GiAsparagus,
  GiBeet,
  GiBellPepper,
  GiBokChoy,
  GiLeek,
  GiAvocado,
  GiCherry,
  GiCoconuts,
  GiLemon,
  GiGrapes,
  GiPeach,
  GiPineapple,
  GiCoffeeBeans,
  GiChocolateBar,
} from "react-icons/gi";
import { FaLeaf, FaSeedling, FaAppleAlt, FaPepperHot } from "react-icons/fa";
import { useLocation } from 'react-router-dom';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { updateUserStats } from '@/services/userStatsService';
import { query, collection, where, getDocs } from 'firebase/firestore';




const iconConfigs = [
  { Icon: GiCarrot, color: "#ff6b35", label: "carrot" },
  { Icon: GiBroccoli, color: "#2d6a4f", label: "broccoli" },
  { Icon: GiWheat, color: "#d4a574", label: "wheat" },
  { Icon: FaAppleAlt, color: "#e63946", label: "apple" },
  { Icon: GiBanana, color: "#ffd60a", label: "banana" },
  { Icon: GiCabbage, color: "#52b788", label: "cabbage" },
//   { Icon: GiGrainBundle, color: "#f4f1de", label: "grain" },
  { Icon: GiTomato, color: "#e63946", label: "tomato" },
  { Icon: GiAubergine, color: "#7a4c4c", label: "eggplant" },
  { Icon: GiPumpkin, color: "#ff8c42", label: "pumpkin" },
  { Icon: GiCorn, color: "#ffd60a", label: "corn" },
  { Icon: GiPear, color: "#c8b88b", label: "pear" },
  { Icon: FaLeaf, color: "#22c55e", label: "leaf" },
  { Icon: FaSeedling, color: "#4ade80", label: "seedling" },
  { Icon: GiAsparagus, color: "#2d6a4f", label: "asparagus" },
  { Icon: GiBeet, color: "#8b3a3a", label: "beet" },
  { Icon: FaPepperHot, color: "#dc2626", label: "pepper" },
  { Icon: GiBellPepper, color: "#fbbf24", label: "bell pepper" },
  { Icon: GiBokChoy, color: "#65a30d", label: "bok choy" },
  { Icon: GiLeek, color: "#4b5563", label: "leek" },
  { Icon: GiAvocado, color: "#65a30d", label: "avocado" },
  { Icon: GiCherry, color: "#be123c", label: "cherry" },
  { Icon: GiCoconuts, color: "#8b7355", label: "coconuts" },
  { Icon: GiLemon, color: "#eab308", label: "lemon" },
  { Icon: GiGrapes, color: "#9333ea", label: "grapes" },
  { Icon: GiPeach, color: "#f97316", label: "peach" },
  { Icon: GiPineapple, color: "#facc15", label: "pineapple" },
  { Icon: GiCoffeeBeans, color: "#78350f", label: "coffee" },
  { Icon: GiChocolateBar, color: "#78350f", label: "chocolate" },
];

interface FloatingIcon {
  id: number;
  Icon: React.ComponentType<any>;
  color: string;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
}

export function SignUpPage() {
    const location = useLocation();
  const inviteMessage = location.state?.message;
    const invitedBy = location.state?.invitedBy; // Username from invite link


  const heroRef = useRef<HTMLDivElement>(null);

  // Generate icons in staggered columns for organic grid feel
  const floatingIcons = useMemo<FloatingIcon[]>(() => {
    const icons: FloatingIcon[] = [];
    const cols = 10;
    const rows = 6;
    const cellWidth = 100 / cols;
    const cellHeight = 100 / rows;

    for (let col = 0; col < cols; col++) {
      // Alternate column offset for staggered effect
      const isOffsetColumn = col % 2 === 1;
      const startRow = isOffsetColumn ? 0.5 : 0;

      for (let row = 0; row < rows; row++) {
        const actualRow = startRow + row;
        if (actualRow >= rows) break;

        const config = iconConfigs[(col * rows + row) % iconConfigs.length];
        // const rotation = Math.random() * 360;
        const sizeVariation = 0.8 + Math.random() * 0.6; // 0.8x to 1.4x
        const duration = 22 + Math.random() * 10;

        // Small random jitter within the cell
        const jitterX = (Math.random() - 0.5) * cellWidth * 0.4;
        const jitterY = (Math.random() - 0.5) * cellHeight * 0.4;

        icons.push({
          id: col * rows + row,
          Icon: config.Icon,
          color: config.color,
          left: `calc(${col * cellWidth + cellWidth / 2}% + ${jitterX}px)`,
          top: `calc(${actualRow * cellHeight + cellHeight / 2}% + ${jitterY}px)`,
          size: Math.round(40 * sizeVariation),
          duration: duration,
          delay: Math.random() * 2,
        });
      }
    }
    return icons;
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  if (password.length < 6) {
    setError('Password must be at least 6 characters');
    return;
  }

  setLoading(true);

  try {
    const userCredential = await signUpWithEmail(email, password);
    const user = userCredential.user;

    // If they were referred, find the referrer and set referredBy
    if (invitedBy) {
      try {
        // Find referrer by username/displayName
        const usersQuery = query(
          collection(db, COLLECTIONS.USERS),
          where('displayName', '==', invitedBy)
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
          const referrerId = usersSnapshot.docs[0].id;
          
          // Set referredBy in new user's stats
          await setDoc(doc(db, COLLECTIONS.ALL_TIME_STATS, user.uid), {
            userId: user.uid,
            referredBy: referrerId,
            referralCount: 0,
            updatedAt: serverTimestamp(),
          }, { merge: true });

          // Update referrer's stats to increment their referral count
          // This will also trigger the referral achievements
          await updateUserStats(referrerId);
        }
      } catch (referralError) {
        console.error('Error tracking referral:', referralError);
        // Don't fail signup if referral tracking fails
      }
    }

    // AuthContext will handle redirect
  } catch (err: any) {
    setError(err.message || 'Failed to create account');
    setLoading(false);
  }
};

  const handleGoogleSignUp = async () => {
  setError('');
  setLoading(true);

  try {
    const userCredential = await signInWithGoogle();
    const user = userCredential.user;

    // If they were referred, track it
    if (invitedBy) {
      try {
        const usersQuery = query(
          collection(db, COLLECTIONS.USERS),
          where('displayName', '==', invitedBy)
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
          const referrerId = usersSnapshot.docs[0].id;
          
          await setDoc(doc(db, COLLECTIONS.ALL_TIME_STATS, user.uid), {
            userId: user.uid,
            referredBy: referrerId,
            referralCount: 0,
            updatedAt: serverTimestamp(),
          }, { merge: true });

          await updateUserStats(referrerId);
        }
      } catch (referralError) {
        console.error('Error tracking referral:', referralError);
      }
    }

    // AuthContext will handle redirect
  } catch (err: any) {
    setError(err.message || 'Failed to sign up with Google');
    setLoading(false);
  }
};

  // const handleAppleSignUp = async () => {
  //   setError('');
  //   setLoading(true);

  //   try {
  //     await signInWithApple();
  //     // Don't navigate - AuthContext will handle redirect
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to sign up with Apple');
  //     setLoading(false);
  //   }
  // };

  return (
    
          <div
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
        <div className="absolute inset-0 z-0 overflow-hidden bg-white">
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-white opacity-70 z-50"></div>

        {/* Floating Icons */}
        {floatingIcons.map((item) => {
          const Icon = item.Icon;
          return (
            <div
              key={item.id}
              className="absolute opacity-35 hover:opacity-70 transition-opacity -translate-x-1/2 -translate-y-1/2"
              style={{
                left: item.left,
                top: item.top,
                animation: `float ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
                color: item.color,
                zIndex: 1,
              }}
            >
              <Icon size={item.size} />
            </div>
          );
        })}
      </div>

      {/* Add keyframe animation for floating effect */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-40px) rotate(0deg);
            opacity: 0.35;
          }
          75% {
            transform: translateY(-20px) rotate(-5deg);
            opacity: 0.4;
          }
        }
      `}</style>
      
      <div className="max-w-xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

              <div className="card bg-white w-full max-w-md">
        <div className="card-body">
          
          {/* Invite banner */}
          {inviteMessage && (
            <div className="alert alert-success mb-4">
              <span>{inviteMessage}</span>
            </div>
          )}
          </div>
          </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary border-2 mb-2 rounded-full">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900"><span className="text-lg uppercase">Sign Up To<br/> </span>The 30 Club</h1>
          <p className="text-gray-600 mt-2">
            Start tracking your plant diversity today
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Email signup form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4 mb-6 text-left">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="you@example.com"
                disabled={loading}  // ← Add this

            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
                disabled={loading}  // ← Add this

            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
                disabled={loading}  // ← Add this

            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                Sign up with Email
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Social signup buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Continue with Google
          </button>

          {/* <button
            onClick={handleAppleSignUp}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Apple className="w-5 h-5 mr-2" />
            Continue with Apple
          </button> */}
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}