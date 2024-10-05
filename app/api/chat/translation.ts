
import OpenAI from "openai";

const translationOpenai = new OpenAI({
  apiKey: process.env.UPSTAGE_API_KEY,
  baseURL: 'https://api.upstage.ai/v1/solar'
});

export async function translateText(text: string): Promise<string> {
  try {
    const chatCompletion = await translationOpenai.chat.completions.create({
      model: 'solar-1-mini-translate-koen',
      messages: [
        {
          "role": "user",
          "content": text
        }
      ],
      stream: false
    });

    const translatedContent = chatCompletion.choices[0]?.message?.content;

    if (typeof translatedContent !== 'string') {
      throw new Error('Unexpected response from translation API');
    }

    return translatedContent;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
}