import Link from "next/link";

// SignupStep3 Component
export const SignupStep3: React.FC<{ formData: any, updateFormData: (data: any) => void }> = ({ formData, updateFormData }) => {
    return (
        <div className="flex flex-col justify-center items-center gap-10">
            <div className="w-[100px] h-[100px] text-[80px] p-0">
                🎉
            </div>
            <h2 className="text-4xl font-bold">{formData.name}님의 회원가입이 완료되었습니다.</h2>
            <p className="text-4xl font-bold">지금 바로 CV메이트와 합격 이력서를 작성해보세요!</p>
            <div className="flex justify-end">
                <Link href={"/docs"}>
                    <button className="w-48 h-12 rounded-xl bg-[#73A2EEA6] text-white focus:bg-[#2871E6] hover:bg-[#2871E6]">
                        Resume 작성하러 가기
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default SignupStep3;