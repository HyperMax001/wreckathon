'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SlideshowPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCardHovered, setIsCardHovered] = useState(false);

  // Sample images for the slideshow
  const slides = [
    {
      src: '/slide1.jpg',
      alt: 'Health and Wellness',
      title: 'Your Health Matters'
    },
    {
      src: '/slide2.jpg', 
      alt: 'Medical Analysis',
      title: 'Advanced Analysis'
    },
    {
      src: '/slide3.jpg',
      alt: 'Personalized Care',
      title: 'Personalized Solutions'
    }
  ];

  // Auto-advance slideshow every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleCardClick = () => {
    router.push('/final');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Slideshow Section */}
      <div className="relative h-screen w-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-6xl font-bold mb-4">{slide.title}</h2>
                <p className="text-xl opacity-80">Slide {index + 1} of {slides.length}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Service Card Section */}
      <div className="py-20 px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12 text-gray-800">Our Service</h2>
          
          <div className="flex justify-center">
            <div
              className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 shadow-lg cursor-pointer transition-all duration-300 transform ${
                isCardHovered ? 'scale-110 shadow-2xl' : 'scale-100'
              }`}
              onMouseEnter={() => setIsCardHovered(true)}
              onMouseLeave={() => setIsCardHovered(false)}
              onClick={handleCardClick}
              style={{ maxWidth: '500px' }}
            >
              <div className="text-6xl mb-6">🏥</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Health Analysis Service
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                We provide comprehensive health analysis based on your personal data. 
                Our advanced algorithms help you understand your health patterns and 
                provide personalized recommendations for better wellness.
              </p>
              <div className="mt-6">
                <span className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-semibold">
                  Learn More →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
