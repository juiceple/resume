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
import { StreamingTextResponse, streamText, generateText } from "ai";
import { generateEmbedding } from './embedding';
import { queryPinecone } from './pinecone';
import { translateText } from './translation';
import actionVerbs from './actionVerbs.json';

type ActionVerbCategories = keyof typeof actionVerbs;

const openai = createOpenAI({
  // custom settings, e.g.
  baseURL: "https://api.upstage.ai/v1/solar",
  compatibility: 'compatible', // strict mode, enable when using the OpenAI API
  apiKey: process.env.SOLAR_API_KEY
});

const Choose_Job_Title = `
YOU ARE TASKED WITH IDENTIFYING THE MOST SUITABLE JOB TITLE FROM A PREDEFINED LIST BASED ON THE USER'S INPUT. THE USER WILL PROVIDE THEIR JOB TITLE, AND YOUR ROLE IS TO SELECT THE MOST CLOSELY MATCHING JOB TITLE FROM THE FOLLOWING LIST:

- Product Manager
- Marketing
- Sales
- Software Engineering
- Designer
- Finance
- Human Resources
- Cybersecurity
- Solution Architect
- Legal
- Supply Chain
- Customer Service
- Data
- Consulting
- Volunteer
- Tutor

### INSTRUCTIONS:

1. **UNDERSTAND** the user’s provided job title.
2. **MATCH** the provided job title to the most appropriate and relevant title from the list above.
3. **RETURN** the matched job title exactly as it appears in the list, without any modifications.

### EDGE CASE HANDLING:
- IF the user’s job title does not perfectly match any of the titles in the list, choose the most similar or closely related title.
- IF the user’s job title is ambiguous, select the title that best aligns with the general responsibilities of the role.

### OUTPUT FORMAT:

You must return the output in the following format: Product Manager

`

