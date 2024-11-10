"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Image from "next/image";
import Link from "next/link";

const PurchaseResultContent: React.FC = () => {
    const searchParams = useSearchParams();
    const success = searchParams.get('success');
    const tid = searchParams.get('tid');
    const amount = searchParams.get('amount');
    const goodsName = searchParams.get('goodsName');
    const cardName = searchParams.get('cardName');
    const orderId = searchParams.get('orderId');

    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const hasProcessed = useRef(false);
    const supabase = createClient();

    useEffect(() => {
        if (processing || hasProcessed.current) return;

        const processPurchase = async () => {
            if (success !== 'true' || !tid || !amount || !goodsName || !cardName || !orderId) {
                return;
            }
        
            setProcessing(true);
            hasProcessed.current = true;
        
            try {
                let points = 0;
                let changeEventPoint = 0;
                let reason = '포인트 구매';
        
                if (amount === '7000') {
                    changeEventPoint = 100;  // 100 points for 7,000 KRW purchase
                    points = Number(amount) / 10;
                } else if (amount === '10000') {
                    changeEventPoint = 200;  // 200 points for 10,000 KRW purchase
                    points = Number(amount) / 10;
                } else if (amount === '5000') {
                    points = Number(amount) / 10;  // General points calculation for other amounts
                } else{
                    reason = "프리미엄 구매"
                }
        
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) throw new Error("User not authenticated.");
        
                const { data: existingPurchase, error: checkError } = await supabase
                    .from('purchaseHistory')
                    .select('tid')
                    .eq('tid', tid)
                    .single();
        
                if (checkError && checkError.code !== 'PGRST116') throw checkError;
                if (existingPurchase) return;
        
                if (amount === '25000') {
                    reason = '프리미엄 구매';
                    const expirationDate = new Date();
                    expirationDate.setUTCDate(expirationDate.getUTCDate() + 30);
        
                    const { error: updateProfileError } = await supabase
                        .from('profiles')
                        .update({
                            isPremium: true,
                            premium_expiration: expirationDate.toISOString()
                        })
                        .eq('user_id', user.id);
        
                    if (updateProfileError) throw updateProfileError;
                }
        
                const { data: latestHistory, error: historyError } = await supabase
                    .from('BulletPointHistory')
                    .select('purchasePoint, eventPoint')
                    .eq('user_id', user.id)
                    .order('timestamp', { ascending: false })
                    .limit(1)
                    .single();
        
                if (historyError) throw new Error("Failed to retrieve latest history points.");
        
                const previousPurchasePoint = latestHistory ? latestHistory.purchasePoint : 0;
                const previousEventPoint = latestHistory ? latestHistory.eventPoint : 0;
        
                const newPurchasePoint = points + previousPurchasePoint;
                const newEventPoint = changeEventPoint + previousEventPoint;
        
                const { error: insertHistoryError } = await supabase
                    .from('BulletPointHistory')
                    .insert({
                        user_id: user.id,
                        changeEventPoint,
                        change: points,
                        purchasePoint: newPurchasePoint,
                        eventPoint: newEventPoint,
                        reason
                    });
        
                if (insertHistoryError) throw insertHistoryError;
        
                const { error: insertPurchaseError } = await supabase
                    .from('purchaseHistory')
                    .insert({
                        user_id: user.id,
                        구매포인트: points + changeEventPoint,
                        잔여포인트: newPurchasePoint + newEventPoint,
                        금액: amount,
                        상품명: goodsName,
                        카드명: cardName,
                        orderId: orderId,
                        tid: tid
                    });
        
                if (insertPurchaseError) throw insertPurchaseError;
        
            } catch (err) {
                console.error("Error processing purchase:", err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setProcessing(false);
            }
        };
        

        processPurchase();
    }, [success, tid, amount, goodsName, cardName, orderId, processing]);

    return (
        <div className="flex flex-col w-full items-center justify-center h-screen bg-gray-50 text-gray-800">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full ">
                <div className="flex flex-col items-center mb-6 space-y-4">
                    <div>
                        <Image src="/images/resume.png" alt="Logo" width={192} height={68} />
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="65" height="65" viewBox="0 0 65 65" fill="none">
                        <path d="M59.5827 30.0085V32.5002C59.5794 38.3405 57.6882 44.0233 54.1913 48.701C50.6944 53.3787 45.7791 56.8007 40.1784 58.4566C34.5778 60.1125 28.5919 59.9137 23.1135 57.8897C17.6352 55.8657 12.9578 52.1251 9.77903 47.2256C6.60028 42.3261 5.09045 36.5304 5.47472 30.7027C5.859 24.8751 8.11678 19.3278 11.9114 14.8881C15.7059 10.4485 20.834 7.35436 26.5307 6.06726C32.2274 4.78017 38.1876 5.36903 43.5223 7.74604" stroke="#2871E6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M59.5833 10.8335L32.5 37.9439L24.375 29.8189" stroke="#2871E6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <p className="text-lg font-semibold text-center">결제가 정상적으로 처리되었습니다.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                        <span>결제 ID</span>
                        <span className="font-semibold text-gray-800 text-right">{orderId || "NONE"}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>구매 내역</span>
                        <span className="font-semibold text-gray-800">{goodsName || "NONE"}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>결제 수단</span>
                        <span className="font-semibold text-gray-800">{cardName || "NONE"}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>결제 금액</span>
                        <span className="font-semibold text-gray-800">₩{amount || "NONE"}</span>
                    </div>
                </div>
                <Link href={"/docs"}>
                    <div className="mt-8 w-full bg-blue-500 text-white py-2 rounded-lg text-center font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
                        영문이력서 만들러 가기
                    </div>
                </Link>
            </div>
        </div>
    );
};

const PurchaseResult: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PurchaseResultContent />
        </Suspense>
    );
};

export default PurchaseResult;
