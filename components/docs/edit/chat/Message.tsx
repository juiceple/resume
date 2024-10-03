import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Message as MessageType } from "ai";
import { Plus } from "lucide-react";

interface MessageProps {
  message: MessageType;
  isLast?: boolean;
  isLoading?: boolean;
  onAddToResume: (content: string) => void;
}

export default function Message({ message, isLast, isLoading, onAddToResume }: MessageProps) {
  const { role, content } = message;

  const handleAddToResume = () => {
    onAddToResume(content);
  };

  if (role === "assistant") {
    return (
      <div className="flex flex-col gap-3 p-4 bg-white rounded-lg shadow-md" style={{ backgroundColor: "#EDEDED" }}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleAddToResume}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
          >
            <Plus size={20} />
            <p className="text-black">Resume에 추가하기</p>
          </button>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[300px] bg-gray-300" />
            <Skeleton className="h-4 w-[280px] bg-gray-300" />
            <Skeleton className="h-4 w-[250px] bg-gray-300" />
          </div>
        ) : (
          <div className="text-sm text-gray-800">{content}</div>
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