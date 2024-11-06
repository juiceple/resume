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

const CancellationFlowModal: React.FC = () => {
    const [step, setStep] = useState(1);

    const handleNextStep = () => setStep(step + 1);
    const handlePreviousStep = () => setStep(step - 1);

    return (
        <AlertDialog>
            <AlertDialogTrigger>
                <button className="border  p-2 border-[#2871E6] bg-[#D9D9D900]">
                    구매 취소
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent className='w-[476px] h-auto py-10 flex flex-col gap-6 items-center'>
                {step === 1 && (
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle>취소할 경우, 모든 혜택이 사라집니다.</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription className="text-center">
                            프리미엄 멤버십을 취소하시면 영문이력서 생성에 필요한 무제한 포인트 혜택을 누리실 수 없게 돼요.<br />
                            그래도 해지하시겠어요?
                        </AlertDialogDescription>
                        <div className="flex gap-4">
                            <button onClick={handleNextStep} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                계속
                            </button>
                            <AlertDialogCancel asChild>
                                <button className="bg-gray-300 text-black px-4 py-2 rounded-md">
                                    유지하기
                                </button>
                            </AlertDialogCancel>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle>멤버십을 해지하는 이유를 알려주세요!</AlertDialogTitle>
                            <AlertDialogDescription>더 좋은 서비스를 위한 자료로 사용합니다 :)</AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex flex-col gap-4">
                            <label><input type="radio" name="reason" /> 취업/이직에 성공해서 CV를 업데이트할 필요가 없어요.</label>
                            <label><input type="radio" name="reason" /> 멤버십 가격이 부담돼요.</label>
                            <label><input type="radio" name="reason" /> 다른 서비스를 이용해요.</label>
                            <label><input type="radio" name="reason" /> 다른 이유나 건의하고 싶은 점이 있으신가요?</label>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button onClick={handleNextStep} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                다음
                            </button>
                            <button onClick={handlePreviousStep} className="bg-gray-300 text-black px-4 py-2 rounded-md">
                                이전
                            </button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle>00님의 커리어를 응원합니다!</AlertDialogTitle>
                            <AlertDialogDescription>
                                구독을 해지해도 00월 00일까지 무제한으로 즐기실 수 있어요.<br />
                                더 나은 서비스를 제공하는 CVMATE가 되겠습니다.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogCancel asChild>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                확인
                            </button>
                        </AlertDialogCancel>
                    </>
                )}
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CancellationFlowModal;
