// app/terms/[title]/page.tsx

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { TermsContent } from '@/types/terms';
import Image from 'next/image';
import Link from 'next/link';

interface AccordionSectionProps {
  title: string;
  content: string | React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center bg-gray-50 rounded-t-lg"
      >
        <span className="font-medium">{title}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="p-4 border-t">
          {typeof content === 'string' ? (
            <p>{content}</p>
          ) : (
            content
          )}
        </div>
      )}
    </div>
  );
};

export default function TermsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const title = decodeURIComponent(params.title as string);

  const termsContent = {
    '이용약관': {
      sections: [
        {
          title: '제 1 장 (목적)',
          content: '본 약관은 CVMATE(이하 "회사")이 운영하는 웹사이트(이하 "사이트")에서 제공하는 제반 서비스를 이용함에 있어, 사이트와 회원 간의 이용 조건 및 제반 절차, 기타 필요한 사항을 규정함을 목적으로 한다.'
        },
        {
          title: '제 2 장 (용어의 정의)',
          content: (
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                "사이트"라 함은 "회사"가 서비스를 "회원"에게 제공하기 위하여 컴퓨터 등 정보 통신 설비를 이용하여 설정한 가상의 영업장 또는 "회사"가 운영하는 이래 웹사이트를 말한다.
                <p className="pl-4 mt-1">가. cvmate.site</p>
              </li>
              <li>"서비스"라 함은 "회사"가 "사이트"를 통해 개인이 등록한 자료를 DB화하여 각각의 목적에 맞게 분류, 가공, 집계하여 정보를 제공하는 서비스, 개인이 등록한 자료를 통해 영문이력서를 생성하는 서비스, 기업에 관한 자료를 수집, 분류, 가공하여 정보를 제공하는 서비스 등 이 이후 서비스와 관련하여 각 "사이트"에서 제공하는 모든 부대/제휴 서비스를 총칭한다.</li>
              <li>"회원"이라 함은 서비스를 이용하기 위하여 동 약관에 동의하거나 피스톡 등 연동된 서비스를 통해 "회사"와 이용 계약을 체결한 개인을 말한다.</li>
            </ol>
          )
        }
      ]
    },
    '개인정보처리방침': {
      sections: [
        {
          title: '제 1 장 (개인정보의 처리목적)',
          content: '개인정보 처리 목적에 대한 내용...'
        },
        {
          title: '제 2 장 (개인정보의 처리 및 보유기간)',
          content: '개인정보 처리 및 보유기간에 대한 내용...'
        }
      ]
    },
    '마케팅 이용 및 수신 동의': {
      sections: [
        {
          title: '제 1 장 (마케팅 활용 목적)',
          content: '마케팅 활용 목적에 대한 내용...'
        },
        {
          title: '제 2 장 (마케팅 정보의 수신)',
          content: '마케팅 정보 수신에 대한 내용...'
        }
      ]
    }
  };

  const handleBack = () => {
    router.push('/terms');
  };

  const content = termsContent[title as keyof typeof termsContent];

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center border-b border-b-foreground/10 h-16 bg-white">
          <div className="w-full flex justify-between items-center px-10 text-sm">
            <Link href="/">
              <Image src='/images/resume.png' alt="Logo" width={120} height={40} />
            </Link>
          </div>
        </nav>
        <main className="flex-1 w-full mt-16">
          <div className="w-full px-10 py-8">
            <h1 className="text-2xl font-bold">약관을 찾을 수 없습니다</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center border-b border-b-foreground/10 h-16 bg-white">
        <div className="w-full flex justify-between items-center px-10 text-sm">
          <Link href="/">
            <Image src='/images/resume.png' alt="Logo" width={120} height={40} />
          </Link>
        </div>
      </nav>

      <main className="flex-1 w-full mt-16">
        <div className="w-full px-10 py-8">
          <button 
            onClick={handleBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="mr-2" size={20} />
            뒤로가기
          </button>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-sm text-gray-600 mb-6">{new Date().toLocaleDateString()} 분</p>
            
            <div className="space-y-4">
              {content.sections.map((section, index) => (
                <AccordionSection
                  key={index}
                  title={section.title}
                  content={section.content}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}