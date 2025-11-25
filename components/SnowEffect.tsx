import React, { useEffect, useState } from 'react';

export const SnowEffect: React.FC = () => {
  // We create a fixed number of snowflakes
  const [flakes, setFlakes] = useState<Array<{ id: number; left: number; animationDuration: number; delay: number; size: number }>>([]);

  useEffect(() => {
    const newFlakes = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // 0-100%
      animationDuration: 5 + Math.random() * 10, // 5-15s
      delay: Math.random() * 5, // 0-5s
      size: 2 + Math.random() * 4, // 2-6px
    }));
    setFlakes(newFlakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <style>
        {`
          @keyframes snowfall {
            0% {
              transform: translateY(-10vh) translateX(0);
              opacity: 1;
            }
            100% {
              transform: translateY(110vh) translateX(20px);
              opacity: 0.3;
            }
          }
        `}
      </style>
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute bg-white rounded-full opacity-80"
          style={{
            left: `${flake.left}%`,
            top: -20,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animation: `snowfall ${flake.animationDuration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
};