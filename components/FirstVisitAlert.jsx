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
      <AlertDialogContent className="w-[476px] h-[527px] py-[60px] flex flex-col gap-[30px] items-center">
        <div>
          <Image src="/images/resume.png" alt="Logo" width={192} height={68} />
        </div>
        <div className="text-[35px] font-semibold">
          <h2>11월 11일 출시 예정!</h2>
        </div>

        <div className="flex flex-col text-[12pxpx] items-center gap-[8px]">
          <p> 안녕하세요, CVMATE 개발팀입니다.</p>
          <p> 감사하게도 너무나 많은 분들의 응원과 관심을 받게 되어,</p>
          <p> 11월 11일에 출시를 할 예정입니다!</p>
          <p> 더 나은 서비스를 위해 출시가 다소 지연된 점에 대해 </p>
          <p> 양해 부탁드리며, 그만큼 더 좋은 서비스로 보답하겠습니다.</p>
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
