import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* 404 Illustration */}
        <div className="space-y-4">
          <div className="text-9xl">🌵</div>
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-bold">Page Not Found</h2>
            <p className="text-base-content/60">
              Looks like this plant doesn't exist in our garden.
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div className="card bg-base-200">
          <div className="card-body gap-2">
            <p className="text-sm font-medium">Looking for something?</p>
            <div className="text-sm opacity-70 text-left space-y-1">
              <div>• Track your plants on the home page</div>
              <div>• View your stats and progress</div>
              <div>• Check out the leaderboard</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary w-full gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost w-full gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Help text */}
        <div className="text-sm opacity-50">
          If you think this page should exist, please let us know!
        </div>

      </div>
    </div>
  );
}