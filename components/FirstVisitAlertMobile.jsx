// components/FirstVisitAlert.js
"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

export default function FirstVisitAlert() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    // Open the AlertDialog when the component mounts
    setIsAlertOpen(true);
  }, []);

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent className="w-auto h-auto py-12 flex flex-col justify-between items-center">
        <div>
          <Image src="/images/resume.png" alt="Logo" width={192} height={68} />
        </div>
        <div className="text-2xl font-semibold">
          <h2>출시 기념 200P 무료 제공!</h2>
        </div>
        <div className="flex flex-col text-[12px] items-center gap-[8px]">
          <p>감사하게도 너무나 많은 분들의 응원과 관심을 받게 되어,</p>
          <p>회원가입 시 200포인트를 무료로 제공해드립니다.</p>
          <p>지금 바로 회원가입하고 혜택을 받아보세요!</p>
        </div>
        <AlertDialogCancel
          onClick={() => setIsAlertOpen(false)}
          className="bg-[#2871E6] text-[25px] flex w-[160px] h-[60px] items-center justify-center rounded-2xl text-white hover:bg-[#2871E6] hover:text-white"
        >
          확인
        </AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  );
}
