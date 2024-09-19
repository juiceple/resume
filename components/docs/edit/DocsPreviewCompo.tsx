import "./DocsEditNew.css";
import extensions from "@/components/docs/edit/DocsToolBarCompo/EditorButtons/editorExtensions";
import MenuBar from "./DocsToolBarCompo/MenuBar";
import { Skeleton } from "@/components/ui/skeleton"
import { useEditor } from "@tiptap/react";

export default function DocsPreview() {
    const menuBarEditor = useEditor({
        extensions,
        content: "",
    });

    return (
        <div className="relative h-full flex flex-col items-center">
            <div className="MenuBar">
                <Skeleton className="h-10 w-[1000px]" />
            </div>
            <div className="flex flex-col flex-1 items-center w-full overflow-auto scrollbar scrollbar-thumb-zinc-400 scrollbar-track-zinc-100">
                <div className="doc max-w-3xl w-full mx-auto p-8">
                    <div className="flex flex-col space-y-8">
                        {/* 이름 및 직함 */}
                        <div className="flex flex-col items-center space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-6 w-36" />
                        </div>

                        {/* WORK EXPERIENCE 섹션 */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-40" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>

                        {/* PROJECT EXPERIENCE 섹션 */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-40" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>

                        {/* EDUCATION 섹션 */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-40" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>

                        {/* LEADERSHIP EXPERIENCE 섹션 */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-40" />
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                        {/* CUSTOM SECTION */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}