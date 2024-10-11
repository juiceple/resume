import React from 'react';
import Link from "next/link";

export const SignupStep3: React.FC<{ formData: any, updateFormData: (data: any) => void }> = ({ formData, updateFormData }) => {
    return (
        <div className="flex flex-col justify-center items-center h-full gap-8">
            <div className="text-[80px]">
                🎉
            </div>
            <h2 className="text-3xl font-bold text-center">{formData.name}님의 회원가입이 완료되었습니다.</h2>
            <p className="text-2xl font-bold text-center">지금 바로 CV메이트와 합격 이력서를 작성해보세요!</p>
            <Link href="/docs">
                <button className="w-48 h-12 rounded-xl bg-[#73A2EEA6] text-white focus:bg-[#2871E6] hover:bg-[#2871E6]">
                    Resume 작성하러 가기
                </button>
            </Link>
        </div>
    );
};

export default SignupStep3;