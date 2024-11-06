'use client'
import React, { useState, useEffect } from 'react';
import DocsHeader from '@/components/docs/DocsHeader';
import CancellationFlowModal from '@/components/pointShop/CancelSub';
import CancellationPoint from '@/components/pointShop/CancelPoint';
import { createClient } from '@/utils/supabase/client';
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
    isCancellable?: boolean;
}

const PointShop: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'purchase' | 'history'>('purchase');
    const [pinCode, setPinCode] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const handleTabChange = (tab: 'purchase' | 'history') => {
        setActiveTab(tab);
    };

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
        const fetchPurchaseHistory = async () => {
            try {
                setIsLoading(true);
                setError(null);

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
                    isCancellable: true
                }));

                setHistoryItems(formattedHistoryItems);
            } catch (err) {
                console.error("Error fetching purchase history:", err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPurchaseHistory();
    }, []);

    const handlePinSubmit = async () => {
        try {
            setIsLoading(true);
            setError(null); // 시작할 때 오류 상태 초기화
    
            console.log("Starting PIN submission process...");
    
            // Step 1: 사용자 인증 및 정보 가져오기
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('No user logged in');
    
            console.log("User retrieved:", user);
    
            // Step 2: 쿠폰 코드 유효성 검사
            console.log("Checking if coupon code exists:", pinCode);
            const { data: couponData, error: couponError } = await supabase
                .from('couponCode')
                .select('*')
                .eq('쿠폰코드', pinCode)  // 실제 열 이름 '쿠폰코드' 사용
                .single();
    
            if (couponError || !couponData) {
                console.warn("Coupon code not found or invalid:", pinCode);
                setError("Invalid coupon code.");
                return;
            }
    
            console.log("Coupon data retrieved:", couponData);
    
            // Step 3: 사용자 쿠폰 사용 여부 확인
            const { data: redemptionData, error: redemptionError } = await supabase
                .from('couponredemptions')
                .select('*')
                .eq('user_id', user.id)
                .eq('쿠폰코드', pinCode)
                .single();
    
            if (redemptionData) {
                // 이미 사용된 쿠폰인 경우
                console.warn("User has already used this coupon:", pinCode);
                setError("You have already redeemed this coupon.");
                return;
            }
    
            if (redemptionError && redemptionError.code !== 'PGRST116') {
                // 다른 오류가 있는 경우
                console.error("Error checking coupon redemption:", redemptionError);
                throw redemptionError;
            }
    
            // Step 4: 포인트 할당 및 사용 횟수 증가
            const assignedPoints = couponData.할당포인트;
            const updatedUsageCount = couponData.사용횟수 + 1;
    
            console.log("Assigned points:", assignedPoints);
            console.log("Updated usage count:", updatedUsageCount);
    
            const { error: updateUsageError } = await supabase
                .from('couponCode')
                .update({ 사용횟수: updatedUsageCount })
                .eq('쿠폰코드', pinCode);
    
            if (updateUsageError) {
                console.error("Error updating usage count:", updateUsageError);
                throw updateUsageError;
            }
    
            console.log("Usage count updated successfully.");
    
            // Step 5: 프로필의 BulletPoint 업데이트 및 쿠폰 사용 기록 추가
            console.log("Updating user's BulletPoint in profiles table...");
            const { data, error: profileError } = await supabase.rpc('increment_bullet_point', {
                user_id_param: user.id,
                points: assignedPoints,
            });
    
            if (profileError) {
                console.error("Error updating user's BulletPoint:", profileError);
                throw profileError;
            }
    
            // 쿠폰 사용 기록 추가
            const { error: redemptionInsertError } = await supabase
                .from('couponredemptions')
                .insert({ user_id: user.id, 쿠폰코드: pinCode });
    
            if (redemptionInsertError) {
                console.error("Error inserting coupon redemption record:", redemptionInsertError);
                throw redemptionInsertError;
            }
    
            console.log("User's BulletPoint updated and coupon redemption recorded successfully. Assigned points:", assignedPoints);
    
            alert(`Successfully added ${assignedPoints} points to your account.`);
        } catch (err) {
            console.error("Error processing PIN code:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
            console.log("PIN submission process completed.");
        }
    };
    
    const handlePurchase = async (points: number, price: number) => {
        try {
            setIsLoading(true);
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error("User not authenticated.");
    
            // Fetch current points from the `profiles` table
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('BulletPoint')
                .eq('user_id', user.id)
                .single();
    
            if (profileError || !profileData) throw new Error("Failed to retrieve current points.");
    
            const currentPoints = profileData.BulletPoint;

            const uniqueOrderId = `${user.id}_${Date.now()}`;
    
            // 결제창 호출
            AUTHNICE.requestPay({
                clientId: 'S2_be72bcdeab1840b0aad7be10d4ec5acc',
                method: 'card',
                orderId: uniqueOrderId, // 유니크한 주문 ID 생성
                amount: price,
                goodsName: `${points} 포인트`,
                returnUrl: 'http://localhost:3000/api/serverAuth', // 실제 서버의 엔드포인트로 설정
                fnError: function (result: any) {
                    alert('결제 오류: ' + result.errorMsg);
                }

            });
        } catch (err) {
            console.error("Error recording purchase:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };
    
    
    
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
            <button className="w-full h-[51.5px] rounded-b-lg border-t-2" onClick={() => handlePurchase(points, price)}>구매하기</button>
        </div>
    );

    const PremiumPackage: React.FC = () => (
        <div className="w-full h-[228px] bg-[#EDF4FF] rounded-2xl shadow-xl text-center">
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
                <h3 className="text-3xl font-semibold">무제한 프리미엄</h3>
                <p className="text-lg font-medium text-gray-700">₩ 25000</p>
            </div>
            <button className="h-[51.5px] w-full rounded-b-lg border-t-2">구독하기</button>
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
                        isCancellable={item.isCancellable}
                    />
                ))
            ) : (
                <p className="text-sm text-gray-500">No purchase history found.</p>
            )}
        </div>
    );

    const HistoryItem: React.FC<HistoryItemProps> = ({ date, amount, pointsBuy, pointsResidue, isCancellable = true }) => (
        <div className="flex justify-between items-center border-t py-4">
            <div>
                <p className="text-sm text-gray-600">{date}</p>
                <div>
                    <p className="text-sm text-gray-500">구매  <span className='ml-2 text-black'>{pointsBuy}</span></p>
                    <p className="text-sm text-gray-500">잔여  <span className='ml-2 text-black'>{pointsResidue}</span></p>
                    <p className="text-sm text-gray-500">금액  <span className='ml-2 text-black'>{amount.toLocaleString()}원</span></p>
                </div>
            </div>
            {isCancellable ? (
                <CancellationFlowModal />
            ) : (
                <p className="text-sm text-gray-400">취소 불가</p>
            )}
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
                    </div>
                    <div className="p-10">
                        {activeTab === 'purchase' ? (
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
                        ) : (
                            <PurchaseHistory />
                        )}
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
        </div>
    );
};



export default PointShop;
