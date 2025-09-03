import React, { useState } from 'react';
import { signIn, signUp } from '../services/authService';

interface AuthPageProps {
  onSignInSuccess: (username: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSignInSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const authAction = isLoginView ? signIn : signUp;
    const result = authAction(username, password);

    setTimeout(() => { // Simulate network latency
        if (result.success) {
            if (isLoginView) {
                onSignInSuccess(username);
            } else {
                setMessage(result.message);
                setIsLoginView(true); // Switch to login view after successful signup
            }
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full mx-auto">
            <div className="flex justify-center items-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-700 dark:text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 3.5A1.5 1.5 0 0111.5 2h.02a1.5 1.5 0 011.438 1.999l-.285 1.711a2 2 0 001.956 2.288l1.71-.285A1.5 1.5 0 0118 9.48V9.5A1.5 1.5 0 0116.5 11h-13A1.5 1.5 0 012 9.5V9.48a1.5 1.5 0 011.999-1.438l1.71.285a2 2 0 001.957-2.288l-.285-1.71A1.5 1.5 0 018.48 2H8.5A1.5 1.5 0 0110 3.5zM3 12.5a1.5 1.5 0 011.5 1.5v2A1.5 1.5 0 013 17.5v-5zM17 12.5a1.5 1.5 0 00-1.5 1.5v2a1.5 1.5 0 001.5 1.5v-5z" />
                    <path fillRule="evenodd" d="M5 14.5A1.5 1.5 0 016.5 13h7a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 17.5v-3z" clipRule="evenodd" />
                </svg>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Verde Imports Vino Rout</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">{isLoginView ? 'Sign In' : 'Create Account'}</h2>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">{error}</div>}
                {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md text-sm" role="alert">{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white dark:bg-gray-700 transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isLoginView ? "current-password" : "new-password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white dark:bg-gray-700 transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:bg-green-400 dark:disabled:bg-green-900 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition"
                    >
                        {isLoading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(null); setMessage(null); }} className="font-medium text-green-700 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300">
                        {isLoginView ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    </div>
  );
};

export default AuthPage;
