"use client"
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, FormEvent } from "react";
import { Send, ArrowUp, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import EditHeader from "@/components/docs/edit/DocsEditHeader";
import Message from "@/components/docs/edit/chat/Message";
import DocsEditNew from '@/components/docs/edit/DocsEditNew';
import DocsPreview from '@/components/docs/edit/DocsPreviewCompo';
import { useChat } from "ai/react";
import "./index.css";
import { createClient } from "@/utils/supabase/client";

// 직무 정보를 위한 인터페이스 정의
interface JobFormData {
  job: string;
  workOnJob: string;
  announcement: string;
}

const supabase = createClient();

//////////////////////////////////////////////////////////////////
//                    기본적인 상태 관리 부분                   //
//////////////////////////////////////////////////////////////////

export default function Edits() {
  const searchParams = useSearchParams();

  // 기본 상태 값 설정
  const [resume, setResume] = useState('');
  const { messages, handleSubmit, input, handleInputChange, isLoading, append } = useChat();
  const [docsId, setDocsId] = useState<string | null>('');
  const [URL, setURL] = useState('');
  const [updateStatus, setUpdateStatus] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [jobformData, setJobFormData] = useState<JobFormData>({
    job: "",
    workOnJob: "",
    announcement: "",
  });

  const [bulletContent, setBulletContent] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [bulletPoints, setBulletPoints] = useState<number>(0);
  const [bulletPointsGenerated, setBulletPointsGenerated] = useState<number>(0);

  //////////////////////////////////////////////////////////////////
  //                사용자 프로필 정보 및 초기화 부분               //
  //////////////////////////////////////////////////////////////////

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
      .select('BulletPoint, BulletPoint_generated')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
    } else if (data) {
      setBulletPoints(data.BulletPoint);
      setBulletPointsGenerated(data.BulletPoint_generated);
    }
  };

  //////////////////////////////////////////////////////////////////
  //                  이력서 정보 불러오기 및 업데이트             //
  //////////////////////////////////////////////////////////////////

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

  //////////////////////////////////////////////////////////////////
  //                Bullet Point 업데이트 및 폼 제출 처리           //
  //////////////////////////////////////////////////////////////////

  const updateBulletPoints = async () => {
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

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (bulletPoints > 0) {
      await updateBulletPoints();
      formOfInfo();
      setJobFormData((prev) => ({
        ...prev,
        job: "",
        workOnJob: "",
      }));
    } else {
      alert("사용 가능한 Bullet Point가 없습니다.");
    }
  };

  //////////////////////////////////////////////////////////////////
  //                  직무 정보 및 AI 메시지 생성 부분             //
  //////////////////////////////////////////////////////////////////

  function formOfInfo() {
    const textOfJSON = `My job title is ${jobformData.job}, and what I did in the job is ${jobformData.workOnJob}. Generate only one bullet points in English no matter what.`;
    append({ content: textOfJSON, role: "user" });
    setShowChat(true);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //////////////////////////////////////////////////////////////////
  //                      이력서 편집 및 추가 기능                 //
  //////////////////////////////////////////////////////////////////

  const addToResume = (content: string) => {
    setBulletContent(content);
  };

  const refreshResumes = async () => {
    if (docsId) {
      await fetchResume(docsId);
    }
  };

  //////////////////////////////////////////////////////////////////
  //                  업데이트 상태 관련 핸들링 함수들             //
  //////////////////////////////////////////////////////////////////

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

  //////////////////////////////////////////////////////////////////
  //                      JSX 요소 렌더링                          //
  //////////////////////////////////////////////////////////////////

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
                <button className="absolute right-4" onClick={() => setShowForm(false)}>
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
                    onChange={(e) => setJobFormData({ ...jobformData, job: e.target.value })}
                    value={jobformData.job}
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
                    onChange={(e) => setJobFormData({ ...jobformData, workOnJob: e.target.value })}
                    value={jobformData.workOnJob}
                    rows={4}
                  />
                </div>
                <div>
                  <div className="mb-2 text-black px-2 py-1 text-sm border-b-[1px] border-black">
                    지원공고를 입력해주세요.
                  </div>
                  <textarea
                    className="w-full p-2 border border-[#AEB3BC] rounded-md resize-none focus:outline-none focus:border-black focus:ring-black"
                    onChange={(e) => setJobFormData({ ...jobformData, announcement: e.target.value })}
                    value={jobformData.announcement}
                    rows={6}
                  />
                </div>
              </div>
              {/* 생성하기 버튼 */}
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
                setShowForm(false);
                setShowChat(false);
              }}>
                <CircleX />
              </button>
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
                  style={{ backgroundColor: "#F4F4F4" }}
                />
                <button
                  type="submit"
                  disabled={!input}
                  className={`ml-2 rounded-full z-20 w-[40px] h-[40px] flex justify-center items-center transition-colors duration-200 ${input ? 'text-white' : 'bg-[#E0E2E5] text-gray-400'}`}
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
          showForm || showChat ? 'w-[calc(100%-300px)]' : 'w-full'} overflow-auto bg-zinc-50`}>
          {resume ? (
            <DocsEditNew
              resumeinitialData={resume}
              bulletContent={bulletContent}
              setShowFormInDocs={toggleFormVisibility}
              docsId={docsId}
              setUpdateStatusTrue={setUpdateStatusTrue}
              setUpdateStatusFalse={setUpdateStatusFalse}
              isAiEditing= {showForm}
            />
          ) : (
            <div className='docContainer'><DocsPreview /></div>
          )}
        </div>
      </div>
    </div>
  );
}
