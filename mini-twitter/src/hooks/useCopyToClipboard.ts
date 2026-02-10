import { useCallback, useEffect, useRef, useState } from "react";

export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExistingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearExistingTimeout();
    };
  }, [clearExistingTimeout]);

  const copy = useCallback(
    async (text: string) => {
      clearExistingTimeout();
      try {
        if (!navigator?.clipboard?.writeText) {
          return false;
        }
        await navigator.clipboard.writeText(text);
        setCopied(true);
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
          timeoutRef.current = null;
        }, resetDelay);
        return true;
      } catch {
        return false;
      }
    },
    [clearExistingTimeout, resetDelay],
  );

  return { copied, copy };
}
