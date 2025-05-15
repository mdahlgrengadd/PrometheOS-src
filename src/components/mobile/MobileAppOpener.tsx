import { useEffect } from "react";

import { getOpenAppsFromUrl } from "@/utils/url";

interface MobileAppOpenerProps {
  setActiveApp: (appId: string | null) => void;
}

/**
 * Component that opens the first app from URL parameters in mobile view
 */
const MobileAppOpener = ({ setActiveApp }: MobileAppOpenerProps) => {
  useEffect(() => {
    // Get apps to open from URL query params
    const appsToOpen = getOpenAppsFromUrl();

    // For mobile view, only open the first app in the list (if any)
    if (appsToOpen.length > 0) {
      const firstAppId = appsToOpen[0];
      setActiveApp(firstAppId);
    }

    // Only run once on initial mount
  }, []);

  return null;
};

export default MobileAppOpener;
