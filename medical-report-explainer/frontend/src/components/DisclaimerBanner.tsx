import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

export function DisclaimerBanner() {
  const [isOpen, setIsOpen] = useState(true);
  const [duration, setDuration] = useState(10); // 10 seconds initially

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setIsOpen(false);
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [isOpen, duration]);

  const handleIconClick = () => {
    setDuration(6); // 6 seconds on subsequent clicks
    setIsOpen(true);
  };

  return (
    <>
      {/* Disclaimer Banner Area */}
      <div
        className={`relative overflow-hidden border-b border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/90 dark:text-amber-100 transition-all duration-700 ease-in-out ${
          isOpen ? "max-h-40 opacity-100 py-3" : "max-h-0 opacity-0 py-0 border-none pointer-events-none"
        }`}
      >
        <div className="mx-auto flex max-w-7xl gap-3 px-4 text-xs leading-5 sm:text-sm sm:leading-6">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold tracking-wide">
              Educational Platform Disclaimer / शैक्षिक डिस्क्लेमर
            </p>
            <p className="mt-0.5 opacity-90">
              This application provides educational information only and is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <p className="opacity-80 mt-0.5">
              यह एप्लिकेशन केवल शैक्षिक जानकारी प्रदान करता है और यह पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है।
            </p>
          </div>
        </div>

        {/* Shrunk countdown progress bar indicator at the bottom */}
        {isOpen && (
          <div
            key={`${isOpen}-${duration}`} // Forces re-render to trigger keyframe transition
            className="absolute bottom-0 left-0 h-[3px] bg-amber-400 dark:bg-amber-600"
            style={{
              animation: `shrink-timer ${duration}s linear forwards`,
            }}
          />
        )}
      </div>

      {/* Floating interactive icon button (appears only when compressed) */}
      <button
        type="button"
        onClick={handleIconClick}
        className={`fixed right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/20 transition-all duration-500 ease-out hover:bg-amber-600 hover:scale-110 active:scale-95 ${
          isOpen
            ? "pointer-events-none scale-50 opacity-0 -translate-y-4 top-16"
            : "scale-100 opacity-100 translate-y-0 cursor-pointer top-20"
        }`}
        title="View Educational Disclaimer"
        aria-label="View Educational Disclaimer"
      >
        <div className="relative">
          <ShieldAlert className="h-6 w-6 animate-bounce" />
          <span className="absolute -right-1 -top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
        </div>
      </button>

      {/* Embedded style tag for standard progress keyframes */}
      <style>{`
        @keyframes shrink-timer {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>
  );
}
