import { ReactNode } from 'react';
import {
    FcCommandLine, FcDocument, FcFolder, FcGlobe, FcInternal, FcMultipleDevices, FcMusic,
    FcOpenedFolder, FcPicture, FcPrint, FcSearch, FcServiceMark, FcSettings, FcViewDetails
} from 'react-icons/fc';

interface StartMenuItemProps {
  icon?: string;
  customIcon?: ReactNode;
  label?: string;
  intent?: string;
  program?: string;
  type: "intent" | "favorite" | "my" | "shortcut";
  hasSubmenu?: boolean;
  onClick?: () => void;
}

const StartMenuItem = ({
  icon,
  customIcon,
  label,
  intent,
  program,
  type,
  hasSubmenu = false,
  onClick,
}: StartMenuItemProps) => {
  const isIntentItem = type === "intent";
  const isMyItem = type === "my";

  // Map labels to appropriate FC icons
  const getIconComponent = (label?: string, type?: string) => {
    if (customIcon) return customIcon;

    if (icon) {
      return (
        <div
          className={`${
            type === "shortcut" ? "w-6 h-6" : "w-8 h-8"
          } bg-contain bg-center bg-no-repeat`}
          style={{ backgroundImage: `url(${icon})` }}
        />
      );
    }

    // Use appropriate icons based on the label or type
    switch (label) {
      case "My Documents":
        return (
          <FcDocument
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
      case "My Recent Documents":
        return (
          <FcOpenedFolder
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
      case "My Pictures":
        return (
          <FcPicture
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
      case "My Music":
        return (
          <FcMusic
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
      case "My Computer":
        return (
          <FcMultipleDevices
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
      case "My Network Places":
        return (
          <FcGlobe
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
      case "Control Panel":
        return (
          <FcSettings
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
      case "Printers and Faxes":
        return (
          <FcPrint
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
      case "Help and Support":
        return (
          <FcServiceMark
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
      case "Search":
        return (
          <FcSearch
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
      case "Run...":
        return (
          <FcCommandLine
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
      case "Notepad":
        return (
          <FcViewDetails
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
      default:
        if (intent === "Internet") {
          return (
            <FcGlobe
              className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
            />
          );
        } else if (intent === "E-mail") {
          return (
            <FcInternal
              className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
            />
          );
        }
        return (
          <FcFolder
            className={`${type === "shortcut" ? "w-6 h-6" : "w-8 h-8"}`}
          />
        );
    }
  };

  return (
    <div
      className={`flex items-center p-1 text-xs hover:bg-winxp-medium-blue hover:text-white cursor-pointer rounded-sm ${
        hasSubmenu ? "justify-between" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        {getIconComponent(label, type)}

        <div className="ml-1">
          {isIntentItem ? (
            <>
              <div className="font-bold text-winxp-menu-text-dark hover:text-white">
                {intent}
              </div>
              <div className="text-winxp-menu-text-gray hover:text-white">
                {program}
              </div>
            </>
          ) : (
            <div
              className={`${isMyItem ? "font-bold" : ""} ${
                type === "shortcut"
                  ? "text-[10px] text-winxp-menu-text"
                  : "text-winxp-menu-text-dark"
              }`}
            >
              {label}
            </div>
          )}
        </div>
      </div>

      {hasSubmenu && (
        <div
          className="w-4 h-4 bg-contain bg-no-repeat bg-center"
          style={{ backgroundImage: "url('/images/arrow-right.ico')" }}
        ></div>
      )}
    </div>
  );
};

export default StartMenuItem;
