import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


interface ProfileData {
    name: string;
    birthDate: string;
    career: string;
    job: string[];
    desiredJob: string[];
    country: string;
  }
  
  interface SelectOptionProps {
      defaultValue: string | string[];
      title: string;
      options: { [key: string]: string[] };
      isDouble?: boolean;
      onChange: (value: string | string[]) => void;
      placeholders: [string, string?];
      required?: boolean;
  }


  const SelectOption: React.FC<SelectOptionProps> = React.memo(({
    defaultValue,
    title,
    options,
    isDouble = false,
    onChange,
    placeholders,
    required = false,
}) => {
    const [firstValue, setFirstValue] = useState<string>(
        Array.isArray(defaultValue) ? defaultValue[0] || '' : defaultValue || ''
    );
    const [secondValue, setSecondValue] = useState<string>(
        Array.isArray(defaultValue) ? defaultValue[1] || '' : ''
    );

    const handleFirstChange = useCallback((value: string) => {
        setFirstValue(value);
        setSecondValue('');
        onChange(isDouble ? [value, ''] : value);
    }, [isDouble, onChange]);

    const handleSecondChange = useCallback((value: string) => {
        setSecondValue(value);
        onChange([firstValue, value]);
    }, [firstValue, onChange]);

    return (
        <div>
            <h2 className="pl-2 text-xl font-semibold mb-4">
                {title} {required && <span className="text-red-500">*</span>}
            </h2>
            <div className={`flex ${isDouble ? 'gap-32' : ''}`}>
                <Select value={firstValue} onValueChange={handleFirstChange}>
                    <SelectTrigger className="w-[180px] bg-gray-100 border-2">
                        <SelectValue placeholder={placeholders[0]} />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(options).map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isDouble && firstValue && (
                    <Select value={secondValue} onValueChange={handleSecondChange}>
                        <SelectTrigger className="w-[180px] bg-gray-100 border-2">
                            <SelectValue placeholder={placeholders[1] || ''} />
                        </SelectTrigger>
                        <SelectContent>
                            {options[firstValue]?.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    );
});


interface SignUpStep2Props {
    onDataChange: (data: Partial<ProfileData>) => void;
    name: string;
    birthDate: string;
}

const SignUpStep2: React.FC<SignUpStep2Props> = ({ onDataChange, name, birthDate }) => {
    const supabase = createClient();
    const [profileData, setProfileData] = useState<Partial<ProfileData>>({
        career: '',
        job: [],
        desiredJob: [],
        country: ''
    });

    const options = useMemo(() => ({
        career: { "Junior": [], "Mid-level": [], "Senior": [] },
        job: {
            "개발자": ["Frontend", "Backend", "Fullstack", "Mobile", "DevOps"],
            "디자이너": ["UI/UX", "그래픽", "모션"],
            "기획자": ["서비스 기획", "전략 기획", "프로덕트 매니저"]
        },
        desiredJob: {
            "개발": ["Web", "Mobile", "AI/ML", "DevOps", "Cloud"],
            "디자인": ["UI/UX", "그래픽", "모션", "3D"],
            "기획": ["서비스 기획", "전략 기획", "프로덕트 매니저", "데이터 분석"]
        },
        country: { "Korea": [], "USA": [], "Japan": [], "China": [], "Singapore": [] }
    }), []);


    const handleChange = useCallback((field: keyof Omit<ProfileData, 'name' | 'birthDate'>) => (value: string | string[]) => {
        setProfileData(prev => {
            const newData = { ...prev, [field]: value };
            onDataChange(newData);
            return newData;
        });
    }, [onDataChange]);

    return (
        <div className='w-3/4 flex flex-col max-w-[900px] gap-4 pb-4 font-semibold'>
            <div className="flex flex-col text-center gap-4 border-b-2 text-4xl p-2">
                <p><strong>환영합니다, </strong> {name}<strong>님!</strong></p>
                <p>더욱 정확한 이력서를 위해 프로필을 추가해주세요.</p>
            </div>
            <div className='flex flex-col gap-3 bg-gray-100 rounded-lg p-4'>
            <SelectOption
                defaultValue={profileData.career || ''}
                title="현재 경력"
                options={options.career}
                onChange={handleChange('career')}
                placeholders={["현재 경력 선택"]}
                required={true}
            />
            <SelectOption
                defaultValue={profileData.job || []}
                title="직종"
                options={options.job}
                isDouble={true}
                onChange={handleChange('job')}
                placeholders={["직종 선택", "세부 직종 선택"]}
                required={true}
            />
            <hr className="my-4 border-gray-300" />
            <SelectOption
                defaultValue={profileData.desiredJob || []}
                title="지원하고자 하는 직무는 무엇인가요?"
                options={options.desiredJob}
                isDouble={true}
                onChange={handleChange('desiredJob')}
                placeholders={["직무 선택", "세부 직무 선택"]}
            />
            <SelectOption
                defaultValue={profileData.country || ''}
                title="취업하고자 하는 국가는 어디인가요?"
                options={options.country}
                onChange={handleChange('country')}
                placeholders={["국가 선택"]}
            />
            </div>
        </div>
    );
};

export default SignUpStep2;