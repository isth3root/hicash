import React from "react";
import { useTheme } from "../../context/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className, title }) => {
  const { theme } = useTheme();

  return (
    <div className={`${theme.card} shadow-lg rounded-xl p-6 mb-6 border ${theme.border} hover:shadow-xl transition-shadow duration-300 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
