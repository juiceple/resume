import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: apiKey,
});

export async function generateEmbedding(input: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002", // OpenAI의 공식 embedding 모델
    input: input,
  });

  return response.data[0].embedding;
}
