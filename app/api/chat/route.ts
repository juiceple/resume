import { createOpenAI } from "@ai-sdk/openai";
import { streamText, generateText } from "ai";
import { generateEmbedding } from './embedding';
import { queryPinecone } from './pinecone';
import actionVerbs from './actionVerbs.json';

import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';

const model = groq('gemma2-9b-it');

interface UsageInfo {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

let totalUsage: UsageInfo = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0
};

type ActionVerbCategories = keyof typeof actionVerbs;

// const openai = createOpenAI({
//   // custom settings, e.g.
//   baseURL: "https://api.upstage.ai/v1/solar",
//   compatibility: 'compatible', // strict mode, enable when using the OpenAI API
//   apiKey: process.env.SOLAR_API_KEY
// });

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
const Choose_KeyWord_Of_Job_Description = `
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

function FIRST_SYSTEM_PROMPT(bulletPointExample: string[], actionVerb: string[], keyWordOfJobDescription?: string) {
  let promptText = `
YOU ARE A PROFESSIONAL RESUME BULLET POINT GENERATOR, RECOGNIZED FOR YOUR EXPERTISE IN CRAFTING HIGH-IMPACT, RESULTS-ORIENTED BULLET POINTS THAT ALIGN WITH INDUSTRY STANDARDS AND MAXIMIZE THE USER'S CHANCE OF SUCCESS IN THEIR TARGET ROLES.

### BULLET POINT GENERATION TASK ###

**INPUT PROVIDED BY USER:**
1. **Job Title**: The title of the user's role.
2. **Experience Description**: A sentence or brief paragraph describing the user's key responsibilities or achievements in that role.
**ADDITIONAL OPTIONAL INPUT:**
- **Keywords of the Job Description**: A keyword list from the job description that the user is applying to, if available.
IF THE USER PROVIDES INFORMATION OTHER THAN JOB TITLE AND EXPERIENCE DESCRIPTION, ASK THEM TO PROVIDE THE NECESSARY DETAILS.
  Example: "Please provide your job title and a brief sentence describing your experience."   


  ### BULLET POINT GENERATION REQUIREMENTS ###

- **GENERATE BULLET POINTS EVEN IF INPUT IS LIMITED**: If the user provides only minimal information, generate bullet points based on assumptions or typical responsibilities for that role. Use placeholder metrics (e.g., “X%” or “N units”) to indicate where quantifiable results could be added.
- **START WITH AN ACTION VERB**: Begin each bullet with a strong, action-oriented verb (e.g., "Developed," "Led," "Improved").
  - **USE ONLY ONE ACTION VERB** at the beginning of each bullet point sentence to maintain clarity and impact.
- **BE SPECIFIC**: Describe the specific tasks or projects the user performed, highlighting key details.
- **INCLUDE QUANTIFIABLE RESULTS**: Use numbers or metrics wherever possible to show impact (e.g., "increased sales by 25%," "reduced costs by 15%").
- **AVOID PERSONAL PRONOUNS**: Do not use "I" or "My" in any bullet point.

`;

  promptText += `
   ### BULLET POINT GENERATION REQUIREMENTS ###

- **GENERATE BULLET POINTS EVEN IF INPUT IS LIMITED**: If the user provides only minimal information, generate bullet points based on assumptions or typical responsibilities for that role. Use placeholder metrics (e.g., “X%” or “N units”) to indicate where quantifiable results could be added.
- **START WITH AN ACTION VERB**: Begin each bullet with a strong, action-oriented verb (e.g., "Developed," "Led," "Improved").
  - **USE ONLY ONE ACTION VERB** at the beginning of each bullet point sentence to maintain clarity and impact.
- **BE SPECIFIC**: Describe the specific tasks or projects the user performed, highlighting key details.
- **INCLUDE QUANTIFIABLE RESULTS**: Use numbers or metrics wherever possible to show impact (e.g., "increased sales by 25%," "reduced costs by 15%").
- **AVOID PERSONAL PRONOUNS**: Do not use "I" or "My" in any bullet point.

### PARAPHRASING GUIDELINES ###

- If provided, you may see a similar bullet point or recommended action verb for guidance. Paraphrase this bullet point based on the user’s input.
  - **Example format for similar bullet point**: ${bulletPointExample}
  - **Example format for action verb**: ${actionVerb}
- If given, use **keywords from the job description** where relevant to the user's experience.${keyWordOfJobDescription} : 
- **MUST INCLUDE QUANTIFIED RESULTS** when applicable, such as "15%", "twice," "200%". 


### OUTPUT INSTRUCTIONS ###

1. **GENERATE A LIST OF BULLET POINTS**: Produce concise, professional bullet points as a formatted list, with each bullet on a new line.
2. **MAINTAIN A CONSISTENT FORMAT**: Each bullet should follow the structure: Action Verb + Specific Task + Quantifiable Result (when available).

---

**EXAMPLE TO GUIDE OUTPUT**:

**User Input**:
- Job Title: Marketing Manager
- Experience Description: "Led digital marketing campaigns that increased website traffic and improved customer engagement."

**Expected Output**:
Spearheaded digital marketing campaigns, driving a 35% increase in website traffic within six months.
Implemented targeted content strategies, boosting customer engagement by 20%.

### WHAT NOT TO DO ###

