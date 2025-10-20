import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '', showIcon = true }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${showIcon 
          ? 'w-12 h-6 rounded-full' 
          : 'w-10 h-10 rounded-full'
        }
        ${isDark 
          ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' 
          : 'bg-yellow-400 hover:bg-yellow-500 shadow-lg'
        }
        ${className}
      `}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={isDark ? 'Clique para ativar tema claro' : 'Clique para ativar tema escuro'}
    >
      {showIcon ? (
        // Toggle Switch Style
        <>
          <div
            className={`
              absolute top-0.5 left-0.5 w-5 h-5 rounded-full
              bg-white shadow-lg transform transition-transform duration-300 ease-in-out
              flex items-center justify-center
              ${isDark ? 'translate-x-6' : 'translate-x-0'}
            `}
          >
            {isDark ? (
              <Moon className="w-3 h-3 text-blue-600" />
            ) : (
              <Sun className="w-3 h-3 text-yellow-500" />
            )}
          </div>
        </>
      ) : (
        // Icon Only Style
        <div className="flex items-center justify-center">
          {isDark ? (
            <Moon className="w-5 h-5 text-white animate-pulse" />
          ) : (
            <Sun className="w-5 h-5 text-white animate-pulse" />
          )}
        </div>
      )}
    </button>
  );
};

export default ThemeToggle;
