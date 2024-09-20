import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "../../components/forms/submit-button";
import { Label } from "@/components/forms/label";
import { Input } from "@/components/forms/input";
import { FormMessage, Message } from "@/components/forms/form-message";
import { encodedRedirect } from "@/utils/utils";
import Image from 'next/image';

// New import for Google Sign-In button
import GoogleSignInButton from "@/components/login/GoogleSingIn";

export default function Login({ searchParams }: { searchParams: Message }) {
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return encodedRedirect("error", "/login", "이메일 또는 비밀번호가 일치하지 않습니다.");
    }

    return redirect("/docs");
  };

  return (
    <div className="flex flex-col bg-[#EEE] flex-1 p-4 w-full items-center justify-center min-h-screen">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        뒤로가기
      </Link>
      <div className="relative w-1/4 bg-white shadow-lg rounded-xl">
        <div className="absolute w-full -top-20 flex justify-center">
          <div>
            <Image src='/images/resume.png' alt="Logo" width={160} height={40} />
          </div>
        </div>
        <div className="p-8">
        <h1 className="text-lg font-semibold ml-2 mt-4 mb-8">로그인</h1>
        <form className="flex flex-col w-full justify-center text-foreground mb-6">
          <div className="flex flex-col gap-3">
            <Input
              name="email"
              placeholder="이메일 주소"
              required
              className="h-12 px-2 border-[1.4px] border-color-[#E5E6E9] rounded-lg"
            />
            <Input
              type="password"
              name="password"
              placeholder="비밀번호"
              required
              className="h-12 px-2 border-[1.4px] border-color-[#E5E6E9] rounded-lg"
            />
            <div className="flex justify-end items-center px-2 py-2">
              <Link
                className="text-xs"
                href="/forgot-password"
              >
                비밀번호 찾기
              </Link>
            </div>
            <SubmitButton formAction={signIn} pendingText="로그인중입니다...">
              이메일로 로그인
            </SubmitButton>
          </div>
          <FormMessage message={searchParams} />
        </form>
        <hr className="bg-gray-100 h-[0.5]" />
        <div className="mt-6">
          <GoogleSignInButton />
        </div>
        <div className="flex justify-between pt-6 px-4">
          <p className="text-sm text-[#686A6D] text-foreground/60 mb-8">
            아직 회원이 아니세요?{" "}
          </p>
          <Link className="text-[#2871E6] font-medium" href="/signup">
            회원가입
          </Link>
        </div>
      </div>

      </div>

    </div>
  );
}