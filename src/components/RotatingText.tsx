"use client";

import { useEffect, useState } from "react";

// Cycles through words (the live hero rotates "Find the best <profession> near
// you"). Simple cross-fade; respects prefers-reduced-motion implicitly by being
// a slow swap.
export function RotatingText({
  words,
  className,
}: {
  words: string[];
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const fade = setInterval(() => setShow(false), 2400);
    return () => clearInterval(fade);
  }, []);

  useEffect(() => {
    if (show) return;
    const t = setTimeout(() => {
      setI((x) => (x + 1) % words.length);
      setShow(true);
    }, 250);
    return () => clearTimeout(t);
  }, [show, words.length]);

  return (
    <span
      className={`inline-block transition-opacity duration-200 ${show ? "opacity-100" : "opacity-0"} ${className ?? ""}`}
    >
      {words[i]}
    </span>
  );
}
