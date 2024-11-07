import React, { useState } from 'react';
import Image from 'next/image';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from '@/utils/supabase/client';

interface CancellationFlowModalProps {
    points: number;
    price: number;
    tid: string;
}

const CancelPoint: React.FC<CancellationFlowModalProps> = ({ points, price, tid }) => {
    const supabase = createClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCancel = async () => {
        try {
            const response = await fetch('/api/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tid, amount: price }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("NicePay 취소 오류:", data.error || 'Failed to cancel payment');
                alert(`결제 취소 중 오류가 발생했습니다: ${data.error || '결제 취소 실패'}`);
                return;
            }

            const { error } = await supabase
                .from('purchaseHistory')
                .update({ status: 'Cancelled' })
                .eq('tid', tid);

            if (error) {
                console.error("Supabase 업데이트 오류:", error.message);
                alert("DB 업데이트 중 오류가 발생했습니다.");
                return;
            }

            setIsDialogOpen(false); // Close the dialog after success
        } catch (err) {
            console.error("취소 요청 중 오류 발생:", err);
            alert("구매 취소를 완료할 수 없습니다.");
        }
    };

    return (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger>
                <button onClick={() => setIsDialogOpen(true)} className="border p-2 border-[#2871E6] bg-[#D9D9D900]">
                    구매 취소
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent className='w-[476px] h-auto py-10 flex flex-col gap-10 items-center justify-center'>
                <AlertDialogHeader className='flex flex-col items-center gap-8'>
                    <Image src="/images/resume.png" alt="Logo" width={192} height={68} />
                    <div className='text-center text-black text-2xl font-semibold'>구매를 취소하시겠어요?</div>
                </AlertDialogHeader>
                <AlertDialogDescription className="text-center text-black text-2xl">
                    구매: {points}P<br />
                    가격: {price.toLocaleString()}원
                </AlertDialogDescription>
                <div className="text-sm text-gray-500 text-left">
                    • 구매 취소 시 결제하신 수단으로 환불됩니다.<br />
                    • 이벤트성 무료 포인트는 구매 취소 및 환불 대상이 아닙니다.
                </div>
                <div className="flex gap-8 justify-center">
                    <AlertDialogCancel asChild className='w-28 h-12 px-4 py-2'>
                        <button className="bg-blue-500 text-white text-xl px-4 py-2 rounded-xl">
                            유지하기
                        </button>
                    </AlertDialogCancel>
                    <button onClick={handleCancel} className="w-28 h-12 bg-gray-300 text-xl text-black px-4 py-2 rounded-xl">
                        구매취소
                    </button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CancelPoint;
