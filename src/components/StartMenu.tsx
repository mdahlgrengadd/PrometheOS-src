import './Taskbar.css';

import React from 'react';
import {
    FcCommandLine, FcDocument, FcFolder, FcGlobe, FcHome, FcInternal, FcInvite, FcMultipleDevices,
    FcMusic, FcOpenedFolder, FcPicture, FcPrint, FcSearch, FcServiceMark, FcSettings, FcViewDetails
} from 'react-icons/fc';

import { usePlugins } from '../plugins/PluginContext';
import StartMenuItem from './StartMenuItem';

interface StartMenuProps {
  isOpen: boolean;
}

const StartMenu = ({ isOpen }: StartMenuProps) => {
  const { openWindow } = usePlugins();
  if (!isOpen) return null;

  return (
    <div className="taskbar-scope">
      <div className="absolute bottom-full left-0 w-[380px] h-[550px] bg-winxp-light-blue rounded-t-md shadow-lg z-[11000] overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center h-[65px] px-2 py-2 bg-gradient-to-b from-winxp-medium-blue to-winxp-light-blue shadow-inner">
          <div className="bg-white rounded p-0.5 h-[52px] shadow-md">
            <img
              src={import.meta.env.BASE_URL + "/images/winxp-profile.png"}
              alt="User"
              className="h-full rounded"
            />
          </div>
          <h1 className="text-white text-lg ml-2 drop-shadow-sm">
            B.J. Blaskowicz
          </h1>
        </div>

        {/* Body */}
        <div className="flex h-[calc(100%-65px-43px)] bg-white border border-winxp-light-blue mx-px relative">
          {/* Left Side - Favorites */}
          <div className="flex flex-col w-1/2 h-full p-2">
            {/* Internet */}
            <StartMenuItem
              customIcon={<FcGlobe className="w-8 h-8" />}
              intent="Internet"
              program="Internet Explorer"
              type="intent"
              onClick={() => openWindow("browser")}
            />

            {/* Email */}
            <StartMenuItem
              customIcon={<FcInvite className="w-8 h-8" />}
              intent="E-mail"
              program="Outlook Express"
              type="intent"
              onClick={() => openWindow("messenger")}
            />

            <div className="my-1 h-px bg-gradient-to-r from-white via-gray-300 to-white" />

            {/* Notepad */}
            <StartMenuItem
              customIcon={<FcViewDetails className="w-8 h-8" />}
              label="Notepad"
              type="favorite"
              onClick={() => openWindow("notepad")}
            />

            <div className="mt-auto">
              <div className="h-px bg-gradient-to-r from-white via-gray-300 to-white mb-1" />
              <div className="flex items-center justify-between font-bold text-winxp-menu-text-dark text-xs p-1 hover:bg-winxp-medium-blue hover:text-white cursor-pointer">
                <span>All Programs</span>
                <div
                  className="w-4 h-4 bg-contain bg-no-repeat bg-center"
                  style={{ backgroundImage: "url('/images/arrow-right.ico')" }}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Shortcuts */}
          <div className="flex flex-col w-1/2 h-full p-2 bg-winxp-menu-blue border-l border-winxp-menu-border">
            {/* My Documents */}
            <StartMenuItem
              customIcon={<FcDocument className="w-8 h-8" />}
              label="My Documents"
              type="my"
              onClick={() => openWindow("file-explorer")}
            />

            {/* My Recent Documents */}
            <StartMenuItem
              customIcon={<FcOpenedFolder className="w-8 h-8" />}
              label="My Recent Documents"
              type="my"
              hasSubmenu={true}
            />

            {/* My Pictures */}
            <StartMenuItem
              customIcon={<FcPicture className="w-8 h-8" />}
              label="My Pictures"
              type="my"
            />

            {/* My Music */}
            <StartMenuItem
              customIcon={<FcMusic className="w-8 h-8" />}
              label="My Music"
              type="my"
            />

            {/* My Computer */}
            <StartMenuItem
              customIcon={<FcMultipleDevices className="w-8 h-8" />}
              label="My Computer"
              type="my"
            />

            {/* Network Places */}
            <StartMenuItem
              customIcon={<FcGlobe className="w-8 h-8" />}
              label="My Network Places"
              type="my"
            />

            <div className="my-1 h-px bg-gradient-to-r from-transparent via-[#aebad6] to-transparent" />

            {/* Control Panel */}
            <StartMenuItem
              customIcon={<FcSettings className="w-6 h-6" />}
              label="Control Panel"
              type="shortcut"
              onClick={() => openWindow("settings")}
            />

            {/* Printers */}
            <StartMenuItem
              customIcon={<FcPrint className="w-6 h-6" />}
              label="Printers and Faxes"
              type="shortcut"
            />

            <div className="my-1 h-px bg-gradient-to-r from-transparent via-[#aebad6] to-transparent" />

            {/* Help */}
            <StartMenuItem
              customIcon={<FcServiceMark className="w-6 h-6" />}
              label="Help and Support"
              type="shortcut"
            />

            {/* Search */}
            <StartMenuItem
              customIcon={<FcSearch className="w-6 h-6" />}
              label="Search"
              type="shortcut"
              hasSubmenu={true}
            />

            {/* Run */}
            <StartMenuItem
              customIcon={<FcCommandLine className="w-6 h-6" />}
              label="Run..."
              type="shortcut"
              onClick={() => openWindow("run")}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="h-[43px] bg-gradient-to-t from-winxp-medium-blue to-winxp-light-blue shadow-inner" />
      </div>
    </div>
  );
};

export default StartMenu;
