'use client'
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ProfileSkeleton from '@/components/mypage/ProfileSkeleton';
import DocsHeader from '@/components/docs/DocsHeader';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import CustomAlert from '@/components/CustomAlert';
import schoolsData from '@/components/signup/schools.json';
import { ChevronsDown, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"


type TabType = 'profile' | 'info';

interface WorkplaceInputProps {
    value: string;
    onChange: (value: string) => void;
    isStudent: boolean;
}

interface ProfileData {
    career: string;
    job: string[];
    desiredJob: string[];
    country: string;
    workplace: string;
}


interface SelectOptionProps {
    defaultValue: string | string[];
    title: string;
    options: { [key: string]: string[] };
    isDouble?: boolean;
    onChange?: (value: string | string[]) => void;
    placeholders: string[];
}

interface ProfileData {
    career: string;
    job: string[];
    desiredJob: string[];
    country: string;
}

interface UserInfo {
    name: string;
    email: string;
}

interface MyPageData {
    profile: ProfileData;
    userInfo: UserInfo;
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


const useMyPageData = () => {
    const [myPageData, setMyPageData] = useState<MyPageData>({
        profile: {
            career: '',
            job: ['', ''],
            desiredJob: ['', ''],
            country: '',
            workplace: ''
        },
        userInfo: {
            name: '',
            email: ''
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Alert 상태 관리
    const [showAlert, setShowAlert] = useState(false);
    const [alertTitle, setAlertTitle] = useState<string>("");
    const [alertMessage, setAlertMessage] = useState<string>("");

    const fetchMyPageData = async () => {
        const supabase = createClient();
        try {
            setIsLoading(true);
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('No user logged in');

            const { data, error } = await supabase
                .from('profiles')
                .select('name, career, job, desired_job, country, Organization')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setMyPageData({
                    profile: {
                        career: data.career || '',
                        job: Array.isArray(data.job) ? data.job : ['', ''],
                        desiredJob: Array.isArray(data.desired_job) ? data.desired_job : ['', ''],
                        country: data.country || '',
                        workplace: data.Organization || ''
                    },
                    userInfo: {
                        name: data.name || '',
                        email: user.email || ''
                    }
                });
            }
        } catch (err) {
            console.error('Error fetching my page data:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const saveMyPageData = async (updatedData: Partial<MyPageData>) => {
        const supabase = createClient();
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('No user logged in');
    
            if (updatedData.profile) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        user_id: user.id,
                        career: updatedData.profile.career,
                        job: updatedData.profile.job,
                        desired_job: updatedData.profile.desiredJob,
                        country: updatedData.profile.country,
                        Organization: updatedData.profile.workplace, // Add workplace field here
                    });
    
                if (profileError) throw profileError;
            }
    
            if (updatedData.userInfo) {
                if (updatedData.userInfo.name) {
                    const { error: nameError } = await supabase
                        .from('profiles')
                        .update({ name: updatedData.userInfo.name })
                        .eq('user_id', user.id);
    
                    if (nameError) throw nameError;
                }
    
                if (updatedData.userInfo.email) {
                    const { error: emailError } = await supabase.auth.updateUser({
                        email: updatedData.userInfo.email,
                    });
    
                    if (emailError) throw emailError;
                }
            }
    
            setMyPageData(prev => ({
                ...prev,
                ...updatedData
            }));
            setAlertTitle("Success");
            setAlertMessage("데이터가 성공적으로 저장되었습니다.");
            setShowAlert(true);
        } catch (error) {
            console.error('Error saving my page data:', error);
            setAlertTitle("Error");
            setAlertMessage("데이터 저장 중 오류가 발생했습니다.");
            setShowAlert(true);
        }
    };
    

    return { myPageData, setMyPageData, isLoading, error, fetchMyPageData, saveMyPageData };
};



const SelectOption: React.FC<SelectOptionProps> = ({
    defaultValue,
    title,
    options,
    isDouble = false,
    onChange,
    placeholders,
}) => {
    const [firstValue, setFirstValue] = useState<string>(
        Array.isArray(defaultValue) ? defaultValue[0] || '' : defaultValue || ''
    );
    const [secondValue, setSecondValue] = useState<string>(
        Array.isArray(defaultValue) ? defaultValue[1] || '' : ''
    );


    const handleFirstChange = (value: string) => {
        setFirstValue(value);
        setSecondValue('');
        if (onChange) {
            onChange(isDouble ? [value, ''] : value);
        }
    };

    const handleSecondChange = (value: string) => {
        setSecondValue(value);
        if (onChange) {
            onChange([firstValue, value]);
        }
    };

    return (
        <div>
            <h2 className="pl-2 text-xl font-semibold mb-4">{title}</h2>
            <div className={`flex ${isDouble ? 'justify-between' : ''}`}>
                <Select value={firstValue} onValueChange={handleFirstChange}>
                    <SelectTrigger className="w-[180px] border hover:bg-gray-100">
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
                        <SelectTrigger className="w-[180px] border hover:bg-gray-100">
                            <SelectValue placeholder={placeholders[1]} />
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
};

// WorkplaceInput 컴포넌트 정의
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
        <div className="w-[300px] absolute bottom-0 right-0" ref={wrapperRef}>
            <div className="relative">
                {isSearchMode ? (
                    <div>
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="학교 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-1"
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
                        className="w-full justify-between bg-white h-10 px-3 py-2"
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


// ProfileContent 컴포넌트
const ProfileContent: React.FC<{
    profileData: ProfileData;
    saveProfile: (data: Partial<ProfileData>) => Promise<void>;
    updateAlert: (title: string, message: string | string[], show?: boolean) => void;
}> = ({ profileData, saveProfile, updateAlert }) => {
    const [localProfileData, setLocalProfileData] = useState(profileData);

    useEffect(() => {
        setLocalProfileData(profileData);
    }, [profileData]);

    const options = useMemo(() => ({
        career: { "학생(0-1년)": [], "신입(2-3년)": [], "경력(4-7년)": [], "경력(7년 이상)": [] },
        job: jobCategories,
        desiredJob: jobCategories,
        country: { "대한민국": [], "미국": [], "캐나다": [], "호주": [], "싱가포르": [], "영국": [], "독일": [], "프랑스": [], "기타": [] }
        
    }), []);

    const handleChange = (field: keyof ProfileData) => (value: string | string[]) => {
        setLocalProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            await saveProfile(localProfileData);
            updateAlert("Success", "데이터가 성공적으로 저장되었습니다.");
        } catch (error) {
            updateAlert("Error", "데이터 저장 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className='flex flex-col gap-4 pb-4 font-semibold'>
            <div className='flex justify-between relative'>
                <SelectOption
                    defaultValue={localProfileData.career}
                    title="현재 경력"
                    options={options.career}
                    onChange={handleChange('career')}
                    placeholders={["현재 경력 선택"]}
                />
                <WorkplaceInput
                    value={localProfileData.workplace || ''}
                    onChange={(value) => handleChange('workplace')(value)}
                    isStudent={localProfileData.career === "학생(0-1년)"}
                />
            </div>
            <SelectOption
                defaultValue={localProfileData.job}
                title="직종"
                options={options.job}
                isDouble={true}
                onChange={handleChange('job')}
                placeholders={["직종 선택", "세부 직종 선택"]}
            />
            <SelectOption
                defaultValue={localProfileData.desiredJob}
                title="지원하고자 하는 직무는 무엇인가요?"
                options={options.desiredJob}
                isDouble={true}
                onChange={handleChange('desiredJob')}
                placeholders={["직무 선택", "세부 직무 선택"]}
            />
            <SelectOption
                defaultValue={localProfileData.country}
                title="취업하고자 하는 국가는 어디인가요?"
                options={options.country}
                onChange={handleChange('country')}
                placeholders={["국가 선택"]}
            />
            <div className='flex justify-end pr-10'>
                <button
                    className="bg-blue-500 text-white px-6 py-2 rounded-full"
                    onClick={handleSave}
                >
                    저장하기
                </button>
            </div>
        </div>
    );
};

const EditableField: React.FC<{
    label: string;
    value: string;
    onSave: (value: string) => void;
}> = ({ label, value, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleSave = () => {
        onSave(editValue);
        setIsEditing(false);
    };

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center">
                <label className="text-xl font-semibold text-black">{label}</label>
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button onClick={() => setIsEditing(false)} className="rounded-xl bg-gray-100 text-black hover:bg-gray-200">
                            취소
                        </Button>
                        <Button onClick={handleSave} className="rounded-xl bg-blue-500 text-white hover:bg-blue-600">
                            저장
                        </Button>

                    </div>
                ) : (
                    <Button onClick={() => setIsEditing(true)} className="rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600">
                        수정
                    </Button>
                )}
            </div>
            {isEditing ? (
                <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="mt-1 w-full"
                />
            ) : (
                <div className="mt-1">{value}</div>
            )}
        </div>
    );
};

const PasswordChangeForm: React.FC<{
    onCancel: () => void;
    onSubmit: (currentPassword: string, newPassword: string) => void;
}> = ({ onCancel, onSubmit }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Define alert state for CustomAlert
    const [alert, setAlert] = useState({
        show: false,
        title: '',
        message: [] as string[],
    });

    // Function to update alert state
    const updateAlert = (title: string, message: string | string[], show = true) => {
        setAlert({
            title,
            message: Array.isArray(message) ? message : [message],
            show,
        });
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            updateAlert("에러", '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }
        onSubmit(currentPassword, newPassword);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    현재 비밀번호
                </label>
                <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1"
                    placeholder="현재 비밀번호"
                    required
                />
            </div>
            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    새 비밀번호
                </label>
                <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1"
                    placeholder="비밀번호 입력"
                    required
                />
            </div>
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    비밀번호 확인
                </label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1"
                    placeholder="비밀번호 확인"
                    required
                />
            </div>
            <div className="flex justify-end space-x-2">
                <Button type="button" onClick={onCancel} className="rounded-xl bg-gray-200 text-gray-700 ">
                    취소
                </Button>
                <Button type="submit" className="rounded-xl bg-blue-500 text-white hover:bg-blue-600">
                    변경
                </Button>
            </div>
        </form>
    );
};

const InfoContent: React.FC<{
    userInfo: UserInfo;
    saveUserInfo: (data: Partial<UserInfo>) => Promise<void>;
    updateAlert: (title: string, message: string | string[], show?: boolean) => void; // Accept updateAlert as a prop
}> = ({ userInfo, saveUserInfo, updateAlert }) => {
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
        const supabase = createClient();
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: userInfo.email,
                password: currentPassword,
            });

            if (signInError) throw new Error('현재 비밀번호가 올바르지 않습니다.');

            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            updateAlert("Success", "비밀번호가 성공적으로 변경되었습니다."); // Use updateAlert for success
            setIsChangingPassword(false);
        } catch (error) {
            updateAlert("Error", error instanceof Error ? error.message : '비밀번호 변경 중 오류가 발생했습니다.'); // Use updateAlert for error
        }
    };

    return (
        <div className='flex flex-col gap-6'>
            <div>
                <h2 className="text-xl font-semibold mb-4">회원정보</h2>
                <EditableField
                    label="이름"
                    value={userInfo.name}
                    onSave={(value) => saveUserInfo({ name: value })}
                />
                <EditableField
                    label="이메일 주소"
                    value={userInfo.email}
                    onSave={(value) => saveUserInfo({ email: value })}
                />
                <div className="mb-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xl font-semibold text-black">비밀번호</label>
                        {!isChangingPassword && (
                            <Button onClick={() => setIsChangingPassword(true)} className="rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600">
                                수정
                            </Button>
                        )}
                    </div>
                    {isChangingPassword ? (
                        <PasswordChangeForm
                            onCancel={() => setIsChangingPassword(false)}
                            onSubmit={handlePasswordChange}
                        />
                    ) : (
                        <div className="mt-1">********</div>
                    )}
                </div>
            </div>
        </div>
    );
};



export default function MyPage() {
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const searchParams = useSearchParams();
    const router = useRouter();
    const { myPageData, isLoading, error, fetchMyPageData, saveMyPageData } = useMyPageData();

    // Centralized alert state and update function
    const [alert, setAlert] = useState({
        show: false,
        title: '',
        message: [] as string[],
    });

    // UpdateAlert function that can handle multiple messages
    const updateAlert = (title: string, message: string | string[], show = true) => {
        setAlert({
            title,
            message: Array.isArray(message) ? message : [message],
            show,
        });
    };

    useEffect(() => {
        const tab = searchParams.get('tab') as TabType;
        if (tab === 'profile' || tab === 'info') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchMyPageData();
    }, []);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        router.push(`/mypage?tab=${tab}`);
    };

    return (
        <div className="w-full min-h-screen flex flex-col bg-[#EBEEF1]">
            <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
                <DocsHeader />
            </header>
            <main className="flex-grow mt-[100px] mx-auto px-4 py-8 w-full max-w-[600px]">
                <h1 className="text-3xl font-bold mb-6">마이페이지</h1>
                <div className="bg-white  overflow-hidden">
                    <div className="flex gap-1 bg-[#EBEEF1] border-b-2 border-blue-500">
                        {(['profile', 'info'] as const).map((tab) => (
                            <button
                                key={tab}
                                className={`
                        w-36 py-2 px-4 items-center justify-center text-center font-semibold  rounded-t-lg
                        ${activeTab === tab
                                        ? 'bg-[#EDF4FF] text-black border-2 border-[#2871E6] -mb-[2px]'
                                        : 'bg-[#E0E2E5] '
                                    }
                    `}
                                onClick={() => handleTabChange(tab)}
                            >
                                {tab === 'profile' ? '내 커리어' : '회원정보'}
                            </button>
                        ))}
                    </div>
                    <div className="p-6 bg-white">
                        {isLoading ? (
                            <ProfileSkeleton />
                        ) : error ? (
                            <div>에러: {error}</div>
                        ) : activeTab === 'profile' ? (
                            <ProfileContent
                                profileData={myPageData.profile}
                                saveProfile={(data) => saveMyPageData({ profile: { ...myPageData.profile, ...data } })}
                                updateAlert={updateAlert} // Pass down to ProfileContent
                            />
                        ) : (
                            <InfoContent
                                userInfo={myPageData.userInfo}
                                saveUserInfo={(data) => saveMyPageData({ userInfo: { ...myPageData.userInfo, ...data } })}
                                updateAlert={updateAlert} // Pass down to InfoContent
                            />
                        )}

                    </div>
                </div>
                {alert.show && (
                    <CustomAlert
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert({ ...alert, show: false })}
                    />
                )}
            </main>
        </div>
    );
}