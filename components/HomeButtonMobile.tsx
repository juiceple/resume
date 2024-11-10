import React, { useState } from 'react';
import Image from 'next/image';

type ButtonVariant = 'gradient' | 'blue' | 'outlined';
type ButtonSize = 'small' | 'medium' | 'large';

interface HomeButtonProps {
  variant: ButtonVariant;
  text: string;
  url: string;
  size?: ButtonSize;
}

const HomeButton: React.FC<HomeButtonProps> = ({ variant, text, url, size = 'medium' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const baseClasses = "flex items-center justify-center relative rounded-full font-semibold transition-all duration-200 ease-in-out";
  
  const variantClasses: Record<ButtonVariant, string> = {
    gradient: "text-blue-500 hover:bg-[#EDF4FF] group",
    blue: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
    outlined: "bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100"
  };

  const sizeClasses: Record<ButtonSize, string> = {
    small: "min-w-36 px-4 py-2 text-s min-h-10",
    medium: "min-w-48 px-6 py-3 text-xl min-h-12",
    large: "min-w-60 px-8 py-4 text-2xl min-h-14"
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <button onClick={handleClick} className={buttonClasses}>
        {variant === 'gradient' && (
          <>
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 p-[2px]">
              <span className="absolute inset-[2px] rounded-full bg-white group-hover:bg-[#EDF4FF] transition-colors duration-200 ease-in-out" />
            </span>
            <span className="relative z-10">{text}</span>
          </>
        )}
        {variant !== 'gradient' && text}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[300px] p-8 rounded-xl flex flex-col items-center gap-6">
            <div>
              <Image src="/images/resume.png" alt="Logo" width={192} height={68} />
            </div>
            <h2 className="text-xl font-semibold">PC로 만나보세요!</h2>
            <p className="text-sm text-center">
              CVMATE는 PC버전에서만 서비스를 이용하실 수 있는 점 양해부탁드립니다. 
              현재 출시 기념으로 무료 200포인트 제공 이벤트를 진행중이니 지금 바로 PC에서 
              회원가입하고 혜택을 받아보세요!
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-[#2871E6] text-white px-8 py-3 rounded-2xl hover:bg-blue-600"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HomeButton;