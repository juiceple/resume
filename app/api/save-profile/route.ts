import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { profileData } = await req.json();

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    career: profileData.career,
    job: profileData.job,
    desired_job: profileData.desiredJob,
    country: profileData.country,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Profile saved successfully' });
}
