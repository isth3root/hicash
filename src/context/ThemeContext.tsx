import React, { createContext, useContext } from 'react';
import { useTheme as useThemeHook } from '../hooks/useTheme';
import type { ThemeName, Theme } from '../hooks/useTheme';

interface ThemeContextType {
  theme: Theme;
  currentTheme: ThemeName;
  changeTheme: (themeName: ThemeName) => void;
  availableThemes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, currentTheme, changeTheme, availableThemes } = useThemeHook();

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, changeTheme, availableThemes }}>
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