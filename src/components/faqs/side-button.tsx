import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button"; 

interface SideButtonProps {
  label: string;
  isClicked: boolean;
  onClick: () => void; // Included the action prop from earlier
}

export default function SideButton({ label, isClicked, onClick }: SideButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={
        isClicked
          ? "w-full justify-between text-left px-4 py-6 bg-[#A6192E] hover:bg-[#A6192E] text-white rounded-md flex items-center text-sm font-medium shadow-sm"
          : "w-full justify-between text-left px-4 py-6 text-gray-600 hover:bg-gray-100 rounded-md flex items-center text-sm font-medium transition bg-transparent shadow-none"
      }
    >
      <span>{label}</span>
      {isClicked && <ChevronDown className="w-4 h-4 -rotate-90" />}
    </Button>
  );
}