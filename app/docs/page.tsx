'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import ResumesList from '@/components/docs/ResumeList'
import { Resume } from '@/lib/Resume'
import { RealtimeChannel } from '@supabase/supabase-js'
import { ResumeSkeleton } from '@/components/docs/ResumeListSkeleton'
import DocsHeader from '@/components/docs/DocsHeader';
export default function Resumes() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchResumes = useCallback(async () => {
    setIsLoading(true)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/')
      return
    }

    const { data, error } = await supabase.from('resumes').select<'*', Resume>('*')

    if (error) {
      console.error('이력서 가져오기 오류:', error)
      setError('이력서를 불러오는 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.')
      setIsLoading(false)
      return
    }

    const sortedResumes = data ? data.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ) : []

    setResumes(sortedResumes)
    setIsLoading(false)
  }, [supabase, router])

  useEffect(() => {
    fetchResumes()

    // Supabase 실시간 db 설정
    let channel: RealtimeChannel | null = null

    const setupRealtimeSubscription = async () => {
      channel = supabase
        .channel('table-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'resumes',
          },
          (payload) => {
            console.log('변경 감지:', payload)
            fetchResumes() // 변경사항이 감지되면 이력서 목록을 새로고침
          }
        )
        .subscribe()
    }

    setupRealtimeSubscription()

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase, fetchResumes])

  const refreshResumes = useCallback(async () => {
    await fetchResumes()
  }, [fetchResumes])

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
        <DocsHeader />
      </header>
      <main className="flex-1 overflow-y-auto pt-[150px] px-[100px]">
        {isLoading ? (
          <ResumeSkeleton />
        ) : (
          <ResumesList initialResumes={resumes} refreshResumes={refreshResumes} />
        )}
      </main>
    </div>

  )
}