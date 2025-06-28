import React from 'react';
import { cn } from '@/lib/utils';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
}

const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseClasses = "px-4 py-2 text-sm font-pixel cursor-pointer pixel-border pixel-shadow active:pixel-border-inset";

    const variantClasses = {
      default: "bg-emerald-light-green text-emerald-black border-emerald-border",
      primary: "bg-emerald-dark-green text-emerald-white border-emerald-border",
      secondary: "bg-emerald-light-blue text-emerald-black border-emerald-border",
      danger: "bg-red-600 text-emerald-white border-emerald-border",
    };

    return (
      <button
        className={cn(baseClasses, variantClasses[variant], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
PixelButton.displayName = "PixelButton";

export { PixelButton };