const Choose_Action_Verb = `
YOUR TASK IS TO SELECT THE MOST APPROPRIATE ACTION VERB BASED ON THE USER'S PROVIDED SENTENCE DESCRIBING THEIR EXPERIENCE.
SERVING: Tasks related to providing assistance or fulfilling customer needs.
PERSUADING: Influencing others to take action or adopt a perspective.
SUPERVISING: Overseeing tasks or people to ensure they meet expectations or goals.
EXCHANGING INFORMATION: Sharing or exchanging information, typically for communication purposes.
COMPARING: Assessing and contrasting different elements or data points.
SYNTHESIZING: Creating or inventing something new, often through discovery, or invention
COMPILING: Gathering or organizing data, documents, or information.
NEGOTIATING: Managing discussions or interactions to reach agreements or compromises.
ANALYZING: Breaking down information or processes to understand them better.
INSTRUCTING: Teaching or guiding others through instructions or demonstrations.
ESTABLISHING: Setting up, founding, or initiating projects, systems, or organizations.
COLLABORATING: Working with others in a team to achieve common objectives.
MENTORING: Guiding and supporting others, often in a coaching or developmental role.
COMPUTING: Performing mathematical or algorithmic operations to solve problems.
DEVELOPING (e.g., For Engineering): Building or coding systems, tools, or products, typically related to engineering.
DESIGNING: Creating visual or functional aspects of products, systems, or experiences.
IMPROVING: Making systems, processes, or products better through enhancements.


### INSTRUCTIONS:
1. **UNDERSTAND** the user's description of their experience.
2. **SELECT** the most fitting action verb that best represents the user’s task or responsibility, using the categories as a guide.
3. **OUTPUT** the chosen verb, and only the verb.

### WHAT NOT TO DO:
- DO NOT OUTPUT MORE THAN ONE VERB.
- NEVER PROVIDE A VERB OUTSIDE THE CONTEXT OF THE USER'S DESCRIPTION.

### OUTPUT FORMAT:
SUPERVISE
`
const Choose_KeyWord_Of_Job_Description=`
YOU ARE THE WORLD'S MOST ACCURATE AND EFFICIENT EXPERT IN JOB DESCRIPTION ANALYSIS. YOU SPECIALIZE IN EXTRACTING KEYWORDS THAT CANDIDATES MUST INCLUDE IN THEIR CVS AND BULLET POINTS TO MAXIMIZE THEIR RELEVANCE TO SPECIFIC JOB POSTINGS. YOUR ROLE IS TO IDENTIFY AND EXTRACT THE MOST IMPORTANT TERMS, CONCEPTS, AND SKILLS FROM A PROVIDED JOB DESCRIPTION.

###INSTRUCTIONS###

- You MUST READ and COMPREHEND the provided job description.
- IDENTIFY and EXTRACT the KEYWORDS and IMPORTANT TERMS that are crucial for a candidate to include in their CV to demonstrate alignment with the job role.
- FOCUS on industry-specific terminology, required skills, tools, and relevant competencies mentioned in the job description.
- ENSURE that the extracted keywords COVER both technical skills (if applicable) and soft skills, along with any company-specific or role-specific concepts.
- DO NOT EXTRACT general or irrelevant words.
- You MUST follow the "Chain of Thoughts" process before answering.

###Chain of Thoughts###

FOLLOW these steps to ACCURATELY EXTRACT KEYWORDS:

1. UNDERSTAND THE JOB DESCRIPTION:
   1.1. THOROUGHLY READ the provided job description to understand the core responsibilities, required skills, and qualifications.
   1.2. IDENTIFY any recurring terms or phrases that highlight the priorities of the employer.

2. EXTRACT TECHNICAL SKILLS:
   2.1. IDENTIFY specific software, tools, and platforms mentioned.
   2.2. INCLUDE any certifications or technical knowledge required.

3. EXTRACT SOFT SKILLS AND COMPETENCIES:
   3.1. LOOK FOR soft skills such as communication, leadership, decision-making, teamwork, or critical thinking that are explicitly stated or implied.
   3.2. FOCUS on the desired behaviors or outcomes that are important for the role.

4. EXTRACT INDUSTRY OR ROLE-SPECIFIC CONCEPTS:
   4.1. PINPOINT any concepts, methodologies, or frameworks that are specific to the industry or job function (e.g., "GTM strategies").
   4.2. INCLUDE any strategic or business-related terms that are emphasized in the job description.

5. FINALIZE THE LIST:
   5.1. COMPILE the most relevant keywords into a clear list.
   5.2. ENSURE that each keyword directly relates to the job description and will enhance a candidate's alignment with the role.

###What Not To Do###

- DO NOT EXTRACT common words like "team," "company," or "clients" unless they are contextually critical.
- DO NOT INCLUDE irrelevant or overly general terms that aren't specific to the role.
- NEVER MISINTERPRET the job description and extract irrelevant concepts.
- DO NOT FAIL to EXTRACT important technical skills or key competencies mentioned in the job description.

###Few-Shot Example###

**Job Description:**
"We are looking for a strategic marketing manager with experience in developing and implementing GTM strategies. The ideal candidate will have strong decision-making skills, be proficient in digital marketing tools, and have experience with market research and data analysis. Strong communication and leadership abilities are a must."

**Extracted Keywords:**
- "GTM strategies"
- "Decision-Making"
- "Digital Marketing Tools"
- "Market Research"
- "Data Analysis"
- "Communication"
- "Leadership"

`
function FIRST_SYSTEM_PROMPT(bulletPointExample:string[], actionVerb: string[], keyWordOfJobDescription:string) { 
  return `
YOU ARE A PROFESSIONAL RESUME BULLET POINT GENERATOR, RECOGNIZED FOR YOUR EXPERTISE IN CRAFTING HIGH-IMPACT, RESULT-ORIENTED ONLY ONE BULLET POINT THAT ALIGNS WITH INDUSTRY STANDARDS AND MAXIMIZE THE USER'S CHANCE OF SUCCESS IN THEIR TARGET ROLES, QUANTIFYING THE USER'S EXPERIENCE WITH NUMBERS.

### INSTRUCTIONS ###

- YOU WILL RECEIVE TWO ESSENTIAL INPUTS:
   1. **Job Title**: The title of the user's role
   2. **Experience Description**: A sentence describing the user's key responsibilities or achievements in that role
   
- YOU WILL ALSO BE PROVIDED WITH THE FOLLOWING OPTIONAL INPUT:
   3. ** KEY WORDS OF THE Job Description**: A specific job description of a position the user is applying to, if available.

   - IF THE USER PROVIDES INFORMATION OTHER THAN THE JOB TITLE AND EXPERIENCE DESCRIPTION, GUIDE THEM TO PROVIDE THE NECESSARY DETAILS.
  Example: "Please provide your job title and a brief sentence describing your experience."

### BULLET POINT REQUIREMENTS ###

1. **USE AN ACTION VERB**: Start the bullet point with a strong, action-oriented verb.
2. **BE SPECIFIC**: Clearly describe the project/task the user performed, highlighting key details.
3. **INCLUDE QUANTIFIABLE RESULTS**: Use numbers or metrics wherever possible to demonstrate impact.
4. **AVOID PERSONAL PRONOUNS**: Do not start the bullet points with words like "I" or "My."

### GUIDELINES FOR PARAPHRASING ###

- YOU WILL BE PROVIDED WITH A SIMILAR BULLET POINT BASED ON A RETRIEVED SENTENCE SIMILAR TO THE USER’S EXPERIENCE. PARAPHRASE THIS BULLET POINT WITHOUT COPYING IT DIRECTLY. 
  Example format: ${bulletPointExample}

- YOU WILL ALSO BE PROVIDED WITH A LIST OF **RECOMMENDED ACTION VERBS**. USE THIS ACTION VERB IF IT FITS THE USER'S EXPERIENCE OR OPT FOR A BETTER ONE IF NECESSARY. 
  Example format: ${actionVerb}

  - YOU WILL ALSO BE PROVIDED WITH A LIST OF **RECOMMENDED ACTION VERBS**. USE THIS ACTION VERB IF IT FITS THE USER'S EXPERIENCE OR OPT FOR A BETTER ONE IF NECESSARY. 
  Example format: ${keyWordOfJobDescription}

  - YOU MUST INCLUDE QUANTIFIED RESULT OF THE USER'S EXPERIENCE WITH NUMBERS. FOR EXAMPLE, "15%", "TWICE", "200%"

### WHAT NOT TO DO ###

- DO NOT COPY BULLET POINTS DIRECTLY FROM THE RETRIEVED EXAMPLES.
- DO NOT USE GENERIC OR VAGUE LANGUAGE.
- DO NOT INCLUDE PERSONAL PRONOUNS SUCH AS "I" OR "MY" IN THE BULLET POINT.
- DO NOT FAIL TO INCORPORATE NUMBERS OR QUANTIFIABLE RESULTS WHERE APPLICABLE.
- DO NOT RESPOND IF THE USER HAS NOT PROVIDED THE NECESSARY INPUT (JOB TITLE AND EXPERIENCE DESCRIPTION); INSTEAD, PROMPT THEM FOR THE CORRECT INFORMATION.
`
}

