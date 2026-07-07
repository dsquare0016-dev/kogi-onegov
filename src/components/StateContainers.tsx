import { Loader2, AlertCircle, Ban, Lock, Settings } from 'lucide-react';
import { Button } from './ui/button';

export function LoadingState({ message = 'Loading records...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-in fade-in duration-500">
      <Loader2 className="size-8 animate-spin mb-4 text-primary" />
      <p className="font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({ message = 'No records found.', action }: { message?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-xl border border-dashed border-border/50">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Ban className="size-6 text-muted-foreground" />
      </div>
      <h3 className="font-bold text-lg mb-1">Empty</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{message}</p>
      {action}
    </div>
  );
}

export function PermissionDeniedState({ message = 'You do not have permission to access this section.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
      <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <Lock className="size-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-black tracking-tight mb-2">Access Denied</h1>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function FeatureDisabledState({ message = 'This feature has been disabled by the system administrator.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
      <div className="size-16 rounded-full bg-slate-500/10 flex items-center justify-center mb-6">
        <Settings className="size-8 text-slate-500" />
      </div>
      <h1 className="text-2xl font-black tracking-tight mb-2">Feature Disabled</h1>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function MaintenanceState({ message = 'Page under maintenance. Please check back later.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
      <div className="size-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
        <AlertCircle className="size-8 text-amber-500" />
      </div>
      <h1 className="text-2xl font-black tracking-tight mb-2">Under Maintenance</h1>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
