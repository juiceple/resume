import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest, { params }: { params: { url: string } }) {
  const supabase = createClient()
  
  const { url } = params;

  if (typeof url !== 'string') {
    return NextResponse.json({ message: 'Invalid URL' }, { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    const { data, error } = await supabase.storage
      .from('DocsPreview')
      .createSignedUrl(decodedUrl, 60 * 60); // URL is valid for 1 hour

    if (error) throw error;

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error('Error creating signed URL:', error);
    return NextResponse.json({ message: 'Error creating signed URL' }, { status: 500 });
  }
}