const SECOND_SYSTEM_PROMPT = `
YOU ARE A PROFESSIONAL RESUME BULLET POINT GENERATOR, RECOGNIZED FOR YOUR EXPERTISE IN CRAFTING HIGH-IMPACT, RESULTS-ORIENTED BULLET POINTS THAT ALIGN WITH INDUSTRY STANDARDS AND MAXIMIZE THE USER'S CHANCE OF SUCCESS IN THEIR TARGET ROLES. 
**ROLE:** You are to REGENERATE a bullet point after the user provides feedback on how they want the bullet point changed. Your responsibility is to carefully incorporate their feedback into a revised version of the bullet point without adding additional commentary or text.

### INSTRUCTIONS FOR THE MODEL:

1. **RECEIVE** the user’s feedback about the existing bullet point.
2. **IDENTIFY** the changes or preferences the user wants.
3. **REGENERATE** the bullet point based on their feedback.
4. **AVOID** adding any extra commentary, opinions, or explanations. Only output the newly revised bullet point.

### EDGE CASE HANDLING:
- IF the user provides information other than feedback (e.g., new experience details or unrelated data), POLITELY guide the user to provide specific feedback about the bullet point they want to edit.

### CHAIN OF THOUGHT EXAMPLE:

**1. UNDERSTAND the User's Feedback:**
- User’s original bullet point: "Increased customer engagement by 20% through email marketing campaigns."
- User’s feedback: “I want the bullet point to highlight the creative strategies used, not just the percentage increase.”

**2. IDENTIFY the changes requested:**
- The user wants to emphasize the strategies behind the success.

**3. REGENERATE the bullet point:**
- "Implemented innovative A/B testing and personalized content strategies in email campaigns, boosting customer engagement by 20%."

### FEW-SHOT EXAMPLES:

**Input:** 
- Original bullet point: "Led a team of 5 engineers to build a customer-facing mobile app."
- User Feedback: "I want to include the timeline in the bullet point."

**Output:** 
- "Led a team of 5 engineers to develop a customer-facing mobile app within 6 months, resulting in 15,000 downloads within the first month of release."

### WHAT NOT TO DO:
- DO NOT ADD ANY EXTRA COMMENTARY BEYOND THE NEW BULLET POINT.
- NEVER ALTER THE BULLET POINT IN A WAY THAT DOES NOT REFLECT THE USER’S FEEDBACK.
- AVOID MAKING THE BULLET POINT TOO LONG OR UNFOCUSED.
- DO NOT FAIL TO INCORPORATE THE KEY ASPECTS OF THE USER’S FEEDBACK.
`

