"use client"
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';
import './mobile.css'
import dynamic from 'next/dynamic';
// 동적 임포트를 사용하여 클라이언트 컴포넌트 로드
const FadeInText = dynamic(() => import('@/components/FadeInText').then(mod => mod.default), { ssr: false });
const CountUp = dynamic(() => import('@/components/CountUp').then(mod => mod.default), { ssr: false });
const SlideUpSection = dynamic(() => import('@/components/SlideUpSection').then(mod => mod.default), { ssr: false });
const FirstVisitAlert = dynamic(() => import('@/components/FirstVisitAlertMobile').then(mod => mod.default), { ssr: false });
const HomeButton =dynamic(() => import('@/components/HomeButtonMobile').then(mod => mod.default), { ssr: false });
const featureData = [
    {
        title: 'ATS-Friendly CV',
        description: '지원공고의 키워드를 AI가 자동으로 추출하여 CV메이트가 ‘핏’한 이력서를 만들어드릴게요.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 16.6665H17.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M15 2.39893C14.5312 2.39893 14.0815 2.58517 13.75 2.91669L3.33333 13.3334L2.5 16.6667L5.83333 15.8334L16.25 5.41669C16.4142 5.25254 16.5444 5.05766 16.6332 4.84319C16.722 4.62871 16.7678 4.39884 16.7678 4.16669C16.7678 3.93455 16.722 3.70467 16.6332 3.4902C16.5444 3.27572 16.4142 3.08084 16.25 2.91669C16.0858 2.75254 15.891 2.62233 15.6765 2.53349C15.462 2.44465 15.2321 2.39893 15 2.39893Z" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        )
    },
    {
        title: '5초 만에 만드는 CV',
        description: '한국어/영어로 업무경험을 한줄만 적으면, 격식에 맞는 언어표현과 결과의 수치화까지 전부, CV메이트가 만들어요.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                <path d="M19.301 14.2177C18.8794 14.2177 18.4752 14.0527 18.1771 13.7589C17.8791 13.4652 17.7116 13.0668 17.7116 12.6514C17.7116 12.4436 17.6279 12.2444 17.4789 12.0976C17.3298 11.9507 17.1277 11.8682 16.917 11.8682C16.7062 11.8682 16.5041 11.9507 16.355 12.0976C16.206 12.2444 16.1223 12.4436 16.1223 12.6514C16.1223 13.0668 15.9548 13.4652 15.6568 13.7589C15.3587 14.0527 14.9545 14.2177 14.5329 14.2177C14.3222 14.2177 14.1201 14.3002 13.971 14.4471C13.822 14.594 13.7383 14.7932 13.7383 15.0009C13.7383 15.2086 13.822 15.4078 13.971 15.5547C14.1201 15.7016 14.3222 15.7841 14.5329 15.7841C14.9545 15.7841 15.3587 15.9491 15.6568 16.2429C15.9548 16.5366 16.1223 16.935 16.1223 17.3505C16.1223 17.5582 16.206 17.7574 16.355 17.9043C16.5041 18.0511 16.7062 18.1337 16.917 18.1337C17.1277 18.1337 17.3298 18.0511 17.4789 17.9043C17.6279 17.7574 17.7116 17.5582 17.7116 17.3505C17.7116 16.935 17.8791 16.5366 18.1771 16.2429C18.4752 15.9491 18.8794 15.7841 19.301 15.7841C19.5117 15.7841 19.7138 15.7016 19.8629 15.5547C20.0119 15.4078 20.0956 15.2086 20.0956 15.0009C20.0956 14.7932 20.0119 14.594 19.8629 14.4471C19.7138 14.3002 19.5117 14.2177 19.301 14.2177Z" fill="#FFF064" />
                <path d="M8.17499 3.25386C7.75347 3.25386 7.34921 3.08883 7.05115 2.79508C6.7531 2.50132 6.58565 2.10291 6.58565 1.68748C6.58565 1.47977 6.50192 1.28056 6.3529 1.13369C6.20387 0.986811 6.00174 0.904297 5.79098 0.904297C5.58022 0.904297 5.37809 0.986811 5.22906 1.13369C5.08003 1.28056 4.99631 1.47977 4.99631 1.68748C4.99631 2.10291 4.82886 2.50132 4.5308 2.79508C4.23275 3.08883 3.82849 3.25386 3.40697 3.25386C3.19621 3.25386 2.99409 3.33637 2.84506 3.48325C2.69603 3.63012 2.6123 3.82933 2.6123 4.03704C2.6123 4.24476 2.69603 4.44396 2.84506 4.59084C2.99409 4.73771 3.19621 4.82023 3.40697 4.82023C3.82849 4.82023 4.23275 4.98526 4.5308 5.27901C4.82886 5.57276 4.99631 5.97117 4.99631 6.3866C4.99631 6.59431 5.08003 6.79352 5.22906 6.9404C5.37809 7.08727 5.58022 7.16979 5.79098 7.16979C6.00174 7.16979 6.20387 7.08727 6.3529 6.9404C6.50192 6.79352 6.58565 6.59431 6.58565 6.3866C6.58565 5.97117 6.7531 5.57276 7.05115 5.27901C7.34921 4.98526 7.75347 4.82023 8.17499 4.82023C8.38575 4.82023 8.58787 4.73771 8.7369 4.59084C8.88593 4.44396 8.96965 4.24476 8.96965 4.03704C8.96965 3.82933 8.88593 3.63012 8.7369 3.48325C8.58787 3.33637 8.38575 3.25386 8.17499 3.25386Z" fill="#FFEF64" />
                <path d="M17.6478 4.67074L16.5274 3.55862C16.0713 3.13282 15.4669 2.89551 14.8387 2.89551C14.2104 2.89551 13.6061 3.13282 13.15 3.55862L9.17667 7.47455L0.792914 15.7842C0.346468 16.2247 0.0957031 16.8219 0.0957031 17.4445C0.0957031 18.0671 0.346468 18.6643 0.792914 19.1049L1.9134 20.217C2.3604 20.657 2.96633 20.9041 3.59809 20.9041C4.22986 20.9041 4.83579 20.657 5.28279 20.217L13.7381 11.8682L17.7114 7.99145C18.1495 7.54266 18.3889 6.9408 18.377 6.31813C18.3651 5.69546 18.1028 5.10293 17.6478 4.67074ZM16.5274 6.88716L13.7381 9.65964L11.4892 7.44322L14.3023 4.67074C14.4512 4.52487 14.6526 4.443 14.8625 4.443C15.0725 4.443 15.2739 4.52487 15.4228 4.67074L16.5512 5.77504C16.6241 5.84938 16.6814 5.93723 16.7197 6.03351C16.758 6.12979 16.7766 6.2326 16.7744 6.33599C16.7722 6.43939 16.7492 6.54133 16.7068 6.63593C16.6644 6.73053 16.6034 6.81592 16.5274 6.88716Z" fill="white" />
            </svg>
        )
    },
    {
        title: '해외 대기업 합격 템플릿 CV',
        description: '해외 및 외국계 취업에 사용되는 영문 이력서를 무료로 제공해요. CV메이트에서 이력서를 작성하고 pdf로 쉽게 다운받으세요!',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5753 6.88317L10.0003 1.6665L7.42533 6.88317L1.66699 7.72484L5.83366 11.7832L4.85033 17.5165L10.0003 14.8082L15.1503 17.5165L14.167 11.7832L18.3337 7.72484L12.5753 6.88317Z" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        )
    }
];




