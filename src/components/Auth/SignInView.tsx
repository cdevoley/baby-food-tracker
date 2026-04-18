import { useState } from 'react';

interface SignInViewProps {
  onSignInWithGoogle: () => Promise<void>;
}

export default function SignInView({ onSignInWithGoogle }: SignInViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await onSignInWithGoogle();
    } catch {
      setLoading(false);
      setError('Failed to start Google sign-in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sage-50 dark:bg-stone-900 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">🍼</p>
          <h1 className="text-2xl font-bold text-sage-700 dark:text-sage-400">Baby Food Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-stone-400 mt-1">Sign in to continue</p>
        </div>

        <div className="card space-y-4">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-stone-600 bg-white dark:bg-stone-700 text-gray-800 dark:text-stone-100 rounded-xl px-4 py-2.5 font-semibold hover:bg-gray-50 dark:hover:bg-stone-600 disabled:opacity-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            {loading ? 'Opening Google…' : 'Continue with Google'}
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className="text-xs text-center text-gray-500 dark:text-stone-400">
            We use Google to keep your family's data secure.
          </p>
        </div>
      </div>
    </div>
  );
}