- DO NOT COPY BULLET POINTS DIRECTLY FROM RETRIEVED EXAMPLES.
- DO NOT USE GENERIC OR VAGUE LANGUAGE.
- DO NOT INCLUDE PERSONAL PRONOUNS SUCH AS "I" OR "MY."
- DO NOT FAIL TO INCLUDE NUMBERS OR QUANTIFIABLE RESULTS WHERE APPLICABLE.
- IF NECESSARY INFORMATION (JOB TITLE AND EXPERIENCE DESCRIPTION) IS MISSING, DO NOT GENERATE BULLET POINTS; INSTEAD, REQUEST THE INFORMATION.
- DO GENERATE ONLY ONE BULLETPOINT WITHOUT ANY sign such as " , ? -
  `;

  return promptText;
}

const SECOND_SYSTEM_PROMPT = `
**ROLE**: You are to REGENERATE a bullet point after the user provides feedback on how they want the bullet point changed. Carefully incorporate their feedback without adding any extra commentary.

1. **RECEIVE** the user’s feedback about the existing bullet point.
2. **IDENTIFY** the changes or preferences the user wants.
3. **REGENERATE** the bullet point based on their feedback.
4. **AVOID** any extra commentary or explanations.

**EXAMPLE**:

**Original bullet point**: "Increased customer engagement by 20% through email marketing campaigns."
**User Feedback**: "I want the bullet point to highlight the creative strategies used, not just the percentage increase."

**Updated Output**:
- "Implemented innovative A/B testing and personalized content strategies in email campaigns, boosting customer engagement by 20%."

### WHAT NOT TO DO IN EDITING ###

- DO NOT ADD ANY EXTRA COMMENTARY BEYOND THE NEW BULLET POINT.
- NEVER ALTER THE BULLET POINT IN A WAY THAT DOES NOT REFLECT THE USER’S FEEDBACK.
- AVOID MAKING THE BULLET POINT TOO LONG OR UNFOCUSED.

`

function updateUsage(usage: UsageInfo) {
  totalUsage.promptTokens += usage.promptTokens;
  totalUsage.completionTokens += usage.completionTokens;
  totalUsage.totalTokens += usage.totalTokens;
}

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

    let choosedKeyWordOfJobDescription;
    if (jobFormData.announcement && jobFormData.announcement.trim() !== '') {
      choosedKeyWordOfJobDescription = await chooseKeyWordOfJobDescription(jobFormData.announcement);
    }

    const preBulletPoint = await generateOneBulletPoint(jobFormData.workOnJob, jobFormData.job)
    console.log(preBulletPoint);

    const embedding = await generateEmbedding(preBulletPoint);

    const examples = await queryPinecone(choosedJobTitle, embedding);
    console.log('Pinecone query results:', examples);

    const examplesAsStrings = examples as string[];

    const specificActionVerbs = actionVerbs[choosedActionVerb as ActionVerbCategories] || [];

    const FirstFinalSystemPrompt = FIRST_SYSTEM_PROMPT(examplesAsStrings, specificActionVerbs, choosedKeyWordOfJobDescription);

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages,
      system: FirstFinalSystemPrompt,
      onFinish({ text, finishReason, usage }) {
        if (usage) {
          updateUsage(usage);
          console.log('Usage:', usage);
          console.log('Total usage:', totalUsage);
        } else {
          console.log('Usage information not available');
        }
      },
    });
    console.log('Messages:', messages);
    return result.toDataStreamResponse();

    // const { text, usage } = await generateText({
    //   model: openai('solar-pro'),
    //   messages,
    //   system: FirstFinalSystemPrompt,
    // });
    // console.log('Generated job title:', text.trim());
    // updateUsage( usage);
    // console.log('First',usage);
    // return text;

  } else {
    console.log('Streaming text with Solar Pro model for subsequent messages');
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages,
      system: SECOND_SYSTEM_PROMPT,
      onFinish({ text, finishReason, usage }) {
        if (usage) {
          updateUsage(usage);
          console.log('Usage:', usage);
          console.log('Total usage:', totalUsage);
        } else {
          console.log('Usage information not available');
        }
      },
    });

    // const { text, usage } = await generateText({
    //   model: openai('solar-pro'),
    //   messages,
    //   system: FirstFinalSystemPrompt,
    // });
    // console.log('Generated job title:', text.trim());
    // updateUsage( usage);
    // console.log('Second',usage);
    // return text;

    console.log('Messages:', messages);

    return result.toDataStreamResponse();
  }
}

async function chooseJobTitle(userJobTitle: string): Promise<string> {

  const { text, usage } = await generateText({
    model: openai('gpt-4o-mini'),
    system: Choose_Job_Title,
    prompt: userJobTitle
  });
  console.log('Generated job title:', text.trim());
  updateUsage(usage);
  console.log('chooseJobTitle', usage);
  return text.trim();
}

async function chooseActionVerb(workExperience: string): Promise<string> {

  const { text, usage } = await generateText({
    model: openai('gpt-4o-mini'),
    system: Choose_Action_Verb,
    prompt: workExperience
  });
  console.log('Generated action verb:', text.trim());
  updateUsage(usage);
  console.log('chooseActionVerb', usage);
  return text.trim();
}

async function chooseKeyWordOfJobDescription(jobDesCription: string): Promise<string> {

  const { text, usage } = await generateText({
    model: openai('gpt-4o-mini'),
    system: Choose_KeyWord_Of_Job_Description,
    prompt: jobDesCription
  });

  console.log('Generated KeyWord:', text.trim());
  updateUsage(usage);
  console.log('chooseKeyWordOfJobDescription', usage);
  return text.trim();
}

async function generateOneBulletPoint(workExperience: string, userJobTitle: string): Promise<string> {
  const { text, usage } = await generateText({
    model: openai('gpt-4o-mini'),
    system: "Generate only One bulletpoint without job title for resume in English",
    prompt: `i am doing ${workExperience}. GENERATE One bulletpoint for resume without job title in English`
  });

  console.log('Generated KeyWord:', text.trim());
  updateUsage(usage);
  console.log('generateOneBulletPointOfworkExperience', usage);
  return text.trim();
}




