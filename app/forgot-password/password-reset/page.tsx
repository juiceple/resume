"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/forms/input";
import { Label } from "@/components/forms/label";

export default function PasswordReset() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const validatePassword = () => {
    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
    } else if (newPassword.length < 8 || newPassword.length > 16) {
      setError("비밀번호는 8~16자로 설정해야 합니다.");
    } else {
      setError("");
    }
  };

  useEffect(() => {
    validatePassword();
  }, [newPassword, confirmPassword]);

  const handlePasswordChange = async () => {
    const supabase = createClient();

    if (error) return;

    try {
      setIsChangingPassword(true);

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      alert("비밀번호가 성공적으로 변경되었습니다.");
      setIsChangingPassword(false);
    } catch (error) {
      console.error("Error updating password:", error);
      alert(
        error instanceof Error
          ? error.message
          : "비밀번호 변경 중 오류가 발생했습니다."
      );
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 w-full">
      <h1 className="text-2xl font-medium mb-4">비밀번호 재설정</h1>
      <p className="text-center text-gray-500 mb-6">
        이전에 사용한 적 없는 새로운 비밀번호를 설정해주세요.<br />
        비밀번호는 8~16자의 영문 대소문자, 숫자, 특수문자만 가능합니다.
      </p>

      <Label htmlFor="newPassword">새로운 비밀번호</Label>
      <Input
        type="password"
        name="newPassword"
        placeholder="새로운 비밀번호를 입력하세요."
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <Label htmlFor="confirmPassword" className="mt-4">
        새로운 비밀번호 확인
      </Label>
      <Input
        type="password"
        name="confirmPassword"
        placeholder="비밀번호를 다시 입력하세요."
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <button
        onClick={handlePasswordChange}
        disabled={isChangingPassword || !!error}
        className={`mt-6 ${isChangingPassword ? "opacity-50" : ""}`}
      >
        비밀번호 변경하기
      </button>

      <button
        type="button"
        onClick={() => window.history.back()}
        className="text-sm text-gray-500 mt-4"
      >
        이전
      </button>
    </div>
  );
}
