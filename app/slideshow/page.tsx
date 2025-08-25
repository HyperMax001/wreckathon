'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import CleaningInteraction from '../components/CleaningInteraction';

export default function VideoScrubberPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastUpdateTime = useRef<number>(0);
  
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [showCleaning, setShowCleaning] = useState(false);

  // Configuration
  const scrollHeight = '500vh'; // 5x viewport height for more gradual scrubbing
  const frameRate = 30; // Reduced for better performance
  const playbackRate = 1; // Normal playback speed

  // Throttled scroll handler for better performance
  const throttledUpdate = useCallback((callback: () => void) => {
    const now = Date.now();
    const frameInterval = 1000 / frameRate;
    
    if (now - lastUpdateTime.current >= frameInterval) {
      callback();
      lastUpdateTime.current = now;
    }
  }, [frameRate]);

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
    };

    const handleScroll = () => {
      throttledUpdate(() => {
        if (!isVideoLoaded || videoDuration === 0) return;

        // const rect = scrollArea.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate scroll progress with better sensitivity
        let progress = 0;
        
        // More gradual scroll calculation
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollAreaHeight = scrollArea.offsetHeight;
        const maxScroll = scrollAreaHeight - windowHeight;
        
        if (maxScroll > 0) {
          progress = Math.min(scrollTop / maxScroll, 1);
        }

        progress = Math.max(0, Math.min(1, progress));
        setCurrentProgress(progress);
        setIsInView(progress > 0 && progress < 1);
        
        // Trigger cleaning interaction when video reaches the end
        if (progress >= 0.98 && !showCleaning) {
          setShowCleaning(true);
        }
        
        // Update video time
        const targetTime = progress * videoDuration * playbackRate;
        const clampedTime = Math.max(0, Math.min(videoDuration, targetTime));
        
        if (Math.abs(video.currentTime - clampedTime) > 0.1) {
          video.currentTime = clampedTime;
        }
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
  }, [isVideoLoaded, videoDuration, playbackRate, throttledUpdate]);

  return (
    <div className="bg-black">
      {/* Scroll area that creates the scrubbing effect */}
      <div ref={scrollAreaRef} style={{ height: scrollHeight }}>
        {/* Sticky video container */}
        <div className="sticky top-0 h-screen">
          <div 
            ref={containerRef}
            className="relative overflow-hidden h-full w-full"
          >
            <video
              ref={videoRef}
              src="/01.mp4" // Video from public folder
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
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto mb-4"></div>
                  <p className="text-lg">Loading video experience...</p>
                </div>
              </div>
            )}






            {/* Cleaning Interaction Component */}
            <CleaningInteraction 
              isActive={showCleaning} 
              onComplete={() => {
                console.log('Cleaning completed!');
                // You can add navigation or other completion logic here
              }} 
            />
          </div>
        </div>
      </div>

    </div>
  );
}
