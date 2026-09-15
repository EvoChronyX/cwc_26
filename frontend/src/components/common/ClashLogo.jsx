import React from 'react';

export default function ClashLogo({ className = "h-8 w-auto", dark = false }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 120 40" 
      className={className}
      fill="none"
    >
      <rect width="36" height="36" y="2" rx="8" fill="#050505" />
      <path d="M12 20L18 14L24 20L18 26Z" fill="#CCFF00" />
      <circle cx="18" cy="20" r="2.5" fill="#050505" />
      <text 
        x="44" 
        y="26" 
        fontFamily="'Space Grotesk', system-ui, -apple-system, sans-serif" 
        fontWeight="900" 
        fontSize="20" 
        fill={dark ? "#ffffff" : "#050505"} 
        letterSpacing="-0.05em"
      >
        CLASH<tspan fill="#4B00E0">.</tspan>
      </text>
    </svg>
  );
}
