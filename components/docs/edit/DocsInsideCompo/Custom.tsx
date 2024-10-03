import React, { useState } from 'react';
import { Trash2 } from "lucide-react";

interface CustomSectionItemProps {
  item: {
    id: string;
    content: string;
  };
  onContentUpdate: (value: string) => void;
  onDelete: () => void;
  renderEditorComponent: (
    content: string,
    onUpdate: (value: string) => void,
    className: string,
    placeholderText: string,
    defaultStyle: string | null,
    editorId: string
  ) => React.ReactNode;
}

const CustomSectionItem: React.FC<CustomSectionItemProps> = ({ 
  item, 
  onContentUpdate, 
  onDelete, 
  renderEditorComponent 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative group w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full">
        {renderEditorComponent(
          item.content,
          onContentUpdate,
          "customContent",
          "Untitled",
          null,
          `custom-content-${item.id}`
        )}
      </div>
      {isHovered && (
        <button 
          onClick={onDelete}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 p-1 text-red-500 rounded-full hover:text-red-600 transition-colors duration-200 pdf-exclude"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default CustomSectionItem;