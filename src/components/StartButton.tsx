
import { FcStart } from "react-icons/fc";

interface StartButtonProps {
  isActive: boolean;
  onClick: () => void;
}

const StartButton = ({ isActive, onClick }: StartButtonProps) => {
  return (
    <button 
      className={`
        relative inline-flex items-center font-italic text-white text-lg px-6 h-full rounded-r-lg -ml-1
        transform -skew-x-3
        ${isActive 
          ? 'shadow-inner bg-gradient-to-r from-winxp-start-green to-winxp-start-green' 
          : 'shadow-[0px_1px_2px_rgba(0,0,0,0.2)_inset] bg-gradient-to-b from-[#67c15f] via-[#4cb749] to-[#37a333]'
        }
      `}
      style={{
        textShadow: '1px 1px 1px rgba(0,0,0,0.3)',
        boxShadow: isActive 
          ? 'inset 0 0 3px 1px rgba(0,0,0,0.3)' 
          : 'inset 0 1px 0 0 #8adf83, inset 0 -1px 0 0 #256e1f'
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
