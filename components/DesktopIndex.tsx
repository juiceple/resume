import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';
import HomeButton from '@/components/HomeButton';
import './desktop.css'
import dynamic from 'next/dynamic';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,

  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
// 동적 임포트를 사용하여 클라이언트 컴포넌트 로드
const FadeInText = dynamic(() => import('@/components/FadeInText').then(mod => mod.default), { ssr: false });
const CountUp = dynamic(() => import('@/components/CountUp').then(mod => mod.default), { ssr: false });
const SlideUpSection = dynamic(() => import('@/components/SlideUpSection').then(mod => mod.default), { ssr: false });
const FirstVisitAlert = dynamic(() => import('@/components/FirstVisitAlert').then(mod => mod.default), { ssr: false });


const featureData = [
  {
    title: 'ATS-Friendly CV',
    description: '지원공고의 키워드를 AI가 자동으로 추출하여 CV메이트가 ‘핏’한 이력서를 만들어드릴게요.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="39" height="39" viewBox="0 0 39 39" fill="none">
        <path d="M19.5 32.5H34.125" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M29.25 4.67773C28.3358 4.67773 27.459 5.04091 26.8125 5.68738L6.5 25.9999L4.875 32.4999L11.375 30.8749L31.6875 10.5624C32.0076 10.2423 32.2615 9.86227 32.4347 9.44405C32.608 9.02582 32.6971 8.57757 32.6971 8.12488C32.6971 7.67219 32.608 7.22394 32.4347 6.80571C32.2615 6.38749 32.0076 6.00748 31.6875 5.68738C31.3674 5.36728 30.9874 5.11337 30.5692 4.94013C30.1509 4.7669 29.7027 4.67773 29.25 4.67773Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    )
  },
  {
    title: '5초 만에 만드는 CV',
    description: '한국어/영어로 업무경험을 한줄만 적으면, 격식에 맞는 언어표현과 결과의 수치화까지 전부, CV메이트가 만들어요.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="39" height="39" viewBox="0 0 39 39" fill="none">
        <path d="M37.4505 25.9615C36.6285 25.9615 35.8402 25.6397 35.259 25.0669C34.6778 24.4941 34.3513 23.7172 34.3513 22.9071C34.3513 22.5021 34.188 22.1136 33.8974 21.8272C33.6068 21.5408 33.2127 21.3799 32.8017 21.3799C32.3907 21.3799 31.9966 21.5408 31.706 21.8272C31.4153 22.1136 31.2521 22.5021 31.2521 22.9071C31.2521 23.7172 30.9256 24.4941 30.3443 25.0669C29.7631 25.6397 28.9748 25.9615 28.1529 25.9615C27.7419 25.9615 27.3477 26.1224 27.0571 26.4088C26.7665 26.6952 26.6033 27.0837 26.6033 27.4887C26.6033 27.8938 26.7665 28.2822 27.0571 28.5686C27.3477 28.855 27.7419 29.0159 28.1529 29.0159C28.9748 29.0159 29.7631 29.3378 30.3443 29.9106C30.9256 30.4834 31.2521 31.2603 31.2521 32.0704C31.2521 32.4754 31.4153 32.8639 31.706 33.1503C31.9966 33.4367 32.3907 33.5976 32.8017 33.5976C33.2127 33.5976 33.6068 33.4367 33.8974 33.1503C34.188 32.8639 34.3513 32.4754 34.3513 32.0704C34.3513 31.2603 34.6778 30.4834 35.259 29.9106C35.8402 29.3378 36.6285 29.0159 37.4505 29.0159C37.8615 29.0159 38.2556 28.855 38.5462 28.5686C38.8368 28.2822 39.0001 27.8938 39.0001 27.4887C39.0001 27.0837 38.8368 26.6952 38.5462 26.4088C38.2556 26.1224 37.8615 25.9615 37.4505 25.9615Z" fill="#FFF064" />
        <path d="M15.7557 4.58164C14.9337 4.58164 14.1454 4.25983 13.5642 3.68702C12.983 3.1142 12.6565 2.3373 12.6565 1.52721C12.6565 1.12217 12.4932 0.733718 12.2026 0.44731C11.912 0.160902 11.5178 0 11.1069 0C10.6959 0 10.3017 0.160902 10.0111 0.44731C9.72052 0.733718 9.55726 1.12217 9.55726 1.52721C9.55726 2.3373 9.23074 3.1142 8.64952 3.68702C8.06831 4.25983 7.28001 4.58164 6.45805 4.58164C6.04707 4.58164 5.65292 4.74254 5.36232 5.02895C5.07171 5.31536 4.90845 5.70381 4.90845 6.10885C4.90845 6.51389 5.07171 6.90235 5.36232 7.18876C5.65292 7.47516 6.04707 7.63607 6.45805 7.63607C7.28001 7.63607 8.06831 7.95787 8.64952 8.53069C9.23074 9.1035 9.55726 9.88041 9.55726 10.6905C9.55726 11.0955 9.72052 11.484 10.0111 11.7704C10.3017 12.0568 10.6959 12.2177 11.1069 12.2177C11.5178 12.2177 11.912 12.0568 12.2026 11.7704C12.4932 11.484 12.6565 11.0955 12.6565 10.6905C12.6565 9.88041 12.983 9.1035 13.5642 8.53069C14.1454 7.95787 14.9337 7.63607 15.7557 7.63607C16.1667 7.63607 16.5608 7.47516 16.8514 7.18876C17.142 6.90235 17.3053 6.51389 17.3053 6.10885C17.3053 5.70381 17.142 5.31536 16.8514 5.02895C16.5608 4.74254 16.1667 4.58164 15.7557 4.58164Z" fill="#FFEF64" />
        <path d="M34.2267 7.34501L32.0417 5.17636C31.1523 4.34606 29.9739 3.8833 28.7488 3.8833C27.5238 3.8833 26.3453 4.34606 25.4559 5.17636L17.7079 12.8124L1.35956 29.0162C0.488991 29.8752 0 31.0397 0 32.2539C0 33.468 0.488991 34.6325 1.35956 35.4915L3.5445 37.6602C4.41616 38.5182 5.59772 39.0001 6.82966 39.0001C8.0616 39.0001 9.24317 38.5182 10.1148 37.6602L26.6026 21.3801L34.3506 13.8204C35.205 12.9452 35.6718 11.7716 35.6486 10.5574C35.6253 9.34321 35.1139 8.18777 34.2267 7.34501ZM32.0417 11.667L26.6026 17.0734L22.2172 12.7513L27.7028 7.34501C27.9932 7.06056 28.3859 6.90091 28.7953 6.90091C29.2047 6.90091 29.5974 7.06056 29.8878 7.34501L32.0882 9.49838C32.2305 9.64336 32.3422 9.81466 32.4169 10.0024C32.4916 10.1902 32.5278 10.3906 32.5235 10.5922C32.5192 10.7939 32.4744 10.9927 32.3917 11.1771C32.309 11.3616 32.19 11.5281 32.0417 11.667Z" fill="white" />
      </svg>
    )
  },
  {
    title: '해외 대기업 합격 템플릿 CV',
    description: '해외 및 외국계 취업에 사용되는 영문 이력서를 무료로 제공해요. CV메이트에서 이력서를 작성하고 pdf로 쉽게 다운받으세요!',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="39" height="39" viewBox="0 0 39 39" fill="none">
        <path d="M24.5212 13.4225L19.5 3.25L14.4788 13.4225L3.25 15.0638L11.375 22.9775L9.4575 34.1575L19.5 28.8763L29.5425 34.1575L27.625 22.9775L35.75 15.0638L24.5212 13.4225Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    )
  }
];




