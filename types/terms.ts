// types/terms.ts

export interface TermsSection {
    title: string;
    date: string;
  }
  
  export interface TermsContent extends TermsSection {
    content: string;
  }
  
  export interface TermsSectionProps {
    title: string;
    date: string;
  }
  
  export interface TermsAccordionProps {
    title: string;
    children: React.ReactNode;
  }