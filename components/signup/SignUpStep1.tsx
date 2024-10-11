import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  birthDate?: string;
}

type AgreementField = 'all' | 'terms' | 'privacy' | 'age' | 'marketing';

const SignupStep1: React.FC<{formData: FormData, updateFormData: (data: Partial<FormData>) => void}> = ({formData, updateFormData}) => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateName = (name: string): boolean => {
    return /^[가-힣a-zA-Z\s]+$/.test(name);
  };

  const validateBirthDate = (year: string, month: string, day: string): boolean => {
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);

    return (
      yearNum >= 1900 && yearNum <= new Date().getFullYear() &&
      monthNum >= 1 && monthNum <= 12 &&
      dayNum >= 1 && dayNum <= 31
    );
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean | object) => {
    let newErrors = { ...errors };
    delete newErrors[field as keyof FormErrors];

    if (field === 'email' && typeof value === 'string') {
      if (!validateEmail(value)) {
        newErrors.email = '유효한 이메일 주소를 입력해주세요.';
      }
    } else if (field === 'password' && typeof value === 'string') {
      if (!validatePassword(value)) {
        newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
      }
    } else if (field === 'confirmPassword' && typeof value === 'string') {
      if (value !== formData.password) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }
    } else if (field === 'name' && typeof value === 'string') {
      if (!validateName(value)) {
        newErrors.name = '이름은 한글 또는 영문만 입력 가능합니다.';
      }
    } else if (field === 'birthDate' && typeof value === 'object') {
      const { year, month, day } = value as FormData['birthDate'];
      if (!validateBirthDate(year, month, day)) {
        newErrors.birthDate = '유효한 생년월일을 입력해주세요.';
      }
    }

    setErrors(newErrors);
    updateFormData({ [field]: value });
  };

  const handleAgreementChange = (field: AgreementField, value: boolean) => {
    if (field === 'all') {
      updateFormData({
        agreements: {
          all: value,
          terms: value,
          privacy: value,
          age: value,
          marketing: value
        }
      });
    } else {
      const newAgreements = { ...formData.agreements, [field]: value };
      const allChecked = Object.keys(newAgreements).every(key => key === 'all' || newAgreements[key as AgreementField]);
      updateFormData({
        agreements: {
          ...newAgreements,
          all: allChecked
        }
      });
    }
  };

  return (
    <div className="flex flex-col h-full justify-center items-center">
    <div className="w-full max-w-md space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] px-4">
      <div>
        <label htmlFor="email" className="block text-lg font-medium text-gray-700">이메일 <span className='text-red-700'>*</span></label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="h-12 w-full bg-[#F3F4F6] border-none pl-3 pr-10 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="사용하실 이메일을 입력해주세요"
          required
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-lg font-medium text-gray-700">비밀번호 <span className='text-red-700'>*</span></label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className="h-12 w-full bg-[#F3F4F6] border-none pl-3 pr-10 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="비밀번호 (8자 이상)"
          required
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>
      <div>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          className="h-12 w-full bg-[#F3F4F6] border-none pl-3 pr-10 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="비밀번호를 다시 입력해주세요."
          required
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
      </div>
      <div>
        <label htmlFor="name" className="block text-lg font-medium text-gray-700">이름 <span className='text-red-700'>*</span></label>
        <input 
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="h-12 w-full bg-[#F3F4F6] border-none pl-3 pr-10 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="가입하시는 분의 실명을 입력해주세요."
          required
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-lg font-medium text-gray-700">생년월일 <span className='text-red-700'>*</span></label>
        <div className="mt-1 flex space-x-2">
          <input
            type="text"
            value={formData.birthDate.year}
            onChange={(e) => handleInputChange('birthDate', {...formData.birthDate, year: e.target.value})}
            className="block h-12 w-full bg-[#F3F4F6] border-none pl-3 pr-10 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="생일연도"
          />
          <input
            type="text"
            value={formData.birthDate.month}
            onChange={(e) => handleInputChange('birthDate', {...formData.birthDate, month: e.target.value})}
            className="block h-12 w-full bg-[#F3F4F6] border-none pl-3 pr-10 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="월"
          />
          <input
            type="text"
            value={formData.birthDate.day}
            onChange={(e) => handleInputChange('birthDate', {...formData.birthDate, day: e.target.value})}
            className="block h-12 w-full bg-[#F3F4F6] border-none pl-3 pr-10 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="일"
          />
        </div>
        {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
      </div>
      <div>
          <label className="block text-lg font-medium text-gray-700">이용약관</label>
          <div className="flex flex-col mt-2 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.agreements.all}
                onChange={(e) => handleAgreementChange('all', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 shadow-sm"
              />
              <span className="ml-2 text-lg">아래 내용에 모두 동의합니다.</span>
            </label>
          <hr/>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.agreements.terms}
              onChange={(e) => handleAgreementChange('terms', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 shadow-sm"
            />
            <div className='flex justify-between w-full'>
              <div className="ml-2">이용약관 동의 (필수)</div>
              <AlertDialog>
                <AlertDialogTrigger className="text-black hover:underline">약관 보기</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>이용약관</AlertDialogTitle>
                    <AlertDialogDescription>
                      {/* 여기에 실제 이용약관 내용을 넣으세요 */}
                      이용약관 내용...
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction className='bg-[#2871E6]'>확인</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.agreements.privacy}
              onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 shadow-sm"
            />
            <div className='flex justify-between w-full'>
              <div className="ml-2">개인정보 수집 및 이용 동의 (필수)</div>
              <AlertDialog>
                <AlertDialogTrigger className="text-black hover:underline">약관 보기</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>개인정보 수집 및 이용 동의</AlertDialogTitle>
                    <AlertDialogDescription>
                      {/* 여기에 실제 개인정보 수집 및 이용 동의 내용을 넣으세요 */}
                      개인정보 수집 및 이용 동의 내용...
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction className='bg-[#2871E6]'>확인</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.agreements.age}
              onChange={(e) => handleAgreementChange('age', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 shadow-sm"
            />
            <span className="ml-2">만 14세 이상입니다. (필수)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.agreements.marketing}
              onChange={(e) => handleAgreementChange('marketing', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 shadow-sm"
            />
            <span className="ml-2">마케팅 정보 수신 동의 (선택)</span>
          </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupStep1;