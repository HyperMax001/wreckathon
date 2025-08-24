'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FormPage() {
  const router = useRouter();
  const [question1, setQuestion1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [keyMapping, setKeyMapping] = useState<{[key: string]: string}>({});
  const [activeInput, setActiveInput] = useState<string>('');

  // Original keys that will be scrambled
  const originalKeys = [
    'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
    'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
    'z', 'x', 'c', 'v', 'b', 'n', 'm',
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    ' '
  ];

  // Shuffle the keys randomly
  const shuffleKeys = () => {
    const shuffled = [...originalKeys];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const mapping: {[key: string]: string} = {};
    originalKeys.forEach((key, index) => {
      mapping[key] = shuffled[index];
    });
    
    setKeyMapping(mapping);
  };

  // Shuffle keys on component mount and every 3 seconds
  useEffect(() => {
    shuffleKeys();
    const interval = setInterval(shuffleKeys, 3000);
    return () => clearInterval(interval);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question1.trim() && question2.trim()) {
      router.push('/slideshow');
    }
  };

  // const renderKeyboard = () => {
  //   const rows = [
  //     ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  //     ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  //     ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  //     ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  //     [' ']
  //   ];

  //   return (
  //     <div className="mt-8 p-4 bg-gray-100 rounded-lg">
  //       <h3 className="text-lg font-semibold mb-4 text-center">Jumbled Keyboard</h3>
  //       <p className="text-sm text-gray-600 mb-4 text-center">
  //         Keys change every 3 seconds! Click on an input field above and start typing.
  //       </p>
  //       {rows.map((row, rowIndex) => (
  //         <div key={rowIndex} className="flex justify-center mb-2 gap-1">
  //           {row.map((key) => (
  //             <div
  //               key={key}
  //               className="bg-white border-2 border-gray-300 rounded px-3 py-2 text-center min-w-[40px] font-mono text-sm"
  //             >
  //               <div className="text-gray-400 text-xs">{key === ' ' ? 'SPACE' : key.toUpperCase()}</div>
  //               <div className="font-bold">
  //                 {key === ' ' ? 'SPACE' : (keyMapping[key] || key).toUpperCase()}
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Most Important Day of Your Life
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xl font-semibold mb-4 text-gray-700">
              How often do you poop?
            </label>
            <input
              type="text"
              value={question1}
              onFocus={() => setActiveInput('question1')}
              onBlur={() => setActiveInput('')}
              className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-gray-900"
              placeholder="Type Sincerely! Answer in a sentence"
              readOnly
            />
          </div>

          <div>
            <label className="block text-xl font-semibold mb-4 text-gray-700">
              Out of 10, how hard would you score your motion?
            </label>
            <input
              type="text"
              value={question2}
              onFocus={() => setActiveInput('question2')}
              onBlur={() => setActiveInput('')}
              className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-gray-900"
              placeholder="Type Sincerely"
              readOnly
            />
          </div>

          <button
            type="submit"
            disabled={!question1.trim() || !question2.trim()}
            className="w-full bg-blue-600 text-white text-xl font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}