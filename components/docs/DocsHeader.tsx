'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import FullScreenLoader from '@/components/FullScreenLoad'
import { RealtimeChannel } from '@supabase/supabase-js'

const DocsHeader = () => {
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [availablePoints, setAvailablePoints] = useState<number | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const supabase = createClient()
    const [isPremium, setIsPremium] = useState<boolean | null>(null)

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push("/")
    }

    const fetchUserPoints = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('BulletPoint, isPremium')
                    .eq('user_id', user.id)
                    .single()

                if (error) throw error

                setAvailablePoints(data?.BulletPoint || 0)
                setIsPremium(data?.isPremium || false)
            }
        } catch (error) {
            console.error('Error fetching user points:', error)
        }
    }, [supabase])

    useEffect(() => {
        fetchUserPoints()

        // Set up real-time subscription for BulletPoint updates
        let channel: RealtimeChannel | null = null

        const setupRealtimeSubscription = async () => {
            channel = supabase
                .channel('table-db-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'profiles',
                    },
                    (payload) => {
                        console.log('Profiles table change detected:', payload)
                        fetchUserPoints()
                    }
                )
                .subscribe()
        }

        setupRealtimeSubscription()

        return () => {
            if (channel) {
                supabase.removeChannel(channel)
            }
        }
    }, [fetchUserPoints, supabase])

    const handleNavigation = useCallback((path: string, message: string) => {
        if (pathname === path) return
        setLoading(true)
        setLoadingMessage(message)
        router.push(path)
    }, [router, pathname])

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab === 'profile' || tab === 'info' || pathname === '/pointShop') {
            setLoading(false)
        }
    }, [searchParams, pathname])

    return (
        <>
            {loading && <FullScreenLoader message={loadingMessage} isVisible={true} />}
            <header className="bg-white shadow h-[75px]">
                <div className="px-[30px] py-4 flex items-center justify-between">
                    <div className="flex items-center justify-between space-x-6">
                        <Link href="/docs" onClick={(e) => {
                            if (pathname !== '/docs') {
                                e.preventDefault()
                                handleNavigation('/docs', '문서 목록을 불러오는 중...')
                            }
                        }}>
                            <Image src='/images/resume.png' alt="Logo" width={120} height={40} />
                        </Link>

                        <Link href="/pointShop" onClick={(e) => {
                            if (pathname !== '/pointShop') {
                                e.preventDefault()
                                handleNavigation('/pointShop', '포인트샵을 불러오는 중...')
                            }
                        }} className='flex items-center gap-4 pl-10 font-bold'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M20 12V22H4V12" stroke="#5D5D5D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M22 7H2V12H22V7Z" stroke="#5D5D5D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M12 22V7" stroke="#5D5D5D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M7.5 7H12C12 7 11 2 7.5 2C6.83696 2 6.20107 2.26339 5.73223 2.73223C5.26339 3.20107 5 3.83696 5 4.5C5 5.16304 5.26339 5.79893 5.73223 6.26777C6.20107 6.73661 6.83696 7 7.5 7Z" stroke="#5D5D5D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M16.5 7H12C12 7 13 2 16.5 2C17.163 2 17.7989 2.26339 18.2678 2.73223C18.7366 3.20107 19 3.83696 19 4.5C19 5.16304 18.7366 5.79893 18.2678 6.26777C17.7989 6.73661 17.163 7 16.5 7Z" stroke="#5D5D5D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <div>

                                포인트샵
                            </div>
                        </Link>

                        <div className='flex items-center gap-4 font-bold'>
                            {isPremium ? (
                                <div className='w-32 rounded-full bg-gray-400 text-center text-xss'>프리미엄 유저</div>
                            ) : (
                                <div className="flex items-center gap-6 font-bold">
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                                            <path d="M3 14.6117L13 2.61169L12 10.6117H21L11 22.6117L12 14.6117H3Z" stroke="#5D5D5D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    사용 가능한 포인트:<span>{availablePoints !== null ? availablePoints : '로딩 중...'}</span>
                                    <div className='w-32 rounded-full bg-gray-400 text-center text-xss'>일반 유저</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="group w-[150px] h-[40px] flex gap-2 flex justify-center items-center text-white rounded-full bg-[#2871E6] hover:bg-[#1759C4]">
                                    마이페이지
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="rounded-3xl w-48 mt-2 p-0 shadow-lg">
                                <div className="flex flex-col py-4 items-center justify-center">
                                    <Link href="/mypage?tab=profile"
                                        className="w-full flex justify-center px-4 py-2 text-sm font-bold hover:bg-[#BED7FF]"
                                        onClick={(e) => {
                                            if (pathname !== '/mypage' || searchParams.get('tab') !== 'profile') {
                                                e.preventDefault()
                                                handleNavigation('/mypage?tab=profile', '내 커리어 정보를 불러오는 중...')
                                            }
                                        }}
                                    >
                                        내 커리어
                                    </Link>

                                    <Link href="/mypage?tab=info"
                                        className="w-full flex justify-center px-4 py-2 text-sm font-bold hover:bg-[#BED7FF]"
                                        onClick={(e) => {
                                            if (pathname !== '/mypage' || searchParams.get('tab') !== 'info') {
                                                e.preventDefault()
                                                handleNavigation('/mypage?tab=info', '회원 정보를 불러오는 중...')
                                            }
                                        }}
                                    >
                                        회원정보
                                    </Link>
                                    <form onSubmit={(e) => {
                                        e.preventDefault()
                                        setLoading(true)
                                        setLoadingMessage('로그아웃 중...')
                                        signOut()
                                    }}
                                        className="w-full flex justify-center px-4 py-2 text-sm font-bold hover:bg-[#BED7FF]"
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
    )
}

export default DocsHeader
