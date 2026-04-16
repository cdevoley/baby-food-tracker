import { useState } from 'react';

interface SignInViewProps {
  onSignIn: (email: string) => Promise<void>;
}

type SignInState = 'idle' | 'sending' | 'sent';

export default function SignInView({ onSignIn }: SignInViewProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SignInState>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    setError('');
    try {
      await onSignIn(email.trim().toLowerCase());
      setStatus('sent');
    } catch {
      setStatus('idle');
      setError('Failed to send — check your email address and try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sage-50 dark:bg-stone-900 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">🍼</p>
          <h1 className="text-2xl font-bold text-sage-700 dark:text-sage-400">Baby Food Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-stone-400 mt-1">Sign in to access your data</p>
        </div>

        {status === 'sent' ? (
          <div className="card text-center py-8">
            <p className="text-3xl mb-3">📬</p>
            <p className="font-semibold text-gray-800 dark:text-stone-100">Check your email</p>
            <p className="text-sm text-gray-500 dark:text-stone-400 mt-2">
              We sent a magic link to <span className="font-medium text-gray-700 dark:text-stone-200">{email}</span>.
              Click the link to sign in.
            </p>
            <button
              onClick={() => { setStatus('idle'); setEmail(''); }}
              className="text-xs text-sage-600 dark:text-sage-400 mt-4 underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label htmlFor="sign-in-email" className="block text-sm font-semibold text-gray-700 dark:text-stone-200 mb-1.5">
                Email address
              </label>
              <input
                id="sign-in-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                required
                className="w-full border border-gray-200 dark:border-stone-600 rounded-xl px-3 py-2.5 text-gray-800 dark:text-stone-100 bg-white dark:bg-stone-700 focus:outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={status === 'sending' || !email.trim()}
              className="btn-primary w-full disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
