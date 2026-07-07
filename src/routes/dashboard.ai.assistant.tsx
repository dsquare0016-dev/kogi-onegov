import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/ai/assistant')({
  beforeLoad: () => {
    // Dispatch event to open the dedicated AI Intelligence Panel
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('openAIPanel', {
        detail: {
          contextTitle: "AI Intelligence Briefs",
          module: "Global Dashboard",
          permissionScope: "Executive View"
        }
      }));
    }, 100);
    throw redirect({ to: '/dashboard' });
  },
  component: () => null,
});
