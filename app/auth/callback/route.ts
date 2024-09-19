import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/login?error=AuthenticationFailed`);
    }
  }

  // Check if the user is authenticated
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    if (redirectTo) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${origin}/docs`);
  } else {
    // If authentication failed, redirect to login page
    return NextResponse.redirect(`${origin}/login?error=AuthenticationFailed`);
  }
}