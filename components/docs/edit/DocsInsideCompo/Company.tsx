import { ReactNode } from "react";
import { CirclePlus } from "lucide-react";

interface CompanyProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  addBulletPoint: () => void;
  tooltipText: any;
}

export default function Company({ leftContent, rightContent, addBulletPoint, tooltipText }: CompanyProps) {
  return (
    <div className="w-full flex justify-between">
      <div className="flex flex-row gap-2 items-center">
        {/* leftContent를 자식으로 렌더링 */}
        <div className="">
          {leftContent}
        </div>
        <div className="flex items-center tooltip pdf-exclude">
          <button onClick={addBulletPoint} className=" flex items-center justify-between">
            <CirclePlus className="w-4 h-4" />
          </button>
      <span className="tooltiptext">{tooltipText}</span>
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center">
        {/* rightContent를 자식으로 렌더링 */}
        {rightContent}
      </div>
    </div>
  );
}
