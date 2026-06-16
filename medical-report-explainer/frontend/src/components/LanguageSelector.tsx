import { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown } from "lucide-react";
import type { Language } from "../types/api";

const options: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
  { value: "both", label: "English + हिन्दी" },
];

export function LanguageSelector({ value, onChange }: { value: Language; onChange: (value: Language) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3.5 text-sm font-semibold hover:bg-muted shadow-soft transition-all"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Languages 
          className={`h-4.5 w-4.5 text-primary transition-transform duration-500 ${
            isOpen ? "rotate-12 scale-110" : "hover:rotate-12"
          }`} 
        />
        <span className="text-xs sm:text-sm">{activeOption.label}</span>
        <ChevronDown 
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 mt-2 w-44 origin-top-right rounded-xl border border-border bg-background p-1.5 shadow-xl transition-all duration-200 z-50 ${
          isOpen
            ? "visible scale-100 opacity-100 translate-y-0"
            : "invisible scale-95 opacity-0 -translate-y-2 pointer-events-none"
        }`}
        role="menu"
      >
        <div className="space-y-0.5">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all ${
                value === option.value
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              role="menuitem"
            >
              <span>{option.label}</span>
              {value === option.value && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
