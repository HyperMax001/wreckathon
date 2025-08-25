'use client';

import ShinyText from './ShinyText';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function FormPage() {
  const router = useRouter();
  const [question1, setQuestion1] = useState('');
  const [question3, setQuestion3] = useState('');
  const [question2, setQuestion2] = useState('');
  const [keyMapping, setKeyMapping] = useState<{ [key: string]: string }>({});
  const [activeInput, setActiveInput] = useState<string>('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });

  const SPOTLIGHT_RADIUS = 150;

  // Move originalKeys outside component or make it static
  const originalKeys = [
    'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
    'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
    'z', 'x', 'c', 'v', 'b', 'n', 'm',
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    ' '
  ];

  // useCallback with empty dependency array since originalKeys is now stable
  const initializeKeyMapping = useCallback(() => {
    const mappedKeys = [
      '7', '3', '9', '1', '8', '0', '2', '5', '4', '6',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
      'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
      't', 'u', 'v', 'w', 'x', 'y', 'z',
      ' '
    ];

    const mapping: { [key: string]: string } = {};
    originalKeys.forEach((key, index) => {
      mapping[key] = mappedKeys[index];
    });

    setKeyMapping(mapping);
  }, []); // Empty dependency array

  const generateRandomPosition = useCallback(() => {
    const maxX = window.innerWidth - 450;
    const maxY = window.innerHeight - 350;
    setCardPosition({
      x: Math.random() * Math.max(maxX, 0),
      y: Math.random() * Math.max(maxY, 0)
    });
  }, []);

  // Separate useEffect for initialization (runs only once)
  useEffect(() => {
    initializeKeyMapping();
    generateRandomPosition();
  }, []); // Empty dependency array - runs only once on mount

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        } else if (activeInput === 'question3') {
          setQuestion3(prev => prev.slice(0, -1));
        }
        return;
      }

      if (keyMapping[key]) {
        const mappedChar = keyMapping[key];
        if (activeInput === 'question1') {
          setQuestion1(prev => prev + mappedChar);
        } else if (activeInput === 'question2') {
          setQuestion2(prev => prev + mappedChar);
        } else if (activeInput === 'question3') {
          setQuestion3(prev => prev + mappedChar);
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
      <div className="relative z-10 min-h-screen p-8" style={{ backgroundColor: '#2a2a2a' }}>
        {!isInputFocused && (
          <div
            className="fixed inset-0 z-20 pointer-events-none transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle ${SPOTLIGHT_RADIUS}px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent 40%, rgba(0,0,0,0.95) 70%, rgba(0,0,0,0.98) 100%)`
            }}
          />
        )}

        <div
          className="absolute rounded-3xl shadow-2xl p-1 max-w-lg"
          style={{
            left: `${cardPosition.x}px`,
            top: `${cardPosition.y}px`,
            width: '450px',
            background: 'linear-gradient(45deg, #ff7f50, #ffa500, #ffd700, #ffff00)',
            boxShadow:
              '0 0 10px rgba(255, 165, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.2), 0 0 30px rgba(255, 255, 0, 0.1)'
          }}
        >
          <div
            className="bg-gray-900 rounded-3xl p-6 w-full h-full"
            style={{ backgroundColor: '#2a2a2a' }}
          >
            <h1 className="text-3xl font-bold text-center mb-6 text-white">
              Poop Washing Service Booking Form
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-lg font-semibold mb-3 text-white">
                  Full Name
                </label>
                <input
                  type="text"
                  value={question3}
                  onFocus={() => handleInputFocus('question3')}
                  onBlur={handleInputBlur}
                  className="w-full p-3 text-base border-2 border-gray-300 rounded-lg focus:border-gray-300 focus:outline-none bg-white text-gray-900"
                  placeholder="Type Your Name"
                  readOnly
                />
              </div>
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
                  boxShadow:
                    '0 0 8px rgba(255, 165, 0, 0.3), 0 0 15px rgba(255, 215, 0, 0.2), 0 0 25px rgba(255, 255, 0, 0.1)'
                }}
              >
                <button
                  type="submit"
                  disabled={!question1.trim() || !question2.trim()}
                  className="w-full disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 ease-out text-white text-base font-semibold py-2 px-4 rounded-2xl transform active:scale-95"
                  style={{
                    backgroundColor: '#1a1a1a'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseDown={e => {
                    e.currentTarget.style.transform = 'scale(0.95)';
                  }}
                  onMouseUp={e => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                >
                  <ShinyText text="Submit" disabled={false} speed={2} className="text-white" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
