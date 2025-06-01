import { type ComponentProps, useEffect, useState } from "react";

import { cn } from "@/lib/utils.ts";

export function EllipsisLoader({
  className,
  ...props
}: ComponentProps<"span">) {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : "."));
    }, 500); //

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <span className={cn("font-mono", className)} {...props}>
      {dots}
    </span>
  );
}