// components/FirstVisitAlert.js
"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

export default function FirstVisitAlertMobile() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    // Open the AlertDialog when the component mounts
    setIsAlertOpen(true);
  }, []);

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent className="w-[300px] h-auto py-12 flex flex-col justify-between items-center rounded-xl">
        <div>
          <Image src="/images/resume.png" alt="Logo" width={192} height={68} />
        </div>
        <div className="text-xl font-semibold">
          <h2>PC로 만나보세요!</h2>
        </div>
        <div className="flex flex-col text-10 items-center px-6">
          <p>CVMATE는 PC버전에서만 서비스를 이용하실 수 있는 점 양해부탁드립니다. 현재 출시 기념으로 무료 200포인트 제공 이벤트를 진행중이니 지금 바로 PC에서 회원가입하고 혜택을 받아보세요!</p>
        </div>
        <AlertDialogCancel
          onClick={() => setIsAlertOpen(false)}
          className="bg-[#2871E6] text-10 flex w-36 h-24 items-center justify-center rounded-2xl text-white hover:bg-[#2871E6] hover:text-white"
        >
          확인
        </AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  );
}
