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
import CustomAlert from '@/components/CustomAlert';

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

  // Define alert state for CustomAlert
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: [] as string[],
  });

  // Function to update alert state
  const updateAlert = (title: string, message: string | string[], show = true) => {
    setAlert({
      title,
      message: Array.isArray(message) ? message : [message],
      show,
    });
  };


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

  const [eventPoints, setEventPoints] = useState<number>(0);  // Initialize event points
  const [purchasePoints, setPurchasePoints] = useState<number>(0);  // Initialize purchase points


  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchUserProfile(user.id); // 초기 포인트 불러오기
      }
    };
    fetchUserId();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log("함수 실행됨")
    const { data, error } = await supabase
      .from('BulletPointHistory')
      .select('eventPoint, purchasePoint')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      updateAlert("에러", "포인트 정보를 가져오는 데 실패했습니다.");
      console.error('Error fetching BulletPointHistory:', error);
    } else if (data) {
      setEventPoints(data.eventPoint); // Set event points from the latest record
      setPurchasePoints(data.purchasePoint); // Set purchase points from the latest record
      setBulletPoints(data.eventPoint + data.purchasePoint); // Set total points in BulletPoints
      console.log(data.eventPoint, data.purchasePoint);
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
      updateAlert("에러", "이력서 업로드를 실패했습니다.");
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

  const deductPoints = async (amount: number, isCreation: boolean) => {
    if (!userId) return;
    console.log(eventPoints, purchasePoints)
    let remainingAmount = amount;
    let updatedEventPoints = eventPoints;
    let updatedPurchasePoints = purchasePoints;
    let eventPointDeduction = 0;
    let purchasePointDeduction = 0;
  
    console.log("초기 상태 - eventPoints:", eventPoints, "purchasePoints:", purchasePoints);
  
    // 이벤트 포인트에서 먼저 차감
    if (eventPoints >= amount) {
      updatedEventPoints -= remainingAmount;
      eventPointDeduction = remainingAmount;
      remainingAmount = 0;
      console.log("이벤트 포인트에서 전부 차감 - 차감량:", eventPointDeduction);
    } else {
      eventPointDeduction = eventPoints;
      remainingAmount -= eventPoints;
      updatedEventPoints = 0;
  
      // 남은 양은 구매 포인트에서 차감
      updatedPurchasePoints -= remainingAmount;
      purchasePointDeduction = remainingAmount;
      console.log("이벤트 포인트 전부 소진, 남은 양을 구매 포인트에서 차감 - 구매 포인트 차감량:", purchasePointDeduction);
    }
  
    console.log("차감 후 상태 - updatedEventPoints:", updatedEventPoints, "updatedPurchasePoints:", updatedPurchasePoints);
    console.log("차감 기록 - eventPointDeduction:", eventPointDeduction, "purchasePointDeduction:", purchasePointDeduction);
  
    // Supabase에서 포인트 업데이트
    const { error: updateError } = await supabase
      .from('BulletPointHistory')
      .update({
        eventPoint: updatedEventPoints,
        purchasePoint: updatedPurchasePoints,
      })
      .eq('user_id', userId);
  
    if (updateError) {
      updateAlert("에러", "포인트 업데이트에 실패했습니다.");
      console.error('Error updating points in database:', updateError);
      return;
    } else {
      console.log("포인트 업데이트 성공 - eventPoint:", updatedEventPoints, "purchasePoint:", updatedPurchasePoints);
    }
  
    // BulletPointHistory에 이벤트 포인트와 구매 포인트 차감 기록 추가
    const { error: insertError } = await supabase
      .from('BulletPointHistory')
      .insert([{
        user_id: userId,
        eventPoint: updatedEventPoints,
        purchasePoint: updatedPurchasePoints,
        changeEventPoint: -eventPointDeduction,  // 이벤트 포인트 차감 내역
        change: -purchasePointDeduction,         // 구매 포인트 차감 내역
        reason: isCreation ? '불렛 포인트 생성' : '불렛 포인트 수정'
      }]);
  
    if (insertError) {
      updateAlert("에러", "포인트 기록을 저장하는 데 실패했습니다.");
      console.error('Error inserting into BulletPointHistory:', insertError);
    } else {
      console.log("포인트 기록 추가 성공 - changeEventPoint:", -eventPointDeduction, "change:", -purchasePointDeduction);
      
      // 데이터베이스 업데이트가 성공하면 로컬 상태 업데이트
      setEventPoints(updatedEventPoints);
      setPurchasePoints(updatedPurchasePoints);
      setBulletPoints(updatedEventPoints + updatedPurchasePoints); // 전체 포인트 업데이트
      console.log("로컬 상태 업데이트 완료 - 총 포인트:", updatedEventPoints + updatedPurchasePoints);
    }
  };
  
  



  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (bulletPoints >= 50) { // 50 포인트 이상 필요
      await deductPoints(50, true);
      setMessages([]);
      setIsGenerating(true);
      const textOfJSON = `My job title is ${jobFormData.job}, and what I did in the job is ${jobFormData.workOnJob}. Generate Only One BulletPoint in ENGLISH with quantified NUMBER`;
      append({ content: textOfJSON, role: "user" });
      setShowChat(true);
    } else {
      updateAlert("포인트가 부족합니다.", "이용가능한 포인트가 없습니다. 충전해주세요.");
    }
  };


  const handleSubmitMessage = useCallback(async () => {
    if (!input.trim()) return;
    if (bulletPoints >= 20) { // 20 포인트 이상 필요
      await deductPoints(20, false);
      setIsGenerating(true);
      handleSubmit(new Event('submit') as any);
    } else {
      updateAlert("포인트가 부족합니다.", "이용가능한 포인트가 없습니다. 충전해주세요.");
    }
  }, [input, handleSubmit]);


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
              <div className="mb-12">
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
              <div className='absolute bottom-4 text-[#8D8D8D] text-center'>불렛 포인트 생성에는 50P가 사용됩니다.</div>
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
              <div className="flex-grow overflow-y-auto mb-4 mt-[30px] mb-[30px]">
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
                >
                  <ArrowUp />
                </button>
                <div className='absolute w-full -ml-4 bottom-[75px] text-[#8D8D8D] flex justify-center items-center'>채팅으로 수정은 20P가 사용됩니다.</div>
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
      {alert.show && (
        <CustomAlert
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}
    </div>
  );
}