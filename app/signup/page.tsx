'use client'

import { createClient } from "@/utils/supabase/client";
import SignupStep1 from '@/components/signup/SignUpStep1';
import SignupStep2 from '@/components/signup/SignUpStep2';
import SignupStep3 from '@/components/signup/SignUpStep3';
import NavigationButtons from '@/components/signup/NavigationButtons';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Fragment } from "react";
import Link from 'next/link'
import Image from "next/image";
import FullScreenLoader from '@/components/FullScreenLoad';
import { CornerUpLeft } from 'lucide-react';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  birthDate: {
    year: string;
    month: string;
    day: string;
  };
  agreements: {
    all: boolean;
    terms: boolean;
    privacy: boolean;
    age: boolean;
    marketing: boolean;
  };
}

interface ProfileData {
  career: string;
  job: string[];
  desiredJob: string[];
  country: string;
}

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthDate: {
      year: '',
      month: '',
      day: ''
    },
    agreements: {
      all: false,
      terms: false,
      privacy: false,
      age: false,
      marketing: false
    }
  });
  const [profileData, setProfileData] = useState<ProfileData>({
    career: '',
    job: [],
    desiredJob: [],
    country: ''
  });
  const router = useRouter();
  const supabase = createClient();

  const loadingCompoSet = (message: string) => {
    setLoading(true);
    setLoadingMessage(message);
  }

  const handleNext = async () => {
    setErrorMessage(null);
    if (currentStep === 1) {
      const success = await createSupabaseAccount();
      if (success) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const success = await uploadProfileData();
      if (success) {
        setCurrentStep(3);
      } else {

      }
    } else {
      completeSignup();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleStep2DataChange = (newData: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...newData }));
  };

  const createSupabaseAccount = async () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
      setErrorMessage("모든 필수 필드를 입력해주세요.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return false;
    }

    if (!formData.agreements.terms || !formData.agreements.privacy || !formData.agreements.age) {
      setErrorMessage("필수 약관에 동의해주세요.");
      return false;
    }

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          birthDate: `${formData.birthDate.year}-${formData.birthDate.month}-${formData.birthDate.day}`,
          terms_accepted: formData.agreements.terms,
          privacy_accepted: formData.agreements.privacy,
          age_verified: formData.agreements.age,
          marketing_accepted: formData.agreements.marketing
        }
      },
    });

    if (error) {
      console.error(error.code + " " + error.message);
      setErrorMessage("계정 생성 중 오류가 발생했습니다.");
      return false;
    }

    return true;
  };

  const uploadProfileData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,  // 명시적으로 user_id를 포함
          name: formData.name,
          birth_date: `${formData.birthDate.year}-${formData.birthDate.month}-${formData.birthDate.day}`,
          career: profileData.career,
          job: profileData.job,
          desired_job: profileData.desiredJob,
          country: profileData.country
          // username 필드는 제거됨
        }, {
          onConflict: 'user_id',  // user_id가 충돌할 경우 업데이트
          ignoreDuplicates: false  // 중복을 무시하지 않고 업데이트 수행
        });

      if (error) {
        console.error('Error updating profile:', error);
        setErrorMessage("프로필 업데이트 중 오류가 발생했습니다.");
        return false;
      }
      console.log('Profile updated successfully');
      return true;
    }
    setErrorMessage("사용자 정보를 찾을 수 없습니다.");
    return false;
  };

  const completeSignup = async () => {
    // Implement any final steps or redirects here
    router.push('/docs');
  };

  useEffect(() => {
    const validateStep1 = () => {
      return (
        formData.email &&
        formData.password &&
        formData.confirmPassword &&
        formData.name &&
        formData.birthDate.year &&
        formData.birthDate.month &&
        formData.birthDate.day &&
        formData.agreements.terms &&
        formData.agreements.privacy &&
        formData.agreements.age
      );
    };

    const validateStep2 = () => {
      return (
        profileData.career &&
        profileData.job.length > 0
      );
    };

    switch (currentStep) {
      case 1:
        setIsNextDisabled(!validateStep1());
        break;
      case 2:
        setIsNextDisabled(!validateStep2());
        break;
      case 3:
        setIsNextDisabled(false);
        break;
    }
  }, [currentStep, formData, profileData]);


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <SignupStep1 formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <SignupStep2
          onDataChange={handleStep2DataChange}
          name={formData.name}
          birthDate={`${formData.birthDate.year}-${formData.birthDate.month}-${formData.birthDate.day}`}
        />;
      case 3:
        return <SignupStep3 formData={formData} updateFormData={updateFormData} />;
      default:
        return <SignupStep1 formData={formData} updateFormData={updateFormData} />;
    }
  };

  return (
    <>
      {loading && <FullScreenLoader message={loadingMessage} />}
      <div className="w-full relative flex flex-col items-center h-screen justify-between">
        <div className="absolute top-0 w-full flex justify-between items-center h-[75px] bg-white px-[30px]">
          <Link href="/docs" onClick={(e) => {
            e.preventDefault();
            loadingCompoSet("문서 목록을 불러오는 중...")
          }}>
            <Image src='/images/resume.png' alt="Logo" width={120} height={40} />
          </Link>
          <Link href={`/`} passHref>
                        <button className="flex Resume-color-60 w-[25px] h-[25px] rounded-md items-center justify-center">
                            <CornerUpLeft className="w-[15px] h-[15px]" />
                        </button>
                    </Link>
        </div>
        <div className="absolute top-[75px] py-4 w-full flex items-center h-[75px] bg-[#EDF4FF]">
          <div className="flex h-full justify-center items-center mx-auto px-4 gap-6">
            {["회원정보 입력하기", "프로필 만들기", "시작하기"].map((label, idx) => {
              const step = idx + 1;
              return (
                <Fragment key={step}>
                  <div className={`flex h-full items-center gap-2 font-bold ${currentStep >= step ? "text-[#2871E6]" : "text-gray-300"} ${currentStep == step ? "border-b-2 border-[#2871E6]" : ""}`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= step ? "bg-[#2871E6]" : "bg-gray-300"}`}>
                      <p className="font-bold text-white">
                        {currentStep > step ? "✓" : step}
                      </p>
                    </div>
                    <div>{label}</div>
                  </div>
                  {step < 3 && <div className={`h-[1px] w-12 ${currentStep > step ? "bg-[#2871E6]" : "bg-gray-300"}`}></div>}
                </Fragment>
              );
            })}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 w-auto">
          {errorMessage && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              {errorMessage}
            </div>
          )}
        </div>
        <div className="absolute w-full flex justify-center top-[150px] pt-6">
          {renderStepContent()}
        </div>
        {currentStep !== 3 && (
          <div className="absolute bottom-4 right-4 w-full flex justify-end py-4">
            <NavigationButtons
              currentStep={currentStep}
              isNextDisabled={isNextDisabled}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </div>
        )}
      </div>
    </>
  );
}