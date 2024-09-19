import React, { FormEvent } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, CircleX } from "lucide-react";

interface JobFormData {
  job: string;
  workOnJob: string;
  announcement: string;
}

interface JobInfoFormProps {
  jobFormData: JobFormData;
  setJobFormData: React.Dispatch<React.SetStateAction<JobFormData>>;
  handleFormSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  showChat: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const JobInfoForm: React.FC<JobInfoFormProps> = ({
  jobFormData,
  setJobFormData,
  handleFormSubmit,
  handleKeyDown,
  showChat,
  setShowForm
}) => {
  return (
    <form
      onSubmit={handleFormSubmit}
      className="h-full relative flex flex-col overflow-auto bg-gray-300 shadow-lg p-4 items-center justify-between"
    >
      {!showChat && (
        <button className="absolute right-4" onClick={() => setShowForm(false)}>
          <CircleX />
        </button>
      )}
      
      <div className="w-full space-y-20 py-10">
        <div>
          <div className="mb-2 text-black px-2 py-1 text-s font-semibold border-b-2 border-black">직무명</div>
          <Textarea
            className="w-full pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="예: Account Manager"
            onChange={e => setJobFormData({ ...jobFormData, job: e.target.value })}
            onKeyDown={handleKeyDown}
            value={jobFormData.job}
            rows={1}
          />
        </div>
        <div>
          <div className="mb-2 text-black px-2 py-1 text-s font-semibold border-b-2 border-black">업무 내용을 한 줄로 작성해주세요.</div>
          <Textarea
            className="w-full pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="국/영문으로 작성해주세요"
            onChange={e => setJobFormData({ ...jobFormData, workOnJob: e.target.value })}
            onKeyDown={handleKeyDown}
            value={jobFormData.workOnJob}
            rows={4}
          />
        </div>
        <div>
          <div className="mb-2 text-black px-2 py-1 text-s font-semibold border-b-2 border-black">지원공고를 입력해주세요.</div>
          <Textarea
            className="w-full pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            onChange={e => setJobFormData({ ...jobFormData, announcement: e.target.value })}
            onKeyDown={handleKeyDown}
            value={jobFormData.announcement}
            rows={6}
          />
        </div>
      </div>
      <div className="mt-6">
        <Button
          type="submit"
          size="lg"
          disabled={!jobFormData.job || !jobFormData.workOnJob}
          className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 flex items-center justify-center"
        >
          <span className="mr-2">생성하기</span>
          <Send size={20} />
        </Button>
      </div>
    </form>
  );
};

export default JobInfoForm;