import { NextResponse } from 'next/server';
// import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const clientKey = process.env.NICEPAY_CLIENT_KEY;
const secretKey = process.env.NICEPAY_SECRET_KEY;
const base64Credentials = Buffer.from(`${clientKey}:${secretKey}`).toString('base64');

// Initialize the Supabase client for server-side
// const supabase = createClient();

export async function POST(req: Request) {
  try {
    const { tid, amount } = await req.json();

    // Step 1: Send a request to NicePay to cancel the payment
    const response = await fetch(`https://sandbox-api.nicepay.co.kr/v1/payments/${tid}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${base64Credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        reason: 'Purchase cancellation',
        orderId: uuidv4(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // If NicePay responds with an error, send that error back to the client
      console.error('NicePay cancellation error:', data.error || 'Failed to cancel payment');
      return NextResponse.json({ error: data.error || 'Failed to cancel payment' }, { status: response.status });
    }
    // Send a success response back to the client
    return NextResponse.json({ resultMsg: data.resultMsg });
  } catch (error: any) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
