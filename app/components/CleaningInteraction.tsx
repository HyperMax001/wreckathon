'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

interface CleaningInteractionProps {
  isActive: boolean;
  onComplete?: () => void;
}

export default function CleaningInteraction({ isActive, onComplete }: CleaningInteractionProps) {
  const [isShowerActive, setIsShowerActive] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastSwipeTime = useRef<number>(0);

  const maxSwipes = 12; // Total swipes needed to clean
  const poopOpacity = Math.max(0, 1 - swipeCount / maxSwipes);

  useEffect(() => {
    if (isActive) {
      // Delay shower head appearance
      const timer = setTimeout(() => setIsShowerActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
    if (!containerRef.current) return;

    const now = Date.now();
    if (now - lastSwipeTime.current > 150) {
      setSwipeCount(prev => {
        const newCount = Math.min(prev + 1, maxSwipes);

        console.log(
          `Swipe ${newCount}/${maxSwipes}, Poop opacity: ${Math.max(
            0,
            1 - newCount / maxSwipes
          )}`
        );

        if (newCount >= maxSwipes && !showSuccess) {
          setShowSuccess(true);
          setTimeout(() => onComplete?.(), 1500);
        }

        return newCount;
      });
      lastSwipeTime.current = now;
    }
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-50">
      {/* Poop overlay */}
      <div
        ref={containerRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/poop-emoji.png)', // Your poop image
          backgroundSize: '400px 400px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '60% 70%',
          opacity: poopOpacity,
          transition: 'opacity 0.3s ease-out'
        }}
      />

      {/* Draggable shower head */}
      {isShowerActive && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.2}
          dragConstraints={containerRef}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          onDrag={handleDrag}
          className="absolute z-60 cursor-grab active:cursor-grabbing"
          style={{
            right: '5%',
            top: '20%'
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20
          }}
          whileDrag={{
            scale: 1.3,
            rotate: 15,
            zIndex: 70
          }}
        >
          <div className="relative">
            {/* Shower head */}
            <div
              className="w-32 h-32 bg-gray-300 rounded-full border-4 border-gray-400 flex items-center justify-center text-4xl shadow-lg"
              style={{
                background: 'linear-gradient(145deg, #e6e6e6, #c0c0c0)',
                boxShadow: isDragging
                  ? '0 0 25px rgba(0,150,255,0.6)'
                  : '0 6px 12px rgba(0,0,0,0.4)'
              }}
            >
              🚿
            </div>
          </div>
        </motion.div>
      )}

      {/* Success animation */}
      {showSuccess && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-70"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div
            className="rounded-3xl p-8 text-center border-2"
            style={{
              background: 'rgba(42, 42, 42, 0.9)',
              border: '2px solid',
              borderImage:
                'linear-gradient(45deg, #ff7f50, #ffa500, #ffd700, #ffff00) 1',
              boxShadow:
                '0 0 20px rgba(255, 165, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.3)'
            }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">Order Placed!</h1>
            <h2 className="text-2xl font-bold text-white mb-4">
              You suck at washing poop, as we saw
            </h2>
            <p className="text-lg text-white opacity-90">
              We will come surely to wash yours
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