export default function Index() {
    return (
        <div className="flex-1 w-full flex flex-col items-center">
            <FirstVisitAlert />
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center border-b border-b-foreground/10 h-16 bg-white">
                <div className="w-full flex justify-between items-center px-4 text-sm">
                    <Link href="/docs">
                        <Image src='/images/resume.png' alt="Logo" width={100} height={33} />
                    </Link>
                </div>
            </nav>
            <div className="w-full flex flex-col mt-16">
                <section className="w-full h-[600px] text-center relative overflow-hidden">
                    <div className='page-bg p-8 pt-12 w-full h-full flex flex-col items-center'>
                        <h1 className="text-lg font-bold mb-4">단 2%만이 서류를 통과합니다.</h1>
                        <h2 className="text-lg font-bold mb-8">CV메이트가 상위 2%로 만들어드릴게요.</h2>
                        <p className="mb-2 text-sm sm:text-base">10,000개의 외국 대기업 합격 이력서를 학습한 AI 전문가와 단 몇 분에 꿈을 이루세요!</p>
                        <p className="mb-4 text-sm sm:text-base">출시알람 받고 무료로 체험하세요.</p>
                        <div className="flex justify-center mb-6">
                            <HomeButton variant="gradient" text="지금 이용하러 가기" url="/signup" size="small" />
                        </div>
                    </div>
                    <div className="absolute top-[200px] left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-sm flex flex-col items-center">
                        <div className="relative w-[272px] h-[200px] mx-auto" style={{ zIndex: 10 }}>
                            <div className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
                                style={{
                                    borderRadius: '10px',
                                    border: '6px solid #333',
                                    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.40) 70.66%, rgba(51, 51, 51, 0.64) 90.82%, rgba(0, 0, 0, 0.94) 102.78%), linear-gradient(116deg, #333 0%, #596368 53.13%, #333 100%)',
                                    filter: 'drop-shadow(0px 10px 10px rgba(0, 0, 0, 0.25))'
                                }}>
                                <div className="w-full h-full rounded-lg" style={{ border: '1px solid #ddd' }}>
                                    <div className="relative w-full h-full">
                                        <Image src='/images/laptop.png' alt="resume background" layout="fill" objectFit="contain" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-[320px] mt-[-15px] relative" style={{ zIndex: 20 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="40" viewBox="0 0 300 40" fill="none" preserveAspectRatio="none">
                                <path d="M0 0H300V8C300 10 299 12 297 13C295 14 292 15 290 16C286 17 270 18 270 18H30C29 18 28 18 27 18C24 18 10 18 5 16C3 15 1 14 0 13V0Z" fill="url(#paint0_linear)" />
                                <defs>
                                    <linearGradient id="paint0_linear" x1="300" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#212121" />
                                        <stop offset="0.5" stopColor="#555555" />
                                        <stop offset="1" stopColor="#212121" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="w-full h-auto flex flex-col gap-6 items-center p-6">
                    <div className='flex flex-col gap-6'>
                        <FadeInText className="text-xl font-bold text-start">
                            CV메이트로 빠르고 손쉽게 <br />합격 영문 이력서를 작성해보세요
                        </FadeInText>
                        <div className='w-32'>
                            <HomeButton variant="gradient" text="지금 이용하러가기" url="/signup" size="small" />
                        </div>
                    </div>
                    <div className='relative overflow-hidden p-8 w-[300px] h-[330px]'>
                        <div className="absolute inset-0 w-[100%] h-[100%]">
                            <Image src='/images/resume-bg.png' alt="resume background" fill />
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
                    <div className="flex flex-col">
                        {featureData.map((feature, index) => (
                            <div key={index} className="basis-1/3 flex gap-6 p-2">
                                <div className="w-[38px] h-[38px] p-[9px] bg-blue-500 rounded-lg">
                                    <div className="">
                                        {feature.icon}
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <h3 className="text-xl font-bold">{feature.title}</h3>
                                    <p className="text-xs">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                </section>

                {/* Social Proof Section */}
                <section className="w-full flex flex-col p-8">
                    <div className="w-full py-12 text-start">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                10,000개+ 의 합격 이력서를 학습한 <br /> <span className="highlight-container">
                                    <span className="highlight-text py-0.5">CV 메이트가</span>
                                    <span className="highlight-background"></span>
                                </span> 도와드릴게요!
                            </h2>
                            <p className="text-xs mb-8">어렵고 귀찮게만 느껴졌던 영문 이력서 작성,<br /> 해외, 외국계 합격 이력서 10,000개+를 학습한 AI 전문가 CV메이트가 이젠 대신 해드릴게요!</p>
                        </div>
                        <div className='flex justify-start'>
                            <HomeButton variant='blue' text='지금 이용하러가기' url='/signup' size='small'></HomeButton>
                        </div>
                    </div>
                    {/* Statistics Section */}
                    <h2 className="text-2xl font-bold mb-4">
                        현지인도 어려워하는 <br /> 영문 이력서 작성
                    </h2>
                    <div className="flex flex-col w-full px-8 py-12 bg-gray-100 rounded-xl shadow-lg items-center">
                        <div className="flex flex-col gap-8 justify-start mx-auto">
                            <div className="text-start flex gap-6">
                                <div className="w-1/5 text-[#2871E6]">
                                    <span className="text-2xl font-bold"><CountUp end={75} />%</span>
                                </div>
                                <div className="w-4/5 flex text-xs items-center">
                                    <p>지원공고와 맞지 않아 AI(ATS)에 의해 <br /> 자동으로 걸러지는 서류의 비율</p>
                                </div>
                            </div>
                            <hr />
                            <div className="text-start flex gap-6">
                                <div className="w-1/5 text-[#2871E6]">
                                    <span className="text-2xl font-bold"><CountUp end={85} />%</span>
                                </div>
                                <div className="w-4/5 flex text-xs items-center">
                                    <p>이력서 작성에 어려움을 겪는 <br /> 경력, 신입직장인</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Event Promotion Section */}
                <SlideUpSection className="w-full flex flex-col w-full justify-center items-center bg-white py-6 pb-12 text-center">
                    <h1 className="text-2xl font-bold mb-[50px]">
                        <span className="highlight-container">
                            <span className="highlight-text px-2 py-0.5">출시 알람 한정</span>
                            <span className="highlight-background"></span>
                        </span> 무료 혜택 제공!
                    </h1>
                    <div className="flex flex-col justify-center items-center max-w-md w-full mx-auto shadow-md start-card p-[20px] gap-4">
                        <h3 className="text-xl font-bold">사전예약 EVENT</h3>
                        <h2 className="text-2xl font-bold text-white line-through">5,000원</h2>
                        <h2 className="text-2xl font-bold">0원 스타터 패키지</h2>
                        <HomeButton variant="gradient" text="지금 이용하러가기" url="/signup" size="small" />
                        <p className="text-xs text-white">무료로 특별한 혜택을 만나보세요:</p>
                        <div className=' pl-10 text-start'>
                            <ul className="text-xs font-semibold list-none pl-0">
                                <li>첫 한 달간, 무료로 AI 기반 불렛포인트 생성</li>
                                <li>대기업 합격 이력서 템플릿 무료 제공</li>
                                <li>무제한으로 이력서 파일 생성 및 저장</li>
                            </ul>
                        </div>
                    </div>
                </SlideUpSection>
            </div>

            <footer className="text-xs w-full flex flex-col gap-4 p-8 border-t border-t-foreground/10 bg-[#F7F7F7]">
                <Image src='/images/resume.png' alt="Logo" width={100} height={33} />
                <div>
                    <p>상호명: CV메이트</p>
                    <p>대표자명: 김예은</p>
                    <p>주소: 서울특별시 성북구 안암로 145</p>
                    <p>상담문의: cvmate@gmail.com (평일 10:00-18:00)</p>
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