import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
const index = pinecone.index("resume");

export async function queryPinecone(jobTitle: string, vector: number[], topK: number = 3) {
  const queryResponse = await index.namespace(jobTitle).query({
    vector: vector,
    topK: topK,
    includeMetadata: true,
  });

  console.log(queryResponse.matches.map(match => match.metadata?.bullet_point))

  return queryResponse.matches.map(match => match.metadata?.bullet_point);
}