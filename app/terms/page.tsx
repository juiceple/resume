// app/terms/page.tsx

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TermsSectionProps } from '@/types/terms';
import Image from 'next/image';
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';

const TermsSection: React.FC<TermsSectionProps> = ({ title, date }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/terms/${encodeURIComponent(title)}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="p-4 h-48 border rounded-lg mb-4 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col gap-6"
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-md text-gray-600">{date}</p>
    </div>
  );
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center border-b border-b-foreground/10 h-16 bg-white">
        <div className="w-full flex justify-between items-center px-10 text-sm">
          <Link href="/">
            <Image src='/images/resume.png' alt="Logo" width={120} height={40} />
          </Link>
          <AuthButton />
        </div>
      </nav>
      
      {/* Full width content */}
      <main className="flex-1 w-full mt-16">
        <div className="w-full px-10 py-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">약관 모두보기</h2>
            <TermsSection 
              title="이용약관" 
              date="개인회원 이용약관(2024.11.03 본)"
            />
            <TermsSection 
              title="개인정보처리방침" 
              date="개인정보 처리방침(2024.11.03 본)"
            />
            <TermsSection 
              title="마케팅 이용 및 수신 동의" 
              date="마케팅 이용 및 수신 동의(2024.11.03. 본)"
            />
            <TermsSection 
              title="결제 약관" 
              date="결제 서비스 이용약관(2024.11.09. 본)"
            />
          </div>
        </div>
      </main>
    </div>
  );
}