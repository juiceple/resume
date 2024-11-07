"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Label } from "@/components/forms/label";
import { Input } from "@/components/forms/input";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";


interface Message {
  content: string;
}

export default function FindPassword() {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState({ email: "", name: "" });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; otp?: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSendOtp = async () => {
    if (!validateEmail(formData.email)) {
      setErrors({ ...errors, email: "유효한 이메일 주소를 입력해주세요." });
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
    });

    if (error) {
      console.error("OTP 발송 오류:", error.message);
      setErrors({ ...errors, email: "OTP 발송에 실패했습니다." });
    } else {
      setOtpSent(true);
      setTimeLeft(180); // Start 3-minute timer
      alert("인증 메일이 발송되었습니다. 이메일을 확인하세요.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setErrors({ ...errors, otp: "OTP를 입력해주세요." });
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otp,
      type: "email",
    });

    if (error) {
      console.error("OTP 인증 오류:", error.message);
      setErrors({ ...errors, otp: "잘못된 OTP입니다. 다시 시도해주세요." });
    } else {
      setOtpVerified(true);
      alert("이메일 인증이 완료되었습니다.");
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setOtpSent(false);
    }
    return () => clearInterval(timer);
  }, [otpSent, timeLeft]);

  const FormMessage = ({ message }: { message: Message }) => {
    const isSuccess = message.content.includes("완료") || message.content.includes("전송");
    return (
      <p className={`mt-2 text-sm ${isSuccess ? "text-green-600" : "text-red-600"}`}>
        {message.content}
      </p>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 w-full">
      <Link href="/" className="absolute top-8 left-8 text-sm flex items-center group">
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
        </svg>
        Back
      </Link>

      <form className="flex-1 flex flex-col w-full max-w-md justify-center gap-4 p-4">
        <h1 className="text-2xl font-medium">비밀번호 찾기</h1>
        <p className="text-center text-gray-500 mb-6">
          가입한 계정 정보를 입력해주세요. 가입하신 이메일로 인증코드를 보내드릴게요.
        </p>

        <Label htmlFor="email">가입한 이메일</Label>
        <div className="flex gap-2">
          <Input
            name="email"
            placeholder="이메일 주소를 입력해주세요."
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={otpSent}
          />
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              otpSent && timeLeft > 0
                ? "bg-gray-400 text-white"
                : "bg-blue-500 text-white"
            }`}
            onClick={handleSendOtp}
            disabled={otpSent && timeLeft > 0}
          >
            {otpSent && timeLeft > 0 ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}` : otpVerified ? "인증 완료" : "인증"}
          </button>
        </div>
        {errors.email && <FormMessage message={{ content: errors.email }} />}
        {otpSent && !otpVerified && <FormMessage message={{ content: "인증 메일이 발송되었습니다." }} />}

        <Label htmlFor="otp">인증코드</Label>
        <div className="flex gap-2">
          <Input
            name="otp"
            placeholder="6자리의 인증코드를 입력해주세요."
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            disabled={otpVerified || !otpSent} // Disabled if OTP isn't sent or is verified
          />
          <button
            type="button"
            className={`px-4 py-2 rounded ${
              otpVerified ? "bg-gray-400 text-white" : "bg-blue-500 text-white"
            }`}
            onClick={handleVerifyOtp}
            disabled={otpVerified || !otpSent} // Disabled if OTP isn't sent or is verified
          >
            {otpVerified ? "완료" : "확인"}
          </button>
        </div>
        {errors.otp && <FormMessage message={{ content: errors.otp }} />}
        {otpVerified && <FormMessage message={{ content: "인증 완료" }} />}

        <button
          disabled={!otpVerified}
          onClick={() => router.push("/password-reset")} // Redirect to password reset page\
          className={!otpVerified?"rounded-xl bg-gray-300 h-12 w-full":"rounded-xl bg-blue-300 h-12 w-full"}
        >
          다음
        </button>
      </form>
    </div>
  );
}
