//client에서 업로딩되는 것->  sql에 DocsEditNew를 수정할 때마다 data를 끊임없이 업로딩해야 함.
//
"use client";
import { useSearchParams } from 'next/navigation';
//root
import { useEffect, useState, useRef, FormEvent } from "react";
import html2canvas from 'html2canvas';

import { Send, ArrowUp, CircleX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import EditHeader from "@/components/docs/edit/DocsEditHeader"
import Message from "@/components/docs/edit/chat/Message"
import DocsEditNew from '@/components/docs/edit/DocsEditNew'
import DocsPreview from '@/components/docs/edit/DocsPreviewCompo';
//vercel ai
import { useChat } from "ai/react";
import "./index.css"

// 직무 정보를 위한 인터페이스 정의
interface JobFormData {
  job: string;
  workOnJob: string;
  announcement: string;
}



export default function Edits() {
  //
  const searchParams = useSearchParams();

  // AI 채팅 기능을 위한 useChat 훅 사용
  const [resume, setResume] = useState('');
  const { messages, handleSubmit, input, handleInputChange, isLoading, append } = useChat();
  const [docsId, setDocsId] = useState<string | null>('')
  const [URL, setURL] = useState('');
  const [updateStatus, setUpdateStatus] = useState(false);


  // 폼과 메시지 끝 부분을 위한 ref 생성
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 직무 정보, 이력서 내용, 폼 표시 여부를 위한 상태 관리
  const [jobformData, setJobFormData] = useState<JobFormData>({
    job: "",
    workOnJob: "",
    announcement: "",
  });
  const [bulletContent, setBulletContent] = useState<string>('')
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState('');


  const fetchResume = async (id: string) => {
    try {
      const response = await fetch(`/api/resumes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }
      const data = await response.json();
      setResumeTitle(data.title);
      setResume(data.content);
      setURL(data.docs_preview_url)
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  };
  console.log(`title: ${resumeTitle}`)

  //docs id에 해당하는 content가져오기.
  useEffect(() => {
    const id = searchParams.get('id');
    setDocsId(id)
    console.log(id)
    if (id) {
      fetchResume(id);
    }
  }, [searchParams]);

  // Enter 키 입력 시 폼 제출을 위한 핸들러
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  // 폼 표시 여부를 토글하는 함수
  const toggleFormVisibility = () => {
    setShowForm((prev) => !prev);
    console.log('함수실행됨')
  };

  // 입력된 직무 정보를 AI 채팅에 전달하는 함수
  function formOfInfo() {
    const textOfJSON = `My job title is ${jobformData.job}, and what I did in the job is ${jobformData.workOnJob}. Generate only one bullet points in English no matter what.`
    append({ content: textOfJSON, role: "user" })
    setShowChat(true);
  }

  // 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 이력서 내용을 업데이트하는 함수
  const addToResume = (content: string) => {
    setBulletContent(content);
  };

  // 폼 제출 핸들러
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formOfInfo();
    setJobFormData(prev => {
      return {
        ...prev,
        job: "",
        workOnJob: ""
      }
    })
  };
  const refreshResumes = async () => {
    if (docsId) {
      await fetchResume(docsId);
    }
  };
  //upload하는지 확인하는 함수
  const setUpdateStatusTrue = () => {
    setUpdateStatus(true);
  }

  const setUpdateStatusFalse = () => {
    setUpdateStatus(false);
  }
  console.log(updateStatus);
  console.log(messages)

  return (
    <div className="flex flex-col h-screen w-full">
      {docsId && (
        <EditHeader
          resumeId={docsId}
          refreshResumes={refreshResumes}
          isUpdating={updateStatus}
        />
      )}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* 직무 정보 입력 폼 */}
        <div className={`transition-all duration-300 ease-in-out ${showForm ? 'w-[300px]' : 'w-0'}`}>
          {showForm && (
            <form
              ref={formRef}
              onSubmit={handleFormSubmit}
              className="h-full relative flex flex-col overflow-auto bg-[#E0E2E5] shadow-lg p-4 items-center justify-between"
            >
              {!showChat && (
                <button className="absolute right-4" onClick={() => setShowForm(false)}>
                  <CircleX />
                </button>
              )}

              <div className="w-full space-y-20 py-10">
                <div>
                  <div className="mb-2 text-black px-2 py-1 text-sm focus:none border-b-[1px] border-black">직무명 <span className="text-red-500">*</span></div>
                  <textarea
                    className="w-full p-2 border border-[#AEB3BC] rounded-md resize-none focus:outline-none focus:border-black focus:ring-black"
                    placeholder="예: Account Manager"
                    onChange={e => setJobFormData({ ...jobformData, job: e.target.value })}
                    onKeyDown={handleKeyDown}
                    value={jobformData.job}
                    rows={1}
                  />
                </div>
                <div>
                  <div className="mb-2 text-black px-2 py-1 text-sm border-b-[1px] border-black">업무 내용을 한 줄로 작성해주세요. <span className="text-red-500">*</span></div>
                  <textarea
                    className="w-full p-2 border border-[#AEB3BC] rounded-md resize-none focus:outline-none focus:border-black focus:ring-black"
                    placeholder="국/영문으로 작성해주세요"
                    onChange={e => setJobFormData({ ...jobformData, workOnJob: e.target.value })}
                    onKeyDown={handleKeyDown}
                    value={jobformData.workOnJob}
                    rows={4}
                  />
                </div>
                <div>
                  <div className="mb-2 text-black px-2 py-1 text-sm border-b-[1px] border-black">지원공고를 입력해주세요.</div>
                  <textarea
                    className="w-full p-2 border border-[#AEB3BC] rounded-md resize-none focus:outline-none focus:border-black focus:ring-black"
                    onChange={e => setJobFormData({ ...jobformData, announcement: e.target.value })}
                    onKeyDown={handleKeyDown}
                    value={jobformData.announcement}
                    rows={6}
                  />
                </div>
              </div>
              <div className="mt-6">
                <Button
                  type="submit"
                  size="lg"
                  disabled={!jobformData.job || !jobformData.workOnJob}
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 flex items-center justify-center"
                >
                  <span className="mr-2">생성하기</span>
                  <Send size={20} />
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* AI 채팅 섹션 */}
        <div className={`transition-all duration-300 ease-in-out h-full ${showChat ? 'w-[466px]' : 'w-0'}`}>
          {showChat && (
            <div className="relative h-full flex flex-col bg-white p-4">
              <button className="absolute right-4" onClick={() => {
                setShowForm(false)
                setShowChat(false)
              }}>
                <CircleX />
              </button>
              {/* 메시지 표시 영역 */}
              <div className="flex-grow overflow-y-auto mb-4 mt-[30px]">
                {messages.slice(1).map((message) => (
                  <Message
                    key={message.id}
                    message={message}
                    onAddToResume={addToResume}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 메시지 입력 폼 */}
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="flex items-center rounded-full h-[60px] w-[430px]"
                style={{ backgroundColor: "#F4F4F4" }}
              >
                <textarea
                  className="pr-10 text-m h-[55px] border-none focus:none w-[370px] pl-10 rounded-full resize-none focus:outline-none focus:ring-0 pt-[16px]"
                  placeholder="무엇이든 물어보세요!"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  style={{ backgroundColor: "#F4F4F4" }}
                />
                <button
                  type="submit"
                  disabled={!input}
                  className={`
                    ml-2 rounded-full z-20 w-[40px] h-[40px] flex justify-center items-center
                    transition-colors duration-200
                    ${input ? 'text-white' : 'bg-[#E0E2E5] text-gray-400'}
                  `}
                  style={{ backgroundColor: input ? '#000' : '#E0E2E5' }}
                >
                  <ArrowUp />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 이력서 편집 영역 */}
        <div className={`transition-all duration-300 ease-in-out overflow-auto ${showForm && showChat ? 'w-[calc(100%-766px)]' :
          showForm || showChat ? 'w-[calc(100%-300px)]' : 'w-full'
          } overflow-auto bg-zinc-50`}>
          {resume ? (
            <DocsEditNew
              resumeinitialData={resume}
              bulletContent={bulletContent}
              setShowFormInDocs={toggleFormVisibility}
              docsId={docsId}
              setUpdateStatusTrue={setUpdateStatusTrue}
              setUpdateStatusFalse={setUpdateStatusFalse}
            />
          ) : (
            <div className='docContainer'><DocsPreview /></div>
          )}
        </div>
      </div>
    </div>
  );
}