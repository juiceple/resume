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
import GoogleSignUp from "@/components/signup/GoogleSignUp";

export default function Login({ searchParams }: { searchParams: Message }) {

  return (
    <div className="flex flex-col bg-[#EEE] gap-4 flex-1 p-4 w-full items-center justify-center min-h-screen">
      <div className="relative w-1/4 bg-white shadow-lg rounded-xl">
        <div className="absolute w-full -top-20 flex justify-center">
          <div>
            <Image src='/images/resume.png' alt="Logo" width={160} height={40} />
          </div>
        </div>
        <div className="p-8">
          <h1 className="text-xl text-center text-[#AEB3BC] font-semibold ml-2 mt-4 mb-8">
          CVMATE로 빠르고 손쉽게<br/>
          합격 영문이력서를 작성해보세요.
          </h1>
          <div className="mt-4">
            <GoogleSignUp />
          </div>
          <Link className="font-medium " href="/signup/email">
            <div className="w-full mt-4 h-12 bg-[#2871E6] border text-white font-semibold text-sm py-2 px-4 rounded-xl flex items-center justify-center">
              이메일로 계속하기
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}