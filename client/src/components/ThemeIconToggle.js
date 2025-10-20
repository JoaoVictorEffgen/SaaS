import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeIconToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        w-14 h-14 rounded-full
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        hover:scale-110 transform
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        shadow-lg border-2
        ${isDark 
          ? 'bg-gray-800 hover:bg-gray-700 text-blue-400 border-gray-600' 
          : 'bg-yellow-400 hover:bg-yellow-500 text-white border-yellow-300'
        }
        ${className}
      `}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={isDark ? 'Clique para ativar tema claro ☀️' : 'Clique para ativar tema escuro 🌙'}
    >
      {isDark ? (
        <Moon className="w-7 h-7 transition-transform duration-300 ease-in-out" />
      ) : (
        <Sun className="w-7 h-7 transition-transform duration-300 ease-in-out" />
      )}
    </button>
  );
};

export default ThemeIconToggle;
