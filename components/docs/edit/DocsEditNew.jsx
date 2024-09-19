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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Placeholder from "@tiptap/extension-placeholder"; // Placeholder 임포트
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
  placeholderText, // 새로운 prop 추가
}) => {
  const editorRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showAiButton, setShowAiButton] = useState(false);

  // Tiptap 에디터 초기화
  // Tiptap 에디터 초기화
  const editor = useEditor({
    extensions: [
      ...extensions,
      Placeholder.configure({
        placeholder: placeholderText || "내용을 입력하세요...",
        includeChildren: true,
        shouldShow: ({ editor }) => {
          // 에디터 내용이 비었거나 빈 태그만 있을 경우
          const html = editor.getHTML();
          return (
            html === '' ||
            html === '<p></p>' ||
            html === '<p><br></p>' ||
            html === '<p></p><p></p>'
          );
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      // 에디터 내용을 가져와 onUpdate 콜백에 전달
      onUpdate(editor.getHTML());
    },
  });

  // content prop이 변경될 때 에디터 내용 업데이트
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content || '', false);
    }
  }, [content, editor]);

  // 에디터 참조 설정
  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
    }
  }, [editor]);
  // 마우스 진입 핸들러
  const handleMouseEnter = () => {
    if (className === "sectionbulletPoint") {
      setIsHovered(true);
    }
  };

  // 마우스 이탈 핸들러
  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowAiButton(false);
  };

  // 콘텐츠 클릭 핸들러
  const handleContentClick = (e) => {
    e.stopPropagation();
    if (className === "sectionbulletPoint") {
      setShowAiButton(true);
    } else {
      setShowAiButton(false);
    }
    if (editorRef.current) {
      setActiveEditor(editorRef.current);
    }
  };

  // AI 버튼 클릭 핸들러
  const handleAiButtonClick = (e) => {
    e.stopPropagation();
    console.log("AI Button Clicked!");
    setShowFormInEditorCompo();
    setShowAiButton(false);
  };

  // 에디터 컴포넌트 UI 렌더링
  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered && className === "sectionbulletPoint" && !showAiButton && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-10 cursor-pointer"
          onClick={handleContentClick}
        >
          <span className="text-gray-600 font-semibold bg-white px-2 py-1 rounded">
            AI Generate
          </span>
        </div>
      )}
      {showAiButton && className === "sectionbulletPoint" && (
        <button
          className="absolute left-[-5px] top-0 transform -translate-x-full bg-black text-white px-2 py-1 rounded z-50"
          onClick={handleAiButtonClick}
        >
          AI
        </button>
      )}
      <div
        className={`editor-content ${
          isHovered && !showAiButton ? "opacity-50" : ""
        }`}
        onClick={handleContentClick}
      >
        <EditorContent editor={editor} />
      </div>
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
    [debouncedUpdate, docsId]
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
    (sectionIndex, itemId, dateType, value) => {
      updateDataAndUpload((prev) => {
        const updatedSections = [...prev.sections];
        const sectionToUpdate = { ...updatedSections[sectionIndex] };
        sectionToUpdate.items = sectionToUpdate.items.map((item) =>
          item.id === itemId ? { ...item, [dateType]: value } : item
        );
        updatedSections[sectionIndex] = sectionToUpdate;

        return { ...prev, sections: updatedSections };
      });
    },
    [updateDataAndUpload]
  );
  // 현재 content의 editor로 menubar의 editor를 변경
  React.useEffect(() => {
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
        sectionToUpdate.items = sectionToUpdate.items.map((item) =>
          item.id === itemId
            ? subItemId
              ? {
                  ...item,
                  subItems: item.subItems.map((subItem) =>
                    subItem.id === subItemId
                      ? { ...subItem, [field]: value }
                      : subItem
                  ),
                }
              : { ...item, [field]: value }
            : item
        );
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
        const sectionType = prev.sections[sectionIndex].type;

        switch (sectionType) {
          case "education":
            newItem.title = "<p>University</p>";
            newItem.degree = "<p>Degree</p>";
            break;
          case "work":
            newItem.organization = "<p>Company</p>";
            newItem.subItems = [
              {
                id: uuidv4(),
                title: "<p>Job title</p>",
                bulletPoints:
                  "<ul><li>First point</li><li>Second point</li><li>Third point</li></ul>",
              },
            ];
            break;
          case "project":
          case "leadership":
            newItem.organization = "<p>Organization</p>";
            newItem.subItems = [
              {
                id: uuidv4(),
                title: "<p>title</p>",
                bulletPoints:
                  "<ul><li>Experience 1</li><li>Experience 2</li><li>Experience 3</li></ul>",
              },
            ];
            break;
          case "custom":
            newItem.content = "<p>Untitled</p>";
            break;
          default:
            console.warn(`Unknown section type: ${sectionType}`);
            return prev;
        }

        const updatedSections = [...prev.sections];
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          items: [...updatedSections[sectionIndex].items, newItem],
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
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          items: updatedSections[sectionIndex].items.map((item) =>
            item.id === parentId
              ? {
                  ...item,
                  subItems: [
                    ...(item.subItems || []),
                    {
                      id: uuidv4(),
                      title: "<p>Job Title</p>",
                      bulletPoints:
                        "<ul><li>First point</li><li>Second point</li><li>Third point</li></ul>",
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
              />
            }
            addCompany={() => addNewItem(sectionIndex)}
            tooltipText={`Add ${sectionData.type}`}
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
                      />
                    }
                    rightContent={
                      <EditorComponent
                        content=""
                        onUpdate={() => {}}
                        setActiveEditor={setActiveEditor}
                        className="cityState"
                        setShowFormInEditorCompo={setShowFormInDocs}
                        placeholderText="City, State"
                      />
                    }
                    tooltipText="Add degree"
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
                        className="sectionTitle"
                        setShowFormInEditorCompo={setShowFormInDocs}
                        initialDate={item.entryDate || null}
                        placeholderText="Degree"
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
                      />
                    }
                    rightContent={
                      <EditorComponent
                        content=""
                        onUpdate={() => {}}
                        setActiveEditor={setActiveEditor}
                        className="cityState"
                        setShowFormInEditorCompo={setShowFormInDocs}
                        placeholderText="City, State"
                      />
                    }
                    addBulletPoint={() => addSubItem(sectionIndex, item.id)}
                    tooltipText={`Add ${sectionData.type} item`}
                  />
                </div>
                {item.subItems &&
                  item.subItems.map((subItem) => (
                    <div key={subItem.id}>
                      <div className="sectiontitle">
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
                              className="sectionTitle"
                              placeholderText="Company"
                            />
                          }
                          onDateUpdate={(dateType, value) =>
                            handleDateUpdate(
                              sectionIndex,
                              item.id,
                              dateType,
                              value
                            )
                          }
                          initialEntryDate={item.entryDate || null}
                          initialExitDate={item.exitDate || null}
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
                          class
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
    ]
  );

  // 전체 UI 렌더링
  return (
    <div className="relative h-full flex flex-col items-center">
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
              />
            </div>
            <div id="BasicInfo-others">
              <EditorComponent
                content={resumeData.basicInfo.othersInfo}
                onUpdate={(value) => handleBasicInfoUpdate("othersInfo", value)}
                setActiveEditor={setActiveEditor}
                className="basicInfo"
                setShowFormInEditorCompo={setShowFormInDocs}
              />
            </div>
          </div>
          {Object.entries(resumeData.sections).map(
            ([sectionType, sectionData]) =>
              renderSection(sectionType, sectionData)
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicResumeEditors;
