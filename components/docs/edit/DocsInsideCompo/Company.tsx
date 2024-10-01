import { ReactNode, useState, useRef } from "react";
import { CirclePlus, Plus, Trash2 } from "lucide-react";

interface CompanyProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  addBulletPoint: () => void;
  tooltipText: any;
  onDelete: () => void;
}

export default function Company({ 
  leftContent, 
  rightContent, 
  addBulletPoint, 
  tooltipText, 
  onDelete 
}: CompanyProps) {
  const [isComponentHovered, setIsComponentHovered] = useState(false);
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    setIsComponentHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // 마우스가 삭제 버튼 위에 있지 않을 때만 hover 상태를 해제합니다.
    if (!deleteButtonRef.current?.contains(e.relatedTarget as Node)) {
      setIsComponentHovered(false);
    }
  };

  const showDeleteButton = isComponentHovered || isDeleteButtonHovered;

  return (
    <div 
      className="w-full flex justify-between relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showDeleteButton && (
        <button 
        ref={deleteButtonRef}
        onClick={onDelete}
        onMouseEnter={() => setIsDeleteButtonHovered(true)}
        onMouseLeave={() => setIsDeleteButtonHovered(false)}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 p-1 text-red-500 rounded-full hover:text-red-600 transition-colors duration-200 pdf-exclude"
      >
        <Trash2 className="w-3 h-3" />
      </button>
      )}
      <div className="flex flex-row gap-2 items-center">
        <div className="">
          {leftContent}
        </div>
        <div className="flex items-center tooltip pdf-exclude">
          <button onClick={addBulletPoint} className="flex items-center justify-center w-4 h-4 text-white bg-[#B8B8B8] rounded-full">
            <Plus className="w-3 h-3" />
          </button>
          <span className="tooltiptext">{tooltipText}</span>
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center">
        {rightContent}
      </div>
    </div>
  );
}