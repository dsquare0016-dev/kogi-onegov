import { useAlertStore, alertStore } from "@/lib/alert-store";
import { AlertTriangle, Info, ShieldAlert, X } from "lucide-react";

export function GlobalAlertModal() {
  const { activeAlerts } = useAlertStore();

  if (activeAlerts.length === 0) return null;

  // We show the most recent active alert
  const alert = activeAlerts[0];

  const getSeverityStyles = () => {
    if (alert.colorOverride) {
      return {
        bg: alert.colorOverride,
        border: alert.colorOverride,
        text: 'text-white',
        icon: <Info className="size-6 text-white" />
      };
    }

    switch (alert.severity) {
      case 'Critical':
        return {
          bg: 'bg-red-600 dark:bg-red-900',
          border: 'border-red-500',
          text: 'text-white',
          icon: <ShieldAlert className="size-6 text-white animate-pulse" />
        };
      case 'High':
        return {
          bg: 'bg-orange-500 dark:bg-orange-800',
          border: 'border-orange-400',
          text: 'text-white',
          icon: <AlertTriangle className="size-6 text-white" />
        };
      case 'Medium':
        return {
          bg: 'bg-amber-400 dark:bg-amber-600',
          border: 'border-amber-500',
          text: 'text-black dark:text-white',
          icon: <AlertTriangle className="size-6" />
        };
      case 'Info':
      default:
        return {
          bg: 'bg-blue-500 dark:bg-blue-800',
          border: 'border-blue-400',
          text: 'text-white',
          icon: <Info className="size-6 text-white" />
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div 
        className={`w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border-2 animate-in zoom-in-95 duration-300 ${styles.border}`}
        style={alert.colorOverride ? { backgroundColor: alert.colorOverride, borderColor: alert.colorOverride } : {}}
      >
        {!alert.colorOverride && (
          <div className={`${styles.bg} p-4 flex items-center gap-3`}>
            {styles.icon}
            <h2 className={`text-xl font-bold ${styles.text}`}>
              {alert.title}
            </h2>
          </div>
        )}
        {alert.colorOverride && (
          <div className="p-4 flex items-center gap-3 bg-black/10">
            {styles.icon}
            <h2 className={`text-xl font-bold ${styles.text}`}>
              {alert.title}
            </h2>
          </div>
        )}
        <div className={`p-6 ${alert.colorOverride ? styles.text : 'bg-background text-foreground'}`}>
          <p className="text-lg leading-relaxed">{alert.message}</p>
          
          <div className="mt-8 flex items-center justify-between">
            <span className={`text-xs opacity-70 ${alert.colorOverride ? styles.text : 'text-muted-foreground'}`}>
              Sent to: {alert.targetUser}
            </span>
            <button 
              onClick={() => alertStore.dismissAlert(alert.id)}
              className={`px-6 py-2 font-bold rounded-lg transition-transform hover:scale-105 ${
                alert.colorOverride 
                  ? 'bg-black/20 text-white hover:bg-black/30' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
