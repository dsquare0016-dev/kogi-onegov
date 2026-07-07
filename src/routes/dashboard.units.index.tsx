import { createFileRoute } from '@tanstack/react-router';
import { Layers } from 'lucide-react';

export const Route = createFileRoute('/dashboard/units/')({
  component: UnitsIndexComponent,
});

function UnitsIndexComponent() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="size-6 text-primary" />
        <h1 className="text-3xl font-black">Units Directory</h1>
      </div>
      <p className="text-muted-foreground">Full directory of all units.</p>
    </div>
  );
}
