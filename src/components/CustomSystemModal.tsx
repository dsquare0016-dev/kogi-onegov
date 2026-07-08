import { useCustomModalStore } from "@/lib/customModal";
import { AlertCircle, HelpCircle, FileText, X } from "lucide-react";
import { useEffect, useRef } from "react";

export function CustomSystemModal() {
  const { isOpen, type, message, value, setValue, close } = useCustomModalStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && type === 'prompt') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      close(type === 'prompt' ? value : true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close(type === 'prompt' ? null : false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'confirm':
        return <HelpCircle className="size-6 text-primary shrink-0" />;
      case 'prompt':
        return <FileText className="size-6 text-primary shrink-0" />;
      case 'alert':
      default:
        return <AlertCircle className="size-6 text-[#C5A059] shrink-0" />;
    }
  };

  if (type === 'alert') {
    return (
      <div 
        className="fixed top-[84px] right-6 z-[10000] w-full max-w-[420px] rounded-r-xl rounded-l-md bg-card border border-border border-l-4 border-l-red-500 shadow-2xl p-5 pr-10 relative flex flex-col gap-3 text-foreground animate-in slide-in-from-top-4 fade-in duration-300"
        onKeyDown={handleKeyDown}
      >
        {/* Close icon */}
        <button 
          onClick={() => close(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5">
          <AlertCircle className="size-5 text-red-500 shrink-0" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#0A1142] dark:text-blue-100">
            NOTIFICATION ALERT
          </h3>
        </div>

        {/* Message */}
        <div className="text-xs leading-relaxed text-foreground/90 font-medium whitespace-pre-wrap">
          {message}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 relative flex flex-col gap-4 text-foreground animate-in zoom-in-95 duration-200">
        
        {/* Close icon */}
        <button 
          onClick={() => close(type === 'prompt' ? null : false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-6">
          {getIcon()}
          <h3 className="text-sm font-black uppercase tracking-wider text-primary">
            {type === 'alert' ? 'Notification Alert' : type === 'confirm' ? 'Confirmation Required' : 'Input Requested'}
          </h3>
        </div>

        {/* Message */}
        <div className="text-xs leading-relaxed text-foreground font-medium py-1 whitespace-pre-wrap">
          {message}
        </div>

        {/* Prompt Input */}
        {type === 'prompt' && (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2.5 bg-background border border-border rounded-lg text-xs text-foreground outline-none focus:border-primary/50 font-semibold"
            placeholder="Enter input here..."
          />
        )}

        {/* Actions Footer */}
        <div className="flex gap-2 justify-end pt-2 border-t border-border/40 mt-1">
          {type !== 'alert' && (
            <button
              onClick={() => close(type === 'prompt' ? null : false)}
              className="px-4 py-2 border border-border hover:bg-muted text-foreground text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => close(type === 'prompt' ? value : true)}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-black uppercase tracking-wider rounded-lg shadow transition-colors cursor-pointer"
          >
            {type === 'alert' ? 'Acknowledge' : 'Confirm'}
          </button>
        </div>

      </div>
    </div>
  );
}
