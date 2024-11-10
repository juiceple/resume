'use client'
import React, { useState, useEffect } from 'react';
import DocsHeader from '@/components/docs/DocsHeader';
import CancellationFlowModal from '@/components/pointShop/CancelSub';
import CancellationPoint from '@/components/pointShop/CancelPoint';
import { createClient } from '@/utils/supabase/client';
import CustomAlert from '@/components/CustomAlert';
// PointShop.tsx 파일 상단에 추가
declare const AUTHNICE: any;



interface PointPackageProps {
    points: number;
    price: number;
}

interface HistoryItemProps {
    date: string;
    amount: number;
    pointsBuy: number;
    pointsResidue: number;
    tid: string;
    status: string;
}

interface BulletPointHistoryItemProps {
    purchasePoint: number;
    eventPoint: number;
    reason: string;
    timestamp: string;
    totalchange: number;
    totalPoint: number;
}

type TabType = 'purchase' | 'history' | 'bulletPointHistory';

const PointShop: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('purchase');
    const [bulletHistoryItems, setBulletHistoryItems] = useState<BulletPointHistoryItemProps[]>([]);
    const [pinCode, setPinCode] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historyUpdated, setHistoryUpdated] = useState(false);
    const supabase = createClient();
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [selectedPoints, setSelectedPoints] = useState(0);
    const [selectedPrice, setSelectedPrice] = useState(0);
    const [isPremium, setIsPremium] = useState(false);
    const [name, setName] = useState<string | null>(null); // State to hold user's name

    // Agreement checkboxes state
    const [formData, setFormData] = useState({
        agreements: {
            all: false,
            terms: false,
            privacy: false,
        },
    });

    const handleAgreementChange = (field: string, checked: boolean) => {
        setFormData((prevFormData) => {
            const updatedAgreements = { ...prevFormData.agreements, [field]: checked };

            // If 'all' is checked or unchecked, set all agreements accordingly
            if (field === 'all') {
                updatedAgreements.terms = checked;
                updatedAgreements.privacy = checked;
            } else {
                // Set 'all' based on individual agreement checkboxes
                updatedAgreements.all = updatedAgreements.terms && updatedAgreements.privacy;
            }

            return { agreements: updatedAgreements };
        });
    };

    // 모달을 열고 결제 정보를 설정하는 함수
    const initiatePurchase = (points: number, price: number, premium: boolean = false) => {
        setSelectedPoints(points);
        setSelectedPrice(price);
        setIsPremium(premium);
        setIsConfirmationModalOpen(true);
    };


    const handleTabChange = (tab: 'purchase' | 'history' | 'bulletPointHistory') => {
        setActiveTab(tab);
    };

    // Define alert state for CustomAlert
    const [alert, setAlert] = useState({
        show: false,
        title: '',
        message: [] as string[],
    });

    // Function to update alert state
    const updateAlert = (title: string, message: string | string[], show = true) => {
        setAlert({
            title,
            message: Array.isArray(message) ? message : [message],
            show,
        });
    };

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) throw new Error("User not authenticated.");
    
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('name')
                    .eq('id', user.id)
                    .single();
    
                if (profileError) throw profileError;
    
                setName(profile?.name || null);
            } catch (error) {
                console.error("Error fetching user name:", error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
            }
        };
    
        // Execute fetchUserName only if user exists
        fetchUserName();
    }, []); // Runs only once on component mount
    


    // Fetch purchase history
    const [historyItems, setHistoryItems] = useState<HistoryItemProps[]>([]);

    useEffect(() => {
        // 나이스페이 JS SDK 스크립트 동적 로드
        const script = document.createElement('script');
        script.src = "https://pay.nicepay.co.kr/v1/js/";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // 컴포넌트 언마운트 시 스크립트 제거
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        const fetchUserAndPurchaseHistory = async () => {
            try {
                setIsLoading(true);
                setError(null);
    
                // Get authenticated user
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) throw new Error("User not authenticated.");
    
                const { data, error: historyError } = await supabase
                    .from('purchaseHistory')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('구매일자', { ascending: false });
    
                if (historyError) throw historyError;
    
                const formattedHistoryItems = data.map((item: any) => ({
                    date: new Date(item.구매일자).toLocaleDateString(),
                    amount: item.금액,
                    pointsBuy: item.구매포인트,
                    pointsResidue: item.잔여포인트,
                    tid: item.tid,
                    status: item.status,
                }));
    
                setHistoryItems(formattedHistoryItems);
            } catch (err) {
                console.error("Error fetching purchase history:", err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };
    
        if (activeTab === 'history' || historyUpdated) {
            fetchUserAndPurchaseHistory();
        }
    }, [activeTab, historyUpdated]); // Add activeTab as a dependency
    


    const handlePinSubmit = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('No user logged in');

            const { data: couponData, error: couponError } = await supabase
                .from('couponCode')
                .select('*')
                .eq('쿠폰코드', pinCode)
                .single();

            if (couponError || !couponData) {
                setError("Invalid coupon code.");
                return;
            }

            const { data: redemptionData, error: redemptionError } = await supabase
                .from('couponredemptions')
                .select('*')
                .eq('user_id', user.id)
                .eq('쿠폰코드', pinCode)
                .single();

            if (redemptionData) {
                updateAlert("실패", `이미 쿠폰을 사용하셨습니다!`);
                return;
            }

            if (redemptionError && redemptionError.code !== 'PGRST116') {
                throw redemptionError;
            }

            const assignedPoints = couponData.할당포인트;
            const updatedUsageCount = couponData.사용횟수 + 1;

            const { error: updateUsageError } = await supabase
                .from('couponCode')
                .update({ 사용횟수: updatedUsageCount })
                .eq('쿠폰코드', pinCode);

            if (updateUsageError) throw updateUsageError;

            // BulletPointHistory에서 가장 최근의 포인트 기록 가져오기
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

            // 새로운 이벤트 포인트 값 계산
            const newEventPoint = previousEventPoint + assignedPoints;

            // BulletPointHistory에 업데이트된 기록 추가
            const { error: insertError } = await supabase
                .from('BulletPointHistory')
                .insert({
                    user_id: user.id,
                    changeEventPoint: assignedPoints,  // 이번에 추가된 이벤트 포인트
                    purchasePoint: previousPurchasePoint, // 구매 포인트는 변경 없음
                    eventPoint: newEventPoint,         // 누적된 이벤트 포인트
                    reason: '쿠폰 코드 교환',                // 상태는 'Redeemed'   // 현재 날짜
                });

            if (insertError) throw insertError;

            // 쿠폰 사용 기록 추가
            const { error: redemptionInsertError } = await supabase
                .from('couponredemptions')
                .insert({
                    user_id: user.id,
                    쿠폰코드: pinCode
                });

            if (redemptionInsertError) throw redemptionInsertError;

            updateAlert("성공", `성공적으로 ${assignedPoints} 포인트를 계정에 추가했습니다!`);
        } catch (err) {
            updateAlert("에러가 발생했습니다.", err ? `${err}` : "알 수 없는 오류가 발생했습니다.");
            console.error("Error processing PIN code:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };
    const handleCancellation = () => {
        setHistoryUpdated(true);
        setHistoryUpdated(false); // Toggle historyUpdated to refresh history
    };

    const confirmPurchase = async () => {
        try {
            setIsLoading(true);

            // 인증된 사용자 가져오기
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error("User not authenticated.");

            // 주문 ID 및 상품 이름 설정
            const uniqueOrderId = `${user.id}_${Date.now()}`;
            const goodsName = isPremium ? "무제한 프리미엄" : `${selectedPoints} 포인트`;
            const amount = isPremium ? 25000 : selectedPrice;

            // 결제 요청
            if (isPremium) {
                // 프리미엄 구독 요청
                AUTHNICE.requestPay({
                    clientId: 'S2_be72bcdeab1840b0aad7be10d4ec5acc',
                    method: 'card', // 반복 결제를 위한 방법 설정
                    orderId: uniqueOrderId,
                    amount,
                    goodsName,
                    returnUrl: '/api/subscription', // 실제 엔드포인트
                    fnError: function (result: any) {
                        updateAlert("구독 오류", '구독 오류: ' + result.errorMsg);
                    }
                });
            } else {
                // 일반 1회 결제 요청
                AUTHNICE.requestPay({
                    clientId: 'S2_be72bcdeab1840b0aad7be10d4ec5acc',
                    method: 'cardAndEasyPay',
                    orderId: uniqueOrderId,
                    amount,
                    goodsName,
                    returnUrl: '/api/serverAuth',
                    fnError: function (result: any) {
                        updateAlert("결제 오류", '결제 오류: ' + result.errorMsg);
                    }
                });
            }

            setHistoryUpdated(true); // 결제 내역 업데이트 트리거
        } catch (err) {
            // 에러 발생 시 알림 표시
            updateAlert("에러가 발생했습니다.", err ? `${err}` : "알 수 없는 오류가 발생했습니다.");
            console.error("Error confirming purchase:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false); // 로딩 상태 종료
            setHistoryUpdated(false); // 내역 업데이트 상태 초기화
        }
    };


    // const handlePurchase = async (points: number, price: number, isPremium: boolean = false) => {
    //     try {
    //         setIsLoading(true);
    //         const { data: { user }, error: userError } = await supabase.auth.getUser();
    //         if (userError || !user) throw new Error("User not authenticated.");

    //         const uniqueOrderId = `${user.id}_${Date.now()}`;
    //         const goodsName = isPremium ? "무제한 프리미엄" : `${points} 포인트`;
    //         const amount = isPremium ? 25000 : price;

    //         if (isPremium) {
    //             // Make a subscription request for the premium purchase
    //             AUTHNICE.requestPay({
    //                 clientId: 'S2_be72bcdeab1840b0aad7be10d4ec5acc',
    //                 method: 'card', // Change to subscription method for recurring payment
    //                 orderId: uniqueOrderId,
    //                 amount,
    //                 goodsName,
    //                 returnUrl: '/api/subscription', // Actual endpoint
    //                 fnError: function (result: any) {
    //                     updateAlert("구독 오류", '구독 오류: ' + result.errorMsg);
    //                 }
    //             });
    //         } else {
    //             // Standard one-time purchase request
    //             AUTHNICE.requestPay({
    //                 clientId: 'S2_be72bcdeab1840b0aad7be10d4ec5acc',
    //                 method: 'cardAndEasyPay',
    //                 orderId: uniqueOrderId,
    //                 amount,
    //                 goodsName,
    //                 returnUrl: '/api/serverAuth',
    //                 fnError: function (result: any) {
    //                     updateAlert("결제 오류", '결제 오류: ' + result.errorMsg);
    //                 }
    //             });
    //         }

    //         setHistoryUpdated(true);
    //     } catch (err) {
    //         updateAlert("에러가 발생했습니다.", err ? `${err}` : "알 수 없는 오류가 발생했습니다.");
    //         console.error("Error recording purchase:", err);
    //         setError(err instanceof Error ? err.message : 'An unknown error occurred');
    //     } finally {
    //         setIsLoading(false);
    //         setHistoryUpdated(false);
    //     }
    // };




    const openModal = () => setIsModalOpen(true); // Function to open the modal
    const closeModal = () => setIsModalOpen(false); // Function to close the modal

    const PointPackage: React.FC<PointPackageProps> = ({ points, price }) => (
        <div className="w-1/3 h-[228px] bg-[#EDF4FF] rounded-2xl shadow-xl text-center">
            <div className='flex flex-col h-[176.5px] items-center justify-center gap-4'>
                {/* Gift icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <path d="M28.3327 17V31.1667H5.66602V17" stroke="#2871E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M31.1673 9.91663H2.83398V17H31.1673V9.91663Z" stroke="#2871E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M17 31.1666V9.91663" stroke="#2871E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M10.6257 9.91671H17.0007C17.0007 9.91671 15.584 2.83337 10.6257 2.83337C9.68634 2.83337 8.78551 3.20651 8.12131 3.8707C7.45712 4.5349 7.08398 5.43573 7.08398 6.37504C7.08398 7.31435 7.45712 8.21519 8.12131 8.87938C8.78551 9.54357 9.68634 9.91671 10.6257 9.91671Z" stroke="#2871E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M23.375 9.91671H17C17 9.91671 18.4167 2.83337 23.375 2.83337C24.3143 2.83337 25.2151 3.20651 25.8793 3.8707C26.5435 4.5349 26.9167 5.43573 26.9167 6.37504C26.9167 7.31435 26.5435 8.21519 25.8793 8.87938C25.2151 9.54357 24.3143 9.91671 23.375 9.91671Z" stroke="#2871E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                {/* Point and price details */}
                <h3 className="text-3xl font-semibold">{points.toLocaleString()} P</h3>
                <p className="text-lg font-medium text-gray-700">₩ {price.toLocaleString()}</p>
            </div>
            <button className="w-full h-[51.5px] rounded-b-lg border-t-2" onClick={() => initiatePurchase(points, price)}>구매하기</button>
        </div>
    );

    const PremiumPackage: React.FC = () => (
        <div className="w-full h-[228px] bg-[#EDF4FF] rounded-2xl shadow-xl text-center">
            <div className='flex flex-col h-[176.5px] items-center justify-center gap-4'>
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <path d="M28.3327 17V31.1667H5.66602V17" stroke="#2871E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M31.1673 9.91663H2.83398V17H31.1673V9.91663Z" stroke="#2871E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M17 31.1666V9.91663" stroke="#2871E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M10.6257 9.91671H17.0007C17.0007 9.91671 15.584 2.83337 10.6257 2.83337C9.68634 2.83337 8.78551 3.20651 8.12131 3.8707C7.45712 4.5349 7.08398 5.43573 7.08398 6.37504C7.08398 7.31435 7.45712 8.21519 8.12131 8.87938C8.78551 9.54357 9.68634 9.91671 10.6257 9.91671Z" stroke="#2871E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M23.375 9.91671H17C17 9.91671 18.4167 2.83337 23.375 2.83337C24.3143 2.83337 25.2151 3.20651 25.8793 3.8707C26.5435 4.5349 26.9167 5.43573 26.9167 6.37504C26.9167 7.31435 26.5435 8.21519 25.8793 8.87938C25.2151 9.54357 24.3143 9.91671 23.375 9.91671Z" stroke="#2871E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <h3 className="text-3xl font-semibold">무제한 프리미엄</h3>
                <p className="text-lg font-medium text-gray-700">₩ 25000</p>
            </div>
            <button
                className="h-[51.5px] w-full rounded-b-lg border-t-2"
                onClick={() => initiatePurchase(0, 25000)}
            >
                구독하기
            </button>
        </div>
    );


    const PurchaseHistory: React.FC = () => (
        <div className="space-y-2">
            {isLoading ? (
                <p>Loading purchase history...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : historyItems.length > 0 ? (
                historyItems.map((item, index) => (
                    <HistoryItem
                        key={index}
                        date={item.date}
                        amount={item.amount}
                        pointsBuy={item.pointsBuy}
                        pointsResidue={item.pointsResidue}
                        tid={item.tid}
                        status={item.status}
                    />
                ))
            ) : (
                <p className="text-sm text-gray-500">구매 내역이 없습니다.</p>
            )}
        </div>
    );

    const HistoryItem: React.FC<HistoryItemProps> = ({ date, amount, pointsBuy, pointsResidue, tid, status }) => (
        <div className="flex justify-between items-center border-t py-4">
            <div>
                <p className="text-sm text-gray-600">{date}</p>
                <div>
                    <p className="text-sm text-gray-500">구매  <span className='ml-2 text-black'>{pointsBuy}</span></p>
                    <p className="text-sm text-gray-500">잔여  <span className='ml-2 text-black'>{pointsResidue}</span></p>
                    <p className="text-sm text-gray-500">금액  <span className='ml-2 text-black'>{amount.toLocaleString()}원</span></p>
                </div>
            </div>
            {status === 'Refundable' ? (
                <CancellationPoint tid={tid} points={pointsBuy} price={amount} onCancellation={handleCancellation} />
            ) : status === 'Cancelled' ? (
                <p className="text-sm text-red-500">취소 완료</p>
            ) : (
                <p className="text-sm text-gray-500">취소 불가</p>
            )}
        </div>
    );

    useEffect(() => {
        const fetchBulletPointHistory = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) throw new Error("User not authenticated.");

                const { data, error } = await supabase
                    .from('BulletPointHistory')
                    .select('purchasePoint, eventPoint, reason, timestamp, totalchange, totalPoint')
                    .eq('user_id', user.id)
                    .order('timestamp', { ascending: false });

                if (error) throw error;

                const formattedHistory = data.map((item: any) => ({
                    purchasePoint: item.purchasePoint,
                    eventPoint: item.eventPoint,
                    reason: item.reason,
                    timestamp: new Date(item.timestamp).toLocaleString(),
                    totalchange: item.totalchange,
                    totalPoint: item.totalPoint,
                }));

                setBulletHistoryItems(formattedHistory);
            } catch (error) {
                console.error("Error fetching BulletPointHistory:", error);
            }
        };

        if (activeTab === 'bulletPointHistory') {
            fetchBulletPointHistory();
        }
    }, [activeTab]);

    const BulletPointHistoryTable: React.FC = () => {
        // Sort items in descending order by timestamp (assuming they are already fetched in descending order).
        const sortedItems = [...bulletHistoryItems].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Get the most recent event and purchase points
        const latestItem = sortedItems[0];

        return (
            <div className="space-y-4">
                {latestItem && (
                    <div className="flex flex-col justify-between px-4 py-2 bg-gray-100 rounded-lg">
                        <p className="font-semibold">구매한 포인트: <span className="text-blue-600">{latestItem.purchasePoint} P</span></p>
                        <p className="font-semibold">보너스 포인트: <span className="text-blue-600">{latestItem.eventPoint} P</span></p>
                    </div>
                )}
                {sortedItems.length > 0 ? (
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 text-center border-b">일시</th>
                                <th className="py-2 px-4 text-center border-b">사용/충전 내역</th>
                                <th className="py-2 px-4 text-center border-b">사용/충전 포인트</th>
                                <th className="py-2 px-4 text-center border-b">잔여 포인트</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedItems.map((item, index) => (
                                <tr key={index} className="border-t">
                                    <td className="py-2 px-4 text-center">{item.timestamp}</td>
                                    <td className="py-2 px-4 text-center">{item.reason}</td>
                                    <td className="py-2 px-4 text-center">{item.totalchange > 0 ? `+${item.totalchange} P` : `${item.totalchange} P`}</td>
                                    <td className="py-2 px-4 text-center">{item.totalPoint} P</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-sm text-gray-500">No history available.</p>
                )}
            </div>
        );
    };

    const ConfirmationModal: React.FC = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-[500px] space-y-6">
                <h2 className="text-center text-2xl font-bold">주문 확인</h2>
                <div className="bg-gray-100 p-4 rounded-lg space-y-4">
                    <div className="flex justify-between items-center text-lg">
                        <span>구매자명</span>
                        <span>{name || '이름을 가져오는 중...'}</span> {/* Display the user's name */}
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span>구매 포인트</span>
                        <span>{selectedPoints}P</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span>보너스 포인트</span>
                        <span>0P</span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex justify-between items-center text-xl font-semibold">
                        <span>총 결제 금액</span>
                        <span>{selectedPrice.toLocaleString()}원</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.agreements.all}
                            onChange={(e) => handleAgreementChange('all', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600"
                        />
                        <span className="ml-2 text-lg">아래 내용에 모두 동의합니다.</span>
                    </label>
                    <label className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.agreements.terms}
                                onChange={(e) => handleAgreementChange('terms', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                            />
                            <span className="ml-2">[필수] 결제 정보 제 3자 제공 동의</span>
                        </div>
                        <a href="/terms/결제%20서비스%20이용약관" target="_blank" className="text-blue-600">약관 보기</a>
                    </label>
                    <label className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.agreements.privacy}
                                onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                            />
                            <span className="ml-2">[필수] CVMATE 유료서비스 이용약관</span>
                        </div>
                        <a href="/terms/결제%20서비스%20이용약관" target="_blank" className="text-blue-600">약관 보기</a>
                    </label>
                </div>
                <div className="flex space-x-4 mt-6">
                    <button
                        onClick={() => setIsConfirmationModalOpen(false)}
                        className="w-full py-2 rounded-lg bg-gray-300"
                    >
                        취소
                    </button>
                    <button
                        onClick={confirmPurchase}
                        className="w-full py-2 rounded-lg bg-blue-500 text-white"
                        disabled={!formData.agreements.terms || !formData.agreements.privacy} // Disable button if required checkboxes are not checked
                    >
                        결제하기
                    </button>
                </div>
            </div>
        </div>
    );
    
    








    return (
        <div className="w-full min-h-screen flex flex-col bg-[#EBEEF1]">
            <header className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
                <DocsHeader />
            </header>
            <main className="flex-grow mt-[100px] mx-auto px-12 py-8 w-full">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="flex gap-2 bg-[#EBEEF1] border-b-2 border-blue-500">
                        <button
                            className={`w-[150px] py-2 px-4 text-center font-semibold rounded-t-lg ${activeTab === 'purchase' ? 'bg-[#EDF4FF] text-black border-2 border-[#2871E6] -mb-[2px]' : 'bg-[#E0E2E5]'
                                }`}
                            onClick={() => handleTabChange('purchase')}
                        >
                            구매하기
                        </button>
                        <button
                            className={`w-[150px] py-2 px-4 text-center font-semibold rounded-t-lg ${activeTab === 'history' ? 'bg-[#EDF4FF] text-black border-2 border-[#2871E6] -mb-[2px]' : 'bg-[#E0E2E5]'
                                }`}
                            onClick={() => handleTabChange('history')}
                        >
                            충전 내역
                        </button>
                        <button
                            className={`w-[150px] py-2 px-4 text-center font-semibold rounded-t-lg ${activeTab === 'bulletPointHistory' ? 'bg-[#EDF4FF] text-black border-2 border-[#2871E6] -mb-[2px]' : 'bg-[#E0E2E5]'}`}
                            onClick={() => handleTabChange('bulletPointHistory')}
                        >
                            포인트 사용 내역
                        </button>
                    </div>
                    <div className="p-10">
                        {activeTab === 'purchase' &&
                            <div className="space-y-8">
                                {/* Point Packages */}
                                <div className="flex justify-between gap-8">
                                    <PointPackage points={500} price={5000} />
                                    <PointPackage points={700} price={7000} />
                                    <PointPackage points={1000} price={10000} />
                                </div>
                                {/* Premium Subscription */}
                                <div className="mt-4">
                                    <PremiumPackage />
                                </div>
                                {/* Point Code input */}
                                <div className="mt-4">
                                    <div className="flex gap-2 items-center">
                                        <h2 className="text-sm text-gray-500">포인트 코드(PIN) 입력</h2>
                                        <input
                                            value={pinCode}
                                            onChange={(e: any) => setPinCode(e.target.value)}
                                            placeholder="PIN 코드 입력"
                                            className='border-2'
                                        />
                                        <button onClick={handlePinSubmit} className='bg-blue-500 text-white'>포인트 받기</button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        * ‘포인트 받기’ 버튼을 누르신 후에는 화면을 이탈하시더라도 이미 진행 중인 충전 절차가 취소되지 않습니다.
                                    </p>
                                </div>
                            </div>
                        }
                        {activeTab === 'history' && <PurchaseHistory />}
                        {activeTab === 'bulletPointHistory' && <BulletPointHistoryTable />}

                    </div>
                </div>
                <div className="mt-[50px]">
                    <h6 className='font-bold'>
                        포인트 이용 안내
                    </h6>
                    <ul>
                        <li>
                            포인트 구매 또는 사용 전 이용약관 동의가 필요합니다. <br />전용상품권 이용약관 {'>'}
                        </li>
                        <li>
                            구매 및 이용 내역은 ‘포인트샵 {'>'} 충전 내역’에서 확인 가능합니다.
                        </li>
                    </ul>
                    <h6 className='font-bold'>
                        포인트 이용 안내
                    </h6>
                    <ul>
                        <li>
                            무료 포인트는 구매 취소 및 환불 대상이 아닙니다. 따라서 충전 내역과 취소 내역의 포인트 수량이 다를 수 있습니다.
                        </li>
                        <li>
                            구매한 포인트는 사용하지 않은 경우에 한해, 구매 후 7일 이내에 포인트샵 {'>'} 충전내역에서 직접 구매 취소할 수 있습니다.

                        </li>
                        <li>
                            충전일로부터 7일 이후에는 취소 수수료에 해당하는 금액을 공제하고 환불됩니다.
                        </li>
                    </ul>
                </div>
            </main>
            {isModalOpen && <CancellationFlowModal />}
            {alert.show && (
                <CustomAlert
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert({ ...alert, show: false })}
                />
            )}
            {isConfirmationModalOpen && <ConfirmationModal />}
        </div>
    );
};



export default PointShop;
