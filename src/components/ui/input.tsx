import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const fallbackId = React.useId();
    const inputId = id ?? fallbackId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col space-y-2 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="text-sm text-red-500 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
