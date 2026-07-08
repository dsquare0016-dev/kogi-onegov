import React, { useEffect, useState } from 'react';

export function GduKogiLoader({ size = "md", text }: { size?: "sm" | "md" | "lg"; text?: string }) {
  const [mainLogo, setMainLogo] = useState("/kogi-logo.png");
  const [gduLogo, setGduLogo] = useState("/gdu-logo.png");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMainLogo(localStorage.getItem("gdu_main_logo") || "/kogi-logo.png");
      setGduLogo(localStorage.getItem("gdu_gdu_logo") || "/gdu-logo.png");
    }
  }, []);

  // Determine sizes and orbit variables based on the size prop
  let logoSize = "size-14";
  let orbitRadius = "26px";
  let orbitRadiusY = "10px";
  let containerSize = "w-[108px] h-[76px]";

  if (size === "sm") {
    logoSize = "size-10";
    orbitRadius = "18px";
    orbitRadiusY = "6px";
    containerSize = "w-[76px] h-[52px]";
  } else if (size === "lg") {
    logoSize = "size-20";
    orbitRadius = "38px";
    orbitRadiusY = "15px";
    containerSize = "w-[156px] h-[110px]";
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4 select-none">
      <div 
        className={`relative ${containerSize} flex items-center justify-center`}
        style={{
          '--orbit-radius': orbitRadius,
          '--orbit-radius-y': orbitRadiusY,
        } as React.CSSProperties}
      >
        {/* Kogi Logo */}
        <div className={`absolute ${logoSize} rounded-full bg-white shadow-lg p-1.5 border border-[#C5A059]/40 flex items-center justify-center animate-flip-1`}>
          <img 
            src={mainLogo} 
            alt="Kogi Seal" 
            className="w-full h-full object-contain rounded-full" 
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* GDU Logo */}
        <div className={`absolute ${logoSize} rounded-full bg-white shadow-lg p-1.5 border border-[#C5A059]/40 flex items-center justify-center animate-flip-2`}>
          <img 
            src={gduLogo} 
            alt="GDU Logo" 
            className="w-full h-full object-contain rounded-full" 
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      </div>
      
      {text && (
        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#C5A059] animate-pulse text-center">
          {text}
        </p>
      )}
    </div>
  );
}
