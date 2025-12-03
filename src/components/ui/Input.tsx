import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, ...props }, ref) => {

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">{prefix}</span>
            </div>
          )}
          <input
            ref={ref}
            {...props}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
              error
                ? 'border-red-300 focus:ring-red-200'
                : 'border-gray-300 focus:ring-primary-200'
            } ${prefix ? 'pl-8' : ''} ${props.type === 'number' ? 'no-spinner' : ''}`}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

export default Input;
