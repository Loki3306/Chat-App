// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Define your custom themes here
const customThemes = [
  'light',
  'dark',
  'blue-sky',
  'forest-green',
  'purple-haze',
  'sunset-orange',
  'ocean-blue',
  'monochrome',
  'high-contrast',
  'retro',
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    const storedTheme = localStorage.getItem('app-theme');
    return customThemes.includes(storedTheme) ? storedTheme : 'dark'; // Default to 'dark' if stored theme is invalid
  });

  useEffect(() => {
    const htmlElement = document.documentElement;
    // Remove all existing theme classes before adding the new one
    customThemes.forEach(t => {
      htmlElement.classList.remove(`theme-${t}`);
    });
    // Add the new theme class
    htmlElement.classList.add(`theme-${theme}`);
    // Save theme preference to localStorage
    localStorage.setItem('app-theme', theme);
  }, [theme]); // Re-run effect when theme changes

  const toggleTheme = (newTheme) => {
    if (customThemes.includes(newTheme)) {
      setTheme(newTheme);
    } else {
      console.warn(`Attempted to set an invalid theme: ${newTheme}`);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, customThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
