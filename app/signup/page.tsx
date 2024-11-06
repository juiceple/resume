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
    <div className="flex flex-col bg-[#EEE] flex-1 p-4 w-full items-center justify-center min-h-screen">
      <div className="relative w-1/4 bg-white shadow-lg rounded-xl">
        <div className="absolute w-full -top-20 flex justify-center">
          <div>
            <Image src='/images/resume.png' alt="Logo" width={160} height={40} />
          </div>
        </div>
        <div className="p-8">
          <h1 className="text-lg font-semibold ml-2 mt-4 mb-8">회원가입
          </h1>
          <Link className="text-[#2871E6] font-medium" href="/signup">
            회원가입
          </Link>
          <hr className="bg-gray-100 h-[0.5]" />
          <div className="mt-6">
            <GoogleSignUp />
          </div>
        </div>

      </div>

    </div>
  );
}