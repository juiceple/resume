'use client'

import { createClient } from "@/utils/supabase/client";
import { useCallback } from 'react';

export default function GoogleSignInButton() {
  const handleGoogleSignIn = useCallback(async () => {
    const supabase = createClient();
    const { data: session, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?type=login`,
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      return;
    }

    if (session) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
    

      // Check if the user already exists in your `profiles` table
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        return;
      }

      if (!existingUser) {
        // If the user does not exist, redirect to a sign-up page
        window.location.href = '/signup/google';
      } else {
        // User exists, proceed with login
        console.log('User exists, proceed with login');
      }
    }
  }, []);

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full h-12 bg-[#333] border text-white font-semibold text-sm py-2 px-4 rounded-xl hover:bg-black flex items-center justify-center"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        <path fill="none" d="M1 1h22v22H1z" />
      </svg>
      구글 로그인
    </button>
  );
}
