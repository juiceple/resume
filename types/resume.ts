// types/resume.ts

export interface ResumeStructure {
    sections: {
      id: string;
      type: string;
      title?: string;
      items?: Array<{
        id: string;
        type: string;
        [key: string]: any;
      }>;
    }[];
  }
  
export interface ResumeContent {
    [key: string]: any;
    }

export interface Resume {
    id: string;
    user_id: string;
    structure: ResumeStructure;
    content: ResumeContent;
    previewUrl?: string;
    created_at: string;
    updated_at: string;
    }