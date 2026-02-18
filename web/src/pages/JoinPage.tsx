import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Leaf, Loader2 } from 'lucide-react';

export function JoinPage() {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Capitalize first letter
  const capitalizedUsername = username 
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : '';

  useEffect(() => {
    if (currentUser) {
      navigate('/', { 
        state: { 
          invitedBy: username,
          message: `Welcome! You were invited by ${capitalizedUsername}` 
        } 
      });
      return;
    }

    navigate('/signup', { 
      state: { 
        invitedBy: username,
        message: `${capitalizedUsername} invited you to join The 30 Club!` 
      } 
    });
  }, [currentUser, username, capitalizedUsername, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-success flex items-center justify-center p-6">
      <div className="card bg-white w-full max-w-md">
        <div className="card-body items-center text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Leaf className="w-10 h-10 text-primary" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold mb-2">The 30 Club</h1>
            <p className="text-base-content/60">
              {capitalizedUsername} invited you to track plant diversity together!
            </p>
          </div>

          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Redirecting...</span>
          </div>
        </div>
      </div>
    </div>
  );
}