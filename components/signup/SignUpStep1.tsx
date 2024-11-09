import React, { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
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
} from "@/components/ui/alert-dialog";
import CustomAlert from '@/components/CustomAlert';

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

const SignupStep1: React.FC<{
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  otpVerified: boolean;
  updateOtpVerified: (verified: boolean) => void;
}> = ({ formData, updateFormData, otpVerified, updateOtpVerified }) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const supabase = createClient();
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

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft]);

  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleSendOtp = async () => {
    if (!validateEmail(formData.email)) {
      setErrors({ ...errors, email: '유효한 이메일 주소를 입력해주세요.' });
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
    });

    if (error) {
      console.error('OTP 발송 오류:', error.message);
      setErrors({ ...errors, email: 'OTP 발송에 실패했습니다.' });
    } else {
      setOtpSent(true);
      setTimeLeft(180); // 3분 타이머 설정
      updateAlert('메일 전송 완료', '인증 메일이 발송되었습니다. 이메일을 확인하세요.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setErrors({ ...errors, email: 'OTP를 입력해주세요.' });
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otp,
      type: 'email',
    });

    if (error) {
      console.error('OTP 인증 오류:', error.message);
      setErrors({ ...errors, email: '잘못된 OTP입니다. 다시 시도해주세요.' });
    } else {
      updateOtpVerified(true); // OTP 인증 완료 상태 업데이트
      updateAlert('인증 완료', '이메일 인증이 완료되었습니다.');
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean | object) => {
    let newErrors = { ...errors };
    delete newErrors[field as keyof FormErrors];

    if (field === 'email' && typeof value === 'string') {
      if (!validateEmail(value)) {
        newErrors.email = '유효한 이메일 주소를 입력해주세요.';
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
          marketing: value,
        },
      });
    } else {
      const newAgreements = { ...formData.agreements, [field]: value };
      const allChecked = Object.keys(newAgreements).every(
        (key) => key === 'all' || newAgreements[key as AgreementField]
      );
      updateFormData({
        agreements: {
          ...newAgreements,
          all: allChecked,
        },
      });
    }
  };

  return (
    <div className="flex flex-col h-full justify-center items-center">
      <div className="w-full max-w-md space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] px-4">
        {/* 이메일 입력란 */}
        <div>
          <label htmlFor="email" className="block text-lg font-medium text-gray-700">
            이메일 <span className="text-red-700">*</span>
          </label>
          <div className="flex gap-2 h-12">
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="h-12 w-full bg-[#F3F4F6] border-none pl-3 pr-20 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="사용하실 이메일을 입력해주세요"
              required
            />
            <button
              onClick={handleSendOtp}
              className="h-full w-24 px-4 bg-blue-500 text-white rounded-md"
              disabled={otpSent && timeLeft > 0}
            >
              {otpSent && timeLeft > 0 ? `재발송 (${timeLeft}초)` : '인증'}
            </button>
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          {otpSent && !otpVerified && (
            <div className="mt-4 flex gap-2 h-12">
              <input
                type="text"
                placeholder="인증 번호 입력"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-12 w-full bg-[#F3F4F6] border-none pl-3 pr-10 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button onClick={handleVerifyOtp} className="h-full w-24 px-4 bg-blue-500 text-white rounded-md">
                확인
              </button>
            </div>
          )}
          {otpVerified && <p className="text-green-500 text-sm mt-1">이메일 인증이 완료되었습니다.</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-lg font-medium text-gray-700">
            비밀번호 <span className="text-red-700">*</span>
          </label>
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
          <label htmlFor="name" className="block text-lg font-medium text-gray-700">
            이름 <span className="text-red-700">*</span>
          </label>
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
          <label className="block text-lg font-medium text-gray-700">
            생년월일 <span className="text-red-700">*</span>
          </label>
          <div className="mt-1 flex space-x-2">
            <input
              type="text"
              value={formData.birthDate.year}
              onChange={(e) => handleInputChange('birthDate', { ...formData.birthDate, year: e.target.value })}
              className="block h-12 w-full bg-[#F3F4F6] border-none pl-3 pr-10 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="생일연도"
            />
            <input
              type="text"
              value={formData.birthDate.month}
              onChange={(e) => handleInputChange('birthDate', { ...formData.birthDate, month: e.target.value })}
              className="block h-12 w-full bg-[#F3F4F6] border-none pl-3 pr-10 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="월"
            />
            <input
              type="text"
              value={formData.birthDate.day}
              onChange={(e) => handleInputChange('birthDate', { ...formData.birthDate, day: e.target.value })}
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
            <hr />
            <label className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.agreements.terms}
                  onChange={(e) => handleAgreementChange('terms', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 shadow-sm"
                />
                <div className="ml-2">이용약관 동의 (필수)</div>
              </div>
              <a href="/terms/이용약관" target="_blank" className="text-blue-600">약관 보기</a>
            </label>
            <label className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.agreements.privacy}
                  onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 shadow-sm"
                />
                <div className="ml-2">개인정보 수집 및 이용 동의 (필수)</div>
              </div>
              <a href="/terms/개인정보처리방침" target="_blank" className="text-blue-600">약관 보기</a>
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
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.agreements.marketing}
                  onChange={(e) => handleAgreementChange('marketing', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 shadow-sm"
                />
                <span className="ml-2">마케팅 정보 수신 동의 (선택)</span>
              </label>
              <a href="/terms/마케팅 이용 및 수신 동의" target="_blank" className="text-blue-600">약관 보기</a>
              
            </div>
          </div>
        </div>
      </div>
      {alert.show && (
        <CustomAlert
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}
    </div>
  );
};

export default SignupStep1;
