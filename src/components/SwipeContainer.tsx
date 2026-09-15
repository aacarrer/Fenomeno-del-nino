import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeContainerProps {
  activeTab: number;
  totalTabs: number;
  onChangeTab: (newTab: number) => void;
  children: React.ReactNode[];
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 160 : -160,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 160 : -160,
    opacity: 0,
    scale: 0.98,
  }),
};

export const SwipeContainer: React.FC<SwipeContainerProps> = ({
  activeTab,
  totalTabs,
  onChangeTab,
  children,
}) => {
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const setTab = (newTab: number) => {
    if (newTab < 0 || newTab >= totalTabs || newTab === activeTab) return;
    setDirection(newTab > activeTab ? 1 : -1);
    onChangeTab(newTab);
  };

  const handlePrev = () => {
    if (activeTab > 0) setTab(activeTab - 1);
  };

  const handleNext = () => {
    if (activeTab < totalTabs - 1) setTab(activeTab + 1);
  };

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'ArrowRight' && activeTab < totalTabs - 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && activeTab > 0) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, totalTabs]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Only trigger if horizontal movement dominates and exceeds threshold
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0 && activeTab < totalTabs - 1) {
        // Swiped left -> Go to next
        handleNext();
      } else if (diffX < 0 && activeTab > 0) {
        // Swiped right -> Go to previous
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative select-none sm:select-auto w-full"
    >
      {/* Side Quick Navigation Floating Buttons for Desktop */}
      {activeTab > 0 && (
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Panel anterior"
          className="hidden xl:flex absolute -left-14 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-sky-50 shadow-md hover:shadow-lg transition-all items-center justify-center cursor-pointer group"
          title="Ver panel anterior (Swipe derecha)"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}

      {activeTab < totalTabs - 1 && (
        <button
          type="button"
          onClick={handleNext}
          aria-label="Siguiente panel"
          className="hidden xl:flex absolute -right-14 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-sky-50 shadow-md hover:shadow-lg transition-all items-center justify-center cursor-pointer group"
          title="Ver siguiente panel (Swipe izquierda)"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Animated Panel View */}
      <div className="overflow-hidden min-h-[480px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50 && activeTab < totalTabs - 1) {
                handleNext();
              } else if (info.offset.x > 50 && activeTab > 0) {
                handlePrev();
              }
            }}
            className="w-full space-y-8"
          >
            {children[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
