"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

// Define the props type for the CustomAlert component
interface CustomAlertProps {
  title?: string;
  message?: string[];
  onClose?: () => void;
}

export default function CustomAlert({
  title,
  message,
  onClose,
}: CustomAlertProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    // Open the AlertDialog when the component mounts
    setIsAlertOpen(true);
  }, []);

  const handleClose = () => {
    setIsAlertOpen(false);
    if (onClose) onClose();
  };

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent className="w-[400px] h-[500px] py-12 flex flex-col justify-between items-center">
        <div>
          <Image src="/images/resume.png" alt="Logo" width={192} height={68} />
        </div>
        <div className="text-2xl font-semibold">
          <h2>{title || "Default Title"}</h2>
        </div>
        <div className="flex flex-col text-xl items-center gap-[8px]">
          {(message && message.length > 0
            ? message
            : ["Default message line 1", "Default message line 2"]
          ).map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <AlertDialogCancel
          onClick={handleClose}
          className="bg-[#2871E6] text-[25px] flex w-[160px] h-[60px] items-center justify-center rounded-2xl text-white hover:bg-[#2871E6] hover:text-white"
        >
          확인
        </AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  );
}
