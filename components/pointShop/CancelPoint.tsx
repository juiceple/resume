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

    // 추가: 구매 시 제공된 이벤트 포인트와 구매 포인트를 계산하는 함수
    const computePurchaseAndEventPoints = (points: number) => {
        let purchasePointsInPurchase = 0;
        let eventPointsInPurchase = 0;

        // points 값에 따라 purchasePoints와 eventPoints를 계산
        if (points === 500) {
            purchasePointsInPurchase = 500;
            eventPointsInPurchase = 0;
        } else if (points === 800) {
            purchasePointsInPurchase = 700;
            eventPointsInPurchase = 100;
        } else if (points === 1200) {
            purchasePointsInPurchase = 1000;
            eventPointsInPurchase = 200;
        } else {
            // 다른 경우에 대한 로직 추가 필요
            // 예를 들어, 기본적으로 모든 포인트를 구매 포인트로 처리하거나 오류 처리
            purchasePointsInPurchase = points;
            eventPointsInPurchase = 0;
        }

        return { purchasePointsInPurchase, eventPointsInPurchase };
    };

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

    useEffect(() => {
        if (userId) {
            fetchUserProfile(userId);
        }
    }, [userId]);

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

        setIsDialogOpen(false); // 다이얼로그 즉시 닫기

        // 가격이 25000원일 때는 취소 불가 처리
        if (price === 25000) {
            updateAlert("취소 불가", "이 상품은 구매 취소가 불가능합니다.");
            return;
        }

        setIsLoading(true); // 로딩 시작

        try {
            const pointsData = await fetchUserProfile(userId);
            if (!pointsData) return;

            const { purchasePoints: userPurchasePoints, eventPoints: userEventPoints } = pointsData;

            // 추가: 구매 시 사용된 구매 포인트와 이벤트 포인트 계산
            const { purchasePointsInPurchase, eventPointsInPurchase } = computePurchaseAndEventPoints(points);

            // 구매 및 이벤트 포인트 모두 체크
            if (userPurchasePoints < purchasePointsInPurchase || userEventPoints < eventPointsInPurchase) {
                updateAlert("잔여 포인트를 일부만 취소하고 싶어요.", "잔여 포인트는 결제일로부터 지난 일 수, 결제 수단에 따라 취소 여부가 다르므로 구매내역과 함께 고객센터에 문의 부탁드립니다. ");
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

            // 포인트 차감 처리
            const newPurchasePoints = userPurchasePoints - purchasePointsInPurchase; // 구매 포인트 차감
            const newEventPoints = userEventPoints - eventPointsInPurchase;         // 이벤트 포인트 차감

            const { error: deductionError } = await supabase
                .from('BulletPointHistory')
                .insert([
                    {
                        user_id: userId,
                        change: -(purchasePointsInPurchase + eventPointsInPurchase), // 총 차감 포인트
                        eventPoint: newEventPoints,
                        purchasePoint: newPurchasePoints,
                        reason: '구매 취소'
                    },
                ]);

            if (deductionError) {
                updateAlert("차감 기록 오류", "포인트 차감 기록 중 오류가 발생했습니다.");
                return;
            }

            setPurchasePoints(newPurchasePoints);
            setEventPoints(newEventPoints);
            setBulletPoints(newPurchasePoints + newEventPoints);
            onCancellation();

            // 취소 완료 후 성공 알림 표시
            updateAlert("환불 요청 완료", "카드사에 환불 요청을 완료하여, 영업일 7일 이내 결제하신 수단으로 환불될 예정입니다!");
        } catch (err) {
            updateAlert("취소 요청 중 오류", "구매 취소를 완료할 수 없습니다.");
        } finally {
            setIsLoading(false); // 로딩 종료
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
                        {/* 추가: 포인트 상세 정보 표시 */}
                        구매 포인트: {computePurchaseAndEventPoints(points).purchasePointsInPurchase}P, 이벤트 포인트: {computePurchaseAndEventPoints(points).eventPointsInPurchase}P<br />
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
