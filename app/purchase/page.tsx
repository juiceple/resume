"use client"
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from "next/image"

export default function OrderConfirmation() {
    const searchParams = useSearchParams();

    const name = searchParams.get('name') || '';
    const goodsName = searchParams.get('goodsName') || '무제한 프리미엄 멤버십';
    const amount = searchParams.get('amount') || '25000';

    const [cardNumbers, setCardNumbers] = useState<string[]>(['', '', '', '']);
    const [expMonth, setExpMonth] = useState<string>('');
    const [expYear, setExpYear] = useState<string>('');
    const [birthDate, setBirthDate] = useState<string>('');
    const [cardPw, setCardPw] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isAgreed, setIsAgreed] = useState<boolean>(false);
    // 상태 추가
    const [agreements, setAgreements] = useState({
        all: false,
        payment: false,
        service: false
    });

    // 전체 동의 핸들러
    const handleAllAgreements = (checked: any) => {
        setAgreements({
            all: checked,
            payment: checked,
            service: checked
        });
        setIsAgreed(checked); // 기존 isAgreed 상태 업데이트
    };

    const handleIndividualAgreement = (key: any, checked: any) => {
        const newAgreements = {
            ...agreements,
            [key]: checked
        };
        // 모든 필수 항목이 체크되었는지 확인
        const allChecked = newAgreements.payment && newAgreements.service;
        newAgreements.all = allChecked;

        setAgreements(newAgreements);
        setIsAgreed(allChecked); // 기존 isAgreed 상태 업데이트
    };

    const inputStyle = "focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

    // 숫자만 입력받는 핸들러
    const handleNumberOnly = (value: string, maxLength: number) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        return numericValue.slice(0, maxLength);
    };

    // 카드번호 입력 핸들러
    const handleCardNumber = (index: number, value: string) => {
        const newValue = handleNumberOnly(value, 4);
        const newCardNumbers = [...cardNumbers];
        newCardNumbers[index] = newValue;
        setCardNumbers(newCardNumbers);

        // 자동으로 다음 입력 필드로 포커스 이동
        if (newValue.length === 4 && index < 3) {
            const nextInput = document.querySelector<HTMLInputElement>(`input[name=card-${index + 1}]`);
            if (nextInput) nextInput.focus();
        }
    };

    // 유효기간 월 입력 핸들러
    const handleExpMonth = (value: string) => {
        const numericValue = handleNumberOnly(value, 2);
        if (numericValue === '' || (parseInt(numericValue) <= 12)) {
            setExpMonth(numericValue);
            if (numericValue.length === 2) {
                document.querySelector<HTMLInputElement>('input[name=exp-year]')?.focus();
            }
        }
    };

    // 유효기간 년도 입력 핸들러
    const handleExpYear = (value: string) => {
        const numericValue = handleNumberOnly(value, 2);
        setExpYear(numericValue);
    };

    // 생년월일 입력 핸들러
    const handleBirthDate = (value: string) => {
        const numericValue = handleNumberOnly(value, 6);
        setBirthDate(numericValue);
    };

    // 비밀번호 입력 핸들러
    const handleCardPw = (value: string) => {
        const numericValue = handleNumberOnly(value, 2);
        setCardPw(numericValue);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        if (cardNumbers.some(num => num.length !== 4)) {
            alert('카드번호를 올바르게 입력해주세요.');
            return;
        }
        if (expMonth.length !== 2 || parseInt(expMonth) < 1 || parseInt(expMonth) > 12) {
            alert('유효기간(월)을 올바르게 입력해주세요.');
            return;
        }
        if (expYear.length !== 2) {
            alert('유효기간(년)을 올바르게 입력해주세요.');
            return;
        }
        if (birthDate.length !== 6) {
            alert('생년월일 6자리를 입력해주세요.');
            return;
        }
        if (cardPw.length !== 2) {
            alert('카드 비밀번호 앞 2자리를 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            const formattedCardNo = cardNumbers.join('');
            const cleanedAmount = amount.replace(/,/g, '');

            const registerResponse = await fetch('/api/subscribe/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    goodsName,
                    amount: cleanedAmount,
                    cardNo: formattedCardNo,
                    expMonth,
                    expYear,
                    idNo: birthDate,
                    cardPw,
                }),
            });

            const registerData = await registerResponse.json();
            if (!registerResponse.ok) {
                throw new Error(registerData.message || '결제 등록에 실패했습니다.');
            }

            if (registerData.resultMsg) {
                const payResponse = await fetch('/api/subscribe/pay', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        bid: registerData.bid,
                        amount: cleanedAmount,
                        goodsName,
                    }),
                });

                const payData = await payResponse.json();
                if (!payResponse.ok) {
                    throw new Error(payData.message || '결제 처리에 실패했습니다.');
                }

                alert(payData.resultMsg || '결제가 완료되었습니다.');
                window.location.href = '/payment/success';
            }
        } catch (error: any) {
            console.error('결제 처리 중 오류:', error);
            alert(error.message || '결제 처리 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto absolute p-12 bg-background flex flex-col items-center justify-center">
            <div className='mt-[200px]'><Image src="/images/resume.png" alt="Logo" width={192} height={68} /></div>
            <h1 className="text-xl font-semibold mb-4 text-center">주문 확인</h1>
            <div className="w-full flex flex-col justify-center items-center"> {/* Add this container */}
                <div className='w-[600px] flex flex-col justify-center'>
                    <Card className="mb-4 w-full">
                        <CardContent className="pt-6">
                            <h2 className="text-base mb-4">주문 정보</h2>
                            <div className="space-y-2">
                                <div>
                                    <div className="text-sm text-muted-foreground">구매자명</div>
                                    <div>{name}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">구매 상품</div>
                                    <div>{goodsName}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">총 결제 금액</div>
                                    <div className="text-lg font-semibold">{amount}원</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='w-full'>
                        <CardContent className="pt-6">
                            <h2 className="text-base mb-4">정기 결제 정보</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">카드번호</div>
                                    <div className="flex gap-2">
                                        {[0, 1, 2, 3].map((index) => (
                                            <Input
                                                key={index}
                                                type="text"
                                                name={`card-${index}`}
                                                value={cardNumbers[index]}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleCardNumber(index, e.target.value)}
                                                className={`w-[72px] text-center ${inputStyle}`}
                                                inputMode="numeric"
                                                disabled={isSubmitting}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">유효기간</div>
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            name="exp-month"
                                            placeholder="MM"
                                            value={expMonth}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleExpMonth(e.target.value)}
                                            className={`w-20 text-center ${inputStyle}`}
                                            inputMode="numeric"
                                            disabled={isSubmitting}
                                        />
                                        <Input
                                            type="text"
                                            name="exp-year"
                                            placeholder="YY"
                                            value={expYear}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleExpYear(e.target.value)}
                                            className={`w-20 text-center ${inputStyle}`}
                                            inputMode="numeric"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">생년월일 6자리</div>
                                    <Input
                                        type="text"
                                        placeholder="예) 931024"
                                        value={birthDate}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleBirthDate(e.target.value)}
                                        className={`w-full ${inputStyle}`}
                                        inputMode="numeric"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">카드 비밀번호 (앞 2자리)</div>
                                    <Input
                                        type="password"
                                        value={cardPw}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleCardPw(e.target.value)}
                                        className={`w-20 text-center ${inputStyle}`}
                                        inputMode="numeric"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    {/* Terms and agreement checkbox */}
                    <Card className='w-full mb-[75px] mt-4'>
                        <CardContent>
                            <div className="w-full py-4">
                                <h2 className="font-semibold mb-4 text-base">결제 약관</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={agreements.all}
                                            onChange={(e) => handleAllAgreements(e.target.checked)}
                                            disabled={isSubmitting}
                                            className="w-4 h-4 border border-gray-300 rounded focus:ring-0 focus:ring-offset-0"
                                        />
                                        <span className="text-base">아래 내용에 모두 동의합니다.</span>
                                    </label>

                                    <div className="pl-6 space-y-2">
                                        <div className='flex items-center justify-between'>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={agreements.payment}
                                                    onChange={(e) => handleIndividualAgreement('payment', e.target.checked)}
                                                    disabled={isSubmitting}
                                                    className="w-4 h-4 border border-gray-300 rounded focus:ring-0 focus:ring-offset-0"
                                                />
                                                <span className="text-sm text-gray-600">[필수] 결제 정보 제 3자 제공 동의</span>
                                            </div>
                                            <a href="/terms/결제%20이용약관" target="_blank" className="text-blue-600 pr-2">약관 보기</a>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={agreements.service}
                                                    onChange={(e) => handleIndividualAgreement('service', e.target.checked)}
                                                    disabled={isSubmitting}
                                                    className="w-4 h-4 border border-gray-300 rounded focus:ring-0 focus:ring-offset-0"
                                                />
                                                <span className="text-sm text-gray-600">[필수] CVMATE 유료서비스 이용약관</span>
                                            </div>
                                            <a href="/terms/결제%20이용약관" target="_blank" className="text-blue-600 pr-2">약관 보기</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Fixed footer for buttons */}
            <footer className="h-[75px] flex justify-end items-center px-[30px] pb-[30px] fixed bottom-0 right-0 w-full bg-background">
                <Button
                    variant="outline"
                    className="mr-4"
                    disabled={isSubmitting}
                    onClick={() => (window.location.href = '/')}
                >
                    취소
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!isAgreed || isSubmitting}
                >
                    {isSubmitting ? '처리중...' : '결제하기'}
                </Button>
            </footer>
        </div>
    );
}
