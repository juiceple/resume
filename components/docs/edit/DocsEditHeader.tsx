"use client"
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { BookUser, Copy, Trash2, CornerDownLeft, Download, FolderCheck } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import Link from 'next/link';
import { createNewResume, cloneResume, deleteResume } from '@/lib/Resume';
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

interface EditHeaderProps {
    resumeId: string;
    refreshResumes: () => Promise<void>;
    isUpdating: boolean;
}

export default function EditHeader({ resumeId, refreshResumes, isUpdating }: EditHeaderProps) {
    const [title, setTitle] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 제목을 불러오는 함수
    const getTitle = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('resumes')
                .select('title')
                .eq('id', resumeId)
                .single();

            if (error) throw error;

            if (data) {
                setTitle(data.title || '제목 없음');
            }
        } catch (error) {
            console.error('Error fetching title:', error);
            setTitle('제목 불러오기 실패');
            // 여기에 사용자에게 오류를 표시하는 로직을 추가할 수 있습니다.
        }
    }, [resumeId, supabase]);

    // 컴포넌트가 마운트될 때 제목을 불러옵니다.
    useEffect(() => {
        getTitle();
    }, [getTitle]);

    // 제목 변경 함수
    const handleTitleChange = useCallback((newTitle: string) => {
        setTitle(newTitle);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(async () => {
            try {
                const { error } = await supabase
                    .from('resumes')
                    .update({ title: newTitle })
                    .eq('id', resumeId);

                if (error) throw error;
                console.log('Title updated successfully');
            } catch (error) {
                console.error('Error updating title:', error);
                // 여기에 사용자에게 오류를 표시하는 로직을 추가할 수 있습니다.
            }
        }, 500); // 500ms 디바운스
    }, [resumeId, supabase]);

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);
    //--새로운 Resume 생성 함수--//
    const handleCreateNewResume = useCallback(async () => {
        setLoading(true);
        setLoadingMessage('새 이력서를 생성 중입니다...');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/');
                return;
            }

            const result = await createNewResume(session.user.id);
            if (result.success && result.data) {
                router.push(`/docs/edit?id=${result.data.id}`);
            } else {
                throw new Error(result.error || '새 이력서 생성 실패');
            }
        } catch (error) {
            console.error('새 이력서 생성 오류:', error);
            alert('새 이력서 생성에 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    }, [supabase, router]);
    //--현재 Resume 복제 함수--//
    const handleCloneResume = useCallback(async () => {
        setLoading(true);
        setLoadingMessage('이력서를 복제 중입니다...');
        try {
            const result = await cloneResume(resumeId);
            if (result.success && result.data) {
                router.push(`/docs/edit?id=${result.data.id}`);
            } else {
                throw new Error(result.error || '이력서 복제 실패');
            }
        } catch (error) {
            console.error('이력서 복제 오류:', error);
            alert('이력서 복제에 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    }, [resumeId, router]);
    //--현재 Resume 삭제 함수--//
    const handleDeleteResume = useCallback(async () => {
        setLoading(true);
        setLoadingMessage('이력서를 삭제 중입니다...');
        try {
            const result = await deleteResume(resumeId);
            if (result.success) {
                router.push('/docs');
            } else {
                throw new Error(result.error || '이력서 삭제 실패');
            }
        } catch (error) {
            console.error('이력서 삭제 오류:', error);
            alert('이력서 삭제에 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
            setShowDeleteAlert(false);
        }
    }, [resumeId, router]);
    //--PDF를 생성하는 함수(아직 미해결 사안)--//
    // const generatePDF = useCallback(async () => {
    //     setLoading(true);
    //     setLoadingMessage('PDF를 생성 중입니다...');

    //     try {
    //       const resumeContent = document.querySelector('.doc');
    //       if (!resumeContent || !(resumeContent instanceof HTMLElement)) {
    //         throw new Error('이력서 내용을 찾을 수 없습니다.');
    //       }

    //       // 모든 스타일시트의 CSS 규칙 수집
    //       const cssRules: string[] = [];
    //       for (let i = 0; i < document.styleSheets.length; i++) {
    //         const sheet = document.styleSheets[i];
    //         try {
    //           const rules = sheet.cssRules || sheet.rules;
    //           for (let j = 0; j < rules.length; j++) {
    //             // .ProseMirror-focused 클래스와 관련된 CSS 규칙을 제외
    //             if (!rules[j].cssText.includes('.ProseMirror-focused')) {
    //               cssRules.push(rules[j].cssText);
    //             }
    //           }
    //         } catch (e) {
    //           console.warn('스타일시트 접근 오류:', e);
    //         }
    //       }

    //       // 인라인 스타일 수집
    //       const inlineStyles = resumeContent.getAttribute('style') || '';

    //       // 계산된 스타일 수집 (옵션)
    //       const computedStyles = window.getComputedStyle(resumeContent);
    //       const importantStyles = {
    //         fontFamily: computedStyles.fontFamily,
    //         fontSize: computedStyles.fontSize,
    //         lineHeight: computedStyles.lineHeight,
    //         color: computedStyles.color,
    //         backgroundColor: computedStyles.backgroundColor,
    //         // 필요한 다른 스타일 속성 추가
    //       };

    //       const cleanedContent = resumeContent.cloneNode(true) as HTMLElement;
    //       cleanedContent.querySelectorAll('.pdf-exclude').forEach(el => el.remove());
    //       cleanedContent.querySelectorAll('.page-break').forEach(el => el.remove());
    //       cleanedContent.querySelectorAll('.button-container').forEach(el => el.remove());
    //       cleanedContent.querySelectorAll('.ai-generate-button').forEach(el => el.remove());
    //       cleanedContent.querySelectorAll('.is-empty').forEach(el => el.remove());
    //       cleanedContent.querySelectorAll('.add-section-button-container').forEach(el => el.remove());
    //       // .ProseMirror-focused 클래스 제거 대신 클래스를 가진 요소의 스타일만 초기화
    //       cleanedContent.querySelectorAll('.ProseMirror-focused').forEach(el => {
    //         (el as HTMLElement).style.cssText = '';
    //       });
    //       cleanedContent.querySelectorAll('.custom-date-picker:focus-within').forEach(el => el.remove());

    //       const htmlContent = cleanedContent.innerHTML;

    //       const response = await fetch('/api/generate-pdf', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ 
    //           html: htmlContent, 
    //           cssRules: cssRules.join('\n'),
    //           inlineStyles,
    //           computedStyles: importantStyles
    //         }),
    //       });

    //       if (!response.ok) {
    //         const errorText = await response.text();
    //         throw new Error(`서버 응답 오류: ${response.status} ${errorText}`);
    //       }

    //       const blob = await response.blob();
    //       const url = window.URL.createObjectURL(blob);
    //       const link = document.createElement('a');
    //       link.href = url;
    //       link.download = `${title || 'resume'}.pdf`;
    //       link.click();
    //       window.URL.revokeObjectURL(url);

    //     } catch (error) {
    //       console.error('PDF 생성 오류:', error);
    //       alert(`PDF 생성에 실패했습니다. 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    //     } finally {
    //       setLoading(false);
    //     }
    //   }, [title]);
    const generatePDF = useCallback(async () => {
        setLoading(true);
        setLoadingMessage('PDF를 생성 중입니다...');

        try {
            const resumeContent = document.querySelector('.doc');
            if (!resumeContent || !(resumeContent instanceof HTMLElement)) {
                throw new Error('이력서 내용을 찾을 수 없습니다.');
            }

            // 제외할 선택자 목록 정의
            const excludeSelectors = [
                '.ProseMirror-focused',
                '.pdf-exclude',
                '.page-break',
                '.button-container',
                '.ai-generate-button',
                '.is-empty',
                '.add-section-button-container',
                '.custom-date-picker:focus-within'
            ];

            // Collect all stylesheet CSS rules
            const cssRules: string[] = [];
            for (let i = 0; i < document.styleSheets.length; i++) {
                const sheet = document.styleSheets[i];
                try {
                    const rules = sheet.cssRules || sheet.rules;
                    for (let j = 0; j < rules.length; j++) {
                        const rule = rules[j];
                        if (rule instanceof CSSStyleRule) {
                            // Check if the rule contains any of the exclude selectors
                            if (!excludeSelectors.some(selector => rule.selectorText.includes(selector))) {
                                cssRules.push(rule.cssText);
                            }
                        } else {
                            // Include non-style rules (like @media) without filtering
                            cssRules.push(rule.cssText);
                        }
                    }
                } catch (e) {
                    console.warn('스타일시트 접근 오류:', e);
                }
            }

            const inlineStyles = resumeContent.getAttribute('style') || '';
            const computedStyles = window.getComputedStyle(resumeContent);

            const cleanedContent = resumeContent.cloneNode(true) as HTMLElement;
            cleanedContent.querySelectorAll(excludeSelectors.join(', ')).forEach(el => el.remove());
            cleanedContent.querySelectorAll('.ProseMirror-focused').forEach(el => {
                (el as HTMLElement).style.cssText = '';
            });
            // .custom-date-picker:focus-within 요소 제거
            cleanedContent.querySelectorAll('.custom-date-picker:focus-within').forEach(el => el.remove());
            const htmlContent = cleanedContent.innerHTML;

            const response = await fetch('http://localhost:3001/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    html: htmlContent,
                    css: cssRules.join('\n'),
                    inlineStyles,
                    computedStyles: {
                        fontFamily: computedStyles.fontFamily,
                        fontSize: computedStyles.fontSize,
                        lineHeight: computedStyles.lineHeight,
                        color: computedStyles.color,
                        backgroundColor: computedStyles.backgroundColor,
                    }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`서버 응답 오류: ${response.status} ${errorText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title || 'resume'}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('PDF 생성 오류:', error);
            alert(`PDF 생성에 실패했습니다. 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setLoading(false);
        }
    }, [title]);

    return (
        <>
            {loading && <FullScreenLoader message={loadingMessage} />}
            <div className="w-full h-[55px] pl-6 pr-5 Resume-color-30 flex items-center justify-between ">
                <div className="flex gap-4 items-center">
                    <Link href={`/docs`} passHref>
                        <button className="flex Resume-color-60 w-[25px] h-[25px] rounded-md items-center justify-center">
                            <CornerDownLeft className="w-[15px] h-[15px]" />
                        </button>
                    </Link>
                    <textarea
                        className="w-[160px] h-10 rounded-xl Resume-color-30 rounded-md text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-black border-none px-2 py-2 resize-none"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Untitled"
                    />
                    <div className="ml-2 text-xs text-gray-500 whitespace-nowrap">
                        {isUpdating ? (
                            <div>
                                <div className="spinner mr-2 w-[20px] h-[20px]"></div>
                            </div>
                        ) : (
                            <div className='flex items-center'>
                                <FolderCheck className="text-black mr-1" size={25} />
                                <p className='text-[15px] text-black'>저장!</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex h-[35px]">
                    <button
                        className="Resume-color-10 rounwhite rounded-full text-black flex shrink-0 items-center w-[120px] items-center justify-center gap-1 hover:bg-[#1759C4]"
                        onClick={generatePDF}
                    >
                        <div className='text-white text-xs'>
                            PDF 다운 받기
                        </div>
                        <div>
                            <Download size={16} color={"#FFFFFF"} />
                        </div>
                    </button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="bg-transparent border-0 ml-2" disabled={loading}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8.00001 8.66668C8.3682 8.66668 8.66668 8.3682 8.66668 8.00001C8.66668 7.63182 8.3682 7.33334 8.00001 7.33334C7.63182 7.33334 7.33334 7.63182 7.33334 8.00001C7.33334 8.3682 7.63182 8.66668 8.00001 8.66668Z" stroke="#2A2E34" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M8.00001 3.99999C8.3682 3.99999 8.66668 3.70151 8.66668 3.33332C8.66668 2.96513 8.3682 2.66666 8.00001 2.66666C7.63182 2.66666 7.33334 2.96513 7.33334 3.33332C7.33334 3.70151 7.63182 3.99999 8.00001 3.99999Z" stroke="#2A2E34" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M8.00001 13.3333C8.3682 13.3333 8.66668 13.0349 8.66668 12.6667C8.66668 12.2985 8.3682 12 8.00001 12C7.63182 12 7.33334 12.2985 7.33334 12.6667C7.33334 13.0349 7.63182 13.3333 8.00001 13.3333Z" stroke="#2A2E34" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[150px] flex flex-col gap-1 mt-1 mr-2 bg-white rounded-xl text-s border-none shadow-xl">
                            <div className='px-0 py-2'>
                                <Button
                                    className="h-[20px] w-[148px] flex justify-start gap-1 bg-white rounded-none text-black hover:bg-[#BED7FF]"
                                    onClick={handleCreateNewResume}
                                    disabled={loading}
                                >
                                    <div>
                                        <BookUser color="#000000" size={15} />
                                    </div>
                                    <div className="text-left">
                                        새 이력서 만들기
                                    </div>
                                </Button>
                                <Button
                                    className="h-[20px] w-[148px] flex justify-start gap-1 bg-white rounded-none text-black hover:bg-[#BED7FF]"
                                    onClick={handleCloneResume}
                                    disabled={loading}
                                >
                                    <div>
                                        <Copy color="#000000" size={15} />
                                    </div>
                                    <div className="text-left">
                                        복제하기
                                    </div>
                                </Button>
                                <Button
                                    className="h-[20px] w-[148px] flex justify-start gap-1 bg-white rounded-none text-black hover:bg-[#BED7FF]"
                                    onClick={() => setShowDeleteAlert(true)}
                                    disabled={loading}
                                >
                                    <div>
                                        <Trash2 color="#000000" size={15} />
                                    </div>
                                    <div className="text-left">
                                        삭제하기
                                    </div>
                                </Button>
                            </div>

                        </PopoverContent>
                    </Popover>
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
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteResume}>삭제</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

        </>);
}