import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from 'ai';
import { bulletPointSchema } from './schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
const openai = createOpenAI({
  // custom settings, e.g.
  baseURL: "https://api.upstage.ai/v1/solar",
  compatibility: 'compatible', // strict mode, enable when using the OpenAI API
  apiKey: process.env.SOLAR_API_KEY
});


export async function POST(req: Request) {
  const context = await req.json();
    console.log(context);
  const result = await streamObject({
    model: openai('solar-1-mini-chat'),
    schema: bulletPointSchema,
    prompt:
      `Generate 3 bullet point for a english resume based on information of previousJOB:${context.job} WhatToDo:${context.workOnJob} & they are lookinfor job:${context.announcement}`
  });

  return result.toTextStreamResponse();
}