import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Message as MessageType } from "ai";
import { Plus, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface MessageProps {
  message: MessageType;
  isLast?: boolean;
  isLoading?: boolean;
  onAddToResume: (content: string) => void;
  userId: string | null;
}

export default function Message({ message, isLast, isLoading, onAddToResume, userId }: MessageProps) {
  const { role, content } = message;
  const supabase = createClient();
  const [isAdding, setIsAdding] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);

  const handleAddToResume = async () => {
    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('bulletpoints')
        .insert([
          { content: content, user_id: userId, created_at: new Date().toISOString() }
        ]);

      if (error) throw error;

      onAddToResume(content);
    } catch (error) {
      console.error("Error adding to resume:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleTranslate = async () => {
    if (translatedContent) {
      setShowTranslation(!showTranslation);
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });
      const data = await response.json();
      setTranslatedContent(data.translatedText);
      setShowTranslation(true);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  if (role === "assistant") {
    return (
      <div className="flex flex-col gap-3 p-4 bg-white rounded-lg shadow-md" style={{ backgroundColor: "#EDEDED" }}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleAddToResume}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
            disabled={isAdding}
          >
            <Plus size={20} />
            <p className="text-black">{isAdding ? "추가 중..." : "Resume에 추가하기"}</p>
          </button>
          <button
            onClick={handleTranslate}
            className="flex items-center text-xs gap-2 text-blue-500 py-1 px-2 rounded-full bg-gray-300 hover:text-blue-700"
            disabled={isTranslating}
          >
            <RefreshCw size={16} className={isTranslating ? "animate-spin" : ""} />
            <p className="text-black">
              {isTranslating ? "번역 중..." : (showTranslation ? "원본보기" : "번역하기")}
            </p>
          </button>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[300px] bg-gray-300" />
            <Skeleton className="h-4 w-[280px] bg-gray-300" />
            <Skeleton className="h-4 w-[250px] bg-gray-300" />
          </div>
        ) : (
          <div className="text-sm text-gray-800">
            {showTranslation ? translatedContent : content}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-end w-full p-4">
      <Card
        className="inline-block max-w-xs bg-blue-500 text-black shadow-md rounded-lg px-4 py-2"
        style={{ backgroundColor: "#F4F4F4", borderRadius: "40px" }}
      >
        <div className="text-right whitespace-pre-wrap text-sm">{content}</div>
      </Card>
    </div>
  );
}