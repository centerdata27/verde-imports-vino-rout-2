import React from 'react';

interface HeaderProps {
    currentUser: string | null;
    onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onSignOut }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700 dark:text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.5A1.5 1.5 0 0111.5 2h.02a1.5 1.5 0 011.438 1.999l-.285 1.711a2 2 0 001.956 2.288l1.71-.285A1.5 1.5 0 0118 9.48V9.5A1.5 1.5 0 0116.5 11h-13A1.5 1.5 0 012 9.5V9.48a1.5 1.5 0 011.999-1.438l1.71.285a2 2 0 001.957-2.288l-.285-1.71A1.5 1.5 0 018.48 2H8.5A1.5 1.5 0 0110 3.5zM3 12.5a1.5 1.5 0 011.5 1.5v2A1.5 1.5 0 013 17.5v-5zM17 12.5a1.5 1.5 0 00-1.5 1.5v2a1.5 1.5 0 001.5 1.5v-5z" />
                <path fillRule="evenodd" d="M5 14.5A1.5 1.5 0 016.5 13h7a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 17.5v-3z" clipRule="evenodd" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Verde Imports Vino Rout</h1>
        </div>
        {currentUser && (
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, <span className="font-bold">{currentUser}</span></span>
                <button 
                    onClick={onSignOut}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    Sign Out
                </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;