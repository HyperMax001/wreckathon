// components/AdvancedVideoScrubber.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AdvancedVideoScrubberProps {
  videoSrc: string;
  className?: string;
  // Scroll mapping options
  scrollHeight?: string; // CSS height for scroll area (e.g., "300vh")
  startTrigger?: 'top' | 'center' | 'bottom'; // When to start scrubbing
  endTrigger?: 'top' | 'center' | 'bottom';   // When to finish scrubbing
  // Video options
  playbackRate?: number; // Speed multiplier for smoother scrubbing
  frameRate?: number;    // Target frame rate for updates
  // Callback functions
  onProgress?: (progress: number) => void;
  onVideoLoad?: (duration: number) => void;
}

export default function AdvancedVideoScrubber({
  videoSrc,
  className = '',
  scrollHeight = '30vh',
  startTrigger = 'bottom',
  endTrigger = 'top',
  playbackRate = 1,
  frameRate = 30,
  onProgress,
  onVideoLoad
}: AdvancedVideoScrubberProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastUpdateTime = useRef<number>(0);
  
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);

  // Throttled scroll handler for better performance
  const throttledUpdate = useCallback((callback: () => void) => {
    const now = Date.now();
    const frameInterval = 1000 / frameRate;
    
    if (now - lastUpdateTime.current >= frameInterval) {
      callback();
      lastUpdateTime.current = now;
    }
  }, [frameRate]);

  const getTriggerPosition = (trigger: string, rect: DOMRect, windowHeight: number) => {
    switch (trigger) {
      case 'top': return rect.top;
      case 'center': return rect.top + rect.height / 2 - windowHeight / 2;
      case 'bottom': return rect.bottom - windowHeight;
      default: return rect.bottom - windowHeight;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    const scrollArea = scrollAreaRef.current;
    
    if (!video || !container || !scrollArea) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      const duration = video.duration;
      setVideoDuration(duration);
      video.currentTime = 0;
      onVideoLoad?.(duration);
    };

    const handleScroll = () => {
      throttledUpdate(() => {
        if (!isVideoLoaded || videoDuration === 0) return;

        const rect = scrollArea.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate trigger positions
        const startPos = getTriggerPosition(startTrigger, rect, windowHeight);
        const endPos = getTriggerPosition(endTrigger, rect, windowHeight);
        
        // Calculate scroll progress
        let progress = 0;
        const totalDistance = Math.abs(startPos - endPos);
        
        if (totalDistance > 0) {
          if (startTrigger === 'bottom' && endTrigger === 'top') {
            // Standard top-to-bottom scroll
            if (startPos <= 0 && endPos >= 0) {
              progress = Math.abs(startPos) / totalDistance;
            } else if (endPos < 0) {
              progress = 1;
            }
          } else {
            // Custom trigger positions
            const currentPos = getTriggerPosition('center', rect, windowHeight);
            progress = Math.max(0, Math.min(1, 
              (Math.abs(currentPos - startPos)) / totalDistance
            ));
          }
        }

        progress = Math.max(0, Math.min(1, progress));
        setCurrentProgress(progress);
        setIsInView(progress > 0 && progress < 1);
        
        // Update video time with playback rate consideration
        const targetTime = progress * videoDuration * playbackRate;
        const clampedTime = Math.max(0, Math.min(videoDuration, targetTime));
        
        if (Math.abs(video.currentTime - clampedTime) > 0.05) {
          video.currentTime = clampedTime;
        }

        onProgress?.(progress);
      });
    };

    // Set up event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isVideoLoaded, videoDuration, startTrigger, endTrigger, playbackRate, onProgress, onVideoLoad, throttledUpdate]);

  return (
    <div ref={scrollAreaRef} style={{ height: scrollHeight }}>
      {/* Sticky video container */}
      <div className="sticky top-0 h-screen">
        <div 
          ref={containerRef}
          className={`relative overflow-hidden h-full ${className}`}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{ 
              pointerEvents: 'none',
              display: isVideoLoaded ? 'block' : 'none' 
            }}
          />
          
          {/* Loading state */}
          {!isVideoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg">Loading video experience...</p>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          {isVideoLoaded && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black bg-opacity-50 rounded-full p-2 backdrop-blur-sm">
                <div className="flex items-center space-x-3 text-white text-sm">
                  <span>Scroll Progress:</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-100 ease-out"
                      style={{ width: `${currentProgress * 100}%` }}
                    />
                  </div>
                  <span>{Math.round(currentProgress * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Development debug info */}
          {process.env.NODE_ENV === 'development' && isVideoLoaded && (
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded text-xs font-mono">
              <div>Duration: {videoDuration.toFixed(2)}s</div>
              <div>Current: {videoRef.current?.currentTime.toFixed(2)}s</div>
              <div>Progress: {(currentProgress * 100).toFixed(1)}%</div>
              <div>In View: {isInView ? 'Yes' : 'No'}</div>
              <div>Rate: {playbackRate}x</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}