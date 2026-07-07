import { useState, ReactNode } from "react";
import { useSettingsStore } from "@/lib/settingsStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { getSession } from "@/lib/auth";

interface AlignmentApprovalGuardProps {
  isAligned: boolean;
  onApprove: (justification?: string) => void;
  children: ReactNode;
}

export function AlignmentApprovalGuard({ isAligned, onApprove, children }: AlignmentApprovalGuardProps) {
  const { governanceAlignmentLevel } = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [justification, setJustification] = useState("");
  const session = getSession();

  const handleTrigger = () => {
    if (isAligned) {
      onApprove();
      return;
    }

    if (governanceAlignmentLevel === 1) {
      onApprove();
      return;
    }

    if (governanceAlignmentLevel === 2) {
      setOpen(true);
      return;
    }

    if (governanceAlignmentLevel === 3) {
      const allowedOverrides = ['governor', 'dg_gdu'];
      if (allowedOverrides.includes(session?.role || '')) {
        setOpen(true);
      } else {
        alert("Action Denied (Level 3 Strict Governance). This record is not aligned with the State Development Plan. Only the Governor or DG GDU can override this restriction.");
      }
      return;
    }
  };

  const handleConfirm = () => {
    if (governanceAlignmentLevel >= 2 && !justification.trim()) {
      alert("A justification is required to override development plan alignment.");
      return;
    }
    onApprove(justification);
    setOpen(false);
    setJustification("");
  };

  return (
    <>
      <div onClickCapture={(e) => {
        if (!isAligned && governanceAlignmentLevel >= 2) {
          e.stopPropagation();
          e.preventDefault();
          handleTrigger();
        } else {
          // Normal behavior, let the child button handle the click if it's aligned or level 1
        }
      }}>
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="size-5" /> Development Plan Alignment Override
            </DialogTitle>
            <DialogDescription className="pt-2">
              This record is <strong>NOT ALIGNED</strong> with any Pillar or Strategic Objective in the 32-Year State Development Plan.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex items-start gap-3 text-amber-700 dark:text-amber-500 text-sm">
            <AlertTriangle className="size-5 shrink-0 mt-0.5" />
            <p>
              Proceeding with this approval will trigger a governance exception log. 
              {governanceAlignmentLevel === 3 ? " As an authorized Executive, you may override this strict restriction." : " You must provide a valid justification below."}
            </p>
          </div>

          <div className="space-y-2 py-4">
            <label className="text-sm font-medium">Override Justification (Required)</label>
            <textarea
              className="w-full p-3 bg-muted/50 border border-border rounded-md text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Explain why this unaligned record should be approved..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={!justification.trim()}>Confirm Approval Override</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
