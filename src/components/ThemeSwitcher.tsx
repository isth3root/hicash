import React from 'react';
import { useTheme } from '../context/ThemeContext';
import * as Lucide from 'lucide-react';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, changeTheme, availableThemes } = useTheme();

  const themeIcons: Record<string, React.ReactNode> = {
    light: <Lucide.Sun className="w-5 h-5" />,
    dark: <Lucide.Moon className="w-5 h-5" />,
    ocean: <Lucide.Droplet className="w-5 h-5" />,
    sunset: <Lucide.Sunset className="w-5 h-5" />
  };

  const themeColors: Record<string, string> = {
    light: 'bg-yellow-100 text-yellow-800',
    dark: 'bg-gray-700 text-gray-200',
    ocean: 'bg-blue-100 text-blue-800',
    sunset: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="flex items-center gap-2">
      {availableThemes.map((themeName) => (
        <button
          key={themeName}
          onClick={() => changeTheme(themeName)}
          className={`p-2 rounded-full transition-all ${
            currentTheme === themeName
              ? `${themeColors[themeName]} ring-2 ring-offset-2 ring-primary-500`
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label={`Switch to ${themeName} theme`}
        >
          {themeIcons[themeName]}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;