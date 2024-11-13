"use client"
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from '@supabase/supabase-js'; // Supabase User 타입 import

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? (
    <div className="flex items-center gap-4">
      {user.email}      
      <button 
        onClick={handleSignOut}
        className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        로그아웃
      </button>
      <Link
        href="/docs"
        className="w-auto px-6 h-[40px] flex gap-2 justify-center items-center text-white rounded-full bg-[#2871E6] hover:bg-[#1759C4]"
      >
        Resume 편집하기
      </Link>
    </div>
  ) : (
    <div className="flex gap-2">
      <Link
        href="/login"
        className="h-8 flex items-center justify-center rounded-md no-underline text-sm font-semibold px-4"
      >
        로그인
      </Link>
      <Link
        href="/signup"
        className="h-8 flex items-center justify-center rounded-md no-underline text-sm font-semibold px-4"
      >
        회원가입
      </Link>
    </div>
  );
}