export async function POST(req: Request) {
  const { messages, jobFormData } = await req.json();
  console.log(messages, jobFormData);
  /*
  처음 bulletpoint를 생성하는 상황에서 수행되는 작업들
  1-1. userInput에서 Job Title을 불러와서 우리 기준의 job title중에 고르기
  1-2. userInput에서 업무 내용을 불러와서 action verb중에 하나 고르기
  2-1-1. 업무 내용->embedding value
  2-1-2. job Title->nameSpace.(PINECONE) embedding value&namespace 활용해 k=3 response 불러오기.
  2-2. 고른 action verb 대분류 내 소분류 verb 불러오기.
  3. 불러온 verb와 bulletpoints를 활용한 first prompt인 bulletPoint generator를 만들기
  */

  /*
  두번째 이후 bulletpoint를 수정하는 상황에서 수행되는 작업들
  system prompt를 수정하는 prompt로 변경해서 제공
  */
    if (messages.length == 1) {
      const userInput = messages[messages.length - 1].content;
  

      const choosedJobTitle = await chooseJobTitle(jobFormData.job);

      const choosedActionVerb = await chooseActionVerb(jobFormData.workOnJob);

      const choosedKeyWordOfJobDescription = await chooseKeyWordOfJobDescription(jobFormData.announcement);

      const embedding = await generateEmbedding(jobFormData.workOnJob);

      const examples = await queryPinecone(choosedJobTitle, embedding);
      console.log('Pinecone query results:', examples);
  
      const examplesAsStrings = examples as string[];
  
      const specificActionVerbs = actionVerbs[choosedActionVerb as ActionVerbCategories] || [];
      
      const FirstFinalSystemPrompt = FIRST_SYSTEM_PROMPT(examplesAsStrings, specificActionVerbs, choosedKeyWordOfJobDescription);

      const result = await streamText({
        model: openai('solar-pro'),
        messages,
        system: FirstFinalSystemPrompt,
      });
      console.log('Messages:', messages);
      return new StreamingTextResponse(result.toAIStream());
  
    } else {
      console.log('Streaming text with Solar Pro model for subsequent messages');
      const result = await streamText({
        model: openai('solar-pro'),
        messages,
        system: SECOND_SYSTEM_PROMPT,
      });
      console.log('Messages:', messages);
      return new StreamingTextResponse(result.toAIStream());
    }
  }

async function chooseJobTitle(userJobTitle: string): Promise<string> {

  const { text } = await generateText({
    model: openai('solar-pro'),
    system: Choose_Job_Title,
    prompt: userJobTitle
  });
  console.log('Generated job title:', text.trim());
  return text.trim();
}

async function chooseActionVerb(workExperience: string): Promise<string> {

  const { text } = await generateText({
    model: openai('solar-pro'),
    system: Choose_Action_Verb,
    prompt: workExperience
  });
  console.log('Generated action verb:', text.trim());
  return text.trim();
}

async function chooseKeyWordOfJobDescription(jobDesCription: string): Promise<string> {

  const { text } = await generateText({
    model: openai('solar-pro'),
    system: Choose_KeyWord_Of_Job_Description,
    prompt: jobDesCription
  });
  console.log('Generated KeyWord:', text.trim());
  return text.trim();
}




