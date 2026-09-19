import { useEffect } from "react";

const APP_NAME = "Healthcare Scale Platform";

// Sets <title> to "Page · Healthcare Scale Platform"; falls back to the app name while data loads.
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
