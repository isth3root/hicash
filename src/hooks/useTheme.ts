import { useState, useEffect } from 'react';

export type ThemeName = 'light' | 'dark' | 'ocean' | 'sunset';

export interface Theme {
  name: ThemeName;
  background: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
  card: string;
  border: string;
  success: string;
  danger: string;
  warning: string;
  gradient: string;
}

export const themes: Record<ThemeName, Theme> = {
  light: {
    name: 'light',
    background: 'bg-gray-50',
    text: 'text-gray-900',
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    accent: 'bg-accent-600',
    card: 'bg-white',
    border: 'border-gray-200',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-600',
    gradient: 'from-gray-50 to-blue-50'
  },
  dark: {
    name: 'dark',
    background: 'bg-gray-900',
    text: 'text-gray-100',
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    accent: 'bg-red-600',
    card: 'bg-gray-800',
    border: 'border-gray-700',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-600',
    gradient: 'from-gray-900 to-gray-800'
  },
  ocean: {
    name: 'ocean',
    background: 'bg-blue-50',
    text: 'text-gray-900',
    primary: 'bg-teal-600',
    secondary: 'bg-blue-600',
    accent: 'bg-cyan-600',
    card: 'bg-white',
    border: 'border-blue-200',
    success: 'bg-emerald-600',
    danger: 'bg-rose-600',
    warning: 'bg-amber-600',
    gradient: 'from-blue-50 to-cyan-100'
  },
  sunset: {
    name: 'sunset',
    background: 'bg-orange-50',
    text: 'text-gray-900',
    primary: 'bg-orange-600',
    secondary: 'bg-purple-600',
    accent: 'bg-pink-600',
    card: 'bg-white',
    border: 'border-orange-200',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-600',
    gradient: 'from-orange-50 to-pink-100'
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeName>('light');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      // Use requestAnimationFrame to avoid synchronous setState
      requestAnimationFrame(() => {
        setTheme(savedTheme);
      });
    }
  }, []);

  const changeTheme = (newTheme: ThemeName) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return {
    theme: themes[theme],
    currentTheme: theme,
    changeTheme,
    availableThemes: Object.keys(themes) as ThemeName[]
  };
};