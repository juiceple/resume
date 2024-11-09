import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Plus, Copy, Trash2, BookUser } from 'lucide-react';
import { cloneResume, deleteResume, createNewResume, Resume } from '@/lib/Resume';
import { createClient } from '@/utils/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import FullScreenLoader from '@/components/FullScreenLoad';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import CustomAlert from '@/components/CustomAlert';

interface ResumesListProps {
  initialResumes: Resume[];
  refreshResumes: () => Promise<void>;
}

interface SignedUrls {
  [key: string]: string;
}

const ResumesList: React.FC<ResumesListProps> = ({ initialResumes, refreshResumes }) => {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<SignedUrls>({});
  const router = useRouter();
  const supabase = createClient();
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

  useEffect(() => {
    setResumes(initialResumes);
  }, [initialResumes]);

  useEffect(() => {
    const fetchSignedUrls = async () => {
      const urls: SignedUrls = {};
      for (const resume of resumes) {
        if (resume.docs_preview_url) {
          try {
            const url = resume.docs_preview_url.trim();
            if (url === "") {
              console.warn(`Empty docs_preview_url for resume ${resume.id}`);
              continue;
            }

            const encodedUrl = encodeURIComponent(resume.id + '.png');
            const res = await fetch(`/api/getSignedUrl/${encodedUrl}`);
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (data.signedUrl) {
              urls[resume.id] = data.signedUrl;
            } else {
              console.warn(`No signed URL returned for resume ${resume.id}`);
            }
          } catch (error) {
            console.error(`Error fetching signed URL for resume ${resume.id}:`, error);
          }
        } else {
          console.warn(`No docs_preview_url for resume ${resume.id}`);
        }
      }
      setSignedUrls(urls);
    };

    if (resumes.length > 0) {
      fetchSignedUrls();
    }
  }, [resumes]);

  const handleCreateNewResume = useCallback(async () => {
    setLoading(true);
    setLoadingMessage('생성 중입니다...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      const result = await createNewResume(session.user.id);
      if (result.success && result.data) {
        await refreshResumes();
        router.push(`/docs/edit?id=${result.data.id}`);
      } else {
        throw new Error(result.error || '새 이력서 생성 실패');
      }
    } catch (error) {
      console.error('새 이력서 생성 오류:', error);
      updateAlert("생성 실패", '새 이력서 생성에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }, [supabase, router, refreshResumes]);

  const handleResumeClick = useCallback((resumeId: string) => {
    setLoading(true);
    setLoadingMessage('이력서를 로딩중입니다...');
    router.push(`/docs/edit?id=${resumeId}`);
  }, [router]);

  const handleCloneResume = useCallback(async (resumeId: string) => {
    setLoading(true);
    setLoadingMessage('이력서를 복제 중입니다...');
    try {
      const result = await cloneResume(resumeId);
      if (result.success) {
        await refreshResumes();
      } else {
        throw new Error(result.error || '이력서 복제 실패');
      }
    } catch (error) {
      console.error('이력서 복제 오류:', error);
      updateAlert("이력서 복제 오류", '이력서 복제에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }, [refreshResumes]);

  const handleDeleteResume = useCallback(async () => {
    if (!resumeToDelete) return;

    setLoading(true);
    setLoadingMessage('이력서를 삭제 중입니다...');
    try {
      const result = await deleteResume(resumeToDelete);
      if (result.success) {
        await refreshResumes();
      } else {
        throw new Error(result.error || '이력서 삭제 실패');
      }
    } catch (error) {
      console.error('이력서 삭제 오류:', error);
      updateAlert('이력서 삭제 오류', '이력서 삭제에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
      setResumeToDelete(null);
    }
  }, [resumeToDelete, refreshResumes]);

  return (
    <>
      {loading && <FullScreenLoader message={loadingMessage} isVisible={true}/>}
      <div className="flex flex-wrap gap-4 p-4">
        <div className="w-[200px] h-[300px] m-2">
          <button
            onClick={handleCreateNewResume}
            className="w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg"
            disabled={loading}
          >
            <div className="bg-white w-full h-full p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center">
              <Plus className="w-12 h-12 text-gray-400 mb-2" />
              <h3 className="font-semibold text-sm">새 이력서 만들기</h3>
            </div>
          </button>
        </div>
        {resumes.map((resume) => (
          <div key={resume.id} className="w-[200px] h-[300px] m-2 relative group">
            <button
              onClick={() => handleResumeClick(resume.id)}
              className="w-full h-full text-left focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg"
              disabled={loading}
            >
              <div className="bg-white text-center p-3 rounded-lg shadow-md group-hover:shadow-xl hover:bg-[#EDF4FF] transition-all duration-300 h-full">
                <h3 className="font-semibold h-[30px] text-[14px] pr-6 truncate">{resume.title}</h3>
                <div className="aspect-[1/1.414] w-full h-[230px] relative overflow-hidden">
                  <Image
                    src={signedUrls[resume.id] || '/images/pdfImg.png'}
                    alt={resume.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
                <div className="flex items-center h-[20px] text-[10px] text-gray-500 gap-1">
                  <p>수정 날짜:</p>
                  <span className="truncate">{new Date(resume.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </button>
            <div className="absolute top-2 right-2 transition-all duration-300 ease-in-out transform group-hover:scale-105">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-1 bg-white rounded-full group-hover:bg-[#EDF4FF] transition-all duration-300" disabled={loading}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8.00001 8.66668C8.3682 8.66668 8.66668 8.3682 8.66668 8.00001C8.66668 7.63182 8.3682 7.33334 8.00001 7.33334C7.63182 7.33334 7.33334 7.63182 7.33334 8.00001C7.33334 8.3682 7.63182 8.66668 8.00001 8.66668Z" stroke="#2A2E34" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M8.00001 3.99999C8.3682 3.99999 8.66668 3.70151 8.66668 3.33332C8.66668 2.96513 8.3682 2.66666 8.00001 2.66666C7.63182 2.66666 7.33334 2.96513 7.33334 3.33332C7.33334 3.70151 7.63182 3.99999 8.00001 3.99999Z" stroke="#2A2E34" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M8.00001 13.3333C8.3682 13.3333 8.66668 13.0349 8.66668 12.6667C8.66668 12.2985 8.3682 12 8.00001 12C7.63182 12 7.33334 12.2985 7.33334 12.6667C7.33334 13.0349 7.63182 13.3333 8.00001 13.3333Z" stroke="#2A2E34" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[150px] p-0 bg-white rounded-xl text-s border-none shadow-xl">
                  <div className='py-2'>
                    <Button
                      className="h-[32px] w-full flex justify-start gap-2 px-3 bg-white rounded-none text-black hover:bg-[#BED7FF]"
                      onClick={handleCreateNewResume}
                      disabled={loading}
                    >
                      <BookUser size={15} />
                      <span>새 이력서 만들기</span>
                    </Button>
                    <Button
                      className="h-[32px] w-full flex justify-start gap-2 px-3 bg-white rounded-none text-black hover:bg-[#BED7FF]"
                      onClick={() => handleCloneResume(resume.id)}
                      disabled={loading}
                    >
                      <Copy size={15} />
                      <span>복제하기</span>
                    </Button>
                    <Button
                      className="h-[32px] w-full flex justify-start gap-2 px-3 bg-white rounded-none text-black hover:bg-[#BED7FF]"
                      onClick={() => {
                        setResumeToDelete(resume.id);
                        setShowDeleteAlert(true);
                      }}
                      disabled={loading}
                    >
                      <Trash2 size={15} />
                      <span>삭제하기</span>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        ))}
      </div>
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 이 이력서를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 이력서가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResumeToDelete(null)}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResume}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {alert.show && (
        <CustomAlert
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}
    </>
  );
}

export default ResumesList;