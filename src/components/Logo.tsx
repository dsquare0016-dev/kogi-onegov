import logoAsset from "@/assets/kogi-logo.png.asset.json";

export function Logo({ size = 36, withText = false, textClass = "" }: { size?: number; withText?: boolean; textClass?: string }) {
  return (
    <div className="flex items-center gap-4">
      {/* Overlapping Logos */}
      <div className="relative flex items-center" style={{ width: size * 1.6, height: size }}>
        {/* Kogi Logo */}
        <img
          src="/kogi-logo.png"
          alt="Kogi State"
          className="absolute left-0 top-0 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20 object-contain bg-white"
          style={{ width: size, height: size }}
        />
        {/* GDU Logo */}
        <img
          src="/gdu-logo.png"
          alt="GDU"
          className="absolute top-0 rounded-full shadow-xl z-10 object-contain bg-white"
          style={{ width: size, height: size, left: size * 0.65 }}
        />
      </div>
      
      {/* Title Text */}
      {withText && (
        <div className={textClass || "text-white"}>
          <div className="font-display text-[20px] font-black leading-tight tracking-tight flex items-center gap-1.5 whitespace-nowrap">
            Kogi <span className="text-[#CBA344]">OneGov</span>
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] font-black opacity-80 mt-0.5 whitespace-nowrap">
            Kogi State Government
          </div>
        </div>
      )}
    </div>
  );
}