import { type RefObject, useEffect } from "react";

export function useScroll(
  ref: RefObject<HTMLElement | null>,
  callbacks: {
    onBottomReached?: () => void;
    onScroll?: () => void;
    onTopReached?: () => void;
  },
) {
  useEffect(() => {
    const container = ref.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      callbacks.onScroll?.();
      const { clientHeight, scrollHeight, scrollTop } = container;
      if (scrollTop === clientHeight - scrollHeight)
        callbacks.onBottomReached?.();

      if (scrollTop === 0) callbacks.onTopReached?.();
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [callbacks, ref.current]);
}
