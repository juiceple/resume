import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from '@/components/ui/button';
import { ChevronsDown, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import schoolsData from "@/components/signUp/schools.json";


interface SignUpStep2Props {
    onDataChange: (data: Partial<ProfileData>) => void;
    name: string;
    birthDate: string;
}

interface School {
    학교명: string;
    "학교 영문명": string;  // JSON 데이터의 실제 키와 일치하도록 수정
    본분교구분명: string;
    대학구분명: string;
    학교구분명: string;
    설립형태구분명: string;
    시도코드: string;
    시도명: string;
    소재지도로명주소: string;
    소재지지번주소: string;
    도로명우편번호: string;
    소재지우편번호: string;
    홈페이지주소: string;
    대표전화번호: string;
    대표팩스번호: string;
    설립일자: string;
    기준연도: string;
    데이터기준일자: string;
    제공기관코드: string;
    제공기관명: string;
}

interface SchoolsData {
    schools: School[];
}

interface ProfileData {
    name: string;
    birthDate: string;
    career: string;
    workplace: string;
    school?: string;
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
            <div className="flex gap-8">
                <Select value={firstValue} onValueChange={handleFirstChange}>
                    <SelectTrigger className="w-[400px] bg-gray-100 border-2">
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
                        <SelectTrigger className="w-[400px] bg-gray-100 border-2">
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


interface WorkplaceInputProps {
    value: string;
    onChange: (value: string) => void;
    isStudent: boolean;
}


const WorkplaceInput: React.FC<WorkplaceInputProps> = React.memo(({ value, onChange, isStudent }) => {
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showError, setShowError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Hook들을 조건문 밖으로 이동
    const schoolsList = useMemo(() => {
        try {
            return Array.isArray(schoolsData?.schools) ? schoolsData.schools : [];
        } catch (e) {
            console.error('Error accessing schools data:', e);
            return [];
        }
    }, []);

    const filteredSchools = useMemo(() => {
        if (!isStudent) return [];
        if (!searchTerm.trim()) return schoolsList.slice(0, 10);
        
        return schoolsList.filter((school) => {
            const schoolName = (school?.학교명 || '').toLowerCase();
            const schoolEngName = (school?.['학교 영문명'] || '').toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            return schoolName.includes(searchLower) || schoolEngName.includes(searchLower);
        }).slice(0, 50);
    }, [searchTerm, schoolsList, isStudent]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsSearchMode(false);
                if (!value && isStudent) {
                    setShowError(true);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value, isStudent]);

    useEffect(() => {
        if (isSearchMode && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearchMode]);

    const handleButtonClick = useCallback(() => {
        setIsSearchMode(true);
        setShowError(false);
        setSearchTerm("");
    }, []);

    const handleSchoolSelect = useCallback((schoolName: string) => {
        onChange(schoolName);
        setIsSearchMode(false);
        setShowError(false);
        setSearchTerm("");
    }, [onChange]);

    // 직장인 입력 컴포넌트
    if (!isStudent) {
        return (
            <Input
                type="text"
                placeholder="직장명을 입력해주세요"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-[400px] bg-gray-100 border-2"
            />
        );
    }

    // 학생 검색 컴포넌트
    return (
        <div className="w-[400px]" ref={wrapperRef}>
            <div className="relative">
                {isSearchMode ? (
                    <div>
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="학교 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 border-2"
                        />
                        {(searchTerm || (!searchTerm && filteredSchools.length > 0)) && (
                            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                                {filteredSchools.length > 0 ? (
                                    filteredSchools.map((school) => (
                                        <div
                                            key={`${school.학교명}-${school.시도명}`}
                                            className={cn(
                                                "flex flex-col p-2 cursor-pointer hover:bg-gray-100",
                                                value === school.학교명 ? "bg-blue-50" : ""
                                            )}
                                            onClick={() => handleSchoolSelect(school.학교명)}
                                        >
                                            <div className="font-medium">{school.학교명}</div>
                                            <div className="text-sm text-gray-500">
                                                {school.시도명} | {school.대학구분명} | {school.설립형태구분명}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500">검색 결과가 없습니다</div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleButtonClick}
                        className="w-full justify-between bg-gray-100 border-2 h-10 px-3 py-2"
                    >
                        <span className={value ? "text-black" : "text-gray-500"}>
                            {value || "학교를 선택해주세요"}
                        </span>
                        <ChevronsDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                )}
            </div>
        </div>
    );
});

const CareerSelect: React.FC<{
    value: string;
    onChange: (value: string, workplace: string) => void;
    workplace: string;
}> = React.memo(({ value, onChange, workplace }) => {
    const [localWorkplace, setLocalWorkplace] = useState(workplace);

    useEffect(() => {
        setLocalWorkplace('');
    }, [value]);

    const isStudent = value === "학생(0-1년)";

    const handleCareerChange = useCallback((newCareer: string) => {
        onChange(newCareer, '');
        setLocalWorkplace('');
    }, [onChange]);

    const handleWorkplaceChange = useCallback((newWorkplace: string) => {
        setLocalWorkplace(newWorkplace);
        onChange(value, newWorkplace);
    }, [value, onChange]);

    return (
        <div className="grid grid-cols-2 gap-8">
            <div>
                <h2 className="pl-2 text-xl font-semibold mb-4">
                    현재 경력 <span className="text-red-500">*</span>
                </h2>
                <Select value={value} onValueChange={handleCareerChange}>
                    <SelectTrigger className="w-[400px] bg-gray-100 border-2">
                        <SelectValue placeholder="현재 경력 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="학생(0-1년)">학생(0-1년)</SelectItem>
                        <SelectItem value="신입(2-3년)">신입(2-3년)</SelectItem>
                        <SelectItem value="경력(4-7년)">경력(4-7년)</SelectItem>
                        <SelectItem value="경력(7년 이상)">경력(7년 이상)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {value && (
                <div>
                    <h2 className="pl-2 text-xl font-semibold mb-4">
                        {isStudent ? "소속 학교" : "직장"} <span className="text-red-500">*</span>
                    </h2>
                    <WorkplaceInput
                        value={localWorkplace}
                        onChange={handleWorkplaceChange}
                        isStudent={isStudent}
                    />
                </div>
            )}
        </div>
    );
});

const SignUpStep2: React.FC<SignUpStep2Props> = ({ onDataChange, name, birthDate }) => {
    const supabase = createClient();
    const [profileData, setProfileData] = useState<Partial<ProfileData>>({
        career: '',
        workplace: '',
        job: [],
        desiredJob: [],
        country: ''
    });

    const options = useMemo(() => ({
        job: jobCategories,
        desiredJob: jobCategories,
        country: { "대한민국": [], "미국": [], "캐나다": [], "호주": [], "싱가포르": [], "영국": [] , "독일": [] , "프랑스": [] , "기타": [] }
    }), []);

    const handleChange = useCallback((field: keyof Omit<ProfileData, 'name' | 'birthDate'>) => (value: string | string[]) => {
        setProfileData(prev => {
            const newData = { ...prev, [field]: value };
            onDataChange(newData);
            return newData;
        });
    }, [onDataChange]);

    const handleCareerChange = useCallback((career: string, workplace: string) => {
        setProfileData(prev => {
            const newData = { 
                ...prev, 
                career, 
                workplace,
                // career가 변경될 때 관련 필드들 초기화
                job: career !== prev.career ? [] : prev.job,
                desiredJob: career !== prev.career ? [] : prev.desiredJob 
            };
            onDataChange(newData);
            return newData;
        });
    }, [onDataChange]);

    return (
        <div className='flex flex-col h-full justify-center items-center overflow-hidden'>
            <div className='w-full max-w-4xl flex flex-col gap-4 font-bold overflow-y-auto max-h-[calc(100vh-250px)]'>
                <div className="flex flex-col text-center gap-4 border-b-2 text-4xl p-2">
                    <p>환영합니다, {name}님!</p>
                    <p>더욱 정확한 이력서를 위해 프로필을 추가해주세요.</p>
                </div>
                <div className='flex flex-col gap-3 bg-gray-100 rounded-lg p-4'>
                    <CareerSelect
                        value={profileData.career || ''}
                        workplace={profileData.workplace || ''}
                        onChange={handleCareerChange}
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
        </div>
    );
};

export default SignUpStep2;