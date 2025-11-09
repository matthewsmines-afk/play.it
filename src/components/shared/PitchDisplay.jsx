import React from 'react';

export default function PitchDisplay({ children }) {
  return (
    <div 
      className="relative bg-green-700 rounded-lg overflow-hidden aspect-[7/10] shadow-inner"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2314532d' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
      }}
    >
      {/* Pitch Markings */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-white/30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] h-[14%] rounded-full border-2 border-white/30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/30"></div>
      
      {/* Top Goal Area (Increased Size) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[20%] border-2 border-b-white/30 border-x-white/30 border-t-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[8%] border-2 border-b-white/30 border-x-white/30 border-t-transparent"></div>
      
      {/* Bottom Goal Area (Increased Size) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[20%] border-2 border-t-white/30 border-x-white/30 border-b-transparent"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[8%] border-2 border-t-white/30 border-x-white/30 border-b-transparent"></div>
      
      {/* Render children (player tokens, etc.) on top */}
      {children}
    </div>
  );
}