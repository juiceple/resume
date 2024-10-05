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

  const jobCategories = {
    "개발": ["프론트엔드 개발", "백엔드 개발", "웹 개발", "iOS 개발", "안드로이드 개발", "데브옵스", "네트워크 엔지니어링", "시스템 엔지니어링", "DBA", "게임 개발", "QA", "클라우드 엔지니어링", "사이버보안", "솔루션 아키텍트", "기타"],
    "데이터 & AI": ["데이터 분석가", "데이터 엔지니어", "데이터 사이언티스트", "머신러닝 엔지니어", "빅데이터 엔지니어", "BI 엔지니어", "AI 엔지니어", "기타"],
    "금융/재무": ["재무기획/분석", "투자/기업금융", "세일즈 & 트레이딩", "자산운용", "리스크 관리", "보험", "PE", "헤지펀드", "VC", "기타"],
    "경영 & 전략": ["사업 기획", "컨설팅", "기타"],
    "마케팅": ["브랜드 마케팅", "소셜 미디어 마켓팅", "MD", "PR", "퍼포먼스 마케팅", "CRM 마케팅", "광고 마케팅", "기타"],
    "영업 & 고객지원": ["어카운트 매니지먼트", "해외영업", "국내영업", "IT 영업", "세일즈 엔지니어링", "사업개발", "고객 지원", "기타"],
    "디자인": ["UX/UI 디자인", "그래픽 디자인", "제품 디자인", "영상 디자인", "웹 디자인", "기타"],
    "PM/PO": ["프로덕트 매니저", "프로덕트 오너", "프로젝트 매니저", "UX 리서처", "기타"],
    "회계 & 감사 & 세무": ["회계", "감사", "세무"],
    "법률": ["변호사", "기타"],
    "교육": ["교수", "교사", "강사", "기타"],
    "HR": ["채용", "HRD", "기타"],
    "엔지니어링": ["하드웨어 엔지니어링", "기타"],
    "기타": []
  };

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
        career: { "학생(0-1년)": [], "신입(2-3년)": [], "경력(4-7년)": [], "경력(7년 이상)": [] },
        job: jobCategories,
        desiredJob: jobCategories,
        country: { "대한민국": [], "미국": [], "캐나다": [], "호주": [], "싱가포르": [], "영국": [] , "독일": [] , "프랑스": [] , "기타": []  }
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