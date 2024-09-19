import { createClient } from '@/utils/supabase/client';

export interface Resume {
  id: string;
  title: string;
  content: any;
  created_at: string;
  updated_at: string;
  docs_preview_url: string | null;
  user_id: string;
}

const supabase = createClient();

export async function createNewResume(userId: string): Promise<{ success: boolean; data?: Resume; error?: string }> {
  try {
    const newResume = {
      title: "새 이력서",
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('resumes')
      .insert(newResume)
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('새 이력서 생성 오류:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function cloneResume(resumeId: string): Promise<{ success: boolean; data?: Resume; error?: string }> {
  try {
    // 1. 기존 이력서 데이터 가져오기
    const { data: originalResume, error: fetchError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (fetchError) throw fetchError;

    // 2. 새 이력서 생성 (기존 데이터 복사)
    const newResume = {
      ...originalResume,
      id: undefined,  // 새로운 ID 생성을 위해 제거
      title: `${originalResume.title} (복사본)`,
      created_at: new Date().toISOString(),
    };

    const { data: clonedResume, error: insertError } = await supabase
      .from('resumes')
      .insert(newResume)
      .select()
      .single();

    if (insertError) throw insertError;

    return { success: true, data: clonedResume };
  } catch (error) {
    console.error('이력서 복제 오류:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteResume(resumeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('이력서 삭제 오류:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}