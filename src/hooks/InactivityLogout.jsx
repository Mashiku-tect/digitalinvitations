// useInactivityLogout.js
import { useEffect, useRef } from "react";

export default function useInactivityLogout({
  timeout = 8 * 60 * 1000, // 8 minutes
  onLogout
}) {
  const timer = useRef(null);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onLogout();
    }, timeout);
  };

  const handleActivity = () => {
    resetTimer();
  };

  useEffect(() => {
    resetTimer();

    const events = ["mousemove", "keydown", "click", "scroll"];

    events.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      clearTimeout(timer.current);
    };
  }, []);
}
