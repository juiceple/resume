'use client';

import React from 'react';

interface NavigationButtonsProps {
    currentStep: number;
    isNextDisabled: boolean;
    onNext: () => void;
    onPrevious: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
    currentStep,
    isNextDisabled,
    onNext,
    onPrevious
}) => {
    return (
        <div className='flex flex-col gap-2 px-12'>
            {isNextDisabled && (
                <div className="text-sm text-center text-red-500 mt-1">
                    모든 필수 항목을 입력해주세요.
                </div>
            )}
            <div className="w-full flex gap-6 justify-between">
                <button
                    onClick={onPrevious}
                    className="w-24 px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                    disabled={currentStep === 1}
                >
                    뒤로가기
                </button>
                <div className="flex flex-col items-end">
                    <button
                        onClick={onNext}
                        className={`w-24 px-4 py-2 bg-blue-500 text-white rounded-md ${isNextDisabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        disabled={isNextDisabled}
                    >
                        다음
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NavigationButtons;