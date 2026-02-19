import React, { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  id,
  ...props 
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="space-y-2">
      <label 
        htmlFor={inputId} 
        className="block text-sm font-medium text-slate-300"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full bg-slate-900/50 border rounded-lg py-3 px-4 
            ${icon ? 'pl-10' : 'pl-4'} 
            text-white placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
            transition-all duration-200
            ${error 
              ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' 
              : 'border-slate-700 hover:border-slate-600'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default InputField;