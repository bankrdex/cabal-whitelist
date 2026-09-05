import { useEffect, useState } from "react";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hover, setHover] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.body.classList.add("custom-cursor");

    const onMove = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement | null;
      const interactive = Boolean(
        target?.closest("a, button, input, [role='button'], label"),
      );
      setHover(interactive);
    };

    window.addEventListener("pointermove", onMove);
    return () => {
      document.body.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed z-50 size-2.5 rounded-full bg-primary transition-[width,height,box-shadow] duration-150"
        style={{
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
          width: hover ? 13 : 9,
          height: hover ? 13 : 9,
          boxShadow: hover
            ? "0 0 8px var(--color-primary), 0 0 20px color-mix(in oklab, var(--color-primary) 70%, transparent)"
            : "0 0 6px var(--color-primary)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed z-50 rounded-full bg-primary/10 transition-[width,height] duration-200"
        style={{
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
          width: hover ? 48 : 34,
          height: hover ? 48 : 34,
        }}
      />
    </>
  );
}
