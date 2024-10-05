"use client"
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, FormEvent, useCallback } from "react";
import { Send, ArrowUp, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditHeader from "@/components/docs/edit/DocsEditHeader";
import Message from "@/components/docs/edit/chat/Message";
import DocsEditNew from '@/components/docs/edit/DocsEditNew';
import DocsPreview from '@/components/docs/edit/DocsPreviewCompo';
import { useChat } from "ai/react";
import { createClient } from "@/utils/supabase/client";

// 직무 정보를 위한 인터페이스 정의
interface JobFormData {
  job: string;
  workOnJob: string;
  announcement: string;
}

const supabase = createClient();


export default function Edits() {
  const searchParams = useSearchParams();
  const [resume, setResume] = useState('');


  const [isGenerating, setIsGenerating] = useState(false);
  const [jobFormData, setJobFormData] = useState<JobFormData>({
    job: "",
    workOnJob: "",
    announcement: "",
  });

  const { messages, append, setMessages, isLoading, handleSubmit, handleInputChange, input } = useChat({
    onFinish: () => setIsGenerating(false),
    api: '/api/chat', // Make sure this matches your API route
    body: { jobFormData }, // Include jobFormData in the API call
  });


  const [docsId, setDocsId] = useState<string | null>('');
  const [URL, setURL] = useState('');
  const [updateStatus, setUpdateStatus] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const [bulletContent, setBulletContent] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const [bulletPoints, setBulletPoints] = useState<number>(0);
  const [bulletPointsGenerated, setBulletPointsGenerated] = useState<number>(0);
  const [bulletPointModified, setBulletPointModified] = useState<number>(0);


  useEffect(() => {
    // 사용자 ID 가져오기 (로그인 상태에 따라 구현 필요)
    const fetchUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchUserProfile(user.id);
      }
    };
    fetchUserId();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('BulletPoint, BulletPoint_generated, BulletPoint_modified')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
    } else if (data) {
      setBulletPoints(data.BulletPoint);
      setBulletPointsGenerated(data.BulletPoint_generated);
      setBulletPointModified(data.BulletPoint_modified);
    }
  };

  const fetchResume = async (id: string) => {
    try {
      const response = await fetch(`/api/resumes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }
      const data = await response.json();
      setResumeTitle(data.title);
      setResume(data.content);
      setURL(data.docs_preview_url);
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  };

  useEffect(() => {
    const id = searchParams.get('id');
    setDocsId(id);
    if (id) {
      fetchResume(id);
    }
  }, [searchParams]);

  const updateBulletPointsGenerated = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        BulletPoint: bulletPoints - 1,
        BulletPoint_generated: bulletPointsGenerated + 1,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating bullet points:', error);
    } else {
      setBulletPoints((prev) => prev - 1);
      setBulletPointsGenerated((prev) => prev + 1);
    }
  };

  const updateBulletPointsModified = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        BulletPoint: bulletPoints - 1,
        BulletPoint_modified: bulletPointModified + 1,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating bullet points:', error);
    } else {
      setBulletPoints((prev) => prev - 1);
      setBulletPointModified((prev) => prev + 1);
    }
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (bulletPoints > 0) {
      await updateBulletPointsGenerated();
      setMessages([]); // Reset existing messages
      setIsGenerating(true);
      const textOfJSON = `My job title is ${jobFormData.job}, and what I did in the job is ${jobFormData.workOnJob}. `;
      append({ content: textOfJSON, role: "user" });
      setShowChat(true);
    } else {
      alert("No available Bullet Points.");
    }
  };
  

  

  const handleSubmitMessage = useCallback(() => {
    if (!input.trim()) return;
    setIsGenerating(true);
    handleSubmit(new Event('submit') as any);
    updateBulletPointsModified();
  }, [input, handleSubmit, updateBulletPointsModified]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitMessage();
    }
  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const refreshResumes = async () => {
    if (docsId) {
      await fetchResume(docsId);
    }
  };

  const setUpdateStatusTrue = () => {
    setUpdateStatus(true);
  };

  const setUpdateStatusFalse = () => {
    setUpdateStatus(false);
  };

  const toggleFormVisibility = () => {
    setShowForm((prev) => !prev);
    console.log('함수실행됨')
  };

  // 새로운 함수: 모든 상태 초기화
  const resetAllStates = () => {
    setJobFormData({
      job: "",
      workOnJob: "",
      announcement: "",
    });
    setMessages([]);
    setShowForm(false);
    setShowChat(false);
  };

  // X 버튼 클릭 핸들러
  const handleCloseButton = () => {
    resetAllStates();
  };

  // 새로운 함수: Message 컴포넌트에서 호출될 함수
  const handleAddToResume = useCallback((content: string) => {
    setBulletContent(content);
    console.log("handleAddToResume 실행")
  }, []);

  // DocsEditNew에 전달할 함수: bulletContent를 사용한 후 초기화
  const handleBulletContentUsed = useCallback(() => {
    setBulletContent(null);
  }, []);

  // 메시지 렌더링 로직
  const renderMessages = useCallback(() => {
    return messages.slice(1).map((message, index) => (
      <Message
        key={message.id}
        message={message}
        onAddToResume={handleAddToResume}
        isLast={index === messages.length - 1}
        isLoading={isGenerating && index === messages.length - 1 && message.role === "assistant"}
        userId={userId}
      />
    ));
  }, [messages, isGenerating, handleAddToResume]);


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
        {/* 직무 정보 입력 폼*/}
        <div className={`transition-all duration-300 ease-in-out ${showForm ? 'w-[300px]' : 'w-0'}`}>
          {showForm && (
            <form
              ref={formRef}
              onSubmit={handleFormSubmit}
              className="h-full relative flex flex-col overflow-auto bg-[#E0E2E5] shadow-lg p-4 items-center justify-between"
            >
              {!showChat && (
                <button className="absolute right-4" onClick={handleCloseButton}>
                  <CircleX />
                </button>
              )}
              {/* 폼 입력 필드 */}
              <div className="w-full space-y-20 py-10">
                <div>
                  <div className="mb-2 text-black px-2 py-1 text-sm focus:none border-b-[1px] border-black">
                    직무명 <span className="text-red-500">*</span>
                  </div>
                  <textarea
                    className="w-full p-2 border border-[#AEB3BC] rounded-md resize-none focus:outline-none focus:border-black focus:ring-black"
                    placeholder="예: Account Manager"
                    onChange={(e) => setJobFormData({ ...jobFormData, job: e.target.value })}
                    value={jobFormData.job}
                    rows={1}
                  />
                </div>
                <div>
                  <div className="mb-2 text-black px-2 py-1 text-sm border-b-[1px] border-black">
                    업무 내용을 한 줄로 작성해주세요. <span className="text-red-500">*</span>
                  </div>
                  <textarea
                    className="w-full p-2 border border-[#AEB3BC] rounded-md resize-none focus:outline-none focus:border-black focus:ring-black"
                    placeholder="국/영문으로 작성해주세요"
                    onChange={(e) => setJobFormData({ ...jobFormData, workOnJob: e.target.value })}
                    value={jobFormData.workOnJob}
                    rows={4}
                  />
                </div>
                <div>
                  <div className="mb-2 text-black px-2 py-1 text-sm border-b-[1px] border-black">
                    지원공고를 입력해주세요.
                  </div>
                  <textarea
                    className="w-full p-2 border border-[#AEB3BC] rounded-md resize-none focus:outline-none focus:border-black focus:ring-black"
                    onChange={(e) => setJobFormData({ ...jobFormData, announcement: e.target.value })}
                    value={jobFormData.announcement}
                    rows={6}
                  />
                </div>
              </div>
              {/* 생성하기 버튼 */}
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
          )}
        </div>
        {/* AI 채팅 섹션 */}
        <div className={`transition-all duration-300 ease-in-out h-full ${showChat ? 'w-[466px]' : 'w-0'}`}>
          {showChat && (
            <div className="relative h-full flex flex-col bg-white p-4">
              <button className="absolute right-4" onClick={handleCloseButton}>
                <CircleX />
              </button>
              <div className="flex-grow overflow-y-auto mb-4 mt-[30px]">
                {renderMessages()}
                {isGenerating && messages[messages.length - 1]?.role !== "assistant" && (
                  <Message
                    message={{ id: "loading", role: "assistant", content: "" }}
                    onAddToResume={handleAddToResume}
                    isLast={true}
                    isLoading={true}
                    userId={userId}
                  />
                )}
              </div>
              <form
                ref={formRef}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitMessage();
                }}
                className="flex items-center rounded-full h-[60px] w-[430px]"
                style={{ backgroundColor: "#F4F4F4" }}
              >
                <textarea
                  className="pr-10 text-m h-[55px] border-none focus:none w-[370px] pl-10 rounded-full resize-none focus:outline-none focus:ring-0 pt-[16px]"
                  placeholder="수정하고 싶은 부분을 알려주세요!"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  style={{ backgroundColor: "#F4F4F4" }}
                />
                <button
                  type="submit"
                  disabled={!input}
                  className={`ml-2 rounded-full z-20 w-[40px] h-[40px] flex justify-center items-center transition-colors duration-200 ${input ? 'text-white' : 'bg-[#E0E2E5] text-gray-400'}`}
                  style={{ backgroundColor: input ? '#000' : '#E0E2E5' }}
                  onClick={updateBulletPointsModified}
                >
                  <ArrowUp />
                </button>
              </form>
            </div>
          )}
        </div>
        {/* 이력서 편집 영역 */}
        <div className={`transition-all duration-300 ease-in-out overflow-auto ${showForm && showChat ? 'w-[calc(100%-766px)]' :
          showForm || showChat ? 'w-[calc(100%-300px)]' : 'w-full'} overflow-auto bg-zinc-50`}>
          {resume ? (
            <DocsEditNew
              resumeinitialData={resume}
              bulletContent={bulletContent}
              onBulletContentUsed={handleBulletContentUsed}
              setShowFormInDocs={toggleFormVisibility}
              docsId={docsId}
              setUpdateStatusTrue={setUpdateStatusTrue}
              setUpdateStatusFalse={setUpdateStatusFalse}
              isAiEditing={showForm}
            />
          ) : (
            <div className='docContainer'><DocsPreview /></div>
          )}
        </div>
      </div>
    </div>
  );
}