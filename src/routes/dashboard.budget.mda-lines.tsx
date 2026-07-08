import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Plus, Save, Edit, Trash2, FileText, AlertTriangle, Calendar, X, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import {
  dbGetBudgetLineItems,
  dbSaveBudgetLineItem,
  dbDeleteBudgetLineItem,
  dbGetBudgetYears,
} from '@/lib/postgres-service';

export const Route = createFileRoute('/dashboard/budget/mda-lines')({
  component: MdaBudgetLineMasterPage,
});

function MdaBudgetLineMasterPage() {
  const session = getSession();

  // Only desk officers and super admins can access this page
  const isDeskOfficer = session?.role === 'desk_officer' || session?.role === 'budget_officer';
  const isSuperAdmin = session?.role === 'super_admin';

  if (!isDeskOfficer && !isSuperAdmin) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="size-16 text-amber-500 mb-4 opacity-70" />
        <h1 className="text-2xl font-black text-foreground">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Only registered Desk Officers are permitted to manage their MDA budget line items from this portal.
        </p>
      </div>
    );
  }

  const orgId = session?.organizationId || '';
  const mdaName = session?.mda || session?.department || 'Your MDA';

  const [lines, setLines] = useState<any[]>([]);
  const [budgetYears, setBudgetYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form fields
  const [blYearId, setBlYearId] = useState('');
  const [blCode, setBlCode] = useState('');
  const [blName, setBlName] = useState('');
  const [blApproved, setBlApproved] = useState('0');
  const [blDesc, setBlDesc] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [linesRes, yearsRes] = await Promise.all([
        dbGetBudgetLineItems({ data: { organizationId: orgId } }),
        dbGetBudgetYears(),
      ]);
      setLines(Array.isArray(linesRes) ? linesRes : []);
      setBudgetYears(Array.isArray(yearsRes) ? yearsRes : []);
      // Pre-select the active budget year
      const activeYear = (Array.isArray(yearsRes) ? yearsRes : []).find((y: any) => y.is_active);
      if (activeYear && !blYearId) setBlYearId(activeYear.id);
    } catch (e) {
      console.error('Failed to load budget lines:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (orgId) loadData();
    else setLoading(false);
  }, [orgId]);

  const resetForm = () => {
    setEditingItem(null);
    setBlCode('');
    setBlName('');
    setBlApproved('0');
    setBlDesc('');
    const activeYear = budgetYears.find((y: any) => y.is_active);
    if (activeYear) setBlYearId(activeYear.id);
    setShowForm(false);
  };

  const handleEditClick = (line: any) => {
    setEditingItem(line);
    setBlYearId(line.budget_year_id || '');
    setBlCode(line.budget_code || '');
    setBlName(line.line_item_name || '');
    setBlApproved(String(line.approved_amount || 0));
    setBlDesc(line.description || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!blName.trim()) { alert('Line Item Name is required.'); return; }
    if (!blCode.trim()) { alert('Budget Code is required.'); return; }
    if (!blYearId) { alert('Please select a Budget Year.'); return; }
    if (!orgId) { alert('Your account is not linked to an MDA. Please contact the System Administrator.'); return; }

    setSaving(true);
    try {
      await dbSaveBudgetLineItem({
        data: {
          id: editingItem?.id || null,
          organization_id: orgId,
          budget_year_id: blYearId,
          budget_code: blCode.trim(),
          line_item_name: blName.trim(),
          description: blDesc.trim() || null,
          approved_amount: parseFloat(blApproved) || 0,
          utilized_amount: editingItem?.utilized_amount || 0,
          released_amount: editingItem?.released_amount || 0,
        }
      });
      alert(editingItem ? 'Budget line item updated successfully.' : 'Budget line item saved successfully.');
      resetForm();
      await loadData();
    } catch (e: any) {
      alert('Failed to save budget line: ' + e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the budget line "${name}"? This action cannot be undone.`)) return;
    try {
      await dbDeleteBudgetLineItem({ data: { id } });
      alert('Budget line deleted.');
      await loadData();
    } catch (e: any) {
      alert('Failed to delete: ' + e.message);
    }
  };

  const totalApproved = lines.reduce((s, l) => s + (Number(l.approved_amount) || 0), 0);
  const totalUtilized = lines.reduce((s, l) => s + (Number(l.utilized_amount) || 0), 0);
  const totalBalance = totalApproved - totalUtilized;

  if (!orgId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="size-14 text-amber-500 mb-4 opacity-70" />
        <h1 className="text-xl font-black text-foreground">MDA Not Linked</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-sm">
          Your account is not linked to an MDA/Organization. Please contact your System Administrator to link your profile to the correct MDA.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-bold mb-2">
            <Wallet className="size-3" /> DESK OFFICER PORTAL
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Budget Line Master</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Managing budget lines for: <span className="font-bold text-foreground">{mdaName}</span>
          </p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            ⚠ You can only view and manage budget lines for your assigned MDA. Other MDAs' data is not visible here.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm cursor-pointer transition-colors shadow-sm"
        >
          <Plus className="size-4" /> Add Budget Line
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Approved', value: `₦${(totalApproved / 1_000_000).toFixed(2)}M`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
          { label: 'Total Utilized', value: `₦${(totalUtilized / 1_000_000).toFixed(2)}M`, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/5 border-amber-500/20' },
          { label: 'Available Balance', value: `₦${(totalBalance / 1_000_000).toFixed(2)}M`, color: totalBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400', bg: 'bg-blue-500/5 border-blue-500/20' },
        ].map((card) => (
          <div key={card.label} className={`border ${card.bg} rounded-xl p-4`}>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.label}</div>
            <div className={`text-2xl font-black mt-1 ${card.color}`}>{card.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{lines.length} line item{lines.length !== 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
          <CardHeader className="border-b border-amber-500/20 bg-amber-500/5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Wallet className="size-4" />
                {editingItem ? 'Edit Budget Line Item' : 'Add New Budget Line Item'}
              </CardTitle>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="size-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* MDA Display - Read only */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Supervising MDA / Office</label>
                <div className="w-full p-2.5 bg-muted/50 border border-border rounded-md text-sm text-foreground font-bold">
                  {mdaName}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">(Your assigned MDA – auto-linked)</span>
                </div>
              </div>

              {/* Budget Year */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Budget Year <span className="text-red-500">*</span></label>
                <select
                  value={blYearId}
                  onChange={(e) => setBlYearId(e.target.value)}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">-- Select Year --</option>
                  {budgetYears.map((by: any) => (
                    <option key={by.id} value={by.id}>
                      {by.year} {by.is_active ? '✓ (Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Code */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Budget Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={blCode}
                  onChange={(e) => setBlCode(e.target.value)}
                  placeholder="e.g. MOE-2026-CAP-01"
                  className="w-full p-2.5 bg-background border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Line Item Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Line Item Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={blName}
                  onChange={(e) => setBlName(e.target.value)}
                  placeholder="e.g. Primary School Infrastructure Upgrades"
                  className="w-full p-2.5 bg-background border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Approved Amount */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Approved Amount (₦)</label>
                <input
                  type="number"
                  min="0"
                  value={blApproved}
                  onChange={(e) => setBlApproved(e.target.value)}
                  className="w-full p-2.5 bg-background border border-border rounded-md text-sm text-foreground font-bold focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                <textarea
                  value={blDesc}
                  onChange={(e) => setBlDesc(e.target.value)}
                  rows={2}
                  placeholder="Optional description or notes"
                  className="w-full p-2.5 bg-background border border-border rounded-md text-sm text-foreground resize-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-amber-500/10">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-border hover:bg-muted text-sm font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                {saving ? <span className="animate-spin">⟳</span> : <Save className="size-4" />}
                {saving ? 'Saving...' : editingItem ? 'Update Line Item' : 'Save Line Item'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Lines List */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/10 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="size-4 text-amber-500" />
            Budget Line Items — {mdaName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <div className="animate-spin text-2xl mb-2">⟳</div>
              Loading budget lines...
            </div>
          ) : lines.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Wallet className="size-12 text-muted-foreground/30 mx-auto" />
              <p className="text-sm font-semibold text-muted-foreground">No Budget Lines Registered</p>
              <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
                Start by adding budget line items for your MDA using the "Add Budget Line" button above.
              </p>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="mx-auto mt-2 flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-xs font-bold rounded-lg cursor-pointer transition-colors border border-amber-500/30"
              >
                <Plus className="size-3.5" /> Add First Budget Line
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 bg-muted/30 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                <div>Line Item</div>
                <div className="text-right">Approved</div>
                <div className="text-right">Utilized</div>
                <div className="text-right">Balance</div>
                <div className="text-center">Actions</div>
              </div>

              {lines.map((line: any) => {
                const approved = Number(line.approved_amount) || 0;
                const utilized = Number(line.utilized_amount) || 0;
                const balance = approved - utilized;
                const pct = approved > 0 ? Math.min((utilized / approved) * 100, 100) : 0;

                return (
                  <div key={line.id} className="px-4 py-3 hover:bg-muted/10 transition-colors">
                    <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:gap-4 sm:items-center gap-2">
                      {/* Name & Code */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded border border-amber-500/20">
                            {line.budget_code}
                          </span>
                          <span className="text-sm font-semibold text-foreground">{line.line_item_name}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" /> {line.budget_year}
                          </span>
                          {line.description && (
                            <span className="truncate max-w-[200px]">{line.description}</span>
                          )}
                        </div>
                        {/* Progress bar */}
                        <div className="mt-1.5 w-full bg-border/50 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full transition-all ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{pct.toFixed(1)}% utilized</div>
                      </div>

                      {/* Approved */}
                      <div className="sm:text-right">
                        <div className="text-xs text-muted-foreground sm:hidden inline">Approved: </div>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          ₦{(approved / 1_000_000).toFixed(2)}M
                        </span>
                      </div>

                      {/* Utilized */}
                      <div className="sm:text-right">
                        <div className="text-xs text-muted-foreground sm:hidden inline">Utilized: </div>
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                          ₦{(utilized / 1_000_000).toFixed(2)}M
                        </span>
                      </div>

                      {/* Balance */}
                      <div className="sm:text-right">
                        <div className="text-xs text-muted-foreground sm:hidden inline">Balance: </div>
                        <span className={`text-sm font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                          ₦{(balance / 1_000_000).toFixed(2)}M
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 sm:justify-center">
                        <button
                          onClick={() => handleEditClick(line)}
                          title="Edit"
                          className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          <Edit className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(line.id, line.line_item_name)}
                          title="Delete"
                          className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Totals Footer */}
              <div className="px-4 py-3 bg-muted/20 border-t border-border/50">
                <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 text-xs font-bold">
                  <div className="text-muted-foreground uppercase tracking-wide">Totals ({lines.length} items)</div>
                  <div className="text-right text-emerald-600">₦{(totalApproved / 1_000_000).toFixed(2)}M</div>
                  <div className="text-right text-amber-600">₦{(totalUtilized / 1_000_000).toFixed(2)}M</div>
                  <div className={`text-right ${totalBalance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>₦{(totalBalance / 1_000_000).toFixed(2)}M</div>
                  <div />
                </div>
                <div className="sm:hidden text-xs text-muted-foreground font-semibold">
                  {lines.length} items · Total Approved: ₦{(totalApproved / 1_000_000).toFixed(2)}M · Balance: ₦{(totalBalance / 1_000_000).toFixed(2)}M
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
