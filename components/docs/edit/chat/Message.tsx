import { Card, CardHeader } from "@/components/ui/card";
import { Message as MessageType } from "ai";
import { Bot, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Message({ 
  message, 
  onAddToResume, 
  isLast 
}: { 
  message: MessageType, 
  onAddToResume: (content: string) => void,
  isLast?: boolean 
}) {
  const { role, content } = message;

  if (role === "assistant") {
    return (
      <div className="flex flex-col gap-3 p-4 bg-white rounded-lg shadow-md" style={{backgroundColor : "#EDEDED"}}>
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => onAddToResume(content)}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
          >
            <Plus size={20} />
            <p className="text-black">Resume에 추가하기</p>
          </button>
          {isLast && (
            <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold" >
              596.2
            </div>
          )}
        </div>
        <div className="text-sm text-gray-800">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end w-full p-4">
      <Card className="inline-block max-w-xs bg-blue-500 text-black shadow-md rounded-lg px-4 py-2" style={{backgroundColor : "#F4F4F4",borderRadius:"40px"}}>
        <div className="text-right whitespace-pre-wrap text-sm">
          {content}
        </div>
      </Card>
    </div>
  );
}