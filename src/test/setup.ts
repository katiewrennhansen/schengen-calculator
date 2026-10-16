import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

vi.mock("framer-motion", async () => {
  const React = await import("react");

  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        return ({ children, ...props }: Record<string, unknown>) => {
          const safeProps = { ...props } as Record<string, unknown>;
          delete safeProps.layout;
          delete safeProps.initial;
          delete safeProps.animate;
          delete safeProps.exit;
          delete safeProps.transition;
          delete safeProps.layoutId;
          delete safeProps.whileHover;
          delete safeProps.whileTap;
          delete safeProps.drag;
          delete safeProps.dragConstraints;
          delete safeProps.variants;

          return React.createElement(tag, safeProps, children);
        };
      },
    },
  );

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

afterEach(() => {
  cleanup();
});
