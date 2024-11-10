import React, { useState } from 'react';

interface FormData {
  name: string;
  birthDate: {
    year: string;
    month: string;
    day: string;
  };
  referralCode: string;
  agreements: {
    all: boolean;
    terms: boolean;
    privacy: boolean;
    age: boolean;
    marketing: boolean;
  };
}

const SignupStep1: React.FC<{
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}> = ({ formData, updateFormData }) => {
  const handleInputChange = (field: keyof FormData, value: string | object) => {
    updateFormData({ [field]: value });
  };

  const handleAgreementChange = (field: keyof FormData['agreements'], value: boolean) => {
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
      updateFormData({
        agreements: {
          ...formData.agreements,
          [field]: value,
        },
      });
    }
  };

  return (
    <div className="flex flex-col h-full justify-center items-center">
      <div className="w-full max-w-md space-y-4 px-4">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-lg font-medium text-gray-700">
            이름 <span className="text-red-700">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="h-12 w-full bg-[#F3F4F6] pl-3 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="가입하시는 분의 실명을 입력해주세요."
            required
          />
        </div>

        {/* Birth Date Input */}
        <div>
          <label className="block text-lg font-medium text-gray-700">
            생년월일 <span className="text-red-700">*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.birthDate.year}
              onChange={(e) => handleInputChange('birthDate', { ...formData.birthDate, year: e.target.value })}
              className="h-12 w-full bg-[#F3F4F6] pl-3 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="생일연도"
            />
            <input
              type="text"
              value={formData.birthDate.month}
              onChange={(e) => handleInputChange('birthDate', { ...formData.birthDate, month: e.target.value })}
              className="h-12 w-full bg-[#F3F4F6] pl-3 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="월"
            />
            <input
              type="text"
              value={formData.birthDate.day}
              onChange={(e) => handleInputChange('birthDate', { ...formData.birthDate, day: e.target.value })}
              className="h-12 w-full bg-[#F3F4F6] pl-3 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="일"
            />
          </div>
        </div>


        {/* Agreement Checkboxes */}
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
    </div>
  );
};

export default SignupStep1;
