import React from 'react';

const FlashLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="relative">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <rect
            x="20"
            y="35"
            width="80"
            height="60"
            rx="8"
            stroke="url(#gradient1)"
            strokeWidth="3"
            fill="white"
          />

          <circle
            cx="60"
            cy="65"
            r="20"
            stroke="url(#gradient1)"
            strokeWidth="3"
            fill="none"
          />

          <circle
            cx="60"
            cy="65"
            r="12"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />

          <rect
            x="75"
            y="42"
            width="12"
            height="8"
            rx="2"
            fill="url(#gradient1)"
          />

          <rect
            x="40"
            y="25"
            width="40"
            height="12"
            rx="4"
            fill="url(#gradient2)"
          />

          <defs>
            <linearGradient id="gradient1" x1="20" y1="35" x2="100" y2="95">
              <stop offset="0%" stopColor="#E91E63" />
              <stop offset="100%" stopColor="#1ABC9C" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0" y1="0" x2="120" y2="120">
              <stop offset="0%" stopColor="#1ABC9C" />
              <stop offset="100%" stopColor="#E91E63" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow-lg animate-flashPulse"
             style={{
               boxShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(233, 30, 99, 0.4)'
             }}
        />
      </div>
    </div>
  );
};

export default FlashLoader;
