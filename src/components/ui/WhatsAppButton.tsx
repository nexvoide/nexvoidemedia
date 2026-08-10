// components/ui/WhatsAppButton.tsx
import { useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

const BUBBLE_DISMISSED_KEY = 'nexvoide_whatsapp_bubble_dismissed';
/** Wait after page load before showing the bubble */
const POPUP_SHOW_DELAY_MS = 2_000;
/** How long the bubble stays visible once shown */
const POPUP_VISIBLE_MS = 8_000;

/** Official WhatsApp logomark (speech bubble + phone), white on brand green — path aligned with Meta / Simple Icons reference. */
function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      />
    </svg>
  );
}

export const WhatsAppButton = () => {
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const markBubbleDismissed = useCallback(() => {
    setBubbleOpen(false);
    try {
      sessionStorage.setItem(BUBBLE_DISMISSED_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout>;
    const scheduleShow = () => {
      showTimer = window.setTimeout(() => setBubbleOpen(true), POPUP_SHOW_DELAY_MS);
    };

    try {
      if (sessionStorage.getItem(BUBBLE_DISMISSED_KEY) === '1') return;
    } catch {
      scheduleShow();
      return () => clearTimeout(showTimer);
    }

    scheduleShow();
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!bubbleOpen) return;
    const id = window.setTimeout(markBubbleDismissed, POPUP_VISIBLE_MS);
    return () => window.clearTimeout(id);
  }, [bubbleOpen, markBubbleDismissed]);

  const dismissBubble = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markBubbleDismissed();
  };

  const phoneNumber = '923364558535';
  const message = "Hi! I'm interested in your video editing services.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-end gap-3 max-w-[calc(100vw-3rem)]"
      role="complementary"
      aria-label="WhatsApp quick contact"
    >
      {bubbleOpen && (
        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300 mb-1">
          <div className="relative rounded-2xl rounded-br-md bg-white px-4 py-3 pr-9 text-sm text-neutral-800 shadow-lg shadow-black/20 ring-1 ring-black/5 max-w-[220px] sm:max-w-[260px]">
            <p className="leading-snug">
              Get a reply in minutes,{' '}
              <span className="font-semibold text-[#25D366]">not days</span>.
            </p>
            <button
              type="button"
              onClick={dismissBubble}
              className="absolute top-2 right-2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div
            className="absolute -right-1.5 bottom-3 h-3 w-3 rotate-45 bg-white ring-1 ring-black/5"
            aria-hidden
          />
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0"
        aria-label="Chat on WhatsApp"
      >
        <motion.div
          className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.07, 1],
                  boxShadow: [
                    '0 10px 15px -3px rgba(37, 211, 102, 0.35)',
                    '0 14px 28px -4px rgba(37, 211, 102, 0.55)',
                    '0 10px 15px -3px rgba(37, 211, 102, 0.35)',
                  ],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
          }
          whileHover={reduceMotion ? undefined : { scale: 1.1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        >
          <WhatsAppLogo className="h-7 w-7" />
        </motion.div>
      </a>
    </div>
  );
};
