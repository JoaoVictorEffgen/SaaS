import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Verificar se há preferência salva no localStorage
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Verificar preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
    document.documentElement.style.colorScheme = theme;
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((currentTheme) => !currentTheme);
  };

  const setTheme = (theme) => {
    setIsDark(theme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      setTheme,
      theme: isDark ? 'dark' : 'light'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
