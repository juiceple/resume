import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Download } from 'lucide-react';
import Image from 'next/image';

interface PdfDownloadModalProps {
    onDownload: () => void;
    isPremium: boolean | null;
}

const PdfDownloadModal: React.FC<PdfDownloadModalProps> = ({ onDownload, isPremium }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDownload = () => {
        onDownload();
        setIsDialogOpen(false);
    };

    return (
        <>
            {isPremium ? (
                <button
                    onClick={onDownload}
                    className="Resume-color-10 rounded-full text-black flex items-center w-[120px] justify-center gap-1 hover:bg-[#1759C4] h-full"
                >
                    <div className='text-white text-xs'>
                        PDF 다운 받기
                    </div>
                    <div>
                        <Download size={16} color={"#FFFFFF"} />
                    </div>
                </button>
            ) : (
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogTrigger className='h-[35px]'>
                        <button
                            className="Resume-color-10 rounded-full text-black flex items-center w-[120px] justify-center gap-1 hover:bg-[#1759C4] h-full"
                        >
                            <div className='text-white text-xs'>
                                PDF 다운 받기
                            </div>
                            <div>
                                <Download size={16} color={"#FFFFFF"} />
                            </div>
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[476px] h-auto py-10 flex flex-col gap-6 items-center justify-center">
                        <AlertDialogHeader className='flex flex-col items-center gap-4'>
                            <Image src="/images/resume.png" alt="Logo" width={192} height={68} />
                            <AlertDialogTitle className="text-center text-2xl font-semibold">
                                PDF 다운로드 하시겠습니까?
                            </AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription className="text-center text-lg text-gray-700">
                            일반회원은 PDF 다운로드가 하루 최대 1회만 가능합니다.<br />
                            다운로드하시겠습니까?
                        </AlertDialogDescription>
                        <div className="flex gap-4 justify-center mt-4">
                            <AlertDialogCancel asChild>
                                <button className="w-28 h-12 bg-gray-300 hover:bg-gray-400 rounded-2xl text-lg">
                                    취소
                                </button>
                            </AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <button
                                    onClick={handleDownload}
                                    className="w-28 h-12 bg-blue-500 text-white rounded-2xl text-lg"
                                >
                                    다운로드
                                </button>
                            </AlertDialogAction>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
};

export default PdfDownloadModal;
