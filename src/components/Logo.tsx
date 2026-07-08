import { useEffect, useState } from "react";

export function Logo({ size = 36, withText = false, textClass = "" }: { size?: number; withText?: boolean; textClass?: string }) {
  const [siteName, setSiteName] = useState("Kogi OneGov");
  const [govName, setGovName] = useState("Kogi State Government");
  const [mainLogo, setMainLogo] = useState("/kogi-logo.png");
  const [gduLogo, setGduLogo] = useState("/gdu-logo.png");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const getStored = () => {
        setSiteName(localStorage.getItem("gdu_site_name") || "Kogi OneGov");
        setGovName(localStorage.getItem("gdu_gov_name") || "Kogi State Government");
        setMainLogo(localStorage.getItem("gdu_main_logo") || "/kogi-logo.png");
        setGduLogo(localStorage.getItem("gdu_gdu_logo") || "/gdu-logo.png");
      };
      getStored();
      window.addEventListener("siteConfigUpdate", getStored);
      return () => window.removeEventListener("siteConfigUpdate", getStored);
    }
  }, []);

  const parts = siteName.split(" ");
  const firstWord = parts[0] || "Kogi";
  const restOfWords = parts.slice(1).join(" ") || "OneGov";

  return (
    <div className="flex items-center gap-4">
      {/* Overlapping Logos */}
      <div className="relative flex items-center" style={{ width: size * 1.6, height: size }}>
        {/* Kogi Logo */}
        <img
          src={mainLogo}
          alt={siteName}
          className="absolute left-0 top-0 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20 object-contain bg-white"
          style={{ width: size, height: size }}
        />
        {/* GDU Logo */}
        <img
          src={gduLogo}
          alt="GDU Logo"
          className="absolute top-0 rounded-full shadow-xl z-10 object-contain bg-white"
          style={{ width: size, height: size, left: size * 0.65 }}
        />
      </div>
      
      {/* Title Text */}
      {withText && (
        <div className={textClass || "text-white"}>
          <div className="font-display text-[20px] font-black leading-tight tracking-tight flex items-center gap-1.5 whitespace-nowrap">
            {firstWord} <span className="text-[#CBA344]">{restOfWords}</span>
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] font-black opacity-80 mt-0.5 whitespace-nowrap">
            {govName}
          </div>
        </div>
      )}
    </div>
  );
}