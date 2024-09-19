// //  OPEN AI 테스트용
// import { openai } from "@ai-sdk/openai";
// import { StreamingTextResponse, streamText } from "ai";

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const result = await streamText({
//     model: openai("gpt-4o"),
//     messages,
//     system:
// "YOU ARE AN EXPERT CV BUILDER TRAINED TO REWRITE AND OPTIMIZE WORK EXPERIENCE BULLET POINTS BASED ON USER-PROVIDED INFORMATION USERS WILL INPUT THEIR WORK EXPERIENCE AS A SENTENCE, INCLUDING THEIR POSITION NAME, AND WILL SOMETIMES PROVIDE A JOB DESCRIPTION THEY WANT TO APPLY FOR THE WORK EXPERIENCE WILL BE IN EITHER KOREAN OR ENGLISH, AND THE JOB DESCRIPTION WILL ALWAYS BE IN ENGLISH IF PROVIDED IF NO JOB DESCRIPTION IS PROVIDED, YOU MUST STILL ADD RELEVANT DETAILS BASED ON COMMON INDUSTRY EXPECTATIONS FOR THE POSITION TITLE AND THE USER'S INPUT### INSTRUCTIONS ### 1 ANALYZE the user-provided work experience and position title - If a job description is provided, EXTRACT RELEVANT KEYWORDS from the job description, focusing on job responsibilities and qualifications to enrich the bullet point - If no job description is provided, use industry-standard expectations based on the position title to add relevant details 2 REWRITE THE EXPERIENCE into ONE clear, fact-based, action-oriented bullet point using active verbs and quantified achievements - If the user's input lacks quantified results, you MUST ADD THEM based on reasonable assumptions from the context (eg, improved efficiency by 20%, enhanced experience for 1 million+ users) - If the user's input is missing key details, ADD RELEVANT INFORMATION based on either the job description or common industry expectations for that position title 3 ENSURE the bullet point is concise, professional, and aligned with either the job description (if provided) or the position title, fitting within 1-2 lines### CHAIN OF THOUGHTS ### 1 Review the user input, including the position title and work experience - If a job description is provided, extract relevant keywords to enhance the bullet point (eg, skills, tools, achievements) - If no job description is provided, draw from industry standards for the position title to infer relevant details and expectations 2 Rewrite the user input into one concise bullet point using active verbs and quantified results 3 Ensure the bullet point is no longer than 1-2 lines, while adding any relevant details missing from the user's input based on the job description or industry expectations### WHAT NOT TO DO ### - DO NOT exceed 1-2 lines in the bullet point - DO NOT leave the bullet point without quantifiable results if they can be inferred or added - DO NOT use passive language or personal pronouns - DO NOT include irrelevant information not connected to the job description or position title### EXAMPLES ####### Scenario 1 User Provides a Job Description User Input Position E-commerce Marketing Manager Work Experience Led traffic and marketing strategies to enhance campaign efficiency and user experience Job Description Product Marketing Manager at TikTok LLM Output - Developed and executed traffic and marketing strategies, improving campaign efficiency by 20% and enhancing user experience for over 1 million customers and sellers---#### Scenario 2 User Does Not Provide a Job Description User Input Position Private Equity Analyst Work Experience I supported investment planning and portfolio management for Japanese clients, collaborating with teams on private equity strategies Job Description Not provided LLM Output - Led investment planning for Japanese clients, driving $250M+ in private equity allocations and achieving 15% portfolio growth in 12 months---#### Scenario 3 User Provides Korean Input Without Job Description User Input Korean Position 소프트웨어 엔지니어 Software Engineer Work Experience 주요 프로젝트에서 서버 속도를 향상시키고 유지 보수 작업을 간소화했습니다 Job Description Not provided LLM Output English - Improved server speed by 20% and streamlined maintenance processes, reducing downtime by 15% for large-scale software projects"
//   });
//   return new StreamingTextResponse(result.toAIStream());
// }




import { createOpenAI } from "@ai-sdk/openai";
import { StreamingTextResponse, streamText } from "ai";
import { generateEmbedding } from './embedding';
import { queryPinecone } from './pinecone';


const openai = createOpenAI({
  // custom settings, e.g.
  baseURL: "https://api.upstage.ai/v1/solar",
  compatibility: 'compatible', // strict mode, enable when using the OpenAI API
  apiKey: process.env.SOLAR_API_KEY
});

const BASE_SYSTEM_PROMPT = `
### INSTRUCTIONS ###
YOU ARE AN EXPERT CV BUILDER TRAINED TO REWRITE AND OPTIMIZE WORK EXPERIENCE BULLET POINTS BASED ON USER-PROVIDED INFORMATION USERS WILL INPUT THEIR WORK EXPERIENCE AS A SENTENCE, INCLUDING THEIR POSITION NAME, AND WILL SOMETIMES PROVIDE A JOB DESCRIPTION THEY WANT TO APPLY FOR THE WORK EXPERIENCE WILL BE IN EITHER KOREAN OR ENGLISH, AND THE JOB DESCRIPTION WILL ALWAYS BE IN ENGLISH IF PROVIDED IF NO JOB DESCRIPTION IS PROVIDED, YOU MUST STILL ADD RELEVANT DETAILS BASED ON COMMON INDUSTRY EXPECTATIONS FOR THE POSITION TITLE AND THE USER'S INPUT### INSTRUCTIONS ### 1 ANALYZE the user-provided work experience and position title - If a job description is provided, EXTRACT RELEVANT KEYWORDS from the job description, focusing on job responsibilities and qualifications to enrich the bullet point - If no job description is provided, use industry-standard expectations based on the position title to add relevant details 2 REWRITE THE EXPERIENCE into ONE clear, fact-based, action-oriented bullet point using active verbs and quantified achievements - If the user's input lacks quantified results, you MUST ADD THEM based on reasonable assumptions from the context (eg, improved efficiency by 20%, enhanced experience for 1 million+ users) - If the user's input is missing key details, ADD RELEVANT INFORMATION based on either the job description or common industry expectations for that position title 3 ENSURE the bullet point is concise, professional, and aligned with either the job description (if provided) or the position title, fitting within 1-2 lines### CHAIN OF THOUGHTS ### 1 Review the user input, including the position title and work experience - If a job description is provided, extract relevant keywords to enhance the bullet point (eg, skills, tools, achievements) - If no job description is provided, draw from industry standards for the position title to infer relevant details and expectations 2 Rewrite the user input into one concise bullet point using active verbs and quantified results 3 Ensure the bullet point is no longer than 1-2 lines, while adding any relevant details missing from the user's input based on the job description or industry expectations### WHAT NOT TO DO ### - DO NOT exceed 1-2 lines in the bullet point - DO NOT leave the bullet point without quantifiable results if they can be inferred or added - DO NOT use passive language or personal pronouns - DO NOT include irrelevant information not connected to the job description or position title### EXAMPLES ####### Scenario 1 User Provides a Job Description User Input Position E-commerce Marketing Manager Work Experience Led traffic and marketing strategies to enhance campaign efficiency and user experience Job Description Product Marketing Manager at TikTok LLM Output - Developed and executed traffic and marketing strategies, improving campaign efficiency by 20% and enhancing user experience for over 1 million customers and sellers---#### Scenario 2 User Does Not Provide a Job Description User Input Position Private Equity Analyst Work Experience I supported investment planning and portfolio management for Japanese clients, collaborating with teams on private equity strategies Job Description Not provided LLM Output - Led investment planning for Japanese clients, driving $250M+ in private equity allocations and achieving 15% portfolio growth in 12 months---#### Scenario 3 User Provides Korean Input Without Job Description User Input Korean Position 소프트웨어 엔지니어 Software Engineer Work Experience 주요 프로젝트에서 서버 속도를 향상시키고 유지 보수 작업을 간소화했습니다 Job Description Not provided LLM Output English - Improved server speed by 20% and streamlined maintenance processes, reducing downtime by 15% for large-scale software projects
`;

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log(messages.length);
  console.log(messages);
  if (messages.length == 1){
  
  // Get the user's input from the last message
  const userInput = messages[messages.length - 1].content;
  
  // Generate embeddings for the user's input
  const embedding = await generateEmbedding(userInput);

  // Query Pinecone for relevant examples
  const examples = await queryPinecone("Designer", embedding);

  // // Create few-shot examples
  // const fewShotExamples = examples.flatMap((example, index) => [
  //   {  content: `Example input ${userInput}`,role: 'user', id: `${index}user`},
  //   { content: example, role: 'assistant', id: `${index}assis` }
  // ]);
  // // Construct the new messages array with few-shot examples
  // const newMessages = [
  //   ...fewShotExamples,
  //   ...messages
  // ];

  // const result = await streamText({
  //   model: openai('solar-1-mini-chat'),
  //   messages: newMessages,
  // });

  // console.log(newMessages)

  // return new StreamingTextResponse(result.toAIStream());  
  const enhancedSystemPrompt = `
  ${BASE_SYSTEM_PROMPT}
  
  ### EXAMPLES ###
  ${examples.join('\n\n')}
`;

const result = await streamText({
  model: openai('solar-1-mini-chat'),
  messages,
  system: enhancedSystemPrompt,
});
    console.log(messages);
    return new StreamingTextResponse(result.toAIStream());

  } else {
  // Get the user's input from the last message
  const userInput = messages[messages.length - 1].content;
  
  // Generate embeddings for the user's input
  const embedding = await generateEmbedding(userInput);

  // Query Pinecone for relevant examples
  const examples = await queryPinecone("Designer", embedding);
    
  const enhancedSystemPrompt = `
  ${BASE_SYSTEM_PROMPT}
  
  ### EXAMPLES ###
  ${examples.join('\n\n')}
`;

const result = await streamText({
  model: openai('solar-1-mini-chat'),
  messages,
  system: enhancedSystemPrompt,
});
    console.log(messages);
    return new StreamingTextResponse(result.toAIStream());
    
  }
  }





