'use client';

import { createClient } from "@/utils/supabase/client";
import SignupStep1 from '@/components/signup/SignUpStep1forGoogle';
import SignupStep2 from '@/components/signup/SignUpStep2';
import SignupStep3 from '@/components/signup/SignUpStep3';
import NavigationButtons from '@/components/signup/NavigationButtons';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Fragment } from "react";
import Link from 'next/link';
import Image from "next/image";
import FullScreenLoader from '@/components/FullScreenLoad';
import { CornerUpLeft } from 'lucide-react';

interface FormData {
  name: string;
  birthDate: {
    year: string;
    month: string;
    day: string;
  };
  referralCode: string; // Add this line
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
  workplace: string;
}

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthDate: {
      year: '',
      month: '',
      day: ''
    },
    referralCode: '', // Initialize this field
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
    country: '',
    workplace: '', // 추가된 필드
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

    if (!formData.agreements.terms || !formData.agreements.privacy || !formData.agreements.age) {
      setErrorMessage("필수 약관에 동의해주세요.");
      return false;
    }

    return true;
  };

  const uploadProfileData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Insert or update profile data in the 'profiles' table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: formData.name,
          birth_date: `${formData.birthDate.year}-${formData.birthDate.month}-${formData.birthDate.day}`,
          career: profileData.career,
          job: profileData.job,
          desired_job: profileData.desiredJob,
          country: profileData.country,
          Organization: profileData.workplace, // 학교/직장 필드 추가
          필수동의사항: {
            terms_accepted: formData.agreements.terms,
            privacy_accepted: formData.agreements.privacy,
            age_verified: formData.agreements.age,
          },
          마케팅동의: formData.agreements.marketing
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });
  
      if (profileError) {
        console.error('Error updating profile:', profileError);
        setErrorMessage("프로필 업데이트 중 오류가 발생했습니다.");
        return false;
      }
  
      // Insert a row in the other table with integer values as 0 and reason as "계정생성"
      const { error: otherTableError } = await supabase
        .from('BulletPointHistory') // Replace with the actual table name
        .insert({
          user_id: user.id, // if user_id is relevant to the other table
          reason: '계정생성',
          changeEventPoint: 200
        });
  
      if (otherTableError) {
        console.error('Error inserting into other table:', otherTableError);
        setErrorMessage("다른 테이블에 데이터 추가 중 오류가 발생했습니다.");
        return false;
      }
  
      return true;
    }
    setErrorMessage("사용자 정보를 찾을 수 없습니다.");
    return false;
  };
  

  const completeSignup = async () => {
    router.push('/docs');
  };

  useEffect(() => {
    const validateStep1 = () => {
      return (
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
        return (
          <SignupStep1
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return <SignupStep2 onDataChange={handleStep2DataChange} name={formData.name} birthDate={`${formData.birthDate.year}-${formData.birthDate.month}-${formData.birthDate.day}`} />;
      case 3:
        return <SignupStep3 formData={formData} updateFormData={updateFormData} />;
      default:
        return <SignupStep1
          formData={formData}
          updateFormData={updateFormData}
        />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {loading && <FullScreenLoader message={loadingMessage} isVisible={true}/>}

      {/* Header */}
      <header className="flex justify-between items-center h-[75px] bg-white px-[30px]">
        <Link href="/" passHref>
          <Image src='/images/resume.png' alt="Logo" width={120} height={40} />
        </Link>
        <Link href="/" passHref>
          <button className="flex Resume-color-60 w-[25px] h-[25px] rounded-md items-center justify-center">
            <CornerUpLeft className="w-[15px] h-[15px]" />
          </button>
        </Link>
      </header>

      {/* Progress Bar */}
      <div className="flex items-center justify-center h-[75px] bg-[#EDF4FF]">
        <div className="flex items-center gap-6">
          {["회원정보 입력하기", "프로필 만들기", "시작하기"].map((label, idx) => {
            const step = idx + 1;
            return (
              <Fragment key={step}>
                <div className={`flex items-center gap-2 font-bold ${currentStep >= step ? "text-[#2871E6]" : "text-gray-300"} ${currentStep == step ? "border-b-2 border-[#2871E6]" : ""}`}>
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

      {/* Main Content */}
      <main className="w-full h-[500px] flex-grow flex flex-col justify-center items-center overflow-hidden">
        {renderStepContent()}
      </main>

      {/* Footer */}
      <footer className="h-[75px] flex justify-end items-center px-[30px] pb-[30px]">
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mr-4">
            {errorMessage}
          </div>
        )}
        {currentStep !== 3 && (
          <NavigationButtons
            currentStep={currentStep}
            isNextDisabled={isNextDisabled}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
      </footer>
    </div>
  );
}
