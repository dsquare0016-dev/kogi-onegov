import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

export function AccessDenied({ 
  message = "Sorry, you can only access records assigned to your MDA.",
  onBack 
}: { 
  message?: string;
  onBack?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="size-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <ShieldAlert className="size-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-black text-foreground mb-2">Access Denied</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        {message}
      </p>
      {onBack && (
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft className="size-4" /> Go Back
        </Button>
      )}
    </div>
  );
}
