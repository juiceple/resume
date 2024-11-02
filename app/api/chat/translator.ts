import OpenAI from 'openai';

// API 키를 환경 변수에서 가져옵니다.
const apiKey = process.env.SOLAR_API_KEY;

// OpenAI 클라이언트를 초기화합니다.
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.upstage.ai/v1/solar'
});
