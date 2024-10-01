'use client'
import React, { useState, useEffect, useMemo } from 'react';
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


type TabType = 'profile' | 'info';



interface ProfileData {
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


const useMyPageData = () => {
    const [myPageData, setMyPageData] = useState<MyPageData>({
        profile: {
            career: '',
            job: ['', ''],
            desiredJob: ['', ''],
            country: ''
        },
        userInfo: {
            name: '',
            email: ''
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    console.log(myPageData);

    const fetchMyPageData = async () => {
        const supabase = createClient();
        try {
            setIsLoading(true);
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('No user logged in');

            const { data, error } = await supabase
                .from('profiles')
                .select('name, career, job, desired_job, country')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setMyPageData({
                    profile: {
                        career: data.career || '',
                        job: Array.isArray(data.job) ? data.job : ['', ''],
                        desiredJob: Array.isArray(data.desired_job) ? data.desired_job : ['', ''],
                        country: data.country || ''
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
                        id: user.id,
                        career: updatedData.profile.career,
                        job: updatedData.profile.job,
                        desired_job: updatedData.profile.desiredJob,
                        country: updatedData.profile.country,
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
            alert('데이터가 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error('Error saving my page data:', error);
            alert('데이터 저장 중 오류가 발생했습니다.');
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
            <div className={`flex ${isDouble ? 'gap-32' : ''}`}>
                <Select value={firstValue} onValueChange={handleFirstChange}>
                    <SelectTrigger className="w-[180px]">
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
                        <SelectTrigger className="w-[180px]">
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

const ProfileContent: React.FC<{
    profileData: ProfileData;
    saveProfile: (data: Partial<ProfileData>) => Promise<void>
}> = ({ profileData, saveProfile }) => {
    const [localProfileData, setLocalProfileData] = useState(profileData);

    useEffect(() => {
        setLocalProfileData(profileData);
    }, [profileData]);

    // Use useMemo to memoize the options
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

    const handleChange = (field: keyof ProfileData) => (value: string | string[]) => {
        setLocalProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        saveProfile(localProfileData);
    };

    return (
        <div className='flex flex-col gap-4 pb-4 font-semibold'>
            <SelectOption
                defaultValue={localProfileData.career}
                title="현재 경력"
                options={options.career}
                onChange={handleChange('career')}
                placeholders={["현재 경력 선택"]}
            />
            <SelectOption
                defaultValue={localProfileData.job}
                title="직종"
                options={options.job}
                isDouble={true}
                onChange={handleChange('job')}
                placeholders={["직종 선택", "세부 직종 선택"]}
            />
            <hr className="my-4 border-gray-300" />
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
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
    saveUserInfo: (data: Partial<UserInfo>) => Promise<void>
}> = ({ userInfo, saveUserInfo }) => {
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

            alert('비밀번호가 성공적으로 변경되었습니다.');
            setIsChangingPassword(false);
        } catch (error) {
            console.error('Error updating password:', error);
            alert(error instanceof Error ? error.message : '비밀번호 변경 중 오류가 발생했습니다.');
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
                            />
                        ) : (
                            <InfoContent
                                userInfo={myPageData.userInfo}
                                saveUserInfo={(data) => saveMyPageData({ userInfo: { ...myPageData.userInfo, ...data } })}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}