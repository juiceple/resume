"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import "./DocsEditNew.css";
import { EditorContent, useEditor } from "@tiptap/react";
import extensions from "@/components/docs/edit/DocsToolBarCompo/EditorButtons/editorExtensions";
import MenuBar from "./DocsToolBarCompo/MenuBar";
import Section from "@/components/docs/edit/DocsInsideCompo/Section";
import Company from "@/components/docs/edit/DocsInsideCompo/Company";
import Title from "@/components/docs/edit/DocsInsideCompo/Title";
import Degree from "@/components/docs/edit/DocsInsideCompo/Degree";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/utils/supabase/client";
import html2canvas from "html2canvas";
import Placeholder from "@tiptap/extension-placeholder";

// 순환 참조를 방지하고 객체를 문자열로 변환하는 함수
const safeStringify = (obj, indent = 2) => {
  let cache = [];
  const retVal = JSON.stringify(
    obj,
    (key, value) =>
      typeof value === "object" && value !== null
        ? cache.includes(value)
          ? undefined // 순환 참조 방지
          : cache.push(value) && value
        : value,
    indent
  );
  cache = null;
  return retVal;
};

//너무 많은 DB 호출 방지
const debounce = (func, delay) => {
  const timeoutRef = useRef(null);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay]
  );
};

