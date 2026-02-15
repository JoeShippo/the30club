import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Chrome } from 'lucide-react';
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
import {
  signInWithEmail,
  signInWithGoogle,
  //signInWithApple,
} from '@/auth/authService';
import { useAuth } from '@/auth/AuthContext';

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

export function LoginPage() {
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
  const [loading, setLoading] = useState(false); // UI loading
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();


useEffect(() => {
  if (!authLoading && currentUser) {
    navigate('/', { replace: true });
  }
}, [currentUser, authLoading, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      // AuthContext + ProtectedRoute will handle redirect
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      // AuthContext will pick up the auth state change
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  // const handleAppleLogin = async () => {
  //   if (loading) return;

  //   setError('');
  //   setLoading(true);

  //   try {
  //     await signInWithApple();
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to sign in with Apple');
  //   } finally {
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary border-2 mb-2 rounded-full">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900"><span className="text-lg uppercase">Welcome to<br/> </span>The 30 Club</h1>
          <p className="text-gray-600 mt-2">
            Track your plant diversity journey
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Email login */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-left text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="you@example.com"
                disabled={loading}  // ← Add this

            />
          </div>

          <div>
            <label className="block text-sm font-medium text-left text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
                disabled={loading}  // ← Add this

            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                Sign in with Email
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social logins */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Continue with Google
          </button>

          {/* <button
            onClick={handleAppleLogin}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center"
          >
            <Apple className="w-5 h-5 mr-2" />
            Continue with Apple
          </button> */}
        </div>

        {/* Signup */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
