import { useState, useCallback, useRef } from "react";

export function useCapsLock() {
  const [capsLock, setCapsLock] = useState(false);
  const upperCount = useRef(0);

  const checkCapsLock = useCallback((text: string, prevText: string) => {
    if (text.length <= prevText.length) {
      if (text.length === 0) {
        upperCount.current = 0;
        setCapsLock(false);
      }
      return;
    }

    const newChar = text[text.length - 1];
    if (!newChar) return;

    const isLetter = /[a-zA-Z]/.test(newChar);
    if (!isLetter) return;

    const isUpper = newChar === newChar.toUpperCase();

    if (isUpper) {
      upperCount.current += 1;
      if (upperCount.current >= 2) {
        setCapsLock(true);
      }
    } else {
      upperCount.current = 0;
      setCapsLock(false);
    }
  }, []);

  return { capsLock, checkCapsLock };
}