// 에디터 컴포넌트 정의
const EditorComponent = ({
  content,
  onUpdate,
  setActiveEditor,
  setShowFormInEditorCompo,
  className,
  placeholderText,
  defaultStyle // 새로운 prop 추가
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const editor = useEditor({
    extensions: [
      ...extensions,
      Placeholder.configure({
        placeholder: placeholderText || "내용을 입력하세요...",
        includeChildren: true,
        shouldShow: ({ editor }) => {
          const html = editor.getHTML();
          return (
            html === "" ||
            html === "<p></p>" ||
            html === "<p><br></p>" ||
            html === "<p></p><p></p>"
          );
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      let newContent = editor.getHTML();
      // 기본 스타일 적용
      if (defaultStyle === 'bold') {
        newContent = `<strong>${newContent}</strong>`;
      } else if (defaultStyle === 'italic') {
        newContent = `<em>${newContent}</em>`;
      }
      onUpdate(newContent);
    },
    onFocus: () => {
      setIsFocused(true);
      setShowButton(true);
      if (className === "sectionbulletPoint" && editor.isEmpty) {
        editor.commands.clearContent();
        editor.commands.toggleBulletList();
      }
    },
    onBlur: () => {
      setIsFocused(false);
      setShowButton(false);
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content || "", false);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
    }
  }, [editor]);

  const handleAiButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("AI Button Clicked!");

    if (typeof setShowFormInEditorCompo === "function") {
      setShowFormInEditorCompo();
    } else {
      console.error(
        "setShowFormInEditorCompo is not a function",
        setShowFormInEditorCompo
      );
    }
  };

  return (
    <div className="relative overflow-visible">
      {className === "sectionbulletPoint" && showButton && (
        <div className="button-container">
          <button
            className="ai-generate-button flex gap-2 mr-2"
            onClick={handleAiButtonClick}
            onMouseDown={(e) => e.preventDefault()}
          >
            {/* SVG 아이콘 및 버튼 내용 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
            >
              <path
                d="M6.88255 5.20503C6.73149 5.20503 6.58662 5.14502 6.4798 5.0382C6.37299 4.93138 6.31298 4.78651 6.31298 4.63545C6.31298 4.55992 6.28297 4.48748 6.22957 4.43407C6.17616 4.38067 6.10372 4.35066 6.02819 4.35066C5.95266 4.35066 5.88022 4.38067 5.82681 4.43407C5.77341 4.48748 5.7434 4.55992 5.7434 4.63545C5.7434 4.78651 5.68339 4.93138 5.57658 5.0382C5.46976 5.14502 5.32489 5.20503 5.17383 5.20503C5.0983 5.20503 5.02586 5.23503 4.97245 5.28844C4.91904 5.34185 4.88904 5.41428 4.88904 5.48981C4.88904 5.56534 4.91904 5.63778 4.97245 5.69119C5.02586 5.7446 5.0983 5.7746 5.17383 5.7746C5.32489 5.7746 5.46976 5.83461 5.57658 5.94143C5.68339 6.04824 5.7434 6.19312 5.7434 6.34418C5.7434 6.41971 5.77341 6.49215 5.82681 6.54555C5.88022 6.59896 5.95266 6.62897 6.02819 6.62897C6.10372 6.62897 6.17616 6.59896 6.22957 6.54555C6.28297 6.49215 6.31298 6.41971 6.31298 6.34418C6.31298 6.19312 6.37299 6.04824 6.4798 5.94143C6.58662 5.83461 6.73149 5.7746 6.88255 5.7746C6.95808 5.7746 7.03052 5.7446 7.08393 5.69119C7.13734 5.63778 7.16734 5.56534 7.16734 5.48981C7.16734 5.41428 7.13734 5.34185 7.08393 5.28844C7.03052 5.23503 6.95808 5.20503 6.88255 5.20503Z"
                fill="#FFF064"
              />
              <path
                d="M2.89549 1.218C2.74443 1.218 2.59956 1.15799 2.49274 1.05117C2.38593 0.944355 2.32592 0.799481 2.32592 0.64842C2.32592 0.57289 2.29591 0.500453 2.24251 0.447045C2.1891 0.393637 2.11666 0.363632 2.04113 0.363632C1.9656 0.363632 1.89316 0.393637 1.83975 0.447045C1.78635 0.500453 1.75634 0.57289 1.75634 0.64842C1.75634 0.799481 1.69633 0.944355 1.58952 1.05117C1.4827 1.15799 1.33783 1.218 1.18677 1.218C1.11124 1.218 1.0388 1.248 0.98539 1.30141C0.931982 1.35482 0.901978 1.42725 0.901978 1.50278C0.901978 1.57831 0.931982 1.65075 0.98539 1.70416C1.0388 1.75757 1.11124 1.78757 1.18677 1.78757C1.33783 1.78757 1.4827 1.84758 1.58952 1.9544C1.69633 2.06121 1.75634 2.20609 1.75634 2.35715C1.75634 2.43268 1.78635 2.50512 1.83975 2.55852C1.89316 2.61193 1.9656 2.64194 2.04113 2.64194C2.11666 2.64194 2.1891 2.61193 2.24251 2.55852C2.29591 2.50512 2.32592 2.43268 2.32592 2.35715C2.32592 2.20609 2.38593 2.06121 2.49274 1.9544C2.59956 1.84758 2.74443 1.78757 2.89549 1.78757C2.97102 1.78757 3.04346 1.75757 3.09687 1.70416C3.15028 1.65075 3.18028 1.57831 3.18028 1.50278C3.18028 1.42725 3.15028 1.35482 3.09687 1.30141C3.04346 1.248 2.97102 1.218 2.89549 1.218Z"
                fill="#FFEF64"
              />
              <path
                d="M6.29022 1.73346L5.88866 1.32906C5.72521 1.17423 5.50863 1.08794 5.28349 1.08794C5.05835 1.08794 4.84177 1.17423 4.67831 1.32906L3.25437 2.753L0.249862 5.7746C0.0898673 5.9348 0 6.15195 0 6.37835C0 6.60476 0.0898673 6.82191 0.249862 6.9821L0.651413 7.3865C0.811606 7.5465 1.02876 7.63636 1.25516 7.63636C1.48157 7.63636 1.69872 7.5465 1.85891 7.3865L4.88906 4.35066L6.313 2.94096C6.47001 2.77777 6.5558 2.55891 6.55153 2.3325C6.54726 2.10608 6.45327 1.89061 6.29022 1.73346ZM5.88866 2.53941L4.88906 3.54756L4.08311 2.74161L5.09126 1.73346C5.14462 1.68042 5.2168 1.65065 5.29203 1.65065C5.36727 1.65065 5.43945 1.68042 5.49281 1.73346L5.89721 2.13501C5.92335 2.16205 5.94388 2.19399 5.95761 2.229C5.97134 2.26401 5.978 2.30139 5.9772 2.33899C5.97641 2.37659 5.96817 2.41366 5.95298 2.44806C5.93778 2.48246 5.91592 2.5135 5.88866 2.53941Z"
                fill="#629EFF"
              />
            </svg>
            <span>생성하기</span>
          </button>
        </div>
      )}
      <EditorContent
        editor={editor}
        className={isFocused ? "ProseMirror-focused" : ""}
        onClick={() => {
          if (editorRef.current) {
            setActiveEditor(editorRef.current);
            editorRef.current.commands.focus();
          }
        }}
      />
    </div>
  );
};

// 동적 이력서 에디터 컴포넌트
const DynamicResumeEditors = ({
  resumeinitialData,
  bulletContent,
  setShowFormInDocs,
  docsId,
  setUpdateStatusTrue,
  setUpdateStatusFalse,
}) => {
  const docRef = useRef(null);
  const [activeEditor, setActiveEditor] = useState(null);
  const [resumeData, setResumeData] = useState(resumeinitialData);

  const [error, setError] = useState(null);
  const supabase = createClient();
  //초기 에디터설정
  const menuBarEditor = useEditor({
    extensions,
    content: "",
  });
  //초기 data를 불러오는 effect
  useEffect(() => {
    if (resumeinitialData) {
      setResumeData(resumeinitialData);
    }
  }, [resumeinitialData]);

  //현재 resume 문서의 preview 이미지를 생성하는 함수
  async function captureAndUpload(docsID) {
    try {
      // 'doc' 클래스를 가진 요소 찾기
      const element = document.querySelector(".doc");

      if (!element) {
        throw new Error("'doc' 클래스를 가진 요소를 찾을 수 없습니다.");
      }

      // HTML 요소를 캔버스로 변환
      const canvas = await html2canvas(element);

      // 캔버스를 Blob으로 변환
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      // docsID를 사용하여 파일 이름 생성
      const fileName = `${docsID}.png`;

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from("DocsPreview") // 'DocsPreview'는 Supabase에서 생성한 버킷 이름입니다.
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: true, // 같은 이름의 파일이 있으면 덮어쓰기
        });

      if (error) {
        throw error;
      }

      // 업로드된 파일의 public URL 가져오기
      const {
        data: { publicUrl },
        error: urlError,
      } = supabase.storage.from("DocsPreview").getPublicUrl(fileName);

      if (urlError) {
        throw urlError;
      }

      console.log("업로드 성공:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("캡처 또는 업로드 중 오류 발생:", error);
      throw error;
    }
  }
  //supabase에 DocsimgPreView을 업로드하는 함수
  const updateSupabase = async (newData) => {
    setUpdateStatusTrue();
    setError(null);
    try {
      if (!newData) {
        throw new Error("Invalid data for update");
      }

      // 이미지 캡처 및 업로드
      const previewUrl = await captureAndUpload(docsId);

      // Supabase 업데이트
      const { data, error } = await supabase
        .from("resumes")
        .update({
          content: newData,
          docs_preview_url: previewUrl, // 캡처된 이미지의 URL 저장
        })
        .eq("id", docsId)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        console.log("Update successful, preview URL saved:", previewUrl);
      } else {
        console.warn(
          "No data returned after update. Verify if the row exists and changes were made."
        );
      }
    } catch (error) {
      console.error("Error updating Supabase:", error);
      setError(`Failed to save changes: ${error.message}`);
    } finally {
      setUpdateStatusFalse();
    }
  };

  //supabase 과도한 호출 방지를 위한 debounced
  const debouncedUpdate = useCallback(
    debounce((newData) => {
      if (newData) {
        updateSupabase(newData);
      } else {
        console.warn(
          "Attempted to update with invalid data:",
          safeStringify(newData)
        );
      }
    }, 1000),
    [docsId]
  );
  //supabase에 content data를 업로드 하는 함수
  const updateDataAndUpload = useCallback(
    (newData) => {
      if (typeof newData === "function") {
        setResumeData((prevData) => {
          const updatedData = newData(prevData);
          debouncedUpdate(updatedData);
          return updatedData;
        });
      } else if (newData) {
        setResumeData(newData);
        debouncedUpdate(newData);
      } else {
        console.warn(
          "Attempted to update with invalid data:",
          safeStringify(newData)
        );
      }
    },
    [debouncedUpdate]
  );

  // 에디터에 새 내용 추가 함수
  const addContentToEditor = useCallback(
    (newContent) => {
      if (activeEditor) {
        activeEditor.commands.insertContent(newContent);
      }
    },
    [activeEditor]
  );
  //date를 업데이트하는 함수
  const handleDateUpdate = useCallback(
    (sectionIndex, itemId, dateType, value, subItemId = null) => {
      updateDataAndUpload((prev) => {
        const updatedSections = [...prev.sections];
        const sectionToUpdate = { ...updatedSections[sectionIndex] };
        sectionToUpdate.items = sectionToUpdate.items.map((item) =>
          item.id === itemId
            ? subItemId
              ? {
                  ...item,
                  subItems: item.subItems.map((subItem) =>
                    subItem.id === subItemId
                      ? { ...subItem, [dateType]: value }
                      : subItem
                  ),
                }
              : { ...item, [dateType]: value }
            : item
        );
        updatedSections[sectionIndex] = sectionToUpdate;

        return { ...prev, sections: updatedSections };
      });
    },
    [updateDataAndUpload]
  );

  // 현재 content의 editor로 menubar의 editor를 변경
  useEffect(() => {
    if (bulletContent && activeEditor) {
      addContentToEditor(bulletContent);
      setActiveEditor(activeEditor);
    }
  }, [bulletContent, activeEditor, addContentToEditor]);
  //최상위 basic info를 update하는 내용
  const handleBasicInfoUpdate = useCallback(
    (field, value) => {
      updateDataAndUpload((prev) => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          [field]: value,
        },
      }));
    },
    [updateDataAndUpload]
  );
  //content 업데이트(section들)
  const handleContentUpdate = useCallback(
    (sectionIndex, itemId, field, value, subItemId = null) => {
      updateDataAndUpload((prev) => {
        const updatedSections = [...prev.sections];
        const sectionToUpdate = { ...updatedSections[sectionIndex] };
        sectionToUpdate.items = sectionToUpdate.items.map((item) => {
          if (item.id === itemId) {
            if (subItemId) {
              return {
                ...item,
                subItems: item.subItems.map((subItem) =>
                  subItem.id === subItemId
                    ? { ...subItem, [field]: value }
                    : subItem
                ),
              };
            } else {
              // Add new fields directly to the item object
              return { ...item, [field]: value };
            }
          }
          return item;
        });
        updatedSections[sectionIndex] = sectionToUpdate;

        const updatedData = { ...prev, sections: updatedSections };
        return updatedData;
      });
    },
    [updateDataAndUpload]
  );


  //section 중 title을 업데이트
  const handleSectionTitleUpdate = useCallback(
    (sectionIndex, value) => {
      updateDataAndUpload((prev) => {
        const updatedSections = [...prev.sections];
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          title: value,
        };
        return {
          ...prev,
          sections: updatedSections,
        };
      });
    },
    [updateDataAndUpload]
  );

  //section 내용중 company + job title + bullet point 추가 함수
  const addNewItem = useCallback(
    (sectionIndex) => {
      updateDataAndUpload((prev) => {
        const newItem = { id: uuidv4() };
        const section = prev.sections[sectionIndex];

        switch (section.type) {
          case "education":
            newItem.title = "";
            newItem.degree = "";
            break;
          case "work":
            newItem.organization = "";
            newItem.subItems = [
              {
                id: uuidv4(),
                title: "",
                bulletPoints:
                  "",
              },
            ];
            break;
          case "project":
          case "leadership":
            newItem.organization = "";
            newItem.subItems = [
              {
                id: uuidv4(),
                title: "",
                bulletPoints:
                  "",
              },
            ];
            break;
          case "custom":
            newItem.content = "";
            break;
          default:
            console.warn(`Unknown section type: ${section.type}`);
            return prev;
        }

        const updatedSections = [...prev.sections];
        updatedSections[sectionIndex] = {
          ...section,
          items: [...section.items, newItem],
        };

        return {
          ...prev,
          sections: updatedSections,
        };
      });
    },
    [updateDataAndUpload]
  );

  //section 내용중 job title + bullet point 추가 함수
  const addSubItem = useCallback(
    (sectionIndex, parentId) => {
      updateDataAndUpload((prev) => {
        const updatedSections = [...prev.sections];
        const section = updatedSections[sectionIndex];

        updatedSections[sectionIndex] = {
          ...section,
          items: section.items.map((item) =>
            item.id === parentId
              ? {
                  ...item,
                  subItems: [
                    ...(item.subItems || []),
                    {
                      id: uuidv4(),
                      title: "",
                      bulletPoints:
                        "",
                      entryDate: null,
                      exitDate: null,
                    },
                  ],
                }
              : item
          ),
        };

        return {
          ...prev,
          sections: updatedSections,
        };
      });
    },
    [updateDataAndUpload]
  );

  // 아이템 삭제 함수
  const deleteItem = useCallback(
    (sectionIndex, itemId) => {
      updateDataAndUpload((prev) => {
        const updatedSections = [...prev.sections];
        const sectionToUpdate = { ...updatedSections[sectionIndex] };
        sectionToUpdate.items = sectionToUpdate.items.filter(
          (item) => item.id !== itemId
        );
        updatedSections[sectionIndex] = sectionToUpdate;
  
        const newData = { ...prev, sections: updatedSections };
        return newData;
      });
    },
    [updateDataAndUpload]
  );
  
  // 서브아이템 삭제 함수
  const deleteSubItem = useCallback(
    (sectionIndex, itemId, subItemId) => {
      updateDataAndUpload((prev) => {
        const updatedSections = [...prev.sections];
        const sectionToUpdate = { ...updatedSections[sectionIndex] };
        sectionToUpdate.items = sectionToUpdate.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                subItems: item.subItems.filter(
                  (subItem) => subItem.id !== subItemId
                ),
              }
            : item
        );
        updatedSections[sectionIndex] = sectionToUpdate;
  
        const newData = { ...prev, sections: updatedSections };
        return newData;
      });
    },
    [updateDataAndUpload]
  );
  

  // 섹션을 위로 이동하는 함수
  // 섹션을 위로 이동하는 함수
  const moveSectionUp = useCallback(
    (sectionIndex) => {
      if (sectionIndex > 0) {
        updateDataAndUpload((prev) => {
          const newSections = [...prev.sections];
          [newSections[sectionIndex - 1], newSections[sectionIndex]] = [
            newSections[sectionIndex],
            newSections[sectionIndex - 1],
          ];
          return { ...prev, sections: newSections };
        });
      }
    },
    [updateDataAndUpload]
  );

  // 섹션을 아래로 이동하는 함수
  const moveSectionDown = useCallback(
    (sectionIndex) => {
      if (sectionIndex < resumeData.sections.length - 1) {
        updateDataAndUpload((prev) => {
          const newSections = [...prev.sections];
          [newSections[sectionIndex], newSections[sectionIndex + 1]] = [
            newSections[sectionIndex + 1],
            newSections[sectionIndex],
          ];
          return { ...prev, sections: newSections };
        });
      }
    },
    [updateDataAndUpload, resumeData.sections.length]
  );

  const addPageBreaks = useCallback(() => {
    const docElement = document.querySelector(".doc");
    if (!docElement) return;

    // 기존 페이지 나누기 제거
    docElement.querySelectorAll(".page-break").forEach((el) => el.remove());

    const pageHeight = 842; // A4 페이지 높이 (픽셀)
    const currentHeight = docElement.scrollHeight;
    const numberOfPages = Math.floor(currentHeight / pageHeight);

    for (let i = 1; i <= numberOfPages; i++) {
      const pageBreak = document.createElement("div");
      pageBreak.className = "page-break";
      pageBreak.style.top = `${i * pageHeight}px`;
      docElement.appendChild(pageBreak);
    }
  }, []);

  useEffect(() => {
    addPageBreaks();
    window.addEventListener("resize", addPageBreaks);
    return () => window.removeEventListener("resize", addPageBreaks);
  }, [addPageBreaks]);

  // resumeData가 변경될 때마다 페이지 나누기 업데이트
  useEffect(() => {
    addPageBreaks();
  }, [resumeData, addPageBreaks]);

  // section들을 rendering하는 함수
  const renderSection = useCallback(
    (sectionIndex, sectionData) => (
      <div
        id={`${sectionData.type}Experience`}
        className="section"
        key={sectionIndex}
      >
        <div
          id={`${sectionData.type}Experience-sectionName`}
          className="sectionName"
        >
          <Section
            SectionleftContent={
              <EditorComponent
                content={sectionData.title}
                onUpdate={(value) =>
                  handleSectionTitleUpdate(sectionIndex, value)
                }
                setActiveEditor={setActiveEditor}
                className="sectionTitle"
                setShowFormInEditorCompo={setShowFormInDocs}
                placeholderText="Section Title"
                defaultStyle="bold"
              />
            }
            addCompany={() => addNewItem(sectionIndex)}
            tooltipText={`Add ${sectionData.type}`}
            sectionUp={() => moveSectionUp(sectionIndex)}
            sectionDown={() => moveSectionDown(sectionIndex)}
          />
        </div>
        <hr />
        {sectionData.items.map((item) => (
          <div key={item.id} className="sectionContent">
            {sectionData.type === "education" ? (
              <>
                <div className="contentTitle">
                  <Company
                    leftContent={
                      <EditorComponent
                        content={item.title}
                        onUpdate={(value) =>
                          handleContentUpdate(
                            sectionIndex,
                            item.id,
                            "title",
                            value
                          )
                        }
                        setActiveEditor={setActiveEditor}
                        className="contentTitle"
                        setShowFormInEditorCompo={setShowFormInDocs}
                        placeholderText="University"
                        defaultStyle="bold"
                      />
                    }
                    rightContent={
                      <EditorComponent
                        content={item.cityState || ""}
                        onUpdate={(value) =>
                          handleContentUpdate(
                            sectionIndex,
                            item.id,
                            "cityState",
                            value
                          )
                        }
                        setActiveEditor={setActiveEditor}
                        className="cityState"
                        setShowFormInEditorCompo={setShowFormInDocs}
                        placeholderText="City, State"
                        defaultStyle="bold"
                      />
                    }
                    tooltipText="Add degree"
                    onDelete={() => deleteItem(sectionIndex, item.id)}
                  />
                </div>
                <div className="sectiontitle">
                  <Degree
                    leftContent={
                      <EditorComponent
                        content={item.degree}
                        onUpdate={(value) =>
                          handleContentUpdate(
                            sectionIndex,
                            item.id,
                            "degree",
                            value
                          )
                        }
                        setActiveEditor={setActiveEditor}
                        className="Degree"
                        setShowFormInEditorCompo={setShowFormInDocs}
                        initialDate={item.entryDate || null}
                        placeholderText="Degree"
                        defaultStyle="italic"
                      />
                    }
                    onDateUpdate={(dateType, value) =>
                      handleDateUpdate(sectionIndex, item.id, dateType, value)
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div className="contentTitle">
                  <Company
                    leftContent={
                      <EditorComponent
                        content={item.organization}
                        onUpdate={(value) =>
                          handleContentUpdate(
                            sectionIndex,
                            item.id,
                            "organization",
                            value
                          )
                        }
                        setActiveEditor={setActiveEditor}
                        className="contentTitle"
                        setShowFormInEditorCompo={setShowFormInDocs}
                        defaultStyle="bold"
                        placeholderText="Organization"
                      />
                    }
                    rightContent={
                      <EditorComponent
                        content={item.cityState || ""}
                        onUpdate={(value) =>
                          handleContentUpdate(
                            sectionIndex,
                            item.id,
                            "cityState",
                            value
                          )
                        }
                        setActiveEditor={setActiveEditor}
                        className="cityState"
                        setShowFormInEditorCompo={setShowFormInDocs}
                        placeholderText="City, State"
                        defaultStyle="bold"
                      />
                    }
                    addBulletPoint={() => addSubItem(sectionIndex, item.id)}
                    tooltipText={`Add ${sectionData.type} item`}
                    onDelete={() => deleteItem(sectionIndex, item.id)}
                  />
                </div>
                {item.subItems &&
                  item.subItems.map((subItem) => (
                    <div key={subItem.id}>
                      <div className="jobtitle">
                        <Title
                          leftContent={
                            <EditorComponent
                              content={subItem.title}
                              onUpdate={(value) =>
                                handleContentUpdate(
                                  sectionIndex,
                                  item.id,
                                  "title",
                                  value,
                                  subItem.id
                                )
                              }
                              setShowFormInEditorCompo={setShowFormInDocs}
                              setActiveEditor={setActiveEditor}
                              className="jobTitle"
                              placeholderText="Job Title"
                              defaultStyle="italic"
                            />
                          }
                          onDateUpdate={(dateType, value) =>
                            handleDateUpdate(
                              sectionIndex,
                              item.id,
                              dateType,
                              value,
                              subItem.id // subItem의 id를 추가로 전달
                            )
                          }
                          initialEntryDate={subItem.entryDate || null} // subItem의 날짜 정보 사용
                          initialExitDate={subItem.exitDate || null} // subItem의 날짜 정보 사용
                          onDelete={() => deleteSubItem(sectionIndex, item.id, subItem.id)}
                        />
                      </div>
                      <div className="sectionbulletPoint">
                        <EditorComponent
                          content={subItem.bulletPoints}
                          onUpdate={(value) =>
                            handleContentUpdate(
                              sectionIndex,
                              item.id,
                              "bulletPoints",
                              value,
                              subItem.id
                            )
                          }
                          setShowFormInEditorCompo={setShowFormInDocs}
                          setActiveEditor={setActiveEditor}
                          className="sectionbulletPoint"
                          placeholderText="Click to add bullet points"
                        />
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        ))}
      </div>
    ),
    [
      handleSectionTitleUpdate,
      addNewItem,
      handleContentUpdate,
      addSubItem,
      setActiveEditor,
      setShowFormInDocs,
      moveSectionUp,
      moveSectionDown,
      handleDateUpdate,
    ]
  );

  console.log(resumeData);

  // 전체 UI 렌더링
  return (
    <div className="relative flex flex-col items-center">
      <div className="MenuBar">
        <MenuBar docsId={docsId} editor={activeEditor || menuBarEditor} />
      </div>
      <div className="docContainer flex flex-col flex-1 items-center w-full overflow-auto scrollbar scrollbar-thumb-zinc-400 scrollbar-track-zinc-200">
        <div className="doc max-w-3xl mx-auto">
          <div id="BasicInfo" className="text-center">
            <div id="BasicInfo-name">
              <EditorComponent
                content={resumeData.basicInfo.personName}
                onUpdate={(value) => handleBasicInfoUpdate("personName", value)}
                setActiveEditor={setActiveEditor}
                className="basicInfo"
                setShowFormInEditorCompo={setShowFormInDocs}
                placeholderText="Name"
              />
            </div>
            <div id="BasicInfo-others">
              <EditorComponent
                content={resumeData.basicInfo.othersInfo}
                onUpdate={(value) => handleBasicInfoUpdate("othersInfo", value)}
                setActiveEditor={setActiveEditor}
                className="basicInfo"
                setShowFormInEditorCompo={setShowFormInDocs}
                placeholderText="Seoul, South Korea | +82 10-XXXXXXXX | Unknown@gmail.com | linkedin.com/..."
              />
            </div>
          </div>
          {resumeData.sections.map((sectionData, index) =>
            renderSection(index, sectionData)
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicResumeEditors;
