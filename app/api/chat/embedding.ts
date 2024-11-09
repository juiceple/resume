// import OpenAI from "openai";

// const apiKey = process.env.OPENAI_API_KEY;
// const openai = new OpenAI({
//   apiKey: apiKey,
// });

// export async function generateEmbedding(input: string) {
//   const response = await openai.embeddings.create({
//     model: "text-embedding-3-large", // OpenAI의 공식 embedding 모델
//     input: input,
//     dimensions: 4096
//   });

//   return response.data[0].embedding;
// }


import OpenAI from "openai";

const apiKey = process.env.SOLAR_API_KEY;

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.upstage.ai/v1/solar'
});

export async function generateEmbedding(input: string) {
  const embeddings = await openai.embeddings.create({
    model: "solar-embedding-1-large-query",
    input: input,
  });

  return embeddings.data[0].embedding;
}