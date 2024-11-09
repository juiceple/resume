import React, { useState, useEffect } from 'react';
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
import CustomAlert from '@/components/CustomAlert';
import FullScreenLoader from '@/components/FullScreenLoad';

interface CancellationPointProps {
    tid: string;
    points: number;
    price: number;
    onCancellation: () => void;
}

const CancelPoint: React.FC<CancellationPointProps> = ({ tid, points, price, onCancellation }) => {
    const supabase = createClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [eventPoints, setEventPoints] = useState<number>(0);
    const [purchasePoints, setPurchasePoints] = useState<number>(0);
    const [bulletPoints, setBulletPoints] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false); // New state for loading
    const [alert, setAlert] = useState({
        show: false,
        title: '',
        message: [] as string[],
    });

    const updateAlert = (title: string, message: string | string[], show = true) => {
        setAlert({
            title,
            message: Array.isArray(message) ? message : [message],
            show,
        });
    };

    useEffect(() => {
        const fetchUserId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        fetchUserId();
    }, []);

    const fetchUserProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('BulletPointHistory')
            .select('eventPoint, purchasePoint')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            updateAlert("에러", "포인트 정보를 가져오는 데 실패했습니다.");
            return null;
        } else if (data) {
            setEventPoints(data.eventPoint);
            setPurchasePoints(data.purchasePoint);
            setBulletPoints(data.eventPoint + data.purchasePoint);
            return { eventPoints: data.eventPoint, purchasePoints: data.purchasePoint };
        }
        return null;
    };

    const handleCancel = async () => {
        if (!userId) return;

        setIsDialogOpen(false); // Close the dialog immediately
        setIsLoading(true); // Start loading

        try {
            const pointsData = await fetchUserProfile(userId);
            if (!pointsData) return;

            const { purchasePoints } = pointsData;

            if (purchasePoints < points) {
                updateAlert("포인트 부족", "취소하기 위한 포인트가 부족합니다.");
                return;
            }

            const { data: orderData, error: orderError } = await supabase
                .from('purchaseHistory')
                .select('status')
                .eq('tid', tid)
                .single();

            if (orderError || !orderData || orderData.status !== 'Refundable') {
                updateAlert("취소 불가", "구매를 취소할 수 없습니다.");
                return;
            }

            const response = await fetch('/api/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tid, amount: price }),
            });

            const data = await response.json();

            if (!response.ok) {
                updateAlert("NicePay 취소 오류", `결제 취소 중 오류가 발생했습니다: ${data.error || '결제 취소 실패'}`);
                return;
            }

            const { error: purchaseHistoryError } = await supabase
                .from('purchaseHistory')
                .update({ status: 'Cancelled' })
                .eq('tid', tid);

            if (purchaseHistoryError) {
                updateAlert("DB 오류", "DB 업데이트 중 오류가 발생했습니다.");
                return;
            }

            const newPoints = purchasePoints - points;
            const { error: deductionError } = await supabase
                .from('BulletPointHistory')
                .insert([
                    {
                        user_id: userId,
                        change: -points,
                        eventPoint: eventPoints,
                        purchasePoint: newPoints,
                        reason: '구매 취소',
                        timestamp: new Date().toISOString(),
                    },
                ]);

            if (deductionError) {
                updateAlert("차감 기록 오류", "포인트 차감 기록 중 오류가 발생했습니다.");
                return;
            }

            setPurchasePoints(newPoints);
            setBulletPoints(newPoints + eventPoints);
            onCancellation();
            // Show success alert after cancellation is complete
            updateAlert("취소 완료", "취소가 완료됐습니다!");
        } catch (err) {
            updateAlert("취소 요청 중 오류", "구매 취소를 완료할 수 없습니다.");
        } finally {
            setIsLoading(false); // Stop loading
        }
    };


    return (
        <>
            <FullScreenLoader message="취소 요청을 처리 중입니다..." isVisible={isLoading} />
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
                {alert.show && (
                    <CustomAlert
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert({ ...alert, show: false })}
                    />
                )}
            </AlertDialog>
        </>
    );
};

export default CancelPoint;
