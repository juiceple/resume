import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);

    const authResultCode = params.get('authResultCode');
    const tid = params.get('tid');
    const amount = params.get('amount');

    console.log("Received authentication result:", { authResultCode, tid, amount });

    if (authResultCode === '0000') {
        // 결제 승인 API 호출
        const clientKey = process.env.NICEPAY_CLIENT_KEY;
        const secretKey = process.env.NICEPAY_SECRET_KEY;
        const base64Credentials = Buffer.from(`${clientKey}:${secretKey}`).toString('base64');

        try {
            console.log("Sending approval request for tid:", tid);

            const response = await fetch(`https://sandbox-api.nicepay.co.kr/v1/payments/${tid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${base64Credentials}`,
                },
                body: JSON.stringify({ amount })
            });

            const result = await response.json();
            console.log("Approval response:", result);

            if (result.resultCode === '0000' && result.status === 'paid') {
                // 승인 성공 시, 필요한 데이터 추출 후 결과 페이지로 리디렉션
                const amount = result.amount;
                const orderId = result.orderId;
                const goodsName = result.goodsName;
                const cardName = result.card.cardName;
                const receiptUrl = result.receiptUrl;

                console.log("Payment approved, redirecting with:", { tid, amount, orderId, goodsName, cardName, receiptUrl });

                return NextResponse.redirect(
                    new URL(`/purchaseResult?success=true&tid=${tid}&amount=${amount}&orderId=${orderId}&goodsName=${goodsName}&cardName=${cardName}&receiptUrl=${encodeURIComponent(receiptUrl)}`, req.url)
                );
            } else {
                console.log("Payment approval failed:", result);
                // 승인 실패 시 실패 페이지로 리디렉션
                return NextResponse.redirect(new URL(`/purchaseResult?success=false`, req.url));
            }
        } catch (error) {
            console.error('Error during payment approval request:', error);
            return NextResponse.redirect(new URL(`/purchaseResult?success=false`, req.url));
        }
    } else {
        console.log("Authentication failed with resultCode:", authResultCode);
        // 인증 실패 시 실패 페이지로 리디렉션
        return NextResponse.redirect(new URL(`/purchaseResult?success=false`, req.url));
    }
}
