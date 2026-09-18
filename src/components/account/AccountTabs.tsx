"use client";

import { type KeyboardEvent, type ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Tab = {
  id: string;
  label: string;
  panel: ReactNode;
};

type AccountTabsProps = {
  tabs: Tab[];
};

// Panels come rendered from the server and are only hidden, so switching tabs costs no request and keeps form input
export function AccountTabs({ tabs }: AccountTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0].id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Arrow keys move between tabs, as the WAI-ARIA tabs pattern expects: Tab alone then goes straight to the panel
  function handleKeyDown(event: KeyboardEvent, index: number) {
    const lastIndex = tabs.length - 1;
    const nextIndex = {
      ArrowRight: index === lastIndex ? 0 : index + 1,
      ArrowLeft: index === 0 ? lastIndex : index - 1,
      Home: 0,
      End: lastIndex,
    }[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    setActiveId(tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Espace personnel" className="flex gap-8 border-b">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`onglet-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panneau-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "-mb-px border-b-2 pb-4 font-display text-lead transition-colors",
                isActive ? "border-ink text-ink" : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panneau-${tab.id}`}
          aria-labelledby={`onglet-${tab.id}`}
          hidden={tab.id !== activeId}
          tabIndex={0}
          className="pt-12 focus-visible:outline-offset-8"
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
