import React from 'react';
import { cn } from '@/lib/utils';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
}

const PixelButton = React.forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    // Base classes for all buttons, applying the macOS outset border
    const baseClasses = "px-3 py-1 text-xs cursor-pointer mac-border-outset active:mac-border-inset"; // Adjusted padding and text size

    // Variant-specific classes using the new macOS grayscale palette
    const variantClasses = {
      default: "bg-mac-light-gray text-mac-black", // Standard button
      primary: "bg-mac-medium-gray text-mac-black", // Slightly darker for primary actions
      secondary: "bg-mac-light-gray text-mac-black", // Similar to default, but can be used for semantic clarity
      danger: "bg-red-600 text-mac-white", // Keep red for danger, but with white text
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