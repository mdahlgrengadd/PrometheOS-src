import { FcStart } from "react-icons/fc";

import { useTheme } from "@/lib/ThemeProvider";

interface StartButtonProps {
  isActive: boolean;
  onClick: () => void;
}

const StartButton = ({ isActive, onClick }: StartButtonProps) => {
  const { theme } = useTheme();
  const isWin7 = theme === "win7";
  const isBeOS = theme === "beos";
  // Use CSS variables for background and shadow
  const background = isActive
    ? "var(--start-btn-active-bg)"
    : "var(--start-btn-bg)";
  const boxShadow = isActive
    ? "var(--start-btn-active-shadow)"
    : "var(--start-btn-shadow)";

  // Conditional text color and shadow for BeOS theme
  const textColor = isBeOS ? "text-black" : "text-white";
  const textShadow = isBeOS ? "none" : "1px 1px 1px rgba(0,0,0,0.3)";

  return (
    <button
      className={`relative inline-flex items-center font-italic ${textColor} text-lg px-6 ${
        isWin7 ? "h-full" : "py-1"
      } rounded-r-lg -ml-1 transform -skew-x-3`}
      style={{
        background,
        boxShadow,
        textShadow,
      }}
      onClick={onClick}
    >
      <span className="transform skew-x-3 flex items-center">
        <FcStart className="w-5 h-5 mr-2 drop-shadow-sm" />
        <span className="drop-shadow-sm">start</span>
      </span>
    </button>
  );
};

export default StartButton;
