'use client';

import ShinyText from './ShinyText';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FormPage() {
  const router = useRouter();
  const [question1, setQuestion1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [keyMapping, setKeyMapping] = useState<{[key: string]: string}>({});
  const [activeInput, setActiveInput] = useState<string>('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });

  // SPOTLIGHT RADIUS: Change this value to adjust the visible area around the mouse (in pixels)
  const SPOTLIGHT_RADIUS = 150;
  // Original keys that will be scrambled
  const originalKeys = [
    'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
    'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
    'z', 'x', 'c', 'v', 'b', 'n', 'm',
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    ' '
  ];

  // Fixed keyboard mapping - you can change the order by modifying the mappedKeys array
  const initializeKeyMapping = () => {
    // Define the specific order of keys (modify this array to change the mapping)
    const mappedKeys = [
      // Numbers (1-0) - Random swap of numbers only
      '7', // maps to '1'
      '3', // maps to '2'
      '9', // maps to '3'
      '1', // maps to '4'
      '8', // maps to '5'
      '0', // maps to '6'
      '2', // maps to '7'
      '5', // maps to '8'
      '4', // maps to '9'
      '6', // maps to '0'
      
      // Top row letters (q-p) - Maps to a-j horizontally
      'a', // maps to 'q'
      'b', // maps to 'w'
      'c', // maps to 'e'
      'd', // maps to 'r'
      'e', // maps to 't'
      'f', // maps to 'y'
      'g', // maps to 'u'
      'h', // maps to 'i'
      'i', // maps to 'o'
      'j', // maps to 'p'
      
      // Middle row letters (a-l) - Maps to k-s horizontally
      'k', // maps to 'a'
      'l', // maps to 's'
      'm', // maps to 'd'
      'n', // maps to 'f'
      'o', // maps to 'g'
      'p', // maps to 'h'
      'q', // maps to 'j'
      'r', // maps to 'k'
      's', // maps to 'l'
      
      // Bottom row letters (z-m) - Maps to t-z horizontally
      't', // maps to 'z'
      'u', // maps to 'x'
      'v', // maps to 'c'
      'w', // maps to 'v'
      'x', // maps to 'b'
      'y', // maps to 'n'
      'z', // maps to 'm'
      
      // Space
      ' '  // maps to ' ' (space stays the same)
    ];
    
    const mapping: {[key: string]: string} = {};
    originalKeys.forEach((key, index) => {
      mapping[key] = mappedKeys[index];
    });
    
    setKeyMapping(mapping);
  };

  // Generate random card position
  const generateRandomPosition = () => {
    const maxX = window.innerWidth - 450; // Card width buffer (reduced for smaller card)
    const maxY = window.innerHeight - 350; // Card height buffer (reduced for smaller card)
    setCardPosition({
      x: Math.random() * Math.max(maxX, 0),
      y: Math.random() * Math.max(maxY, 0)
    });
  };

  // Initialize on component mount
  useEffect(() => {
    initializeKeyMapping();
    generateRandomPosition();
  }, []);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (activeInput === '') return;
      
      e.preventDefault();
      const key = e.key.toLowerCase();
      
      if (key === 'backspace') {
        if (activeInput === 'question1') {
          setQuestion1(prev => prev.slice(0, -1));
        } else if (activeInput === 'question2') {
          setQuestion2(prev => prev.slice(0, -1));
        }
        return;
      }
      
      if (keyMapping[key]) {
        const mappedChar = keyMapping[key];
        if (activeInput === 'question1') {
          setQuestion1(prev => prev + mappedChar);
        } else if (activeInput === 'question2') {
          setQuestion2(prev => prev + mappedChar);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [keyMapping, activeInput]);

  const handleInputFocus = (inputName: string) => {
    setActiveInput(inputName);
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setActiveInput('');
    setIsInputFocused(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question1.trim() && question2.trim()) {
      router.push('/slideshow');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 min-h-screen p-8" style={{ backgroundColor: '#2a2a2a' }}>
        {/* Black overlay with spotlight effect */}
        {!isInputFocused && (
          <div 
            className="fixed inset-0 z-20 pointer-events-none transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle ${SPOTLIGHT_RADIUS}px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent 40%, rgba(0,0,0,0.95) 70%, rgba(0,0,0,0.98) 100%)`
            }}
          />
        )}
        {/* Form card with random positioning */}
        <div 
          className="absolute rounded-3xl shadow-2xl p-1 max-w-lg"
          style={{
            left: `${cardPosition.x}px`,
            top: `${cardPosition.y}px`,
            width: '450px',
            background: 'linear-gradient(45deg, #ff7f50, #ffa500, #ffd700, #ffff00)',
            boxShadow: '0 0 10px rgba(255, 165, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.2), 0 0 30px rgba(255, 255, 0, 0.1)'
          }}
        >
          <div 
            className="bg-gray-900 rounded-3xl p-6 w-full h-full"
            style={{ backgroundColor: '#2a2a2a' }}
          >
          <h1 className="text-3xl font-bold text-center mb-6 text-white">
            Most Important Day of Your Life
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-lg font-semibold mb-3 text-white">
                How often do you poop?
              </label>
              <input
                type="text"
                value={question1}
                onFocus={() => handleInputFocus('question1')}
                onBlur={handleInputBlur}
                className="w-full p-3 text-base border-2 border-gray-300 rounded-lg focus:border-gray-300 focus:outline-none bg-white text-gray-900"
                placeholder="Type Sincerely! Answer in a sentence"
                readOnly
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-3 text-white">
                Out of 10, how hard would you score your motion?
              </label>
              <input
                type="text"
                value={question2}
                onFocus={() => handleInputFocus('question2')}
                onBlur={handleInputBlur}
                className="w-full p-3 text-base border-2 border-gray-300 rounded-lg focus:border-gray-300 focus:outline-none bg-white text-gray-900"
                placeholder="Type Sincerely"
                readOnly
              />
            </div>

            <div 
              className="rounded-2xl p-0.5 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(45deg, #ff7f50, #ffa500, #ffd700, #ffff00)',
                boxShadow: '0 0 8px rgba(255, 165, 0, 0.3), 0 0 15px rgba(255, 215, 0, 0.2), 0 0 25px rgba(255, 255, 0, 0.1)'
              }}
            >
              <button
                type="submit"
                disabled={!question1.trim() || !question2.trim()}
                className="w-full disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 ease-out text-white text-base font-semibold py-2 px-4 rounded-2xl transform active:scale-95"
                style={{
                  backgroundColor: '#1a1a1a'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a2a2a';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
              >
                <ShinyText 
                  text="Submit" 
                  disabled={false} 
                  speed={2} 
                  className='text-white' 
                />
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}