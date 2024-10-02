import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from 'next/link';
import { useRouter, redirect, useSearchParams, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import FullScreenLoader from '@/components/FullScreenLoad';

const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
};

const DocsHeader = () => {
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [availablePoints, setAvailablePoints] = useState<number | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const supabase = createClient();

    const fetchUserPoints = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('BulletPoint')
                    .eq('user_id', user.id)
                    .single();

                if (error) throw error;
                setAvailablePoints(data?.BulletPoint || 0);
            }
        } catch (error) {
            console.error('Error fetching user points:', error);
        }
    }, [supabase]);

    useEffect(() => {
        fetchUserPoints();
    }, [fetchUserPoints]);

    const handleNavigation = useCallback((path: string, message: string) => {
        if (pathname === path) return;
        setLoading(true);
        setLoadingMessage(message);
        router.push(path);
    }, [router, pathname]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'profile' || tab === 'info' || pathname === '/pointShop') {
            setLoading(false);
        }
    }, [searchParams, pathname]);

    return (
        <>
            {loading && <FullScreenLoader message={loadingMessage} />}
            <header className="bg-white shadow h-[75px]">
                <div className="px-[30px] py-4 flex items-center justify-between">
                    <div className="flex items-center justify-between space-x-6">
                        <Link href="/docs" onClick={(e) => {
                            if (pathname !== '/docs') {
                                e.preventDefault();
                                handleNavigation('/docs', '문서 목록을 불러오는 중...');
                            }
                        }}>
                            <Image src='/images/resume.png' alt="Logo" width={120} height={40} />
                        </Link>

                        <Link href="/pointShop" onClick={(e) => {
                            if (pathname !== '/pointShop') {
                                e.preventDefault();
                                handleNavigation('/pointShop', '포인트샵을 불러오는 중...');
                            }
                        }} className='flex items-center gap-4 pl-10 font-bold'>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 12V22H4V12" stroke="#5D5D5D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 7H2V12H22V7Z" stroke="#5D5D5D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 22V7" stroke="#5D5D5D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M7.5 7H12C12 7 11 2 7.5 2C6.83696 2 6.20107 2.26339 5.73223 2.73223C5.26339 3.20107 5 3.83696 5 4.5C5 5.16304 5.26339 5.79893 5.73223 6.26777C6.20107 6.73661 6.83696 7 7.5 7Z" stroke="#5D5D5D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M16.5 7H12C12 7 13 2 16.5 2C17.163 2 17.7989 2.26339 18.2678 2.73223C18.7366 3.20107 19 3.83696 19 4.5C19 5.16304 18.7366 5.79893 18.2678 6.26777C17.7989 6.73661 17.163 7 16.5 7Z" stroke="#5D5D5D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                포인트샵
                            </div>
                        </Link>

                        <div className='flex items-center gap-4 font-bold'>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                                    <path d="M3 14.6117L13 2.61169L12 10.6117H21L11 22.6117L12 14.6117H3Z" stroke="#5D5D5D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                사용 가능한 포인트: <span>{availablePoints !== null ? availablePoints : '로딩 중...'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="group w-[150px] h-[40px] flex gap-2 flex justify-center items-center text-white rounded-full bg-[#2871E6] hover:bg-[#1759C4] data-[state=open]:bg-[#1759C4]">
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="">
                                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M4 21L20 21" stroke="white" strokeWidth="2" />
                                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div>
                                        마이페이지
                                    </div>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="rounded-3xl w-48 mt-2 p-0 shadow-lg">
                                <div className="flex flex-col py-4 items-center justify-center">
                                    <Link href="/mypage?tab=profile"
                                        className="w-full flex justify-center px-4 py-2 text-sm font-bold hover:bg-[#BED7FF]"
                                        onClick={(e) => {
                                            if (pathname !== '/mypage' || searchParams.get('tab') !== 'profile') {
                                                e.preventDefault();
                                                handleNavigation('/mypage?tab=profile', '내 커리어 정보를 불러오는 중...');
                                            }
                                        }}
                                    >
                                        내 커리어
                                    </Link>

                                    <Link href="/mypage?tab=info"
                                        className="w-full flex justify-center px-4 py-2 text-sm font-bold hover:bg-[#BED7FF]"
                                        onClick={(e) => {
                                            if (pathname !== '/mypage' || searchParams.get('tab') !== 'info') {
                                                e.preventDefault();
                                                handleNavigation('/mypage?tab=info', '회원 정보를 불러오는 중...');
                                            }
                                        }}
                                    >
                                        회원정보
                                    </Link>
                                    <form action={signOut}
                                        className="w-full flex justify-center px-4 py-2 text-sm font-bold hover:bg-[#BED7FF]"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            setLoading(true);
                                            setLoadingMessage('로그아웃 중...');
                                            signOut();
                                        }}
                                    >
                                        <button type="submit">
                                            로그아웃
                                        </button>
                                    </form>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </header>
        </>
    );
};

export default DocsHeader;