import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// API 키를 환경 변수에서 가져옵니다.
const apiKey = process.env.SOLAR_API_KEY;

// OpenAI 클라이언트를 초기화합니다.
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.upstage.ai/v1/solar'
});

export async function POST(req: NextRequest) {
  try {
    // 요청 본문에서 번역할 텍스트를 추출합니다.
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: '번역할 텍스트가 제공되지 않았습니다.' }, { status: 400 });
    }

    // Solar API를 사용하여 채팅 완성을 생성합니다.
    const chatCompletion = await openai.chat.completions.create({
      model: 'solar-1-mini-translate-enko',
      messages: [
        {
          "role": "user",
          "content": text
        }
      ],
      stream: false
    });

    // 번역된 텍스트를 추출합니다.
    const translatedText = chatCompletion.choices[0]?.message?.content || '';
    console.log(translatedText);

    // 번역된 텍스트를 응답으로 반환합니다.
    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: '번역 중 오류가 발생했습니다.' }, { status: 500 });
  }
}