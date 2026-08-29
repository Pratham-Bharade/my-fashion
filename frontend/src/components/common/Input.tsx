import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          {label} {props.required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 pointer-events-none text-stone-400 dark:text-stone-500">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          type={effectiveType}
          className={`w-full min-h-[44px] rounded-xl border bg-white dark:bg-stone-800 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-1 transition-colors ${
            leftIcon ? 'pl-10' : ''
          } ${isPassword || rightIcon ? 'pr-11' : ''} ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
              : 'border-stone-300 dark:border-stone-700 focus:border-black dark:focus:border-white focus:ring-black dark:focus:ring-white hover:border-stone-400 dark:hover:border-stone-600'
          } ${className}`}
          {...props}
        />
        
        {/* Show/Hide Password Eye Toggle Button */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors focus:outline-none"
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        ) : rightIcon ? (
          <div className="absolute right-3.5 text-stone-400 dark:text-stone-500">
            {rightIcon}
          </div>
        ) : null}
      </div>
      {error ? (
        <span className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-stone-500 dark:text-stone-400">{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
