import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resumes')
    .select('*')  // 모든 필드를 선택합니다
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const updateData = await request.json()  // 전체 업데이트 데이터를 받습니다

  const { data, error } = await supabase
    .from('resumes')
    .update(updateData)  // 전체 데이터를 업데이트합니다
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}