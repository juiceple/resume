import React from 'react';
import Link from 'next/link';

type ButtonVariant = 'gradient' | 'white' | 'outlined';
type ButtonSize = 'small' | 'medium' | 'large';

interface HomeButtonProps {
  variant: ButtonVariant;
  text: string;
  url: string;
  size?: ButtonSize;
}

const HomeButton: React.FC<HomeButtonProps> = ({ variant, text, url, size = 'medium' }) => {
  const baseClasses = "flex items-center justify-center relative rounded-full font-semibold transition-all duration-200 ease-in-out";
  
  const variantClasses: Record<ButtonVariant, string> = {
    gradient: "text-blue-500 hover:bg-[#EDF4FF] group",
    white: "bg-white text-blue-500 hover:bg-gray-100 active:bg-gray-200",
    outlined: "bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100"
  };

  const sizeClasses: Record<ButtonSize, string> = {
    small: "w-36 px-4 py-2 text-s min-h-10",
    medium: "w-48 px-6 py-3 text-xl min-h-12",
    large: "w-60 px-8 py-4 text-2xl min-h-14"
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

  return (
    <Link href={url} passHref>
      <div className={buttonClasses}>
        {variant === 'gradient' && (
          <>
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 p-[2px]">
              <span className="absolute inset-[2px] rounded-full bg-white group-hover:bg-[#EDF4FF] transition-colors duration-200 ease-in-out" />
            </span>
            <span className="relative z-10">{text}</span>
          </>
        )}
        {variant !== 'gradient' && text}
      </div>
    </Link>
  );
};

export default HomeButton;