"use client";

import { useEffect, useState } from "react";

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function useTimeOfDayGreeting() {
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const updateGreeting = () =>
      setGreeting(getGreeting(new Date().getHours()));

    updateGreeting();
    const intervalId = window.setInterval(updateGreeting, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return greeting;
}
