import { createFileRoute } from '@tanstack/react-router';
import { Network } from 'lucide-react';

export const Route = createFileRoute('/dashboard/departments/')({
  component: DepartmentsIndexComponent,
});

function DepartmentsIndexComponent() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Network className="size-6 text-primary" />
        <h1 className="text-3xl font-black">Departments Directory</h1>
      </div>
      <p className="text-muted-foreground">Full directory of all departments.</p>
    </div>
  );
}
