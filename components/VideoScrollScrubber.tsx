// components/VideoScrollScrubber.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoScrollScrubberProps {
  videoSrc: string;
  className?: string;
  scrollContainer?: HTMLElement | Window;
  startOffset?: number; // Percentage of viewport height to start scrubbing
  endOffset?: number;   // Percentage of viewport height to end scrubbing
}

export default function VideoScrollScrubber({ 
  videoSrc, 
  className = '',
  scrollContainer,
  startOffset = 0,
  endOffset = 100 
}: VideoScrollScrubberProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (!video || !container) return;

    // Handle video loading
    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      setVideoDuration(video.duration);
      video.currentTime = 0; // Start at beginning
    };

    const handleScroll = () => {
      if (!isVideoLoaded || videoDuration === 0) return;

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress based on element position
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Define when scrubbing starts and ends
      const startPoint = windowHeight - (windowHeight * startOffset / 100);
      const endPoint = 0 - (elementHeight * endOffset / 100);
      
      // Calculate scroll progress (0 to 1)
      let scrollProgress = 0;
      
      if (elementTop <= startPoint && elementTop >= endPoint) {
        scrollProgress = (startPoint - elementTop) / (startPoint - endPoint);
        scrollProgress = Math.max(0, Math.min(1, scrollProgress));
      } else if (elementTop < endPoint) {
        scrollProgress = 1;
      }

      // Map scroll progress to video time
      const targetTime = scrollProgress * videoDuration;
      
      // Update video current time
      if (Math.abs(video.currentTime - targetTime) > 0.1) {
        video.currentTime = targetTime;
      }
    };

    // Set up event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    
    const scrollTarget = scrollContainer || window;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    scrollTarget.addEventListener('resize', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      scrollTarget.removeEventListener('scroll', handleScroll);
      scrollTarget.removeEventListener('resize', handleScroll);
    };
  }, [isVideoLoaded, videoDuration, scrollContainer, startOffset, endOffset]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
        style={{ 
          pointerEvents: 'none',
          display: isVideoLoaded ? 'block' : 'none' 
        }}
      />
      
      {/* Loading indicator */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && isVideoLoaded && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
          <div>Duration: {videoDuration.toFixed(2)}s</div>
          <div>Current: {videoRef.current?.currentTime.toFixed(2)}s</div>
        </div>
      )}
    </div>
  );
}