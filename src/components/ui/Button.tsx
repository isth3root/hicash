import React from "react";
import { useTheme } from "../../context/ThemeContext";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", size = "md", ...props }, ref) => {
    const { theme } = useTheme();

    const baseClasses = "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantClasses = {
      primary: `${theme.primary} hover:opacity-90 text-white focus:ring-primary-500`,
      secondary: `${theme.secondary} hover:opacity-90 text-white focus:ring-secondary-500`,
      danger: `${theme.accent} hover:opacity-90 text-white focus:ring-accent-500`,
      outline: `border border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500`,
    };

    const sizeClasses = {
      sm: "py-1.5 px-3 text-sm",
      md: "py-2 px-4 text-base",
      lg: "py-3 px-6 text-lg",
    };

    return (
      <button
        ref={ref}
        {...props}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      >
        {children}
      </button>
    );
  }
);

export default Button;