export default function Index() {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <FirstVisitAlert />

      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center border-b border-b-foreground/10 h-16 bg-white">
        <div className="w-full flex justify-between items-center mx-10 text-sm">
          <Link href="/docs">
            <Image src='/images/resume.png' alt="Logo" width={120} height={40} />
          </Link>
          {/* <AuthButton /> */}

        </div>
      </nav>
      <div className="w-full flex flex-col items-center mt-16">
        <section className="w-full min-h-screen text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[75vh] z-0">
            <Image
              src="/images/indexBG.png"
              alt="Background"
              layout="fill"
              objectFit="cover"
              quality={100}
            />
          </div>
          <div className='relative z-10 px-24 py-12'>
            <h1 className="text-4xl font-bold mb-4">단 2%만이 서류를 통과합니다.</h1>
            <h2 className="text-4xl font-bold mb-8">CV메이트가 상위 2%로 만들어드릴게요.</h2>
            <p>10,000개의 외국 대기업 합격 이력서를 학습한 AI 전문가와 단 몇 분에 꿈을 이루세요!</p>
            <p className="mb-8">출시알람 받고 무료로 체험하세요.</p>
            <div className="flex justify-center space-x-4 mb-12">
              <HomeButton variant="gradient" text="지금 바로 사용해보기" url="/signup" size="medium" />
            </div>
            <div className="flex flex-col items-center w-full max-w-[700px] mx-auto">
              <div className="relative w-[581.257px] h-[420px] mx-auto" style={{ zIndex: 20 }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    borderRadius: '17.007px',
                    border: '12px solid #333',
                    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.40) 70.66%, rgba(51, 51, 51, 0.64) 90.82%, rgba(0, 0, 0, 0.94) 102.78%), linear-gradient(116deg, #333 0%, #596368 53.13%, #333 100%)',
                    filter: 'drop-shadow(0px 20px 20px rgba(0, 0, 0, 0.25))'
                  }}>
                  <div className="w-full h-full rounded-lg" style={{ border: '1px solid #ddd' }}>
                    <div className="relative w-[558.558px] h-[393.99px]">
                      <Image src='/images/laptop.png' alt="resume background" fill />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[765px] mt-[-25px] relative" style={{ zIndex: 20 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="69" viewBox="0 0 806 69" fill="none" preserveAspectRatio="none">
                  <g filter="url(#filter0_d_393_1928)">
                    <path d="M20 0.621094L785.149 0.621094V13.2256C785.149 16.9501 782.728 20.2428 779.152 21.2829C775.46 22.3565 770.744 23.6699 767.046 24.5036C759.054 26.3056 727.239 27.9952 727.239 27.9952L83.942 27.9952C83.1638 27.9952 82.3955 28.0017 81.6173 28.0069C76.1055 28.0439 52.1407 27.9884 36.558 24.4819C33.3232 23.754 29.2414 22.6055 25.94 21.63C22.3911 20.5813 20 17.3022 20 13.6016V0.621094Z" fill="url(#paint0_linear_393_1928)" />
                    <path d="M20 0.621094L785.149 0.621094V13.2256C785.149 16.9501 782.728 20.2428 779.152 21.2829C775.46 22.3565 770.744 23.6699 767.046 24.5036C759.054 26.3056 727.239 27.9952 727.239 27.9952L83.942 27.9952C83.1638 27.9952 82.3955 28.0017 81.6173 28.0069C76.1055 28.0439 52.1407 27.9884 36.558 24.4819C33.3232 23.754 29.2414 22.6055 25.94 21.63C22.3911 20.5813 20 17.3022 20 13.6016V0.621094Z" fill="url(#paint1_linear_393_1928)" fillOpacity="0.3" />
                  </g>
                  <defs>
                    <filter id="filter0_d_393_1928" x="0" y="0.621094" width="805.149" height="67.3911" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                      <feOffset dy="20" />
                      <feGaussianBlur stdDeviation="10" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_393_1928" />
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_393_1928" result="shape" />
                    </filter>
                    <linearGradient id="paint0_linear_393_1928" x1="785.149" y1="0.621418" x2="20" y2="0.621125" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#212121" />
                      <stop offset="0.5" stopColor="#555555" />
                      <stop offset="1" stopColor="#212121" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_393_1928" x1="402.574" y1="0.621094" x2="402.574" y2="28.0123" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#666666" />
                      <stop offset="0.5" stopColor="#666666" />s
                      <stop offset="0.541667" stopOpacity="0.5" />
                      <stop offset="1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full h-[900px] flex flex-col gap-6 py-12 px-24">
          <FadeInText className="text-4xl font-bold">
            CV메이트로 빠르고 손쉽게 <br />합격 영문 이력서를 작성해보세요
          </FadeInText>
          <div className='w-[250px]'>
            <HomeButton variant="gradient" text="지금 바로 사용해보기" url="/signup" size="medium" />
          </div>
          <div className='flex justify-between h-[600px]'>
            <div className='relative basis-1/2 service-feature overflow-hidden p-8'>
              <div className="absolute inset-0 w-[100%]  h-[100%]">
                <Image src='/images/resume-bg.png' alt="resume background" fill style={{ objectFit: 'cover' }} />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                {/* 왼쪽 입력 필드 및 버튼 */}
                <div className="absolute w-[56%] h-[75%] transform -translate-x-[20%] -translate-y-[10%]">
                  <Image src='/images/resume-img-left.png' alt="input fields and buttons" fill style={{ objectFit: 'contain' }} />
                </div>

                {/* 오른쪽 이력서 문서 */}
                <div className="absolute w-[56%] h-[75%] transform translate-x-[20%] translate-y-[10%]">
                  <Image src='/images/resume-img-right.png' alt="resume document" fill style={{ objectFit: 'contain' }} />
                </div>
              </div>
            </div>
            <div className="basis-1/2 flex flex-col">
              {featureData.map((feature, index) => (
                <div key={index} className="basis-1/3 flex gap-4 p-6">
                  <div className="w-[70px] h-[70px] p-[15px] bg-blue-500 rounded-lg">
                    <div className="">
                      {feature.icon}
                    </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="w-full flex flex-col px-24">
          <div className="w-full py-12 text-start">
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                10,000개+ 의 합격 이력서를 학습한 <br /> <span className="highlight-container">
                  <span className="highlight-text py-0.5">CV 메이트가</span>
                  <span className="highlight-background"></span>
                </span> 도와드릴게요!
              </h2>
              <p>어렵고 귀찮게만 느껴졌던 영문 이력서 작성,<br /> 해외, 외국계 합격 이력서 10,000개+를 학습한 AI 전문가 CV메이트가 이젠 대신 해드릴게요!</p>
            </div>
            <div className='flex justify-start pt-6'>
              <HomeButton variant="gradient" text="지금 바로 사용해보기" url="/signup" size="medium" />
            </div>
          </div>
          {/* Statistics Section */}
          <div className="flex w-full px-8 py-12 bg-gray-100 rounded-xl shadow-lg items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">
                현지인도 어려워하는 <br /> 영문 이력서 작성
              </h2>
            </div>
            <div className="flex flex-col gap-8 justify-start max-w-4xl mx-auto">
              <div className="text-start flex gap-6">
                <div className="w-1/5 text-[#2871E6]">
                  <span className="text-4xl font-bold"><CountUp end={75} />%</span>
                </div>
                <div className="w-4/5 flex items-center">
                  <p>지원공고와 맞지 않아 AI(ATS)에 의해 <br /> 자동으로 걸러지는 서류의 비율</p>
                </div>
              </div>
              <hr />
              <div className="text-start flex gap-6">
                <div className="w-1/5 text-[#2871E6]">
                  <span className="text-4xl font-bold"><CountUp end={85} />%</span>
                </div>
                <div className="w-4/5 flex items-center">
                  <p>이력서 작성에 어려움을 겪는 <br /> 경력, 신입직장인</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Event Promotion Section */}
        <SlideUpSection className="w-full h-[800px] flex flex-col w-full justify-center items-center bg-white py-6 text-center">
          <div className="flex flex-col items-center max-w-[800px] mx-auto">
            <h1 className="text-5xl font-bold mb-[50px]">
              <span className="highlight-container relative inline-block">
                <span className="highlight-text px-2 py-0.5 relative z-10">출시 한정</span>
                <span className="highlight-background absolute inset-0 bg-yellow-300 transform -skew-x-12"></span>
              </span> 무료 혜택 제공!
            </h1>
            <div className="relative w-[492px] shadow-md rounded-[30px] overflow-hidden">
              <Image
                src="/images/start-card.png"
                alt="Start Card Background"
                layout="fill"
                objectFit="cover"
                quality={100}
              />
              <div className="relative z-10 p-[60px] flex flex-col items-center gap-6">
                <h3 className="text-2xl font-bold mb-2">출시 EVENT</h3>
                <h2 className="text-4xl font-bold mb-4">무료 200 포인트!</h2>
                <HomeButton variant="gradient" text="지금 혜택 받기" url="/signup" size="small" />
                <p className="text-sm text-white mb-4">출시 기념 무료 포인트로 CVMATE를 체험해보세요!</p>
                <div className='text-start'>
                  <ul className="text-sm font-semibold list-none pl-0">
                    <li>쉽고 간편한 AI 기반 불렛포인트 생성</li>
                    <li>대기업 합격 이력서 템플릿 무료 제공</li>
                    <li>무제한으로 이력서 파일 생성 및 저장</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </SlideUpSection>
      </div>

      <footer className="w-full flex flex-col gap-8 p-8 border-t border-t-foreground/10 bg-[#F7F7F7]">
        <Image src='/images/resume.png' alt="Logo" width={120} height={40} />
        <div>
          <p>상호명: CV메이트</p>
          <p>대표자명: 김예은</p>
          <p>주소: 서울특별시 성북구 안암로 145</p>
          <p>상담문의: cvmate.official@gmail.com (평일 10:00-18:00)</p>
          <p>&copy; 2024 CV메이트. All rights reserved.</p>
        </div>
        <div className='flex gap-10'>
          <Link href="/terms/이용약관"><p className='underline decoration-solid'>이용약관</p></Link>
          <Link href="/terms/개인정보처리방침"><p className='underline decoration-solid'>개인정보 처리방침</p></Link>
          <Link href="/terms/마케팅%20이용%20및%20수신%20동의"><p className='underline decoration-solid'>마케팅 이용 및 수신 동의</p></Link>
        </div>
      </footer>
    </div>
  );
}